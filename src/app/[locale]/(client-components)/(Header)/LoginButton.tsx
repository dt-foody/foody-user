"use client";

import React from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";

const LoginButton = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login"); // chuyển route nội bộ
  };

  return (
    <div className="self-center">
      <ButtonPrimary onClick={handleLogin}>
        Đăng nhập
      </ButtonPrimary>
    </div>
  );
};

export default LoginButton;
