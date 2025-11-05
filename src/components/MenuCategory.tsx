'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
  type: 'category' | 'combo';
}

interface MenuCategoryProps {
  categories: { id: string; name: string }[];
  activeTab: { id: string; type: 'category' | 'combo' };
  onTabClick: (type: 'category' | 'combo', id: string) => void;
}

export default function MenuCategory({
  categories,
  activeTab,
  onTabClick,
}: MenuCategoryProps) {
  const tabs: Category[] = [
    { id: 'all', name: '🍽️ Thực đơn', type: 'category' },
    { id: 'combo', name: '🎁 Combo', type: 'combo' },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: 'category' as const,
    })),
  ];

  return (
    <div className="flex space-x-3 pb-2 -mx-4 px-4 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabClick(tab.type, tab.id)}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab.type === tab.type && activeTab.id === tab.id
              ? tab.type === 'combo'
                ? 'bg-purple-500 text-white shadow-lg scale-105'
                : 'bg-orange-500 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
