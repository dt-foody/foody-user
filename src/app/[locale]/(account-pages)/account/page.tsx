"use client";

import React, { useState, useEffect, useRef } from "react"; // Thêm useRef
import {
  User,
  Mail,
  Phone,
  Plus,
  Trash2,
  X,
  Edit2,
  Loader,
  Info,
  Users,
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
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // Thêm router hooks
import Select from "@/shared/Select";

const HereMapPicker = dynamic(() => import("@/components/HereMapPicker"), {
  ssr: false,
});

const formatDateForInput = (value?: string) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

const getPrimaryEmail = (emails: CustomerEmail[]) =>
  emails.find((e) => e.isPrimary)?.value || emails[0]?.value || "";

const getPrimaryPhone = (phones: CustomerPhone[]) =>
  phones.find((e) => e.isPrimary)?.value || phones[0]?.value || "";

const DEFAULT_COORDINATES: [number, number] = [
  105.82773355762369, 21.01951647163857,
];

type NewAddressState = Omit<
  CustomerAddress,
  "isDefault" | "fullAddress" | "location"
> & {
  location: { coordinates: [number, number]; type: "Point" };
  fullAddressFromMap: string;
};

interface ReferralUser {
  _id: string;
  email: string;
  phone: string;
  name: string;
}

const initialNewAddressState: NewAddressState = {
  label: "",
  recipientName: "",
  recipientPhone: "",
  street: "",
  ward: "",
  district: "",
  city: "",
  location: {
    type: "Point",
    coordinates: DEFAULT_COORDINATES,
  },
  fullAddressFromMap: "",
};

const AccountPage = () => {
  const { me, fetchUser } = useAuthStore();

  // --- FIX 1: QUẢN LÝ TAB BẰNG URL ---
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const redirectUri = searchParams.get("redirect_uri");

  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "addresses" ? "addresses" : "profile";

  const handleSwitchTab = (tab: "profile" | "addresses") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

  // Email/Phone State (Giữ nguyên)
  const [newEmail, setNewEmail] = useState("");
  const [newEmailType, setNewEmailType] = useState<
    "Home" | "Company" | "Other"
  >("Other");
  const [newPhone, setNewPhone] = useState("");
  const [newPhoneType, setNewPhoneType] = useState<
    "Home" | "Company" | "Other"
  >("Other");

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );
  const [newAddress, setNewAddress] = useState<NewAddressState>(
    initialNewAddressState
  );

  const addressFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchUser();
      const { me: profile } = useAuthStore.getState();

      // const profile = useAuthStore.getState().me;
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

  // Cuộn xuống form khi mở form
  useEffect(() => {
    if (showAddressForm && addressFormRef.current) {
      addressFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showAddressForm]);

  // ... (Giữ nguyên logic handleFormChange, handleAddEmail/Phone...)
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

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
    if (!remaining.find((e) => e.isPrimary) && remaining.length > 0)
      remaining[0].isPrimary = true;
    setCustomerData((prev) => ({
      ...prev,
      emails: remaining,
      primaryEmail: getPrimaryEmail(remaining),
    }));
  };

  const setPrimaryEmailUI = (value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      emails: prev.emails.map((e) => ({ ...e, isPrimary: e.value === value })),
      primaryEmail: value,
    }));
  };

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
    if (!remaining.find((p) => p.isPrimary) && remaining.length > 0)
      remaining[0].isPrimary = true;
    setCustomerData((prev) => ({
      ...prev,
      phones: remaining,
      primaryPhone: getPrimaryPhone(remaining),
    }));
  };

  const setPrimaryPhoneUI = (value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      phones: prev.phones.map((p) => ({ ...p, isPrimary: p.value === value })),
      primaryPhone: value,
    }));
  };

  // --- MAP HANDLERS ---

  const handleMapSelect = (data: {
    lat: number;
    lng: number;
    address: string;
    // Nhận thêm các trường đã được HereMapPicker tách sẵn
    houseNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  }) => {
    const {
      lat,
      lng,
      address: fullAddress,
      houseNumber,
      street,
      ward,
      district,
      city,
    } = data;

    const coordinates: [number, number] = [lng, lat];

    // --- CẬP NHẬT AN TOÀN: Dùng trực tiếp dữ liệu từ HERE Maps ---
    setNewAddress((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates,
      },
      fullAddressFromMap: fullAddress,

      // Gán trực tiếp các trường hành chính, HereMapPicker đã lo phần phân tách
      city: city || "", // Cấp Tỉnh/Thành phố (Đà Nẵng, Hà Nội...)
      district: district || "", // Cấp Quận/Huyện (Quận Liên Chiểu, Đống Đa...)
      ward: ward || "", // Cấp Phường/Xã (Phường Hòa Khánh Bắc...)

      // Tên đường có thể kết hợp thêm số nhà nếu có
      street: houseNumber ? `${houseNumber} ${street}`.trim() : street || "",
    }));
  };

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = () => {
    const [lng, lat] = newAddress.location.coordinates;

    if (!newAddress.recipientName || !newAddress.recipientPhone || !lat || !lng)
      return toast.error("Vui lòng nhập Tên, SĐT và chọn vị trí trên bản đồ.");

    const fullAddress = [
      newAddress.street,
      newAddress.ward,
      newAddress.district,
      newAddress.city,
    ]
      .filter(Boolean)
      .join(", ");

    const newObj: CustomerAddress = {
      label: newAddress.label || "Nhà riêng",
      recipientName: newAddress.recipientName,
      recipientPhone: newAddress.recipientPhone,
      street: newAddress.street,
      ward: newAddress.ward,
      district: newAddress.district,
      city: newAddress.city,
      location: newAddress.location,
      fullAddress,
      isDefault: customerData.addresses.length === 0, // Nếu chưa có địa chỉ nào thì cái này là default
    };

    if (editingAddressIndex !== null) {
      setCustomerData((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a, i) =>
          i === editingAddressIndex ? { ...newObj, isDefault: a.isDefault } : a
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
        ? "Cập nhật thành công"
        : "Thêm mới thành công"
    );
  };

  const handleEditAddress = (index: number) => {
    const addr = customerData.addresses[index];
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
      location: { type: "Point", coordinates: [lng, lat] },
      fullAddressFromMap: addr.fullAddress || "",
    });

    setEditingAddressIndex(index);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (index: number) => {
    if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      const remaining = customerData.addresses.filter((_, i) => i !== index);
      if (customerData.addresses[index].isDefault && remaining.length > 0)
        remaining[0].isDefault = true;
      setCustomerData((prev) => ({ ...prev, addresses: remaining }));
    }
  };

  const handleSetDefaultAddress = (index: number) => {
    setCustomerData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a, i) => ({
        ...a,
        isDefault: i === index,
      })),
    }));
    toast.success("Đã đặt làm địa chỉ mặc định");
  };

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
      toast.success("Cập nhật hồ sơ thành công!");

      if (redirectUri) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push(redirectUri);
      }
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    }
    setIsSaving(false);
  };

  // --- UI RENDER ---

  const [lng, lat] = newAddress.location.coordinates;

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
            Quản lý thông tin cá nhân và sổ địa chỉ.
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xl uppercase">
          {customerData.name?.[0] || <User />}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white shadow-sm border rounded-lg">
        <div className="flex border-b">
          <button
            onClick={() => handleSwitchTab("profile")}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-primary-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Hồ sơ
          </button>
          <button
            onClick={() => handleSwitchTab("addresses")}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === "addresses"
                ? "border-b-2 border-primary-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Địa chỉ ({customerData.addresses.length})
          </button>
        </div>

        <div className="p-6">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Inputs... (Giữ nguyên phần này) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Họ và tên</Label>
                  <Input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleFormChange}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    name="birthDate"
                    value={customerData.birthDate}
                    onChange={handleFormChange}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label>Giới tính</Label>
                  <Select
                    name="gender"
                    value={customerData.gender}
                    onChange={handleFormChange}
                    className="w-full mt-1"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </Select>
                </div>
              </div>

              {/* EMAILS & PHONES SECTION (GIỮ NGUYÊN LOGIC CŨ, CHỈ TỐI ƯU UI NẾU CẦN) */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Emails
                </h3>
                {customerData.emails.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded border"
                  >
                    <div>
                      <p className="font-medium text-sm">{email.value}</p>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {email.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {email.isPrimary ? (
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Mặc định
                        </span>
                      ) : (
                        <button
                          onClick={() => setPrimaryEmailUI(email.value)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Đặt làm chính
                        </button>
                      )}
                      {!email.isPrimary && (
                        <button
                          onClick={() => handleDeleteEmail(email.value)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Thêm email mới..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Select
                    value={newEmailType}
                    onChange={(e) => setNewEmailType(e.target.value as any)}
                    className="w-[120px]"
                  >
                    <option value="Home">Nhà riêng</option>
                    <option value="Company">Công ty</option>
                    <option value="Other">Khác</option>
                  </Select>
                  <button
                    onClick={handleAddEmail}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Số điện thoại
                </h3>
                {customerData.phones.map((phone, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded border"
                  >
                    <div>
                      <p className="font-medium text-sm">{phone.value}</p>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {phone.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {phone.isPrimary ? (
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Mặc định
                        </span>
                      ) : (
                        <button
                          onClick={() => setPrimaryPhoneUI(phone.value)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Đặt làm chính
                        </button>
                      )}
                      {!phone.isPrimary && (
                        <button
                          onClick={() => handleDeletePhone(phone.value)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="Thêm SĐT mới..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <Select
                    value={newPhoneType}
                    onChange={(e) => setNewPhoneType(e.target.value as any)}
                    className="w-[120px]"
                  >
                    <option value="Home">Nhà riêng</option>
                    <option value="Company">Công ty</option>
                    <option value="Other">Khác</option>
                  </Select>
                  <button
                    onClick={handleAddPhone}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t flex items-center justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center justify-end gap-2"
                >
                  {isSaving ? (
                    <Loader className="w-5 h-5 animate-spin" />
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
              {customerData.addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className={`border p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 ${
                    addr.isDefault
                      ? "border-orange-200 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">
                        {addr.recipientName}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">
                        {addr.recipientPhone}
                      </span>
                      {addr.isDefault && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          Mặc định
                        </span>
                      )}
                      {addr.label && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {addr.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{addr.street}</p>
                    <p className="text-sm text-gray-500">
                      {[addr.ward, addr.district, addr.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <button
                      onClick={() => handleEditAddress(idx)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(idx)}
                        className="text-sm text-orange-600 hover:underline mt-2 md:mt-0"
                      >
                        Đặt mặc định
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {!showAddressForm && (
                <button
                  onClick={() => {
                    setNewAddress(initialNewAddressState);
                    setEditingAddressIndex(null);
                    setShowAddressForm(true);
                  }}
                  className="w-full py-4 border-dashed border-2 rounded-lg border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" /> Thêm địa chỉ mới
                </button>
              )}

              {/* FORM ADDRESS */}
              {showAddressForm && (
                <div
                  ref={addressFormRef}
                  className="border border-orange-200 bg-white shadow-lg p-5 rounded-lg space-y-4 animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-semibold text-lg">
                      {editingAddressIndex !== null
                        ? "Cập nhật địa chỉ"
                        : "Thêm địa chỉ mới"}
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Họ tên người nhận</Label>
                      <Input
                        type="text"
                        name="recipientName"
                        value={newAddress.recipientName}
                        onChange={handleAddressInput}
                        className="mt-1"
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <Label>Số điện thoại</Label>
                      <Input
                        type="tel"
                        name="recipientPhone"
                        value={newAddress.recipientPhone}
                        onChange={handleAddressInput}
                        className="mt-1"
                        placeholder="VD: 0987..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Nhãn địa chỉ (Tùy chọn)</Label>
                    <div className="flex gap-2 mt-1 mb-2">
                      {["Nhà riêng", "Văn phòng"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setNewAddress((prev) => ({ ...prev, label: tag }))
                          }
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            newAddress.label === tag
                              ? "bg-orange-100 border-orange-300 text-orange-700"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <Input
                      type="text"
                      name="label"
                      value={newAddress.label}
                      onChange={handleAddressInput}
                      className="mt-1"
                      placeholder="VD: Nhà riêng"
                    />
                  </div>

                  {/* MAP PICKER */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b text-sm font-medium text-gray-700">
                      Chọn vị trí trên bản đồ
                    </div>
                    <div className="w-full relative">
                      <HereMapPicker
                        onLocationSelect={handleMapSelect}
                        initialLat={lat}
                        initialLng={lng}
                        initialAddress={newAddress.fullAddressFromMap}
                      />
                    </div>
                  </div>

                  {/* GHI CHÚ TỰ ĐỘNG ĐIỀN */}
                  <div className="mt-3 flex items-start gap-2 bg-[#fff9e9] border border-blue-100 p-3 rounded-lg text-sm text-black">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Thông tin{" "}
                      <strong>Tỉnh/Thành, Quận/Huyện, Phường/Xã</strong> sẽ được
                      tự động điền dựa trên vị trí bạn chọn trên bản đồ. Vui
                      lòng di chuyển ghim đỏ để lấy địa chỉ chính xác.
                    </p>
                  </div>

                  {/* READONLY FIELDS */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Tỉnh/TP</Label>
                      <Input
                        readOnly
                        value={newAddress.city}
                        placeholder="Chưa chọn tỉnh"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Quận/Huyện</Label>
                      <Input
                        readOnly
                        value={newAddress.district}
                        placeholder="Chưa chọn quận"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Phường/Xã</Label>
                      <Input
                        readOnly
                        value={newAddress.ward}
                        placeholder="Chưa chọn phường"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Chi tiết (Số nhà, đường...)</Label>
                    <Input
                      type="text"
                      name="street"
                      value={newAddress.street}
                      onChange={handleAddressInput}
                      className="mt-1"
                      placeholder="VD: 123 Đường ABC..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Hủy bỏ
                    </button>

                    <button
                      onClick={handleAddAddress}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-medium transition-colors"
                    >
                      {editingAddressIndex !== null
                        ? "Cập nhật địa chỉ"
                        : "Lưu địa chỉ mới"}
                    </button>
                  </div>
                </div>
              )}

              {/* SAVE PROFILE BUTTON (Chỉ hiện khi không mở form địa chỉ để đỡ rối) */}
              {!showAddressForm && (
                <div className="pt-6 border-t flex items-center justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center justify-end gap-2"
                  >
                    {isSaving ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
