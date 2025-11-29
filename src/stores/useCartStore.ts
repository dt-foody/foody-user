"use client";

import { useMemo, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { couponService } from "@/services";
import { orderService } from "@/services/order.service";
import { checkCouponEligibility } from "@/utils/checkCouponEligibility";
import { CartActions, CartLine, CartState } from "@/types/cart";
import { Coupon } from "@/types";

// --- CONSTANTS & TYPES ---
const DEFAULT_SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v13"; // Bump version
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
    return `${baseId}::${optionSig}`;
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
    return `${baseId}::${selectionSig}`;
  }

  return baseId;
};

// --- TYPE DEFINITIONS ---

// Định nghĩa phần State mở rộng thêm các field mới
interface ExtendedStateData {
  availableCoupons: Coupon[];
  isLoadingCoupons: boolean;
  couponsFetchedAt: number;
}

// Interface đầy đủ cho Store (State cũ + State mới + Actions)
interface ExtendedCartStore extends CartState, ExtendedStateData, CartActions {
  fetchAvailableCoupons: () => Promise<void>;
  toggleCoupon: (coupon: Coupon) => void;
}

// --- INITIAL STATE ---
// Fix lỗi TS: Khai báo đầy đủ type cho initialState
const initialState: CartState & ExtendedStateData = {
  cartItems: [],
  showCart: false,

  // Fields cũ (để tương thích TypeScript CartState, dù không dùng)
  publicCoupons: [],
  isLoadingPublicCoupons: false,
  publicCouponsFetchedAt: 0,

  // Fields mới
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

      // --- NEW COUPON LOGIC ---

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
        // Alias function để tương thích ngược nếu component cũ gọi
        await get().fetchAvailableCoupons();
      },

      toggleCoupon: (coupon: Coupon) => {
        const { appliedCoupons } = get();
        const isApplied = appliedCoupons.some(
          (c) => c.id === coupon.id || (c as any)._id === (coupon as any)._id
        );

        if (isApplied) {
          set({
            appliedCoupons: appliedCoupons.filter(
              (c) =>
                c.id !== coupon.id && (c as any)._id !== (coupon as any)._id
            ),
          });
        } else {
          // Logic thay thế: Chỉ cho phép 1 coupon mỗi loại (Freeship/Discount)
          const others = appliedCoupons.filter((c) => c.type !== coupon.type);
          set({ appliedCoupons: [...others, coupon] });
        }
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
        // Không persist availableCoupons để luôn fetch mới
      }),
    }
  )
);

/** ===== PUBLIC HOOK ===== */
export function useCart() {
  const store = useCartStore();

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

  // 2. Xử lý danh sách Coupon
  const processedCoupons = useMemo(() => {
    // @ts-ignore
    const cartContext = { items: store.cartItems, subtotal };

    return store.availableCoupons.map((coupon) => {
      // Check điều kiện realtime tại FE
      // @ts-ignore
      const check = checkCouponEligibility(coupon, cartContext, null);
      const isBackendApplicable = (coupon as any).isApplicable !== false;

      return {
        ...coupon,
        isEligible: check.isEligible && isBackendApplicable,
        reason: check.reason || (coupon as any).inapplicableReason,
        // Helper scope
        scope:
          (coupon as any).couponScope ||
          ((coupon as any).voucherId ? "PERSONAL" : "PUBLIC"),
      };
    });
  }, [store.availableCoupons, store.cartItems, subtotal]);

  const personalCoupons = useMemo(
    () => processedCoupons.filter((c) => c.scope === "PERSONAL"),
    [processedCoupons]
  );
  const publicCoupons = useMemo(
    () => processedCoupons.filter((c) => c.scope === "PUBLIC"),
    [processedCoupons]
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

  const finalShippingFee = Math.max(0, store.shippingFee - shippingDiscount);
  const finalTotal = Math.max(0, subtotal - itemDiscount + finalShippingFee);

  return {
    ...store,
    subtotal,
    cartCount,
    personalCoupons,
    publicCoupons,
    itemDiscount,
    shippingDiscount,
    finalShippingFee,
    finalTotal,
    originalShippingFee: store.shippingFee,
    publicCouponStatuses: processedCoupons,
  };
}

// Component khởi tạo
export function CartStoreInitializer() {
  const fetchAvailableCoupons = useCartStore((s) => s.fetchAvailableCoupons);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    fetchAvailableCoupons();
  }, [fetchAvailableCoupons]);

  return null;
}
