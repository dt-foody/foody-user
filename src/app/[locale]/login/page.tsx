"use client";
import React, { FC, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services";

export interface PageLoginProps {}

interface FormErrors {
  email?: string;
  password?: string;
}

const PageLogin: FC<PageLoginProps> = ({}) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Kiểm tra form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    // Email validation
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputFocus = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const formData = {
        email: emailRef.current?.value || "",
        password: passwordRef.current?.value || "",
      };

      // Gọi API đăng nhập
      const data = await authService.login(formData);

      // (Tùy chọn: Lưu data.user, data.permissions vào global state/context)
      useAuthStore.getState().setUser(data.user);
      useAuthStore.getState().setMe(data.me);

      // 1. Lấy redirect_uri từ URL, ví dụ: /login?redirect_uri=/dashboard
      const redirectUri = searchParams.get("redirect_uri");

      // 2. Mặc định điều hướng về trang chủ
      let destination = "/";

      // 3. Kiểm tra bảo mật: chỉ điều hướng nếu redirectUri là
      //    đường dẫn tương đối (bắt đầu bằng "/") để chống tấn công Open Redirect
      if (redirectUri && redirectUri.startsWith("/")) {
        destination = redirectUri;
      }

      // 4. Thực hiện điều hướng
      router.push(destination);

      // ----- HẾT PHẦN ĐIỀU HƯỚNG -----
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`nc-PageLogin`}>
      <div className="container mb-24 lg:mb-32">
        {/* === THAY ĐỔI TIÊU ĐỀ === */}
        <h2 className="my-6 flex items-center text-xl leading-[115%] md:leading-[115%] text-neutral-900 dark:text-neutral-100 justify-center font-bold">
          Chào mừng bạn trở lại với Lưu Chi
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          {apiError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          {/* FORM ĐĂNG NHẬP */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Tài khoản
              </span>
              <Input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="example@example.com"
                className="mt-1"
                onFocus={() => handleInputFocus("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.email}
                </span>
              )}
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Mật khẩu
              </span>
              <Input
                ref={passwordRef}
                type="password"
                name="password"
                autoComplete="current-password"
                className="mt-1"
                onFocus={() => handleInputFocus("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.password}
                </span>
              )}
            </label>

            <div className="text-right -mt-4">
              <Link
                href="/forgot-password"
                className="text-sm font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Tiếp tục"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Bạn là người dùng mới? {` `}
            <Link href="/signup" className="font-semibold underline">
              Tạo tài khoản
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
