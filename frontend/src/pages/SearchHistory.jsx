import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    History, 
    Search, 
    Sparkles, 
    Trash2, 
    Loader2, 
    ArrowRight, 
    Clock, 
    Check, 
    CheckSquare, 
    CheckCircle2, 
    X,
    ArrowUpDown,
    Filter,
    Compass,
    Tag,
    ChevronRight,
    RotateCcw,
    Layers,
    BookOpen
} from 'lucide-react';
import historyService from '../services/history.service';

const SearchHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSearches: 0,
        semanticSearches: 0,
        keywordSearches: 0,
    });
    
    // Sort & Filter state
    const [sortOption, setSortOption] = useState('default'); // 'default' | 'semantic' | 'keyword' | 'oldest'
    const [filterType, setFilterType] = useState('all'); // 'all' | 'semantic' | 'keyword'
    const [searchQuery, setSearchQuery] = useState('');

    // Multi-select SMS-style deletion state
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const navigate = useNavigate();

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3200);
    };

    const fetchHistory = async (type = filterType, sort = sortOption) => {
        setLoading(true);
        try {
            const apiType = type === 'all' ? '' : type;
            const apiSort = sort === 'default' ? '' : sort;
            const data = await historyService.getHistory(1, 150, apiType, apiSort);
            setHistory(data.history || []);
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
            showToast('Không thể tải lịch sử tìm kiếm. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(filterType, sortOption);
    }, [filterType, sortOption]);

    const handleClearAll = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm không? Hành động này không thể hoàn tác.')) return;
        try {
            await historyService.clearHistory();
            setHistory([]);
            setSelectedIds([]);
            setIsSelectMode(false);
            setStats({ totalSearches: 0, semanticSearches: 0, keywordSearches: 0 });
            showToast('Đã xóa toàn bộ lịch sử tìm kiếm thành công!');
        } catch (error) {
            console.error('Lỗi xóa toàn bộ lịch sử:', error);
            showToast('Lỗi khi xóa lịch sử tìm kiếm');
        }
    };

    const handleDeleteItem = async (e, id) => {
        e.stopPropagation();
        try {
            const itemToDelete = history.find(item => item._id === id);
            await historyService.deleteItem(id);
            setHistory((prev) => prev.filter((item) => item._id !== id));
            setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
            
            // Cập nhật stats
            setStats((prev) => ({
                totalSearches: Math.max(0, prev.totalSearches - 1),
                semanticSearches: itemToDelete?.searchType === 'semantic' ? Math.max(0, prev.semanticSearches - 1) : prev.semanticSearches,
                keywordSearches: itemToDelete?.searchType !== 'semantic' ? Math.max(0, prev.keywordSearches - 1) : prev.keywordSearches,
            }));

            showToast('Đã xóa 1 mục lịch sử tìm kiếm');
        } catch (error) {
            console.error('Lỗi xóa mục lịch sử:', error);
            showToast('Lỗi khi xóa mục lịch sử');
        }
    };

    const handleToggleSelect = (e, id) => {
        if (e) e.stopPropagation();
        setSelectedIds((prev) => {
            const exists = prev.includes(id);
            const next = exists ? prev.filter((itemId) => itemId !== id) : [...prev, id];
            if (next.length > 0 && !isSelectMode) {
                setIsSelectMode(true);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map((item) => item._id));
        }
    };

    const handleExitSelectMode = () => {
        setIsSelectMode(false);
        setSelectedIds([]);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const count = selectedIds.length;
        if (!confirm(`Bạn có chắc chắn muốn xóa ${count} mục lịch sử tra cứu đã chọn không?`)) return;

        setIsDeleting(true);
        try {
            await historyService.deleteMultiple(selectedIds);
            
            // Tính số mục bị xóa theo type để trừ stats
            const deletedItems = history.filter(item => selectedIds.includes(item._id));
            const deletedSemantic = deletedItems.filter(item => item.searchType === 'semantic').length;
            const deletedKeyword = deletedItems.length - deletedSemantic;

            setHistory((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
            setSelectedIds([]);
            setIsSelectMode(false);
            
            setStats((prev) => ({
                totalSearches: Math.max(0, prev.totalSearches - count),
                semanticSearches: Math.max(0, prev.semanticSearches - deletedSemantic),
                keywordSearches: Math.max(0, prev.keywordSearches - deletedKeyword),
            }));

            showToast(`Đã xóa thành công ${count} mục lịch sử tìm kiếm!`);
        } catch (error) {
            console.error('Lỗi xóa các mục đã chọn:', error);
            showToast('Không thể xóa các mục đã chọn. Vui lòng thử lại!');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleItemClick = (item) => {
        if (isSelectMode) {
            handleToggleSelect(null, item._id);
        } else {
            handleExecuteSearch(item);
        }
    };

    const handleExecuteSearch = (item) => {
        if (item.searchType === 'semantic') {
            navigate(`/kham-pha?mode=semantic&q=${encodeURIComponent(item.query)}`);
        } else {
            navigate(`/kham-pha?q=${encodeURIComponent(item.query)}`);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Lọc theo từ khóa tìm kiếm nội bộ trang
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase().trim();
        return history.filter(item => item.query?.toLowerCase().includes(q));
    }, [history, searchQuery]);

    const isAllSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredItems.length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
            {/* Toast notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{toastMessage}</span>
                </div>
            )}

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
                <Link to="/" className="hover:text-amber-700 transition-colors">Trang chủ</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/kham-pha" className="hover:text-amber-700 transition-colors">Khám phá</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold">Lịch sử tra cứu</span>
            </nav>

            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/80 p-6 sm:p-8 shadow-sm mb-8">
                {/* Decorative background aura */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-10 w-52 h-52 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
                            <History className="w-4 h-4 text-amber-700" />
                            Nhật Ký Tra Cứu Cá Nhân
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heritage">
                            Lịch Sử Tìm Kiếm & Khám Phá
                        </h1>
                        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                            Xem lại các câu hỏi tra cứu theo từ khóa và truy vấn ngữ nghĩa AI bạn đã thực hiện trong kho tàng văn hóa dân gian VietHeritage.
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    {history.length > 0 && !isSelectMode && (
                        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
                            <button
                                type="button"
                                onClick={() => setIsSelectMode(true)}
                                className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                            >
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                Chọn xóa nhiều
                            </button>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                Xóa toàn bộ
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Dashboard: Tổng số lượt tìm kiếm */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* 1. Tổng lượt tìm kiếm */}
                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Tổng lượt tìm kiếm
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Compass className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 font-heritage">
                            {stats.totalSearches}
                        </span>
                        <span className="text-xs font-medium text-slate-500">lượt tra cứu</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" /> Tất cả các lần tìm kiếm đã lưu
                    </p>
                </div>

                {/* 2. Tìm kiếm theo Ý nghĩa (AI Ngữ nghĩa) */}
                <div 
                    onClick={() => setFilterType(filterType === 'semantic' ? 'all' : 'semantic')}
                    className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer ${
                        filterType === 'semantic'
                            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200/60'
                            : 'bg-white border-slate-200/90'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Tìm kiếm Ngữ nghĩa (AI)
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-700 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-900 font-heritage">
                            {stats.semanticSearches}
                        </span>
                        <span className="text-xs font-medium text-amber-700/80">câu hỏi ý nghĩa</span>
                    </div>
                    <p className="text-xs text-amber-700/70 mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Truy vấn ngôn ngữ tự nhiên
                    </p>
                </div>

                {/* 3. Tra cứu theo Từ khóa */}
                <div 
                    onClick={() => setFilterType(filterType === 'keyword' ? 'all' : 'keyword')}
                    className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer ${
                        filterType === 'keyword'
                            ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-200/60'
                            : 'bg-white border-slate-200/90'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                            Tra cứu Từ khóa
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                            <Tag className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-teal-900 font-heritage">
                            {stats.keywordSearches}
                        </span>
                        <span className="text-xs font-medium text-teal-700/80">từ khóa tra cứu</span>
                    </div>
                    <p className="text-xs text-teal-700/70 mt-1.5 flex items-center gap-1">
                        <Search className="w-3.5 h-3.5 text-teal-500" /> Tìm kiếm chính xác câu chữ
                    </p>
                </div>
            </div>

            {/* Filter & Sort Controls Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Filter Type Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                filterType === 'all'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Tất cả ({stats.totalSearches})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('semantic')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                filterType === 'semantic'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/60'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Ý nghĩa AI ({stats.semanticSearches})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('keyword')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                filterType === 'keyword'
                                    ? 'bg-teal-700 text-white shadow-xs'
                                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100/80 border border-teal-200/60'
                            }`}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            Từ khóa ({stats.keywordSearches})
                        </button>
                    </div>

                    {/* Sắp xếp (Sort) & Tìm nhanh trong lịch sử */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search in History Input */}
                        <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Lọc câu hỏi đã tìm..."
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                                title="Sắp xếp danh sách lịch sử tra cứu"
                            >
                                <option value="default">Sắp xếp: Mặc định (Mới nhất)</option>
                                <option value="semantic">Ưu tiên: Ý nghĩa (AI) trước</option>
                                <option value="keyword">Ưu tiên: Từ khóa trước</option>
                                <option value="oldest">Sắp xếp: Cũ nhất trước</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Action Toolbar (khi bật chế độ chọn nhiều giống như chọn tin nhắn SMS) */}
            {history.length > 0 && isSelectMode && (
                <div className="sticky top-20 z-20 mb-6 bg-white/95 backdrop-blur-md border-2 border-indigo-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-indigo-100/50 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                            <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                    isAllSelected
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : isIndeterminate
                                        ? 'bg-indigo-50 border-indigo-400 text-indigo-600'
                                        : 'border-slate-400 bg-white'
                                }`}
                            >
                                {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                {isIndeterminate && <span className="w-2.5 h-0.5 bg-indigo-600 rounded-full" />}
                            </div>
                            <span>
                                {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </span>
                        </button>

                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Đã chọn: <strong className="text-indigo-600 font-bold">{selectedIds.length}</strong> / {filteredItems.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.length === 0 || isDeleting}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                                selectedIds.length === 0 || isDeleting
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                    : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-200'
                            }`}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang xóa...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Xóa đã chọn ({selectedIds.length})</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleExitSelectMode}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                            <span>Đóng</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List Content */}
            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-3" />
                    <p className="text-sm text-slate-500">Đang tải lịch sử tra cứu của bạn...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-amber-200/80 rounded-3xl bg-amber-50/20 p-8">
                    <div className="w-16 h-16 rounded-3xl bg-amber-100/70 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                        <History className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 font-heritage">
                        {searchQuery ? 'Không tìm thấy câu hỏi phù hợp' : 'Chưa có lịch sử tìm kiếm nào'}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                        {searchQuery
                            ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm cụm từ khác.`
                            : 'Mỗi khi bạn tra cứu từ khóa hoặc hỏi tìm kiếm ý nghĩa câu tục ngữ, ca dao bằng AI, hệ thống sẽ lưu lại tại đây.'}
                    </p>
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Xóa bộ lọc tìm kiếm
                        </button>
                    ) : (
                        <Link
                            to="/kham-pha"
                            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors inline-flex items-center gap-2 shadow-amber-200 shadow-md"
                        >
                            <Compass className="w-4 h-4" />
                            Khám phá kho tàng ngay
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map((item) => {
                        const isSelected = selectedIds.includes(item._id);

                        return (
                            <div
                                key={item._id}
                                onClick={() => handleItemClick(item)}
                                className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                    isSelected
                                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200/60 shadow-xs'
                                        : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5'
                                }`}
                            >
                                <div className="flex items-center gap-4 flex-grow pr-4 min-w-0">
                                    {/* Checkbox chọn mục (SMS style) */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleSelect(e, item._id)}
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                                                : isSelectMode
                                                ? 'border-2 border-slate-400 hover:border-indigo-500 bg-white'
                                                : 'border-2 border-slate-300 opacity-60 group-hover:opacity-100 hover:border-indigo-500 bg-white'
                                        }`}
                                        title={isSelected ? 'Bỏ chọn mục này' : 'Chọn mục này'}
                                        aria-label={isSelected ? 'Bỏ chọn mục này' : 'Chọn mục này'}
                                    >
                                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                                    </button>

                                    {/* Icon loại tra cứu */}
                                    <div
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-xs ${
                                            item.searchType === 'semantic'
                                                ? 'bg-amber-100/80 text-amber-800 border border-amber-200/70'
                                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        }`}
                                    >
                                        {item.searchType === 'semantic' ? (
                                            <Sparkles className="w-5 h-5 text-amber-700" />
                                        ) : (
                                            <Search className="w-5 h-5 text-indigo-600" />
                                        )}
                                    </div>

                                    {/* Nội dung truy vấn */}
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span
                                                className={`text-sm font-bold truncate transition-colors ${
                                                    isSelected
                                                        ? 'text-amber-950 font-extrabold'
                                                        : 'text-slate-900 group-hover:text-amber-900'
                                                }`}
                                            >
                                                {item.query}
                                            </span>
                                            <span
                                                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md flex items-center gap-1 ${
                                                    item.searchType === 'semantic'
                                                        ? 'bg-amber-100/70 text-amber-800 border border-amber-200/60'
                                                        : 'bg-teal-50 text-teal-700 border border-teal-200/60'
                                                }`}
                                            >
                                                {item.searchType === 'semantic' ? (
                                                    <>
                                                        <Sparkles className="w-3 h-3 text-amber-600" />
                                                        Tìm theo Ý nghĩa (AI)
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tag className="w-3 h-3 text-teal-600" />
                                                        Từ khóa
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatDate(item.createdAt)}
                                            </span>
                                            {item.resultsCount !== undefined && (
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                    {item.resultsCount} kết quả tìm thấy
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Các nút hành động bên phải */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteItem(e, item._id)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Xóa riêng mục này"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {!isSelectMode && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExecuteSearch(item);
                                            }}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-50 group-hover:bg-amber-100/70 group-hover:text-amber-900 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
                                            title="Tìm kiếm lại với truy vấn này"
                                        >
                                            <span>Tìm lại</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SearchHistory;
