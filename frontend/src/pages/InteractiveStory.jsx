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
    CheckCircle2,
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
    UserPlus
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

    // Trạng thái modal yêu cầu đăng nhập khi khách tương tác
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingStory, setPendingStory] = useState(null);

    const storyContainerRef = useRef(null);

    // Tải danh sách câu chuyện khi mở trang
    useEffect(() => {
        loadStories();
    }, []);

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
    const handleChooseOption = async (optionText, statChanges = null) => {
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
                    <div className="space-y-10">
                        {/* Tiêu đề trang trọng */}
                        <div className="text-center space-y-4 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span>Trải nghiệm Tương tác Độc quyền</span>
                                <GitBranch className="w-4 h-4 text-amber-400" />
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-heritage tracking-tight leading-tight">
                                Dị Bản Cổ Tích: Bánh Xe Vận Mệnh
                            </h1>

                            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                                Đóng vai những nhân vật huyền thoại, can thiệp vào các nút thắt lịch sử kinh điển và cùng
                                <strong> Trí tuệ Nhân tạo</strong> mở ra những cái kết dị bản chưa từng có trong sử sách.
                            </p>
                        </div>

                        {/* Danh sách các câu chuyện */}
                        {loadingStories ? (
                            <div className="text-center py-20">
                                <div className="inline-block w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-amber-200/80 font-medium text-sm">Đang thỉnh kho tàng tích truyện...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {stories.map((story) => (
                                    <div
                                        key={story.slug}
                                        className="group relative rounded-2xl bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-amber-600/30 hover:border-amber-400/70 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/20"
                                    >
                                        <div className="space-y-4">
                                            {/* Tag thể loại & Huy hiệu */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                                                    {story.category}
                                                </span>
                                                <span className="text-stone-400 flex items-center gap-1">
                                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                                    {story.badgeTheme}
                                                </span>
                                            </div>

                                            {/* Tiêu đề tác phẩm */}
                                            <div>
                                                <h3 className="text-xl font-bold text-amber-200 font-heritage group-hover:text-amber-300 transition-colors">
                                                    {story.title}
                                                </h3>
                                                <p className="text-xs text-amber-400/80 italic mt-1">{story.subtitle}</p>
                                            </div>

                                            {/* Tóm tắt */}
                                            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed line-clamp-4">
                                                {story.summary}
                                            </p>

                                            {/* Khung chỉ số khởi đầu */}
                                            <div className="pt-2 border-t border-stone-800">
                                                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                                    Chỉ số vận mệnh:
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/40">
                                                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                                                        <span>Tâm: 50%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-blue-300 bg-blue-950/30 px-2 py-1 rounded border border-blue-900/40">
                                                        <Brain className="w-3.5 h-3.5 text-blue-400" />
                                                        <span>Trí: 50%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/40">
                                                        <Sword className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>Dũng: 50%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40">
                                                        <Crown className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>Dân: 50%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nút bấm bắt đầu */}
                                        <button
                                            onClick={() => handleStartStory(story)}
                                            className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all duration-200 active:scale-95 group/btn"
                                        >
                                            {!isAuthenticated ? (
                                                <>
                                                    <Lock className="w-4 h-4 text-stone-900/80" />
                                                    <span>Bắt đầu định đoạt</span>
                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Bắt đầu định đoạt</span>
                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ============================================================ */
                    /* 2. MÀN HÌNH CHƠI TƯƠNG TÁC (INTERACTIVE PLAY SCREEN) */
                    /* ============================================================ */
                    <div ref={storyContainerRef} className="space-y-6">
                        {/* Thanh điều khiển trên cùng (Top Navigation & HUD) */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-600/30">
                            <button
                                onClick={handleBackToCatalog}
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-300/80 hover:text-amber-200 transition-colors bg-stone-900/80 px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Chọn truyện khác</span>
                            </button>

                            <div className="text-center sm:text-right">
                                <h2 className="text-base sm:text-lg font-bold text-amber-300 font-heritage">
                                    {selectedStory.title}
                                </h2>
                                <p className="text-xs text-stone-400">
                                    Đang tại: <span className="text-amber-400 font-semibold">{currentChapter?.chapterTitle}</span>
                                </p>
                            </div>
                        </div>

                        {/* BẢNG CHỈ SỐ NHÂN VẬT (KARMA STATS HUD) */}
                        <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-xl shadow-stone-950/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                                    <Crown className="w-4 h-4 text-amber-400" />
                                    <span>Chỉ Số Vận Mệnh Cốt Truyện</span>
                                </span>
                                <span className="text-[11px] text-amber-400/90 italic">
                                    Quyết định của bạn sẽ xoay chuyển các chỉ số này
                                </span>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {/* Chỉ số Tâm */}
                                <div className="bg-stone-950/60 p-3 rounded-xl border border-rose-900/40 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                                            Tâm (Nhân ái)
                                        </span>
                                        <span className="font-bold text-rose-200">{stats.tam}%</span>
                                    </div>
                                    <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-rose-600 to-rose-400 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.tam}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Chỉ số Trí */}
                                <div className="bg-stone-950/60 p-3 rounded-xl border border-blue-900/40 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
                                            <Brain className="w-3.5 h-3.5 text-blue-400" />
                                            Trí (Mưu lược)
                                        </span>
                                        <span className="font-bold text-blue-200">{stats.tri}%</span>
                                    </div>
                                    <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.tri}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Chỉ số Dũng */}
                                <div className="bg-stone-950/60 p-3 rounded-xl border border-amber-900/40 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                                            <Sword className="w-3.5 h-3.5 text-amber-400" />
                                            Dũng (Khí phách)
                                        </span>
                                        <span className="font-bold text-amber-200">{stats.dung}%</span>
                                    </div>
                                    <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.dung}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Chỉ số Lòng Dân */}
                                <div className="bg-stone-950/60 p-3 rounded-xl border border-emerald-900/40 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                                            <Crown className="w-3.5 h-3.5 text-emerald-400" />
                                            Lòng Dân
                                        </span>
                                        <span className="font-bold text-emerald-200">{stats.longDan}%</span>
                                    </div>
                                    <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.longDan}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* KHUNG NỘI DUNG CUỐN SÁCH CỔ TÍCH HOÀNG GIA */}
                        {/* ============================================================ */}
                        <div
                            className={`relative rounded-3xl bg-[#fffdf9] text-stone-900 p-6 sm:p-10 border-2 shadow-2xl transition-all duration-500 ${currentMood.cardGlow}`}
                        >
                            {/* Họa tiết góc triện cổ 4 góc */}
                            <div className="absolute top-3 left-3 text-amber-700/40 text-lg select-none">❖</div>
                            <div className="absolute top-3 right-3 text-amber-700/40 text-lg select-none">❖</div>
                            <div className="absolute bottom-3 left-3 text-amber-700/40 text-lg select-none">❖</div>
                            <div className="absolute bottom-3 right-3 text-amber-700/40 text-lg select-none">❖</div>

                            {/* Tiêu đề Hồi & Trạng thái Mood */}
                            <div className="flex items-center justify-between pb-4 border-b border-amber-900/20 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                                    <h3 className="text-xl sm:text-2xl font-bold font-heritage text-amber-950">
                                        {currentChapter?.chapterTitle}
                                    </h3>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${currentMood.badgeClass}`}
                                >
                                    {currentMood.label}
                                </span>
                            </div>

                            {/* Đoạn văn kể chuyện */}
                            <div className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
                                {currentChapter?.storyText?.split('\n\n').map((paragraph, i) => (
                                    <p key={i} className="first-letter:text-3xl first-letter:font-bold first-letter:text-amber-800 first-letter:font-heritage">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            {/* HIỂN THỊ KẾT CỤC & GƯƠNG SOI ĐẠO LÝ NẾU ĐÃ KẾT THÚC */}
                            {currentChapter?.isEnding && currentChapter?.endingData && (
                                <div className="mt-8 pt-6 border-t-2 border-amber-900/20 bg-gradient-to-b from-amber-500/10 to-amber-500/5 p-6 rounded-2xl border border-amber-500/30 space-y-5">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-6 h-6 text-amber-600" />
                                            <div>
                                                <p className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                                                    Đạt Kết Cục Dị Bản
                                                </p>
                                                <h4 className="text-lg sm:text-xl font-bold font-heritage text-amber-950">
                                                    {currentChapter.endingData.endingType}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="px-3.5 py-1.5 rounded-full bg-amber-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                                            <Crown className="w-3.5 h-3.5" />
                                            <span>Danh hiệu: {currentChapter.endingData.badgeTitle}</span>
                                        </div>
                                    </div>

                                    {/* Gương soi đạo lý: So sánh bản gốc vs dị bản */}
                                    <div className="bg-white/80 p-4 rounded-xl border border-amber-700/20 text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                                        <p className="font-bold text-amber-900 flex items-center gap-1.5">
                                            <Scroll className="w-4 h-4 text-amber-700" />
                                            <span>Gương Soi Đạo Lý (Phân tích đối sánh):</span>
                                        </p>
                                        <p className="italic text-stone-700">
                                            {currentChapter.endingData.moralComparison}
                                        </p>
                                    </div>

                                    {/* Nút chia sẻ hoặc chơi lại */}
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <button
                                            onClick={handleShareEnding}
                                            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span>{copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép dị bản khoe bạn bè'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleStartStory(selectedStory)}
                                            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Khám phá nhánh rẽ khác</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CÁC LỰA CHỌN TIẾP THEO (CHOICES) KHI CHƯA KẾT THÚC */}
                            {!currentChapter?.isEnding && (
                                <div className="mt-8 pt-6 border-t border-amber-900/20 space-y-4">
                                    <p className="text-xs uppercase font-extrabold text-amber-900 tracking-wider flex items-center gap-1.5">
                                        <GitBranch className="w-4 h-4 text-amber-700" />
                                        <span>Bạn sẽ quyết định ra sao trong hồi kế tiếp?</span>
                                    </p>

                                    {loadingNext ? (
                                        <div className="py-8 text-center space-y-2 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                            <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm font-semibold text-amber-900 font-heritage animate-pulse">
                                                Nghệ nhân AI đang dệt tiếp diễn biến hồi sau...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {currentChapter?.choices?.map((choice, idx) => (
                                                <button
                                                    key={choice.id || idx}
                                                    onClick={() => handleChooseOption(choice.text, choice.statChanges)}
                                                    className="group text-left p-4 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-700/30 hover:border-amber-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-start justify-between gap-3 active:scale-[0.99]"
                                                >
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-stone-900 group-hover:text-amber-950 leading-snug">
                                                            {choice.text}
                                                        </p>
                                                        {choice.hint && (
                                                            <p className="text-[11px] text-amber-700/80 font-medium">
                                                                Dự kiến: {choice.hint}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-amber-700 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* LỰA CHỌN TỰ VIẾT HÀNH ĐỘNG CỦA RIÊNG BẠN */}
                                    {!loadingNext && (
                                        <div className="pt-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mb-2">
                                                <Feather className="w-3.5 h-3.5 text-amber-700" />
                                                <span>Hoặc tự tay bạn viết tiếp hướng đi táo bạo:</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customActionText}
                                                    onChange={(e) => setCustomActionText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && customActionText.trim()) {
                                                            handleChooseOption(customActionText.trim());
                                                        }
                                                    }}
                                                    placeholder="Ví dụ: Tấm rủ Cám trốn khỏi hoàng cung, lập bang hội dệt lụa..."
                                                    className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-amber-900/30 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 placeholder:text-stone-400"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (customActionText.trim()) {
                                                            handleChooseOption(customActionText.trim());
                                                        }
                                                    }}
                                                    disabled={!customActionText.trim()}
                                                    className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>Gửi quyết định</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ============================================================ */}
                        {/* SƠ ĐỒ CÂY CỐT TRUYỆN (TIME TRAVEL & CHECKPOINTS) */}
                        {/* ============================================================ */}
                        <div className="bg-stone-900/80 rounded-2xl p-5 border border-amber-600/30">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                                    <History className="w-4 h-4 text-amber-400" />
                                    <span>Hành Trình Rẽ Nhánh (Nhấp để Quay Ngược Thời Gian)</span>
                                </span>
                                <span className="text-xs text-amber-400 font-semibold">
                                    Đã qua {historyNodes.length} ngã rẽ
                                </span>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                {historyNodes.map((node, i) => (
                                    <div key={node.step} className="flex items-center flex-shrink-0">
                                        <button
                                            onClick={() => handleTimeTravel(node.step)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                node.step === currentChapter?.step
                                                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/30'
                                                    : 'bg-stone-950/80 text-stone-300 border-stone-800 hover:border-amber-500/50 hover:text-amber-200'
                                            }`}
                                        >
                                            <span className="block text-[10px] opacity-75 font-normal">
                                                Hồi {node.step}
                                            </span>
                                            <span className="block truncate max-w-[120px]">
                                                {node.chapterTitle?.replace(/^Hồi \d+:\s*/, '')}
                                            </span>
                                        </button>
                                        {i < historyNodes.length - 1 && (
                                            <ArrowRight className="w-3.5 h-3.5 text-stone-600 mx-1.5 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
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
                        <span className="absolute top-2.5 left-2.5 text-amber-500/50 text-xs select-none">❖</span>
                        <span className="absolute top-2.5 right-2.5 text-amber-500/50 text-xs select-none">❖</span>
                        <span className="absolute bottom-2.5 left-2.5 text-amber-500/50 text-xs select-none">❖</span>
                        <span className="absolute bottom-2.5 right-2.5 text-amber-500/50 text-xs select-none">❖</span>

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
