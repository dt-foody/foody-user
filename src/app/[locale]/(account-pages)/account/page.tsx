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
  Loader, // Thêm icon Loader
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore"; // Import store
import { customerService } from "@/services"; // Import service (giả định)
import { CustomerForm, CustomerAddress, UpdateCustomerInput } from "@/types";
import { toast } from 'sonner';

// Hàm helper định dạng ngày cho input type="date"
const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

const AccountPage = () => {
  // Lấy state và action từ store
  const { me, fetchUser } = useAuthStore();

  // Khởi tạo state rỗng, đợi pre-fill
  const [customerData, setCustomerData] = useState<CustomerForm>({
    name: "",
    gender: "male",
    email: "",
    birthDate: "",
    phone: "",
    addresses: [],
  });

  const [isLoading, setIsLoading] = useState(true); // State loading
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
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
    city: "",
  });
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">(
    "profile"
  );
  const [isSaving, setIsSaving] = useState(false);

  // useEffect để fetch và pre-fill dữ liệu
  useEffect(() => {
    const loadAndSetUser = async () => {
      setIsLoading(true);
      // Lấy state hiện tại từ store
      let storeUser = useAuthStore.getState().user;
      let storeMe = useAuthStore.getState().me;

      // Nếu chưa có, fetch mới
      if (!storeUser || !storeMe) {
        await fetchUser();
        storeUser = useAuthStore.getState().user;
        storeMe = useAuthStore.getState().me;
      }

      // Nếu có dữ liệu 'me' (profile)
      if (storeMe) {
        setCustomerData({
          name: storeMe.name || "",
          gender: storeMe.gender || "male",
          email: storeUser?.email || storeMe.email || "", // Lấy email từ user hoặc me
          birthDate: formatDateForInput(storeMe.birthDate), // Định dạng lại ngày
          phone: storeMe.phone || "",
          addresses: storeMe.addresses || [],
        });
      }

      setIsLoading(false);
    };

    loadAndSetUser();
  }, [fetchUser]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
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
      !newAddress.city
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    const fullAddress = `${newAddress.street}, ${newAddress.ward}, ${newAddress.city}`;
    const newAddressObject: CustomerAddress = {
      ...newAddress,
      fullAddress,
      isDefault: customerData.addresses.length === 0,
    };

    if (editingAddressIndex !== null) {
      setCustomerData((prev) => ({
        ...prev,
        addresses: prev.addresses.map((addr, index) =>
          index === editingAddressIndex
            ? { ...newAddressObject, isDefault: addr.isDefault }
            : addr
        ),
      }));
      setEditingAddressIndex(null);
    } else {
      setCustomerData((prev) => ({
        ...prev,
        addresses: [...prev.addresses, newAddressObject],
      }));
    }

    setNewAddress({
      label: "",
      recipientName: "",
      recipientPhone: "",
      street: "",
      ward: "",
      city: "",
    });
    setShowNewAddressForm(false);
  };

  const handleEditAddress = (index: number) => {
    const addr = customerData.addresses[index];
    setNewAddress({
      label: addr.label,
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
      street: addr.street,
      ward: addr.ward,
      city: addr.city,
    });
    setEditingAddressIndex(index);
    setShowNewAddressForm(true);
    setActiveTab("addresses");
  };

  const handleSetDefaultAddress = (indexToSet: number) => {
    setCustomerData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, index) => ({
        ...addr,
        isDefault: index === indexToSet,
      })),
    }));
  };

  const handleDeleteAddress = (indexToDelete: number) => {
    if (
      customerData.addresses[indexToDelete].isDefault &&
      customerData.addresses.length > 1
    ) {
      alert("Vui lòng chọn địa chỉ mặc định khác trước khi xóa.");
      return;
    }
    setCustomerData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, index) => index !== indexToDelete),
    }));
  };

  const handleCancelEdit = () => {
    setShowNewAddressForm(false);
    setEditingAddressIndex(null);
    setNewAddress({
      label: "",
      recipientName: "",
      recipientPhone: "",
      street: "",
      ward: "",
      city: "",
    });
  };

  // Cập nhật handleSubmit để gọi API
  const handleSubmit = async () => {
    if (!customerData) return;
    setIsSaving(true);
    try {
      const payload: UpdateCustomerInput = {
        name: customerData.name,
        phone: customerData.phone,
        gender: customerData.gender,
        birthDate: customerData.birthDate || undefined,
        addresses: customerData.addresses,
      };

      // Gửi toàn bộ customerData (state của form) lên server
      await customerService.updateProfile(payload);

      // Sau khi update, fetch lại user để đảm bảo store được đồng bộ
      await fetchUser();

      toast.success('Cập nhật thông tin thành công!')
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error('Cập nhật thông tin thất bại!')
    } finally {
      setIsSaving(false);
    }
  };

  // Trạng thái Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // Trạng thái chưa đăng nhập (sau khi load xong)
  if (!me && !isLoading) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800">
          Vui lòng đăng nhập
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Bạn cần đăng nhập để xem và quản lý thông tin tài khoản.
        </p>
        {/* Bạn có thể thêm nút Login ở đây */}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Thông tin tài khoản
          </h1>
          <p className="text-sm text-gray-600">
            Quản lý thông tin cá nhân và địa chỉ của bạn
          </p>
        </div>
        <div className="relative group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-semibold shadow-md">
            {customerData.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <span className="text-xs text-white mt-0.5">Đổi</span>
          </div>
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === "profile"
                ? "text-orange-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
            Hồ sơ
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === "addresses"
                ? "text-orange-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <MapPin className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
            Địa chỉ
            <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {customerData.addresses?.length || 0}
            </span>
            {activeTab === "addresses" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
            )}
          </button>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleFormChange}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email không thể thay đổi
                  </p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={customerData.birthDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={customerData.gender}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-md hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              {customerData.addresses.map((address, index) => (
                <div
                  key={index}
                  className={`relative p-4 rounded-lg border transition-all ${
                    address.isDefault
                      ? "border-orange-300 bg-orange-50/50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="defaultAddress"
                        id={`addr_${index}`}
                        checked={address.isDefault}
                        onChange={() => handleSetDefaultAddress(index)}
                        className="mt-0.5 w-4 h-4 text-orange-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`addr_${index}`}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          {address.recipientName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.recipientPhone}
                        </p>
                      </label>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditAddress(index)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="ml-7 text-sm text-gray-600">
                    <p>{address.street}</p>
                    <p>
                      {address.ward}, {address.city}
                    </p>
                  </div>
                </div>
              ))}

              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm địa chỉ mới
                </button>
              )}

              {showNewAddressForm && (
                <div className="p-5 border-2 border-orange-200 rounded-lg bg-orange-50/30 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {editingAddressIndex !== null
                        ? "Sửa địa chỉ"
                        : "Thêm địa chỉ mới"}
                    </h3>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nhãn{" "}
                      <span className="text-gray-400 font-normal">
                        (VD: Nhà, Công ty)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="label"
                      placeholder="e.g., Home, Office"
                      value={newAddress.label}
                      onChange={handleNewAddressChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Tên người nhận <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="recipientName"
                        value={newAddress.recipientName}
                        onChange={handleNewAddressChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="recipientPhone"
                        value={newAddress.recipientPhone}
                        onChange={handleNewAddressChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa chỉ đường <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      placeholder="Số nhà, tên đường"
                      value={newAddress.street}
                      onChange={handleNewAddressChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phường/Xã <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={newAddress.ward}
                        onChange={handleNewAddressChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleNewAddressChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddNewAddress}
                      className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-md hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {editingAddressIndex !== null
                        ? "Cập nhật"
                        : "Lưu địa chỉ"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-all"
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
