import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Loader2,
    ArrowRight,
    Shield
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Tính toán độ mạnh mật khẩu (Password Strength)
    const calculateStrength = (pass) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const passwordStrength = calculateStrength(formData.password);

    const getStrengthLabel = (score) => {
        switch (score) {
            case 1:
                return { text: 'Yếu', color: 'bg-rose-500', width: 'w-1/4', textColor: 'text-rose-600' };
            case 2:
                return { text: 'Trung bình', color: 'bg-amber-500', width: 'w-2/4', textColor: 'text-amber-600' };
            case 3:
                return { text: 'Khá', color: 'bg-blue-500', width: 'w-3/4', textColor: 'text-blue-600' };
            case 4:
                return { text: 'Rất mạnh', color: 'bg-emerald-500', width: 'w-full', textColor: 'text-emerald-600' };
            default:
                return { text: '', color: 'bg-gray-200', width: 'w-0', textColor: 'text-gray-400' };
        }
    };

    const strength = getStrengthLabel(passwordStrength);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            navigate('/');
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (idToken) => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(idToken);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Đăng ký Google không thành công');
        } finally {
            setLoading(false);
        }
    };

    const isMatch = formData.confirmPassword && formData.password === formData.confirmPassword;

    return (
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute -bottom-10 left-10 w-72 h-72 bg-purple-300/15 rounded-full blur-2xl pointer-events-none -z-10"></div>

            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/60 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
                {/* Top decorative gradient line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 absolute top-0 left-0"></div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bắt đầu miễn phí</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tạo Tài Khoản</h2>
                    <p className="text-sm text-gray-500">
                        Đăng ký nhanh chóng trong 30 giây
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Họ và tên */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Họ và tên
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Email */}
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

                    {/* Mật khẩu */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Mật khẩu
                        </label>
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

                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div className="mt-2 space-y-1">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${strength.color} transition-all duration-300 rounded-full ${strength.width}`}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-400">Độ mạnh mật khẩu:</span>
                                    <span className={`font-bold ${strength.textColor}`}>{strength.text}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
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
                                <span>Đang khởi tạo tài khoản...</span>
                            </>
                        ) : (
                            <>
                                <span>Đăng Ký Tài Khoản</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-200/80"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Hoặc đăng ký nhanh
                    </span>
                    <div className="flex-grow border-t border-gray-200/80"></div>
                </div>

                {/* Google Sign-Up */}
                <div className="transition-transform hover:scale-[1.01] duration-150">
                    <GoogleLoginButton
                        text="signup_with"
                        onSuccess={handleGoogleSuccess}
                        onError={(err) => setError(err.message)}
                    />
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                    Đã có tài khoản?{' '}
                    <Link
                        to="/login"
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
