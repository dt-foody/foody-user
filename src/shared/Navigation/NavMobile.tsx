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
  {
    id: "homepage",
    label: "Lưu Chi",
    sizeLabel: "2.5rem",
    classLabel: "font-bahianita",
    sublabel: "Cà phê chi rứa?",
    classSublabel: "font-alexbrush",
    href: "/",
  },
  {
    id: "sharing",
    // Sử dụng JSX Fragment để bọc chuỗi và span gạch ngang
    label: (
      <>
        Chúng <span className="line-through px-1">tôi</span> ta
      </>
    ),
    sizeLabel: "1rem",
    href: "/sharing",
  },
  { id: "community", label: "Ở đây.", sizeLabel: "1rem", href: "/community" },
  // { id: "about", label: "Ấn tượng", sizeLabel: "1rem", href: "/about" },
  // { id: "policy", label: "Chính sách", sizeLabel: "1rem", href: "/policy" },
  { id: "menu", label: "Thực đơn", sizeLabel: "1rem", href: "/menu" },
  { id: "maps", label: "Lối đi", sizeLabel: "1rem", href: "/maps" },
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
