import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import DragonPhoenixHeritage from '../../components/common/DragonPhoenixHeritage';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Loader2, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const tokenFromQuery = searchParams.get('token') || '';
    const emailFromQuery = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromQuery);
    const [token, setToken] = useState(tokenFromQuery);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (!token || !email) {
            setError('Thiếu mã Token hoặc Email đặt lại mật khẩu');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword({
                email,
                token,
                newPassword,
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.');
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
                        Mật Khẩu Mới
                    </h2>
                    <p className="text-sm text-stone-600 font-vietnam max-w-sm mx-auto leading-relaxed">
                        Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn
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
                        <span className="font-medium leading-relaxed">
                            Đặt lại mật khẩu thành công! Đang chuyển hướng về trang Đăng nhập...
                        </span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 font-vietnam">
                            Mật khẩu mới
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700/80 group-focus-within:text-amber-800 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Tối thiểu 6 ký tự"
                                className="block w-full pl-11 pr-11 py-3 bg-[#faf6ed] border border-amber-300/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium text-stone-900 placeholder:text-stone-400 transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-amber-800/60 hover:text-amber-950 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 font-vietnam">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700/80 group-focus-within:text-amber-800 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                className="block w-full pl-11 pr-11 py-3 bg-[#faf6ed] border border-amber-300/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium text-stone-900 placeholder:text-stone-400 transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-amber-800/60 hover:text-amber-950 transition-colors focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
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
                                <span>Đang lưu mật khẩu...</span>
                            </>
                        ) : (
                            <>
                                <span>Cập Nhật Mật Khẩu</span>
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
                        <span>Quay lại trang Đăng nhập</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
