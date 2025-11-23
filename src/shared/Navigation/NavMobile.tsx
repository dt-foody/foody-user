"use client";

import { Alex_Brush, Bahianita } from "next/font/google";
import React from "react";
import ButtonClose from "@/shared/ButtonClose";
import Link from "next/link";
export interface NavMobileProps {
  onClickClose?: () => void;
}

const alexbrush = Alex_Brush({ subsets: ["latin"], weight: "400" });
const bahianita = Bahianita({
  weight: "400",
  subsets: ["latin"],
});

const NAV_ITEMS = [
  { id: "homepage", label: "Trang chủ", href: "/" },
  { id: "menu", label: "Thực đơn", href: "/menu" },
  { id: "blog", label: "1001 đêm", href: "/blog" },
  { id: "about", label: "Ấn tượng", href: "/about" },
  { id: "policy", label: "Chính sách", href: "/policy" },
];

const NavMobile: React.FC<NavMobileProps> = ({ onClickClose }) => {
  return (
    <div className="overflow-y-auto w-full h-screen py-4 shadow-lg bg-white dark:bg-neutral-900">
      {/* HEADER */}
      <div className="flex items-center mb-2">
        <span className={`text-3xl mx-6 ${bahianita.className}`}>Lưu Chi</span>
        <span className={`text-2xl ${alexbrush.className}`}>
          Cà phê chi rứa?
        </span>

        <span className="absolute right-2 top-2 p-1">
          <ButtonClose onClick={onClickClose} />
        </span>
      </div>

      {/* MENU ITEMS */}
      <ul
        className={`flex flex-col px-4 space-y-2 py-4 border-t border-neutral-200 dark:border-neutral-700 ${bahianita.className}`}
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              onClick={onClickClose}
              className="block w-full px-3 py-3 rounded-lg text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-2xl"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavMobile;
