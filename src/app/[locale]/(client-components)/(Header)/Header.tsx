"use client";

import React, { FC, useEffect, useState } from "react";
import axios from "axios";
import MainNav2 from "./MainNav2";

export interface HeaderProps {
  className?: string;
}

const Header: FC<HeaderProps> = ({ className = "" }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/v1/auth/me`, { withCredentials: true })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const renderNav = () => {
    return <MainNav2 isLoggedIn={isLoggedIn} />;
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
