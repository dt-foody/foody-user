"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

// =============================
// ⚙️ CẤU HÌNH CƠ BẢN
// =============================
const API_URL = "http://localhost:3000/v1";
export const SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v5";

// =============================
// 🧩 INTERFACE ĐỊNH NGHĨA
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
// 🧠 CART CONTEXT TYPE
// =============================
interface CartContextType {
  cartItems: any[];
  cartCount: number;
  addToCart: (item: any) => void;
  updateQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;
  subtotal: number;
  finalShippingFee: number;
  itemDiscount: number;
  shippingDiscount: number;
  finalTotal: number;

  publicCoupons: Coupon[];
  publicCouponStatuses: (EligibilityStatus & { coupon: Coupon })[];
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  couponStatus: { isLoading: boolean; error: string | null };
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;

  showCart: boolean;
  setShowCart: (show: boolean) => void;

  // ⚡ MỚI: hỗ trợ modal chọn tuỳ chọn
  productForOptions: any | null;
  setProductForOptions: (product: any | null) => void;
  addToCartWithOptions: (
    product: any,
    selectedOptions: Record<string, any[]>,
    totalPrice: number,
    note: string
  ) => void;
}

// =============================
// 🧮 HÀM CHECK COUPON
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
// 🧩 CART PROVIDER
// =============================
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [isLoadingPublicCoupons, setIsLoadingPublicCoupons] = useState(true);
  const [couponStatus, setCouponStatus] = useState({
    isLoading: false,
    error: null as string | null,
  });

  // ⚡ MỚI: modal chọn tuỳ chọn
  const [productForOptions, setProductForOptions] = useState<any | null>(null);

  // ⚡ MỚI: người dùng tạm
  const [currentUser] = useState<UserData>({
    isNew: true,
    age: 18,
  });

  // === LOAD CART LOCALSTORAGE ===
  useEffect(() => {
    const s = localStorage.getItem(CART_STORAGE_KEY);
    if (s) setCartItems(JSON.parse(s));
  }, []);
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // === FETCH PUBLIC COUPONS ===
  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        setIsLoadingPublicCoupons(true);
        const response = await fetch(`${API_URL}/public/coupons/available`);
        const data = await response.json();
        setPublicCoupons(data.coupons || data || []);
      } catch (e) {
        console.error("Failed to fetch public coupons:", e);
      } finally {
        setIsLoadingPublicCoupons(false);
      }
    };
    fetchPublicCoupons();
  }, []);

  // === CART LOGIC ===
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

  const addToCart = useCallback((item: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          cartId: item.id,
          quantity: 1,
          totalPrice: item.price,
          categoryIds: item.categoryIds || [],
        },
      ];
    });
    setShowCart(true);
  }, []);

  // ⚡ MỚI: add product có options
  const addToCartWithOptions = useCallback(
    (
      product: any,
      selectedOptions: Record<string, any[]>,
      totalPrice: number,
      note: string
    ) => {
      const chosenOptions = Object.values(selectedOptions).flat();
      setCartItems((prev) => [
        ...prev,
        {
          ...product,
          cartId: `${product.id}-${Date.now()}`,
          quantity: 1,
          totalPrice,
          note,
          selectedOptions: chosenOptions,
          categoryIds: product.categoryIds || [],
        },
      ]);
      setProductForOptions(null);
      setShowCart(true);
    },
    []
  );

  const updateQuantity = useCallback((cartId: string, amount: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + amount } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupons([]);
  }, []);

  // === COUPONS ===
  const publicCouponStatuses = useMemo(() => {
    const cartData = { items: cartItems, subtotal };
    return publicCoupons.map((coupon) => {
      const status = checkCouponEligibility(coupon, cartData, currentUser);
      return { coupon, ...status };
    });
  }, [publicCoupons, cartItems, subtotal, currentUser]);

  const applyPublicCoupon = useCallback(
    (coupon: Coupon) => {
      if (appliedCoupons.some((c) => c.id === coupon.id)) return;
      setAppliedCoupons((prev) => {
        const others = prev.filter((c) => c.id !== coupon.id);
        if (coupon.type === "freeship") {
          return [...others.filter((c) => c.type !== "freeship"), coupon];
        }
        if (coupon.type === "discount_code") {
          return [...others.filter((c) => c.type !== "discount_code"), coupon];
        }
        return [...others, coupon];
      });
    },
    [appliedCoupons]
  );

  const applyPrivateCoupon = useCallback(
    async (code: string) => {
      setCouponStatus({ isLoading: true, error: null });
      if (
        appliedCoupons.some((c) => c.code.toUpperCase() === code.toUpperCase())
      ) {
        const msg = "Mã này đã được áp dụng.";
        setCouponStatus({ isLoading: false, error: msg });
        return { success: false, message: msg };
      }
      try {
        const res = await fetch(
          `${API_URL}/coupons/validate?code=${code}&orderValue=${subtotal}`
        );
        const validatedCoupon = await res.json();
        setAppliedCoupons((prev) => [...prev, validatedCoupon]);
        setCouponStatus({ isLoading: false, error: null });
        return { success: true, message: "Áp dụng thành công!" };
      } catch (err: any) {
        setCouponStatus({
          isLoading: false,
          error: err.message || "Mã không hợp lệ.",
        });
        return { success: false, message: err.message };
      }
    },
    [subtotal, appliedCoupons]
  );

  const removeCoupon = useCallback((id: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // === TÍNH TOÁN GIẢM GIÁ ===
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

  // === VALUE ===
  const value: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    updateQuantity,
    clearCart,
    subtotal,
    finalShippingFee,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    publicCoupons,
    publicCouponStatuses,
    appliedCoupons,
    isLoadingPublicCoupons,
    couponStatus,
    applyPublicCoupon,
    applyPrivateCoupon,
    removeCoupon,
    showCart,
    setShowCart,
    productForOptions,
    setProductForOptions,
    addToCartWithOptions,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
