import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShieldCheck,
    Mail,
    UserCheck,
    KeyRound,
    Sparkles,
    ArrowRight,
    LogIn,
    CheckCircle2,
    Lock
} from 'lucide-react';

const Home = () => {
    const { user, isAuthenticated, getAvatarUrl } = useAuth();
    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>SEP490 - Group 4</span>
                </div>
                <h1 className="text-4xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    SEP490 - Không Làm Không Ra Trường
                </h1>
            </div>

            {/* User status banner if logged in */}
            {isAuthenticated ? (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 bg-blue-100 flex items-center justify-center flex-shrink-0">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-blue-600">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                                    <h2 className="text-2xl font-bold text-gray-900">Xin chào, {user?.name}!</h2>
                                    {user?.isVerified && (
                                        <span title="Email đã xác thực">
                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                        Vai trò: {user?.role}
                                    </span>
                                    {user?.googleId && (
                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600">
                                            Đã liên kết Google
                                        </span>
                                    )}
                                    {user?.phone && (
                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                            SĐT: {user.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap sm:flex-col gap-2.5 w-full sm:w-auto">
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                            >
                                Xem & Sửa Profile
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center gap-4 mb-16">
                    <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition"
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Đăng nhập ngay
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300 rounded-xl transition shadow-sm"
                    >
                        Tạo tài khoản mới
                    </Link>
                </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Đăng Ký Vào Luôn Việc</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Tạo tài khoản nhanh gọn, tự động đăng nhập vào ngay hệ thống không cần bước trung gian. Mật khẩu mã hoá an toàn tuyệt đối!
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Google 1 Chạm Là Vào Việc</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Dành cho người hệ lười nhớ mật khẩu. Bấm 1 nháy bằng Google là xong, tích hợp GIS chuẩn chỉ, deploy Vercel bao mượt không lo ăn hành!
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Não Cá Vàng? Đừng Lo!</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Hôm nay đặt pass, ngày mai quên sạch? Nhập email là có link cứu rỗi tâm hồn gửi về liền, reset mật khẩu lẹ hơn cách bạn lướt Threads.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Flex Profile & Sống Ảo</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Lên ảnh đại diện nét căng đét, chỉnh sửa info xịn mịn. Nút Lưu thay đổi thông minh có biến mới sáng đèn, không sợ bấm nhầm!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
