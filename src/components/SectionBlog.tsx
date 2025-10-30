import { FC } from "react";
import Image from "next/image";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  coverImageAlt: string;
  publishedAt: string;
  isPinned: boolean;
  isFeatured: boolean;
  categories: string[];
  tags: string[];
}

// Server-side data fetching
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(
      `${API_BASE}/v1/blog-posts?isPinned=true&limit=5&sortBy=publishedAt:desc`,
      {
        next: { revalidate: 3600 }, // Revalidate mỗi 1 giờ
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch blog posts");
    }

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const SectionBlog: FC = async () => {
  const blogPosts = await getBlogPosts();

  if (blogPosts.length === 0) {
    return null;
  }

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Blog & Bài Viết
          </h2>
          <ButtonSecondary href="/blog" className="!leading-none">
            <div className="flex items-center justify-center">
              <span>Tất cả</span>
              <ArrowRightIcon className="w-5 h-5 ml-3" />
            </div>
          </ButtonSecondary>
        </div>

        {/* Grid layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bài viết lớn */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
            <a href={`/blog/${featuredPost.slug}`}>
              <div className="relative w-full h-80">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.coverImageAlt || featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-500">
                    {formatDate(featuredPost.publishedAt)}
                  </p>
                  {featuredPost.isPinned && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Ghim
                    </span>
                  )}
                  {featuredPost.isFeatured && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Nổi bật
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                  {featuredPost.summary}
                </p>
              </div>
            </a>
          </div>

          {/* Bài viết nhỏ */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {otherPosts.map((post) => (
              <a
                key={post._id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative w-full h-40">
                  <Image
                    src={post.coverImage}
                    alt={post.coverImageAlt || post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-gray-500">
                      {formatDate(post.publishedAt)}
                    </p>
                    {post.isPinned && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Ghim
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionBlog;
