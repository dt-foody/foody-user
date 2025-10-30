"use client";

import React, { useMemo, useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// =============================
// ⚙️ CẤU HÌNH CƠ BẢN
// =============================
const API_URL = "http://localhost:3000/v1";
export const SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v5";

// =============================
// 🧩 INTERFACE ĐỊNH NGHĨA
// (Giữ nguyên tất cả các interface của bạn)
// =============================

// Điều kiện (cho coupon)
interface Condition {
  id: string;
  fieldId: string;
  operator: string;
  value: any;
}

interface ConditionGroup {
  id: string;
  operator: "AND" | "OR";
  conditions: (Condition | ConditionGroup)[];
}

// Coupon
export interface Coupon {
  id: string;
  name: string;
  code: string;
  description: string;
  type: "discount_code" | "freeship" | "gift";
  value: number;
  valueType: "percentage" | "fixed";
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  public: boolean;
  claimable: boolean;
  autoApply: boolean;
  stackable: boolean;
  conditions: ConditionGroup | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  startDate: string;
  endDate: string;
}

interface UserData {
  isNew: boolean;
  age: number | null;
}

export interface EligibilityStatus {
  isEligible: boolean;
  reason: string | null;
}

// Dữ liệu tạm cho giỏ hàng
interface CartData {
  items: any[];
  subtotal: number;
}

// =============================
// 🧮 HÀM CHECK COUPON (Giữ nguyên)
// =============================
const checkCouponEligibility = (
  coupon: Coupon,
  cart: CartData,
  user: UserData
): EligibilityStatus => {
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return {
      isEligible: false,
      reason: `Cần mua thêm ${(
        coupon.minOrderAmount - cart.subtotal
      ).toLocaleString("vi-VN")}đ`,
    };
  }

  if (coupon.conditions && coupon.conditions.conditions.length > 0) {
    for (const condition of coupon.conditions.conditions) {
      if ("fieldId" in condition) {
        const { fieldId, operator, value } = condition;

        switch (fieldId) {
          case "category_id":
            if (operator === "IN") {
              const itemCategoryIds = new Set(
                cart.items.flatMap((item) => item.categoryIds || [])
              );
              const requiredCategoryIds = new Set(value);
              const intersection = new Set(
                [...itemCategoryIds].filter((x) => requiredCategoryIds.has(x))
              );
              if (intersection.size === 0) {
                return {
                  isEligible: false,
                  reason: "Cần có sản phẩm thuộc danh mục yêu cầu (vd: Pizza)",
                };
              }
            }
            break;
          case "customer_is_new":
            if (operator === "EQUALS" && String(user.isNew) !== String(value)) {
              return {
                isEligible: false,
                reason: "Chỉ dành cho khách hàng mới",
              };
            }
            break;
          case "customer_age":
            if (user.age === null) {
              return {
                isEligible: false,
                reason: "Không thể xác định tuổi của bạn",
              };
            }
            if (operator === "EQUALS" && user.age !== value) {
              return {
                isEligible: false,
                reason: `Chỉ dành cho khách hàng ${value} tuổi`,
              };
            }
            break;
          default:
            console.warn(`Unknown condition fieldId: ${fieldId}`);
        }
      }
    }
  }

  return { isEligible: true, reason: null };
};

// =============================
// 🧠 ZUSTAND STATE & ACTIONS
// =============================

interface CartState {
  cartItems: any[];
  showCart: boolean;
  publicCoupons: Coupon[];
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  couponStatus: { isLoading: boolean; error: string | null };
  productForOptions: any | null;
  currentUser: UserData;
}

interface CartActions {
  addToCart: (item: any) => void;
  updateQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;
  setShowCart: (show: boolean) => void;
  setProductForOptions: (product: any | null) => void;
  addToCartWithOptions: (
    product: any,
    selectedOptions: Record<string, any[]>,
    totalPrice: number,
    note: string
  ) => void;
  fetchPublicCoupons: () => Promise<void>;
}

// ⚡ State ban đầu
const initialState: CartState = {
  cartItems: [],
  showCart: false,
  publicCoupons: [],
  appliedCoupons: [],
  isLoadingPublicCoupons: true,
  couponStatus: { isLoading: false, error: null },
  productForOptions: null,
  currentUser: {
    isNew: true,
    age: 18,
  },
};

// ⚡ Tạo store với middleware `persist` để lưu localStorage
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // === ACTIONS ===
      addToCart: (item: any) => {
        set((state) => {
          const existing = state.cartItems.find((i) => i.id === item.id);
          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            cartItems: [
              ...state.cartItems,
              {
                ...item,
                cartId: item.id,
                quantity: 1,
                totalPrice: item.price,
                categoryIds: item.categoryIds || [],
              },
            ],
          };
        });
        set({ showCart: true });
      },

      addToCartWithOptions: (
        product: any,
        selectedOptions: Record<string, any[]>,
        totalPrice: number,
        note: string
      ) => {
        const chosenOptions = Object.values(selectedOptions).flat();
        set((state) => ({
          cartItems: [
            ...state.cartItems,
            {
              ...product,
              cartId: `${product.id}-${Date.now()}`,
              quantity: 1,
              totalPrice,
              note,
              selectedOptions: chosenOptions,
              categoryIds: product.categoryIds || [],
            },
          ],
          productForOptions: null,
          showCart: true,
        }));
      },

      updateQuantity: (cartId: string, amount: number) => {
        set((state) => ({
          cartItems: state.cartItems
            .map((i) =>
              i.cartId === cartId ? { ...i, quantity: i.quantity + amount } : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => {
        set({ cartItems: [], appliedCoupons: [] });
      },

      applyPublicCoupon: (coupon: Coupon) => {
        if (get().appliedCoupons.some((c) => c.id === coupon.id)) return;
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

        // Lấy state MỚI NHẤT
        const { cartItems, appliedCoupons } = get();

        // Tính toán subtotal bên trong action
        const subtotal = cartItems.reduce(
          (sum, item) => sum + item.totalPrice * (item.quantity || 1),
          0
        );

        if (
          appliedCoupons.some(
            (c) => c.code.toUpperCase() === code.toUpperCase()
          )
        ) {
          const msg = "Mã này đã được áp dụng.";
          set({ couponStatus: { isLoading: false, error: msg } });
          return { success: false, message: msg };
        }
        try {
          const res = await fetch(
            `${API_URL}/coupons/validate?code=${code}&orderValue=${subtotal}`
          );
          const validatedCoupon = await res.json();
          if (!res.ok) {
             throw new Error(validatedCoupon.message || "Mã không hợp lệ.");
          }
          set((state) => ({
            appliedCoupons: [...state.appliedCoupons, validatedCoupon],
          }));
          set({ couponStatus: { isLoading: false, error: null } });
          return { success: true, message: "Áp dụng thành công!" };
        } catch (err: any) {
          const msg = err.message || "Mã không hợp lệ.";
          set({ couponStatus: { isLoading: false, error: msg } });
          return { success: false, message: msg };
        }
      },

      removeCoupon: (id: string) => {
        set((state) => ({
          appliedCoupons: state.appliedCoupons.filter((c) => c.id !== id),
        }));
      },

      setShowCart: (show: boolean) => {
        set({ showCart: show });
      },

      setProductForOptions: (product: any | null) => {
        set({ productForOptions: product });
      },

      fetchPublicCoupons: async () => {
        try {
          set({ isLoadingPublicCoupons: true });
          const response = await fetch(`${API_URL}/coupons/available`);
          const data = await response.json();
          set({ publicCoupons: data.coupons || data || [], isLoadingPublicCoupons: false });
        } catch (e) {
          console.error("Failed to fetch public coupons:", e);
          set({ isLoadingPublicCoupons: false });
        }
      },
    }),
    {
      name: CART_STORAGE_KEY, // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu `cartItems` vào localStorage, giống hệt logic cũ
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);

// =============================
// 🚀 CUSTOM HOOK (Giữ nguyên API)
// =============================
export function useCart() {
  // ⚡ Lấy state và actions từ store
  const {
    cartItems,
    appliedCoupons,
    currentUser,
    publicCoupons,
    ...actionsAndState // Lấy tất cả state và actions còn lại
  } = useCartStore((state) => state);

  // ⚡ Tính toán các giá trị phát sinh (derived state) bằng useMemo
  // (Logic này giống hệt như trong CartContext cũ)

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.totalPrice * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
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

  // ⚡ Trả về một object có cấu trúc y hệt như CartContextType
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
  };
}


// =============================
// 🔄 STORE INITIALIZER
// =============================
/**
 * Component này dùng để gọi action `fetchPublicCoupons` một lần
 * khi ứng dụng được tải.
 * Hãy thêm component này vào file layout.tsx chính của bạn.
 */
export function CartStoreInitializer() {
  // Lấy action từ store
  const fetchPublicCoupons = useCartStore((state) => state.fetchPublicCoupons);

  useEffect(() => {
    // Gọi action fetch một lần khi component mount
    fetchPublicCoupons();
  }, [fetchPublicCoupons]);

  return null; // Component này không render ra gì cả
}