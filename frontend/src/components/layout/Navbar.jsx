import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAiChat } from '../../context/AiChatContext';
import { 
    User, 
    LogOut, 
    ShieldCheck, 
    ChevronDown, 
    Menu, 
    X, 
    BookOpen, 
    Sparkles, 
    Compass, 
    Search,
    Bookmark,
    Trophy,
    Bot
} from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout, getAvatarUrl } = useAuth();
    const { openAiChat } = useAiChat();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/login');
    };

    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    const navItems = [
        { name: 'Trang chủ', path: '/', isRoute: true },
        { name: 'Khám phá Tri thức', path: '/kham-pha', isRoute: true },
        { name: 'Văn học Dân gian', path: '/van-hoc-dan-gian', isRoute: true },
        { name: 'Bản đồ Văn học', path: '/ban-do', isRoute: true },
        { name: 'Thử tài Di sản', path: '/do-vui', isRoute: true, isHighlight: true },
        { name: 'Trợ lý AI', isAction: true },
    ];

    const [currentHash, setCurrentHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        setCurrentHash(location.hash);
    }, [location]);

    const isItemActive = (item) => {
        if (item.isAction) return false;
        if (item.isRoute) {
            if (item.path === '/') {
                return location.pathname === '/' && (!currentHash || currentHash === '#' || currentHash === '');
            }
            return location.pathname === item.path;
        } else {
            return location.pathname === '/' && currentHash === item.hash;
        }
    };

    const handleNavClick = (item, e) => {
        if (item.isAction) {
            if (e) e.preventDefault();
            openAiChat();
            setMobileMenuOpen(false);
            return;
        }

        if (item.isRoute) {
            navigate(item.path);
            setCurrentHash('');
        } else {
            if (location.pathname === '/') {
                if (e) e.preventDefault();
                const target = document.querySelector(item.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', item.hash);
                    setCurrentHash(item.hash);
                }
            } else {
                navigate(item.path);
                setCurrentHash(item.hash);
            }
        }
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand Logo */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" onClick={() => setCurrentHash('')} className="flex items-center space-x-3 group">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-amber-700 flex items-center justify-center text-amber-300 shadow-md shadow-indigo-950/20 group-hover:scale-105 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-xl font-extrabold text-slate-900 tracking-tight font-heritage">
                                        VietHeritage
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 rounded-md border border-amber-200/60 flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                        AI
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 tracking-normal">
                                    Kho Tàng Di Sản & Văn Học Việt Nam
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav Links with Active Indicator */}
                        <nav className="hidden lg:flex items-center space-x-1.5">
                            {navItems.map((item) => {
                                const active = isItemActive(item);
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={(e) => handleNavClick(item, e)}
                                        className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                                            active
                                                ? 'text-amber-900 bg-amber-50/90 shadow-xs border border-amber-200/80 font-bold'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                                        }`}
                                    >
                                        {/* Micro pulse glowing indicator for active state */}
                                        {active && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                        )}
                                        <span>{item.name}</span>
                                        {/* Bottom active accent bar */}
                                        {active && (
                                            <span className="absolute -bottom-1 left-3 right-3 h-[2.5px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-full shadow-xs"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Action / Auth Area */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-3 p-1.5 pl-3 rounded-full hover:bg-slate-100 transition-all border border-slate-200/70 focus:outline-none"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                                        <p className="text-[11px] text-amber-700 capitalize font-medium">{user?.role || 'Độc giả'}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-500/80 bg-amber-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-amber-800">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                                        onMouseLeave={() => setDropdownOpen(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
                                            <p className="text-xs text-slate-500 font-medium">Đang đăng nhập với</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-[11px] font-medium text-emerald-700">Tài khoản hợp lệ</span>
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-900 transition-colors"
                                        >
                                            <User className="w-4 h-4 mr-3 text-slate-400" />
                                            Hồ sơ cá nhân & Đổi mật khẩu
                                        </Link>

                                        {user?.role === 'admin' && (
                                            <div className="flex items-center px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 mx-2 my-1 rounded-lg">
                                                <ShieldCheck className="w-4 h-4 mr-2" />
                                                Quyền Quản trị viên (Admin)
                                            </div>
                                        )}

                                        <div className="border-t border-slate-100 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-red-500" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-900 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-indigo-950 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                                >
                                    Đăng ký tài khoản
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 shadow-lg">
                    {navItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <button
                                key={item.name}
                                type="button"
                                onClick={(e) => handleNavClick(item, e)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                                    active
                                        ? 'bg-amber-50 text-amber-900 border-l-4 border-amber-600 shadow-xs pl-3 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>}
                                    <span>{item.name}</span>
                                </div>
                                {active && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900">
                                        Đang xem
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <div className="pt-3 border-t border-slate-100">
                        {isAuthenticated ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400 bg-amber-50 flex items-center justify-center">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-amber-800">{user?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                                        <p className="text-xs text-slate-500">{user?.email}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                                >
                                    Hồ sơ cá nhân & Cài đặt
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-2.5 text-center text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-950 shadow-sm"
                                >
                                    Đăng ký tài khoản
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
