"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import { Alex_Brush, Bahianita } from "next/font/google";
import { useRouter } from "next/navigation";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import AddressDropdown from "./AddressDropdown";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

export interface MainNav2Props {
  className?: string;
}

const alexbrush = Alex_Brush({ subsets: ["latin"], weight: "400" });
const bahianita = Bahianita({
  weight: "400",
  subsets: ["latin"],
});

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
  { id: "blog", label: "1001 đêm", sizeLabel: "1rem", href: "/blog" },
  { id: "about", label: "Ấn tượng", sizeLabel: "1rem", href: "/about" },
  { id: "policy", label: "Chính sách", sizeLabel: "1rem", href: "/policy" },
];

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  const { cartCount, setShowCart, syncUserAddress } = useCart();
  const { user, me } = useAuthStore();
  const [activeTab, setActiveTab] = useState("homepage");
  const [isTabsMenuOpen, setIsTabsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // EFFECT: Tự động đồng bộ địa chỉ mặc định khi user đăng nhập
  useEffect(() => {
    if (me) {
      syncUserAddress(me);
    }
  }, [me, syncUserAddress]);

  // EFFECT: Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsTabsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTabsMenuOpen(false);
      }
    };

    if (isTabsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isTabsMenuOpen]);

  const handleTabClick = (item: typeof NAV_ITEMS[0]) => {
    setActiveTab(item.id);
    router.push(item.href);
    setIsTabsMenuOpen(false);
  };

  return (
    <header className={`MainNav2 relative z-20 w-full bg-white`}>
      <div className="h-16 flex justify-between items-center text-[1.7rem]">
        {/* LEFT ACTIONS: Logo + Curved Tabs + Mobile Menu */}
        <div className="flex items-center gap-4 h-full">
          {/* Mobile Tabs Menu Button */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsTabsMenuOpen(!isTabsMenuOpen)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg
                transition-colors
                ${
                  isTabsMenuOpen
                    ? "bg-neutral-100 text-black"
                    : "text-neutral-600 hover:bg-neutral-50"
                }
              `}
              aria-label="Toggle Menu"
            >
              {isTabsMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Mobile Dropdown Menu */}
            {isTabsMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border-2 border-black py-2 z-50">
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase border-b-2 border-neutral-200">
                  Menu
                </div>
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item)}
                      className={`
                        w-full text-left px-4 py-3 text-base transition-colors
                        ${
                          isActive
                            ? "bg-neutral-50 text-black font-semibold border-l-4 border-black"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }
                      `}
                    >
                      {item.label}
                      {item.sublabel && (
                        <span
                          className={`block text-sm text-neutral-500 mt-1 ${alexbrush.className}`}
                        >
                          {item.sublabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center pl-4">
            <span
              onClick={() => {
                setActiveTab("homepage");
                router.push("/");
              }}
              className={`text-[2rem] cursor-pointer ${bahianita.className}`}
            >
              Lưu Chi
            </span>
          </div>
          {/* Desktop Curved Tabs Navigation */}
          <nav
            className={`hidden md:block h-full flex items-center ${bahianita.className}`}
          >
            <ul className="flex items-stretch gap-0 list-none p-0 m-0 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <li
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={`
                      relative px-8 flex items-center h-full cursor-pointer select-none
                      ${
                        isActive
                          ? "bg-neutral-50 rounded-t-xl border-2 border-b-0 border-black"
                          : "bg-white border-b-2 border-black"
                      }
                    `}
                  >
                    {/* Left Curve */}
                    <span
                      className={`
                        absolute bottom-0 -left-4 w-4 h-4 pointer-events-none z-10
                        ${isActive ? "opacity-100 bg-neutral-50" : "opacity-0"}
                      `}
                    >
                      <span className="absolute inset-0 bg-white rounded-br-xl border-2 border-black border-t-0 border-l-0" />
                    </span>

                    {/* Right Curve */}
                    <span
                      className={`
                        absolute bottom-0 -right-4 w-4 h-4 pointer-events-none z-10
                        ${isActive ? "opacity-100 bg-neutral-50" : "opacity-0"}
                      `}
                    >
                      <span className="absolute inset-0 bg-white rounded-bl-xl border-2 border-black border-t-0 border-r-0" />
                    </span>

                    {/* Tab Label */}
                    <div
                      className={`
                        flex items-center gap-2 no-underline transition-colors duration-300 text-black
                      `}
                    >
                      <span> {item.label} </span>
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

        {/* RIGHT ACTIONS */}
        <div className="flex items-center flex-1 justify-end space-x-4 text-primary-600 h-full border-b-2 border-black pr-3">
          {/* ADDRESS DROPDOWN (Chỉ hiện khi đã login) */}
          {user && (
            <div className="hidden lg:block">
              <AddressDropdown />
            </div>
          )}

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

          <NotifyDropdown user={user} />

          {user ? <AvatarDropdown user={user} /> : <LoginButton />}
        </div>
      </div>
    </header>
  );
};

export default MainNav2;