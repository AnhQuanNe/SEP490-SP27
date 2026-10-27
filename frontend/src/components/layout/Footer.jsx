import { BookOpen, Sparkles, Heart, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-[#180505] to-[#0c0202] text-stone-300 border-t-2 border-amber-600/30 relative overflow-hidden">
            {/* Họa tiết Trống Đồng mờ ở góc Footer */}
            <div className="absolute right-0 bottom-0 w-96 h-96 opacity-5 pointer-events-none translate-x-1/3 translate-y-1/3">
                <svg viewBox="0 0 200 200" className="w-full h-full stroke-amber-400 fill-none animate-dongson-slow">
                    <circle cx="100" cy="100" r="90" strokeWidth="2" strokeDasharray="4 2" />
                    <circle cx="100" cy="100" r="70" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="40" strokeWidth="2" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-950 via-red-800 to-amber-600 flex items-center justify-center text-amber-300 font-bold shadow-md border border-amber-400/40">
                                <BookOpen className="w-5 h-5 text-amber-300" />
                            </div>
                            <span className="text-2xl font-extrabold text-amber-100 font-heritage tracking-tight">
                                VietHeritage <span className="text-amber-400 font-sans text-lg font-bold">AI</span>
                            </span>
                        </div>
                        <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
                            Nền tảng tri thức số hóa và khám phá ca dao, tục ngữ và văn học dân gian Việt Nam ứng dụng Trí tuệ Nhân tạo thế hệ mới. Gìn giữ và tôn vinh tinh hoa di sản tiền nhân.
                        </p>
                        <div className="pt-2 flex items-center gap-3 text-xs text-stone-400">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 rounded-full border border-amber-600/40 text-amber-300">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Rồng Bay Phượng Múa
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-950/80 rounded-full border border-amber-600/40 text-stone-300">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Nguồn Học Thuật Chuẩn Mực
                            </span>
                        </div>
                    </div>

                    {/* Navigation 1 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <span>❖</span> Khám Phá Di Sản
                        </h4>
                        <ul className="space-y-2 text-sm text-stone-400">
                            <li><Link to="/kham-pha" className="hover:text-amber-300 transition-colors">Ca dao & Tục ngữ</Link></li>
                            <li><Link to="/kham-pha?mode=semantic" className="hover:text-amber-300 transition-colors">Tìm kiếm ý nghĩa bằng AI</Link></li>
                            <li><Link to="/dong-gop" className="hover:text-amber-300 transition-colors">Đóng góp di sản văn hóa</Link></li>
                        </ul>
                    </div>

                    {/* Navigation 2 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <span>❖</span> Trợ Lý AI
                        </h4>
                        <ul className="space-y-2 text-sm text-stone-400">
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Giải nghĩa 4 tầng nghĩa</a></li>
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Bối cảnh lịch sử & Văn hóa</a></li>
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Tra cứu điển cố, thành ngữ</a></li>
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Cảm thụ văn học dân gian</a></li>
                        </ul>
                    </div>

                    {/* Navigation 3 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <span>❖</span> Hệ Thống
                        </h4>
                        <ul className="space-y-2 text-sm text-stone-400">
                            <li><Link to="/login" className="hover:text-amber-300 transition-colors">Đăng nhập thành viên</Link></li>
                            <li><Link to="/register" className="hover:text-amber-300 transition-colors">Đăng ký tài khoản</Link></li>
                            <li><Link to="/profile" className="hover:text-amber-300 transition-colors">Hồ sơ cá nhân</Link></li>
                            <li><span className="text-stone-600 cursor-not-allowed">Chính sách bảo tồn di sản</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
                    <p>© {new Date().getFullYear()} VietHeritage AI Platform. Bảo tồn và lan tỏa hồn thiêng văn học Việt Nam.</p>
                    <p className="flex items-center gap-1 text-stone-400">
                        Xây dựng với niềm tự hào di sản ngàn năm văn hiến
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 ml-1" />
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
