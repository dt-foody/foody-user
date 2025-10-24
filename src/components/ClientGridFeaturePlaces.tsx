// components/ClientGridFeaturePlaces.tsx
"use client";

import React, { useState } from "react";
import { ShoppingCart, Star, Loader } from "lucide-react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import { useCart } from "@/contexts/CartContext";

type Category = { 
  id: string; 
  name: string;
  parent?: string | null;
  image?: string;
};

type Product = {
  id: string;
  name: string;
  basePrice: number;
  thumbnailUrl: string;
  description: string;
  category: string;
  isActive: boolean;
  priority: number;
};

type MenuItem = Product & {
  price: number;
  image: string;
  type: 'product';
  reviews: number;
  rating: string;
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

export default function ClientGridFeaturePlaces({
  apiBase,
  initialCategories,
  initialActiveTab,
  initialProducts,
  initialHasMore,
  heading = "Best Sellers",
  subHeading = "Những món ăn được yêu thích nhất mà chúng tôi gợi ý cho bạn",
  gridClass = "",
}: {
  apiBase: string;
  initialCategories: Category[];
  initialActiveTab: string;
  initialProducts: Product[];
  initialHasMore: boolean;
  heading?: React.ReactNode;
  subHeading?: React.ReactNode;
  gridClass?: string;
}) {
  const [categories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { addToCart } = useCart();

  const getImageUrl = (url: string): string => {
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith("http")) return url;
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // Convert Product to MenuItem format
  const convertToMenuItem = (product: Product): MenuItem => ({
    ...product,
    price: product.basePrice,
    image: getImageUrl(product.thumbnailUrl),
    type: 'product',
    reviews: Math.floor(Math.random() * 400) + 100,
    rating: (3.8 + Math.random() * 1.2).toFixed(1),
  });

  async function fetchProducts(categoryId: string, pageNum: number, append = false) {
    if (!append) setLoading(true);
    
    try {
      const res = await fetch(
        `${apiBase}/v1/public/products?category=${encodeURIComponent(
          categoryId
        )}&page=${pageNum}&limit=8&isActive=true`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error("Không thể tải sản phẩm");
      }

      const data = await res.json();
      const list: Product[] = data?.results ?? [];
      const totalPages = data?.totalPages ?? 0;

      setHasMore(pageNum < totalPages);
      setProducts((prev) => (append ? [...prev, ...list] : list));
    } catch (error) {
      console.error("Error fetching products:", error);
      if (!append) {
        setProducts([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleTabChange(categoryId: string) {
    if (categoryId === activeTab || loading) return;
    setActiveTab(categoryId);
    setPage(1);
    await fetchProducts(categoryId, 1, false);
  }

  async function handleShowMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    await fetchProducts(activeTab, next, true);
    setPage(next);
    setLoadingMore(false);
  }

  const handleAddToCart = (product: Product) => {
    const menuItem = convertToMenuItem(product);
    addToCart(menuItem);
  };

  return (
    <div className="nc-SectionGridFeaturePlaces relative">
      {/* Header + Tabs */}
      <HeaderFilter
        tabActive={activeTab}
        subHeading={subHeading}
        tabs={categories.map((c) => ({ label: c.name, value: c.id }))}
        heading={heading}
        onClickTab={handleTabChange}
      />

      {/* Loading state cho tab change */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* Grid sản phẩm */}
          <div
            className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
          >
            {products.length > 0 ? (
              products.map((food) => (
                <div
                  key={food.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(food.thumbnailUrl)}
                      alt={food.name}
                      onError={handleImageError}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
                      {food.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4 line-clamp-2 flex-grow min-h-[40px]">
                      {food.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium text-gray-800">
                          {(3.8 + Math.random() * 1.2).toFixed(1)}
                        </span>
                        <span className="ml-1">
                          ({Math.floor(Math.random() * 400) + 100})
                        </span>
                      </div>
                    </div>

                    {/* Price & Add to cart */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xl font-bold text-orange-600">
                          {Math.round(food.basePrice).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(food)}
                        aria-label={`Thêm ${food.name} vào giỏ`}
                        className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center transform group-hover:scale-110 shadow-sm"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Không có sản phẩm nào trong mục này
                </h3>
                <p className="text-gray-500 mt-2">
                  Vui lòng chọn danh mục khác hoặc quay lại sau.
                </p>
              </div>
            )}
          </div>

          {/* Nút "Xem thêm" */}
          {products.length > 0 && (
            <div className="flex mt-12 justify-center items-center">
              <ButtonPrimary
                onClick={handleShowMore}
                disabled={loadingMore || !hasMore}
                className={`min-w-[180px] ${
                  !hasMore ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""
                }`}
              >
                {loadingMore ? (
                  <span className="flex items-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Đang tải...</span>
                  </span>
                ) : hasMore ? (
                  "Xem thêm"
                ) : (
                  "Đã tải hết sản phẩm"
                )}
              </ButtonPrimary>
            </div>
          )}
        </>
      )}
    </div>
  );
}