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
// === IMPORT STORE GỐC VÀ HOOK ===
import { SHIPPING_FEE, useCart, useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
// IMPORT MỚI
import CheckoutOrderSummary from "./CheckoutOrderSummary";

type Address = {
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

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    clearCart,
    appliedCoupons,

    // === LẤY STATE VÀ ACTIONS TỪ STORE ===
    deliveryOption,
    setDeliveryOption,
    scheduledDate,
    setScheduledDate,
    // revalidateAppliedCoupons, // <-- Giả sử bạn đã thêm hàm này
  } = useCart(); // State từ useCart đã có sẵn

  const { user, me, fetchUser } = useAuthStore();
  const router = useRouter();

  // Fetch user và re-validate coupons
  useEffect(() => {
    if (!user) fetchUser().catch(() => void 0);

    // Kiểm tra lại coupon ngay khi vào trang
    if (cartItems.length > 0) {
      // revalidateAppliedCoupons().catch((err) => {
      //   console.error("Failed to re-validate coupons:", err);
      // });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchUser, cartItems.length]);

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

  // Sửa lỗi logic: Phải đợi savedAddresses có dữ liệu mới set state
  useEffect(() => {
    if (savedAddresses.length > 0) {
      setUseSavedAddress(true);
      setSelectedAddrIndex(defaultIndex >= 0 ? defaultIndex : 0);
    }
  }, [savedAddresses, defaultIndex]);

  const [selectedAddrIndex, setSelectedAddrIndex] = useState(
    defaultIndex >= 0 ? defaultIndex : 0
  );
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: me?.name || "",
    phone: me?.phone || "",
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
    } else if (!useSavedAddress) {
      // Nếu chọn nhập tay, trả về thông tin cơ bản của user
      setUserInfo({
        name: me?.name || "",
        phone: me?.phone || "",
        address: "",
      });
    }
  }, [useSavedAddress, selectedAddrIndex, me, selectedAddress]);

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [agree, setAgree] = useState(true);

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

  // Cập nhật handleSubmitOrder với logic bắt lỗi coupon
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

      const result = await response.json(); // Luôn đọc json

      if (!response.ok) {
        // === XỬ LÝ LỖI ===
        if (result.invalid_coupon_id) {
          alert(result.message || "Một mã khuyến mãi không còn hợp lệ.");

          // === SỬA LỖI Ở ĐÂY ===
          // Lấy các hàm từ state của store (không cần hook ở đây)
          const { removeCoupon, setShowCart } = useCartStore.getState(); // Sửa useCart -> useCartStore

          // Tự động gỡ mã không hợp lệ khỏi giỏ hàng
          removeCoupon(result.invalid_coupon_id);

          // Mở lại giỏ hàng để người dùng thấy giá mới
          setShowCart(true);

          // (Optional) Đưa người dùng về bước xem lại
          setCurrentStep(1);
        } else {
          // Lỗi chung chung khác
          throw new Error(
            result.message || "Đặt hàng thất bại. Vui lòng thử lại."
          );
        }

        setIsLoading(false); // Dừng loading ở đây
      } else {
        // === ĐẶT HÀNG THÀNH CÔNG ===
        clearCart();
        router.push(`/order-confirmation/${result.orderId}`);
      }
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra.");
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold mb-2 text-gray-900">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Hãy thêm sản phẩm để tiếp tục mua sắm
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:shadow-lg transition-all text-sm"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Progress Steps (Tinh chỉnh) */}
        <div className="mb-6 md:mb-8">
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
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
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
                      className={`h-0.5 w-12 md:w-20 mx-1.5 transition-all ${
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-5" // Giảm gap
        >
          {/* LEFT COLUMN (Tinh chỉnh) */}
          <div className="lg:col-span-2 space-y-5">
            {" "}
            {/* Giảm space */}
            {/* Step 1: Shipping Information */}
            <div
              className={`bg-white rounded-xl shadow-lg border border-gray-200/75 transition-all ${
                // Dùng shadow-lg và border mỏng
                currentStep === 1
                  ? "border-orange-500" // Accent mạnh hơn
                  : step1Valid
                  ? "border-green-400"
                  : "border-gray-200/75"
              }`}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer" // Giảm padding
                onClick={() => setCurrentStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      // Giảm size icon
                      step1Valid
                        ? "bg-green-500 text-white"
                        : currentStep === 1
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step1Valid ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {" "}
                    {/* Giảm font size */}
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
                <div className="p-4 space-y-4">
                  {" "}
                  {/* Giảm padding, giữ space-y-4 */}
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
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        Sử dụng địa chỉ đã lưu
                      </label>
                    </div>
                  )}
                  {useSavedAddress && savedAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {/* Selected Address Display */}
                      <div className="relative p-3.5 rounded-lg border-2 border-orange-400 bg-orange-50">
                        {" "}
                        {/* Tinh chỉnh padding/border */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">
                                {selectedAddress?.label || "Địa chỉ"}
                              </span>
                              {selectedAddress?.isDefault && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-[11px] font-medium rounded">
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
                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {selectedAddress?.fullAddress ||
                                `${selectedAddress?.street}, ${selectedAddress?.ward}, ${selectedAddress?.district}, ${selectedAddress?.city}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowAddressSelector(!showAddressSelector)
                            }
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0 -mt-1 -mr-1"
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
                        <div className="space-y-2 max-h-64 overflow-y-auto p-1">
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
                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {addr.label || "Địa chỉ"}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-1.5 py-0.5 text-[11px] rounded bg-orange-500 text-white">
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
                        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm địa chỉ mới
                      </button>
                    </div>
                  ) : (
                    <>
                      {showNewAddressForm ? (
                        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50/30 space-y-3">
                          <div className="flex items-center justify-between">
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
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Lưu
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
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
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 outline-none transition-all ${
                                phoneOk || !userInfo.phone
                                  ? "border-gray-300 focus:ring-orange-500 focus:border-transparent"
                                  : "border-red-400 focus:ring-red-400"
                              }`}
                            />
                            {!phoneOk && userInfo.phone && (
                              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
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
                      rows={2} // Giảm chiều cao
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="VD: Giao giờ hành chính, gọi trước khi tới..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                  {step1Valid && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full mt-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                    >
                      Tiếp tục
                    </button>
                  )}
                </div>
              )}

              {currentStep !== 1 && step1Valid && (
                <div className="px-4 pb-4 text-sm text-gray-600 space-y-0.5">
                  <p className="font-semibold text-gray-900">{userInfo.name}</p>
                  <p>{userInfo.phone}</p>
                  <p className="text-gray-600">{userInfo.address}</p>
                </div>
              )}
            </div>
            {/* Step 2: Payment Method */}
            <div
              className={`bg-white rounded-xl shadow-lg border border-gray-200/75 transition-all ${
                currentStep === 2
                  ? "border-orange-500"
                  : currentStep > 2
                  ? "border-green-400"
                  : "border-gray-200/75 opacity-70" // Mờ đi nếu chưa active
              }`}
            >
              <div
                className={`p-4 flex items-center justify-between ${
                  step1Valid ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                onClick={() => step1Valid && setCurrentStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      currentStep > 2
                        ? "bg-green-500 text-white"
                        : currentStep === 2
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > 2 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">
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
                <div className="p-4 space-y-3">
                  <label
                    className={`flex items-start p-3.5 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-orange-500 bg-orange-50/60 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-0.5 w-4 h-4 text-orange-600 cursor-pointer focus:ring-orange-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Banknote className="text-green-600 w-5 h-5" />
                        <span className="font-semibold text-gray-900 text-sm">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start p-3.5 border-2 border-gray-200 rounded-lg cursor-not-allowed bg-gray-50 opacity-60">
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      disabled
                      className="mt-0.5 w-4 h-4 text-gray-400"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Landmark className="text-gray-400 w-5 h-5" />
                        <span className="font-semibold text-gray-500 text-sm">
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

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full mt-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    Xác nhận thanh toán
                  </button>
                </div>
              )}

              {currentStep > 2 && (
                <div className="px-4 pb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900 text-sm">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Step 3: Confirm Order */}
            <div
              className={`bg-white rounded-xl shadow-lg border border-gray-200/75 transition-all ${
                currentStep === 3
                  ? "border-orange-500"
                  : "border-gray-200/75 opacity-70"
              }`}
            >
              <div
                className="p-4 flex items-center gap-3"
                onClick={() =>
                  step1Valid && currentStep > 1 && setCurrentStep(3)
                }
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    currentStep === 3
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Xác nhận đơn hàng
                </h2>
              </div>

              {currentStep === 3 && (
                <div className="p-4 pt-0 space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TruckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-0.5">
                          Thời gian giao hàng dự kiến
                        </p>
                        <p className="text-blue-700">
                          Đơn hàng sẽ được giao trong vòng 30-45 phút
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-orange-600 rounded cursor-pointer focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 leading-snug">
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
                        chính sách
                      </a>{" "}
                      của cửa hàng.
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

          {/* RIGHT COLUMN: Order Summary (Tinh chỉnh) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/75 overflow-hidden lg:sticky lg:top-24">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Đơn hàng của bạn
                </h2>
                <p className="text-sm text-orange-100">
                  {cartItems.length} sản phẩm
                </p>
              </div>

              <div className="p-4">
                {/* === Component tóm tắt đơn hàng === */}
                <CheckoutOrderSummary
                  deliveryOption={deliveryOption}
                  setDeliveryOption={setDeliveryOption}
                  scheduledDate={scheduledDate}
                  setScheduledDate={setScheduledDate}
                />

                {/* === Tóm tắt giá (Tinh chỉnh) === */}
                <div className="space-y-2.5 pb-3 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium text-gray-900">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
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

                {/* === Tổng cộng và nút Submit (Tinh chỉnh) === */}
                <div className="pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">
                        {" "}
                        {/* Giảm font size */}
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
                    form="checkout-form"
                    disabled={
                      isLoading || !agree || !step1Valid || currentStep !== 3
                    }
                    className="hidden lg:flex w-full items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="animate-spin w-4 h-4" />
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

          {/* Mobile Submit Button (Tinh chỉnh) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.07)] z-50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm text-gray-600">Tổng cộng:</span>
              <span className="text-lg font-bold text-orange-600">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isLoading || !agree || !step1Valid || currentStep !== 3}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
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
        <div className="h-28 lg:hidden"></div>
      </div>
    </div>
  );
}
