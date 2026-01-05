"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Tag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type { OptionItem, OptionGroup } from "@/types";
import { CreateOrderItem_Option } from "@/types/cart";

export default function ProductOptionsModal() {
  const { productForOptions, setProductForOptions, addItemToCart } =
    useCartStore();

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, OptionItem[]>
  >({});
  const [note, setNote] = useState("");

  // Khởi tạo các lựa chọn mặc định dựa trên minOptions
  useEffect(() => {
    if (!productForOptions) return;
    const initial: Record<string, OptionItem[]> = {};

    productForOptions.optionGroups?.forEach((group) => {
      const sorted = [...group.options].sort((a, b) => a.priority - b.priority);

      if (group.maxOptions === 1) {
        initial[group.name] =
          group.minOptions > 0 && sorted.length > 0 ? [sorted[0]] : [];
      } else {
        initial[group.name] = sorted.slice(
          0,
          Math.min(group.minOptions, sorted.length)
        );
      }
    });

    setSelectedOptions(initial);
    setNote("");
  }, [productForOptions]);

  // Xử lý thay đổi option
  const handleOptionChange = (
    group: OptionGroup,
    option: OptionItem,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    setSelectedOptions((prev) => {
      const next = { ...prev };
      let arr = [...(next[group.name] || [])];
      const isSelected = arr.some((o) => o.name === option.name);

      if (group.maxOptions === 1) {
        if (isSelected && group.minOptions === 0) {
          arr = [];
        } else {
          arr = [option];
        }
      } else {
        if (isSelected) {
          arr = arr.filter((o) => o.name !== option.name);
        } else if (arr.length < group.maxOptions) {
          arr.push(option);
        }
      }
      next[group.name] = arr;
      return next;
    });
  };

  // --- LOGIC TÍNH TOÁN GIÁ (ĐỒNG BỘ VỚI PRODUCT CARD) ---
  const { totalPrice, isFormValid, validationErrors, displayProductPrice } =
    useMemo(() => {
      if (!productForOptions)
        return {
          totalPrice: 0,
          isFormValid: false,
          validationErrors: {} as Record<string, string>,
          displayProductPrice: 0,
        };

      // 1. Tính giá cơ bản của sản phẩm (Sau Sale và Promotion)
      const basePrice = productForOptions.basePrice || 0;
      let priceAfterInternal = basePrice;

      // Ưu tiên salePrice nếu có và nhỏ hơn giá gốc
      if (
        productForOptions.salePrice &&
        productForOptions.salePrice < basePrice
      ) {
        priceAfterInternal = productForOptions.salePrice;
      }

      let finalProductPrice = priceAfterInternal;
      const promotion = (productForOptions as any).promotion;

      // Áp dụng promotion nếu đang hoạt động
      if (promotion && promotion.isActive !== false) {
        const promoValue = promotion.discountValue || 0;
        const promoType = promotion.discountType?.toLowerCase();

        if (promoType === "percentage" || promoType === "percent") {
          finalProductPrice = priceAfterInternal * (1 - promoValue / 100);
        } else if (promoType === "fixed_amount" || promoType === "amount") {
          finalProductPrice = Math.max(0, priceAfterInternal - promoValue);
        }
      }

      // 2. Cộng thêm giá của các Options
      let currentTotalPrice = finalProductPrice;
      const errors: Record<string, string> = {};

      Object.values(selectedOptions)
        .flat()
        .forEach((opt) => {
          if (opt.type === "percentage") {
            // Tính % dựa trên GIÁ GỐC (basePrice)
            currentTotalPrice += Math.round(
              basePrice * (opt.priceModifier / 100)
            );
          } else {
            currentTotalPrice += opt.priceModifier;
          }
        });

      // 3. Kiểm tra tính hợp lệ (minOptions)
      productForOptions.optionGroups?.forEach((group) => {
        const count = selectedOptions[group.name]?.length || 0;
        if (count < group.minOptions) {
          errors[group.name] = `Bạn cần chọn ít nhất ${group.minOptions} mục.`;
        }
      });

      return {
        totalPrice: Math.round(currentTotalPrice),
        isFormValid: Object.keys(errors).length === 0,
        validationErrors: errors,
        displayProductPrice: finalProductPrice,
      };
    }, [selectedOptions, productForOptions]);

  const handleSubmit = () => {
    if (!isFormValid || !productForOptions) return;

    const payloadOptions: Record<string, CreateOrderItem_Option[]> = {};
    Object.keys(selectedOptions).forEach((key) => {
      payloadOptions[key] = selectedOptions[key].map((opt) => ({
        name: opt.name,
        priceModifier: opt.priceModifier,
      }));
    });

    const promoData = (productForOptions as any).promotion;
    const promotionPayload =
      promoData && promoData.isActive !== false ? promoData : null;

    addItemToCart({
      itemType: "Product",
      item: {
        id: productForOptions.id,
        name: productForOptions.name,
        basePrice: productForOptions.basePrice,
        salePrice: productForOptions.salePrice || undefined,
        comboPrice: 0,
        promotion: promotionPayload, // Truyền Object
      },
      totalPrice: totalPrice,
      note: note.trim(),
      options: payloadOptions,
      comboSelections: null,
      _image: productForOptions.image,
    });

    setProductForOptions(null);
  };

  const handleClose = () => setProductForOptions(null);
  if (!productForOptions) return null;

  return (
    <div
      role="dialog"
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b relative flex-shrink-0">
          <h2 className="text-xl font-bold text-center text-gray-800">
            {productForOptions.name}
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div className="flex-1">
              {productForOptions.description && (
                <p className="text-gray-600 text-sm">
                  {productForOptions.description}
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <span className="text-lg font-bold text-primary-600">
                {Math.round(displayProductPrice).toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          {productForOptions.optionGroups
            ?.sort((a, b) => a.priority - b.priority)
            .map((group) => {
              const count = selectedOptions[group.name]?.length || 0;
              const error = validationErrors[group.name];

              return (
                <div
                  key={group.name}
                  className={`p-4 border rounded-lg ${
                    error ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {count}/{group.maxOptions}
                    </span>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}

                  <div className="mt-3 space-y-3">
                    {group.options
                      .sort((a, b) => a.priority - b.priority)
                      .map((option) => {
                        const isChecked = selectedOptions[group.name]?.some(
                          (o) => o.name === option.name
                        );
                        const priceText =
                          option.type === "percentage"
                            ? `+${option.priceModifier}%`
                            : `+${option.priceModifier.toLocaleString(
                                "vi-VN"
                              )}₫`;

                        return (
                          <label
                            key={option.name}
                            onClick={(e) =>
                              handleOptionChange(group, option, e)
                            }
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-primary-400 bg-white"
                          >
                            <span className="font-medium text-gray-800">
                              {option.name}
                            </span>
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-600 text-sm">
                                {priceText}
                              </span>
                              <input
                                type={
                                  group.maxOptions === 1 ? "radio" : "checkbox"
                                }
                                checked={isChecked}
                                readOnly
                                className="h-5 w-5 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              );
            })}

          <div>
            <label className="text-lg font-semibold text-gray-900 mb-2 block">
              Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Ít đường, không cay..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
            />
          </div>
        </main>

        <footer className="p-4 bg-gray-50 border-t">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isFormValid
              ? `Thêm vào giỏ - ${totalPrice.toLocaleString("vi-VN")}₫`
              : "Vui lòng chọn đủ lựa chọn"}
          </button>
        </footer>
      </div>
    </div>
  );
}
