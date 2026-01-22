"use client";

import { useState, useEffect, type SyntheticEvent } from "react";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner"; // 1. Import sonner
import { authService } from "@/services";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [step, setStep] = useState(tokenFromUrl ? 2 : 1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Không cần state error/success nữa

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStep(2);
    }
  }, [tokenFromUrl]);

  // Gửi email để nhận reset password link
  const handleSendResetLink = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword({ email });
      // 2. Dùng toast success
      toast.success(
        "Link đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra email.",
      );
    } catch (err: any) {
      // 3. Dùng toast error
      const message =
        err?.response?.data?.message || "Không thể kết nối đến server!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset mật khẩu mới với token
  const handleResetPassword = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault();

    // Validate
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    if (!token) {
      toast.error("Token không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        password: newPassword,
      });

      toast.success("Đổi mật khẩu thành công! Đang chuyển hướng...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFFAF2] rounded-full mb-4">
              {step === 1 ? (
                <Mail className="w-8 h-8 text-black" />
              ) : (
                <Lock className="w-8 h-8 text-black" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {step === 1 && "Quên mật khẩu?"}
              {step === 2 && "Đặt mật khẩu mới"}
            </h1>
            <p className="text-gray-600 text-sm">
              {step === 1 && "Nhập email để nhận link đặt lại mật khẩu"}
              {step === 2 && "Tạo mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          {/* Đã xóa phần hiển thị Alerts cũ ở đây */}

          {/* Step 1: Nhập Email */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSendResetLink(e)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                onClick={handleSendResetLink}
                disabled={loading || !email}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>

              <div className="mt-4 p-4 bg-[#FFFAF2] border rounded-lg">
                <p className="text-sm text-black">
                  <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ được gửi đến
                  email của bạn. Vui lòng kiểm tra cả hộp thư Spam nếu không
                  thấy email trong vài phút.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Đặt mật khẩu mới */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Ít nhất 8 ký tự</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleResetPassword(e)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-black transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại đăng nhập
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Bạn đã nhớ mật khẩu?{" "}
          <a href="/login" className="text-black hover:underline font-medium">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
}
