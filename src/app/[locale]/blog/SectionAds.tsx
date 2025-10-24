"use client";

import React, { FC, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface SectionAdsProps {
  className?: string;
}

interface AdSlide {
  image: string;
  link: string;
  alt: string;
}

const adSlides: AdSlide[] = [
  {
    image: "/images/ads1.png",
    link: "/#promotion-1",
    alt: "Khuyến mãi đặc biệt",
  },
  {
    image: "/images/ads1.png",
    link: "/#promotion-2",
    alt: "Ưu đãi hấp dẫn",
  },
  {
    image: "/images/ads2.png",
    link: "/#promotion-3",
    alt: "Giảm giá sốc",
  },
];

const SectionAds: FC<SectionAdsProps> = ({ className = "" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto play slider
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % adSlides.length);
    }, 5000); // Chuyển slide mỗi 5 giây

    return () => clearInterval(interval);
  }, [isHovered]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + adSlides.length) % adSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % adSlides.length);
  };

  return (
    <div
      className={`nc-SectionAds relative w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider container */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {adSlides.map((slide, index) => (
            <div key={index} className="min-w-full">
              <a href={slide.link} className="block relative w-full aspect-[21/6]">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </a>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {adSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === index
                  ? "bg-white w-8 h-2"
                  : "bg-white/50 hover:bg-white/75 w-2 h-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionAds;