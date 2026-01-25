"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, X, Headset, Bell, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
// --- 1. Import thêm UI Components ---
import NcModal from "@/shared/NcModal";
import ButtonPrimary from "@/shared/ButtonPrimary";

// --- COMPONENT: FLOATING NOTIFICATION ---
const FloatingNotification = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // State cho danh sách và phân trang
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- 2. State cho Popup Referral ---
  const [showModal, setShowModal] = useState(false);
  const [selectedNotify, setSelectedNotify] = useState<any>(null);

  const LIMIT = 5;
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Lấy số lượng chưa đọc
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      const count = typeof data === "number" ? data : data?.unreadCount || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo:", error);
    }
  };

  // 2. Lấy danh sách thông báo
  const fetchNotifications = async (currentPage = 1, isAppend = false) => {
    try {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      const data = await notificationService.getNotifications({
        limit: LIMIT,
        page: currentPage,
        sortBy: "createdAt:desc",
      });

      if (data && data.results) {
        if (isAppend) {
          setNotifications((prev) => [...prev, ...data.results]);
        } else {
          setNotifications(data.results);
        }

        if (data.results.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setPage(currentPage);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 3. Load More
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  // --- 3. Xử lý Click vào thông báo (Sửa đổi) ---
  const handleItemClick = async (notification: Notification) => {
    // A. Xử lý Mark as Read (Chỉ gọi API nếu chưa đọc)
    if (!notification.isRead) {
      try {
        const id = notification.id || notification._id;
        if (id) {
          await notificationService.markAsRead(id);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id || n._id === id ? { ...n, isRead: true } : n,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (e) {
        console.error("Lỗi đánh dấu đã đọc:", e);
      }
    }

    // B. Xử lý mở Popup Referral
    if (notification.type === "REFERRAL_INFO") {
      setSelectedNotify(notification);
      setShowModal(true);
      setIsOpen(false); // Đóng danh sách thông báo lại cho gọn
    }
  };

  // --- 4. Hàm render nội dung Modal ---
  const renderModalContent = () => {
    if (!selectedNotify) return null;

    // Lấy nội dung từ content hoặc message (tùy backend trả về)
    const contentText = selectedNotify.content || selectedNotify.message || "";

    return (
      <div className="flex flex-col space-y-5 text-center">
        <div className="space-y-2 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          {contentText.split("\n").map((line: string, index: number) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        {selectedNotify.data?.actionLink && (
          <div className="pt-4 flex justify-center">
            <ButtonPrimary
              href={selectedNotify.data.actionLink}
              onClick={() => setShowModal(false)}
            >
              {selectedNotify.data.actionLabel || "Xem ngay"}
            </ButtonPrimary>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }

    const handleRefresh = () => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications(1, false);
    };

    window.addEventListener("REFRESH_NOTIFICATIONS", handleRefresh);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("REFRESH_NOTIFICATIONS", handleRefresh);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      setPage(1);
      setHasMore(true);
      fetchNotifications(1, false);
    }
  }, [isOpen, user]);

  if (!user) return null;

  return (
    <>
      <div className="relative group" ref={containerRef}>
        {/* --- PANEL DANH SÁCH THÔNG BÁO --- */}
        <div
          className={`absolute bottom-14 right-0 w-80 sm:w-96 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Thông báo ({unreadCount})
            </h3>
            <Link
              href="/account-orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500"
            >
              Xem tất cả đơn hàng
            </Link>
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500 animate-pulse flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2 text-neutral-500">
                <Bell size={32} className="opacity-20" />
                <span className="text-xs">Bạn chưa có thông báo nào.</span>
              </div>
            ) : (
              <>
                {notifications.map((item) => (
                  <div
                    key={item.id || item._id}
                    onClick={() => handleItemClick(item)} // Sử dụng hàm handleItemClick mới
                    className={`group flex p-3 gap-3 border-b border-neutral-50 dark:border-neutral-700/50 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                      !item.isRead
                        ? "bg-orange-50/60 dark:bg-neutral-700/30"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${
                        item.type === "ORDER_STATUS"
                          ? "bg-blue-500"
                          : item.type === "PROMOTION"
                            ? "bg-pink-500"
                            : item.type === "REFERRAL_INFO" // Màu icon cho referral
                              ? "bg-purple-500"
                              : "bg-primary-500"
                      }`}
                    >
                      {item.type === "PROMOTION" ? (
                        <span className="las la-gift text-xl"></span>
                      ) : item.type === "REFERRAL_INFO" ? (
                        <span className="las la-users text-xl"></span>
                      ) : (
                        <span className="las la-bell text-xl"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p
                          className={`text-sm line-clamp-1 ${!item.isRead ? "font-bold text-neutral-900 dark:text-white" : "font-medium text-neutral-700 dark:text-neutral-200"}`}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-1.5 leading-relaxed">
                        {item.content}
                      </p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                        {item.createdAt
                          ? formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="p-3 text-center border-t border-neutral-50 dark:border-neutral-700/50">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500 hover:underline disabled:opacity-50 flex items-center justify-center gap-2 w-full"
                    >
                      {isLoadingMore && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      {isLoadingMore
                        ? "Đang tải thêm..."
                        : "Xem thêm thông báo cũ"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* --- NÚT CHUÔNG --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 border border-neutral-200 dark:border-neutral-700 ${
            isOpen
              ? "bg-primary-50 text-primary-600 scale-110 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-neutral-900"
              : "bg-white text-neutral-600 hover:bg-neutral-50 hover:scale-110 hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-200"
          }`}
          title="Thông báo"
        >
          <Bell size={22} className={unreadCount > 0 ? "animate-swing" : ""} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md ring-2 ring-white dark:ring-neutral-900 animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* --- 5. RENDER MODAL POPUP --- */}
      <NcModal
        isOpenProp={showModal}
        onCloseModal={() => setShowModal(false)}
        contentExtraClass="max-w-screen-md"
        renderContent={renderModalContent}
        renderTrigger={() => null}
        modalTitle={selectedNotify?.title || "Thông báo từ Lưu Chi"}
      />
    </>
  );
};

// --- ICON MESSENGER (Giữ nguyên) ---
const MessengerIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g id="SVGRepo_iconCarrier">
      <path
        d="M17.3 9.6C17.6314 9.15817 17.5418 8.53137 17.1 8.2C16.6582 7.86863 16.0314 7.95817 15.7 8.4L13.3918 11.4776L11.2071 9.29289C11.0021 9.08791 10.7183 8.98197 10.4291 9.00252C10.1399 9.02307 9.87393 9.16809 9.7 9.4L6.7 13.4C6.36863 13.8418 6.45817 14.4686 6.9 14.8C7.34183 15.1314 7.96863 15.0418 8.3 14.6L10.6082 11.5224L12.7929 13.7071C12.9979 13.9121 13.2817 14.018 13.5709 13.9975C13.8601 13.9769 14.1261 13.8319 14.3 13.6L17.3 9.6Z"
        fill="#ffffff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z"
        fill="#ffffff"
      />
    </g>
  </svg>
);

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center">
      {/* 1. NÚT CHÍNH (TOGGLE) */}
      <div className="relative group z-20">
        <button
          onClick={toggleMenu}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white transition-all duration-300 ${
            isOpen
              ? "bg-primary-500 rotate-90"
              : "bg-primary-6000 hover:scale-110"
          }`}
          title="Liên hệ với Lưu Chi"
        >
          {isOpen ? <X size={24} /> : <Headset size={24} />}
        </button>
      </div>

      {/* 2. DANH SÁCH CÁC NÚT CON */}
      <div
        className={`flex flex-col items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60 opacity-100 mb-3" : "max-h-0 opacity-0 mb-0"
        }`}
      >
        {/* Nút Gọi Hotline */}
        <a
          href="tel:0889058678"
          className="group relative flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        >
          <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
            0889.058.678
          </span>
          <Phone size={22} />
        </a>

        {/* Nút Messenger */}
        <a
          href="https://m.me/claritylab.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 bg-[#0084FF] text-white rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        >
          <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
            Chat Messenger
          </span>
          <MessengerIcon size={22} />
        </a>
      </div>

      {/* 3. ICON NOTIFICATION */}
      <div className="mb-3 transition-all duration-300 z-10">
        <FloatingNotification />
      </div>
    </div>
  );
};

export default FloatingContact;
