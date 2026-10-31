import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HelpCircle,
    Award,
    CheckCircle2,
    XCircle,
    RotateCcw,
    BookOpen,
    ArrowRight,
    Sparkles,
    Crown,
    Loader2,
    Trophy,
    ChevronRight,
    Compass,
    SlidersHorizontal,
    Target,
    Calendar,
    BarChart3,
    Medal,
    Flame,
    Scroll,
    Lock,
    Zap,
    History,
    Check,
    X,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quiz.service';
import literatureService from '../services/literature.service';
import PoemDisplay from '../components/common/PoemDisplay';
import './HeritageQuiz.css';

const CATEGORIES = [
    { id: 'all', name: 'Tất cả Thể loại' },
    { id: 'co-tich', name: 'Truyện cổ tích' },
    { id: 'truyen-thuyet', name: 'Truyền thuyết' },
    { id: 'than-thoai', name: 'Thần thoại' },
    { id: 'ca-dao', name: 'Ca dao - Tục ngữ' },
    { id: 'trung-dai', name: 'Văn học Trung đại' },
];

const DIFFICULTIES = [
    { id: 'all', name: 'Mọi độ khó' },
    { id: 'de', name: 'Cơ bản (Dễ)' },
    { id: 'trung-binh', name: 'Thông hiểu (Vừa)' },
    { id: 'kho', name: 'Uyên bác (Khó)' },
];

const HeritageQuiz = () => {
    const { isAuthenticated, user } = useAuth();

    // Mode: 'standard' | 'daily' | 'personalized' | 'progress'
    const [activeTab, setActiveTab] = useState('standard');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [questionCount, setQuestionCount] = useState(5);

    // Quiz game states
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]); // [{ questionId, selectedIndex }]
    const [currentSelection, setCurrentSelection] = useState(null);
    const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // AI Explanation states
    const [aiExplainingId, setAiExplainingId] = useState(null);
    const [aiExplanationData, setAiExplanationData] = useState({});
    const [activeAiModal, setActiveAiModal] = useState(null); // { question, data }

    // User Learning Progress states
    const [progressData, setProgressData] = useState(null);
    const [progressLoading, setProgressLoading] = useState(false);

    // Unlocked badge modal
    const [newlyUnlockedModal, setNewlyUnlockedModal] = useState(null); // array of badges

    // Related work detail modal
    const [selectedWorkModal, setSelectedWorkModal] = useState(null);
    const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'wrong' | 'correct'

    // Tải thông tin tiến độ học tập nếu là Registered User
    const loadProgress = async () => {
        if (!isAuthenticated) return;
        setProgressLoading(true);
        try {
            const data = await quizService.getProgress();
            setProgressData(data);
        } catch (err) {
            console.warn('Lỗi tải tiến độ học tập:', err.message);
        } finally {
            setProgressLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadProgress();
        }
    }, [isAuthenticated]);

    // Bắt đầu một lượt thi mới theo chế độ
    const startQuiz = async (
        mode = activeTab,
        cat = selectedCategory,
        count = questionCount,
        difficulty = selectedDifficulty
    ) => {
        setLoading(true);
        setQuizResult(null);
        setCurrentIndex(0);
        setUserAnswers([]);
        setCurrentSelection(null);
        setHasAnsweredCurrent(false);
        setReviewFilter('all');

        try {
            let targetCategory = cat;
            if (mode === 'daily') {
                targetCategory = 'daily';
            } else if (mode === 'personalized') {
                targetCategory = 'personalized';
            }

            const data = await quizService.getQuestions({
                category: targetCategory,
                count: mode === 'daily' ? 5 : count,
                difficulty,
            });
            setQuestions(data || []);
        } catch (err) {
            console.error('Lỗi khi tải câu hỏi quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'progress') {
            startQuiz(activeTab, selectedCategory, questionCount, selectedDifficulty);
        } else if (isAuthenticated) {
            loadProgress();
        }
    }, [activeTab]);

    const currentQuestion = questions[currentIndex];

    // Xử lý chọn đáp án
    const handleSelectOption = (index) => {
        if (hasAnsweredCurrent) return;
        setCurrentSelection(index);
    };

    // Xác nhận câu trả lời hiện tại
    const handleConfirmAnswer = () => {
        if (currentSelection === null || hasAnsweredCurrent) return;

        const newAnswers = [
            ...userAnswers,
            {
                questionId: currentQuestion.id,
                selectedIndex: currentSelection,
            },
        ];
        setUserAnswers(newAnswers);
        setHasAnsweredCurrent(true);
    };

    // Chuyển sang câu hỏi kế tiếp hoặc nộp bài
    const handleNextQuestion = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setCurrentSelection(null);
            setHasAnsweredCurrent(false);
        } else {
            // Nộp bài
            setSubmitting(true);
            try {
                const result = await quizService.submitQuiz({
                    answers: userAnswers,
                    mode: activeTab,
                    category: activeTab === 'standard' ? selectedCategory : activeTab,
                });
                setQuizResult(result);

                // Nếu có huy hiệu mới mở khóa, bật popup chúc mừng
                if (result.newlyUnlockedBadges && result.newlyUnlockedBadges.length > 0) {
                    setNewlyUnlockedModal(result.newlyUnlockedBadges);
                }

                // Cập nhật lại tiến độ học tập ngầm
                if (isAuthenticated) {
                    loadProgress();
                }
            } catch (err) {
                console.error('Lỗi nộp bài quiz:', err);
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Yêu cầu AI giải thích đa tầng cho một câu hỏi
    const handleRequestAiExplanation = async (question) => {
        const qId = question.id || question.questionId;
        if (aiExplanationData[qId]) {
            setActiveAiModal({
                question: question.question,
                data: aiExplanationData[qId],
            });
            return;
        }

        setAiExplainingId(qId);
        try {
            const exp = await quizService.getAiExplanation({
                questionId: qId,
                selectedAnswer: question.userAnswer || (currentSelection !== null ? currentQuestion.options[currentSelection] : null),
            });
            setAiExplanationData((prev) => ({ ...prev, [qId]: exp }));
            setActiveAiModal({
                question: question.question,
                data: exp,
            });
        } catch (err) {
            console.error('Lỗi lấy AI Explanation:', err);
        } finally {
            setAiExplainingId(null);
        }
    };

    // Xem chi tiết tác phẩm liên quan nếu có
    const handleOpenRelatedWork = async (slug) => {
        if (!slug) return;
        try {
            const work = await literatureService.getWorkBySlug(slug);
            if (work) setSelectedWorkModal(work);
        } catch (err) {
            console.warn('Không thể tải tác phẩm liên quan:', err.message);
        }
    };

    const filteredReviewDetails = quizResult?.details?.filter((item) => {
        if (reviewFilter === 'wrong') return !item.isCorrect;
        if (reviewFilter === 'correct') return item.isCorrect;
        return true;
    }) || [];

    return (
        <div className="quiz-page">
            <div className="quiz-container">
                {/* 1. Header Banner */}
                <div className="quiz-header">
                    <div className="quiz-badge">
                        <Trophy className="w-4 h-4 text-amber-700" />
                        <span>Thử Tài Di Sản — Trí Tuệ Dân Gian</span>
                    </div>
                    <h1 className="quiz-title font-heritage">
                        Đố Vui Tri Thức & Văn Học Dân Gian
                    </h1>
                    <p className="quiz-subtitle">
                        Khám phá vẻ đẹp thần thoại, truyện cổ tích và đạo lý ca dao tục ngữ qua các thử thách trí tuệ, cá nhân hóa theo tiến độ và giải thích học thuật từ Trợ lý AI.
                    </p>
                </div>

                {/* 2. Top Navigation Tabs: 4 Chế độ chơi & Tiến độ */}
                <div className="quiz-tabs-wrapper">
                    <button
                        onClick={() => setActiveTab('standard')}
                        className={`quiz-tab-btn ${activeTab === 'standard' ? 'active-standard' : ''}`}
                    >
                        <Compass className="w-4 h-4" />
                        <span>Đố vui Tự do</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`quiz-tab-btn ${activeTab === 'daily' ? 'active-daily' : ''}`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Thử thách Ngày</span>
                        {progressData?.dailyChallenge?.completedToday && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white ml-0.5" title="Đã hoàn thành hôm nay" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('personalized')}
                        className={`quiz-tab-btn ${activeTab === 'personalized' ? 'active-personalized' : ''}`}
                    >
                        <Target className="w-4 h-4" />
                        <span>Luyện tập Cá nhân hóa</span>
                        {!isAuthenticated && (
                            <span className="ml-1 p-0.5 rounded-full bg-amber-200/80 text-amber-900" title="Yêu cầu đăng nhập">
                                <Lock className="w-3 h-3" />
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`quiz-tab-btn ${activeTab === 'progress' ? 'active-progress' : ''}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>Tiến độ & Huy hiệu</span>
                        {progressData?.badges?.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 ml-1">
                                {progressData.badges.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* 3. Filter controls (Chỉ hiện ở tab standard khi chưa nộp bài) */}
                {activeTab === 'standard' && !quizResult && !loading && (
                    <div className="bg-[#fffdf9]/95 rounded-2xl p-4 sm:p-5 border border-amber-900/15 shadow-sm space-y-4 relative">
                        {/* Thể loại */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                                    Chủ đề / Thể loại:
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            startQuiz('standard', cat.id, questionCount, selectedDifficulty);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                            selectedCategory === cat.id
                                                ? 'bg-amber-900 text-amber-50 border-amber-800 shadow-sm'
                                                : 'bg-white text-stone-700 border-stone-200/80 hover:bg-amber-50 hover:border-amber-300'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Độ khó & Số câu */}
                        <div className="pt-2 border-t border-amber-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            {/* Độ khó */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                                    <SlidersHorizontal className="w-3 h-3 text-amber-700" />
                                    Độ khó:
                                </span>
                                {DIFFICULTIES.map((diff) => (
                                    <button
                                        key={diff.id}
                                        onClick={() => {
                                            setSelectedDifficulty(diff.id);
                                            startQuiz('standard', selectedCategory, questionCount, diff.id);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                            selectedDifficulty === diff.id
                                                ? 'bg-red-900 text-amber-100 shadow-xs'
                                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                    >
                                        {diff.name}
                                    </button>
                                ))}
                            </div>

                            {/* Số câu & Đổi đề */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-xs text-stone-500 font-medium">Số câu:</span>
                                <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                                    {[5, 10, 15].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => {
                                                setQuestionCount(num);
                                                startQuiz('standard', selectedCategory, num, selectedDifficulty);
                                            }}
                                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition ${
                                                questionCount === num
                                                    ? 'bg-white text-stone-900 shadow-xs'
                                                    : 'text-stone-500 hover:text-stone-900'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => startQuiz('standard', selectedCategory, questionCount, selectedDifficulty)}
                                    title="Xáo trộn đề bài mới"
                                    className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-amber-100/70 rounded-lg transition"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Tab Header Notice nếu đang ở Daily Challenge hoặc Personalized */}
                {!quizResult && !loading && activeTab === 'daily' && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-extrabold text-sm text-slate-900 font-heritage flex items-center gap-2">
                                    <span>Thử Thách Ngày — Bộ Đề Hôm Nay</span>
                                    {progressData?.dailyChallenge?.completedToday ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                            ✓ Đã hoàn thành
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300 animate-pulse">
                                            Đang mở
                                        </span>
                                    )}
                                </p>
                                <p className="text-[11px] text-slate-600">
                                    {isAuthenticated
                                        ? `Chuỗi ngày bền bỉ hiện tại: ${progressData?.dailyChallenge?.streak || 0} ngày liên tiếp`
                                        : 'Bạn đang chơi thử với vai trò Khách. Đăng nhập để tích lũy chuỗi ngày và nhận huy hiệu!'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => startQuiz('daily', 'daily', 5)}
                            className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Làm lại</span>
                        </button>
                    </div>
                )}

                {!quizResult && !loading && activeTab === 'personalized' && (
                    <div className="bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/15 border border-indigo-500/30 rounded-2xl p-4 text-xs text-indigo-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-extrabold text-sm text-slate-900 font-heritage flex items-center gap-1.5">
                                        <span>Bộ Đề Cá Nhân Hóa Theo Năng Lực</span>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    </p>
                                    <p className="text-[11px] text-slate-600">
                                        {isAuthenticated
                                            ? 'Hệ thống tự động phân tích các chủ đề bạn trả lời chưa cao để tăng cường câu hỏi rèn luyện.'
                                            : 'Chế độ luyện tập nâng cao dành riêng cho Thành viên đã đăng nhập.'}
                                    </p>
                                </div>
                            </div>
                            {isAuthenticated && (
                                <button
                                    onClick={() => startQuiz('personalized', 'personalized', 5)}
                                    className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Tạo đề mới</span>
                                </button>
                            )}
                        </div>
                        {!isAuthenticated && (
                            <div className="mt-3 pt-3 border-t border-indigo-200/60 flex items-center justify-between">
                                <span className="text-[11px] text-indigo-900 font-medium">Đăng nhập để hệ thống cá nhân hóa đề thi riêng cho bạn!</span>
                                <Link
                                    to="/login"
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
                        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-slate-700">Đang khởi tạo đề thi Di sản...</p>
                    </div>
                )}

                {/* 5. TAB TIẾN ĐỘ HỌC TẬP & HUY HIỆU (LEARNING PROGRESS & BADGES) */}
                {activeTab === 'progress' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {!isAuthenticated ? (
                            /* Guest Notice */
                            <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 border border-amber-500/30 shadow-xl">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 mx-auto flex items-center justify-center font-bold shadow-lg shadow-amber-500/30">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div className="max-w-md mx-auto space-y-2">
                                    <h3 className="text-2xl font-black text-amber-300 font-heritage">
                                        Khám Phá Tiến Độ & Tủ Huy Hiệu
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-vietnam">
                                        Đăng nhập tài khoản để tự động lưu điểm số mỗi lần chơi, theo dõi biểu đồ tỷ lệ trả lời đúng theo từng chủ đề và sưu tầm bộ huy hiệu danh giá!
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <Link
                                        to="/register"
                                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/25 transition"
                                    >
                                        Đăng ký miễn phí
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-medium border border-slate-700 transition"
                                    >
                                        Đăng nhập
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Registered User Progress Dashboard */
                            <div className="space-y-6">
                                {/* Overview Metrics Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-[11px] font-semibold">Lượt thi</span>
                                            <Compass className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 font-heritage">
                                            {progressData?.totalQuizzes || 0}
                                        </p>
                                        <p className="text-[10px] text-slate-400">bài đã hoàn thành</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-[11px] font-semibold">Câu đúng</span>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="text-2xl font-black text-emerald-600 font-heritage">
                                            {progressData?.totalCorrect || 0} / {progressData?.totalQuestions || 0}
                                        </p>
                                        <p className="text-[10px] text-slate-400">câu trả lời chuẩn xác</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-[11px] font-semibold">Tỷ lệ đúng</span>
                                            <Zap className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <p className="text-2xl font-black text-amber-600 font-heritage">
                                            {progressData?.overallAccuracy || 0}%
                                        </p>
                                        <p className="text-[10px] text-slate-400">độ chính xác tổng quan</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-[11px] font-semibold">Huy hiệu</span>
                                            <Trophy className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 font-heritage">
                                            {progressData?.badges?.length || 0} / {progressData?.allBadges?.length || 9}
                                        </p>
                                        <p className="text-[10px] text-slate-400">đã mở khóa</p>
                                    </div>
                                </div>

                                {/* Category Performance Bars */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                    <h3 className="text-base font-extrabold text-slate-900 font-heritage flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-indigo-600" />
                                        <span>Tỷ lệ Trả lời Đúng Theo Thể loại</span>
                                    </h3>

                                    <div className="space-y-3 pt-1">
                                        {progressData?.categoryStats?.map((cat) => (
                                            <div key={cat.id || cat.category} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-slate-800">
                                                        {cat.name || cat.categoryName || cat.category}
                                                    </span>
                                                    <span className="text-slate-500 font-semibold">
                                                        {cat.correct}/{cat.total} câu ({cat.accuracy}%)
                                                    </span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            cat.accuracy >= 80
                                                                ? 'bg-emerald-500'
                                                                : cat.accuracy >= 50
                                                                ? 'bg-amber-500'
                                                                : 'bg-indigo-500'
                                                        }`}
                                                        style={{ width: `${cat.total > 0 ? cat.accuracy : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievement Badges Showcase */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-slate-900 font-heritage flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-amber-500" />
                                            <span>Tủ Huy Hiệu Thành Tích Di Sản</span>
                                        </h3>
                                        <span className="text-xs text-slate-500 font-medium">
                                            Đã đạt: {progressData?.badges?.length || 0}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                        {progressData?.allBadges?.map((b) => {
                                            const unlocked = Boolean(b.isUnlocked || b.earned);
                                            return (
                                                <div
                                                    key={b.id}
                                                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                                                        unlocked
                                                            ? 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-amber-300 shadow-xs'
                                                            : 'bg-slate-50/70 border-slate-200 opacity-60'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                            unlocked
                                                                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30'
                                                                : 'bg-slate-200 text-slate-400'
                                                        }`}
                                                    >
                                                        {unlocked ? (
                                                            <Award className="w-5 h-5 text-slate-950" />
                                                        ) : (
                                                            <Lock className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className={`font-bold text-xs ${unlocked ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {b.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 leading-tight">
                                                            {b.description}
                                                        </p>
                                                        <p className="text-[10px] text-amber-800/80 font-medium pt-0.5">
                                                            {unlocked ? (
                                                                <span className="text-emerald-700 font-bold">✓ Đã mở khóa</span>
                                                            ) : (
                                                                <span>ĐK: {b.criterion}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Recent History */}
                                {progressData?.history?.length > 0 && (
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                        <h3 className="text-base font-extrabold text-slate-900 font-heritage flex items-center gap-2">
                                            <History className="w-4 h-4 text-slate-600" />
                                            <span>Lịch Sử Các Lần Thi Gần Nhất</span>
                                        </h3>
                                        <div className="divide-y divide-slate-100 text-xs">
                                            {progressData.history.slice(0, 6).map((h, i) => (
                                                <div key={i} className="py-2.5 flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-slate-800">
                                                            {h.mode === 'daily'
                                                                ? 'Thử thách Ngày'
                                                                : h.mode === 'personalized'
                                                                ? 'Luyện tập Cá nhân'
                                                                : `Đố vui (${h.category})`}
                                                            <span className="ml-2 font-normal text-slate-500">
                                                                — {h.badgeTitle}
                                                            </span>
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {new Date(h.completedAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-black text-amber-700 text-sm font-heritage">
                                                            {h.score}/100đ
                                                        </span>
                                                        <p className="text-[10px] text-emerald-600 font-medium">
                                                            Đúng {h.correctCount}/{h.totalQuestions} câu
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 6. GAME SCREEN (Đang làm bài) */}
                {!loading && !quizResult && currentQuestion && activeTab !== 'progress' && (
                    <div className="quiz-card animate-in fade-in duration-200">
                        {/* Progress Header & Visual Stepper */}
                        <div className="pb-5 border-b border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                                        Câu {currentIndex + 1} / {questions.length}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                                        • {currentQuestion.categoryName}
                                    </span>
                                    {currentQuestion.difficulty && (
                                        <span className="text-[10px] uppercase font-bold text-stone-500 px-2 py-0.5 rounded bg-stone-100">
                                            {currentQuestion.difficulty === 'de' ? 'Dễ' : currentQuestion.difficulty === 'kho' ? 'Khó' : 'Vừa'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-800">
                                        Tiến độ: {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Full-width Progress Bar */}
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-full transition-all duration-300 shadow-sm"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>

                            {/* Visual Question Stepper Pills */}
                            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                                {questions.map((q, idx) => {
                                    const isDone = idx < userAnswers.length;
                                    const isCurrent = idx === currentIndex;
                                    return (
                                        <div
                                            key={q.id || idx}
                                            className={`flex-1 min-w-[28px] h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                                isCurrent
                                                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400 scale-105'
                                                    : isDone
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}
                                        >
                                            {idx + 1}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                            <h2 className="quiz-question-title font-heritage text-lg sm:text-2xl font-bold leading-relaxed">
                                {currentQuestion.question}
                            </h2>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 gap-3 pt-2">
                            {currentQuestion.options.map((option, optIdx) => {
                                const isSelected = currentSelection === optIdx;
                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleSelectOption(optIdx)}
                                        disabled={hasAnsweredCurrent}
                                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3.5 ${
                                            isSelected
                                                ? 'border-amber-700 bg-amber-50/90 text-amber-950 ring-2 ring-amber-600/30 shadow-sm'
                                                : 'border-stone-200 bg-white hover:border-amber-300 text-stone-800 hover:bg-stone-50/70'
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition ${
                                                isSelected
                                                    ? 'bg-amber-900 text-amber-100'
                                                    : 'bg-stone-100 text-stone-600'
                                            }`}
                                        >
                                            {String.fromCharCode(65 + optIdx)}
                                        </div>
                                        <span className="leading-relaxed pt-0.5">{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* AI Explanation Fast Preview when answered */}
                        {hasAnsweredCurrent && (
                            <div className="mt-2 p-3.5 bg-gradient-to-r from-amber-50/90 to-indigo-50/70 rounded-2xl border border-amber-300/60 flex items-center justify-between text-xs animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                    <span className="font-medium text-slate-800">
                                        Muốn hiểu sâu nguồn gốc, ý nghĩa bối cảnh câu hỏi này?
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRequestAiExplanation(currentQuestion)}
                                    disabled={aiExplainingId === currentQuestion.id}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                                >
                                    {aiExplainingId === currentQuestion.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    )}
                                    <span>Hỏi AI giải thích ✨</span>
                                </button>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-amber-200/50">
                            {currentQuestion.relatedWork ? (
                                <button
                                    onClick={() => handleOpenRelatedWork(currentQuestion.relatedWork.slug)}
                                    className="text-xs text-amber-900 hover:text-red-800 font-semibold flex items-center gap-1.5 transition"
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Đọc tác phẩm: {currentQuestion.relatedWork.title}</span>
                                </button>
                            ) : <div />}

                            <div className="ml-auto flex items-center gap-3">
                                {!hasAnsweredCurrent ? (
                                    <button
                                        onClick={handleConfirmAnswer}
                                        disabled={currentSelection === null}
                                        className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none text-amber-50 rounded-xl text-xs font-bold transition shadow-sm"
                                    >
                                        Xác nhận câu trả lời
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-gradient-to-r from-red-800 via-red-900 to-amber-900 hover:from-red-700 hover:to-amber-800 text-amber-100 rounded-xl text-xs font-bold transition shadow-md shadow-red-950/20 flex items-center gap-1.5"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                                                <span>Đang chấm điểm...</span>
                                            </>
                                        ) : currentIndex === questions.length - 1 ? (
                                            <>
                                                <span>Xem kết quả & Danh hiệu</span>
                                                <Trophy className="w-4 h-4 text-amber-300" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Câu tiếp theo</span>
                                                <ArrowRight className="w-4 h-4 text-amber-300" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. RESULTS SCREEN */}
                {quizResult && activeTab !== 'progress' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200 relative">
                        <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>
                        {/* Hero Score Badge */}
                        <div className="text-center space-y-4 max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 mx-auto flex items-center justify-center text-red-950 shadow-xl shadow-amber-600/25 ring-8 ring-amber-100">
                                <Crown className="w-12 h-12 text-red-950" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                                    Danh hiệu đạt được
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heritage">
                                    {quizResult.badge.title}
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    {quizResult.badge.description}
                                </p>
                            </div>

                            {/* Score Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-3">
                                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80">
                                    <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heritage">
                                        {quizResult.score} / 100
                                    </p>
                                    <p className="text-[11px] text-stone-500 font-medium">Điểm số tổng kết</p>
                                </div>
                                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-heritage">
                                        {quizResult.correctCount} / {quizResult.totalQuestions}
                                    </p>
                                    <p className="text-[11px] text-emerald-700 font-medium">Số câu trả lời đúng</p>
                                </div>
                            </div>

                            {/* Guest Notice Callout */}
                            {quizResult.isGuest && (
                                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1.5">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                                        Bạn đang chơi với tư cách Khách
                                    </p>
                                    <p className="text-[11px] text-amber-800 leading-relaxed">
                                        Kết quả lượt chơi này không được lưu lại. Hãy đăng ký tài khoản để tích lũy tỷ lệ trả lời đúng và mở khóa toàn bộ tủ huy hiệu thành tích!
                                    </p>
                                    <div className="pt-1 flex items-center gap-2">
                                        <Link
                                            to="/register"
                                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                                        >
                                            Đăng ký ngay
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-medium text-[11px] border border-slate-300 transition"
                                        >
                                            Đăng nhập
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    onClick={() => startQuiz(activeTab, selectedCategory, questionCount, selectedDifficulty)}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Làm đề mới</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('progress')}
                                    className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>Xem tiến độ</span>
                                </button>
                                <Link
                                    to="/kham-pha"
                                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                >
                                    <Compass className="w-3.5 h-3.5 text-stone-600" />
                                    <span>Khám phá thêm</span>
                                </Link>
                            </div>
                        </div>

                        {/* Detailed Question Review with Filters */}
                        <div className="pt-6 border-t border-slate-200 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heritage flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-600" />
                                        <span>Phân tích & Giải nghĩa Chi tiết từng câu:</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Click "AI Giảng giải Đa tầng" để xem bối cảnh và nguồn học thuật
                                    </p>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                                    <button
                                        onClick={() => setReviewFilter('all')}
                                        className={`px-2.5 py-1 rounded-lg transition ${
                                            reviewFilter === 'all'
                                                ? 'bg-white text-stone-900 shadow-xs'
                                                : 'text-stone-500 hover:text-stone-900'
                                        }`}
                                    >
                                        Tất cả ({quizResult.details?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setReviewFilter('wrong')}
                                        className={`px-2.5 py-1 rounded-lg transition ${
                                            reviewFilter === 'wrong'
                                                ? 'bg-red-900 text-white shadow-xs'
                                                : 'text-stone-500 hover:text-rose-800'
                                        }`}
                                    >
                                        Câu sai ({quizResult.details?.filter((d) => !d.isCorrect).length || 0})
                                    </button>
                                    <button
                                        onClick={() => setReviewFilter('correct')}
                                        className={`px-2.5 py-1 rounded-lg transition ${
                                            reviewFilter === 'correct'
                                                ? 'bg-emerald-800 text-white shadow-xs'
                                                : 'text-stone-500 hover:text-emerald-800'
                                        }`}
                                    >
                                        Câu đúng ({quizResult.details?.filter((d) => d.isCorrect).length || 0})
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredReviewDetails.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-5 rounded-2xl border transition ${
                                            item.isCorrect
                                                ? 'bg-emerald-50/50 border-emerald-200'
                                                : 'bg-rose-50/50 border-rose-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-stone-700">
                                                        Câu {idx + 1}:
                                                    </span>
                                                    <span className="text-[11px] text-stone-500 font-medium">
                                                        ({item.categoryName})
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-stone-900 leading-snug">
                                                    {item.question}
                                                </p>
                                            </div>
                                            {item.isCorrect ? (
                                                <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs flex-shrink-0">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    <span>Chính xác</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-rose-700 font-bold text-xs flex-shrink-0">
                                                    <XCircle className="w-4 h-4 text-rose-600" />
                                                    <span>Chưa đúng</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-stone-200/60 space-y-2 text-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-stone-700">
                                                <span>Bạn đã chọn: <strong className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{item.userAnswer}</strong></span>
                                                {!item.isCorrect && (
                                                    <span className="text-stone-400 hidden sm:inline">•</span>
                                                )}
                                                {!item.isCorrect && (
                                                    <span>Đáp án đúng: <strong className="text-emerald-700">{item.correctAnswer}</strong></span>
                                                )}
                                            </div>

                                            {/* Explanation */}
                                            <div className="bg-white/90 rounded-xl p-3 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-2">
                                                <p className="font-semibold text-slate-900">
                                                    Ý nghĩa văn hóa & Đạo lý:
                                                </p>
                                                <p>{item.explanation}</p>

                                                {/* Action Bar for Question: Related Work & AI Deep Explain */}
                                                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                                    {item.relatedWorkSlug ? (
                                                        <button
                                                            onClick={() => handleOpenRelatedWork(item.relatedWorkSlug)}
                                                            className="text-amber-900 hover:text-red-900 font-bold text-[11px] flex items-center gap-1"
                                                        >
                                                            <BookOpen className="w-3 h-3 text-amber-700" />
                                                            <span>Xem tác phẩm liên quan</span>
                                                        </button>
                                                    ) : <span />}

                                                    <button
                                                        onClick={() => handleRequestAiExplanation(item)}
                                                        disabled={aiExplainingId === item.questionId}
                                                        className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow-xs transition"
                                                    >
                                                        {aiExplainingId === item.questionId ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="w-3 h-3 text-slate-950" />
                                                        )}
                                                        <span>AI Giảng giải Đa tầng & Dẫn nguồn ✨</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: AI QUESTION DEEP EXPLANATION (Giải thích đa tầng & Dẫn nguồn học thuật) */}
            {activeAiModal && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
                    role="dialog"
                >
                    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-500/40 relative max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                                    <Sparkles className="w-5 h-5 text-slate-950" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-white text-base font-heritage">
                                        VietHeritage AI — Phân Tích Đa Tầng
                                    </h3>
                                    <p className="text-[11px] text-amber-300">
                                        Nguồn học thuật & Bối cảnh lịch sử dân gian
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveAiModal(null)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Question Reference */}
                        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 text-xs space-y-1">
                            <span className="font-bold text-amber-400 text-[11px]">Câu hỏi phân tích:</span>
                            <p className="text-slate-200 font-medium">{activeAiModal.question}</p>
                        </div>

                        {/* Explanation Content */}
                        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2 whitespace-pre-line font-vietnam">
                            {activeAiModal.data?.deepExplanation}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400">
                                Dữ liệu kiểm chứng bởi VietHeritage Knowledge Base
                            </span>
                            <button
                                onClick={() => setActiveAiModal(null)}
                                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CHÚC MỪNG MỞ KHÓA HUY HIỆU MỚI (NEWLY UNLOCKED BADGES) */}
            {newlyUnlockedModal && newlyUnlockedModal.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
                    role="dialog"
                >
                    <div className="bg-gradient-to-b from-slate-900 to-amber-950 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-amber-500/50 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 ring-8 ring-amber-500/20 animate-bounce">
                            <Trophy className="w-10 h-10 text-slate-950" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                                Chúc Mừng Bạn!
                            </span>
                            <h3 className="text-2xl font-black text-white font-heritage">
                                Đã Mở Khóa Huy Hiệu Mới!
                            </h3>
                            <p className="text-xs text-slate-300">
                                Thành tích xuất sắc của bạn đã được ghi danh vào bảng vàng Di sản.
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            {newlyUnlockedModal.map((b) => (
                                <div
                                    key={b.id}
                                    className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                                        <Award className="w-5 h-5 text-slate-950" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-xs">{b.title}</p>
                                        <p className="text-[11px] text-amber-200/80">{b.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setNewlyUnlockedModal(null)}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition"
                        >
                            Tuyệt vời! Tiếp tục
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Work Detail Modal if user clicked read more */}
            {selectedWorkModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto border border-amber-900/20">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                    {selectedWorkModal.categoryName}
                                </span>
                                <h3 className="text-2xl font-bold font-heritage text-stone-900 mt-2">
                                    {selectedWorkModal.title}
                                </h3>
                                <p className="text-xs text-stone-500">
                                    {selectedWorkModal.region} • {selectedWorkModal.period}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedWorkModal(null)}
                                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {selectedWorkModal.quote && (
                            <div className="border-l-4 border-amber-600 bg-amber-50/70 p-3.5 rounded-r-xl">
                                <PoemDisplay text={selectedWorkModal.quote} size="sm" showQuotes={true} />
                            </div>
                        )}

                        <div className="space-y-2 text-xs leading-relaxed text-stone-700">
                            <h4 className="font-bold text-stone-900">Tóm tắt tác phẩm:</h4>
                            <p>{selectedWorkModal.summary}</p>
                        </div>

                        {selectedWorkModal.thematicMeaning && (
                            <div className="space-y-2 text-xs leading-relaxed text-stone-700">
                                <h4 className="font-bold text-stone-900">Ý nghĩa chủ đề & Biểu tượng:</h4>
                                <p>{selectedWorkModal.thematicMeaning}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                            <span>Nguồn kiểm chứng: <strong>{selectedWorkModal.source || 'Văn học Dân gian Việt Nam'}</strong></span>
                            <button
                                onClick={() => setSelectedWorkModal(null)}
                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeritageQuiz;
