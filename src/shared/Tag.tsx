import Link from "next/link";
import React, { FC } from "react";

export interface TagProps {
  className?: string;
  tag: {
    id: string;
    name: string;
    slug: string;
    postCount: number;
    backgroundColor: string;
    textColor: string;
  };
}

const Tag: FC<TagProps> = ({ className = "", tag }) => {
  return (
    <Link
      className="inline-flex px-2.5 py-1 m-1 rounded-full text-xs font-medium border border-neutral-300/60 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-300 hover:opacity-80"
      href={`/blog/tag/${tag.slug}`}
      // style={{
      //   backgroundColor: tag.backgroundColor,
      //   color: tag.textColor,
      // }}
    >
      # {tag.name}
      {tag.postCount > 0 && ` (${tag.postCount})`}
    </Link>
  );
};

export default Tag;
