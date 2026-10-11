import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Heart,
    User,
    LogOut,
    ShieldCheck,
    ChevronDown,
    Menu,
    X,
    Video,
    MessageSquare,
    BookOpen,
    Globe,
    CheckCircle2,
    Sparkles,
    GraduationCap,
    SlidersHorizontal
} from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout, getAvatarUrl } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { label: 'Trang chủ', path: '/', icon: Heart },
        { label: 'Gương ảo AI', path: '/learning/mirror', icon: Video, badge: 'AI Studio' },
        { label: 'Cây kỹ năng', path: '/learning/skill-tree', icon: BookOpen },
        { label: 'Trợ lý 2 Chiều', path: '/communicator', icon: MessageSquare },
        { label: 'Phương ngữ Synset', path: '/dictionary', icon: Globe },
    ];

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Brand Logo */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform duration-200">
                                <Heart className="w-5 h-5 fill-white" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <span className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                        HeartSign
                                    </span>
                                    <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                                        HSS
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium -mt-1 hidden sm:inline">
                                    Inclusive Sign Ecosystem
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-rose-50 text-rose-600 font-bold'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? 'text-rose-600' : 'text-slate-400'}`} />
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Action Section */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 focus:outline-none"
                                >
                                    <div className="relative">
                                        {avatarSrc ? (
                                            <img
                                                src={avatarSrc}
                                                alt={user?.name}
                                                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500/30"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="text-left hidden xl:block">
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                                                {user?.name}
                                            </p>
                                            {user?.isVerified && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 capitalize">
                                            {user?.role === 'deaf' ? 'Người khiếm thính' : user?.role || 'Learner'}
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                            <p className="text-xs text-slate-400 font-medium">Tài khoản</p>
                                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            <div className="mt-2 flex items-center gap-1.5">
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 capitalize">
                                                    Vai trò: {user?.role || 'Learner'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition"
                                            >
                                                <User className="w-4 h-4 mr-3 text-slate-400" />
                                                Hồ sơ cá nhân & Đổi mật khẩu
                                            </Link>

                                            {user?.role === 'educator' && (
                                                <Link
                                                    to="/educator/classrooms"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition"
                                                >
                                                    <GraduationCap className="w-4 h-4 mr-3 text-indigo-500" />
                                                    Quản lý Lớp học & Giáo án
                                                </Link>
                                            )}

                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition"
                                                >
                                                    <ShieldCheck className="w-4 h-4 mr-3 text-purple-500" />
                                                    Bảng Quản trị & Duyệt video
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2.5">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-rose-600 hover:bg-slate-100/60 rounded-xl transition"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 hover:opacity-95 shadow-md shadow-rose-500/20 hover:shadow-rose-500/35 transition-all duration-200"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Bắt đầu ngay</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
                    <div className="space-y-1">
                        {navLinks.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                                        active
                                            ? 'bg-rose-50 text-rose-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`w-4 h-4 ${active ? 'text-rose-600' : 'text-slate-400'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {isAuthenticated ? (
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-xl">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="truncate">
                                    <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Hồ sơ cá nhân & Đổi mật khẩu
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 rounded-xl shadow-md transition"
                            >
                                Bắt đầu ngay
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
