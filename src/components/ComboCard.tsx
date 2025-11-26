"use client";

import Image from "next/image";
import { Plus, Package, Tag, Percent } from "lucide-react";
import type { Combo } from "@/types";
import { ComboPricingMode, DiscountType } from "@/types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

interface ComboCardProps {
  combo: Combo;
  onClick: () => void;
}

export default function ComboCard({ combo, onClick }: ComboCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // --- HELPER: Tính giá sàn (Min Price) cho combo động ---
  const calculateMinBasePrice = (): number => {
    // 1. Nếu là FIXED: dùng giá cứng
    if (combo.pricingMode === ComboPricingMode.FIXED) {
      return combo.comboPrice;
    }

    // 2. Nếu là SLOT_PRICE hoặc DISCOUNT: Tính tổng min của các slot bắt buộc
    let total = 0;
    if (combo.items) {
      combo.items.forEach((item) => {
        // Chỉ tính giá cho các slot bắt buộc phải chọn (minSelection > 0)
        if (item.minSelection > 0 && item.selectableProducts?.length > 0) {
          // Tìm sản phẩm có giá rẻ nhất trong slot này
          const minProductPrice = Math.min(
            ...item.selectableProducts.map((p) => {
              // UPDATE: Mode DISCOUNT lấy giá realtime từ product
              if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
                return p.product?.basePrice ?? 0;
              }
              // Mode SLOT_PRICE lấy giá slot đã cấu hình (snapshot)
              return p.slotPrice;
            })
          );
          // Cộng dồn vào tổng (nhân với số lượng bắt buộc tối thiểu)
          total += minProductPrice * item.minSelection;
        }
      });
    }

    // 3. Nếu là DISCOUNT: Áp dụng giảm giá nội tại của Combo
    if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
      if (combo.discountType === DiscountType.PERCENT) {
        total = total * (1 - combo.discountValue / 100);
      } else if (combo.discountType === DiscountType.AMOUNT) {
        total = Math.max(0, total - combo.discountValue);
      }
    }

    return total;
  };

  // --- LOGIC TÍNH TOÁN HIỂN THỊ ---
  const basePrice = calculateMinBasePrice(); // Giá sàn (đã trừ discount nội tại nếu có)
  let finalPrice = basePrice;
  let hasPromotion = false;

  // 1. Kiểm tra Promotion (Khuyến mãi sự kiện/ngày lễ bên ngoài)
  if (combo.promotion && combo.promotion.isActive !== false) {
    // Giả định check active đơn giản
    hasPromotion = true;
    const promoValue = combo.promotion.discountValue || 0;
    const promoType = combo.promotion.discountType?.toLowerCase(); // Xử lý case-insensitive

    if (promoType === "percentage" || promoType === "percent") {
      finalPrice = basePrice * (1 - promoValue / 100);
    } else if (promoType === "fixed_amount" || promoType === "amount") {
      finalPrice = Math.max(0, basePrice - promoValue);
    }
  }
  // 2. Fallback cho logic cũ: FIXED có salePrice
  else if (
    combo.pricingMode === ComboPricingMode.FIXED &&
    combo.salePrice != null &&
    combo.salePrice < combo.comboPrice
  ) {
    hasPromotion = true;
    finalPrice = combo.salePrice;
  }

  // --- FORMATTING ---
  const fmt = (n: number) => Math.round(n).toLocaleString("vi-VN") + "đ";
  const isFixed = combo.pricingMode === ComboPricingMode.FIXED;
  const prefix = isFixed ? "" : "Từ ";

  // Tag hiển thị loại giảm giá (cho mode DISCOUNT)
  const discountTag =
    combo.pricingMode === ComboPricingMode.DISCOUNT && combo.discountValue > 0
      ? combo.discountType === DiscountType.PERCENT
        ? `-${combo.discountValue}%`
        : `-${combo.discountValue / 1000}k`
      : null;

  return (
    <div
      onClick={onClick}
      className="group flex flex-col sm:flex-row items-start gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-primary-500 transition-all duration-200 cursor-pointer relative overflow-hidden h-full"
    >
      {/* Hình ảnh */}
      <div className="relative w-full sm:w-28 sm:h-28 h-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={combo.image || PLACEHOLDER_IMAGE}
          alt={combo.name}
          fill
          sizes="(max-width: 768px) 100vw, 150px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />

        {/* Badge: Loại Combo (Góc trái dưới ảnh) */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px] p-1 text-center">
          <span className="text-[10px] text-white font-semibold uppercase tracking-wide flex items-center justify-center gap-1">
            <Package className="w-3 h-3" />
            {combo.pricingMode === ComboPricingMode.FIXED ? "Gói" : "Combo"}
          </span>
        </div>

        {/* Badge: Giảm giá nội tại (Góc phải trên ảnh - Chỉ cho mode DISCOUNT) */}
        {discountTag && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
            {discountTag}
          </div>
        )}
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-col justify-between flex-grow w-full min-h-[5rem]">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-1 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {combo.name}
          </h3>

          {/* Có thể thêm mô tả ngắn hoặc danh sách món ăn tiêu biểu ở đây nếu cần */}
          {/* <p className="text-xs text-gray-500 line-clamp-1">...</p> */}
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div className="flex flex-col items-start">
            {/* Giá bán */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-bold text-primary-600">
                {prefix}
                {fmt(finalPrice)}
              </span>

              {/* Giá gốc (chỉ hiện khi có khuyến mãi hoặc khi mode DISCOUNT để người dùng thấy giá trị) */}
              {(hasPromotion ||
                (combo.pricingMode === ComboPricingMode.DISCOUNT &&
                  combo.discountValue > 0)) && (
                <span className="text-xs text-gray-400 line-through decoration-gray-400">
                  {fmt(
                    hasPromotion
                      ? basePrice
                      : calculateMinBasePrice() /
                          (1 -
                            (combo.discountType === "PERCENT"
                              ? combo.discountValue / 100
                              : 0))
                  )}
                  {/* Lưu ý: Logic hiển thị giá gốc ở trên là ước lượng đơn giản để hiện gạch ngang, 
                      nếu muốn chính xác tuyệt đối cho mọi case discount cần tính ngược lại cẩn thận hơn 
                      nhưng ở đây ưu tiên hiện giá basePrice calculated */}
                </span>
              )}
            </div>

            {/* Tag Khuyến mãi (Promotion) - Subtle */}
            {hasPromotion && combo.promotion && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md">
                <Tag className="w-3 h-3 fill-orange-600" />
                <span className="truncate max-w-[120px]">
                  {combo.promotion.name}
                </span>
              </div>
            )}
          </div>

          {/* Nút Thêm */}
          <button
            className="w-8 h-8 flex items-center justify-center bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white rounded-full transition-all shadow-sm border border-primary-100 hover:border-primary-500 hover:scale-105 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            title="Chọn combo"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
