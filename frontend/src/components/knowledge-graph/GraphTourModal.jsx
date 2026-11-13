import { useState } from 'react';
import { 
    Play, 
    X, 
    Clock, 
    Sparkles, 
    Loader2, 
    ArrowRight, 
    Wand2, 
    BookOpen,
    Shield,
    Heart,
    Mountain
} from 'lucide-react';
import literatureService from '../../services/literature.service';

/**
 * GraphTourModal - Modal Du Hành Tiến Hóa Thi Pháp & Cổ Mẫu Di Sản (Semantic Drift & Archetype Evolution)
 * Cho phép khám phá sự trôi dạt ngữ nghĩa của hình tượng văn hóa qua các thời kỳ hoặc yêu cầu AI thiết kế tour riêng.
 */
const GraphTourModal = ({
    isOpen,
    onClose,
    tours,
    onStartTour
}) => {
    const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'ai-custom'
    const [keyword, setKeyword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState(null);

    if (!isOpen) return null;

    const quickKeywords = [
        'Người Lính Vệ Quốc',
        'Tình Mẫu Tử',
        'Hình Tượng Quê Hương',
        'Số Phận Người Phụ Nữ',
        'Tiếng Đàn & Hòa Bình',
        'Khát Vọng Tự Do'
    ];

    // Helper tạo bộ nhận diện hình ảnh & màu sắc nổi bật cho từng tour
    const getTourVisual = (tour) => {
        switch (tour.id) {
            case 'tour-hero-evolution':
                return {
                    icon: <Shield className="w-5 h-5 text-amber-400" />,
                    accentColor: '#f59e0b',
                    badgeText: '⚔️ Vệ Quốc & Khí Phách',
                    flowSummary: 'Thánh Gióng (Thần thoại) ➔ Nam Quốc Sơn Hà (Đông A) ➔ Tây Tiến (Kháng chiến)',
                    buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950',
                };
            case 'tour-family-evolution':
                return {
                    icon: <Heart className="w-5 h-5 text-rose-400" />,
                    accentColor: '#ec4899',
                    badgeText: '💖 Đạo Hiếu & Gia Đạo',
                    flowSummary: 'Công cha như núi (Ca dao) ➔ Nàng Kiều hi sinh ➔ Nhớ nhà Đèo Ngang',
                    buttonBg: 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-stone-950',
                };
            case 'tour-nature-evolution':
                return {
                    icon: <Mountain className="w-5 h-5 text-emerald-400" />,
                    accentColor: '#10b981',
                    badgeText: '🌿 Hồn Quê & Non Nước',
                    flowSummary: 'Canh rau muống (Hồn quê) ➔ Ao thu Nguyễn Khuyến ➔ Cõi mộng Thôn Vĩ',
                    buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950',
                };
            case 'tour-peace-evolution':
                return {
                    icon: <Sparkles className="w-5 h-5 text-sky-400" />,
                    accentColor: '#3b82f6',
                    badgeText: '🕊️ Chính Nghĩa & Hòa Bình',
                    flowSummary: 'Đàn thần Thạch Sanh ➔ Ca dao đùm bọc ➔ Tình đồng chí keo sơn',
                    buttonBg: 'bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-stone-950',
                };
            default:
                return {
                    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
                    accentColor: tour.themeColor || '#f59e0b',
                    badgeText: tour.badge || '🧬 Tiến Hóa Thi Pháp',
                    flowSummary: tour.subtitle || 'Dòng chảy chuyển biến biểu tượng qua các thời kỳ',
                    buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950',
                };
        }
    };

    const handleGenerateTour = async (customKw) => {
        const targetKw = customKw || keyword;
        if (!targetKw || !targetKw.trim()) {
            setGenerateError('Vui lòng nhập hoặc chọn một chủ đề hình tượng');
            return;
        }

        try {
            setIsGenerating(true);
            setGenerateError(null);
            const res = await literatureService.generateTourWithAI(targetKw.trim());
            const tourData = res?.data || res;
            if (tourData && tourData.stops?.length > 0) {
                onStartTour(tourData);
                onClose();
            } else {
                setGenerateError('AI chưa tìm thấy đủ mắt xích để thiết kế tour cho chủ đề này. Hãy thử từ khóa khác!');
            }
        } catch (err) {
            console.error('Lỗi khi AI thiết kế tour:', err);
            setGenerateError('Không thể kết nối máy chủ AI để thiết kế tour lúc này. Vui lòng thử lại!');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="kg-tour-modal-overlay">
            <div className="kg-tour-modal-box">
                {/* Header Modal */}
                <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/25 flex-shrink-0">
                                <Play className="w-4 h-4 fill-stone-950" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                                        Du Hành Tiến Hóa Thi Pháp & Cổ Mẫu
                                    </h3>
                                    <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                        SEMANTIC DRIFT AI
                                    </span>
                                </div>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Khám phá sự trôi dạt ngữ nghĩa và bước chuyển mình của các hình tượng văn hóa qua hơn 4.000 năm lịch sử
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs chuyển đổi */}
                <div className="px-6 pt-3 flex items-center gap-2 border-b border-white/10 bg-white/[0.01]">
                    <button
                        onClick={() => {
                            setActiveTab('curated');
                            setGenerateError(null);
                        }}
                        className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer ${
                            activeTab === 'curated'
                                ? 'text-amber-300'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        <span>Bộ Sưu Tập Tiến Hóa Tuyển Chọn ({tours?.length || 0})</span>
                        {activeTab === 'curated' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('ai-custom');
                            setGenerateError(null);
                        }}
                        className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'ai-custom'
                                ? 'text-amber-300'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>AI Thiết Kế Tour Riêng</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] text-amber-300 font-mono border border-amber-400/30">
                            MỚI
                        </span>
                        {activeTab === 'ai-custom' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Nội dung Tab 1: Bộ Sưu Tập Tuyển Chọn */}
                {activeTab === 'curated' && (
                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[62vh] overflow-y-auto kg-custom-scroll">
                        {tours?.map((tour) => {
                            const visual = getTourVisual(tour);
                            return (
                                <div
                                    key={tour.id}
                                    onClick={() => {
                                        onStartTour(tour);
                                        onClose();
                                    }}
                                    className="kg-tour-card group cursor-pointer border flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(155deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.75) 100%)`,
                                        borderColor: `${visual.accentColor}35`,
                                        boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = `${visual.accentColor}95`;
                                        e.currentTarget.style.boxShadow = `0 16px 45px rgba(0, 0, 0, 0.75), 0 0 26px ${visual.accentColor}35`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = `${visual.accentColor}35`;
                                        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)`;
                                    }}
                                >
                                    {/* Ánh sáng gradient nhẹ góc trên bên trái theo màu theme */}
                                    <div 
                                        className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
                                        style={{ backgroundColor: visual.accentColor }}
                                    />

                                    <div>
                                        {/* Hàng 1: Icon chủ đề + Badge nổi bật + Thời lượng */}
                                        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                                            <div className="flex items-center gap-2.5">
                                                <div 
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md border group-hover:scale-105 transition-transform"
                                                    style={{
                                                        backgroundColor: `${visual.accentColor}18`,
                                                        borderColor: `${visual.accentColor}40`,
                                                    }}
                                                >
                                                    {visual.icon}
                                                </div>
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider block w-fit border shadow-sm"
                                                    style={{
                                                        backgroundColor: `${visual.accentColor}22`,
                                                        color: visual.accentColor,
                                                        borderColor: `${visual.accentColor}45`,
                                                    }}
                                                >
                                                    {visual.badgeText}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-stone-300 font-mono font-medium flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                                {tour.duration}
                                            </span>
                                        </div>

                                        {/* Hàng 2: TÊN TOUR - Đậm, Nổi bật, Thu hút */}
                                        <h4 className="text-[15px] sm:text-base font-black text-white group-hover:text-amber-200 transition-colors leading-snug tracking-tight relative z-10">
                                            {tour.title}
                                        </h4>

                                        {/* Hàng 3: HỘP Ý CHÍNH / TIẾN TRÌNH CỐT LÕI (Core Evolutionary Flow) */}
                                        <div 
                                            className="mt-2.5 px-3 py-2 rounded-xl text-xs flex items-center gap-2 border shadow-sm relative z-10"
                                            style={{
                                                backgroundColor: `${visual.accentColor}12`,
                                                borderColor: `${visual.accentColor}35`,
                                            }}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 animate-pulse" />
                                            <div className="text-[11.5px] font-medium text-amber-100/95 leading-tight">
                                                <span className="font-bold text-amber-300">Tiến trình: </span>
                                                <span>{visual.flowSummary}</span>
                                            </div>
                                        </div>

                                        {/* Mô tả súc tích */}
                                        <p className="text-xs text-stone-300/90 mt-2.5 line-clamp-2 leading-relaxed font-light relative z-10">
                                            {tour.description}
                                        </p>

                                        {/* Hàng 4: MINI-TIMELINE 4 CHẶNG TIẾN HÓA (4 Steps Trajectory) */}
                                        {tour.stops?.length > 0 && (
                                            <div className="mt-3.5 pt-3 border-t border-white/10 relative z-10">
                                                <div className="grid grid-cols-4 gap-1.5">
                                                    {tour.stops.map((stop, sIdx) => {
                                                        const cleanTitle = stop.title.replace(/\s*\([^)]*\)/, '');
                                                        const eraShort = stop.phase?.split(':')[0] || `Chặng ${sIdx + 1}`;
                                                        return (
                                                            <div 
                                                                key={sIdx} 
                                                                className="flex flex-col items-center text-center p-1.5 rounded-xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors"
                                                            >
                                                                <span 
                                                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-stone-950 mb-1 shadow-sm"
                                                                    style={{ backgroundColor: visual.accentColor }}
                                                                >
                                                                    {sIdx + 1}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-stone-200 line-clamp-1 w-full" title={stop.title}>
                                                                    {cleanTitle}
                                                                </span>
                                                                <span className="text-[8.5px] text-stone-400 font-mono line-clamp-1 mt-0.5">
                                                                    {eraShort}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hàng 5: Footer: Số chặng + Nút Khởi Hành Tour */}
                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2 text-xs text-stone-300 font-medium">
                                            <span 
                                                className="w-2 h-2 rounded-full animate-ping"
                                                style={{ backgroundColor: visual.accentColor }}
                                            />
                                            <span className="font-extrabold" style={{ color: visual.accentColor }}>{tour.stops?.length || 0}</span>
                                            <span className="text-stone-400">chặng tiến hóa</span>
                                        </div>
                                        <button 
                                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg group-hover:scale-105 transition-all cursor-pointer ${visual.buttonBg}`}
                                        >
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                            <span>Khởi Hành Tour</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Nội dung Tab 2: Tự Động Sinh Tour Bằng AI */}
                {activeTab === 'ai-custom' && (
                    <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto kg-custom-scroll">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                                    AI Thiết Kế Lộ Trình Tiến Hóa Thi Pháp Theo Yêu Cầu
                                </h4>
                            </div>
                            <p className="text-xs text-stone-300 leading-relaxed">
                                Nhập bất kỳ hình tượng văn học hoặc chủ đề nào bạn quan tâm. <b>VietHeritage AI (Gemini Flash)</b> sẽ quét toàn bộ đồ thị tri thức để tìm các nốt di sản qua 5 kỷ nguyên và thiết kế riêng cho bạn một chuyến du hành kèm lời bình thi pháp chuyên sâu.
                            </p>

                            <div className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => {
                                        setKeyword(e.target.value);
                                        setGenerateError(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateTour()}
                                    placeholder="Ví dụ: Người Lính, Ánh Trăng, Con Cò, Dòng Sông, Đạo Làm Con..."
                                    className="flex-1 p-2.5 rounded-xl bg-stone-900 border border-white/20 text-xs text-white placeholder:text-stone-500 outline-none focus:border-amber-400 transition"
                                />
                                <button
                                    onClick={() => handleGenerateTour()}
                                    disabled={isGenerating || !keyword.trim()}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition disabled:opacity-50 cursor-pointer flex-shrink-0"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Đang thiết kế...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-3.5 h-3.5" />
                                            <span>Thiết Kế Ngay</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {generateError && (
                                <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-xs">
                                    {generateError}
                                </div>
                            )}

                            {/* Gợi ý từ khóa nhanh */}
                            <div className="pt-2">
                                <div className="text-[11px] text-stone-400 mb-1.5 font-medium flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-amber-400" />
                                    <span>Gợi ý chủ đề thi pháp đặc sắc:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickKeywords.map((kw, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setKeyword(kw);
                                                handleGenerateTour(kw);
                                            }}
                                            disabled={isGenerating}
                                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-stone-300 hover:text-amber-200 text-[11px] border border-white/10 hover:border-amber-400/40 transition cursor-pointer flex items-center gap-1"
                                        >
                                            <span>{kw}</span>
                                            <ArrowRight className="w-2.5 h-2.5 text-stone-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Banner giải thích tính học thuật */}
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-stone-400 leading-relaxed">
                            💡 <b>Tính năng học thuật cao cấp:</b> Ứng dụng kỹ thuật <i>Semantic Drift Analysis</i> kết hợp <i>Graph-RAG</i> để phân tích sự trôi dạt ngữ nghĩa của các cổ mẫu trong dòng chảy văn học Việt Nam.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphTourModal;
