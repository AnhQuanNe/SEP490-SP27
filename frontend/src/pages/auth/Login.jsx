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
            const data = await login(formData);
            // Nếu là Admin thì tự động đưa thẳng vào Cổng Quản Trị
            if (data?.user?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
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
            const data = await loginWithGoogle(idToken);
            if (data?.user?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Đăng nhập Google không thành công');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#faf7f0]">
            
            <div className="absolute -bottom-10 right-10 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* 2. Form Card mang phong cách Chiếu Thư & Cung Đình */}
            <div className="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-xs border border-stone-200 p-8 sm:p-9">
                {/* 4 họa tiết góc truyền thống ❖ */}
                                                                
                {/* Dải vân màu hoàng cung trên đỉnh thẻ */}
                
                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    
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
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-vietnam">
                            Địa chỉ Email
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-stone-800 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="block w-full pl-11 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-base font-normal text-stone-900 placeholder:text-stone-400 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider font-vietnam">
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
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-stone-800 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="block w-full pl-11 pr-11 py-2.5 bg-white border border-stone-300 rounded-xl focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-base font-normal text-stone-900 placeholder:text-stone-400 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-800 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-5 rounded-xl font-semibold text-sm text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:pointer-events-none transition flex items-center justify-center space-x-2 cursor-pointer"
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
