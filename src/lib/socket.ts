import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/useAuthStore';

let socket: Socket | null = null;

export const initSocket = () => {
  const { user } = useAuthStore.getState(); // Lấy token trực tiếp từ Store
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 1. Nếu KHÔNG CÓ token -> Ngắt kết nối cũ (nếu có) và Return ngay
  if (!user) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // 2. Nếu đã có socket và đang kết nối -> Tái sử dụng
  if (socket && socket.connected) {
    return socket;
  }

  // 3. Khởi tạo kết nối mới
  socket = io(API_URL, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('🟢 Connected to Personal User Room');
  });

  socket.on('disconnect', () => {
    console.log('🔴 Disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};