import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import learningService from '../../services/learning.service';
import {
    BookOpen,
    CheckCircle2,
    Lock,
    Sparkles,
    Flame,
    Award,
    Play,
    Star,
    ChevronRight,
    ArrowLeft,
    Video,
    Loader2
} from 'lucide-react';

const SkillTree = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stages, setStages] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSkillTree = async () => {
        try {
            setLoading(true);
            const res = await learningService.getSkillTree();
            if (res.success) {
                setStages(res.data.stages || []);
                setUserStats(res.data.userStats || null);
            }
        } catch (error) {
            console.error('Không thể tải Cây kỹ năng:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkillTree();
    }, []);

    const userXp = userStats?.xp ?? user?.xp ?? 0;
    const userStreak = userStats?.streak ?? user?.streak ?? 1;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Header Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Cây Kỹ Năng Gamification (Skill Tree)
                            </h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                UC05
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Lộ trình từng chặng mở khóa bài học, tích lũy XP và hoàn thiện phản xạ cử chỉ.
                        </p>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                        <Flame className="w-4 h-4 fill-amber-500" />
                        <span>Streak: {userStreak} Ngày</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                        <Award className="w-4 h-4" />
                        <span>Tổng XP: {userXp}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    <p className="text-sm font-semibold">Đang tải dữ liệu Cây kỹ năng từ hệ thống...</p>
                </div>
            ) : (
                <div className="space-y-6 relative">
                    {/* Connecting Line for Timeline */}
                    <div className="hidden md:block absolute left-8 top-10 bottom-10 w-1 bg-slate-200 rounded-full z-0"></div>

                    {stages.map((stage) => {
                        const isCompleted = stage.status === 'completed';
                        const isInProgress = stage.status === 'in-progress';
                        const isLocked = stage.status === 'locked';

                        // First playable lesson in this stage
                        const firstPlayableLesson = stage.lessons?.find((l) => !l.completed) || stage.lessons?.[0];

                        return (
                            <div
                                key={stage.id}
                                className={`relative z-10 bg-white rounded-3xl p-6 border transition-all duration-200 ${
                                    isInProgress
                                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                                        : isCompleted
                                        ? 'border-slate-200 hover:border-slate-300 shadow-sm'
                                        : 'border-slate-200/60 opacity-70 bg-slate-50/50'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        {/* Stage Icon Node */}
                                        <div
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-sm ${
                                                isCompleted
                                                    ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                                                    : isInProgress
                                                    ? 'bg-gradient-to-tr from-indigo-600 to-rose-500 text-white shadow-indigo-500/25'
                                                    : 'bg-slate-200 text-slate-400'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-7 h-7" />
                                            ) : isLocked ? (
                                                <Lock className="w-6 h-6" />
                                            ) : (
                                                <span>0{stage.id}</span>
                                            )}
                                        </div>

                                        {/* Stage Meta */}
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                                    {stage.title}
                                                </h3>
                                                {isCompleted && (
                                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Đã hoàn thành
                                                    </span>
                                                )}
                                                {isInProgress && (
                                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        Đang học
                                                    </span>
                                                )}
                                                {isLocked && (
                                                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                        Mở khóa khi đạt {stage.requiredXp} XP
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                                                {stage.description}
                                            </p>

                                            {/* Stars and Rewards */}
                                            <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 font-semibold">
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    {[...Array(3)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${
                                                                i < (stage.stars > 0 ? Math.min(3, Math.ceil(stage.stars / (stage.lessons.length || 1))) : 0)
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-slate-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span>•</span>
                                                <span>{stage.lessons.length} Bài học</span>
                                                <span>•</span>
                                                <span className="text-emerald-600 font-bold">
                                                    Đã xong {stage.completedCount || 0}/{stage.lessons.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5">
                                        {!isLocked && firstPlayableLesson && (
                                            <Link
                                                to={`/learning/mirror?lessonId=${firstPlayableLesson._id}`}
                                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 shadow-md shadow-rose-500/20 transition"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span>Luyện Tập Ngay</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-lessons Grid */}
                                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {stage.lessons.map((lesson) => (
                                        <Link
                                            key={lesson._id}
                                            to={!isLocked ? `/learning/mirror?lessonId=${lesson._id}` : '#'}
                                            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition block ${
                                                lesson.completed
                                                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60'
                                                    : isLocked
                                                    ? 'bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {lesson.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                ) : isLocked ? (
                                                    <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                ) : (
                                                    <Play className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                                )}
                                                <span className="truncate font-semibold">{lesson.title}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 ml-2 flex-shrink-0">
                                                +{lesson.xpReward} XP
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default SkillTree;
