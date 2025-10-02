"use client";
import React, { useState } from "react";
import { CheckCircle2, Gift, Crown, Calendar, Clock, MapPin, Package, Truck } from "lucide-react";

type ColorClass = {
  border: string;
  bg: string;
  text: string;
  button: string;
};

const MembershipPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<number | string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    ward: "",
    address: "",
    deliveryTime: "morning"
  });

  const membershipPlans = [
    {
      id: "monthly",
      name: "Gói Tháng",
      price: "499,000đ",
      period: "tháng",
      orders: 4,
      color: "blue",
      icon: Gift,
      savings: null
    },
    {
      id: "quarterly",
      name: "Gói Quý",
      price: "1,399,000đ",
      period: "quý",
      orders: 12,
      color: "purple",
      icon: Package,
      savings: "100,000đ",
      popular: true
    },
    {
      id: "yearly",
      name: "Gói Năm",
      price: "4,999,000đ",
      period: "năm",
      orders: 48,
      color: "amber",
      icon: Crown,
      savings: "500,000đ"
    }
  ];

  const benefits = [
    {
      icon: Calendar,
      title: "Tự chọn ngày giao hàng",
      description: "Linh hoạt chọn ngày giao phù hợp với lịch trình của bạn"
    },
    {
      icon: Clock,
      title: "Chọn khung giờ giao",
      description: "Sáng (7h-11h) / Chiều (11h-15h) / Tối (15h-20h)"
    },
    {
      icon: Package,
      title: "Chọn món trước 1 ngày",
      description: "Đặt món theo combo set sẵn hoặc tự chọn từng món"
    },
    {
      icon: MapPin,
      title: "Phân loại theo khu vực",
      description: "Giao hàng chính xác theo quận, phường của bạn"
    },
    {
      icon: Truck,
      title: "Đối tác vận chuyển uy tín",
      description: "Kết nối Grab, Bee, Ahamove - Giao hàng nhanh chóng"
    },
    {
      icon: CheckCircle2,
      title: "Cam kết chất lượng",
      description: "Hoàn tiền 100% nếu không hài lòng"
    }
  ];

  const districts: string[] = [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5",
    "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10",
    "Quận 11", "Quận 12", "Quận Bình Thạnh", "Quận Tân Bình",
    "Quận Phú Nhuận", "Quận Gò Vấp", "Quận Thủ Đức"
  ];

  const wards: Record<string, string[]> = {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh"],
    "Quận 2": ["Phường An Phú", "Phường An Khánh", "Phường Bình An", "Phường Bình Trưng Đông"],
    "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4"],
    // Add more as needed
  };

  const deliveryTimes = [
    { value: "morning", label: "Sáng (7h - 11h)" },
    { value: "afternoon", label: "Chiều (11h - 15h)" },
    { value: "evening", label: "Tối (15h - 20h)" }
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "district" ? { ward: "" } : {})
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedPlan) {
      alert("Vui lòng chọn gói thành viên");
      return;
    }
    console.log("Form submitted:", { ...formData, plan: selectedPlan });
    alert("Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
  };

  const colorClasses: Record<string, ColorClass> = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700"
    },
    purple: {
      border: "border-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700"
    },
    amber: {
      border: "border-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Chương trình thành viên
            </h1>
            <p className="text-lg text-gray-600">
              Đăng ký ngay để nhận ưu đãi đặc biệt và tiết kiệm chi phí
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Membership Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Chọn gói thành viên phù hợp
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Mỗi gói đều bao gồm minimum 4 lượt order/tháng
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {membershipPlans.map((plan) => {
              const Icon = plan.icon;
              const colors = colorClasses[plan.color];
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    selectedPlan === plan.id ? colors.border : "border-gray-200"
                  } ${plan.popular ? "ring-4 ring-purple-200" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        PHỔ BIẾN NHẤT
                      </span>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    
                    {plan.savings && (
                      <div className="mb-4">
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Tiết kiệm {plan.savings}
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span><strong>{plan.orders} lượt order</strong> trong {plan.period}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Chọn ngày & giờ giao hàng</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Chọn món trước 1 ngày</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Miễn phí ship nội thành</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 rounded-xl text-white font-semibold transition-colors ${
                        selectedPlan === plan.id
                          ? colors.button
                          : "bg-gray-800 hover:bg-gray-900"
                      }`}
                    >
                      {selectedPlan === plan.id ? "Đã chọn" : "Chọn gói này"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Quyền lợi thành viên
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Trải nghiệm dịch vụ cao cấp với nhiều tiện ích
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Cách thức hoạt động
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Đăng ký gói</h3>
              <p className="text-sm text-gray-600">
                Chọn gói phù hợp và hoàn tất thanh toán
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Chọn địa chỉ</h3>
              <p className="text-sm text-gray-600">
                Cập nhật quận, phường giao hàng
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Đặt món</h3>
              <p className="text-sm text-gray-600">
                Chọn món trước ngày giao 1 ngày
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-orange-600">
                4
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Nhận hàng</h3>
              <p className="text-sm text-gray-600">
                Giao hàng đúng giờ qua Grab/Bee/Ahamove
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl shadow-2xl p-12 text-white mb-8">
            <h2 className="text-4xl font-bold mb-4 text-center">
              Đăng ký thành viên ngay
            </h2>
            <p className="text-xl text-center opacity-90">
              Điền thông tin để hoàn tất đăng ký và bắt đầu tận hưởng ưu đãi
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="0901234567"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Khung giờ giao hàng ưu tiên <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  >
                    {deliveryTimes.map(time => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.district}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn phường/xã</option>
                    {formData.district && wards[formData.district]?.map(ward => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              {/* Selected Plan Display */}
              {selectedPlan && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-700">Gói đã chọn:</p>
                      <p className="text-lg font-bold text-green-900">
                        {membershipPlans.find(p => p.id === selectedPlan)?.name} - {membershipPlans.find(p => p.id === selectedPlan)?.price}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}

              {!selectedPlan && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-700 text-center">
                    ⚠️ Vui lòng chọn gói thành viên ở phía trên trước khi đăng ký
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={!selectedPlan}
                >
                  Hoàn tất đăng ký
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;