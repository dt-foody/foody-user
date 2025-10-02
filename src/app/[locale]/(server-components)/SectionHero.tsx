import React, { FC } from "react";
import heroImage from "@/images/hero.png";
import HeroSearchForm from "../(client-components)/(HeroSearchForm)/HeroSearchForm";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useTranslations } from "next-intl";
import { Search, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Input from "@/shared/Input";

export interface SectionHeroProps {
  className?: string;
}

const SectionHero: FC<SectionHeroProps> = ({ className = "" }) => {
  const t = useTranslations("section-hero"); // namespace trong JSON

  return (
     <section className={`relative w-full bg-white ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Món ăn ngon"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/30" /> {/* overlay mờ */}
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto text-center py-24 px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          Thưởng thức <span className="text-red-600">ẩm thực tuyệt vời</span> 
          <br />cho khẩu vị của bạn
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Khám phá hương vị tinh tế và khoảnh khắc khó quên 
          tại thiên đường ẩm thực thân thiện của chúng tôi.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#dat-ban"
            className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Đăng ký thành viên ngay
          </a>
          <a
            href="#thuc-don"
            className="px-6 py-3 rounded-full border border-gray-400 text-gray-800 font-medium hover:bg-gray-100 transition"
          >
            Xem thực đơn
          </a>
        </div>
      </div>
    </section>
  );
};

export default SectionHero;
