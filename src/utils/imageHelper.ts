// src/utils/imageHelper.js

// Lấy URL backend từ biến môi trường.
// Lưu ý: Trong Next.js, biến public phải bắt đầu bằng NEXT_PUBLIC_
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const DEFAULT_IMAGE = "/images/no-image.webp";

export const getImageUrl = (imagePath?: string) => {
  // 1. Nếu không có path, trả về ảnh mặc định trong folder public
  if (!imagePath) {
    return "/images/no-image.webp"; // Đảm bảo bạn có file này trong public/images/
  }

  // 2. Nếu path đã là full URL (ví dụ ảnh Google, Facebook, hoặc link S3)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // 3. Chuẩn hóa đường dẫn để tránh lỗi thừa/thiếu dấu "/"
  // Backend của bạn lưu: "/storage/..." (có dấu / ở đầu)
  // BASE_URL thường là: "http://localhost:3000" (không có / ở cuối)

  // Xóa dấu / ở cuối BASE_URL nếu lỡ có
  const cleanBaseUrl = BASE_URL.replace(/\/+$/, "");
  // Đảm bảo imagePath bắt đầu bằng dấu /
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${cleanBaseUrl}${cleanPath}`;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = DEFAULT_IMAGE;
};
