import React, { FC, ReactNode } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import { ShoppingCart } from "lucide-react";

export interface SectionGridFeaturePlacesProps {
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
  cardType?: "card1" | "card2";
}

const foods = [
  {
    id: 1,
    name: "Trứng ốp la",
    price: 9.99,
    image: "/images/blog-chicken.png",
    description: "Món ăn sáng đơn giản với trứng chiên vàng ươm, ăn kèm rau xà lách và gia vị.",
  },
  {
    id: 2,
    name: "Pizza Hawaii",
    price: 15.99,
    image: "/images/blog-burger.png",
    description: "Đế bánh giòn, phô mai tan chảy kết hợp cùng dứa và thịt nguội đặc trưng.",
  },
  {
    id: 3,
    name: "Cocktail Martinez",
    price: 7.25,
    image: "/images/blog-cake.png",
    description: "Thức uống cổ điển với gin, vermouth ngọt và hương vị thảo mộc tinh tế.",
  },
  {
    id: 4,
    name: "Bánh bơ đường",
    price: 20.99,
    image: "/images/blog-fries.png",
    description: "Chiếc bánh ngọt mềm mịn với hương bơ và caramel ngọt ngào, rất thích hợp tráng miệng.",
  },
  {
    id: 5,
    name: "Nước chanh bạc hà",
    price: 5.89,
    image: "/images/blog-cake.png",
    description: "Thức uống mát lạnh, kết hợp vị chua dịu của chanh với hương thơm bạc hà.",
  },
  {
    id: 6,
    name: "Kem socola",
    price: 18.05,
    image: "/images/blog-fries.png",
    description: "Kem mịn mát, hương vị socola đậm đà, ngọt ngào tan chảy nơi đầu lưỡi.",
  },
  {
    id: 7,
    name: "Bánh mì kẹp phô mai",
    price: 12.55,
    image: "/images/blog-burger.png",
    description: "Bánh burger nhân thịt bò và phô mai béo ngậy, ăn kèm rau tươi giòn.",
  },
  {
    id: 8,
    name: "Bánh waffle truyền thống",
    price: 12.99,
    image: "/images/blog-chicken.png",
    description: "Bánh waffle giòn rụm, thơm bơ, ăn kèm mật ong hoặc trái cây tươi.",
  },
];

const SectionGridFeaturePlaces: FC<SectionGridFeaturePlacesProps> = ({
  gridClass = "",
  heading = "Best Sellers",
  subHeading = "Những món ăn được yêu thích nhất mà chúng tôi gợi ý cho bạn",
  headingIsCenter,
  tabs = ["Bữa sáng", "Món chính", "Đồ uống", "Tráng miệng"],
  cardType = "card2",
}) => {
  return (
    <div className="nc-SectionGridFeaturePlaces relative">
      <HeaderFilter
        tabActive={"Bữa sáng"}
        subHeading={subHeading}
        tabs={tabs}
        heading={heading}
      />
      <div
        className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
      >
        {foods.map((food) => (
          <div
            key={food.id}
            className="border rounded-2xl overflow-hidden shadow hover:shadow-lg transition flex flex-col"
          >
            {/* Hình ảnh */}
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-40 object-cover"
            />

            {/* Nội dung */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-2">
                <p className="text-red-500 font-semibold">
                  ${food.price.toFixed(2)}
                </p>
                <button
                  className="p-2 rounded-full bg-primary-100 text-primary-600 
                            hover:bg-primary-600 hover:text-white transition 
                            shadow-sm hover:shadow-md flex items-center justify-center"
                  aria-label="Thêm vào giỏ hàng"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold mb-1">{food.name}</h3>
              <p className="text-sm text-gray-500 flex-grow">{food.description}</p>
            </div>
          </div>
        ))}

      </div>
      <div className="flex mt-16 justify-center items-center">
        <ButtonPrimary loading>Show me more</ButtonPrimary>
      </div>
    </div>
  );
};

export default SectionGridFeaturePlaces;
