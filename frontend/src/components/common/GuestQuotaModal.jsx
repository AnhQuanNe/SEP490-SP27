import { Link } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, X, CheckCircle2, Bot } from 'lucide-react';

const GuestQuotaModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-indigo-950/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition"
                    title="Đóng"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Decorative Glowing Element */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Icon Header */}
                <div className="flex items-center justify-center mb-5">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                            <Bot className="w-8 h-8 text-slate-950" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 p-1 bg-rose-500 text-white rounded-full ring-2 ring-slate-900">
                            <Lock className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>

                {/* Title & Message */}
                <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300 font-heritage tracking-tight">
                        {title || 'Đã Hết Lượt Trải Nghiệm AI'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-vietnam">
                        {message ||
                            'Bạn đã sử dụng hết 5 lượt trải nghiệm AI miễn phí hôm nay. Hãy đăng ký hoặc đăng nhập tài khoản để tiếp tục khám phá không giới hạn!'}
                    </p>
                </div>

                {/* Privileges of Registered Users */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 space-y-2.5 text-xs sm:text-sm text-slate-200">
                    <p className="font-semibold text-amber-200 font-heritage flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Đặc quyền tài khoản Thành viên:
                    </p>
                    <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>Trò chuyện và hỏi đáp AI không giới hạn</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>Tìm kiếm theo ý nghĩa bằng ngôn ngữ tự nhiên</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>Lưu tác phẩm yêu thích & tra cứu lịch sử</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                    <Link
                        to="/register"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span>Đăng ký tài khoản miễn phí</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                        to="/login"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-slate-700 transition"
                    >
                        <span>Đã có tài khoản? Đăng nhập ngay</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GuestQuotaModal;
