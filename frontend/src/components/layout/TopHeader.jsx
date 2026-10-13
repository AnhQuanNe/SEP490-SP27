import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    Compass,
    ChevronDown,
    User,
    LogOut,
    Sparkles,
    Video,
    MessageSquare,
    BookOpen,
    Menu,
    CheckCircle2,
    SlidersHorizontal,
    Zap,
    Layers,
    Flame,
    GraduationCap
} from 'lucide-react';

const TopHeader = ({
    onOpenSearch,
    selectedFilter = 'all',
    onSelectFilter,
    onToggleMobileSidebar
}) => {
    const { user, isAuthenticated, logout, getAvatarUrl } = useAuth();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filterPills = [
        { id: 'all', label: 'Tất cả cử chỉ', path: '/' },
        { id: 'mirror', label: 'Gương ảo AI', path: '/learning/mirror' },
        { id: 'translator', label: 'Dịch 2 Chiều', path: '/communicator' },
        { id: 'skilltree', label: 'Cây kỹ năng', path: '/learning/skill-tree' },
        { id: 'basic', label: 'Cơ bản', path: '/learning/skill-tree' },
        { id: 'advanced', label: 'Nâng cao', path: '/learning/skill-tree' },
        { id: 'conversation', label: 'Hội thoại giao tiếp', path: '/communicator' },
    ];

    const handlePillClick = (pill) => {
        if (onSelectFilter) {
            onSelectFilter(pill.id);
        }
        if (pill.path && pill.id !== 'all' && pill.id !== 'basic' && pill.id !== 'advanced') {
            navigate(pill.path);
        }
    };

    const handleLogout = () => {
        logout();
        setUserDropdownOpen(false);
        navigate('/login');
    };

    const avatarSrc = (user?.avatar && typeof getAvatarUrl === 'function') ? getAvatarUrl(user.avatar) : null;
    const displayName = (user?.name && typeof user.name === 'string') ? user.name : 'Huy Minh Ha';
    const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : 'H';

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
            <div className="px-4 sm:px-6 lg:px-8 py-2.5">
                
                {/* Top Row: Search Bar & Actions */}
                <div className="flex items-center justify-between gap-3 sm:gap-6">
                    
                    {/* Mobile Sidebar Toggle Button */}
                    <button
                        onClick={onToggleMobileSidebar}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden focus:outline-none"
                        aria-label="Toggle Navigation"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search Bar Input */}
                    <div className="flex-1 max-w-2xl">
                        <div
                            onClick={onOpenSearch}
                            className="group flex items-center w-full px-3.5 py-2 sm:py-2.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 rounded-2xl cursor-pointer transition-all shadow-2xs"
                        >
                            <Search className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors mr-2.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-slate-400 font-medium truncate flex-1 select-none">
                                Ký hiệu bàn tay (Hand sign)...
                            </span>
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-lg shadow-2xs group-hover:text-slate-600 transition-colors">
                                Ctrl K
                            </kbd>
                        </div>
                    </div>

                    {/* Right Side: Learning Roadmap & User Capsule */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        
                        {/* "Lộ trình học" quick link with Compass/Route icon */}
                        <Link
                            to="/learning/skill-tree"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 transition-all border border-transparent hover:border-rose-100"
                            title="Xem Lộ trình học tập"
                        >
                            <Compass className="w-4 h-4 text-rose-500" />
                            <span>Lộ trình học</span>
                        </Link>

                        {/* User Profile Capsule Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-full hover:bg-slate-100 transition-all border border-slate-200/80 focus:outline-none shadow-2xs"
                            >
                                <div className="relative flex-shrink-0">
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt={displayName}
                                            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full object-cover ring-2 ring-rose-500/25"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-inner">
                                            {displayInitial}
                                        </div>
                                    )}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>

                                <span className="hidden md:inline-block text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[120px]">
                                    {displayName}
                                </span>

                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                                        userDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                            Tài khoản HeartSign
                                        </p>
                                        <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user?.email || 'learner@heartsign.vn'}
                                        </p>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 capitalize">
                                                {user?.role === 'deaf' ? 'Người khiếm thính' : user?.role || 'Học viên'}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                                                <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                7 Ngày Streak
                                            </span>
                                        </div>
                                    </div>

                                    <div className="py-1 text-xs sm:text-sm">
                                        <Link
                                            to="/learning/skill-tree"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition font-medium"
                                        >
                                            <Compass className="w-4 h-4 mr-3 text-slate-400" />
                                            Lộ trình Cây kỹ năng
                                        </Link>

                                        <Link
                                            to="/learning/mirror"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition font-medium"
                                        >
                                            <Video className="w-4 h-4 mr-3 text-slate-400" />
                                            Gương ảo AI Studio
                                        </Link>

                                        <Link
                                            to="/communicator"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition font-medium"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-3 text-slate-400" />
                                            Trợ lý Dịch 2 Chiều
                                        </Link>

                                        <Link
                                            to="/profile"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition font-medium"
                                        >
                                            <User className="w-4 h-4 mr-3 text-slate-400" />
                                            Hồ sơ cá nhân & Đổi mật khẩu
                                        </Link>

                                        <Link
                                            to="/educator/classrooms"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition font-medium"
                                        >
                                            <GraduationCap className="w-4 h-4 mr-3 text-slate-400" />
                                            Lớp học & Giáo án Giảng viên
                                        </Link>
                                    </div>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    {isAuthenticated ? (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                                            Đăng xuất
                                        </button>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="w-full flex items-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                                            Đăng nhập / Đăng ký
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                {/* Bottom Row: Horizontal Filter Pills Carousel */}
                <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
                    {filterPills.map((pill) => {
                        const isActive = selectedFilter === pill.id;
                        return (
                            <button
                                key={pill.id}
                                onClick={() => handlePillClick(pill)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-slate-200/60'
                                }`}
                            >
                                {pill.label}
                            </button>
                        );
                    })}
                </div>

            </div>
        </header>
    );
};

export default TopHeader;
