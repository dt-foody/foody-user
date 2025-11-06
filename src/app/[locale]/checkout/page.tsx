"use client";

import { useCart } from "@/stores/useCartStore";
import { Truck, Gift } from "lucide-react";
import { useState } from "react";

export default function CheckoutRetro() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    appliedCoupons,
  } = useCart();

  const [voucher, setVoucher] = useState("AABBCCDD");

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#3b2f26] px-6 py-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ===== LEFT: Order Table ===== */}
        <div className="lg:col-span-3 bg-white border border-black/20 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold border-b border-black/40 pb-2 mb-4">
            Quay lại thực đơn
          </h2>

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
                  <td className="text-right">
                    {(it.totalPrice * it.quantity).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}

              {(itemDiscount > 0 || appliedCoupons.length > 0) && (
                <tr className="border-t border-black/50 font-medium text-red-600">
                  <td colSpan={3} className="text-right py-2">
                    Khuyến mãi
                  </td>
                  <td className="text-right">
                    -{itemDiscount.toLocaleString("vi-VN")}
                  </td>
                </tr>
              )}

              <tr className="font-bold border-t border-black/60">
                <td colSpan={3} className="text-right py-2">
                  Tổng
                </td>
                <td className="text-right text-lg">
                  {subtotal.toLocaleString("vi-VN")}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 text-sm text-center text-[#555]">
            Bạn đã được giảm {shippingDiscount / 1000 || 20}k phí ship. Mua thêm{" "}
            <span className="font-semibold">42k</span> để được giảm{" "}
            <span className="font-semibold">35k</span> phí ship.
          </div>
        </div>

        {/* ===== RIGHT: Recipient Info + Payment ===== */}
        <div className="lg:col-span-2 bg-white border border-black/20 rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Tên người nhận:
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className="w-full border border-black/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#c6b5a3]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Số điện thoại:
            </label>
            <input
              type="tel"
              placeholder="09xxxxxxxx"
              className="w-full border border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#c6b5a3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Thời gian nhận:
            </label>
            <input
              type="text"
              value="18h00 - 19h30 | ngày 20/12/2025"
              readOnly
              className="w-full border border-black/30 rounded-lg px-3 py-2 bg-[#f9f6f3] text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Voucher:</label>
            <input
              type="text"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              className="w-full border border-black/30 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#c6b5a3]"
            />
          </div>

          <div className="border-t border-black/30 pt-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Phí giao hàng</span>
              <span>{(30000).toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Voucher</span>
              <span>
                -{(itemDiscount + shippingDiscount).toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-black text-white rounded-lg px-4 py-3 mt-2">
            <span className="font-semibold text-lg">Thanh toán:</span>
            <span className="text-xl font-bold">
              {finalTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
            <Truck className="w-4 h-4 text-gray-500" />
            <span>
              Đơn hàng sẽ được giao trong <b>30–45 phút</b> sau khi xác nhận.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <Gift className="w-4 h-4 text-gray-500" />
            <span>Áp dụng đồng thời nhiều ưu đãi nếu đủ điều kiện</span>
          </div>
        </div>
      </div>
    </div>
  );
}
