// src/services/productService.ts

import { Product, ProductResponse } from "@/types/product";
import { apiFetch } from "@/utils/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

interface ApiError {
  message: string;
  statusCode: number;
}

export const productService = {
  /**
   * Fetch danh sách sản phẩm từ backend.
   * @returns {Promise<Product[]>} - Promise trả về danh sách sản phẩm
   */
  getProducts: async (query: {
    [key: string]: any;
  }): Promise<ProductResponse> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/products?${queryString}`;

    return await apiFetch<ProductResponse>(url);
  },

  /**
   * Fetch thông tin một sản phẩm theo ID.
   * @param id ID của sản phẩm cần lấy thông tin
   * @returns {Promise<Product>} - Promise trả về thông tin sản phẩm
   */
  getProductById: async (id: number): Promise<Product> => {
    return await apiFetch(`/products/${id}`);
  },

  /**
   * Tạo mới một sản phẩm.
   * @param productData Dữ liệu sản phẩm cần tạo
   * @returns {Promise<Product>} - Promise trả về thông tin sản phẩm vừa tạo
   */
  createProduct: async (productData: Omit<Product, "id">): Promise<Product> => {
    return await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  /**
   * Cập nhật thông tin sản phẩm.
   * @param id ID của sản phẩm cần cập nhật
   * @param productData Dữ liệu sản phẩm cần cập nhật
   * @returns {Promise<Product>} - Promise trả về sản phẩm sau khi cập nhật
   */
  updateProduct: async (id: number, productData: Product): Promise<Product> => {
    return await apiFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  /**
   * Xóa một sản phẩm.
   * @param id ID của sản phẩm cần xóa
   * @returns {Promise<void>} - Promise trả về khi xóa thành công
   */
  deleteProduct: async (id: number): Promise<void> => {
    return await apiFetch(`/products/${id}`, {
      method: "DELETE",
    });
  },
};
