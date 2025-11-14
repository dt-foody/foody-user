"use client";

import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle, Circle } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type {
  Product,
  ComboItem,
  ComboSelectableProduct,
  CreateOrderItem_ComboSelection,
} from "@/types";

// Local type
type ComboSelections = Record<string, ComboSelectableProduct | null>;

export default function ComboSelectionModal() {
  const { comboForSelection, setComboForSelection, addItemToCart } =
    useCartStore();

  const [selections, setSelections] = useState<ComboSelections>({});
  const [note, setNote] = useState("");

  /** ---------------------------------------------
   * INIT STATE KHI MỞ MODAL
   * --------------------------------------------- */
  useEffect(() => {
    console.log("comboForSelection", comboForSelection);
    if (!comboForSelection) return;

    const initial: ComboSelections = {};

    comboForSelection.items.forEach((slot) => {
      if (slot.isRequired && slot.selectableProducts?.length > 0) {
        initial[slot.slotName] = slot.selectableProducts[0];
      } else {
        initial[slot.slotName] = null;
      }
    });

    setSelections(initial);
    setNote("");
  }, [comboForSelection]);

  /** ---------------------------------------------
   * HANDLE SELECT
   * --------------------------------------------- */
  const handleSelect = (slot: ComboItem, product: ComboSelectableProduct) => {
    setSelections((prev) => ({
      ...prev,
      [slot.slotName]: product,
    }));
  };

  /** ---------------------------------------------
   * VALIDATION
   * --------------------------------------------- */
  const { isFormValid, validationErrors } = useMemo(() => {
    if (!comboForSelection) return { isFormValid: false, validationErrors: {} };

    const errors: Record<string, string> = {};

    comboForSelection.items.forEach((slot) => {
      if (slot.isRequired && !selections[slot.slotName]) {
        errors[slot.slotName] = `Vui lòng chọn 1 mục cho "${slot.slotName}"`;
      }
    });

    return {
      isFormValid: Object.keys(errors).length === 0,
      validationErrors: errors,
    };
  }, [selections, comboForSelection]);

  /** ---------------------------------------------
   * SUBMIT → ADD TO CART
   * --------------------------------------------- */
  const handleSubmit = () => {
    if (!isFormValid || !comboForSelection) return;

    const payloadSelections: CreateOrderItem_ComboSelection[] = Object.keys(
      selections
    )
      .map((slotName) => {
        const selected = selections[slotName];
        if (!selected) return null;

        const product = selected.product as Product;
        if (!product) return null;

        return {
          slotName,
          product: {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice,
          },
          options: {}, // combo không có option riêng
        };
      })
      .filter((s): s is CreateOrderItem_ComboSelection => s !== null);

    const finalPrice =
      (comboForSelection as any).price ?? comboForSelection.comboPrice;

    const itemData = {
      itemType: "Combo" as const,
      item: {
        id: comboForSelection.id,
        name: comboForSelection.name,
        comboPrice: comboForSelection.comboPrice,
      },
      totalPrice: finalPrice,
      note: note.trim(),
      options: null,
      comboSelections: payloadSelections,
      _image: comboForSelection.image,
      _categoryIds: [],
    };

    // @ts-ignore: đã đúng format cho addItemToCart
    addItemToCart(itemData);
  };

  /** ---------------------------------------------
   * HANDLE CLOSE
   * --------------------------------------------- */
  const handleClose = () => {
    setComboForSelection(null);
  };

  if (!comboForSelection) return null;

  const displayPrice =
    (comboForSelection as any).price ?? comboForSelection.comboPrice;

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
                key={slot.slotName} // FIX #1
                className={`p-4 border rounded-lg ${
                  error ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {slot.slotName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {slot.isRequired ? "Bắt buộc (Chọn 1)" : "Tùy chọn (Chọn 1)"}
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

                    const isChecked =
                      selections[slot.slotName]?.product.id === product.id;

                    return (
                      <label
                        key={`${slot.slotName}__${product.id}`} // FIX #2
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
                          {prodInfo.fixedPrice > 0 && (
                            <span className="text-gray-700">
                              +{prodInfo.fixedPrice.toLocaleString("vi-VN")}đ
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
