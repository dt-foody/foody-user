"use client";

import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle, Circle } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type {
  Product,
  ComboItem,
  ComboSelectableProduct,
  Combo,
  OptionItem,
  OptionGroup,
} from "@/types";
import { ComboPricingMode, DiscountType } from "@/types";
import { nanoid } from "nanoid";
import {
  CreateOrderItem_ComboSelection,
  CreateOrderItem_Option,
  CartComboSnapshot,
  CartComboItemSnapshot,
  CartComboPricingMode,
} from "@/types/cart";

type ConfiguredComboItem = {
  instanceId: string;
  productInfo: ComboSelectableProduct;
  selectedOptions: Record<string, OptionItem[]>;
  calculatedOptionsPrice: number;
};

type ComboSelections = Record<string, ConfiguredComboItem[]>;

const calculateOptionsPrice = (
  baseProductPrice: number,
  options: Record<string, OptionItem[]>
): number => {
  let price = 0;
  Object.values(options)
    .flat()
    .forEach((opt) => {
      if (opt.type === "percentage") {
        price += Math.round(baseProductPrice * (opt.priceModifier / 100));
      } else {
        price += opt.priceModifier;
      }
    });
  return price;
};

const createConfiguredItem = (
  productInfo: ComboSelectableProduct
): ConfiguredComboItem => {
  const product = productInfo.product as Product;
  const initialOptions: Record<string, OptionItem[]> = {};
  const hasOptions = product.optionGroups && product.optionGroups.length > 0;

  if (hasOptions) {
    product.optionGroups?.forEach((group) => {
      const sorted = [...group.options].sort((a, b) => a.priority - b.priority);
      if (group.maxOptions === 1) {
        initialOptions[group.name] =
          group.minOptions > 0 && sorted.length > 0 ? [sorted[0]] : [];
      } else {
        initialOptions[group.name] = sorted.slice(
          0,
          Math.min(group.minOptions, sorted.length)
        );
      }
    });
  }

  const optionsPrice = calculateOptionsPrice(product.basePrice, initialOptions);

  return {
    instanceId: nanoid(),
    productInfo: productInfo,
    selectedOptions: initialOptions,
    calculatedOptionsPrice: optionsPrice,
  };
};

export default function ComboSelectionModal() {
  const { comboForSelection, setComboForSelection, addItemToCart } =
    useCartStore();

  const [selections, setSelections] = useState<ComboSelections>({});
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!comboForSelection) return;

    const initial: ComboSelections = {};
    const comboMode = comboForSelection.pricingMode;

    comboForSelection.items.forEach((slot) => {
      let preselected: ConfiguredComboItem[] = [];

      if (slot.minSelection > 0) {
        const priceKey =
          comboMode === ComboPricingMode.SLOT_PRICE
            ? "slotPrice"
            : "snapshotPrice";

        const sortedProducts = [...slot.selectableProducts].sort(
          (a, b) =>
            a[priceKey] + a.additionalPrice - (b[priceKey] + b.additionalPrice)
        );

        const itemsToSelect = sortedProducts.slice(0, slot.minSelection);

        preselected = itemsToSelect.map((prodInfo) =>
          createConfiguredItem(prodInfo)
        );
      }
      initial[slot.slotName] = preselected;
    });

    setSelections(initial);
    setNote("");
  }, [comboForSelection]);

  // --- LOGIC TÍNH GIÁ & TẠO SNAPSHOT ---
  const {
    finalPrice,
    marketPrice,
    validationErrors,
    isFormValid,
    comboSnapshot,
  } = useMemo(() => {
    const errors: Record<string, string> = {};

    // Default return với type đầy đủ cho validationErrors
    const defaultRes = {
      finalPrice: 0,
      marketPrice: 0,
      validationErrors: {} as Record<string, string>,
      isFormValid: false,
      comboSnapshot: null,
    };

    if (!comboForSelection) return defaultRes;

    const combo = comboForSelection as Combo;

    // Mapping Mode
    let mode: CartComboPricingMode = "FIXED";
    if (combo.pricingMode === ComboPricingMode.SLOT_PRICE) mode = "SLOT_PRICE";
    if (combo.pricingMode === ComboPricingMode.DISCOUNT) mode = "DISCOUNT";

    // 1. Validation
    combo.items.forEach((slot) => {
      const count = (selections[slot.slotName] || []).length;
      if (count < slot.minSelection) {
        errors[
          slot.slotName
        ] = `Vui lòng chọn ít nhất ${slot.minSelection} món.`;
      }
    });
    const isValid = Object.keys(errors).length === 0;

    // 2. Tính toán chi tiết
    let totalSurcharges = 0; // Tổng phụ thu
    let totalOptions = 0; // Tổng tiền options
    let totalBaseMarket = 0; // Tổng giá gốc thị trường của các món con
    let comboBaseCalc = 0; // Giá nền tảng để tính toán (tùy mode)

    const itemSnapshots: CartComboItemSnapshot[] = [];

    Object.keys(selections).forEach((slotName) => {
      const items = selections[slotName];
      items.forEach((item) => {
        const prod = item.productInfo.product as Product;
        const surcharge = item.productInfo.additionalPrice;
        const optPrice = item.calculatedOptionsPrice;

        totalSurcharges += surcharge;
        totalOptions += optPrice;
        totalBaseMarket += prod.basePrice; // Giá gốc thực tế

        let appliedItemPrice = 0;

        if (mode === "SLOT_PRICE") {
          appliedItemPrice = item.productInfo.slotPrice;
          comboBaseCalc += appliedItemPrice;
        } else if (mode === "DISCOUNT") {
          appliedItemPrice = item.productInfo.snapshotPrice;
          comboBaseCalc += appliedItemPrice;
        } else {
          // FIXED: Item không có giá riêng
          appliedItemPrice = 0;
        }

        itemSnapshots.push({
          productId: prod.id,
          productName: prod.name,
          originalBasePrice: prod.basePrice,
          appliedItemPrice: appliedItemPrice,
          surcharge: surcharge,
          optionsTotal: optPrice,
        });
      });
    });

    // 3. Tính Final Price
    let priceAfterInternalDiscount = 0;

    if (mode === "FIXED") {
      priceAfterInternalDiscount = combo.comboPrice;
    } else if (mode === "SLOT_PRICE") {
      priceAfterInternalDiscount = comboBaseCalc;
    } else if (mode === "DISCOUNT") {
      if (combo.discountType === DiscountType.PERCENT) {
        priceAfterInternalDiscount = Math.round(
          comboBaseCalc * (1 - combo.discountValue / 100)
        );
      } else if (combo.discountType === DiscountType.AMOUNT) {
        priceAfterInternalDiscount = Math.max(
          0,
          comboBaseCalc - combo.discountValue
        );
      } else {
        priceAfterInternalDiscount = comboBaseCalc;
      }
    }

    // 4. External Promotion
    let finalBasePrice = priceAfterInternalDiscount;
    if (combo.promotion) {
      const { discountType, discountValue, maxDiscountAmount } =
        combo.promotion;
      let discountAmount = 0;

      if (discountType === "percentage") {
        discountAmount = priceAfterInternalDiscount * (discountValue / 100);
        if (maxDiscountAmount && maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, maxDiscountAmount);
        }
      } else if (discountType === "fixed_amount") {
        discountAmount = discountValue;
      }

      finalBasePrice = Math.max(
        0,
        Math.round(priceAfterInternalDiscount - discountAmount)
      );
    }

    // 5. Tổng kết
    const finalPrice = finalBasePrice + totalSurcharges + totalOptions;
    const marketPrice = totalBaseMarket + totalSurcharges + totalOptions;

    const snapshot: CartComboSnapshot = {
      mode: mode,
      totalMarketPrice: marketPrice,
      totalFinalPrice: finalPrice,
      totalSavings: Math.max(0, marketPrice - finalPrice),
      items: itemSnapshots,
    };

    return {
      finalPrice,
      marketPrice,
      validationErrors: errors,
      isFormValid: isValid,
      comboSnapshot: snapshot,
    };
  }, [selections, comboForSelection]);

  const handleSelectProduct = (
    slot: ComboItem,
    productInfo: ComboSelectableProduct
  ) => {
    setSelections((prev) => {
      const newState = { ...prev };
      let currentSlotSelections = [...(newState[slot.slotName] || [])];
      const existingIndex = currentSlotSelections.findIndex(
        (item) => item.productInfo.product.id === productInfo.product.id
      );
      const isSelected = existingIndex !== -1;

      if (slot.maxSelection === 1) {
        if (isSelected) return prev;
        const newItem = createConfiguredItem(productInfo);
        newState[slot.slotName] = [newItem];
      } else {
        if (isSelected) {
          currentSlotSelections.splice(existingIndex, 1);
          newState[slot.slotName] = currentSlotSelections;
        } else {
          if (currentSlotSelections.length < slot.maxSelection) {
            const newItem = createConfiguredItem(productInfo);
            currentSlotSelections.push(newItem);
            newState[slot.slotName] = currentSlotSelections;
          }
        }
      }
      return newState;
    });
  };

  const handleOptionChange = (
    e: React.MouseEvent,
    slotName: string,
    instanceId: string,
    group: OptionGroup,
    option: OptionItem
  ) => {
    e.preventDefault();
    setSelections((prev) => {
      const slotSelections = prev[slotName] || [];
      const itemIndex = slotSelections.findIndex(
        (item) => item.instanceId === instanceId
      );
      if (itemIndex === -1) return prev;

      const originalItem = slotSelections[itemIndex];
      const oldOptions = originalItem.selectedOptions[group.name] || [];
      const isSelected = oldOptions.some((o) => o.name === option.name);
      let newOptions: OptionItem[] = oldOptions;

      if (group.maxOptions === 1) {
        if (isSelected && group.minOptions === 0) {
          newOptions = [];
        } else if (!isSelected) {
          newOptions = [option];
        }
      } else {
        if (isSelected) {
          newOptions = oldOptions.filter((o) => o.name !== option.name);
        } else {
          if (oldOptions.length < group.maxOptions) {
            newOptions = [...oldOptions, option];
          } else {
            return prev;
          }
        }
      }

      if (newOptions === oldOptions) return prev;

      const itemToUpdate: ConfiguredComboItem = {
        ...originalItem,
        selectedOptions: {
          ...originalItem.selectedOptions,
          [group.name]: newOptions,
        },
        calculatedOptionsPrice: calculateOptionsPrice(
          (originalItem.productInfo.product as Product).basePrice,
          { ...originalItem.selectedOptions, [group.name]: newOptions }
        ),
      };

      const newSlotSelections = [
        ...slotSelections.slice(0, itemIndex),
        itemToUpdate,
        ...slotSelections.slice(itemIndex + 1),
      ];

      return {
        ...prev,
        [slotName]: newSlotSelections,
      };
    });
  };

  const handleSubmit = () => {
    if (!isFormValid || !comboForSelection || !comboSnapshot) return;

    const payloadSelections: CreateOrderItem_ComboSelection[] = Object.keys(
      selections
    ).flatMap((slotName) => {
      const configuredItems = selections[slotName] || [];
      return configuredItems.map((item) => {
        const product = item.productInfo.product as Product;
        const payloadOptions: Record<string, CreateOrderItem_Option[]> = {};
        Object.keys(item.selectedOptions).forEach((key) => {
          payloadOptions[key] = item.selectedOptions[key].map((opt) => ({
            name: opt.name,
            priceModifier: opt.priceModifier,
          }));
        });

        return {
          slotName,
          product: {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice,
          },
          additionalPrice: item.productInfo.additionalPrice,
          options: payloadOptions,
          itemPrice: 0, // Placeholder
        };
      });
    });

    const itemData = {
      itemType: "Combo" as const,
      item: {
        id: comboForSelection.id,
        name: comboForSelection.name,
        comboPrice: comboForSelection.comboPrice,
        basePrice: 0,
      },
      totalPrice: finalPrice,
      note: note.trim(),
      options: null,
      comboSelections: payloadSelections,
      _image: comboForSelection.image,
      _categoryIds: [],

      // LƯU SNAPSHOT
      comboSnapshot: comboSnapshot,
    };

    // @ts-ignore
    addItemToCart(itemData);
    handleClose();
  };

  const handleClose = () => {
    setComboForSelection(null);
  };

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
                    const hasOptions = (product.optionGroups || []).length > 0;

                    const selectedItem = (selections[slot.slotName] || []).find(
                      (item) => item.productInfo.product.id === product.id
                    );
                    const isChecked = !!selectedItem;

                    let priceDisplay = null;
                    const comboMode = (comboForSelection as Combo).pricingMode;

                    if (comboMode === ComboPricingMode.SLOT_PRICE) {
                      priceDisplay = (
                        prodInfo.slotPrice + prodInfo.additionalPrice
                      ).toLocaleString("vi-VN");
                    } else if (prodInfo.additionalPrice > 0) {
                      priceDisplay = `+${prodInfo.additionalPrice.toLocaleString(
                        "vi-VN"
                      )}`;
                    }

                    return (
                      <div key={`${slot.slotName}__${product.id}`}>
                        <label
                          onClick={() => handleSelectProduct(slot, prodInfo)}
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
                            {priceDisplay && (
                              <div className="flex flex-col items-end text-sm">
                                <span className="font-bold text-primary-600">
                                  {comboMode === ComboPricingMode.SLOT_PRICE
                                    ? `${priceDisplay}đ`
                                    : priceDisplay}
                                </span>
                              </div>
                            )}
                            {isChecked ? (
                              <CheckCircle className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </label>

                        {isChecked && hasOptions && selectedItem && (
                          <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 space-y-4">
                            {(product.optionGroups || [])
                              .sort((a, b) => a.priority - b.priority)
                              .map((group) => {
                                const currentOptions =
                                  selectedItem.selectedOptions[group.name] ||
                                  [];

                                return (
                                  <div key={group.name} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <h3 className="font-semibold text-gray-900">
                                        {group.name}
                                      </h3>
                                      <span className="text-xs font-medium text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded-full">
                                        {group.minOptions > 0
                                          ? "Bắt buộc"
                                          : "Tùy chọn"}
                                      </span>
                                    </div>
                                    <div className="space-y-2 pt-1">
                                      {group.options
                                        .sort((a, b) => a.priority - b.priority)
                                        .map((option) => {
                                          const isOptChecked =
                                            currentOptions.some(
                                              (o) => o.name === option.name
                                            );
                                          const inputType =
                                            group.maxOptions === 1
                                              ? "radio"
                                              : "checkbox";
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
                                                handleOptionChange(
                                                  e,
                                                  slot.slotName,
                                                  selectedItem.instanceId,
                                                  group,
                                                  option
                                                )
                                              }
                                              className="flex items-center justify-between p-2.5 border rounded-md cursor-pointer transition-all bg-white hover:border-primary-300 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-400"
                                            >
                                              <span className="font-medium text-gray-800 text-sm">
                                                {option.name}
                                              </span>
                                              <div className="flex items-center space-x-3">
                                                <span className="text-gray-700 text-sm">
                                                  {priceText}
                                                </span>
                                                <input
                                                  type={inputType}
                                                  name={`${selectedItem.instanceId}-${group.name}`}
                                                  checked={isOptChecked}
                                                  readOnly
                                                  className={`pointer-events-none form-${inputType} h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300`}
                                                />
                                              </div>
                                            </label>
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

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

        <footer className="p-4 bg-gray-50 border-t flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-2">
            {comboSnapshot && comboSnapshot.totalSavings > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-gray-500 text-sm">Giá gốc:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    Tiết kiệm{" "}
                    {comboSnapshot.totalSavings.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-gray-400 line-through text-sm font-medium">
                    {comboSnapshot.totalMarketPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary-300 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex justify-between items-center px-6"
            >
              <span>{isFormValid ? "Thêm vào giỏ" : "Chưa chọn đủ món"}</span>
              {isFormValid && (
                <span>{finalPrice.toLocaleString("vi-VN")}đ</span>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
