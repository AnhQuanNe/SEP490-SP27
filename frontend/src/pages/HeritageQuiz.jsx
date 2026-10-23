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
    Target
} from 'lucide-react';
import quizService from '../services/quiz.service';
import literatureService from '../services/literature.service';

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
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]); // [{ questionId, selectedIndex }]
    const [currentSelection, setCurrentSelection] = useState(null);
    const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedWorkModal, setSelectedWorkModal] = useState(null);
    const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'wrong' | 'correct'

    // Bắt đầu lượt thi mới
    const startQuiz = async (
        category = selectedCategory,
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
            const data = await quizService.getQuestions({
                category,
                count,
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
        startQuiz('all', 5, 'all');
    }, []);

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
                });
                setQuizResult(result);
            } catch (err) {
                console.error('Lỗi nộp bài quiz:', err);
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Xem chi tiết tác phẩm liên quan nếu người dùng bấm vào
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
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-vietnam">
            <div className="max-w-4xl mx-auto space-y-7">
                
                {/* Header Banner */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-300/80 shadow-xs">
                        <Trophy className="w-4 h-4 text-amber-800" />
                        <span>Thử Tài Di Sản — Trí Tuệ Dân Gian</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-heritage">
                        Đố Vui Tri Thức & Văn Học Dân Gian
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Thử thách vốn hiểu biết về các biểu tượng thần thoại, tích truyện cổ tích, lòng yêu nước trong văn học trung đại và đạo lý ca dao tục ngữ Việt Nam.
                    </p>
                </div>

                {/* Filter Controls (Thể loại, Độ khó, Số câu) */}
                {!quizResult && (
                    <div className="bg-[#fffdf9]/95 rounded-2xl p-4 sm:p-5 border border-amber-900/15 shadow-sm space-y-4 relative">
                        {/* Góc trang trí hoa văn */}
                        <span className="absolute -top-1 -left-1 text-amber-600 text-xs font-bold select-none">❖</span>
                        <span className="absolute -top-1 -right-1 text-amber-600 text-xs font-bold select-none">❖</span>

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
                                            startQuiz(cat.id, questionCount, selectedDifficulty);
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
                                            startQuiz(selectedCategory, questionCount, diff.id);
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
                                                startQuiz(selectedCategory, num, selectedDifficulty);
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
                                    onClick={() => startQuiz(selectedCategory, questionCount, selectedDifficulty)}
                                    title="Xáo trộn đề bài mới"
                                    className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-amber-100/70 rounded-lg transition"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="bg-[#fffdf9] rounded-3xl p-16 text-center border border-amber-900/15 shadow-sm space-y-4">
                        <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-stone-700 font-heritage">
                            Đang tuyển chọn đề thi Di sản từ kho tàng văn hóa...
                        </p>
                    </div>
                )}

                {/* GAME SCREEN */}
                {!loading && !quizResult && currentQuestion && (
                    <div className="bg-[#fffdf9] rounded-3xl border border-amber-900/15 shadow-md p-6 sm:p-10 space-y-6 animate-in fade-in duration-200 relative">
                        <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>

                        {/* Progress Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-amber-200/60">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Câu {currentIndex + 1} / {questions.length}
                                </span>
                                <span className="text-xs text-stone-500 font-medium">
                                    • {currentQuestion.categoryName}
                                </span>
                                {currentQuestion.difficulty && (
                                    <span className="text-[10px] uppercase font-bold text-stone-400 px-2 py-0.5 rounded bg-stone-100">
                                        {currentQuestion.difficulty === 'de' ? 'Dễ' : currentQuestion.difficulty === 'kho' ? 'Khó' : 'Vừa'}
                                    </span>
                                )}
                            </div>
                            <div className="w-32 sm:w-44 h-2 bg-stone-200/80 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-700 via-amber-600 to-yellow-500 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                            <h2 className="text-lg sm:text-2xl font-bold text-stone-900 font-heritage leading-relaxed">
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

                {/* RESULTS SCREEN */}
                {quizResult && (
                    <div className="bg-[#fffdf9] rounded-3xl border border-amber-900/15 shadow-xl p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200 relative">
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

                            {/* Actions */}
                            <div className="pt-3 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => startQuiz(selectedCategory, questionCount, selectedDifficulty)}
                                    className="px-5 py-2.5 bg-red-900 hover:bg-red-800 text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Làm đề mới</span>
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
                        <div className="pt-6 border-t border-amber-200 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-heritage flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-700" />
                                    <span>Phân tích & Giải nghĩa Chi tiết từng câu:</span>
                                </h3>

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
                                            <div className="bg-white/90 rounded-xl p-3 border border-stone-200/80 text-stone-700 text-xs leading-relaxed">
                                                <p className="font-semibold text-stone-900 mb-1">
                                                    Ý nghĩa văn hóa & Đạo lý:
                                                </p>
                                                <p>{item.explanation}</p>
                                                {item.relatedWorkSlug && (
                                                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                                                        <button
                                                            onClick={() => handleOpenRelatedWork(item.relatedWorkSlug)}
                                                            className="text-amber-900 hover:text-red-900 font-bold text-[11px] flex items-center gap-1"
                                                        >
                                                            <BookOpen className="w-3 h-3 text-amber-700" />
                                                            <span>Xem tác phẩm liên quan</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                            <blockquote className="border-l-4 border-amber-600 bg-amber-50/50 p-3 italic text-xs text-stone-700 rounded-r-xl">
                                &quot;{selectedWorkModal.quote}&quot;
                            </blockquote>
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
