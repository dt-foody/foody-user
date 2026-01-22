"use client";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import React, { useState } from "react";
import homepage_1 from "@/images/homepage_1.png";
import homepage_2 from "@/images/homepage_2.png";
import homepage_3 from "@/images/homepage_3.png";
import homepage_4 from "@/images/homepage_4.png";
import homepage_5 from "@/images/homepage_5.png";
import homepage_6 from "@/images/homepage_6.png";
import homepage_7 from "@/images/homepage_7.png";
import homepage_8 from "@/images/homepage_8.png";
import homepage_9 from "@/images/homepage_9.png";

function PageHome() {
  const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/claritylab";

  const getHomepageImage = (i: number) => `@/images/homepage_${i}.png`;

  // Khởi tạo state với mảng chứa tất cả index từ 0 đến 3 để mặc định mở hết
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setOpenIndexes(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // Nếu đang mở thì đóng (loại bỏ khỏi mảng)
          : [...prev, index] // Nếu đang đóng thì mở (thêm vào mảng)
    );
  };

  const faqs = [
    {
      question: '"Mình có phù hợp không?"',
      answer:
        "Nếu bạn đang xây dựng sự nghiệp, nhưng cảm thấy mệt vì phải gồng một mình — thì có lẽ bạn đang ở đúng chỗ.",
    },
    {
      question: '"Mình chưa sẵn sàng, vào đây có áp lực không?"',
      answer:
        "Không. Ở đây không yêu cầu bạn phải ổn, phải mạnh, hay phải tiến nhanh. Bạn được đi với nhịp của mình.",
    },
    {
      question: '"Đây có phải một nhóm chữa lành / truyền động lực không?"',
      answer:
        "Không. Đây là một không gian đồng hành — nơi bạn vừa đối diện với mình, vừa xây dựng điều gì đó thật.",
    },
    {
      question: '"Nếu mình vào rồi mà không hợp?"',
      answer: "Bạn luôn có quyền rời đi. Không ràng buộc. Không phán xét.",
    },
  ];

  return (
    <main
      role="main"
      className="nc-PageHome relative !bg-neutral-50 text-neutral-800 antialiased pb-20 max-w-[100vw] overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="container max-w-4xl mx-auto px-6 pt-12 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight uppercase tracking-tight text-center">
          ĐỦ RỒI! ĐÃ ĐẾN LÚC LẤY LẠI QUYỀN LỰC
        </h1>
        <p className="mt-2 text-center italic">Có lẽ, bạn đã gồng quá lâu.</p>
      </section>

      {/* The Loop Section */}
      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <h2 className="mb-4 font-bold">
          Bạn có thấy quen với vòng lặp này không?
        </h2>
        <div className="w-full h-[200px] md:h-[350px] lg:h-[400px] display-flex justify-center items-center">
          <Image
            src={homepage_1}
            alt="The Loop"
            className="w-full h-full object-cover object-center"
            fill={false}
            // width={800}
            // height={350}
            priority
          />
        </div>
        <div className="space-y-4">
          <p className="font-bold text-neutral-900">Đúng vậy.</p>
          <div className="flex items-center gap-2 lg:gap-4">
            <div>Bạn đang ở trong</div>
            <div
              className="w-[200px] flex items-center justify-center text-white font-bold text-xl"
              style={{
                backgroundImage: `url(${homepage_2.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "inline-block",
                textAlign: "center",
                color: "black",
                fontWeight: "bold",
                fontSize: "1.1rem",
                lineHeight: "56px",
              }}
            >
              <span>một lồng kính</span>
            </div>
          </div>
          <p className="!mt-0">
            do chính bạn tạo ra, trong những ngày phải{" "}
            <strong>tự đứng vững một mình</strong>.
          </p>
          <p className="font-bold">Đây không phải bản chất của bạn.</p>
          <p>
            Nó chỉ là thứ bạn học được để sống sót qua những ngày đó — khi phải
            đi một mình quá lâu.
          </p>
        </div>
      </section>

      {/* Why & Observation */}
      <section className="container max-w-4xl mx-auto px-6 py-6 space-y-6 border-t border-neutral-100">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">
            Tại sao bạn lại rơi vào đây?
          </h2>
          <div className="flex flex-row items-center !mt-0">
            <span className="text-sm font-medium">Vì bạn</span>
            <span
              className="w-[170px] h-[60px] flex items-center justify-center text-black font-bold text-[1.1rem]"
              style={{
                backgroundImage: `url(${homepage_3.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center", // 👈 chỉnh trọng tâm
                backgroundRepeat: "no-repeat",
              }}
            >
              có năng lực
            </span>
          </div>
          <p className="italic text-sm !mt-0">
            “Nghe mâu thuẫn à? Để mình nói tiếp nhé.”
          </p>
          <p>
            Bạn có mục tiêu lớn. Bạn đã từng đạt được những thành tựu mà không
            phải ai cũng làm được. Và chính vì vậy…
          </p>
          <div className="font-bold relative">
            Bạn sợ.
            <div className="w-[200px] h-[40px] display-flex justify-center items-center inline-block absolute left-[20px]">
              <Image
                src={homepage_4}
                alt="The Loop"
                className="w-full h-full object-cover object-center"
                fill={false}
                width={250}
                height={40}
              />
            </div>
          </div>
          <p>Sợ thất bại.</p>
          <p>Sợ bị phán xét.</p>
          <p className="italic">
            Sợ chỉ cần hụt một bước — là không đứng dậy được nữa.
          </p>
          <p>Thế nên…</p>
          <p>
            Bạn đã đối xử với bản thân rất{" "}
            <span className="font-bold line-through">khắc nghiệt</span>, từ lúc
            chưa bắt đầu.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            Nếu đứng ở ngôi thứ 3 để quan sát, bạn thấy gì?
          </h2>
          <div className="space-y-4">
            <p>Bạn không yếu. Đúng. </p>
            <p>
              <strong>Bạn chỉ đã phải mạnh một mình quá lâu.</strong>
            </p>
            <p>Mệt mỏi vì không có ai đủ tin để đứng cạnh.</p>
            <p>
              Mệt mỏi vì luôn tìm kiếm sự công nhận nhưng chẳng bao giờ thấy đủ.
            </p>
            <p>
              Bạn mang theo những vết thương từ gia đình, những áp đặt, kỳ vọng,
              so sánh…
            </p>
            <p>Bạn muốn bước ra, nhưng lại quá tải.</p>
            {/* <div className="flex items-center sm:relative sm:block !mt-0">
              <div className="sm:order-none">
                Không biết bắt đầu từ đâu.{" "}
                <span className="font-bold">Gỡ rối</span> thế nào.
              </div>
              <div className="sm:order-none w-24 h-24 flex-shrink-0 sm:absolute sm:w-35 sm:h-35 md:w-40 md:h-40 lg:w-[100px] lg:h-[100px] sm:top-[-90px] sm:left-[65%] md:top-[-120px] md:left-[50%] md:-translate-x-1/2">
                <Image
                  src={homepage_5}
                  alt="The Loop"
                  className="w-full h-full object-cover object-center"
                  fill={false}
                  width={200}
                  height={200}
                />
              </div>
            </div> */}
            <div className="flex items-start gap-4 !mt-0">
              <div className="pt-4 sm:pt-6 lg:pt-8">
                Không biết bắt đầu từ đâu.{" "}
                <span className="font-bold">Gỡ rối</span> thế nào.
              </div>
              <div className="w-[100px] h-[100px] flex-shrink-0 sm:w-22 sm:h-22 md:w-26 md:h-26 lg:w-32 lg:h-32">
                <Image
                  src={homepage_5}
                  alt="The Loop"
                  className="w-full h-full object-cover object-center"
                  fill={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Place */}
      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          Vậy thì ở đây — là một nơi bạn có thể dừng chân.
        </h2>
        <div className="space-y-4">
          <p>Không phải để trốn chạy.</p>
          {/* <div className="flex items-center sm:relative sm:block !mt-0">
            <div className="sm:order-none">
              Mà để{" "}
              <span className="font-bold">lấy lại sức, nhìn rõ mình đang ở đâu, và bước tiếp có ý thức.</span>
            </div>
            <div className="sm:order-none w-24 h-24 flex-shrink-0 sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] sm:absolute sm:top-[-90px] sm:right-[10%] md:top-[-165px] md:right-[-10%] md:-translate-x-1/2">
              <Image
                src={homepage_6}
                alt="The Loop"
                className="w-full h-full object-cover object-center"
                fill={false}
                width={350}
                height={350}
              />
            </div>
          </div> */}
          <div className="flex items-center !mt-0">
            <div className="w-[65%]">
              Mà để{" "}
              <span className="font-bold">lấy lại sức, nhìn rõ mình đang ở đâu, và bước tiếp có ý thức.</span>
            </div>
            <div className="w-24 h-24 flex-shrink-0 flex-1 sm:w-24 sm:h-20 md:w-36 md:h-30 lg:w-28 lg:h-18">
              <Image
                src={homepage_6}
                alt="The Loop"
                className="w-full h-full object-cover object-center"
                fill={false}
              />
            </div>
          </div>
          <p className="!mt-0">
            Một chốn <strong>“Ở đây.”</strong> — ngay bên cạnh, quan sát, cùng
            bước, và <strong>đưa tay ra khi bạn cần.</strong>
          </p>
          <p>
            Bởi có lẽ, bạn cũng đã đủ lâu trong vùng không thời gian ấy để hiểu
            rằng:
          </p>
          <ul className="list-disc pl-10 space-y-4">
            <li>Chỉ dựa vào gia đình thôi là không đủ,</li>
            <li>
              Học tập là con đường quan trọng, nhưng những gì trường lớp dạy là
              chưa đủ,
            </li>
            <li>
              Và <strong>chỉ một mình cố gắng thôi… là không đủ.</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <div className="font-bold">
          Nếu bạn đang tự xây dựng sự nghiệp, nhưng cũng liên tục chiến đấu với
          chính mình và những áp lực vô hình xung quanh — hãy ngỏ lời.
        </div>
      </section>

      {/* Why Now & Deserve */}
      <section className="container max-w-4xl mx-auto px-6 py-6 space-y-6 border-t border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900">
          Tại sao là lúc này?
        </h2>

        <div className="space-y-4 relative">
          <p className="font-bold text-md">Vì bạn sắp kiệt sức.</p>
          <p>Nếu cứ tiếp tục như vậy, không chắc bạn còn đủ lực để vực dậy.</p>
          <p>Bạn đã rất cố gắng.</p>
          <p>Đã kiên cường đi qua những khoảng tối mà không ai thấy.</p>
          <p>Nhưng niềm tin vào chính mình</p>
          <p>… đã mòn đi từ lúc nào.</p>
          <div className="w-[120px] h-[120px]  top-[25px] right-[-10px] mt-[30px] md:w-[200px] md:h-[200px] lg:w-[220px] lg:h-[220px] display-flex justify-center items-center inline-block absolute md:top-[-80px] md:right-[-10%] md:translate-x-[-50%] lg:mr-[70px]">
            <Image
              src={homepage_7}
              alt="The Loop"
              className="w-full h-full object-cover object-center"
              fill={false}
              width={350}
              height={350}
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-bold text-md">Vì bạn xứng đáng được nhìn thấy.</p>
          <p>Xứng đáng được:</p>
          <ul className="list-disc pl-10 space-y-4">
            <li>Gỡ bỏ những xiềng xích đã mang từ rất lâu,</li>
            <li>Bước đi mà không cần tự nghi ngờ từng bước,</li>
            <li>
              Xây dựng công trình của bạn — như một{" "}
              <strong>di sản, một tinh thần, một giá trị có ảnh hưởng.</strong>
            </li>
          </ul>
        </div>

        <div className="space-y-4 relative">
          <p className="font-bold text-md">
            Và vì bạn không thể trì hoãn thêm nữa.
          </p>
          <p>Thời gian không quay lại.</p>
          <p>Và cuộc đời này cũng không kéo dài mãi để bạn “chuẩn bị thêm”.</p>
          <div className="w-[100px] h-[150px] right-[-50px] top-[-45px] md:w-[250px] md:h-[250px] lg:w-[280px] lg:h-[280px] display-flex justify-center items-center inline-block absolute lg:right-[50px] lg:top-[-110px]">
            <Image
              src={homepage_8}
              alt="The Loop"
              className="w-full h-full object-cover object-center"
              fill={false}
              width={350}
              height={350}
            />
          </div>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-10 border-t border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-8 text-center">
          Vậy “ở đây” có gì?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
              1. Lắng nghe
            </h3>
            <ul className="text-sm space-y-4 leading-relaxed">
              <li>Chúng ta không giả vờ ổn,</li>
              <li>KHÔNG ĐEO MẶT NẠ.</li>
              <li>
                Chúng ta lắng nghe câu chuyện của chính mình và của nhau — bằng
                sự tôn trọng tuyệt đối.
              </li>
              <li>KHÔNG PHÁN XÉT.</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
              2. Đồng hành
            </h3>
            <ul className="text-sm space-y-4 leading-relaxed">
              <li>Không ai bị bỏ lại phía sau.</li>
              <li>Không ai phải tự khâu vết thương một mình.</li>
              <li>Bạn được là chính mình — trọn vẹn.</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
              3. Đặt từng viên gạch
            </h3>
            <ul className="text-sm space-y-4 leading-relaxed">
              <li>Không chờ “đúng thời điểm”.</li>
              <li>Không đợi “đủ nguồn lực”.</li>
              <li>Chúng ta hành động ngay cả trong những ngày tối tăm.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mission & CTA */}
      <section className="container max-w-4xl mx-auto px-6 py-8 text-left border-t border-neutral-100">
        <div className="space-y-4">
          <p>Mình không ở đây để truyền động lực sáo rỗng.</p>
          <p>
            Mình ở đây để <strong>đi cùng bạn</strong>, chứng kiến khoảnh khắc
            bạn:
          </p>
          <ul className="list-disc pl-10 space-y-4 relative">
            <li>bước qua nỗi sợ,</li>
            <li>tái lập sự tự tin,</li>
            <li>
              và bước vào <strong>cuộc đời thực sự của mình.</strong>
            </li>
            <div className="w-[150px] h-[150px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] display-flex justify-center items-center inline-block absolute top-[-80px] right-[-5%] md:top-[-140px] md:right-[-10%] md:translate-x-[-50%]">
              <Image
                src={homepage_9}
                alt="The Loop"
                className="w-full h-full object-cover object-center"
                fill={false}
                width={350}
                height={350}
              />
            </div>
          </ul>
          <p>Vì có lẽ,</p>
          <p className="font-bold">
            Bên trong bạn đã đợi điều này từ rất lâu rồi.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-8 border-t border-neutral-100">
        <div className="space-y-4">
          <p>
            Nếu đã đọc đến đây — có lẽ bạn biết mình không nên đi tiếp một mình
            nữa.
          </p>
          <p>Ở đây.</p>
          <div>
            <ButtonPrimary targetBlank href={FACEBOOK_GROUP_URL} className="lg:h-[40px]">
              Bước vào
            </ButtonPrimary>
          </div>
          <p>Ta sẽ cùng bắt đầu từ đó.</p>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-8 border-t border-neutral-100 italic">
        <div className="space-y-4">
          <p>Nếu bạn chưa chắc nên bắt đầu từ đâu —</p>
          <p className="font-bold">
            Lối đi ở đây, để bạn biết lúc này mình cần gì.
          </p>
          <p>
            Xem
            {/* <a
              href="https://luuchi.com.vn/vi/maps"
              className="text-blue-600 font-bold mx-2"
            >
              👉 Lối đi
            </a> */}
            <ButtonPrimary targetBlank href="https://luuchi.com.vn/vi/maps" className="mx-2 lg:h-[40px]">
              Lối đi
            </ButtonPrimary>
            (Bắt đầu từ đâu?).
          </p>
        </div>
      </section>

      {/* FAQ Section - Đã cập nhật logic mở nhiều mục */}
      <section className="container max-w-4xl mx-auto px-6 py-8 border-t border-neutral-100">
        <h2 className="text-lg font-bold mb-6 text-neutral-900">
          FAQ — Có thể bạn đang tự hỏi.
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-neutral-200">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full py-3 text-left flex justify-between items-center group focus:outline-none"
              >
                <span className="font-semibold">{faq.question}</span>
                <span className="text-neutral-400">
                  {openIndexes.includes(index) ? "−" : "+"}
                </span>
              </button>
              {openIndexes.includes(index) && (
                <div className="pb-4 text-neutral-600 leading-relaxed transition-all">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default PageHome;
