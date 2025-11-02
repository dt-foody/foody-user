"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Banknote,
  Landmark,
  Loader,
  CheckCircle2,
  NotebookPen,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  X,
  AlertCircle,
  Package,
  TruckIcon,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { SHIPPING_FEE, useCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
// IMPORT MỚI
import CheckoutOrderSummary from "./CheckoutOrderSummary";

type Address = {
  // ... (giữ nguyên type Address) ...
  label?: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  fullAddress?: string;
  isDefault?: boolean;
};

// ĐỊNH NGHĨA TYPE MỚI (để cả 2 file dùng)
export type DeliveryOption = "immediate" | "scheduled";

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    clearCart,
    appliedCoupons,
  } = useCart(); // State từ useCart đã có sẵn

  const { user, me, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) fetchUser().catch(() => void 0);
  }, [user, fetchUser]);

  const savedAddresses = useMemo(
    () => (me?.addresses ?? []) as Address[],
    [me?.addresses]
  );

  const defaultIndex = useMemo(
    () =>
      Math.max(
        0,
        savedAddresses.findIndex((a) => a.isDefault)
      ),
    [savedAddresses]
  );

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [useSavedAddress, setUseSavedAddress] = useState(
    savedAddresses.length > 0
  );
  const [selectedAddrIndex, setSelectedAddrIndex] = useState(
    defaultIndex >= 0 ? defaultIndex : 0
  );
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [newAddress, setNewAddress] = useState({
    label: "",
    recipientName: "",
    recipientPhone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
  });

  // STATE MỚI ĐƯỢC NÂNG LÊN TỪ SIDEBAR
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("immediate");
  const [scheduledDate, setScheduledDate] = useState("");

  const selectedAddress = savedAddresses[selectedAddrIndex];

  useEffect(() => {
    if (useSavedAddress && selectedAddress) {
      setUserInfo({
        name: selectedAddress.recipientName || me?.name || "",
        phone: selectedAddress.recipientPhone || me?.phone || "",
        address:
          selectedAddress.fullAddress ||
          `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`,
      });
    }
  }, [useSavedAddress, selectedAddrIndex, me, selectedAddress]); // Thêm selectedAddress

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [agree, setAgree] = useState(true);

  // ... (Giữ nguyên các hàm: handleInputChange, handleNewAddressChange, handleAddNewAddress) ...
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNewAddress = () => {
    if (
      !newAddress.recipientName ||
      !newAddress.recipientPhone ||
      !newAddress.street ||
      !newAddress.ward ||
      !newAddress.district ||
      !newAddress.city
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    const fullAddress = `${newAddress.street}, ${newAddress.ward}, ${newAddress.district}, ${newAddress.city}`;

    setUserInfo({
      name: newAddress.recipientName,
      phone: newAddress.recipientPhone,
      address: fullAddress,
    });

    setShowNewAddressForm(false);
    setUseSavedAddress(false);

    setNewAddress({
      label: "",
      recipientName: "",
      recipientPhone: "",
      street: "",
      ward: "",
      district: "",
      city: "",
    });
  };

  const phoneOk = /^0\d{9,10}$/.test(userInfo.phone.replace(/\s/g, ""));
  const step1Valid = userInfo.name && phoneOk && userInfo.address;

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agree || !step1Valid) return;
    setIsLoading(true);

    const orderData = {
      customer: userInfo,
      items: cartItems.map((it) => ({
        id: it.productId,
        name: it.name,
        qty: it.quantity,
        unitPrice: it.totalPrice,
        lineTotal: it.totalPrice * it.quantity,
        options: (it.selectedOptions ?? []).map((o: any) => o.name),
        note: it.note ?? "",
      })),
      paymentMethod,
      orderNote,
      // CẬP NHẬT: Thêm thông tin giao hàng
      delivery: {
        option: deliveryOption,
        scheduledDate: deliveryOption === "scheduled" ? scheduledDate : null,
      },
      promotions: {
        appliedCoupons,
        itemDiscount,
        shippingDiscount,
      },
      totals: { subtotal, shippingFee: SHIPPING_FEE, finalTotal },
      usedSavedAddress: useSavedAddress,
      savedAddressIndex: useSavedAddress ? selectedAddrIndex : null,
      userId: user?.id ?? me?.id ?? null,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Đặt hàng thất bại. Vui lòng thử lại.");

      const result = await response.json();
      clearCart();
      router.push(`/order-confirmation/${result.orderId}`);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra.");
      setIsLoading(false);
    }
  };

  // ... (Giữ nguyên phần return nếu giỏ hàng trống) ...
  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Package className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-600 mb-6">
          Hãy thêm sản phẩm để tiếp tục mua sắm
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Progress Steps (Giữ nguyên) */}
        <div className="mb-8">
          {/* ... (code steps) ... */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { num: 1, label: "Thông tin", icon: MapPin },
              { num: 2, label: "Thanh toán", icon: CreditCard },
              { num: 3, label: "Xác nhận", icon: ShieldCheck },
            ].map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <div key={step.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs md:text-sm mt-2 font-medium ${
                        isActive ? "text-orange-600" : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-0.5 w-12 md:w-20 mx-2 transition-all ${
                        currentStep > step.num ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form
          id="checkout-form"
          onSubmit={handleSubmitOrder}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* LEFT COLUMN (Giữ nguyên toàn bộ cột trái) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {/* ... (Toàn bộ code của Step 1) ... */}
            <div
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                currentStep === 1
                  ? "border-orange-300 shadow-orange-100"
                  : step1Valid
                  ? "border-green-200"
                  : "border-gray-200"
              }`}
            >
              <div
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setCurrentStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step1Valid
                        ? "bg-green-500 text-white"
                        : currentStep === 1
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step1Valid ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Thông tin giao hàng
                  </h2>
                </div>
                {currentStep !== 1 && step1Valid && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStep(1);
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Sửa
                  </button>
                )}
              </div>

              {currentStep === 1 && (
                <div className="px-5 pb-5 space-y-4">
                  {savedAddresses.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useSavedAddress}
                          onChange={(e) => {
                            setUseSavedAddress(e.target.checked);
                            setShowNewAddressForm(false);
                          }}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        Sử dụng địa chỉ đã lưu
                      </label>
                    </div>
                  )}

                  {useSavedAddress && savedAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {/* Selected Address Display */}
                      <div className="relative p-4 rounded-lg border-2 border-orange-300 bg-orange-50/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {selectedAddress?.label || "Địa chỉ"}
                              </span>
                              {selectedAddress?.isDefault && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 font-medium">
                              {selectedAddress?.recipientName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedAddress?.recipientPhone}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedAddress?.fullAddress ||
                                `${selectedAddress?.street}, ${selectedAddress?.ward}, ${selectedAddress?.district}, ${selectedAddress?.city}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowAddressSelector(!showAddressSelector)
                            }
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            {showAddressSelector ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Address List */}
                      {showAddressSelector && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {savedAddresses.map((addr, idx) => {
                            if (idx === selectedAddrIndex) return null;
                            const full =
                              addr.fullAddress ||
                              `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`;
                            return (
                              <button
                                key={`${addr.label}-${idx}`}
                                type="button"
                                onClick={() => {
                                  setSelectedAddrIndex(idx);
                                  setShowAddressSelector(false);
                                }}
                                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    {addr.label || "Địa chỉ"}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-1.5 py-0.5 text-xs rounded bg-orange-500 text-white">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">
                                  {addr.recipientName} • {addr.recipientPhone}
                                </p>
                                <p className="text-sm text-gray-600">{full}</p>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowNewAddressForm(true);
                          setUseSavedAddress(false);
                          setShowAddressSelector(false);
                        }}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm địa chỉ mới
                      </button>
                    </div>
                  ) : (
                    <>
                      {showNewAddressForm ? (
                        <div className="p-5 border-2 border-orange-200 rounded-lg bg-orange-50/30 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              Địa chỉ mới
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewAddressForm(false);
                                if (savedAddresses.length > 0) {
                                  setUseSavedAddress(true);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Nhãn địa chỉ{" "}
                              <span className="text-gray-400 font-normal">
                                (Tùy chọn)
                              </span>
                            </label>
                            <input
                              type="text"
                              name="label"
                              placeholder="VD: Nhà riêng, Văn phòng"
                              value={newAddress.label}
                              onChange={handleNewAddressChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tên người nhận{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="recipientName"
                                value={newAddress.recipientName}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Số điện thoại{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                name="recipientPhone"
                                value={newAddress.recipientPhone}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Địa chỉ chi tiết{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="street"
                              placeholder="Số nhà, tên đường"
                              value={newAddress.street}
                              onChange={handleNewAddressChange}
                              required
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Phường/Xã{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="ward"
                                value={newAddress.ward}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Quận/Huyện{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="district"
                                value={newAddress.district}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tỉnh/Thành phố{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={newAddress.city}
                                onChange={handleNewAddressChange}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handleAddNewAddress}
                              className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Lưu địa chỉ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewAddressForm(false);
                                if (savedAddresses.length > 0) {
                                  setUseSavedAddress(true);
                                }
                              }}
                              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <label
                              htmlFor="name"
                              className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                            >
                              <User className="w-4 h-4 mr-1.5 text-gray-400" />
                              Họ và tên
                            </label>
                            <input
                              id="name"
                              name="name"
                              value={userInfo.name}
                              onChange={handleInputChange}
                              required
                              placeholder="Nguyễn Văn A"
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>

                          <div className="relative">
                            <label
                              htmlFor="phone"
                              className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                            >
                              <Phone className="w-4 h-4 mr-1.5 text-gray-400" />
                              Số điện thoại
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={userInfo.phone}
                              onChange={handleInputChange}
                              required
                              placeholder="09xxxxxxxx"
                              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${
                                phoneOk
                                  ? "border-gray-300 focus:ring-orange-500 focus:border-transparent"
                                  : "border-red-300 focus:ring-red-300"
                              }`}
                            />
                            {!phoneOk && userInfo.phone && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Số điện thoại không hợp lệ
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <label
                              htmlFor="address"
                              className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                            >
                              <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                              Địa chỉ nhận hàng
                            </label>
                            <input
                              id="address"
                              name="address"
                              value={userInfo.address}
                              onChange={handleInputChange}
                              required
                              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="relative pt-2">
                    <label
                      htmlFor="orderNote"
                      className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <NotebookPen className="w-4 h-4 mr-1.5 text-gray-400" />
                      Ghi chú đơn hàng{" "}
                      <span className="text-gray-400 font-normal ml-1">
                        (Tùy chọn)
                      </span>
                    </label>
                    <textarea
                      id="orderNote"
                      name="orderNote"
                      rows={3}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="VD: Giao giờ hành chính, gọi trước khi tới..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  {step1Valid && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Tiếp tục
                    </button>
                  )}
                </div>
              )}

              {currentStep !== 1 && step1Valid && (
                <div className="px-5 pb-5 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{userInfo.name}</p>
                  <p>{userInfo.phone}</p>
                  <p className="text-gray-600">{userInfo.address}</p>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            {/* ... (Toàn bộ code của Step 2) ... */}
            <div
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                currentStep === 2
                  ? "border-orange-300 shadow-orange-100"
                  : currentStep > 2
                  ? "border-green-200"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <div
                className={`p-5 flex items-center justify-between ${
                  step1Valid ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                onClick={() => step1Valid && setCurrentStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep > 2
                        ? "bg-green-500 text-white"
                        : currentStep === 2
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > 2 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Phương thức thanh toán
                  </h2>
                </div>
                {currentStep === 3 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStep(2);
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Sửa
                  </button>
                )}
              </div>

              {currentStep === 2 && (
                <div className="px-5 pb-5 space-y-4">
                  <div className="space-y-3">
                    <label
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-orange-500 bg-orange-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-0.5 w-5 h-5 text-orange-600 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className="text-green-600 w-5 h-5" />
                          <span className="font-semibold text-gray-900">
                            Thanh toán khi nhận hàng (COD)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Thanh toán bằng tiền mặt khi nhận hàng tại nhà
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-not-allowed bg-gray-50 opacity-60">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        disabled
                        className="mt-0.5 w-5 h-5 text-gray-400"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Landmark className="text-gray-400 w-5 h-5" />
                          <span className="font-semibold text-gray-500">
                            Chuyển khoản ngân hàng
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-500 font-medium">
                            Sắp ra mắt
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Thanh toán qua chuyển khoản hoặc ví điện tử
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Tiếp tục
                  </button>
                </div>
              )}

              {currentStep > 2 && (
                <div className="px-5 pb-5 text-sm">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Confirm Order */}
            {/* ... (Toàn bộ code của Step 3) ... */}
            <div
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                currentStep === 3
                  ? "border-orange-300 shadow-orange-100"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === 3
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Xác nhận đơn hàng
                  </h2>
                </div>

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TruckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-1">
                            Thời gian giao hàng dự kiến
                          </p>
                          <p className="text-blue-700">
                            Đơn hàng sẽ được giao trong vòng 30-45 phút
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-0.5 w-5 h-5 text-orange-600 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        Tôi đồng ý với{" "}
                        <a
                          href="#"
                          className="text-orange-600 hover:underline font-medium"
                        >
                          điều khoản dịch vụ
                        </a>{" "}
                        và{" "}
                        <a
                          href="#"
                          className="text-orange-600 hover:underline font-medium"
                        >
                          chính sách hoàn tiền
                        </a>{" "}
                        của cửa hàng
                      </span>
                    </label>

                    {!agree && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Vui lòng đồng ý với điều khoản để tiếp tục</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary (ĐÃ CẬP NHẬT) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden lg:sticky lg:top-24">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Đơn hàng của bạn
                </h2>
                <p className="text-sm text-orange-100 mt-1">
                  {cartItems.length} sản phẩm
                </p>
              </div>

              <div className="p-5">
                {/* === THAY THẾ PHẦN ITEM TĨNH BẰNG COMPONENT MỚI === */}
                <CheckoutOrderSummary
                  deliveryOption={deliveryOption}
                  setDeliveryOption={setDeliveryOption}
                  scheduledDate={scheduledDate}
                  setScheduledDate={setScheduledDate}
                />

                {/* === GIỮ NGUYÊN PHẦN TÓM TẮT GIÁ (ĐÃ DYNAMIC) === */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium text-gray-900">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <TruckIcon className="w-4 h-4" />
                      Phí vận chuyển
                    </span>
                    <span className="font-medium text-gray-900">
                      {SHIPPING_FEE.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {(itemDiscount + shippingDiscount > 0 ||
                    appliedCoupons.length > 0) && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-px bg-green-200 flex-1"></div>
                        <span className="text-xs font-semibold text-green-600 uppercase">
                          Khuyến mãi
                        </span>
                        <div className="h-px bg-green-200 flex-1"></div>
                      </div>

                      {appliedCoupons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {appliedCoupons.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-1 text-[11px] rounded-md bg-green-50 text-green-700 border border-green-200 font-mono font-semibold"
                              title={c.name}
                            >
                              {c.code}
                            </span>
                          ))}
                        </div>
                      )}
                      {itemDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Giảm giá món</span>
                          <span className="font-semibold">
                            -{itemDiscount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                      {shippingDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Giảm phí ship</span>
                          <span className="font-semibold">
                            -{shippingDiscount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* === GIỮ NGUYÊN PHẦN TỔNG CỘNG VÀ NÚT SUBMIT === */}
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {finalTotal.toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-xs text-gray-500">
                        Đã bao gồm VAT
                      </div>
                    </div>
                  </div>

                  {/* Submit Button - Desktop */}
                  <button
                    type="submit"
                    form="checkout-form" // Đảm bảo nút này submit đúng form
                    disabled={
                      isLoading || !agree || !step1Valid || currentStep !== 3
                    }
                    className="hidden lg:flex w-full items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="animate-spin w-5 h-5" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Hoàn tất đặt hàng</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Submit Button (Giữ nguyên) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-orange-600">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <button
              type="submit"
              form="checkout-form" // Đảm bảo nút này submit đúng form
              disabled={isLoading || !agree || !step1Valid || currentStep !== 3}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin w-5 h-5" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Hoàn tất đặt hàng</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Mobile spacing for fixed button */}
        <div className="lg:hidden h-32"></div>
      </div>
    </div>
  );
}
