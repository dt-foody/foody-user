"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus, Package, Tag } from "lucide-react";
import type { Combo } from "@/types";
import { ComboPricingMode, DiscountType } from "@/types";
import { useCartStore } from "@/stores/useCartStore";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // --- HELPER: Tính giá sàn (Min Price) ---
  const calculateMinBasePrice = (): number => {
    if (combo.pricingMode === ComboPricingMode.FIXED) {
      return combo.comboPrice;
    }
    let total = 0;
    if (combo.items) {
      combo.items.forEach((item) => {
        if (item.minSelection > 0 && item.selectableProducts?.length > 0) {
          const minProductPrice = Math.min(
            ...item.selectableProducts.map((p) => {
              if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
                return p.product?.basePrice ?? 0;
              }
              return p.slotPrice;
            })
          );
          total += minProductPrice * item.minSelection;
        }
      });
    }
    if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
      if (combo.discountType === DiscountType.PERCENT) {
        total = total * (1 - combo.discountValue / 100);
      } else if (combo.discountType === DiscountType.AMOUNT) {
        total = Math.max(0, total - combo.discountValue);
      }
    }
    return total;
  };

  // --- LOGIC HIỂN THỊ GIÁ ---
  const basePrice = calculateMinBasePrice();
  let finalPrice = basePrice;
  let hasPromotion = false;

  if (combo.promotion && combo.promotion.isActive !== false) {
    hasPromotion = true;
    const promoValue = combo.promotion.discountValue || 0;
    const promoType = combo.promotion.discountType?.toLowerCase();

    if (promoType === "percentage" || promoType === "percent") {
      finalPrice = basePrice * (1 - promoValue / 100);
    } else if (promoType === "fixed_amount" || promoType === "amount") {
      finalPrice = Math.max(0, basePrice - promoValue);
    }
  } else if (
    combo.pricingMode === ComboPricingMode.FIXED &&
    combo.salePrice != null &&
    combo.salePrice < combo.comboPrice
  ) {
    hasPromotion = true;
    finalPrice = combo.salePrice;
  }

  const fmt = (n: number) => Math.round(n).toLocaleString("vi-VN") + "đ";
  const isFixed = combo.pricingMode === ComboPricingMode.FIXED;
  const prefix = isFixed ? "" : "Chỉ từ ";

  const discountTag =
    combo.pricingMode === ComboPricingMode.DISCOUNT && combo.discountValue > 0
      ? combo.discountType === DiscountType.PERCENT
        ? `-${combo.discountValue}%`
        : `-${combo.discountValue / 1000}k`
      : null;

  return (
    <div
      // Thay đổi chính ở đây: luôn dùng flex-row (bỏ flex-col) để ảnh luôn nằm bên trái
      className="group flex flex-row items-start gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-primary-500 transition-all duration-200 cursor-pointer relative overflow-hidden h-full"
    >
      {/* Hình ảnh - Cố định kích thước vuông nhỏ bên trái */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={combo.image || PLACEHOLDER_IMAGE}
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

      {/* Thông tin chi tiết - Nằm bên phải */}
      <div className="flex flex-col justify-between flex-grow w-full min-h-[6rem] sm:min-h-[7rem]">
        {/* HÀNG 1: Tên + Giá */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {combo.name}
          </h3>

          {/* Giá hiển thị ngay dưới tên */}
          <div className="flex flex-col items-start">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-primary-600">
                {prefix}
                {fmt(finalPrice)}
              </span>

              {(hasPromotion ||
                (combo.pricingMode === ComboPricingMode.DISCOUNT &&
                  combo.discountValue > 0)) && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through decoration-gray-400">
                  {fmt(
                    hasPromotion
                      ? basePrice
                      : calculateMinBasePrice() /
                          (1 -
                            (combo.discountType === "PERCENT"
                              ? combo.discountValue / 100
                              : 0))
                  )}
                </span>
              )}
            </div>

            {hasPromotion && combo.promotion && (
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
