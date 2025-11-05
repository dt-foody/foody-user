import React, { FC } from "react";
import Logo from "@/shared/Logo";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

export interface MainNav2Props {
  className?: string;
}

const NAV_ITEMS = [
  { href: "/menu", label: "Thực đơn" },
  // { href: "/hot-deal", label: "Khuyến mãi" },
  { href: "/blog", label: "1001 đêm" },
  // { href: "/membership", label: "Thành viên" },
  { href: "/about", label: "Ấn tượng" },
];

const MainNav2: FC<MainNav2Props> = ({
  className = "",
}) => {
  const { cartCount, setShowCart } = useCart();
  const { user } = useAuthStore();

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

        {/* Right actions */}
        <div className="flex items-center space-x-4 text-neutral-700 dark:text-neutral-100">
          <button
            onClick={() => setShowCart(true)}
            // Thêm padding, bo tròn và hiệu ứng focus/hover
            className={`relative p-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {/* Icon không thay đổi */}
            <ShoppingCart className="w-6 h-6" />

            {/* Badge số lượng */}
            {cartCount > 0 && (
              <span
                // Định vị badge ở góc trên bên phải của button
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 
                 bg-red-500 text-white text-xs font-bold rounded-full"
              >
                {cartCount}
              </span>
            )}
          </button>

          <NotifyDropdown user={user} />

          {user ? <AvatarDropdown /> : <LoginButton />}
        </div>
      </div>
    </div>
  );
};

export default MainNav2;
