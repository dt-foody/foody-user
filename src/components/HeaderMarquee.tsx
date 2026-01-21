import React from "react";

interface Props {
  text: string;
}

const HeaderMarquee: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="relative w-full overflow-hidden bg-primary-6000 py-2.5 border-b border-yellow-100">
      {/* Thêm overflow-hidden để cắt phần thừa */}
      <div className="flex whitespace-nowrap overflow-hidden">
        {/* Dòng text 1: Thêm flex-shrink-0 để đảm bảo chiều rộng không bị co */}
        <div className="animate-marquee flex items-center min-w-full flex-shrink-0">
          <span className="mx-4 text-md font-medium text-white tracking-wide px-4">
            {text}
          </span>
        </div>

        {/* Dòng text 2: Bỏ absolute, nó sẽ tự động nối đuôi dòng 1 nhờ Flexbox */}
        <div className="animate-marquee flex items-center min-w-full flex-shrink-0">
          <span className="mx-4 text-md font-medium text-white tracking-wide px-4">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderMarquee;
