// src/components/FloatingContact.tsx
"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";

const FloatingContact = () => {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
      {/* --- Nút Gọi Hotline --- */}
      <div className="relative group">
        {/* Hiệu ứng sóng lan tỏa (Ping animation) */}
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
