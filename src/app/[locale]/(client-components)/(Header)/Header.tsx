"use client";

import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import MainNav1 from "./MainNav1";
import MainNav2 from "./MainNav2";
import { API_URL } from "@/configurations/constant";

export interface HeaderProps {
  navType?: "MainNav1" | "MainNav2";
  className?: string;
}

const Header: FC<HeaderProps> = ({ navType = "MainNav1", className = "" }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/v1/auth/me`, { withCredentials: true })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const renderNav = () => {
    switch (navType) {
      case "MainNav1":
        return <MainNav1 />;
      case "MainNav2":
        return <MainNav2 isLoggedIn={isLoggedIn} />;
      default:
        return <MainNav1/>;
    }
  };

  return (
    <div
      className={`nc-Header sticky top-0 w-full left-0 right-0 z-40 nc-header-bg ${className}`}
    >
      {renderNav()}
    </div>
  );
};

export default Header;
