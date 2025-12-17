"use client";

import React, { FC, useState, useEffect } from "react";
import { Alex_Brush, Bahianita } from "next/font/google";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import AddressDropdown from "./AddressDropdown";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import MenuBar from "@/shared/MenuBar";

// --- Cấu hình Font ---
const alexbrush = Alex_Brush({ subsets: ["latin"], weight: "400" });
const bahianita = Bahianita({
  weight: "400",
  subsets: ["latin"],
});

// --- Config Menu Items ---
const NAV_ITEMS = [
  {
    id: "homepage",
    label: "Lưu Chi",
    sizeLabel: "2.5rem",
    classLabel: "font-bahianita",
    sublabel: "Cà phê chi rứa?",
    classSublabel: "font-alexbrush",
    href: "/",
  },
  { id: "menu", label: "Thực đơn", sizeLabel: "1rem", href: "/menu" },
  {
    id: "sharing",
    // Sử dụng JSX Fragment để bọc chuỗi và span gạch ngang
    label: (
      <>
        Chúng{" "}
        <span
          className="relative inline-block px-1
      after:content-['']
      after:absolute
      after:left-0 after:right-0
      after:top-1/2
      after:h-[1.5px]
      after:bg-current
    "
        >
          tôi
        </span>{" "}
        ta
      </>
    ),
    sizeLabel: "1rem",
    href: "/sharing",
  },
  { id: "community", label: "Ở đây.", sizeLabel: "1rem", href: "/community" },
  // { id: "about", label: "Ấn tượng", sizeLabel: "1rem", href: "/about" },
  { id: "policy", label: "Chính sách", sizeLabel: "1rem", href: "/policy" },
];

export interface MainNav2Props {
  className?: string;
}

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  // --- Hooks ---
  const { cartCount, setShowCart, syncUserAddress } = useCart();
  const { user, me } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại (VD: /vi/menu)

  // --- State ---
  const [activeTab, setActiveTab] = useState("homepage");

  // --- Effect 1: Xử lý Active Tab dựa trên URL đa ngôn ngữ ---
  useEffect(() => {
    if (!pathname) return;

    // 1. Chuẩn hóa đường dẫn: Loại bỏ locale (vd: /vi, /en, /ar) khỏi path
    // Regex logic: Tìm chuỗi bắt đầu bằng "/" + 2 chữ cái + ("/" tiếp theo hoặc kết thúc chuỗi)
    let normalizedPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");

    // Nếu sau khi replace mà chuỗi rỗng (trường hợp vào trang chủ /vi), gán lại là "/"
    if (!normalizedPath) normalizedPath = "/";
    // Nếu pathname là "/vi/menu" -> normalizedPath thành "/menu"

    // 2. Tìm Item tương ứng trong NAV_ITEMS
    const foundItem = NAV_ITEMS.find(
      (item) =>
        item.href === "/"
          ? normalizedPath === "/" // Trang chủ phải khớp chính xác
          : normalizedPath.startsWith(item.href) // Trang con (vd /menu/detail) chỉ cần bắt đầu bằng
    );

    // 3. Set Active Tab
    if (foundItem) {
      setActiveTab(foundItem.id);
    } else {
      // Trường hợp trang 404 hoặc trang không có trong menu, có thể reset về rỗng hoặc giữ nguyên
      setActiveTab("");
    }
  }, [pathname]);

  // --- Effect 2: Đồng bộ địa chỉ khi có user ---
  useEffect(() => {
    if (me) {
      syncUserAddress(me);
    }
  }, [me, syncUserAddress]);

  // --- Render ---
  return (
    <header className={`MainNav2 relative z-20 w-full bg-white ${className}`}>
      <div className="h-16 flex justify-between items-center text-[1.7rem]">
        {/* --- LEFT: Logo & Navigation --- */}
        <div className="flex items-center gap-6 h-full">
          {/* Mobile Menu Icon (< md) */}
          <div className="flex md:hidden items-center border-b-2 border-black h-full">
            <MenuBar iconClassName="w-8 h-8" />
            <div
              className={`flex items-center gap-2 no-underline transition-colors duration-300 text-black ${bahianita.className}`}
            >
              <span> Lưu Chi </span>
              <span
                className={`text-[1.3rem] ml-2 font-normal text-neutral-600 ${alexbrush.className} mt-[4px]`}
              >
                Cà phê chi rứa?
              </span>
            </div>
          </div>

          {/* Desktop Navigation (>= md) */}
          <nav
            className={`hidden md:block h-full flex items-center ${bahianita.className}`}
          >
            <ul className="flex items-stretch gap-0 list-none p-0 m-0 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <li
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id); // Set ngay để UI phản hồi nhanh
                      router.push(item.href); // Chuyển trang
                    }}
                    className={`
                      relative px-8 flex items-center h-full cursor-pointer select-none
                      ${
                        isActive
                          ? "bg-neutral-50 rounded-t-xl border-2 border-b-0 border-black"
                          : "bg-white border-b-2 border-black"
                      }
                    `}
                  >
                    {/* Left Curve Decoration */}
                    <span
                      className={`
                        absolute bottom-0 -left-4 w-4 h-4 pointer-events-none z-10
                        ${isActive ? "opacity-100 bg-neutral-50" : "opacity-0"}
                      `}
                    >
                      <span className="absolute inset-0 bg-white rounded-br-xl border-2 border-black border-t-0 border-l-0" />
                    </span>

                    {/* Right Curve Decoration */}
                    <span
                      className={`
                        absolute bottom-0 -right-4 w-4 h-4 pointer-events-none z-10
                        ${isActive ? "opacity-100 bg-neutral-50" : "opacity-0"}
                      `}
                    >
                      <span className="absolute inset-0 bg-white rounded-bl-xl border-2 border-black border-t-0 border-r-0" />
                    </span>

                    {/* Content Label */}
                    <div className="flex items-center gap-2 no-underline transition-colors duration-300 text-black">
                      <span className={item.classLabel || ""}>
                        {" "}
                        {item.label}{" "}
                      </span>
                      {item.sublabel && (
                        <span
                          className={`text-[1.3rem] ml-2 font-normal text-neutral-600 ${alexbrush.className} mt-[4px]`}
                        >
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* --- RIGHT: Actions (Address, Cart, User) --- */}
        <div className="flex items-center flex-1 justify-end space-x-4 text-primary-600 h-full border-b-2 border-black pr-3">
          {/* Address Dropdown */}
          {user && (
            <div className="hidden lg:block">
              <AddressDropdown />
            </div>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative rounded-full flex items-center justify-center transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notify (Optional - Commented out) */}
          {/* <NotifyDropdown user={user} /> */}

          {/* User Avatar / Login */}
          {user ? <AvatarDropdown user={user} /> : <LoginButton />}
        </div>
      </div>
    </header>
  );
};

export default MainNav2;
