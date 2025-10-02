import { FC } from "react";
import Image from "next/image";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface BlogItem {
  title: string;
  date: string;
  excerpt?: string;
  image: string;
  href: string;
}

const blogItems: BlogItem[] = [
  {
    title: "Bí quyết làm burger & pizza hoàn hảo cho khách hàng",
    date: "03/01/2023",
    excerpt:
      "Khám phá những mẹo đơn giản để chế biến burger và pizza ngon tuyệt hảo, khiến ai cũng mê ngay từ lần thử đầu tiên.",
    image: "/images/blog-burger.png",
    href: "#blog-1",
  },
  {
    title: "Cách làm khoai tây chiên giòn bằng nồi chiên không dầu",
    date: "03/01/2023",
    image: "/images/blog-fries.png",
    href: "#blog-2",
  },
  {
    title: "Mẹo chế biến gà rán ngon giòn hấp dẫn",
    date: "03/01/2023",
    image: "/images/blog-chicken.png",
    href: "#blog-3",
  },
  {
    title: "7 công thức cheesecake thơm ngon dễ làm tại nhà",
    date: "03/01/2023",
    image: "/images/blog-cake.png",
    href: "#blog-4",
  },
  {
    title: "5 quán pizza tuyệt vời bạn nên thử khi đến thành phố này",
    date: "03/01/2023",
    image: "/images/blog-pizza.png",
    href: "#blog-5",
  },
];

const SectionBlog: FC = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Blog & Bài Viết
          </h2>
          <ButtonSecondary href="/listing-stay" className="!leading-none">
            <div className="flex items-center justify-center">
              <span>Tất cả</span>
              <ArrowRightIcon className="w-5 h-5 ml-3" />
            </div>
          </ButtonSecondary>
        </div>

        {/* Grid layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bài viết lớn */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
            <a href={blogItems[0].href}>
              <Image
                src={blogItems[0].image}
                alt={blogItems[0].title}
                width={800}
                height={500}
                className="w-full h-80 object-cover"
              />
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">{blogItems[0].date}</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {blogItems[0].title}
                </h3>
                <p className="text-gray-600">{blogItems[0].excerpt}</p>
              </div>
            </a>
          </div>

          {/* Bài viết nhỏ */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {blogItems.slice(1).map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={250}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                  <h4 className="font-medium text-gray-800">{item.title}</h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionBlog;
