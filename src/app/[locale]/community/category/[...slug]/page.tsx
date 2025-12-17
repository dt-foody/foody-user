import Image from "next/image";
import Link from "next/link";
import { blogPostService } from "@/services";
import { notFound } from "next/navigation";
import { BlogPost } from "@/types";
import { getImageUrl } from "@/utils/imageHelper";

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export const revalidate = 30;

export default async function BlogCategoryPage({
  params,
  searchParams,
}: Props) {
  const { slug } = params;
  const page = Number(searchParams.page || 1);

  let posts: BlogPost[] = [];
  let totalPages = 1;
  let categoryName = "";

  try {
    const data = await blogPostService.getAll({
      categorySlug: slug,
      limit: 6,
      page,
    });

    console.log("data blog by category", data);

    posts = data.results;
    totalPages = data.totalPages;
    categoryName = posts[0]?.categories?.[0]?.name || slug;
  } catch (err) {
    console.error("❌ Failed to fetch category posts:", err);
    return notFound();
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 min-h-screen py-10 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* === HEADER === */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#b9915f] mb-2 capitalize">
            {categoryName}
          </h1>
          <p className="text-sm text-gray-600">
            Tất cả bài viết thuộc chủ đề &quot;{categoryName}&quot;
          </p>
        </div>

        {/* === LIST === */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm text-gray-500">
            Hiện chưa có bài viết nào.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.slug}`}
                className="group block bg-white/90 border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  <Image
                    src={getImageUrl(post.coverImage)}
                    alt={post.coverImageAlt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-[#3b2f26] group-hover:text-[#b9915f] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {post.summary}
                  </p>
                  <div className="mt-2 text-xs text-[#b9915f] font-medium group-hover:underline">
                    Đọc thêm →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* === PAGINATION === */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Link
                  key={i}
                  href={`/community/category/${slug}?page=${pageNum}`}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                    pageNum === page
                      ? "bg-[#b9915f] text-white border-[#b9915f]"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-amber-50"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
