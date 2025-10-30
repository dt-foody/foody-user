// Trong file: src/app/[locale]/(client-components)/(Header)/SiteHeader.tsx
"use client";

import React, { useEffect } from "react";
import Header from "./Header";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SiteHeader({ ssrUser }: { ssrUser?: any }) {
  const { user, setUser, fetchUser } = useAuthStore();

  useEffect(() => {
    if (ssrUser) setUser(ssrUser);
    else fetchUser(); // fallback nếu chưa có user
  }, [ssrUser]);
  
  const renderHeader = () => {
    return <Header/>;
  };

  return <>{renderHeader()}</>;
}