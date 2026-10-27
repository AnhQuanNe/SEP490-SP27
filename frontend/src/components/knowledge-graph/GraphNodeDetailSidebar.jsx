import { Link } from 'react-router-dom';
import { 
    Flame, 
    MapPin, 
    X, 
    Info, 
    Share2, 
    ArrowRight, 
    BookOpen, 
    Route 
} from 'lucide-react';

/**
 * GraphNodeDetailSidebar - Drawer hiển thị chi tiết khi nhấp chọn một nốt tri thức
 * Phân loại theo 4 tầng, trích dẫn ca dao/thơ, bài học nhân sinh và các liên kết trực tiếp lân cận.
 */
const GraphNodeDetailSidebar = ({
    activeNode,
    onClose,
    graphData,
    onSelectSearchNode,
    onSelectPathSource
}) => {
    if (!activeNode) return null;

    return (
        <div className="kg-drawer kg-custom-scroll">
            {/* Header Drawer */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm"
                            style={{ backgroundColor: activeNode.color || '#10b981' }}
                        >
                            {activeNode.type === 'philosophy'
                                ? '🟣 Tầng 1: Triết lý nhân sinh (Gốc rễ)'
                                : activeNode.type === 'archetype'
                                ? '🟠 Tầng 2: Cổ mẫu văn hóa (Cành cây)'
                                : activeNode.type === 'region'
                                ? '🔵 Tầng 3: Địa linh văn hóa (Không gian sống)'
                                : '🟢 Tầng 4: Tác phẩm văn học (Lá non)'}
                        </span>
                        {activeNode.degree && (
                            <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Flame className="w-3 h-3" />
                                Bậc: {activeNode.degree} liên kết
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                        {activeNode.name}
                    </h2>
                    {activeNode.region && (
                        <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {activeNode.region}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Nội dung chi tiết Drawer */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 kg-custom-scroll">
                {/* Quote hoặc Trích dẫn nổi bật nếu là tác phẩm */}
                {activeNode.quote && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm italic font-serif leading-relaxed">
                        &ldquo;{activeNode.quote}&rdquo;
                    </div>
                )}

                {/* Tóm tắt / Ý nghĩa */}
                {activeNode.summary && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-400" />
                            Ý Nghĩa Văn Hóa & Tinh Hoa Dân Gian
                        </h3>
                        <p className="text-sm text-stone-200 leading-relaxed font-light">
                            {activeNode.summary}
                        </p>
                    </div>
                )}

                {/* Chi tiết học thuật / Phân tích thi pháp */}
                {activeNode.details && (
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <h3 className="text-xs font-semibold text-amber-300 mb-1">
                            Thi Pháp & Chiều Sâu Cổ Mẫu:
                        </h3>
                        <p className="text-xs text-stone-300 leading-relaxed">
                            {activeNode.details}
                        </p>
                    </div>
                )}

                {/* Bài học răn dạy */}
                {activeNode.lesson && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Bài Học Nhân Sinh:
                        </h3>
                        <p className="text-sm text-stone-300 leading-relaxed">
                            {activeNode.lesson}
                        </p>
                    </div>
                )}

                {/* Tags liên quan */}
                {activeNode.tags?.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                            Từ Khóa Ngữ Nghĩa:
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {activeNode.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-stone-300"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Danh sách các thực thể liên kết trực tiếp (1st Degree Neighbors) */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        Các Thực Thể Liên Kết Trực Tiếp:
                    </h3>
                    <div className="space-y-2">
                        {graphData?.links
                            ?.filter((link) => {
                                const s = typeof link.source === 'object' ? link.source.id : link.source;
                                const t = typeof link.target === 'object' ? link.target.id : link.target;
                                return s === activeNode.id || t === activeNode.id;
                            })
                            .slice(0, 8)
                            .map((link, idx) => {
                                const s = typeof link.source === 'object' ? link.source.id : link.source;
                                const t = typeof link.target === 'object' ? link.target.id : link.target;
                                const neighborId = s === activeNode.id ? t : s;
                                const neighborNode = graphData.nodes?.find((n) => n.id === neighborId);
                                if (!neighborNode) return null;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => onSelectSearchNode(neighborNode)}
                                        className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: neighborNode.color || '#10b981' }}
                                            />
                                            <div className="truncate">
                                                <div className="text-xs font-medium text-stone-200 group-hover:text-amber-300 transition-colors">
                                                    {neighborNode.name}
                                                </div>
                                                <div className="text-[10px] text-stone-400">
                                                    {link.relation || link.label}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center gap-3">
                {activeNode.slug ? (
                    <Link
                        to={`/kham-pha?q=${encodeURIComponent(activeNode.name)}`}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-600/20"
                    >
                        <BookOpen className="w-4 h-4" />
                        Tra Cứu Tác Phẩm
                    </Link>
                ) : (
                    <button
                        onClick={() => onSelectPathSource(activeNode.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Route className="w-4 h-4" />
                        Chọn Làm Điểm Bắt Đầu Đường Đi
                    </button>
                )}
            </div>
        </div>
    );
};

export default GraphNodeDetailSidebar;
