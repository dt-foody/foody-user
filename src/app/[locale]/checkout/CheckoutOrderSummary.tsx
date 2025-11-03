"use client";

import React, { memo } from "react";
import {
  Clock,
  Zap,
  Calendar,
  MessageSquare,
  Edit2, // THÊM ICON SỬA
  Check,
  Tag,
} from "lucide-react";
import { useCart, DeliveryOption } from "@/stores/useCartStore";
import Image from "next/image";

/* ===========================
   Hoisted sub-components (memo)
   =========================== */

const OptionChips = memo(function OptionChips({ names }: { names: string[] }) {
  if (!names?.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {names.map((n, idx) => (
        <span
          key={`${n}-${idx}`}
          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200"
        >
          {n}
        </span>
      ))}
    </div>
  );
});

/* ===========================
   Main component
   =========================== */

type CheckoutOrderSummaryProps = {
  deliveryOption: DeliveryOption;
  setDeliveryOption: (val: DeliveryOption) => void;
  scheduledDate: string;
  setScheduledDate: (val: string) => void;
};

export default function CheckoutOrderSummary({
  deliveryOption,
  setDeliveryOption,
  scheduledDate,
  setScheduledDate,
}: CheckoutOrderSummaryProps) {
  const {
    cartItems,
    appliedCoupons,
    setShowCart, // Lấy hàm mở lại sidebar
  } = useCart();

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* === NÚT SỬA GIỎ HÀNG === */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800">
          Tóm tắt đơn hàng
        </h3>
        <button
          type="button" // Quan trọng: để không submit form
          onClick={() => setShowCart(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Sửa
        </button>
      </div>

      {/* Items (Read-only) */}
      <div className="overflow-y-auto max-h-72 pr-2 mb-5 space-y-2.5">
        {cartItems.map((item) => {
          const options =
            item.selectedOptions?.map((o) => o.name).filter(Boolean) ?? [];
          const lineTotal = item.totalPrice * item.quantity;

          return (
            <div key={item.cartId} className="p-2.5 bg-white rounded-lg border">
              <div className="flex items-start gap-3">
                <Image
                  src={item.image || ""}
                  alt={item.name}
                  onError={handleImageError}
                  width={48}
                  height={48}
                  className="object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {item.name}
                  </h4>

                  <p className="text-xs text-gray-500">
                    {item.totalPrice.toLocaleString("vi-VN")}đ
                  </p>

                  <OptionChips names={options} />

                  {/* === CHỈ HIỂN THỊ GHI CHÚ (READ-ONLY) === */}
                  {item.note && (
                    <div className="flex items-start gap-1.5 text-xs mt-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 leading-snug">{item.note}</p>
                    </div>
                  )}
                </div>

                {/* === CHỈ HIỂN THỊ SỐ LƯỢNG VÀ GIÁ (READ-ONLY) === */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <div className="text-xs text-gray-600">
                    SL:{" "}
                    <span className="font-bold text-gray-800">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {lineTotal.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Options (Vẫn cho phép sửa ở đây) */}
      <div className="pb-3 mb-5 border-b border-gray-200">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock size={16} className="text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-800">
              Thời gian giao hàng
            </h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="delivery"
                  value="immediate"
                  checked={deliveryOption === "immediate"}
                  onChange={() => setDeliveryOption("immediate")}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap size={14} className="text-orange-500" />
                  <span className="font-semibold text-sm text-gray-800">
                    Giao ngay
                  </span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                    Nhanh
                  </span>
                </div>
                <p className="text-xs text-gray-600">Giao hàng trong 2-4 giờ</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="delivery"
                  value="scheduled"
                  checked={deliveryOption === "scheduled"}
                  onChange={() => setDeliveryOption("scheduled")}
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar size={14} className="text-blue-600" />
                  <span className="font-semibold text-sm text-gray-800">
                    Hẹn giờ giao
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  Chọn ngày bạn muốn nhận hàng
                </p>

                {deliveryOption === "scheduled" && (
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-2.5 py-1.5 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Coupon Section (Read-only) */}
      <div className="pb-3 space-y-2.5">
        {appliedCoupons.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-semibold text-xs text-gray-700 flex items-center gap-1.5">
              <Tag size={12} className="text-green-600" />
              Khuyến mãi đã áp dụng
            </p>
            {appliedCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-green-800 font-semibold text-xs truncate">
                    {coupon.name}
                  </p>
                  <p className="text-xs text-gray-600 font-mono">
                    {coupon.code}
                  </p>
                </div>
                <Check
                  size={16}
                  className="text-green-600 flex-shrink-0 ml-2"
                />
              </div>
            ))}
          </div>
        )}

        {/* XÓA PHẦN NHẬP MÃ VÀ NÚT "KHUYẾN MÃI KHÁC" */}
      </div>
    </div>
  );
}
