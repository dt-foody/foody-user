"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

// Cấu hình base URL cho API
const API_URL = "http://localhost:3000/v1";

// --- TYPE DEFINITION (Khớp với API response của bạn) ---
// Cấu trúc cho 'conditions' (dựa trên Syncfusion Query Builder)
interface Condition {
  id: string;
  fieldId: string; // 'category_id', 'customer_is_new', 'customer_age', etc.
  operator: string; // 'IN', 'EQUALS', etc.
  value: any;
}

interface ConditionGroup {
  id: string;
  operator: "AND" | "OR";
  conditions: (Condition | ConditionGroup)[];
}

// Cập nhật interface Coupon để khớp với dữ liệu MongoDB
export interface Coupon {
  id: string; // <-- Dùng id
  name: string;
  code: string;
  description: string;
  type: "discount_code" | "freeship" | "gift";
  value: number;
  valueType: "percentage" | "fixed";
  maxDiscountAmount?: number;
  minOrderAmount?: number; // <-- Thêm
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  public: boolean;
  claimable: boolean;
  autoApply: boolean;
  stackable: boolean;
  conditions: ConditionGroup | null; // <-- Thêm
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  startDate: string; // ISODate
  endDate: string; // ISODate
}

// Dữ liệu User (để check điều kiện)
interface UserData {
  isNew: boolean;
  age: number | null;
}

// Trạng thái hợp lệ của coupon
export interface EligibilityStatus {
  isEligible: boolean;
  reason: string | null; // Lý do tại sao không hợp lệ
}

// --- CART CONTEXT INTERFACE ---
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
  publicCoupons: Coupon[]; // Danh sách gốc từ API
  publicCouponStatuses: (EligibilityStatus & { coupon: Coupon })[]; // <-- MỚI: Danh sách đã qua kiểm tra
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  couponStatus: { isLoading: boolean; error: string | null };
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void; // <-- Đổi sang id
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

// --- CONSTANTS ---
export const SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v5";

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- COUPON ELIGIBILITY SERVICE (BỘ NÃO CHECK COUPON) ---
interface CartData {
  items: any[];
  subtotal: number;
}

const checkCouponEligibility = (
  coupon: Coupon,
  cart: CartData,
  user: UserData
): EligibilityStatus => {
  // 1. Kiểm tra minOrderAmount
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return {
      isEligible: false,
      reason: `Cần mua thêm ${(
        coupon.minOrderAmount - cart.subtotal
      ).toLocaleString("vi-VN")}đ`,
    };
  }

  // 2. Kiểm tra 'conditions'
  if (coupon.conditions && coupon.conditions.conditions.length > 0) {
    // Giả sử logic gốc luôn là AND (dựa trên mẫu 'root' 'AND')
    for (const condition of coupon.conditions.conditions) {
      // Chỉ xử lý 'Condition', bỏ qua 'ConditionGroup' lồng nhau cho đơn giản
      if ("fieldId" in condition) {
        const { fieldId, operator, value } = condition;

        switch (fieldId) {
          case "category_id":
            // Yêu cầu: "Ít nhất 1 sản phẩm trong giỏ hàng phải thuộc danh mục trong 'value'"
            if (operator === "IN") {
              // Giả định item trong giỏ hàng có 'categoryIds: string[]'
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
                  reason:
                    "Cần có sản phẩm thuộc danh mục yêu cầu (ví dụ: Pizza)",
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

  // Nếu qua tất cả kiểm tra
  return { isEligible: true, reason: null };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // === STATE MANAGEMENT ===
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [isLoadingPublicCoupons, setIsLoadingPublicCoupons] = useState(true);
  const [couponStatus, setCouponStatus] = useState({
    isLoading: false,
    error: null as string | null,
  });

  // --- SIMULATED USER DATA (Lấy từ AuthContext của bạn) ---
  // !! Thay đổi các giá trị này để test
  const [currentUser, setCurrentUser] = useState<UserData>({
    isNew: true, // <-- Đổi thành true để test coupon 'NEWUSER'
    age: 18, // <-- Đổi thành 18 để test coupon 'TEEN18'
  });

  // === EFFECTS ===
  useEffect(() => {
    const s = localStorage.getItem(CART_STORAGE_KEY);
    if (s) setCartItems(JSON.parse(s));
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        setIsLoadingPublicCoupons(true);
        // API này gọi hàm `available` của bạn
        const response = await fetch(`${API_URL}/public/coupons/available`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Giả sử API trả về mảng coupons (dựa trên code backend của bạn)
        setPublicCoupons(data.coupons || data || []); // data.coupons hoặc data
      } catch (error) {
        console.error("Failed to fetch public coupons:", error);
      } finally {
        setIsLoadingPublicCoupons(false);
      }
    };
    fetchPublicCoupons();
  }, []);

  // === CART FUNCTIONS ===
  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
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
          categoryIds: item.categoryIds || [], // *** QUAN TRỌNG: Lấy categoryIds của sản phẩm
        },
      ];
    });
    setShowCart(true);
  }, []);

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

  // *** MỚI: Tính toán trạng thái của Public Coupons ***
  const publicCouponStatuses = useMemo(() => {
    const cartData: CartData = { items: cartItems, subtotal };
    return publicCoupons.map((coupon) => {
      const status = checkCouponEligibility(coupon, cartData, currentUser);
      return { coupon, ...status };
    });
  }, [publicCoupons, cartItems, subtotal, currentUser]);

  // === COUPON FUNCTIONS ===
  const applyPublicCoupon = useCallback(
    (coupon: Coupon) => {
      setCouponStatus({ isLoading: false, error: null });

      // Nếu coupon đã được áp dụng, không làm gì cả (logic này sẽ do handleToggle xử lý)
      if (appliedCoupons.some((c) => c.id === coupon.id)) {
        return;
      }

      // *** NÂNG CẤP LOGIC STACKING ***
      setAppliedCoupons((prev) => {
        // Lọc ra các coupon không liên quan
        const otherCoupons = prev.filter((c) => c.id !== coupon.id);

        // 1. Nếu coupon mới là 'freeship'
        if (coupon.type === "freeship") {
          // Xóa tất cả các mã 'freeship' khác
          const nonFreeship = otherCoupons.filter((c) => c.type !== "freeship");
          return [...nonFreeship, coupon];
        }

        // 2. Nếu coupon mới là 'discount_code'
        if (coupon.type === "discount_code") {
          // Xóa tất cả các mã 'discount_code' khác (vì stackable: false)
          const nonDiscount = otherCoupons.filter(
            (c) => c.type !== "discount_code"
          );
          return [...nonDiscount, coupon];
        }

        // 3. Mặc định cho các loại khác (ví dụ: 'gift')
        return [...otherCoupons, coupon];
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
        // Endpoint này nên là endpoint 'validate' hoặc 'apply'
        // Nó cần kiểm tra tất cả logic (cả private, user, v.v.)
        const response = await fetch(
          `${API_URL}/coupons/validate?code=${code}&orderValue=${subtotal}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const validatedCoupon: Coupon = await response.json();

        // Kiểm tra lại luật stacking sau khi backend trả về
        if (
          validatedCoupon.type === "freeship" &&
          appliedCoupons.some((c) => c.type === "freeship")
        ) {
          // Tự động thay thế
          setAppliedCoupons((prev) => [
            ...prev.filter((c) => c.type !== "freeship"),
            validatedCoupon,
          ]);
        } else if (validatedCoupon.type === "discount_code") {
          // Tự động thay thế
          setAppliedCoupons((prev) => [
            ...prev.filter((c) => c.type !== "discount_code"),
            validatedCoupon,
          ]);
        } else {
          setAppliedCoupons((prev) => [...prev, validatedCoupon]);
        }

        setCouponStatus({ isLoading: false, error: null });
        return { success: true, message: "Áp dụng thành công!" };
      } catch (error: any) {
        const message = error.message || "Mã không hợp lệ hoặc đã hết hạn.";
        setCouponStatus({ isLoading: false, error: message });
        return { success: false, message };
      }
    },
    [subtotal, appliedCoupons]
  );

  // Đổi sang dùng id
  const removeCoupon = useCallback((id: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // === DISCOUNT CALCULATION (Logic cũ của bạn đã ổn) ===
  const { itemDiscount, shippingDiscount } = useMemo(() => {
    let totalItemDiscount = 0;
    let totalShippingDiscount = 0;
    let currentSubtotal = subtotal;

    const shippingCoupon = appliedCoupons.find((c) => c.type === "freeship");
    if (shippingCoupon) {
      // Giả sử value của freeship là số tiền giảm (ví dụ 30000)
      totalShippingDiscount = Math.min(SHIPPING_FEE, shippingCoupon.value);
    }

    const discountCoupons = appliedCoupons
      .filter((c) => c.type === "discount_code")
      .sort((a, b) => (a.valueType === "percentage" ? -1 : 1)); // Ưu tiên %

    for (const coupon of discountCoupons) {
      if (currentSubtotal <= 0) break;

      let discount = 0;
      if (coupon.valueType === "percentage") {
        discount = currentSubtotal * (coupon.value / 100);
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      } else {
        discount = coupon.value; // valueType 'fixed'
      }

      discount = Math.min(discount, currentSubtotal);
      totalItemDiscount += discount;
      currentSubtotal -= discount; // Giảm subtotal cho coupon sau
    }

    return {
      itemDiscount: totalItemDiscount,
      shippingDiscount: totalShippingDiscount,
    };
  }, [subtotal, appliedCoupons]);

  const finalShippingFee = useMemo(
    () => Math.max(0, SHIPPING_FEE - shippingDiscount),
    [shippingDiscount]
  );
  const finalTotal = useMemo(
    () => Math.max(0, subtotal - itemDiscount + finalShippingFee),
    [subtotal, itemDiscount, finalShippingFee]
  );

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
    publicCouponStatuses, // <-- MỚI
    appliedCoupons,
    isLoadingPublicCoupons,
    couponStatus,
    applyPublicCoupon,
    applyPrivateCoupon,
    removeCoupon,
    showCart,
    setShowCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
