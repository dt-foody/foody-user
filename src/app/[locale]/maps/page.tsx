import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import React from "react";

function PageMaps() {
  const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/claritylab";

  return (
    <main
      role="main"
      className="nc-PageMaps relative !bg-neutral-50 text-neutral-800 antialiased pb-20"
    >
      <section className="container max-w-4xl mx-auto px-6 py-6 space-y-4 border-t border-neutral-100">
        <div className="space-y-4">
          <p>Ở đây không có một con đường duy nhất.</p>
          <p>Chỉ có những không gian khác nhau —</p>
          <p>
            để bạn <strong>lấy đúng thứ mình cần, vào đúng lúc.</strong>
          </p>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-6 space-y-6 border-t border-neutral-100">
        <div className="space-y-4">
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
          <div className="space-y-4">
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
              {/* <a
                href={FACEBOOK_GROUP_URL}
                className="text-blue-600 font-bold mx-1"
              >
                👉 Facebook
              </a> */}
              <ButtonPrimary targetBlank href={FACEBOOK_GROUP_URL} className="lg:mx-2 lg:h-[40px]">
                Lối đi
              </ButtonPrimary>
              {" "}
              — nơi bạn thực sự được là chính mình.
            </p>
          </div>
        </div>
      </section>

      {/* The Place */}
      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Menu</h2>
        <div className="space-y-4">
          <p className="font-bold">Nguồn năng lượng cùng bạn đi đường dài.</p>
          <p>
            <strong>Cà phê Lưu Chi</strong> vừa đủ:
          </p>
          <ul className="list-disc pl-10 space-y-4">
            <li>nhanh gọn, tiện lợi — bảo quản tủ lạnh, cần là có ngay,</li>
            <li>sảng khoái — không nặng đầu, không gắt,</li>
            <li>
              đậm đà, tươi mới — đủ để bạn tập trung trong nhiều giờ liền.
            </li>
          </ul>
          <p>Không phô trương. Không vội vã.</p>
          <p>Chỉ là một nguồn năng lượng âm thầm, cho hành trình này.</p>
          <p className="font-bold">Một điểm dừng, cho chặng đường dài.</p>
          <div>
            <Link
              className="px-4 py-2 relative h-auto inline-flex items-center justify-center rounded-full transition-colors disabled:bg-opacity-70 bg-primary-6000 hover:bg-primary-700 text-neutral-50"
              href="/menu"
            >
              👉 Thực đơn ở đây
            </Link>
          </div>
        </div>
      </section>

      <section className="container max-w-4xl mx-auto px-6 py-6 border-t border-neutral-100">
        <div className="space-y-4">
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
