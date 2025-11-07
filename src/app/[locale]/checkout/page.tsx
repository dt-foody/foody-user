"use client";

import { useCart, SHIPPING_FEE } from "@/stores/useCartStore";
import {
  Truck,
  Gift,
  Tag,
  XCircle,
  CheckCircle,
  Clock,
  Zap,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckoutRetro() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    appliedCoupons,
    removeCoupon,
  } = useCart();

  const router = useRouter();

  const [voucherInput, setVoucherInput] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<
    "immediate" | "scheduled"
  >("immediate");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState("");

  // 🔥 Thêm state cho phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");

  const handleSubmit = () => {
    // Validate thông tin cơ bản
    if (!name.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập đủ tên và số điện thoại!");
      return;
    }

    // Validate ngày/giờ giao
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

    // Nếu hợp lệ
    toast.success("Đang chuyển đến trang thanh toán...");
    router.push("/payment");
  };

  const formatDiscount = (val: number) =>
    val > 0 ? `-${val.toLocaleString("vi-VN")}đ` : "0đ";

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const formatDeliveryText = () => {
    if (deliveryOption === "immediate") return "Giao hàng nhanh chóng";
    if (scheduledDate)
      return `Hẹn giao ngày ${new Date(scheduledDate).toLocaleDateString(
        "vi-VN"
      )}`;
    return "Chưa chọn ngày giao";
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#3b2f26] px-6 py-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ===== LEFT: Order Table ===== */}
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
              {cartItems.map((it) => (
                <tr
                  key={it.cartId}
                  className="border-b border-black/20 hover:bg-[#f8f3ef]"
                >
                  <td className="py-2">{it.name}</td>
                  <td className="text-right">
                    {it.basePrice.toLocaleString("vi-VN")}
                  </td>
                  <td className="text-center">{it.quantity}</td>
                  <td className="text-right font-medium">
                    {(it.totalPrice * it.quantity).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Coupons applied */}
          {appliedCoupons.length > 0 && (
            <div className="mt-5 border-t border-black/40 pt-3">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
                <Gift size={15} className="text-[#b9915f]" />
                Ưu đãi đang áp dụng
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
                        <span className="px-1.5 py-0.5 bg-[#b9915f]/10 rounded">
                          {c.type === "freeship"
                            ? "Free Ship"
                            : c.valueType === "percentage"
                            ? `-${c.value}%`
                            : `-${c.value.toLocaleString("vi-VN")}đ`}
                        </span>
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

          {/* Totals */}
          <div className="mt-6 border-t border-black/40 pt-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>{SHIPPING_FEE.toLocaleString("vi-VN")}đ</span>
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
            {deliveryOption === "immediate"
              ? "Giao hàng nhanh chóng"
              : formatDeliveryText()}
          </div>
        </div>

        {/* ===== RIGHT: Recipient Info + Payment ===== */}
        <div className="lg:col-span-2 bg-white border border-black/20 rounded-xl shadow-sm p-6 space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Tên người nhận: 
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Số điện thoại: 
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              className="w-full border border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f] outline-none"
            />
          </div>

          {/* Delivery Options */}
          <div className="px-1 pb-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-2.5">
                <Clock size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-gray-800">
                  Thời gian giao hàng
                </h3>
              </div>

              <div className="space-y-2">
                {/* Immediate */}
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
                    <p className="text-xs text-gray-600">
                      Giao hàng trong 2-4 giờ
                    </p>
                  </div>
                </label>

                {/* Scheduled */}
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
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Ngày giao - rộng gấp đôi */}
                        <div className="sm:flex-[2]">
                          <label className="block text-xs text-gray-600 mb-1">
                            Ngày giao
                          </label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={getMinDate()}
                            className="w-full px-2.5 py-1.5 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Giờ giao - nhỏ hơn */}
                        <div className="sm:flex-[1]">
                          <label className="block text-xs text-gray-600 mb-1">
                            Giờ giao
                          </label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Voucher input */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Nhập thêm mã giảm giá:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã của bạn"
                className="flex-1 border border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b9915f]"
              />
              <button className="px-4 py-2 bg-[#b9915f] text-white rounded-lg font-medium hover:bg-[#9a7e4e]">
                Áp dụng
              </button>
            </div>
          </div>

          {/* 🔹 Payment method section */}
          <div className="pt-3 border-t border-black/30">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle size={15} className="text-[#b9915f]" />
              Phương thức thanh toán
            </h3>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-[#b9915f]/30 rounded-lg p-3 space-y-3">
              {/* COD */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="w-4 h-4 text-[#b9915f] border-gray-400 focus:ring-[#b9915f]"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-800">
                    Tiền mặt khi nhận hàng (COD)
                  </span>
                  <span className="text-xs text-gray-600">
                    Thanh toán trực tiếp cho shipper khi nhận hàng.
                  </span>
                </div>
              </label>

              {/* Bank Transfer */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="w-4 h-4 text-[#b9915f] border-gray-400 focus:ring-[#b9915f]"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-800">
                    Chuyển khoản qua ngân hàng / Mã QR
                  </span>
                  <span className="text-xs text-gray-600">
                    Thanh toán nhanh qua Internet Banking hoặc quét mã QR bên
                    dưới.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Confirm */}
          <div className="pt-4 border-t border-black/30">
            <button
              onClick={handleSubmit}
              className="w-full mt-3 py-3 bg-[#b9915f] text-white rounded-lg font-semibold hover:bg-[#9a7e4e] transition-all shadow-sm hover:shadow-md"
            >
              Thanh toán:
              <span className="text-md font-bold ml-2">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
              <CheckCircle size={12} className="text-green-600" />
              <span>Áp dụng đồng thời nhiều ưu đãi nếu đủ điều kiện.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
