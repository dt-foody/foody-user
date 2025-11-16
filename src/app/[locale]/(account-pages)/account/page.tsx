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

  //
  // NEW EMAIL / PHONE FORM STATE
  //
  const [newEmail, setNewEmail] = useState("");
  const [newEmailType, setNewEmailType] = useState<
    "Home" | "Company" | "Other"
  >("Other");

  const [newPhone, setNewPhone] = useState("");
  const [newPhoneType, setNewPhoneType] = useState<
    "Home" | "Company" | "Other"
  >("Other");

  //
  // ADDRESS FORM STATE
  //
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );
  const [newAddress, setNewAddress] = useState<
    Omit<CustomerAddress, "isDefault" | "fullAddress">
  >({
    label: "",
    recipientName: "",
    recipientPhone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
  });

  //
  // ───────────────────────────────────────────
  //  FETCH USER & PREFILL
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
  //  HANDLE BASIC FORM INPUT
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
  //  EMAIL HANDLERS
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

    // Reset primary nếu bị xoá
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
  //  PHONE HANDLERS
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
  //  ADDRESS HANDLERS
  // ───────────────────────────────────────────
  //
  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = () => {
    if (
      !newAddress.recipientName ||
      !newAddress.recipientPhone ||
      !newAddress.street ||
      !newAddress.ward ||
      !newAddress.city
    )
      return toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ");

      const fullAddress = [newAddress.street, newAddress.ward, newAddress.district, newAddress.city].filter(Boolean).join(', ');
      
    const newObj: CustomerAddress = {
      ...newAddress,
      fullAddress,
      isDefault: customerData.addresses.length === 0,
    };

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

  const handleEditAddress = (index: number) => {
    const addr = customerData.addresses[index];
    setNewAddress(addr);
    setEditingAddressIndex(index);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (index: number) => {
    setCustomerData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
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
  //  SUBMIT UPDATE PROFILE
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
          {/* PROFILE TAB */}
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

              {/* ───────────────────────────────────────────── */}
              {/* EMAILS */}
              {/* ───────────────────────────────────────────── */}
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

              {/* ───────────────────────────────────────────── */}
              {/* PHONES */}
              {/* ───────────────────────────────────────────── */}
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
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────── */}
          {/* ADDRESS TAB */}
          {/* ───────────────────────────────────────────── */}
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
                  onClick={() => setShowAddressForm(true)}
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

                  <input
                    type="text"
                    name="label"
                    placeholder="Tên địa chỉ (ví dụ: Nhà riêng, Văn phòng)"
                    value={newAddress.label}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

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

                  <input
                    type="text"
                    name="street"
                    placeholder="Số nhà / Đường"
                    value={newAddress.street}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <input
                    type="text"
                    name="ward"
                    placeholder="Phường/Xã"
                    value={newAddress.ward}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <input
                    type="text"
                    name="district"
                    placeholder="Quận/Huyện"
                    value={newAddress.district}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <input
                    type="text"
                    name="city"
                    placeholder="Thành phố"
                    value={newAddress.city}
                    onChange={handleAddressInput}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAddAddress}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg"
                    >
                      {editingAddressIndex !== null ? "Cập nhật" : "Lưu"}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
