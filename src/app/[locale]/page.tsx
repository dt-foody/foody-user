"use client";

import React from "react";
import Image from "next/image";
import HompageLeft from "@/images/homepage-left.jpg"

function PageHome() {
  return (
    <main role="main" className="nc-PageHome relative overflow-hidden">
      <div className="container relative mt-8 mb-16">
        {/* Section Giới thiệu */}
        <section className="flex flex-col md:flex-row gap-8 p-6 md:p-10 rounded-2xl shadow-sm bg-white">
          {/* Hình ảnh bên trái */}
          <div className="flex-shrink-0 w-full md:w-1/4">
            <div className="rounded-lg overflow-hidden">
              <Image
                src={HompageLeft}
                alt="Không gian Lưu Chi"
                width={300}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="md:w-3/4 text-justify leading-relaxed text-lg text-neutral-800">
            <p>
              <strong className="text-xl text-neutral-900">Lưu Chi</strong> thực ra không phải cà phê, 
              mà là một <strong>gia đình</strong> — là nơi mọi người xích lại gần nhau, 
              đề cao giá trị kết nối con người và sẻ chia thân tình bên những tách cà phê, 
              ly trà đượm hương, truyền cảm hứng về lối sống hiện đại.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default PageHome;
