import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    X,
    Video,
    Volume2,
    Sparkles,
    ArrowRight,
    Globe,
    Layers,
    BookOpen,
    Check
} from 'lucide-react';

const gestureDatabase = [
    {
        id: 'xin-chao',
        title: 'Xin chào',
        category: 'basic',
        region: 'Toàn quốc',
        difficulty: 'Cơ bản',
        description: 'Bàn tay mở hướng thái dương, vẫy nhẹ về phía trước.',
        speechText: 'Xin chào bạn!',
        holdTime: '1.5s',
        xp: 50
    },
    {
        id: 'cam-on',
        title: 'Cảm ơn',
        category: 'basic',
        region: 'Miền Bắc & Nam',
        difficulty: 'Cơ bản',
        description: 'Đầu ngón tay chạm nhẹ vào cằm rồi đưa ra phía người đối diện.',
        speechText: 'Xin chân thành cảm ơn!',
        holdTime: '1.5s',
        xp: 50
    },
    {
        id: 'toi-yeu-ban',
        title: 'Tôi yêu bạn (ILY)',
        category: 'conversation',
        region: 'Quốc tế & VN',
        difficulty: 'Cơ bản',
        description: 'Xòe ngón cái, trỏ và út; gập 2 ngón giữa lại.',
        speechText: 'Tôi yêu bạn rất nhiều!',
        holdTime: '1.5s',
        xp: 60
    },
    {
        id: 'tam-biet',
        title: 'Tạm biệt',
        category: 'basic',
        region: 'Toàn quốc',
        difficulty: 'Cơ bản',
        description: 'Bàn tay mở cao ngang tầm vai, vẫy đều sang hai bên.',
        speechText: 'Tạm biệt và hẹn gặp lại!',
        holdTime: '1.5s',
        xp: 40
    },
    {
        id: 'can-giup-do',
        title: 'Cần giúp đỡ',
        category: 'conversation',
        region: 'Toàn quốc',
        difficulty: 'Nâng cao',
        description: 'Bàn tay trái ngửa, bàn tay phải nắm ngón cái dựng đặt lên rồi nâng cùng lúc.',
        speechText: 'Tôi đang cần sự giúp đỡ!',
        holdTime: '2.0s',
        xp: 80
    },
    {
        id: 'xin-loi',
        title: 'Xin lỗi',
        category: 'conversation',
        region: 'Toàn quốc',
        difficulty: 'Cơ bản',
        description: 'Bàn tay nắm nhẹ xoa tròn theo chiều kim đồng hồ trước ngực.',
        speechText: 'Tôi vô cùng xin lỗi!',
        holdTime: '1.5s',
        xp: 50
    },
    {
        id: 'ban-ten-la-gi',
        title: 'Bạn tên là gì?',
        category: 'conversation',
        region: 'Miền Bắc',
        difficulty: 'Nâng cao',
        description: 'Ngón trỏ chỉ đối phương, kết hợp cử chỉ chữ cái tên và nét mặt thắc mắc.',
        speechText: 'Bạn tên là gì?',
        holdTime: '2.0s',
        xp: 90
    },
    {
        id: 'an-com',
        title: 'Ăn cơm',
        category: 'basic',
        region: 'Toàn quốc',
        difficulty: 'Cơ bản',
        description: 'Các ngón tay chụm lại đưa vào gần miệng mô phỏng động tác gắp thức ăn.',
        speechText: 'Ăn cơm thôi nào!',
        holdTime: '1.5s',
        xp: 50
    },
    {
        id: 'uong-nuoc',
        title: 'Uống nước',
        category: 'basic',
        region: 'Toàn quốc',
        difficulty: 'Cơ bản',
        description: 'Bàn tay khum lại hình chữ C đưa lại gần môi mô phỏng cầm cốc nước.',
        speechText: 'Uống nước nhé!',
        holdTime: '1.5s',
        xp: 50
    },
    {
        id: 'chuc-mung',
        title: 'Chúc mừng',
        category: 'conversation',
        region: 'Toàn quốc',
        difficulty: 'Nâng cao',
        description: 'Hai bàn tay nâng cao vẫy nhẹ xoay tròn thể hiện niềm vui hân hoan.',
        speechText: 'Chúc mừng bạn đã hoàn thành xuất sắc!',
        holdTime: '2.0s',
        xp: 75
    }
];

const GlobalSearchModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [speakingId, setSpeakingId] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Auto-focus input when modal opens & handle Escape key
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredGestures = gestureDatabase.filter((g) => {
        const matchesQuery =
            g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.region.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || g.category === activeTab;
        return matchesQuery && matchesTab;
    });

    const handleSpeak = (e, text, id) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            setSpeakingId(id);
            utterance.onend = () => setSpeakingId(null);
            utterance.onerror = () => setSpeakingId(null);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSelectGesture = (gesture) => {
        onClose();
        navigate(`/learning/mirror?sign=${gesture.id}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
                    <Search className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm ký hiệu cử chỉ, phương ngữ, khẩu hình..."
                        className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                        ESC
                    </button>
                </div>

                {/* Filter Sub-Tabs */}
                <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1 rounded-full font-bold transition ${
                            activeTab === 'all'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                    >
                        Tất cả ({gestureDatabase.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-3 py-1 rounded-full font-bold transition ${
                            activeTab === 'basic'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                    >
                        Cơ bản
                    </button>
                    <button
                        onClick={() => setActiveTab('conversation')}
                        className={`px-3 py-1 rounded-full font-bold transition ${
                            activeTab === 'conversation'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                    >
                        Hội thoại giao tiếp
                    </button>
                </div>

                {/* Gesture Results List */}
                <div className="max-h-[380px] overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-100/60">
                    {filteredGestures.length > 0 ? (
                        filteredGestures.map((gesture) => (
                            <div
                                key={gesture.id}
                                onClick={() => handleSelectGesture(gesture)}
                                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/50 hover:border-rose-100 border border-transparent transition-all cursor-pointer"
                            >
                                <div className="space-y-1 min-w-0 pr-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                                            {gesture.title}
                                        </h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                            {gesture.region}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                            +{gesture.xp} XP
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                        {gesture.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Web Speech TTS Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleSpeak(e, gesture.speechText, gesture.id)}
                                        className={`p-2 rounded-xl transition ${
                                            speakingId === gesture.id
                                                ? 'bg-rose-500 text-white animate-pulse'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                        }`}
                                        title="Nghe phát âm Tiếng Việt (Web Speech TTS)"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>

                                    {/* Practice AI Mirror Action */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectGesture(gesture);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition"
                                    >
                                        <Video className="w-3.5 h-3.5" />
                                        <span>Luyện tập AI</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 space-y-2">
                            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-sm font-bold text-slate-700">Không tìm thấy ký hiệu phù hợp</p>
                            <p className="text-xs text-slate-400">
                                Thử nhập từ khóa khác như "Xin chào", "Cảm ơn", "Tên"...
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Hotkey Guide */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-bold text-[10px]">Enter</kbd>
                            Chọn bài học
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-bold text-[10px]">ESC</kbd>
                            Đóng
                        </span>
                    </div>
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        HeartSign AI Dictionary v2.0
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearchModal;
