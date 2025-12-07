"use client";
import React, { FC, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services";

export interface PageLoginProps {}

// Định nghĩa interface lỗi form
interface FormErrors {
  account?: string;
  password?: string;
}

const PageLogin: FC<PageLoginProps> = ({}) => {
  // Ref để lấy giá trị input
  const accountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // State quản lý lỗi và trạng thái loading
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Hàm validate format Email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Hàm validate format Số điện thoại (VN basic)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone);
  };

  // Logic kiểm tra form trước khi submit
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const accountValue = accountRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    // Validate Account: Chấp nhận nếu là Email hợp lệ HOẶC Phone hợp lệ
    if (!accountValue) {
      newErrors.account = "Vui lòng nhập email hoặc số điện thoại";
    } else if (!validateEmail(accountValue) && !validatePhone(accountValue)) {
      newErrors.account = "Email hoặc số điện thoại không hợp lệ";
    }

    // Validate Password
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    setErrors(newErrors);
    // Form hợp lệ khi không có key lỗi nào
    return Object.keys(newErrors).length === 0;
  };

  // Xóa lỗi khi người dùng bắt đầu nhập lại
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

  // Xử lý Submit Form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Validate Client side
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const accountValue = accountRef.current?.value || "";
      const password = passwordRef.current?.value || "";

      // 2. Tạo payload gửi API
      // Sử dụng key chung 'username' cho cả email và phone để đơn giản hóa
      const formData = {
        username: accountValue,
        password: password,
      };

      // 3. Gọi API đăng nhập
      const data = await authService.login(formData);

      // 4. Lưu thông tin User vào Store (Global State)
      useAuthStore.getState().setUser(data.user);
      useAuthStore.getState().setMe(data.me);

      // 5. Xử lý điều hướng an toàn (Redirect)
      const redirectUri = searchParams.get("redirect_uri");
      let destination = "/";

      // Chỉ redirect nếu là đường dẫn nội bộ (bắt đầu bằng /) để bảo mật
      if (redirectUri && redirectUri.startsWith("/")) {
        destination = redirectUri;
      }

      router.push(destination);
    } catch (error) {
      // 6. Hiển thị lỗi từ API (nếu có)
      setApiError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`nc-PageLogin`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-8 flex items-center text-2xl leading-[115%] md:leading-[115%] text-neutral-900 dark:text-neutral-100 justify-center font-bold">
          Chào mừng bạn trở lại với Lưu Chi
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          {/* Thông báo lỗi từ API */}
          {apiError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          {/* FORM ĐĂNG NHẬP */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            {/* Input Tài khoản (Email/Phone) */}
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Tài khoản
              </span>
              <Input
                ref={accountRef}
                type="text"
                name="account"
                placeholder="Email hoặc số điện thoại"
                className="mt-1"
                onFocus={() => handleInputFocus("account")}
                disabled={isLoading}
              />
              {errors.account && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.account}
                </span>
              )}
            </label>

            {/* Input Mật khẩu */}
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

            {/* Link Quên mật khẩu */}
            <div className="text-right -mt-4">
              <Link
                href="/forgot-password"
                className="text-sm font-medium hover:underline text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Nút Submit */}
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Tiếp tục"}
            </ButtonPrimary>
          </form>

          {/* Footer Form: Link đăng ký */}
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
