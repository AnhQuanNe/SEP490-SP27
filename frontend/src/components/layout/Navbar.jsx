import { useState, useEffect, useRef } from 'react';
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
    Search, 
    Heart, 
    History, 
    Send,
    Bot,
    Compass,
    Trophy
} from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout, getAvatarUrl } = useAuth();
    const { openAiChat, isOpen: isAiChatOpen } = useAiChat();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    // Danh sách các mục điều hướng chuẩn hóa, xúc tích và tương ứng trực tiếp với chức năng hiện có
    const navItems = [
        { name: 'Trang chủ', path: '/', isRoute: true },
        { name: 'Khám phá', path: '/kham-pha', isRoute: true },
        { name: 'Bản đồ', path: '/ban-do', isRoute: true, icon: Compass },
        { name: 'Đố vui', path: '/do-vui', isRoute: true, icon: Trophy },
        { name: 'Đóng góp', path: '/dong-gop', isRoute: true },
        { name: 'Trợ lý AI', isAction: true, icon: Sparkles },
    ];

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tự động đóng mobile menu khi đổi trang
    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location.pathname, location.search]);

    // Kiểm tra trạng thái active rõ ràng cho từng mục
    const isItemActive = (item) => {
        if (item.isAction) {
            return isAiChatOpen;
        }
        if (item.path === '/') {
            return location.pathname === '/' && !location.search;
        }
        if (item.path === '/kham-pha') {
            return location.pathname === '/kham-pha';
        }
        if (item.path === '/dong-gop') {
            return location.pathname === '/dong-gop';
        }
        return location.pathname === item.path;
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
        }
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-[#fffdf9]/95 backdrop-blur-md border-b border-amber-900/15 shadow-[0_2px_12px_rgba(139,24,24,0.04)] transition-all">
            {/* Dải viền son - vàng hoàng kim trên đỉnh header */}
            <div className="h-1 w-full bg-gradient-to-r from-red-900 via-amber-500 to-red-900" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 gap-4">
                    
                    {/* CỤM LOGO, TÊN THƯƠNG HIỆU & TAGLINE */}
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                        <Link 
                            to="/" 
                            className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded-xl p-1"
                            title="VietHeritage AI — Về trang chủ"
                        >
                            {/* Biểu tượng Logo Ấn Triều & Sách Cổ */}
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-950 via-red-800 to-amber-600 flex items-center justify-center text-amber-300 shadow-md shadow-red-950/20 group-hover:scale-105 transition-transform border border-amber-400/50 relative flex-shrink-0">
                                <span className="absolute -top-1 -right-1 text-[8px] text-amber-300 font-bold select-none">❖</span>
                                <BookOpen className="w-5 h-5 text-amber-200" />
                            </div>

                            {/* Tên thương hiệu và khẩu hiệu */}
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center space-x-1.5 leading-none">
                                    <span className="text-xl sm:text-2xl font-black text-red-950 tracking-tight font-heritage">
                                        VietHeritage
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-amber-100 text-red-950 rounded border border-amber-300/90 flex items-center gap-1 shadow-2xs">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                        AI
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-stone-600 tracking-normal mt-1 flex items-center gap-1">
                                    <span className="text-amber-700 font-bold text-[9px]">❖</span> 
                                    <span className="hidden xs:inline">Kho Tàng Ca Dao, Tục Ngữ & Di Sản Việt</span>
                                    <span className="xs:hidden">Di Sản Văn Hóa Việt</span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* MỤC ĐIỀU HƯỚNG TRÊN DESKTOP (NAVBAR) */}
                    <nav 
                        aria-label="Menu điều hướng chính" 
                        className="hidden lg:flex items-center space-x-1 xl:space-x-1.5"
                    >
                        {navItems.map((item) => {
                            const active = isItemActive(item);
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={(e) => handleNavClick(item, e)}
                                    className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${
                                        active
                                            ? 'text-red-950 bg-amber-100/80 shadow-2xs border border-amber-300/80 font-bold'
                                            : 'text-stone-700 hover:text-red-950 hover:bg-amber-100/40 border border-transparent'
                                    }`}
                                >
                                    {IconComponent && (
                                        <IconComponent 
                                            className={`w-4 h-4 ${active ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-700'}`} 
                                        />
                                    )}
                                    <span>{item.name}</span>
                                    
                                    {/* Chỉ báo dòng gạch chân hoàng triều cho mục đang chọn */}
                                    {active && (
                                        <span className="absolute -bottom-1 left-3 right-3 h-[2.5px] bg-red-800 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* KHU VỰC HÀNH ĐỘNG BÊN PHẢI (AUTH & TÀI KHOẢN) */}
                    <div className="hidden sm:flex items-center space-x-3 flex-shrink-0">
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-full hover:bg-amber-100/50 transition-all border border-amber-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 cursor-pointer bg-white/70"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownOpen}
                                    title="Tùy chọn tài khoản"
                                >
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-bold text-stone-900 leading-tight max-w-[130px] truncate">
                                            {user?.name}
                                        </p>
                                        <p className="text-[11px] text-amber-800 capitalize font-medium flex items-center justify-end gap-1">
                                            {user?.role === 'admin' ? (
                                                <span className="inline-flex items-center text-purple-800 font-bold">
                                                    <ShieldCheck className="w-3 h-3 mr-0.5" /> Quản trị viên
                                                </span>
                                            ) : (
                                                'Độc giả'
                                            )}
                                        </p>
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-500/80 bg-amber-50 flex items-center justify-center flex-shrink-0 shadow-xs">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-red-900">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu chi tiết */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-[#fffdfa] rounded-2xl shadow-xl border border-amber-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-3 border-b border-amber-100 bg-[#fdf9f0] rounded-t-2xl">
                                            <p className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">Đang đăng nhập</p>
                                            <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">{user?.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-red-950 hover:bg-amber-50/80 transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-3 text-amber-700" />
                                                Hồ sơ cá nhân & Đổi mật khẩu
                                            </Link>

                                            <Link
                                                to="/yeu-thich"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-red-950 hover:bg-amber-50/80 transition-colors"
                                            >
                                                <Heart className="w-4 h-4 mr-3 text-red-600" />
                                                Mục yêu thích
                                            </Link>

                                            <Link
                                                to="/lich-su"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-red-950 hover:bg-amber-50/80 transition-colors"
                                            >
                                                <History className="w-4 h-4 mr-3 text-amber-800" />
                                                Lịch sử tra cứu
                                            </Link>

                                            <Link
                                                to="/dong-gop"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-red-950 hover:bg-amber-50/80 transition-colors"
                                            >
                                                <Send className="w-4 h-4 mr-3 text-amber-600" />
                                                Đóng góp ca dao, tục ngữ
                                            </Link>

                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2.5 text-xs font-bold text-purple-800 bg-purple-50/80 mx-2 my-1 rounded-xl hover:bg-purple-100 transition-colors border border-purple-200"
                                                >
                                                    <ShieldCheck className="w-4 h-4 mr-2 text-purple-700" />
                                                    Cổng Quản trị viên (Admin)
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-amber-100 my-1" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50/80 transition-colors cursor-pointer text-left"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-red-600" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="px-3.5 py-2 text-sm font-semibold text-stone-700 hover:text-red-900 hover:bg-amber-100/50 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-bold text-amber-50 bg-gradient-to-r from-red-800 via-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 rounded-xl shadow-xs border border-amber-400/40 transition-all hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 whitespace-nowrap"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* NÚT HAMBURGER MENU TRÊN MÀN HÌNH NHỎ (MOBILE & TABLET) */}
                    <div className="flex items-center lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-stone-800 hover:text-red-950 hover:bg-amber-100/60 border border-amber-300/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 cursor-pointer bg-white/60"
                            aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* BẢNG ĐIỀU HƯỚNG TRÊN MOBILE (DRAWER DROPDOWN) */}
            {mobileMenuOpen && (
                <div 
                    className="lg:hidden border-t border-amber-200/80 bg-[#fffdf9]/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                    id="mobile-navigation"
                >
                    {/* Danh sách các liên kết chính */}
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const active = isItemActive(item);
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={(e) => handleNavClick(item, e)}
                                    className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                        active
                                            ? 'bg-amber-100/90 text-red-950 border-l-4 border-red-800 font-bold shadow-2xs'
                                            : 'text-stone-700 hover:bg-amber-50/70'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {IconComponent && (
                                            <IconComponent 
                                                className={`w-4 h-4 ${active ? 'text-amber-700' : 'text-stone-500'}`} 
                                            />
                                        )}
                                        <span>{item.name}</span>
                                    </div>
                                    {active && <span className="w-2 h-2 rounded-full bg-red-700 animate-pulse" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Khu vực Auth cho Mobile */}
                    <div className="pt-3 mt-2 border-t border-amber-200/70">
                        {isAuthenticated ? (
                            <div className="space-y-1">
                                <div className="px-3 py-2 bg-amber-50/80 rounded-xl mb-2 flex items-center space-x-3 border border-amber-200/60">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500 bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-red-950">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                                        <p className="text-[10px] text-amber-800 font-medium truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center min-h-[40px] px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-amber-50 rounded-xl"
                                >
                                    <User className="w-4 h-4 mr-2.5 text-amber-700" />
                                    Hồ sơ cá nhân & Đổi mật khẩu
                                </Link>

                                <Link
                                    to="/yeu-thich"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center min-h-[40px] px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-amber-50 rounded-xl"
                                >
                                    <Heart className="w-4 h-4 mr-2.5 text-red-600" />
                                    Mục yêu thích
                                </Link>

                                <Link
                                    to="/lich-su"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center min-h-[40px] px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-amber-50 rounded-xl"
                                >
                                    <History className="w-4 h-4 mr-2.5 text-amber-800" />
                                    Lịch sử tra cứu
                                </Link>

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center min-h-[40px] px-3 py-2 text-xs font-bold text-purple-800 bg-purple-50 rounded-xl border border-purple-200 mt-1"
                                    >
                                        <ShieldCheck className="w-4 h-4 mr-2 text-purple-700" />
                                        Cổng Quản trị viên (Admin)
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left min-h-[40px] px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl flex items-center cursor-pointer mt-1"
                                >
                                    <LogOut className="w-4 h-4 mr-2.5 text-red-600" />
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pt-1">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full min-h-[44px] flex items-center justify-center text-center text-sm font-semibold text-stone-800 border border-amber-300 rounded-xl hover:bg-amber-50/80 bg-white"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full min-h-[44px] flex items-center justify-center text-center text-sm font-bold text-amber-50 bg-gradient-to-r from-red-800 to-amber-700 rounded-xl shadow-xs hover:from-red-700 hover:to-amber-600"
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
