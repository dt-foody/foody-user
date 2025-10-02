'use client';
import { useState } from 'react';
import { Heart, Users, Award, Clock, Utensils, Shield, ChevronRight, MapPin, Star, Smartphone, TrendingUp, Gift, Phone, Mail, Globe, Facebook, Twitter, Instagram, Youtube, CheckCircle, Zap, Target, Eye } from 'lucide-react';

export default function PageAbout() {
  const [activeTab, setActiveTab] = useState('mission');

  const stats = [
    { number: '500K+', label: 'Người dùng hài lòng', icon: <Users className="w-6 h-6" /> },
    { number: '10K+', label: 'Nhà hàng đối tác', icon: <Utensils className="w-6 h-6" /> },
    { number: '2M+', label: 'Đơn hàng giao thành công', icon: <CheckCircle className="w-6 h-6" /> },
    { number: '50+', label: 'Thành phố phục vụ', icon: <MapPin className="w-6 h-6" /> }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Đam mê ẩm thực',
      description: 'Chúng tôi yêu thích việc kết nối người dùng với những món ăn ngon nhất từ khắp mọi nơi'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Khách hàng là trung tâm',
      description: 'Sự hài lòng của bạn là ưu tiên hàng đầu trong mọi quyết định của chúng tôi'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Chất lượng đảm bảo',
      description: 'Cam kết mang đến trải nghiệm tốt nhất từ đặt hàng đến giao hàng'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Nhanh chóng & Đúng giờ',
      description: 'Giao hàng nhanh chóng, đúng hẹn để món ăn luôn nóng hổi'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'An toàn thực phẩm',
      description: 'Kiểm soát chặt chẽ chất lượng và vệ sinh an toàn thực phẩm'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Đổi mới sáng tạo',
      description: 'Không ngừng cải tiến công nghệ để mang đến trải nghiệm tốt nhất'
    }
  ];

  const team = [
    { 
      name: 'Nguyễn Minh Tuấn', 
      role: 'CEO & Founder', 
      image: '👨‍💼',
      description: '15+ năm kinh nghiệm trong lĩnh vực công nghệ và F&B'
    },
    { 
      name: 'Trần Thị Hương', 
      role: 'CTO', 
      image: '👩‍💻',
      description: 'Chuyên gia phát triển ứng dụng và AI'
    },
    { 
      name: 'Lê Văn Hùng', 
      role: 'Head of Operations', 
      image: '👨‍🍳',
      description: 'Quản lý vận hành và logistics chuyên nghiệp'
    },
    { 
      name: 'Phạm Thị Mai', 
      role: 'Marketing Director', 
      image: '👩‍💼',
      description: 'Chuyên gia marketing và phát triển thương hiệu'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Ra mắt Foody', description: 'Khởi đầu với 100 nhà hàng tại Hà Nội và TP.HCM' },
    { year: '2021', title: 'Mở rộng toàn quốc', description: 'Phủ sóng 15 tỉnh thành với 2,000+ nhà hàng' },
    { year: '2022', title: 'Cột mốc 1 triệu đơn', description: 'Đạt 1 triệu đơn hàng và 5,000+ đối tác' },
    { year: '2023', title: 'Tích hợp AI', description: 'Ứng dụng AI để gợi ý món ăn thông minh' },
    { year: '2024', title: 'Mở rộng dịch vụ', description: 'Thêm dịch vụ đặt bàn và đánh giá nhà hàng' },
    { year: '2025', title: 'Dẫn đầu thị trường', description: 'Top 1 nền tảng đặt đồ ăn tại Việt Nam' }
  ];

  const features = [
    {
      icon: <Smartphone className="w-10 h-10" />,
      title: 'Ứng dụng dễ sử dụng',
      description: 'Giao diện thân thiện, đặt hàng nhanh chóng chỉ với vài thao tác đơn giản'
    },
    {
      icon: <Star className="w-10 h-10" />,
      title: 'Đánh giá chân thực',
      description: 'Hệ thống đánh giá minh bạch giúp bạn chọn được món ăn ngon nhất'
    },
    {
      icon: <Gift className="w-10 h-10" />,
      title: 'Ưu đãi hấp dẫn',
      description: 'Voucher, giảm giá và chương trình khuyến mãi liên tục cập nhật'
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: 'Theo dõi đơn hàng',
      description: 'Cập nhật vị trí shipper real-time, biết chính xác món ăn đến khi nào'
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: 'Thanh toán an toàn',
      description: 'Đa dạng phương thức thanh toán với bảo mật tối đa'
    },
    {
      icon: <Phone className="w-10 h-10" />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ mọi lúc mọi nơi'
    }
  ];

  const partners = [
    { name: 'Highlands Coffee', category: 'Cà phê' },
    { name: 'KFC', category: 'Thức ăn nhanh' },
    { name: 'The Pizza Company', category: 'Pizza' },
    { name: 'Phở 24', category: 'Món Việt' },
    { name: 'Gong Cha', category: 'Trà sữa' },
    { name: 'Lotteria', category: 'Burger' },
    { name: 'Jollibee', category: 'Thức ăn nhanh' },
    { name: 'Domino\'s Pizza', category: 'Pizza' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50 -z-10"></div>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-100 rounded-full">
            <span className="text-orange-600 font-semibold text-sm">🎉 Nền tảng đặt đồ ăn #1 Việt Nam</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Về <span className="text-orange-500">Foody</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Kết nối bạn với hàng ngàn nhà hàng và món ăn yêu thích chỉ trong vài phút. 
            Chúng tôi mang đến trải nghiệm đặt đồ ăn trực tuyến tốt nhất tại Việt Nam với công nghệ hiện đại và dịch vụ tận tâm.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition flex items-center shadow-lg hover:shadow-xl">
              Tải ứng dụng
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
            <button className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold border-2 border-orange-500 hover:bg-orange-50 transition">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform">
                <div className="flex justify-center mb-3 text-orange-500 group-hover:text-orange-600">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Foody được thành lập vào năm 2020 với một ý tưởng đơn giản nhưng đầy khát vọng: làm cho việc đặt đồ ăn trở nên dễ dàng và thuận tiện hơn bao giờ hết cho người dân Việt Nam.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Từ một startup nhỏ với 10 nhân viên và 100 nhà hàng đối tác, chúng tôi đã không ngừng phát triển và mở rộng. Ngày nay, Foody tự hào là nền tảng đặt đồ ăn trực tuyến hàng đầu với hơn 10,000 nhà hàng đối tác và phục vụ hơn 500,000 khách hàng trên toàn quốc.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Thành công của chúng tôi đến từ sự tin tưởng và ủng hộ của khách hàng, đối tác, và đội ngũ nhân viên tài năng, tận tâm. Chúng tôi cam kết tiếp tục đổi mới và phát triển để mang đến những trải nghiệm tuyệt vời nhất.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl text-white">
                <TrendingUp className="w-10 h-10 mb-3" />
                <h3 className="text-3xl font-bold mb-2">300%</h3>
                <p className="text-sm opacity-90">Tăng trưởng năm 2024</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-2xl text-white mt-8">
                <Award className="w-10 h-10 mb-3" />
                <h3 className="text-3xl font-bold mb-2">Top 1</h3>
                <p className="text-sm opacity-90">Ứng dụng Food Delivery</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-6 rounded-2xl text-white">
                <Star className="w-10 h-10 mb-3" />
                <h3 className="text-3xl font-bold mb-2">4.8/5</h3>
                <p className="text-sm opacity-90">Đánh giá khách hàng</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-2xl text-white mt-8">
                <Users className="w-10 h-10 mb-3" />
                <h3 className="text-3xl font-bold mb-2">5000+</h3>
                <p className="text-sm opacity-90">Shipper đối tác</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Tabs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-8 py-3 rounded-full font-semibold transition flex items-center ${
                activeTab === 'mission'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              <Target className="w-5 h-5 mr-2" />
              Sứ mệnh
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-8 py-3 rounded-full font-semibold transition flex items-center ${
                activeTab === 'vision'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              <Eye className="w-5 h-5 mr-2" />
              Tầm nhìn
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-xl p-8 md:p-12 border border-orange-100">
            {activeTab === 'mission' ? (
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="w-8 h-8 text-orange-500 mr-3" />
                  Sứ mệnh của chúng tôi
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Foody được sinh ra với sứ mệnh làm cho việc đặt đồ ăn trở nên dễ dàng, nhanh chóng và tiện lợi hơn bao giờ hết. 
                  Chúng tôi tin rằng mọi người đều xứng đáng được thưởng thức những món ăn ngon mà không phải lo lắng về việc nấu nướng hay di chuyển.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Bằng công nghệ hiện đại và mạng lưới đối tác rộng khắp, chúng tôi kết nối hàng triệu người với những nhà hàng yêu thích của họ. 
                  Mỗi đơn hàng không chỉ là một giao dịch, mà là một trải nghiệm đáng nhớ, mang đến niềm vui và sự hài lòng cho khách hàng.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Chúng tôi cam kết hỗ trợ các nhà hàng địa phương phát triển, tạo việc làm cho hàng ngàn shipper, 
                  và góp phần xây dựng một cộng đồng ẩm thực lành mạnh, văn minh tại Việt Nam.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Eye className="w-8 h-8 text-orange-500 mr-3" />
                  Tầm nhìn của chúng tôi
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Chúng tôi hướng đến việc trở thành nền tảng đặt đồ ăn số 1 tại Việt Nam và mở rộng ra khu vực Đông Nam Á. 
                  Tầm nhìn của Foody là tạo ra một hệ sinh thái ẩm thực hoàn chỉnh, nơi mọi người có thể khám phá, đặt hàng và thưởng thức 
                  đồ ăn một cách dễ dàng nhất.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  Trong 5 năm tới, chúng tôi muốn đạt được 5 triệu người dùng hoạt động, hợp tác với 50,000 nhà hàng, 
                  và mở rộng dịch vụ sang các lĩnh vực như đặt bàn nhà hàng, giao hàng tạp hóa, và du lịch ẩm thực.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Foody không chỉ là một ứng dụng đặt đồ ăn, mà là người bạn đồng hành tin cậy trong mọi bữa ăn của bạn. 
                  Chúng tôi không ngừng đổi mới, ứng dụng AI và công nghệ tiên tiến để mang đến trải nghiệm cá nhân hóa tốt nhất.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Hành trình phát triển</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Từ những bước đi đầu tiên đến vị thế dẫn đầu thị trường
          </p>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-orange-500 to-red-500 hidden md:block"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                      <div className="text-2xl font-bold text-orange-500 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-12 h-12 bg-orange-500 rounded-full items-center justify-center text-white font-bold shadow-lg z-10">
                    {index + 1}
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Giá trị cốt lõi</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Những giá trị định hình cách chúng tôi làm việc và phục vụ khách hàng mỗi ngày
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl hover:shadow-xl transition border border-orange-100 group">
                <div className="text-orange-500 mb-4 group-hover:scale-110 transition-transform">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Tại sao chọn Foody?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Những tính năng vượt trội khiến Foody trở thành lựa chọn hàng đầu
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition group">
                <div className="text-orange-500 mb-4 group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Đối tác của chúng tôi</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Hợp tác với các thương hiệu F&B hàng đầu Việt Nam
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center group">
                <div className="text-3xl mb-3">🍽️</div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition">{partner.name}</h3>
                <p className="text-sm text-gray-500">{partner.category}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600">và hơn 10,000 đối tác khác trên toàn quốc</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Đội ngũ lãnh đạo</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Những con người đam mê đứng sau thành công của Foody
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition group border border-orange-100">
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-orange-500 font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-12 text-white">
                <h2 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h2>
                <p className="text-lg mb-8 opacity-90">
                  Có câu hỏi hoặc muốn hợp tác? Chúng tôi luôn sẵn sàng lắng nghe!
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 mr-4" />
                    <div>
                      <div className="font-semibold">Hotline</div>
                      <div>1900 xxxx</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-4" />
                    <div>
                      <div className="font-semibold">Email</div>
                      <div>support@foody.vn</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-6 h-6 mr-4" />
                    <div>
                      <div className="font-semibold">Website</div>
                      <div>www.foody.vn</div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-8">
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="bg-white p-12">
                <form className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Họ và tên</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Tin nhắn</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nội dung tin nhắn..."
                    ></textarea>
                  </div>
                  <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Gửi tin nhắn
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Sẵn sàng đặt món ngay?</h2>
          <p className="text-xl mb-8 opacity-90">
            Tải ứng dụng Foody và khám phá hàng ngàn món ăn ngon đang chờ bạn. 
            Nhận ngay voucher 50K cho đơn hàng đầu tiên!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition inline-flex items-center shadow-2xl">
              <Smartphone className="w-6 h-6 mr-2" />
              Tải ứng dụng ngay
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition inline-flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              Nhận ưu đãi
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold">Foody</span>
              </div>
              <p className="text-gray-400 mb-4">
                Nền tảng đặt đồ ăn trực tuyến hàng đầu Việt Nam
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Về Foody</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Giới thiệu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Tuyển dụng</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Tin tức</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Hợp tác</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Hỗ trợ</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">An toàn thực phẩm</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Điều khoản</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">Chính sách bảo mật</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">
                  <Phone className="w-4 h-4 inline mr-2" />
                  1900 xxxx
                </li>
                <li className="text-gray-400">
                  <Mail className="w-4 h-4 inline mr-2" />
                  support@foody.vn
                </li>
                <li className="text-gray-400">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Hà Nội & TP.HCM
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2025 Foody Vietnam. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-2">Made with ❤️ for food lovers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}