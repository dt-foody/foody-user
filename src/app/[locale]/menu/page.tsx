"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Gift, Loader, X } from "lucide-react";
import Image from "next/image";
import {
  Category,
  Product,
  Combo,
  PricePromotion,
  MenuItem,
  GroupedCategory,
} from "@/types";

import SkeletonCard from "@/components/SkeletonCard";
import ProductCard from "@/components/ProductCard";
import ProductNotFound from "@/components/ProductNotFound";
import MenuCategory from "@/components/MenuCategory";
import ErrorDisplay from "@/components/ErrorDisplay";
import { categoryService, comboService, productService } from "@/services";
import { pricePromotionService } from "@/services/pricePromotion.service";
import { PREFIX_IMAGE } from "@/constants";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
const ITEMS_PER_PAGE = 12;

export default function FoodyMenuContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedCategory[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [promotions, setPromotions] = useState<PricePromotion[]>([]);
  const [activeTab, setActiveTab] = useState<{
    type: "category" | "combo";
    id: string;
  }>({
    type: "category",
    id: "all",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [promoIndex, setPromoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const initedRef = useRef(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // --- HELPERS ---
  const buildCategoryTree = useCallback((cats: Category[]): Category[] => {
    return cats
      .filter((c) => !c.parent)
      .map((p) => ({
        ...p,
        image: p.image ? `${PREFIX_IMAGE}${p.image}` : "",
      }));
  }, []);

  // --- LOAD ITEMS ---
  const loadItems = useCallback(
    async ({
      isInitial = false,
      page = currentPage,
      tab = activeTab,
      search = searchQuery,
    }: {
      isInitial?: boolean;
      page?: number;
      tab?: { type: "category" | "combo"; id: string };
      search?: string;
    } = {}) => {
      const myReqId = ++reqIdRef.current;
      if (!isInitial) {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);
        setError(null);
      }

      try {
        const params: any = {
          ...(tab.type === "category" &&
            tab.id !== "all" && { category: tab.id }),
          ...(search && { search }),
          page,
          limit: ITEMS_PER_PAGE,
        };

        const data: any =
          tab.type === "combo"
            ? await comboService.getAll(params)
            : await productService.groupByCategory(params);

        if (reqIdRef.current !== myReqId) return;

        if (tab.type === "combo") {
          const formatted = (data.results || []).map((item: any) => ({
            ...item,
            thumbnailUrl: item.thumbnailUrl
              ? `${PREFIX_IMAGE}${item.thumbnailUrl}`
              : "",
          }));
          setCombos((prev) =>
            page === 1 ? formatted : [...prev, ...formatted]
          );
        } else {
          const formattedGroups: GroupedCategory[] = (data || []).map(
            (group: any) => ({
              category: group.category,
              totalProducts: group.totalProducts,
              products: group.products.map((p: any) => ({
                ...p,
                thumbnailUrl: p.thumbnailUrl
                  ? `${PREFIX_IMAGE}${p.thumbnailUrl}`
                  : "",
              })),
            })
          );

          setGroupedProducts((prev) =>
            page === 1 ? formattedGroups : [...prev, ...formattedGroups]
          );
        }

        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (reqIdRef.current === myReqId)
          setError(err?.message || "Một lỗi không xác định đã xảy ra.");
      } finally {
        if (reqIdRef.current === myReqId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [activeTab, currentPage, searchQuery]
  );

  // --- INITIAL LOAD (ONLY ONCE) ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [catData, promoData] = await Promise.all([
          categoryService.getAll({}),
          pricePromotionService.getAll({
            populate: "product;combo",
            isActive: true,
            limit: 10,
          }),
        ]);

        // --- Xử lý categories ---
        setCategories(buildCategoryTree(catData.results || []));

        // --- Xử lý promotions ---
        const validPromotions = (promoData.results || [])
          .filter(
            (p: PricePromotion) =>
              (p.product && typeof p.product === "object") ||
              (p.combo && typeof p.combo === "object")
          )
          .map((p: PricePromotion) => {
            const item: any = p.product || p.combo;
            const basePrice = item?.basePrice ?? item?.comboPrice ?? 0;

            let originalPrice = basePrice;
            let finalPrice = basePrice;

            if (p.discountType === "percentage") {
              finalPrice = basePrice * (1 - p.discountValue / 100);
            } else {
              finalPrice = basePrice - p.discountValue;
            }

            if (finalPrice < 0) finalPrice = 0;

            return {
              ...p,
              item,
              discount: item,
              originalPrice,
              price: Number(finalPrice.toFixed(0)),
            };
          });

        setPromotions(validPromotions);

        // --- Load sản phẩm ban đầu ---
        await loadItems({ isInitial: true });
        initedRef.current = true;
      } catch (err: any) {
        setError(err?.message || "Không thể tải dữ liệu ban đầu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []); // chỉ chạy 1 lần

  // --- RELOAD ITEMS on tab/page change ---
  useEffect(() => {
    if (!initedRef.current) return;
    loadItems({ page: currentPage, tab: activeTab, search: searchQuery });
  }, [activeTab, currentPage]);

  // --- SEARCH debounce ---
  useEffect(() => {
    if (!initedRef.current) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadItems({ page: 1, tab: activeTab, search: searchQuery });
    }, 500);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // --- APPLY PROMOTION ---
  const applyPromotions = useCallback(
    (items: Product[]): MenuItem[] => {
      const getDiscount = (id: string) =>
        promotions.find(
          (p) =>
            (p.product as Product)?.id === id || (p.combo as Combo)?.id === id
        );

      return items.map((item) => {
        const discount = getDiscount(item.id);
        let finalPrice = item.basePrice;
        let originalPrice: number | undefined;

        if (discount) {
          originalPrice = finalPrice;
          finalPrice =
            discount.discountType === "percentage"
              ? finalPrice * (1 - discount.discountValue / 100)
              : finalPrice - discount.discountValue;
          if (finalPrice < 0) finalPrice = 0;
        }

        return {
          ...item,
          type: "product" as const,
          price: Number(finalPrice),
          originalPrice,
          discount: discount || null,
          image: item.thumbnailUrl,
          reviews: 1000,
          rating: 5.0,
        };
      });
    },
    [promotions]
  );

  // --- HANDLERS ---
  const handleTabClick = (type: "category" | "combo", id: string) => {
    if (activeTab.type === type && activeTab.id === id) return;
    setCurrentPage(1);
    setGroupedProducts([]);
    setCombos([]);
    setActiveTab({ type, id });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen">
      <header className="backdrop-blur-lg border-b z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm món ăn, combo, đồ uống..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[500px] pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MenuCategory
          categories={categories}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />

        {promotions.length > 0 && (
          <section className="my-8">
            <div className="flex items-center space-x-3 mb-4">
              <Gift className="w-7 h-7 text-primary-500" />
              <h2 className="font-bold text-xl text-gray-800">Flash Sale 🔥</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <ProductCard key={promo.id} product={promo as any} />
              ))}
            </div>
          </section>
        )}

        {error ? (
          <ErrorDisplay
            message={error}
            onRetry={() => loadItems({ isInitial: true })}
          />
        ) : loading && currentPage === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : groupedProducts.length === 0 ? (
          <ProductNotFound />
        ) : (
          groupedProducts.map((group) => (
            <section key={group.category?.id || "no-cat"} className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {group.category?.name || "Không có danh mục"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {applyPromotions(group.products).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          ))
        )}

        {!loading &&
          !error &&
          groupedProducts.length > 0 &&
          currentPage < totalPages && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={loadingMore}
                className="px-8 py-3 bg-white border-2 border-primary-500 text-primary-500 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all disabled:opacity-50 inline-flex items-center space-x-2 shadow-sm"
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
