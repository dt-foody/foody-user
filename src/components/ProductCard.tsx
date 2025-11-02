// /components/ProductCard.tsx
"use client";

import { Heart, ShoppingCart, Star, Clock, Flame } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/types/product";
import { useCart } from "@/stores/useCartStore";
import Image from "next/image";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

interface ProductCardProps {
  product: MenuItem;
  showHotDealBadge?: boolean;
}

export default function ProductCard({
  product,
  showHotDealBadge = false,
}: ProductCardProps) {
  const { startAddToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const onSale = !!(
    product.originalPrice && product.originalPrice > product.price
  );
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full">
      <div className="relative w-full h-36 sm:h-44">
        <Image
          fill
          src={product.image || ""}
          alt={product.name}
          onError={handleImageError}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          // 💡 Bỏ w-full, h-36, sm:h-44 khỏi Image
        />
        {/* Các thành phần "absolute" còn lại giữ nguyên */}
        {showHotDealBadge && onSale && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Hot
            </span>
          </div>
        )}
        {onSale && discountPercentage > 0 && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full font-bold text-xs shadow-md">
            -{discountPercentage}%
          </div>
        )}
        <button
          onClick={() => setIsFavorite((v) => !v)}
          aria-label="Thêm vào yêu thích"
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-0.5" />
            <span className="font-semibold text-gray-800">
              {product.rating}
            </span>
            <span className="ml-1 text-gray-500">({product.reviews})</span>
          </div>
          {showHotDealBadge && product.sold && (
            <span className="text-gray-500">Đã bán {product.sold}</span>
          )}
        </div>

        {showHotDealBadge && product.timeLeft && (
          <div className="flex items-center gap-1 text-xs text-red-500 font-medium mb-2 bg-red-50 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" />
            <span>{product.timeLeft}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-orange-600">
              {Math.round(product.price).toLocaleString("vi-VN")}₫
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          <button
            onClick={() => startAddToCart(product)}
            aria-label={`Thêm ${product.name} vào giỏ`}
            className={`w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center transform ${
              showHotDealBadge
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-110 shadow-md"
                : "bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white group-hover:scale-110"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
