import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Lock,
    Save,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Calendar,
    Loader2,
    KeyRound,
    Eye,
    EyeOff,
    Sparkles,
    RotateCcw,
    Shield,
    BadgeCheck,
    Check,
    BookOpen,
    Feather,
    Award
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, updateUser, getAvatarUrl } = useAuth();
    const fileInputRef = useRef(null);

    // Tab điều hướng: 'info' | 'password'
    const [activeTab, setActiveTab] = useState('info');

    // Form Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Avatar State
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

    const isGoogleAccount = Boolean(user?.googleId);

    // Đồng bộ form khi user load xong
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    // Kiểm tra thay đổi dữ liệu (Dirty Form)
    const isNameChanged = profileData.name.trim() !== (user?.name || '').trim();
    const isPhoneChanged = (profileData.phone || '').trim() !== (user?.phone || '').trim();
    const isAddressChanged = (profileData.address || '').trim() !== (user?.address || '').trim();
    const isAvatarChanged = Boolean(selectedAvatarFile);

    const hasChanges = isNameChanged || isPhoneChanged || isAddressChanged || isAvatarChanged;

    // Tính % hoàn thiện hồ sơ
    const calculateCompleteness = () => {
        let score = 50; // Name + Email luôn có
        if (user?.avatar || selectedAvatarFile) score += 20;
        if (profileData.phone || user?.phone) score += 15;
        if (profileData.address || user?.address) score += 15;
        return Math.min(score, 100);
    };

    const completeness = calculateCompleteness();

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
        setProfileMsg({ type: '', text: '' });
    };

    // Chọn ảnh mới
    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        setProfileMsg({ type: '', text: '' });
    };

    // Hủy ảnh đã chọn
    const handleCancelAvatar = () => {
        setSelectedAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Lưu toàn bộ thông tin thay đổi
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!hasChanges) return;

        setProfileLoading(true);
        setProfileMsg({ type: '', text: '' });

        try {
            let updatedUser = { ...user };

            // 1. Upload ảnh đại diện nếu có chọn mới
            if (selectedAvatarFile) {
                const formData = new FormData();
                formData.append('avatar', selectedAvatarFile);
                const avatarRes = await userService.uploadAvatar(formData);
                if (avatarRes.success) {
                    updatedUser = avatarRes.data.user;
                    setSelectedAvatarFile(null);
                }
            }

            // 2. Cập nhật thông tin nếu có sửa đổi
            if (isNameChanged || isPhoneChanged || isAddressChanged) {
                const res = await userService.updateProfile({
                    name: profileData.name.trim(),
                    phone: profileData.phone.trim(),
                    address: profileData.address.trim(),
                });
                if (res.success) {
                    updatedUser = res.data;
                }
            }

            updateUser(updatedUser);
            setProfileMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ di sản thành công!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || 'Cập nhật thất bại. Vui lòng thử lại.' });
        } finally {
            setProfileLoading(false);
        }
    };

    // Xử lý đổi mật khẩu
    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setPasswordMsg({ type: '', text: '' });
    };

    const isPasswordLengthValid = passwordData.newPassword.length >= 6;
    const isPasswordMatch = passwordData.newPassword.length > 0 && passwordData.newPassword === passwordData.confirmPassword;
    const hasPasswordInput =
        isPasswordLengthValid &&
        isPasswordMatch &&
        (isGoogleAccount || passwordData.currentPassword.length > 0);

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }

        setPasswordLoading(true);

        try {
            const res = await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            if (res.success) {
                setPasswordMsg({
                    type: 'success',
                    text: isGoogleAccount
                        ? 'Thiết lập mật khẩu tài khoản thành công!'
                        : 'Cập nhật mật khẩu bảo mật thành công!',
                });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (err) {
            setPasswordMsg({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const currentAvatarUrl = avatarPreview || getAvatarUrl(user?.avatar);

    // Chuyển đổi tên vai trò sang tiếng Việt trang trọng
    const getRoleDisplayName = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'Quản Trị Viên';
            case 'editor':
                return 'Biên Tập Viên';
            default:
                return 'Độc Giả Di Sản';
        }
    };

    return (
        <div className="profile-page-wrapper">
            {/* Ambient Background Warm Glow */}
            <div className="profile-ambient-glow" />

            {/* TOP COVER BANNER - SƠN MÀI HOÀNG GIA & VÀNG HOÀNG KIM */}
            <div className="profile-hero-banner">
                {/* Hoa văn hình học trống đồng Đông Sơn in chìm */}
                <div className="profile-hero-watermark" />
                <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-transparent to-transparent pointer-events-none" />

                {/* Nội dung Banner */}
                <div className="relative px-6 sm:px-10 py-9 sm:py-11 flex flex-col sm:flex-row sm:items-center justify-between gap-6 z-10">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="imperial-pill">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>❖ Quản Lý Định Danh & Bảo Mật</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heritage flex items-center gap-2">
                            <span>Trung Tâm Tài Khoản</span>
                        </h1>
                        <p className="text-sm text-amber-100/80 leading-relaxed font-sans">
                            Không gian quản lý hồ sơ định danh, ảnh đại diện và tùy chọn bảo mật tài khoản người đồng hành cùng VietHeritage.
                        </p>
                    </div>

                    {/* Huy hiệu định danh thành viên */}
                    <div className="flex flex-col sm:items-end gap-2 bg-black/25 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-amber-400/30 shadow-inner">
                        <span className="text-[11px] font-semibold text-amber-200/90 tracking-wide uppercase flex items-center gap-1.5">
                            <span className="text-amber-400">❖</span> Định Danh Thành Viên
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40 uppercase tracking-wider shadow-sm">
                                {getRoleDisplayName(user?.role)}
                            </span>
                            {user?.isVerified ? (
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-400/40 flex items-center shadow-sm">
                                    <BadgeCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Đã xác thực
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-950/50 text-amber-300/90 border border-amber-500/30">
                                    Đang đồng hành
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD LAYOUT (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* CỘT TRÁI: Thẻ Định Danh Cá Nhân & Điều Hướng */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="profile-card p-6 sm:p-7 relative overflow-hidden">
                        
                        {/* Khu vực ảnh đại diện (Avatar Ấn Triện) */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <div className="profile-avatar-frame">
                                    <div className="profile-avatar-inner">
                                        {currentAvatarUrl ? (
                                            <img
                                                src={currentAvatarUrl}
                                                alt={user?.name || 'Ảnh đại diện'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-5xl font-black text-amber-300 select-none font-serif drop-shadow-md">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'V'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Nút chụp/chọn ảnh đại diện */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Chọn ảnh đại diện mới"
                                    className="profile-camera-btn"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarSelect}
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    className="hidden"
                                />
                            </div>

                            {/* Nút hủy ảnh tạm thời nếu chưa lưu */}
                            {selectedAvatarFile && (
                                <div className="mb-3 flex items-center space-x-2 animate-in fade-in">
                                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        Ảnh mới chưa lưu
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCancelAvatar}
                                        className="p-1 text-red-700 hover:bg-red-100 rounded-lg transition"
                                        title="Hủy ảnh vừa chọn"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Tên và Email người dùng */}
                            <h2 className="text-xl font-bold text-stone-900 mt-1 flex items-center justify-center space-x-1.5 font-heritage">
                                <span>{user?.name || 'Người dùng VietHeritage'}</span>
                                {user?.isVerified && (
                                    <BadgeCheck className="w-5 h-5 text-emerald-700" title="Tài khoản đã xác thực" />
                                )}
                            </h2>
                            <p className="text-xs text-stone-600 font-medium mt-0.5">{user?.email}</p>

                            {/* Nhãn đặc tính tài khoản */}
                            <div className="flex flex-wrap gap-2 justify-center mt-3">
                                {isGoogleAccount && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-stone-700 border border-stone-200 shadow-2xs">
                                        <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                            />
                                        </svg>
                                        Google SSO
                                    </span>
                                )}
                                {user?.createdAt && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50/70 text-amber-900 border border-amber-200/80">
                                        <Calendar className="w-3.5 h-3.5 mr-1 text-amber-700" />
                                        Gia nhập: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>

                            {/* Thanh mức độ hoàn thiện hồ sơ */}
                            <div className="w-full mt-6 pt-5 border-t border-amber-900/10 text-left">
                                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                    <span className="text-stone-700 flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5 text-amber-700" />
                                        Mức độ hoàn thiện hồ sơ
                                    </span>
                                    <span className="text-red-900 font-extrabold">{completeness}%</span>
                                </div>
                                <div className="profile-progress-track">
                                    <div
                                        className="profile-progress-bar"
                                        style={{ width: `${completeness}%` }}
                                    />
                                </div>
                                {completeness < 100 && (
                                    <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                                        Cập nhật đầy đủ số điện thoại và địa chỉ để hoàn thiện 100% hồ sơ độc giả.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Menu Tab Điều Hướng */}
                        <div className="mt-6 pt-6 border-t border-amber-900/10 space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`profile-nav-tab ${activeTab === 'info' ? 'active' : 'inactive'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <User className={`w-4 h-4 ${activeTab === 'info' ? 'text-amber-200' : 'text-stone-500'}`} />
                                    <span>Thông Tin Cá Nhân</span>
                                </div>
                                {hasChanges && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" title="Có thay đổi chưa lưu" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('password')}
                                className={`profile-nav-tab ${activeTab === 'password' ? 'active' : 'inactive'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <KeyRound className={`w-4 h-4 ${activeTab === 'password' ? 'text-amber-200' : 'text-stone-500'}`} />
                                    <span>Bảo Mật & Mật Khẩu</span>
                                </div>
                            </button>
                        </div>

                        {/* Câu danh ngôn văn hóa truyền cảm hứng */}
                        <div className="mt-6 pt-5 border-t border-amber-900/10 text-center">
                            <p className="text-[11px] italic text-amber-900/80 font-serif">
                                ❖ &ldquo;Lời hay ý đẹp, lưu giữ muôn đời&rdquo;
                            </p>
                            <span className="text-[10px] text-stone-600 block mt-0.5">VietHeritage • Kho Tàng Di Sản</span>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: Khối Biểu Mẫu Nhập Liệu Chi Tiết */}
                <div className="lg:col-span-8">
                    <div className="profile-card p-6 sm:p-9 relative overflow-hidden">
                        
                        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                        {activeTab === 'info' && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-amber-900/10 gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Feather className="w-5 h-5 text-red-900" />
                                            <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-heritage">
                                                Hồ Sơ Độc Giả
                                            </h3>
                                        </div>
                                        <p className="text-xs text-stone-600 mt-1">
                                            Chỉnh sửa tên danh xưng và thông tin liên hệ của bạn trên nền tảng
                                        </p>
                                    </div>
                                    <span className="self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/70 text-amber-900 border border-amber-300">
                                        Mã Độc Giả: {user?._id?.slice(-8) || user?.id?.slice(-8) || 'User'}
                                    </span>
                                </div>

                                {/* Thông báo phản hồi */}
                                {profileMsg.text && (
                                    <div
                                        className={`mb-6 flex items-start space-x-3 text-sm animate-in fade-in duration-200 ${
                                            profileMsg.type === 'success'
                                                ? 'profile-alert-success'
                                                : 'profile-alert-error'
                                        }`}
                                    >
                                        {profileMsg.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span className="font-semibold">{profileMsg.text}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Họ và tên */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                                Họ và tên <span className="text-red-600">*</span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-red-800 transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={profileData.name}
                                                    onChange={handleProfileChange}
                                                    placeholder="Nhập họ và tên của bạn"
                                                    className="profile-input-field pl-11 pr-4"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                                                    Địa chỉ Email
                                                </label>
                                                {user?.isVerified ? (
                                                    <span className="text-xs text-emerald-700 font-semibold flex items-center">
                                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Đã xác thực
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-700 font-semibold">Chưa xác thực</span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="email"
                                                    disabled
                                                    value={user?.email || ''}
                                                    className="profile-input-field profile-input-disabled pl-11 pr-4"
                                                />
                                            </div>
                                            <p className="mt-1.5 text-[11px] text-stone-600">
                                                Email là định danh cố định gắn với tài khoản của bạn.
                                            </p>
                                        </div>

                                        {/* Số điện thoại */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                                Số điện thoại
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-red-800 transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={profileData.phone}
                                                    onChange={handleProfileChange}
                                                    placeholder="Ví dụ: 0912345678"
                                                    className="profile-input-field pl-11 pr-4"
                                                />
                                            </div>
                                        </div>

                                        {/* Địa chỉ cư trú */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                                Địa chỉ cư trú
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-red-800 transition-colors">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={profileData.address}
                                                    onChange={handleProfileChange}
                                                    placeholder="Ví dụ: Hà Nội, Việt Nam"
                                                    className="profile-input-field pl-11 pr-4"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thanh Nút Thao Tác */}
                                    <div className="pt-6 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-xs">
                                            {hasChanges ? (
                                                <span className="inline-flex items-center text-amber-800 font-bold animate-pulse">
                                                    ● Bạn có chỉnh sửa chưa lưu lại
                                                </span>
                                            ) : (
                                                <span className="text-stone-600">Dữ liệu hiện tại đã được đồng bộ</span>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!hasChanges || profileLoading}
                                            className="profile-btn-primary w-full sm:w-auto"
                                        >
                                            {profileLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang lưu thay đổi...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Lưu Thay Đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* TAB 2: ĐỔI MẬT KHẨU */}
                        {activeTab === 'password' && (
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-900/10">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-red-900" />
                                            <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-heritage">
                                                Bảo Mật & Mật Khẩu
                                            </h3>
                                        </div>
                                        <p className="text-xs text-stone-600 mt-1">
                                            Bảo vệ tài khoản với mật khẩu tiêu chuẩn bảo mật cao
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                                        Bảo mật tài khoản
                                    </span>
                                </div>

                                {/* Thông báo dành riêng cho tài khoản Google */}
                                {isGoogleAccount && (
                                    <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-stone-800 text-sm flex items-start space-x-3">
                                        <Sparkles className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-amber-950">Tài khoản liên kết Google SSO</p>
                                            <p className="mt-1 text-stone-600 text-xs leading-relaxed">
                                                Bạn đang đăng nhập qua tài khoản Google. Bạn có thể thiết lập thêm mật khẩu trực tiếp tại đây để đăng nhập bằng cả Email và Mật khẩu khi cần thiết.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Thông báo phản hồi đổi mật khẩu */}
                                {passwordMsg.text && (
                                    <div
                                        className={`mb-6 flex items-start space-x-3 text-sm animate-in fade-in duration-200 ${
                                            passwordMsg.type === 'success'
                                                ? 'profile-alert-success'
                                                : 'profile-alert-error'
                                        }`}
                                    >
                                        {passwordMsg.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span className="font-semibold">{passwordMsg.text}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSavePassword} className="space-y-5 max-w-lg">
                                    {/* Mật khẩu hiện tại (nếu là tài khoản thông thường) */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                            Mật khẩu hiện tại {!isGoogleAccount && <span className="text-red-600">*</span>}
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-red-800 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showCurrentPass ? 'text' : 'password'}
                                                name="currentPassword"
                                                required={!isGoogleAccount}
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                placeholder={isGoogleAccount ? 'Để trống nếu chưa từng đặt mật khẩu' : '••••••••'}
                                                className="profile-input-field pl-11 pr-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                                            >
                                                {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mật khẩu mới */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                            Mật khẩu mới <span className="text-red-600">*</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-red-800 transition-colors">
                                                <KeyRound className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                name="newPassword"
                                                required
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Tối thiểu 6 ký tự"
                                                className="profile-input-field pl-11 pr-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                                            >
                                                {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Xác nhận mật khẩu mới */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                            Xác nhận mật khẩu mới <span className="text-red-600">*</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-red-800 transition-colors">
                                                <KeyRound className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showConfirmPass ? 'text' : 'password'}
                                                name="confirmPassword"
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className="profile-input-field pl-11 pr-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
                                            >
                                                {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hướng dẫn tiêu chuẩn mật khẩu */}
                                    <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs space-y-1.5">
                                        <span className="font-bold text-stone-700 block mb-1">Quy định bảo mật:</span>
                                        <div className={`flex items-center gap-1.5 ${isPasswordLengthValid ? 'text-emerald-700 font-semibold' : 'text-stone-600'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Mật khẩu mới có ít nhất 6 ký tự</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${isPasswordMatch ? 'text-emerald-700 font-semibold' : 'text-stone-600'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Xác nhận mật khẩu trùng khớp với mật khẩu mới</span>
                                        </div>
                                    </div>

                                    {/* Nút lưu mật khẩu */}
                                    <div className="pt-4 border-t border-amber-900/10 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!hasPasswordInput || passwordLoading}
                                            className="profile-btn-primary w-full sm:w-auto"
                                        >
                                            {passwordLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang cập nhật...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    {isGoogleAccount ? 'Lưu Mật Khẩu Mới' : 'Cập Nhật Mật Khẩu'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
