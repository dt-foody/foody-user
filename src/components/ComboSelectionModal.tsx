"use client";

import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle, Circle } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type {
  Product,
  ComboItem,
  ComboSelectableProduct,
  CreateOrderItem_ComboSelection,
  Combo, // NEW
} from "@/types";
// REFACTORED: Import Enums
import { ComboPricingMode, DiscountType } from "@/types";

// REFACTORED: State hỗ trợ multi-select
// Map slotName -> mảng các sản phẩm đã chọn
type ComboSelections = Record<string, ComboSelectableProduct[]>;

export default function ComboSelectionModal() {
  const { comboForSelection, setComboForSelection, addItemToCart } =
    useCartStore();

  // REFACTORED: State là mảng
  const [selections, setSelections] = useState<ComboSelections>({});
  const [note, setNote] = useState("");

  /**
   * INIT STATE KHI MỞ MODAL
   */
  useEffect(() => {
    if (!comboForSelection) return;

    const initial: ComboSelections = {};
    // REFACTORED: Khởi tạo mảng rỗng cho mỗi slot
    comboForSelection.items.forEach((slot) => {
      initial[slot.slotName] = [];
    });

    setSelections(initial);
    setNote("");
  }, [comboForSelection]);

  /**
   * REFACTORED: HANDLE SELECT (Hỗ trợ multi-select)
   */
  const handleSelect = (
    slot: ComboItem,
    productInfo: ComboSelectableProduct
  ) => {
    setSelections((prev) => {
      const current = prev[slot.slotName] || [];
      const isSelected = current.some(
        (p) => p.product.id === productInfo.product.id
      );
      const max = slot.maxSelection;
      let newSlotSelections: ComboSelectableProduct[];

      if (isSelected) {
        // 1. Deselect
        newSlotSelections = current.filter(
          (p) => p.product.id !== productInfo.product.id
        );
      } else {
        // 2. Select
        if (max === 1) {
          // 2a. Nếu max=1, thay thế
          newSlotSelections = [productInfo];
        } else if (current.length < max) {
          // 2b. Nếu max > 1 và chưa đủ, thêm vào
          newSlotSelections = [...current, productInfo];
        } else {
          // 2c. Đã đạt max, không làm gì
          newSlotSelections = current;
        }
      }
      return { ...prev, [slot.slotName]: newSlotSelections };
    });
  };

  /**
   * REFACTORED: VALIDATION VÀ TÍNH GIÁ (Gộp vào 1 useMemo)
   */
  const { finalPrice, validationErrors, isFormValid } = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!comboForSelection) {
      return { finalPrice: 0, validationErrors: {}, isFormValid: false };
    }

    const combo = comboForSelection as Combo; // Đảm bảo type mới
    let price = 0;

    // 1. Validation (dựa trên min/max)
    combo.items.forEach((slot) => {
      const count = (selections[slot.slotName] || []).length;
      if (count < slot.minSelection) {
        errors[
          slot.slotName
        ] = `Vui lòng chọn ít nhất ${slot.minSelection} món.`;
      }
      // maxSelection đã được xử lý trong handleSelect
    });
    const isValid = Object.keys(errors).length === 0;

    // 2. Tính giá
    const allSelections = Object.values(selections).flat();

    if (combo.pricingMode === ComboPricingMode.FIXED) {
      price = combo.comboPrice;
    } else if (combo.pricingMode === ComboPricingMode.SLOT_PRICE) {
      price = allSelections.reduce((sum, sel) => sum + sel.slotPrice, 0);
    } else if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
      const baseTotal = allSelections.reduce(
        (sum, sel) => sum + sel.snapshotPrice,
        0
      );
      if (combo.discountType === DiscountType.PERCENT) {
        price = baseTotal * (1 - combo.discountValue / 100);
      } else if (combo.discountType === DiscountType.AMOUNT) {
        price = Math.max(0, baseTotal - combo.discountValue);
      } else {
        price = baseTotal; // Fallback nếu là NONE
      }
    }

    // 3. Cộng gộp phụ thu (cho mọi mode)
    const totalAdditional = allSelections.reduce(
      (sum, sel) => sum + sel.additionalPrice,
      0
    );
    price += totalAdditional;

    return {
      finalPrice: price,
      validationErrors: errors,
      isFormValid: isValid,
    };
  }, [selections, comboForSelection]);

  /**
   * SUBMIT → ADD TO CART
   */
  const handleSubmit = () => {
    if (!isFormValid || !comboForSelection) return;

    // REFACTORED: flatMap mảng selections
    const payloadSelections: CreateOrderItem_ComboSelection[] = Object.keys(
      selections
    )
      .flatMap((slotName) => {
        const selectedProducts = selections[slotName] || [];
        if (selectedProducts.length === 0) return [];

        return selectedProducts.map((sel) => {
          const product = sel.product as Product;
          if (!product) return null;

          return {
            slotName,
            product: {
              id: product.id,
              name: product.name,
              basePrice: product.basePrice, // Gửi giá gốc của sp
            },
            options: {}, // Giả định combo item không có sub-options
          };
        });
      })
      .filter((s): s is CreateOrderItem_ComboSelection => s !== null);

    const itemData = {
      itemType: "Combo" as const,
      item: {
        id: comboForSelection.id,
        name: comboForSelection.name,
        // Snapshot giá gốc (chỉ dùng giá fixed nếu có)
        comboPrice: comboForSelection.comboPrice,
      },
      totalPrice: finalPrice, // REFACTORED: Dùng giá đã tính toán
      note: note.trim(),
      options: null,
      comboSelections: payloadSelections,
      _image: comboForSelection.image,
      _categoryIds: [],
    };

    // @ts-ignore: Đã đúng format cho addItemToCart
    addItemToCart(itemData);
    handleClose(); // NEW: Đóng modal sau khi thêm
  };

  const handleClose = () => {
    setComboForSelection(null);
  };

  // Helper hiển thị text yêu cầu của slot
  const getSlotRequirementText = (slot: ComboItem) => {
    const { minSelection, maxSelection } = slot;
    if (minSelection === 1 && maxSelection === 1) return "Bắt buộc (Chọn 1)";
    if (minSelection === 0 && maxSelection === 1) return "Tùy chọn (Chọn 1)";
    if (minSelection > 0 && maxSelection > minSelection)
      return `Bắt buộc (Chọn ${minSelection} - ${maxSelection})`;
    if (minSelection === 0 && maxSelection > 1)
      return `Tùy chọn (Chọn tối đa ${maxSelection})`;
    if (minSelection > 0 && maxSelection === minSelection)
      return `Bắt buộc (Chọn ${minSelection})`;
    return `Chọn ${minSelection} - ${maxSelection}`;
  };

  if (!comboForSelection) return null;

  // REFACTORED: Giá hiển thị ở footer là giá đã tính
  const displayPrice = finalPrice;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <header className="p-4 border-b relative flex-shrink-0">
          <h2 className="text-xl font-bold text-center text-gray-800">
            {comboForSelection.name}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {comboForSelection.description && (
            <p className="text-gray-600 pb-2 border-b border-gray-100">
              {comboForSelection.description}
            </p>
          )}

          {comboForSelection.items.map((slot) => {
            const error = validationErrors[slot.slotName];

            return (
              <div
                key={slot.slotName}
                className={`p-4 border rounded-lg ${
                  error ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {slot.slotName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {/* REFACTORED: Hiển thị text yêu cầu động */}
                  {getSlotRequirementText(slot)}
                </p>

                {error && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    {error}
                  </p>
                )}

                <div className="mt-3 space-y-3">
                  {slot.selectableProducts.map((prodInfo) => {
                    const product = prodInfo.product as Product;
                    if (!product) return null;

                    // REFACTORED: Check trong mảng
                    const isChecked =
                      selections[slot.slotName]?.some(
                        (p) => p.product.id === product.id
                      ) || false;

                    // REFACTORED: Logic hiển thị giá của item
                    let priceDisplay = null;
                    const comboMode = (comboForSelection as Combo).pricingMode;

                    if (comboMode === ComboPricingMode.SLOT_PRICE) {
                      // Mode SLOT: Hiển thị giá slot + phụ thu
                      priceDisplay = (
                        prodInfo.slotPrice + prodInfo.additionalPrice
                      ).toLocaleString("vi-VN");
                    } else if (prodInfo.additionalPrice > 0) {
                      // Mode FIXED/DISCOUNT: Chỉ hiển thị phụ thu
                      priceDisplay = `+${prodInfo.additionalPrice.toLocaleString(
                        "vi-VN"
                      )}`;
                    }

                    return (
                      <label
                        key={`${slot.slotName}__${product.id}`}
                        onClick={() => handleSelect(slot, prodInfo)}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all bg-white hover:border-primary-400 ${
                          isChecked
                            ? "bg-primary-50 border-primary-500 ring-1 ring-primary-300"
                            : ""
                        }`}
                      >
                        <span className="font-medium text-gray-800">
                          {product.name}
                        </span>

                        <div className="flex items-center space-x-4">
                          {/* REFACTORED: Hiển thị giá item */}
                          {priceDisplay && (
                            <span className="text-gray-700">
                              {priceDisplay}đ
                            </span>
                          )}
                          {isChecked ? (
                            <CheckCircle className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* NOTE */}
          <div>
            <label
              htmlFor="combo-note"
              className="text-lg font-semibold text-gray-900 mb-2 block"
            >
              Ghi chú
            </label>
            <textarea
              id="combo-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ghi chú cho quán (ví dụ: ít đường, không cay...)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
            />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="p-4 bg-gray-50 border-t flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full bg-primary-500 text-white py-2 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-primary-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isFormValid
              ? `Thêm vào giỏ - ${displayPrice.toLocaleString("vi-VN")}đ`
              : "Vui lòng chọn đủ mục"}
          </button>
        </footer>
      </div>
    </div>
  );
}
