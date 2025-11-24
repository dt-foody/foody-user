"use client";

import React from "react";
import { MapPin, ChevronDown, Check, PlusCircle, Loader2 } from "lucide-react";
import { useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { CustomerAddress } from "@/types";

export default function AddressDropdown() {
  const { selectedAddress, setSelectedAddress } = useCart();
  const { me } = useAuthStore(); // 'me' chứa thông tin user đầy đủ bao gồm addresses
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown khi click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addresses: CustomerAddress[] = me?.addresses || [];

  const handleSelect = (addr: CustomerAddress) => {
    setSelectedAddress(addr);
    setIsOpen(false);
  };

  if (!me) return null; // Không hiện nếu chưa login

  return (
    <div className="relative z-40" ref={dropdownRef}>
      {/* Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors max-w-[200px] lg:max-w-[300px] group"
      >
        <div className="p-1.5 bg-orange-100 rounded-full text-orange-600 group-hover:bg-orange-200 transition-colors">
          <MapPin size={18} />
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[10px] text-gray-500 font-semibold uppercase leading-none mb-0.5">
            Giao đến:
          </span>
          <div className="flex items-center gap-1 w-full">
            <span className="text-sm font-bold text-gray-800 truncate text-left flex-1">
              {selectedAddress
                ? selectedAddress.label || selectedAddress.street
                : "Chọn địa chỉ"}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 bg-gray-50 border-b">
            <h3 className="text-sm font-bold text-gray-700">Địa chỉ của bạn</h3>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {addresses.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-4">
                Chưa có địa chỉ nào đã lưu.
              </p>
            ) : (
              addresses.map((addr, idx) => {
                // Check if selected based on ID if available, or loose comparison
                const isSelected = (() => {
                  if (!selectedAddress) return false;

                  // 1. Nếu cả 2 đều có _id (Ưu tiên số 1)
                  if (selectedAddress._id && addr._id) {
                    return selectedAddress._id === addr._id;
                  }

                  // 2. Nếu cả 2 đều có id (Trường hợp fallback)
                  if (selectedAddress.id && addr.id) {
                    return selectedAddress.id === addr.id;
                  }

                  // 3. Trường hợp dữ liệu lỗi/cũ không có ID nào cả -> So sánh nội dung
                  // (Optional: Giữ lại nếu bạn muốn chắc chắn 100%)
                  return (
                    JSON.stringify(selectedAddress) === JSON.stringify(addr)
                  );
                })();

                return (
                  <button
                    key={addr._id || idx}
                    onClick={() => handleSelect(addr)}
                    className={`w-full text-left p-2.5 rounded-lg text-sm flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-orange-50 border border-orange-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <MapPin
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        isSelected ? "text-orange-600" : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold truncate ${
                            isSelected ? "text-orange-700" : "text-gray-800"
                          }`}
                        >
                          {addr.label || "Nhà riêng"}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded flex-shrink-0">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {addr.fullAddress}
                      </p>
                    </div>
                    {isSelected && (
                      <Check
                        size={16}
                        className="text-orange-600 mt-1 flex-shrink-0"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 border-t bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                // Chuyển hướng đến trang quản lý địa chỉ (giả sử route này đúng)
                router.push("/account" as any);
                // Nếu route của bạn là /account hoặc /account/addresses, hãy sửa lại ở đây
              }}
              className="w-full py-2 flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <PlusCircle size={16} />
              Quản lý địa chỉ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
