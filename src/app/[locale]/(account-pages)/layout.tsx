import React, { FC } from "react";
import { Nav } from "./(components)/Nav";

export interface CommonLayoutProps {
  children?: React.ReactNode;
}

const CommonLayout: FC<CommonLayoutProps> = ({ children }) => {
  return (
    <div className="nc-CommonLayoutAccount">
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <Nav />
      </div>
      <div className="container py-4">{children}</div>
    </div>
  );
};

export default CommonLayout;
