const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-7 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-300 rounded-lg w-1/4"></div>
      </div>
    </div>
  </div>
);

export default SkeletonCard;