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
    </div>
  );
}