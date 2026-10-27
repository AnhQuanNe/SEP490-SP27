import { Sparkles, X, ArrowRight, Play } from 'lucide-react';

/**
 * GraphOntologyModal - Modal giải thích kiến trúc 4 Tầng Tri Thức (Knowledge Ontology)
 */
const GraphOntologyModal = ({
    isOpen,
    onClose,
    onSelectCategory,
    onOpenTourModal
}) => {
    if (!isOpen) return null;

    return (
        <div className="kg-tour-modal-overlay">
            <div className="kg-tour-modal-box max-w-3xl">
                {/* Header Modal */}
                <div className="p-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-stone-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                                    Đột Phá Của VietHeritage: Mạch Ngầm Triết Lý Ngàn Năm
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                                    Knowledge Ontology
                                </span>
                            </div>
                            <p className="text-xs text-stone-300 mt-1.5 font-light leading-relaxed">
                                Văn hóa dân gian Việt Nam không tồn tại đơn lẻ, mà có mạch ngầm triết lý xuyên suốt hàng ngàn năm. Đồ thị này sinh ra để kết nối những sợi dây vô hình đó lại với nhau thành <b>4 tầng tri thức</b>:
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 4 Tầng Tri Thức Cards */}
                <div className="p-6 space-y-3.5 overflow-y-auto max-h-[60vh] kg-custom-scroll">
                    {/* Tầng 1: Triết lý nhân sinh */}
                    <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/30 hover:border-pink-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                🟣
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-pink-300">
                                        Tầng 1: Triết Lý Nhân Sinh
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.2 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold">
                                        Gốc rễ vững chắc
                                    </span>
                                </div>
                                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                    <b>Đạo lý cốt lõi:</b> Đạo Hiếu, Uống nước nhớ nguồn, Tương thân tương ái & Tinh thần đùm bọc, Lòng yêu nước & Khát vọng hòa bình...
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                    Là hệ giá trị nhân sinh trường tồn, nuôi dưỡng bản lĩnh và phẩm giá người Việt qua hàng thiên niên kỷ.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onSelectCategory('philosophy');
                                onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span>Lọc xem Triết lý</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Tầng 2: Cổ mẫu văn hóa */}
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                🟠
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-amber-300">
                                        Tầng 2: Cổ Mẫu Văn Hóa (Archetypes)
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                                        Cành cây biểu trưng
                                    </span>
                                </div>
                                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                    <b>Các biểu tượng kinh điển của người Việt:</b> Hình tượng Con Cò & Cánh Vạc, Cây Đa - Bến Nước - Con Đò, Miếng Trầu Cau, Hạt Gạo & Niêu Cơm Thần, Cây Tre & Cành Trúc, Núi Thái Sơn & Chuối Ba Hương...
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                    Mẫu thức nghệ thuật ước lệ hóa tư tưởng dân gian thành các hình tượng gần gũi, thiêng liêng.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onSelectCategory('archetype');
                                onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span>Lọc xem Cổ mẫu</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Tầng 3: Không gian địa linh */}
                    <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                🔵
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-blue-300">
                                        Tầng 3: Địa Linh Văn Hóa
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                                        Không gian nuôi dưỡng
                                    </span>
                                </div>
                                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                    <b>Không gian địa lý & văn hóa 3 miền:</b> Kinh Kỳ Thăng Long & Bắc Bộ ngàn năm văn hiến, Xứ Lam Hồng & Đèo Ngang kiên cường sâu lắng, Đồng Tháp Mười & Nam Bộ hào sảng nghĩa tình...
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                    Mảnh đất nuôi dưỡng mạch nguồn cảm hứng sáng tác của nhân dân qua từng thời kỳ lịch sử.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onSelectCategory('region');
                                onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span>Lọc xem Địa linh</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Tầng 4: Tác phẩm văn học */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                🟢
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-emerald-300">
                                        Tầng 4: Tác Phẩm Văn Học
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                                        Lá non & hoa trái
                                    </span>
                                </div>
                                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                    <b>Các bài ca dao, tục ngữ, truyện cổ tích:</b> Thạch Sanh, Sự tích Trầu Cau, Truyện Kiều, Bài ca vỡ đất, Lời ru của mẹ, Thơ Áo trắng...
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                    Là sản phẩm biểu đạt cụ thể, đơm hoa kết trái từ các cổ mẫu và bám rễ sâu vào triết lý sống.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onSelectCategory('work');
                                onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span>Lọc xem Tác phẩm</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="p-5 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-stone-400">
                        💡 Nhấp chuột vào bất kỳ nốt nào trên đồ thị để khám phá liên kết trực tiếp của nó.
                    </span>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                onSelectCategory('all');
                                onClose();
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                        >
                            Xem Toàn Bộ Vũ Trụ
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onOpenTourModal();
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                            <Play className="w-3 h-3 fill-stone-950" />
                            <span>Khởi Hành Du Hành AI</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphOntologyModal;
