import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
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

    const isMatch = confirmPassword && newPassword === confirmPassword;

    return (
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/60 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
                {/* Top decorative gradient line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 absolute top-0 left-0"></div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white mb-4 animate-in zoom-in-50 duration-300">
                        <Lock className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đặt Lại Mật Khẩu</h2>
                    <p className="text-sm text-gray-500">
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="text-center space-y-5 py-4">
                        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-emerald-800 animate-in zoom-in-95 duration-200">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
                            <p className="font-bold text-lg">Đặt lại mật khẩu thành công!</p>
                            <p className="text-xs text-emerald-600 mt-1">Đang tự động chuyển bạn về trang Đăng nhập...</p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full py-3 px-5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Token xác thực
                            </label>
                            <input
                                type="text"
                                required
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Dán mã token từ link email"
                                className="block w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-xs font-mono font-medium transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="block w-full pl-11 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="block w-full pl-11 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center space-x-1">
                                    {isMatch && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1 animate-in zoom-in-50 duration-200" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Đang cập nhật mật khẩu...</span>
                                </>
                            ) : (
                                <>
                                    <span>Xác Nhận Đổi Mật Khẩu</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
