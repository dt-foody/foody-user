"use client";

import { useCart } from "@/stores/useCartStore";
import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  Clock,
  Info,
  Loader2,
  MapPin,
  Store, // Icon cửa hàng
  Bike, // Icon giao hàng
  Ticket,
  Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { CustomerPhone, PaymentMethod } from "@/types";
import Image from "next/image";
import { CreateOrderItem_Option, CartLine } from "@/types/cart";
import { getImageUrl } from "@/utils/imageHelper";
import SmartImage from "@/components/SmartImage";
import HereMapPicker from "@/components/HereMapPicker";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { dealSettingService } from "@/services/dealSetting.service";
import { DealOptionConfig } from "@/types/dealSetting";

import foodImageDefault from "@/images/food_image_default.jpg";
import { useAuthStore } from "@/stores/useAuthStore";

const PLACEHOLDER_IMAGE = foodImageDefault;

const formatPrice = (price: number) =>
  `${(price || 0).toLocaleString("vi-VN")}đ`;

const TIME_SLOTS = [
  { value: "07:30 - 09:00", label: "07:30 - 09:00" },
  { value: "09:00 - 10:30", label: "09:00 - 10:30" },
  { value: "10:30 - 12:00", label: "10:30 - 12:00" },
  { value: "12:00 - 13:30", label: "12:00 - 13:30" },
  { value: "13:30 - 15:00", label: "13:30 - 15:00" },
  { value: "15:00 - 16:30", label: "15:00 - 16:30" },
  { value: "16:30 - 18:00", label: "16:30 - 18:00" },
  { value: "18:00 - 19:30", label: "18:00 - 19:30" },
  { value: "19:30 - 21:00", label: "19:30 - 21:00" },
];

// --- HELPER RENDERERS ---
const RenderSelectedOptions = React.memo(function RenderSelectedOptions({
  options,
}: {
  options: Record<string, CreateOrderItem_Option[]>;
}) {
  const allOptions = React.useMemo(
    () => Object.values(options || {}).flat(),
    [options],
  );
  if (allOptions.length === 0) return null;
  return (
    <div className="ml-3 mt-1 space-y-0.5">
      {allOptions.map((opt, index) => (
        <p key={index} className="text-xs text-gray-500">
          + {opt.name}{" "}
          {opt.priceModifier > 0 && (
            <span className="font-medium ml-1 text-gray-600">
              (+{formatPrice(opt.priceModifier)})
            </span>
          )}
        </p>
      ))}
    </div>
  );
});

export default function CheckoutPage() {
  const {
    cartItems,
    giftLines,
    giftTotal,
    subtotal,
    surcharges,
    itemDiscount,
    shippingDiscount,
    finalTotal,
    appliedCoupons,
    clearCart,
    deliveryOption,
    setDeliveryOption,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    originalShippingFee,
    totalSurcharge,
    selectedAddress,
    setSelectedAddress,
    isCalculatingShip,
    recalculateShippingFee,

    fulfillmentType,
    setFulfillmentType,
  } = useCart();

  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("bank");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [settings, setSettings] = useState<any>({});

  const [isRestrictedTime, setIsRestrictedTime] = useState(false);

  // 🔥 Local state cho khung giờ (UI only)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Thông tin địa chỉ tạm thời khi người dùng thao tác trên bản đồ
  const [tempAddress, setTempAddress] = useState<any>(null);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Logic: Từ 21h trở đi HOẶC trước 7h HOẶC (7h mà phút < 30)
      const isRestricted =
        hours >= 21 || hours < 7 || (hours === 7 && minutes < 30);
      setIsRestrictedTime(isRestricted);
      return isRestricted;
    };

    checkTime();
  }, []);

  // --- LOGIC TÍNH TOÁN HIỂN THỊ (Overrides Store Logic) ---
  // Nếu là Pickup, phí ship = 0. Nếu Delivery, dùng phí ship từ store.
  const displayShippingFee =
    fulfillmentType === "pickup" ? 0 : originalShippingFee;

  // Xử lý khi chọn vị trí trên HereMap
  const handleLocationSelect = (data: {
    lat: number;
    lng: number;
    address: string;
    houseNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  }) => {
    console.log("Selected location data:", data);

    setTempAddress({
      location: {
        type: "Point",
        coordinates: [data.lng, data.lat],
      },
      fullAddress: data.address,
      label: "Địa chỉ đã chọn",
      // Mapping chính xác các giá trị hành chính
      ward: data.ward || "", // Phường/Xã
      district: data.district || "", // Quận/Huyện
      city: data.city || "", // Tỉnh/Thành phố
      street: data.houseNumber
        ? `${data.houseNumber} ${data.street}`.trim()
        : data.street || "",
      // Giữ lại thông tin người nhận hiện tại để không bị mất khi chọn map
      recipientName: name,
      recipientPhone: phone,
    });
  };

  const confirmAddress = () => {
    if (tempAddress) {
      // Tạo object địa chỉ hoàn chỉnh
      const finalAddress = {
        ...tempAddress,
        recipientName: name.trim(), // Lấy tên từ ô input hiện tại
        recipientPhone: phone.trim(), // Lấy phone từ ô input hiện tại
      };

      // Cập nhật vào Cart Store
      setSelectedAddress(finalAddress);

      setIsAddressModalOpen(false);
      toast.success("Đã cập nhật địa chỉ và phí giao hàng");
    }
  };

  useEffect(() => {
    if (selectedTimeSlot) {
      const [startTime] = selectedTimeSlot.split("-");
      setScheduledTime(startTime.trim()); // Lưu "07:30" vào store
    } else {
      setScheduledTime("");
    }
  }, [selectedTimeSlot, setScheduledTime]);

  // Tự động tính lại phí ship khi đổi địa chỉ hoặc giờ giao (Chỉ khi ở chế độ Delivery)
  useEffect(() => {
    if (fulfillmentType === "delivery") {
      const timer = setTimeout(() => recalculateShippingFee(), 500);
      return () => clearTimeout(timer);
    }
  }, [
    recalculateShippingFee,
    deliveryOption,
    scheduledDate,
    scheduledTime,
    fulfillmentType,
  ]);

  // Get Deal setting
  useEffect(() => {
    setLoadingSetting(true);
    const fetchSettings = async () => {
      try {
        const data = await dealSettingService.getAll({});
        if (data && data.results && data.results.length) {
          const setting = data.results[0];
          setSettings(setting);

          // --- Logic chọn mặc định dựa trên cấu hình mới ---

          // --- LOGIC KIỂM TRA GIỜ (THÊM VÀO ĐÂY) ---
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes();
          // Kiểm tra lại lần nữa tại thời điểm fetch xong
          const isRestricted =
            hours >= 21 || hours < 7 || (hours === 7 && minutes < 30);

          // 1. Logic chọn Fulfilment Default
          // Case 1: Nếu Shop TẮT Giao hàng, chỉ BẬT Mang về -> Buộc set thành Pickup
          if (!setting.homeDelivery?.value && setting.storePickup?.value) {
            setFulfillmentType("pickup");
          }
          // Case 2: Nếu Shop TẮT Mang về, chỉ BẬT Giao hàng -> Buộc set thành Delivery
          // (Điều này xử lý trường hợp user chọn Pickup từ trước nhưng giờ shop đã tắt)
          else if (setting.homeDelivery?.value && !setting.storePickup?.value) {
            setFulfillmentType("delivery");
          }
          // Case 3: Nếu cả 2 đều BẬT -> Không làm gì cả, giữ nguyên lựa chọn của User (từ Store/Sidebar)

          // 2. Kiểm tra Giao hàng: Nếu Giao nhanh bị tắt (.value === false) và Hẹn giờ đang bật

          if (isRestricted) {
            setDeliveryOption("scheduled");
          } else {
            if (
              !setting.fastDelivery?.value &&
              setting.scheduledDelivery?.value
            ) {
              setDeliveryOption("scheduled");
            }
            // Ngược lại, nếu Giao nhanh bật, mặc định chọn immediate
            else if (setting.fastDelivery?.value) {
              // Có thể giữ nguyên logic này hoặc bỏ else để tôn trọng lựa chọn cũ nếu muốn
              setDeliveryOption("immediate");
            }
          }

          // 3. Kiểm tra Thanh toán: Nếu Tiền mặt bị tắt và Chuyển khoản đang bật
          if (!setting.cashPayment?.value && setting.bankTransfer?.value) {
            setPaymentMethod("bank");
          }
          // Ngược lại, nếu Tiền mặt bật, mặc định chọn cod
          else if (setting.cashPayment?.value) {
            setPaymentMethod("cod");
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy cấu hình deal setting", error);
      } finally {
        setLoadingSetting(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function để lấy thông tin liên hệ (Email/Phone)
  const getContactValue = (items: CustomerPhone[]) => {
    if (!items || items.length === 0) return null;
    const primary = items.find((item) => item.isPrimary);
    return primary ? primary.value : items[0].value;
  };

  // Điền thông tin người nhận từ địa chỉ đã chọn
  useEffect(() => {
    if (selectedAddress) {
      setName(selectedAddress.recipientName || "");
      setPhone(selectedAddress.recipientPhone || "");
    } else {
      const { me: profile } = useAuthStore.getState();

      setName(profile ? profile.name || "" : "");
      setPhone(profile ? getContactValue(profile.phones || []) || "" : "");
    }
  }, [selectedAddress]);

  const getMinDate = () => new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (loading) return;

    // 1. Validation cơ bản
    if (!name.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập đủ tên và số điện thoại!");
      return;
    }

    // Validate Địa chỉ chỉ khi là Giao hàng
    if (fulfillmentType === "delivery" && !selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    if (!cartItems.length) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    // 2. Validation thời gian giao hàng
    if (deliveryOption === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        toast.error("Vui lòng chọn ngày và khung giờ giao hàng!");
        return;
      }

      const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (selectedDateTime < new Date()) {
        toast.warning("Thời gian hẹn phải ở tương lai!");
        return;
      }
    }

    // 3. Transform Dữ Liệu: Delivery Time
    const deliveryTimePayload = {
      option: deliveryOption,
      scheduledAt:
        deliveryOption === "scheduled" && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : null,
      timeSlot:
        deliveryOption === "scheduled" && selectedTimeSlot
          ? selectedTimeSlot
          : null,
    };

    // 4. Transform Dữ Liệu: Coupons & Vouchers (Tách riêng)
    const payloadCoupons: { id: string; code: string }[] = [];
    const payloadVouchers: { voucherId: string; voucherCode: string }[] = [];

    appliedCoupons.forEach((c) => {
      if (c.voucherId && c.voucherCode) {
        payloadVouchers.push({
          voucherId: c.voucherId,
          voucherCode: c.voucherCode,
        });
      } else {
        payloadCoupons.push({
          id: c.id,
          code: c.code || "",
        });
      }
    });

    // 🔥 Override Shipping Fee cho Pickup
    const finalShippingFee =
      fulfillmentType === "pickup" ? 0 : originalShippingFee;

    const finalOrderType =
      fulfillmentType === "pickup" ? "TakeAway" : "Delivery";

    const cleanedItems = cartItems.map((cartItem) => {
      // 1. Tách các field UI không cần thiết (_image, cartId)
      const { _image, cartId, promotionWarning, ...rest } = cartItem;

      // 2. Xử lý field promotion trong nested object 'item'
      const rawPromotion = rest.item.promotion;

      // Nếu promotion là object (có id) -> lấy id. Nếu là string -> giữ nguyên.
      const promotionId =
        rawPromotion && typeof rawPromotion === "object"
          ? (rawPromotion as any).id
          : rawPromotion;

      return {
        ...rest,
        item: {
          ...rest.item,
          promotion: promotionId || "", // Backend chỉ nhận string ID hoặc rỗng
        },
      };
    });

    // 5. Tạo Payload chuẩn gửi Backend
    const payload = {
      orderType: finalOrderType,

      items: cleanedItems,

      coupons: payloadCoupons,
      vouchers: payloadVouchers,
      totalAmount: subtotal,
      // Nếu pickup, giảm giá vận chuyển coi như = 0
      discountAmount:
        itemDiscount + (fulfillmentType === "pickup" ? 0 : shippingDiscount),
      shippingFee: finalShippingFee,
      grandTotal: finalTotal, // Sử dụng giá trị hiển thị đã tính toán
      payment: {
        method: (paymentMethod === "cod" ? "cash" : "payos") as PaymentMethod,
      },
      surchargeAmount: totalSurcharge,
      shipping: {
        address: {
          _id: selectedAddress?._id || null,
          isDefault: selectedAddress?.isDefault ?? true,
          label: selectedAddress?.label || "Địa chỉ giao hàng",

          // Luôn lấy giá trị mới nhất từ 2 ô Input ở cột phải
          recipientName: name.trim(),
          recipientPhone: phone.trim(),

          fullAddress: selectedAddress?.fullAddress || "",

          // Các trường bắt buộc theo Joi Schema
          street: selectedAddress?.street || "",
          ward: selectedAddress?.ward || "",
          district: selectedAddress?.district || "",
          city: selectedAddress?.city || "",

          // GeoJSON Point
          location: selectedAddress?.location,
        },
      },
      deliveryTime: deliveryTimePayload,
      note: note && note.trim(),
    };

    try {
      setLoading(true);
      // @ts-ignore
      const result = await orderService.customerOrder(payload);

      if (paymentMethod === "bank" && result.qrInfo?.checkoutUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = result.qrInfo.checkoutUrl;
      } else {
        toast.success("Đơn hàng đã tạo thành công!");
        clearCart();
        router.push("/menu");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Lỗi đặt hàng.");
    } finally {
      setLoading(false);
    }
  };

  const renderPriceHeader = (item: CartLine) => {
    if (item.itemType === "Product") {
      const optionsPrice = Object.values(item.options || {})
        .flat()
        .reduce((a, b) => a + b.priceModifier, 0);
      return (
        <p className="text-sm font-medium text-primary-600">
          {formatPrice(Math.max(0, item.totalPrice - optionsPrice))}
        </p>
      );
    }
    return (
      <p className="text-sm font-medium text-primary-600">
        {formatPrice(item.totalPrice)}
      </p>
    );
  };

  const shouldShowNote = (config: DealOptionConfig) => {
    if (!config || !config.activeNote || !config.note) return false;

    if (config.showNoteWhen === "always") return true;
    if (config.showNoteWhen === "on" && config.value === true) return true;
    if (config.showNoteWhen === "off" && config.value === false) return true;

    return false;
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#3b2f26] px-4 py-8 flex justify-center font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Order Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" /> Chi tiết
                đơn hàng
              </h2>
              <button
                onClick={() => router.push("/menu")}
                className="text-sm hover:text-[#b9915f]"
              >
                ← Quay lại thực đơn
              </button>
            </div>

            <div className="divide-y">
              {cartItems.map((it) => (
                <div key={it.cartId} className="py-4 flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                    <SmartImage src={it._image} className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-800">
                        {it.item.name}
                      </h3>
                      <span className="font-bold text-gray-900">
                        {(it.totalPrice * it.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>SL: {it.quantity}</span>
                      <span>x</span>
                      {renderPriceHeader(it)}
                    </div>
                    <div className="mt-2 text-gray-600">
                      {it.itemType === "Product" && (
                        <RenderSelectedOptions options={it.options} />
                      )}
                      {it.itemType === "Combo" &&
                        (it.comboSelections || []).map((s, i) => (
                          <div key={i} className="ml-3 text-xs text-gray-500">
                            - {s.product.name}
                          </div>
                        ))}
                    </div>
                    {it.note && (
                      <div className="mt-1 w-fit max-w-full text-xs bg-blue-50 p-1 text-blue-700 rounded italic">
                        {it.note}
                      </div>
                    )}
                    {it.promotionWarning && (
                      <div className="flex items-start gap-1.5 text-xs text-orange-700 px-2 py-1.5">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        <span>{it.promotionWarning}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {giftLines.map((gift, idx) => (
                <div
                  key={`gift-${idx}`}
                  className="flex gap-4 py-4 border-b border-gray-100 bg-purple-50/50 px-4 rounded-lg -mx-4"
                >
                  {/* Ảnh quà tặng */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-purple-100">
                    {/* Bạn có thể thay src bằng gift.image hoặc placeholder */}
                    <SmartImage
                      src={gift.image}
                      width={56}
                      height={56}
                      className="object-cover rounded-md opacity-90 grayscale-[0.2]"
                    />
                    <div className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-tl-md">
                      <Gift size={10} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          <span
                            className={`mr-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                              gift.price === 0
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {gift.price === 0 ? "QUÀ TẶNG" : "ƯU ĐÃI"}
                          </span>
                          {gift.name}
                        </h3>

                        {/* Giá tiền */}
                        <p
                          className={`text-sm font-medium ${
                            gift.price === 0
                              ? "text-purple-600"
                              : "text-gray-900"
                          }`}
                        >
                          {gift.price === 0
                            ? "0đ"
                            : `${gift.price.toLocaleString("vi-VN")}đ`}
                        </p>
                      </div>

                      {/* Thông tin phụ */}
                      <div className="mt-1 flex items-end justify-between">
                        <p className="text-sm text-gray-500">
                          SL: {gift.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Summary & Action (4 cols) */}
        <div className="lg:col-span-4 bg-white text-sm border border-black/10 rounded-xl shadow-sm p-6 space-y-4 h-fit">
          {/* --- FULFILLMENT TABS (SWITCHER) --- */}
          {/* Chỉ hiện nếu settings đã load và có ít nhất 1 option BẬT */}
          {!loadingSetting &&
            (settings.homeDelivery?.value || settings.storePickup?.value) && (
              <div className="flex p-1 bg-gray-100 rounded-lg mb-2">
                {settings.homeDelivery?.value && (
                  <button
                    onClick={() => setFulfillmentType("delivery")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
                      fulfillmentType === "delivery"
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Bike size={16} /> Giao hàng
                  </button>
                )}

                {settings.storePickup?.value && (
                  <button
                    onClick={() => setFulfillmentType("pickup")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
                      fulfillmentType === "pickup"
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Store size={16} /> Mang về
                  </button>
                )}
              </div>
            )}

          {/* Warning notes cho Tabs */}
          {fulfillmentType === "delivery" &&
            shouldShowNote(settings?.homeDelivery) && (
              <div className="text-xs text-blue-600 italic px-1">
                {settings?.homeDelivery?.note}
              </div>
            )}
          {fulfillmentType === "pickup" &&
            shouldShowNote(settings?.storePickup) && (
              <div className="text-xs text-blue-600 italic px-1">
                {settings?.storePickup?.note}
              </div>
            )}

          {/* --- ADDRESS SECTION (Chỉ hiện khi Delivery) --- */}
          {fulfillmentType === "delivery" && (
            <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm flex items-center gap-1.5 text-gray-600">
                  <MapPin size={16} /> Địa chỉ giao hàng
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Thay đổi
                </button>
              </div>
              {selectedAddress ? (
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedAddress.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {selectedAddress.fullAddress}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-yellow-600">
                  Vui lòng thiết lập địa chỉ để đặt hàng!
                </p>
              )}
            </div>
          )}

          {/* Form Info */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Tên người nhận</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#b9915f]"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Số điện thoại</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-[#b9915f]"
              />
            </div>
          </div>

          {/* Delivery Time Section */}
          <div className="space-y-4">
            {/* ======================= 1. SECTION GIAO HÀNG ======================= */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-600 mb-4 flex item-centers gap-2">
                <Clock size={18} className="text-blue-600" />
                Thời gian giao hàng
              </h4>

              {/* Trường hợp A: Có ít nhất 1 phương thức được BẬT -> Hiện Box chọn */}
              {settings?.fastDelivery?.value ||
              settings?.scheduledDelivery?.value ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm transition-all">
                  <div className="space-y-4">
                    {/* --- Option 1: Giao nhanh (Khi BẬT) --- */}
                    {settings.fastDelivery?.value && (
                      <div
                        className={`flex flex-col gap-1 ${
                          isRestrictedTime ? "opacity-60" : ""
                        }`}
                      >
                        {" "}
                        <label
                          className={`flex items-center gap-3 cursor-pointer group ${
                            isRestrictedTime ? "cursor-not-allowed" : ""
                          }`}
                        >
                          {" "}
                          <input
                            type="radio"
                            name="delivery"
                            disabled={isRestrictedTime}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            checked={deliveryOption === "immediate"}
                            onChange={() =>
                              !isRestrictedTime &&
                              setDeliveryOption("immediate")
                            }
                          />
                          <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                            Giao nhanh ngay
                            {isRestrictedTime && (
                              <span className="text-red-500 text-xs ml-2 font-normal">
                                (Tạm đóng)
                              </span>
                            )}
                          </span>
                        </label>
                        {/* 🔥 Hiển thị thông báo lý do bị đóng */}
                        {isRestrictedTime && (
                          <p className="ml-7 text-sm text-yellow-600 leading-relaxed">
                            Tính năng giao ngay chỉ hoạt động từ 07:30 đến
                            21:00.
                          </p>
                        )}
                        {/* Note gốc từ setting (chỉ hiện nếu chưa có thông báo trên để đỡ rối) */}
                        {!isRestrictedTime &&
                          shouldShowNote(settings.fastDelivery) && (
                            <p className="ml-7 text-xs text-blue-600 italic leading-relaxed">
                              * {settings.fastDelivery.note}
                            </p>
                          )}
                      </div>
                    )}

                    {/* --- Option 2: Hẹn giờ (Khi BẬT) --- */}
                    {settings.scheduledDelivery?.value && (
                      <div
                        className={`flex flex-col gap-1 ${
                          settings.fastDelivery?.value
                            ? "border-t border-blue-100 pt-3"
                            : ""
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="delivery"
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            checked={deliveryOption === "scheduled"}
                            onChange={() => setDeliveryOption("scheduled")}
                          />
                          <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                            Hẹn giờ nhận hàng
                          </span>
                        </label>

                        {/* Note con của Hẹn giờ */}
                        {shouldShowNote(settings.scheduledDelivery) && (
                          <p className="ml-7 text-xs text-blue-600 italic leading-relaxed">
                            * {settings.scheduledDelivery.note}
                          </p>
                        )}

                        {/* Form DatePicker */}
                        {deliveryOption === "scheduled" && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-down">
                            <div>
                              <label className="block text-[11px] font-bold text-blue-700 mb-1">
                                Chọn ngày
                              </label>
                              <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) =>
                                  setScheduledDate(e.target.value)
                                }
                                className="w-full border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-blue-700 mb-1">
                                Chọn khung giờ
                              </label>
                              <select
                                value={selectedTimeSlot}
                                onChange={(e) =>
                                  setSelectedTimeSlot(e.target.value)
                                }
                                className="w-full border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">-- Khung giờ --</option>
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
                    )}
                  </div>
                </div>
              ) : (
                /* Trường hợp B: Cả 2 đều TẮT -> Hiện Box báo bảo trì chung */
                <div className="p-4 bg-orange-50 text-orange-700 text-sm rounded-xl border border-orange-200 flex items-center gap-3">
                  <p>
                    Hiện tại dịch vụ giao hàng đang tạm dừng hoạt động. Vui lòng
                    liên hệ hotline để được hỗ trợ nhanh nhất.
                  </p>
                </div>
              )}

              {/* Trường hợp C: Các Note hiển thị khi Option bị TẮT (Giải thích lý do) */}
              {!settings?.fastDelivery?.value &&
                settings?.scheduledDelivery?.value &&
                shouldShowNote(settings?.fastDelivery) && (
                  <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-yellow-600 flex gap-2 items-start">
                    <span>{settings.fastDelivery.note}</span>
                  </div>
                )}

              {!settings?.scheduledDelivery?.value &&
                settings?.fastDelivery?.value &&
                shouldShowNote(settings?.scheduledDelivery) && (
                  <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-yellow-600 flex gap-2 items-start">
                    <span>{settings.scheduledDelivery.note}</span>
                  </div>
                )}
            </div>

            {/* ======================= 2. SECTION THANH TOÁN ======================= */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-600 mb-4 flex item-centers gap-2">
                <Banknote size={20} className="text-green-600" />
                Phương thức thanh toán
              </h4>

              {/* Trường hợp A: Có ít nhất 1 phương thức BẬT */}
              {settings?.cashPayment?.value || settings?.bankTransfer?.value ? (
                <div className="space-y-4">
                  {/* --- Option 1: Tiền mặt (Khi BẬT) --- */}
                  {settings.cashPayment?.value && (
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">
                          Tiền mặt (COD)
                        </span>
                      </label>
                      {shouldShowNote(settings.cashPayment) && (
                        <p className="ml-4 text-xs text-gray-500 italic">
                          * {settings.cashPayment.note}
                        </p>
                      )}
                    </div>
                  )}

                  {/* --- Option 2: Chuyển khoản (Khi BẬT) --- */}
                  {settings.bankTransfer?.value && (
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMethod === "bank"}
                          onChange={() => setPaymentMethod("bank")}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">
                          Chuyển khoản Ngân hàng / QR
                        </span>
                      </label>
                      {/* Note dạng STK nổi bật hơn */}
                      {shouldShowNote(settings.bankTransfer) && (
                        <div className="ml-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-xs text-yellow-800 leading-relaxed">
                          {settings.bankTransfer.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Trường hợp B: Cả 2 đều TẮT -> Báo bảo trì */
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                  <span>
                    Hiện tại các phương thức thanh toán đang bảo trì. Vui lòng
                    liên hệ hotline để được hỗ trợ nhanh nhất.
                  </span>
                </div>
              )}

              {/* Trường hợp C: Các Note hiển thị khi Option bị TẮT */}
              <div className="space-y-2 mt-3">
                {!settings?.cashPayment?.value &&
                  settings?.bankTransfer?.value &&
                  shouldShowNote(settings?.cashPayment) && (
                    <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600 italic">
                      {settings.cashPayment.note}
                    </div>
                  )}

                {!settings?.bankTransfer?.value &&
                  settings?.cashPayment?.value &&
                  shouldShowNote(settings?.bankTransfer) && (
                    <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600 italic">
                      {settings.bankTransfer.note}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="font-semibold mb-1 block">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border p-2 rounded h-16 text-sm"
              placeholder="Lời nhắn cho quán..."
            />
          </div>

          {/* Bill Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                Phí vận chuyển{" "}
                {isCalculatingShip && (
                  <Loader2 size={12} className="animate-spin" />
                )}
              </span>
              <span>{displayShippingFee.toLocaleString("vi-VN")}đ</span>
            </div>

            {totalSurcharge > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-gray-600">
                  <div className="group relative flex items-center gap-1 cursor-help">
                    <span className="border-b border-dotted border-gray-400">
                      Phụ thu dịch vụ
                    </span>
                    <Info size={14} className="text-gray-400" />

                    {/* Tooltip khi hover */}
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-white border border-primary-100 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[11px] font-bold racking-wider">
                        Chi tiết phụ thu
                      </p>
                      {surcharges.map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between items-start gap-2 py-1 border-b border-primary-50 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-[11px]">
                              {s.name}
                            </p>
                            <p className="text-[11px] text-gray-500 leading-tight">
                              {s.description}
                            </p>
                          </div>
                          <span className="font-bold text-primary-600 text-[11px]">
                            +{s.cost.toLocaleString()}đ
                          </span>
                        </div>
                      ))}
                      <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
                    </div>
                  </div>
                  <span className="text-primary-600 font-medium">
                    +{totalSurcharge.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            )}

            {/* Coupon Display */}
            {appliedCoupons.length > 0 && (
              <div className="py-2 border-y border-dashed bg-orange-50 -mx-6 px-6 space-y-1">
                {appliedCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between text-sm text-orange-700"
                  >
                    <span className="flex items-center gap-1">
                      <Ticket size={12} /> {c.code}
                    </span>
                    <span className="font-medium">
                      {c.type === "freeship"
                        ? `-${shippingDiscount.toLocaleString("vi-VN")}đ`
                        : `-${itemDiscount.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between border-t pt-2 mt-1 font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-[#b9915f]">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition ${
              loading ? "bg-gray-400" : "bg-[#b9915f] hover:bg-[#9a7e4e]"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              `Đặt hàng • ${finalTotal.toLocaleString("vi-VN")}đ`
            )}
          </button>
        </div>
      </div>

      {/* DRAWER THIẾT LẬP ĐỊA CHỈ (Kéo từ phải qua) */}
      <Transition.Root show={isAddressModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={setIsAddressModalOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="px-4 py-6 sm:px-6 border-b">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-bold text-gray-900">
                            Thiết lập địa chỉ giao hàng
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                              onClick={() => setIsAddressModalOpen(false)}
                            >
                              <X size={24} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="relative flex-1">
                        {/* HereMapPicker component đã có sẵn thiết kế của bạn */}
                        <HereMapPicker
                          onLocationSelect={handleLocationSelect}
                          initialAddress={selectedAddress?.fullAddress}
                        />

                        <div className="px-4 py-4 bg-gray-50 border-t mt-auto">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ đã chọn:
                          </p>
                          <p
                            className={`text-xs mb-4 ${
                              tempAddress
                                ? "text-gray-900"
                                : "text-gray-400 italic"
                            }`}
                          >
                            {tempAddress?.fullAddress ||
                              "Vui lòng chọn một điểm trên bản đồ..."}
                          </p>
                          <ButtonPrimary
                            className={`w-full ${
                              !tempAddress
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={confirmAddress}
                            disabled={!tempAddress} // Vô hiệu hóa nút nếu chưa có địa chỉ
                          >
                            Xác nhận địa chỉ này
                          </ButtonPrimary>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
