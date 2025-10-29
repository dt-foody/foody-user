"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams?.token;
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
  const [message, setMessage] = useState<string>("Đang xác thực...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Thiếu token xác thực.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `http://localhost:3000/v1/auth/verify-email?token=${token}`,
          { method: "POST" }
        );

        if (!res.ok) throw new Error("Verify failed");

        setStatus("success");
        setMessage("Xác thực email thành công. Bạn có thể đăng nhập.");
      } catch (e) {
        setStatus("error");
        setMessage("Token không hợp lệ hoặc đã hết hạn.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md text-center">
        {status === "loading" && <p className="text-gray-600">{message}</p>}
        
        {status === "success" && (
          <>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">✅ Thành công!</h2>
            <p className="text-gray-700 mb-4">{message}</p>
            <a
              href="/en/login"
              className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              Đăng nhập
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">❌ Lỗi!</h2>
            <p className="text-gray-700">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
