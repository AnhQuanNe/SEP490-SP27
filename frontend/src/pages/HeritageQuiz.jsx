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
    Compass
} from 'lucide-react';
import quizService from '../services/quiz.service';
import literatureService from '../services/literature.service';

const CATEGORIES = [
    { id: 'all', name: 'Toàn bộ Thể loại' },
    { id: 'co-tich', name: 'Truyện cổ tích' },
    { id: 'truyen-thuyet', name: 'Truyền thuyết' },
    { id: 'than-thoai', name: 'Thần thoại' },
    { id: 'ca-dao', name: 'Ca dao - Tục ngữ' },
    { id: 'trung-dai', name: 'Văn học Trung đại' },
];

const HeritageQuiz = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
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

    // Bắt đầu lượt thi mới
    const startQuiz = async (category = selectedCategory, count = questionCount) => {
        setLoading(true);
        setQuizResult(null);
        setCurrentIndex(0);
        setUserAnswers([]);
        setCurrentSelection(null);
        setHasAnsweredCurrent(false);

        try {
            const data = await quizService.getQuestions({
                category,
                count,
            });
            setQuestions(data);
        } catch (err) {
            console.error('Lỗi khi tải câu hỏi quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        startQuiz('all', 5);
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

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200">
                        <Trophy className="w-4 h-4 text-amber-700" />
                        <span>Thử Tài Di Sản — Trí Tuệ Dân Gian (UC10)</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heritage">
                        Đố Vui Tri Thức & Văn Học Dân Gian
                    </h1>
                    <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Thử thách vốn hiểu biết về các biểu tượng thần thoại, tích truyện cổ tích, lòng yêu nước trong văn học trung đại và đạo lý ca dao tục ngữ Việt Nam.
                    </p>
                </div>

                {/* Filter controls */}
                {!quizResult && (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        startQuiz(cat.id, questionCount);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                        selectedCategory === cat.id
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <span className="text-xs text-slate-500 font-medium">Số câu:</span>
                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                {[5, 10].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            setQuestionCount(num);
                                            startQuiz(selectedCategory, num);
                                        }}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                                            questionCount === num
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        {num} câu
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => startQuiz(selectedCategory, questionCount)}
                                title="Đổi đề bài khác"
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
                        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-slate-700">Đang chuẩn bị đề thi Di sản...</p>
                    </div>
                )}

                {/* GAME SCREEN */}
                {!loading && !quizResult && currentQuestion && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 animate-in fade-in duration-200">
                        {/* Progress Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    Câu {currentIndex + 1} / {questions.length}
                                </span>
                                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                                    • {currentQuestion.categoryName}
                                </span>
                            </div>
                            <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heritage leading-relaxed">
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
                                        className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-start gap-3 ${
                                            isSelected
                                                ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition ${
                                                isSelected
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {String.fromCharCode(65 + optIdx)}
                                        </div>
                                        <span className="leading-relaxed">{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Bar */}
                        <div className="pt-4 flex items-center justify-between">
                            {currentQuestion.relatedWork && (
                                <button
                                    onClick={() => handleOpenRelatedWork(currentQuestion.relatedWork.slug)}
                                    className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1.5 transition"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Đọc tác phẩm: {currentQuestion.relatedWork.title}</span>
                                </button>
                            )}

                            <div className="ml-auto flex items-center gap-3">
                                {!hasAnsweredCurrent ? (
                                    <button
                                        onClick={handleConfirmAnswer}
                                        disabled={currentSelection === null}
                                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition shadow-sm"
                                    >
                                        Xác nhận câu trả lời
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Đang chấm điểm...</span>
                                            </>
                                        ) : currentIndex === questions.length - 1 ? (
                                            <>
                                                <span>Xem kết quả & Danh hiệu</span>
                                                <Trophy className="w-4 h-4" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Câu tiếp theo</span>
                                                <ArrowRight className="w-4 h-4" />
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
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200">
                        {/* Hero Score Badge */}
                        <div className="text-center space-y-4 max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/25 ring-8 ring-amber-50">
                                <Crown className="w-12 h-12 text-slate-950" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                    Danh hiệu đạt được
                                </span>
                                <h2 className="text-3xl font-extrabold text-slate-900 font-heritage">
                                    {quizResult.badge.title}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    {quizResult.badge.description}
                                </p>
                            </div>

                            {/* Score Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-3">
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <p className="text-2xl font-extrabold text-slate-900 font-heritage">
                                        {quizResult.score} / 100
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium">Điểm số tổng kết</p>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <p className="text-2xl font-extrabold text-emerald-600 font-heritage">
                                        {quizResult.correctCount} / {quizResult.totalQuestions}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium">Số câu trả lời đúng</p>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => startQuiz(selectedCategory, questionCount)}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Thử thách lượt mới</span>
                                </button>
                                <Link
                                    to="/kham-pha"
                                    className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                >
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>Khám phá thêm</span>
                                </Link>
                            </div>
                        </div>

                        {/* Detailed Question Review */}
                        <div className="pt-6 border-t border-slate-200 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 font-heritage flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                <span>Phân tích & Giải nghĩa Chi tiết từng câu:</span>
                            </h3>

                            <div className="space-y-4">
                                {quizResult.details.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-5 rounded-2xl border transition ${
                                            item.isCorrect
                                                ? 'bg-emerald-50/50 border-emerald-200'
                                                : 'bg-rose-50/40 border-rose-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-700">
                                                        Câu {idx + 1}:
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 font-medium">
                                                        ({item.categoryName})
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 leading-snug">
                                                    {item.question}
                                                </p>
                                            </div>
                                            {item.isCorrect ? (
                                                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs flex-shrink-0">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>Chính xác</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-rose-600 font-bold text-xs flex-shrink-0">
                                                    <XCircle className="w-5 h-5" />
                                                    <span>Chưa đúng</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-slate-700">
                                                <span>Bạn đã chọn: <strong className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{item.userAnswer}</strong></span>
                                                {!item.isCorrect && (
                                                    <span className="text-slate-400 hidden sm:inline">•</span>
                                                )}
                                                {!item.isCorrect && (
                                                    <span>Đáp án đúng: <strong className="text-emerald-700">{item.correctAnswer}</strong></span>
                                                )}
                                            </div>

                                            {/* Explanation */}
                                            <div className="bg-white/80 rounded-xl p-3 border border-slate-200 text-slate-600 text-xs leading-relaxed">
                                                <p className="font-semibold text-slate-900 mb-1">
                                                    Ý nghĩa văn hóa & Đạo lý:
                                                </p>
                                                <p>{item.explanation}</p>
                                                {item.relatedWorkSlug && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                                                        <button
                                                            onClick={() => handleOpenRelatedWork(item.relatedWorkSlug)}
                                                            className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-1"
                                                        >
                                                            <BookOpen className="w-3 h-3" />
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
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                                    {selectedWorkModal.categoryName}
                                </span>
                                <h3 className="text-2xl font-bold font-heritage text-slate-900 mt-2">
                                    {selectedWorkModal.title}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {selectedWorkModal.region} • {selectedWorkModal.period}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedWorkModal(null)}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {selectedWorkModal.quote && (
                            <blockquote className="border-l-4 border-amber-600 bg-amber-50/50 p-3 italic text-xs text-slate-700 rounded-r-xl">
                                &quot;{selectedWorkModal.quote}&quot;
                            </blockquote>
                        )}

                        <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                            <h4 className="font-bold text-slate-900">Tóm tắt tác phẩm:</h4>
                            <p>{selectedWorkModal.summary}</p>
                        </div>

                        {selectedWorkModal.thematicMeaning && (
                            <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                                <h4 className="font-bold text-slate-900">Ý nghĩa chủ đề & Biểu tượng:</h4>
                                <p>{selectedWorkModal.thematicMeaning}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Nguồn kiểm chứng: <strong>{selectedWorkModal.source}</strong></span>
                            <button
                                onClick={() => setSelectedWorkModal(null)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold"
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
