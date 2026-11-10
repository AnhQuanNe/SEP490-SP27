import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Sparkles,
    Heart,
    Brain,
    Sword,
    Crown,
    RotateCcw,
    BookOpen,
    ArrowRight,
    Trophy,
    Feather,
    Send,
    ChevronLeft,
    Scroll,
    Share2,
    History,
    Compass,
    Lock,
    X,
    LogIn,
    UserPlus,
    Type,
    Quote,
    Scale,
    Shield,
    Flower2
} from 'lucide-react';
import storyBranchService from '../services/storyBranch.service';
import DragonPhoenixHeritage from '../components/common/DragonPhoenixHeritage';

/**
 * Thẻ trạng thái cảm xúc của cảnh (Scene Mood)
 */
const MOOD_STYLES = {
    serene: {
        label: 'Thanh Bình',
        badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
        cardGlow: 'shadow-emerald-900/20 border-emerald-500/30',
    },
    dramatic: {
        label: 'Kịch Tính',
        badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
        cardGlow: 'shadow-amber-900/20 border-amber-500/30',
    },
    dark: {
        label: 'Nguy Nan',
        badgeClass: 'bg-rose-950/40 text-rose-300 border-rose-500/40',
        cardGlow: 'shadow-rose-900/20 border-rose-500/30',
    },
    triumphant: {
        label: 'Khải Hoàn',
        badgeClass: 'bg-yellow-950/40 text-yellow-300 border-yellow-500/40',
        cardGlow: 'shadow-yellow-900/20 border-yellow-500/30',
    },
    mystic: {
        label: 'Huyền Ảo',
        badgeClass: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/40',
        cardGlow: 'shadow-indigo-900/20 border-indigo-500/30',
    },
};

/**
 * Hình ảnh đại diện nghệ thuật cho từng tác phẩm
 */
const STORY_VISUALS = {
    'tam-cam': {
        icon: Sparkles,
        iconBg: 'from-amber-600 via-rose-700 to-stone-900',
        shortTitle: 'Tấm Cám',
        tag: 'Cổ tích dân gian',
    },
    'thach-sanh': {
        icon: Sword,
        iconBg: 'from-emerald-600 via-teal-700 to-slate-900',
        shortTitle: 'Thạch Sanh',
        tag: 'Dũng sĩ diệt chằn',
    },
    'an-duong-vuong': {
        icon: Crown,
        iconBg: 'from-amber-700 via-orange-800 to-stone-900',
        shortTitle: 'An Dương Vương',
        tag: 'Truyền thuyết Cổ Loa',
    },
    'son-tinh-thuy-tinh': {
        icon: Compass,
        iconBg: 'from-blue-600 via-cyan-800 to-stone-900',
        shortTitle: 'Sơn Tinh - Thủy Tinh',
        tag: 'Thần thoại sông núi',
    },
    'cay-khe': {
        icon: Feather,
        iconBg: 'from-amber-500 via-emerald-700 to-stone-900',
        shortTitle: 'Cây Khế',
        tag: 'Đạo lý & Chim Thần',
    },
};

const STAT_NAMES = {
    tam: 'Tâm Đức',
    tri: 'Trí Mưu',
    dung: 'Dũng Khí',
    longDan: 'Lòng Dân',
};

const renderCardIcon = (iconType) => {
    switch (iconType) {
        case 'scale':
            return <Scale className="w-6 h-6 text-blue-400 mx-auto" />;
        case 'sword':
            return <Sword className="w-6 h-6 text-amber-400 mx-auto" />;
        case 'feather':
            return <Feather className="w-6 h-6 text-emerald-400 mx-auto" />;
        case 'shield':
            return <Shield className="w-6 h-6 text-orange-400 mx-auto" />;
        case 'compass':
            return <Compass className="w-6 h-6 text-cyan-400 mx-auto" />;
        case 'scroll':
            return <Scroll className="w-6 h-6 text-yellow-400 mx-auto" />;
        case 'lotus':
        default:
            return <Flower2 className="w-6 h-6 text-rose-400 mx-auto" />;
    }
};

const InteractiveStory = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [stories, setStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);

    // Trạng thái của phiên chơi hiện tại
    const [currentChapter, setCurrentChapter] = useState(null);
    const [stats, setStats] = useState({ tam: 50, tri: 50, dung: 50, longDan: 50 });
    const [historyNodes, setHistoryNodes] = useState([]);
    const [loadingNext, setLoadingNext] = useState(false);
    const [customActionText, setCustomActionText] = useState('');
    const [copied, setCopied] = useState(false);

    // Tiện ích đọc truyện: Tùy chỉnh cỡ chữ
    const [fontSizeLevel, setFontSizeLevel] = useState('normal'); // 'normal' | 'large'

    // Trạng thái modal yêu cầu đăng nhập khi khách tương tác
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingStory, setPendingStory] = useState(null);

    const storyContainerRef = useRef(null);

    // Tải danh sách câu chuyện khi mở trang
    const loadStories = async () => {
        setLoadingStories(true);
        try {
            const data = await storyBranchService.getStories();
            setStories(data);
        } catch (err) {
            console.error('Lỗi tải danh mục truyện:', err);
        } finally {
            setLoadingStories(false);
        }
    };

    useEffect(() => {
        loadStories();
    }, []);

    // Bắt đầu một câu chuyện
    const handleStartStory = (story) => {
        // Kiểm tra quyền: Nếu chưa đăng nhập thì hiện modal nhắc nhở
        if (!isAuthenticated) {
            setPendingStory(story);
            setShowAuthModal(true);
            return;
        }

        setSelectedStory(story);
        setStats(story.initialStats || { tam: 50, tri: 50, dung: 50, longDan: 50 });
        setCurrentChapter(story.starterChapter);
        setHistoryNodes([
            {
                step: 1,
                chapterTitle: story.starterChapter.chapterTitle,
                storyText: story.starterChapter.storyText,
                chosenText: 'Khởi đầu tích truyện',
                statsAtStep: story.initialStats,
            },
        ]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Quay về màn hình chọn truyện
    const handleBackToCatalog = () => {
        setSelectedStory(null);
        setCurrentChapter(null);
        setHistoryNodes([]);
        setCustomActionText('');
    };

    // Người chơi chọn một lựa chọn
    const handleChooseOption = async (optionText, isCustom = false) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (loadingNext || !selectedStory) return;

        setLoadingNext(true);
        try {
            const payload = {
                storySlug: selectedStory.slug,
                step: currentChapter.step,
                chosenText: optionText,
                isCustomAction: isCustom,
                previousHistory: historyNodes.map((n) => ({
                    step: n.step,
                    chosenText: n.chosenText,
                })),
                currentStats: stats,
            };

            const nextData = await storyBranchService.nextChapter(payload);

            setCurrentChapter(nextData);
            if (nextData.newStats) {
                setStats(nextData.newStats);
            }

            setHistoryNodes((prev) => [
                ...prev,
                {
                    step: nextData.step,
                    chapterTitle: nextData.chapterTitle,
                    storyText: nextData.storyText,
                    chosenText: optionText,
                isCustomAction: isCustom,
                    statsAtStep: nextData.newStats || stats,
                    isEnding: nextData.isEnding,
                    endingData: nextData.endingData,
                },
            ]);

            setCustomActionText('');
            // Cuộn mượt lên đầu phần truyện mới
            storyContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Lỗi khi tiến bước câu chuyện:', err);
            alert('Đã có lỗi khi dệt tiếp cốt truyện. Vui lòng thử lại!');
        } finally {
            setLoadingNext(false);
        }
    };

    // Quay ngược thời gian về một mốc checkpoint trước đó
    const handleTimeTravel = (targetStep) => {
        if (loadingNext) return;
        const targetNodeIndex = historyNodes.findIndex((n) => n.step === targetStep);
        if (targetNodeIndex === -1) return;

        const targetNode = historyNodes[targetNodeIndex];
        const trimmedHistory = historyNodes.slice(0, targetNodeIndex + 1);

        // Khôi phục chapter và stats tại mốc đó
        setHistoryNodes(trimmedHistory);
        setStats(targetNode.statsAtStep || stats);

        // Tái tạo chapter state tại điểm checkpoint
        if (targetStep === 1) {
            setCurrentChapter(selectedStory.starterChapter);
        } else {
            setCurrentChapter({
                step: targetNode.step,
                chapterTitle: targetNode.chapterTitle,
                storyText: targetNode.storyText,
                isEnding: targetNode.isEnding || false,
                choices: [
                    { id: 'c_retry_1', text: 'Thử một hướng giải quyết hòa bình hơn' },
                    { id: 'c_retry_2', text: 'Thử một quyết định quyết liệt và dứt khoát' },
                ],
                endingData: targetNode.endingData,
            });
        }
        storyContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Sao chép tóm tắt dị bản để chia sẻ
    const handleShareEnding = () => {
        if (!currentChapter?.endingData) return;
        const shareText = `📜 DỊ BẢN CỔ TÍCH CỦA TÔI TRÊN VIETHERITAGE AI:
Tác phẩm: ${selectedStory.title}
Cái kết đạt được: ${currentChapter.endingData.endingType}
Danh hiệu phong tặng: 🎖️ ${currentChapter.endingData.badgeTitle}
Chỉ số nhân cách: Tâm ${stats.tam}% | Trí ${stats.tri}% | Dũng ${stats.dung}% | Lòng Dân ${stats.longDan}%
Khám phá và viết tiếp dị bản tại VietHeritage AI!`;

        navigator.clipboard.writeText(shareText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    // Trình kết xuất lời dẫn chuyện thông minh: tách thoại, drop cap, hộp tình thế then chốt
    const renderFormattedStoryText = (rawText) => {
        if (!rawText) return null;

        const paragraphs = rawText
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean);

        if (paragraphs.length === 0) return null;

        // Nhận diện nếu đoạn văn cuối cùng là câu hỏi then chốt / nút thắt tình thế
        const lastParagraph = paragraphs[paragraphs.length - 1];
        const isDilemma =
            paragraphs.length > 1 &&
            (lastParagraph.endsWith('?') ||
                /\b(sẽ làm gì|quyết định gì|chọn lối đi nào|phải làm sao|phải làm gì|làm thế nào|nghĩ ngợi gì)\b/i.test(lastParagraph));

        const mainParagraphs = isDilemma ? paragraphs.slice(0, -1) : paragraphs;

        const fontClass =
            fontSizeLevel === 'large'
                ? 'text-base sm:text-[17px] leading-relaxed sm:leading-8'
                : 'text-sm sm:text-[15.5px] leading-relaxed sm:leading-7';

        return (
            <div className="space-y-4">
                {mainParagraphs.map((para, i) => {
                    const hasQuotes = /["“][^"”]+["”]/.test(para) || para.startsWith('- ') || para.startsWith('— ');

                    if (hasQuotes) {
                        return (
                            <div
                                key={i}
                                className="relative pl-4 sm:pl-5 py-3 pr-4 rounded-r-xl bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-transparent border-l-3 border-amber-500 text-amber-100/95 my-3 italic font-serif text-[14.5px] sm:text-[16px] leading-relaxed shadow-sm"
                            >
                                <Quote className="w-3.5 h-3.5 text-amber-400/50 absolute top-2 left-1.5 rotate-180" />
                                <p className="not-italic font-vietnam text-stone-200">
                                    {para.split(/(["“][^"”]+["”])/g).map((part, pIdx) => {
                                        if (/^["“]/.test(part)) {
                                            return (
                                                <span key={pIdx} className="italic text-amber-300 font-medium font-serif">
                                                    {part}
                                                </span>
                                            );
                                        }
                                        return <span key={pIdx}>{part}</span>;
                                    })}
                                </p>
                            </div>
                        );
                    }

                    if (i === 0) {
                        const firstChar = para.charAt(0);
                        const rest = para.slice(1);
                        return (
                            <p key={i} className={`text-stone-200 font-normal ${fontClass}`}>
                                <span className="text-2xl sm:text-3xl font-heritage font-bold text-amber-300 mr-2 float-left leading-none mt-1 select-none">
                                    {firstChar}
                                </span>
                                {rest}
                            </p>
                        );
                    }

                    return (
                        <p key={i} className={`text-stone-200 font-normal ${fontClass}`}>
                            {para}
                        </p>
                    );
                })}

                {/* Khối Thời Khắc Quyết Định */}
                {isDilemma && (
                    <div className="mt-5 p-4 sm:p-4.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-900/10 to-stone-900/30 border border-amber-500/35 flex items-start gap-3.5 shadow-md">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                            <Compass className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                                <span>Thời Khắc Quyết Định</span>
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-amber-100 leading-snug">
                                {lastParagraph}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const currentMood = MOOD_STYLES[currentChapter?.sceneMood] || MOOD_STYLES.dramatic;

    return (
        <div className="min-h-screen bg-[#0e0b09] text-stone-200 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-vietnam">
            {/* 1. HIỆU ỨNG RỒNG BAY PHƯỢNG MÚA & TRỐNG ĐỒNG ĐÔNG SƠN MỜ ẢO */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
                <DragonPhoenixHeritage variant="hero" />
            </div>

            {/* 2. MÀN SƯƠNG ĐÊM CUNG ĐÌNH & QUẦNG HOÀNG KIM (ĐẢM BẢO CHỮ VÀ THẺ BÀI LUÔN DỄ NHÌN) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0b09]/30 via-[#0e0b09]/80 to-[#0e0b09] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-amber-600/15 via-rose-900/5 to-transparent blur-3xl pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* ============================================================ */}
                {/* 1. MÀN HÌNH CHỌN CÂU CHUYỆN (CATALOG SCREEN) */}
                {/* ============================================================ */}
                {!selectedStory ? (
                    <div className="space-y-6">
                        {/* Tiêu đề trang nhã, không rườm rà */}
                        <div className="text-center space-y-2 max-w-xl mx-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Tương tác AI</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 font-heritage tracking-tight">
                                Dị Bản Cổ Tích
                            </h1>

                            <p className="text-stone-400 text-xs sm:text-sm">
                                Nhập vai nhân vật cổ tích, tự quyết định ngã rẽ và kiến tạo hồi kết riêng.
                            </p>
                        </div>

                        {/* Danh sách thẻ truyện có Banner hình ảnh trực quan */}
                        {loadingStories ? (
                            <div className="text-center py-16">
                                <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-amber-200/80 font-medium text-xs">Đang tải tích truyện...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {stories.map((story) => {
                                    const visual = STORY_VISUALS[story.slug] || {
                                        icon: BookOpen,
                                        iconBg: 'from-amber-700 to-stone-900',
                                        shortTitle: story.title,
                                        tag: story.category,
                                    };
                                    const IconComponent = visual.icon;

                                    return (
                                        <div
                                            key={story.slug}
                                            onClick={() => handleStartStory(story)}
                                            className="group relative rounded-2xl bg-[#17120f] border border-amber-600/20 hover:border-amber-400/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/40 cursor-pointer"
                                        >
                                            {/* Cover Banner Nghệ thuật trực quan */}
                                            <div className={`h-28 bg-gradient-to-br ${visual.iconBg} relative flex items-center justify-between px-5 overflow-hidden`}>
                                                <div className="absolute inset-0 bg-black/20" />
                                                <div className="relative z-10 space-y-1">
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/40 text-amber-200 border border-white/10 backdrop-blur-xs">
                                                        {visual.tag}
                                                    </span>
                                                    <h3 className="text-xl font-black text-amber-100 font-heritage tracking-tight drop-shadow-sm">
                                                        {visual.shortTitle}
                                                    </h3>
                                                </div>
                                                <div className="relative z-10 w-12 h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 group-hover:scale-110 group-hover:text-amber-100 transition-transform">
                                                    <IconComponent className="w-6 h-6" />
                                                </div>
                                            </div>

                                            {/* Thân card - Cực kỳ tinh giản, ít chữ */}
                                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                                <p className="text-stone-300 text-xs leading-relaxed line-clamp-2">
                                                    {story.summary}
                                                </p>

                                                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                                                    <span className="text-[11px] text-amber-400/80 font-medium">
                                                        3-4 Hồi • Hồi kết độc bản
                                                    </span>
                                                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold text-xs">
                                                        {!isAuthenticated && <Lock className="w-3 h-3 text-stone-400" />}
                                                        <span>Vào vai</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ============================================================ */
                    /* 2. MÀN HÌNH CHƠI TƯƠNG TÁC (INTERACTIVE PLAY SCREEN) */
                    /* ============================================================ */
                    <div ref={storyContainerRef} className="space-y-4 max-w-3xl mx-auto">
                        {/* Thanh điều khiển trên cùng (Top Bar) */}
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-600/20">
                            <button
                                onClick={handleBackToCatalog}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300/80 hover:text-amber-200 transition-colors bg-[#17120f] hover:bg-[#221a15] px-3 py-1.5 rounded-lg border border-amber-600/25 cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Đổi truyện</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <h2 className="text-xs sm:text-sm font-bold text-amber-200 font-heritage truncate max-w-[160px] sm:max-w-xs">
                                    {selectedStory.title}
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                                    {currentChapter?.chapterTitle}
                                </span>
                            </div>
                        </div>

                        {/* BẢNG CHỈ SỐ NHÂN VẬT DẠNG THANH GỌN (SLIM HUD) */}
                        <div className="bg-[#17120f] rounded-xl px-3 py-2 border border-amber-600/20 shadow-md">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                {/* Tâm */}
                                <div className="flex items-center justify-between gap-2 bg-[#201915] px-2.5 py-1 rounded-lg border border-rose-900/30">
                                    <span className="flex items-center gap-1 text-rose-300 text-[11px] font-medium">
                                        <Heart className="w-3 h-3 text-rose-400 flex-shrink-0" />
                                        <span>Tâm</span>
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-1 max-w-[65px]">
                                        <div className="w-full bg-stone-800 rounded-full h-1 overflow-hidden">
                                            <div className="bg-rose-500 h-1 rounded-full transition-all duration-500" style={{ width: `${stats.tam}%` }} />
                                        </div>
                                        <span className="font-bold text-[10px] text-rose-200 flex-shrink-0">{stats.tam}%</span>
                                    </div>
                                </div>

                                {/* Trí */}
                                <div className="flex items-center justify-between gap-2 bg-[#201915] px-2.5 py-1 rounded-lg border border-blue-900/30">
                                    <span className="flex items-center gap-1 text-blue-300 text-[11px] font-medium">
                                        <Brain className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                        <span>Trí</span>
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-1 max-w-[65px]">
                                        <div className="w-full bg-stone-800 rounded-full h-1 overflow-hidden">
                                            <div className="bg-blue-500 h-1 rounded-full transition-all duration-500" style={{ width: `${stats.tri}%` }} />
                                        </div>
                                        <span className="font-bold text-[10px] text-blue-200 flex-shrink-0">{stats.tri}%</span>
                                    </div>
                                </div>

                                {/* Dũng */}
                                <div className="flex items-center justify-between gap-2 bg-[#201915] px-2.5 py-1 rounded-lg border border-amber-900/30">
                                    <span className="flex items-center gap-1 text-amber-300 text-[11px] font-medium">
                                        <Sword className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                        <span>Dũng</span>
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-1 max-w-[65px]">
                                        <div className="w-full bg-stone-800 rounded-full h-1 overflow-hidden">
                                            <div className="bg-amber-500 h-1 rounded-full transition-all duration-500" style={{ width: `${stats.dung}%` }} />
                                        </div>
                                        <span className="font-bold text-[10px] text-amber-200 flex-shrink-0">{stats.dung}%</span>
                                    </div>
                                </div>

                                {/* Lòng Dân */}
                                <div className="flex items-center justify-between gap-2 bg-[#201915] px-2.5 py-1 rounded-lg border border-emerald-900/30">
                                    <span className="flex items-center gap-1 text-emerald-300 text-[11px] font-medium">
                                        <Crown className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                        <span>Dân</span>
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-1 max-w-[65px]">
                                        <div className="w-full bg-stone-800 rounded-full h-1 overflow-hidden">
                                            <div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${stats.longDan}%` }} />
                                        </div>
                                        <span className="font-bold text-[10px] text-emerald-200 flex-shrink-0">{stats.longDan}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KHU VỰC ĐỌC CÂU CHUYỆN (SẠCH SẼ, ÊM MẮT, THOÁNG ĐÃNG) */}
                        <div
                            className={`relative rounded-2xl bg-[#17120f] text-stone-100 p-5 sm:p-7 border transition-all duration-300 shadow-xl ${currentMood.cardGlow}`}
                        >
                            {/* Tiêu đề Hồi & Trạng thái Mood */}
                            <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-amber-900/25 mb-4 gap-2">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-base sm:text-lg font-bold font-heritage text-amber-200">
                                        {currentChapter?.chapterTitle}
                                    </h3>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentMood.badgeClass}`}
                                    >
                                        {currentMood.label}
                                    </span>
                                </div>

                                {/* Bộ công cụ đọc: Tăng giảm cỡ chữ */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFontSizeLevel((prev) => (prev === 'normal' ? 'large' : 'normal'))}
                                        title="Điều chỉnh cỡ chữ dễ đọc"
                                        className="px-2.5 py-1 rounded-lg bg-[#201915] hover:bg-[#2b221c] text-stone-300 border border-amber-800/40 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <Type className="w-3.5 h-3.5" />
                                        <span>{fontSizeLevel === 'large' ? 'A+' : 'A'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Đoạn văn kể chuyện giãn dòng thoáng, dễ đọc */}
                            {renderFormattedStoryText(currentChapter?.storyText)}

                            {/* HIỂN THỊ KẾT CỤC DỊ BẢN */}
                            {currentChapter?.isEnding && currentChapter?.endingData && (
                                <div className="mt-6 pt-5 border-t border-amber-900/30 bg-[#201915] p-4 sm:p-5 rounded-xl border border-amber-500/25 space-y-3.5">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                                                    Kết Cục Dị Bản
                                                </p>
                                                <h4 className="text-base sm:text-lg font-bold font-heritage text-amber-200">
                                                    {currentChapter.endingData.endingType}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{currentChapter.endingData.badgeTitle}</span>
                                        </div>
                                    </div>

                                    {/* Gương soi đạo lý */}
                                    <div className="bg-[#17120f] p-3 rounded-lg border border-amber-700/20 text-xs text-stone-300 leading-relaxed space-y-1">
                                        <p className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                                            <Scroll className="w-3 h-3" />
                                            <span>Gương Soi Đạo Lý:</span>
                                        </p>
                                        <p className="italic text-stone-300 text-xs">
                                            {currentChapter.endingData.moralComparison}
                                        </p>
                                    </div>

                                    {/* Nút hành động sau kết thúc */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <button
                                            onClick={handleShareEnding}
                                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span>{copied ? 'Đã sao chép!' : 'Chia sẻ dị bản'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleStartStory(selectedStory)}
                                            className="px-3.5 py-1.5 rounded-lg bg-[#2a211c] hover:bg-[#342a24] text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-900/30"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Thử ngã rẽ khác</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* BỘ 3 THẺ TRÚC MỆNH LỆNH (THUẦN PHONG MỸ TỤC, XẾP HÀNG NGANG) */}
                            {!currentChapter?.isEnding && (
                                <div className="mt-6 pt-5 border-t border-amber-900/30 space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                                            <Scroll className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Bộ 3 Thẻ Trúc Mệnh Lệnh (Chọn 1 để hạ chiếu):</span>
                                        </p>
                                        <span className="text-[11px] text-stone-400 italic hidden sm:inline">
                                            * Thẻ bài cổ phong • Soi chiếu đạo lý
                                        </span>
                                    </div>

                                    {loadingNext ? (
                                        <div className="py-8 text-center space-y-2 bg-[#201915] rounded-2xl border border-amber-600/25">
                                            <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs font-medium text-amber-300/90 font-heritage animate-pulse">
                                                Tiền nhân đang dệt tiếp mệnh đề...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                            {currentChapter?.choices?.map((choice, idx) => {
                                                const req = choice.requiredStat;
                                                const isLocked = req && stats[req.stat] !== undefined && stats[req.stat] < req.min;

                                                return (
                                                    <div
                                                        key={choice.id || idx}
                                                        className={`rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between transition-all duration-200 relative group ${
                                                            isLocked
                                                                ? 'bg-[#15100d] border-2 border-stone-800 opacity-75'
                                                                : 'bg-gradient-to-b from-[#281c15] via-[#1d1510] to-[#150f0c] border-2 border-amber-500/50 hover:border-amber-400 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-amber-950/50 cursor-pointer'
                                                        }`}
                                                    >
                                                        <div className="space-y-2">
                                                            {/* Đỉnh thẻ: Ấn triện son & Trạng thái */}
                                                            <div className="flex items-center justify-between border-b border-amber-900/30 pb-1.5 gap-1">
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wider uppercase border ${
                                                                    isLocked
                                                                        ? 'border-stone-700 text-stone-400 bg-stone-900/40'
                                                                        : 'border-red-600/70 text-red-400 bg-red-950/25'
                                                                }`}>
                                                                    {choice.sealText || 'ĐẠO LÝ'}
                                                                </span>

                                                                {isLocked ? (
                                                                    <span className="text-[9px] sm:text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40 flex items-center gap-0.5 flex-shrink-0">
                                                                        <Lock className="w-2.5 h-2.5" />
                                                                        <span>{STAT_NAMES[req.stat] || req.stat} {req.min}%</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 flex-shrink-0">
                                                                        ✓ Đủ Điều Kiện
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Tên thẻ bài & Biểu tượng văn hóa */}
                                                            <div className="text-center py-1 sm:py-2 space-y-1">
                                                                <div className={`transition-transform duration-200 ${!isLocked && 'group-hover:scale-110'}`}>
                                                                    {renderCardIcon(choice.iconType)}
                                                                </div>
                                                                <h4 className="text-xs sm:text-sm font-bold font-heritage text-amber-100 group-hover:text-amber-300 leading-tight">
                                                                    {choice.cardTitle || choice.text}
                                                                </h4>
                                                            </div>

                                                            {/* Nội dung hành động chi tiết */}
                                                            <p className="text-[11px] sm:text-xs text-stone-300 leading-relaxed bg-black/40 p-2 sm:p-2.5 rounded-lg border border-amber-900/25 min-h-[70px] sm:min-h-[85px] flex items-center">
                                                                {choice.text}
                                                            </p>

                                                            {/* Gương soi Ca dao / Tục ngữ */}
                                                            {choice.folkQuote && (
                                                                <div className="bg-amber-950/40 p-1.5 sm:p-2 rounded border-l-2 border-amber-500/80 text-[10px] sm:text-[11px] text-amber-200/90 italic leading-snug">
                                                                    📖 <i>"{choice.folkQuote}"</i>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Chân thẻ: Nút chọn hoặc Báo khóa */}
                                                        <div className="pt-2 mt-2 border-t border-amber-900/30 space-y-1.5">
                                                            {isLocked ? (
                                                                <button
                                                                    disabled
                                                                    className="w-full py-1.5 sm:py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-500 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 cursor-not-allowed"
                                                                >
                                                                    <Lock className="w-3 h-3" />
                                                                    <span>Đang Khóa 🔒</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleChooseOption(choice.text)}
                                                                    className="w-full py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer"
                                                                >
                                                                    <span>Hạ Chiếu</span>
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Khung Bút Lực Tự Biên (Toàn chiều rộng bên dưới 3 lá bài) */}
                                    {!loadingNext && (
                                        <div className="p-3 sm:p-3.5 rounded-xl bg-[#17120f] border border-amber-800/30 flex flex-col sm:flex-row items-center gap-2.5 shadow-md">
                                            <div className="flex items-center gap-1.5 flex-shrink-0 text-amber-300 font-bold text-xs">
                                                <Feather className="w-4 h-4 text-amber-400" />
                                                <span>Bút Lực Tự Biên:</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={customActionText}
                                                onChange={(e) => setCustomActionText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customActionText.trim()) {
                                                        handleChooseOption(customActionText.trim(), true);
                                                    }
                                                }}
                                                placeholder="Hoặc tự gõ hành động đạo lý riêng của bạn (VD: Rủ Cám trốn đi buôn lụa, mở trường dạy chữ...)"
                                                className="flex-1 w-full bg-[#110d0b] text-xs px-3.5 py-2.5 rounded-lg border border-amber-900/40 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/80 transition-all"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (customActionText.trim()) {
                                                        handleChooseOption(customActionText.trim(), true);
                                                    }
                                                }}
                                                disabled={!customActionText.trim()}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs whitespace-nowrap transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Hành Động</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* DÒNG THỜI GIAN NHỎ GỌN (TIMELINE BREADCRUMB) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
                            <span className="text-stone-400 font-medium text-[11px] flex items-center gap-1 flex-shrink-0 mr-1">
                                <History className="w-3 h-3 text-amber-400" />
                                <span>Lịch sử:</span>
                            </span>
                            {historyNodes.map((node, i) => (
                                <div key={node.step} className="flex items-center flex-shrink-0">
                                    <button
                                        onClick={() => handleTimeTravel(node.step)}
                                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                                            node.step === currentChapter?.step
                                                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-xs'
                                                : 'bg-[#17120f] text-stone-400 border-stone-800 hover:border-amber-500/40 hover:text-amber-200'
                                        }`}
                                        title={node.chapterTitle}
                                    >
                                        Hồi {node.step}
                                    </button>
                                    {i < historyNodes.length - 1 && (
                                        <ArrowRight className="w-2.5 h-2.5 text-stone-600 mx-1 flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* MODAL YÊU CẦU ĐĂNG NHẬP (DÀNH CHO KHÁCH / GUEST) */}
            {/* ============================================================ */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-[#181412] to-stone-950 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden text-center">
                        {/* 4 hoa văn cung đình truyền thống ở góc */}
                                                                                                
                        {/* Dải vân hoàng kim trên đầu modal */}
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent absolute top-0 left-0" />

                        {/* Nút đóng X */}
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1.5 rounded-full hover:bg-stone-800/80 transition-colors"
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon huy hiệu có hào quang */}
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                            <Lock className="w-7 h-7 text-amber-400" />
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-amber-200 font-heritage mb-2">
                            Mở Khóa Vận Mệnh Dị Bản
                        </h3>

                        {pendingStory && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium mb-3">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>{pendingStory.title}</span>
                            </div>
                        )}

                        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
                            Để bảo lưu nhánh rẽ câu chuyện, tích lũy điểm danh vọng và khắc danh hiệu cá nhân lên Bảng Vàng di sản, bạn vui lòng đăng nhập tài khoản.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/login', { state: { from: location } })}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 transition-all duration-200 active:scale-95"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Đăng nhập để chơi ngay</span>
                            </button>

                            <button
                                onClick={() => navigate('/register', { state: { from: location } })}
                                className="w-full py-2.5 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Tạo tài khoản miễn phí</span>
                            </button>

                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-stone-400 hover:text-stone-200 text-xs transition-colors pt-2 block mx-auto"
                            >
                                Để sau, tôi muốn xem tiếp danh mục truyện
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveStory;
