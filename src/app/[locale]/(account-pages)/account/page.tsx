"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Camera,
  Loader,
} from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import { customerService } from "@/services";
import {
  CustomerForm,
  CustomerAddress,
  CustomerEmail,
  CustomerPhone,
  UpdateCustomerInput,
} from "@/types";

import { toast } from "sonner";
import Input from "@/shared/Input";
import Label from "@/components/Label";

// DYNAMIC IMPORT CHO MAP COMPONENT (Bắt buộc để tránh lỗi SSR)
import dynamic from "next/dynamic";
const HereMapPicker = dynamic(() => import("@/components/HereMapPicker"), {
  ssr: false,
});

//
// ───────────────────────────────────────────────────────────
//  HELPERS
// ───────────────────────────────────────────────────────────
//

// Format ISO date → input[type=date]
const formatDateForInput = (value?: string) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

// Pick primary email
const getPrimaryEmail = (emails: CustomerEmail[]) =>
  emails.find((e) => e.isPrimary)?.value || emails[0]?.value || "";

// Pick primary phone
const getPrimaryPhone = (phones: CustomerPhone[]) =>
  phones.find((e) => e.isPrimary)?.value || phones[0]?.value || "";

//
// ───────────────────────────────────────────────────────────
//  ADDRESS TYPES & INITIAL STATE
// ───────────────────────────────────────────────────────────
//

// Backend: coordinates: [lng, lat]
const DEFAULT_COORDINATES: [number, number] = [
  105.82773355762369, 21.01951647163857,
]; // [lng, lat] mặc định

// Kiểu dữ liệu local cho form address (giống CustomerAddress nhưng đảm bảo location tồn tại)
type NewAddressState = Omit<
  CustomerAddress,
  "isDefault" | "fullAddress" | "location"
> & {
  location: { coordinates: [number, number]; type: "Point" }; // Chính xác: [lng, lat]
  fullAddressFromMap: string;
};

// Hàm khởi tạo địa chỉ mới
const initialNewAddressState: NewAddressState = {
  label: "",
  recipientName: "",
  recipientPhone: "",
  street: "", // Chi tiết (Số nhà, Tên tòa nhà)
  ward: "",
  district: "",
  city: "",
  location: {
    type: "Point",
    coordinates: DEFAULT_COORDINATES,
  },
  fullAddressFromMap: "",
};

//
// ───────────────────────────────────────────────────────────
//  MAIN PAGE
// ───────────────────────────────────────────────────────────
//

const AccountPage = () => {
  const { me, fetchUser } = useAuthStore();

  const [customerData, setCustomerData] = useState<CustomerForm>({
    name: "",
    gender: "male",
    birthDate: "",
    addresses: [],
    emails: [],
    phones: [],
    primaryEmail: "",
    primaryPhone: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">(
    "profile"
  );

  // NEW EMAIL / PHONE FORM STATE (GIỮ NGUYÊN)
  const [newEmail, setNewEmail] = useState("");
  const [newEmailType, setNewEmailType] = useState<
    "Home" | "Company" | "Other"
  >("Other");

  const [newPhone, setNewPhone] = useState("");
  const [newPhoneType, setNewPhoneType] = useState<
    "Home" | "Company" | "Other"
  >("Other");

  // ADDRESS FORM STATE
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );

  const [newAddress, setNewAddress] = useState<NewAddressState>(
    initialNewAddressState
  );

  //
  // ───────────────────────────────────────────
  //  FETCH USER & PREFILL (GIỮ NGUYÊN)
  // ───────────────────────────────────────────
  //
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      await fetchUser();
      const profile = useAuthStore.getState().me;

      if (profile) {
        setCustomerData({
          name: profile.name,
          gender: profile.gender ?? "other",
          birthDate: formatDateForInput(profile.birthDate),
          addresses: profile.addresses ?? [],
          emails: profile.emails ?? [],
          phones: profile.phones ?? [],
          primaryEmail: getPrimaryEmail(profile.emails ?? []),
          primaryPhone: getPrimaryPhone(profile.phones ?? []),
        });
      }

      setIsLoading(false);
    })();
  }, [fetchUser]);

  //
  // ───────────────────────────────────────────
  //  HANDLE BASIC FORM INPUT (GIỮ NGUYÊN)
  // ───────────────────────────────────────────
  //
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  //
  // ───────────────────────────────────────────
  //  EMAIL HANDLERS (GIỮ NGUYÊN)
  // ───────────────────────────────────────────
  //
  const handleAddEmail = () => {
    if (!newEmail) return toast.error("Vui lòng nhập email");

    const exists = customerData.emails.some((e) => e.value === newEmail);
    if (exists) return toast.error("Email đã tồn tại");

    const item: CustomerEmail = {
      type: newEmailType,
      value: newEmail,
      isPrimary: customerData.emails.length === 0,
    };

    setCustomerData((prev) => ({
      ...prev,
      emails: [...prev.emails, item],
      primaryEmail: item.isPrimary ? newEmail : prev.primaryEmail,
    }));

    setNewEmail("");
    toast.success("Đã thêm email");
  };

  const handleDeleteEmail = (value: string) => {
    const remaining = customerData.emails.filter((e) => e.value !== value);

    if (!remaining.find((e) => e.isPrimary) && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }

    setCustomerData((prev) => ({
      ...prev,
      emails: remaining,
      primaryEmail: getPrimaryEmail(remaining),
    }));
  };

  const setPrimaryEmailUI = (value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      emails: prev.emails.map((e) => ({
        ...e,
        isPrimary: e.value === value,
      })),
      primaryEmail: value,
    }));
  };

  //
  // ───────────────────────────────────────────
  //  PHONE HANDLERS (GIỮ NGUYÊN)
  // ───────────────────────────────────────────
  //
  const handleAddPhone = () => {
    if (!newPhone) return toast.error("Vui lòng nhập số điện thoại");

    const exists = customerData.phones.some((p) => p.value === newPhone);
    if (exists) return toast.error("Số điện thoại đã tồn tại");

    const item: CustomerPhone = {
      type: newPhoneType,
      value: newPhone,
      isPrimary: customerData.phones.length === 0,
    };

    setCustomerData((prev) => ({
      ...prev,
      phones: [...prev.phones, item],
      primaryPhone: item.isPrimary ? newPhone : prev.primaryPhone,
    }));

    setNewPhone("");
    toast.success("Đã thêm số điện thoại");
  };

  const handleDeletePhone = (value: string) => {
    const remaining = customerData.phones.filter((p) => p.value !== value);

    if (!remaining.find((p) => p.isPrimary) && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }

    setCustomerData((prev) => ({
      ...prev,
      phones: remaining,
      primaryPhone: getPrimaryPhone(remaining),
    }));
  };

  const setPrimaryPhoneUI = (value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      phones: prev.phones.map((p) => ({
        ...p,
        isPrimary: p.value === value,
      })),
      primaryPhone: value,
    }));
  };

  //
  // ───────────────────────────────────────────
  //  MAP/ADDRESS HANDLERS
  // ───────────────────────────────────────────
  //

  // Xử lý dữ liệu từ HereMapPicker: [lat, lng] -> [lng, lat]
  const handleMapSelect = (data: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    console.log("Data", data);
    const { lat, lng, address: fullAddress } = data;

    // CHUYỂN ĐỔI: Map API (lat, lng) -> GeoJSON (lng, lat)
    const coordinates: [number, number] = [lng, lat];

    // Phân tách địa chỉ từ Reverse Geocoding
    const parts = fullAddress
      .split(",")
      .map((p) => p.trim())
      .reverse();

    setNewAddress((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates, // [lng, lat]
      },
      fullAddressFromMap: fullAddress,
      // Cố gắng phân tích các trường địa chỉ chi tiết
      city: parts[1] || "",
      district: parts[2] || "",
      ward: parts[3] || "",
      // Street/Detail sẽ giữ lại các phần còn lại
      street: parts.slice(4).reverse().join(", ") || "",
    }));
  };

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value as any }));
  };

  const handleAddAddress = () => {
    const [lng, lat] = newAddress.location.coordinates;

    // VALIDATION: Kiểm tra Tên, SĐT và Tọa độ
    if (!newAddress.recipientName || !newAddress.recipientPhone || !lat || !lng)
      return toast.error(
        "Vui lòng nhập Tên, SĐT người nhận và chọn vị trí trên bản đồ."
      );

    // Tạo fullAddress cho việc hiển thị (kết hợp chi tiết và địa chỉ từ map)
    const fullAddress = [
      newAddress.street,
      newAddress.ward,
      newAddress.district,
      newAddress.city,
    ]
      .filter(Boolean)
      .join(", ");

    const newObj: CustomerAddress = {
      label: newAddress.label,
      recipientName: newAddress.recipientName,
      recipientPhone: newAddress.recipientPhone,
      street: newAddress.street,
      ward: newAddress.ward,
      district: newAddress.district,
      city: newAddress.city,
      // Dữ liệu GeoJSON gửi lên backend
      location: newAddress.location,
      fullAddress,
      isDefault: customerData.addresses.length === 0,
    } as CustomerAddress;

    if (editingAddressIndex !== null) {
      setCustomerData((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a, i) =>
          i === editingAddressIndex ? newObj : a
        ),
      }));
      setEditingAddressIndex(null);
    } else {
      setCustomerData((prev) => ({
        ...prev,
        addresses: [...prev.addresses, newObj],
      }));
    }

    setShowAddressForm(false);
    setNewAddress(initialNewAddressState);
    toast.success(
      editingAddressIndex !== null
        ? "Cập nhật địa chỉ thành công"
        : "Thêm địa chỉ mới thành công"
    );
  };

  const handleEditAddress = (index: number) => {
    const addr = customerData.addresses[index];

    // Lấy [lng, lat] từ location.coordinates, dùng DEFAULT nếu không có
    const [lng, lat] =
      (addr.location?.coordinates as [number, number]) || DEFAULT_COORDINATES;

    setNewAddress({
      label: addr.label || "",
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
      street: addr.street,
      ward: addr.ward,
      district: addr.district,
      city: addr.city,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      fullAddressFromMap: addr.fullAddress || "",
    });

    setEditingAddressIndex(index);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (index: number) => {
    const remaining = customerData.addresses.filter((_, i) => i !== index);

    // Cập nhật lại mặc định nếu địa chỉ mặc định bị xóa
    if (customerData.addresses[index].isDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }

    setCustomerData((prev) => ({
      ...prev,
      addresses: remaining,
    }));
  };

  const handleSetDefaultAddress = (index: number) => {
    setCustomerData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a, i) => ({
        ...a,
        isDefault: i === index,
      })),
    }));
  };

  //
  // ───────────────────────────────────────────
  //  SUBMIT UPDATE PROFILE (GIỮ NGUYÊN)
  // ───────────────────────────────────────────
  //
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload: UpdateCustomerInput = {
        name: customerData.name,
        gender: customerData.gender,
        birthDate: customerData.birthDate || undefined,
        addresses: customerData.addresses,
        emails: customerData.emails,
        phones: customerData.phones,
      };

      await customerService.updateProfile(payload);
      await fetchUser();

      toast.success("Cập nhật thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
    setIsSaving(false);
  };

  //
  // ───────────────────────────────────────────
  //  UI
  // ───────────────────────────────────────────
  //

  // Lấy lat/lng cho Map Picker: GeoJSON [lng, lat] -> Map API (lat, lng)
  const [lng, lat] = newAddress.location.coordinates;
  const initialMapLat = lat;
  const initialMapLng = lng;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-72">
        <Loader className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Thông tin tài khoản</h1>
          <p className="text-sm text-gray-600">
            Quản lý thông tin cá nhân và địa chỉ.
          </p>
        </div>

        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
          {customerData.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white shadow-sm border rounded-lg">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-3 font-medium ${
              activeTab === "profile"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600"
            }`}
          >
            Hồ sơ
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex-1 px-4 py-3 font-medium ${
              activeTab === "addresses"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600"
            }`}
          >
            Địa chỉ ({customerData.addresses.length})
          </button>
        </div>

        <div className="p-6">
          {/* PROFILE TAB (GIỮ NGUYÊN) */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium">Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Birthdate */}
              <div>
                <label className="block text-sm font-medium">Ngày sinh</label>
                <input
                  type="date"
                  name="birthDate"
                  value={customerData.birthDate}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium">Giới tính</label>
                <select
                  name="gender"
                  value={customerData.gender}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* EMAILS */}
              <div className="space-y-3">
                <label className="font-semibold">Emails</label>

                {customerData.emails.map((email, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{email.value}</p>
                      <p className="text-xs text-gray-500">{email.type}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!email.isPrimary ? (
                        <>
                          <button
                            onClick={() => setPrimaryEmailUI(email.value)}
                            className="text-orange-600 text-sm"
                          >
                            Chọn làm chính
                          </button>
                          <button
                            onClick={() => handleDeleteEmail(email.value)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs">
                          Chính
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add email */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="email"
                    placeholder="Nhập email phụ"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={newEmailType}
                    onChange={(e) => setNewEmailType(e.target.value as any)}
                    className="px-2 border rounded-lg"
                  >
                    <option value="Home">Nhà riêng</option>
                    <option value="Company">Văn phòng</option>
                    <option value="Other">Khác</option>
                  </select>
                  <button
                    onClick={handleAddEmail}
                    className="px-4 bg-orange-600 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* PHONES */}
              <div className="space-y-3">
                <label className="font-semibold">Số điện thoại</label>

                {customerData.phones.map((phone, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{phone.value}</p>
                      <p className="text-xs text-gray-500">{phone.type}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!phone.isPrimary ? (
                        <>
                          <button
                            onClick={() => setPrimaryPhoneUI(phone.value)}
                            className="text-orange-600 text-sm"
                          >
                            Chọn làm chính
                          </button>
                          <button
                            onClick={() => handleDeletePhone(phone.value)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs">
                          Chính
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add phone */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="tel"
                    placeholder="Nhập số phụ"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={newPhoneType}
                    onChange={(e) => setNewPhoneType(e.target.value as any)}
                    className="px-2 border rounded-lg"
                  >
                    <option value="Home">Nhà riêng</option>
                    <option value="Company">Văn phòng</option>
                    <option value="Other">Khác</option>
                  </select>
                  <button
                    onClick={handleAddPhone}
                    className="px-4 bg-orange-600 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-5 py-2 bg-orange-600 text-white rounded-lg"
                >
                  {isSaving ? (
                    <Loader className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === "addresses" && (
            <div className="space-y-5">
              {/* LIST */}
              {customerData.addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="border p-4 rounded-lg flex justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {addr.label || "Địa chỉ"}{" "}
                      {addr.isDefault && (
                        <span className="text-orange-600 text-xs">
                          (Mặc định)
                        </span>
                      )}
                    </p>
                    <p>{addr.recipientName}</p>
                    <p>{addr.recipientPhone}</p>
                    <p className="text-gray-600">{addr.fullAddress}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleEditAddress(idx)}
                      className="text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(idx)}
                        className="text-orange-600 text-xs"
                      >
                        Chọn mặc định
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* BUTTON: ADD ADDRESS */}
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setNewAddress(initialNewAddressState);
                    setEditingAddressIndex(null);
                    setShowAddressForm(true);
                  }}
                  className="w-full py-3 border-dashed border-2 rounded-lg border-gray-300
                             text-gray-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm địa chỉ mới
                </button>
              )}

              {/* ADD/EDIT FORM */}
              {showAddressForm && (
                <div className="border p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold">
                    {editingAddressIndex !== null
                      ? "Sửa địa chỉ"
                      : "Thêm địa chỉ mới"}
                  </h3>

                  <div>
                    <input
                      type="text"
                      name="label"
                      placeholder="Tên địa chỉ (ví dụ: Nhà riêng, Văn phòng)"
                      value={newAddress.label}
                      onChange={handleAddressInput}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {/* Gợi ý điền nhanh */}
                    <div className="flex gap-2 mt-2">
                      {["Nhà riêng", "Văn phòng", "Công ty"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setNewAddress((prev) => ({ ...prev, label: tag }))
                          }
                          className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full border border-gray-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    name="recipientName"
                    placeholder="Tên người nhận"
                    value={newAddress.recipientName}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <input
                    type="tel"
                    name="recipientPhone"
                    placeholder="Số điện thoại"
                    value={newAddress.recipientPhone}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  {/* TÍCH HỢP HERE MAP PICKER */}
                  <HereMapPicker
                    onLocationSelect={handleMapSelect}
                    initialLat={initialMapLat} // Truyền lat
                    initialLng={initialMapLng} // Truyền lng
                    initialAddress={newAddress.fullAddressFromMap}
                  />

                  <h4 className="text-sm font-semibold pt-2 border-t mt-4">
                    Chi tiết địa chỉ (Số nhà, Tên tòa nhà)
                  </h4>
                  <input
                    type="text"
                    name="street"
                    placeholder="Số nhà, tên tòa nhà, tầng (ví dụ: Tầng 5, Landmark 81)"
                    value={newAddress.street}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  {/* Hiển thị các trường Phường/Quận/Thành phố tự động từ Map (Readonly) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Phường/Xã (Tự động)</Label>
                      <Input
                        type="text"
                        name="ward"
                        placeholder="Phường/Xã"
                        value={newAddress.ward}
                        readOnly
                        className="mt-1.5 !bg-gray-100 dark:!bg-gray-800 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label>Quận/Huyện (Tự động)</Label>
                      <Input
                        type="text"
                        name="district"
                        placeholder="Quận/Huyện"
                        value={newAddress.district}
                        readOnly
                        className="mt-1.5 !bg-gray-100 dark:!bg-gray-800 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label>Thành phố (Tự động)</Label>
                      <Input
                        type="text"
                        name="city"
                        placeholder="Thành phố"
                        value={newAddress.city}
                        readOnly
                        className="mt-1.5 !bg-gray-100 dark:!bg-gray-800 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAddAddress}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg"
                    >
                      Lưu thay đổi
                    </button>

                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 bg-gray-200 py-2 rounded-lg"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* SAVE BUTTON */}
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-5 py-2 bg-orange-600 text-white rounded-lg"
                >
                  {isSaving ? (
                    <Loader className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
