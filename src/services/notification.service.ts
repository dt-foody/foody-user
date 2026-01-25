// src/services/notification.service.ts
import { apiFetch } from "@/lib/api";

// Định nghĩa kiểu dữ liệu cơ bản cho Notification (tuỳ chỉnh theo model thực tế của bạn)
export interface Notification {
  id: string;
  _id?: string; // Fallback nếu backend trả về _id
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: string;
  referenceModel?: string;
}

export const notificationService = {
  // Lấy danh sách thông báo (có phân trang)
  getNotifications: async (query: { [key: string]: any }) => {
    const queryString = new URLSearchParams(query).toString();
    // Giả định apiFetch đã cấu hình base URL bao gồm /v1 (như ví dụ customerService của bạn)
    // Nếu chưa, hãy sửa thành '/v1/notifications'
    return await apiFetch<{ results: Notification[]; totalResults: number }>(`/notifications?${queryString}`);
  },

  // Lấy số lượng chưa đọc
  getUnreadCount: async () => {
    // Backend trả về { unreadCount: number } hoặc số trực tiếp
    return await apiFetch<{ unreadCount: number } | number>(`/notifications/unread-count`);
  },

  // Đánh dấu đã đọc
  markAsRead: async (id: string) => {
    return await apiFetch(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },
};