"use client";
import { FC, useState } from "react";
import Image from "next/image";

interface MenuItem {
  title: string;
  price: string;
  description: string;
  image: string;
  category: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Trứng ốp la",
    price: "9.99",
    description: "Làm từ trứng, xà lách, muối, dầu và các nguyên liệu khác.",
    image: "/images/fried-eggs.jpg",
    category: "breakfast",
  },
  {
    title: "Pizza Hawaii",
    price: "15.99",
    description: "Kết hợp phô mai, dứa và giăm bông độc đáo.",
    image: "/images/hawaiian-pizza.jpg",
    category: "main",
  },
  {
    title: "Cocktail Martinez",
    price: "7.25",
    description: "Cocktail cổ điển với hương vị đậm đà.",
    image: "/images/martinez-cocktail.jpg",
    category: "drinks",
  },
  {
    title: "Bánh Butterscotch",
    price: "20.99",
    description: "Bánh ngọt thơm béo từ bơ và caramel.",
    image: "/images/butterscotch-cake.jpg",
    category: "desserts",
  },
  {
    title: "Bánh Waffle Truyền Thống",
    price: "12.99",
    description: "Ngon miệng với trái cây tươi và kem.",
    image: "/images/classic-waffles.jpg",
    category: "bestsellers",
  },
  {
    title: "Burger Phô Mai",
    price: "12.55",
    description: "Thịt bò nướng kết hợp phô mai tan chảy.",
    image: "/images/cheeseburger.jpg",
    category: "bestsellers",
  },
];

const tabs = [
  { key: "breakfast", label: "Bữa sáng" },
  { key: "main", label: "Món chính" },
  { key: "drinks", label: "Đồ uống" },
  { key: "desserts", label: "Tráng miệng" },
  { key: "bestsellers", label: "Best Sellers" },
];

const SectionMenuTabs: FC = () => {
  const [activeTab, setActiveTab] = useState("bestsellers");

  const filteredItems = menuItems.filter(
    (item) => item.category === activeTab
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">
          Thực Đơn
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full border transition font-medium ${
                activeTab === tab.key
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={250}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <p className="text-lg font-bold text-red-600 mb-2">
                  ${item.price}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionMenuTabs;
