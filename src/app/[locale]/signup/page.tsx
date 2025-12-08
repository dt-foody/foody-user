"use client";
import React, { FC, useRef, useState } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { authService } from "@/services";

export interface PageSignUpProps {}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  birthDate?: string;
}

const PageSignUp: FC<PageSignUpProps> = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Validate email
  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate phone (basic Vietnamese phone number)
  const validatePhone = (phone: string): boolean =>
    /^(0|\+84)[0-9]{9,10}$/.test(phone);

  // Validate form
  const validateForm = (
    name: string,
    email: string,
    password: string,
    phone: string,
    birthDate: string
  ): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ";
    }

    if (!phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Vui lòng nhập số điện thoại hợp lệ";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (birthDate) {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);

      if (selectedDate > today) {
        newErrors.birthDate = "Ngày sinh không được là ngày trong tương lai";
      } else if (selectedDate < minDate) {
        newErrors.birthDate = "Ngày sinh không hợp lệ";
      }
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const phone = phoneRef.current?.value || "";
    const birthDate = birthDateRef.current?.value || "";
    const gender = genderRef.current?.value || "";

    if (!validateForm(name, email, password, phone, birthDate)) return;

    setIsLoading(true);
    try {
      const requestBody: any = {
        name: name.trim(),
        email,
        password,
      };

      if (phone) requestBody.phone = phone;
      if (birthDate) requestBody.birthDate = birthDate; // Format: YYYY-MM-DD
      if (gender) requestBody.gender = gender;

      const response = await authService.register(requestBody);

      setRegisteredEmail(email);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        email: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowSuccessMessage(false);
    setRegisteredEmail("");
    if (nameRef.current) nameRef.current.value = "";
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    if (phoneRef.current) phoneRef.current.value = "";
    if (birthDateRef.current) birthDateRef.current.value = "";
    if (genderRef.current) genderRef.current.value = "";
  };

  // Success message screen
  if (showSuccessMessage) {
    return (
      <div className="nc-PageSignUp">
        <div className="container mb-24 lg:mb-32">
          <div className="max-w-md mx-auto text-center space-y-6 py-8">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
              Kiểm tra email của bạn
            </h2>

            <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
              <p>Chúng tôi đã gửi email xác thực đến</p>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {registeredEmail}
              </p>
              <p>
                Vui lòng kiểm tra hộp thư đến (hoặc thư mục spam) và nhấp vào
                liên kết xác thực để hoàn tất đăng ký.
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-neutral-700 dark:text-neutral-300">
              <p className="font-medium mb-2">Không nhận được email?</p>
              <ul className="text-left space-y-1 list-disc list-inside">
                <li>Kiểm tra thư mục spam hoặc junk mail</li>
                <li>Đảm bảo địa chỉ email chính xác</li>
                <li>Chờ vài phút và kiểm tra lại</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <ButtonPrimary onClick={resetForm}>
                Đăng ký với email khác
              </ButtonPrimary>

              <Link
                href="/login"
                className="block text-neutral-700 dark:text-neutral-300 hover:underline"
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup form screen
  return (
    <div className="nc-PageSignUp">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-4 flex items-center justify-center text-3xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-3xl">
          Đăng ký
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Họ và tên <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                name="name"
                placeholder="Nguyễn Văn A"
                className="mt-1"
                ref={nameRef}
                disabled={isLoading}
                onFocus={() => handleInputFocus("name")}
              />
              {errors.name && (
                <span className="text-sm text-red-500 mt-1 block">
                  {errors.name}
                </span>
              )}
            </label>

            {/* Email Field */}
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Địa chỉ Email <span className="text-red-500">*</span>
              </span>
              <Input
                type="email"
                name="email"
                placeholder="example@example.com"
                className="mt-1"
                ref={emailRef}
                disabled={isLoading}
                onFocus={() => handleInputFocus("email")}
              />
              {errors.email && (
                <span className="text-sm text-red-500 mt-1 block">
                  {errors.email}
                </span>
              )}
            </label>

            {/* Password Field */}
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Mật khẩu <span className="text-red-500">*</span>
              </span>
              <Input
                type="password"
                name="password"
                className="mt-1"
                ref={passwordRef}
                disabled={isLoading}
                onFocus={() => handleInputFocus("password")}
              />
              {errors.password && (
                <span className="text-sm text-red-500 mt-1 block">
                  {errors.password}
                </span>
              )}
              <span className="text-xs text-neutral-500 mt-1 block">
                Tối thiểu 8 ký tự
              </span>
            </label>

            {/* Phone Field */}
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Số điện thoại <span className="text-red-500">*</span>
              </span>
              <Input
                type="tel"
                name="phone"
                placeholder="0912345678"
                className="mt-1"
                ref={phoneRef}
                disabled={isLoading}
                onFocus={() => handleInputFocus("phone")}
              />
              {errors.phone && (
                <span className="text-sm text-red-500 mt-1 block">
                  {errors.phone}
                </span>
              )}
              <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                💡 Bắt buộc khi đặt hàng
              </span>
            </label>

            {/* Gender and Birth Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-neutral-800 dark:text-neutral-200">
                  Giới tính
                </span>
                <select
                  name="gender"
                  className="mt-1 block w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                  ref={genderRef}
                  disabled={isLoading}
                >
                  <option value="">Chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </label>

              <label className="block">
                <span className="text-neutral-800 dark:text-neutral-200">
                  Ngày sinh
                </span>
                <Input
                  type="date"
                  name="birthDate"
                  className="mt-1"
                  ref={birthDateRef}
                  disabled={isLoading}
                  onFocus={() => handleInputFocus("birthDate")}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.birthDate && (
                  <span className="text-sm text-red-500 mt-1 block">
                    {errors.birthDate}
                  </span>
                )}
              </label>
            </div>

            {/* Promotion Notice */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm">
              <p className="text-purple-700 dark:text-purple-300">
                🎁 Chia sẻ ngày sinh và giới tính giúp chúng mình chuẩn bị những món quà dành riêng cho bạn một cách chu đáo nhất.
              </p>
            </div>

            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Tiếp tục"}
            </ButtonPrimary>
          </form>

          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold underline">
              Đăng nhập
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
