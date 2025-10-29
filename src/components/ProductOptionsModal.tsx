'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useCart } from '@/stores/useCartStore';
// import { useCart } from '../contexts/CartContext';

interface OptionItem {
  name: string;
  priceModifier: number;
  type: 'fixed_amount' | 'percentage';
  isActive: boolean;
  priority: number;
}

interface OptionGroup {
  name: string;
  minOptions: number;
  maxOptions: number;
  priority: number;
  options: OptionItem[];
}

export default function ProductOptionsModal() {
  const { productForOptions, setProductForOptions, addToCartWithOptions } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, OptionItem[]>>({});
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!productForOptions) return;
    
    const initialOptions: Record<string, OptionItem[]> = {};
    productForOptions.optionGroups?.forEach((group: any) => {
      if (group.maxOptions === 1 && group.options.length > 0) {
        initialOptions[group.name] = [group.options[0]];
      } else {
        initialOptions[group.name] = [];
      }
    });
    setSelectedOptions(initialOptions);
    setNote('');
  }, [productForOptions]);

  const handleOptionChange = (group: OptionGroup, option: OptionItem, event: React.MouseEvent) => {
    event.preventDefault();

    setSelectedOptions(prev => {
      const newSelections = { ...prev };
      let currentGroupSelections = [...(newSelections[group.name] || [])];
      const isSelected = currentGroupSelections.some(o => o.name === option.name);

      if (group.maxOptions === 1) {
        if (isSelected && group.minOptions === 0) {
          currentGroupSelections = [];
        } else {
          currentGroupSelections = [option];
        }
      } else {
        if (isSelected) {
          currentGroupSelections = currentGroupSelections.filter(o => o.name !== option.name);
        } else if (currentGroupSelections.length < group.maxOptions) {
          currentGroupSelections.push(option);
        }
      }
      newSelections[group.name] = currentGroupSelections;
      return newSelections;
    });
  };

  const { totalPrice, isFormValid, validationErrors } = useMemo(() => {
    if (!productForOptions) return { totalPrice: 0, isFormValid: false, validationErrors: {} };
    
    let price = productForOptions.price;
    const errors: Record<string, string> = {};
    
    Object.values(selectedOptions).flat().forEach(option => {
      price += option.priceModifier;
    });
    
    productForOptions.optionGroups?.forEach((group: any) => {
      const selectionCount = selectedOptions[group.name]?.length || 0;
      if (selectionCount < group.minOptions) {
        errors[group.name] = `Bạn cần chọn ít nhất ${group.minOptions} mục.`;
      }
    });
    
    const isValid = Object.keys(errors).length === 0;
    return { totalPrice: price, isFormValid: isValid, validationErrors: errors };
  }, [selectedOptions, productForOptions]);

  const handleSubmit = () => {
    if (isFormValid && productForOptions) {
      addToCartWithOptions(productForOptions as any, selectedOptions, totalPrice, note);
    }
  };

  const handleClose = () => {
    setProductForOptions(null);
  };

  if (!productForOptions) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300" 
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transition-transform transform scale-95 animate-scale-in" 
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
          
          {/* Option Groups */}
          {productForOptions.optionGroups?.sort((a: any, b: any) => a.priority - b.priority).map((group: any) => {
            const currentSelectionCount = selectedOptions[group.name]?.length || 0;
            const error = validationErrors[group.name];
            const groupClass = error ? 'border-red-300 bg-red-50' : 'border-gray-200';

            return (
              <div key={group.name} className={`p-4 border rounded-lg transition-colors ${groupClass}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    Đã chọn {currentSelectionCount}/{group.maxOptions}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {group.minOptions > 0 
                    ? `Vui lòng chọn ít nhất ${group.minOptions} loại.` 
                    : 'Không bắt buộc.'}
                </p>
                {error && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
                )}
                
                {/* Options */}
                <div className="mt-3 space-y-3">
                  {group.options.sort((a: any, b: any) => a.priority - b.priority).map((option: any) => {
                    const isChecked = !!selectedOptions[group.name]?.some(o => o.name === option.name);
                    const inputType = group.maxOptions === 1 ? 'radio' : 'checkbox';
                    
                    return (
                      <label 
                        key={option.name} 
                        onClick={(e) => handleOptionChange(group, option, e)}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all bg-white hover:border-orange-400 has-[:checked]:bg-orange-50 has-[:checked]:border-orange-500 has-[:checked]:ring-1 has-[:checked]:ring-orange-300"
                      >
                        <span className="font-medium text-gray-800">{option.name}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-700">
                            +{option.priceModifier.toLocaleString('vi-VN')}đ
                          </span>
                          <input 
                            type={inputType} 
                            name={group.name} 
                            checked={isChecked} 
                            onChange={() => {}}
                            className={`pointer-events-none form-${inputType} h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300`}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Note */}
          <div>
            <label htmlFor="item-note" className="text-lg font-semibold text-gray-900 mb-2 block">
              Ghi chú
            </label>
            <textarea 
              id="item-note" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              rows={3}
              placeholder="Ghi chú cho quán (ví dụ: ít đường, không cay...)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 bg-gray-50 border-t flex-shrink-0">
          <button 
            onClick={handleSubmit} 
            disabled={!isFormValid}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-orange-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isFormValid 
              ? `Thêm vào giỏ - ${totalPrice.toLocaleString('vi-VN')}đ` 
              : 'Vui lòng chọn đủ tùy chọn'}
          </button>
        </footer>
      </div>
    </div>
  );
}