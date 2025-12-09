"use client";

import React, { useState } from "react";
// Giữ nguyên import icon từ lucide-react
import { Lock, Eye, EyeOff, Check, AlertCircle, Shield } from "lucide-react";
import { authService } from "@/services";

interface PasswordStrength {
  score: number;
  label: string; // Nhãn này sẽ được dịch
  color: string;
}

const AccountPass = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Tính toán độ mạnh mật khẩu (đã dịch nhãn)
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: "", color: "" };

    if (password.length < 8)
      return { score: 0, label: "Quá ngắn", color: "bg-red-500" };
    if (password.length >= 8 && password.length < 12)
      return { score: 3, label: "Đạt yêu cầu", color: "bg-green-500" };
    if (password.length >= 12)
      return { score: 5, label: "Rất tốt", color: "bg-green-600" };

    return { score: 3, label: "Đạt yêu cầu", color: "bg-green-500" };
  };

  const passwordStrength = calculatePasswordStrength(passwords.new);

  const handlePasswordChange = (
    field: keyof typeof passwords,
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Validate form (đã dịch thông báo lỗi)
  const validateForm = (): boolean => {
    const newErrors = { current: "", new: "", confirm: "" };
    let isValid = true;

    if (!passwords.current) {
      newErrors.current = "Vui lòng nhập mật khẩu hiện tại";
      isValid = false;
    }

    if (!passwords.new) {
      newErrors.new = "Vui lòng nhập mật khẩu mới";
      isValid = false;
    } else if (passwords.new.length < 8) {
      newErrors.new = "Mật khẩu phải có ít nhất 8 ký tự";
      isValid = false;
    } else if (passwords.new === passwords.current) {
      newErrors.new = "Mật khẩu mới phải khác mật khẩu hiện tại";
      isValid = false;
    }

    if (!passwords.confirm) {
      newErrors.confirm = "Vui lòng xác nhận mật khẩu";
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Mật khẩu không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      await authService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      setIsSaving(false);
      alert("Cập nhật mật khẩu thành công!");
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        current:
          err?.message ||
          "Đã có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Danh sách yêu cầu (đã dịch)
  const requirements = [
    { met: passwords.new.length >= 8, text: "Ít nhất 8 ký tự" },
    // {
    //   met: /[a-z]/.test(passwords.new) && /[A-Z]/.test(passwords.new),
    //   text: "Chữ hoa & chữ thường",
    // },
    // { met: /\d/.test(passwords.new), text: "Ít nhất một số" },
    // {
    //   met: /[^a-zA-Z0-9]/.test(passwords.new),
    //   text: "Ít nhất một ký tự đặc biệt",
    // },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-semibold text-gray-900">
            Cập nhật Mật khẩu
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Giữ tài khoản của bạn an toàn bằng cách sử dụng mật khẩu mạnh
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-5">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Mật khẩu hiện tại
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  handlePasswordChange("current", e.target.value)
                }
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                  errors.current ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.current && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.current}
              </p>
            )}
          </div>

          {/* Dấu gạch phân cách */}
          <div className="border-t border-gray-200" />

          {/* Mật khẩu mới */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Mật khẩu mới
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                  errors.new ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.new && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.new}
              </p>
            )}

            {/* Độ mạnh mật khẩu */}
            {passwords.new && !errors.new && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">
                    Độ mạnh mật khẩu:
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.score <= 2
                        ? "text-red-600"
                        : passwordStrength.score <= 3
                        ? "text-yellow-600"
                        : passwordStrength.score <= 4
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yêu cầu mật khẩu */}
            {passwords.new && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Yêu cầu mật khẩu:
                </p>
                <div className="space-y-1">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {req.met && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className={`text-xs ${
                          req.met ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Xác nhận mật khẩu mới
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) =>
                  handlePasswordChange("confirm", e.target.value)
                }
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                  errors.confirm ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Xác nhận mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirm}
              </p>
            )}
            {!errors.confirm &&
              passwords.confirm &&
              passwords.new === passwords.confirm && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Mật khẩu đã khớp
                </p>
              )}
          </div>

          {/* Nút gửi */}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2 text-sm text-white font-medium rounded-md hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-primary-500 hover:bg-primary-600"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Cập nhật Mật khẩu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPass;
