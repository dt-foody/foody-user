"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/shared/Badge";
import { Route } from "@/routers/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  coverImageAlt: string;
  publishedAt: string;
  categories: any[];
  createdBy?: {
    id: string;
    name: string;
  };
}

interface RelatedPostsProps {
  authorId?: string;
  currentPostId: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const RelatedPosts = ({ authorId, currentPostId }: RelatedPostsProps) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!authorId) return;

    const fetchRelated = async () => {
      const res = await fetch(
        `${API_BASE}/v1/blog-posts?createdBy=${authorId}&limit=5&sortBy=publishedAt:desc&populate=createdBy;categories`
      );
      if (res.ok) {
        const data = await res.json();
        const filtered =
          data.results?.filter((p: BlogPost) => p.id !== currentPostId) || [];
        setRelatedPosts(filtered.slice(0, 4));
      }
    };

    fetchRelated();
  }, [authorId, currentPostId]);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="relative bg-neutral-100 dark:bg-neutral-800 py-12 mt-12">
      <div className="container">
        <h2 className="text-3xl font-semibold">Related posts</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {relatedPosts.map((post) => {
            const authorName = post.createdBy
              ? `${post.createdBy.name}`
              : "Anonymous";

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}` as Route}
                className="group flex flex-col bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image Section */}
                <div className="relative aspect-w-4 aspect-h-3 w-full overflow-hidden">
                  <Image
                    className="object-cover w-full h-48 transform group-hover:scale-105 transition-transform duration-300"
                    src={post.coverImage}
                    width={400}
                    height={300}
                    alt={post.coverImageAlt || post.title}
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-5 space-y-3 pt-0">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
                    {post.title}
                  </h3>

                  {/* Author and Date */}
                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-auto">
                    <span className="font-medium truncate">{authorName}</span>
                    <span className="mx-2">·</span>
                    <span className="truncate">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  {/* Category Badge */}
                  {post.categories && post.categories.length > 0 && (
                    <div>
                      <Badge name={post.categories[0].name} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RelatedPosts;
