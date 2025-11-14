import { menuService } from '@/services/menu.service'; // Import service MỚI
import FoodyMenuClient from './FoodyMenuClient';

// revalidate mỗi 60 giây (1 phút)
export const revalidate = 60; 

export default async function FoodyMenuPage() {
  try {
    const menuData = await menuService.getMenu({});

    return (
      <FoodyMenuClient
        // Truyền các prop mới, đã được xử lý từ backend
        initialFlashSaleCategory={menuData.flashSaleCategory}
        initialFlashSales={menuData.flashSales || []}
        initialThucDon={menuData.thucDon || []}
        initialCombos={menuData.combos || []}
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