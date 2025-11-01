// components/ClientGridFeaturePlaces.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react"; // CHANGED: Added useCallback, useEffect
import { ShoppingCart, Star, Loader } from "lucide-react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import { productService } from "@/services/product.service";
import { Product, Category, MenuItem } from "@/types";
import { useCart } from "@/stores/useCartStore";
import { PREFIX_IMAGE } from "@/constants";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

export default function ClientGridFeaturePlaces({
  initialCategories,
  initialActiveTab,
  initialProducts,
  initialHasMore,
  heading = "Best Sellers",
  subHeading = "Những món ăn được yêu thích nhất mà chúng tôi gợi ý cho bạn",
  gridClass = "",
}: {
  initialCategories: Category[];
  initialActiveTab: string;
  initialProducts: Product[];
  initialHasMore: boolean;
  heading?: React.ReactNode;
  subHeading?: React.ReactNode;
  gridClass?: string;
}) {
  const [categories] = useState<Category[]>(initialCategories);

  // CHANGED: getImageUrl is now wrapped in useCallback
  const getImageUrl = (url: string): string => {
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith("http")) return url;
    return `${PREFIX_IMAGE}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // CHANGED: convertToMenuItem is now wrapped in useCallback
  // This is where the random data is generated ONCE per product
  const convertToMenuItem = useCallback(
    (product: Product): MenuItem => ({
      ...product,
      price: product.basePrice,
      image: getImageUrl(product.thumbnailUrl),
      type: "product",
      reviews: Math.floor(Math.random() * 400) + 100, // Generated once
      rating: (3.8 + Math.random() * 1.2).toFixed(1), // Generated once
    }),
    [getImageUrl]
  );

  // CHANGED: Helper for SSR to avoid hydration mismatch.
  // It provides stable, non-random values.
  const convertToMenuItem_SSR = (product: Product): MenuItem => ({
    ...product,
    price: product.basePrice,
    image: getImageUrl(product.thumbnailUrl),
    type: "product",
    reviews: 0,
    rating: "...",
  });

  // CHANGED: State is now MenuItem[].
  // We initialize it with the STABLE SSR version first.
  const [products, setProducts] = useState<MenuItem[]>(() =>
    initialProducts.map(convertToMenuItem_SSR)
  );

  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { addToCart } = useCart();

  // CHANGED: This useEffect runs ONCE on the client after mount.
  // It "hydrates" the product state with the random (but now stable) data.
  useEffect(() => {
    setProducts(initialProducts.map((p) => convertToMenuItem(p)));
    // We only want this to run once on mount, so we disable the linter warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  async function fetchProducts(
    categoryId: string,
    pageNum: number,
    append = false
  ) {
    if (!append) setLoading(true);

    try {
      const data = await productService.getAll({
        page: pageNum,
        limit: 8,
        category: categoryId,
        isActive: true,
      });
      const list: Product[] = data.results ?? [];
      const totalPages = data.totalPages ?? 0;

      // CHANGED: Convert new products to MenuItems
      const newMenuItems = list.map((p) => convertToMenuItem(p));

      setHasMore(pageNum < totalPages);
      // CHANGED: Set state with MenuItem[]
      setProducts((prev) =>
        append ? [...prev, ...newMenuItems] : newMenuItems
      );
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

  // CHANGED: Parameter is now the full MenuItem
  const handleAddToCart = (product: MenuItem) => {
    addToCart(product);
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
              products.map(
                (
                  food // food is now a MenuItem
                ) => (
                  <div
                    key={food.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
                  >
                    <div className="relative">
                      <img
                        src={food.image} // CHANGED: Use the pre-built image URL
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
                            {food.rating} {/* CHANGED: Read from state */}
                          </span>
                          <span className="ml-1">
                            ({food.reviews}) {/* CHANGED: Read from state */}
                          </span>
                        </div>
                      </div>

                      {/* Price & Add to cart */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                        <div>
                          <span className="text-xl font-bold text-orange-600">
                            {Math.round(food.basePrice).toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(food)} // CHANGED: Pass the MenuItem
                          aria-label={`Thêm ${food.name} vào giỏ`}
                          className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center transform group-hover:scale-110 shadow-sm"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )
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
