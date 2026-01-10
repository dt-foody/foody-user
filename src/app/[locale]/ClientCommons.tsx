// src/app/[locale]/ClientCommons.tsx
"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/utils/useThemeMode";

// Import cả 2 component
import FloatingContact from "@/components/FloatingContact";
import FacebookChat from "@/components/FacebookChat";

const ClientCommons = () => {
  // Hook xử lý Dark/Light mode
  useThemeMode();

  const pathname = usePathname();

  // Scroll lên đầu trang mỗi khi chuyển trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* 1. Bong bóng chat của Facebook */}
      <FacebookChat />

      {/* 2. Nút gọi điện và Zalo/Messenger nổi */}
      <FloatingContact />
    </>
  );
};

export default ClientCommons;
