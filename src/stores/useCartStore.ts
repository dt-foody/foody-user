"use client";

import { useMemo, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { couponService } from "@/services";
import { orderService } from "@/services/order.service"; // Đảm bảo import đúng đường dẫn service
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
const CART_STORAGE_KEY = "foody_cart_v11"; // Tăng version để clear cache cũ
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

// Type cho Address (dựa trên schema User/Customer của bạn)
export interface Address {
  _id?: string;
  id?: string;
  label: string; // Nhà riêng, Công ty...
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

// 1. Phần dữ liệu cho Product
type ProductCartLine = {
  itemType: "Product";
  item: CreateOrderItem_ItemSnapshot;
  options: Record<string, CreateOrderItem_Option[]>;
  comboSelections: null;
};

// 2. Phần dữ liệu cho Combo
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
  deliveryOption: DeliveryOption;
  scheduledDate: string;

  // --- STATE MỚI CHO SHIP & ADDRESS ---
  shippingFee: number;
  shippingDistance: number;
  selectedAddress: Address | null; // Địa chỉ đang được chọn
  isCalculatingShip: boolean; // Trạng thái đang tính phí ship
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
  setDeliveryOption: (option: DeliveryOption) => void;
  setScheduledDate: (date: string) => void;

  // --- ACTION MỚI ---
  setShippingFee: (fee: number, distance?: number) => void;
  setSelectedAddress: (address: Address | null) => Promise<void>;
  syncUserAddress: (user: any) => void; // Tự động chọn địa chỉ mặc định khi user login
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

  // Khởi tạo phí ship & address
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

      setShippingFee: (fee, distance = 0) => {
        set({ shippingFee: fee, shippingDistance: distance });
      },

      // --- LOGIC MỚI: SET ADDRESS & AUTO CALCULATE SHIP ---
      setSelectedAddress: async (address) => {
        set({ selectedAddress: address });

        if (!address) {
          set({ shippingFee: DEFAULT_SHIPPING_FEE, shippingDistance: 0 });
          return;
        }

        // Nếu có tọa độ -> Gọi API tính ship
        if (address.location?.coordinates) {
          const [lng, lat] = address.location.coordinates;
          try {
            set({ isCalculatingShip: true });
            const res = await orderService.getShippingFee(lat, lng);
            set({
              shippingFee: res.shippingFee,
              shippingDistance: res.distance,
              isCalculatingShip: false,
            });
          } catch (error) {
            console.error("Failed to calculate shipping:", error);
            toast.error("Không thể tính phí vận chuyển cho địa chỉ này");
            // Fallback về phí mặc định
            set({
              isCalculatingShip: false,
              shippingFee: DEFAULT_SHIPPING_FEE,
              shippingDistance: 0,
            });
          }
        } else {
          // Địa chỉ cũ không có tọa độ
          set({ shippingFee: DEFAULT_SHIPPING_FEE, shippingDistance: 0 });
        }
      },

      syncUserAddress: (user) => {
        const { selectedAddress } = get();

        // Nếu user có danh sách địa chỉ
        if (user && user.addresses && user.addresses.length > 0) {
          // Tìm địa chỉ mặc định
          const defaultAddr =
            user.addresses.find((a: any) => a.isDefault) || user.addresses[0];

          // 1. Nếu chưa chọn địa chỉ nào -> Lấy mặc định
          if (!selectedAddress) {
            get().setSelectedAddress(defaultAddr);
            return;
          }

          // 2. Nếu đã chọn, kiểm tra xem địa chỉ đó có còn thuộc user này không (tránh case switch account)
          const exists = user.addresses.find(
            (a: any) =>
              a._id === selectedAddress._id || a.id === selectedAddress.id
          );
          if (!exists) {
            get().setSelectedAddress(defaultAddr);
          } else {
            // Nếu tồn tại, update lại thông tin mới nhất (vd: user vừa sửa tên/sđt địa chỉ đó)
            // Lưu ý: Nếu tọa độ không đổi thì không cần tính lại ship, nhưng ở đây gọi lại cho chắc hoặc chỉ update state
            if (JSON.stringify(exists) !== JSON.stringify(selectedAddress)) {
              get().setSelectedAddress(exists);
            }
          }
        } else {
          // User không có địa chỉ nào -> Reset
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
        selectedAddress: state.selectedAddress, // Persist địa chỉ
        shippingDistance: state.shippingDistance,
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
