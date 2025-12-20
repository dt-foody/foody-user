"use client";
import ButtonPrimary from "@/shared/ButtonPrimary";
import React, { useState } from "react";

function PageHome() {
  // Khởi tạo state với mảng chứa tất cả index từ 0 đến 3 để mặc định mở hết
  const [openIndexes, setOpenIndexes] = useState([0, 1, 2, 3]);

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
      className="nc-PageHome relative !bg-neutral-50 text-neutral-800 antialiased pb-20"
    >
      {/* Hero Section */}
      <section className="container max-w-4xl mx-auto px-6 pt-12 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight uppercase tracking-tight">
          ĐỦ RỒI! ĐÃ ĐẾN LÚC LẤY LẠI QUYỀN LỰC
        </h1>
        <p className="mt-2">Có lẽ, bạn đã gồng quá lâu.</p>
      </section>

      {/* The Loop Section */}
      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <h2 className="mb-4">Bạn có thấy quen với vòng lặp này không?</h2>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-neutral-600">
          {[
            "Không tự tin",
            "Chần chừ",
            "Không hành động",
            "Tiếp tục chuẩn bị",
            "Không có thành quả",
            "Nghi ngờ",
            "Đánh giá thấp chính những gì mình đã cố gắng",
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              <span className="px-3 py-1 bg-white border border-neutral-200 rounded-full">
                {item}
              </span>
              {i < arr.length - 1 && (
                <span className="text-neutral-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          <p className="font-bold text-neutral-900">Đúng vậy.</p>
          <p>Bạn đang ở trong một lồng kính —</p>
          <p>
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
          <p className="text-sm font-medium">
            Vì bạn <b>có năng lực</b>.
          </p>
          <p className="italic text-sm">
            “Nghe mâu thuẫn à? Để mình nói tiếp nhé.”
          </p>
          <p>
            Bạn có mục tiêu lớn. Bạn đã từng đạt được những thành tựu mà không
            phải ai cũng làm được. Và chính vì vậy…
          </p>
          <p className="font-bold">Bạn sợ.</p>
          <p>Sợ thất bại.</p>
          <p>Sợ bị phán xét.</p>
          <p className="italic">
            Sợ chỉ cần hụt một bước — là không đứng dậy được nữa.
          </p>
          <p>Thế nên…</p>
          <p>
            Bạn đã đối xử với bản thân rất khắc nghiệt, từ lúc chưa bắt đầu.
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
            <p>Không biết bắt đầu từ đâu. Gỡ rối thế nào.</p>
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
          <p>
            {" "}
            Mà để{" "}
            <strong>
              lấy lại sức, nhìn rõ mình đang ở đâu, và bước tiếp có ý thức.
            </strong>
          </p>
          <p>
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

        <div className="space-y-4">
          <p className="font-bold text-md">Vì bạn sắp kiệt sức.</p>
          <p>Nếu cứ tiếp tục như vậy, không chắc bạn còn đủ lực để vực dậy.</p>
          <p>Bạn đã rất cố gắng.</p>
          <p>Đã kiên cường đi qua những khoảng tối mà không ai thấy.</p>
          <p>Nhưng niềm tin vào chính mình</p>
          <p>… đã mòn đi từ lúc nào.</p>
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

        <div className="space-y-4">
          <p className="font-bold text-md">
            Và vì bạn không thể trì hoãn thêm nữa.
          </p>
          <p>Thời gian không quay lại.</p>
          <p>Và cuộc đời này cũng không kéo dài mãi để bạn “chuẩn bị thêm”.</p>
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
          <ul className="list-disc pl-10 space-y-4">
            <li>bước qua nỗi sợ,</li>
            <li>tái lập sự tự tin,</li>
            <li>
              và bước vào <strong>cuộc đời thực sự của mình.</strong>
            </li>
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
            <ButtonPrimary>Bước vào</ButtonPrimary>
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
            <a
              href="https://luuchi.com.vn/en/maps"
              className="text-blue-600 font-bold mx-2"
            >
              👉 Lối đi
            </a>
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
