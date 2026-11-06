import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Sparkles,
    GitBranch,
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
    Volume2,
    VolumeX,
    Type,
    Quote
} from 'lucide-react';
import storyBranchService from '../services/storyBranch.service';

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

    // Tiện ích đọc truyện: Nghe âm thanh & Tùy chỉnh cỡ chữ
    const [isNarrating, setIsNarrating] = useState(false);
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
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsNarrating(false);
        }
        setSelectedStory(null);
        setCurrentChapter(null);
        setHistoryNodes([]);
        setCustomActionText('');
    };

    // Người chơi chọn một lựa chọn
    const handleChooseOption = async (optionText, isCustom = false) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsNarrating(false);
        }
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

    // Đọc giọng dẫn chuyện bằng Web Speech API
    const handleToggleNarration = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            alert('Trình duyệt của bạn hiện chưa hỗ trợ tính năng đọc âm thanh tự động.');
            return;
        }

        if (isNarrating) {
            window.speechSynthesis.cancel();
            setIsNarrating(false);
        } else {
            if (!currentChapter?.storyText) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(currentChapter.storyText);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            utterance.onend = () => setIsNarrating(false);
            utterance.onerror = () => setIsNarrating(false);
            window.speechSynthesis.speak(utterance);
            setIsNarrating(true);
        }
    };

    // Dừng giọng đọc khi chuyển hồi hoặc đổi câu chuyện
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [currentChapter]);

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
        <div className="min-h-screen bg-[#110e0c] text-stone-200 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-vietnam">
            {/* Họa tiết nền Cung đình chìm */}
            <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-600/10 via-rose-900/5 to-transparent blur-3xl pointer-events-none" />

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

                                {/* Bộ công cụ đọc: Nghe âm thanh & Tăng cỡ chữ */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleToggleNarration}
                                        title={isNarrating ? "Dừng giọng đọc" : "Nghe giọng đọc diễn cảm"}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                            isNarrating
                                                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold animate-pulse'
                                                : 'bg-[#201915] hover:bg-[#2b221c] text-stone-300 border-amber-800/40 hover:text-amber-300'
                                        }`}
                                    >
                                        {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                        <span className="hidden sm:inline">{isNarrating ? 'Dừng đọc' : 'Nghe giọng kể'}</span>
                                    </button>

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

                            {/* CÁC LỰA CHỌN TIẾP THEO (CHI TIẾT, RÕ RÀNG HÀNH ĐỘNG, KHÔNG BỊ TRUNCATE) */}
                            {!currentChapter?.isEnding && (
                                <div className="mt-6 pt-5 border-t border-amber-900/30 space-y-3">
                                    <p className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                                        <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Lựa chọn bước tiếp theo:</span>
                                    </p>

                                    {loadingNext ? (
                                        <div className="py-6 text-center space-y-2 bg-[#201915] rounded-xl border border-amber-600/25">
                                            <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs font-medium text-amber-300/90 font-heritage animate-pulse">
                                                AI đang dệt tiếp diễn biến...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {currentChapter?.choices?.map((choice, idx) => (
                                                <button
                                                    key={choice.id || idx}
                                                    onClick={() => handleChooseOption(choice.text)}
                                                    className="w-full group text-left p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#201915] to-[#1c1613] hover:from-[#2a211c] hover:to-[#241c18] border border-amber-700/30 hover:border-amber-500/60 shadow-sm hover:shadow-md hover:shadow-amber-950/40 transition-all duration-150 flex items-start gap-3.5 cursor-pointer active:scale-[0.99]"
                                                >
                                                    {/* Số thứ tự lựa chọn */}
                                                    <span className="w-6 h-6 rounded-lg bg-amber-500/15 group-hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                                                        {idx + 1}
                                                    </span>

                                                    {/* Nội dung chi tiết & Gợi ý tác động */}
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <p className="text-sm sm:text-[15px] font-semibold text-stone-100 group-hover:text-amber-200 leading-snug break-words">
                                                            {choice.text}
                                                        </p>

                                                        {choice.hint && (
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-[11px] sm:text-xs font-medium text-amber-300/90 leading-tight">
                                                                    <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                                                    <span>{choice.hint}</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Mũi tên tương tác */}
                                                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-300 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Khung tự gõ hành động riêng */}
                                    {!loadingNext && (
                                        <div className="pt-2">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Feather className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={customActionText}
                                                        onChange={(e) => setCustomActionText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && customActionText.trim()) {
                                                                handleChooseOption(customActionText.trim(), true);
                                                            }
                                                        }}
                                                        placeholder="Tự do sáng tạo bước đi riêng (VD: Rủ Cám trốn đi buôn lụa, liên minh với các tướng...)"
                                                        className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-amber-700/30 bg-[#201915] text-stone-100 placeholder:text-stone-400/50 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 transition-all"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (customActionText.trim()) {
                                                            handleChooseOption(customActionText.trim(), true);
                                                        }
                                                    }}
                                                    disabled={!customActionText.trim()}
                                                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>Hành động</span>
                                                </button>
                                            </div>
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
