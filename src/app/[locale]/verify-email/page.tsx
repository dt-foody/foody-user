"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  // Dùng useRef để đảm bảo API chỉ gọi 1 lần (tránh StrictMode của React gọi 2 lần)
  const isVerifying = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Đang xác thực thông tin...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Đường dẫn xác thực không hợp lệ hoặc thiếu token.");
      return;
    }

    // Nếu đang verify hoặc đã xong thì không chạy lại
    if (isVerifying.current) return;
    isVerifying.current = true;

    const verify = async () => {
      try {
        const res = await fetch(
          `https://luuchi.com.vn/v1/auth/verify-email?token=${token}`,
          { method: "POST" }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Xác thực thất bại");
        }

        setStatus("success");
        setMessage("Email đã được xác thực thành công!");
        
        // Hiện toast notify
        toast.success("Xác thực thành công! Đang chuyển hướng...", {
          duration: 3000,
        });

        // Tự động chuyển hướng sau 1 giây
        setTimeout(() => {
          router.push("/en/login");
        }, 1000);

      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Token đã hết hạn hoặc không hợp lệ.");
        toast.error("Xác thực thất bại. Vui lòng thử lại.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center transition-all duration-300 border border-gray-100">
        
        {/* TRẠNG THÁI LOADING */}
        {status === "loading" && (
          <div className="flex flex-col items-center py-6">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang xác thực</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </div>
        )}

        {/* TRẠNG THÁI SUCCESS */}
        {status === "success" && (
          <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-400 animate-pulse">
              Đang chuyển hướng đến trang đăng nhập...
            </p>
          </div>
        )}

        {/* TRẠNG THÁI ERROR */}
        {status === "error" && (
          <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác thực thất bại</h2>
            <p className="text-gray-600 mb-8 px-4">{message}</p>
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors shadow-lg shadow-gray-200"
              >
                Về trang chủ
              </button>
              <a
                href="mailto:support@luuchi.com.vn"
                className="text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors mt-2"
              >
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
