"use client";

import { Popover, Transition } from "@headlessui/react";
import { FC, Fragment } from "react";
import Avatar from "@/shared/Avatar";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Import ảnh avatar (giữ nguyên)
import avatar4 from "@/images/avatars/Image-4.png";
import avatar5 from "@/images/avatars/Image-5.png";
import avatar6 from "@/images/avatars/Image-6.png";

// --- BẮT ĐẦU THAY ĐỔI ---
// Dữ liệu thông báo giả (placeholder) bằng tiếng Việt
const notifications = [
  {
    name: "Tuấn Trần",
    description: "Vừa đặt một đơn hàng mới.",
    time: "3 phút trước",
    href: "##", // Sẽ thay bằng link đơn hàng
    avatar: avatar4,
  },
  {
    name: "Lê Minh",
    description: "Đã để lại một đánh giá cho món Bún Bò.",
    time: "1 phút trước",
    href: "##", // Sẽ thay bằng link đánh giá
    avatar: avatar5,
  },
  {
    name: "Hệ thống",
    description: "Một voucher mới đã được thêm vào ví của bạn.",
    time: "3 phút trước",
    href: "##", // Sẽ thay bằng link tới ví voucher
    avatar: avatar6, // Có thể dùng icon hệ thống thay vì avatar
  },
];
// --- KẾT THÚC THAY ĐỔI ---

interface Props {
  user?: any;
  className?: string;
}

const NotifyDropdown: FC<Props> = ({ user = null, className = "" }) => {
  const isLoggedIn = !!user;

  // TODO: Khi isLoggedIn là true, bạn sẽ cần logic để fetch
  // thông báo thật của user (triển khai sau).
  // Mảng `notifications` ở trên chỉ là placeholder.

  return (
    <>
      <Popover className={`relative flex ${className}`}>
        {({ open }) => (
          <>
            <Popover.Button
              className={` ${
                open ? "" : "text-opacity-90"
              } group self-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center justify-center text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
            >
              {isLoggedIn && (
                <span className="w-2 h-2 bg-primary-500 absolute top-2 right-2 rounded-full"></span>
              )}
              <BellIcon className="h-6 w-6" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-screen max-w-xs sm:max-w-sm px-4 top-full -right-28 sm:right-0 sm:px-0">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  {!isLoggedIn ? (
                    // ----- TRƯNG HỢP 1: CHƯA ĐĂNG NHẬP -----
                    <div className="relative bg-white dark:bg-neutral-800 p-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vui lòng{" "}
                        <Link
                          href="/login" // Thay bằng đường dẫn trang đăng nhập
                          className="font-medium text-primary-6000 dark:text-primary-500 hover:underline"
                        >
                          đăng nhập
                        </Link>{" "}
                        để nhận nhiều ưu đãi và thông báo mới nhất.
                      </p>
                    </div>
                  ) : (
                    // ----- TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP -----
                    <div className="relative grid gap-6 bg-white dark:bg-neutral-800 p-6">
                      {/* --- THAY ĐỔI --- */}
                      <h3 className="text-xl font-semibold">Thông báo</h3>
                      {/* --- KẾT THÚC THAY ĐỔI --- */}

                      {/* TODO: Thay thế mảng 'notifications' bằng dữ liệu thật */}
                      {notifications.map((item, index) => (
                        <a
                          key={index}
                          href={item.href}
                          className="flex p-2 pr-8 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 relative"
                        >
                          <Avatar
                            imgUrl={item.avatar}
                            sizeClass="w-8 h-8 sm:w-12 sm:h-12"
                          />
                          <div className="ml-3 sm:ml-4 space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                              {item.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                              {item.time}
                            </p>
                          </div>
                          {/* Dấu chấm 'chưa đọc' - bạn có thể thêm logic cho cái này */}
                          <span className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500"></span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
};

export default NotifyDropdown;
