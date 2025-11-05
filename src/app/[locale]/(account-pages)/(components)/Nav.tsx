"use client";

// Import 'Route' có thể không còn cần thiết nếu bạn không dùng nó ở nơi khác
// vì chúng ta đang định nghĩa cấu trúc dữ liệu ngay tại đây.
// import { Route } from "@/routers/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// 1. ĐỊNH NGHĨA CẤU TRÚC MỚI CHO NAVIGATION
interface NavItem {
  href: string; // Đường dẫn URL
  label: string; // Tên hiển thị (Tiếng Việt)
}

export const Nav = () => {
  const pathname = usePathname();

  // 2. CẬP NHẬT DANH SÁCH NAV VỚI TEXT TIẾNG VIỆT
  // (Bạn không cần khai báo kiểu `Route[]` nữa,
  // TypeScript sẽ tự hiểu kiểu là `NavItem[]`)
  const listNav: NavItem[] = [
    { href: "/account", label: "Thông tin tài khoản" },
    { href: "/account-password", label: "Đổi mật khẩu" },
    // Bạn có thể dễ dàng thêm các mục khác
    // { href: "/account-orders", label: "Đơn hàng của tôi" },
    // { href: "/account-address", label: "Sổ địa chỉ" },
  ];

  return (
    <div className="container">
      <div className="flex space-x-8 md:space-x-14 overflow-x-auto hiddenScrollbar">
        {listNav.map((item) => {
          // 3. SO SÁNH PATHNAME VỚI item.href
          const isActive = pathname === item.href;
          return (
            <Link
              // 4. SỬ DỤNG item.href CHO key VÀ href
              key={item.href}
              href={item.href}
              className={`block py-4 border-b-2 flex-shrink-0 ${
                isActive
                  ? "border-primary-500 font-medium"
                  : "border-transparent"
              }
              `}
              // Xóa 'capitalize' vì chúng ta đã tự định nghĩa text
            >
              {/* 5. HIỂN THỊ TEXT TỪ item.label */}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
