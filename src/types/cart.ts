import { DeliveryOption } from "@/stores/useCartStore";
import { Combo } from "./combo";
import { Coupon } from "./coupon";
import { Product } from "./product";
import { CustomerAddress } from "./customer";

/**
 * Snapshot của một mục Product / Combo
 */
export interface CreateOrderItem_ItemSnapshot {
  id: string;
  name: string;
  basePrice: number;
  comboPrice: number;
  salePrice?: number;
  promotion: string | "";
}

/**
 * Snapshot của một TÙY CHỌN
 */
export interface CreateOrderItem_Option {
  name: string;             // "L"
  priceModifier: number;    // "+5000 VND"
}

/**
 * Snapshot của một LỰA CHỌN TRONG COMBO (VD: chọn "Coca" cho slot "Đồ uống")
 */
export interface CreateOrderItem_ComboSelection {
  slotName: string;
  product: {
    id: string;
    name: string;
    basePrice: number;
  };
  // Tùy chọn cho sản phẩm con đó (VD: Coca Size L)
  options: Record<string, CreateOrderItem_Option[]>;
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

export interface CartState {
  cartItems: CartLine[];
  showCart: boolean;

  productForOptions: Product | null;
  comboForSelection: Combo | null;

  // --- Delivery Time State ---
  deliveryOption: DeliveryOption;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm [NEW]

  // --- Shipping State ---
  shippingFee: number;
  shippingDistance: number;
  selectedAddress: CustomerAddress | null;
  isCalculatingShip: boolean;

  // --- Coupon ---
  publicCoupons: Coupon[];
  appliedCoupons: Coupon[];
  isLoadingPublicCoupons: boolean;
  publicCouponsFetchedAt: number;
  couponStatus: { isLoading: boolean; error: string | null };
}

export interface CartActions {
  startProductConfiguration: (product: Product) => void;
  startComboConfiguration: (combo: Combo) => void;

  
  addItemToCart: (itemData: Omit<CartLine, "cartId" | "quantity">) => void;
  removeItem: (cartId: string) => void;
  updateItemNote: (cartId: string, note: string) => void;
  updateQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;

  // --- Coupon ---
  fetchPublicCoupons: () => Promise<void>;
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;

  setShowCart: (show: boolean) => void;
  setProductForOptions: (product: Product | null) => void;
  setComboForSelection: (combo: Combo | null) => void;

  // --- Delivery Actions ---
  setDeliveryOption: (option: DeliveryOption) => void;
  setScheduledDate: (date: string) => void;
  setScheduledTime: (time: string) => void;

  // --- Shipping Actions ---
  setShippingFee: (fee: number, distance?: number) => void;
  setSelectedAddress: (address: CustomerAddress | null) => Promise<void>;
  syncUserAddress: (user: any) => void;

  // Tính lại ship dựa trên Option (Immediate/Scheduled)
  recalculateShippingFee: () => Promise<void>;
}
