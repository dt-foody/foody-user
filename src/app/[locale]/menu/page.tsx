'use client';

import { useState, useMemo } from 'react';
import { Search, ShoppingCart, Star, Clock, MapPin, Heart, Filter, X, Plus, Minus } from 'lucide-react';

export default function FoodyMenu() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState<any>(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🍽️' },
    { id: 'rice', name: 'Cơm', icon: '🍚' },
    { id: 'noodle', name: 'Mì & Phở', icon: '🍜' },
    { id: 'drink', name: 'Đồ uống', icon: '🥤' },
    { id: 'snack', name: 'Ăn vặt', icon: '🍟' },
    { id: 'dessert', name: 'Tráng miệng', icon: '🍰' },
  ];

  const menuItems = [
    {
      id: 1,
      name: 'Cơm Gà Xối Mỡ',
      category: 'rice',
      price: 45000,
      originalPrice: 55000,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      rating: 4.8,
      reviews: 234,
      time: '15-20 phút',
      description: 'Cơm gà thơm ngon với xốt đặc biệt',
      restaurant: 'Quán Cơm Gà Hải Nam',
      distance: '0.8 km',
      popular: true,
      discount: 18
    },
    {
      id: 2,
      name: 'Phở Bò Tái Nạm',
      category: 'noodle',
      price: 50000,
      image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400',
      rating: 4.9,
      reviews: 456,
      time: '10-15 phút',
      description: 'Phở bò truyền thống, nước dùng đậm đà',
      restaurant: 'Phở Hà Nội',
      distance: '1.2 km',
      popular: true
    },
    {
      id: 3,
      name: 'Trà Sữa Trân Châu Đường Đen',
      category: 'drink',
      price: 35000,
      originalPrice: 40000,
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400',
      rating: 4.7,
      reviews: 678,
      time: '5-10 phút',
      description: 'Trà sữa thơm béo với trân châu dẻo',
      restaurant: 'Gong Cha',
      distance: '0.5 km',
      discount: 13
    },
    {
      id: 4,
      name: 'Bánh Mì Thịt Nướng',
      category: 'snack',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400',
      rating: 4.6,
      reviews: 189,
      time: '5-10 phút',
      description: 'Bánh mì giòn với thịt nướng thơm lừng',
      restaurant: 'Bánh Mì 37',
      distance: '0.3 km',
      popular: true
    },
    {
      id: 5,
      name: 'Bún Chả Hà Nội',
      category: 'noodle',
      price: 42000,
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
      rating: 4.8,
      reviews: 312,
      time: '15-20 phút',
      description: 'Bún chả nướng than hoa, nước mắm chua ngọt',
      restaurant: 'Bún Chả Hàng Mành',
      distance: '1.5 km'
    },
    {
      id: 6,
      name: 'Cafe Sữa Đá',
      category: 'drink',
      price: 20000,
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
      rating: 4.5,
      reviews: 523,
      time: '5 phút',
      description: 'Cafe phin truyền thống đậm đà',
      restaurant: 'Highlands Coffee',
      distance: '0.6 km'
    },
    {
      id: 7,
      name: 'Gà Rán Giòn',
      category: 'snack',
      price: 55000,
      originalPrice: 65000,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
      rating: 4.7,
      reviews: 445,
      time: '10-15 phút',
      description: 'Gà rán giòn rụm, cay nồng hấp dẫn',
      restaurant: 'KFC',
      distance: '0.9 km',
      discount: 15
    },
    {
      id: 8,
      name: 'Kem Dừa Dầm',
      category: 'dessert',
      price: 30000,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
      rating: 4.9,
      reviews: 267,
      time: '5 phút',
      description: 'Kem dừa mát lạnh với topping đa dạng',
      restaurant: 'Kem Bơ',
      distance: '0.7 km',
      popular: true
    },
    {
      id: 9,
      name: 'Cơm Sườn Bì Chả',
      category: 'rice',
      price: 48000,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      rating: 4.6,
      reviews: 198,
      time: '15-20 phút',
      description: 'Cơm sườn truyền thống miền Nam',
      restaurant: 'Cơm Tấm Sài Gòn',
      distance: '1.1 km'
    },
    {
      id: 10,
      name: 'Sinh Tố Bơ',
      category: 'drink',
      price: 28000,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
      rating: 4.7,
      reviews: 334,
      time: '5-10 phút',
      description: 'Sinh tố bơ béo ngậy, thơm ngon',
      restaurant: 'Sinh Tố Nhiệt Đới',
      distance: '0.4 km'
    },
    {
      id: 11,
      name: 'Bánh Bao Nhân Thịt',
      category: 'snack',
      price: 18000,
      image: 'https://images.unsplash.com/photo-1517686748429-f97da0ae4d87?w=400',
      rating: 4.4,
      reviews: 156,
      time: '5 phút',
      description: 'Bánh bao xốp mềm nhân thịt đầy đặn',
      restaurant: 'Bánh Bao Bảo Bảo',
      distance: '0.6 km'
    },
    {
      id: 12,
      name: 'Bánh Flan Caramen',
      category: 'dessert',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400',
      rating: 4.8,
      reviews: 289,
      time: '5 phút',
      description: 'Bánh flan mềm mịn vị caramen thơm',
      restaurant: 'Bánh Flan Bà Ba',
      distance: '0.8 km'
    }
  ];

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      return matchCategory && matchSearch && matchPrice;
    });

    // Sort items
    if (sortBy === 'popular') {
      items.sort((a, b) => b.reviews - a.reviews);
    } else if (sortBy === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    return items;
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const addToCart = (item: any) => {
    const existingItem = cartItems.find(i => i.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: any) => {
    const existingItem = cartItems.find(i => i.id === itemId);
    if (existingItem.quantity === 1) {
      setCartItems(cartItems.filter(i => i.id !== itemId));
    } else {
      setCartItems(cartItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    }
  };

  const toggleFavorite = (itemId: any) => {
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
    } else {
      setFavorites([...favorites, itemId]);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-3 pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-orange-500 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Bộ lọc</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="popular">Phổ biến nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Khoảng giá</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                    -{item.discount}%
                  </div>
                )}
                {item.popular && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                    🔥 Hot
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.restaurant}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium">{item.rating}</span>
                    <span className="ml-1">({item.reviews})</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{item.distance}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-orange-500">
                        {item.price.toLocaleString('vi-VN')}đ
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {item.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-1 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy món ăn</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">Giỏ hàng ({cartCount})</h2>
                <button onClick={() => setShowCart(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                          <p className="text-orange-500 font-semibold text-sm">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-orange-500 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{cartTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phí giao hàng</span>
                    <span className="font-medium">15.000đ</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-orange-500">
                      {(cartTotal + 15000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all">
                    Đặt hàng ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}