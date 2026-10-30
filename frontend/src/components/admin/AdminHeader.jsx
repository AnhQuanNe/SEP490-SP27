import { Menu, Activity, RefreshCw, Calendar, Sparkles } from 'lucide-react';

const TAB_TITLES = {
    overview: 'Tổng quan Hệ thống',
    submissions: 'Kiểm duyệt Đóng góp Di sản',
    users: 'Quản lý Tài khoản & Sĩ tử',
    works: 'Kho tàng Tác phẩm Xuất bản',
    settings: 'Cấu hình & Thiết lập Tham số',
};

const AdminHeader = ({ activeTab, onOpenMobile, onRefresh, refreshing }) => {
    const todayStr = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date());

    return (
        <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Breadcrumb */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenMobile}
                    className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    aria-label="Mở menu điều hướng"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 hidden sm:inline">Quản Trị</span>
                    <span className="text-slate-600 hidden sm:inline">/</span>
                    <h1 className="text-sm font-bold text-slate-100 font-heritage tracking-wide">
                        {TAB_TITLES[activeTab] || 'Bảng Điều Khiển'}
                    </h1>
                </div>
            </div>

            {/* Right: System status, Date, Refresh */}
            <div className="flex items-center gap-3">
                {/* Realtime System Health Status */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-medium text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Máy chủ: <strong className="text-emerald-400 font-semibold">Trực tuyến</strong></span>
                    <span className="text-slate-600">|</span>
                    <span>AI Engine: <strong className="text-amber-400 font-semibold">Hoạt động</strong></span>
                </div>

                {/* Date */}
                <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-500/80" />
                    <span className="capitalize">{todayStr}</span>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    title="Làm mới dữ liệu"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">Làm mới</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
