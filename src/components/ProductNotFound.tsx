const ProductNotFound = () => {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">🍽️</div>
      <h3 className="text-xl font-semibold text-gray-900">
        Không tìm thấy món nào phù hợp
      </h3>
      <p className="text-gray-500">
        Vui lòng thử lại với từ khóa hoặc bộ lọc khác nhé.
      </p>
    </div>
  );
};

export default ProductNotFound;
