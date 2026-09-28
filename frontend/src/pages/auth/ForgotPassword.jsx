import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import { Mail, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await authService.forgotPassword(email);
            setSuccess(
                res.data?.message ||
                'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.'
            );
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-400/15 via-indigo-300/15 to-blue-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/60 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
                {/* Top decorative gradient line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 absolute top-0 left-0"></div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-amber-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white mb-4 animate-in zoom-in-50 duration-300">
                        <KeyRound className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quên Mật Khẩu</h2>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Nhập địa chỉ email đăng ký để nhận liên kết khôi phục mật khẩu.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-800 text-sm animate-in fade-in duration-200">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                        <div>
                            <p className="font-bold">Đã gửi hướng dẫn!</p>
                            <p className="mt-1 text-xs text-emerald-700 leading-relaxed">{success}</p>
                            <p className="mt-2 text-[11px] text-emerald-600 font-medium">
                                (Mẹo dev: Bạn cũng có thể kiểm tra console backend để lấy link trực tiếp)
                            </p>
                        </div>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Địa chỉ Email của bạn
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang gửi yêu cầu...</span>
                            </>
                        ) : (
                            <>
                                <span>Gửi Liên Kết Đặt Lại</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-6 mt-6 border-t border-gray-100">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
