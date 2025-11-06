"use client";

import React from "react";

interface Category {
  id: string;
  name: string;
  type: "category" | "combo";
}

interface MenuCategoryProps {
  categories: { id: string; name: string }[];
  activeTab: { id: string; type: "category" | "combo" };
  onTabClick: (type: "category" | "combo", id: string) => void;
}

export default function MenuCategory({
  categories,
  activeTab,
  onTabClick,
}: MenuCategoryProps) {
  const tabs: Category[] = [
    { id: "all", name: "Thực đơn", type: "category" },
    { id: "combo", name: "Combo", type: "combo" },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: "category" as const,
    })),
  ];

  return (
    <div className="flex space-x-3 pb-2 -mx-4 px-4 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabClick(tab.type, tab.id)}
          className={`flex-shrink-0 px-6 py-2 rounded-2xl font-semibold ${
            activeTab.type === tab.type && activeTab.id === tab.id
              ? "bg-category-active text-black scale-105"
              : "bg-white text-black hover:bg-gray-100 border"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
