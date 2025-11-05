"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import Logo from "@/shared/Logo";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

export interface MainNav2Props {
  className?: string;
}

const NAV_ITEMS = [
  { id: "menu", label: "Thực đơn", href: "/menu" },
  { id: "blog", label: "1001 đêm", href: "/blog" },
  { id: "about", label: "Ấn tượng", href: "/about" },
];

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  const { cartCount, setShowCart } = useCart();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("menu");

  return (
    <header
      className={`MainNav2 relative z-20 w-full bg-white ${className}`}
    >
      <div className="px-4 h-14 lg:container flex justify-between items-center">
        {/* LEFT ACTIONS: Logo + Curved Tabs */}
        <div className="flex items-center gap-6 h-full">
          <Logo className="w-24" />

          <nav className="hidden lg:block h-full flex items-center">
            <ul className="flex items-stretch gap-0 list-none p-0 m-0 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <li
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      relative px-8 flex items-center h-full cursor-pointer
                      ${isActive ? "bg-primary-500 rounded-t-2xl" : "bg-white"}
                    `}
                  >
                    {/* Left Curve */}
                    <span
                      className={`
                        absolute bottom-0 -left-5 w-5 h-full pointer-events-none z-10
                        ${isActive ? "opacity-100 bg-primary-500" : "opacity-0"}
                      `}
                    >
                      <span className="absolute inset-0 bg-white rounded-br-2xl" />
                    </span>

                    {/* Right Curve */}
                    <span
                      className={`
                        absolute bottom-0 -right-5 w-5 h-full pointer-events-none z-10
                        ${isActive ? "opacity-100 bg-primary-500" : "opacity-0"}
                      `}
                    >
                      <span className="absolute inset-0 bg-white rounded-bl-2xl" />
                    </span>

                    {/* Tab Label */}
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-2 no-underline transition-colors duration-300
                        ${
                          isActive
                            ? "text-white font-semibold"
                            : "text-primary-600 font-medium"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center space-x-4 text-primary-600 h-full">
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 rounded-full flex items-center justify-center transition-colors"
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
