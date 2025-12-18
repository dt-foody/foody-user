"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Plus, Tag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type { Product } from "@/types";
import { CreateOrderItem_ItemSnapshot } from "@/types/cart";
import { getImageUrl, handleImageError } from "@/utils/imageHelper";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { cartItems, addItemToCart, updateQuantity } = useCartStore();
  const [quantity, setQuantity] = useState(0);

  // --- 1. LOGIC GIÁ & TAG (GIỮ NGUYÊN 100%) ---
  const { displayPrice, originalPrice, hasDiscount, discountLabel } =
    useMemo(() => {
      const basePrice = product.basePrice || 0;
      let priceAfterInternal = basePrice;

      if (product.salePrice != null && product.salePrice < basePrice) {
        priceAfterInternal = product.salePrice;
      }

      let finalPrice = priceAfterInternal;
      if (product.promotion && product.promotion.isActive !== false) {
        const promoValue = product.promotion.discountValue || 0;
        const promoType = product.promotion.discountType?.toLowerCase();

        if (promoType === "percentage" || promoType === "percent") {
          finalPrice = priceAfterInternal * (1 - promoValue / 100);
        } else if (promoType === "fixed_amount" || promoType === "amount") {
          finalPrice = Math.max(0, priceAfterInternal - promoValue);
        }
      }

      let label = null;
      const savings = basePrice - finalPrice;
      if (savings > 0) {
        if (savings >= 10000) {
          label = `-${Math.round(savings / 1000)}k`;
        } else {
          const percentOff = Math.round((savings / basePrice) * 100);
          label = `-${percentOff}%`;
        }
      }

      return {
        displayPrice: finalPrice,
        originalPrice: basePrice,
        hasDiscount: finalPrice < basePrice,
        discountLabel: label,
      };
    }, [product]);

  const isSimpleProduct =
    !product.optionGroups || product.optionGroups.length === 0;

  // --- 2. LOGIC TÌM QUANTITY (ĐÃ ĐỒNG BỘ VỚI STORE) ---
  const promotionId =
    product.promotion?.id && product.promotion.id !== ""
      ? product.promotion.id
      : "normal";

  const currentCartLine = useMemo(() => {
    return cartItems.find((item) => {
      // Key chuẩn: ID : PROMO : GIÁ_ĐÃ_ROUND ::
      const variantPrefix = `${product.id}:${promotionId}:${Math.round(
        displayPrice
      )}::`;
      return item.cartId.startsWith(variantPrefix);
    });
  }, [cartItems, product.id, promotionId, displayPrice]);

  useEffect(() => {
    setQuantity(currentCartLine ? currentCartLine.quantity : 0);
  }, [currentCartLine]);

  // --- 3. HANDLERS ---
  const increase = (e: React.MouseEvent) => {
    e.stopPropagation();
    const itemSnapshot: CreateOrderItem_ItemSnapshot = {
      id: product.id,
      name: product.name,
      basePrice: product.basePrice,
      salePrice: product.salePrice || undefined,
      comboPrice: 0,
      promotion: product.promotion?.id || "",
    };

    addItemToCart({
      itemType: "Product",
      item: itemSnapshot,
      options: {},
      comboSelections: null,
      totalPrice: displayPrice,
      note: "",
      _image: product.image,
    });
  };

  const decrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCartLine) {
      updateQuantity(currentCartLine.cartId, -1);
    }
  };

  const canDecrease = quantity > 0 && isSimpleProduct;

  return (
    <div className="flex items-start gap-4 bg-white p-3 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-all duration-200 cursor-default relative overflow-hidden h-full">
      {/* Hình sản phẩm */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={getImageUrl(product.image)}
          alt={product.name}
          fill
          sizes="100px"
          onError={handleImageError}
          className="object-cover rounded-md"
          unoptimized
        />
        {discountLabel && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm">
            {discountLabel}
          </div>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex flex-col justify-between flex-grow">
        <div className="h-[82px]">
          <h3 className="text-base font-bold text-neutral-900 mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-gray-500 mb-1 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[1rem] font-bold text-primary-600">
                {Math.round(displayPrice).toLocaleString("vi-VN")}₫
              </span>
              {hasDiscount && (
                <span className="text-[0.8rem] text-gray-400 line-through">
                  {Math.round(originalPrice).toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>

            {product.promotion && product.promotion.isActive !== false && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md">
                <Tag className="w-3 h-3 fill-orange-600" />
                <span className="truncate max-w-[120px]">
                  {product.promotion.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- NÚT BẤM --- */}
        <div className="flex items-center justify-end mt-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={decrease}
              disabled={!canDecrease}
              className={`w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors ${
                canDecrease
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
              }`}
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
              onClick={isSimpleProduct ? increase : onClick}
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
