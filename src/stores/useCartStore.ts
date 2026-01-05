"use client";

import { useMemo, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { couponService } from "@/services";
import { orderService } from "@/services/order.service";
import { checkCouponEligibility } from "@/utils/checkCouponEligibility";
import { CartActions, CartLine, CartState } from "@/types/cart";
import { Coupon } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";

// --- CONSTANTS & TYPES ---
const DEFAULT_SHIPPING_FEE = 0;
const CART_STORAGE_KEY = "foody_cart_v16";
const DATA_TTL_MS = 60_000;

export type DeliveryOption = "immediate" | "scheduled";

export interface CouponStatus extends Coupon {
  isEligible: boolean;
  reason?: string | null;
}

// Hàm tạo key unique cho cart item
const buildVariantKey = (
  itemData: Omit<CartLine, "cartId" | "quantity">
): string => {
  const baseId = itemData.item.id;
  const appliedPrice = Math.round(itemData.totalPrice);

  const promotionTag =
    itemData.item.promotion && itemData.item.promotion !== ""
      ? typeof itemData.item.promotion === "object"
        ? (itemData.item.promotion as any).id || "promo"
        : itemData.item.promotion
      : "normal";

  if (itemData.itemType === "Product") {
    const options = itemData.options || {};
    const optionKeys = Object.keys(options).sort();
    const optionSig = optionKeys
      .map((key) => {
        const selectedNames = (options[key] || [])
          .map((opt) => opt.name)
          .sort()
          .join(",");
        return `${key}:${selectedNames}`;
      })
      .join("|");
    return `${baseId}:${promotionTag}:${appliedPrice}::${optionSig}`;
  }

  if (itemData.itemType === "Combo") {
    const selections = itemData.comboSelections || [];
    const selectionSig = selections
      .map((sel) => {
        const subOptions = sel.options || {};
        const subOptionKeys = Object.keys(subOptions).sort();
        const subOptionSig = subOptionKeys
          .map((key) => {
            const names = (subOptions[key] || [])
              .map((opt) => opt.name)
              .sort()
              .join(",");
            return `${key}:${names}`;
          })
          .join("|");
        return `${sel.slotName}:${sel.product.id}[${subOptionSig}]`;
      })
      .sort()
      .join("|");
    return `${baseId}:${promotionTag}:${appliedPrice}::${selectionSig}`;
  }

  return `${baseId}:${promotionTag}:${appliedPrice}::`;
};

// --- HELPER: TẠO DATA SẢN PHẨM THƯỜNG ---
const createNormalItemData = (sourceItem: any) => {
  const normalItemData = { ...sourceItem };
  delete normalItemData.cartId;
  delete normalItemData.quantity;

  normalItemData.item = {
    ...normalItemData.item,
    promotion: "",
  };

  if (normalItemData.itemType === "Combo" && normalItemData.comboSnapshot) {
    normalItemData.totalPrice = normalItemData.comboSnapshot.totalMarketPrice;
  } else if (normalItemData.itemType === "Product") {
    let price = normalItemData.item.basePrice;
    if (normalItemData.options) {
      Object.values(normalItemData.options)
        .flat()
        .forEach((opt: any) => {
          price += opt.priceModifier;
        });
    }
    normalItemData.totalPrice = price;
  }

  return normalItemData;
};

// --- HELPER MỚI: Tính giá gốc (Market Price) của 1 item ---
const getLineItemMarketPrice = (line: CartLine) => {
  // 1. Nếu là Combo: Lấy từ snapshot market price
  if (line.itemType === "Combo") {
    return line.comboSnapshot?.totalMarketPrice || line.totalPrice;
  }
  // 2. Nếu là Product: Base Price + Options
  let price = line.item.basePrice;
  if (line.options) {
    Object.values(line.options)
      .flat()
      .forEach((opt) => {
        price += opt.priceModifier;
      });
  }
  return price;
};

// --- TYPE DEFINITIONS ---
interface ExtendedStateData {
  availableCoupons: Coupon[];
  isLoadingCoupons: boolean;
  couponsFetchedAt: number;
}

interface ExtendedCartStore extends CartState, ExtendedStateData, CartActions {
  fetchAvailableCoupons: () => Promise<void>;
  toggleCoupon: (coupon: Coupon) => void;
}

// --- INITIAL STATE ---
const initialState: CartState & ExtendedStateData = {
  cartItems: [],
  showCart: false,
  publicCoupons: [],
  isLoadingPublicCoupons: false,
  publicCouponsFetchedAt: 0,
  availableCoupons: [],
  isLoadingCoupons: false,
  couponsFetchedAt: 0,
  appliedCoupons: [],
  couponStatus: { isLoading: false, error: null },
  productForOptions: null,
  comboForSelection: null,
  deliveryOption: "immediate",
  scheduledDate: "",
  scheduledTime: "",
  shippingFee: DEFAULT_SHIPPING_FEE,
  shippingDistance: 0,
  selectedAddress: null,
  isCalculatingShip: false,
  surcharges: [],
};

export const useCartStore = create<ExtendedCartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startProductConfiguration: (product) => {
        set({
          productForOptions: product,
          showCart: false,
          comboForSelection: null,
        });
      },

      startComboConfiguration: (combo) => {
        set({
          comboForSelection: combo,
          showCart: false,
          productForOptions: null,
        });
      },

      addItemToCart: (itemData) => {
        const cartId = buildVariantKey(itemData);

        set((state) => {
          const existingItem = state.cartItems.find((i) => i.cartId === cartId);
          const currentQty = existingItem ? existingItem.quantity : 0;

          const promotionAny = (itemData.item as any).promotion;
          const limitPerOrder =
            promotionAny && typeof promotionAny === "object"
              ? promotionAny.limitPerOrder
              : 0;

          if (limitPerOrder > 0 && currentQty >= limitPerOrder) {
            const normalItemData = createNormalItemData(itemData);
            const normalCartId = buildVariantKey(normalItemData);
            const normalExists = state.cartItems.find(
              (i) => i.cartId === normalCartId
            );

            if (normalExists) {
              return {
                cartItems: state.cartItems.map((i) =>
                  i.cartId === normalCartId
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                ),
                productForOptions: null,
                comboForSelection: null,
                showCart: false,
              };
            } else {
              const newNormalLine: any = {
                ...normalItemData,
                cartId: normalCartId,
                quantity: 1,
                note: itemData.note || "",
              };
              return {
                cartItems: [...state.cartItems, newNormalLine],
                productForOptions: null,
                comboForSelection: null,
                showCart: false,
              };
            }
          }

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              productForOptions: null,
              comboForSelection: null,
              showCart: false,
            };
          }

          const newLine: any = {
            ...itemData,
            cartId: cartId,
            quantity: 1,
            note: itemData.note || "",
          };
          return {
            cartItems: [...state.cartItems, newLine],
            productForOptions: null,
            comboForSelection: null,
            showCart: false,
          };
        });
      },

      updateQuantity: (cartId, amount) => {
        set((state) => {
          const itemIndex = state.cartItems.findIndex(
            (i) => i.cartId === cartId
          );
          if (itemIndex === -1) return state;

          const item = state.cartItems[itemIndex];

          if (amount < 0) {
            return {
              cartItems: state.cartItems
                .map((i) =>
                  i.cartId === cartId
                    ? { ...i, quantity: i.quantity + amount }
                    : i
                )
                .filter((i) => i.quantity > 0),
            };
          }

          const promotionAny = (item.item as any).promotion;
          const limitPerOrder =
            promotionAny && typeof promotionAny === "object"
              ? promotionAny.limitPerOrder
              : 0;

          if (limitPerOrder > 0 && item.quantity >= limitPerOrder) {
            const normalItemData = createNormalItemData(item);
            const normalCartId = buildVariantKey(normalItemData);
            const normalExistsIndex = state.cartItems.findIndex(
              (i) => i.cartId === normalCartId
            );
            const newCartItems = [...state.cartItems];

            if (normalExistsIndex > -1) {
              newCartItems[normalExistsIndex] = {
                ...newCartItems[normalExistsIndex],
                quantity: newCartItems[normalExistsIndex].quantity + amount,
              };
            } else {
              const newNormalLine: any = {
                ...normalItemData,
                cartId: normalCartId,
                quantity: amount,
                note: item.note || "",
              };
              newCartItems.splice(itemIndex + 1, 0, newNormalLine);
            }
            return { cartItems: newCartItems };
          }

          return {
            cartItems: state.cartItems.map((i) =>
              i.cartId === cartId ? { ...i, quantity: i.quantity + amount } : i
            ),
          };
        });
      },

      clearCart: () => set({ cartItems: [], appliedCoupons: [] }),

      updateItemNote: (cartId, note) => {
        set((state) => ({
          cartItems: state.cartItems.map((i) =>
            i.cartId === cartId ? { ...i, note: note.trim() } : i
          ),
        }));
      },

      removeItem: (cartId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.cartId !== cartId),
        }));
      },

      setProductForOptions: (product) => set({ productForOptions: product }),
      setComboForSelection: (combo) => set({ comboForSelection: combo }),
      setShowCart: (show) => set({ showCart: show }),

      setDeliveryOption: (option) => set({ deliveryOption: option }),
      setScheduledDate: (date) => set({ scheduledDate: date }),
      setScheduledTime: (time) => set({ scheduledTime: time }),

      setShippingFee: (fee, distance = 0) => {
        set({ shippingFee: fee, shippingDistance: distance });
      },

      recalculateShippingFee: async () => {
        const {
          selectedAddress,
          deliveryOption,
          scheduledDate,
          scheduledTime,
        } = get();

        if (!selectedAddress || !selectedAddress.location?.coordinates) {
          return;
        }
        const [lng, lat] = selectedAddress.location.coordinates;

        let orderTime = new Date().toISOString();

        if (deliveryOption === "scheduled") {
          if (scheduledDate && scheduledTime) {
            try {
              const combined = new Date(`${scheduledDate}T${scheduledTime}`);
              if (!isNaN(combined.getTime())) {
                orderTime = combined.toISOString();
              }
            } catch (e) {
              console.warn("Invalid scheduled time, falling back to now");
            }
          }
        }

        try {
          set({ isCalculatingShip: true });
          const res = await orderService.getShippingFee(lat, lng, orderTime);
          set({
            shippingFee: res.shippingFee,
            shippingDistance: res.distance,
            isCalculatingShip: false,
          });
        } catch (error) {
          console.error("Failed to recalculate shipping:", error);
          set({ isCalculatingShip: false });
        }
      },

      setSelectedAddress: async (address) => {
        set({ selectedAddress: address });

        if (!address) {
          set({ shippingFee: DEFAULT_SHIPPING_FEE, shippingDistance: 0 });
          return;
        }

        if (address.location?.coordinates) {
          get().recalculateShippingFee();
        } else {
          set({ shippingFee: DEFAULT_SHIPPING_FEE, shippingDistance: 0 });
        }
      },

      syncUserAddress: (user) => {
        const { selectedAddress } = get();
        if (user && user.addresses && user.addresses.length > 0) {
          const defaultAddr =
            user.addresses.find((a: any) => a.isDefault) || user.addresses[0];

          if (!selectedAddress) {
            get().setSelectedAddress(defaultAddr);
            return;
          }

          const exists = user.addresses.find(
            (a: any) =>
              a._id === selectedAddress._id || a.id === selectedAddress.id
          );
          if (!exists) {
            get().setSelectedAddress(defaultAddr);
          } else {
            if (JSON.stringify(exists) !== JSON.stringify(selectedAddress)) {
              get().setSelectedAddress(exists);
            }
          }
        } else {
          set({ selectedAddress: null, shippingFee: DEFAULT_SHIPPING_FEE });
        }
      },

      fetchAvailableCoupons: async () => {
        const { isLoadingCoupons, couponsFetchedAt } = get();
        const now = Date.now();
        if (isLoadingCoupons || now - couponsFetchedAt < DATA_TTL_MS) return;

        try {
          set({ isLoadingCoupons: true });
          const data = await couponService.getAvailables({});

          set({
            availableCoupons: data || [],
            isLoadingCoupons: false,
            couponsFetchedAt: now,
          });
        } catch (e) {
          console.error("Failed to fetch coupons:", e);
          set({ isLoadingCoupons: false });
        }
      },

      fetchPublicCoupons: async () => {
        await get().fetchAvailableCoupons();
      },

      toggleCoupon: (coupon: Coupon) => {
        set((state) => {
          const isApplied = state.appliedCoupons.some(
            (c) => c.id === coupon.id
          );

          if (isApplied) {
            return {
              appliedCoupons: state.appliedCoupons.filter(
                (c) => c.id !== coupon.id
              ),
            };
          } else {
            const others = state.appliedCoupons.filter(
              (c) => c.type !== coupon.type
            );
            return {
              appliedCoupons: [...others, coupon],
            };
          }
        });
      },

      applyPrivateCoupon: async (code: string) => {
        set({ couponStatus: { isLoading: true, error: null } });
        try {
          const res = await couponService.validate(code);
          const { appliedCoupons } = get();

          if (appliedCoupons.some((c) => c.code === res.code)) {
            set({
              couponStatus: {
                isLoading: false,
                error: "Mã này đã được áp dụng.",
              },
            });
            return { success: false, message: "Mã đã tồn tại." };
          }

          const others = appliedCoupons.filter((c) => c.type !== res.type);
          set({
            appliedCoupons: [...others, res],
            couponStatus: { isLoading: false, error: null },
          });
          return { success: true, message: "Áp dụng thành công!" };
        } catch (e: any) {
          set({
            couponStatus: {
              isLoading: false,
              error: e.message || "Mã không hợp lệ.",
            },
          });
          return { success: false, message: e.message };
        }
      },

      applyPublicCoupon: (c) => get().toggleCoupon(c),
      removeCoupon: (id) =>
        set((s) => ({
          appliedCoupons: s.appliedCoupons.filter((c) => c.id !== id),
        })),

      fetchSurcharges: async () => {
        try {
          const res = await orderService.getSurcharges();
          set({ surcharges: res.results });
        } catch (error) {
          console.error("Failed to fetch surcharges:", error);
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        appliedCoupons: state.appliedCoupons,
        shippingFee: state.shippingFee,
        selectedAddress: state.selectedAddress,
        shippingDistance: state.shippingDistance,
        deliveryOption: state.deliveryOption,
        scheduledDate: state.scheduledDate,
        scheduledTime: state.scheduledTime,
        surcharges: state.surcharges,
      }),
    }
  )
);

/** ===== PUBLIC HOOK ===== */
export function useCart() {
  const store = useCartStore();
  const { me } = useAuthStore();

  // 1. Tính "Tổng giá trị thị trường" của giỏ hàng (Market Subtotal)
  // Dùng giá này làm mốc chuẩn để so sánh với minOrderValue
  const marketSubtotal = useMemo(() => {
    return store.cartItems.reduce((sum, item) => {
      const marketPrice = getLineItemMarketPrice(item);
      return sum + marketPrice * item.quantity;
    }, 0);
  }, [store.cartItems]);

  // 2. [FIX] Tính toán lại danh sách Item dựa trên điều kiện minOrderValue
  // Nếu Market Subtotal < minOrderValue -> Revert giá sản phẩm về giá gốc
  const effectiveCartItems = useMemo(() => {
    return store.cartItems.map((item) => {
      const promotion = (item.item as any).promotion;

      // Kiểm tra xem item này có promotion kèm minOrderValue không
      if (
        promotion &&
        typeof promotion === "object" &&
        promotion.minOrderValue > 0
      ) {
        // So sánh với Tổng giá trị thực của giỏ hàng
        if (marketSubtotal < promotion.minOrderValue) {
          const marketPrice = getLineItemMarketPrice(item);
          // Trả về item với giá đã bị đưa về gốc (hiển thị UI)
          return {
            ...item,
            totalPrice: marketPrice,
            // Thêm flag để UI có thể hiển thị cảnh báo (tuỳ chọn)
            promotionWarning: `Đơn hàng chưa đạt tối thiểu ${promotion.minOrderValue.toLocaleString()}đ để áp dụng giá ưu đãi.`,
          };
        }
      }
      return item;
    });
  }, [store.cartItems, marketSubtotal]);

  // 3. Tính Subtotal cuối cùng (Dựa trên Effective Items)
  const subtotal = useMemo(
    () =>
      effectiveCartItems.reduce((sum, i) => sum + i.totalPrice * i.quantity, 0),
    [effectiveCartItems]
  );

  const cartCount = useMemo(
    () => store.cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [store.cartItems]
  );

  // 4. Xử lý Coupon (Voucher)
  const processedCoupons = useMemo(() => {
    // @ts-ignore
    const cartContext = { items: effectiveCartItems, subtotal }; // Dùng effectiveCartItems

    return store.availableCoupons.map((coupon) => {
      // @ts-ignore
      const check = checkCouponEligibility(coupon, cartContext, me);

      const backendReason = (coupon as any).inapplicableReason;
      const isBackendApplicable = (coupon as any).isApplicable !== false;

      const HARD_STOP_REASONS = [
        "MAX_USES_REACHED",
        "USAGE_LIMIT_REACHED",
        "EXPIRED",
        "COUPON_NOT_FOUND",
      ];

      let isEligible = check.isEligible;
      let reason = check.reason;

      if (isEligible) {
        if (
          !isBackendApplicable &&
          backendReason &&
          HARD_STOP_REASONS.includes(backendReason)
        ) {
          isEligible = false;
          reason = backendReason;
        }

        const minOrderVal = (coupon as any).minOrderValue || 0;
        if (subtotal < minOrderVal) {
          isEligible = false;
          reason = `Đơn tối thiểu ${minOrderVal.toLocaleString()}đ`;
        }
      }

      return {
        ...coupon,
        isEligible: isEligible,
        reason: reason || backendReason,
        scope:
          (coupon as any).couponScope ||
          ((coupon as any).voucherId ? "PERSONAL" : "PUBLIC"),
      };
    });
  }, [store.availableCoupons, effectiveCartItems, subtotal, me]);

  const personalCoupons = useMemo(
    () => processedCoupons.filter((c) => c.scope === "PERSONAL"),
    [processedCoupons]
  );

  const publicCoupons = useMemo(
    () =>
      processedCoupons.filter(
        (c) =>
          c.scope === "PUBLIC" &&
          !personalCoupons.some((p) => p.code && p.code === c.code)
      ),
    [processedCoupons, personalCoupons]
  );

  // 5. Tính toán Discount (Voucher)
  const { itemDiscount, shippingDiscount } = useMemo(() => {
    let totalItemDiscount = 0;
    let totalShippingDiscount = 0;
    let currentSubtotal = subtotal;

    const freeshipCoupon = store.appliedCoupons.find(
      (c) => c.type === "freeship"
    );
    if (freeshipCoupon) {
      const minOrderVal = (freeshipCoupon as any).minOrderValue || 0;
      const limitPerOrder = (freeshipCoupon as any).limitPerOrder || 0;

      if (currentSubtotal >= minOrderVal) {
        let discount = Math.min(store.shippingFee, freeshipCoupon.value);
        if (limitPerOrder > 0) {
          discount = Math.min(discount, limitPerOrder);
        }
        totalShippingDiscount = discount;
      }
    }

    const discountCoupon = store.appliedCoupons.find(
      (c) => c.type === "discount_code"
    );
    if (discountCoupon) {
      const minOrderVal = (discountCoupon as any).minOrderValue || 0;
      const limitPerOrder = (discountCoupon as any).limitPerOrder || 0;

      if (currentSubtotal >= minOrderVal) {
        let val = 0;
        if (discountCoupon.valueType === "percentage") {
          val = currentSubtotal * (discountCoupon.value / 100);
          if (discountCoupon.maxDiscountAmount) {
            val = Math.min(val, discountCoupon.maxDiscountAmount);
          }
        } else {
          val = discountCoupon.value;
        }

        if (limitPerOrder > 0) {
          val = Math.min(val, limitPerOrder);
        }

        totalItemDiscount = Math.min(val, currentSubtotal);
      }
    }

    return {
      itemDiscount: totalItemDiscount,
      shippingDiscount: totalShippingDiscount,
    };
  }, [subtotal, store.appliedCoupons, store.shippingFee]);

  const totalSurcharge = useMemo(
    () => store.surcharges.reduce((sum, s) => sum + s.cost, 0),
    [store.surcharges]
  );

  const finalShippingFee = Math.max(0, store.shippingFee - shippingDiscount);
  const finalTotal = Math.max(
    0,
    subtotal - itemDiscount + finalShippingFee + totalSurcharge
  );

  return {
    ...store,
    cartItems: effectiveCartItems, // [QUAN TRỌNG] Ghi đè cartItems bằng danh sách đã tính toán lại giá
    subtotal,
    cartCount,
    personalCoupons,
    publicCoupons,
    itemDiscount,
    shippingDiscount,
    finalShippingFee,
    totalSurcharge,
    finalTotal,
    originalShippingFee: store.shippingFee,
    publicCouponStatuses: processedCoupons,
  };
}

export function CartStoreInitializer() {
  const fetchAvailableCoupons = useCartStore((s) => s.fetchAvailableCoupons);
  const fetchSurcharges = useCartStore((s) => s.fetchSurcharges);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    fetchAvailableCoupons();
    fetchSurcharges();
  }, [fetchAvailableCoupons, fetchSurcharges]);

  return null;
}
