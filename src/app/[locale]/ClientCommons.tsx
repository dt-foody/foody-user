// src/app/[locale]/ClientCommons.tsx
"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/utils/useThemeMode";
import FloatingContact from "@/components/FloatingContact"; // [NEW] Import

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
      {/* Component này không render giao diện chính, nó chỉ render các tiện ích nổi */}
      <FloatingContact />
    </>
  );
};

export default ClientCommons;
