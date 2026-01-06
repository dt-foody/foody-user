import Image from "next/image";
import Link from "next/link";
import { blogPostService } from "@/services";
import { GroupedBlog } from "@/types";
import { getImageUrl } from "@/utils/imageHelper";
import ButtonPrimary from "@/shared/ButtonPrimary";

export const revalidate = 30;

export default async function BlogPage() {
  const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/claritylab";

  let data: GroupedBlog[] = [];
  try {
    data = await blogPostService.groupByCategory({
      limit: 20,
      displayPage: "community",
    });
  } catch (err) {
    console.error("❌ Failed to fetch blogs 1:", err);
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 min-h-screen py-6 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* ====== HEADER ====== */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-[#b9915f] mb-2 tracking-wide">
            Nơi các chương trình đồng hành được tổ chức và cập nhật.
          </h1>
          <p className="text-sm text-gray-600 mb-5">
            Cộng đồng sinh hoạt chính tại Facebook — bạn có thể tham gia tại đây
            để theo dõi đầy đủ thông tin.
          </p>
          <div>
            <ButtonPrimary targetBlank href={FACEBOOK_GROUP_URL}>👉 Tham gia cộng đồng Facebook</ButtonPrimary>
          </div>
        </div>

        {/* ====== EMPTY STATE ====== */}
        {data.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Hiện chưa có chương trình nào.</p>
            <p className="text-gray-400 text-sm mt-2">Hãy quay lại sau nhé!</p>
          </div>
        )}

        {/* ====== BLOG GROUPS ====== */}
        <div className="space-y-6">
          {data.map((group, idx) => (
            <article
              key={group.slug}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-md transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* --- CATEGORY HEADER --- */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#b9915f] to-[#d4a574] rounded-full"></div>
                  <h2 className="text-xl font-bold text-[#3b2f26]">
                    {group.category}
                  </h2>
                </div>
                <Link
                  href={`/community/category/${group.slug}`}
                  className="group flex items-center gap-2 text-sm font-medium text-[#b9915f] hover:text-[#8b6f47] transition-colors"
                  aria-label={`Xem tất cả bài viết về ${group.category}`}
                >
                  <span>Xem thêm</span>
                  <svg
                    className="w-4 h-4 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>

              {/* --- POSTS GRID --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {group.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.slug}`}
                    className="group flex gap-4 bg-gradient-to-br from-white to-orange-50/30 rounded-xl overflow-hidden p-4 border border-orange-100/50"
                    aria-label={`Đọc bài viết: ${post.title}`}
                  >
                    {/* IMAGE */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getImageUrl(post.coverImage)}
                        alt={post.coverImageAlt || post.title}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                      <h3 className="font-semibold text-[#3b2f26] text-base md:text-lg line-clamp-2 group-hover:text-[#b9915f] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#b9915f] font-medium group-hover:underline">
                          Đọc thêm
                        </span>
                        <svg
                          className="w-3 h-3 text-[#b9915f] group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* ====== BOTTOM CTA (Optional) ====== */}
        {data.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
