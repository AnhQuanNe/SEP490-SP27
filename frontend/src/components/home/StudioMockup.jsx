import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Play,
    Pause,
    CheckCircle2,
    Camera,
    Volume2,
    Flame,
    Sparkles,
    ChevronRight,
    Mic,
    MessageSquare,
    Globe,
    Zap,
    RefreshCw
} from 'lucide-react';

const StudioMockup = () => {
    const [activeTab, setActiveTab] = useState('mirror'); // 'mirror' | 'translator' | 'dialect'
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState('1.0x');
    const [holdProgress, setHoldProgress] = useState(100);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Audio Speech Synthesis Trigger
    const handleSpeakSample = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('Rất vui được gặp bạn! Chào mừng đến với HeartSign.');
            utterance.lang = 'vi-VN';
            utterance.rate = 1.0;
            setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Cycle speed
    const toggleSpeed = () => {
        if (speed === '1.0x') setSpeed('0.5x');
        else if (speed === '0.5x') setSpeed('1.5x');
        else setSpeed('1.0x');
    };

    return (
        <div className="relative mx-auto max-w-lg lg:max-w-none select-none">
            {/* Main Studio Card Container */}
            <div className="bg-slate-900 rounded-3xl p-5 shadow-2xl shadow-indigo-500/15 border border-slate-800 relative z-10 text-white backdrop-blur-md">
                
                {/* Window Header (macOS buttons + Title) */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-mono font-bold text-slate-400 ml-2">
                            HEARTSIGN_AI_STUDIO.tsx
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>60 FPS</span>
                    </div>
                </div>

                {/* Sub-Nav Tabs inside window */}
                <div className="flex items-center gap-2 mt-3.5 mb-4">
                    <button
                        onClick={() => setActiveTab('mirror')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'mirror'
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span>Gương ảo AI</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('translator')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'translator'
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span>Dịch 2 Chiều</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('dialect')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'dialect'
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span>Phương ngữ</span>
                    </button>
                </div>

                {/* TAB 1: GƯƠNG ẢO AI (SPLIT PREVIEW) */}
                {activeTab === 'mirror' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            
                            {/* Left Box: MẪU CHUẨN */}
                            <div className="relative rounded-2xl bg-slate-950 p-3 aspect-square flex flex-col justify-between overflow-hidden border border-slate-800 group">
                                {/* Real Video Preview */}
                                <video
                                    src="/videos/xin-chao.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/70 z-10 pointer-events-none"></div>

                                {/* Top Badges */}
                                <div className="relative z-20 flex items-center justify-between text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 backdrop-blur-sm">
                                        MẪU CHUẨN
                                    </span>
                                    <button
                                        onClick={toggleSpeed}
                                        className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 font-mono text-slate-300 transition backdrop-blur-sm"
                                        title="Chỉnh tốc độ phát"
                                    >
                                        {speed} Speed
                                    </button>
                                </div>

                                {/* Center Play Video Mock */}
                                <div className="relative z-20 text-center my-auto">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-12 h-12 mx-auto rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/40 hover:scale-105 transition-all mb-2 cursor-pointer"
                                    >
                                        {isPlaying ? (
                                            <Play className="w-5 h-5 fill-white ml-0.5" />
                                        ) : (
                                            <Pause className="w-5 h-5 fill-white" />
                                        )}
                                    </button>
                                    <p className="text-xs font-bold text-white tracking-tight">"Xin chào"</p>
                                    <p className="text-[10px] text-slate-300 font-medium">Giảng viên chuyên biệt (2 tay)</p>
                                </div>

                                {/* Bottom Tag */}
                                <div className="relative z-20 flex items-center justify-between text-[9px] text-slate-400">
                                    <span>Ground Truth</span>
                                    <span className="text-rose-400 font-semibold">Chuẩn Quốc gia</span>
                                </div>
                            </div>

                            {/* Right Box: GƯƠNG AI WEBCAM */}
                            <div className="relative rounded-2xl bg-indigo-950/80 p-3 aspect-square flex flex-col justify-between overflow-hidden border-2 border-emerald-500 shadow-md shadow-emerald-500/20 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/60 z-10 pointer-events-none"></div>

                                {/* MediaPipe 2-Hand Landmark Wireframe Simulation */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 stroke-current animate-pulse px-2">
                                        {/* LEFT HAND (Tay trái) */}
                                        <g className="text-emerald-400">
                                            {/* Palm & Wrist */}
                                            <line x1="25" y1="80" x2="16" y2="60" strokeWidth="1.2" />
                                            <line x1="25" y1="80" x2="25" y2="55" strokeWidth="1.2" />
                                            <line x1="25" y1="80" x2="34" y2="60" strokeWidth="1.2" />
                                            {/* Thumb */}
                                            <line x1="16" y1="60" x2="8" y2="50" strokeWidth="1.2" />
                                            <line x1="8" y1="50" x2="5" y2="38" strokeWidth="1.2" />
                                            {/* Index */}
                                            <line x1="18" y1="52" x2="16" y2="35" strokeWidth="1.2" />
                                            <line x1="16" y1="35" x2="15" y2="20" strokeWidth="1.2" />
                                            {/* Middle */}
                                            <line x1="25" y1="52" x2="25" y2="30" strokeWidth="1.2" />
                                            <line x1="25" y1="30" x2="25" y2="15" strokeWidth="1.2" />
                                            {/* Ring */}
                                            <line x1="31" y1="52" x2="33" y2="35" strokeWidth="1.2" />
                                            <line x1="33" y1="35" x2="34" y2="22" strokeWidth="1.2" />
                                            {/* Pinky */}
                                            <line x1="34" y1="60" x2="40" y2="48" strokeWidth="1.2" />
                                            <line x1="40" y1="48" x2="42" y2="35" strokeWidth="1.2" />
                                            {/* Dots */}
                                            <circle cx="25" cy="80" r="2.2" fill="#10b981" />
                                            <circle cx="15" cy="20" r="2" fill="#34d399" />
                                            <circle cx="25" cy="15" r="2" fill="#34d399" />
                                            <circle cx="34" cy="22" r="2" fill="#34d399" />
                                            <circle cx="42" cy="35" r="2" fill="#34d399" />
                                            <circle cx="5" cy="38" r="2" fill="#34d399" />
                                        </g>

                                        {/* RIGHT HAND (Tay phải) */}
                                        <g className="text-cyan-400">
                                            {/* Palm & Wrist */}
                                            <line x1="75" y1="80" x2="66" y2="60" strokeWidth="1.2" />
                                            <line x1="75" y1="80" x2="75" y2="55" strokeWidth="1.2" />
                                            <line x1="75" y1="80" x2="84" y2="60" strokeWidth="1.2" />
                                            {/* Pinky */}
                                            <line x1="66" y1="60" x2="60" y2="48" strokeWidth="1.2" />
                                            <line x1="60" y1="48" x2="58" y2="35" strokeWidth="1.2" />
                                            {/* Ring */}
                                            <line x1="69" y1="52" x2="67" y2="35" strokeWidth="1.2" />
                                            <line x1="67" y1="35" x2="66" y2="22" strokeWidth="1.2" />
                                            {/* Middle */}
                                            <line x1="75" y1="52" x2="75" y2="30" strokeWidth="1.2" />
                                            <line x1="75" y1="30" x2="75" y2="15" strokeWidth="1.2" />
                                            {/* Index */}
                                            <line x1="82" y1="52" x2="84" y2="35" strokeWidth="1.2" />
                                            <line x1="84" y1="35" x2="85" y2="20" strokeWidth="1.2" />
                                            {/* Thumb */}
                                            <line x1="84" y1="60" x2="92" y2="50" strokeWidth="1.2" />
                                            <line x1="92" y1="50" x2="95" y2="38" strokeWidth="1.2" />
                                            {/* Dots */}
                                            <circle cx="75" cy="80" r="2.2" fill="#06b6d4" />
                                            <circle cx="85" cy="20" r="2" fill="#22d3ee" />
                                            <circle cx="75" cy="15" r="2" fill="#22d3ee" />
                                            <circle cx="66" cy="22" r="2" fill="#22d3ee" />
                                            <circle cx="58" cy="35" r="2" fill="#22d3ee" />
                                            <circle cx="95" cy="38" r="2" fill="#22d3ee" />
                                        </g>
                                    </svg>
                                </div>

                                {/* Top Badges */}
                                <div className="relative z-20 flex items-center justify-between text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 font-extrabold text-white flex items-center gap-1 shadow">
                                        <Camera className="w-2.5 h-2.5" /> GƯƠNG AI (2 TAY)
                                    </span>
                                    <span className="font-mono text-emerald-400 font-bold">1.5s / 1.5s</span>
                                </div>

                                {/* Center Target Validation */}
                                <div className="relative z-20 text-center my-auto">
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-extrabold shadow-lg shadow-emerald-500/40">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        ĐẠT CHUẨN 98%
                                    </div>
                                    <p className="text-[10px] text-emerald-200 mt-1 font-semibold">
                                        Khớp 42 điểm (2 tay) 168°
                                    </p>
                                </div>

                                {/* Bottom Hold-time Progress Bar */}
                                <div className="relative z-20 space-y-1">
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-500 via-teal-300 to-cyan-400 h-full w-full rounded-full transition-all"></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-300">
                                        <span>Hold-time Validator</span>
                                        <span className="text-emerald-400 font-bold">+50 XP</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Action Footer of Window */}
                        <div className="pt-2 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                                Chấm 42 khớp tay MediaPipe v2.0 (2 Tay)
                            </span>
                            <Link
                                to="/learning/mirror"
                                className="text-rose-400 hover:text-rose-300 font-bold inline-flex items-center gap-1 group transition"
                            >
                                <span>Mở Studio</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* TAB 2: DỊCH 2 CHIỀU (TRANSLATOR PREVIEW) */}
                {activeTab === 'translator' && (
                    <div className="space-y-3 py-1 animate-in fade-in duration-200">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                                    <Camera className="w-3.5 h-3.5" /> Sign ➔ Voice (Cử chỉ sang Giọng nói)
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
                                    Webcam Active
                                </span>
                            </div>

                            <div className="flex items-start gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                                    <Volume2 className="w-4 h-4" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Nhận diện được câu nói:</p>
                                    <p className="text-sm font-bold text-white">"Xin chào, tôi cần được hỗ trợ tìm đường!"</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    onClick={handleSpeakSample}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                                >
                                    <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                                    <span>{isSpeaking ? 'Đang phát âm...' : 'Nghe giọng nói TTS'}</span>
                                </button>
                                <Link
                                    to="/communicator"
                                    className="text-xs text-rose-400 hover:text-rose-300 font-bold inline-flex items-center gap-1"
                                >
                                    Vào phòng dịch <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: PHƯƠNG NGỮ (SYNSET COMPARISON) */}
                {activeTab === 'dialect' && (
                    <div className="space-y-3 py-1 animate-in fade-in duration-200">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                    <Globe className="w-3.5 h-3.5" /> Đối chiếu phương ngữ từ "Xin chào"
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                                    3 Miền
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-bold text-rose-400">Miền Bắc</span>
                                    <p className="font-semibold text-white text-xs">Vẫy ngang trán</p>
                                    <span className="text-[9px] text-slate-400 block">Độ lệch: 0%</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-bold text-amber-400">Miền Trung</span>
                                    <p className="font-semibold text-white text-xs">Gập nhẹ ngón cái</p>
                                    <span className="text-[9px] text-slate-400 block">Biến thể Huế</span>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                                    <span className="text-[10px] font-bold text-blue-400">Miền Nam</span>
                                    <p className="font-semibold text-white text-xs">Vẫy mở rộng vai</p>
                                    <span className="text-[9px] text-slate-400 block">Phổ biến TP.HCM</span>
                                </div>
                            </div>

                            <div className="pt-1 text-right">
                                <Link
                                    to="/dictionary"
                                    className="text-xs text-rose-400 hover:text-rose-300 font-bold inline-flex items-center gap-1"
                                >
                                    Khám phá từ điển 3 miền <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Floating Badge 1: Top Right - Web Speech TTS */}
            <div
                onClick={handleSpeakSample}
                className="absolute -top-5 -right-3 sm:-right-5 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 z-20 cursor-pointer hover:border-rose-500/60 hover:scale-105 transition-all group"
                title="Bấm để nghe thử Web Speech TTS"
            >
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-rose-400' : 'group-hover:text-rose-300'}`} />
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-[10px] text-slate-400 font-semibold">Web Speech TTS</p>
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/20 px-1 rounded">Audio</span>
                    </div>
                    <p className="text-xs font-bold text-slate-100">"Rất vui được gặp bạn!"</p>
                </div>
            </div>

            {/* Floating Badge 2: Bottom Left - Streak 7 Ngày */}
            <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Chuỗi ngày học
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                        Streak 7 Ngày Liên Tục 🔥
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudioMockup;
