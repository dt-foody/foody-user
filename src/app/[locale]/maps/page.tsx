"use client";
import React, { useState } from "react";

function PageMaps() {
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
      className="nc-PageMaps relative !bg-neutral-50 text-neutral-800 antialiased pb-20"
    >
      <section className="container max-w-4xl mx-auto px-6 py-6 space-y-4 border-t border-neutral-100">
        <div className="space-y-2">
          <p>Ở đây không có một con đường duy nhất.</p>
          <p>Chỉ có những không gian khác nhau —</p>
          <p>
            để bạn <strong>lấy đúng thứ mình cần, vào đúng lúc.</strong>
          </p>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-6 space-y-6 border-t border-neutral-100">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">
            Chúng{" "}
            <span
              className="relative inline-block px-1
      after:content-['']
      after:absolute
      after:left-0 after:right-0
      after:top-1/2
      after:h-[1.5px]
      after:bg-current
    "
            >
              tôi
            </span>{" "}
            ta
          </h2>
          <p>
            Nơi sự đủ đầy là <b>chỗ dựa của tiềm năng</b>.
          </p>
          <p>
            Ở đây có những điều bạn cần — để hiểu rõ hơn về bản thân, phát triển
            kỹ năng, tự dò đường và xây dựng nên những điều bạn muốn.
          </p>
          <p>Mỗi điều góp nhặt được đều có giá trị —</p>
          <p>
            dù là <strong>thêm một góc nhìn</strong>,
          </p>
          <p>
            hay <strong>bớt đi một tổn thất</strong> về thời gian và tiền bạc.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Ở đây.</h2>
          <div className="space-y-2">
            <p>
              Nơi các <strong>chương trình đồng hành</strong> được chia sẻ.
            </p>
            <p>
              Tại đây, đội ngũ Lưu Chi tổ chức những hoạt động và không gian để
              chúng ta{" "}
              <strong>
                cùng kết nối, cùng trải nghiệm, cùng đúc kết và chia sẻ lại với
                nhau
              </strong>
              .
            </p>
            <p>Những bài học được biết đến sớm —</p>
            <p>giúp ta học qua câu chuyện của người khác,</p>
            <p>để không phải trả giá bằng chính những va vấp của mình.</p>
            <p>
              Cộng đồng sinh hoạt chính tại{" "}
              <a
                href="https://www.facebook.com/groups/1656079602441991?locale=vi_VN"
                className="text-blue-600 font-bold mx-1"
              >
                👉 Facebook
              </a>{" "}
              — nơi bạn thực sự được là chính mình.
            </p>
          </div>
        </div>
      </section>

      {/* The Place */}
      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Menu</h2>
        <div className="space-y-2">
          <p className="font-bold">Nguồn năng lượng cùng bạn đi đường dài.</p>
          <p>
            <strong>Cà phê Lưu Chi</strong> vừa đủ:
          </p>
          <ul className="list-disc pl-10">
            <li>nhanh gọn, tiện lợi — bảo quản tủ lạnh, cần là có ngay,</li>
            <li>sảng khoái — không nặng đầu, không gắt,</li>
            <li>
              đậm đà, tươi mới — đủ để bạn tập trung trong nhiều giờ liền.
            </li>
          </ul>
          <p>Không phô trương. Không vội vã.</p>
          <p>Chỉ là một nguồn năng lượng âm thầm, cho hành trình này.</p>
          <p className="font-bold">Một điểm dừng, cho chặng đường dài.</p>
          <div className="pt-4">
            <a
              href="https://luuchi.com.vn/vi/menu"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 text-white px-6 py-2 rounded-full font-bold hover:bg-black transition-all"
            >
              👉 Thực đơn ở đây
            </a>
          </div>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <div className="space-y-2">
          <p>Bạn không cần ghé tất cả cùng lúc.</p>
          <p>
            Vì chúng ta có thể kết thúc ở trăm ngả,{" "}
            <strong>nhưng luôn có thể bắt đầu từ đây.</strong>
          </p>
        </div>
      </section>
    </main>
  );
}

export default PageMaps;
