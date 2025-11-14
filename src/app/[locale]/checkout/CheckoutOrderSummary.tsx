"use client";

import React from "react";
import Image from "next/image";
import { useCart, SHIPPING_FEE } from "@/stores/useCartStore";
// Import đúng type từ file order.ts
import type { CreateOrderItem_Option } from "@/types/order";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

// Helper để format price
const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

const RenderSelectedOptions = React.memo(function RenderSelectedOptions({
  options,
}: {
  options: Record<string, CreateOrderItem_Option[]>;
}) {
  // Gộp tất cả các options đã chọn từ các nhóm lại thành 1 mảng
  const allOptions = React.useMemo(() => {
    return Object.values(options || {}).flat();
  }, [options]);

  if (allOptions.length === 0) return null;

  return (
    <div className="pl-3 mt-1 space-y-0.5">
      {allOptions.map((opt, index) => (
        <p key={index} className="text-xs text-gray-500">
          + {opt.name}
          {/* Dùng opt.priceModifier */}
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

// Component tóm tắt đơn hàng
export default function CheckoutOrderSummary() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    finalShippingFee,
  } = useCart();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  return (
    <div className="sticky top-28 p-5 bg-white border rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4 border-b pb-3">
        Tóm tắt đơn hàng
      </h2>

      {/* Danh sách sản phẩm */}
      <div className="max-h-72 overflow-y-auto pr-2 -mr-2">
        <table className="w-full text-sm">
          <thead className="sr-only">
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cartItems.map((item) => {
              // Lấy giá base (gốc)
              const baseOrComboPrice =
                (item.itemType === "Product"
                  ? item.item.basePrice
                  : item.item.comboPrice) ?? 0;

              return (
                <tr key={item.cartId}>
                  {/*
                    ================================================
                    BẮT ĐẦU CẢI TIẾN LOGIC RENDER
                    (Giống hệt CartSidebar)
                    ================================================
                  */}
                  <td className="py-4" scope="row">
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
                        {/* Tên item */}
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                          {item.item.name}
                        </h4>

                        {/* Chỉ hiện giá base nếu > 0 */}
                        {baseOrComboPrice > 0 && (
                          <p className="text-sm text-gray-500">
                            {formatPrice(baseOrComboPrice)}
                          </p>
                        )}

                        {/* Render Options / Combo Selections */}
                        <div className="mt-1.5">
                          {/* 1. Nếu là SẢN PHẨM ĐƠN */}
                          {item.itemType === "Product" && (
                            <RenderSelectedOptions options={item.options} />
                          )}

                          {/* 2. Nếu là COMBO */}
                          {item.itemType === "Combo" && (
                            <div className="pl-2 mt-1 space-y-1">
                              {(item.comboSelections || []).map((sel, idx) => (
                                <div key={idx}>
                                  <p className="text-sm font-medium text-gray-700">
                                    - {sel.product.name}
                                  </p>
                                  {/* Tái sử dụng component render options */}
                                  <RenderSelectedOptions
                                    options={sel.options}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/*
                    ================================================
                    KẾT THÚC CẢI TIẾN
                    ================================================
                  */}
                  <td className="text-center px-2 py-4 align-top">
                    <span className="text-xs text-gray-600">
                      x {item.quantity}
                    </span>
                  </td>
                  <td className="text-right font-medium px-1 py-4 align-top">
                    {formatPrice(item.totalPrice * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chi tiết thanh toán (Giữ nguyên) */}
      <div className="mt-5 pt-4 border-t space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tạm tính</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí vận chuyển</span>
          <span className="font-medium">{formatPrice(SHIPPING_FEE)}</span>
        </div>
        {itemDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm sản phẩm</span>
            <span className="font-semibold">-{formatPrice(itemDiscount)}</span>
          </div>
        )}
        {shippingDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm phí ship</span>
            <span className="font-semibold">
              -{formatPrice(shippingDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 mt-2 border-t">
          <span className="text-base font-semibold text-gray-900">
            Tổng cộng
          </span>
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
