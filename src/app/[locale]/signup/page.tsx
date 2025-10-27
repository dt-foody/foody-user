"use client";
import React, { FC, useRef, useState } from "react";
import facebookSvg from "@/images/Facebook.svg";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PageSignUpProps {}

const loginSocials = [
  { name: "Continue with Facebook", href: "#", icon: facebookSvg },
  { name: "Continue with Google", href: "#", icon: googleSvg },
];

interface FormErrors {
  email?: string;
  password?: string;
}

const PageSignUp: FC<PageSignUpProps> = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  // Validate email
  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate form
  const validateForm = (email: string, password: string): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ";
    }

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
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!validateForm(email, password)) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      

      if (response.ok) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setErrors({
          email: data.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        email: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nc-PageSignUp">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-8 flex items-center justify-center text-3xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-4xl">
          Signup
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address
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

            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Password
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
                Minimum 8 characters
              </span>
            </label>

            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Continue"}
            </ButtonPrimary>
          </form>

          {/* OR */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
              OR
            </span>
            <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
          </div>

          {/* SOCIAL */}
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 sm:px-6 transform transition-transform hover:translate-y-[-2px]"
              >
                <Image
                  className="flex-shrink-0"
                  src={item.icon}
                  alt={item.name}
                />
                <h3 className="flex-grow text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">
                  {item.name}
                </h3>
              </a>
            ))}
          </div>

          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold underline">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
