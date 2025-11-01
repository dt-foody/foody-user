"use client";

import React, { memo, useState, useMemo } from "react";
import {
  Plus,
  Minus,
  Trash2,
  Loader,
  Tag,
  ChevronRight,
  ChevronLeft,
  XCircle,
  Check,
  Clock,
  Zap,
  Calendar,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import type { Coupon, EligibilityStatus } from "@/stores/useCartStore";
import type { DeliveryOption } from "./page"; // Import type từ trang checkout

/* ===========================
   Hoisted sub-components (memo)
   =========================== */

// ... (Copy 2 components: OptionChips và ItemNoteView từ CartSidebar.tsx) ...
// ... (Chúng giống hệt, không cần thay đổi) ...

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

const ItemNoteView = memo(function ItemNoteView({
  cartId,
  note,
  isEditing,
  beginEditNote,
  cancelEditNote,
  noteDraft,
  setNoteDraft,
  saveNote,
}: {
  cartId: string;
  note?: string;
  isEditing: boolean;
  beginEditNote: (id: string, current?: string) => void;
  cancelEditNote: () => void;
  noteDraft: string;
  setNoteDraft: (v: string) => void;
  saveNote: (id: string) => void;
}) {
  if (!isEditing) {
    return (
      <div className="mt-1.5">
        {note ? (
          <div className="flex items-start gap-1.5 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
            <p className="text-gray-600 leading-snug line-clamp-2">{note}</p>
            <button
              onClick={() => beginEditNote(cartId, note)}
              className="ml-1 text-[11px] text-gray-500 hover:text-gray-700 underline"
            >
              Sửa
            </button>
          </div>
        ) : (
          <button
            onClick={() => beginEditNote(cartId, "")}
            className="text-[11px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" />
            Thêm ghi chú
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-1.5">
      <label className="sr-only" htmlFor={`note-${cartId}`}>
        Ghi chú
      </label>
      <textarea
        id={`note-${cartId}`}
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        rows={2}
        placeholder="Ghi chú cho quán (vd: ít đường, không cay...)"
        className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => saveNote(cartId)}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600"
        >
          Lưu
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancelEditNote}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Hủy
        </button>
      </div>
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
    updateQuantity,
    updateItemNote,
    removeItem,
    subtotal,
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

  // Inline note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const handleApplyPrivateCoupon = async () => {
    if (!manualCouponCode) return;
    const { success } = await applyPrivateCoupon(manualCouponCode);
    if (success) setManualCouponCode("");
  };

  const handleTogglePublicCoupon = (coupon: Coupon) => {
    if (appliedCoupons.some((c) => c.id === coupon.id)) {
      removeCoupon(coupon.id);
    } else {
      applyPublicCoupon(coupon);
    }
  };

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

  // Group public coupons (top-level to avoid hook-in-render issues)
  const groupedCoupons = useMemo(() => {
    // ... (Copy logic groupedCoupons từ CartSidebar.tsx) ...
    const groups = publicCouponStatuses.reduce((acc, status) => {
      const key = status.coupon.type || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(status);
      return acc;
    }, {} as Record<string, (EligibilityStatus & { coupon: Coupon })[]>);

    for (const key in groups) {
      groups[key].sort((a, b) => {
        if (a.isEligible && !b.isEligible) return -1;
        if (!a.isEligible && b.isEligible) return 1;

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

        const discountA = getDiscountValue(a.coupon);
        const discountB = getDiscountValue(b.coupon);
        return discountB - discountA;
      });
    }
    return groups;
  }, [publicCouponStatuses, subtotal]);

  const groupTitles: Record<string, string> = {
    discount_code: "Mã Giảm Giá",
    freeship: "Miễn Phí Vận Chuyển",
  };

  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.type === "freeship") return "Free Ship";
    if (coupon.valueType === "percentage") return `${coupon.value}%`;
    return `${coupon.value.toLocaleString("vi-VN")}đ`;
  };

  // Note edit handlers
  const beginEditNote = (cartId: string, current?: string) => {
    setEditingNoteId(cartId);
    setNoteDraft(current ?? "");
  };
  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteDraft("");
  };
  const saveNote = (cartId: string) => {
    updateItemNote(cartId, noteDraft.trim());
    setEditingNoteId(null);
    setNoteDraft("");
  };

  const renderCartContent = () => (
    // Xóa header và footer của CartSidebar
    // Thay đổi `flex-1 overflow-y-auto` thành `overflow-y-auto max-h-96 pr-2 mb-5`
    // để nó có thể cuộn độc lập và có khoảng cách với phần bên dưới
    <>
      {/* Items */}
      <div className="overflow-y-auto max-h-96 pr-2 mb-5 space-y-2.5">
        {cartItems.map((item) => {
          const options =
            item.selectedOptions?.map((o) => o.name).filter(Boolean) ?? [];
          const lineTotal = item.totalPrice * item.quantity;
          const isEditing = editingNoteId === item.cartId;

          return (
            <div
              key={item.cartId}
              className="p-2.5 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={handleImageError}
                  className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      aria-label="Xóa sản phẩm"
                      className="flex-shrink-0 p-1 rounded-full hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <p className="text-[12px] text-gray-500">
                    {item.totalPrice.toLocaleString("vi-VN")}đ / món
                  </p>
                  <OptionChips names={options} />
                  <ItemNoteView
                    cartId={item.cartId}
                    note={item.note}
                    isEditing={isEditing}
                    beginEditNote={beginEditNote}
                    cancelEditNote={cancelEditNote}
                    noteDraft={noteDraft}
                    setNoteDraft={setNoteDraft}
                    saveNote={saveNote}
                  />
                </div>

                {/* Qty & line total */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center font-semibold text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={14} />
                    </button>
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

      {/* Delivery Options */}
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

      {/* Coupon Section */}
      <div className="pb-3 space-y-2.5">
        {/* Private input */}
        <div className="bg-gray-50 rounded-lg p-3 border">
          <label className="font-semibold text-xs text-gray-700 mb-2 block flex items-center gap-1.5">
            <Tag size={13} className="text-orange-500" />
            Mã khuyến mãi
          </label>
          <div className="flex gap-2">
            <input
              value={manualCouponCode}
              onChange={(e) =>
                setManualCouponCode(e.target.value.toUpperCase())
              }
              placeholder="Nhập mã của bạn"
              className="flex-1 px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={handleApplyPrivateCoupon}
              disabled={couponStatus.isLoading || !manualCouponCode}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
            >
              {couponStatus.isLoading ? (
                <Loader className="animate-spin mx-auto" size={16} />
              ) : (
                "Áp dụng"
              )}
            </button>
          </div>
          {couponStatus.error && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <XCircle size={12} />
              {couponStatus.error}
            </p>
          )}
        </div>

        {/* Applied */}
        {appliedCoupons.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-semibold text-xs text-gray-700 flex items-center gap-1">
              <Check size={12} className="text-green-600" />
              Đã áp dụng ({appliedCoupons.length})
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
                <button
                  onClick={() => removeCoupon(coupon.id)}
                  className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Gỡ mã khuyến mãi"
                >
                  <XCircle size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Public list button */}
        <button
          onClick={() => setIsCouponPanelOpen(true)}
          className="flex justify-between items-center w-full p-2.5 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Tag className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-semibold text-sm text-gray-800">
              Khuyến mãi khác
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </button>
        
        {/* Chúng ta XÓA phần "Order summary" (tạm tính, phí ship...) 
            vì trang checkout page đã có phần này rồi */}
      </div>
    </>
  );

  const renderCouponPanel = () => {
    // ... (Copy TOÀN BỘ hàm renderCouponPanel từ CartSidebar.tsx) ...
    const hasAnyCoupons = Object.keys(groupedCoupons).length > 0;

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-gray-50">
        <div className="flex items-center px-4 py-3 border-b bg-white shadow-sm flex-shrink-0">
          <button
            onClick={() => setIsCouponPanelOpen(false)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors -ml-1"
            aria-label="Quay lại giỏ hàng"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-base font-bold mx-auto text-gray-800">
            Chọn Khuyến Mãi
          </h2>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {isLoadingPublicCoupons ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin text-orange-500" size={28} />
            </div>
          ) : !hasAnyCoupons ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Tag className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                Chưa có khuyến mãi
              </h3>
              <p className="text-sm text-gray-500">Hãy quay lại sau nhé!</p>
            </div>
          ) : (
            Object.entries(groupedCoupons).map(([type, coupons]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-1 h-4 rounded-full ${
                      type === "freeship" ? "bg-blue-500" : "bg-orange-500"
                    }`}
                  />
                  <h3 className="font-bold text-sm text-gray-800">
                    {groupTitles[type] || "Khuyến mãi khác"}
                  </h3>
                </div>

                <div className="space-y-2">
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
                        className={`block relative overflow-hidden rounded-lg transition-all duration-200 ${
                          isDisabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:shadow-md hover:scale-[1.01]"
                        } ${
                          isApplied
                            ? "ring-2 ring-orange-500 shadow-md"
                            : "shadow-sm"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${bgGradient} ${
                            isApplied ? "opacity-10" : "opacity-5"
                          }`}
                        />

                        <div className="relative bg-white p-3 flex gap-3">
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center text-white shadow-sm`}
                          >
                            <Tag className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-bold text-center px-1 leading-tight">
                              {formatDiscountValue(coupon)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                {coupon.name}
                              </h4>

                              {isApplied ? (
                                <span className="flex-shrink-0 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded flex items-center gap-0.5">
                                  <Check size={10} />
                                  Đang dùng
                                </span>
                              ) : !isEligible ? (
                                <span className="flex-shrink-0 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded">
                                  Chưa đủ ĐK
                                </span>
                              ) : (
                                <span className="flex-shrink-0 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-semibold rounded">
                                  Có thể dùng
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-600 mb-1.5 line-clamp-2">
                              {coupon.description}
                            </p>

                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-mono font-semibold text-gray-700">
                              <Tag size={10} />
                              {coupon.code}
                            </div>

                            {!isEligible && reason && !isApplied && (
                              <p className="text-[11px] text-red-500 font-medium mt-1.5">
                                • {reason}
                              </p>
                            )}
                            {isDisabledByFreeshipRule && (
                              <p className="text-[11px] text-blue-600 font-medium mt-1.5">
                                • Chỉ áp dụng 1 mã Freeship
                              </p>
                            )}
                          </div>

                          <div
                            className={`flex-shrink-0 flex items-center justify-center w-5 h-5 border-2 rounded-full transition-all ${
                              isApplied
                                ? "bg-orange-500 border-orange-500"
                                : "bg-white border-gray-300"
                            } ${
                              isDisabled ? "bg-gray-100 border-gray-200" : ""
                            }`}
                          >
                            {isApplied && (
                              <Check
                                size={14}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>

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

  // Đây là phần wrapper của CartSidebar,
  // chúng ta giữ lại logic chuyển đổi giữa 2 panel
  return (
    <div className="flex flex-col relative overflow-hidden">
      <div
        className={`transition-transform duration-300 w-full ${
          isCouponPanelOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {renderCartContent()}
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 bg-gray-50 ${
          isCouponPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {renderCouponPanel()}
      </div>
    </div>
  );
}