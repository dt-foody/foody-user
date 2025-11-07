import { BlogPost, BlogPostPaginate, GroupedBlog } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const blogPostService = {
  getAll: async (query: { [key: string]: any }): Promise<BlogPostPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/blog-posts?${queryString}`;

    return await apiFetch<BlogPostPaginate>(url);
  },
  
  getById: async (id: number): Promise<BlogPost> => {
    return await apiFetch(`/blog-posts/${id}`);
  },

  getBySlug: async (slug: string, query: { [key: string]: any }): Promise<BlogPost> => {
    const queryString = new URLSearchParams(query).toString();
    return await apiFetch(`/blog-posts/${slug}?${queryString}`);
  },

  groupByCategory: async (query: {
      [key: string]: any;
    }): Promise<GroupedBlog[]> => {
      const queryString = new URLSearchParams(query).toString();
      const url = `/blog-posts/group-by-category?${queryString}`;
  
      return await apiFetch<GroupedBlog[]>(url);
    },
};
