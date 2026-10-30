import { 
    LayoutDashboard, 
    FileCheck, 
    Users, 
    BookOpen, 
    Settings, 
    Globe, 
    LogOut, 
    ShieldCheck, 
    X,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    {
        id: 'overview',
        label: 'Tổng quan Hệ thống',
        shortLabel: 'Tổng quan',
        icon: LayoutDashboard,
        badgeKey: null,
    },
    {
        id: 'submissions',
        label: 'Kiểm duyệt Đóng góp',
        shortLabel: 'Kiểm duyệt',
        icon: FileCheck,
        badgeKey: 'pendingSubmissions',
    },
    {
        id: 'users',
        label: 'Quản lý Người dùng',
        shortLabel: 'Người dùng',
        icon: Users,
        badgeKey: null,
    },
    {
        id: 'works',
        label: 'Kho tàng Xuất bản',
        shortLabel: 'Kho tàng',
        icon: BookOpen,
        badgeKey: null,
    },
    {
        id: 'settings',
        label: 'Cấu hình Hệ thống',
        shortLabel: 'Cấu hình',
        icon: Settings,
        badgeKey: null,
    },
];

const AdminSidebar = ({ activeTab, onSelectTab, stats, mobileOpen, onCloseMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const pendingCount = stats?.submissions?.pending || 0;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <>
            {/* Backdrop for Mobile */}
            {mobileOpen && (
                <div 
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* 1. Header / Logo Brand */}
                <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-950/40">
                            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-heritage font-bold text-base text-amber-200 tracking-wide">
                                    VietHeritage
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    AI
                                </span>
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                Quản Trị Hệ Thống
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onCloseMobile}
                        className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
                        aria-label="Đóng menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. Navigation Modules */}
                <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Bảng Quản Trị
                    </div>

                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const hasBadge = item.id === 'submissions' && pendingCount > 0;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onSelectTab(item.id);
                                    if (onCloseMobile) onCloseMobile();
                                }}
                                className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-amber-600/20 via-amber-600/10 to-transparent text-amber-300 border-l-4 border-amber-500 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-4 border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 transition-colors ${
                                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                                    }`} />
                                    <span>{item.label}</span>
                                </div>

                                {hasBadge ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                        {pendingCount}
                                    </span>
                                ) : (
                                    isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400/80" />
                                )}
                            </button>
                        );
                    })}

                    <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Điều Hướng Ngoài
                    </div>

                    <Link
                        to="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-amber-200 hover:bg-slate-800/40 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <span>Xem trang công chúng</span>
                        </div>
                        <span className="text-[10px] text-slate-500">↗</span>
                    </Link>
                </div>

                {/* 3. Footer Admin Profile & Logout */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-200 truncate">
                                    {user?.name || 'Quản Trị Viên'}
                                </p>
                                <p className="text-[10px] text-amber-400/90 font-medium truncate">
                                    admin@vietheritage.vn
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Đăng xuất quản trị"
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
