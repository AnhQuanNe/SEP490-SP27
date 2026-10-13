import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudioMockup from '../components/home/StudioMockup';
import ReflexTrainerModal from '../components/common/ReflexTrainerModal';
import {
    Heart,
    Video,
    MessageSquare,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    BookOpen,
    Globe,
    Shield,
    Users,
    GraduationCap,
    Zap,
    Play,
    Flame,
    Award,
    Volume2,
    Eye,
    Layers,
    ChevronRight,
    Camera
} from 'lucide-react';

const Home = () => {
    const { user, isAuthenticated, getAvatarUrl } = useAuth();
    const avatarSrc = user ? getAvatarUrl(user?.avatar) : null;

    // Interactive Demo Sign Selector State
    const [selectedSign, setSelectedSign] = useState(0);
    const [reflexModalOpen, setReflexModalOpen] = useState(false);

    const sampleSigns = [
        {
            title: "Xin chào",
            pinyin: "Hello / Greeting",
            description: "Đưa bàn tay mở úp nhẹ lên gần thái dương, sau đó vẫy nhẹ hướng ra phía trước với ánh mắt thân thiện.",
            region: "Toàn quốc (Phổ thông)",
            difficulty: "Cơ bản",
            tips: "Giữ ngón tay khép tự nhiên, góc mở khuỷu tay 45 độ."
        },
        {
            title: "Cảm ơn",
            pinyin: "Thank You",
            description: "Đặt đầu các ngón tay của bàn tay thuận chạm nhẹ vào cằm, rồi đưa nhẹ về phía người đối diện.",
            region: "Miền Bắc & Miền Nam",
            difficulty: "Cơ bản",
            tips: "Kèm theo nụ cười nhẹ để biểu thị sự trân trọng chân thành."
        },
        {
            title: "Tôi yêu bạn",
            pinyin: "I Love You (ILY)",
            description: "Xòe ngón cái, ngón trỏ và ngón út, gập hai ngón giữa lại và hướng lòng bàn tay về phía đối phương.",
            region: "Quốc tế & Việt Nam",
            difficulty: "Cơ bản",
            tips: "Giữ vững tư thế ngón tay trong 1.5 giây để hệ thống nhận diện chuẩn."
        },
        {
            title: "Cần giúp đỡ",
            pinyin: "Need Help",
            description: "Bàn tay trái xòe ngửa làm bệ đỡ, bàn tay phải nắm lại ngón cái dựng đứng đặt lên lòng bàn tay trái rồi nâng lên cùng lúc.",
            region: "Toàn quốc",
            difficulty: "Trung bình",
            tips: "Cử chỉ hai tay phối hợp nhịp nhàng, biểu cảm nghiêm túc."
        }
    ];

    return (
        <div className="space-y-20 pb-20 overflow-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
                {/* Background Glow Orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-rose-200/40 via-purple-200/40 to-indigo-200/40 blur-3xl rounded-full -z-10 pointer-events-none" />
                <div className="absolute top-10 right-10 w-72 h-72 bg-blue-100/50 rounded-full blur-2xl -z-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        
                        {/* Left Hero Content */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 shadow-2xs text-xs font-bold text-rose-600">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                                <span>Nền tảng học Ngôn ngữ Ký hiệu AI số 1 Việt Nam</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                                    Kết Nối Trái Tim
                                </span>
                                <br />
                                <span className="text-slate-900">Xóa Bỏ Mọi Rào Cản Giao Tiếp</span>
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Trợ lý AI nhận diện cử chỉ 21 điểm khớp tay thời gian thực, kết hợp công nghệ chuyển đổi Hai Chiều giữa Ký hiệu và Tiếng nói tiếng Việt.
                            </p>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                                <Link
                                    to="/learning/mirror"
                                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:opacity-95 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                                >
                                    <span>Bắt đầu Học Ngay</span>
                                    <ArrowRight className="w-4 h-4 ml-0.5" />
                                </Link>

                                <Link
                                    to="/communicator"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-sm sm:text-base"
                                >
                                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                                    <span>Khám phá Dịch 2 Chiều</span>
                                </Link>

                                <button
                                    onClick={() => setReflexModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-amber-700 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 transition-all text-sm cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    <span>Luyện Phản Xạ Nhanh</span>
                                </button>
                            </div>

                            {/* Feature Micro-Badges */}
                            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-6 text-xs text-slate-600 font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span>Chấm 21 góc tay chuẩn qua Webcam</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    <span>Độ trễ truyền nhận &lt; 100ms</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    <span>Phương ngữ Bắc - Trung - Nam</span>
                                </span>
                            </div>
                        </div>

                        {/* Right Hero Interactive Visual Mockup */}
                        <div className="lg:col-span-5 relative">
                            <StudioMockup />
                        </div>

                    </div>
                </div>
            </section>

            {/* LOGGED IN USER OVERVIEW BANNER */}
            {isAuthenticated && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                            
                            {/* User Info */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-rose-500/40 bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-extrabold text-rose-400">
                                                {user?.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Đang hoạt động"></div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <h2 className="text-2xl font-bold">Chào mừng trở lại, {user?.name}!</h2>
                                        {user?.isVerified && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-400" title="Tài khoản đã xác thực" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300">{user?.email}</p>
                                    
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 capitalize">
                                            {user?.role === 'deaf' ? 'Người khiếm thính' : user?.role || 'Learner'}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                            Cấp độ 3: Giao tiếp thường nhật
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Progress Stats & Quick Actions */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full lg:w-auto justify-center">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-center min-w-[100px]">
                                    <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-lg">
                                        <Flame className="w-5 h-5 fill-amber-400" />
                                        <span>5 Ngày</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Streak</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-center min-w-[100px]">
                                    <div className="flex items-center justify-center gap-1 text-indigo-300 font-bold text-lg">
                                        <Award className="w-5 h-5" />
                                        <span>1,450</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Điểm XP</p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition shadow-md whitespace-nowrap"
                                >
                                    Quản lý Hồ sơ
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>
            )}

            {/* NUMERICAL HIGHLIGHT STATS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">1,500+</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                            Cử chỉ chuẩn hóa Synset
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                            <Globe className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">3 Miền</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                            Phương ngữ Bắc - Trung - Nam
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">98%</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                            Độ chính xác MediaPipe AI
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">&lt; 100ms</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                            Độ trễ Socket.IO Real-time
                        </p>
                    </div>

                </div>
            </section>

            {/* 4 CORE ECOSYSTEM PILLARS (UC05 - UC21) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-extrabold tracking-widest text-rose-600 uppercase">
                        Hệ Sinh Thái Toàn Diện
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        4 Trụ Cột Đột Phá Của HeartSign
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Được thiết kế dựa trên quy chuẩn 21 Use Cases khoa học, phục vụ đồng thời người học, cộng đồng người khiếm thính và giảng viên chuyên biệt.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Pillar 1 */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                <Video className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">UC06 Studio</span>
                                <h3 className="text-lg font-bold text-slate-900">Gương Ảo AI Split-Screen</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Đặt video mẫu bên trái, mở webcam lật gương bên phải. AI nhận diện 21 góc ngón tay, cảnh báo viền Đỏ khi sai và đếm giữ thế <strong>1.5 giây</strong> khi đúng.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link to="/learning/mirror" className="text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                Luyện tập ngay <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">UC09 - UC11 Communicator</span>
                                <h3 className="text-lg font-bold text-slate-900">Trợ Lý Dịch 2 Chiều Real-Time</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Dịch Cử chỉ ➔ Giọng nói (Sign-to-Voice) và Giọng nói ➔ Ký hiệu (Voice-to-Sign). Phòng thoại WebSocket đồng bộ tức thì trên 2 thiết bị không cần F5.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link to="/communicator" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                Bắt đầu cuộc trò chuyện <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">UC12 - UC14 Crowdsourcing</span>
                                <h3 className="text-lg font-bold text-slate-900">Không Gian Phương Ngữ Synset</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Tra cứu đối chiếu song song 2 video: Ký hiệu địa phương vs Ký hiệu chuẩn phổ thông. Tự quay webcam đóng góp biến thể và thả tim thẩm định cộng đồng.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link to="/dictionary" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                Tra cứu đối chiếu <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Pillar 4 */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">UC05 & UC15-17 Console</span>
                                <h3 className="text-lg font-bold text-slate-900">Skill Tree & Lớp Học Giảng Viên</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Học theo lộ trình Cây kỹ năng Gamification. Giảng viên cấp Join Code tạo lớp, giao bài tập về nhà Gương ảo AI và theo dõi biểu đồ lỗi sai cử chỉ.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link to="/learning/skill-tree" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                Khám phá lộ trình <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* INTERACTIVE SAMPLER / QUICK PRACTICE */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Selector Area */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-rose-400 text-xs font-bold border border-slate-700">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Thư Viện Ngữ Liệu Nhanh</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Khám Phá Các Ký Hiệu Cơ Bản Phổ Biến Nhất
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Chọn một cử chỉ để xem phân tích thế tay, gợi ý phát âm và mẹo để AI chấm điểm đạt 100%.
                            </p>

                            <div className="space-y-2 pt-2">
                                {sampleSigns.map((item, idx) => (
                                    <button
                                        key={item.title}
                                        onClick={() => setSelectedSign(idx)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition font-semibold text-sm ${
                                            selectedSign === idx
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                selectedSign === idx ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                                0{idx + 1}
                                            </span>
                                            <span>{item.title}</span>
                                        </div>
                                        <span className={`text-xs ${selectedSign === idx ? 'text-rose-100' : 'text-slate-400'}`}>
                                            {item.difficulty}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sign Detail Card */}
                        <div className="lg:col-span-7">
                            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
                                    <div>
                                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                                            {sampleSigns[selectedSign].pinyin}
                                        </span>
                                        <h4 className="text-3xl font-black text-white mt-0.5">
                                            {sampleSigns[selectedSign].title}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            {sampleSigns[selectedSign].region}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            Độ khó: {sampleSigns[selectedSign].difficulty}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Hướng Dẫn Cử Chỉ Cụ Thể
                                    </h5>
                                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                                        {sampleSigns[selectedSign].description}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Mẹo Đạt Chuẩn AI (1.5s Hold-time)
                                    </h5>
                                    <div className="flex items-start gap-2.5 text-xs text-amber-300 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <span>{sampleSigns[selectedSign].tips}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-wrap gap-3">
                                    <Link
                                        to="/learning/mirror"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition"
                                    >
                                        <Video className="w-4 h-4" />
                                        Bật Camera Luyện Bài Này
                                    </Link>
                                    <Link
                                        to="/dictionary"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                                    >
                                        <Globe className="w-4 h-4" />
                                        Xem Biến Thể 3 Miền
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5 ACTORS ROADMAP ACCORDION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                    <span className="text-xs font-extrabold tracking-widest text-indigo-600 uppercase">
                        Hệ Thống 5 Tác Nhân Chuẩn Xác
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        Đồng Hành Cùng Mọi Đối Tượng Trong Xã Hội
                    </h2>
                    <p className="text-slate-600 text-sm">
                        HeartSign cam kết mang lại trải nghiệm tối ưu, bình đẳng và được cá nhân hóa theo từng vai trò cụ thể.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm hover:border-rose-300 transition">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold mx-auto">
                            1
                        </div>
                        <h4 className="font-bold text-slate-900">Khách (Guest)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Trải nghiệm thử từ điển, 3 bài Gương ảo AI cơ bản và 5 phút trợ lý dịch 2 chiều không cần tạo tài khoản.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 text-center space-y-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold mx-auto">
                            2
                        </div>
                        <h4 className="font-bold text-slate-900">Học Viên (Learner)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Mở khóa Cây kỹ năng tuần tự, luyện giữ thế 1.5s, nhận diện góc tay, tích lũy XP / Streak và hoàn thành bài tập.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 text-center space-y-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mx-auto">
                            3
                        </div>
                        <h4 className="font-bold text-slate-900">Người Khiếm Thính</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Giao tiếp hai chiều tức thời (Sign ↔ Voice), phòng hội thoại WebSocket, tự quay webcam đóng góp video bản địa.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 text-center space-y-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold mx-auto">
                            4
                        </div>
                        <h4 className="font-bold text-slate-900">Giảng Viên (Educator)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Cấp Join Code tạo lớp học, quay video mẫu chuẩn (Ground Truth), giao bài tập AI và theo dõi biểu đồ lỗi sai.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 text-center space-y-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mx-auto">
                            5
                        </div>
                        <h4 className="font-bold text-slate-900">Quản Trị Viên (Admin)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Phân quyền tài khoản (RBAC), duyệt video cộng đồng (Review Queue: Duyệt / Từ chối) và quản lý Seed Data.
                        </p>
                    </div>

                </div>
            </section>

            {/* CALL TO ACTION BANNER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-700 p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                            Khởi Đầu Hành Trình Không Rào Cản
                        </span>

                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                            Sẵn Sàng Trải Nghiệm HeartSign Ngay Hôm Nay?
                        </h2>

                        <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
                            Tạo tài khoản miễn phí chỉ trong 30 giây để tích lũy điểm XP, lưu lại lộ trình học tập và kết nối với cộng đồng người khiếm thính trên toàn quốc.
                        </p>

                        <div className="pt-4 flex flex-wrap justify-center gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-3.5 rounded-2xl bg-white text-rose-600 font-extrabold text-sm sm:text-base hover:bg-rose-50 shadow-lg shadow-black/10 transition-all hover:scale-105"
                            >
                                Đăng Ký Tài Khoản Miễn Phí
                            </Link>
                            <Link
                                to="/learning/mirror"
                                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/30 backdrop-blur-md transition-all"
                            >
                                Thử Ngay Với Webcam
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gamified Flashcard Reflex Modal */}
            <ReflexTrainerModal
                isOpen={reflexModalOpen}
                onClose={() => setReflexModalOpen(false)}
            />

        </div>
    );
};

export default Home;
