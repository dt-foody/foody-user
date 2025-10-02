"use client";

import { Popover, Transition } from "@headlessui/react";
import { GlobeAltIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { FC, Fragment, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export const headerLanguage = [
  { id: "en", name: "English", description: "United States" },
  { id: "ar", name: "Arabic", description: "Arabic" },
];

interface LangDropdownProps {
  panelClassName?: string;
  className?: string;
  onChangeLanguage?: (lang: string) => void;
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const LangDropdown: FC<LangDropdownProps> = ({
  panelClassName = "top-full right-0 max-w-sm w-96",
  className = "hidden md:flex",
  onChangeLanguage,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLang, setSelectedLang] = useState("en");

  // Lấy locale từ cookie khi load page
  useEffect(() => {
    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    if (cookieLocale) setSelectedLang(cookieLocale);
  }, []);

  const handleChangeLanguage = (lang: string) => {
    setSelectedLang(lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    onChangeLanguage?.(lang);

    // redirect sang route /[locale]/rest-of-path
    const segments = pathname.split("/").filter(Boolean);
    // Thay segment đầu tiên bằng locale mới
    if (headerLanguage.some((l) => l.id === segments[0])) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }
    router.push("/" + segments.join("/"));
  };

  const renderLang = (close: () => void) => (
    <div className="grid gap-8 lg:grid-cols-2">
      {headerLanguage.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            handleChangeLanguage(item.id);
            close();
          }}
          className={classNames(
            "flex flex-col items-start p-2 -m-3 rounded-lg transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50",
            selectedLang === item.id ? "bg-gray-100 dark:bg-gray-700" : "opacity-80"
          )}
        >
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
        </button>
      ))}
    </div>
  );

  return (
    <Popover className={`LangDropdown relative ${className}`}>
      {({ open, close }) => (
        <>
          <Popover.Button
            className="group self-center h-10 sm:h-12 px-3 py-1.5 inline-flex items-center text-sm text-gray-800 dark:text-neutral-200 font-medium hover:text-opacity-100 focus:outline-none"
          >
            <GlobeAltIcon className="w-5 h-5 opacity-80" />
            <span className="mx-1">{selectedLang.toUpperCase()}</span>
            <ChevronDownIcon
              className={`${open ? "-rotate-180" : "text-opacity-70"} ml-1 h-4 w-4 transition ease-in-out duration-150`}
              aria-hidden="true"
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className={`absolute z-20 ${panelClassName}`}>
              <div className="p-3 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5">
                {renderLang(close)}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default LangDropdown;
