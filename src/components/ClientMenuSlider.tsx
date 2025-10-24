// components/ClientMenuSlider.tsx
"use client";

import Slider, { Settings } from "react-slick";
import {
  Utensils, Coffee, GlassWater, Cake,
  ChevronLeft, ChevronRight
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string; // có thể là path tương đối từ backend
};

function NextArrow(props: any) {
  return (
    <button
      onClick={props.onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-red-600 hover:text-white transition"
      aria-label="Next"
      type="button"
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  );
}

function PrevArrow(props: any) {
  return (
    <button
      onClick={props.onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-red-600 hover:text-white transition"
      aria-label="Previous"
      type="button"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}

export default function ClientMenuSlider({
  categories,
  assetBase
}: {
  categories: Category[];
  assetBase?: string;
}) {
  const settings: Settings = {
    dots: true,
    infinite: categories.length > 4,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640,  settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  } as const;

  const renderIcon = (index: number) => {
    const icons = [
      <Utensils key="ut" className="w-10 h-10" />,
      <Coffee   key="co" className="w-10 h-10" />,
      <GlassWater key="gw" className="w-10 h-10" />,
      <Cake     key="ck" className="w-10 h-10" />,
    ];
    return icons[index % icons.length];
  };

  if (!categories?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Chưa có danh mục nào</p>
      </div>
    );
  }

  return (
    <div className="relative px-12">
      {/* Khung cố định chiều cao để tránh CLS khi slider mount */}
      <div style={{ minHeight: 380 }}>
        <Slider {...settings}>
          {categories.map((cat, index) => {
            const src = cat.image
              ? (cat.image.startsWith("http")
                  ? cat.image
                  : `${assetBase ?? ""}${cat.image}`)
              : null;

            return (
              <div key={cat.id} className="px-3 h-full">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full min-h-[340px]">
                  {/* Image or Icon */}
                  {src ? (
                    <div className="w-24 h-24 mb-6 overflow-hidden rounded-full border-4 border-red-100">
                      {/* dùng img tiêu chuẩn vì ảnh từ backend động */}
                      <img
                        src={src}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50 mb-6 text-red-600 border-4 border-red-100">
                      {renderIcon(index)}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 flex-grow min-h-[60px] flex items-start">
                    <span className="line-clamp-3">
                      {cat.description ?? "Khám phá những món ăn hấp dẫn trong danh mục này."}
                    </span>
                  </p>

                  {/* Button */}
                  <a
                    href={`#menu-${cat.id}`}
                    className="inline-block px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    Xem thực đơn
                  </a>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}
