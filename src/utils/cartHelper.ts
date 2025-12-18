// src/utils/cartHelper.ts

export interface CartItemPrices {
  basePrice: number;            // Giá gốc chưa giảm (80k)
  productPriceAfterPromo: number; // Giá sản phẩm sau giảm, chưa option (55k)
  optionsTotal: number;         // Tổng tiền option (+5k)
  discountPercent: number;      // % giảm giá (31%)
  hasDiscount: boolean;         // Có đang giảm giá không
}

export const getCartItemPrices = (item: any): CartItemPrices => {
  // 1. Lấy giá niêm yết từ snapshot
  const basePrice = item.item.basePrice || 0;

  // 2. Tính tổng tiền các options (topping/size)
  const optionsTotal = Object.values(item.options || {})
    .flat()
    .reduce((sum: number, opt: any) => sum + (opt.priceModifier || 0), 0);

  // 3. Giá thực của sản phẩm sau giảm (trừ đi phần option)
  // Công thức: totalPrice (đã có option) - optionsTotal = giá máy tính đã áp promo
  const productPriceAfterPromo = item.totalPrice - optionsTotal;

  // 4. Tính % giảm giá
  const hasDiscount = basePrice > productPriceAfterPromo;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - productPriceAfterPromo) / basePrice) * 100)
    : 0;

  return {
    basePrice,
    productPriceAfterPromo,
    optionsTotal,
    discountPercent,
    hasDiscount,
  };
};