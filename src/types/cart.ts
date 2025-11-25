import { DeliveryOption } from "@/stores/useCartStore";
import { Combo } from "./combo";
import { Coupon } from "./coupon";
import { Product } from "./product";
import { CustomerAddress } from "./customer";

// --- Pricing Mode Definition ---
export type CartComboPricingMode = "FIXED" | "SLOT_PRICE" | "DISCOUNT";

/**
 * Snapshot chi tiết của từng món con trong Combo
 */
export interface CartComboItemSnapshot {
  productId: string;
  productName: string;

  // Giá thị trường của món này (Product Base Price) - dùng để so sánh tiết kiệm
  originalBasePrice: number;

  // Giá tính trong combo (VD: Slot Price hoặc Giá sau chiết khấu)
  appliedItemPrice: number;

  // Phụ thu riêng của món này (Additional Price)
  surcharge: number;

  // Tổng tiền options của món này
  optionsTotal: number;
}

/**
 * Snapshot tổng thể của Combo
 * Lưu lại để không phải tính lại ở Cart/Checkout
 */
export interface CartComboSnapshot {
  mode: CartComboPricingMode;

  // Tổng giá trị thực tế nếu mua lẻ (Tổng Base các món + Tổng Phụ thu + Tổng Options)
  totalMarketPrice: number;

  // Tổng giá khách phải trả (Final Price)
  totalFinalPrice: number;

  // Tổng tiết kiệm được
  totalSavings: number;

  // Danh sách chi tiết từng món để render
  items: CartComboItemSnapshot[];
}

export interface CreateOrderItem_ItemSnapshot {
  id: string;
  name: string;
  basePrice: number; // Giá gốc sản phẩm lẻ
  comboPrice: number; // Giá combo gốc (nếu là combo)
  salePrice?: number;
  promotion: string | "";
}

export interface CreateOrderItem_Option {
  name: string;
  priceModifier: number;
}

export interface CreateOrderItem_ComboSelection {
  slotName: string;
  product: {
    id: string;
    name: string;
    basePrice: number;
  };
  additionalPrice: number;
  options: Record<string, CreateOrderItem_Option[]>;
  // Field này giữ lại để tương thích ngược nếu cần, nhưng logic chính sẽ dùng snapshot
  itemPrice: number;
}

// 1. Product Data
type ProductCartLine = {
  itemType: "Product";
  item: CreateOrderItem_ItemSnapshot;
  options: Record<string, CreateOrderItem_Option[]>;
  comboSelections: null;
  comboSnapshot: null;
};

// 2. Combo Data
type ComboCartLine = {
  itemType: "Combo";
  item: CreateOrderItem_ItemSnapshot;
  options: null;
  comboSelections: CreateOrderItem_ComboSelection[];

  // --- QUAN TRỌNG: Dấu ? giúp tránh lỗi 'never' khi check tồn tại ---
  comboSnapshot?: CartComboSnapshot;
};

export type CartLine = (ProductCartLine | ComboCartLine) & {
  cartId: string;
  quantity: number;
  totalPrice: number; // Đơn giá cuối cùng của 1 item (đã bao gồm tất cả)
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
  scheduledDate: string;
  scheduledTime: string;

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
