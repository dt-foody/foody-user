"use client";

import React, { useState } from "react";
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
} from "lucide-react";

// --- Interfaces ---
interface IAddress {
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  fullAddress?: string;
  isDefault: boolean;
}

interface ICustomerData {
  name: string;
  gender: "male" | "female" | "other";
  email: string;
  birthDate: string;
  phone: string;
  addresses: IAddress[];
}

const AccountPage = () => {
  const [customerData, setCustomerData] = useState<ICustomerData>({
    name: "Eden Tuan",
    gender: "male",
    email: "example@email.com",
    birthDate: "1990-07-22",
    phone: "003 888 232",
    addresses: [
      {
        label: "Home",
        recipientName: "Eden Tuan",
        recipientPhone: "003 888 232",
        street: "123 Main St",
        ward: "Phường 1",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        fullAddress: "123 Main St, Phường 1, Quận 1, TP. Hồ Chí Minh",
        isDefault: true,
      },
    ],
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );
  const [newAddress, setNewAddress] = useState<
    Omit<IAddress, "isDefault" | "fullAddress">
  >({
    label: "",
    recipientName: "",
    recipientPhone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
  });
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">(
    "profile"
  );
  const [isSaving, setIsSaving] = useState(false);

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
      !newAddress.district ||
      !newAddress.city
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    const fullAddress = `${newAddress.street}, ${newAddress.ward}, ${newAddress.district}, ${newAddress.city}`;
    const newAddressObject: IAddress = {
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
      district: "",
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
      district: addr.district,
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
      district: "",
      city: "",
    });
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setTimeout(() => {
      console.log("Submitting data:", customerData);
      setIsSaving(false);
      alert("Đã cập nhật thông tin thành công!");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Account Information
          </h1>
          <p className="text-sm text-gray-600">
            Manage your profile and addresses
          </p>
        </div>
        <div className="relative group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-semibold shadow-md">
            {customerData.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <span className="text-xs text-white mt-0.5">Change</span>
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
            Profile
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
            Addresses
            <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {customerData.addresses.length}
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
                    Full Name
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
                    Phone Number
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
                    Email Address
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
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Date of Birth
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
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={customerData.gender}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-md hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
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
                              Default
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
                      {address.ward}, {address.district}, {address.city}
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
                  Add New Address
                </button>
              )}

              {showNewAddressForm && (
                <div className="p-5 border-2 border-orange-200 rounded-lg bg-orange-50/30 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {editingAddressIndex !== null
                        ? "Edit Address"
                        : "Add New Address"}
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
                      Label{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
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
                        Recipient Name <span className="text-red-500">*</span>
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
                        Phone Number <span className="text-red-500">*</span>
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
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      placeholder="House number, street name"
                      value={newAddress.street}
                      onChange={handleNewAddressChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ward <span className="text-red-500">*</span>
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
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={newAddress.district}
                        onChange={handleNewAddressChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        City <span className="text-red-500">*</span>
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
                        ? "Update Address"
                        : "Save Address"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-all"
                    >
                      Cancel
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
