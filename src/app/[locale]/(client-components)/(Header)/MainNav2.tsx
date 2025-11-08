"use client";

import React, { FC, useState } from "react";
import { Alex_Brush, Bahianita } from "next/font/google";
import { useRouter } from "next/navigation";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import { ShoppingCart } from "lucide-react";
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
];

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  const { cartCount, setShowCart } = useCart();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("menu");
  const router = useRouter(); // ✅ Khởi tạo router

  return (
    <header
      className={`MainNav2 relative z-20 w-full bg-white`}
    >
      <div className="h-16 flex justify-between items-center text-[1.7rem]">
        {/* LEFT ACTIONS: Logo + Curved Tabs */}
        <div className="flex items-center gap-6 h-full">
          <nav className={`hidden lg:block h-full flex items-center ${bahianita.className}`}>
            <ul className="flex items-stretch gap-0 list-none p-0 m-0 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <li
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      router.push(item.href); // ✅ Chuyển trang khi click
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
        <div className="flex items-center flex-1 justify-end space-x-2 text-primary-600 h-full border-b-2 border-black pr-3">
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
