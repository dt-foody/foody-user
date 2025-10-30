"use client";

import { useState, useMemo } from "react";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Loader,
  Tag,
  ChevronRight,
  ChevronLeft,
  XCircle,
  Check,
} from "lucide-react";
import { SHIPPING_FEE, useCart } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";
import type { Coupon, EligibilityStatus } from "../contexts/CartContext";
import { useAuthStore } from "@/stores/useAuthStore"; // 🟢 thêm dòng này

export default function CartSidebar() {
  const {
    cartItems,
    cartCount,
    showCart,
    setShowCart,
    updateQuantity,
    clearCart,
    subtotal,
    finalShippingFee,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    publicCouponStatuses,
    appliedCoupons,
    isLoadingPublicCoupons,
    couponStatus,
    applyPublicCoupon,
    applyPrivateCoupon,
    removeCoupon,
  } = useCart();

  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const [manualCouponCode, setManualCouponCode] = useState("");
  const router = useRouter();
  const { user } = useAuthStore(); // 🟢 lấy user từ Zustand

  const handleApplyPrivateCoupon = async () => {
    if (manualCouponCode) {
      const { success } = await applyPrivateCoupon(manualCouponCode);
      if (success) setManualCouponCode("");
    }
  };

  const handleTogglePublicCoupon = (coupon: Coupon) => {
    if (appliedCoupons.some((c) => c.id === coupon.id)) {
      removeCoupon(coupon.id);
    } else {
      applyPublicCoupon(coupon);
    }
  };

  const handlePlaceOrder = () => {
    setShowCart(false);

    if (!user) {
      // Chưa login → chuyển sang login
      router.push("/login?redirect_uri=/checkout");
      return;
    }
    
    router.push("/checkout");
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  const renderCartContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header giỏ hàng */}
      <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
        <h2 className="text-md font-bold">Giỏ hàng ({cartCount})</h2>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <Trash2 size={14} /> Xóa tất cả
          </button>
        )}
        <button onClick={() => setShowCart(false)} className="p-1">
          <X size={24} />
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center h-full flex flex-col justify-center items-center p-4 text-sm">
            <ShoppingCart className="w-20 h-20 text-gray-200" />
            <p>Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="flex items-start space-x-4 p-3 bg-white rounded-lg border"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={handleImageError}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.name}</h4>
                    <p className="text-orange-500 font-bold mt-2">
                      {item.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Phần nhập mã và tóm tắt */}
            <div className="p-5 border-t bg-gray-50 space-y-4">
              {/* Input mã private */}
              <div>
                <label className="font-semibold text-sm mb-2 block">
                  Mã khuyến mãi riêng
                </label>
                <div className="flex gap-2">
                  <input
                    value={manualCouponCode}
                    onChange={(e) =>
                      setManualCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã riêng của bạn"
                    className="flex-1 px-4 py-2 rounded-lg border"
                  />
                  <button
                    onClick={handleApplyPrivateCoupon}
                    disabled={couponStatus.isLoading || !manualCouponCode}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg w-28"
                  >
                    {couponStatus.isLoading ? (
                      <Loader className="animate-spin mx-auto" />
                    ) : (
                      "Áp dụng"
                    )}
                  </button>
                </div>
                {couponStatus.error && (
                  <p className="text-red-500 text-sm mt-1">
                    {couponStatus.error}
                  </p>
                )}
              </div>

              {/* Danh sách coupon đã áp dụng */}
              {appliedCoupons.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">
                    Khuyến mãi đã áp dụng:
                  </p>
                  {appliedCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="text-green-800 font-semibold text-sm">
                          {coupon.name}
                        </p>
                        <p className="text-xs text-gray-600">{coupon.code}</p>
                      </div>
                      <button onClick={() => removeCoupon(coupon.id)}>
                        <XCircle size={20} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Nút mở panel chọn coupon */}
              <button
                onClick={() => setIsCouponPanelOpen(true)}
                className="flex justify-between items-center w-full p-3 bg-white border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-sm">
                    Chọn khuyến mãi có sẵn
                  </span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Tóm tắt đơn hàng */}
              <div className="space-y-2 pt-4 text-sm border-t mt-4">
                <h3 className="font-semibold text-base mb-2">
                  Tóm tắt đơn hàng
                </h3>
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{SHIPPING_FEE.toLocaleString("vi-VN")}đ</span>
                </div>
                {itemDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá sản phẩm</span>
                    <span>-{itemDiscount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm phí vận chuyển</span>
                    <span>-{shippingDiscount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Nút đặt hàng */}
      {cartItems.length > 0 && (
        <div className="p-5 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {itemDiscount + shippingDiscount > 0 && (
            <div className="flex justify-between items-center mb-2 text-green-600">
              <span className="font-semibold">Bạn đã tiết kiệm</span>
              <span className="font-bold">
                -{(itemDiscount + shippingDiscount).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-md">Tổng cộng</span>
            <span className="text-md font-bold text-orange-500">
              {finalTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
              user
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {user ? "Đặt hàng" : "Vui lòng đăng nhập"}
          </button>
        </div>
      )}
    </div>
  );

  const renderCouponPanel = () => {
    const groupedCoupons = useMemo(() => {
      const groups = publicCouponStatuses.reduce((acc, status) => {
        const key = status.coupon.type || "other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(status);
        return acc;
      }, {} as Record<string, (EligibilityStatus & { coupon: Coupon })[]>);

      // Sắp xếp coupon
      for (const key in groups) {
        groups[key].sort((a, b) => {
          if (a.isEligible && !b.isEligible) return -1;
          if (!a.isEligible && b.isEligible) return 1;

          const couponA = a.coupon;
          const couponB = b.coupon;

          const getDiscountValue = (coupon: Coupon) => {
            if (coupon.type === "freeship") return coupon.value;
            if (coupon.valueType === "percentage") {
              return Math.min(
                subtotal * (coupon.value / 100),
                coupon.maxDiscountAmount || Infinity
              );
            }
            return coupon.value;
          };

          const discountA = getDiscountValue(couponA);
          const discountB = getDiscountValue(couponB);

          return discountA - discountB;
        });
      }
      return groups;
    }, [publicCouponStatuses, subtotal]);

    const groupTitles = {
      discount_code: "Mã Giảm Giá",
      freeship: "Miễn Phí Vận Chuyển",
    };

    const formatDiscountValue = (coupon: Coupon) => {
      if (coupon.type === "freeship") {
        return "Miễn phí ship";
      }
      if (coupon.valueType === "percentage") {
        return `Giảm ${coupon.value}%`;
      }
      return `Giảm ${coupon.value.toLocaleString("vi-VN")}đ`;
    };

    const hasAnyCoupons = Object.keys(groupedCoupons).length > 0;

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-gray-50">
        <div className="flex items-center p-5 border-b bg-white shadow-sm">
          <button
            onClick={() => setIsCouponPanelOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-md font-bold mx-auto">Chọn Khuyến Mãi</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoadingPublicCoupons ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin text-orange-500" size={32} />
            </div>
          ) : !hasAnyCoupons ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Chưa có khuyến mãi nào
              </h3>
              <p className="text-sm text-gray-500">
                Hãy quay lại sau để nhận những ưu đãi hấp dẫn nhé!
              </p>
            </div>
          ) : (
            Object.entries(groupedCoupons).map(([type, coupons]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-1 h-5 rounded-full ${
                      type === "freeship" ? "bg-blue-500" : "bg-orange-500"
                    }`}
                  />
                  <h3 className="font-bold text-gray-800">
                    {(groupTitles as any)[type] || "Khuyến mãi khác"}
                  </h3>
                </div>

                <div className="space-y-3">
                  {coupons.map((status) => {
                    const { coupon, isEligible, reason } = status;
                    const isApplied = appliedCoupons.some(
                      (c) => c.id === coupon.id
                    );

                    const isDisabledByFreeshipRule =
                      coupon.type === "freeship" &&
                      !isApplied &&
                      appliedCoupons.some((c) => c.type === "freeship");

                    const isDisabled =
                      (!isEligible && !isApplied) || isDisabledByFreeshipRule;

                    const bgGradient =
                      type === "freeship"
                        ? "from-blue-500 to-blue-600"
                        : "from-orange-500 to-orange-600";

                    return (
                      <label
                        key={coupon.id}
                        htmlFor={coupon.id}
                        className={`
                          block relative overflow-hidden rounded-xl transition-all duration-200
                          ${
                            isDisabled
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
                          }
                          ${
                            isApplied
                              ? "ring-2 ring-orange-500 shadow-lg"
                              : "shadow-md"
                          }
                        `}
                      >
                        <div
                          className={`
                          absolute inset-0 bg-gradient-to-r ${bgGradient} opacity-10
                          ${isApplied ? "opacity-20" : ""}
                        `}
                        />

                        <div className="relative bg-white p-4 flex gap-4">
                          {/* Icon & Giá trị ưu đãi */}
                          <div
                            className={`
                            flex-shrink-0 w-16 h-16 rounded-lg 
                            bg-gradient-to-br ${bgGradient}
                            flex flex-col items-center justify-center text-white shadow-md
                          `}
                          >
                            <Tag className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold text-center px-1 leading-tight">
                              {formatDiscountValue(coupon)}
                            </span>
                          </div>

                          {/* Nội dung */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-gray-900 text-base leading-tight">
                                {coupon.name}
                              </h4>

                              {/* Badge trạng thái */}
                              {isApplied ? (
                                <span className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                  <Check size={12} />
                                  Đang dùng
                                </span>
                              ) : !isEligible ? (
                                <span className="flex-shrink-0 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                                  Chưa đủ ĐK
                                </span>
                              ) : (
                                <span className="flex-shrink-0 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                  Có thể dùng
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {coupon.description}
                            </p>

                            {/* Mã code */}
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs font-mono font-semibold text-gray-700">
                              <Tag size={12} />
                              {coupon.code}
                            </div>

                            {/* Lý do không hợp lệ */}
                            {!isEligible && reason && !isApplied && (
                              <p className="text-xs text-red-500 font-medium mt-2 flex items-start gap-1">
                                <span className="flex-shrink-0">•</span>
                                <span>{reason}</span>
                              </p>
                            )}
                            {isDisabledByFreeshipRule && (
                              <p className="text-xs text-blue-600 font-medium mt-2 flex items-start gap-1">
                                <span className="flex-shrink-0">•</span>
                                <span>Chỉ áp dụng 1 mã Freeship</span>
                              </p>
                            )}
                          </div>

                          {/* Checkbox tùy chỉnh */}
                          <div
                            className={`
                              flex-shrink-0 flex items-center justify-center w-6 h-6
                              border-2 rounded-full transition-all
                              ${
                                isApplied
                                  ? "bg-orange-500 border-orange-500 shadow-md"
                                  : "bg-white border-gray-300"
                              }
                              ${isDisabled ? "bg-gray-100 border-gray-200" : ""}
                            `}
                          >
                            {isApplied && (
                              <Check
                                size={16}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>

                        {/* Input ẩn */}
                        <input
                          type="checkbox"
                          id={coupon.id}
                          className="hidden"
                          checked={isApplied}
                          disabled={isDisabled}
                          onChange={() => handleTogglePublicCoupon(coupon)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 z-50 ${
        showCart ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setShowCart(false)}
    >
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          <div
            className={`transition-transform duration-300 w-full h-full ${
              isCouponPanelOpen ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            {renderCartContent()}
          </div>
          <div
            className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ${
              isCouponPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {renderCouponPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
