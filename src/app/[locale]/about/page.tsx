import Image from "next/image";
import Image1 from "@/images/HIW1.png";
import Image2 from "@/images/HIW2.png";

export default function PageAbout() {
  const sections = [
    {
      title: "Về cà phê",
      image: Image1,
      name: "Anh Long",
      content: `Hành trình của chúng tôi bắt đầu từ hạt cà phê nhỏ bé, 
      được chọn lọc cẩn thận từ những vùng đất cao nguyên Việt Nam. 
      Mỗi tách cà phê không chỉ là hương vị – đó là câu chuyện của người trồng, 
      của bàn tay rang xay, và của khoảnh khắc bạn thưởng thức trong tĩnh lặng. 
      Chúng tôi tin rằng cà phê không chỉ để tỉnh táo, mà còn để kết nối những tâm hồn.`,
    },
    {
      title: "Về chúng ta",
      image: Image2,
      name: "Chị Huyền",
      content: `Chúng tôi là những người yêu cà phê, yêu hương vị chân thật và những cuộc trò chuyện thật lòng. 
      Mỗi ngày, đội ngũ không ngừng học hỏi để mang lại trải nghiệm tốt hơn – từ khâu chọn nguyên liệu, 
      cách phục vụ, đến từng không gian nhỏ mà bạn ngồi lại. 
      Với chúng tôi, cà phê là chiếc cầu nối giữa con người và cảm xúc, giữa hôm qua và ngày mai.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* ====== PAGE HEADER ====== */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[#b9915f] mb-3 tracking-wide">
            Nhìn lại hành trình đã qua
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#b9915f] to-[#d4a574] mx-auto rounded-full"></div>
        </div>

        {/* ====== SECTIONS ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sections.map((s, index) => (
            <div
              key={s.title}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 border border-orange-100 hover:shadow-2xl hover:border-[#b9915f]/30 transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {/* --- TITLE --- */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#3b2f26] inline-block relative pb-2">
                  {s.title}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#3b2f26] to-[#b9915f] transform origin-left transition-transform duration-300 group-hover:scale-x-110"></span>
                </h2>
              </div>

              {/* --- CONTENT --- */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* IMAGE */}
                <div className="relative w-32 h-32 md:w-36 md:h-36 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-orange-200 group-hover:border-[#b9915f] transition-colors duration-300 shadow-md">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 128px, 144px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* TEXT */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#b9915f] rounded-full"></div>
                    <h3 className="text-lg md:text-xl font-semibold text-[#3b2f26]">
                      {s.name}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {s.content}
                  </p>
                </div>
              </div>

              {/* --- DECORATIVE ELEMENT --- */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-[#b9915f]/5 to-orange-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* ====== BOTTOM DECORATION ====== */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-[#b9915f]/60">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#b9915f]"></div>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
            </svg>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#b9915f]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
