// foody-user/src/app/[locale]/menu/page.tsx
import {
  categoryService,
  pricePromotionService,
  productService,
} from "@/services";
import FoodyMenuClient from "./FoodyMenuClient";
import { PricePromotion } from "@/types";

export const revalidate = 1; // revalidate mỗi phút (tùy chỉnh)
const ITEMS_PER_PAGE = 1000;

export default async function FoodyMenuPage() {
  try {
    const [catData, promoData, groupedProducts] = await Promise.all([
      categoryService.getAll({ level: 1 }),
      pricePromotionService.getAll({
        populate: "product;combo",
        isActive: true,
        limit: ITEMS_PER_PAGE,
      }),
      productService.groupByCategory({ page: 1, limit: ITEMS_PER_PAGE }),
    ]);

    const validPromotions = (promoData.results || [])
      .filter(
        (p: PricePromotion) =>
          (p.product && typeof p.product === "object") ||
          (p.combo && typeof p.combo === "object")
      )
      .map((p: PricePromotion) => {
        const item: any = p.product || p.combo;
        const basePrice = item?.basePrice ?? item?.comboPrice ?? 0;
        let originalPrice = basePrice;
        let finalPrice = basePrice;
        if (p.discountType === "percentage") {
          finalPrice = basePrice * (1 - p.discountValue / 100);
        } else {
          finalPrice = basePrice - p.discountValue;
        }
        if (finalPrice < 0) finalPrice = 0;
        return {
          ...p,
          item,
          discount: item,
          originalPrice,
          price: Number(finalPrice.toFixed(0)),
        };
      });

    return (
      <FoodyMenuClient
        initialCategories={catData?.results || []}
        initialPromotions={validPromotions || []}
        initialGroupedProducts={groupedProducts || []}
      />
    );
  } catch (err: any) {
    return (
      <div className="p-10 text-center text-red-600">
        Lỗi tải dữ liệu menu: {err?.message || "Không xác định"}
      </div>
    );
  }
}
