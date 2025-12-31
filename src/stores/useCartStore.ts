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
const CART_STORAGE_KEY = "foody_cart_v16"; // Bump version để reset state cũ tránh lỗi
const DATA_TTL_MS = 60_000; // 1 phút cache

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

  // SỬA TẠI ĐÂY: Dùng totalPrice đã tính toán để làm Key định danh
  const appliedPrice = Math.round(itemData.totalPrice);

  const promotionTag =
    itemData.item.promotion && itemData.item.promotion !== ""
      ? itemData.item.promotion
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

      // --- UI & Basic Actions ---
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
          const exists = state.cartItems.find((i) => i.cartId === cartId);
          if (exists) {
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
        set((state) => ({
          cartItems: state.cartItems
            .map((i) =>
              i.cartId === cartId ? { ...i, quantity: i.quantity + amount } : i
            )
            .filter((i) => i.quantity > 0),
        }));
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

      // --- COUPON LOGIC ---

      fetchAvailableCoupons: async () => {
        const { isLoadingCoupons, couponsFetchedAt } = get();
        const now = Date.now();
        // Cache 1 phút
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

      // [FIX] Cập nhật toggleCoupon để xử lý chuyển đổi mượt mà
      toggleCoupon: (coupon: Coupon) => {
        set((state) => {
          // Kiểm tra xem coupon này đã được áp dụng chưa (so sánh id)
          const isApplied = state.appliedCoupons.some(
            (c) => c.id === coupon.id
          );

          if (isApplied) {
            // Nếu đang áp dụng -> Bỏ chọn (Remove)
            return {
              appliedCoupons: state.appliedCoupons.filter(
                (c) => c.id !== coupon.id
              ),
            };
          } else {
            // Nếu chưa áp dụng -> Chọn (Switch)
            // 1. Loại bỏ các coupon cùng loại (VD: chọn mã giảm giá mới thì bỏ mã cũ)
            const others = state.appliedCoupons.filter(
              (c) => c.type !== coupon.type
            );
            // 2. Thêm coupon mới vào
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

      // --- NEW: Fetch surcharges ---
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

  // 1. Tính Subtotal
  const subtotal = useMemo(
    () =>
      store.cartItems.reduce((sum, i) => sum + i.totalPrice * i.quantity, 0),
    [store.cartItems]
  );

  const cartCount = useMemo(
    () => store.cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [store.cartItems]
  );

  // 2. Xử lý danh sách Coupon & Override Logic Backend
  const processedCoupons = useMemo(() => {
    // @ts-ignore
    const cartContext = { items: store.cartItems, subtotal };

    return store.availableCoupons.map((coupon) => {
      // Check lại điều kiện tại Frontend (Realtime theo giỏ hàng)
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

      // Logic Override:
      // Nếu FE thấy thỏa điều kiện (isEligible=true), ta sẽ BỎ QUA lỗi mềm từ backend
      // (vì backend trả về status lúc chưa có giỏ hàng)
      if (isEligible) {
        // Chỉ chặn nếu gặp lỗi hệ thống cứng
        if (
          !isBackendApplicable &&
          backendReason &&
          HARD_STOP_REASONS.includes(backendReason)
        ) {
          isEligible = false;
          reason = backendReason;
        }
        // Nếu không phải lỗi cứng -> Coupon hợp lệ (Override backend)
      }

      return {
        ...coupon,
        isEligible: isEligible,
        reason: reason || backendReason, // Ưu tiên lý do realtime từ FE
        scope:
          (coupon as any).couponScope ||
          ((coupon as any).voucherId ? "PERSONAL" : "PUBLIC"),
      };
    });
  }, [store.availableCoupons, store.cartItems, subtotal, me]);

  // Lọc coupon cá nhân
  const personalCoupons = useMemo(
    () => processedCoupons.filter((c) => c.scope === "PERSONAL"),
    [processedCoupons]
  );

  // Lọc coupon công khai & Loại bỏ trùng lặp nếu đã có trong Personal
  const publicCoupons = useMemo(
    () =>
      processedCoupons.filter(
        (c) =>
          c.scope === "PUBLIC" &&
          !personalCoupons.some((p) => p.code && p.code === c.code)
      ),
    [processedCoupons, personalCoupons]
  );

  // 3. Tính toán Discount
  const { itemDiscount, shippingDiscount } = useMemo(() => {
    let totalItemDiscount = 0;
    let totalShippingDiscount = 0;
    let currentSubtotal = subtotal;

    const freeshipCoupon = store.appliedCoupons.find(
      (c) => c.type === "freeship"
    );
    if (freeshipCoupon) {
      totalShippingDiscount = Math.min(store.shippingFee, freeshipCoupon.value);
    }

    const discountCoupon = store.appliedCoupons.find(
      (c) => c.type === "discount_code"
    );
    if (discountCoupon) {
      let val = 0;
      if (discountCoupon.valueType === "percentage") {
        val = currentSubtotal * (discountCoupon.value / 100);
        if (discountCoupon.maxDiscountAmount) {
          val = Math.min(val, discountCoupon.maxDiscountAmount);
        }
      } else {
        val = discountCoupon.value;
      }
      totalItemDiscount = Math.min(val, currentSubtotal);
    }

    return {
      itemDiscount: totalItemDiscount,
      shippingDiscount: totalShippingDiscount,
    };
  }, [subtotal, store.appliedCoupons, store.shippingFee]);

  // 4. Tính toán surcharges nếu có
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
