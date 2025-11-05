"use client";

import React, { FC } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";

export interface MainNav2Props {
  className?: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Lưu Chỉ", subLabel: "Cà phê chỉ vừa ?", isLogo: true },
  { href: "/menu", label: "Thực đơn" },
  { href: "/blog", label: "1001 đêm" },
  { href: "/about", label: "Ấn tượng" },
];

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  const { cartCount, setShowCart } = useCart();
  const { user } = useAuthStore();

  return (
    <div className={`MainNav2 relative z-10 ${className}`}>
      <div className="px-4 h-20 lg:container flex justify-between items-center">
        {/* ====== LEFT SIDE: NAVIGATION BAR ====== */}
        <nav className="flex border border-black rounded-t-2xl overflow-hidden text-lg font-medium bg-[#fffaf0]">
          {NAV_ITEMS.map((item, index) => {
            const isLogo = item.isLogo;
            const isLast = index === NAV_ITEMS.length - 1;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-8 py-3 transition-colors duration-300
                  ${isLogo ? "rounded-tl-2xl font-serif" : ""}
                  ${!isLast ? "border-r border-black" : ""}
                  hover:bg-[#fdf6e3]
                `}
              >
                {isLogo ? (
                  <>
                    <h1 className="text-3xl font-bold font-serif leading-none">
                      Lưu Chỉ
                    </h1>
                    <span className="italic text-gray-600 text-base whitespace-nowrap">
                      Cà phê chỉ vừa ?
                    </span>
                  </>
                ) : (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ====== RIGHT SIDE: ACTIONS ====== */}
        <div className="flex items-center space-x-4 text-neutral-700 dark:text-neutral-100">
          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <NotifyDropdown user={user} />

          {/* Avatar / Login */}
          {user ? <AvatarDropdown user={user} /> : <LoginButton />}
        </div>
      </div>
    </div>
  );
};

export default MainNav2;
