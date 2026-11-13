import { useState, useEffect, useCallback } from 'react';
import { artifactService } from '../../services/artifact.service';
import { 
    Sparkles, 
    CheckCircle2, 
    XCircle, 
    RotateCcw, 
    Award, 
    HelpCircle, 
    RefreshCw, 
    ChevronRight, 
    Bot,
    Check,
    Lightbulb
} from 'lucide-react';

/**
 * ExhibitionQuizTab - Thử Thách Nhanh Trắc Nghiệm Bảo Vật do Google Gemini AI Real-time thiết kế
 * Khảo sát 3 câu hỏi trắc nghiệm khách quan chuẩn SGK với phản hồi đúng/sai tức thì và lời giải học thuật.
 */
const ExhibitionQuizTab = ({ selectedArtifact, onOpenAiChat }) => {
    const [quizData, setQuizData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    // Nạp hoặc yêu cầu Gemini AI sinh bộ câu hỏi mới cho bảo vật
    const fetchQuiz = useCallback(async (artifact, isForceRefresh = false) => {
        if (!artifact) return;
        try {
            setIsLoading(true);
            setCurrentIndex(0);
            setSelectedAnswers({});
            setIsCompleted(false);

            const res = await artifactService.generateQuizWithAI(artifact, {
                isRefresh: isForceRefresh,
                timestamp: Date.now()
            });
            if (res && res.questions && Array.isArray(res.questions)) {
                setQuizData(res);
            }
        } catch (error) {
            console.warn('Lỗi gọi API AI Quiz, sử dụng bộ câu hỏi cục bộ:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Tự động tải câu hỏi khi đổi bảo vật
    useEffect(() => {
        fetchQuiz(selectedArtifact);
    }, [selectedArtifact?.slug, fetchQuiz]);

    const questions = quizData?.questions || [];
    const currentQ = questions[currentIndex];
    const userChoice = currentQ ? selectedAnswers[currentQ.id] : null;
    const isAnswered = Boolean(userChoice);

    // Tính điểm tổng kết
    const calculateScore = () => {
        if (!questions.length) return 0;
        return questions.reduce((acc, q) => {
            const ans = selectedAnswers[q.id];
            return ans && ans === q.correctAnswer ? acc + 1 : acc;
        }, 0);
    };

    const handleSelectOption = (optChar) => {
        if (isAnswered || !currentQ) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQ.id]: optChar,
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsCompleted(true);
        }
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setCurrentIndex(0);
        setIsCompleted(false);
    };

    const handleRefreshAi = () => {
        fetchQuiz(selectedArtifact, true);
    };

    if (isLoading) {
        return (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                <div className="relative">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <Sparkles className="w-8 h-8 text-amber-400 animate-spin-slow" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 animate-ping" />
                </div>
                <div className="space-y-1.5">
                    <p className="text-sm font-bold text-amber-100 font-heritage tracking-wide">
                        Trợ lý AI đang khảo cứu bảo vật...
                    </p>
                    <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                        Phân tích trích đoạn SGK & 4 tầng nghĩa để thiết kế 3 câu đố trắc nghiệm độc bản.
                    </p>
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="p-6 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-stone-500 mx-auto" />
                <p className="text-xs text-stone-300">Chưa tải được câu hỏi khảo cứu cho bảo vật này.</p>
                <button
                    type="button"
                    onClick={handleRefreshAi}
                    className="px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
                >
                    Tải lại câu hỏi
                </button>
            </div>
        );
    }

    // MÀN HÌNH TỔNG KẾT (KHI ĐÃ HOÀN THÀNH 3 CÂU HỎI)
    if (isCompleted) {
        const score = calculateScore();
        const total = questions.length;
        const isPerfect = score === total;

        let badgeTitle = 'Học Giả Yêu Văn Hóa';
        let badgeColor = 'text-amber-300 border-amber-500/40 bg-amber-500/10';
        if (isPerfect) {
            badgeTitle = 'Bậc Thầy Khảo Cứu Di Sản';
            badgeColor = 'text-amber-300 border-amber-400 bg-gradient-to-r from-amber-500/20 to-red-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
        } else if (score >= 2) {
            badgeTitle = 'Nhà Nghiên Cứu Tiềm Năng';
            badgeColor = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
        }

        return (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                {/* Khung kết quả vinh danh */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-[#22170f] to-[#140e09] border border-amber-500/40 text-center space-y-3 relative overflow-hidden shadow-2xl">
                    <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                        <Award className="w-9 h-9" />
                    </div>

                    <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeColor}`}>
                            {badgeTitle}
                        </span>
                        <h3 className="text-xl font-bold text-amber-100 font-heritage mt-2">
                            Hoàn Thành Thử Thách Bảo Vật
                        </h3>
                        <p className="text-xs text-amber-200/80 mt-1">
                            {selectedArtifact.name}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-2xl font-black text-amber-300 font-mono">
                        <span>{score}</span>
                        <span className="text-stone-500">/</span>
                        <span>{total}</span>
                        <span className="text-xs text-stone-400 font-sans font-normal ml-1">câu chính xác</span>
                    </div>

                    <p className="text-xs text-stone-300 italic font-serif max-w-sm mx-auto leading-relaxed">
                        {isPerfect 
                            ? 'Xuất sắc! Bạn đã thấu suốt cả 4 tầng nghĩa và chi tiết lịch sử kinh điển của bảo vật.' 
                            : 'Rất đáng khen! Bạn đã bước đầu nắm được tinh thần cốt lõi của tác phẩm trong SGK.'}
                    </p>
                </div>

                {/* Các nút hành động */}
                <div className="space-y-2.5">
                    <button
                        type="button"
                        onClick={handleRefreshAi}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Nhờ AI tạo bộ 3 câu hỏi mới</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="py-2 px-3 rounded-xl bg-[#1f150e] hover:bg-[#2a1d13] text-stone-300 hover:text-amber-200 border border-amber-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                            <span>Làm lại bộ đề này</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onOpenAiChat?.(
                                selectedArtifact,
                                `Tôi vừa làm xong bài trắc nghiệm về bảo vật "${selectedArtifact.name}" được ${score}/${total} điểm. Hãy phân tích sâu hơn cho tôi những điểm cần lưu ý khi học tác phẩm này.`
                            )}
                            className="py-2 px-3 rounded-xl bg-[#1f150e] hover:bg-[#2a1d13] text-stone-300 hover:text-amber-200 border border-amber-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            <span>Đàm đạo với Gia sư AI</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // MÀN HÌNH TỪNG CÂU HỎI ĐANG TRẢ LỜI
    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header câu hỏi: Tiến trình & Nguồn AI */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                        Câu {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="text-[11px] text-stone-400 hidden sm:inline">
                        {currentIndex === 0 ? 'Khảo cứu SGK' : currentIndex === 1 ? 'Nghĩa biểu tượng' : 'Triết lý dân gian'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-950/60 text-red-300 border border-red-500/30">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                        <span>{quizData.source === 'ai-real' || quizData.source === 'gemini-real-100%' ? 'Trợ lý AI' : 'Học thuật SGK'}</span>
                    </span>
                    <button
                        type="button"
                        onClick={handleRefreshAi}
                        title="Đổi bộ câu hỏi khác từ AI"
                        className="p-1 rounded-md text-stone-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Nội dung câu hỏi */}
            <div className="p-4 rounded-2xl bg-[#1d140d]/90 border border-amber-500/30 shadow-md">
                <p className="text-xs sm:text-sm font-semibold text-amber-100 font-serif leading-relaxed">
                    {currentQ.question}
                </p>
            </div>

            {/* 4 Lựa chọn A, B, C, D */}
            <div className="space-y-2">
                {currentQ.options.map((optionStr, optIdx) => {
                    const char = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'
                    const isSelected = userChoice === char;
                    const isCorrect = currentQ.correctAnswer === char;

                    let btnStyle = 'bg-[#150f0a]/90 border-amber-900/30 text-stone-300 hover:border-amber-500/50 hover:bg-[#221811]';

                    if (isAnswered) {
                        if (isCorrect) {
                            btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-1 ring-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                        } else if (isSelected) {
                            btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-400/50';
                        } else {
                            btnStyle = 'bg-[#150f0a]/50 border-stone-800 text-stone-500 opacity-60';
                        }
                    }

                    return (
                        <button
                            key={char}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(char)}
                            className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle} ${
                                !isAnswered ? 'hover:scale-[1.008]' : ''
                            }`}
                        >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 ${
                                isAnswered && isCorrect 
                                    ? 'bg-emerald-500 text-stone-950'
                                    : isAnswered && isSelected 
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                                {isAnswered && isCorrect ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : isAnswered && isSelected ? (
                                    <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                    char
                                )}
                            </span>

                            <span className="flex-1 font-serif leading-relaxed">
                                {optionStr.replace(/^[A-D]\.\s*/, '')}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Lời giải thích khi đã chọn đáp án */}
            {isAnswered && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lời giải thích chuẩn SGK:</span>
                    </div>
                    <p className="text-xs text-amber-100/90 font-serif leading-relaxed italic">
                        {currentQ.explanation}
                    </p>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md hover:scale-[1.01]"
                    >
                        <span>{currentIndex < questions.length - 1 ? 'Sang câu tiếp theo' : 'Xem tổng kết kết quả'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExhibitionQuizTab;

