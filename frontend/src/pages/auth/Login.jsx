import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
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

    const from = location.state?.from?.pathname || '/';

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
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute -bottom-10 right-10 w-72 h-72 bg-purple-300/15 rounded-full blur-2xl pointer-events-none -z-10"></div>

            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/60 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
                {/* Top decorative gradient line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 absolute top-0 left-0"></div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chào mừng trở lại</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng Nhập</h2>
                    <p className="text-sm text-gray-500">
                        Nhập thông tin tài khoản để tiếp tục
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Địa chỉ Email
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Mật khẩu
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2"
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
                    <div className="flex-grow border-t border-gray-200/80"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Hoặc tiếp tục với
                    </span>
                    <div className="flex-grow border-t border-gray-200/80"></div>
                </div>

                {/* Google Sign-In */}
                <div className="transition-transform hover:scale-[1.01] duration-150">
                    <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={(err) => setError(err.message)} />
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                    Chưa có tài khoản?{' '}
                    <Link
                        to="/register"
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
