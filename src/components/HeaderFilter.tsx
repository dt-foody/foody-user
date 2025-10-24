"use client";

import React, { FC, useEffect, useState, ReactNode } from "react";
import Heading from "@/shared/Heading";
import Nav from "@/shared/Nav";
import NavItem from "@/shared/NavItem";

export interface HeaderFilterProps {
  tabActive: string;
  tabs: { label: string; value: string }[]; // ✅ đổi sang label/value
  heading: ReactNode;
  subHeading?: ReactNode;
  onClickTab?: (value: string) => void; // ✅ đổi sang truyền value
}

const HeaderFilter: FC<HeaderFilterProps> = ({
  tabActive,
  tabs,
  subHeading = "",
  heading = "Bài Viết Mới Nhất 🎈",
  onClickTab = () => {},
}) => {
  const [tabActiveState, setTabActiveState] = useState(tabActive);

  useEffect(() => {
    setTabActiveState(tabActive);
  }, [tabActive]);

  const handleClickTab = (value: string) => {
    onClickTab(value);
    setTabActiveState(value);
  };

  return (
    <div className="flex flex-col mb-8 relative">
      <Heading desc={subHeading}>{heading}</Heading>
      <div className="flex items-center justify-between">
        <Nav
          className="sm:space-x-2"
          containerClassName="relative flex w-full overflow-x-auto text-sm md:text-base hiddenScrollbar"
        >
          {tabs.map((tab, index) => (
            <NavItem
              key={index}
              isActive={tabActiveState === tab.value}
              onClick={() => handleClickTab(tab.value)}
            >
              {tab.label}
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default HeaderFilter;
