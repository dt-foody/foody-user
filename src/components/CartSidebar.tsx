"use client";

import React, { memo, useState, useMemo } from "react";
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
  Clock,
  Zap,
  Calendar,
  MessageSquare,
  Pencil,
} from "lucide-react";
// === IMPORT THÊM TYPE TỪ STORE ===
import { SHIPPING_FEE, useCart } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";
import type { EligibilityStatus } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { Coupon } from "@/types";
// type DeliveryOption = "immediate" | "scheduled"; // <-- KHÔNG CẦN NỮA

/* ===========================
   Hoisted sub-components (memo)
   =========================== */

// ... (OptionChips component - giữ nguyên)
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

// ... (ItemNoteView component - giữ nguyên)
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

export default function CartSidebar() {
  const {
    cartItems,
    cartCount,
    showCart,
    setShowCart,
    updateQuantity,
    updateItemNote,
    removeItem,
    clearCart,
    subtotal,
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

    // === LẤY STATE VÀ ACTIONS TỪ STORE ===
    deliveryOption,
    setDeliveryOption,
    scheduledDate,
    setScheduledDate,
  } = useCart();

  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const [manualCouponCode, setManualCouponCode] = useState("");

  // === XÓA USESTATE LOCAL CHO DELIVERY ===
  // const [deliveryOption, setDeliveryOption] =
  //   useState<DeliveryOption>("immediate");
  // const [scheduledDate, setScheduledDate] = useState("");

  // Inline note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const router = useRouter();
  const { user } = useAuthStore();

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

  const handlePlaceOrder = () => {
    setShowCart(false);
    if (!user) {
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

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Group public coupons (top-level to avoid hook-in-render issues)
  const groupedCoupons = useMemo(() => {
    console.log("publicCouponStatuses", publicCouponStatuses);
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-orange-500" />
          <h2 className="text-base font-bold text-gray-800 text-lg">
            Giỏ hàng <span className="text-orange-500">({cartCount})</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Xóa
            </button>
          )}
          <button
            onClick={() => setShowCart(false)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng giỏ hàng"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center h-full flex flex-col justify-center items-center p-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg text-gray-500 font-medium">Giỏ hàng trống</p>
            <p className="text-md text-gray-400 mt-1">
              Thêm sản phẩm để bắt đầu mua sắm
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 space-y-2.5">
              {cartItems.map((item) => {
                const options =
                  item.selectedOptions?.map((o) => o.name).filter(Boolean) ??
                  [];
                const lineTotal = item.totalPrice * item.quantity;
                const isEditing = editingNoteId === item.cartId;

                return (
                  <div
                    key={item.cartId}
                    className="p-2.5 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.image || ""}
                        alt={item.name}
                        onError={handleImageError}
                        width={56}
                        height={56}
                        className="object-cover rounded-md flex-shrink-0"
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

                        {/* Unit price */}
                        <p className="text-[12px] text-gray-500">
                          {item.totalPrice.toLocaleString("vi-VN")}đ / món
                        </p>

                        {/* Options */}
                        <OptionChips names={options} />

                        {/* Note */}
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
          </>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 border-t bg-white shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
          <button
            onClick={handlePlaceOrder}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg ${
              user
                ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {user ? "Đặt hàng ngay" : "Đăng nhập để đặt hàng"}
          </button>
        </div>
      )}
    </div>
  );

  // ... (renderCouponPanel component - giữ nguyên)
  const renderCouponPanel = () => {
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

  return (
    <div
      className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
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
