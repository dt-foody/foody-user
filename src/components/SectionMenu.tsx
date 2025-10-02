import { FC } from "react";
import { Coffee, Utensils, GlassWater, Cake } from "lucide-react"; // icon từ lucide-react

interface MenuItem {
  title: string;
  description: string;
  icon: JSX.Element;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Bữa sáng",
    description: "Khởi đầu ngày mới với thực đơn bữa sáng đa dạng và bổ dưỡng.",
    icon: <Coffee className="w-10 h-10 text-red-600" />,
    href: "#menu-breakfast",
  },
  {
    title: "Món chính",
    description: "Trải nghiệm các món ăn đặc sắc, tinh hoa ẩm thực từ đầu bếp của chúng tôi.",
    icon: <Utensils className="w-10 h-10 text-red-600" />,
    href: "#menu-main",
  },
  {
    title: "Đồ uống",
    description: "Tận hưởng hương vị tươi mát từ nước ép, cocktail, trà và cà phê.",
    icon: <GlassWater className="w-10 h-10 text-red-600" />,
    href: "#menu-drinks",
  },
  {
    title: "Tráng miệng",
    description: "Ngọt ngào và tinh tế với các loại bánh và món tráng miệng hấp dẫn.",
    icon: <Cake className="w-10 h-10 text-red-600" />,
    href: "#menu-desserts",
  },
];

const SectionMenu: FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Tiêu đề */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
          Khám phá Thực Đơn Của Chúng Tôi
        </h2>

        {/* Grid menu */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <a
                href={item.href}
                className="text-red-600 font-medium hover:underline"
              >
                Xem thực đơn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionMenu;
