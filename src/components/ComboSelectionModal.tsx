"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X, CheckCircle, Circle } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import type {
  Product,
  ComboItem,
  ComboSelectableProduct,
  CreateOrderItem_ComboSelection,
  Combo,
  OptionItem,
  OptionGroup,
  CreateOrderItem_Option,
} from "@/types";
import { ComboPricingMode, DiscountType } from "@/types";
import { nanoid } from "nanoid"; // Cần cài đặt: npm install nanoid

// ======================================================================
// KHU VỰC STATE VÀ TYPES (KHÔNG ĐỔI)
// ======================================================================

/**
 * [MỚI] Kiểu state cho 1 món đã được chọn và cấu hình
 */
type ConfiguredComboItem = {
  instanceId: string; // ID duy nhất (vì khách có thể chọn 2 "Gà Rán" nếu max > 1)
  productInfo: ComboSelectableProduct; // Dữ liệu gốc của sản phẩm trong combo
  selectedOptions: Record<string, OptionItem[]>; // State options giống ProductOptionsModal
  calculatedOptionsPrice: number; // Giá của riêng options
};

/**
 * [MỚI] Kiểu state chính: Map slotName -> mảng các món đã cấu hình
 */
type ComboSelections = Record<string, ConfiguredComboItem[]>;

// Helper tính giá options (copy từ ProductOptionsModal)
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

/**
 * [MỚI] Helper tạo 1 ConfiguredComboItem với options mặc định
 */
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
        // Auto-select option đầu tiên nếu bắt buộc
        initialOptions[group.name] =
          group.minOptions > 0 && sorted.length > 0 ? [sorted[0]] : [];
      } else {
        // Auto-select N option đầu tiên nếu bắt buộc
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

// ======================================================================
// BẮT ĐẦU COMPONENT
// ======================================================================

export default function ComboSelectionModal() {
  const { comboForSelection, setComboForSelection, addItemToCart } =
    useCartStore();

  const [selections, setSelections] = useState<ComboSelections>({});
  const [note, setNote] = useState("");

  /**
   * [CẬP NHẬT] INIT STATE (Tự động chọn)
   */
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

  /**
   * [CẬP NHẬT] TÍNH GIÁ VÀ VALIDATION
   */
  const { finalPrice, validationErrors, isFormValid } = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!comboForSelection) {
      return { finalPrice: 0, validationErrors: {}, isFormValid: false };
    }

    const combo = comboForSelection as Combo;
    let price = 0;

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

    // 2. Tính giá
    const allSelections = Object.values(selections).flat();

    if (combo.pricingMode === ComboPricingMode.FIXED) {
      price = combo.comboPrice;
    } else if (combo.pricingMode === ComboPricingMode.SLOT_PRICE) {
      price = allSelections.reduce(
        (sum, sel) => sum + sel.productInfo.slotPrice,
        0
      );
    } else if (combo.pricingMode === ComboPricingMode.DISCOUNT) {
      const baseTotal = allSelections.reduce(
        (sum, sel) => sum + sel.productInfo.snapshotPrice,
        0
      );
      if (combo.discountType === DiscountType.PERCENT) {
        price = baseTotal * (1 - combo.discountValue / 100);
      } else if (combo.discountType === DiscountType.AMOUNT) {
        price = Math.max(0, baseTotal - combo.discountValue);
      } else {
        price = baseTotal;
      }
    }

    // 3. Cộng gộp phụ thu (mọi mode)
    const totalAdditional = allSelections.reduce(
      (sum, sel) => sum + sel.productInfo.additionalPrice,
      0
    );
    price += totalAdditional;

    // 4. Cộng gộp GIÁ OPTIONS (mọi mode)
    const totalOptionsPrice = allSelections.reduce(
      (sum, sel) => sum + sel.calculatedOptionsPrice,
      0
    );
    price += totalOptionsPrice;

    return {
      finalPrice: price,
      validationErrors: errors,
      isFormValid: isValid,
    };
  }, [selections, comboForSelection]);

  /**
   * [MỚI] HÀM CHỌN MÓN (Radio/Checkbox)
   */
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
        // === LOGIC RADIO ===
        if (isSelected) {
          // Đã chọn, không làm gì
          return prev;
        }
        // Chọn món mới -> Thay thế toàn bộ slot
        const newItem = createConfiguredItem(productInfo);
        newState[slot.slotName] = [newItem];
      } else {
        // === LOGIC CHECKBOX ===
        if (isSelected) {
          // Bỏ chọn
          currentSlotSelections.splice(existingIndex, 1);
          newState[slot.slotName] = currentSlotSelections;
        } else {
          // Thêm chọn mới (nếu chưa đạt max)
          if (currentSlotSelections.length < slot.maxSelection) {
            const newItem = createConfiguredItem(productInfo);
            currentSlotSelections.push(newItem);
            newState[slot.slotName] = currentSlotSelections;
          } else {
            // TODO: Bắn toast "Đã đạt tối đa X món"
          }
        }
      }
      return newState;
    });
  };

  /**
   * [ĐÃ SỬA LỖI] HÀM THAY ĐỔI OPTION
   */
  const handleOptionChange = (
    e: React.MouseEvent, // <-- [SỬA 1]: Thêm 'e'
    slotName: string,
    instanceId: string,
    group: OptionGroup,
    option: OptionItem
  ) => {
    e.preventDefault(); // <-- [SỬA 2]: Ngăn hành vi mặc định của label

    setSelections((prev) => {
      const slotSelections = prev[slotName] || [];
      const itemIndex = slotSelections.findIndex(
        (item) => item.instanceId === instanceId
      );
      if (itemIndex === -1) return prev; // Không tìm thấy item

      // 1. Lấy item gốc và mảng options gốc
      const originalItem = slotSelections[itemIndex];
      const oldOptions = originalItem.selectedOptions[group.name] || [];
      const isSelected = oldOptions.some((o) => o.name === option.name);

      let newOptions: OptionItem[] = oldOptions; // Mặc định là mảng cũ

      // 2. Tạo mảng 'newOptions' MỚI (đảm bảo tính bất biến)
      if (group.maxOptions === 1) {
        // === LOGIC RADIO ===
        if (isSelected && group.minOptions === 0) {
          newOptions = []; // Bỏ chọn
        } else if (!isSelected) {
          newOptions = [option]; // Chọn mới
        }
        // Nếu đã chọn và minOptions > 0, newOptions === oldOptions, không làm gì
      } else {
        // === LOGIC CHECKBOX ===
        if (isSelected) {
          // Bỏ chọn (Deselect) -> .filter() trả về mảng mới
          newOptions = oldOptions.filter((o) => o.name !== option.name);
        } else {
          // Thêm chọn (Select)
          if (oldOptions.length < group.maxOptions) {
            // Trả về mảng mới bằng spread syntax
            newOptions = [...oldOptions, option];
          } else {
            // Đã đạt tối đa, không làm gì
            console.warn(`Đã đạt số lượng tối đa (${group.maxOptions})`);
            return prev; // Không thay đổi state
          }
        }
      }

      // 3. Nếu mảng không thay đổi, không cần cập nhật
      if (newOptions === oldOptions) {
        return prev;
      }

      // 4. Tạo item đã cập nhật
      const itemToUpdate: ConfiguredComboItem = {
        ...originalItem,
        selectedOptions: {
          ...originalItem.selectedOptions,
          [group.name]: newOptions, // Gán mảng options mới
        },
        // Tính lại giá với map options mới
        calculatedOptionsPrice: calculateOptionsPrice(
          (originalItem.productInfo.product as Product).basePrice,
          { ...originalItem.selectedOptions, [group.name]: newOptions }
        ),
      };

      // 5. Tạo mảng slot selections mới
      const newSlotSelections = [
        ...slotSelections.slice(0, itemIndex),
        itemToUpdate,
        ...slotSelections.slice(itemIndex + 1),
      ];

      // 6. Trả về state cuối cùng
      return {
        ...prev,
        [slotName]: newSlotSelections,
      };
    });
  };

  /**
   * [CẬP NHẬT] SUBMIT → ADD TO CART (Không đổi)
   */
  const handleSubmit = () => {
    if (!isFormValid || !comboForSelection) return;

    const payloadSelections: CreateOrderItem_ComboSelection[] = Object.keys(
      selections
    )
      .flatMap((slotName) => {
        const configuredItems = selections[slotName] || [];
        if (configuredItems.length === 0) return [];

        return configuredItems.map((item) => {
          const product = item.productInfo.product as Product;
          if (!product) return null;

          // Map state options (OptionItem) sang payload (CreateOrderItem_Option)
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
            options: payloadOptions,
          };
        });
      })
      .filter((s): s is CreateOrderItem_ComboSelection => s !== null);

    const itemData = {
      itemType: "Combo" as const,
      item: {
        id: comboForSelection.id,
        name: comboForSelection.name,
        comboPrice: comboForSelection.comboPrice,
      },
      totalPrice: finalPrice, // Giá đã tính (bao gồm options)
      note: note.trim(),
      options: null,
      comboSelections: payloadSelections,
      _image: comboForSelection.image,
      _categoryIds: [],
    };

    // @ts-ignore
    addItemToCart(itemData);
    handleClose();
  };

  // --- Các hàm helper (không đổi) ---
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

  // === RENDER ===
  if (!comboForSelection) return null;

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

          {/* LẶP QUA TỪNG SLOT */}
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

                {/* DANH SÁCH MÓN ĂN */}
                <div className="mt-3 space-y-3">
                  {slot.selectableProducts.map((prodInfo) => {
                    const product = prodInfo.product as Product;
                    if (!product) return null;
                    const hasOptions = (product.optionGroups || []).length > 0;

                    const selectedItem = (selections[slot.slotName] || []).find(
                      (item) => item.productInfo.product.id === product.id
                    );
                    const isChecked = !!selectedItem;

                    // Logic giá
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
                    const originalSlotPrice =
                      comboMode === ComboPricingMode.SLOT_PRICE &&
                      prodInfo.snapshotPrice > prodInfo.slotPrice
                        ? prodInfo.snapshotPrice + prodInfo.additionalPrice
                        : null;

                    return (
                      <div key={`${slot.slotName}__${product.id}`}>
                        {/* 1. HÀNG ĐỂ CLICK CHỌN */}
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
                            {/* Giá */}
                            {(priceDisplay !== null ||
                              originalSlotPrice !== null) && (
                              <div className="flex flex-col items-end text-sm">
                                {priceDisplay !== null && (
                                  <span className="font-bold text-primary-600">
                                    {priceDisplay}đ
                                  </span>
                                )}
                                {originalSlotPrice !== null && (
                                  <span className="text-gray-400 line-through">
                                    {originalSlotPrice.toLocaleString("vi-VN")}đ
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Icon Radio/Checkbox */}
                            {isChecked ? (
                              <CheckCircle className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </label>

                        {/* 2. UI OPTIONS (HIỂN THỊ NẾU ĐƯỢC CHỌN) */}
                        {isChecked && hasOptions && selectedItem && (
                          <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 space-y-4">
                            {(product.optionGroups || [])
                              .sort((a, b) => a.priority - b.priority)
                              .map((group) => {
                                const currentOptions =
                                  selectedItem.selectedOptions[group.name] ||
                                  [];
                                const count = currentOptions.length;
                                // TODO: Thêm validation lỗi option ở đây nếu cần

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
                                    <p className="text-sm text-gray-500">
                                      {group.minOptions === group.maxOptions
                                        ? `Chọn ${group.minOptions} mục`
                                        : `Chọn từ ${group.minOptions} - ${group.maxOptions} mục`}
                                    </p>

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
                                              // [SỬA 1]: Truyền 'e' vào
                                              onClick={(e) =>
                                                handleOptionChange(
                                                  e, // <-- [SỬA 1]
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
