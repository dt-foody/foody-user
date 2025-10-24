// app/[locale]/(server-components)/SectionMenu.tsx
import ClientMenuSlider from "@/components/ClientMenuSlider";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";

export const revalidate = 300; // 5 phút (tùy chỉnh)

export default async function SectionMenu() {
  // Public data → cache ISR + tag để revalidate theo sự kiện
  const res = await fetch(
    `${API_BASE}/v1/public/categories?level=1`,
    { next: { revalidate: 300, tags: ["categories"] } }
  );

  if (!res.ok) {
    // Trả fallback server-side, không ném lỗi để giữ trang home ổn định
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Khám Phá Thực Đơn
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Những món ăn đặc sắc được chế biến từ nguyên liệu tươi ngon nhất
          </p>
          <div className="inline-flex items-center gap-3 rounded-lg border px-4 py-3 text-red-600 bg-white">
            Không thể tải danh mục. Vui lòng thử lại sau.
          </div>
        </div>
      </section>
    );
  }

  const data = await res.json();
  const categories = Array.isArray(data?.results) ? data.results : [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Khám Phá Thực Đơn
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Những món ăn đặc sắc được chế biến từ nguyên liệu tươi ngon nhất
          </p>
        </div>

        {/* Truyền data đã SSR xuống client để slider hóa */}
        <ClientMenuSlider categories={categories} assetBase={API_BASE} />
      </div>
    </section>
  );
}
