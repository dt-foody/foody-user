import { NavItemType } from "@/shared/Navigation/NavigationItem";
import ncNanoId from "@/utils/ncNanoId";

export const NAVIGATION_DEMO: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Trang chủ",
    type: "dropdown",
    // children: demoChildMenus, // có thể thêm menu con nếu cần
    isNew: true,
  },
  {
    id: ncNanoId(),
    href: "/menu",
    name: "Thực đơn",
    type: "megaMenu",
    // megaMenu: megaMenuDemo, // có thể thêm mega menu nếu cần
  },
  {
    id: ncNanoId(),
    href: "/hot-deal",
    name: "Khuyến mãi",
    type: "megaMenu",
  },
  {
    id: ncNanoId(),
    href: "/blog",
    name: "Blog & Mẹo ẩm thực",
    type: "dropdown",
    // children: otherPageChildMenus, // thêm con nếu muốn
  },
  {
    id: ncNanoId(),
    href: "/membership",
    name: "Thành viên",
    type: "dropdown",
  },
  {
    id: ncNanoId(),
    href: "/about",
    name: "Giới thiệu",
    type: "megaMenu",
  },
];
