'use client';

import { useState } from 'react';
import { useCart, SHIPPING_FEE } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Banknote, Landmark, Loader } from 'lucide-react';

export default function CheckoutPage() {
  const { 
    cartItems, subtotal, itemDiscount, shippingDiscount, 
    finalTotal, clearCart, appliedVouchers, appliedCoupon
  } = useCart();
  
  const router = useRouter();
  
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: any) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };
  
  const handleSubmitOrder = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const orderData = {
      customer: userInfo,
      items: cartItems,
      paymentMethod,
      promotions: { vouchers: appliedVouchers, coupon: appliedCoupon },
      totals: { subtotal, itemDiscount, shippingDiscount, finalTotal }
    };
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Đặt hàng thất bại');
      
      const result = await response.json();
      
      clearCart();
      router.push(`/order-confirmation/${result.orderId}`);

    } catch (error: any) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn đang trống!</h2>
        <button onClick={() => router.push('/')} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Xác nhận đơn hàng</h1>
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT BÊN TRÁI: THÔNG TIN & THANH TOÁN */}
          <div className="lg:col-span-2 space-y-8">
            {/* === 1. FORM GIAO HÀNG ĐÃ NÂNG CẤP === */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-5 text-gray-700">Thông tin giao hàng</h2>
              <div className="space-y-5">
                <div className="relative">
                  <label htmlFor="name" className="font-medium text-gray-600">Họ và tên</label>
                  <User className="absolute left-3 top-10 text-gray-400" size={20} />
                  <input id="name" name="name" onChange={handleInputChange} required placeholder="Nguyễn Văn A" className="w-full p-3 pl-10 mt-2 border rounded-lg focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="relative">
                  <label htmlFor="phone" className="font-medium text-gray-600">Số điện thoại</label>
                  <Phone className="absolute left-3 top-10 text-gray-400" size={20} />
                  <input id="phone" name="phone" type="tel" onChange={handleInputChange} required placeholder="09xxxxxxxx" className="w-full p-3 pl-10 mt-2 border rounded-lg focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="relative">
                  <label htmlFor="address" className="font-medium text-gray-600">Địa chỉ nhận hàng</label>
                  <MapPin className="absolute left-3 top-10 text-gray-400" size={20} />
                  <input id="address" name="address" onChange={handleInputChange} required placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP" className="w-full p-3 pl-10 mt-2 border rounded-lg focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
            </div>

            {/* === 3. THÊM PHƯƠNG THỨC THANH TOÁN MỚI === */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-5 text-gray-700">Phương thức thanh toán</h2>
              <div className="space-y-4">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}>
                  <Banknote className="text-green-600 mr-4" size={24} />
                  <div className="flex-1">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden"/>
                    <span className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-not-allowed bg-gray-100 opacity-60">
                  <Landmark className="text-gray-400 mr-4" size={24} />
                  <div className="flex-1">
                    <input type="radio" name="payment" value="bank" disabled className="hidden"/>
                    <span className="font-bold text-gray-500">Chuyển khoản ngân hàng</span>
                    <span className="text-xs text-gray-400 block"> (Đang phát triển)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT BÊN PHẢI: HÓA ĐƠN CHI TIẾT */}
          <div className="bg-white p-6 rounded-xl shadow-md h-fit">
            <h2 className="text-2xl font-semibold mb-5 text-gray-700">Hóa đơn</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.cartId} className="flex justify-between items-center text-sm">
                  <span className="pr-2 truncate w-4/5">{item.name} (x{item.quantity})</span>
                  <span className="flex-shrink-0 font-medium">{item.totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
            
            {/* === 2. BẢNG BILLING CHI TIẾT === */}
            <div className="space-y-2 text-sm mt-5 pt-5 border-t">
                <div className="flex justify-between font-medium">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Phí vận chuyển</span>
                  <span>{SHIPPING_FEE.toLocaleString('vi-VN')}đ</span>
                </div>
                
                {(itemDiscount + shippingDiscount) > 0 && (
                  <div className="pt-2">
                    <p className="text-green-600 font-semibold mb-1">🏷️ Khuyến mãi:</p>
                    {itemDiscount > 0 && 
                      <div className="flex justify-between text-green-600">
                        <span>- Giảm giá món</span>
                        <span>-{itemDiscount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    }
                    {shippingDiscount > 0 && 
                      <div className="flex justify-between text-green-600">
                        <span>- Giảm phí vận chuyển</span>
                        <span>-{shippingDiscount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    }
                  </div>
                )}
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t mt-4 text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-orange-500">{finalTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
          
          {/* Nút đặt hàng cho màn hình nhỏ */}
          <div className="lg:hidden mt-6">
            <button type="submit" disabled={isLoading} className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg">
              {isLoading ? 'Đang xử lý...' : `Hoàn tất (${finalTotal.toLocaleString('vi-VN')}đ)`}
            </button>
          </div>
        </form>
      </div>
      
      {/* Footer cố định cho màn hình lớn */}
      <footer className="hidden lg:block sticky bottom-0 bg-white shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] mt-8">
        <div className="container mx-auto p-4 flex justify-end items-center">
            <div className="text-right mr-6">
                <span className="text-gray-600">Tổng thanh toán:</span>
                <p className="font-bold text-2xl text-orange-500">{finalTotal.toLocaleString('vi-VN')}đ</p>
            </div>
            <button type="submit" form="checkout-form" disabled={isLoading} className="bg-orange-500 text-white py-3 px-12 rounded-lg font-bold text-lg disabled:bg-orange-300">
                {isLoading ? <Loader className="animate-spin"/> : 'Hoàn tất Đặt hàng'}
            </button>
        </div>
      </footer>
    </div>
  );
}

// Thêm một component nhỏ để gán `id` cho form, giúp nút submit bên ngoài form hoạt động
const CheckoutFormWrapper = () => {
    return (
        <CheckoutPage />
    );
};