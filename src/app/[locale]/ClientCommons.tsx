// src/app/[locale]/ClientCommons.tsx
"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/utils/useThemeMode";

// Import cả 2 component
import FloatingContact from "@/components/FloatingContact";
import { useSocketListener } from "@/hooks/useSocketListener";

const ClientCommons = () => {
  // Hook xử lý Dark/Light mode
  useThemeMode();

  useSocketListener();
  
  const pathname = usePathname();

  // Scroll lên đầu trang mỗi khi chuyển trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <FloatingContact />
    </>
  );
};

export default ClientCommons;
