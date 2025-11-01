"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Loader,
  Plus,
  TrendingDown,
  Tag,
  ChevronDown,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";
import ProductNotFound from "@/components/ProductNotFound";
import MenuCategory from "@/components/MenuCategory";
import ErrorDisplay from "@/components/ErrorDisplay";
import SkeletonCard from "@/components/SkeletonCard";

import { categoryService } from "@/services";
import { pricePromotionService } from "@/services/pricePromotion.service";
import { Category, Combo, MenuItem, PricePromotion, Product } from "@/types";

// --- CONSTANTS ---
const API_BASE = "http://localhost:3000/v1";
const IMAGE_BASE = "http://localhost:3000";
const ITEMS_PER_PAGE = 12;

// --- MAIN COMPONENT ---
export default function HotDealsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [promotions, setPromotions] = useState<PricePromotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"discount" | "price:asc" | "price:desc">(
    "discount"
  );
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<{
    type: "category" | "combo";
    id: string;
  }>({ type: "category", id: "all" });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadDeals();
    }
  }, [activeTab, currentPage, sortBy]);

  const loadInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const catPromise = categoryService.getAll({});
      const promoPromise = pricePromotionService.getAll({
        populate: ["product", "combo"].join(";"),
        isActive: true,
        page: 1,
        limit: ITEMS_PER_PAGE,
      });

      const [catData, promoData] = await Promise.all([
        catPromise,
        promoPromise,
      ]);

      setCategories(buildCategoryTree(catData.results || []));

      const validPromotions = (promoData.results || []).filter(
        (p: PricePromotion) =>
          (p.product && typeof p.product === "object") ||
          (p.combo && typeof p.combo === "object")
      );

      setPromotions(validPromotions);
      processPromotions(validPromotions);
      setTotalPages(promoData.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Một lỗi không xác định đã xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const loadDeals = async (): Promise<void> => {
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const params = {
        populate: "product;combo",
        isActive: "true",
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      const data = await pricePromotionService.getAll(params);
      const validPromotions = (data.results || []).filter(
        (p: PricePromotion) =>
          (p.product && typeof p.product === "object") ||
          (p.combo && typeof p.combo === "object")
      );

      setPromotions(
        currentPage === 1
          ? validPromotions
          : (prev) => [...prev, ...validPromotions]
      );

      processPromotions(validPromotions, currentPage > 1);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Một lỗi không xác định đã xảy ra.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const processPromotions = (
    promos: PricePromotion[],
    append = false
  ): void => {
    const productsList: Product[] = [];
    const combosList: Combo[] = [];

    promos.forEach((promo) => {
      if (promo.product && typeof promo.product === "object") {
        const product = promo.product as Product;
        productsList.push({
          ...product,
          thumbnailUrl: `${IMAGE_BASE}${product.thumbnailUrl}`,
        });
      }
      if (promo.combo && typeof promo.combo === "object") {
        const combo = promo.combo as Combo;
        combosList.push({
          ...combo,
          thumbnailUrl: `${IMAGE_BASE}${combo.thumbnailUrl}`,
        });
      }
    });

    if (append) {
      setProducts((prev) => [...prev, ...productsList]);
      setCombos((prev) => [...prev, ...combosList]);
    } else {
      setProducts(productsList);
      setCombos(combosList);
    }
  };

  const buildCategoryTree = (cats: Category[]): Category[] => {
    return cats
      .filter((c: Category) => !c.parent)
      .map((parent: Category) => ({
        ...parent,
        image: parent.image ? `${IMAGE_BASE}${parent.image}` : "",
      }));
  };

  const calculateTimeLeft = (endDate?: string): string => {
    if (!endDate) return "";

    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Đã hết hạn";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Còn ${days} ngày`;
    if (hours > 0) return `Còn ${hours} giờ`;
    return "Sắp hết";
  };

  const dealItems = useMemo((): MenuItem[] => {
    const getPromotion = (id: string) =>
      promotions.find(
        (p) =>
          (p.product as Product)?.id === id || (p.combo as Combo)?.id === id
      );

    const allItems = [...products, ...combos];

    const filteredItems =
      selectedCategory === "all"
        ? allItems
        : allItems.filter((item) => {
            if ("comboPrice" in item) return false;
            return (item as Product).category === selectedCategory;
          });

    let items = filteredItems.map((item): MenuItem => {
      const isCombo = "comboPrice" in item;
      const promotion = getPromotion(item.id);

      let finalPrice = isCombo
        ? (item as Combo).comboPrice
        : (item as Product).basePrice;
      let originalPrice = undefined;

      if (promotion) {
        originalPrice = finalPrice;
        finalPrice =
          promotion.discountType === "percentage"
            ? finalPrice * (1 - promotion.discountValue / 100)
            : finalPrice - promotion.discountValue;
      }

      const productItem = item as Product;
      const timeLeft = promotion?.endDate
        ? calculateTimeLeft(promotion.endDate)
        : "";

      return {
        ...productItem,
        type: (isCombo ? "combo" : "product") as "combo" | "product",
        price: finalPrice,
        originalPrice,
        discount: promotion || null,
        image: item.thumbnailUrl,
        reviews: Math.floor(Math.random() * 500) + 100,
        rating: (4.0 + Math.random() * 0.9).toFixed(1),
        sold: Math.floor(Math.random() * 1000) + 50,
        timeLeft,
        optionGroups: productItem.optionGroups,
      };
    });

    switch (sortBy) {
      case "discount":
        items.sort((a, b) => {
          const discountA = a.discount
            ? a.discount.discountType === "percentage"
              ? a.discount.discountValue
              : (a.discount.discountValue / (a.originalPrice || a.price)) * 100
            : 0;
          const discountB = b.discount
            ? b.discount.discountType === "percentage"
              ? b.discount.discountValue
              : (b.discount.discountValue / (b.originalPrice || b.price)) * 100
            : 0;
          return discountB - discountA;
        });
        break;
      case "price:asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price:desc":
        items.sort((a, b) => b.price - a.price);
        break;
    }

    return items;
  }, [products, combos, promotions, selectedCategory, sortBy]);

  const handleTabClick = (type: "category" | "combo", id: string) => {
    if (activeTab.type === type && activeTab.id === id) return;
    setCurrentPage(1);
    setProducts([]);
    setCombos([]);
    setActiveTab({ type, id });
  };

  const activeDealCount = dealItems.length;

  const sortOptions = [
    { value: "discount", label: "Giảm giá nhiều nhất" },
    { value: "price:asc", label: "Giá thấp - cao" },
    { value: "price:desc", label: "Giá cao - thấp" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Sắp xếp";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ưu Đãi Hôm Nay
              </h1>
              <p className="text-gray-600 mt-1">
                {activeDealCount} sản phẩm đang giảm giá
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Filter Bar */}
      <div className="z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Categories */}
            <MenuCategory
              categories={categories}
              activeTab={activeTab}
              onTabClick={handleTabClick}
            />

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-orange-500 transition-colors whitespace-nowrap"
              >
                <TrendingDown className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {currentSortLabel}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showSortMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as any);
                        setShowSortMenu(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value
                          ? "bg-orange-50 text-orange-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <Tag className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-orange-700">Mẹo:</span> Các ưu
              đãi có thể kết thúc bất cứ lúc nào. Đặt hàng ngay để không bỏ lỡ!
            </p>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {error ? (
            <ErrorDisplay message={error} onRetry={loadInitialData} />
          ) : loading && currentPage === 1 ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : dealItems.length === 0 ? (
            <ProductNotFound />
          ) : (
            dealItems.map((item) => (
              <ProductCard key={item.id} product={item} showHotDealBadge />
            ))
          )}
        </div>

        {/* Load More Button */}
        {!loading &&
          !error &&
          dealItems.length > 0 &&
          currentPage < totalPages && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={loadingMore}
                className="px-8 py-3.5 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
              >
                {loadingMore ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Xem thêm ưu đãi</span>
                  </>
                )}
              </button>
            </div>
          )}
      </div>

      {/* Click outside to close dropdown */}
      {showSortMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
}
