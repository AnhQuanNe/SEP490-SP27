import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Flame, 
    MapPin, 
    X, 
    Info, 
    Share2, 
    ArrowRight, 
    BookOpen, 
    Route,
    Sparkles,
    Loader2,
    RotateCw,
    Volume2,
    VolumeX,
    Copy,
    Check,
    BadgeCheck
} from 'lucide-react';
import literatureService from '../../services/literature.service';

/**
 * GraphNodeDetailSidebar - Drawer hiển thị chi tiết khi nhấp chọn một nốt tri thức
 * Tích hợp AI Real 100% với giao diện Glassmorphism chuyên nghiệp, chuẩn mực học thuật.
 */
const GraphNodeDetailSidebar = ({
    activeNode,
    onClose,
    graphData,
    onSelectSearchNode,
    onSelectPathSource
}) => {
    // Cache lưu lời phân tích của từng nốt riêng biệt theo ID nốt
    const [nodeAiCache, setNodeAiCache] = useState({});
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!activeNode) return null;

    // Lấy lời phân tích AI của nốt hiện tại (nếu có)
    const currentAiInsight = nodeAiCache[activeNode.id] || null;

    // Gọi Gemini AI phân tích chuyên sâu thực thể này
    const handleAskAiAboutNode = async () => {
        try {
            setIsAiLoading(true);
            const res = await literatureService.inspectNodeWithAI(activeNode.id);
            if (res.aiInsight) {
                setNodeAiCache((prev) => ({
                    ...prev,
                    [activeNode.id]: res.aiInsight,
                }));
            }
        } catch (err) {
            console.error('Lỗi khi hỏi AI về thực thể:', err);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Sao chép nội dung phân tích
    const handleCopy = () => {
        if (!currentAiInsight) return;
        navigator.clipboard.writeText(currentAiInsight);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Đọc thuyết minh bằng giọng nói tiếng Việt
    const handleToggleSpeech = () => {
        if (!window.speechSynthesis || !currentAiInsight) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(currentAiInsight);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.95;

        const voices = window.speechSynthesis.getVoices() || [];
        const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.name.includes('Vietnamese'));
        if (viVoice) utterance.voice = viVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    return (
        <div className="kg-drawer kg-custom-scroll">
            {/* Header Drawer */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm"
                            style={{ backgroundColor: activeNode.color || '#10b981' }}
                        >
                            {activeNode.type === 'philosophy'
                                ? '🟣 Tầng 1: Triết lý & Đạo lý'
                                : activeNode.type === 'archetype'
                                ? '🟠 Tầng 2: Cổ mẫu & Biểu tượng'
                                : activeNode.type === 'region'
                                ? '🔵 Tầng 3: Địa linh & Không gian'
                                : '🟢 Tầng 4: Tác phẩm dân gian'}
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
                {/* Trích dẫn ca dao / câu nói nổi bật */}
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
                            Ý Nghĩa & Thông Điệp Tư Liệu
                        </h3>
                        <p className="text-sm text-stone-200 leading-relaxed font-light">
                            {activeNode.summary}
                        </p>
                    </div>
                )}

                {/* Khối AI Luận Giải Thực Thể (Thiết kế Pro Glassmorphism & AI Shimmer) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900/90 via-stone-900/60 to-stone-950/90 border border-amber-500/30 p-4 shadow-xl shadow-amber-950/20 backdrop-blur-md">
                    {/* Ánh sáng mờ trang trí phía trên */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Header Box AI */}
                    <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-sm shadow-amber-500/20">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                                        VietHeritage AI
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                                    <span className="text-[10px] text-stone-400 font-medium">
                                        Luận giải di sản
                                    </span>
                                </div>
                                <h4 className="text-xs font-semibold text-white truncate">
                                    Góc nhìn học thuật
                                </h4>
                            </div>
                        </div>

                        {/* Nút hành động */}
                        <button
                            onClick={handleAskAiAboutNode}
                            disabled={isAiLoading}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isAiLoading
                                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse cursor-wait'
                                    : currentAiInsight
                                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {isAiLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span className="text-[11px]">Đang phân tích...</span>
                                </>
                            ) : currentAiInsight ? (
                                <>
                                    <RotateCw className="w-3 h-3 text-stone-400" />
                                    <span className="text-[11px]">Phân tích lại</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Luận giải ngay</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Body Nội Dung Box AI */}
                    <div className="relative z-10 pt-3">
                        {isAiLoading ? (
                            /* Skeleton Loading Shimmer thanh lịch */
                            <div className="space-y-2 py-1">
                                <div className="h-3 rounded-full bg-gradient-to-r from-white/5 via-amber-500/15 to-white/5 animate-pulse" style={{ width: '92%' }} />
                                <div className="h-3 rounded-full bg-gradient-to-r from-white/5 via-amber-500/15 to-white/5 animate-pulse" style={{ width: '100%' }} />
                                <div className="h-3 rounded-full bg-gradient-to-r from-white/5 via-amber-500/15 to-white/5 animate-pulse" style={{ width: '75%' }} />
                                <p className="text-[11px] text-amber-300/80 pt-1.5 flex items-center gap-1.5 font-light">
                                    <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                                    <span>Đang trích xuất thi pháp học cho &ldquo;{activeNode.name}&rdquo;...</span>
                                </p>
                            </div>
                        ) : currentAiInsight ? (
                            /* Nội dung đã có phân tích */
                            <div className="space-y-3">
                                <div className="border-l-2 border-amber-500/70 pl-3 py-0.5">
                                    <p className="text-xs text-stone-200 leading-relaxed font-normal">
                                        {currentAiInsight}
                                    </p>
                                </div>

                                {/* Footer công cụ: Nghe đọc, Copy, Ghi chú kiểm định */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px] text-stone-400">
                                    <span className="flex items-center gap-1 text-[10px] text-stone-400">
                                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Đối chiếu dữ liệu di sản</span>
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={handleToggleSpeech}
                                            title={isSpeaking ? 'Dừng đọc' : 'Nghe giọng đọc thuyết minh'}
                                            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                                isSpeaking
                                                    ? 'bg-amber-500 text-stone-950 font-bold'
                                                    : 'hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                            <span className="text-[10px]">{isSpeaking ? 'Dừng' : 'Nghe'}</span>
                                        </button>
                                        <button
                                            onClick={handleCopy}
                                            title="Sao chép nội dung"
                                            className="px-2 py-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span className="text-[10px]">{copied ? 'Đã chép' : 'Chép'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Trạng thái chưa phân tích */
                            <p className="text-xs text-stone-400 leading-relaxed font-light">
                                Kích hoạt trí tuệ nhân tạo để phân tích tầng sâu thi pháp, ý nghĩa biểu tượng và vị trí của <b className="text-stone-200">{activeNode.name}</b> trong dòng chảy văn hóa dân gian Việt Nam.
                            </p>
                        )}
                    </div>
                </div>

                {/* Bài học răn dạy */}
                {activeNode.lesson && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                            Bài Học Đạo Lý Nhân Sinh:
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
                            Từ Khóa & Biểu Tượng Dân Gian:
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

                {/* Danh sách các thực thể liên kết trực tiếp với giải thích lý do */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        Các Mối Liên Kết Trực Tiếp (Vì Sao Nối Nhau?):
                    </h3>
                    <div className="space-y-2.5">
                        {graphData?.links
                            ?.filter((link) => {
                                const s = typeof link.source === 'object' ? link.source.id : link.source;
                                const t = typeof link.target === 'object' ? link.target.id : link.target;
                                return s === activeNode.id || t === activeNode.id;
                            })
                            .slice(0, 10)
                            .map((link, idx) => {
                                const s = typeof link.source === 'object' ? link.source.id : link.source;
                                const t = typeof link.target === 'object' ? link.target.id : link.target;
                                const neighborId = s === activeNode.id ? t : s;
                                const neighborNode = graphData.nodes?.find((n) => n.id === neighborId);
                                if (!neighborNode) return null;

                                const relationText = link.description || link.relation || link.label || 'Có mối liên kết tri thức mật thiết';

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => onSelectSearchNode(neighborNode)}
                                        className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-500/40 transition-all group cursor-pointer"
                                    >
                                        {/* Hàng 1: Tên thực thể liên kết + Loại tầng + Nút mũi tên */}
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                                                    style={{ backgroundColor: neighborNode.color || '#10b981' }}
                                                />
                                                <span className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                                                    {neighborNode.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className="text-[10px] text-stone-400 px-1.5 py-0.5 rounded bg-white/5 font-medium">
                                                    {neighborNode.type === 'philosophy'
                                                        ? 'Triết lý'
                                                        : neighborNode.type === 'archetype'
                                                        ? 'Cổ mẫu'
                                                        : neighborNode.type === 'region'
                                                        ? 'Địa linh'
                                                        : 'Tác phẩm'}
                                                </span>
                                                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>

                                        {/* Hàng 2: Đoạn giải thích mối liên kết: HIỂN THỊ TRỌN VẸN 100%, KHÔNG CẮT CHỮ */}
                                        <div className="bg-amber-500/[0.07] rounded-lg p-2 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed font-light">
                                            <span className="font-semibold text-amber-400">🔗 Mối quan hệ: </span>
                                            <span>{relationText}</span>
                                        </div>
                                    </div>
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
                        Xem Tư Liệu Tác Phẩm
                    </Link>
                ) : (
                    <button
                        onClick={() => onSelectPathSource(activeNode.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Route className="w-4 h-4" />
                        Tìm Đường Đi Từ Nốt Này
                    </button>
                )}
            </div>
        </div>
    );
};

export default GraphNodeDetailSidebar;
