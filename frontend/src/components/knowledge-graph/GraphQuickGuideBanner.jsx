import { Sparkles, Compass, Crown, LayoutGrid, X, ArrowRight } from 'lucide-react';

/**
 * GraphQuickGuideBanner - Banner hướng dẫn nhanh 15 giây cho người dùng mới
 * Giúp người dùng ngay lập tức hiểu cách tương tác, xoá tan sự bỡ ngỡ trước mạng lưới tri thức.
 */
const GraphQuickGuideBanner = ({ isOpen, onClose, onOpenTour, onSwitchToGrid }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
            <div className="relative max-w-xl w-full bg-gradient-to-b from-stone-900/95 to-stone-950/95 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.2)] text-stone-200">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Đóng hướng dẫn"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Tiêu đề */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <Sparkles className="w-5 h-5 fill-stone-950" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                            Chào mừng đến với Vũ Trụ Tri Thức Dân Gian
                        </h2>
                        <p className="text-xs text-amber-300/90 font-medium">
                            3 cách tiếp cận đơn giản nhất dành cho bạn:
                        </p>
                    </div>
                </div>

                {/* 3 Thẻ chỉ dẫn trực quan */}
                <div className="space-y-2.5 my-5">
                    {/* Cách 1 */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 transition-all flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Crown className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                            <span className="font-bold text-amber-200 block mb-0.5">
                                1. Bắt đầu từ Trụ Cột Cốt Lõi
                            </span>
                            <span className="text-stone-300 text-[11px] leading-relaxed block">
                                Nhấp vào 1 trong các trụ cột ở <b>thanh dưới cùng</b> (như <i>Lòng yêu nước, Đoàn kết...</i>). Đồ thị sẽ tự động rọi đèn tiêu điểm vào chòm sao đó và thu gọn các liên kết thừa.
                            </span>
                        </div>
                    </div>

                    {/* Cách 2 */}
                    <div 
                        onClick={() => {
                            onClose();
                            onOpenTour?.();
                        }}
                        className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/60 transition-all flex items-start gap-3 cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                            <Compass className="w-4 h-4" />
                        </div>
                        <div className="text-xs flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 block mb-0.5">
                                    2. Du Hành Thi Pháp AI (Khuyên dùng)
                                </span>
                                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                                    Bấm để thử <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                            <span className="text-stone-300 text-[11px] leading-relaxed block">
                                Không cần tự tìm kiếm! Hướng dẫn viên AI sẽ lướt camera qua từng danh tác, đọc lời bình văn hóa và luận giải ý nghĩa theo kịch bản có sẵn.
                            </span>
                        </div>
                    </div>

                    {/* Cách 3 */}
                    <div 
                        onClick={() => {
                            onClose();
                            onSwitchToGrid?.();
                        }}
                        className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-400/40 transition-all flex items-start gap-3 cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                        <div className="text-xs flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-200 block mb-0.5">
                                    3. Chế Độ Thư Viện Thẻ (Dễ đọc nhất)
                                </span>
                                <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5">
                                    Dạng Thẻ <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                            <span className="text-stone-300 text-[11px] leading-relaxed block">
                                Nếu thấy mạng lưới đồ thị khó quan sát, bạn có thể chuyển sang góc nhìn thẻ bài phân mục gọn gàng như sách điện tử bất cứ lúc nào.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nút hành động chính */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                        Đã hiểu, Bắt đầu khám phá!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphQuickGuideBanner;

