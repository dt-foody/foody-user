// src/utils/cartHelper.ts

export interface CartItemPrices {
  basePrice: number;              // Giá niêm yết ban đầu (85k)
  productPriceAfterPromo: number; // Giá sau giảm, chưa tính option (55k)
  optionsTotal: number;           // Tổng tiền phụ phí options (+5k)
  discountPercent: number;        // % giảm giá (35%)
  hasDiscount: boolean;
  savedAmountPerItem: number;     // Số tiền tiết kiệm được trên 1 sản phẩm (30k)
}

export const getCartItemPrices = (item: any): CartItemPrices => {
  // 1. Tính tổng tiền các options (Xử lý cho cả Product đơn lẻ và Combo)
  let optionsTotal = 0;
  if (item.itemType === "Product") {
    optionsTotal = Object.values(item.options || {})
      .flat()
      .reduce((sum: number, opt: any) => sum + (opt.priceModifier || 0), 0);
  } else if (item.itemType === "Combo") {
    item.comboSelections?.forEach((sel: any) => {
      optionsTotal += Object.values(sel.options || {})
        .flat()
        .reduce((sum: number, opt: any) => sum + (opt.priceModifier || 0), 0);
    });
  }

  // 2. Tính giá thực của sản phẩm sau giảm (Trừ đi option từ totalPrice)
  const productPriceAfterPromo = item.totalPrice - optionsTotal;
  
  // 3. Lấy giá niêm yết gốc
  const basePrice = item.item.basePrice || 0;
  
  // 4. Tính toán khuyến mãi
  const hasDiscount = basePrice > productPriceAfterPromo;
  const savedAmountPerItem = hasDiscount ? basePrice - productPriceAfterPromo : 0;
  const discountPercent = hasDiscount 
    ? Math.round((savedAmountPerItem / basePrice) * 100) 
    : 0;

  return {
    basePrice,
    productPriceAfterPromo,
    optionsTotal,
    discountPercent,
    hasDiscount,
    savedAmountPerItem
  };
};