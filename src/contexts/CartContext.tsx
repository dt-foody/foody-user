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
interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: "discount_code" | "freeship" | "gift";
  value: number;
  valueType: "percentage" | "fixed";
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  visibility: "public" | "private";
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
  publicCoupons: Coupon[];
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  couponStatus: { isLoading: boolean; error: string | null };
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (code: string) => void;
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

// --- CONSTANTS ---
export const SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v5";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // === STATE MANAGEMENT ===
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [isLoadingPublicCoupons, setIsLoadingPublicCoupons] = useState(true);
  const [couponStatus, setCouponStatus] = useState({ isLoading: false, error: null as string | null });

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
        const response = await fetch(`${API_URL}/public/coupons`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPublicCoupons(data.results || []);
      } catch (error) {
        console.error("Failed to fetch public coupons:", error);
      } finally {
        setIsLoadingPublicCoupons(false);
      }
    };
    fetchPublicCoupons();
  }, []);

  // === CART FUNCTIONS ===
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0), [cartItems]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

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
        { ...item, cartId: item.id, quantity: 1, totalPrice: item.price },
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

  // === COUPON FUNCTIONS ===
  const applyPublicCoupon = useCallback((coupon: Coupon) => {
    setCouponStatus({ isLoading: false, error: null });
    if (appliedCoupons.some(c => c.code === coupon.code)) {
      setCouponStatus({ isLoading: false, error: "Mã này đã được áp dụng." });
      return;
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      setCouponStatus({ isLoading: false, error: "Chưa đạt giá trị đơn hàng tối thiểu." });
      return;
    }
    if (coupon.type === 'freeship' && appliedCoupons.some(c => c.type === 'freeship')) {
      setCouponStatus({ isLoading: false, error: "Chỉ được áp dụng 1 mã miễn phí vận chuyển." });
      return;
    }
    setAppliedCoupons(prev => [...prev, coupon]);
  }, [appliedCoupons, subtotal]);

  const applyPrivateCoupon = useCallback(async (code: string) => {
    setCouponStatus({ isLoading: true, error: null });
    
    if (appliedCoupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      const msg = "Mã này đã được áp dụng.";
      setCouponStatus({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }

    try {
      const response = await fetch(`${API_URL}/coupons/validate?code=${code}&orderValue=${subtotal}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const validatedCoupon: Coupon = await response.json();

      if (validatedCoupon.type === 'freeship' && appliedCoupons.some(c => c.type === 'freeship')) {
        const msg = "Chỉ được áp dụng 1 mã miễn phí vận chuyển.";
        setCouponStatus({ isLoading: false, error: msg });
        return { success: false, message: msg };
      }

      setAppliedCoupons(prev => [...prev, validatedCoupon]);
      setCouponStatus({ isLoading: false, error: null });
      return { success: true, message: "Áp dụng thành công!" };

    } catch (error: any) {
      const message = error.message || "Mã không hợp lệ hoặc đã hết hạn.";
      setCouponStatus({ isLoading: false, error: message });
      return { success: false, message };
    }
  }, [subtotal, appliedCoupons]);

  const removeCoupon = useCallback((code: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.code !== code));
  }, []);
  
  // === DISCOUNT CALCULATION ===
  const { itemDiscount, shippingDiscount } = useMemo(() => {
    let totalItemDiscount = 0;
    let totalShippingDiscount = 0;
    let currentSubtotal = subtotal;

    const shippingCoupon = appliedCoupons.find(c => c.type === 'freeship');
    if (shippingCoupon) {
      totalShippingDiscount = Math.min(SHIPPING_FEE, shippingCoupon.value);
    }
    
    const discountCoupons = appliedCoupons
      .filter(c => c.type === 'discount_code')
      .sort((a, b) => (a.valueType === 'percentage' ? -1 : 1));

    for (const coupon of discountCoupons) {
      if (currentSubtotal <= 0) break;

      let discount = 0;
      if (coupon.valueType === 'percentage') {
        discount = currentSubtotal * (coupon.value / 100);
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      } else {
        discount = coupon.value;
      }
      
      discount = Math.min(discount, currentSubtotal);
      totalItemDiscount += discount;
      currentSubtotal -= discount;
    }

    return { itemDiscount: totalItemDiscount, shippingDiscount: totalShippingDiscount };
  }, [subtotal, appliedCoupons]);
  
  const finalShippingFee = useMemo(() => Math.max(0, SHIPPING_FEE - shippingDiscount), [shippingDiscount]);
  const finalTotal = useMemo(() => Math.max(0, subtotal - itemDiscount + finalShippingFee), [subtotal, itemDiscount, finalShippingFee]);

  const value: CartContextType = {
    cartItems, cartCount, addToCart, updateQuantity, clearCart,
    subtotal, finalShippingFee, itemDiscount, shippingDiscount, finalTotal,
    publicCoupons, appliedCoupons, isLoadingPublicCoupons, couponStatus,
    applyPublicCoupon, applyPrivateCoupon, removeCoupon,
    showCart, setShowCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}