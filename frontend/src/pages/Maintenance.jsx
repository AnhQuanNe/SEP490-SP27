import { Wrench, RefreshCw, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-[#faf6ed] flex flex-col justify-between font-vietnam text-stone-800 antialiased selection:bg-amber-200 selection:text-red-950 relative overflow-hidden">
            {/* Họa tiết nền chìm hoàng cung */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#78350f_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* Dải viền son - vàng hoàng kim trên đỉnh */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-900 via-amber-500 to-red-900" />

            {/* Khối Nội Dung Chính */}
            <main className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
                <div className="max-w-xl w-full text-center space-y-6 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-amber-900/15 p-8 sm:p-12 shadow-2xl shadow-amber-950/10">
                    {/* Icon Bảo Trì Phong Cách Di Sản */}
                    <div className="relative inline-block mx-auto">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 via-red-800 to-amber-900 flex items-center justify-center text-amber-200 shadow-xl shadow-red-950/20 rotate-3">
                            <Wrench className="w-10 h-10 animate-bounce" />
                        </div>
                        <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 border border-amber-300 shadow-xs">
                            BẢO TRÌ
                        </span>
                    </div>

                    {/* Tiêu đề & Lời nhắn */}
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>VietHeritage AI • Nâng Cấp Hạ Tầng</span>
                        </span>

                        <h1 className="text-2xl sm:text-3xl font-extrabold font-heritage text-red-950 tracking-tight leading-snug">
                            Hệ Thống Đang Trong Thời Gian Bảo Trì
                        </h1>

                        <p className="text-sm text-stone-600 leading-relaxed">
                            Ban Quản trị đang tiến hành bảo dưỡng hạ tầng kỹ thuật và đồng bộ kho tàng dữ liệu văn học di sản để nâng cao trải nghiệm cho quý sĩ tử.
                        </p>

                        <p className="text-xs text-stone-500 italic">
                            Hệ thống sẽ mở lại phục vụ công chúng ngay khi công tác kiểm thử hoàn tất. Quý vị vui lòng thử lại sau ít phút.
                        </p>
                    </div>

                    {/* Nút Hành Động */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-amber-900/10">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-amber-100 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Tải Lại Trang</span>
                        </button>

                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-950 border border-stone-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Cổng Quản Trị Viên</span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Chân trang giản lược */}
            <footer className="text-center py-4 text-xs text-stone-500 relative z-10 border-t border-amber-900/10 bg-white/50">
                © {new Date().getFullYear()} VietHeritage AI — Nền Tảng Di Sản Văn Học Dân Gian Việt Nam.
            </footer>
        </div>
    );
};

export default Maintenance;

