// /stores/useCartStore.ts
"use client";

import { useMemo, useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { couponService } from "@/services";
import { Coupon, MenuItem, OptionItem } from "@/types";
import { checkCouponEligibility } from "@/utils/checkCouponEligibility";

export const SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v5";

// ĐỊNH NGHĨA TYPE DELIVERY OPTION TẠI ĐÂY
export type DeliveryOption = "immediate" | "scheduled";

interface UserData {
  isNew: boolean;
  age: number | null;
}
export interface EligibilityStatus {
  isEligible: boolean;
  reason: string | null;
}

/** ===== Line item trong giỏ ===== */
interface CartLine {
  cartId: string; // variantKey
  productId: string;
  name: string;
  basePrice: number;
  image?: string;
  quantity: number;
  totalPrice: number; // đơn giá sau option (chưa nhân quantity)
  categoryIds: string[];
  note?: string;
  selectedOptions?: OptionItem[];
}

/** ===== Cart state & actions ===== */
interface CartState {
  cartItems: CartLine[];
  showCart: boolean;
  publicCoupons: Coupon[];
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  couponStatus: { isLoading: boolean; error: string | null };
  productForOptions: MenuItem | null;
  currentUser: UserData;

  // === STATE MỚI ===
  deliveryOption: DeliveryOption;
  scheduledDate: string;
}
interface CartActions {
  /** Quyết định mở modal hay add thẳng */
  startAddToCart: (product: MenuItem) => void;

  /** Thêm sản phẩm không option */
  addToCart: (item: MenuItem) => void;

  /** Thêm sản phẩm có option + totalPrice đã tính */
  addToCartWithOptions: (
    product: MenuItem,
    selectedOptions: Record<string, OptionItem[]>,
    totalPrice: number,
    note: string
  ) => void;

  updateQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;

  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;

  setShowCart: (show: boolean) => void;
  setProductForOptions: (product: MenuItem | null) => void;

  fetchPublicCoupons: () => Promise<void>;

  updateItemNote: (cartId: string, note: string) => void;
  removeItem: (cartId: string) => void;

  // === ACTIONS MỚI ===
  setDeliveryOption: (option: DeliveryOption) => void;
  setScheduledDate: (date: string) => void;
}

/** ===== Helpers ===== */
const hasSelectableOptions = (p: MenuItem) =>
  Array.isArray(p.optionGroups) &&
  p.optionGroups.some((g) => Array.isArray(g.options) && g.options.length > 0);

const buildVariantKey = (
  product: MenuItem,
  chosen?: OptionItem[],
  note?: string
) => {
  const optionSig = (chosen ?? [])
    .map((o) => `${o.name}:${o.type}:${o.priceModifier}`)
    .sort()
    .join("|");

  const noteSig = (note ?? "").trim();
  return `${product.id}::${optionSig}::${noteSig}`;
};

/** ===== Initial state ===== */
const initialState: CartState = {
  cartItems: [],
  showCart: false,
  publicCoupons: [],
  appliedCoupons: [],
  isLoadingPublicCoupons: true,
  couponStatus: { isLoading: false, error: null },
  productForOptions: null,
  currentUser: { isNew: true, age: 18 },

  // === STATE MỚI ===
  deliveryOption: "immediate",
  scheduledDate: "",
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startAddToCart: (product) => {
        if (hasSelectableOptions(product)) {
          set({ productForOptions: product, showCart: false });
        } else {
          get().addToCart(product);
        }
      },

      addToCart: (item) => {
        const cartId = buildVariantKey(item);
        set((state) => {
          const exists = state.cartItems.find((i) => i.cartId === cartId);
          if (exists) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              showCart: true,
            };
          }
          const line: CartLine = {
            cartId,
            productId: item.id,
            name: item.name,
            basePrice: item.price,
            image: item.image,
            quantity: 1,
            totalPrice: item.price,
            categoryIds: item.categoryIds || [],
          };
          return { cartItems: [...state.cartItems, line], showCart: true };
        });
      },

      addToCartWithOptions: (product, selectedOptions, totalPrice, note) => {
        const chosenOptions = Object.values(selectedOptions).flat();
        const cartId = buildVariantKey(product, chosenOptions, note);

        set((state) => {
          const exists = state.cartItems.find((i) => i.cartId === cartId);
          if (exists) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              productForOptions: null,
              showCart: true,
            };
          }
          const line: CartLine = {
            cartId,
            productId: product.id,
            name: product.name,
            basePrice: product.price,
            image: product.image,
            quantity: 1,
            totalPrice,
            note,
            selectedOptions: chosenOptions,
            categoryIds: product.categoryIds || [],
          };
          return {
            cartItems: [...state.cartItems, line],
            productForOptions: null,
            showCart: true,
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

      applyPublicCoupon: (coupon) => {
        const current = get().appliedCoupons;
        if (current.some((c) => c.id === coupon.id)) return;

        set((state) => {
          const others = state.appliedCoupons.filter((c) => c.id !== coupon.id);
          if (coupon.type === "freeship") {
            return {
              appliedCoupons: [
                ...others.filter((c) => c.type !== "freeship"),
                coupon,
              ],
            };
          }
          if (coupon.type === "discount_code") {
            return {
              appliedCoupons: [
                ...others.filter((c) => c.type !== "discount_code"),
                coupon,
              ],
            };
          }
          return { appliedCoupons: [...others, coupon] };
        });
      },

      applyPrivateCoupon: async (code: string) => {
        set({ couponStatus: { isLoading: true, error: null } });

        const { cartItems, appliedCoupons } = get();
        const subtotal = cartItems.reduce(
          (sum, i) => sum + i.totalPrice * i.quantity,
          0
        );

        if (
          appliedCoupons.some(
            (c) => c?.code?.toUpperCase() === code.toUpperCase()
          )
        ) {
          const msg = "Mã này đã được áp dụng.";
          set({ couponStatus: { isLoading: false, error: msg } });
          return { success: false, message: msg };
        }

        try {
          const res = await couponService.validate(code);
          set((state) => ({
            appliedCoupons: [...state.appliedCoupons, res],
          }));
          set({ couponStatus: { isLoading: false, error: null } });
          return { success: true, message: "Áp dụng thành công!" };
        } catch (err: any) {
          const msg = err?.message || "Mã không hợp lệ.";
          set({ couponStatus: { isLoading: false, error: msg } });
          return { success: false, message: msg };
        }
      },

      removeCoupon: (id) => {
        set((state) => ({
          appliedCoupons: state.appliedCoupons.filter((c) => c.id !== id),
        }));
      },

      setShowCart: (show) => set({ showCart: show }),
      setProductForOptions: (product) => set({ productForOptions: product }),

      fetchPublicCoupons: async () => {
        try {
          set({ isLoadingPublicCoupons: true });
          const data = await couponService.getAvailables({});

          set({
            publicCoupons: data || [],
            isLoadingPublicCoupons: false,
          });
        } catch (e) {
          console.error("Failed to fetch public coupons:", e);
          set({ isLoadingPublicCoupons: false });
        }
      },

      updateItemNote: (cartId, note) => {
        useCartStore.setState((state) => ({
          cartItems: state.cartItems.map((i) =>
            i.cartId === cartId ? { ...i, note } : i
          ),
        }));
      },

      removeItem: (cartId) => {
        useCartStore.setState((state) => ({
          cartItems: state.cartItems.filter((i) => i.cartId !== cartId),
        }));
      },

      // === IMPLEMENT ACTIONS MỚI ===
      setDeliveryOption: (option) => set({ deliveryOption: option }),
      setScheduledDate: (date) => set({ scheduledDate: date }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // chỉ persist cartItems, các lựa chọn khác sẽ reset khi tải lại
      partialize: (state) => ({
        cartItems: state.cartItems,
        // Optional: bạn có thể persist lựa chọn giao hàng nếu muốn
        // deliveryOption: state.deliveryOption,
        // scheduledDate: state.scheduledDate,
      }),
    }
  )
);

/** ===== Public hook: giữ API quen thuộc ===== */
export function useCart() {
  const {
    cartItems,
    appliedCoupons,
    currentUser,
    publicCoupons,
    // === LẤY STATE MỚI RA ===
    deliveryOption,
    scheduledDate,
    ...actionsAndState
  } = useCartStore((s) => s);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.totalPrice * i.quantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const publicCouponStatuses = useMemo(() => {
    const cartData = { items: cartItems, subtotal };
    return publicCoupons.map((coupon) => {
      const status = checkCouponEligibility(coupon, cartData, currentUser);
      return { coupon, ...status };
    });
  }, [publicCoupons, cartItems, subtotal, currentUser]);

  const { itemDiscount, shippingDiscount } = useMemo(() => {
    let totalItemDiscount = 0;
    let totalShippingDiscount = 0;
    let currentSubtotal = subtotal;

    const freeship = appliedCoupons.find((c) => c.type === "freeship");
    if (freeship)
      totalShippingDiscount = Math.min(SHIPPING_FEE, freeship.value);

    const discountCoupons = appliedCoupons
      .filter((c) => c.type === "discount_code")
      .sort((a, b) => (a.valueType === "percentage" ? -1 : 1));

    for (const coupon of discountCoupons) {
      if (currentSubtotal <= 0) break;
      let discount =
        coupon.valueType === "percentage"
          ? currentSubtotal * (coupon.value / 100)
          : coupon.value;
      if (coupon.maxDiscountAmount)
        discount = Math.min(discount, coupon.maxDiscountAmount);
      discount = Math.min(discount, currentSubtotal);
      totalItemDiscount += discount;
      currentSubtotal -= discount;
    }

    return {
      itemDiscount: totalItemDiscount,
      shippingDiscount: totalShippingDiscount,
    };
  }, [subtotal, appliedCoupons]);

  const finalShippingFee = Math.max(0, SHIPPING_FEE - shippingDiscount);
  const finalTotal = Math.max(0, subtotal - itemDiscount + finalShippingFee);

  return {
    ...actionsAndState,
    cartItems,
    appliedCoupons,
    currentUser,
    publicCoupons,
    subtotal,
    cartCount,
    publicCouponStatuses,
    itemDiscount,
    shippingDiscount,
    finalShippingFee,
    finalTotal,
    // === TRẢ RA STATE MỚI ===
    deliveryOption,
    scheduledDate,
  };
}

/** ===== Initializer để fetch coupon public một lần ===== */
export function CartStoreInitializer() {
  const fetchPublicCoupons = useCartStore((s) => s.fetchPublicCoupons);
  useEffect(() => {
    fetchPublicCoupons();
  }, [fetchPublicCoupons]);
  return null;
}
