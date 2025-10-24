// --- TYPE DEFINITIONS ---
export interface OptionItem {
  name: string;
  priceModifier: number;
  type: "fixed_amount" | "percentage";
  isActive: boolean;
  priority: number;
}

export interface OptionGroup {
  name: string;
  minOptions: number;
  maxOptions: number;
  priority: number;
  options: OptionItem[];
}

export interface Category {
  id: string;
  name: string;
  parent: string | null;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  category: string;
  isActive: boolean;
  priority: number;
  optionGroups?: OptionGroup[];
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  comboPrice: number;
  items: any[];
}

export interface PricePromotion {
  id: string;
  name: string;
  product?: Product | string;
  combo?: Combo | string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MenuItem extends Product {
  price: number;
  originalPrice?: number;
  image: string;
  type: "product" | "combo";
  discount?: PricePromotion | null;
  reviews: number;
  rating: string;
  sold?: number;
  timeLeft?: string;
}
