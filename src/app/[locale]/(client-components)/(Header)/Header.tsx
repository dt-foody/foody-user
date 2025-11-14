"use client";

import React, { FC } from "react";
import MainNav2 from "./MainNav2";

export interface HeaderProps {
  className?: string;
}

const Header: FC<HeaderProps> = ({ className = "" }) => {
  const renderNav = () => {
    return <MainNav2 />;
  };

  return (
    <div
      id="main-header"
      className={`nc-Header sticky top-0 w-full left-0 right-0 z-40 nc-header-bg ${className}`}
    >
      {renderNav()}
    </div>
  );
};

export default Header;
