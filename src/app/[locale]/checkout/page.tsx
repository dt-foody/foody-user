"use client";

import { useCart } from "@/stores/useCartStore";
import { CheckCircle, Clock, Loader2, MapPin, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { PaymentMethod } from "@/types";
import Image from "next/image";
import { CreateOrderItem_Option, CartLine } from "@/types/cart";
import { getImageUrl, handleImageError } from "@/utils/imageHelper";

const formatPrice = (price: number) =>
  `${(price || 0).toLocaleString("vi-VN")}đ`;

const TIME_SLOTS = [
  { value: "07:30-09:00", label: "07:30-09:00" },
  { value: "09:00-10:30", label: "09:00-10:30" },
  { value: "10:30-12:00", label: "10:30-12:00" },
  { value: "12:00-13:30", label: "12:00-13:30" },
  { value: "13:30-15:00", label: "13:30-15:00" },
  { value: "15:00-16:30", label: "15:00-16:30" },
  { value: "16:30-18:00", label: "16:30-18:00" },
  { value: "18:00-19:30", label: "18:00-19:30" },
  { value: "19:30-21:00", label: "19:30-21:00" },
];

// --- HELPER RENDERERS ---
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

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    appliedCoupons,
    clearCart,
    deliveryOption,
    setDeliveryOption,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    originalShippingFee,
    selectedAddress,
    isCalculatingShip,
    recalculateShippingFee,
  } = useCart();

  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("bank");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🔥 Local state cho khung giờ (UI only)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  useEffect(() => {
    if (selectedTimeSlot) {
      const [startTime] = selectedTimeSlot.split("-");
      setScheduledTime(startTime); // Lưu "07:30" vào store
    } else {
      setScheduledTime("");
    }
  }, [selectedTimeSlot, setScheduledTime]);

  // Tự động tính lại phí ship khi đổi địa chỉ hoặc giờ giao
  useEffect(() => {
    const timer = setTimeout(() => recalculateShippingFee(), 500);
    return () => clearTimeout(timer);
  }, [recalculateShippingFee, deliveryOption, scheduledDate, scheduledTime]);

  // Điền thông tin người nhận từ địa chỉ đã chọn
  useEffect(() => {
    if (selectedAddress) {
      setName(selectedAddress.recipientName || "");
      setPhone(selectedAddress.recipientPhone || "");
    }
  }, [selectedAddress]);

  const getMinDate = () => new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (loading) return;

    // 1. Validation cơ bản
    if (!name.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập đủ tên và số điện thoại!");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    if (!cartItems.length) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    // 2. Validation thời gian giao hàng
    if (deliveryOption === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        toast.error("Vui lòng chọn ngày và khung giờ giao hàng!");
        return;
      }
      
      const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (selectedDateTime < new Date()) {
        toast.warning("Thời gian hẹn phải ở tương lai!");
        return;
      }
    }

    // 3. Transform Dữ Liệu: Delivery Time
    const deliveryTimePayload = {
      option: deliveryOption,
      scheduledAt:
        deliveryOption === "scheduled" && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : null,
      timeSlot:
        deliveryOption === "scheduled" && selectedTimeSlot
          ? selectedTimeSlot
          : null,
    };

    // 4. Transform Dữ Liệu: Coupons & Vouchers (Tách riêng)
    const payloadCoupons: { id: string; code: string }[] = [];
    const payloadVouchers: { voucherId: string; voucherCode: string }[] = [];

    appliedCoupons.forEach((c) => {
      if (c.voucherId && c.voucherCode) {
        payloadVouchers.push({
          voucherId: c.voucherId,
          voucherCode: c.voucherCode,
        });
      } else {
        payloadCoupons.push({
          id: c.id,
          code: c.code || "",
        });
      }
    });

    // 5. Tạo Payload chuẩn gửi Backend
    const payload = {
      items: cartItems.map(({ _image, _categoryIds, cartId, ...rest }) => rest),
      coupons: payloadCoupons,
      vouchers: payloadVouchers,
      totalAmount: subtotal,
      discountAmount: itemDiscount + shippingDiscount,
      shippingFee: originalShippingFee,
      grandTotal: finalTotal,
      payment: {
        method: (paymentMethod === "cod" ? "cash" : "payos") as PaymentMethod,
      },
      shipping: { address: selectedAddress },
      deliveryTime: deliveryTimePayload,
      note: note.trim(),
    };

    try {
      setLoading(true);
      // @ts-ignore
      const result = await orderService.customerOrder(payload);

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

  const renderPriceHeader = (item: CartLine) => {
    if (item.itemType === "Product") {
      const optionsPrice = Object.values(item.options || {})
        .flat()
        .reduce((a, b) => a + b.priceModifier, 0);
      return (
        <p className="text-sm font-medium text-primary-600">
          {formatPrice(Math.max(0, item.totalPrice - optionsPrice))}
        </p>
      );
    }
    return (
      <p className="text-sm font-medium text-primary-600">
        {formatPrice(item.totalPrice)}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#3b2f26] px-4 py-8 flex justify-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Order Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" /> Chi tiết
                đơn hàng
              </h2>
              <button
                onClick={() => router.push("/menu")}
                className="text-sm hover:text-[#b9915f]"
              >
                ← Quay lại thực đơn
              </button>
            </div>

            <div className="divide-y">
              {cartItems.map((it) => (
                <div key={it.cartId} className="py-4 flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                    <Image
                      src={getImageUrl(it._image)}
                      alt=""
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-800">
                        {it.item.name}
                      </h3>
                      <span className="font-bold text-gray-900">
                        {(it.totalPrice * it.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>SL: {it.quantity}</span>
                      <span>x</span>
                      {renderPriceHeader(it)}
                    </div>
                    <div className="mt-2 text-gray-600">
                      {it.itemType === "Product" && (
                        <RenderSelectedOptions options={it.options} />
                      )}
                      {it.itemType === "Combo" &&
                        (it.comboSelections || []).map((s, i) => (
                          <div key={i} className="ml-3 text-xs text-gray-500">
                            - {s.product.name}
                          </div>
                        ))}
                    </div>
                    {it.note && (
                      <div className="mt-1 text-xs bg-blue-50 p-1 text-blue-700 rounded italic">
                        {it.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Summary & Action (4 cols) */}
        <div className="lg:col-span-4 bg-white text-sm border border-black/10 rounded-xl shadow-sm p-6 space-y-5 h-fit">
          {/* ADDRESS */}
          <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary-700">
                <MapPin size={16} /> Địa chỉ giao hàng
              </h3>
              <button
                onClick={() =>
                  router.push("/account?tab=addresses&redirect_uri=/checkout")
                }
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

          {/* Form Info */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1 text-xs text-gray-600 uppercase">
                Tên người nhận
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#b9915f]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-xs text-gray-600 uppercase">
                Số điện thoại
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#b9915f]"
              />
            </div>
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
                <span>Hẹn giờ</span>
              </label>
                <div>
                  {deliveryOption === "scheduled" && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Chọn ngày
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={getMinDate()}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Chọn khung giờ
                        </label>
                        <select
                          value={selectedTimeSlot}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        >
                          <option value="">-- Chọn khung giờ --</option>
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Payment */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2">Thanh toán</h3>
            <div className="space-y-2">
              {/* <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />{" "}
                Tiền mặt (COD)
              </label> */}
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

          {/* Note */}
          <div>
            <label className="font-semibold mb-1 block">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border p-2 rounded h-16 text-sm"
              placeholder="Lời nhắn cho quán..."
            />
          </div>

          {/* Bill Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                Phí vận chuyển{" "}
                {isCalculatingShip && (
                  <Loader2 size={12} className="animate-spin" />
                )}
              </span>
              <span>{originalShippingFee.toLocaleString("vi-VN")}đ</span>
            </div>

            {/* Coupon Display */}
            {appliedCoupons.length > 0 && (
              <div className="py-2 border-y border-dashed bg-orange-50 -mx-6 px-6 space-y-1">
                {appliedCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between text-sm text-orange-700"
                  >
                    <span className="flex items-center gap-1">
                      <Ticket size={12} /> {c.code}
                    </span>
                    <span className="font-medium">
                      {c.type === "freeship"
                        ? `-${shippingDiscount.toLocaleString("vi-VN")}đ`
                        : `-${itemDiscount.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between border-t pt-2 mt-1 font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-[#b9915f]">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition ${
              loading ? "bg-gray-400" : "bg-[#b9915f] hover:bg-[#9a7e4e]"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              `Đặt hàng • ${finalTotal.toLocaleString("vi-VN")}đ`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}