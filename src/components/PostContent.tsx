"use client"; // Bắt buộc phải có dòng này vì dùng ReactPlayer

import React from "react";
import parse, { DOMNode, Element } from "html-react-parser";
import ReactPlayer from "react-player"; 

interface PostContentProps {
  content: string;
}

const PostContent = ({ content }: PostContentProps) => {
  const options = {
    replace: (domNode: DOMNode) => {
      // Tìm thẻ oembed và thay thế bằng Video Player
      if (domNode instanceof Element && domNode.name === "oembed") {
        const url = domNode.attribs.url;
        if (url) {
          return (
            <div className="my-8 relative pt-[56.25%] overflow-hidden rounded-xl bg-gray-100">
              <ReactPlayer
                src={url}
                className="absolute top-0 left-0"
                width="100%"
                height="100%"
                controls={true}
              />
            </div>
          );
        }
      }
    },
  };

  // Class 'prose' ở đây chính là sức mạnh của @tailwindcss/typography
  return (
    <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
      {parse(content, options)}
    </div>
  );
};

export default PostContent;