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
} from "lucide-react";
import { useCart, SHIPPING_FEE } from "../contexts/CartContext";
import { useRouter } from "next/navigation";

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
    // --- Lấy state và function từ context mới ---
    publicCoupons,
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

  // --- Cập nhật các hàm xử lý để gọi logic mới ---
  const handleApplyPrivateCoupon = async () => {
    if (manualCouponCode) {
      const { success } = await applyPrivateCoupon(manualCouponCode);
      if (success) setManualCouponCode("");
    }
  };

  const handleTogglePublicCoupon = (coupon: any) => {
    if (appliedCoupons.some((c) => c.code === coupon.code)) {
      removeCoupon(coupon.code);
    } else {
      applyPublicCoupon(coupon);
    }
  };

  const handlePlaceOrder = () => {
    setShowCart(false);
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
      <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
        <h2 className="text-xl font-bold">Giỏ hàng ({cartCount})</h2>
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
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center h-full flex flex-col justify-center items-center p-4">
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

            <div className="p-5 border-t bg-gray-50 space-y-4">
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
                        <p className="text-green-800 font-semibold">
                          {coupon.name}
                        </p>
                        <p className="text-xs text-gray-600">{coupon.code}</p>
                      </div>
                      <button onClick={() => removeCoupon(coupon.code)}>
                        <XCircle size={20} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsCouponPanelOpen(true)}
                className="flex justify-between items-center w-full p-3 bg-white border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">Chọn khuyến mãi có sẵn</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>

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
            <span className="text-xl font-bold text-orange-500">
              {finalTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-lg"
          >
            Đặt hàng
          </button>
        </div>
      )}
    </div>
  );

  const renderCouponPanel = () => {
    const groupedCoupons = useMemo(() => {
      const groups = publicCoupons.reduce((acc, coupon) => {
        const key = coupon.type || "other";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(coupon);
        return acc;
      }, {} as Record<string, any[]>);

      for (const key in groups) {
        groups[key].sort((a, b) => {
          const discountA =
            a.valueType === "percentage" ? subtotal * (a.value / 100) : a.value;
          const discountB =
            b.valueType === "percentage" ? subtotal * (b.value / 100) : b.value;
          return discountB - discountA;
        });
      }
      return groups;
    }, [publicCoupons, subtotal]);

    const groupTitles = {
      discount_code: "Mã Giảm Giá",
      freeship: "Miễn Phí Vận Chuyển",
    };

    return (
      <div className="flex flex-col h-full bg-gray-100">
        <div className="flex items-center p-5 border-b bg-white">
          <button onClick={() => setIsCouponPanelOpen(false)} className="p-1">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto">Chọn Khuyến Mãi</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoadingPublicCoupons ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin" />
            </div>
          ) : (
            Object.entries(groupedCoupons).map(([type, coupons]) => (
              <div key={type}>
                <h3 className="font-bold capitalize mb-3">
                  {(groupTitles as any)[type] || "Khuyến mãi khác"}
                </h3>
                <div className="space-y-3">
                  {coupons.map((coupon) => {
                    const isApplied = appliedCoupons.some(
                      (c) => c.code === coupon.code
                    );
                    const isBelowMin =
                      coupon.minOrderAmount && subtotal < coupon.minOrderAmount;
                    const isDisabledByFreeshipRule =
                      coupon.type === "freeship" &&
                      appliedCoupons.some(
                        (c) => c.type === "freeship" && c.code !== coupon.code
                      );
                    const isDisabled = isBelowMin || isDisabledByFreeshipRule;

                    return (
                      <label
                        key={coupon.id}
                        className={`flex items-start bg-white p-3 rounded-lg border gap-4 ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded mt-1 accent-orange-500"
                          checked={isApplied}
                          disabled={isDisabled}
                          onChange={() => handleTogglePublicCoupon(coupon)}
                        />
                        <div className="flex-1">
                          <p className="font-bold">{coupon.name}</p>
                          <p className="text-sm text-gray-500">
                            {coupon.description}
                          </p>
                          {isBelowMin && (
                            <p className="text-xs text-red-500 mt-1">
                              Cần mua thêm{" "}
                              {(
                                coupon.minOrderAmount! - subtotal
                              ).toLocaleString("vi-VN")}
                              đ
                            </p>
                          )}
                          {isDisabledByFreeshipRule && (
                            <p className="text-xs text-blue-500 mt-1">
                              Chỉ áp dụng 1 mã Freeship.
                            </p>
                          )}
                        </div>
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
