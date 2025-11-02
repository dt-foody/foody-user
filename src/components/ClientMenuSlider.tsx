// components/ClientMenuSlider.tsx
"use client";

import React, { useRef } from "react"; // CHANGED: Thêm useRef
import Slider, { Settings } from "react-slick";
import {
  Utensils,
  Coffee,
  GlassWater,
  Cake,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PREFIX_IMAGE } from "@/constants";
import { Category } from "@/types";
import Image from "next/image";
// REMOVED: Xóa 2 component NextArrow và PrevArrow vì chúng ta sẽ render trực tiếp

export default function ClientMenuSlider({
  categories,
}: {
  categories: Category[];
}) {
  // CHANGED: Thêm ref để điều khiển slider từ bên ngoài
  const sliderRef = useRef<Slider>(null);

  const settings: Settings = {
    dots: true,
    infinite:
      categories.length > (categories.length < 4 ? categories.length : 4), // CHANGED: Đảm bảo infinite hợp lý
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    // CHANGED: Tắt mũi tên mặc định, chúng ta tự điều khiển
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  } as const;

  const renderIcon = (index: number) => {
    const icons = [
      <Utensils key="ut" className="w-10 h-10" />,
      <Coffee key="co" className="w-10 h-10" />,
      <GlassWater key="gw" className="w-10 h-10" />,
      <Cake key="ck" className="w-10 h-10" />,
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
    // CHANGED: Padding đã được làm responsive (px-8 trên mobile, px-12 trên desktop)
    <div className="relative px-8 md:px-12">
      {/* --- MŨI TÊN ĐIỀU KHIỂN BÊN NGOÀI --- */}
      {/* Đây là các mũi tên được render BÊN NGOÀI <Slider> */}
      {/* Chúng sẽ lấy "relative" của div cha làm gốc */}
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 md:p-3 hover:bg-red-600 hover:text-white transition"
        aria-label="Previous"
        type="button"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 md:p-3 hover:bg-red-600 hover:text-white transition"
        aria-label="Next"
        type="button"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      {/* ------------------------------------ */}

      {/* Khung cố định chiều cao để tránh CLS khi slider mount */}
      <div style={{ minHeight: 380 }}>
        {/* CHANGED: Thêm ref vào Slider */}
        <Slider {...settings} ref={sliderRef}>
          {categories.map((cat, index) => {
            const src = cat.image
              ? cat.image.startsWith("http")
                ? cat.image
                : `${PREFIX_IMAGE ?? ""}${cat.image}`
              : null;

            return (
              <div key={cat.id} className="px-3 h-full">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full min-h-[340px]">
                  {/* Image or Icon */}
                  {src ? (
                    <Image
                      src={src}
                      alt={cat.name}
                      width={96}
                      height={96}
                      className="mb-6 rounded-full border-4 border-red-100 object-cover"
                    />
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
                      {cat.description ??
                        "Khám phá những món ăn hấp dẫn trong danh mục này."}
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
