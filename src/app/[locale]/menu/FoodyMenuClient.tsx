"use client";

// --- THÊM MỚI --- (Import useEffect và useRef)
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Gift, X } from "lucide-react";
import { Product, Combo, PricePromotion } from "@/types";

// Components
import ProductCard from "@/components/ProductCard";
import ComboCard from "@/components/ComboCard";
import ProductNotFound from "@/components/ProductNotFound";
import MenuCategory from "@/components/MenuCategory";
import { useCartStore } from "@/stores/useCartStore";

interface FoodyMenuClientProps {
  initialFlashSaleCategory: any;
  initialFlashSales: any[];
  initialThucDon: any[];
  initialCombos: any[];
}

export default function FoodyMenuClient({
  initialFlashSaleCategory,
  initialFlashSales,
  initialThucDon,
  initialCombos,
}: FoodyMenuClientProps) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<{
    type: "category" | "combo" | "flashsale";
    id: string;
  }>({
    type: "category",
    id: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { startProductConfiguration, startComboConfiguration } = useCartStore();

  // --- THÊM MỚI --- (Ref để quản lý trạng thái cuộn)
  const isProgrammaticScroll = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // --- (Các hàm useMemo giữ nguyên) ---
  const categoriesToDisplay = useMemo(() => {
    return initialThucDon
      .map((category) => ({
        ...category,
        products: category.products.filter((product: any) =>
          product.name.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [initialThucDon, normalizedQuery]);

  const combosToDisplay = useMemo(() => {
    return initialCombos.filter((combo) =>
      combo.name.toLowerCase().includes(normalizedQuery)
    );
  }, [initialCombos, normalizedQuery]);

  const categoryTabs = useMemo(() => {
    return initialThucDon
      .filter((c) => c.id !== "flash_sale_category")
      .map((c) => ({ id: c.id, name: c.name, priority: c.priority }));
  }, [initialThucDon]);

  const handleTabClick = (
    type: "category" | "combo" | "flashsale",
    id: string
  ) => {
    // 1. Đặt cờ để tạm dừng observer
    isProgrammaticScroll.current = true;

    // 2. Cập nhật tab active ngay lập tức
    setActiveTab({ type, id });

    let elementId = "";
    if (type === "flashsale") {
      elementId = `category-${id}`; // id là 'flash_sale_category'
    } else if (type === "combo") {
      elementId = "section-combo";
    } else if (id === "all") {
      elementId = "main-content";
    } else {
      elementId = `category-${id}`;
    }

    const element = document.getElementById(elementId);

    if (element) {
      const yOffset = -170; // header + MenuCategory cao 150px
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Không làm gì nếu người dùng đang chủ động click cuộn
      if (isProgrammaticScroll.current) return;

      // Tìm entry đang ở trên cùng của "vùng nóng"
      const topEntry = entries.find((e) => e.isIntersecting);

      console.log("topEntry", topEntry);

      if (topEntry) {
        const type = topEntry.target.getAttribute("data-scroll-spy-type") as
          | "category"
          | "combo"
          | "flashsale";
        const id = topEntry.target.getAttribute("data-scroll-spy-id")!;
        setActiveTab({ type, id });
      }
    };

    const options = {
      rootMargin: "-150px 0px -55% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(observerCallback, options);
    const currentObserver = observerRef.current;

    // Lấy tất cả các section và bắt đầu theo dõi
    const sections = document.querySelectorAll("[data-scroll-spy-id]");
    sections.forEach((section) => currentObserver.observe(section));

    // Dọn dẹp khi component unmount
    return () => {
      sections.forEach((section) => currentObserver.unobserve(section));
    };
    // Chạy lại khi danh sách section thay đổi (do tìm kiếm)
  }, [categoriesToDisplay, combosToDisplay]);

  const hasCombos = combosToDisplay.length > 0;
  const hasProducts = categoriesToDisplay.length > 0;
  const isNotFound = !hasCombos && !hasProducts;

  // --- RENDER ---
  return (
    <div className="min-h-screen">
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-0 scroll-mt-20"
        data-scroll-spy-type="category"
        data-scroll-spy-id="all"
      >
        <MenuCategory
          categories={categoryTabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />

        {initialFlashSaleCategory && (
          <section
            id={`category-${initialFlashSaleCategory.id}`}
            className="my-6"
            data-scroll-spy-type="flashsale"
            data-scroll-spy-id={initialFlashSaleCategory.id}
          >
            <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              {initialFlashSaleCategory.name} 🔥
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialFlashSaleCategory.products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => startProductConfiguration(product)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 1. Render Combos (nếu có) */}
        {hasCombos && (
          <section
            id="section-combo"
            className="my-6"
            // --- CẬP NHẬT --- Thêm data-scroll-spy-*
            data-scroll-spy-type="combo"
            data-scroll-spy-id="combo"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Combo Đặc Biệt
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {combosToDisplay.map((combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  onClick={() => startComboConfiguration(combo as Combo)}
                />
              ))}
            </div>
          </section>
        )}

        <>
          {/* 2. Render Products (đã nhóm theo category) */}
          {hasProducts &&
            categoriesToDisplay.map((group) => (
              <section
                key={group.id}
                id={`category-${group.id}`}
                className="my-6"
                // --- CẬP NHẬT --- Thêm data-scroll-spy-*
                data-scroll-spy-type={
                  group.id === "flash_sale_category" ? "flashsale" : "category"
                }
                data-scroll-spy-id={group.id}
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  {group.id === "flash_sale_category" && (
                    <Gift className="w-6 h-6 text-primary-500 mr-2" />
                  )}
                  {group.name}
                  {group.id === "flash_sale_category" && " 🔥"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.products.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() =>
                        startProductConfiguration(product as Product)
                      }
                    />
                  ))}
                </div>
              </section>
            ))}

          {/* 3. Hiển thị "Không tìm thấy" */}
          {isNotFound && <ProductNotFound />}
        </>
      </main>
    </div>
  );
}
