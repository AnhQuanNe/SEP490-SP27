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
    Check
} from 'lucide-react';

const Profile = () => {
    const { user, updateUser, getAvatarUrl } = useAuth();
    const fileInputRef = useRef(null);

    // Tab state: 'info' | 'password'
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

    // Tính % hoàn thiện hồ sơ (Gamification)
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

            // 2. Cập nhật thông tin chữ nếu có sửa
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
            setProfileMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || 'Cập nhật thất bại' });
        } finally {
            setProfileLoading(false);
        }
    };

    // Xử lý đổi mật khẩu
    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setPasswordMsg({ type: '', text: '' });
    };

    const hasPasswordInput =
        passwordData.newPassword.length >= 6 &&
        passwordData.confirmPassword.length >= 6 &&
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
                        ? 'Thiết lập mật khẩu mới thành công!'
                        : 'Đổi mật khẩu thành công!',
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

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/15 via-indigo-300/15 to-sky-300/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* TOP COVER BANNER */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                {/* Banner Content */}
                <div className="relative px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-200 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                            <span>Quản lý hồ sơ & Bảo mật tài khoản</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            Trung Tâm Tài Khoản
                        </h1>
                        <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                            Cập nhật thông tin định danh cá nhân, ảnh đại diện và tùy chọn bảo mật mật khẩu của bạn.
                        </p>
                    </div>

                    {/* Quick Badge */}
                    <div className="hidden md:flex flex-col items-end space-y-1.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <span className="text-xs text-slate-300">Tài khoản thành viên</span>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase">
                                {user?.role || 'Customer'}
                            </span>
                            {user?.isVerified && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center">
                                    <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Đã xác thực
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD LAYOUT (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Profile Identity Card & Navigation */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-6 sm:p-7 relative overflow-hidden">
                        {/* Avatar Presentation */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-blue-50 shadow-xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center border border-gray-200/80 transition-transform duration-300 group-hover:scale-102">
                                    {currentAvatarUrl ? (
                                        <img
                                            src={currentAvatarUrl}
                                            alt={user?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl font-black text-blue-600 select-none">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Floating Camera Trigger */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Chọn ảnh mới"
                                    className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg ring-4 ring-white transition-all hover:scale-110 active:scale-95 focus:outline-none"
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

                            {/* Revert Avatar Button if new image selected */}
                            {selectedAvatarFile && (
                                <div className="mb-3 flex items-center space-x-2 animate-in fade-in">
                                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Ảnh mới chưa lưu
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCancelAvatar}
                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                        title="Hủy ảnh"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-gray-900 mt-1 flex items-center justify-center space-x-1.5">
                                <span>{user?.name}</span>
                                {user?.isVerified && (
                                    <BadgeCheck className="w-5 h-5 text-blue-600" title="Email đã xác thực" />
                                )}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>

                            {/* Tags & Badges */}
                            <div className="flex flex-wrap gap-2 justify-center mt-3">
                                {isGoogleAccount && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
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
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                        <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                        Gia nhập: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>

                            {/* Profile Completeness Bar */}
                            <div className="w-full mt-6 pt-5 border-t border-gray-100 text-left">
                                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                    <span className="text-gray-600">Độ hoàn thiện hồ sơ</span>
                                    <span className="text-blue-600">{completeness}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                                        style={{ width: `${completeness}%` }}
                                    ></div>
                                </div>
                                {completeness < 100 && (
                                    <p className="text-[11px] text-gray-400 mt-1.5">
                                        Điền đầy đủ số điện thoại và địa chỉ để đạt 100%.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Navigation Sidebar Tabs */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                    activeTab === 'info'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'text-gray-600 hover:bg-gray-100/80'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <User className="w-4 h-4" />
                                    <span>Thông Tin Cá Nhân</span>
                                </div>
                                {hasChanges && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('password')}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                    activeTab === 'password'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'text-gray-600 hover:bg-gray-100/80'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <KeyRound className="w-4 h-4" />
                                    <span>Bảo Mật & Mật Khẩu</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Tab Form Details */}
                <div className="lg:col-span-8">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-6 sm:p-9 relative overflow-hidden">
                        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                        {activeTab === 'info' && (
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-gray-900">Hồ Sơ Cá Nhân</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Chỉnh sửa tên và thông tin liên hệ của bạn
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                                        ID: {user?._id?.slice(-8) || user?.id?.slice(-8) || 'User'}
                                    </span>
                                </div>

                                {profileMsg.text && (
                                    <div
                                        className={`mb-6 p-4 rounded-2xl border flex items-start space-x-3 text-sm animate-in fade-in duration-200 ${
                                            profileMsg.type === 'success'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                : 'bg-rose-50 border-rose-200 text-rose-800'
                                        }`}
                                    >
                                        {profileMsg.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span className="font-semibold">{profileMsg.text}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Họ và tên */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                Họ và tên <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={profileData.name}
                                                    onChange={handleProfileChange}
                                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Địa chỉ Email
                                                </label>
                                                {user?.isVerified ? (
                                                    <span className="text-xs text-emerald-600 font-semibold flex items-center">
                                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Đã xác thực
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-600 font-semibold">Chưa xác thực</span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="email"
                                                    disabled
                                                    value={user?.email || ''}
                                                    className="block w-full pl-11 pr-4 py-3 bg-gray-100/80 border border-gray-200 rounded-2xl text-gray-500 text-sm font-medium cursor-not-allowed select-none"
                                                />
                                            </div>
                                            <p className="mt-1.5 text-[11px] text-gray-400">
                                                Email là định danh cố định không thể thay đổi.
                                            </p>
                                        </div>

                                        {/* Số điện thoại */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                Số điện thoại
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={profileData.phone}
                                                    onChange={handleProfileChange}
                                                    placeholder="Ví dụ: 0912345678"
                                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Địa chỉ cư trú */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                Địa chỉ cư trú
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={profileData.address}
                                                    onChange={handleProfileChange}
                                                    placeholder="Ví dụ: Hà Nội, Việt Nam"
                                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button Bar */}
                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-xs">
                                            {hasChanges ? (
                                                <span className="inline-flex items-center text-blue-600 font-bold animate-pulse">
                                                    ● Bạn có thay đổi chưa lưu
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Chưa có thay đổi nào</span>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!hasChanges || profileLoading}
                                            className={`inline-flex items-center px-7 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                                                hasChanges && !profileLoading
                                                    ? 'text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-600/25 cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                                                    : 'text-gray-400 bg-gray-200 cursor-not-allowed shadow-none'
                                            }`}
                                        >
                                            {profileLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang lưu dữ liệu...
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
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-gray-900">Bảo Mật & Mật Khẩu</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Bảo vệ tài khoản bằng mật khẩu mạnh
                                        </p>
                                    </div>
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                </div>

                                {isGoogleAccount && (
                                    <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-950 text-sm flex items-start space-x-3">
                                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Đăng nhập tiện lợi bằng Google</p>
                                            <p className="mt-1 text-blue-800 text-xs leading-relaxed">
                                                Tài khoản của bạn hiện đang liên kết với Google. Bạn có thể thiết lập mật khẩu riêng tại đây để sau này có thể đăng nhập bằng cả Email & Mật khẩu thông thường.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {passwordMsg.text && (
                                    <div
                                        className={`mb-6 p-4 rounded-2xl border flex items-start space-x-3 text-sm animate-in fade-in duration-200 ${
                                            passwordMsg.type === 'success'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                : 'bg-rose-50 border-rose-200 text-rose-800'
                                        }`}
                                    >
                                        {passwordMsg.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span className="font-semibold">{passwordMsg.text}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSavePassword} className="space-y-5 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Mật khẩu hiện tại
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showCurrentPass ? 'text' : 'password'}
                                                name="currentPassword"
                                                required={!isGoogleAccount}
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                placeholder={isGoogleAccount ? 'Để trống nếu chưa từng đặt mật khẩu' : '••••••••'}
                                                className="block w-full pl-11 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                            >
                                                {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Mật khẩu mới
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <KeyRound className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                name="newPassword"
                                                required
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Tối thiểu 6 ký tự"
                                                className="block w-full pl-11 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                            >
                                                {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <KeyRound className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showConfirmPass ? 'text' : 'password'}
                                                name="confirmPassword"
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className="block w-full pl-11 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 text-sm font-medium transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                            >
                                                {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!hasPasswordInput || passwordLoading}
                                            className={`inline-flex items-center px-7 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                                                hasPasswordInput && !passwordLoading
                                                    ? 'text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-600/25 cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                                                    : 'text-gray-400 bg-gray-200 cursor-not-allowed shadow-none'
                                            }`}
                                        >
                                            {passwordLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    {isGoogleAccount ? 'Lưu Mật Khẩu' : 'Cập Nhật Mật Khẩu'}
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
