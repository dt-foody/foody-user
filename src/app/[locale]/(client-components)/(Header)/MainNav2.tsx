import React, { FC } from "react";
import Logo from "@/shared/Logo";
import MenuBar from "@/shared/MenuBar";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import HeroSearchForm2MobileFactory from "../(HeroSearchForm2Mobile)/HeroSearchForm2MobileFactory";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export interface MainNav2Props {
  className?: string;
  isLoggedIn?: boolean;
}

const NAV_ITEMS = [
  { href: "/menu", label: "Menu" },
  { href: "/hot-deal", label: "Hot Deal" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/membership", label: "Thành viên" },
];

const MainNav2: FC<MainNav2Props> = ({ className = "", isLoggedIn = false }) => {
  return (
    <div className={`MainNav2 relative z-10 ${className}`}>
      <div className="px-4 h-20 lg:container flex justify-between items-center">
        {/* Logo + Nav */}
        <div className="flex items-center space-x-8">
          <Logo className="w-24" />

          <nav className="hidden lg:flex space-x-6 text-sm font-medium text-neutral-700 dark:text-neutral-100">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative pb-1 transition-colors duration-300 hover:text-primary-600
                          after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary-600
                          after:w-0 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Search mobile */}
        <div className="lg:hidden flex-1 px-3">
          <HeroSearchForm2MobileFactory />
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-4 text-neutral-700 dark:text-neutral-100">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full 
                       bg-primary-100 text-primary-600 hover:bg-primary-600 
                       hover:text-white transition"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          <NotifyDropdown />

          {!isLoggedIn ? <LoginButton /> : <AvatarDropdown />}

          {/* Hamburger menu cho mobile */}
          <div className="lg:hidden">
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav2;
