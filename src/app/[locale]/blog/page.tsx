import React from "react";
import SectionAds from "./SectionAds";
import SectionLatestPosts from "./SectionLatestPosts";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import WidgetTags from "@/app/[locale]/blog/WidgetTags";
import WidgetCategories from "@/app/[locale]/blog/WidgetCategories";
import WidgetPosts from "@/app/[locale]/blog/WidgetPosts";

const BlogPage: React.FC = () => {
  // ✅ Tạo sidebar ở phía server
  const sidebarContent = (
    <>
      <WidgetTags />
      <WidgetCategories />
      <WidgetPosts />
    </>
  );

  return (
    <div className="nc-BlogPage overflow-hidden relative">
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />
      {/* ======== ALL SECTIONS ======== */}
      {/* ======= START CONTAINER ============= */}
      <div className="container relative">
        {/* === SECTION 1 === */}
        <SectionAds />

        {/* === SECTION 8 === */}
        <SectionLatestPosts sidebar={sidebarContent} />

        {/* === SECTION 1 === */}
        <SectionSubscribe2 className="pb-16 lg:pb-28" />
      </div>
    </div>
  );
};

export default BlogPage;
