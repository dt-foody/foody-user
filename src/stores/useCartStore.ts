"use client";

import { useMemo, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { couponService } from "@/services"; // Giả định service này tồn tại
import {
  Coupon,
  Product,
  Combo,
  // Import các kiểu dữ liệu Payload (quan trọng)
  CreateOrderItem_Option,
  CreateOrderItem_ComboSelection,
  CreateOrderItem_ItemSnapshot,
} from "@/types"; // Giả định các types này đã có trong @/types
import { checkCouponEligibility } from "@/utils/checkCouponEligibility"; // Giả định util này tồn tại

export const SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v8"; // Đổi key để reset cache cũ
const PUBLIC_COUPON_TTL_MS = 30_000;

// === Types ===
export type DeliveryOption = "immediate" | "scheduled";
interface UserData {
  isNew: boolean;
  age: number | null;
}
export interface EligibilityStatus {
  isEligible: boolean;
  reason: string | null;
}

// === Định nghĩa CartLine mới (Đồng bộ với types/order.ts) ===

// 1. Phần dữ liệu cho Product
type ProductCartLine = {
  itemType: "Product";
  item: CreateOrderItem_ItemSnapshot; // Snapshot của Product
  options: Record<string, CreateOrderItem_Option[]>; // Giữ cấu trúc Record
  comboSelections: null;
};

// 2. Phần dữ liệu cho Combo
type ComboCartLine = {
  itemType: "Combo";
  item: CreateOrderItem_ItemSnapshot; // Snapshot của Combo
  options: null;
  comboSelections: CreateOrderItem_ComboSelection[]; // Mảng các lựa chọn
};

/**
 * ======================================================================
 * NÂNG CẤP QUAN TRỌNG NHẤT: CartLine
 * ======================================================================
 * - `CartLine` là một "Discriminated Union" dựa trên itemType.
 * - Nó LƯU TRỮ dữ liệu chính xác như cấu trúc `CreateOrderItem` (payload API).
 */
export type CartLine = (ProductCartLine | ComboCartLine) & {
  cartId: string; // ID duy nhất cho biến thể (variant)
  quantity: number;
  totalPrice: number; // Giá CUỐI CÙNG của 1 item (đã tính options/combo)
  note: string;
  // Metadata để hiển thị UI (lấy từ product/combo gốc)
  _image?: string;
  _categoryIds?: string[];
};

/** ===== Cart state & actions ===== */
interface CartState {
  cartItems: CartLine[];
  showCart: boolean;
  publicCoupons: Coupon[];
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  publicCouponsFetchedAt: number;
  couponStatus: { isLoading: boolean; error: string | null };

  // NÂNG CẤP: Dùng 2 state riêng cho 2 modal
  productForOptions: Product | null;
  comboForSelection: Combo | null;

  currentUser: UserData;
  deliveryOption: DeliveryOption;
  scheduledDate: string;
}

interface CartActions {
  // NÂNG CẤP: Phân tách rõ ràng
  startProductConfiguration: (product: Product) => void;
  startComboConfiguration: (combo: Combo) => void;

  // NÂNG CẤP: Một hàm `addItemToCart` duy nhất
  // Nhận vào một item đã được modal cấu hình (chưa có quantity & cartId)
  addItemToCart: (itemData: Omit<CartLine, "cartId" | "quantity">) => void;

  updateQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;
  setShowCart: (show: boolean) => void;

  // NÂNG CẤP: Action cho 2 modal
  setProductForOptions: (product: Product | null) => void;
  setComboForSelection: (combo: Combo | null) => void;

  fetchPublicCoupons: () => Promise<void>;
  updateItemNote: (cartId: string, note: string) => void;
  removeItem: (cartId: string) => void;
  setDeliveryOption: (option: DeliveryOption) => void;
  setScheduledDate: (date: string) => void;
}

/**
 * ======================================================================
 * NÂNG CẤP QUAN TRỌNG: buildVariantKey
 * ======================================================================
 * - Xây dựng ID duy nhất cho một biến thể (variant).
 * - KHÔNG bao gồm "note".
 * - Tuần tự hóa (serialize) "options" cho Product.
 * - Tuần tự hóa (serialize) "comboSelections" cho Combo.
 */
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
        return `${key}:${selectedNames}`; // "Size:L", "Topping:Pudding,Trân châu"
      })
      .join("|");
    return `${baseId}::${optionSig}`; // "prod_123::Size:L|Topping:Pudding,Trân châu"
  }

  if (itemData.itemType === "Combo") {
    const selections = itemData.comboSelections || [];
    const selectionSig = selections
      .map((sel) => {
        // Tuần tự hóa options CỦA SẢN PHẨM CON (nếu có)
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

        // Gộp: slotName:productId[subOptions]
        return `${sel.slotName}:${sel.product.id}[${subOptionSig}]`;
      })
      .sort()
      .join("|");
    return `${baseId}::${selectionSig}`; // "combo_456::Đồ uống:prod_coca[Size:L]|Món ăn:prod_bap[]"
  }

  return baseId; // Fallback
};

/** ===== Initial state ===== */
const initialState: Omit<CartState, "currentUser"> = {
  cartItems: [],
  showCart: false,
  publicCoupons: [],
  appliedCoupons: [],
  isLoadingPublicCoupons: false,
  publicCouponsFetchedAt: 0,
  couponStatus: { isLoading: false, error: null },
  productForOptions: null,
  comboForSelection: null,
  deliveryOption: "immediate",
  scheduledDate: "",
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      // Dữ liệu User không nên persist cùng giỏ hàng
      currentUser: { isNew: true, age: 18 },

      // --- Actions đã được thiết kế lại ---

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

      /**
       * ======================================================================
       * NÂNG CẤP QUAN TRỌNG: addItemToCart (Hàm thêm hàng duy nhất)
       * ======================================================================
       */
      addItemToCart: (itemData) => {
        // 1. Tạo variant key (KHÔNG CÓ NOTE)
        const cartId = buildVariantKey(itemData);

        set((state) => {
          const exists = state.cartItems.find((i) => i.cartId === cartId);

          if (exists) {
            // 2. Nếu Đã có: Chỉ tăng số lượng
            // (Lưu ý: note của item mới sẽ bị bỏ qua, giữ note của item cũ)
            return {
              cartItems: state.cartItems.map((i) =>
                i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              productForOptions: null, // Đóng modal
              comboForSelection: null, // Đóng modal
              showCart: false, // Mở giỏ hàng
            };
          }

          // 3. Nếu Chưa có: Thêm item mới vào giỏ
          const newLine: any = {
            ...itemData,
            cartId: cartId,
            quantity: 1,
            note: itemData.note || "", // Đảm bảo note là string
          };

          return {
            cartItems: [...state.cartItems, newLine],
            productForOptions: null, // Đóng modal
            comboForSelection: null, // Đóng modal
            showCart: false, // Mở giỏ hàng
          };
        });
      },

      updateQuantity: (cartId, amount) => {
        set((state) => ({
          cartItems: state.cartItems
            .map((i) =>
              i.cartId === cartId ? { ...i, quantity: i.quantity + amount } : i
            )
            .filter((i) => i.quantity > 0), // Xóa nếu quantity <= 0
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

      // ... (Các hàm coupon và fetchPublicCoupons giữ nguyên từ code của bạn) ...

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

      fetchPublicCoupons: async () => {
        const { isLoadingPublicCoupons, publicCouponsFetchedAt } = get();
        if (isLoadingPublicCoupons) return;
        const now = Date.now();
        if (
          publicCouponsFetchedAt &&
          now - publicCouponsFetchedAt < PUBLIC_COUPON_TTL_MS
        ) {
          return;
        }
        try {
          set({ isLoadingPublicCoupons: true });
          const data = await couponService.getAvailables({});
          set({
            publicCoupons: data || [],
            isLoadingPublicCoupons: false,
            publicCouponsFetchedAt: now,
          });
        } catch (e) {
          console.error("Failed to fetch public coupons:", e);
          set({
            isLoadingPublicCoupons: false,
            publicCouponsFetchedAt: now,
          });
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist giỏ hàng
      partialize: (state) => ({
        cartItems: state.cartItems,
        appliedCoupons: state.appliedCoupons,
      }),
    }
  )
);

/** ===== Public hook (Không đổi) ===== */
// Hook này của bạn đã tốt (tính toán memoized), giữ nguyên
export function useCart() {
  const {
    cartItems,
    appliedCoupons,
    currentUser,
    publicCoupons,
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
    // @ts-ignore (Giả định cartItems có thể dùng cho checkCouponEligibility)
    const cartData = { items: cartItems, subtotal };
    return publicCoupons.map((coupon) => {
      // @ts-ignore
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
    deliveryOption,
    scheduledDate,
  };
}

/** ===== Initializer (Không đổi) ===== */
export function CartStoreInitializer() {
  const fetchPublicCoupons = useCartStore((s) => s.fetchPublicCoupons);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    fetchPublicCoupons();
  }, [fetchPublicCoupons]);

  return null;
}
