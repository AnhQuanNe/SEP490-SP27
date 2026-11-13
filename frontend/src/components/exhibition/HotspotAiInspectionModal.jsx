import { useState, useEffect } from 'react';
import { artifactService } from '../../services/artifact.service';
import { 
    Sparkles, 
    X, 
    Hammer, 
    Flame, 
    BookOpen, 
    Lightbulb, 
    Headphones, 
    Bot, 
    Volume2, 
    VolumeX,
    Shield,
    CheckCircle2
} from 'lucide-react';

/**
 * HotspotAiInspectionModal - Kính Lúp Di Sản AI mổ xẻ chuyên sâu điểm chạm
 * Luận giải 3 trụ cột học thuật: Kỹ nghệ cổ, Ý niệm biểu tượng, Liên hệ SGK chuẩn xác 100%.
 */
const HotspotAiInspectionModal = ({
    isOpen,
    onClose,
    hotspot,
    artifact,
    angleTitle,
    audio,
    onOpenAiChat
}) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('craftsmanship'); // 'craftsmanship' | 'symbolism' | 'textbook' | 'all'

    useEffect(() => {
        if (!isOpen || !hotspot || !artifact) {
            setData(null);
            return;
        }

        let isMounted = true;
        const fetchInspection = async () => {
            try {
                setIsLoading(true);
                const res = await artifactService.inspectHotspotWithAI(artifact, hotspot, angleTitle);
                if (isMounted && res) {
                    setData(res);
                }
            } catch (err) {
                console.warn('Lỗi gọi AI Kính Lúp:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchInspection();
        return () => { isMounted = false; };
    }, [isOpen, hotspot?.id, artifact?.slug, angleTitle]);

    if (!isOpen || !hotspot) return null;

    const handleNarrateDeep = () => {
        if (!data || !audio) return;
        const script = `Khảo cứu chuyên sâu chi tiết ${hotspot.title}. Về kỹ nghệ chế tác: ${data.craftsmanship}. Về ý niệm biểu tượng: ${data.symbolism}. Về góc nhìn Sách Giáo Khoa: ${data.textbookInsight}`;
        
        audio.narrateHotspot({
            title: `Kính Lúp AI: ${hotspot.title}`,
            tag: hotspot.tag,
            detail: script,
            audioScript: script
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div 
                className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c130b] via-[#140d08] to-[#0d0905] rounded-3xl border border-amber-500/50 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] text-amber-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. HEADER MODAL */}
                <div className="p-4 sm:p-5 border-b border-amber-600/25 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-[#18110b] flex items-start justify-between gap-3 relative">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex-shrink-0 mt-0.5">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                    🔍 Kính Lúp Di Sản AI
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Chuẩn Khảo Cổ & SGK 100%</span>
                                </span>
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-amber-100 font-heritage mt-1.5 flex items-center gap-2">
                                <span>{hotspot.title}</span>
                                <span className="text-xs font-normal text-amber-300/70 font-sans">({hotspot.tag})</span>
                            </h3>

                            <p className="text-xs text-stone-400 mt-0.5">
                                Điểm chạm thuộc bảo vật: <strong className="text-amber-200">{artifact?.name}</strong> • {artifact?.era}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors cursor-pointer"
                        title="Đóng cửa sổ"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. BODY NỘI DUNG */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm custom-scrollbar">
                    {isLoading ? (
                        <div className="py-16 text-center space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <Sparkles className="w-8 h-8 text-amber-400 animate-spin-slow" />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-sm font-bold text-amber-100 font-heritage">
                                    AI đang mổ xẻ chi tiết "{hotspot.title}"...
                                </p>
                                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                                    Tra cứu cứ liệu khảo cổ, đối chiếu văn bản SGK và phân tích kỹ nghệ kim khí cổ truyền.
                                </p>
                            </div>
                        </div>
                    ) : data ? (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            {/* Trụ cột 1: Kỹ nghệ chế tác */}
                            <div className="p-4 rounded-2xl bg-[#20150d]/90 border-l-4 border-l-amber-500 border border-amber-500/25 space-y-2 shadow-md">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                                    <Hammer className="w-4 h-4 text-amber-400" />
                                    <span>1. Kỹ Nghệ Chế Tác & Khảo Cổ Học</span>
                                </div>
                                <p className="text-xs sm:text-[13px] text-amber-100/90 leading-relaxed font-serif">
                                    {data.craftsmanship}
                                </p>
                            </div>

                            {/* Trụ cột 2: Ý niệm biểu tượng */}
                            <div className="p-4 rounded-2xl bg-red-950/20 border-l-4 border-l-red-500 border border-red-500/25 space-y-2 shadow-md">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-300">
                                    <Flame className="w-4 h-4 text-red-400" />
                                    <span>2. Ý Niệm Biểu Tượng & Triết Lý Dân Gian</span>
                                </div>
                                <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-serif">
                                    {data.symbolism}
                                </p>
                            </div>

                            {/* Trụ cột 3: Góc nhìn SGK */}
                            <div className="p-4 rounded-2xl bg-emerald-950/20 border-l-4 border-l-emerald-500 border border-emerald-500/25 space-y-2 shadow-md">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                                    <BookOpen className="w-4 h-4 text-emerald-400" />
                                    <span>3. Góc Nhìn SGK & Bài Học Lịch Sử</span>
                                </div>
                                <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-serif">
                                    {data.textbookInsight}
                                </p>
                            </div>

                            {/* Hộp phát hiện thú vị */}
                            {data.funFact && (
                                <div className="p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/30 flex items-start gap-2.5">
                                    <Lightbulb className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-bold text-purple-200 uppercase tracking-wide">
                                            Khám phá khảo cổ thú vị:
                                        </p>
                                        <p className="text-xs text-stone-300 font-serif leading-relaxed italic">
                                            {data.funFact}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-stone-400">
                            Không thể tải dữ liệu phân tích chi tiết. Vui lòng thử lại sau.
                        </div>
                    )}
                </div>

                {/* 3. FOOTER NÚT HÀNH ĐỘNG */}
                <div className="p-4 border-t border-amber-600/25 bg-[#120d09]/90 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nguồn: Viện Khảo cổ học & SGK Ngữ văn</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Nút nghe thuyết minh AI */}
                        <button
                            type="button"
                            onClick={handleNarrateDeep}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 font-bold text-xs border border-amber-400/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title="Nghe toàn bộ bài luận giải này"
                        >
                            <Headphones className="w-3.5 h-3.5 text-amber-300" />
                            <span>Nghe Luận Giải</span>
                        </button>

                        {/* Nút đàm đạo với Gia sư AI */}
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenAiChat?.(
                                    artifact,
                                    `Hãy phân tích sâu hơn cho tôi về chi tiết "${hotspot.title}" (${hotspot.tag}) của bảo vật "${artifact.name}".`
                                );
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-950 via-red-900 to-amber-700 hover:from-red-900 hover:to-amber-600 text-amber-100 font-bold text-xs border border-amber-400/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                        >
                            <Bot className="w-3.5 h-3.5 text-amber-300" />
                            <span>Hỏi thêm Gia sư AI</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotspotAiInspectionModal;

