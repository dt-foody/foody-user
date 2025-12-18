"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Plus, Tag } from "lucide-react";
import type { Combo, ComboSelectableProduct } from "@/types";
import { ComboPricingMode, DiscountType } from "@/types";
import { useCartStore } from "@/stores/useCartStore";
import { getImageUrl, handleImageError } from "@/utils/imageHelper";

interface ComboCardProps {
  combo: Combo;
  onClick: () => void;
}

export default function ComboCard({ combo, onClick }: ComboCardProps) {
  const { cartItems } = useCartStore();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const totalQuantity = cartItems
      .filter((item) => item.itemType === "Combo" && item.item.id === combo.id)
      .reduce((sum, currentItem) => sum + currentItem.quantity, 0);

    setQuantity(totalQuantity);
  }, [cartItems, combo.id]);

  const getEffectivePriceForSorting = (
    item: ComboSelectableProduct,
    mode: ComboPricingMode
  ) => {
    if (mode === ComboPricingMode.SLOT_PRICE) {
      return item.slotPrice + item.additionalPrice;
    }
    return item.product.basePrice + item.additionalPrice;
  };

  const { displayPrice, originalPrice, hasDiscount, discountLabel } =
    useMemo(() => {
      let minBaseCalc = 0; // Giá nền tảng để tính giảm giá
      let minMarketPrice = 0; // Tổng giá lẻ (basePrice) của các món product
      let minSurcharges = 0; // Tổng phụ thu

      if (combo.pricingMode === ComboPricingMode.FIXED) {
        minBaseCalc = combo.comboPrice;
      }

      combo.items.forEach((slot) => {
        if (slot.minSelection > 0) {
          const sortedProducts = [...slot.selectableProducts].sort((a, b) => {
            const priceA = getEffectivePriceForSorting(a, combo.pricingMode);
            const priceB = getEffectivePriceForSorting(b, combo.pricingMode);
            return priceA - priceB;
          });

          const selectedCheapest = sortedProducts.slice(0, slot.minSelection);

          selectedCheapest.forEach((prod) => {
            minSurcharges += prod.additionalPrice;
            minMarketPrice += prod.product.basePrice;

            if (combo.pricingMode === ComboPricingMode.SLOT_PRICE) {
              minBaseCalc += prod.slotPrice;
            } else if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
              minBaseCalc += prod.product.basePrice;
            }
          });
        }
      });

      // 1. Áp dụng Giảm giá nội bộ (Internal Discount)
      let priceAfterInternal = minBaseCalc;
      if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
        if (combo.discountType === DiscountType.PERCENT) {
          priceAfterInternal = minBaseCalc * (1 - combo.discountValue / 100);
        } else if (combo.discountType === DiscountType.AMOUNT) {
          priceAfterInternal = Math.max(0, minBaseCalc - combo.discountValue);
        }
      }

      // 2. Tổng giá trước khi có Promotion ngoài
      let finalPriceBeforePromo = priceAfterInternal + minSurcharges;
      let finalPrice = finalPriceBeforePromo;

      // 3. Áp dụng Khuyến mãi ngoài (External Promotion) lên TOÀN BỘ GIÁ (bao gồm phụ thu)
      if (combo.promotion && combo.promotion.isActive !== false) {
        const promoValue = combo.promotion.discountValue || 0;
        const promoType = combo.promotion.discountType?.toLowerCase();

        if (promoType === "percentage" || promoType === "percent") {
          finalPrice = finalPriceBeforePromo * (1 - promoValue / 100);
        } else if (promoType === "fixed_amount" || promoType === "amount") {
          finalPrice = Math.max(0, finalPriceBeforePromo - promoValue);
        }
      }
      // Fallback salePrice
      else if (
        combo.pricingMode === ComboPricingMode.FIXED &&
        combo.salePrice &&
        combo.salePrice < combo.comboPrice
      ) {
        finalPrice = combo.salePrice + minSurcharges;
      }

      // 4. LOGIC HIỂN THỊ TAG (VERIFIED)
      let label = null;
      const totalMarketPrice = minMarketPrice + minSurcharges;

      if (
        combo.pricingMode === ComboPricingMode.DISCOUNT &&
        combo.discountValue > 0
      ) {
        // Với DISCOUNT: Hiện tag theo đúng loại (AMOUNT hoặc PERCENT)
        if (combo.discountType === DiscountType.PERCENT) {
          label = `-${combo.discountValue}%`;
        } else {
          label = `-${Math.round(combo.discountValue / 1000)}k`;
        }
      } else {
        // FIXED & SLOT_PRICE: So sánh giá cuối cùng với tổng giá lẻ thị trường
        const savings = totalMarketPrice - finalPrice;
        if (savings > 0) {
          label = `-${Math.round(savings / 1000)}k`;
        }
      }

      return {
        displayPrice: finalPrice,
        originalPrice: totalMarketPrice,
        hasDiscount: finalPrice < totalMarketPrice - 100, // Sai số nhỏ để tránh hiện gạch giá khi chênh lệch không đáng kể
        discountLabel: label,
      };
    }, [combo]);

  const fmt = (n: number) => Math.round(n).toLocaleString("vi-VN") + "đ";

  const isFixedPure =
    combo.pricingMode === ComboPricingMode.FIXED &&
    !combo.items.some((i) =>
      i.selectableProducts.some((p) => p.additionalPrice > 0)
    );
  const prefix = isFixedPure ? "" : "Chỉ từ ";

  return (
    <div className="group flex flex-row items-start gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-primary-500 transition-all duration-200 cursor-pointer relative overflow-hidden h-full">
      {/* Hình ảnh */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={getImageUrl(combo.image)}
          alt={combo.name}
          fill
          sizes="(max-width: 768px) 100px, 150px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        {discountLabel && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm">
            {discountLabel}
          </div>
        )}
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-col justify-between flex-grow w-full min-h-[6rem] sm:min-h-[7rem]">
        <div className="h-[82px]">
          <h3 className="text-sm font-bold text-gray-800 mb-2 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {combo.name}
          </h3>

          {combo.description && (
            <p className="text-xs text-gray-500 mb-1 line-clamp-2">
              {combo.description}
            </p>
          )}

          {/* Giá hiển thị */}
          <div className="flex flex-col items-start">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-primary-600">
                {prefix}
                {fmt(displayPrice)}
              </span>

              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through decoration-gray-400">
                  {fmt(originalPrice)}
                </span>
              )}
            </div>

            {combo.promotion && combo.promotion.isActive !== false && (
              <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md">
                <Tag className="w-3 h-3 fill-orange-600" />
                <span className="truncate max-w-[100px] sm:max-w-[120px]">
                  {combo.promotion.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nút bấm */}
        <div className="flex items-center justify-end mt-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              disabled={true}
              className="w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors text-gray-300 cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              readOnly
              className="w-16 h-9 text-center border-x border-gray-300 focus:outline-none"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="w-9 h-9 flex items-center justify-center text-lg font-bold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
