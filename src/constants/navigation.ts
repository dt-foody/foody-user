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
  },
  {
    id: ncNanoId(),
    href: "/blog",
    name: "1001 đêm",
    type: "dropdown",
  },
  {
    id: ncNanoId(),
    href: "/about",
    name: "Ấn tượng",
    type: "megaMenu",
  },
];
