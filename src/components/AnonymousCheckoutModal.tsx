"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, MapPin, Clock, User, Phone, Home, CheckCircle } from "lucide-react";
import HereMapPicker from "./HereMapPicker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/stores/useCartStore";
import { orderService } from "@/services";

// Mock data cho khung giờ
const TIME_SLOTS = [
  { value: "07:30-09:00", label: "07:30-09:00" },
  { value: "09:00-10:30", label: "09:00-10:30" },
  { value: "10:30-12:00", label: "10:30-12:00" },
  { value: "12:00-13:30", label: "12:00-13:30" },
  { value: "13:30-15:00", label: "13:30-15:00" },
  { value: "15:00-16:30", label: "15:00-16:30" },
  { value: "16:30-18:00", label: "16:30-18:00" },
  { value: "18:00-19:30", label: "18:00-19:30" },
  { value: "19:30-21:00", label: "19:30-21:00" },
];

interface AnonymousCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  subtotal: number;
  shippingFee: number;
  finalTotal: number;
};

// Import HereMapPicker từ file của bạn
// import HereMapPicker from "@/components/HereMapPicker";

const AnonymousCheckoutModal: React.FC<AnonymousCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  shippingFee,
  finalTotal,
}) => {
const router = useRouter();
  const { clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [addressLabel, setAddressLabel] = useState("Nhà riêng");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [note, setNote] = useState("");
  
  // Delivery time
  const [deliveryOption, setDeliveryOption] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("bank");

  const getMinDate = () => new Date().toISOString().split("T")[0];


  const handleLocationSelect = (data: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(data);
    console.log("Selected location:", data);
  };

  const validateStep1 = () => {
    if (!recipientName.trim()) {
      alert("Vui lòng nhập tên người nhận");
      return false;
    }
    if (!recipientPhone.trim() || recipientPhone.length < 10) {
      alert("Vui lòng nhập số điện thoại hợp lệ");
      return false;
    }
    if (!selectedLocation) {
      alert("Vui lòng chọn địa chỉ giao hàng trên bản đồ");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (deliveryOption === "scheduled") {
      if (!scheduledDate || !selectedTimeSlot) {
        alert("Vui lòng chọn ngày và khung giờ giao hàng");
        return false;
      }
      const selectedDateTime = new Date(`${scheduledDate}T${selectedTimeSlot.split("-")[0]}`);
      if (selectedDateTime < new Date()) {
        alert("Thời gian hẹn phải ở tương lai");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (payload: any) => {
    try {
     setLoading(true);
      // @ts-ignore
      const result = await orderService.anonymousOrder(payload);

      if (paymentMethod === "bank" && result.qrInfo?.checkoutUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = result.qrInfo.checkoutUrl;
      } else {
        toast.success("Đơn hàng đã tạo thành công!");
        clearCart();
        router.push("/account-orders");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Lỗi đặt hàng.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitOrder = async () => {
    if (!validateStep2()) return;

    setLoading(true);

    // Parse địa chỉ từ HERE Map
    const addressParts = selectedLocation.address.split(", ");
    const payload = {
      items: cartItems.map(({ _image, _categoryIds, cartId, ...rest }: any) => rest),
      coupons: [],
      vouchers: [],
      totalAmount: subtotal,
      discountAmount: 0,
      shippingFee: shippingFee,
      grandTotal: finalTotal,
      payment: {
        method: "payos"
      },
      shipping: {
        address: {
          location: {
            type: "Point",
            coordinates: [selectedLocation.lng, selectedLocation.lat]
          },
          isDefault: true,
          label: addressLabel,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          street: addressParts[0] || "",
          ward: addressParts[1] || "",
          district: addressParts[2] || "",
          city: addressParts[3] || "",
          fullAddress: selectedLocation.address
        }
      },
      deliveryTime: {
        option: deliveryOption,
        scheduledAt: deliveryOption === "scheduled" && scheduledDate && selectedTimeSlot
          ? new Date(`${scheduledDate}T${selectedTimeSlot.split("-")[0]}`).toISOString()
          : null,
        timeSlot: deliveryOption === "scheduled" ? selectedTimeSlot : null
      },
      note: note.trim()
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
            <p className="text-sm text-gray-500 mt-1">
              Bước {currentStep}/2 - {currentStep === 1 ? "Địa chỉ giao hàng" : "Thời gian & xác nhận"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full transition-colors ${currentStep >= 1 ? 'bg-primary-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full transition-colors ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 1 ? (
            <div className="space-y-5">
              {/* Thông tin người nhận */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-primary-600" />
                  Thông tin người nhận
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0912345678"
                    maxLength={11}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại địa chỉ
                  </label>
                  <div className="flex gap-3">
                    {["Nhà riêng", "Văn phòng", "Khác"].map((label) => (
                      <button
                        key={label}
                        onClick={() => setAddressLabel(label)}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${
                          addressLabel === label
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chọn địa chỉ */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-primary-600" />
                  Chọn vị trí giao hàng <span className="text-red-500">*</span>
                </h3>
                <div className="rounded-lg overflow-hidden border border-gray-300 p-5">
                  <HereMapPicker
                    onLocationSelect={handleLocationSelect}
                    initialLat={21.0285}
                    initialLng={105.8542}
                    initialAddress=""
                    className="!p-0"
                  />
                </div>
                {selectedLocation && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Địa chỉ đã chọn</p>
                      <p className="text-sm text-green-700 mt-1">{selectedLocation.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tóm tắt địa chỉ */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{recipientName}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{recipientPhone}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedLocation?.address}</p>
                  </div>
                  <button
                    onClick={handleBack}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Sửa
                  </button>
                </div>
              </div>

              {/* Thời gian giao hàng */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-primary-600" />
                  Thời gian giao hàng
                </h3>
                
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={deliveryOption === "immediate"}
                      onChange={() => setDeliveryOption("immediate")}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="font-medium text-gray-900">Giao ngay</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={deliveryOption === "scheduled"}
                      onChange={() => setDeliveryOption("scheduled")}
                      className="w-4 h-4 text-primary-600 mt-1"
                    />
                    <span className="font-medium text-gray-900 block mb-3">Hẹn giờ giao</span>
                  </label>
                    <div className="flex-1">                      
                      {deliveryOption === "scheduled" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chọn ngày
                            </label>
                            <input
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              min={getMinDate()}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chọn khung giờ
                            </label>
                            <select
                              value={selectedTimeSlot}
                              onChange={(e) => setSelectedTimeSlot(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            >
                              <option value="">-- Chọn khung giờ --</option>
                              {TIME_SLOTS.map((slot) => (
                                <option key={slot.value} value={slot.value}>
                                  {slot.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú đơn hàng (không bắt buộc)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Gọi điện trước khi giao, để hàng tại bảo vệ..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Tóm tắt đơn hàng */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Tóm tắt đơn hàng</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">{shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary-600">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
          {currentStep === 1 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md"
              >
                Tiếp tục
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang xử lý...
                  </>
                ) : (
                  `Đặt hàng • ${finalTotal.toLocaleString("vi-VN")}đ`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnonymousCheckoutModal;