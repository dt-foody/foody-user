import React from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  postCount: number;
}

export default async function WidgetCategories() {
  let categories: BlogCategory[] = [];

  try {
    const res = await fetch(
      `${API_BASE}/v1/public/blog-categories?limit=10&sortBy=postCount:desc`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      categories = data.results || [];
    }
  } catch (err) {
    console.log("ERROR categories", err);
  }

  // không hiện nếu rỗng
  if (!categories.length) return null;

  return (
    <div className="rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <span className="font-semibold flex items-center gap-1">
          ✨ Trending topic
        </span>
        <Link
          href="/blog/categories"
          className="text-sm font-medium text-primary-600"
        >
          View all
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/blog/category/${c.slug}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
          >
            {/* Image */}
            {c.coverImage ? (
              <img
                src={c.coverImage}
                className="w-10 h-10 rounded-lg object-cover"
                alt={c.name}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            )}

            {/* Text */}
            <div className="flex flex-col leading-tight">
              <span className="font-medium">{c.name}</span>

              {c.postCount > 0 && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {c.postCount} Articles
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
