'use client';

import { useState, useEffect, type SyntheticEvent } from 'react';
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/services';

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [step, setStep] = useState(tokenFromUrl ? 2 : 1); // 1: nhập email, 2: đổi mật khẩu
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStep(2);
    }
  }, [tokenFromUrl]);

  // Gửi email để nhận reset password link
  const handleSendResetLink = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      setSuccess('Link đặt lại mật khẩu đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setError('Không thể kết nối đến server!');
    } finally {
      setLoading(false);
    }
  };

  // Reset mật khẩu mới với token
  const handleResetPassword = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault();

    setError('');
    setSuccess('');

    // Validate
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    if (!token) {
      setError('Token không hợp lệ!');
      return;
    }

    setLoading(true);

    try {
      // 🟢 Thành công: API trả 204 → apiFetch trả null
      await authService.resetPassword({
        token,
        password: newPassword,
      });

      setSuccess('Đổi mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError('Token không hợp lệ hoặc đã hết hạn!');
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
              {step === 1 && 'Quên mật khẩu?'}
              {step === 2 && 'Đặt mật khẩu mới'}
            </h1>
            <p className="text-gray-600 text-sm">
              {step === 1 && 'Nhập email để nhận link đặt lại mật khẩu'}
              {step === 2 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <span className="text-red-500 mt-0.5">✕</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

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
                    onKeyPress={(e) => e.key === 'Enter' && handleSendResetLink(e)}
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
                  'Gửi yêu cầu'
                )}
              </button>

              <div className="mt-4 p-4 bg-[#FFFAF2] border  rounded-lg">
                <p className="text-sm text-black">
                  <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ được gửi đến email của bạn. 
                  Vui lòng kiểm tra cả hộp thư Spam nếu không thấy email trong vài phút.
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
                <p className="text-xs text-gray-500 mt-1">
                  Ít nhất 8 ký tự
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword(e)}
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
                  'Đặt lại mật khẩu'
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
          Bạn đã nhớ mật khẩu?{' '}
          <a href="/login" className="text-black hover:underline font-medium">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
}