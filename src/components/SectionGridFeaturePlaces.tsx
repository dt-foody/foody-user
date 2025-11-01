// app/[locale]/(server-components)/SectionGridFeaturePlaces.tsx
import ClientGridFeaturePlaces from "@/components/ClientGridFeaturePlaces";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

export const revalidate = 300; // ISR 5 phút

export default async function SectionGridFeaturePlaces() {
  try {
    // 1) Lấy categories level 1 (parent categories)
    const catRes = await categoryService.getAll({ level: 1 });
    const categories: Category[] = catRes?.results ?? [];

    // Lọc chỉ lấy parent categories (không có parent)
    const parentCategories = categories.filter((c) => !c.parent);

    if (parentCategories.length === 0) {
      return (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-2">Best Sellers</h2>
            <p className="text-gray-600">Chưa có danh mục nào.</p>
          </div>
        </section>
      );
    }

    const firstCategoryId = parentCategories[0].id;

    // 2) Lấy sản phẩm cho category đầu tiên
    let initialProducts: Product[] = [];
    let initialHasMore = false;

    const proRes = await productService.getAll({
      page: 1,
      limit: 8,
      category: firstCategoryId,
      isActive: true,
    });

    initialProducts = proRes?.results ?? [];
    const totalPages = proRes?.totalPages ?? 0;
    initialHasMore = 1 < totalPages;

    return (
      <ClientGridFeaturePlaces
        initialCategories={parentCategories}
        initialActiveTab={firstCategoryId}
        initialProducts={initialProducts}
        initialHasMore={initialHasMore}
        heading="Best Sellers"
        subHeading="Những món ăn được yêu thích nhất mà chúng tôi gợi ý cho bạn"
      />
    );
  } catch (error) {
    // Fallback UI khi có lỗi
    console.error("Error loading featured places:", error);
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-2">Best Sellers</h2>
          <p className="text-gray-600">
            Không thể tải danh sách món ăn. Vui lòng thử lại sau.
          </p>
        </div>
      </section>
    );
  }
}
