import React from "react";
import I404Png from "@/images/404.png";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";

const Page404 = () => (
  <div className="nc-Page404">
    <div className="container relative pt-5 pb-16 lg:pb-20 lg:pt-5">
      {/* HEADER */}
      <header className="text-center max-w-2xl mx-auto space-y-2">
        <Image src={I404Png} alt="Không tìm thấy trang" />
        <span className="block text-sm text-neutral-800 sm:text-base dark:text-neutral-200 tracking-wider font-medium">
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
        </span>
        <div className="pt-8">
          <ButtonPrimary href="/">Quay về trang chủ</ButtonPrimary>
        </div>
      </header>
    </div>
  </div>
);

export default Page404;
