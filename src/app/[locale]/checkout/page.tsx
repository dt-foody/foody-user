"use client";

import { useCart } from "@/stores/useCartStore";
import {
  Gift,
  XCircle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { PaymentMethod } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { CreateOrderItem_Option, CartLine } from "@/types/cart"; // Import CartLine

// === HELPERS ===
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = PLACEHOLDER_IMAGE;
};
const formatPrice = (price: number) =>
  `${(price || 0).toLocaleString("vi-VN")}đ`;

// --- HELPER: Tính tổng giá trị Option ---
const getOptionsPrice = (
  options?: Record<string, CreateOrderItem_Option[]>
) => {
  if (!options) return 0;
  return Object.values(options)
    .flat()
    .reduce((acc, opt) => acc + opt.priceModifier, 0);
};

// --- HELPER: Tính giá trị thị trường (Giá gốc) của Item ---
const calculateMarketPrice = (item: CartLine) => {
  let total = 0;
  if (item.itemType === "Product") {
    total = item.item.basePrice + getOptionsPrice(item.options);
  } else if (item.itemType === "Combo") {
    item.comboSelections?.forEach((sel) => {
      total += sel.product.basePrice + getOptionsPrice(sel.options);
    });
    if (total === 0) total = item.item.comboPrice;
  }
  return total;
};

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
    <div className="ml-3 mt-1 space-y-0.5">
      {allOptions.map((opt, index) => (
        <p key={index} className="text-xs text-gray-500">
          + {opt.name}{" "}
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

export default function CheckoutRetro() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    appliedCoupons,
    removeCoupon,
    clearCart,
    // Delivery logic
    deliveryOption,
    setDeliveryOption,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    // Coupon & Fee
    applyPrivateCoupon,
    couponStatus,
    originalShippingFee,
    shippingDistance,
    selectedAddress,
    isCalculatingShip,
    recalculateShippingFee,
  } = useCart();

  const router = useRouter();
  const { me } = useAuthStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      recalculateShippingFee();
    }, 500);
    return () => clearTimeout(timer);
  }, [recalculateShippingFee, deliveryOption, scheduledDate, scheduledTime]);

  useEffect(() => {
    if (selectedAddress) {
      setName(selectedAddress.recipientName || "");
      setPhone(selectedAddress.recipientPhone || "");
    }
  }, [selectedAddress]);

  const formatDiscount = (val: number) =>
    val > 0 ? `-${val.toLocaleString("vi-VN")}đ` : "0đ";
  const getMinDate = () => new Date().toISOString().split("T")[0];

  const handleApplyCoupon = async () => {
    if (!voucherInput.trim()) {
      toast.error("Vui lòng nhập mã voucher.");
      return;
    }
    const result = await applyPrivateCoupon(voucherInput);
    if (result.success) {
      toast.success(result.message);
      setVoucherInput("");
    } else {
      toast.error(result.message);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!name.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập đủ tên và số điện thoại!");
      return;
    }

    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng (ở menu trên cùng)!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (deliveryOption === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        toast.error("Vui lòng chọn thời gian giao hàng!");
        return;
      }
      const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (selectedDateTime < new Date()) {
        toast.warning("Thời gian hẹn phải ở tương lai!");
        return;
      }
    }

    if (!cartItems.length) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    const payload = {
      items: cartItems.map(({ _image, _categoryIds, ...rest }) => rest),
      appliedCoupons: appliedCoupons.map((el) => ({
        id: el.id,
        code: el.code,
      })),
      totalAmount: subtotal,
      discountAmount: itemDiscount + shippingDiscount,
      shippingFee: originalShippingFee,
      grandTotal: finalTotal,
      payment: {
        method: (paymentMethod === "cod" ? "cash" : "payos") as PaymentMethod,
      },
      shipping: {
        address: selectedAddress,
      },
      note: note.trim(),
    };

    try {
      setLoading(true);
      const result = await orderService.customerOrder(payload as any);
      if (paymentMethod === "bank" && result.qrInfo?.checkoutUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = result.qrInfo.checkoutUrl;
      } else {
        toast.success("Đơn hàng đã tạo thành công!");
        clearCart();
        router.push("/account-orders");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Lỗi đặt hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#3b2f26] px-6 py-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: Order Items */}
        <div className="lg:col-span-3 bg-white border border-black/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-black/40 pb-2">
            <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
            <button
              onClick={() => router.push("/menu")}
              className="text-sm hover:text-[#b9915f]"
            >
              ← Quay lại thực đơn
            </button>
          </div>

          {/* LIST ITEM TABLE */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/50">
                <th className="text-left py-2">Tên món</th>
                <th className="text-right py-2">Đơn giá</th>
                <th className="text-center py-2">SL</th>
                <th className="text-right py-2">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((it) => {
                // [UPDATE] Logic tính giá chuẩn
                const unitPrice = it.totalPrice;
                const marketPrice = calculateMarketPrice(it);
                const hasDiscount = unitPrice < marketPrice;

                return (
                  <tr
                    key={it.cartId}
                    className="border-b border-black/20 hover:bg-[#f8f3ef]"
                  >
                    <td className="p-2 align-top">
                      <div className="flex items-start gap-2.5">
                        <Image
                          src={it._image || PLACEHOLDER_IMAGE}
                          alt={it.item.name}
                          onError={handleImageError}
                          width={48}
                          height={48}
                          className="rounded-md flex-shrink-0 object-cover"
                        />
                        <div>
                          <span className="font-semibold">{it.item.name}</span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                            <p className="text-sm font-medium text-primary-600">
                              {formatPrice(unitPrice)}
                            </p>
                            {hasDiscount && (
                              <p className="text-xs text-gray-400 line-through decoration-gray-400">
                                {formatPrice(marketPrice)}
                              </p>
                            )}
                          </div>
                          {it.itemType === "Product" && (
                            <RenderSelectedOptions options={it.options} />
                          )}
                          {it.itemType === "Combo" &&
                            (it.comboSelections || []).map((s, i) => (
                              <div key={i} className="ml-2">
                                <p className="text-xs font-medium">
                                  - {s.product.name}
                                </p>
                                <RenderSelectedOptions options={s.options} />
                              </div>
                            ))}
                          {it.note && (
                            <div className="mt-1 text-xs bg-blue-50 p-1 text-blue-700 rounded italic">
                              {it.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      {unitPrice.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right font-medium">
                      {(unitPrice * it.quantity).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Coupons & Totals section - Keep as is... */}
          {appliedCoupons.length > 0 && (
            <div className="mt-5 border-t pt-3 space-y-2">
              <h3 className="font-bold text-sm flex gap-1">
                <Gift size={15} /> Ưu đãi
              </h3>
              {appliedCoupons.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between bg-[#fdf8f3] border border-[#b9915f]/40 p-2 rounded text-sm"
                >
                  <span>
                    {c.name}{" "}
                    <span className="text-xs text-gray-500">({c.code})</span>
                  </span>
                  <button onClick={() => removeCoupon(c.id)}>
                    <XCircle size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t pt-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <div className="flex items-center gap-2">
                <span>Phí vận chuyển</span>

                {shippingDistance > 0 && (
                  <span className="text-xs px-1 rounded">
                    ({shippingDistance} km)
                  </span>
                )}
              </div>

              {!isCalculatingShip && (
                <span>{originalShippingFee.toLocaleString("vi-VN")}đ</span>
              )}

              {isCalculatingShip && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
            </div>
            {itemDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Giảm món</span>
                <span>{formatDiscount(itemDiscount)}</span>
              </div>
            )}
            {shippingDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm ship</span>
                <span>{formatDiscount(shippingDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 mt-1 font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-[#b9915f]">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Info - Keep as is... */}
        <div className="lg:col-span-2 bg-white text-sm border border-black/20 rounded-xl shadow-sm p-6 space-y-4 h-fit">
          {/* ADDRESS CARD */}
          <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary-700">
                <MapPin size={16} /> Địa chỉ giao hàng
              </h3>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs text-blue-600 hover:underline"
              >
                Thay đổi
              </button>
            </div>
            {selectedAddress ? (
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {selectedAddress.label}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedAddress.fullAddress}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-500 font-medium">
                Vui lòng chọn địa chỉ giao hàng ở menu trên cùng!
              </p>
            )}
          </div>

          {/* Input Receiver */}
          <div>
            <label className="block font-semibold mb-1">
              Tên người nhận <span className="text-red-600">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#b9915f]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Số điện thoại <span className="text-red-600">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#b9915f]"
            />
          </div>

          {/* Delivery Time */}
          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
              <Clock size={16} /> Thời gian giao
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={deliveryOption === "immediate"}
                  onChange={() => setDeliveryOption("immediate")}
                />{" "}
                Giao ngay
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={deliveryOption === "scheduled"}
                  onChange={() => setDeliveryOption("scheduled")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span>Hẹn giờ</span>
                  {deliveryOption === "scheduled" && (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={getMinDate()}
                        className="border rounded px-1 text-xs"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="border rounded px-1 text-xs"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Voucher & Note */}
          <div>
            <label className="font-semibold mb-1 block">Mã giảm giá</label>
            <div className="flex gap-2">
              <input
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã..."
                className="flex-1 border p-2 rounded"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-[#b9915f] text-white px-3 rounded"
              >
                Áp dụng
              </button>
            </div>
          </div>
          <div>
            <label className="font-semibold mb-1 block">Ghi chú đơn hàng</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border p-2 rounded h-16"
              placeholder="Lời nhắn cho quán..."
            />
          </div>

          {/* Payment */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2 flex gap-1">
              <CheckCircle size={16} /> Thanh toán
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />{" "}
                Tiền mặt (COD)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                />{" "}
                Chuyển khoản / QR
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded text-white font-bold shadow-md transition ${
              loading ? "bg-gray-400" : "bg-[#b9915f] hover:bg-[#9a7e4e]"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              `Thanh toán ${finalTotal.toLocaleString("vi-VN")}đ`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
