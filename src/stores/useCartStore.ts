"use client";

import { useMemo, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { couponService } from "@/services";
import { orderService } from "@/services/order.service";
import {
  Coupon,
  Product,
  Combo,
  CreateOrderItem_Option,
  CreateOrderItem_ComboSelection,
  CreateOrderItem_ItemSnapshot,
} from "@/types";
import { checkCouponEligibility } from "@/utils/checkCouponEligibility";
import { toast } from "sonner";

// --- CONSTANTS & TYPES ---
const DEFAULT_SHIPPING_FEE = 15000;
const CART_STORAGE_KEY = "foody_cart_v12"; // Tăng version lên v12
const PUBLIC_COUPON_TTL_MS = 30_000;

export type DeliveryOption = "immediate" | "scheduled";

interface UserData {
  isNew: boolean;
  age: number | null;
}

export interface EligibilityStatus {
  isEligible: boolean;
  reason: string | null;
}

export interface Address {
  _id?: string;
  id?: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  fullAddress: string;
  isDefault: boolean;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
}

// 1. Product Data
type ProductCartLine = {
  itemType: "Product";
  item: CreateOrderItem_ItemSnapshot;
  options: Record<string, CreateOrderItem_Option[]>;
  comboSelections: null;
};

// 2. Combo Data
type ComboCartLine = {
  itemType: "Combo";
  item: CreateOrderItem_ItemSnapshot;
  options: null;
  comboSelections: CreateOrderItem_ComboSelection[];
};

export type CartLine = (ProductCartLine | ComboCartLine) & {
  cartId: string;
  quantity: number;
  totalPrice: number;
  note: string;
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

  productForOptions: Product | null;
  comboForSelection: Combo | null;

  currentUser: UserData;

  // --- Delivery Time State ---
  deliveryOption: DeliveryOption;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm [NEW]

  // --- Shipping & Address State ---
  shippingFee: number;
  shippingDistance: number;
  selectedAddress: Address | null;
  isCalculatingShip: boolean;
}

interface CartActions {
  startProductConfiguration: (product: Product) => void;
  startComboConfiguration: (combo: Combo) => void;
  addItemToCart: (itemData: Omit<CartLine, "cartId" | "quantity">) => void;
  updateQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;
  setShowCart: (show: boolean) => void;
  setProductForOptions: (product: Product | null) => void;
  setComboForSelection: (combo: Combo | null) => void;
  fetchPublicCoupons: () => Promise<void>;
  updateItemNote: (cartId: string, note: string) => void;
  removeItem: (cartId: string) => void;

  // --- Updated Actions ---
  setDeliveryOption: (option: DeliveryOption) => void;
  setScheduledDate: (date: string) => void;
  setScheduledTime: (time: string) => void; // [NEW]

  setShippingFee: (fee: number, distance?: number) => void;
  setSelectedAddress: (address: Address | null) => Promise<void>;
  syncUserAddress: (user: any) => void;

  // Tính lại ship dựa trên Option (Immediate/Scheduled)
  recalculateShippingFee: () => Promise<void>;
}

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
  scheduledTime: "", // [NEW]

  shippingFee: DEFAULT_SHIPPING_FEE,
  shippingDistance: 0,
  selectedAddress: null,
  isCalculatingShip: false,
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentUser: { isNew: true, age: 18 },

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
      setScheduledTime: (time) => set({ scheduledTime: time }), // [NEW]

      setShippingFee: (fee, distance = 0) => {
        set({ shippingFee: fee, shippingDistance: distance });
      },

      // [UPDATED] Tính lại phí ship có xét đến thời gian
      recalculateShippingFee: async () => {
        const {
          selectedAddress,
          deliveryOption,
          scheduledDate,
          scheduledTime,
        } = get();

        // 1. Kiểm tra địa chỉ
        if (!selectedAddress || !selectedAddress.location?.coordinates) {
          return;
        }
        const [lng, lat] = selectedAddress.location.coordinates;

        // 2. Xác định thời gian orderTime gửi lên backend
        let orderTime = new Date().toISOString(); // Mặc định là Now (cho Immediate)

        if (deliveryOption === "scheduled") {
          // Nếu user chọn hẹn giờ, phải có cả ngày và giờ mới tính
          if (scheduledDate && scheduledTime) {
            try {
              const combined = new Date(`${scheduledDate}T${scheduledTime}`);
              // Kiểm tra ngày hợp lệ
              if (!isNaN(combined.getTime())) {
                orderTime = combined.toISOString();
              }
            } catch (e) {
              console.warn("Invalid scheduled time, falling back to now");
            }
          }
          // Nếu chưa chọn đủ ngày giờ, có thể fallback về Now hoặc giữ phí ship cũ/mặc định.
          // Ở đây ta vẫn gọi API với Now để user có con số ước lượng trước.
        }

        try {
          set({ isCalculatingShip: true });
          // 3. Gọi API với orderTime
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
          // Khi chọn địa chỉ mới, gọi recalculate để dùng logic chung (tính time)
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
        const { appliedCoupons } = get();

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
      partialize: (state) => ({
        cartItems: state.cartItems,
        appliedCoupons: state.appliedCoupons,
        shippingFee: state.shippingFee,
        selectedAddress: state.selectedAddress,
        shippingDistance: state.shippingDistance,
        // Persist luôn các lựa chọn thời gian để refresh không mất
        deliveryOption: state.deliveryOption,
        scheduledDate: state.scheduledDate,
        scheduledTime: state.scheduledTime,
      }),
    }
  )
);

/** ===== Public hook ===== */
export function useCart() {
  const {
    cartItems,
    appliedCoupons,
    currentUser,
    publicCoupons,
    deliveryOption,
    scheduledDate,
    scheduledTime, // [NEW]
    shippingFee,
    shippingDistance,
    selectedAddress,
    isCalculatingShip,
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
    // @ts-ignore
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
    if (freeship) totalShippingDiscount = Math.min(shippingFee, freeship.value);

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
  }, [subtotal, appliedCoupons, shippingFee]);

  const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
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
    scheduledTime, // [NEW]
    originalShippingFee: shippingFee,
    shippingDistance,
    selectedAddress,
    isCalculatingShip,
  };
}

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
