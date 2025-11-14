"use client";

import Image from "next/image";
import { Plus, Package } from "lucide-react";
import type { Combo, PricePromotion, Product } from "@/types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

// Cập nhật interface: Nhận trực tiếp Combo từ service (có thể có sale)
interface ComboCardProps {
  combo: Combo & {
    promotion?: PricePromotion;
    salePrice?: number;
  };
  onClick: () => void; // onClick này là để gọi startComboConfiguration
}

export default function ComboCard({ combo, onClick }: ComboCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // --- LOGIC GIÁ (từ code mới) ---
  const hasSale = combo.salePrice != null && combo.promotion != null;
  const finalPrice = (hasSale ? combo.salePrice : combo.comboPrice) ?? 0;
  const originalPrice = hasSale ? combo.comboPrice : undefined;
  // --- KẾT THÚC LOGIC GIÁ ---

  // Hiển thị các món trong combo (Giữ nguyên)
  const itemNames = combo.items
    .flatMap((slot) =>
      slot.selectableProducts.map((p) => (p.product as Product)?.name)
    )
    .filter(Boolean)
    .slice(0, 3) // Giới hạn 3 món
    .join(", ");

  return (
    // Áp dụng style ngang (layout của code "cũ")
    <div
      onClick={onClick} // Combo luôn luôn onClick để cấu hình
      className="flex items-start gap-4 bg-white p-3 rounded-xl border-2 border-primary-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative"
    >
      {/* Tag Combo */}
      <div className="absolute -top-3 left-3 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
        <Package className="w-3 h-3" />
        COMBO
      </div>

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
        {hasSale && (
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
              {finalPrice.toLocaleString("vi-VN")}đ
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
