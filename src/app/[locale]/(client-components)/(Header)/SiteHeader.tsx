"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { useAuthStore } from "@/stores/useAuthStore";
import HeaderMarquee from "@/components/HeaderMarquee";

// --- Cấu hình NAV_ITEMS (Copy logic định danh từ MainNav2 để so khớp) ---
const NAV_IDs = [
  { id: "homepage", href: "/" },
  { id: "sharing", href: "/sharing" },
  { id: "community", href: "/community" },
  { id: "menu", href: "/menu" },
  { id: "maps", href: "/maps" },
];

// --- Interface dữ liệu từ API ---
interface LayoutItem {
  id: string;
  title: string;
  description: string;
  enable: boolean;
}

export default function SiteHeader({ ssrUser }: { ssrUser?: any }) {
  const { setUser, fetchUser } = useAuthStore();
  const pathname = usePathname();

  // State lưu cấu hình từ API
  const [layoutSettings, setLayoutSettings] = useState<LayoutItem[]>([]);

  // 1. Logic Auth (Giữ nguyên của bạn)
  useEffect(() => {
    if (ssrUser) {
      setUser(ssrUser);
    } else {
      fetchUser();
    }
  }, [ssrUser, setUser, fetchUser]);

  // 2. Logic gọi API lấy Description
  useEffect(() => {
    const fetchLayoutSettings = async () => {
      try {
        // Thay URL này bằng endpoint thực tế của bạn
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}v1/layout-settings`);

        if (!res.ok) return;

        const data = await res.json();

        // Xử lý dữ liệu trả về tùy theo cấu trúc Backend (đã cấu hình ở bước trước)
        // Giả sử API trả về { results: [{ headerNavItems: [...] }] } hoặc trực tiếp mảng
        let items: LayoutItem[] = [];
        if (data.results && data.results.length > 0) {
          items = data.results[0].headerNavItems;
        } else if (data.headerNavItems) {
          items = data.headerNavItems;
        }

        setLayoutSettings(items || []);
      } catch (error) {
        console.error("Failed to load header descriptions", error);
      }
    };

    fetchLayoutSettings();
  }, []);

  // 3. Logic xác định Description dựa trên URL hiện tại
  const activeDescription = useMemo(() => {
    if (!pathname || layoutSettings.length === 0) return "";

    // Chuẩn hóa path (loại bỏ locale ví dụ /vi, /en) - Logic giống MainNav2
    let normalizedPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
    if (!normalizedPath) normalizedPath = "/";

    // Tìm item trong NAV_IDs khớp với URL
    const currentNav = NAV_IDs.find((item) =>
      item.href === "/"
        ? normalizedPath === "/"
        : normalizedPath.startsWith(item.href)
    );

    // Nếu tìm thấy item active và có dữ liệu trong setting -> Lấy description
    if (currentNav) {
      const setting = layoutSettings.find(
        (s) => s.id === currentNav.id && s.enable
      );
      if (setting) return setting.description;
    }

    // (Tùy chọn) Mặc định hiện description trang chủ nếu không khớp trang nào
    const homeSetting = layoutSettings.find(
      (s) => s.id === "homepage" && s.enable
    );
    return homeSetting?.description || "";
  }, [pathname, layoutSettings]);

  return (
    <>
      {/* Header Chính (Chứa MainNav2 - Giữ nguyên không sửa) */}
      <Header />

      {/* Dòng chạy quảng cáo (Chỉ hiện khi có nội dung) */}
      {activeDescription && <HeaderMarquee text={activeDescription} />}
    </>
  );
}
