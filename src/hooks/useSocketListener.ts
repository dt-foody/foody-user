"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router để chuyển trang
import { initSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner"; // [UPDATE] Import từ sonner

export const useSocketListener = () => {
  const { user } = useAuthStore();
  const router = useRouter(); // Hook điều hướng

  useEffect(() => {
    const socket = initSocket();

    if (socket) {
      // Lắng nghe sự kiện toàn cục
      socket.on("order_status_changed", (data: any) => {
        console.log("🔔 Socket Notification:", data);

        // [UPDATE] Sử dụng Sonner
        toast.success("Cập nhật trạng thái đơn hàng", {
          description: data.message, // Hiện nội dung chi tiết ở dòng dưới
          duration: 5000,
          // Thêm nút hành động để xem chi tiết ngay
          action: {
            label: "Xem ngay",
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

      socket.on("notification_received", (data: any) => {
        console.log("🔔 Socket Notification:", data);

        // Phát âm thanh thông báo nhẹ (nếu muốn)
        // const audio = new Audio('/sounds/notification.mp3');
        // audio.play().catch(() => {});

        // Hiển thị Toast
        toast.info(data.payload.title || "Thông báo mới", {
          description: data.payload.content,
          duration: 5000,
          // Nếu có link đính kèm (ví dụ link tới đơn hàng)
          action: data.payload.referenceId
            ? {
                label: "Chi tiết",
                onClick: () => {
                  // Logic điều hướng tuỳ theo referenceModel
                  if (data.payload.referenceModel === "Order") {
                    router.push(`/account-orders/${data.payload.referenceId}`);
                  }
                },
              }
            : undefined,
        });

        // Dispatch sự kiện custom để FloatingContact cập nhật lại số lượng badge
        // (Cách đơn giản để giao tiếp giữa các component không cùng cha con mà không cần Redux/Context phức tạp)
        window.dispatchEvent(new Event("REFRESH_NOTIFICATIONS"));
      });
    }

    return () => {
      if (socket) {
        socket.off("order_status_changed");
        socket.off("notification_received");
      }
    };
  }, [user, router]); // Thêm router vào dependency

  useEffect(() => {
    if (!user) {
      disconnectSocket();
    }
  }, [user]);
};
