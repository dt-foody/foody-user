"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/stores/useCartStore";
import type { MenuItem } from "@/types/product";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

interface ProductCardProps {
  product: MenuItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cartItems, startAddToCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(0);

  /** 🔹 Nếu giỏ hàng đã có sản phẩm này → fill sẵn quantity */
  useEffect(() => {
    console.log("cartItems", cartItems);
    console.log("product", product);
    const existing = cartItems.find((i) => i.productId === product.id);
    if (existing) setQuantity(existing.quantity);
    else setQuantity(0);
  }, [cartItems, product.id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const increase = () => {
    if (quantity === 0) {
      startAddToCart(product);
    } else {
      const cartLine = cartItems.find((i) => i.productId === product.id);
      if (cartLine) updateQuantity(cartLine.cartId, +1);
    }
  };

  const decrease = () => {
    const cartLine = cartItems.find((i) => i.productId === product.id);
    if (cartLine) updateQuantity(cartLine.cartId, -1);
  };

  return (
    <div className="flex items-start gap-4 bg-[#fffaf5] p-3 rounded-xl border border-[rgba(0,0,0,0.1)] shadow-sm hover:shadow-md transition-all duration-200">
      {/* Hình sản phẩm */}
      <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          onError={handleImageError}
          className="object-cover rounded-md"
        />
      </div>

      {/* Thông tin */}
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-base font-bold text-neutral-900 mb-1 leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[1.1rem] font-bold text-[rgb(98,54,40)]">
              {Math.round(product.price).toLocaleString("vi-VN")}₫
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {Math.round(product.originalPrice).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        </div>

        {/* Nút tăng giảm */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = Math.max(0, Number(e.target.value) || 0);
              setQuantity(val);
            }}
            className="w-20 h-10 text-center border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-[rgb(198,181,163)]"
          />
          <div className="flex border border-gray-400 rounded-md overflow-hidden">
            <button
              onClick={decrease}
              disabled={quantity <= 0}
              className={`w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors ${
                quantity > 0 ? "" : "opacity-40 cursor-not-allowed"
              }`}
            >
              -
            </button>
            <button
              onClick={increase}
              className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
