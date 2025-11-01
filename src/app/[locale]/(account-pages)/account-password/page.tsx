"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Check, AlertCircle, Shield } from "lucide-react";

interface PasswordStrength {
  score: number;
  label: string;
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

  // Password strength calculator
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = calculatePasswordStrength(passwords.new);

  const handlePasswordChange = (
    field: keyof typeof passwords,
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors = { current: "", new: "", confirm: "" };
    let isValid = true;

    if (!passwords.current) {
      newErrors.current = "Current password is required";
      isValid = false;
    }

    if (!passwords.new) {
      newErrors.new = "New password is required";
      isValid = false;
    } else if (passwords.new.length < 8) {
      newErrors.new = "Password must be at least 8 characters";
      isValid = false;
    } else if (passwords.new === passwords.current) {
      newErrors.new = "New password must be different from current password";
      isValid = false;
    }

    if (!passwords.confirm) {
      newErrors.confirm = "Please confirm your password";
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Updating password:", {
        current: passwords.current,
        new: passwords.new,
      });
      setIsSaving(false);
      alert("Password updated successfully!");

      // Reset form
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswords({ current: false, new: false, confirm: false });
    }, 1000);
  };

  const requirements = [
    { met: passwords.new.length >= 8, text: "At least 8 characters" },
    {
      met: /[a-z]/.test(passwords.new) && /[A-Z]/.test(passwords.new),
      text: "Upper & lowercase letters",
    },
    { met: /\d/.test(passwords.new), text: "At least one number" },
    {
      met: /[^a-zA-Z0-9]/.test(passwords.new),
      text: "At least one special character",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-semibold text-gray-900">
            Update Password
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Keep your account secure by using a strong password
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Current Password
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
                placeholder="Enter current password"
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

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* New Password */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              New Password
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
                placeholder="Enter new password"
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

            {/* Password Strength */}
            {passwords.new && !errors.new && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">
                    Password Strength:
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

            {/* Password Requirements */}
            {passwords.new && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Password Requirements:
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

          {/* Confirm Password */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Confirm New Password
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
                placeholder="Confirm new password"
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
                  Passwords match
                </p>
              )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-md hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Security Tips
        </h3>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Never share your password with anyone</li>
          <li>• Use a unique password for this account</li>
          <li>• Change your password regularly</li>
          <li>• Avoid using personal information in your password</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountPass;
