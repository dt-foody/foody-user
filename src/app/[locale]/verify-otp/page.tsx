"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";

const VerifyOTP: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isExpired, setIsExpired] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (countdown > 0 && !isExpired) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsExpired(true);
      setError("Mã OTP đã hết hiệu lực. Vui lòng gửi lại mã mới.");
    }
  }, [countdown, isExpired]);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Vui lòng nhập mã OTP gồm 6 chữ số");
      return;
    }

    if (isExpired) {
      setError("Mã OTP đã hết hiệu lực. Vui lòng gửi lại mã mới.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/");
      } else {
        setError(data.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Reset countdown and OTP
        setCountdown(60);
        setIsExpired(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nc-VerifyOTP">
      <div className="container mb-24 lg:mb-32">
        <div className="max-w-md mx-auto space-y-6 pt-14">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
              Verify Your Email
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              We have sent a 6-digit OTP to your email:
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {email}
            </p>

            {/* OTP Timer */}
            <div className="mt-3">
              {isExpired ? (
                <p className="text-sm text-red-500 font-medium">
                  The OTP has expired
                </p>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  The OTP is valid for:{" "}
                  <span
                    className={`font-semibold ${
                      countdown <= 10 ? "text-red-500" : "text-primary-600"
                    }`}
                  >
                    {countdown}s
                  </span>
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isLoading || isExpired}
                    className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-neutral-100 disabled:opacity-50 ${
                      isExpired
                        ? "border-red-300 dark:border-red-600"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  />
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
              )}
            </div>

            <ButtonPrimary
              type="submit"
              disabled={isLoading || isExpired}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Your Email"}
            </ButtonPrimary>
          </form>

          <div className="text-center text-sm">
            <p className="text-neutral-600 dark:text-neutral-400">
              You didn&apos;t receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm font-semibold text-primary-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Resend OTP"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
