import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import DragonPhoenixHeritage from '../../components/common/DragonPhoenixHeritage';
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
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#240606] via-[#160404] to-[#0e0202]">
            {/* 1. Rồng Bay Phượng Múa & Họa tiết Di sản nền */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <DragonPhoenixHeritage variant="hero" />
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute -bottom-10 right-10 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* 2. Form Card mang phong cách Chiếu Thư & Cung Đình */}
            <div className="relative z-10 max-w-md w-full bg-[#fffdf9]/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-950/70 border-2 border-amber-600/40 p-8 sm:p-10 overflow-hidden transition-all duration-300">
                {/* 4 họa tiết góc truyền thống ❖ */}
                <span className="absolute -top-1.5 -left-1.5 text-amber-600 text-sm font-bold select-none">❖</span>
                <span className="absolute -top-1.5 -right-1.5 text-amber-600 text-sm font-bold select-none">❖</span>
                <span className="absolute -bottom-1.5 -left-1.5 text-amber-600 text-sm font-bold select-none">❖</span>
                <span className="absolute -bottom-1.5 -right-1.5 text-amber-600 text-sm font-bold select-none">❖</span>

                {/* Dải vân màu hoàng cung trên đỉnh thẻ */}
                <div className="h-1.5 w-full bg-gradient-to-r from-red-800 via-amber-500 to-red-800 absolute top-0 left-0"></div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-[#991b1b] to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-950/40 border border-amber-400/50 text-[#fef3c7] mb-4 animate-in zoom-in-50 duration-300">
                        <KeyRound className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-heritage">
                        Quên Mật Khẩu
                    </h2>
                    <p className="text-sm text-stone-600 font-vietnam max-w-sm mx-auto leading-relaxed">
                        Nhập địa chỉ email đăng ký để nhận liên kết khôi phục mật khẩu bảo mật
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-800 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-900 text-sm animate-in fade-in duration-200">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                        <span className="font-medium leading-relaxed">{success}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 font-vietnam">
                            Địa chỉ Email đã đăng ký
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700/80 group-focus-within:text-amber-800 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                    setSuccess('');
                                }}
                                placeholder="name@example.com"
                                className="block w-full pl-11 pr-4 py-3 bg-[#faf6ed] border border-amber-300/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium text-stone-900 placeholder:text-stone-400 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-5 rounded-2xl font-bold text-sm text-[#fef3c7] bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#b45309] hover:from-[#b91c1c] hover:to-[#d97706] border border-amber-400/50 shadow-lg shadow-red-950/40 hover:shadow-red-950/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang xử lý yêu cầu...</span>
                            </>
                        ) : (
                            <>
                                <span>Gửi Hướng Dẫn Khôi Phục</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Back to login */}
                <div className="text-center mt-6 pt-4 border-t border-amber-900/10">
                    <Link
                        to="/login"
                        className="inline-flex items-center space-x-1.5 text-sm font-bold text-red-800 hover:text-amber-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại Đăng nhập</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
