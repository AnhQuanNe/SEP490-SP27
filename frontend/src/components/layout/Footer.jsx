import { BookOpen, Sparkles, Heart, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md">
                                <BookOpen className="w-5 h-5 text-slate-950" />
                            </div>
                            <span className="text-2xl font-extrabold text-white font-heritage tracking-tight">
                                VietHeritage <span className="text-amber-400 font-sans text-lg font-bold">AI</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Nền tảng tri thức số hóa và khám phá văn học, văn hóa dân gian Việt Nam ứng dụng công nghệ Trí tuệ Nhân tạo thế hệ mới. Kết nối thế hệ trẻ với tinh hoa di sản tiền nhân.
                        </p>
                        <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-amber-300/90">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                WDP301
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-slate-300">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Nguồn Học Thuật
                            </span>
                        </div>
                    </div>

                    {/* Navigation 1 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Khám Phá Di Sản</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/van-hoc-dan-gian" className="hover:text-amber-300 transition-colors">Văn học Dân gian</Link></li>
                            <li><Link to="/kham-pha" className="hover:text-amber-300 transition-colors">Kho tàng Tri thức</Link></li>
                            <li><Link to="/van-hoc-dan-gian" className="hover:text-amber-300 transition-colors">Ca dao & Tục ngữ</Link></li>
                            <li><Link to="/ban-do" className="hover:text-amber-300 transition-colors">Bản đồ Văn học 3 miền</Link></li>
                        </ul>
                    </div>

                    {/* Navigation 2 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Trợ Lý AI</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Hỏi đáp tác phẩm (Q&A)</a></li>
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Tóm tắt & Bối cảnh</a></li>
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Giải nghĩa điển cố, từ cổ</a></li>
                            <li><a href="#tro-ly-ai" className="hover:text-amber-300 transition-colors">Cảm thụ & Thẩm bình thơ</a></li>
                        </ul>
                    </div>

                    {/* Navigation 3 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Hệ Thống</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/login" className="hover:text-amber-300 transition-colors">Đăng nhập thành viên</Link></li>
                            <li><Link to="/register" className="hover:text-amber-300 transition-colors">Đăng ký tài khoản</Link></li>
                            <li><Link to="/profile" className="hover:text-amber-300 transition-colors">Hồ sơ cá nhân</Link></li>
                            <li><span className="text-slate-500 cursor-not-allowed">Chính sách bảo tồn di sản</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <p>© {new Date().getFullYear()} VietHeritage AI Platform. Bảo tồn và lan tỏa hồn thiêng văn học Việt Nam.</p>
                    <p className="flex items-center gap-1 text-slate-400">
                        Xây dựng với tâm huyết dành cho văn hóa dân tộc
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 ml-1" />
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
