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

  // --- LOGIC TÍNH TỔNG SỐ LƯỢNG COMBO TRONG GIỎ ---
  useEffect(() => {
    const totalQuantity = cartItems
      .filter((item) => item.itemType === "Combo" && item.item.id === combo.id)
      .reduce((sum, currentItem) => sum + currentItem.quantity, 0);

    setQuantity(totalQuantity);
  }, [cartItems, combo.id]);

  // Helper để sort tìm món rẻ nhất
  const getEffectivePriceForSorting = (
    item: ComboSelectableProduct,
    mode: ComboPricingMode
  ) => {
    // Chúng ta muốn tìm món làm cho TỔNG GIÁ CUỐI CÙNG thấp nhất
    // Tổng = (Giá tham chiếu * hệ số giảm) + Phụ thu

    if (mode === ComboPricingMode.SLOT_PRICE) {
      return item.slotPrice + item.additionalPrice;
    }
    if (mode === ComboPricingMode.DISCOUNT) {
      // Vì basePrice sẽ được giảm giá, nên trọng số của nó thấp hơn phụ thu (phụ thu ko được giảm)
      // Tuy nhiên để đơn giản, ta cứ sort theo tổng
      return item.product.basePrice + item.additionalPrice;
    }
    // FIXED: Chỉ quan tâm phụ thu vì giá base cố định
    return item.additionalPrice;
  };

  // --- LOGIC TÍNH GIÁ ĐỒNG NHẤT VỚI MODAL ---
  const { displayPrice, originalPrice, hasDiscount } = useMemo(() => {
    // 1. Tính toán chi phí cơ bản thấp nhất (Min Base Calc) & Phụ thu thấp nhất
    let minBaseCalc = 0;
    let minSurcharges = 0;

    // Nếu là FIXED, giá gốc chính là giá niêm yết
    if (combo.pricingMode === ComboPricingMode.FIXED) {
      minBaseCalc = combo.comboPrice;
    }

    // Duyệt qua các slot để tìm món rẻ nhất cho các slot bắt buộc
    combo.items.forEach((slot) => {
      if (slot.minSelection > 0) {
        // Sắp xếp sản phẩm trong slot để tìm ra phương án rẻ nhất
        // Tiêu chí rẻ nhất phụ thuộc vào mode
        const sortedProducts = [...slot.selectableProducts].sort((a, b) => {
          const priceA = getEffectivePriceForSorting(a, combo.pricingMode);
          const priceB = getEffectivePriceForSorting(b, combo.pricingMode);
          return priceA - priceB;
        });

        // Lấy đúng số lượng minSelection món rẻ nhất
        const selectedCheapest = sortedProducts.slice(0, slot.minSelection);

        selectedCheapest.forEach((prod) => {
          minSurcharges += prod.additionalPrice; // Luôn cộng phụ thu

          if (combo.pricingMode === ComboPricingMode.SLOT_PRICE) {
            minBaseCalc += prod.slotPrice;
          } else if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
            minBaseCalc += prod.product.basePrice;
          }
          // Mode FIXED không cộng giá món vào minBaseCalc (vì đã set cứng ở trên)
        });
      }
    });

    // 2. Áp dụng Giảm giá nội bộ (Internal Discount)
    let priceAfterInternal = minBaseCalc;
    if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
      if (combo.discountType === DiscountType.PERCENT) {
        priceAfterInternal = minBaseCalc * (1 - combo.discountValue / 100);
      } else if (combo.discountType === DiscountType.AMOUNT) {
        priceAfterInternal = Math.max(0, minBaseCalc - combo.discountValue);
      }
    }

    // 3. Áp dụng Khuyến mãi ngoài (External Promotion)
    let finalBasePrice = priceAfterInternal;
    if (combo.promotion && combo.promotion.isActive !== false) {
      const promoValue = combo.promotion.discountValue || 0;
      const promoType = combo.promotion.discountType?.toLowerCase();

      if (promoType === "percentage" || promoType === "percent") {
        finalBasePrice = priceAfterInternal * (1 - promoValue / 100);
      } else if (promoType === "fixed_amount" || promoType === "amount") {
        finalBasePrice = Math.max(0, priceAfterInternal - promoValue);
      }
    }

    // Fallback cho trường hợp salePrice cũ (legacy)
    else if (
      combo.pricingMode === ComboPricingMode.FIXED &&
      combo.salePrice != null &&
      combo.salePrice < combo.comboPrice
    ) {
      finalBasePrice = combo.salePrice;
    }

    // 4. Tổng kết
    const finalPrice = finalBasePrice + minSurcharges; // Cộng phụ thu sau cùng

    // Tính giá gốc (để gạch đi nếu có giảm giá)
    // Giá gốc hiển thị = (Base Calc thực tế của các món) + Phụ thu
    let calculatedOriginal = 0;
    if (combo.pricingMode === ComboPricingMode.FIXED) {
      // Với Fixed, giá gốc thường là tổng giá trị thực của các món bên trong (nếu mua lẻ)
      // Nhưng ở đây hiển thị đơn giản là comboPrice nếu không có tham chiếu khác
      // Hoặc có thể tính tổng basePrice của các món minSelection
      calculatedOriginal = combo.comboPrice + minSurcharges;
    } else {
      // Slot Price & Discount: Giá gốc là tổng basePrice (hoặc slotPrice) chưa giảm
      calculatedOriginal = minBaseCalc + minSurcharges;
    }

    // Nếu Mode là Discount, giá thị trường thật sự (market price) mới là cái để gạch
    // Nhưng để đơn giản, ta so sánh finalPrice với calculatedOriginal

    return {
      displayPrice: finalPrice,
      originalPrice: calculatedOriginal,
      hasDiscount: finalPrice < calculatedOriginal,
    };
  }, [combo]);

  const fmt = (n: number) => Math.round(n).toLocaleString("vi-VN") + "đ";
  const isFixed = combo.pricingMode === ComboPricingMode.FIXED;
  // Nếu có minSelection = 0 (tùy chọn) hoặc có lựa chọn giá khác nhau => "Chỉ từ"
  // Ở đây đơn giản hóa: nếu không phải Fixed thuần túy thì hiện "Chỉ từ"
  const prefix =
    isFixed &&
    !combo.items.some((i) =>
      i.selectableProducts.some((p) => p.additionalPrice > 0)
    )
      ? ""
      : "Chỉ từ ";

  const discountTag =
    combo.pricingMode === ComboPricingMode.DISCOUNT && combo.discountValue > 0
      ? combo.discountType === DiscountType.PERCENT
        ? `-${combo.discountValue}%`
        : `-${combo.discountValue / 1000}k`
      : null;

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
        {discountTag && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm">
            {discountTag}
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

        {/* --- NÚT BẤM --- */}
        <div className="flex items-center justify-end mt-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            {/* Giữ nguyên phần nút bấm tăng giảm số lượng */}
            <button
              disabled={true}
              className={`w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors text-gray-300 cursor-not-allowed`}
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
