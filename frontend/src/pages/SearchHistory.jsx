import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    History, 
    Search, 
    Sparkles, 
    Trash2, 
    Loader2, 
    ArrowRight, 
    Clock, 
    Tag 
} from 'lucide-react';
import historyService from '../services/history.service';

const SearchHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await historyService.getHistory(1, 50);
            setHistory(data.history || []);
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleClearAll = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm không?')) return;
        try {
            await historyService.clearHistory();
            setHistory([]);
        } catch (error) {
            console.error('Lỗi xóa toàn bộ lịch sử:', error);
        }
    };

    const handleDeleteItem = async (e, id) => {
        e.stopPropagation();
        try {
            await historyService.deleteItem(id);
            setHistory(history.filter((item) => item._id !== id));
        } catch (error) {
            console.error('Lỗi xóa mục lịch sử:', error);
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

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold uppercase tracking-wider mb-2">
                        <History className="w-4 h-4" />
                        Lịch Sử Tra Cứu Cá Nhân
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heritage">
                        Nhật Ký Tìm Kiếm Của Bạn
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Xem lại các câu hỏi tra cứu từ khóa và tìm kiếm ngữ nghĩa đã thực hiện trên VietHeritage AI.
                    </p>
                </div>

                {history.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa toàn bộ lịch sử
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                    <p className="text-sm text-slate-500">Đang tải lịch sử tìm kiếm...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Chưa có lịch sử tìm kiếm nào
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                        Mỗi khi bạn tìm kiếm từ khóa hoặc hỏi tìm kiếm ý nghĩa bằng ngôn ngữ tự nhiên, hệ thống sẽ lưu lại tại đây để bạn tiện tra cứu lại.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => handleExecuteSearch(item)}
                            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3.5 flex-grow pr-4">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        item.searchType === 'semantic'
                                            ? 'bg-amber-100/70 text-amber-800 border border-amber-200/60'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                    }`}
                                >
                                    {item.searchType === 'semantic' ? (
                                        <Sparkles className="w-5 h-5 text-amber-700" />
                                    ) : (
                                        <Search className="w-5 h-5 text-indigo-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                                            {item.query}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                                item.searchType === 'semantic'
                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}
                                        >
                                            {item.searchType === 'semantic' ? 'Tìm theo Ý nghĩa (AI)' : 'Từ khóa'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
                                        </span>
                                        {item.resultsCount !== undefined && (
                                            <span>• {item.resultsCount} kết quả</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteItem(e, item._id)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Xóa mục này"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <span className="p-2 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchHistory;
