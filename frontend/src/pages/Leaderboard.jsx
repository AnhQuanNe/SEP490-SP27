import { useState, useEffect } from 'react';
import { 
    Trophy, 
    Crown, 
    Flame, 
    Medal, 
    Award, 
    Sparkles, 
    Loader2, 
    BookOpen, 
    Swords, 
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { gamificationService } from '../services/gamification.service';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
    const { user, isAuthenticated } = useAuth();
    const [period, setPeriod] = useState('all'); // 'week' | 'month' | 'all'
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (selectedPeriod = period) => {
        try {
            setLoading(true);
            const [boardData, statsData] = await Promise.all([
                gamificationService.getLeaderboard({ type: selectedPeriod, limit: 10 }),
                isAuthenticated ? gamificationService.getMyStats().catch(() => null) : null,
            ]);
            setLeaderboard(boardData || []);
            if (statsData) setMyStats(statsData);
        } catch (err) {
            console.warn('Lỗi tải Bảng Vàng:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(period);
    }, [period, isAuthenticated]);

    const topThree = leaderboard.slice(0, 3);
    const remainingList = leaderboard.slice(3);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-vietnam">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Tiêu Đề */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-300 shadow-xs">
                        <Trophy className="w-4 h-4 text-amber-800" />
                        <span>Khoa Bảng Trạng Nguyên — Vinh Danh Sĩ Tử</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-heritage">
                        Bảng Vàng Trạng Nguyên
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Vinh danh những bậc sĩ tử uyên bác, chuyên cần tìm hiểu và bảo tồn di sản văn hóa dân gian Việt Nam.
                    </p>

                    {/* Bộ lọc kỳ: Tuần này / Tháng này / Mọi thời đại */}
                    <div className="pt-3 flex items-center justify-center gap-1.5">
                        <div className="bg-[#fffdf9] p-1.5 rounded-2xl border border-amber-900/15 shadow-xs flex items-center gap-1">
                            {[
                                { id: 'all', label: 'Mọi thời đại' },
                                { id: 'month', label: 'Tháng này' },
                                { id: 'week', label: 'Tuần này' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setPeriod(tab.id)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                                        period === tab.id
                                            ? 'bg-amber-900 text-amber-100 shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/70'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* THẺ THÔNG TIN CÁ NHÂN CỦA SĨ TỬ (Nếu đã đăng nhập) */}
                {myStats && (
                    <div className="bg-[#fffdf9] rounded-3xl p-5 sm:p-7 border border-amber-900/15 shadow-sm relative">
                        <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm">
                                    {myStats.titleInfo.badge || '🌱'}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        Danh Vị Khoa Bảng
                                    </span>
                                    <h3 className="text-xl font-bold font-heritage text-stone-900">
                                        {myStats.academicTitle}
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        {myStats.titleInfo.description}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto text-center">
                                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                                    <p className="text-xl font-extrabold text-stone-900 font-heritage">{myStats.totalExp}</p>
                                    <p className="text-[11px] text-stone-500 font-medium">Tổng EXP</p>
                                </div>
                                <div className="bg-rose-50/80 p-3 rounded-2xl border border-rose-200">
                                    <p className="text-xl font-extrabold text-rose-800 font-heritage flex items-center justify-center gap-1">
                                        <Flame className="w-5 h-5 text-rose-600 fill-rose-500" />
                                        <span>{myStats.streak.current} ngày</span>
                                    </p>
                                    <p className="text-[11px] text-stone-500 font-medium">Chuỗi học tập</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1 bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col justify-center">
                                    <Link
                                        to="/dau-truong"
                                        className="text-xs font-bold text-amber-900 hover:text-red-800 inline-flex items-center justify-center gap-1"
                                    >
                                        <Swords className="w-3.5 h-3.5 text-amber-700" />
                                        <span>Thi Đình 1v1</span>
                                    </Link>
                                    <p className="text-[10px] text-stone-400 mt-0.5">Tranh tài thăng hạng</p>
                                </div>
                            </div>
                        </div>

                        {/* Thanh tiến độ lên danh vị kế tiếp */}
                        {myStats.nextTitle && (
                            <div className="mt-4 pt-4 border-t border-amber-200/60">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-stone-600">
                                        Tiến độ thăng cấp <strong>{myStats.nextTitle.title}</strong>:
                                    </span>
                                    <span className="font-bold text-amber-900">
                                        {myStats.totalExp} / {myStats.nextTitle.minExp} EXP ({myStats.progressPercent}%)
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-800 via-amber-600 to-yellow-500 transition-all duration-300"
                                        style={{ width: `${myStats.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PODIUM TOP 3 SĨ TỬ XUẤT SẮC */}
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-amber-900/15">
                        <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-heritage font-bold text-stone-700">Đang tra cứu Bia Tiến Sĩ...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {topThree.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
                                {/* HẠNG 2 - BẢNG NHÃN */}
                                {topThree[1] && (
                                    <div className="bg-[#fffdf9] p-5 rounded-3xl border-2 border-stone-300 shadow-md text-center space-y-3 relative order-2 md:order-1">
                                        <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 mx-auto flex items-center justify-center font-bold font-heritage text-lg shadow">
                                            2
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                                                Bảng Nhãn
                                            </span>
                                            <h3 className="font-heritage font-bold text-lg text-stone-900 mt-1">
                                                {topThree[1].name}
                                            </h3>
                                            <p className="text-xs text-amber-800 font-bold mt-1">
                                                {period === 'all' ? topThree[1].totalExp : topThree[1].periodExp} EXP
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* HẠNG 1 - TRẠNG NGUYÊN (Nổi bật nhất) */}
                                {topThree[0] && (
                                    <div className="bg-gradient-to-b from-[#fffdf9] to-amber-50/80 p-6 rounded-3xl border-2 border-amber-500 shadow-xl text-center space-y-3 relative order-1 md:order-2 md:-translate-y-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 text-red-950 mx-auto flex items-center justify-center font-extrabold font-heritage text-2xl shadow-lg ring-4 ring-amber-200">
                                            <Crown className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-red-950 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-400 uppercase tracking-wider">
                                                Trạng Nguyên
                                            </span>
                                            <h3 className="font-heritage font-extrabold text-xl text-stone-900 mt-2">
                                                {topThree[0].name}
                                            </h3>
                                            <p className="text-sm text-red-900 font-extrabold mt-1">
                                                {period === 'all' ? topThree[0].totalExp : topThree[0].periodExp} EXP
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* HẠNG 3 - THÁM HOA */}
                                {topThree[2] && (
                                    <div className="bg-[#fffdf9] p-5 rounded-3xl border-2 border-amber-700/40 shadow-md text-center space-y-3 relative order-3 md:order-3">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-bold font-heritage text-lg shadow">
                                            3
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                                Thám Hoa
                                            </span>
                                            <h3 className="font-heritage font-bold text-lg text-stone-900 mt-1">
                                                {topThree[2].name}
                                            </h3>
                                            <p className="text-xs text-amber-800 font-bold mt-1">
                                                {period === 'all' ? topThree[2].totalExp : topThree[2].periodExp} EXP
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DANH SÁCH TỪ HẠNG 4 ĐẾN 10 */}
                        <div className="bg-[#fffdf9] rounded-3xl border border-amber-900/15 shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-5 bg-amber-50/60 border-b border-amber-900/10 flex items-center justify-between text-xs font-bold text-stone-700">
                                <span>Thứ Hạng & Sĩ Tử</span>
                                <span>Danh Hiệu & Điểm EXP</span>
                            </div>

                            <div className="divide-y divide-stone-100">
                                {leaderboard.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-stone-50/70 transition"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                idx === 0 ? 'bg-amber-400 text-red-950' :
                                                idx === 1 ? 'bg-stone-300 text-stone-800' :
                                                idx === 2 ? 'bg-amber-200 text-amber-900' :
                                                'bg-stone-100 text-stone-600'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-sm text-stone-900 font-heritage">
                                                    {item.name}
                                                </h4>
                                                <p className="text-[11px] text-stone-500">
                                                    {item.academicTitle}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-sm text-amber-900 font-heritage">
                                                {period === 'all' ? item.totalExp : item.periodExp} EXP
                                            </p>
                                            <span className="text-[10px] text-stone-400">
                                                {period === 'all' ? 'Tích lũy' : 'Trong kỳ'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* BẢNG GIẢI NGHĨA 6 BẬC KHOA BẢNG */}
                <div className="bg-[#fffdf9] rounded-3xl p-6 border border-amber-900/15 shadow-sm space-y-4">
                    <h3 className="font-heritage font-bold text-stone-900 text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-800" />
                        <span>Hệ Thống 6 Bậc Danh Vị Khoa Bảng Cổ Truyền:</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {myStats?.allTitles?.map((t, idx) => (
                            <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-stone-900 flex items-center gap-1.5 font-heritage text-sm">
                                        <span>{t.badge}</span>
                                        <span>{t.title}</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                                        {t.minExp} - {t.maxExp === Infinity ? '3000+' : t.maxExp} EXP
                                    </span>
                                </div>
                                <p className="text-[11px] text-stone-500 leading-relaxed">{t.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Leaderboard;
