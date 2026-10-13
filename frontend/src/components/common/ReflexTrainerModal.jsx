import { useState } from 'react';
import {
    Sparkles,
    X,
    CheckCircle2,
    XCircle,
    Flame,
    Award,
    RotateCcw,
    Volume2,
    ArrowRight
} from 'lucide-react';

const quizQuestions = [
    {
        id: 1,
        question: 'Cử chỉ nào dùng đầu các ngón tay chạm nhẹ vào cằm rồi đưa ra phía người đối diện?',
        options: ['Xin chào', 'Cảm ơn', 'Tạm biệt', 'Xin lỗi'],
        correctIndex: 1,
        hint: 'Biểu thị lòng biết ơn chân thành.',
        speechText: 'Cảm ơn bạn rất nhiều!'
    },
    {
        id: 2,
        question: 'Cử chỉ xòe ngón cái, ngón trỏ và ngón út (gập 2 ngón giữa lại) biểu thị điều gì?',
        options: ['Tôi đói', 'Tôi yêu bạn (ILY)', 'Cần giúp đỡ', 'Uống nước'],
        correctIndex: 1,
        hint: 'Ký hiệu quốc tế và Việt Nam rất phổ biến.',
        speechText: 'Tôi yêu bạn!'
    },
    {
        id: 3,
        question: 'Khi muốn chào hỏi thân thiện, bàn tay mở úp nhẹ lên gần thái dương rồi vẫy nhẹ hướng ra phía trước là cử chỉ gì?',
        options: ['Xin chào', 'Hẹn gặp lại', 'Chúc mừng', 'Ăn cơm'],
        correctIndex: 0,
        hint: 'Cử chỉ cơ bản nhất khi gặp gỡ người khiếm thính.',
        speechText: 'Xin chào!'
    },
    {
        id: 4,
        question: 'Bàn tay trái xòe ngửa làm bệ đỡ, bàn tay phải nắm ngón cái dựng đứng đặt lên rồi nâng cùng lúc là ký hiệu gì?',
        options: ['Đồng ý', 'Từ chối', 'Cần giúp đỡ (Help)', 'Học bài'],
        correctIndex: 2,
        hint: 'Dùng trong các tình huống khẩn cấp hoặc cần hỗ trợ.',
        speechText: 'Tôi cần giúp đỡ!'
    }
];

const ReflexTrainerModal = ({ isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completed, setCompleted] = useState(false);

    if (!isOpen) return null;

    const currentQ = quizQuestions[currentIndex];

    const handleSelect = (idx) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);

        const isCorrect = idx === currentQ.correctIndex;
        if (isCorrect) {
            setScore((prev) => prev + 25);
            setStreak((prev) => prev + 1);
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(currentQ.speechText);
                utterance.lang = 'vi-VN';
                window.speechSynthesis.speak(utterance);
            }
        } else {
            setStreak(0);
        }
    };

    const handleNext = () => {
        if (currentIndex < quizQuestions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setCompleted(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setStreak(0);
        setCompleted(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-white to-amber-50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                                Luyện Phản Xạ Nhanh Ký Hiệu
                            </h3>
                            <p className="text-[11px] text-slate-500 font-semibold">
                                Gamified Flashcard Reflex Mode
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{streak}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {!completed ? (
                    <div className="p-5 sm:p-6 space-y-5">
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Câu hỏi {currentIndex + 1} / {quizQuestions.length}</span>
                                <span className="text-rose-600">{score} XP</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                                {currentQ.question}
                            </p>
                            <p className="text-xs text-slate-400 mt-2 font-medium italic">
                                Gợi ý: {currentQ.hint}
                            </p>
                        </div>

                        {/* Multiple Choice Options */}
                        <div className="space-y-2.5">
                            {currentQ.options.map((opt, idx) => {
                                let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
                                if (isAnswered) {
                                    if (idx === currentQ.correctIndex) {
                                        btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25';
                                    } else if (idx === selectedOption) {
                                        btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25';
                                    } else {
                                        btnStyle = 'bg-slate-100 text-slate-400 border-transparent opacity-60';
                                    }
                                }

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect(idx)}
                                        disabled={isAnswered}
                                        className={`w-full p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center text-xs">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span>{opt}</span>
                                        </div>

                                        {isAnswered && idx === currentQ.correctIndex && (
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        )}
                                        {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                                            <XCircle className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Action Button */}
                        {isAnswered && (
                            <button
                                onClick={handleNext}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:opacity-95 text-white font-bold text-sm shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition animate-in fade-in"
                            >
                                <span>{currentIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    /* Final Result View */
                    <div className="p-6 text-center space-y-5">
                        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                            <Award className="w-8 h-8" />
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Phản Xạ!</h4>
                            <p className="text-xs text-slate-500">
                                Bạn đã ghi nhớ xuất sắc các cử chỉ cơ bản của HeartSign
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <span className="text-2xl font-black text-rose-600">+{score}</span>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">Điểm XP</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <span className="text-2xl font-black text-amber-500">{streak}</span>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">Streak Max</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleRestart}
                                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Luyện tập lại</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-rose-500/25"
                            >
                                Hoàn tất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReflexTrainerModal;
