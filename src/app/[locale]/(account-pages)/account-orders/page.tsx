"use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import { orderService } from "@/services/order.service";
import ButtonPrimary from "@/shared/ButtonPrimary";
import {
  Loader2,
  Package,
  Truck,
  CreditCard,
  CalendarDays,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  ShoppingBag, // Thêm icon
} from "lucide-react";
import {
  Order,
  OrderItemOption,
  OrderItemComboSelection,
  OrderItem,
} from "@/types";

// =================================================================
// 1. HELPER COMPONENTS (Giữ nguyên)
// =================================================================

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

const RenderOrderOptions = memo(function RenderOrderOptions({
  options,
}: {
  options: OrderItemOption[];
}) {
  if (!options || options.length === 0) return null;
  return (
    <div className="pl-4 mt-1 space-y-0.5">
      {options.map((opt, index) => (
        <p key={index} className="text-xs text-gray-500">
          + {opt.optionName}
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

const RenderComboSelections = memo(function RenderComboSelections({
  selections,
}: {
  selections: OrderItemComboSelection[];
}) {
  if (!selections || selections.length === 0) return null;
  return (
    <div className="pl-4 mt-1 space-y-1">
      {selections.map((sel, index) => (
        <div key={index}>
          <p className="text-sm font-medium text-gray-700">
            - {sel.productName}
            {sel.slotName && (
              <span className="text-xs text-gray-500 italic ml-1">
                ({sel.slotName})
              </span>
            )}
          </p>
          <RenderOrderOptions options={sel.options} />
        </div>
      ))}
    </div>
  );
});

// =================================================================
// 2. COMPONENT CARD ĐƠN HÀNG (Đã cải tiến)
// =================================================================

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lấy trạng thái
  const status = order.status;
  const statusText =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const statusClasses = useMemo(() => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
      case "preparing":
      case "ready":
      case "delivering":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "canceled":
      case "refunded":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, [status]);

  // --- THÔNG TIN THÊM ĐỂ HIỂN THỊ ---
  // Tính tổng số lượng món
  const totalItems = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items]
  );
  // Lấy tên người nhận
  const recipientName = order.shipping?.address?.recipientName || "Không rõ";
  // Format tổng tiền
  const grandTotal = formatPrice(order.grandTotal);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      {/* ===================================
       * PHẦN 1: HEADER (Mã đơn, Ngày, Trạng thái)
       * =================================== */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
        {/* Bên trái: ID & Ngày */}
        <div>
          <h3 className="font-semibold text-lg text-[#3b2f26] flex items-center gap-2">
            <Package size={18} /> Mã đơn #{order.orderId}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1.5">
            <CalendarDays size={14} />
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        {/* Bên phải: Trạng thái */}
        <span
          className={`self-start text-xs font-medium px-3 py-1.5 rounded-full ${statusClasses}`}
        >
          {statusText}
        </span>
      </div>

      {/* ===================================
       * PHẦN 2: SUMMARY (Luôn hiển thị)
       * =================================== */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
        {/* Thông tin 1: Giao đến */}
        <div className="flex items-start gap-2">
          <Truck size={16} className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <span className="text-gray-500">Giao đến:</span>
            <p className="font-medium text-gray-800">{recipientName}</p>
          </div>
        </div>

        {/* Thông tin 2: Số lượng */}
        <div className="flex items-start gap-2">
          <ShoppingBag
            size={16}
            className="text-amber-600 mt-1 flex-shrink-0"
          />
          <div>
            <span className="text-gray-500">Số lượng:</span>
            <p className="font-medium text-gray-800">{totalItems} món</p>
          </div>
        </div>

        {/* Thông tin 3: Tổng cộng */}
        <div className="flex items-start gap-2">
          <DollarSign size={16} className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <span className="text-gray-500">Tổng cộng:</span>
            <p className="font-semibold text-base text-[#b9915f]">
              {grandTotal}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================
       * PHẦN 3: NÚT BẤM
       * =================================== */}
      <div className="mt-4 text-right">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 ml-auto"
        >
          {isExpanded ? "Thu gọn" : "Xem chi tiết đơn hàng"}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ===================================
       * PHẦN 4: NỘI DUNG CHI TIẾT (Ẩn/Hiện)
       * =================================== */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t animate-fade-in">
          {/* Thông tin chi tiết Giao hàng & Thanh toán */}
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-3 text-sm text-gray-700">
            {/* CỘT BÊN TRÁI: GIAO HÀNG (CHI TIẾT) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <Truck size={16} className="text-amber-600" />
                <span>Thông tin giao hàng chi tiết</span>
              </div>
              <p className="pl-6">{order.shipping?.address?.recipientName}</p>
              <p className="pl-6">
                {order.shipping?.address?.street},{" "}
                {order.shipping?.address?.ward}, {order.shipping?.address?.city}
              </p>
              <p className="pl-6 text-gray-500">
                ☎ {order.shipping?.address?.recipientPhone}
              </p>
              {order.note && (
                <div className="pl-6 flex items-start gap-1.5 text-blue-700 mt-1">
                  <MessageSquare size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs italic">
                    <span className="font-medium">Ghi chú đơn:</span>{" "}
                    {order.note}
                  </p>
                </div>
              )}
            </div>

            {/* CỘT BÊN PHẢI: THANH TOÁN (CHI TIẾT) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <CreditCard size={16} className="text-amber-600" />
                <span>Chi tiết thanh toán</span>
              </div>
              <div className="pl-6 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span className="font-medium">
                    {order.payment?.method?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="font-medium">
                    {order.payment?.status === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>
                <div className="flex justify-between pt-1 mt-1 border-t">
                  <span>Tạm tính:</span>
                  <span className="font-medium">
                    {order.totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí ship:</span>
                  <span className="font-medium">
                    {order.shippingFee.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Giảm giá:</span>
                    <span>
                      -{order.discountAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {order.appliedCoupons && order.appliedCoupons.length > 0 && (
                  <div className="pt-1 mt-1 border-t">
                    {order.appliedCoupons.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 text-green-700"
                      >
                        <Tag size={12} />
                        <span className="font-medium">{c.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="pl-6 mt-2 pt-2 border-t">
                <span className="font-medium text-sm">Tổng cộng:</span>{" "}
                <span className="text-[#b9915f] font-semibold text-base">
                  {grandTotal}
                </span>
              </p>
            </div>
          </div>

          {/* DANH SÁCH MÓN */}
          {order.items && order.items.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <h4 className="font-semibold mb-2 text-gray-700">
                Chi tiết món đã đặt:
              </h4>
              <div className="space-y-3">
                {order.items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">
                        {item.name} (x{item.quantity})
                      </span>
                      <span className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {item.itemType === "Product" && (
                      <RenderOrderOptions options={item.options} />
                    )}
                    {item.itemType === "Combo" && (
                      <RenderComboSelections
                        selections={item.comboSelections}
                      />
                    )}
                    {item.note && (
                      <div className="pl-4 mt-1 flex items-start gap-1.5 text-blue-700">
                        <MessageSquare
                          size={12}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs italic">{item.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =================================================================
// 3. COMPONENT CHÍNH (AccountOrders - Giữ nguyên)
// =================================================================

const AccountOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await orderService.paginate({
        page: pageNum,
        limit,
        sortBy: "createdAt:desc",
      });
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

      {loading && orders.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải đơn hàng...</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 font-medium text-center py-4">{error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-500 italic text-center py-6">
          Bạn chưa có đơn hàng nào.
        </p>
      )}

      {/* SỬA: Dùng OrderCard mới */}
      <div className="space-y-5">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {hasNextPage && !loading && (
        <div className="text-center mt-6">
          <ButtonPrimary onClick={handleLoadMore}>Tải thêm</ButtonPrimary>
        </div>
      )}

      {loading && orders.length > 0 && (
        <div className="flex justify-center mt-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
