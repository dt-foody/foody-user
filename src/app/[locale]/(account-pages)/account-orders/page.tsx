"use client";

import React, { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { Loader2, Package, Truck, CreditCard, CalendarDays } from "lucide-react";
import { Order } from "@/types";

const AccountOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState("");

  // Gọi API phân trang
  const fetchOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await orderService.paginate({ page: pageNum, limit, sortBy: "createdAt:desc" });
      const { results, totalPages } = res;

      if (pageNum === 1) setOrders(results);
      else setOrders((prev) => [...prev, ...results]);

      setHasNextPage(pageNum < totalPages);
    } catch (err: any) {
      console.error("⚠️ Lỗi tải đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleLoadMore = () => {
    if (!hasNextPage || loading) return;
    const next = page + 1;
    setPage(next);
    fetchOrders(next);
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 md:px-10 font-sans">
      <h1 className="text-xl font-bold mb-6 text-[#3b2f26]">
        🧾 Lịch sử đơn hàng
      </h1>

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải đơn hàng...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-600 font-medium text-center py-4">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-500 italic text-center py-6">
          Bạn chưa có đơn hàng nào.
        </p>
      )}

      {/* Danh sách đơn hàng */}
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="font-semibold text-lg text-[#3b2f26] flex items-center gap-2">
                  <Package size={18} /> Mã đơn #{order.orderCode}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <CalendarDays size={14} />
                  Ngày tạo:{" "}
                  {/* {new Date(order.createdAt).toLocaleString("vi-VN")} */}
                </p>
              </div>

              <span
                className={`self-start sm:self-center text-xs font-medium px-3 py-1 rounded-full ${
                  order.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "canceled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Thông tin đơn */}
            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-amber-600" />
                  <p>
                    <span className="font-medium">Người nhận:</span>{" "}
                    {order.shipping?.address?.recipientName}
                  </p>
                </div>
                <p className="pl-6">
                  {order.shipping?.address?.street},{" "}
                  {order.shipping?.address?.ward},{" "}
                  {order.shipping?.address?.city}
                </p>
                <p className="pl-6 text-gray-500">
                  ☎ {order.shipping?.address?.recipientPhone}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-600" />
                  <p>
                    <span className="font-medium">Thanh toán:</span>{" "}
                    {order.payment?.method?.toUpperCase()} –{" "}
                    {order.payment?.status === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </p>
                </div>
                <p className="pl-6">
                  <span className="font-medium">Tổng cộng:</span>{" "}
                  <span className="text-[#b9915f] font-semibold">
                    {order.grandTotal.toLocaleString("vi-VN")}đ
                  </span>
                </p>
              </div>
            </div>

            {/* Danh sách món */}
            {order.items && order.items.length > 0 && (
              <div className="mt-3 border-t pt-2">
                <h4 className="font-semibold mb-1 text-gray-700">
                  Món đã đặt:
                </h4>
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity} —{" "}
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nút load thêm */}
      {hasNextPage && !loading && (
        <div className="text-center mt-6">
          <ButtonPrimary onClick={handleLoadMore}>Tải thêm</ButtonPrimary>
        </div>
      )}

      {/* Loading khi load thêm */}
      {loading && orders.length > 0 && (
        <div className="flex justify-center mt-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
