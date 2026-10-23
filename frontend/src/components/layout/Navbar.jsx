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
    Heart, 
    History, 
    Send,
    Compass,
    GraduationCap,
    Trophy,
    Feather,
    Award,
    Swords,
    ChevronRight,
    Layers,
    Map,
    Bot,
    Share2
} from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout, getAvatarUrl } = useAuth();
    const { openAiChat, isOpen: isAiChatOpen } = useAiChat();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dropdownRef = useRef(null);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setSidebarOpen(false);
        navigate('/login');
    };

    const avatarSrc = user ? getAvatarUrl(user.avatar) : null;

    // Các mục chính giữ lại trên Header (tối giản, thông thoáng, thanh lịch)
    const primaryHeaderItems = [
        { name: 'Trang chủ', path: '/', isRoute: true },
        { name: 'Khám phá', path: '/kham-pha', isRoute: true },
        { name: 'Bản đồ', path: '/ban-do', isRoute: true, icon: Map },
        { name: 'Đồ thị Tri thức', path: '/do-thi-tri-thuc', isRoute: true, icon: Share2 },
        { name: 'Đố vui', path: '/do-vui', isRoute: true, icon: Trophy },
        { name: 'Gia sư AI', path: '/gia-su-ai', isRoute: true, icon: GraduationCap },
        { name: 'Trợ lý AI', isAction: true, icon: Sparkles },
    ];

    // Cấu trúc danh mục toàn diện được chuyển vào Thanh bên trái (Left Sidebar)
    const sidebarCategories = [
        {
            title: 'Khám phá & Học tập',
            icon: Compass,
            items: [
                { name: 'Trang chủ', path: '/', icon: BookOpen, desc: 'Tổng quan di sản & nổi bật' },
                { name: 'Kho tàng Di sản', path: '/kham-pha', icon: Compass, desc: 'Ca dao, tục ngữ & văn học dân gian' },
                { name: 'Bản đồ Văn hóa', path: '/ban-do', icon: Map, desc: 'Không gian văn hóa & địa danh 3 miền', badge: 'Mới', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
                { name: 'Đồ thị Tri thức', path: '/do-thi-tri-thuc', icon: Share2, desc: 'Mạng lưới liên kết tác phẩm & nhân vật', badge: 'Graph', badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
                { name: 'Gia sư AI Di sản', path: '/gia-su-ai', icon: GraduationCap, desc: 'Hỏi đáp văn hóa & điển tích xưa', badge: 'AI' },
            ]
        },
        {
            title: 'Khảo thí & Đấu trường',
            icon: Swords,
            items: [
                { name: 'Đấu trường Thi Đình', path: '/dau-truong', icon: Swords, desc: 'Tranh tài 1v1 thời gian thực', badge: 'Mới', badgeColor: 'bg-red-100 text-red-800 border-red-300' },
                { name: 'Đố vui Di sản', path: '/do-vui', icon: Trophy, desc: '25+ câu đố trắc nghiệm dân gian', badge: 'Kho đố', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
                { name: 'Bảng Vàng Trạng Nguyên', path: '/bang-vang', icon: Award, desc: 'Xếp hạng khoa bảng & danh sĩ', badge: 'Top', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
            ]
        },
        {
            title: 'Sáng tác & Đóng góp',
            icon: Feather,
            items: [
                { name: 'Studio Thơ Lục Bát', path: '/studio-tho', icon: Feather, desc: 'Kiểm tra luật Bằng Trắc & gợi ý thơ', badge: 'AI Soát luật', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                { name: 'Đóng góp di sản', path: '/dong-gop', icon: Send, desc: 'Gửi tác phẩm & đóng góp kho tàng' },
            ]
        },
        {
            title: 'Cá nhân & Tiện ích',
            icon: User,
            items: [
                { name: 'Mục yêu thích', path: '/yeu-thich', icon: Heart, desc: 'Tác phẩm ca dao đã lưu trữ' },
                { name: 'Lịch sử tra cứu', path: '/lich-su', icon: History, desc: 'Hồ sơ tìm kiếm gần đây' },
                ...(isAuthenticated ? [
                    { name: 'Lộ trình học cá nhân', path: '/lo-trinh-hoc', icon: GraduationCap, desc: 'Kế hoạch học tập & tiến độ' },
                    { name: 'Hồ sơ cá nhân', path: '/profile', icon: User, desc: 'Thông tin tài khoản & danh hiệu' }
                ] : []),
                ...(user?.role === 'admin' ? [{ name: 'Cổng Quản trị (Admin)', path: '/admin', icon: ShieldCheck, desc: 'Quản lý kho tư liệu & người dùng', badge: 'Admin', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' }] : []),
            ]
        }
    ];

    // Đóng dropdown tài khoản khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tự động đóng sidebar và dropdown khi thay đổi trang hoặc nhấn ESC
    useEffect(() => {
        setSidebarOpen(false);
        setDropdownOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
                setDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Khóa cuộn trang khi mở thanh bên trái
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarOpen]);

    // Kiểm tra trạng thái active
    const isItemActive = (path, isAction) => {
        if (isAction) return isAiChatOpen;
        if (path === '/') return location.pathname === '/' && !location.search;
        if (path === '/gia-su-ai') return location.pathname === '/gia-su-ai' || location.pathname === '/ai-tutor';
        return location.pathname === path;
    };

    const handleNavClick = (item, e) => {
        if (item.isAction) {
            if (e) e.preventDefault();
            openAiChat();
            setSidebarOpen(false);
            return;
        }

        if (item.isRoute || item.path) {
            navigate(item.path);
        }
        setSidebarOpen(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-[#fffdf9]/95 backdrop-blur-md border-b border-amber-900/15 shadow-[0_2px_12px_rgba(139,24,24,0.04)] transition-all">
                {/* Dải viền son - vàng hoàng kim trên đỉnh header */}
                <div className="h-1 w-full bg-gradient-to-r from-red-900 via-amber-500 to-red-900" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 gap-3">
                        
                        {/* CỤM BÊN TRÁI: NÚT MỞ THANH DANH MỤC + LOGO THƯƠNG HIỆU */}
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                            {/* Nút bật Thanh bên trái (Menu Drawer Trigger) */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-stone-800 hover:text-red-950 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-300/80 hover:border-amber-400 transition-all cursor-pointer shadow-2xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                title="Mở danh mục di sản & công cụ văn hóa"
                                aria-label="Mở thanh danh mục di sản bên trái"
                            >
                                <Menu className="w-5 h-5 text-amber-800 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-amber-950">
                                    Danh mục
                                </span>
                            </button>

                            {/* Cụm Logo & Tiêu đề */}
                            <Link 
                                to="/" 
                                className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded-xl p-1"
                                title="VietHeritage AI — Về trang chủ"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-950 via-red-800 to-amber-600 flex items-center justify-center text-amber-300 shadow-md shadow-red-950/20 group-hover:scale-105 transition-transform border border-amber-400/50 relative flex-shrink-0">
                                    <span className="absolute -top-1 -right-1 text-[8px] text-amber-300 font-bold select-none">❖</span>
                                    <BookOpen className="w-5 h-5 text-amber-200" />
                                </div>

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
                                        <span className="hidden md:inline">Kho Tàng Ca Dao, Tục Ngữ & Di Sản Việt</span>
                                        <span className="md:hidden">Di Sản Văn Hóa Việt</span>
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* MỤC ĐIỀU HƯỚNG TRÊN HEADER (CHỈ GIỮ LẠI CÁC MỤC CỐT LÕI) */}
                        <nav
                            aria-label="Menu điều hướng chính"
                            className="hidden md:flex items-center space-x-1.5 lg:space-x-2"
                        >
                            {primaryHeaderItems.map((item) => {
                                const active = isItemActive(item.path, item.isAction);
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={(e) => handleNavClick(item, e)}
                                        className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${
                                            active
                                                ? 'text-red-950 bg-amber-100/90 shadow-2xs border border-amber-300 font-bold'
                                                : 'text-stone-700 hover:text-red-950 hover:bg-amber-100/40 border border-transparent'
                                        }`}
                                    >
                                        {IconComponent && (
                                            <IconComponent 
                                                className={`w-4 h-4 ${active ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-700'}`} 
                                            />
                                        )}
                                        <span>{item.name}</span>
                                        
                                        {/* Chỉ báo active */}
                                        {active && (
                                            <span className="absolute -bottom-1 left-3 right-3 h-[2.5px] bg-red-800 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* KHU VỰC HÀNH ĐỘNG BÊN PHẢI (TÀI KHOẢN & ĐĂNG NHẬP) */}
                        <div className="flex items-center space-x-2.5 flex-shrink-0">
                            {isAuthenticated ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-full hover:bg-amber-100/50 transition-all border border-amber-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 cursor-pointer bg-white/70"
                                        aria-haspopup="true"
                                        aria-expanded={dropdownOpen}
                                        title="Tùy chọn tài khoản"
                                    >
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-bold text-stone-900 leading-tight max-w-[120px] truncate">
                                                {user?.name}
                                            </p>
                                            <p className="text-[10px] text-amber-800 capitalize font-medium flex items-center justify-end gap-1">
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
                                                    to="/lo-trinh-hoc"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-red-950 hover:bg-amber-50/80 transition-colors"
                                                >
                                                    <GraduationCap className="w-4 h-4 mr-3 text-amber-700" />
                                                    Lộ trình học cá nhân
                                                </Link>

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
                                        className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-red-900 hover:bg-amber-100/50 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-amber-50 bg-gradient-to-r from-red-800 via-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 rounded-xl shadow-xs border border-amber-400/40 transition-all hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 whitespace-nowrap"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </header>

            {/* THANH BÊN TRÁI (LEFT SIDEBAR DRAWER) & BACKDROP */}
            {/* Lớp nền mờ (Backdrop overlay) */}
            <div 
                className={`fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Khung trượt thanh bên trái (Slide-over Navigation Rail / Drawer) */}
            <aside
                ref={sidebarRef}
                className={`fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-92 bg-[#fffdf9] shadow-2xl border-r border-amber-900/15 flex flex-col transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Thanh điều hướng danh mục di sản bên trái"
            >
                {/* Header thanh bên trái */}
                <div className="p-4 sm:p-5 border-b border-amber-200/80 bg-gradient-to-b from-[#fdf7ee] to-[#fffdf9] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-950 via-red-800 to-amber-600 flex items-center justify-center text-amber-300 shadow-md border border-amber-400/50">
                            <Layers className="w-5 h-5 text-amber-200" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-red-950 leading-tight font-heritage">
                                Danh Mục Di Sản
                            </h2>
                            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                                Bản đồ tri thức & Không gian văn hóa
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-red-950 hover:bg-amber-100/70 border border-amber-200/60 transition-colors cursor-pointer"
                        title="Đóng thanh danh mục (Esc)"
                        aria-label="Đóng thanh danh mục"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Thẻ mở nhanh Trợ lý AI */}
                <div className="px-4 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(false);
                            openAiChat();
                        }}
                        className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-amber-900 text-amber-100 flex items-center justify-between shadow-md hover:shadow-lg hover:scale-[1.01] transition-all border border-amber-500/40 cursor-pointer group text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:rotate-12 transition-transform">
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>Trợ Lý Di Sản AI</span>
                                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-400/20 border border-amber-300/40 rounded text-amber-300 font-mono">
                                        Trực tuyến
                                    </span>
                                </div>
                                <div className="text-[11px] text-amber-200/80">Tra cứu nhanh & luận bình câu thơ</div>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Danh sách các nhóm chuyên mục có cuộn */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
                    {sidebarCategories.map((cat, idx) => (
                        <div key={idx} className="space-y-1.5">
                            {/* Tiêu đề nhóm */}
                            <div className="px-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                                <cat.icon className="w-3.5 h-3.5 text-amber-700" />
                                <span>{cat.title}</span>
                            </div>

                            {/* Danh sách các link trong nhóm */}
                            <div className="space-y-1">
                                {cat.items.map((item) => {
                                    const active = isItemActive(item.path, false);
                                    const ItemIcon = item.icon;
                                    return (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => handleNavClick(item)}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                                                active
                                                    ? 'bg-amber-100/90 text-red-950 font-bold border-l-4 border-red-800 shadow-2xs'
                                                    : 'text-stone-700 hover:text-red-950 hover:bg-amber-50/80'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                                    active
                                                        ? 'bg-red-800 text-amber-200 shadow-xs'
                                                        : 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                                                }`}>
                                                    <ItemIcon className="w-4 h-4" />
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-xs font-bold leading-snug truncate">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[10px] text-stone-500 font-normal truncate mt-0.5">
                                                        {item.desc}
                                                    </div>
                                                </div>
                                            </div>

                                            {item.badge && (
                                                <span className={`ml-2 px-1.5 py-0.5 text-[10px] font-extrabold rounded border flex-shrink-0 ${item.badgeColor || 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer của Thanh bên trái (Trạng thái người dùng hoặc Đăng nhập) */}
                <div className="p-4 border-t border-amber-200/80 bg-[#fdf9f2]">
                    {isAuthenticated ? (
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5 overflow-hidden">
                                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-500 bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-red-950">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <div className="text-xs font-bold text-stone-900 truncate">{user?.name}</div>
                                        <div className="text-[10px] text-amber-800 truncate font-medium">{user?.email}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                to="/login"
                                onClick={() => setSidebarOpen(false)}
                                className="py-2 text-center text-xs font-bold text-stone-800 bg-white border border-amber-300 rounded-xl hover:bg-amber-50 transition-colors shadow-2xs"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setSidebarOpen(false)}
                                className="py-2 text-center text-xs font-bold text-amber-50 bg-gradient-to-r from-red-800 to-amber-700 rounded-xl hover:from-red-700 hover:to-amber-600 transition-colors shadow-2xs"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Navbar;
