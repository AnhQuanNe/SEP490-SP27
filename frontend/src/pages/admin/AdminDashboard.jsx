import { useState, useEffect, useCallback } from 'react';
import { 
    Users, 
    FileCheck, 
    BookOpen, 
    Settings, 
    ShieldCheck, 
    Lock, 
    Unlock, 
    CheckCircle2, 
    XCircle, 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    Loader2, 
    AlertCircle, 
    Save, 
    Eye,
    TrendingUp,
    Clock,
    Activity,
    ArrowUpRight,
    ArrowRight,
    Sparkles,
    Check,
    X,
    Filter,
    Layers,
    UserCheck,
    UserX,
    HelpCircle
} from 'lucide-react';
import adminService from '../../services/admin.service';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import UserGrowthChart from '../../components/admin/charts/UserGrowthChart';
import HeritageCategoryDonutChart from '../../components/admin/charts/HeritageCategoryDonutChart';
import SubmissionRateChart from '../../components/admin/charts/SubmissionRateChart';

const AdminDashboard = () => {
    // Current Active Tab: 'overview' | 'submissions' | 'users' | 'works' | 'settings'
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Toast Notification Banner
    const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'info', message: string }
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ==========================================
    // 0. KPI STATS OVERVIEW
    // ==========================================
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.warn('Lỗi tải thống kê dashboard:', err.message);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // ==========================================
    // 1. STATE: SUBMISSIONS (UC16 & UC17)
    // ==========================================
    const [submissions, setSubmissions] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [subStatusFilter, setSubStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
    const [selectedSub, setSelectedSub] = useState(null); // Sub currently viewed in modal
    const [adminNoteInput, setAdminNoteInput] = useState('');
    const [reviewActionLoading, setReviewActionLoading] = useState(false);

    const loadSubmissions = useCallback(async () => {
        setSubLoading(true);
        try {
            const data = await adminService.getSubmissions({ status: subStatusFilter });
            setSubmissions(data.submissions || []);
        } catch (err) {
            console.error('Lỗi tải bài đóng góp:', err);
            showToast('Không thể tải danh sách đóng góp', 'error');
        } finally {
            setSubLoading(false);
        }
    }, [subStatusFilter]);

    const handleApprove = async (sub) => {
        setReviewActionLoading(true);
        try {
            await adminService.approveSubmission(sub._id, adminNoteInput || 'Đã kiểm duyệt đạt chuẩn học thuật.');
            showToast(`Đã duyệt & xuất bản thành công: "${sub.title}"`);
            setSelectedSub(null);
            setAdminNoteInput('');
            loadSubmissions();
            loadStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi phê duyệt bài', 'error');
        } finally {
            setReviewActionLoading(false);
        }
    };

    const handleReject = async (sub) => {
        if (!adminNoteInput.trim()) {
            showToast('Vui lòng ghi lý do từ chối để sĩ tử hoàn thiện thêm', 'error');
            return;
        }

        setReviewActionLoading(true);
        try {
            await adminService.rejectSubmission(sub._id, adminNoteInput);
            showToast(`Đã từ chối bài: "${sub.title}"`);
            setSelectedSub(null);
            setAdminNoteInput('');
            loadSubmissions();
            loadStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi từ chối bài', 'error');
        } finally {
            setReviewActionLoading(false);
        }
    };

    // ==========================================
    // 2. STATE: USERS (UC15)
    // ==========================================
    const [users, setUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');

    // User Confirmation Modals
    const [confirmUserStatus, setConfirmUserStatus] = useState(null); // user object to lock/unlock
    const [confirmUserRole, setConfirmUserRole] = useState(null); // user object to promote/demote

    const loadUsers = useCallback(async () => {
        setUserLoading(true);
        try {
            const data = await adminService.getUsers({
                search: userSearch,
                role: userRoleFilter,
                status: userStatusFilter,
            });
            setUsers(data.users || []);
        } catch (err) {
            console.error('Lỗi tải danh sách người dùng:', err);
            showToast('Không thể tải danh sách sĩ tử', 'error');
        } finally {
            setUserLoading(false);
        }
    }, [userSearch, userRoleFilter, userStatusFilter]);

    const executeToggleUserStatus = async () => {
        if (!confirmUserStatus) return;
        const target = confirmUserStatus;
        const newStatus = target.status === 'locked' ? 'active' : 'locked';

        try {
            await adminService.updateUserStatus(target._id, newStatus);
            setUsers(users.map((u) => (u._id === target._id ? { ...u, status: newStatus } : u)));
            showToast(`Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản: ${target.email}`);
            setConfirmUserStatus(null);
            loadStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi cập nhật trạng thái', 'error');
        }
    };

    const executeToggleUserRole = async () => {
        if (!confirmUserRole) return;
        const target = confirmUserRole;
        const newRole = target.role === 'admin' ? 'customer' : 'admin';

        try {
            await adminService.updateUserRole(target._id, newRole);
            setUsers(users.map((u) => (u._id === target._id ? { ...u, role: newRole } : u)));
            showToast(`Đã cập nhật vai trò ${target.email} thành ${newRole.toUpperCase()}`);
            setConfirmUserRole(null);
            loadStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi cập nhật vai trò', 'error');
        }
    };

    // ==========================================
    // 3. STATE: WORKS CMS (UC18)
    // ==========================================
    const [works, setWorks] = useState([]);
    const [worksLoading, setWorksLoading] = useState(false);
    const [workSearch, setWorkSearch] = useState('');
    const [workCategoryFilter, setWorkCategoryFilter] = useState('all');
    const [editingWork, setEditingWork] = useState(null); // null = closed, {} = create new, { _id: ... } = edit
    const [deleteWorkTarget, setDeleteWorkTarget] = useState(null);

    const [workForm, setWorkForm] = useState({
        title: '',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca',
        topic: 'Lòng biết ơn',
        summary: '',
        literalMeaning: '',
        figurativeMeaning: '',
        lesson: '',
        historicalContext: '',
        source: '',
        status: 'published',
    });

    const loadWorks = useCallback(async () => {
        setWorksLoading(true);
        try {
            const data = await adminService.getWorks({
                search: workSearch,
                category: workCategoryFilter,
            });
            setWorks(data.works || []);
        } catch (err) {
            console.error('Lỗi tải tác phẩm kho tàng:', err);
            showToast('Không thể tải kho tàng tác phẩm', 'error');
        } finally {
            setWorksLoading(false);
        }
    }, [workSearch, workCategoryFilter]);

    const openCreateWork = () => {
        setEditingWork({});
        setWorkForm({
            title: '',
            category: 'ca-dao',
            categoryName: 'Ca dao Dân ca',
            topic: 'Lòng biết ơn',
            summary: '',
            literalMeaning: '',
            figurativeMeaning: '',
            lesson: '',
            historicalContext: '',
            source: '',
            status: 'published',
        });
    };

    const openEditWork = (w) => {
        setEditingWork(w);
        setWorkForm({
            title: w.title,
            category: w.category,
            categoryName: w.categoryName || 'Ca dao Dân ca',
            topic: w.topic || 'Văn hóa & Đạo lý',
            summary: w.summary || '',
            literalMeaning: w.literalMeaning || '',
            figurativeMeaning: w.figurativeMeaning || '',
            lesson: w.lesson || '',
            historicalContext: w.historicalContext || '',
            source: w.source || '',
            status: w.status || 'published',
        });
    };

    const handleSaveWork = async (e) => {
        e.preventDefault();
        try {
            if (editingWork._id) {
                await adminService.updateWork(editingWork._id, workForm);
                showToast(`Đã cập nhật tác phẩm: "${workForm.title}"`);
            } else {
                await adminService.createWork(workForm);
                showToast(`Đã thêm tác phẩm mới: "${workForm.title}"`);
            }
            setEditingWork(null);
            loadWorks();
            loadStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi lưu tác phẩm', 'error');
        }
    };

    const executeDeleteWork = async () => {
        if (!deleteWorkTarget) return;
        try {
            await adminService.deleteWork(deleteWorkTarget._id);
            showToast(`Đã xóa tác phẩm: "${deleteWorkTarget.title}"`);
            setDeleteWorkTarget(null);
            loadWorks();
            loadStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi xóa tác phẩm', 'error');
        }
    };

    // ==========================================
    // 4. STATE: SYSTEM SETTINGS (UC19)
    // ==========================================
    const [settingsList, setSettingsList] = useState([]);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const loadSettings = useCallback(async () => {
        setSettingsLoading(true);
        try {
            const data = await adminService.getSettings();
            setSettingsList(data || []);
        } catch (err) {
            console.error('Lỗi tải thiết lập hệ thống:', err);
            showToast('Không thể tải cấu hình hệ thống', 'error');
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    const handleToggleSetting = async (key, currentValue) => {
        try {
            await adminService.updateSetting(key, !currentValue);
            setSettingsList(settingsList.map((s) => (s.key === key ? { ...s, value: !currentValue } : s)));
            showToast(`Đã chuyển trạng thái [${key}] thành ${!currentValue ? 'BẬT' : 'TẮT'}`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi cập nhật thiết lập', 'error');
        }
    };

    const handleUpdateSettingNotice = async (key, newValue) => {
        try {
            await adminService.updateSetting(key, newValue);
            showToast(`Đã lưu thiết lập [${key}]`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi cập nhật', 'error');
        }
    };

    // Trigger data loading on tab changes
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        if (activeTab === 'submissions') loadSubmissions();
        else if (activeTab === 'users') loadUsers();
        else if (activeTab === 'works') loadWorks();
        else if (activeTab === 'settings') loadSettings();
    }, [activeTab, loadSubmissions, loadUsers, loadWorks, loadSettings]);

    // Handle global refresh button in topbar
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadStats(),
            activeTab === 'submissions' && loadSubmissions(),
            activeTab === 'users' && loadUsers(),
            activeTab === 'works' && loadWorks(),
            activeTab === 'settings' && loadSettings(),
        ]);
        setRefreshing(false);
        showToast('Đã làm mới toàn bộ dữ liệu');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-vietnam selection:bg-amber-500 selection:text-slate-950">
            {/* 1. Left Sidebar Navigation */}
            <AdminSidebar
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                stats={stats}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* 2. Main Content Body (Offset on Desktop by Sidebar width: 288px) */}
            <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                {/* Header Topbar */}
                <AdminHeader
                    activeTab={activeTab}
                    onOpenMobile={() => setMobileOpen(true)}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                {/* Toast Notification Banner */}
                {toast && (
                    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
                        <div className={`px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md ${
                            toast.type === 'error'
                                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/40'
                                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/40'
                        }`}>
                            {toast.type === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-rose-400" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            <span>{toast.message}</span>
                            <button
                                onClick={() => setToast(null)}
                                className="ml-2 text-slate-400 hover:text-white"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Workspace */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl w-full mx-auto">
                    {/* ============================================================ */}
                    {/* TAB 0: TỔNG QUAN HỆ THỐNG (OVERVIEW & KPI METRICS) */}
                    {/* ============================================================ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Header Greeting */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
                                <div>
                                    <h2 className="text-2xl font-bold font-heritage text-amber-200 tracking-tight">
                                        Bảng Điều Hành Trung Tâm
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                        Giám sát các chỉ số vận hành, luồng kiểm duyệt di sản và hoạt động sĩ tử thời gian thực.
                                    </p>
                                </div>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                                    <span>Hệ Thống Trực Tuyến</span>
                                </div>
                            </div>

                            {/* 4 HÀNG THẺ KPI METRIC CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {/* KPI 1: Người dùng */}
                                <div 
                                    onClick={() => setActiveTab('users')}
                                    className="group cursor-pointer rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-amber-500/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            {stats?.users?.active || 0} đang hoạt động
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Sĩ tử & Tài khoản
                                    </p>
                                    <div className="flex items-baseline justify-between mt-1">
                                        <h3 className="text-2xl font-extrabold text-white font-heritage">
                                            {stats?.users?.total || 0}
                                        </h3>
                                        <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-0.5">
                                            Quản lý <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>

                                {/* KPI 2: Đóng góp chờ duyệt */}
                                <div 
                                    onClick={() => setActiveTab('submissions')}
                                    className={`group cursor-pointer rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${
                                        (stats?.submissions?.pending || 0) > 0
                                            ? 'border-amber-500/40 hover:border-amber-400'
                                            : 'border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                            <FileCheck className="w-5 h-5" />
                                        </div>
                                        {(stats?.submissions?.pending || 0) > 0 ? (
                                            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                                                Cần thẩm định
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                                Đã xử lý hết
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Bài Chờ Thẩm Định
                                    </p>
                                    <div className="flex items-baseline justify-between mt-1">
                                        <h3 className="text-2xl font-extrabold text-amber-200 font-heritage">
                                            {stats?.submissions?.pending || 0}
                                        </h3>
                                        <span className="text-xs text-amber-400/90 group-hover:text-amber-300 transition-colors flex items-center gap-0.5">
                                            Thẩm định <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>

                                {/* KPI 3: Tác phẩm kho tàng */}
                                <div 
                                    onClick={() => setActiveTab('works')}
                                    className="group cursor-pointer rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            Đã xuất bản
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Kho Tàng Xuất Bản
                                    </p>
                                    <div className="flex items-baseline justify-between mt-1">
                                        <h3 className="text-2xl font-extrabold text-white font-heritage">
                                            {stats?.works?.total || 0}
                                        </h3>
                                        <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                                            Xem kho <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>

                                {/* KPI 4: Trạng thái hệ thống */}
                                <div 
                                    onClick={() => setActiveTab('settings')}
                                    className="group cursor-pointer rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-purple-500/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                            {stats?.system?.nodeVersion || 'Node.js'}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Tham Số Vận Hành
                                    </p>
                                    <div className="flex items-baseline justify-between mt-1">
                                        <h3 className="text-2xl font-extrabold text-purple-200 font-heritage">
                                            Sẵn Sàng
                                        </h3>
                                        <span className="text-xs text-slate-500 group-hover:text-purple-400 transition-colors flex items-center gap-0.5">
                                            Thiết lập <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ============================================================ */}
                            {/* HÀNG BIỂU ĐỒ TRỰC QUAN HÓA 1: TĂNG TRƯỞNG & PHÂN BỔ THỂ LOẠI */}
                            {/* ============================================================ */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Biểu đồ xu hướng tăng trưởng Sĩ tử (2/3) */}
                                <div className="lg:col-span-2">
                                    <UserGrowthChart data={stats?.trends?.userGrowth} />
                                </div>

                                {/* Biểu đồ tròn phân bổ kho tàng di sản (1/3) */}
                                <div>
                                    <HeritageCategoryDonutChart
                                        byCategory={stats?.works?.byCategory}
                                        totalWorks={stats?.works?.total}
                                    />
                                </div>
                            </div>

                            {/* ============================================================ */}
                            {/* HÀNG BIỂU ĐỒ 2: TIẾN ĐỘ THẨM ĐỊNH & BÀI NỘP GẦN ĐÂY */}
                            {/* ============================================================ */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Biểu đồ tỷ lệ phê duyệt thẩm định */}
                                <div>
                                    <SubmissionRateChart submissionsStats={stats?.submissions} />
                                </div>

                                {/* Danh sách đóng góp gần đây & Lối tắt */}
                                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-amber-400" />
                                                <h3 className="text-sm font-bold text-slate-100 font-heritage tracking-wide">
                                                    Đóng Góp Mới Gửi Lên Gần Đây
                                                </h3>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('submissions')}
                                                className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                Xem tất cả ({stats?.submissions?.total || 0})
                                            </button>
                                        </div>

                                        {(!stats?.recentSubmissions || stats.recentSubmissions.length === 0) ? (
                                            <div className="py-8 text-center text-xs text-slate-500">
                                                Chưa có bài đóng góp mới nào trong hàng đợi.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-800/80">
                                                {stats.recentSubmissions.slice(0, 4).map((sub) => (
                                                    <div key={sub._id} className="py-2.5 flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-bold text-slate-200 truncate">
                                                                {sub.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                                <span>Bởi: <strong className="text-slate-300">{sub.contributorId?.name || 'Sĩ tử'}</strong></span>
                                                                <span>•</span>
                                                                <span>{new Date(sub.createdAt).toLocaleDateString('vi-VN')}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                sub.status === 'pending'
                                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                                    : sub.status === 'approved'
                                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                                    : 'bg-rose-500/20 text-rose-300'
                                                            }`}>
                                                                {sub.status === 'pending' ? 'Chờ duyệt' : sub.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSub(sub);
                                                                    setAdminNoteInput(sub.adminNote || '');
                                                                    setActiveTab('submissions');
                                                                }}
                                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                                                                title="Xem thẩm định"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lối tắt soạn thảo nhanh */}
                                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-400">
                                            Bổ sung tư liệu mới vào kho tàng:
                                        </p>
                                        <button
                                            onClick={() => {
                                                setActiveTab('works');
                                                openCreateWork();
                                            }}
                                            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Soạn tác phẩm mới</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 1: KIỂM DUYỆT ĐÓNG GÓP (UC16 & UC17) */}
                    {/* ============================================================ */}
                    {activeTab === 'submissions' && (
                        <div className="space-y-6">
                            {/* Toolbar: Filters & Counter */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                    <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
                                        <Filter className="w-3.5 h-3.5" /> Lọc:
                                    </span>
                                    {[
                                        { id: 'pending', label: 'Chờ thẩm định' },
                                        { id: 'approved', label: 'Đã xuất bản' },
                                        { id: 'rejected', label: 'Đã từ chối' },
                                        { id: 'all', label: 'Tất cả' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setSubStatusFilter(tab.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                                subStatusFilter === tab.id
                                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="text-xs text-slate-400">
                                    Tìm thấy: <strong className="text-amber-300 font-bold">{submissions.length}</strong> bài nộp
                                </div>
                            </div>

                            {/* Submissions List */}
                            {subLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                                    <p className="text-xs text-slate-400">Đang tải danh sách bài đóng góp...</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
                                    <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-slate-300">Không có bài đóng góp nào trong mục này</p>
                                    <p className="text-xs text-slate-500 mt-1">Các bài sĩ tử gửi lên sẽ xuất hiện tại đây để hội đồng thẩm định duyệt.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {submissions.map((sub) => (
                                        <div
                                            key={sub._id}
                                            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                        >
                                            <div className="space-y-2 max-w-2xl">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                                        {sub.category || 'Ca dao'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        sub.status === 'pending'
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                            : sub.status === 'approved'
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                                    }`}>
                                                        {sub.status === 'pending' ? 'Chờ duyệt' : sub.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        Gửi ngày: {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-slate-100 font-heritage">
                                                    {sub.title}
                                                </h3>

                                                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                                    {sub.summary || sub.literalMeaning || 'Không có mô tả chi tiết'}
                                                </p>

                                                {sub.adminNote && (
                                                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                                                        <strong className="text-amber-400">Phản hồi của Admin:</strong> {sub.adminNote}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSub(sub);
                                                        setAdminNoteInput(sub.adminNote || '');
                                                    }}
                                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Xem & Thẩm định</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* MODAL THẨM ĐỊNH & PHÊ DUYỆT BÀI ĐÓNG GÓP */}
                            {selectedSub && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 sm:p-8 shadow-2xl text-slate-100 space-y-5">
                                        <button
                                            onClick={() => setSelectedSub(null)}
                                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                {selectedSub.category || 'Ca dao'}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                Mã: <code className="font-mono text-slate-300">{selectedSub._id?.slice(-6)}</code>
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold font-heritage text-amber-200">
                                            {selectedSub.title}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                                <span className="text-slate-400 font-bold uppercase text-[10px]">Nghĩa đen:</span>
                                                <p className="text-slate-200 leading-relaxed">{selectedSub.literalMeaning || 'Chưa cung cấp'}</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                                <span className="text-slate-400 font-bold uppercase text-[10px]">Nghĩa bóng / Ẩn dụ:</span>
                                                <p className="text-slate-200 leading-relaxed">{selectedSub.figurativeMeaning || 'Chưa cung cấp'}</p>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                                            <span className="text-slate-400 font-bold uppercase text-[10px]">Bài học & Thông điệp:</span>
                                            <p className="text-slate-200 leading-relaxed">{selectedSub.lesson || 'Chưa cung cấp'}</p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                                            <span className="text-slate-400 font-bold uppercase text-[10px]">Nguồn kiểm chứng học thuật:</span>
                                            <p className="text-amber-300 italic">{selectedSub.source || 'Sưu tầm dân gian'}</p>
                                        </div>

                                        {/* Ghi chú phản hồi của Admin */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-slate-300">
                                                Ghi chú Thẩm Định (gửi phản hồi cho sĩ tử):
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={adminNoteInput}
                                                onChange={(e) => setAdminNoteInput(e.target.value)}
                                                placeholder="Nhập nhận xét học thuật, lý do xuất bản hoặc lý do cần chỉnh sửa thêm..."
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSub(null)}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                                            >
                                                Đóng
                                            </button>

                                            {selectedSub.status === 'pending' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={reviewActionLoading}
                                                        onClick={() => handleReject(selectedSub)}
                                                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4 text-rose-400" />
                                                        <span>Từ Chối Đóng Góp</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={reviewActionLoading}
                                                        onClick={() => handleApprove(selectedSub)}
                                                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Phê Duyệt & Xuất Bản</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG (UC15) */}
                    {/* ============================================================ */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Toolbar: Search & Role / Status Filters */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                                <div className="relative w-full sm:w-80">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên, email, điện thoại..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={userRoleFilter}
                                        onChange={(e) => setUserRoleFilter(e.target.value)}
                                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                                    >
                                        <option value="all">Tất cả vai trò</option>
                                        <option value="customer">Sĩ tử (Customer)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                    </select>

                                    <select
                                        value={userStatusFilter}
                                        onChange={(e) => setUserStatusFilter(e.target.value)}
                                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="locked">Bị khóa</option>
                                    </select>

                                    <button
                                        onClick={loadUsers}
                                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                                    >
                                        Tìm
                                    </button>
                                </div>
                            </div>

                            {/* Users Table */}
                            {userLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                                    <p className="text-xs text-slate-400">Đang tải danh sách tài khoản...</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4">Sĩ tử / Người dùng</th>
                                                    <th className="p-4">Email</th>
                                                    <th className="p-4">Vai trò</th>
                                                    <th className="p-4">Trạng thái</th>
                                                    <th className="p-4">Ngày tham gia</th>
                                                    <th className="p-4 text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/80">
                                                {users.map((u) => (
                                                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="p-4 font-bold text-slate-100 flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-red-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                                                {u.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <span>{u.name}</span>
                                                        </td>
                                                        <td className="p-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                u.role === 'admin'
                                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                                    : 'bg-slate-800 text-slate-300'
                                                            }`}>
                                                                {u.role === 'admin' ? 'Quản Trị Viên' : 'Sĩ tử'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                u.status === 'locked'
                                                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                            }`}>
                                                                {u.status === 'locked' ? 'Bị khóa' : 'Hoạt động'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-slate-400">
                                                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => setConfirmUserStatus(u)}
                                                                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                                                    u.status === 'locked'
                                                                        ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'
                                                                        : 'border-rose-500/40 text-rose-300 hover:bg-rose-950/40'
                                                                }`}
                                                            >
                                                                {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                                                            </button>

                                                            <button
                                                                onClick={() => setConfirmUserRole(u)}
                                                                className="px-3 py-1 rounded-lg text-xs font-semibold border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
                                                            >
                                                                {u.role === 'admin' ? 'Hạ quyền' : 'Nâng Admin'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* DIALOG XÁC NHẬN KHÓA / MỞ KHÓA USER */}
                            {confirmUserStatus && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                                    <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center space-y-4">
                                        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                                            confirmUserStatus.status === 'locked' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                            {confirmUserStatus.status === 'locked' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                        </div>

                                        <h3 className="text-base font-bold text-white">
                                            {confirmUserStatus.status === 'locked' ? 'Mở Khóa Tài Khoản?' : 'Khóa Tài Khoản Sĩ Tử?'}
                                        </h3>

                                        <p className="text-xs text-slate-300">
                                            Bạn có chắc chắn muốn {confirmUserStatus.status === 'locked' ? 'mở khóa' : 'khóa'} tài khoản{' '}
                                            <strong className="text-amber-300">{confirmUserStatus.email}</strong>?
                                        </p>

                                        <div className="flex items-center justify-center gap-3 pt-2">
                                            <button
                                                onClick={() => setConfirmUserStatus(null)}
                                                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={executeToggleUserStatus}
                                                className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md ${
                                                    confirmUserStatus.status === 'locked'
                                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                                                }`}
                                            >
                                                Xác Nhận {confirmUserStatus.status === 'locked' ? 'Mở Khóa' : 'Khóa'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DIALOG XÁC NHẬN THAY ĐỔI VAI TRÒ (ADMIN / USER) */}
                            {confirmUserRole && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                                    <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center space-y-4">
                                        <div className="w-12 h-12 rounded-full mx-auto bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>

                                        <h3 className="text-base font-bold text-white">
                                            Thay Đổi Quyền Hạn Quản Trị?
                                        </h3>

                                        <p className="text-xs text-slate-300">
                                            Chuyển vai trò của <strong className="text-amber-300">{confirmUserRole.email}</strong> thành{' '}
                                            <strong className="text-emerald-400 font-bold uppercase">
                                                {confirmUserRole.role === 'admin' ? 'Sĩ tử thường (Customer)' : 'Quản Trị Viên (Admin)'}
                                            </strong>?
                                        </p>

                                        <div className="flex items-center justify-center gap-3 pt-2">
                                            <button
                                                onClick={() => setConfirmUserRole(null)}
                                                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={executeToggleUserRole}
                                                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
                                            >
                                                Xác Nhận Cập Nhật
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 3: QUẢN LÝ KHO TÀNG XUẤT BẢN (UC18) */}
                    {/* ============================================================ */}
                    {activeTab === 'works' && (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                                <div className="relative w-full sm:w-80">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        placeholder="Tìm câu ca dao, tục ngữ, truyện..."
                                        value={workSearch}
                                        onChange={(e) => setWorkSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && loadWorks()}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <select
                                        value={workCategoryFilter}
                                        onChange={(e) => setWorkCategoryFilter(e.target.value)}
                                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                                    >
                                        <option value="all">Tất cả thể loại</option>
                                        <option value="ca-dao">Ca dao</option>
                                        <option value="tuc-ngu">Tục ngữ</option>
                                        <option value="co-tich">Cổ tích</option>
                                        <option value="truyen-thuyet">Truyền thuyết</option>
                                    </select>

                                    <button
                                        onClick={openCreateWork}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Thêm tác phẩm mới</span>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Thêm / Chỉnh Sửa Tác Phẩm */}
                            {editingWork && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 sm:p-8 text-slate-100 space-y-5">
                                        <button
                                            onClick={() => setEditingWork(null)}
                                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <h3 className="text-lg font-bold font-heritage text-amber-200 flex items-center gap-2">
                                            <Edit className="w-5 h-5 text-amber-400" />
                                            {editingWork._id ? `Chỉnh sửa: "${editingWork.title}"` : 'Soạn thảo tác phẩm mới vào kho tàng'}
                                        </h3>

                                        <form onSubmit={handleSaveWork} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="sm:col-span-2 space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Câu ca dao / Tục ngữ / Tác phẩm *</label>
                                                    <input
                                                        type="text"
                                                        value={workForm.title}
                                                        onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                                                        required
                                                        placeholder="Ví dụ: Công cha như núi Thái Sơn..."
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-amber-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Thể loại *</label>
                                                    <select
                                                        value={workForm.category}
                                                        onChange={(e) => setWorkForm({ ...workForm, category: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                                                    >
                                                        <option value="ca-dao">Ca dao</option>
                                                        <option value="tuc-ngu">Tục ngữ</option>
                                                        <option value="co-tich">Cổ tích</option>
                                                        <option value="truyen-thuyet">Truyền thuyết</option>
                                                        <option value="than-thoai">Thần thoại</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Chủ đề</label>
                                                    <input
                                                        type="text"
                                                        value={workForm.topic}
                                                        onChange={(e) => setWorkForm({ ...workForm, topic: e.target.value })}
                                                        placeholder="Ví dụ: Tình phụ tử, Đạo làm người..."
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Nguồn học thuật kiểm chứng *</label>
                                                    <input
                                                        type="text"
                                                        value={workForm.source}
                                                        onChange={(e) => setWorkForm({ ...workForm, source: e.target.value })}
                                                        required
                                                        placeholder="Ví dụ: Kho tàng Ca dao người Việt - NXB Văn học"
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Nghĩa đen</label>
                                                    <textarea
                                                        rows="2"
                                                        value={workForm.literalMeaning}
                                                        onChange={(e) => setWorkForm({ ...workForm, literalMeaning: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Nghĩa bóng</label>
                                                    <textarea
                                                        rows="2"
                                                        value={workForm.figurativeMeaning}
                                                        onChange={(e) => setWorkForm({ ...workForm, figurativeMeaning: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase">Tóm tắt / Bài học đúc kết</label>
                                                <textarea
                                                    rows="2"
                                                    value={workForm.summary}
                                                    onChange={(e) => setWorkForm({ ...workForm, summary: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingWork(null)}
                                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>Lưu Tác Phẩm</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Works Table */}
                            {worksLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                                    <p className="text-xs text-slate-400">Đang tải kho tàng di sản...</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4">Tiêu đề tác phẩm</th>
                                                    <th className="p-4">Thể loại</th>
                                                    <th className="p-4">Chủ đề</th>
                                                    <th className="p-4">Nguồn kiểm chứng</th>
                                                    <th className="p-4">Trạng thái</th>
                                                    <th className="p-4 text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/80">
                                                {works.map((w) => (
                                                    <tr key={w._id} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="p-4 font-bold text-slate-100 font-heritage max-w-xs truncate">
                                                            {w.title}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                                                {w.category}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-slate-300">{w.topic || '—'}</td>
                                                        <td className="p-4 text-slate-400 italic truncate max-w-xs">
                                                            {w.source || 'Dân gian'}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                {w.status || 'published'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right space-x-1">
                                                            <button
                                                                onClick={() => openEditWork(w)}
                                                                className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 cursor-pointer"
                                                                title="Sửa nội dung"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteWorkTarget(w)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer"
                                                                title="Xóa tác phẩm"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* DIALOG XÓA TÁC PHẨM */}
                            {deleteWorkTarget && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                                    <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center space-y-4">
                                        <div className="w-12 h-12 rounded-full mx-auto bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                            <Trash2 className="w-6 h-6" />
                                        </div>

                                        <h3 className="text-base font-bold text-white">
                                            Xác Nhận Xóa Tác Phẩm?
                                        </h3>

                                        <p className="text-xs text-slate-300">
                                            Hành động này sẽ gỡ bỏ vĩnh viễn tác phẩm{' '}
                                            <strong className="text-amber-300">"{deleteWorkTarget.title}"</strong> khỏi kho tàng văn hóa.
                                        </p>

                                        <div className="flex items-center justify-center gap-3 pt-2">
                                            <button
                                                onClick={() => setDeleteWorkTarget(null)}
                                                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={executeDeleteWork}
                                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                                            >
                                                Xác Nhận Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 4: CẤU HÌNH HỆ THỐNG (UC19) */}
                    {/* ============================================================ */}
                    {activeTab === 'settings' && (
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-100 font-heritage">
                                    Thiết Lập Vận Hành Hệ Thống & Tính Năng
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Cấu hình các tham số thời gian thực. Giao diện quản trị tuân thủ nguyên tắc bảo mật, không hiển thị bất kỳ bí mật API nào.
                                </p>
                            </div>

                            {settingsLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                                    <p className="text-xs text-slate-400">Đang tải thiết lập...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800/80">
                                    {settingsList.map((s) => (
                                        <div key={s.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="max-w-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-amber-300">
                                                        {s.key}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                                                        {s.category || 'general'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {s.description || 'Không có mô tả chi tiết'}
                                                </p>
                                            </div>

                                            <div>
                                                {typeof s.value === 'boolean' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleSetting(s.key, s.value)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            s.value
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                                        }`}
                                                    >
                                                        {s.value ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={s.value}
                                                            onBlur={(e) => handleUpdateSettingNotice(s.key, e.target.value)}
                                                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 w-64 focus:border-amber-500"
                                                        />
                                                        <span className="text-[11px] text-slate-500">Tự lưu khi rời chuột</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
