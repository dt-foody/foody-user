import { SocialType } from "@/shared/SocialsShare";
import React, { FC } from "react";

export interface SocialsListProps {
  className?: string;
  itemClass?: string;
  socials?: SocialType[];
}

const socialsDemo: SocialType[] = [
  { 
    name: "Facebook", 
    icon: "lab la-facebook-square", 
    href: "https://www.facebook.com/claritylab.vn" 
  },
  { 
    name: "Instagram", 
    icon: "lab la-instagram", 
    href: "https://www.instagram.com/claritylab.vn" 
  },
  { 
    name: "Youtube", 
    icon: "lab la-youtube", 
    href: "https://www.youtube.com/@quynhanhphannu" 
  },
  { 
    name: "Tiktok", 
    icon: "lab la-tiktok", 
    href: "https://www.tiktok.com/@claritylab.vn" 
  },
  { 
    name: "Threads", 
    icon: "lab la-at", // Dùng tạm icon @ vì LineAwesome cũ chưa có icon Threads
    href: "https://www.threads.net/@claritylab.vn" 
  },
];

const SocialsList: FC<SocialsListProps> = ({
  className = "",
  itemClass = "block",
  socials = socialsDemo,
}) => {
  return (
    <nav
      className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-6000 dark:text-neutral-300 ${className}`}
      data-nc-id="SocialsList"
    >
      {socials.map((item, i) => (
        <a
          key={i}
          className={`${itemClass}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
        >
          <i className={item.icon}></i>
        </a>
      ))}
    </nav>
  );
};

export default SocialsList;
