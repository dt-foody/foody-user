"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { useCart } from "@/stores/useCartStore";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const orderCode = searchParams.get("orderCode");

  const [status, setStatus] = useState<
    "success" | "pending" | "failed" | "notfound"
  >("pending");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Khi redirect về, gọi BE để check chính xác (qua webhook đã xử lý)
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setStatus("notfound");
        setLoading(false);
        return;
      }

      try {
        const res = await orderService.getByCode(orderCode);

        if (!res) {
          setStatus("notfound");
          return;
        }

        setOrder(res);

        if (res.payment?.status === "paid") {
          setStatus("success");
          clearCart();
        } else if (res.payment?.status === "pending") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error(err);
        setStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  const renderIcon = () => {
    if (loading)
      return <Loader2 className="w-16 h-16 animate-spin text-gray-500" />;
    if (status === "success")
      return <CheckCircle2 className="w-16 h-16 text-green-600" />;
    if (status === "failed")
      return <XCircle className="w-16 h-16 text-red-600" />;
    if (status === "pending")
      return <Clock className="w-16 h-16 text-yellow-500" />;
    return <XCircle className="w-16 h-16 text-gray-500" />;
  };

  const title =
    status === "success"
      ? "Thanh toán thành công!"
      : status === "failed"
      ? "Thanh toán thất bại!"
      : status === "pending"
      ? "Đang chờ xác nhận..."
      : "Không tìm thấy đơn hàng";

  const desc =
    status === "success"
      ? `Đơn hàng #${orderCode} đã được xác nhận.`
      : status === "failed"
      ? "Thanh toán không thành công hoặc bị hủy."
      : status === "pending"
      ? "Hệ thống đang xác minh giao dịch, vui lòng chờ..."
      : "Mã đơn hàng không hợp lệ.";

  return (
    <div className="mt-20 flex flex-col items-center justify-center bg-[#fffaf5] text-[#3b2f26] px-6 py-8">
      <div className="bg-white border border-black/10 rounded-xl shadow-sm p-8 max-w-lg w-full text-center">
        <div className="flex flex-col items-center gap-3">
          {renderIcon()}
          <h2 className="text-2xl font-bold mt-3">{title}</h2>
          <p className="text-gray-600 mt-1">{desc}</p>
          {order?.grandTotal && (
            <p className="text-[#b9915f] font-semibold mt-2">
              Tổng tiền: {order.grandTotal.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Link
            href="/account-orders"
            className="px-4 py-2 bg-[#b9915f] text-white rounded-lg hover:bg-[#9a7e4e] transition"
          >
            Xem đơn hàng
          </Link>
          <button
            onClick={() => router.push("/menu")}
            className="px-4 py-2 border border-[#b9915f] text-[#b9915f] rounded-lg hover:bg-[#f9f3ec] transition"
          >
            Tiếp tục mua hàng
          </button>
        </div>
      </div>
    </div>
  );
}
