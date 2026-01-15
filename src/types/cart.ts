import { DeliveryOption } from "@/stores/useCartStore";
import { Combo } from "./combo";
import { Coupon } from "./coupon";
import { Product } from "./product";
import { CustomerAddress } from "./customer";

// --- Pricing Mode Definition ---
export type CartComboPricingMode = "FIXED" | "SLOT_PRICE" | "DISCOUNT";

export interface CartComboItemSnapshot {
  productId: string;
  productName: string;
  originalBasePrice: number;
  appliedItemPrice: number;
  additionalPrice: number;
  optionsTotal: number;
}

export interface CartComboSnapshot {
  mode: CartComboPricingMode;
  totalMarketPrice: number;
  totalFinalPrice: number;
  totalSavings: number;
  items: CartComboItemSnapshot[];
}

export interface CreateOrderItem_ItemSnapshot {
  id: string;
  name: string;
  basePrice: number;
  comboPrice: number;
  salePrice?: number;
  promotion: string | any;
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
  comboSnapshot?: CartComboSnapshot;
};

export interface GiftLineItem {
  id: string; // ID của item quà tặng
  name: string;
  itemType: "Product" | "Combo";
  quantity: number;
  price: number; // Thường là 0
  image?: string; // Có thể null nếu coupon không trả về ảnh
  sourceCouponCode: string; // Mã coupon tặng quà này
}

export type CartLine = (ProductCartLine | ComboCartLine) & {
  cartId: string;
  quantity: number;
  totalPrice: number;
  note: string;
  _image?: string;

  promotionWarning?: string;
};

export interface Surcharge {
  id: string;
  name: string;
  cost: number;
  description: string;
  isActive: boolean;
}

export interface CartState {
  cartItems: CartLine[];
  showCart: boolean;
  productForOptions: Product | null;
  comboForSelection: Combo | null;

  fulfillmentType: "delivery" | "pickup";

  deliveryOption: DeliveryOption;
  scheduledDate: string;
  scheduledTime: string;
  shippingFee: number;
  shippingDistance: number;
  selectedAddress: CustomerAddress | null;
  isCalculatingShip: boolean;
  surcharges: Surcharge[];
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
  fetchPublicCoupons: () => Promise<void>;
  applyPublicCoupon: (coupon: Coupon) => void;
  applyPrivateCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: (id: string) => void;
  setShowCart: (show: boolean) => void;
  setProductForOptions: (product: Product | null) => void;
  setComboForSelection: (combo: Combo | null) => void;

  setFulfillmentType: (type: "delivery" | "pickup") => void;
  
  setDeliveryOption: (option: DeliveryOption) => void;
  setScheduledDate: (date: string) => void;
  setScheduledTime: (time: string) => void;
  setShippingFee: (fee: number, distance?: number) => void;
  setSelectedAddress: (address: CustomerAddress | null) => Promise<void>;
  syncUserAddress: (user: any) => void;
  recalculateShippingFee: () => Promise<void>;
  fetchSurcharges: () => Promise<void>;
}
