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
  DollarSign,
  ShoppingBag,
  Clock,
  Info, // 🔥 Import thêm icon Clock
} from "lucide-react";
import {
  Order,
  OrderItemOption,
  OrderItemComboSelection,
  OrderItem,
} from "@/types";

// =================================================================
// 1. HELPER COMPONENTS
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
          + {opt.groupName}: {opt.optionName}
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
// 2. COMPONENT CARD ĐƠN HÀNG
// =================================================================

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const status = order.status;

  const statusText = useMemo(() => {
    const map: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      waiting_for_driver: "Đang tìm tài xế",
      delivering: "Đang giao hàng",
      completed: "Hoàn thành",
      canceled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    // Fallback nếu không có trong map thì format text gốc
    return (
      map[status] ||
      status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
    );
  }, [status]);

  const statusClasses = useMemo(() => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
      case "preparing":
      case "ready":
      case "delivering":
        return "bg-green-100 text-green-700";
      case "waiting_for_driver":
        return "bg-orange-100 text-orange-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "canceled":
      case "refunded":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, [status]);

  const totalItems = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items]
  );

  const recipientName = order.shipping?.address?.recipientName || "Không rõ";
  const grandTotal = formatPrice(order.grandTotal);

  // 🔥 Logic hiển thị Delivery Time
  const deliveryInfo = useMemo(() => {
    // @ts-ignore: Truy cập field deliveryTime (nếu type chưa update kịp)
    const dt = order.deliveryTime;

    if (!dt) return null;

    if (dt.option === "immediate") {
      return {
        label: "Giao ngay",
        time: "Sớm nhất có thể",
      };
    }

    if (dt.option === "scheduled" && dt.scheduledAt) {
      const date = new Date(dt.scheduledAt);
      return {
        label: "Hẹn giờ giao",
        time: `${date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}, ${date.toLocaleDateString("vi-VN")}`,
      };
    }

    return null;
  }, [order]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
        <div>
          <h3 className="font-semibold text-lg text-[#3b2f26] flex items-center gap-2">
            <Package size={18} /> Mã đơn #{order.orderId}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1.5">
            <CalendarDays size={14} />
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <span
          className={`self-start text-xs font-medium px-3 py-1.5 rounded-full ${statusClasses}`}
        >
          {statusText}
        </span>
      </div>

      {/* SUMMARY GRID (Đã update responsive) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        {/* 1. Giao đến */}
        <div className="flex items-start gap-2">
          <Truck size={16} className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide">
              Giao đến
            </span>
            <p
              className="font-medium text-gray-800 truncate max-w-[150px]"
              title={recipientName}
            >
              {recipientName}
            </p>
          </div>
        </div>

        {/* 2. Thời gian giao (MỚI) */}
        <div className="flex items-start gap-2">
          <Clock size={16} className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide">
              {deliveryInfo?.label || "Thời gian giao"}
            </span>
            <p className="font-medium text-gray-800">
              {deliveryInfo?.time || "Tiêu chuẩn"}
            </p>
          </div>
        </div>

        {/* 3. Số lượng */}
        <div className="flex items-start gap-2">
          <ShoppingBag
            size={16}
            className="text-amber-600 mt-1 flex-shrink-0"
          />
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide">
              Số lượng
            </span>
            <p className="font-medium text-gray-800">{totalItems} món</p>
          </div>
        </div>

        {/* 4. Tổng cộng */}
        <div className="flex items-start gap-2">
          <DollarSign size={16} className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide">
              Tổng tiền
            </span>
            <p className="font-bold text-base text-[#b9915f]">{grandTotal}</p>
          </div>
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <div className="mt-4 text-right border-t pt-3 border-dashed">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 ml-auto transition-colors"
        >
          {isExpanded ? "Thu gọn" : "Xem chi tiết"}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8 text-sm text-gray-700">
            {/* LEFT: DELIVERY INFO */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900 border-b pb-1 mb-2">
                <Truck size={16} className="text-amber-600" />
                <span>Địa chỉ nhận hàng</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-medium">
                  {order.shipping?.address?.recipientName}
                </p>
                <p>{order.shipping?.address?.recipientPhone}</p>
                <p className="text-gray-600 leading-snug">
                  {order.shipping?.address?.fullAddress ||
                    `${order.shipping?.address?.street}, ${order.shipping?.address?.ward}, ${order.shipping?.address?.district}, ${order.shipping?.address?.city}`}
                </p>
                {order.note && (
                  <div className="bg-yellow-50 p-2 rounded-md mt-2 border border-yellow-100 flex gap-2">
                    <MessageSquare
                      size={14}
                      className="text-yellow-600 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-yellow-700">
                        Ghi chú:
                      </span>
                      <p className="text-xs text-gray-700 italic">
                        {order.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: PAYMENT INFO */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900 border-b pb-1 mb-2">
                <CreditCard size={16} className="text-amber-600" />
                <span>Thanh toán</span>
              </div>
              <div className="pl-6 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-medium uppercase">
                    {order.payment?.method === "cash" && "Tiền mặt"}
                    {order.payment?.method === "payos" && "PayOS"}
                    {order.payment?.method === "momo" && "MoMo"}
                    {order.payment?.method === "vnpay" && "VNPay"}
                    {order.payment?.method === "bank_transfer" &&
                      "Chuyển khoản ngân hàng"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-1">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span>{order.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  <span>{order.shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>

                {/* HIỂN THỊ PHỤ THU TRONG LỊCH SỬ ĐƠN HÀNG */}
                {order.surchargeAmount && order.surchargeAmount > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="group relative flex items-center gap-1">
                        <span className="border-b border-dotted border-gray-400">
                          Phụ thu dịch vụ
                        </span>
                        <Info size={14} className="text-gray-400" />

                        {/* Tooltip hiển thị lại chi tiết các loại phí tại thời điểm đặt hàng */}
                        {order.surcharges && (
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-white border border-orange-100 rounded-xl shadow-xl z-50">
                            <p className="text-[10px] font-bold text-orange-400 uppercase mb-2">
                              Phí đã áp dụng
                            </p>
                            {order.surcharges.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between py-1 border-b border-orange-50 last:border-0"
                              >
                                <span className="text-gray-800 text-[11px]">
                                  {s.name}
                                </span>
                                <span className="font-bold text-orange-600 text-[11px]">
                                  +{s.cost.toLocaleString()}đ
                                </span>
                              </div>
                            ))}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
                          </div>
                        )}
                      </div>
                      <span className="text-orange-600 font-medium">
                        +{order.surchargeAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>
                      -{order.discountAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {order.appliedCoupons && order.appliedCoupons.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end mt-1">
                    {order.appliedCoupons.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs border border-green-100"
                      >
                        <Tag size={10} /> {c.code}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-base">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#b9915f]">{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS LIST */}
          {order.items && order.items.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold mb-3 text-gray-900 border-b pb-2">
                Chi tiết đơn hàng ({totalItems} món)
              </h4>
              <div className="space-y-4">
                {order.items.map((item: OrderItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-sm p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.name}{" "}
                        <span className="text-gray-500 font-normal">
                          x{item.quantity}
                        </span>
                      </p>
                      {item.itemType === "Product" && (
                        <RenderOrderOptions options={item.options} />
                      )}
                      {item.itemType === "Combo" && (
                        <RenderComboSelections
                          selections={item.comboSelections}
                        />
                      )}
                      {item.note && (
                        <p className="text-xs text-blue-600 italic mt-1 pl-4">
                          Note: {item.note}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 whitespace-nowrap ml-4">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </span>
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
// 3. COMPONENT CHÍNH (AccountOrders)
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
      <h1 className="text-2xl font-bold mb-6 text-[#3b2f26] flex items-center gap-2">
        <Package className="text-amber-600" /> Lịch sử đơn hàng
      </h1>

      {loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-center mb-6">
          {error}
          <button
            onClick={() => fetchOrders(1)}
            className="block mx-auto mt-2 text-sm font-semibold hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Bạn chưa có đơn hàng nào.</p>
          <ButtonPrimary href="/menu" className="mt-4 inline-block">
            Đặt món ngay
          </ButtonPrimary>
        </div>
      )}

      <div className="space-y-5">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {hasNextPage && !loading && orders.length > 0 && (
        <div className="text-center mt-8 pb-8">
          <ButtonPrimary onClick={handleLoadMore} className="px-8 shadow-lg">
            Xem thêm đơn hàng cũ
          </ButtonPrimary>
        </div>
      )}

      {loading && orders.length > 0 && (
        <div className="flex justify-center mt-6 pb-6">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
