"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Gift } from "lucide-react";
import { Product, Combo } from "@/types";

// Components
import ProductCard from "@/components/ProductCard";
import ComboCard from "@/components/ComboCard";
import ProductNotFound from "@/components/ProductNotFound";
import MenuCategory from "@/components/MenuCategory";
import { useCartStore } from "@/stores/useCartStore";

interface FoodyMenuClientProps {
  initialFlashSaleCategory: any;
  initialThucDon: any[];
  initialCombos: any[];
}

export default function FoodyMenuClient({
  initialFlashSaleCategory,
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

  const { startProductConfiguration, startComboConfiguration } = useCartStore();

  // --- REF QUẢN LÝ SCROLL ---
  const isProgrammaticScroll = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // --- DATA HIỂN THỊ (Không còn filter theo search) ---
  const categoriesToDisplay = initialThucDon;
  const combosToDisplay = initialCombos;

  // Tạo danh sách tab cho thanh MenuCategory
  const categoryTabs = useMemo(() => {
    return initialThucDon
      .filter((c) => c.id !== "flashsale") // Ẩn category flash sale khỏi thanh tab thường (nếu muốn)
      .map((c) => ({ id: c.id, name: c.name, priority: c.priority }));
  }, [initialThucDon]);

  // --- LOGIC CUỘN & CLICK TAB ---
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
      elementId = `category-${id}`;
    } else if (type === "combo") {
      elementId = "section-combo";
    } else if (id === "all") {
      elementId = "main-content";
    } else {
      elementId = `category-${id}`;
    }

    const element = document.getElementById(elementId);

    if (element) {
      // Trường hợp tìm thấy phần tử -> Scroll đến phần tử đó
      const yOffset = -170; // Offset cho header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    } else if (type === "flashsale") {
      // ✅ CẬP NHẬT: Trường hợp Flashsale tìm không ra ID -> Scroll lên đầu trang
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Reset cờ sau khi animation cuộn kết thúc (ước lượng 1s)
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  // --- INTERSECTION OBSERVER (SCROLL SPY) ---
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Không làm gì nếu người dùng đang chủ động click cuộn
      if (isProgrammaticScroll.current) return;

      // Tìm entry đang ở trên cùng của "vùng nóng"
      const topEntry = entries.find((e) => e.isIntersecting);

      if (topEntry) {
        const type = topEntry.target.getAttribute("data-scroll-spy-type") as
          | "category"
          | "combo"
          | "flashsale";
        const id = topEntry.target.getAttribute("data-scroll-spy-id")!;

        // Chỉ set state nếu khác state hiện tại để tránh re-render thừa
        setActiveTab((prev) =>
          prev.type === type && prev.id === id ? prev : { type, id }
        );
      }
    };

    const options = {
      rootMargin: "-150px 0px -55% 0px", // Căn chỉnh vùng nhận diện active
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(observerCallback, options);
    const currentObserver = observerRef.current;

    // Lấy tất cả các section và bắt đầu theo dõi
    const sections = document.querySelectorAll("[data-scroll-spy-id]");
    sections.forEach((section) => currentObserver.observe(section));

    return () => {
      sections.forEach((section) => currentObserver.unobserve(section));
    };
  }, [categoriesToDisplay, combosToDisplay]); // Chạy lại khi data thay đổi

  const hasCombos = combosToDisplay.length > 0;
  const hasProducts = categoriesToDisplay.length > 0;
  const isNotFound = !hasCombos && !hasProducts && !initialFlashSaleCategory;

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

        {/* --- SECTION FLASH SALE --- */}
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
              {initialFlashSaleCategory.products.map((item: any) => {
                // Kiểm tra logic Type: Combo hoặc Product
                if (item.type === "Combo") {
                  return (
                    <ComboCard
                      key={item.id}
                      combo={item}
                      onClick={() => startComboConfiguration(item as Combo)}
                    />
                  );
                }
                // Mặc định là Product
                return (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onClick={() => startProductConfiguration(item as Product)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* --- SECTION COMBO --- */}
        {hasCombos && (
          <section
            id="section-combo"
            className="my-6"
            data-scroll-spy-type="combo"
            data-scroll-spy-id="combo"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Combo</h2>
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

        {/* --- SECTION PRODUCTS (Categories thường) --- */}
        {hasProducts &&
          categoriesToDisplay.map((group) => (
            <section
              key={group.id}
              id={`category-${group.id}`}
              className="my-6"
              data-scroll-spy-type={
                group.id === "flashsale" ? "flashsale" : "category"
              }
              data-scroll-spy-id={group.id}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                {group.id === "flashsale" && (
                  <Gift className="w-6 h-6 text-primary-500 mr-2" />
                )}
                {group.name}
                {group.id === "flashsale" && " 🔥"}
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

        {/* --- SECTION NOT FOUND --- */}
        {isNotFound && <ProductNotFound />}
      </main>
    </div>
  );
}
