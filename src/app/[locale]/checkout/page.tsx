"use client";

import { useCart } from "@/stores/useCartStore";
import {
  Truck,
  Gift,
  Tag,
  XCircle,
  CheckCircle,
  Clock,
  Zap,
  Calendar,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { PaymentMethod } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CreateOrderItem_Option } from "@/types";
import Image from "next/image";

// =======================================
// === HELPER UI & CONSTANTS ===
// =======================================
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = PLACEHOLDER_IMAGE;
};

const formatPrice = (price: number) =>
  `${(price || 0).toLocaleString("vi-VN")}đ`;

const RenderSelectedOptions = React.memo(function RenderSelectedOptions({
  options,
}: {
  options: Record<string, CreateOrderItem_Option[]>;
}) {
  const allOptions = React.useMemo(() => {
    return Object.values(options || {}).flat();
  }, [options]);

  if (allOptions.length === 0) return null;

  return (
    <div className="ml-3 mt-1 space-y-0.5">
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

// =======================================
// === MAIN COMPONENT ===
// =======================================

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
    deliveryOption,
    setDeliveryOption,
    scheduledDate,
    setScheduledDate,
    applyPrivateCoupon,
    couponStatus,
    originalShippingFee,
    setShippingFee,
    shippingDistance,
  } = useCart();

  const router = useRouter();
  const { me } = useAuthStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCalculatingShip, setIsCalculatingShip] = useState(false);

  const [defaultAddress, setDefaultAddress] = useState<any>(null);

  // -------------------------------------------------------
  // 1. EFFECT: LOAD ĐỊA CHỈ & TÍNH SHIP
  // -------------------------------------------------------
  useEffect(() => {
    if (me?.addresses?.length) {
      const addr =
        me.addresses.find((a: any) => a.isDefault) || me.addresses[0];
      setDefaultAddress(addr);

      if (addr) {
        setName(addr.recipientName || "");
        setPhone(addr.recipientPhone || "");

        let lat = null;
        let lng = null;

        if (addr.location && Array.isArray(addr.location.coordinates)) {
          lng = addr.location.coordinates[0];
          lat = addr.location.coordinates[1];
        }

        if (lat && lng) {
          calculateShipping(lat, lng);
        } else {
          setShippingFee(15000, 0);
        }
      }
    }
  }, [me]);

  const calculateShipping = async (lat: number, lng: number) => {
    try {
      setIsCalculatingShip(true);
      const res = await orderService.getShippingFee(lat, lng);
      setShippingFee(res.shippingFee, res.distance);
    } catch (error) {
      console.error("Lỗi tính ship:", error);
      toast.error("Không thể tính phí ship chính xác lúc này.");
      setShippingFee(15000, 0);
    } finally {
      setIsCalculatingShip(false);
    }
  };

  const formatDiscount = (val: number) =>
    val > 0 ? `-${val.toLocaleString("vi-VN")}đ` : "0đ";
  const getMinDate = () => new Date().toISOString().split("T")[0];

  const formatDeliveryText = () => {
    if (deliveryOption === "immediate") return "Giao hàng nhanh chóng";
    if (scheduledDate)
      return `Hẹn giao ngày ${new Date(scheduledDate).toLocaleDateString(
        "vi-VN"
      )}`;
    return "Chưa chọn ngày giao";
  };

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

  // -------------------------------------------------------
  // 2. HANDLE SUBMIT ORDER
  // -------------------------------------------------------
  const handleSubmit = async () => {
    if (loading) return;

    if (!name.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập đủ tên và số điện thoại!");
      return;
    }

    if (!defaultAddress) {
      toast.error("Vui lòng thiết lập địa chỉ nhận hàng!");
      return;
    }

    if (deliveryOption === "scheduled") {
      if (!scheduledDate) {
        toast.error("Vui lòng chọn ngày giao hàng!");
        return;
      }
      if (!scheduledTime) {
        toast.error("Vui lòng chọn giờ giao hàng!");
        return;
      }
      const selected = new Date(`${scheduledDate}T${scheduledTime}`);
      if (selected < new Date()) {
        toast.warning("Thời gian giao hàng phải nằm trong tương lai!");
        return;
      }
    }

    if (!cartItems.length) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    const shippingAddress = {
      label: "Địa chỉ giao hàng",
      recipientName: name,
      recipientPhone: phone,
      street: defaultAddress.street,
      district: defaultAddress.district,
      ward: defaultAddress.ward,
      city: defaultAddress.city,
      fullAddress: defaultAddress.fullAddress,
    };

    let locationData = undefined;
    if (defaultAddress?.location?.coordinates) {
      locationData = {
        lat: defaultAddress.location.coordinates[1],
        lng: defaultAddress.location.coordinates[0],
      };
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
        address: shippingAddress,
        location: locationData,
      },
      note: note.trim(),
    };

    try {
      setLoading(true);
      const result = await orderService.customerOrder(payload as any);

      if (paymentMethod === "bank" && result.qrInfo?.checkoutUrl) {
        toast.success("Vui lòng quét mã QR để hoàn tất thanh toán!");
        window.open(result.qrInfo.checkoutUrl, "_blank");
      } else {
        toast.success("Đơn hàng của bạn đã được tạo thành công!");
        clearCart();
        router.push("/account-orders");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Đặt hàng thất bại. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // ====== UI RENDER ======
  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#3b2f26] px-6 py-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ===== LEFT: Order Table ===== */}
        <div className="lg:col-span-3 bg-white border border-black/20 rounded-xl p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-black/40 pb-2">
            <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
            <button
              onClick={() => router.push("/menu")}
              className="text-sm hover:text-[#b9915f]"
            >
              ← Quay lại thực đơn
            </button>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/50">
                <th className="text-left py-2">Tên món</th>
                <th className="text-right py-2">Đơn giá</th>
                <th className="text-center py-2">Số lượng</th>
                <th className="text-right py-2">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((it) => {
                const baseOrComboPrice =
                  (it.itemType === "Product"
                    ? it.item.basePrice
                    : it.item.comboPrice) ?? 0;

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
                          className="object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-gray-800">
                            {it.item.name}
                          </span>
                          {baseOrComboPrice > 0 && (
                            <p className="text-sm text-gray-500">
                              {formatPrice(baseOrComboPrice)}
                            </p>
                          )}
                          <div className="mt-1.5">
                            {it.itemType === "Product" && (
                              <RenderSelectedOptions options={it.options} />
                            )}
                            {it.itemType === "Combo" && (
                              <div className="mt-1 space-y-1">
                                {(it.comboSelections || []).map((sel, idx) => (
                                  <div key={idx} className="ml-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      - {sel.product.name}
                                    </p>
                                    <RenderSelectedOptions
                                      options={sel.options}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {it.note && (
                            <div className="mt-1.5 flex items-start gap-1 text-xs text-blue-700 bg-blue-50 p-1.5 rounded border border-blue-200">
                              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span className="italic">{it.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-right align-top">
                      {it.totalPrice.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-2 text-center align-top">{it.quantity}</td>
                    <td className="p-2 text-right font-medium align-top">
                      {(it.totalPrice * it.quantity).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* List Coupons */}
          {appliedCoupons.length > 0 && (
            <div className="mt-5 border-t border-black/40 pt-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
                <Gift size={15} className="text-[#b9915f]" /> Ưu đãi đang áp
                dụng
              </h3>
              <div className="space-y-2">
                {appliedCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center bg-[#fdf8f3] border border-[#b9915f]/40 rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#3b2f26]">
                        {c.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-700 mt-0.5">
                        <Tag size={12} className="text-[#b9915f]" />
                        <span>{c.code}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCoupon(c.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals Section */}
          <div className="mt-6 border-t border-black/40 pt-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>

            {/* HIỂN THỊ SHIP & KM (SAFE CHECK ADDED) */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Phí vận chuyển</span>
                {shippingDistance > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 rounded">
                    ({shippingDistance} km)
                  </span>
                )}
                {isCalculatingShip && (
                  <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                )}
              </div>
              <span>{(originalShippingFee || 0).toLocaleString("vi-VN")}đ</span>
            </div>

            {itemDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Giảm sản phẩm</span>
                <span>{formatDiscount(itemDiscount)}</span>
              </div>
            )}
            {shippingDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Giảm phí ship</span>
                <span>{formatDiscount(shippingDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-black/60 pt-2 mt-1 font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-[#b9915f]">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-600 text-center">
            <Truck className="inline w-4 h-4 mr-1 text-gray-500" />
            {formatDeliveryText()}
          </div>
        </div>

        {/* ===== RIGHT: Recipient + Payment ===== */}
        <div className="lg:col-span-2 bg-white text-sm border border-black/20 rounded-xl shadow-sm p-6 space-y-4">
          {/* Info Inputs */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Tên người nhận: <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border text-sm border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Số điện thoại: <span className="text-red-600"> *</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border text-sm border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f] outline-none"
            />
          </div>

          {/* Delivery Time Selection */}
          <div className="px-1 pb-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-2.5">
                <Clock size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-gray-800">
                  Thời gian giao hàng
                </h3>
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    checked={deliveryOption === "immediate"}
                    onChange={() => setDeliveryOption("immediate")}
                    className="w-4 h-4 mt-0.5 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-800">
                      Giao ngay
                    </span>
                    <p className="text-xs text-gray-600">
                      Giao hàng trong 2-4 giờ
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    checked={deliveryOption === "scheduled"}
                    onChange={() => setDeliveryOption("scheduled")}
                    className="w-4 h-4 mt-0.5 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-800">
                      Hẹn giờ giao
                    </span>
                    {deliveryOption === "scheduled" && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={getMinDate()}
                          className="w-full px-2 py-1 border rounded text-xs"
                        />
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Voucher Input */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Nhập thêm mã giảm giá:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã..."
                className="flex-1 text-sm border border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f]"
                disabled={couponStatus.isLoading}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponStatus.isLoading || loading}
                className="px-4 py-2 bg-[#b9915f] text-white rounded-lg font-medium hover:bg-[#9a7e4e] w-24 text-center"
              >
                {couponStatus.isLoading ? (
                  <Loader2 className="inline h-4 w-4 animate-spin" />
                ) : (
                  "Áp dụng"
                )}
              </button>
            </div>
            {couponStatus.error && (
              <p className="text-xs text-red-600 mt-1">{couponStatus.error}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold mb-1">Ghi chú:</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ít đường, nhiều đá..."
              className="w-full border text-sm border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f] outline-none"
            />
          </div>

          {/* Payment Methods */}
          <div className="pt-3 border-t border-black/30">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle size={15} className="text-[#b9915f]" /> Phương thức
              thanh toán
            </h3>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-[#b9915f]/30 rounded-lg p-3 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="w-4 h-4 text-[#b9915f] focus:ring-[#b9915f]"
                />
                <span className="font-semibold text-sm text-gray-800">
                  Tiền mặt (COD)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="w-4 h-4 text-[#b9915f] focus:ring-[#b9915f]"
                />
                <span className="font-semibold text-sm text-gray-800">
                  Chuyển khoản / QR
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-black/30">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full mt-3 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#b9915f] hover:bg-[#9a7e4e]"
              }`}
            >
              {loading ? (
                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Thanh toán:"
              )}
              <span className="text-md font-bold ml-2">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
