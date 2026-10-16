import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Heart, 
    BookOpen, 
    Trash2, 
    Sparkles, 
    Loader2, 
    ArrowRight, 
    Compass, 
    Search 
} from 'lucide-react';
import favoriteService from '../services/favorite.service';
import WorkDetailModal from '../components/common/WorkDetailModal';

const Favorites = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWork, setSelectedWork] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const data = await favoriteService.getFavorites(1, 50);
            setWorks(data.works || []);
        } catch (error) {
            console.error('Lỗi tải danh sách yêu thích:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (e, workId) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc chắn muốn bỏ lưu nội dung này khỏi danh sách yêu thích?')) {
            return;
        }

        try {
            await favoriteService.toggleFavorite(workId);
            setWorks(works.filter((w) => w._id !== workId));
        } catch (error) {
            console.error('Lỗi bỏ yêu thích:', error);
        }
    };

    const handleOpenDetail = (work) => {
        setSelectedWork(work);
        setIsDetailOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh]">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-rose-600 text-sm font-bold uppercase tracking-wider mb-2">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    Kho Tàng Yêu Thích Cá Nhân
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heritage">
                    Ca Dao & Tục Ngữ Yêu Thích Của Bạn
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                    Lưu giữ những câu ca dao, tục ngữ và tác phẩm văn học dân gian tâm đắc để nghiền ngẫm, học tập và tra cứu bất kỳ lúc nào.
                </p>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-9 h-9 animate-spin mx-auto text-rose-500 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Đang tải danh sách câu yêu thích...</p>
                </div>
            ) : works.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8">
                    <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Chưa có nội dung nào trong mục yêu thích
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                        Khám phá kho tàng ca dao, tục ngữ và bấm vào biểu tượng trái tim để lưu lại những câu bạn yêu thích nhất!
                    </p>
                    <Link
                        to="/kham-pha"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        <Compass className="w-4 h-4" />
                        Khám phá kho tàng ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {works.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => handleOpenDetail(item)}
                            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                                        {item.categoryName || (item.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao')}
                                    </span>
                                    {item.topic && (
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            {item.topic}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-900 transition-colors mb-2 font-heritage">
                                    "{item.title}"
                                </h3>

                                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                    {item.literalMeaning || item.summary}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                                <span className="text-[11px] text-slate-400 italic truncate max-w-[180px]">
                                    Nguồn: {item.source}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemoveFavorite(e, item._id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        title="Bỏ lưu khỏi yêu thích"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                        Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal chi tiết (UC08, UC10, UC11) */}
            <WorkDetailModal
                work={selectedWork}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    fetchFavorites(); // Đồng bộ lại nếu có bỏ yêu thích bên trong modal
                }}
                onWorkSelect={(newWork) => setSelectedWork(newWork)}
            />
        </div>
    );
};

export default Favorites;
