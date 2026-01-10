import { menuService } from '@/services/menu.service'; // Import service MỚI
import FoodyMenuClient from './FoodyMenuClient';

// revalidate mỗi 60 giây (1 phút)
export const revalidate = 0; 

export default async function FoodyMenuPage() {
  try {
    const menuData = await menuService.getMenu({});

    return (
      <FoodyMenuClient
        // Truyền các prop mới, đã được xử lý từ backend
        initialFlashSaleCategory={menuData.flashSaleCategory}
        initialThucDon={menuData.thucDon || []}
        initialCombos={menuData.combos || []}
        descriptionCombo={menuData.descriptionCombo || ""}
      />
    );
  } catch (err: any) {
    return (
      <div className="p-10 text-center text-red-600">
        Lỗi tải dữ liệu menu: {err?.message || 'Không xác định'}
      </div>
    );
  }
}