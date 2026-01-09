// src/components/FloatingContact.tsx
"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";

const FloatingContact = () => {
  return (
    // [FIX]: Xóa class 'group' ở thẻ cha này đi
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
      {/* --- Nút Messenger --- */}
      <a
        href="https://m.me/luuchi.caphechirua"
        target="_blank"
        rel="noopener noreferrer"
        // [FIX]: Thêm class 'group' vào thẻ a này
        className="group relative flex items-center justify-center w-12 h-12 bg-[#0084FF] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        title="Nhắn tin Messenger"
      >
        {/* Tooltip */}
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
          Chat Facebook
        </span>

        <MessageCircle size={24} />
      </a>

      {/* --- Nút Gọi Hotline --- */}
      <div className="relative group">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
        <a
          href="tel:0889058678"
          className="relative flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
          title="Gọi Hotline"
        >
          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
            0889.058.678
          </span>
          <Phone size={24} />
        </a>
      </div>
    </div>
  );
};

export default FloatingContact;
