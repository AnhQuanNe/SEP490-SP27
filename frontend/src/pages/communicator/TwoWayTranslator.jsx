import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageSquare,
    Volume2,
    Mic,
    MicOff,
    Video,
    Camera,
    Sparkles,
    ArrowLeft,
    RefreshCw,
    Send,
    Play,
    Users,
    Layers,
    CheckCircle2,
    Copy,
    Share2
} from 'lucide-react';

const TwoWayTranslator = () => {
    const [activeTab, setActiveTab] = useState('sign-to-voice'); // 'sign-to-voice' | 'voice-to-sign' | 'websocket-room'

    // Sign to Voice state
    const [detectedKeywords, setDetectedKeywords] = useState(['XIN CHÀO', 'TÔI', 'CẦN', 'GIÚP ĐỠ']);
    const [refinedSentence, setRefinedSentence] = useState('Xin chào, tôi cần mọi người giúp đỡ một chút được không ạ?');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Voice to Sign state
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedVoiceText, setTranscribedVoiceText] = useState('Bạn có muốn uống một ly nước ấm không?');
    const [signSequence, setSignSequence] = useState([
        { word: 'BẠN', videoUrl: 'Video Ký hiệu: BẠN', region: 'Phổ thông' },
        { word: 'MUỐN', videoUrl: 'Video Ký hiệu: MUỐN', region: 'Phổ thông' },
        { word: 'UỐNG NƯỚC', videoUrl: 'Video Ký hiệu: UỐNG NƯỚC', region: 'Phổ thông' },
    ]);

    // WebSocket Room state
    const [roomId, setRoomId] = useState('HSS-8924');
    const [copied, setCopied] = useState(false);

    // Web Speech API text-to-speech speaker
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Trình duyệt của bạn không hỗ trợ tính năng Web Speech API TTS.');
        }
    };

    const handleCopyRoom = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Page Header */}
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
                                Trợ Lý Giao Tiếp Hai Chiều Thời Gian Thực
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Cầu nối hai chiều giữa Người khiếm thính (Ký hiệu) và Xã hội (Giọng nói/Văn bản).
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold self-stretch sm:self-auto">
                    <button
                        onClick={() => setActiveTab('sign-to-voice')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition ${
                            activeTab === 'sign-to-voice'
                                ? 'bg-white text-rose-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Cử chỉ ➔ Giọng nói
                    </button>
                    <button
                        onClick={() => setActiveTab('voice-to-sign')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition ${
                            activeTab === 'voice-to-sign'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Giọng nói ➔ Ký hiệu
                    </button>
                    <button
                        onClick={() => setActiveTab('websocket-room')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition ${
                            activeTab === 'websocket-room'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Phòng Thoại Real-Time (UC11)
                    </button>
                </div>
            </div>

            {/* TAB 1: SIGN TO VOICE (UC09) */}
            {activeTab === 'sign-to-voice' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Camera Feed simulation */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                                <h2 className="font-extrabold text-slate-800 text-sm sm:text-base">
                                    Camera Nhận Diện Cử Chỉ Người Khiếm Thính
                                </h2>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                MediaPipe + NLP LLM
                            </span>
                        </div>

                        <div className="relative rounded-2xl bg-slate-950 aspect-video flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                            <div className="w-16 h-16 rounded-2xl bg-rose-600/80 flex items-center justify-center text-white mb-3 shadow-lg">
                                <Camera className="w-8 h-8" />
                            </div>
                            <p className="font-bold text-sm">Webcam Bắt Chuyển Động Tay & Khuôn Mặt</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                                Người khiếm thính ra dấu trước màn hình, hệ thống tự động bóc tách từ khóa cử chỉ.
                            </p>

                            {/* Detected Tokens Bar */}
                            <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-semibold">Từ khóa bắt được:</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {detectedKeywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[11px]">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <span>FPS: 30 • Độ chính xác cử chỉ: 96%</span>
                            <span className="text-rose-600 font-semibold">Tự động làm mượt câu qua LLM</span>
                        </div>
                    </div>

                    {/* Right: LLM Refined Speech & Audio Output */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> LLM Câu Hoàn Chỉnh & Lịch Sự
                            </span>
                            <h3 className="text-lg font-black text-slate-900">
                                Phụ Đề & Giọng Đọc Ra Loa
                            </h3>
                        </div>

                        {/* Refined Text Box */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                            <p className="text-base font-semibold text-slate-800 leading-relaxed italic">
                                "{refinedSentence}"
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200/60">
                                <span>Ghép ngữ pháp tự nhiên tiếng Việt</span>
                                <span className="text-indigo-600 font-bold">Latency: 70ms</span>
                            </div>
                        </div>

                        {/* Text to Speech Action */}
                        <div className="space-y-3">
                            <button
                                onClick={() => speakText(refinedSentence)}
                                className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-white shadow-lg transition ${
                                    isSpeaking
                                        ? 'bg-amber-600 shadow-amber-600/30 animate-pulse'
                                        : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 shadow-rose-500/25'
                                }`}
                            >
                                <Volume2 className="w-5 h-5" />
                                <span>{isSpeaking ? 'Đang phát âm thanh...' : 'Phát Ra Loa (Web Speech TTS)'}</span>
                            </button>

                            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                Người nghe trong phòng hoặc xung quanh sẽ nghe rõ giọng đọc tiếng Việt chuẩn xác từ máy tính/điện thoại.
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 2: VOICE TO SIGN (UC10) */}
            {activeTab === 'voice-to-sign' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Voice Input Console */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                                <Mic className="w-3.5 h-3.5" /> Web Speech STT
                            </span>
                            <h3 className="text-lg font-black text-slate-900">
                                Thu Âm Giọng Nói Người Nghe
                            </h3>
                        </div>

                        {/* Microphone Toggle Button */}
                        <div className="text-center py-6">
                            <button
                                onClick={() => setIsRecording(!isRecording)}
                                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl transition-all ${
                                    isRecording
                                        ? 'bg-rose-500 text-white ring-8 ring-rose-500/20 animate-pulse'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/25'
                                }`}
                            >
                                {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                            </button>
                            <p className="text-xs font-bold text-slate-700 mt-4">
                                {isRecording ? 'Đang lắng nghe giọng nói của bạn...' : 'Bấm vào micro để bắt đầu nói'}
                            </p>
                        </div>

                        {/* Transcribed Text Result */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Văn bản nhận diện:</span>
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">
                                "{transcribedVoiceText}"
                            </p>
                        </div>
                    </div>

                    {/* Right: Sequence of Sign Videos Playback */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Chuỗi Ký Hiệu Phát Lại Cho Người Khiếm Thính
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Tự động bóc tách từ vựng gốc và truy vấn kho ngữ liệu tương ứng.
                                </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                3 Ký hiệu
                            </span>
                        </div>

                        {/* Sequence Playlist */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {signSequence.map((item, idx) => (
                                <div key={idx} className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 flex flex-col justify-between aspect-square">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/80 font-bold">0{idx + 1}</span>
                                        <span className="text-slate-400">{item.region}</span>
                                    </div>
                                    <div className="text-center my-auto">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-rose-400">
                                            <Play className="w-5 h-5 fill-rose-400 ml-0.5" />
                                        </div>
                                        <p className="font-extrabold text-sm text-white">"{item.word}"</p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center">Video Synset chuẩn</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                            <span>Tự động phát nối tiếp các cử chỉ mượt mà không bị ngắt quãng.</span>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">
                                Phát lại chuỗi
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 3: WEBSOCKET REALTIME ROOM (UC11) */}
            {activeTab === 'websocket-room' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> Socket.IO Full-Duplex Room
                            </span>
                            <h2 className="text-xl font-black text-slate-900">
                                Phòng Hội Thoại Hai Chiều Độc Lập Giữa 2 Thiết Bị
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                                Một bên dùng điện thoại ra dấu cử chỉ, một bên dùng máy tính nói micro. Dữ liệu âm thanh, video ký hiệu đồng bộ tức thì không cần tải lại trang.
                            </p>
                        </div>

                        {/* Room Code Card */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Mã phòng hội thoại</p>
                                <p className="text-base font-extrabold text-slate-900 font-mono">{roomId}</p>
                            </div>
                            <button
                                onClick={handleCopyRoom}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition"
                                title="Sao chép mã phòng"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Room Mockup Simulation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-rose-400">Thiết bị A • Người Khiếm Thính</span>
                                <span className="text-emerald-400 font-mono text-[11px]">Đã kết nối</span>
                            </div>
                            <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                                [Luồng Video Webcam & Cử chỉ thời gian thực]
                            </div>
                            <p className="text-xs text-slate-300">Nhận video ký hiệu & phụ đề chữ từ đối phương.</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-indigo-950 text-white space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-indigo-300">Thiết bị B • Người Nghe / Bác Sĩ</span>
                                <span className="text-emerald-400 font-mono text-[11px]">Đã kết nối</span>
                            </div>
                            <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                                [Luồng Micro & Loa phát thanh thời gian thực]
                            </div>
                            <p className="text-xs text-indigo-200">Nghe giọng nói TTS đọc to từ cử chỉ của Thiết bị A.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TwoWayTranslator;
