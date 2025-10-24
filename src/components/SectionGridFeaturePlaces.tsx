// app/[locale]/(server-components)/SectionGridFeaturePlaces.tsx
import ClientGridFeaturePlaces from "@/components/ClientGridFeaturePlaces";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

export const revalidate = 300; // ISR 5 phút

type Category = { 
  id: string; 
  name: string; 
  parent: string | null;
  image?: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  thumbnailUrl: string;
  category: string;
  isActive: boolean;
  priority: number;
};

export default async function SectionGridFeaturePlaces() {
  try {
    // 1) Lấy categories level 1 (parent categories)
    const catRes = await fetch(`${API_BASE}/v1/public/categories?level=1`, {
      next: { revalidate: 300, tags: ["categories"] },
    });

    if (!catRes.ok) {
      throw new Error("Không thể tải danh mục");
    }

    const catData = await catRes.json();
    const categories: Category[] = catData?.results ?? [];

    // Lọc chỉ lấy parent categories (không có parent)
    const parentCategories = categories.filter(c => !c.parent);

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

    const proRes = await fetch(
      `${API_BASE}/v1/public/products?category=${encodeURIComponent(firstCategoryId)}&page=1&limit=8&isActive=true`,
      { 
        next: { 
          revalidate: 300, 
          tags: ["products", `category:${firstCategoryId}`] 
        } 
      }
    );

    if (proRes.ok) {
      const proData = await proRes.json();
      initialProducts = proData?.results ?? [];
      const totalPages = proData?.totalPages ?? 0;
      initialHasMore = 1 < totalPages;
    }

    return (
      <ClientGridFeaturePlaces
        apiBase={API_BASE}
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