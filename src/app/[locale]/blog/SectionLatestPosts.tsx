"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Heading from "@/shared/Heading";
import Pagination from "@/shared/Pagination";
import ButtonPrimary from "@/shared/ButtonPrimary";
import SkeletonCard from "@/components/SkeletonCard";
import Link from "next/link"; // Sử dụng Link của Next.js để tối ưu điều hướng
import { BlogPost } from "@/types";
import { blogPostService } from "@/services";

// 2. MAIN COMPONENT (Component chính)
// =================================================================
const SectionLatestPosts = ({ sidebar }: { sidebar: React.ReactNode }) => {
  // --- State Management ---
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Data Fetching ---
  const fetchPosts = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogPostService.getAll({
        limit: 5,
        page: pageNum,
        sortBy: "publishedAt:desc",
        status: "published",
        populate: "categories;tags",
      });

      // Nếu là trang 1 thì thay thế, từ trang 2 trở đi thì nối vào danh sách cũ
      setPosts((prevPosts) =>
        pageNum === 1 ? response.results : [...prevPosts, ...response.results]
      );
      setTotalPages(response.totalPages);
      setPage(response.page);
    } catch (err) {
      console.error("Lỗi khi tải bài viết:", err);
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    setPosts([]); // Xóa bài cũ để hiển thị skeleton
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchPosts(page + 1);
    }
  };

  // --- Helper Functions ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =================================================================
  // 3. RENDER LOGIC (Xử lý giao diện)
  // =================================================================

  // --- Error State ---
  if (error) {
    return (
      <div className="nc-SectionLatestPosts relative py-12">
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <ButtonPrimary onClick={() => fetchPosts(page)} className="mt-4">
            Thử lại
          </ButtonPrimary>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="nc-SectionLatestPosts relative py-12">
      <div className="flex flex-col lg:flex-row">
        {/* === CỘT BÀI VIẾT === */}
        <div className="w-full lg:w-3/5 xl:w-2/3 xl:pr-14">
          <Heading>Bài Viết Mới Nhất 🎈</Heading>

          {loading && posts.length === 0 ? (
            <div className="grid gap-6 md:gap-8 grid-cols-1">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* --- DANH SÁCH BÀI VIẾT --- */}
              <div className="grid gap-6 md:gap-8 grid-cols-1">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="nc-Card3 p-3 relative flex flex-col-reverse sm:flex-row sm:items-center rounded-2xl group overflow-hidden bg-white dark:bg-neutral-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col flex-grow p-4 sm:p-5">
                      <div className="space-y-3">
                        {/* Categories */}
                        {post.categories?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.categories.slice(0, 2).map((category) => (
                              <Link
                                key={category.id}
                                href={`/blog/category/${category.slug}`}
                                className="inline-flex px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                                style={{
                                  backgroundColor: category.backgroundColor,
                                  color: category.textColor,
                                }}
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Title */}
                        <h2 className="nc-card-title block text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="line-clamp-2 hover:text-primary-500 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </h2>

                        {/* Summary */}
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-2">
                          {post.summary}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 space-x-4">
                          {post.publishedAt ? (
                            <time dateTime={post.publishedAt}>
                              {formatDate(post.publishedAt)}
                            </time>
                          ) : null}
                          <span>•</span>
                          <span>{post.views || 0} lượt xem</span>
                          {post.isFeatured && (
                            <>
                              <span>•</span>
                              <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                                ⭐ Nổi bật
                              </span>
                            </>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Link
                                key={tag.id}
                                href={`/blog/tag/${tag.slug}`}
                                className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-neutral-300/60 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-300 hover:opacity-80"
                              >
                                # {tag.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="block flex-shrink-0 sm:w-56 sm:ml-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block w-full h-0 aspect-w-16 aspect-h-9 sm:aspect-h-16 rounded-2xl overflow-hidden"
                      >
                        <Image
                          fill
                          src={post.coverImage || ""}
                          alt={post.coverImageAlt || post.title}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* --- EMPTY STATE --- */}
              {posts.length === 0 && !loading && (
                <div className="text-center py-10">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Chưa có bài viết nào.
                  </p>
                </div>
              )}

              {/* --- PHÂN TRANG & XEM THÊM --- */}
              {posts.length > 0 && (
                <div className="flex flex-col mt-12 md:mt-20 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                  {page < totalPages && (
                    <ButtonPrimary loading={loading} onClick={handleLoadMore}>
                      Xem thêm
                    </ButtonPrimary>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* === CỘT WIDGET BÊN PHẢI === */}
        <div className="w-full space-y-7 mt-24 lg:mt-0 lg:w-2/5 lg:pl-10 xl:pl-0 xl:w-1/3">
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default SectionLatestPosts;
