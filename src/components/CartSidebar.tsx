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
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { EligibilityStatus } from "@/stores/useCartStore";
import type { Coupon } from "@/types";
import {
  CreateOrderItem_Option,
  CartLine,
  CreateOrderItem_ComboSelection,
} from "@/types/cart";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

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
            <span className="font-medium ml-1 text-gray-600">
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
    originalShippingFee,
    selectedAddress,
    shippingDistance,
  } = useCart();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const [manualCouponCode, setManualCouponCode] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

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

  const groupedCoupons = useMemo(() => {
    const groups = publicCouponStatuses.reduce((acc, status) => {
      const key = status.coupon.type || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(status);
      return acc;
    }, {} as Record<string, (EligibilityStatus & { coupon: Coupon })[]>);
    return groups;
  }, [publicCouponStatuses]);
  const groupTitles: Record<string, string> = {
    discount_code: "Mã Giảm Giá",
    freeship: "Miễn Phí Vận Chuyển",
  };

  // --- RENDER COMBO HEADER ---
  const renderPriceHeader = (item: CartLine) => {
    if (item.itemType === "Product") {
      const optionsPrice = Object.values(item.options || {})
        .flat()
        .reduce((acc, opt) => acc + opt.priceModifier, 0);
      const unitTotal = item.totalPrice;
      const displayBaseSale = Math.max(0, unitTotal - optionsPrice);
      const displayBaseMarket = item.item.basePrice;
      const hasDiscount = displayBaseSale < displayBaseMarket;
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
          <p className="text-sm font-medium text-primary-600">
            {formatPrice(displayBaseSale)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-gray-400 line-through">
              {formatPrice(displayBaseMarket)}
            </p>
          )}
        </div>
      );
    }

    // Logic fallback nếu không có snapshot (dù rất hiếm vì đã fix ở modal)
    const snapshot = item.comboSnapshot;
    if (!snapshot)
      return (
        <p className="text-sm font-medium text-primary-600">
          {formatPrice(item.totalPrice)}
        </p>
      );

    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
        <p className="text-sm font-medium text-primary-600">
          {formatPrice(snapshot.totalFinalPrice)}
        </p>
        {snapshot.totalSavings > 0 && (
          <p className="text-xs text-gray-400 line-through decoration-gray-400">
            {formatPrice(snapshot.totalMarketPrice)}
          </p>
        )}
      </div>
    );
  };

  // --- RENDER COMBO ITEM DETAIL ---
  const renderComboItemDetail = (
    item: CartLine,
    sel: CreateOrderItem_ComboSelection,
    idx: number
  ) => {
    if (item.itemType !== "Combo" || !item.comboSnapshot) return null;

    // Tìm snapshot tương ứng
    const itemSnapshot = item.comboSnapshot.items.find(
      (s) => s.productId === sel.product.id
    );

    const surcharge = itemSnapshot
      ? itemSnapshot.surcharge
      : sel.additionalPrice;
    const appliedPrice = itemSnapshot ? itemSnapshot.appliedItemPrice : 0;

    return (
      <div key={idx} className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-gray-800 flex-1">
            • {sel.product.name}
          </p>

          <div className="flex flex-col items-end">
            {item.comboSnapshot.mode === "SLOT_PRICE" && appliedPrice > 0 && (
              <span className="text-[10px] text-gray-500 bg-gray-100 px-1 rounded mb-0.5">
                Slot: {formatPrice(appliedPrice)}
              </span>
            )}
            {surcharge > 0 && (
              <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1 rounded border border-red-100">
                Phụ thu: +{formatPrice(surcharge)}
              </span>
            )}
          </div>
        </div>
        <RenderSelectedOptions options={sel.options} />
      </div>
    );
  };

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

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center h-full flex flex-col justify-center items-center p-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg text-gray-500 font-medium">Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="p-3 space-y-2.5">
              {cartItems.map((item) => {
                const isEditing = editingNoteId === item.cartId;
                const lineTotal = item.totalPrice * item.quantity;

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
                          {renderPriceHeader(item)}
                        </div>

                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                          {item.itemType === "Product" && (
                            <RenderSelectedOptions options={item.options} />
                          )}
                          {item.itemType === "Combo" && (
                            <div className="pl-1 space-y-1">
                              {(item.comboSelections || []).map((sel, idx) =>
                                renderComboItemDetail(item, sel, idx)
                              )}
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
                  </div>
                );
              })}
            </div>

            <div className="px-3 pb-3 space-y-2.5">
              {/* Coupon & Summary */}
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
                    {originalShippingFee?.toLocaleString("vi-VN")}đ
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

  const renderCouponPanel = () => (
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
        {/* Render coupons... */}
        {Object.entries(groupedCoupons).map(([type, coupons]) => (
          <div key={type}>
            <h3 className="font-bold text-sm text-gray-800 mb-2">
              {groupTitles[type] || "Khác"}
            </h3>
            <div className="space-y-2">
              {coupons.map(({ coupon }) => {
                const isApplied = appliedCoupons.some(
                  (c) => c.id === coupon.id
                );
                return (
                  <label
                    key={coupon.id}
                    className={`block relative overflow-hidden rounded-lg border bg-white p-3 flex gap-3 ${
                      isApplied ? "ring-2 ring-primary-500" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{coupon.name}</h4>
                      <p className="text-xs text-gray-600">{coupon.code}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isApplied}
                      onChange={() => handleTogglePublicCoupon(coupon)}
                      className="w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`z-[100] fixed inset-0 bg-black/60 transition-opacity duration-300 ${
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
