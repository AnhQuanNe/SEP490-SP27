import { useState, useEffect } from 'react';
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
    Eye 
} from 'lucide-react';
import adminService from '../../services/admin.service';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'users' | 'works' | 'settings'

    // ==========================================
    // 1. STATE: USERS (UC15)
    // ==========================================
    const [users, setUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');

    const loadUsers = async () => {
        setUserLoading(true);
        try {
            const data = await adminService.getUsers({
                search: userSearch,
                role: userRoleFilter,
            });
            setUsers(data.users || []);
        } catch (err) {
            console.error('Lỗi tải danh sách người dùng:', err);
        } finally {
            setUserLoading(false);
        }
    };

    const handleToggleUserStatus = async (user) => {
        const newStatus = user.status === 'locked' ? 'active' : 'locked';
        if (!confirm(`Bạn có chắc muốn ${newStatus === 'locked' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.email}?`)) return;

        try {
            await adminService.updateUserStatus(user._id, newStatus);
            setUsers(users.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
        }
    };

    const handleToggleUserRole = async (user) => {
        const newRole = user.role === 'admin' ? 'customer' : 'admin';
        if (!confirm(`Bạn có chắc muốn đổi vai trò của ${user.email} thành ${newRole.toUpperCase()}?`)) return;

        try {
            await adminService.updateUserRole(user._id, newRole);
            setUsers(users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi cập nhật vai trò');
        }
    };

    // ==========================================
    // 2. STATE: SUBMISSIONS (UC16 & UC17)
    // ==========================================
    const [submissions, setSubmissions] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [subStatusFilter, setSubStatusFilter] = useState('pending');
    const [selectedSub, setSelectedSub] = useState(null);
    const [adminNoteInput, setAdminNoteInput] = useState('');

    const loadSubmissions = async () => {
        setSubLoading(true);
        try {
            const data = await adminService.getSubmissions({ status: subStatusFilter });
            setSubmissions(data.submissions || []);
        } catch (err) {
            console.error('Lỗi tải bài đóng góp:', err);
        } finally {
            setSubLoading(false);
        }
    };

    const handleApprove = async (sub) => {
        if (!confirm(`Xác nhận PHÊ DUYỆT và XUẤT BẢN câu "${sub.title}" vào kho tàng văn hóa?`)) return;
        try {
            await adminService.approveSubmission(sub._id, adminNoteInput || 'Đã kiểm duyệt đạt chuẩn học thuật.');
            alert('Đã phê duyệt và xuất bản thành công vào kho tàng!');
            setSelectedSub(null);
            setAdminNoteInput('');
            loadSubmissions();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi phê duyệt');
        }
    };

    const handleReject = async (sub) => {
        const reason = prompt('Nhập lý do từ chối bài đóng góp:', adminNoteInput || 'Nguồn tham khảo chưa đủ căn cứ kiểm chứng.');
        if (reason === null) return;

        try {
            await adminService.rejectSubmission(sub._id, reason);
            alert('Đã từ chối bài đóng góp.');
            setSelectedSub(null);
            setAdminNoteInput('');
            loadSubmissions();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi từ chối');
        }
    };

    // ==========================================
    // 3. STATE: WORKS MANAGEMENT (UC18)
    // ==========================================
    const [works, setWorks] = useState([]);
    const [worksLoading, setWorksLoading] = useState(false);
    const [workSearch, setWorkSearch] = useState('');
    const [editingWork, setEditingWork] = useState(null);
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

    const loadWorks = async () => {
        setWorksLoading(true);
        try {
            const data = await adminService.getWorks({ search: workSearch });
            setWorks(data.works || []);
        } catch (err) {
            console.error('Lỗi tải danh sách tác phẩm:', err);
        } finally {
            setWorksLoading(false);
        }
    };

    const handleSaveWork = async (e) => {
        e.preventDefault();
        try {
            if (editingWork?._id) {
                await adminService.updateWork(editingWork._id, workForm);
                alert('Cập nhật tác phẩm thành công!');
            } else {
                await adminService.createWork(workForm);
                alert('Tạo mới tác phẩm thành công!');
            }
            setEditingWork(null);
            loadWorks();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi lưu tác phẩm');
        }
    };

    const handleDeleteWork = async (id, title) => {
        if (!confirm(`Bạn có chắc chắn muốn XÓA tác phẩm "${title}"?`)) return;
        try {
            await adminService.deleteWork(id);
            setWorks(works.filter((w) => w._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi xóa tác phẩm');
        }
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

    // ==========================================
    // 4. STATE: SYSTEM SETTINGS (UC19)
    // ==========================================
    const [settings, setSettings] = useState([]);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const loadSettings = async () => {
        setSettingsLoading(true);
        try {
            const data = await adminService.getSettings();
            setSettings(data || []);
        } catch (err) {
            console.error('Lỗi tải thiết lập hệ thống:', err);
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleToggleSetting = async (key, currentValue) => {
        try {
            await adminService.updateSetting(key, !currentValue);
            setSettings(settings.map((s) => (s.key === key ? { ...s, value: !currentValue } : s)));
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi cập nhật thiết lập');
        }
    };

    const handleUpdateSettingNotice = async (key, newValue) => {
        try {
            await adminService.updateSetting(key, newValue);
            alert('Đã cập nhật thông báo hệ thống!');
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi cập nhật');
        }
    };

    // Trigger data loading when changing tabs
    useEffect(() => {
        if (activeTab === 'submissions') loadSubmissions();
        else if (activeTab === 'users') loadUsers();
        else if (activeTab === 'works') loadWorks();
        else if (activeTab === 'settings') loadSettings();
    }, [activeTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-purple-700 text-sm font-bold uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                        Bảng Điều Khiển Quản Trị Hệ Thống (Admin Portal)
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heritage">
                        Trung Tâm Quản Lý VietHeritage AI
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản trị tài khoản người dùng, thẩm định duyệt nội dung đóng góp, cập nhật kho tàng và quản lý cấu hình hệ thống.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-purple-50 text-purple-900 px-4 py-2 rounded-2xl border border-purple-200/80 text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Quyền Quản Trị Viên Xác Thực
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('submissions')}
                    className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'submissions'
                            ? 'border-purple-600 text-purple-950 bg-purple-50/60 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <FileCheck className="w-4 h-4" />
                    Kiểm duyệt đóng góp
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'users'
                            ? 'border-purple-600 text-purple-950 bg-purple-50/60 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Quản lý người dùng
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('works')}
                    className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'works'
                            ? 'border-purple-600 text-purple-950 bg-purple-50/60 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Kho tàng xuất bản
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'settings'
                            ? 'border-purple-600 text-purple-950 bg-purple-50/60 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    Cấu hình hệ thống
                </button>
            </div>

            {/* TAB 1: KIỂM DUYỆT ĐÓNG GÓP (UC16 & UC17) */}
            {activeTab === 'submissions' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái:</span>
                            {['pending', 'approved', 'rejected', 'all'].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                        setSubStatusFilter(st);
                                        setTimeout(loadSubmissions, 0);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                        subStatusFilter === st
                                            ? 'bg-purple-900 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {st === 'pending' ? 'Chờ duyệt' : st === 'approved' ? 'Đã duyệt' : st === 'rejected' ? 'Đã từ chối' : 'Tất cả'}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={loadSubmissions}
                            className="text-xs font-semibold text-purple-700 hover:underline"
                        >
                            Làm mới danh sách
                        </button>
                    </div>

                    {subLoading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
                            <p className="text-xs text-slate-500">Đang tải bài đóng góp...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8">
                            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-700">Không có bài đóng góp nào trong mục này</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((sub) => (
                                <div
                                    key={sub._id}
                                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                >
                                    <div className="space-y-2 flex-grow">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                                                {sub.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao'}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">Chủ đề: {sub.topic}</span>
                                            <span className="text-xs text-slate-400">• Người gửi: <strong>{sub.user?.name || 'Ẩn danh'}</strong> ({sub.user?.email})</span>
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 font-heritage">
                                            "{sub.title}"
                                        </h3>

                                        <p className="text-xs text-slate-700 leading-relaxed">
                                            <strong>Ý nghĩa:</strong> {sub.meaning}
                                        </p>

                                        {sub.literalMeaning && (
                                            <p className="text-xs text-slate-600">
                                                <strong>Nghĩa đen:</strong> {sub.literalMeaning}
                                            </p>
                                        )}
                                        {sub.figurativeMeaning && (
                                            <p className="text-xs text-slate-600">
                                                <strong>Nghĩa bóng:</strong> {sub.figurativeMeaning}
                                            </p>
                                        )}

                                        <p className="text-xs text-indigo-700 italic font-heritage">
                                            Nguồn kiểm chứng: {sub.source}
                                        </p>

                                        {sub.adminNote && (
                                            <div className="text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-600">
                                                <strong>Ghi chú Admin:</strong> {sub.adminNote}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col lg:items-end gap-2 flex-shrink-0">
                                        {sub.status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(sub)}
                                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Duyệt & Xuất bản
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReject(sub)}
                                                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {sub.status === 'approved' ? 'Đã duyệt xuất bản' : 'Đã từ chối'}
                                            </span>
                                        )}
                                        <span className="text-[11px] text-slate-400">
                                            Ngày gửi: {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG (UC15) */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-xs text-slate-500 font-bold uppercase">Vai trò:</span>
                            <select
                                value={userRoleFilter}
                                onChange={(e) => {
                                    setUserRoleFilter(e.target.value);
                                    setTimeout(loadUsers, 0);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="customer">Người dùng thường</option>
                                <option value="admin">Quản trị viên (Admin)</option>
                            </select>
                            <button
                                type="button"
                                onClick={loadUsers}
                                className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 text-xs font-bold hover:bg-purple-200"
                            >
                                Tìm
                            </button>
                        </div>
                    </div>

                    {userLoading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
                            <p className="text-xs text-slate-500">Đang tải người dùng...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Người dùng</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Vai trò</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4">Ngày tham gia</th>
                                        <th className="p-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                                                    {u.name?.charAt(0) || 'U'}
                                                </div>
                                                {u.name}
                                            </td>
                                            <td className="p-4 text-slate-600">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full font-bold ${
                                                    u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded font-bold ${
                                                    u.status === 'locked'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {u.status === 'locked' ? 'Bị khóa' : 'Hoạt động'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400">
                                                {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleUserStatus(u)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                                                        u.status === 'locked'
                                                            ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                                            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                                    }`}
                                                >
                                                    {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleUserRole(u)}
                                                    className="px-3 py-1 rounded-lg text-xs font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50"
                                                >
                                                    {u.role === 'admin' ? 'Hạ quyền' : 'Nâng Admin'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: QUẢN LÝ KHO TÀNG XUẤT BẢN (UC18) */}
            {activeTab === 'works' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tác phẩm..."
                                value={workSearch}
                                onChange={(e) => setWorkSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadWorks()}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
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
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-900 text-white text-xs font-bold hover:bg-purple-950 flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm câu Ca dao / Tục ngữ mới
                        </button>
                    </div>

                    {/* Modal Thêm / Chỉnh sửa Tác phẩm */}
                    {editingWork && (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-purple-200/80 mb-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Edit className="w-4 h-4 text-purple-700" />
                                {editingWork._id ? `Chỉnh sửa: "${editingWork.title}"` : 'Thêm tác phẩm mới vào kho tàng'}
                            </h3>

                            <form onSubmit={handleSaveWork} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Tiêu đề / Câu ca dao, tục ngữ</label>
                                        <input
                                            type="text"
                                            value={workForm.title}
                                            onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Loại nội dung</label>
                                        <select
                                            value={workForm.category}
                                            onChange={(e) => setWorkForm({ ...workForm, category: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
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
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Chủ đề</label>
                                        <input
                                            type="text"
                                            value={workForm.topic}
                                            onChange={(e) => setWorkForm({ ...workForm, topic: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nguồn tham khảo học thuật kiểm chứng</label>
                                        <input
                                            type="text"
                                            value={workForm.source}
                                            onChange={(e) => setWorkForm({ ...workForm, source: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nghĩa đen</label>
                                        <textarea
                                            rows="2"
                                            value={workForm.literalMeaning}
                                            onChange={(e) => setWorkForm({ ...workForm, literalMeaning: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nghĩa bóng</label>
                                        <textarea
                                            rows="2"
                                            value={workForm.figurativeMeaning}
                                            onChange={(e) => setWorkForm({ ...workForm, figurativeMeaning: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Bài học & Thông điệp</label>
                                    <input
                                        type="text"
                                        value={workForm.lesson}
                                        onChange={(e) => setWorkForm({ ...workForm, lesson: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tóm tắt / Ý nghĩa chung</label>
                                    <textarea
                                        rows="2"
                                        value={workForm.summary}
                                        onChange={(e) => setWorkForm({ ...workForm, summary: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingWork(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-purple-900 text-white text-xs font-bold hover:bg-purple-950 flex items-center gap-1.5"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu tác phẩm
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {worksLoading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
                            <p className="text-xs text-slate-500">Đang tải kho tàng...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Tiêu đề</th>
                                        <th className="p-4">Thể loại</th>
                                        <th className="p-4">Chủ đề</th>
                                        <th className="p-4">Nguồn kiểm chứng</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {works.map((w) => (
                                        <tr key={w._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 font-bold text-slate-900 font-heritage max-w-xs truncate">
                                                {w.title}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold text-[10px]">
                                                    {w.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600">{w.topic}</td>
                                            <td className="p-4 text-slate-500 italic truncate max-w-xs">
                                                {w.source}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditWork(w)}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50"
                                                    title="Sửa nội dung"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteWork(w._id, w.title)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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
                    )}
                </div>
            )}

            {/* TAB 4: CẤU HÌNH HỆ THỐNG (UC19) */}
            {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                            Thiết lập hệ thống & Quản lý tính năng
                        </h3>
                        <p className="text-xs text-slate-500">
                            Cấu hình các chức năng thời gian thực. Không chứa bất kỳ secrets hay API key nào trong giao diện quản trị.
                        </p>
                    </div>

                    {settingsLoading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
                            <p className="text-xs text-slate-500">Đang tải thiết lập...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {settings.map((s) => (
                                <div key={s.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="max-w-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-slate-800 font-mono">
                                                {s.key}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                                {s.category || 'general'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {s.description || 'Không có mô tả'}
                                        </p>
                                    </div>

                                    <div>
                                        {typeof s.value === 'boolean' ? (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleSetting(s.key, s.value)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                    s.value
                                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
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
                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-64 bg-slate-50 focus:bg-white"
                                                />
                                                <span className="text-[11px] text-slate-400">Tự lưu khi rời chuột</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
