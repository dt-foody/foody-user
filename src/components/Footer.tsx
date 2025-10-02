"use client";

import Logo from "@/shared/Logo";
import SocialsList1 from "@/shared/SocialsList1";
import { CustomLink } from "@/data/types";
import React from "react";
import FooterNav from "./FooterNav";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: "1",
    title: "Về chúng tôi",
    menus: [
      { href: "#", label: "Giới thiệu" },
      { href: "#", label: "Tuyển dụng" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Liên hệ" },
    ],
  },
  {
    id: "2",
    title: "Khám phá",
    menus: [
      { href: "#", label: "Nhà hàng nổi bật" },
      { href: "#", label: "Món ăn phổ biến" },
      { href: "#", label: "Ưu đãi" },
      { href: "#", label: "Đặt bàn" },
      { href: "#", label: "Đặt giao hàng" },
    ],
  },
  {
    id: "3",
    title: "Hỗ trợ",
    menus: [
      { href: "#", label: "Trung tâm trợ giúp" },
      { href: "#", label: "Hướng dẫn đặt món" },
      { href: "#", label: "Chính sách bảo mật" },
      { href: "#", label: "Điều khoản sử dụng" },
      { href: "#", label: "Câu hỏi thường gặp" },
    ],
  },
  {
    id: "4",
    title: "Cộng đồng",
    menus: [
      { href: "#", label: "Ứng dụng di động" },
      { href: "#", label: "Đối tác nhà hàng" },
      { href: "#", label: "Đối tác giao hàng" },
      { href: "#", label: "Chương trình khách hàng thân thiết" },
      { href: "#", label: "Góp ý" },
    ],
  },
];

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
                className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <FooterNav />

      <div className="nc-Footer relative py-16 border-t border-neutral-200 dark:border-neutral-700">
        <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 ">
          <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
            <div className="col-span-2 md:col-span-1">
              <Logo />
            </div>
            <div className="col-span-2 flex items-center md:col-span-3">
              <SocialsList1 className="flex items-center space-x-3 lg:space-x-0 lg:flex-col lg:space-y-2.5 lg:items-start" />
            </div>
          </div>
          {widgetMenus.map(renderWidgetMenuItem)}
        </div>
      </div>
    </>
  );
};

export default Footer;
