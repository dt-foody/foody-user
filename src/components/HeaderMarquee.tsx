import React from "react";

interface Props {
  text: string;
}

const HeaderMarquee: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  return (
    // Thay đổi màu nền ở đây: bg-yellow-50 (hoặc bg-primary-50 nếu thích màu xanh)
    <div className="relative w-full overflow-hidden bg-primary-6000 py-2.5 border-b border-yellow-100">
      {/* Container flex để chứa 2 dòng text nối đuôi nhau */}
      <div className="flex whitespace-nowrap">
        {/* Dòng text 1: Chạy từ 0% -> -100% */}
        <div className="animate-marquee flex items-center min-w-full">
          <span className="mx-4 text-md font-medium text-white tracking-wide px-4">
            {text}
          </span>
        </div>

        {/* Dòng text 2: Bản sao để lấp vào chỗ trống ngay lập tức (Hiệu ứng vô tận) */}
        <div className="animate-marquee flex items-center min-w-full absolute top-0 left-full py-2.5">
          <span className="mx-4 text-md font-medium text-white tracking-wide px-4">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderMarquee;
