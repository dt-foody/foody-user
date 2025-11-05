import React from "react";
import SectionAds from "./SectionAds";
import SectionLatestPosts from "./SectionLatestPosts";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import WidgetTags from "@/app/[locale]/blog/WidgetTags";
import WidgetCategories from "@/app/[locale]/blog/WidgetCategories";

const BlogPage: React.FC = () => {
  // ✅ Tạo sidebar ở phía server
  const sidebarContent = (
    <>
      <WidgetTags />
      <WidgetCategories />
    </>
  );

  return (
    <div className="nc-BlogPage overflow-hidden relative">
      <div className="container relative">
        <SectionLatestPosts sidebar={sidebarContent} />
      </div>
    </div>
  );
};

export default BlogPage;
