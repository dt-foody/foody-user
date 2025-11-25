"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type { Product, PricePromotion } from "@/types";
import { CreateOrderItem_ItemSnapshot } from "@/types/cart";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { cartItems, addItemToCart, updateQuantity } = useCartStore();
  const [quantity, setQuantity] = useState(0);

  // --- LOGIC GIÁ ---
  const hasSale = product.salePrice != null && product.promotion != null;
  const finalPrice = (hasSale ? product.salePrice : product.basePrice) ?? 0;
  const originalPrice = hasSale ? product.basePrice : undefined;

  // --- LOGIC PHÂN BIỆT SẢN PHẨM ---
  const isSimpleProduct =
    !product.optionGroups || product.optionGroups.length === 0;

  /** 🔹 Cập nhật quantity dựa trên giỏ hàng */
  useEffect(() => {
    // ID tiền tố để tìm kiếm
    const productIdPrefix = `${product.id}::`;

    // Lọc tất cả các line item trong giỏ hàng có cùng ID sản phẩm
    // và cộng gộp số lượng của chúng
    const totalQuantity = cartItems
      .filter((item) => item.cartId.startsWith(productIdPrefix))
      .reduce((sum, currentItem) => sum + currentItem.quantity, 0);

    setQuantity(totalQuantity);
  }, [cartItems, product.id]);

  // --- HANDLERS ---
  const increase = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Logic này CHỈ DÀNH CHO SẢN PHẨM ĐƠN GIẢN
    const itemSnapshot: CreateOrderItem_ItemSnapshot = {
      id: product.id,
      name: product.name,
      basePrice: product.basePrice,
      salePrice: hasSale ? product.salePrice : undefined,
    };

    const newItemPayload: any = {
      itemType: "Product",
      item: itemSnapshot,
      options: {},
      comboSelections: null,
      totalPrice: finalPrice, // Giá này đã là giá sale (nếu có)
      note: "",
      _image: product.image,
      _categoryIds: product.category ? [product.category.toString()] : [],
    };

    addItemToCart(newItemPayload);
  };

  const decrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Logic này CHỈ hoạt động cho SP đơn giản
    // Lưu ý: key phải khớp logic buildVariantKey trong store (thường là id + "::")
    const simpleCartId = `${product.id}::`;
    const cartLine = cartItems.find((i) => i.cartId === simpleCartId);
    if (cartLine) updateQuantity(cartLine.cartId, -1);
  };
  // ---------------------------------------------------

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // Nút decrease chỉ được kích hoạt khi:
  // 1. Số lượng > 0
  // 2. VÀ đó LÀ sản phẩm đơn giản
  const canDecrease = quantity > 0 && isSimpleProduct;

  return (
    <div
      className={`flex items-start gap-4 bg-white p-3 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-all duration-200 cursor-default`}
    >
      {/* Hình sản phẩm */}
      <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          sizes="100px"
          onError={handleImageError}
          className="object-cover rounded-md"
          unoptimized
        />
        {hasSale && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            SALE
          </span>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex flex-col justify-between flex-grow h-28">
        {/* Tên và giá */}
        <div>
          <h3 className="text-base font-bold text-neutral-900 mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[1rem] font-bold text-primary-600">
              {Math.round(finalPrice).toLocaleString("vi-VN")}₫
            </span>
            {originalPrice && (
              <span className="text-[0.8rem] text-gray-400 line-through">
                {Math.round(originalPrice).toLocaleString("vi-VN")}₫
              </span>
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
