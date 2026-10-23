import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import DragonPhoenixHeritage from '../../components/common/DragonPhoenixHeritage';
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
        const cleanVal = value.replace(/\D/g, '').slice(-1);

        const newDigits = [...otpDigits];
        newDigits[index] = cleanVal;
        setOtpDigits(newDigits);
        setError('');

        if (cleanVal && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pastedData) return;

        const newDigits = [...otpDigits];
        for (let i = 0; i < pastedData.length; i++) {
            newDigits[i] = pastedData[i];
        }
        setOtpDigits(newDigits);
        setError('');

        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otpDigits.join('');

        if (otpCode.length < 6) {
            setError('Vui lòng nhập đủ 6 chữ số mã xác thực OTP');
            return;
        }

        if (!email) {
            setError('Vui lòng nhập địa chỉ email cần xác thực');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authService.verifyEmail({
                email,
                otp: otpCode,
            });

            setSuccess('Xác thực tài khoản thành công! Đang chuyển hướng...');
            if (res.data?.user) {
                updateUser(res.data.user);
            }

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Vui lòng nhập địa chỉ email');
            return;
        }

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.resendVerification(email);
            setSuccess('Mã xác thực OTP mới đã được gửi đến email của bạn');
            setCountdown(60);
            setCanResend(false);
            setOtpDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
        } finally {
            setResendLoading(false);
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
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-heritage">
                        Xác Thực Tài Khoản
                    </h2>
                    <p className="text-sm text-stone-600 font-vietnam max-w-xs mx-auto leading-relaxed">
                        Mã OTP gồm 6 chữ số đã được gửi tới hòm thư điện tử của bạn
                    </p>
                </div>

                {registered && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs animate-in fade-in duration-200">
                        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                        <span>Đăng ký thành công! Hãy nhập mã OTP để kích hoạt đầy đủ quyền hạn.</span>
                    </div>
                )}

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

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="block w-full pl-11 pr-4 py-3 bg-[#faf6ed] border border-amber-300/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium text-stone-900 placeholder:text-stone-400 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* 6 Ô nhập OTP */}
                    <div>
                        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-3 text-center font-vietnam">
                            Mã OTP (6 chữ số)
                        </label>
                        <div className="flex justify-between items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleDigitChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-[#faf6ed] border ${
                                        digit ? 'border-amber-600 bg-white ring-2 ring-amber-500/20' : 'border-amber-300/80'
                                    } focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-stone-900 transition-all duration-150`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-[#fef3c7] bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#b45309] hover:from-[#b91c1c] hover:to-[#d97706] border border-amber-400/50 shadow-lg shadow-red-950/40 hover:shadow-red-950/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang xác nhận mã...</span>
                            </>
                        ) : (
                            <>
                                <span>Xác Nhận Kích Hoạt</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Gửi lại OTP */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-stone-600 mb-2 font-vietnam">Không nhận được mã hoặc mã đã hết hạn?</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend || resendLoading}
                        className={`inline-flex items-center space-x-1.5 text-xs font-bold ${
                            canResend
                                ? 'text-red-800 hover:text-amber-800 cursor-pointer'
                                : 'text-stone-400 cursor-not-allowed'
                        } transition-colors`}
                    >
                        {resendLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${!canResend ? '' : 'animate-none'}`} />
                        )}
                        <span>{canResend ? 'Gửi lại mã OTP' : `Gửi lại sau (${countdown}s)`}</span>
                    </button>
                </div>

                {/* Quay lại */}
                <div className="text-center mt-6 pt-4 border-t border-amber-900/10">
                    <Link
                        to="/login"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-800 hover:text-amber-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại trang Đăng nhập</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
