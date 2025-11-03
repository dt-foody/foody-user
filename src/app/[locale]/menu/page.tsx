"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Gift,
  Loader,
  SlidersHorizontal,
  X,
  TrendingUp,
  DollarSign,
} from "lucide-react";

import { Category, Product, Combo, PricePromotion, MenuItem } from "@/types";
import Image from "next/image";

import SkeletonCard from "@/components/SkeletonCard";
import ProductCard from "@/components/ProductCard";
import ProductNotFound from "@/components/ProductNotFound";
import MenuCategory from "@/components/MenuCategory";
import ErrorDisplay from "@/components/ErrorDisplay";
import { categoryService, comboService, productService } from "@/services";
import { pricePromotionService } from "@/services/pricePromotion.service";
import { PREFIX_IMAGE } from "@/constants";

// --- CONSTANTS ---
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
const ITEMS_PER_PAGE = 12;

// --- MAIN COMPONENT ---
export default function FoodyMenuContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [promotions, setPromotions] = useState<PricePromotion[]>([]);
  const [activeTab, setActiveTab] = useState<{
    type: "category" | "combo";
    id: string;
  }>({ type: "category", id: "all" });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [promoIndex, setPromoIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "popular" | "price:asc" | "price:desc" | "rating"
  >("popular");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 500000,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  /** Cờ đã khởi tạo xong lần đầu để chặn effect tự fetch lại */
  const initedRef = useRef(false);

  /** Debounce timer cho search */
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Chống ghi đè state bởi response cũ (race) */
  const reqIdRef = useRef(0);

  const buildCategoryTree = useCallback((cats: Category[]): Category[] => {
    return cats
      .filter((c: Category) => !c.parent)
      .map((parent: Category) => ({
        ...parent,
        image: parent.image ? `${PREFIX_IMAGE}${parent.image}` : "",
      }));
  }, []);

  const loadItems = useCallback(
    async (isInitialLoad = false): Promise<void> => {
      // Mỗi lần gọi tạo ra 1 request id mới
      const myReqId = ++reqIdRef.current;

      // Quản lý loading flags (chỉ set nếu không phải initial load)
      if (!isInitialLoad) {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        setError(null);
      }

      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(activeTab.type === "category" &&
            activeTab.id !== "all" && { category: activeTab.id }),
          ...(searchQuery && { search: searchQuery }),
          sortBy,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
        };

        const data =
          activeTab.type === "combo"
            ? await comboService.getAll(params as any)
            : await productService.getAll(params as any);

        if (reqIdRef.current !== myReqId) return;

        const formattedItems = (data.results || []).map((item: any) => ({
          ...item,
          thumbnailUrl: item?.thumbnailUrl
            ? `${PREFIX_IMAGE}${item.thumbnailUrl}`
            : "",
        }));

        if (activeTab.type === "combo") {
          setCombos((prev) =>
            currentPage === 1 ? formattedItems : [...prev, ...formattedItems]
          );
        } else {
          setProducts((prev) =>
            currentPage === 1 ? formattedItems : [...prev, ...formattedItems]
          );
        }

        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        // Chỉ set error nếu là request hiện hành
        if (reqIdRef.current !== myReqId) {
          setError(err?.message || "Một lỗi không xác định đã xảy ra.");
        }
      } finally {
        // Chỉ tắt loading nếu là request hiện hành
        if (reqIdRef.current === myReqId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [currentPage, activeTab.type, activeTab.id, searchQuery, sortBy, priceRange]
  );

  const loadInitialData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const catPromise = categoryService.getAll({});
      const promoPromise = pricePromotionService.getAll({
        populate: "product;combo",
        isActive: true,
        limit: 10,
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

      // Lần đầu: tự load page 1 theo state hiện tại
      await loadItems(true);
      initedRef.current = true;
    } catch (err: any) {
      setError(err?.message || "Một lỗi không xác định đã xảy ra.");
    } finally {
      setLoading(false);
    }
    // Bỏ loadItems ra khỏi deps của loadInitialData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildCategoryTree]);

  // --- DATA FETCHING ---

  // 1) Mount: chỉ chạy một lần
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) [FIXED] Khi tab hoặc trang đổi: fetch
  // Đây là effect chính, chịu trách nhiệm fetch khi tab hoặc page (xem thêm) thay đổi.
  useEffect(() => {
    if (!initedRef.current) return;
    loadItems();
    // Chúng ta bỏ loadItems khỏi deps, vì nó là 1 function.
    // Effect này CHỈ nên trigger khi tab hoặc page thay đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab.type, activeTab.id, currentPage]);

  // 3) [FIXED] Debounce search
  // Effect này CHỈ trigger khi searchQuery thay đổi.
  useEffect(() => {
    if (!initedRef.current) return;

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      // Khi search, ta reset về trang 1.
      // Việc gọi setCurrentPage(1) sẽ kích hoạt effect (2) ở trên để fetch.
      // Nếu đã ở trang 1, ta tự gọi loadItems() để fetch.
      if (currentPage !== 1) setCurrentPage(1);
      else loadItems();
    }, 500);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
    // Chỉ lắng nghe searchQuery. Bỏ currentPage và loadItems.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // 4) [FIXED] Khi filter đổi (sort/price): reset list và trang, rồi fetch
  // Effect này CHỈ trigger khi sortBy hoặc priceRange thay đổi.
  useEffect(() => {
    if (!initedRef.current) return;

    // reset dữ liệu cũ
    setProducts([]);
    setCombos([]);

    // Tương tự search: reset về trang 1 để kích hoạt effect (2) fetch.
    // Nếu đã ở trang 1, tự gọi loadItems().
    if (currentPage !== 1) setCurrentPage(1);
    else loadItems();

    // Chỉ lắng nghe sortBy và priceRange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, priceRange]);

  // 5) Carousel promotion
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setPromoIndex((prev) => (prev + 1) % promotions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promotions]);

  const allItems = useMemo((): MenuItem[] => {
    const getDiscount = (id: string) =>
      promotions.find(
        (p) =>
          (p.product as Product)?.id === id || (p.combo as Combo)?.id === id
      );

    const itemsToMap = activeTab.type === "combo" ? combos : products;

    return itemsToMap.map((item: Product | Combo): MenuItem => {
      const isCombo = "comboPrice" in item;
      const discount = getDiscount(item.id);

      let finalPrice = isCombo
        ? (item as Combo).comboPrice
        : (item as Product).basePrice;
      let originalPrice: number | undefined = undefined;

      if (discount) {
        originalPrice = finalPrice;
        finalPrice =
          discount.discountType === "percentage"
            ? finalPrice * (1 - discount.discountValue / 100)
            : finalPrice - discount.discountValue;
        if (finalPrice < 0) finalPrice = 0;
      }

      // rating/reviews ổn định theo id (không random mỗi render)
      const reviews = 1000;
      const rating = 5.0;

      const productItem = item as Product;
      return {
        ...productItem,
        type: (isCombo ? "combo" : "product") as "combo" | "product",
        price: Number(finalPrice),
        originalPrice,
        discount: discount || null,
        image: item.thumbnailUrl,
        reviews,
        rating, // number
        optionGroups: productItem.optionGroups,
      };
    });
  }, [products, combos, promotions, activeTab.type]);

  const handleTabClick = (type: "category" | "combo", id: string) => {
    if (activeTab.type === type && activeTab.id === id) return;
    setCurrentPage(1);
    setProducts([]);
    setCombos([]);
    setActiveTab({ type, id });
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  const handlePriceRangeChange = (next: typeof priceRange) => {
    // đảm bảo min/max hợp lệ
    const min = Math.max(0, Number(next.min));
    const max = Math.max(0, Number(next.max));
    const fixed =
      min <= max
        ? { min, max }
        : { min: Math.min(min, max), max: Math.max(min, max) };
    setPriceRange(fixed);
  };

  const resetFilters = () => {
    setSortBy("popular");
    setPriceRange({ min: 0, max: 500000 });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white/95 backdrop-blur-lg border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm món ăn, combo, đồ uống..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-5 py-3.5 rounded-xl font-semibold transition-all shadow-sm ${
                showFilters
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-500"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Lọc & Sắp xếp</span>
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sort Options */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                    Sắp xếp theo
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "popular", label: "Phổ biến nhất", icon: "🔥" },
                      { value: "rating", label: "Đánh giá cao", icon: "⭐" },
                      {
                        value: "price:asc",
                        label: "Giá thấp đến cao",
                        icon: "💰",
                      },
                      {
                        value: "price:desc",
                        label: "Giá cao đến thấp",
                        icon: "💎",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value as any)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                          sortBy === option.value
                            ? "bg-orange-50 border-2 border-orange-500 text-orange-700 font-semibold"
                            : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-orange-300"
                        }`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
                    Khoảng giá
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          handlePriceRangeChange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Từ"
                        min={0}
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          handlePriceRangeChange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Đến"
                        min={0}
                      />
                    </div>

                    {/* Quick price filters */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Dưới 50k", min: 0, max: 50000 },
                        { label: "50k - 100k", min: 50000, max: 100000 },
                        { label: "100k - 200k", min: 100000, max: 200000 },
                        { label: "Trên 200k", min: 200000, max: 500000 },
                      ].map((range) => (
                        <button
                          key={range.label}
                          onClick={() =>
                            handlePriceRangeChange({
                              min: range.min,
                              max: range.max,
                            })
                          }
                          className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                            priceRange.min === range.min &&
                            priceRange.max === range.max
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-end space-x-3 mt-5 pt-5 border-t">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-5 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-sm"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <MenuCategory
            categories={categories}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />
        </div>

        {promotions.length > 0 && (
          <div className="mb-8 bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-6 overflow-hidden relative min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <Gift className="w-7 h-7 text-orange-500" />
              <h3 className="font-bold text-xl text-gray-800">
                Khuyến mãi HOT chỉ có trên Foody
              </h3>
            </div>
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${promoIndex * 100}%)` }}
            >
              {promotions.map((promo) => {
                const item = promo.product || promo.combo;
                if (typeof item === "string" || !item) return null;
                return (
                  <div key={promo.id} className="flex-shrink-0 w-full pr-4">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={`${PREFIX_IMAGE}${item.thumbnailUrl || ""} `}
                        alt={item.name}
                        onError={handleImageError}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover border-2 border-white shadow-md"
                      />
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {promo.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          Áp dụng cho:{" "}
                          <span className="font-semibold">{item.name}</span>
                        </p>
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                          Giảm {promo.discountValue}
                          {promo.discountType === "percentage" ? "%" : "đ"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {promotions.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {promotions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromoIndex(idx)}
                    aria-label={`Xem khuyến mãi ${idx + 1}`}
                    className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                      idx === promoIndex
                        ? "bg-orange-500 w-6"
                        : "bg-orange-200 w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {error ? (
            <ErrorDisplay message={error} onRetry={loadInitialData} />
          ) : loading && currentPage === 1 ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : allItems.length === 0 ? (
            <ProductNotFound />
          ) : (
            allItems.map((item) => <ProductCard key={item.id} product={item} />)
          )}
        </div>

        {!loading &&
          !error &&
          allItems.length > 0 &&
          currentPage < totalPages && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={loadingMore}
                className="px-8 py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-xl font-semibold hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 inline-flex items-center space-x-2 shadow-sm"
              >
                {loadingMore ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Xem thêm món</span>
                  </>
                )}
              </button>
            </div>
          )}
      </main>
    </div>
  );
}
