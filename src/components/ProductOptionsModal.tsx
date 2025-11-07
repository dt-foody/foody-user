// /components/ProductOptionsModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import type { OptionItem, OptionGroup } from "@/types/product";

export default function ProductOptionsModal() {
  const { productForOptions, setProductForOptions, addToCartWithOptions } =
    useCart();
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, OptionItem[]>
  >({});
  const [note, setNote] = useState("");

  // Preselect theo minOptions (ưu tiên theo priority)
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

  // Tính totalPrice: hỗ trợ percentage (tính trên base price)
  const { totalPrice, isFormValid, validationErrors } = useMemo(() => {
    if (!productForOptions)
      return {
        totalPrice: 0,
        isFormValid: false,
        validationErrors: {} as Record<string, string>,
      };

    const base = productForOptions.price;
    let price = base;
    const errors: Record<string, string> = {};

    Object.values(selectedOptions)
      .flat()
      .forEach((opt) => {
        if (opt.type === "percentage") {
          price += Math.round(base * (opt.priceModifier / 100));
        } else {
          price += opt.priceModifier;
        }
      });

    productForOptions.optionGroups?.forEach((group) => {
      const count = selectedOptions[group.name]?.length || 0;
      if (count < group.minOptions) {
        errors[group.name] = `Bạn cần chọn ít nhất ${group.minOptions} mục.`;
      }
    });

    return {
      totalPrice: price,
      isFormValid: Object.keys(errors).length === 0,
      validationErrors: errors,
    };
  }, [selectedOptions, productForOptions]);

  const handleSubmit = () => {
    if (isFormValid && productForOptions) {
      addToCartWithOptions(
        productForOptions,
        selectedOptions,
        totalPrice,
        note
      );
    }
  };

  const handleClose = () => setProductForOptions(null);
  if (!productForOptions) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transition-transform transform scale-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-4 border-b relative flex-shrink-0">
          <h2 className="text-xl font-bold text-center text-gray-800">
            {productForOptions.name}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Đóng"
            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {productForOptions.description && (
            <p className="text-gray-600 pb-2 border-b border-gray-100">
              {productForOptions.description}
            </p>
          )}

          {productForOptions.optionGroups
            ?.sort((a, b) => a.priority - b.priority)
            .map((group) => {
              const count = selectedOptions[group.name]?.length || 0;
              const error = validationErrors[group.name];

              return (
                <div
                  key={group.name}
                  className={`p-4 border rounded-lg transition-colors ${
                    error ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      Đã chọn {count}/{group.maxOptions}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {group.minOptions > 0
                      ? `Vui lòng chọn ít nhất ${group.minOptions} loại.`
                      : "Không bắt buộc."}
                  </p>
                  {error && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      {error}
                    </p>
                  )}

                  <div className="mt-3 space-y-3">
                    {group.options
                      .sort((a, b) => a.priority - b.priority)
                      .map((option) => {
                        const isChecked = !!selectedOptions[group.name]?.some(
                          (o) => o.name === option.name
                        );
                        const inputType =
                          group.maxOptions === 1 ? "radio" : "checkbox";
                        const priceText =
                          option.type === "percentage"
                            ? `+${option.priceModifier}%`
                            : `+${option.priceModifier.toLocaleString(
                                "vi-VN"
                              )}đ`;

                        return (
                          <label
                            key={option.name}
                            onClick={(e) =>
                              handleOptionChange(group, option, e)
                            }
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all bg-white hover:border-primary-400 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 has-[:checked]:ring-1 has-[:checked]:ring-primary-300"
                          >
                            <span className="font-medium text-gray-800">
                              {option.name}
                            </span>
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-700">{priceText}</span>
                              <input
                                type={inputType}
                                name={group.name}
                                checked={isChecked}
                                onChange={() => {}}
                                className={`pointer-events-none form-${inputType} h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300`}
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
            <label
              htmlFor="item-note"
              className="text-lg font-semibold text-gray-900 mb-2 block"
            >
              Ghi chú
            </label>
            <textarea
              id="item-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ghi chú cho quán (ví dụ: ít đường, không cay...)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 bg-gray-50 border-t flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-primary-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isFormValid
              ? `Thêm vào giỏ - ${totalPrice.toLocaleString("vi-VN")}đ`
              : "Vui lòng chọn đủ tùy chọn"}
          </button>
        </footer>
      </div>
    </div>
  );
}
