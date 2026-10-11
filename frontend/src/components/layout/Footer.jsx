import { Heart, Sparkles, Video, BookOpen, MessageSquare, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                    
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
                                <Heart className="w-5 h-5 fill-white" />
                            </div>
                            <div>
                                <span className="text-xl font-extrabold text-white tracking-tight">HeartSign</span>
                                <span className="ml-2 text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 font-semibold rounded-full border border-rose-500/30">
                                    HSS v2.0
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Hệ sinh thái đào tạo ngôn ngữ ký hiệu tương tác và trợ lý giao tiếp hai chiều thời gian thực, xóa bỏ rào cản giữa cộng đồng người khiếm thính và xã hội.
                        </p>

                        <div className="flex items-center space-x-3 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                AI MediaPipe & LLM
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                                <Globe className="w-3.5 h-3.5 text-blue-400" />
                                3 Vùng Phương Ngữ
                            </span>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                            Học tập & Luyện tập
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/" className="hover:text-white transition flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-400" />
                                    Cây kỹ năng (Skill Tree)
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition flex items-center gap-2">
                                    <Video className="w-4 h-4 text-rose-400" />
                                    Phòng tập Gương ảo AI
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition">
                                    Luyện phản xạ ngữ cảnh
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="hover:text-white transition">
                                    Hồ sơ năng lực cá nhân
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                            Giao tiếp & Ngữ liệu
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/" className="hover:text-white transition flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                    Trợ lý dịch 2 chiều
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition">
                                    Phòng thoại WebSocket
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition">
                                    Không gian phương ngữ (Synset)
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition">
                                    Đóng góp video cộng đồng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                            Dự án & Nhóm tác giả
                        </h3>
                        <ul className="space-y-2.5 text-sm text-slate-400">
                            <li>
                                <span className="text-slate-300 font-medium">Đồ án tốt nghiệp SEP490</span>
                            </li>
                            <li>Học kỳ Spring 2027 (SP27)</li>
                            <li>Đại học FPT</li>
                            <li className="pt-2">
                                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                                    <Shield className="w-3.5 h-3.5" />
                                    Bảo mật & Chuẩn WCAG 2.1
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} HeartSign (HSS) — SEP490-SP27. Bản quyền thuộc nhóm tác giả.</p>
                    <div className="flex items-center space-x-6 text-slate-400">
                        <span className="hover:text-slate-200 cursor-pointer transition">Chính sách bảo mật</span>
                        <span className="hover:text-slate-200 cursor-pointer transition">Tiêu chuẩn tiếp cận</span>
                        <span className="hover:text-slate-200 cursor-pointer transition">Hướng dẫn sử dụng</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
