'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import router để chuyển trang
import { initSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner'; // [UPDATE] Import từ sonner

export const useSocketListener = () => {
  const { user } = useAuthStore();
  const router = useRouter(); // Hook điều hướng

  useEffect(() => {
    const socket = initSocket();

    if (socket) {
      // Lắng nghe sự kiện toàn cục
      socket.on('order_status_changed', (data: any) => {
        console.log('🔔 Socket Notification:', data);

        // [UPDATE] Sử dụng Sonner
        toast.success('Cập nhật trạng thái đơn hàng', {
          description: data.message, // Hiện nội dung chi tiết ở dòng dưới
          duration: 5000,
          // Thêm nút hành động để xem chi tiết ngay
          action: {
            label: 'Xem ngay',
            onClick: () => {
              if (data.orderId) {
                router.push(`/account-orders/${data.orderId}`);
              }
            },
          },
        });

        // Nếu bạn dùng React Query và muốn reload dữ liệu ngầm
        // queryClient.invalidateQueries(['my-orders']);
      });
    }

    return () => {
      if (socket) {
        socket.off('order_status_changed');
      }
    };
  }, [user, router]); // Thêm router vào dependency

  useEffect(() => {
    if (!user) {
      disconnectSocket();
    }
  }, [user]);
};