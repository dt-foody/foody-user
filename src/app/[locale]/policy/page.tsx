import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function PagePolicy() {
  const policySections = [
    {
      title: "1. Thông tin chúng tôi thu thập",
      content: `Chúng tôi có thể thu thập các thông tin cá nhân khi bạn tương tác với website "Lưu Chi - Cà phê chi rứa", bao gồm (nhưng không giới hạn):
- Tên, địa chỉ email, số điện thoại.
- Địa chỉ giao hàng (khi bạn đặt mua sản phẩm).
- Thông tin thanh toán (được xử lý an toàn qua cổng thanh toán của bên thứ ba).
- Thông tin kỹ thuật như địa chỉ IP, loại trình duyệt khi bạn truy cập trang web.`,
    },
    {
      title: "2. Cách chúng tôi sử dụng thông tin",
      content: `Thông tin của bạn được sử dụng cho các mục đích:
- Xử lý và hoàn tất đơn hàng cà phê của bạn.
- Giao tiếp, hỗ trợ và phản hồi các thắc mắc của bạn.
- Cải thiện chất lượng dịch vụ và trải nghiệm website.
- Gửi cho bạn các thông tin cập nhật, khuyến mãi (nếu bạn chọn đăng ký nhận tin).`,
    },
    {
      title: "3. Việc chia sẻ thông tin",
      content: `Chúng tôi cam kết không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin có thể được chia sẻ với các đối tác vận chuyển và thanh toán đáng tin cậy chỉ nhằm mục đích thực hiện đơn hàng của bạn.`,
    },
    {
      title: "4. Bảo mật dữ liệu",
      content: `Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân của bạn khỏi mất mát, truy cập trái phép hoặc tiết lộ. Tuy nhiên, không có phương thức truyền tải nào qua Internet là an toàn 100%.`,
    },
    {
      title: "5. Quyền của bạn",
      content: `Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất kỳ lúc nào. Vui lòng liên hệ với chúng tôi qua email bên dưới nếu bạn có bất kỳ yêu cầu nào.`,
    },
    {
      title: "6. Thay đổi về chính sách",
      content: `Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được đăng tải trên trang này. Chúng tôi khuyến khích bạn thường xuyên xem lại để nắm rõ cách chúng tôi bảo vệ thông tin của bạn.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* ====== PAGE HEADER ====== */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[#b9915f] mb-3 tracking-wide">
            Chính sách Bảo mật & Quyền riêng tư
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#b9915f] to-[#d4a574] mx-auto rounded-full"></div>
        </div>

        {/* ====== POLICY CONTENT ====== */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-10 lg:p-12 border border-orange-100">
          <div className="space-y-8">
            {/* --- INTRO --- */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-orange-200">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#b9915f] to-[#d4a574] rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-semibold text-[#3b2f26]">
                  Cam kết của Lưu Chi - Cà phê chi rứa
                </h2>
                <p className="text-sm md:text-base text-gray-700 mt-1 leading-relaxed">
                  Chúng tôi trân trọng sự tin tưởng của bạn. Giống như cách
                  chúng tôi cẩn thận với từng hạt cà phê, chúng tôi cũng cam kết
                  bảo vệ thông tin cá nhân của bạn một cách nghiêm túc.
                </p>
              </div>
            </div>

            {/* --- DYNAMIC SECTIONS --- */}
            {policySections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-[#3b2f26]">
                  {section.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}

            {/* --- CONTACT INFO --- */}
            <div className="pt-6 border-t border-orange-200 space-y-3">
              <h3 className="text-xl md:text-2xl font-bold text-[#3b2f26]">
                Liên hệ với chúng tôi
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, đừng
                ngần ngại liên hệ với chúng tôi:
              </p>
              <ul className="list-disc list-inside pl-4 text-gray-700">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:customerservice@luuchi.com.vn"
                    className="text-[#b9915f] hover:underline"
                  >
                    customerservice@luuchi.com.vn
                  </a>
                </li>
                <li>Địa chỉ: Số 22 Ngõ 91 Nguyễn Phúc Lai, Ô Chợ Dừa, Đống Đa, Hà Nội</li>
              </ul>
            </div>
          </div>
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
