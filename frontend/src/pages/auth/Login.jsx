import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
import DragonPhoenixHeritage from '../../components/common/DragonPhoenixHeritage';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : '/');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData);
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Lỗi login:', err);
            if (err.data?.needVerification) {
                navigate(`/verify-email?email=${encodeURIComponent(err.data.email || formData.email)}&needVerify=true`);
                return;
            }
            setError(err.message || 'Đăng nhập không thành công');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (idToken) => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(idToken);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Đăng nhập Google không thành công');
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
                    <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#450a0a]/80 text-[#fcd34d] text-xs font-semibold border border-amber-500/50 shadow-md shadow-red-950/40 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>❖ RỒNG BAY THĂNG LONG • KHỞI ĐẦU TRI THỨC ❖</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-heritage">
                        Đăng Nhập
                    </h2>
                    <p className="text-sm text-stone-600 font-vietnam">
                        Tiếp tục hành trình khám phá di sản văn hóa cùng AI
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-800 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                <form className="space-y-4.5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 font-vietnam">
                            Địa chỉ Email
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700/80 group-focus-within:text-amber-800 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="block w-full pl-11 pr-4 py-3 bg-[#faf6ed] border border-amber-300/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium text-stone-900 placeholder:text-stone-400 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider font-vietnam">
                                Mật khẩu
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-xs font-semibold text-amber-800 hover:text-red-800 hover:underline transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700/80 group-focus-within:text-amber-800 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-5 rounded-2xl font-bold text-sm text-[#fef3c7] bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#b45309] hover:from-[#b91c1c] hover:to-[#d97706] border border-amber-400/50 shadow-lg shadow-red-950/40 hover:shadow-red-950/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang xác thực...</span>
                            </>
                        ) : (
                            <>
                                <span>Đăng Nhập</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-amber-900/15"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Hoặc tiếp tục với
                    </span>
                    <div className="flex-grow border-t border-amber-900/15"></div>
                </div>

                {/* Google Sign-In */}
                <div className="transition-transform hover:scale-[1.01] duration-150">
                    <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={(err) => setError(err.message)} />
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-stone-600 mt-6 pt-4 border-t border-amber-900/10">
                    Chưa có tài khoản?{' '}
                    <Link
                        to="/register"
                        className="font-bold text-red-800 hover:text-amber-800 hover:underline transition-colors"
                    >
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
