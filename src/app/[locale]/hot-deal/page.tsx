'use client';
import { useState } from 'react';
import { Clock, MapPin, Star, Flame, Tag, Heart } from 'lucide-react';
import SectionSubscribe2 from "@/components/SectionSubscribe2";

export default function HotDealsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🍽️' },
    { id: 'food', name: 'Đồ ăn', icon: '🍜' },
    { id: 'drink', name: 'Đồ uống', icon: '🥤' },
    { id: 'buffet', name: 'Buffet', icon: '🍱' },
    { id: 'fastfood', name: 'Fast Food', icon: '🍔' },
  ];

  const deals = [
    {
      id: 1,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
      restaurant: 'Bún Bò Huế Mẹ Tôi',
      title: 'Giảm 50% Bún Bò Huế đặc biệt',
      originalPrice: 80000,
      discountPrice: 40000,
      discount: 50,
      rating: 4.8,
      sold: 342,
      timeLeft: '2 giờ',
      location: 'Quận 1, TP.HCM',
      tag: 'Hot',
    },
    {
      id: 2,
      category: 'drink',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
      restaurant: 'The Coffee House',
      title: 'Mua 1 tặng 1 - Trà sữa size L',
      originalPrice: 49000,
      discountPrice: 49000,
      discount: 50,
      rating: 4.6,
      sold: 523,
      timeLeft: '5 giờ',
      location: 'Quận 3, TP.HCM',
      tag: 'Best Seller',
    },
    {
      id: 3,
      category: 'buffet',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      restaurant: 'Buffet BBQ Garden',
      title: 'Buffet nướng & lẩu - Giảm 40%',
      originalPrice: 299000,
      discountPrice: 179000,
      discount: 40,
      rating: 4.9,
      sold: 156,
      timeLeft: '1 ngày',
      location: 'Quận 7, TP.HCM',
      tag: 'New',
    },
    {
      id: 4,
      category: 'fastfood',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
      restaurant: 'Burger King',
      title: 'Combo Burger + Khoai tây + Nước',
      originalPrice: 99000,
      discountPrice: 69000,
      discount: 30,
      rating: 4.5,
      sold: 678,
      timeLeft: '3 giờ',
      location: 'Quận 2, TP.HCM',
      tag: 'Hot',
    },
    {
      id: 5,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
      restaurant: 'Sushi World',
      title: 'Set Sushi 20 miếng - Giảm 35%',
      originalPrice: 350000,
      discountPrice: 227500,
      discount: 35,
      rating: 4.7,
      sold: 234,
      timeLeft: '6 giờ',
      location: 'Quận 1, TP.HCM',
      tag: 'Premium',
    },
    {
      id: 6,
      category: 'drink',
      image: 'https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=800&q=80',
      restaurant: 'Juice & Smoothie',
      title: 'Combo 3 ly sinh tố trái cây',
      originalPrice: 120000,
      discountPrice: 84000,
      discount: 30,
      rating: 4.4,
      sold: 445,
      timeLeft: '4 giờ',
      location: 'Quận 5, TP.HCM',
      tag: 'Hot',
    },
  ];

  const filteredDeals = selectedCategory === 'all' 
    ? deals 
    : deals.filter(deal => deal.category === selectedCategory);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold">Hot Deals Hôm Nay</h1>
          </div>
          <p className="text-lg md:text-xl opacity-90">
            Săn ngay các ưu đãi hấp dẫn - Tiết kiệm đến 50%!
          </p>
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-semibold">{filteredDeals.length} deal đang diễn ra</span>
            </div>
            <div className="bg-yellow-400 text-orange-900 px-4 py-2 rounded-full font-semibold animate-bounce">
              🔥 Ưu đãi kết thúc sớm!
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all transform hover:scale-105 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    deal.tag === 'Hot' ? 'bg-red-500' :
                    deal.tag === 'New' ? 'bg-green-500' :
                    deal.tag === 'Premium' ? 'bg-purple-500' :
                    'bg-blue-500'
                  }`}>
                    {deal.tag}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleFavorite(deal.id)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(deal.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                  -{deal.discount}%
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-gray-800 mb-1 truncate">
                  {deal.restaurant}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {deal.title}
                </p>

                {/* Rating & Sold */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-gray-700">{deal.rating}</span>
                  </div>
                  <div className="text-gray-500">
                    Đã bán {deal.sold}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-orange-500">
                    {deal.discountPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-gray-400 line-through">
                    {deal.originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Location & Time */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{deal.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Còn {deal.timeLeft}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 active:scale-95 shadow-md">
                  Đặt ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Không có deal nào
            </h3>
            <p className="text-gray-500">
              Hãy thử chọn danh mục khác nhé!
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionSubscribe2 />
      </div>
    </div>
  );
}