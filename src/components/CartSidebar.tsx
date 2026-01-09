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
  MapPin,
  Ticket,
  Info,
  AlertTriangle,
  Gift,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Coupon } from "@/types";
import {
  CartLine,
  CreateOrderItem_ComboSelection,
  CreateOrderItem_Option,
} from "@/types/cart";
import { getCartItemPrices } from "@/utils/cartHelper";
import Link from "next/link";
import AnonymousCheckoutModal from "./AnonymousCheckoutModal";
import foodImageDefault from "../images/food_image_default.jpg";

const PLACEHOLDER_IMAGE = foodImageDefault;
const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

// --- HELPER COMPONENTS ---

const RenderSelectedOptions = React.memo(function RenderSelectedOptions({
  options,
}: {
  options: Record<string, CreateOrderItem_Option[]>;
}) {
  const allOptions = React.useMemo(
    () => Object.values(options || {}).flat(),
    [options]
  );
  if (allOptions.length === 0) return null;
  return (
    <div className="pl-3 mt-1 space-y-0.5">
      {allOptions.map((opt, index) => (
        <p key={index} className="text-xs text-gray-500">
          + {opt.name}
          {opt.priceModifier > 0 && (
            <span className="ml-1 text-gray-600">
              (+{formatPrice(opt.priceModifier)})
            </span>
          )}
        </p>
      ))}
    </div>
  );
});

// @ts-ignore
const ItemNoteView = React.memo(function ItemNoteView({
  cartId,
  note,
  isEditing,
  beginEditNote,
  cancelEditNote,
  noteDraft,
  setNoteDraft,
  saveNote,
}: any) {
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
            <Pencil className="w-3.5 h-3.5" /> Thêm ghi chú
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
        placeholder="Ghi chú..."
        className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-400 transition"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <button
          onClick={() => saveNote(cartId)}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600"
        >
          Lưu
        </button>
        <button
          onClick={cancelEditNote}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Hủy
        </button>
      </div>
    </div>
  );
});

// --- COMPONENT HIỂN THỊ 1 DÒNG COUPON ---
const CouponItem = ({
  coupon,
  isApplied,
  onToggle,
}: {
  coupon: any;
  isApplied: boolean;
  onToggle: (c: Coupon) => void;
}) => {
  const isGift =
    coupon.valueType === "gift_item" ||
    (coupon.giftItems && coupon.giftItems.length > 0);

  return (
    <div
      onClick={() => coupon.isEligible && onToggle(coupon)}
      className={`relative rounded-lg border p-3 flex gap-3 transition-all cursor-pointer group
        ${
          isApplied
            ? "bg-primary-50 border-primary-500 ring-1 ring-primary-500"
            : "bg-white border-gray-200 hover:border-primary-300"
        }
        ${!coupon.isEligible ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}
      `}
    >
      <div
        className={`w-12 flex flex-col items-center justify-center border-r border-dashed ${
          isApplied ? "border-primary-200" : "border-gray-200"
        } pr-3`}
      >
        {coupon.type === "freeship" ? (
          <Ticket
            className={`w-6 h-6 ${
              isApplied ? "text-primary-600" : "text-gray-400"
            }`}
          />
        ) : isGift ? (
          <Gift
            className={`w-6 h-6 ${
              isApplied ? "text-purple-600" : "text-purple-400"
            }`}
          />
        ) : (
          <Ticket
            className={`w-6 h-6 ${
              isApplied ? "text-primary-600" : "text-gray-400"
            }`}
          />
        )}

        <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase text-center">
          {coupon.type === "freeship" ? "SHIP" : isGift ? "GIFT" : "GIẢM"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-gray-800 truncate">
          {coupon.name}
        </h4>
        <p className="text-xs text-gray-500 truncate mt-0.5">{coupon.code}</p>

        {isGift && coupon.giftItems && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {coupon.giftItems.map((g: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100"
              >
                <Gift size={10} /> + {g.name}
              </span>
            ))}
          </div>
        )}

        {!coupon.isEligible ? (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
            <XCircle size={10} /> {coupon.reason || "Chưa đủ điều kiện"}
          </p>
        ) : (
          <p className="text-[11px] text-primary-600 mt-1">
            HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
          </p>
        )}
      </div>
      <div className="flex items-center">
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
          ${
            isApplied
              ? "bg-primary-500 border-primary-500"
              : "border-gray-300 bg-white"
          }
        `}
        >
          {isApplied && <Check size={12} className="text-white" />}
        </div>
      </div>
    </div>
  );
};

export default function CartSidebar() {
  const {
    cartItems,
    giftLines,
    giftTotal,
    cartCount,
    surcharges,
    showCart,
    setShowCart,
    updateQuantity,
    updateItemNote,
    removeItem,
    clearCart,
    subtotal,
    itemDiscount,
    shippingDiscount,
    totalSurcharge,
    finalTotal,
    appliedCoupons,
    toggleCoupon,
    applyPrivateCoupon,
    removeCoupon,
    originalShippingFee,
    selectedAddress,
    shippingDistance,
    personalCoupons,
    publicCoupons,
    isLoadingCoupons,
    fetchAvailableCoupons,
  } = useCart();

  const totalSaved = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const { savedAmountPerItem } = getCartItemPrices(item);
      return acc + savedAmountPerItem * item.quantity;
    }, 0);
  }, [cartItems]);

  const router = useRouter();
  const { user } = useAuthStore();
  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showAnonymousModal, setShowAnonymousModal] = useState(false);

  // Logic chỉnh sửa Note
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

  // Mở panel coupon và refresh data
  const openCouponPanel = () => {
    setIsCouponPanelOpen(true);
    fetchAvailableCoupons();
  };

  const handleApplyManual = async () => {
    if (!manualCode.trim()) return;
    setCouponLoading(true);
    const res = await applyPrivateCoupon(manualCode);
    setCouponLoading(false);
    if (res.success) setManualCode("");
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // PLACEHOLDER_IMAGE là StaticImageData, cần dùng .src để lấy string path
    e.currentTarget.src = (PLACEHOLDER_IMAGE as any).src || PLACEHOLDER_IMAGE;
  };

  // --- RENDER COUPON PANEL ---
  const renderCouponPanel = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center px-4 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã voucher"
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button
            disabled={!manualCode || couponLoading}
            onClick={handleApplyManual}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {couponLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              "Áp dụng"
            )}
          </button>
        </div>

        {isLoadingCoupons && (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin text-primary-500" />
          </div>
        )}

        <div>
          <h3 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">
            Voucher của bạn
          </h3>
          <div className="space-y-2.5">
            {personalCoupons.length > 0 ? (
              personalCoupons.map((c: any) => (
                <CouponItem
                  key={c.id}
                  coupon={c}
                  isApplied={appliedCoupons.some((ac) => ac.id === c.id)}
                  onToggle={toggleCoupon}
                />
              ))
            ) : (
              <p className="text-xs text-gray-500 italic text-center py-2">
                Bạn chưa có voucher cá nhân nào.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">
            Mã giảm giá khác
          </h3>
          <div className="space-y-2.5">
            {publicCoupons.length > 0 ? (
              publicCoupons.map((c) => (
                <CouponItem
                  key={c.id}
                  coupon={c}
                  isApplied={appliedCoupons.some((ac) => ac.id === c.id)}
                  onToggle={toggleCoupon}
                />
              ))
            ) : (
              <p className="text-xs text-gray-500 italic text-center py-2">
                Không có mã giảm giá công khai.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDER MAIN CART CONTENT ---
  const renderCartContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
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

      {/* Address */}
      {user && selectedAddress && (
        <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
          <MapPin size={14} className="text-orange-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-800 truncate font-medium">
              <span className="text-orange-700 font-bold mr-1">
                {selectedAddress.label}:
              </span>
              {selectedAddress.fullAddress}
            </p>
          </div>
          {shippingDistance > 0 && (
            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-orange-200 text-orange-600 font-mono">
              {shippingDistance}km
            </span>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 && giftLines.length === 0 ? (
          // ... (Empty state giữ nguyên)
          <div className="text-center h-full flex flex-col justify-center items-center p-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg text-gray-500 font-medium">Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="p-3 space-y-2.5">
              {/* 1. Render Cart Items Chính */}
              {cartItems.map((item) => {
                const isEditing = editingNoteId === item.cartId;
                const lineTotal = item.totalPrice * item.quantity;

                const priceDetail = getCartItemPrices(item);

                return (
                  <div
                    key={item.cartId}
                    className="p-2.5 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={item._image || PLACEHOLDER_IMAGE}
                        alt={item.item.name}
                        onError={handleImageError}
                        width={56}
                        height={56}
                        className="object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                            {item.item.name}
                          </h4>

                          {/* --- PHẦN GIÁ CẢI TIẾN --- */}
                          <div className="flex flex-col mt-1 gap-0.5">
                            <div className="flex items-center gap-2">
                              {/* Giá thực của món (đã giảm) */}
                              <span className="text-sm font-bold text-primary-600">
                                {formatPrice(
                                  priceDetail.productPriceAfterPromo
                                )}
                              </span>

                              {/* Giá gốc gạch ngang + Tag % (Chỉ hiện nếu có giảm giá) */}
                              {priceDetail.hasDiscount && (
                                <>
                                  <span className="text-xs text-gray-400 line-through decoration-gray-300">
                                    {formatPrice(priceDetail.basePrice)}
                                  </span>
                                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded border border-red-100">
                                    -{priceDetail.discountPercent}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                          {item.itemType === "Product" && (
                            <RenderSelectedOptions options={item.options} />
                          )}
                          {item.itemType === "Combo" && (
                            <div className="pl-1 space-y-2">
                              {(item.comboSelections || []).map((sel, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <div className="text-xs text-gray-600">
                                    • {sel.product.name}
                                  </div>
                                  {/* Hiển thị options cho từng món trong combo */}
                                  <RenderSelectedOptions
                                    options={sel.options}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
                    {item.promotionWarning && (
                      <div className="flex items-center gap-1 mt-2 text-[12px] text-orange-700 p-1.5 rounded-md">
                        <AlertTriangle size={12} className="flex-shrink-0" />
                        <span className="leading-tight">
                          {item.promotionWarning}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 2. [NEW] Render Gift Items (Quà tặng) */}
              {giftLines.map((gift: any, idx: number) => (
                <div
                  key={`gift-${idx}`}
                  className="p-2.5 bg-purple-50 rounded-lg border border-purple-100 relative overflow-hidden"
                >
                  {/* Decorative background stripe */}
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-purple-100 rounded-full opacity-50 blur-xl"></div>

                  <div className="flex items-start gap-3 relative z-10">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <Image
                        src={PLACEHOLDER_IMAGE} // Dùng placeholder hoặc logic lấy ảnh
                        alt={gift.name}
                        width={56}
                        height={56}
                        className="object-cover rounded-md opacity-90 grayscale-[0.2]"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-1 rounded-full shadow-sm">
                        <Gift size={10} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-800 mb-1">
                            {gift.price === 0 ? "QUÀ TẶNG" : "MUA KÈM ƯU ĐÃI"}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                            {gift.name}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center h-full">
                      {/* Hiển thị giá: Nếu 0 thì hiện 0đ/Miễn phí, nếu >0 thì hiện giá bán */}
                      <span
                        className={`text-sm font-bold ${
                          gift.price === 0 ? "text-purple-600" : "text-gray-900"
                        }`}
                      >
                        {gift.price === 0 ? "0đ" : formatPrice(gift.price)}
                      </span>

                      <span className="text-xs font-medium text-gray-500 mt-1">
                        x{gift.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 pb-3 space-y-2.5">
              {/* Nút chọn Coupon */}
              <button
                onClick={openCouponPanel}
                className="w-full bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between group hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Ưu đãi & Khuyến mãi
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {appliedCoupons.length > 0 ? (
                    <span className="text-xs font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      {appliedCoupons.length} đang dùng
                    </span>
                  ) : (
                    <span className="text-xs text-orange-500 group-hover:translate-x-1 transition-transform">
                      Chọn hoặc nhập mã
                    </span>
                  )}
                  <ChevronRight size={14} className="text-orange-400" />
                </div>
              </button>

              {/* Coupon đã áp dụng */}
              {appliedCoupons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {appliedCoupons.map((c) => (
                    <div
                      key={c.id}
                      className="inline-flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs text-green-700"
                    >
                      <span className="font-semibold">{c.code}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCoupon(c.id);
                        }}
                        className="hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalSaved > 0 && (
                <div className="flex justify-between text-xs py-2.5 px-3 bg-green-50 rounded-lg border border-green-200 animate-pulse-slow">
                  <span className="text-green-700 font-medium flex items-center gap-2">
                    <Tag size={14} className="text-green-600" />
                    Ưu đãi giảm giá món:
                  </span>
                  <span className="text-green-700 font-bold">
                    -{formatPrice(totalSaved)}
                  </span>
                </div>
              )}

              {/* Bill Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {/* [NEW]: Hiển thị dòng Phí quà tặng/Mua kèm nếu > 0 */}
                {giftTotal > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sản phẩm mua kèm</span>
                    <span className="font-medium">
                      +{giftTotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {originalShippingFee.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {itemDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Voucher giảm giá</span>
                    <span className="font-semibold">
                      -{itemDiscount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Miễn phí vận chuyển</span>
                    <span className="font-semibold">
                      -{shippingDiscount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}

                {totalSurcharge > 0 && (
                  <div className="group relative flex justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Phụ thu dịch vụ</span>
                      <Info size={14} />

                      <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block w-72 p-3 bg-white border border-primary-100 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[12px] font-bold tracking-wider mb-2">
                          Chi tiết phụ thu
                        </p>
                        <div className="space-y-1.5">
                          {surcharges.map((s) => (
                            <div
                              key={s.id}
                              className="flex justify-between items-start gap-4 py-1.5 border-b border-primary-50 last:border-0"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-[11px]">
                                  {s.name}
                                </p>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                  {s.description}
                                </p>
                              </div>
                              <span className="font-bold text-primary-600 text-xs">
                                +{s.cost.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="absolute top-full left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-primary-100 -z-10 translate-y-[1px]"></div>
                      </div>
                    </div>
                    <span className="text-primary-600 font-medium">
                      +{totalSurcharge.toLocaleString()}đ
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary-600">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="px-4 py-3 border-t bg-white shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]">
          <button
            onClick={() => {
              setShowCart(false);
              router.push("/checkout");

              // if (user) {
              //   setShowCart(false);
              //   router.push("/checkout");
              // } else {
              //   setShowAnonymousModal(true);
              // }
            }}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg ${"bg-primary-500 text-white hover:bg-primary-600"}`}
          >
            {`Thanh toán • ${finalTotal.toLocaleString("vi-VN")}đ`}
          </button>
        </div>
      )}
      {!user && (
        <div className="px-4 py-3 border-t bg-yellow-50 gap-2 text-sm text-yellow-800">
          Đăng ký tài khoản để không bỏ lỡ quà tặng và những đặc quyền chỉ dành
          riêng cho thành viên. &nbsp;
          <Link
            href="/signup"
            className="font-semibold text-primary-600 underline"
            onClick={() => setShowCart(false)}
          >
            Đăng ký ngay
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`z-[100] fixed inset-0 bg-black/60 transition-opacity duration-300 ${
        showCart ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={!showAnonymousModal ? () => setShowCart(false) : undefined}
    >
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          <div
            className={`absolute inset-0 transition-transform duration-300 bg-white ${
              isCouponPanelOpen
                ? "-translate-x-1/4 opacity-50"
                : "translate-x-0 opacity-100"
            }`}
          >
            {renderCartContent()}
          </div>
          <div
            className={`absolute inset-0 bg-white transition-transform duration-300 ${
              isCouponPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {renderCouponPanel()}
          </div>
        </div>
      </div>
      <AnonymousCheckoutModal
        isOpen={showAnonymousModal}
        onClose={() => setShowAnonymousModal(false)}
        cartItems={cartItems}
        subtotal={subtotal}
        shippingFee={originalShippingFee}
        finalTotal={finalTotal}
      />
    </div>
  );
}
