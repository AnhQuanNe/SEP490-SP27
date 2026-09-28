import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import {
    ShieldCheck,
    Mail,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ArrowRight,
    Sparkles,
    ArrowLeft
} from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const initialEmail = searchParams.get('email') || '';
    const registered = searchParams.get('registered');

    const [email, setEmail] = useState(initialEmail);
    // Mảng 6 ký tự OTP
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Đếm ngược 60s
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Xử lý khi gõ từng ô OTP
    const handleDigitChange = (index, value) => {
        // Chỉ lấy chữ số cuối cùng nếu paste hoặc gõ
        const cleanVal = value.replace(/\D/g, '').slice(-1);

        const newDigits = [...otpDigits];
        newDigits[index] = cleanVal;
        setOtpDigits(newDigits);
        setError('');

        // Tự động chuyển sang ô tiếp theo nếu đã điền
        if (cleanVal && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Xử lý nút Backspace để lùi lại ô trước
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Hỗ trợ Paste toàn bộ mã 6 chữ số từ clipboard
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newDigits = [...otpDigits];
            for (let i = 0; i < pastedData.length; i++) {
                newDigits[i] = pastedData[i];
            }
            setOtpDigits(newDigits);
            // Focus vào ô tiếp theo sau các ký tự đã paste
            const nextIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const fullOtp = otpDigits.join('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Vui lòng nhập địa chỉ email của bạn');
            return;
        }

        if (fullOtp.length !== 6) {
            setError('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số');
            return;
        }

        setLoading(true);

        try {
            const res = await authService.verifyEmail({ email, otp: fullOtp });
            setSuccess('Xác thực tài khoản thành công! Đang chuyển hướng...');

            if (res.data?.token) {
                localStorage.setItem('token', res.data.token);
                updateUser(res.data.user);
            }

            setTimeout(() => {
                navigate('/');
            }, 1200);
        } catch (err) {
            setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        if (!email) {
            setError('Vui lòng nhập email để nhận mã xác thực mới');
            return;
        }

        setError('');
        setSuccess('');
        setResendLoading(true);

        try {
            const res = await authService.resendVerification({ email });
            setSuccess(res.data?.message || 'Mã xác thực mới đã được gửi vào email của bạn!');
            setCountdown(60);
            setCanResend(false);
            setOtpDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || 'Gửi lại mã thất bại. Vui lòng thử lại sau.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute -bottom-10 right-10 w-72 h-72 bg-emerald-300/15 rounded-full blur-2xl pointer-events-none -z-10"></div>

            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/60 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
                {/* Top decorative gradient line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 absolute top-0 left-0"></div>

                {/* Header Icon */}
                <div className="text-center space-y-2 mb-8">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white mb-4 animate-in zoom-in-50 duration-300">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Xác Thực Email</h2>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                        {registered
                            ? 'Tài khoản đã sẵn sàng! Nhập mã OTP 6 chữ số vừa gửi đến email để kích hoạt.'
                            : 'Nhập mã OTP 6 chữ số được gửi đến hộp thư của bạn.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                        <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-700 text-sm animate-in fade-in duration-200">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                        <span className="font-medium leading-relaxed">{success}</span>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Email nhận mã
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
                                className="block w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* 6-box OTP Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 text-center">
                            Mã xác thực (OTP)
                        </label>
                        <div className="flex justify-between gap-2 sm:gap-2.5 on-paste" onPaste={handlePaste}>
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-12 h-14 sm:w-13 sm:h-15 text-center text-2xl font-black rounded-2xl border transition-all duration-200 outline-none ${
                                        digit
                                            ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm shadow-blue-500/10 ring-2 ring-blue-500/20'
                                            : 'border-gray-200 bg-gray-50/70 text-gray-800 hover:border-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-400">
                            Bạn có thể sao chép và dán trực tiếp 6 chữ số vào đây.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || fullOtp.length !== 6}
                        className="w-full py-3 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang xác thực...</span>
                            </>
                        ) : (
                            <>
                                <span>Xác Thực Tài Khoản</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Resend Section */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col items-center space-y-3">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend || resendLoading}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                        {canResend ? 'Gửi lại mã xác thực mới' : `Gửi lại mã sau ${countdown}s`}
                    </button>

                    <Link
                        to="/login"
                        className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
