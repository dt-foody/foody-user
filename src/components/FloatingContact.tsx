// src/components/FloatingContact.tsx
"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, X, Headset } from "lucide-react";

const MessengerIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0" />

    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M17.3 9.6C17.6314 9.15817 17.5418 8.53137 17.1 8.2C16.6582 7.86863 16.0314 7.95817 15.7 8.4L13.3918 11.4776L11.2071 9.29289C11.0021 9.08791 10.7183 8.98197 10.4291 9.00252C10.1399 9.02307 9.87393 9.16809 9.7 9.4L6.7 13.4C6.36863 13.8418 6.45817 14.4686 6.9 14.8C7.34183 15.1314 7.96863 15.0418 8.3 14.6L10.6082 11.5224L12.7929 13.7071C12.9979 13.9121 13.2817 14.018 13.5709 13.9975C13.8601 13.9769 14.1261 13.8319 14.3 13.6L17.3 9.6Z"
        fill="#ffffff"
      />{" "}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z"
        fill="#ffffff"
      />{" "}
    </g>
  </svg>
);

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Hàm bật/tắt menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-4">
      {/* --- 1. NÚT CHÍNH (TOGGLE) --- */}
      <div className="relative group">
        <button
          onClick={toggleMenu}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white transition-all duration-300 ${
            isOpen
              ? "bg-primary-500 rotate-90"
              : "bg-primary-6000 hover:scale-110"
          }`}
          title="Liên hệ với Lưu Chi"
        >
          {isOpen ? <X size={24} /> : <Headset size={24} />}
        </button>
      </div>

      {/* --- 2. DANH SÁCH CÁC NÚT CON (Hiện ra khi isOpen = true) --- */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Nút Gọi Hotline */}
        <a
          href="tel:0889058678"
          className="group relative flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        >
          {/* Tooltip (Hiện bên phải) */}
          <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
            0889.058.678
          </span>
          <Phone size={22} />
        </a>

        {/* Nút Messenger */}
        <a
          href="https://m.me/luuchi.caphechirua"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 bg-[#0084FF] text-white rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        >
          {/* Tooltip (Hiện bên phải) */}
          <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
            Chat Messenger
          </span>
          <MessengerIcon size={22} />
        </a>
      </div>
    </div>
  );
};

export default FloatingContact;
