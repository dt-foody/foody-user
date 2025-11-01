import React from "react";
import WidgetHeading1 from "./WidgetHeading1";
import Tag from "@/shared/Tag";
import { blogTagService } from "@/services";
import { BlogTag } from "@/types";

interface WidgetTagsProps {
  className?: string;
}

// 2. Chuyển component thành `async` để fetch dữ liệu
const WidgetTags = async ({
  className = "bg-neutral-100 dark:bg-neutral-800",
}: WidgetTagsProps) => {
  let tags: BlogTag[] = [];

  // 3. Fetch dữ liệu bên trong Server Component
  try {
    const res = await blogTagService.getAll({
      limit: 20,
      sortBy: "postCount:desc",
    });

    tags = res.results || [];
  } catch (error) {
    console.error("Error in WidgetTags:", error);
    return null; // Không render component nếu có lỗi mạng
  }

  // Nếu không có tag nào, cũng không cần hiển thị
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`nc-WidgetTags rounded-3xl overflow-hidden ${className}`}>
      <WidgetHeading1
        title="🏷️ Khám phá thêm"
        viewAll={{ label: "Xem tất cả", href: "/blog/tags" }}
      />
      <div className="flex flex-wrap p-4 xl:p-5">
        {tags.map((tag) => (
          // 4. Truyền dữ liệu thật vào component Tag
          <Tag className="mr-2 mb-2" key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  );
};

export default WidgetTags;
