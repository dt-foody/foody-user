"use client";

import Image from "next/image";
import { Plus, Package } from "lucide-react";
import type { Combo, PricePromotion, Product } from "@/types";
import { ComboPricingMode, DiscountType } from "@/types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

interface ComboCardProps {
  // REFACTORED: Type Combo ở đây đã được cập nhật
  combo: Combo;
  onClick: () => void;
}

export default function ComboCard({ combo, onClick }: ComboCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // --- REFACTORED: LOGIC GIÁ MỚI (ĐÃ CẬP NHẬT THEO YÊU CẦU) ---
  const hasSale = combo.salePrice != null && combo.promotion != null;

  // 1. Ưu tiên giá sale (promotion) bên ngoài
  const finalPrice = hasSale ? combo.salePrice : combo.comboPrice;

  // 2. Giá gốc (line-through)
  const originalPrice =
    hasSale && combo.pricingMode === ComboPricingMode.FIXED
      ? combo.comboPrice
      : undefined;

  // 3. Text hiển thị (ĐÃ CẬP NHẬT THEO YÊU CẦU CỦA BẠN)
  const priceText = hasSale
    ? finalPrice?.toLocaleString("vi-VN") + "đ" // Luôn hiển thị salePrice nếu có
    : combo.pricingMode === ComboPricingMode.FIXED
    ? combo.comboPrice.toLocaleString("vi-VN") + "đ" // YC: Giá FIXED
    : combo.minPrice // YC: Giá SLOT/DISCOUNT = "tổng min slot" (từ backend)
    ? `Từ ${combo.minPrice.toLocaleString("vi-VN")}đ`
    : "Tùy chọn"; // Fallback nếu backend không trả về minPrice

  // --- KẾT THÚC LOGIC GIÁ ---

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-4 bg-white p-3 rounded-xl border-2 border-primary-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative"
    >
      {/* Tag Combo */}
      <div className="absolute -top-3 left-3 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
        <Package className="w-3 h-3" />
        COMBO
      </div>

      {/* MỚI: Tag Giảm giá cho mode DISCOUNT */}
      {combo.pricingMode === ComboPricingMode.DISCOUNT &&
        combo.discountValue > 0 && (
          <div className="absolute -top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            {combo.discountType === DiscountType.PERCENT
              ? `-${combo.discountValue}%`
              : `-${combo.discountValue.toLocaleString("vi-VN")}đ`}
          </div>
        )}

      {/* Hình ảnh */}
      <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={combo.image || PLACEHOLDER_IMAGE}
          alt={combo.name}
          fill
          sizes="100px"
          className="object-cover rounded-md"
          onError={handleImageError}
        />

        {/* CẬP NHẬT: Chỉ hiển thị SALE khi có promotion VÀ không phải mode DISCOUNT */}
        {hasSale && combo.pricingMode !== ComboPricingMode.DISCOUNT && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            SALE
          </span>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex flex-col justify-between flex-grow h-28">
        <div>
          <h3 className="text-base font-bold text-primary-700 mb-1 leading-tight line-clamp-2">
            {combo.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[1rem] font-bold text-primary-600">
              {priceText}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
        </div>

        {/* Nút Thêm/Tuỳ chọn */}
        <div className="flex items-center justify-end mt-2">
          {/* Combo luôn là nút "Tuỳ chọn" */}
          <button
            onClick={onClick}
            className="px-4 h-9 flex items-center justify-center text-sm font-bold bg-primary-500 text-white hover:bg-primary-600 transition-colors rounded-md"
          >
            Tuỳ chọn
            <Plus className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
