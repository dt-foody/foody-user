"use client";

import React, { useState, useMemo } from "react";
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
  MessageSquare,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, SHIPPING_FEE } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { EligibilityStatus } from "@/stores/useCartStore";
// Import đúng type từ file order.ts
import type { Coupon, CreateOrderItem_Option } from "@/types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

/* -----------------------------
   Local memo components
----------------------------- */

// Helper để format price
const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

/**
 * Component render Options (cho cả Product và Combo)
 */
const RenderSelectedOptions = React.memo(function RenderSelectedOptions({
  options,
}: {
  options: Record<string, CreateOrderItem_Option[]>;
}) {
  // Gộp tất cả các options đã chọn từ các nhóm lại thành 1 mảng
  const allOptions = React.useMemo(() => {
    return Object.values(options || {}).flat();
  }, [options]);

  if (allOptions.length === 0) return null;

  return (
    <div className="pl-3 mt-1 space-y-0.5">
      {allOptions.map((opt, index) => (
        <p key={index} className="text-xs text-gray-500">
          + {opt.name}
          {/* SỬA LỖI: Dùng opt.priceModifier */}
          {opt.priceModifier > 0 && (
            <span className="font-medium ml-1 text-gray-600">
              (+{formatPrice(opt.priceModifier)})
            </span>
          )}
        </p>
      ))}
    </div>
  );
});

// Component này đã tốt (dùng cartId), giữ nguyên
const ItemNoteView = React.memo(function ItemNoteView({
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
      <div className="mt-2">
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
    <div className="mt-2">
      <textarea
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        rows={2}
        placeholder="Ghi chú cho quán (vd: ít đường, không cay...)"
        className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => saveNote(cartId)}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600"
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

/* -----------------------------
   Main Component
----------------------------- */

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
  } = useCart(); // <-- Đã sửa, dùng useCart()

  const router = useRouter();
  const { user } = useAuthStore();

  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const [manualCouponCode, setManualCouponCode] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // ... (Tất cả logic (handlers) giữ nguyên) ...
  const handleApplyPrivateCoupon = async () => {
    if (!manualCouponCode) return;
    const { success } = await applyPrivateCoupon(manualCouponCode);
    if (success) setManualCouponCode("");
  };
  const handleTogglePublicCoupon = (coupon: Coupon) => {
    if (appliedCoupons.some((c) => c.id === coupon.id)) removeCoupon(coupon.id);
    else applyPublicCoupon(coupon);
  };
  const handlePlaceOrder = () => {
    setShowCart(false);
    if (!user) router.push("/login?redirect_uri=/checkout");
    else router.push("/checkout");
  };
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };
  const beginEditNote = (id: string, cur?: string) => {
    setEditingNoteId(id);
    setNoteDraft(cur ?? "");
  };
  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteDraft("");
  };
  const saveNote = (id: string) => {
    updateItemNote(id, noteDraft.trim());
    cancelEditNote();
  };

  // ... (useMemo groupedCoupons giữ nguyên) ...
  const groupedCoupons = useMemo(() => {
    const groups = publicCouponStatuses.reduce((acc, status) => {
      const key = status.coupon.type || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(status);
      return acc;
    }, {} as Record<string, (EligibilityStatus & { coupon: Coupon })[]>);

    for (const key in groups) {
      groups[key].sort((a, b) => {
        const getValue = (coupon: Coupon) =>
          coupon.valueType === "percentage" ? coupon.value : coupon.value ?? 0;
        return getValue(b.coupon) - getValue(a.coupon);
      });
    }
    return groups;
  }, [publicCouponStatuses]);

  const groupTitles: Record<string, string> = {
    discount_code: "Mã Giảm Giá",
    freeship: "Miễn Phí Vận Chuyển",
  };
  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.type === "freeship") return "Free Ship";
    if (coupon.valueType === "percentage") return `${coupon.value}%`;
    return `${coupon.value.toLocaleString("vi-VN")}đ`;
  };

  /* -----------------------------
     Cart Content
  ----------------------------- */
  const renderCartContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header (giữ nguyên) */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-primary-600" />
          <h2 className="text-base font-bold text-gray-800 text-lg">
            Giỏ hàng <span className="text-primary-600">({cartCount})</span>
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
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Items (NÂNG CẤP) */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center h-full flex flex-col justify-center items-center p-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg text-gray-500 font-medium">Giỏ hàng trống</p>
            <p className="text-sm text-gray-400 mt-1">
              Thêm sản phẩm để bắt đầu mua sắm
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 space-y-2.5">
              {cartItems.map((item) => {
                const lineTotal = item.totalPrice * item.quantity;
                const isEditing = editingNoteId === item.cartId;

                // Lấy giá base (gốc)
                const baseOrComboPrice =
                  (item.itemType === "Product"
                    ? item.item.basePrice
                    : item.item.comboPrice) ?? 0;

                return (
                  <div
                    key={item.cartId}
                    className="p-2.5 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* --- Image --- */}
                      <Image
                        src={item._image || PLACEHOLDER_IMAGE} // Dùng metadata
                        alt={item.item.name}
                        onError={handleImageError}
                        width={56}
                        height={56}
                        className="object-cover rounded-md flex-shrink-0"
                      />

                      {/* --- Item Info --- */}
                      <div className="flex-1 min-w-0">
                        {/* Tên item */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                            {item.item.name}
                          </h4>

                          {/* ================================================
                            CẢI TIẾN 4: Chỉ hiện giá base nếu > 0
                            ================================================
                          */}
                          {baseOrComboPrice > 0 && (
                            <p className="text-sm text-gray-500">
                              {formatPrice(baseOrComboPrice)}
                            </p>
                          )}
                          {/* ================================================
                            KẾT THÚC CẢI TIẾN 4
                            ================================================
                          */}
                        </div>

                        {/* Render Options / Combo Selections */}
                        <div className="mt-1.5">
                          {/* 1. Nếu là SẢN PHẨM ĐƠN */}
                          {item.itemType === "Product" && (
                            <RenderSelectedOptions options={item.options} />
                          )}

                          {/* 2. Nếu là COMBO */}
                          {item.itemType === "Combo" && (
                            <div className="pl-2 mt-1 space-y-1">
                              {(item.comboSelections || []).map((sel, idx) => (
                                <div key={idx}>
                                  <p className="text-sm font-medium text-gray-700">
                                    - {sel.product.name}
                                  </p>
                                  {/* Tái sử dụng component render options */}
                                  <RenderSelectedOptions
                                    options={sel.options}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* --- Note --- */}
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

                      {/* --- Actions (Quantity & Remove) --- */}
                      <div className="flex flex-col items-end gap-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-gray-900">
                            {lineTotal.toLocaleString("vi-VN")}đ
                          </div>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="p-1 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon & Summary (giữ nguyên) */}
            <div className="px-3 pb-3 space-y-2.5">
              {/* Private Input */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-sm flex items-center gap-1.5">
                    <Tag size={13} className="text-primary-500" />
                    Mã khuyến mãi
                  </label>
                  <button
                    onClick={() => setIsCouponPanelOpen(true)}
                    className="text-sm font-medium hover:text-primary-700 flex items-center gap-1"
                  >
                    Xem thêm
                    <ChevronRight size={12} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    value={manualCouponCode}
                    onChange={(e) =>
                      setManualCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã của bạn"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border focus:ring-primary-500"
                  />
                  <button
                    onClick={handleApplyPrivateCoupon}
                    disabled={couponStatus.isLoading || !manualCouponCode}
                    className="px-4 py-2 bg-primary-500 hover:bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Applied Coupons */}
              {appliedCoupons.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-xs text-gray-700 flex items-center gap-1">
                    <Check size={12} className="text-green-600" />
                    Đã áp dụng ({appliedCoupons.length})
                  </p>
                  {appliedCoupons.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="text-green-800 font-semibold text-xs">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-600 font-mono">
                          {c.code}
                        </p>
                      </div>
                      <button
                        onClick={() => removeCoupon(c.id)}
                        className="p-1 hover:bg-red-100 rounded-full"
                      >
                        <XCircle size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border space-y-1.5">
                <h3 className="font-semibold text-sm text-gray-800 mb-2 pb-2 border-b">
                  Chi tiết đơn hàng
                </h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {SHIPPING_FEE.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {itemDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm sản phẩm</span>
                    <span className="font-semibold">
                      -{itemDiscount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm phí ship</span>
                    <span className="font-semibold">
                      -{shippingDiscount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 mt-2 border-t">
                  <span className="text-sm font-semibold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-lg font-bold text-[#b9915f]">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer (giữ nguyên) */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 border-t bg-white shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]">
          <button
            onClick={handlePlaceOrder}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg ${
              user
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {user ? "Đặt hàng ngay" : "Đăng nhập để đặt hàng"}
          </button>
        </div>
      )}
    </div>
  );

  /* -----------------------------
     Coupon Panel (giữ nguyên)
  ----------------------------- */
  const renderCouponPanel = () => {
    const hasCoupons = Object.keys(groupedCoupons).length > 0;

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-gray-50">
        <div className="flex items-center px-4 py-3 border-b bg-white shadow-sm">
          <button
            onClick={() => setIsCouponPanelOpen(false)}
            className="p-1.5 hover:bg-gray-100 rounded-full"
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
              <Loader className="animate-spin text-primary-500" size={28} />
            </div>
          ) : !hasCoupons ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <Tag className="w-10 h-10 text-primary-400" />
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
                      type === "freeship" ? "bg-blue-500" : "bg-primary-500"
                    }`}
                  />
                  <h3 className="font-bold text-sm text-gray-800">
                    {groupTitles[type] || "Khuyến mãi khác"}
                  </h3>
                </div>

                <div className="space-y-2">
                  {coupons.map((s) => {
                    const { coupon, isEligible } = s;

                    const isApplied = appliedCoupons.some(
                      (c) => c.id === coupon.id
                    );
                    const isDisabled =
                      (!isEligible && !isApplied) ||
                      (coupon.type === "freeship" &&
                        !isApplied &&
                        appliedCoupons.some((c) => c.type === "freeship"));
                    return (
                      <label
                        key={coupon.id}
                        className={`block relative overflow-hidden rounded-lg border transition-all ${
                          isApplied
                            ? "ring-2 ring-primary-500 shadow-md"
                            : "hover:shadow-md"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="bg-white p-3 flex gap-3">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex flex-col items-center justify-center text-white shadow-sm">
                            <Tag className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-bold">
                              {formatDiscountValue(coupon)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-bold text-sm text-gray-900">
                                {coupon.name}
                              </h4>
                              {isApplied && (
                                <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded">
                                  Đang dùng
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1.5 line-clamp-2">
                              {coupon.description}
                            </p>
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-mono text-gray-700">
                              <Tag size={10} />
                              {coupon.code}
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
                              isApplied
                                ? "bg-primary-500 border-primary-500"
                                : "border-gray-300"
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

  /* -----------------------------
     Main Return (giữ nguyên)
  ----------------------------- */
  return (
    <div
      className={`z-[100] fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
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
