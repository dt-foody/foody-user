import { Heart, ShoppingCart, Star, Clock, Flame } from "lucide-react";
import { MenuItem } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

interface ProductCardProps {
  product: MenuItem;
  showHotDealBadge?: boolean;
}

const ProductCard = ({ product, showHotDealBadge = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  // Kiểm tra xem sản phẩm có đang được giảm giá không
  const onSale = product.originalPrice && product.originalPrice > product.price;
  
  // Tính phần trăm giảm giá
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Hot Deal Badge - Top Left */}
        {showHotDealBadge && onSale && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-lg flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3" />
              Hot Deal
            </span>
          </div>
        )}

        {/* Discount Badge - Bottom Right trên ảnh */}
        {onSale && discountPercentage > 0 && (
          <div className="absolute bottom-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {/* Favorite Button - Top Right */}
        <button
          onClick={toggleFavorite}
          aria-label="Thêm vào yêu thích"
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
            }`} 
          />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating & Reviews */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="font-medium text-gray-800">{product.rating}</span>
            <span className="ml-1 text-gray-500">({product.reviews})</span>
          </div>
          
          {/* Sold Count - Chỉ hiển thị trong Hot Deals */}
          {showHotDealBadge && product.sold && (
            <span className="text-gray-500">
              Đã bán {product.sold}
            </span>
          )}
        </div>

        {/* Time Left - Chỉ hiển thị trong Hot Deals */}
        {showHotDealBadge && product.timeLeft && (
          <div className="flex items-center gap-1 text-sm text-red-500 font-medium mb-3 bg-red-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{product.timeLeft}</span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-orange-600">
              {Math.round(product.price).toLocaleString("vi-VN")}đ
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(product)}
            aria-label={`Thêm ${product.name} vào giỏ`}
            className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center transform shadow-sm ${
              showHotDealBadge 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-110'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white group-hover:scale-110'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;