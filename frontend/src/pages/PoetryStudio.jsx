import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Feather, 
    Sparkles, 
    BookOpen, 
    CheckCircle2, 
    AlertCircle, 
    HelpCircle, 
    Save, 
    Send, 
    RotateCcw, 
    Bot, 
    Layers, 
    Trash2, 
    Share2, 
    Eye, 
    ArrowRight, 
    Loader2, 
    Sliders, 
    Check, 
    X,
    Trophy,
    Heart
} from 'lucide-react';
import { poetryService } from '../services/poetry.service';
import { useAuth } from '../context/AuthContext';

const SAMPLE_POEMS = [
    {
        title: 'Nhớ nguồn',
        content: `Công cha như núi Thái Sơn\nNghĩa mẹ như nước trong nguồn chảy ra\nMột lòng thờ mẹ kính cha\nCho tròn chữ hiếu mới là đạo con`,
    },
    {
        title: 'Khuyên học',
        content: `Có công mài sắt có ngày nên kim\nLòng bền ý chí kiếm tìm tương lai\nĐường đời dù lắm chông gai\nVững vàng tay lái chẳng sai tấc lòng`,
    },
];

const PoetryStudio = () => {
    const { user, isAuthenticated } = useAuth();

    // State trình soạn thảo
    const [title, setTitle] = useState('');
    const [authorName, setAuthorName] = useState(user?.name || '');
    const [content, setContent] = useState('');
    const [currentPoemId, setCurrentPoemId] = useState(null);

    // State phân tích & thẩm định
    const [ruleAnalysis, setRuleAnalysis] = useState(null);
    const [aiCriticResult, setAiCriticResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCritiquing, setIsCritiquing] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error'

    // State tab
    const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'my-poems' | 'community'
    const [myPoems, setMyPoems] = useState([]);
    const [communityPoems, setCommunityPoems] = useState([]);
    const [loadingPoems, setLoadingPoems] = useState(false);

    // State modal đối thơ cùng AI
    const [coWriteModalOpen, setCoWriteModalOpen] = useState(false);
    const [inputLucLine, setInputLucLine] = useState('');
    const [coWriteCandidates, setCoWriteCandidates] = useState([]);
    const [isCoWriting, setIsCoWriting] = useState(false);
    const [coWriteError, setCoWriteError] = useState(null);

    // Debounced rule check khi người dùng gõ thơ
    const debounceTimerRef = useRef(null);

    const runRuleCheck = useCallback(async (poemText) => {
        if (!poemText || !poemText.trim()) {
            setRuleAnalysis(null);
            return;
        }

        try {
            setIsAnalyzing(true);
            const data = await poetryService.analyzePoem(poemText);
            setRuleAnalysis(data);
        } catch (err) {
            console.warn('Lỗi phân tích âm luật:', err.message);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const handleContentChange = (e) => {
        const text = e.target.value;
        setContent(text);

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            runRuleCheck(text);
        }, 600);
    };

    // Chạy AI thẩm định toàn diện
    const handleRunCritique = async () => {
        if (!content.trim()) return;

        try {
            setIsCritiquing(true);
            const result = await poetryService.critiquePoem({
                content,
                title: title.trim() || 'Không đề',
                authorName: authorName.trim() || user?.name || 'Tác giả',
            });
            setAiCriticResult(result);
            setRuleAnalysis(result.ruleAnalysis);
        } catch (err) {
            console.error('Lỗi thẩm định thơ:', err);
            alert('Không thể thẩm định thơ lúc này: ' + (err.message || 'Lỗi kết nối'));
        } finally {
            setIsCritiquing(false);
        }
    };

    // Lưu bài thơ hoặc bản nháp
    const handleSavePoem = async (status = 'draft') => {
        if (!content.trim() || !title.trim()) {
            alert('Vui lòng nhập tựa đề và nội dung bài thơ trước khi lưu');
            return;
        }

        try {
            setSaveStatus('saving');
            const res = await poetryService.savePoem({
                poemId: currentPoemId,
                title: title.trim(),
                content: content.trim(),
                authorName: authorName.trim() || user?.name,
                status,
                analysisResult: aiCriticResult || { scores: ruleAnalysis?.summary ? { toneScore: ruleAnalysis.summary.toneScore } : {} },
            });
            setCurrentPoemId(res?._id || res?.data?._id || currentPoemId);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Lỗi lưu thơ:', err);
            setSaveStatus('error');
            alert('Lỗi lưu bài thơ: ' + (err.message || 'Vui lòng đăng nhập lại'));
        }
    };

    // Tải danh sách thơ cá nhân
    const fetchMyPoems = async () => {
        if (!isAuthenticated) return;
        try {
            setLoadingPoems(true);
            const poems = await poetryService.getMyPoems();
            setMyPoems(poems);
        } catch (err) {
            console.warn('Lỗi tải thơ cá nhân:', err.message);
        } finally {
            setLoadingPoems(false);
        }
    };

    // Tải danh sách thơ cộng đồng
    const fetchCommunityPoems = async () => {
        try {
            setLoadingPoems(true);
            const data = await poetryService.getCommunityPoems();
            setCommunityPoems(data?.poems || []);
        } catch (err) {
            console.warn('Lỗi tải thơ cộng đồng:', err.message);
        } finally {
            setLoadingPoems(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'my-poems') fetchMyPoems();
        if (activeTab === 'community') fetchCommunityPoems();
    }, [activeTab]);

    // Mở một bài thơ để chỉnh sửa
    const handleLoadPoem = (p) => {
        setTitle(p.title);
        setContent(p.content);
        setAuthorName(p.authorName || user?.name);
        setCurrentPoemId(p._id);
        setActiveTab('editor');
        runRuleCheck(p.content);
        setAiCriticResult(p.analysisResult || null);
    };

    // Tạo bài thơ mới
    const handleNewPoem = () => {
        setTitle('');
        setContent('');
        setCurrentPoemId(null);
        setRuleAnalysis(null);
        setAiCriticResult(null);
    };

    // Chạy đối thơ cùng AI
    const handleCoWrite = async () => {
        if (!inputLucLine.trim()) return;

        try {
            setIsCoWriting(true);
            setCoWriteError(null);
            const contextText = [
                title.trim() ? `Tựa đề bài thơ: ${title.trim()}` : null,
                content.trim() ? `Các câu thơ trước đó:\n${content.trim()}` : null,
            ].filter(Boolean).join('\n');

            const res = await poetryService.coWrite({
                lucLine: inputLucLine,
                context: contextText,
            });
            const candidates = res?.candidates || res?.data?.candidates || [];
            setCoWriteCandidates(candidates);
            if (candidates.length === 0) {
                setCoWriteError('Không tìm thấy phương án câu Bát phù hợp.');
            }
        } catch (err) {
            setCoWriteError(err.message || 'Không thể ứng khẩu câu Bát');
        } finally {
            setIsCoWriting(false);
        }
    };

    // Chèn cặp câu đối vào trình soạn thảo
    const handleInsertCouplet = (batLine) => {
        const couplet = `${inputLucLine.trim()}\n${batLine.trim()}`;
        const newContent = content.trim() ? `${content.trim()}\n${couplet}` : couplet;
        setContent(newContent);
        setCoWriteModalOpen(false);
        setInputLucLine('');
        setCoWriteCandidates([]);
        runRuleCheck(newContent);
    };

    // Áp dụng từ gợi ý thay thế của AI
    const handleApplySuggestion = (lineIndex, originalWord, newWord) => {
        const lines = content.split('\n');
        if (lines[lineIndex]) {
            lines[lineIndex] = lines[lineIndex].replace(originalWord, newWord);
            const newContent = lines.join('\n');
            setContent(newContent);
            runRuleCheck(newContent);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-vietnam">
            <div className="max-w-7xl mx-auto space-y-7">
                
                {/* Header Tiêu Đề */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/15 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-300 shadow-xs mb-2">
                            <Feather className="w-3.5 h-3.5 text-amber-800" />
                            <span>Văn Uyên Thi Xã — Trụ Cột Số 4</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heritage tracking-tight flex items-center gap-2.5">
                            <span>AI Poetry Studio — Sáng Tác & Thẩm Định Thơ Lục Bát</span>
                            <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                            Không gian trau chuốt vần điệu dân tộc: Soát luật Bằng – Trắc chuẩn mực, kiểm tra vần lưng vần chân và nhận điểm số phân tích từ AI Critic.
                        </p>
                    </div>

                    {/* Bộ Tab điều hướng */}
                    <div className="flex items-center gap-1.5 bg-[#fffdf9] p-1.5 rounded-2xl border border-amber-900/15 shadow-xs self-start md:self-auto">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'editor'
                                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/70'
                            }`}
                        >
                            <Feather className="w-3.5 h-3.5" />
                            <span>Studio Soạn Thảo</span>
                        </button>
                        {isAuthenticated && (
                            <button
                                onClick={() => setActiveTab('my-poems')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeTab === 'my-poems'
                                        ? 'bg-amber-900 text-amber-100 shadow-xs'
                                        : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/70'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Thơ Của Tôi</span>
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'community'
                                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/70'
                            }`}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Thơ Cộng Đồng</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: STUDIO SOẠN THẢO THƠ */}
                {activeTab === 'editor' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* CỘT TRÁI: KHU VỰC A - TRÌNH SOẠN THẢO THƠ (7 CỘT) */}
                        <div className="lg:col-span-7 space-y-5">
                            <div className="bg-[#fffdf9] rounded-3xl p-5 sm:p-7 border border-amber-900/15 shadow-sm space-y-4 relative">
                                <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>

                                {/* Tựa đề & Bút danh */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">
                                            Tựa đề tác phẩm:
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ví dụ: Nhớ nguồn, Đò chiều..."
                                            className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">
                                            Bút danh thi sĩ:
                                        </label>
                                        <input
                                            type="text"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            placeholder="Tên tác giả..."
                                            className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
                                        />
                                    </div>
                                </div>

                                {/* Vùng soạn thảo câu thơ */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                                            <span>Nội dung thơ Lục Bát (6 - 8):</span>
                                            {isAnalyzing && (
                                                <span className="text-[11px] text-amber-700 inline-flex items-center gap-1">
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Đang soát luật...
                                                </span>
                                            )}
                                        </label>
                                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                                            <span>Mẫu thơ:</span>
                                            {SAMPLE_POEMS.map((sp, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setTitle(sp.title);
                                                        setContent(sp.content);
                                                        runRuleCheck(sp.content);
                                                    }}
                                                    className="underline hover:text-amber-900"
                                                >
                                                    {sp.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        rows={8}
                                        value={content}
                                        onChange={handleContentChange}
                                        placeholder={`Nhập từng cặp câu Lục Bát (câu 6 trước, câu 8 sau):\nVí dụ:\nTrăm năm trong cõi người ta\nChữ tài chữ mệnh khéo là ghét nhau`}
                                        className="w-full p-4 text-base font-serif bg-[#FAF8F5] border border-amber-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 leading-relaxed text-stone-900 placeholder:text-stone-400 placeholder:font-sans"
                                    />

                                    {/* Thống kê câu tiếng */}
                                    <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                                        <div className="flex items-center gap-3">
                                            <span>Tổng số dòng: <strong>{content.split('\n').filter(Boolean).length}</strong></span>
                                            <span>Số cặp Lục Bát: <strong>{Math.floor(content.split('\n').filter(Boolean).length / 2)}</strong></span>
                                        </div>
                                        {ruleAnalysis?.summary && (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${ruleAnalysis.isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                    Điểm âm luật: {ruleAnalysis.summary.toneScore}/40
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Thanh nút thao tác */}
                                <div className="pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCoWriteModalOpen(true)}
                                            className="px-3.5 py-2 bg-amber-100/90 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-300/80 shadow-2xs"
                                        >
                                            <Bot className="w-3.5 h-3.5 text-amber-800" />
                                            <span>Đối thơ cùng AI</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNewPoem}
                                            title="Tạo bài thơ mới"
                                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isAuthenticated && (
                                            <button
                                                type="button"
                                                onClick={() => handleSavePoem('draft')}
                                                disabled={saveStatus === 'saving'}
                                                className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                                            >
                                                <Save className="w-3.5 h-3.5" />
                                                <span>{saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu nháp'}</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleRunCritique}
                                            disabled={isCritiquing || !content.trim()}
                                            className="px-5 py-2 bg-gradient-to-r from-red-800 via-red-900 to-amber-900 hover:from-red-700 hover:to-amber-800 text-amber-100 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCritiquing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                                                    <span>Đang thẩm định...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                                    <span>AI Thẩm Định Thơ</span>
                                                </>
                                            )}
                                        </button>

                                        {isAuthenticated && (
                                            <button
                                                type="button"
                                                onClick={() => handleSavePoem('published')}
                                                className="px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1"
                                                title="Công bố lên Thơ Cộng Đồng"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Công bố</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* KHU VỰC B — BẢNG PHÂN TÍCH ÂM LUẬT CHI TIẾT THEO TỪNG CÂU */}
                            {ruleAnalysis && (
                                <div className="bg-[#fffdf9] rounded-3xl p-5 sm:p-7 border border-amber-900/15 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                                        <h3 className="font-heritage font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-amber-700" />
                                            <span>Sơ Đồ Âm Luật Bằng – Trắc Từng Tiếng</span>
                                        </h3>
                                        <span className="text-[11px] text-stone-500">
                                            Quy tắc: 2(B) - 4(T) - 6(B) [câu 6] & 8(B) [câu 8]
                                        </span>
                                    </div>

                                    {/* Từng dòng thơ kèm nhãn B / T */}
                                    <div className="space-y-3">
                                        {ruleAnalysis.lines.map((line, lIdx) => (
                                            <div
                                                key={lIdx}
                                                className={`p-3.5 rounded-2xl border transition ${
                                                    line.issues.length === 0
                                                        ? 'bg-emerald-50/40 border-emerald-200/80'
                                                        : 'bg-amber-50/50 border-amber-300/80'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                                                            Dòng {lIdx + 1} ({line.lineType === 'luc' ? 'Câu 6' : 'Câu 8'})
                                                        </span>
                                                        <span className="text-xs text-stone-500">
                                                            {line.syllableCount} tiếng
                                                        </span>
                                                    </div>
                                                    {line.issues.length === 0 ? (
                                                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Chuẩn luật
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                                                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Cần chỉnh sửa
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Danh sách các tiếng thơ dưới dạng pill */}
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    {line.tonePattern.map((tp, pIdx) => {
                                                        const isCriticalPos = tp.expectedTone !== null;
                                                        return (
                                                            <div
                                                                key={pIdx}
                                                                className={`px-2.5 py-1.5 rounded-xl border text-center transition group relative cursor-pointer ${
                                                                    tp.status === 'valid'
                                                                        ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-2xs'
                                                                        : tp.status === 'invalid'
                                                                        ? 'bg-red-100 text-red-950 border-red-400 ring-2 ring-red-400/30 font-bold'
                                                                        : 'bg-white text-stone-700 border-stone-200'
                                                                }`}
                                                            >
                                                                <div className="text-xs font-serif font-medium">{tp.word}</div>
                                                                <div className="text-[10px] text-stone-400 flex items-center justify-center gap-0.5 mt-0.5">
                                                                    <span>{tp.actualTone === 'B' ? 'B' : 'T'}</span>
                                                                    {isCriticalPos && (
                                                                        <span className="text-stone-300">({tp.expectedTone})</span>
                                                                    )}
                                                                </div>

                                                                {/* Tooltip giải thích */}
                                                                {tp.issueMsg && (
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-30 leading-snug">
                                                                        {tp.issueMsg}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Danh sách lỗi của dòng này */}
                                                {line.issues.length > 0 && (
                                                    <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-xs text-amber-900 space-y-1">
                                                        {line.issues.map((iss, iIdx) => (
                                                            <div key={iIdx} className="flex items-start gap-1.5">
                                                                <span className="text-amber-700 mt-0.5">•</span>
                                                                <span>{iss.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Phân tích Vần Lưng và Vần Chân */}
                                    {ruleAnalysis.rhymes.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-amber-200/60">
                                            <h4 className="text-xs font-bold text-stone-700 mb-2">
                                                Kiểm tra Hiệp Vần (Yêu vận & Cước vận):
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {ruleAnalysis.rhymes.map((r, rIdx) => (
                                                    <div
                                                        key={rIdx}
                                                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                                            r.isRhyme
                                                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                                                : 'bg-rose-50 text-rose-900 border-rose-200'
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="font-bold">{r.name}</p>
                                                            <p className="text-[11px] opacity-80">
                                                                "{r.from.word}" (Dòng {r.from.line}) ↔ "{r.to.word}" (Dòng {r.to.line})
                                                            </p>
                                                        </div>
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80">
                                                            {r.isRhyme ? 'Chuẩn vần' : 'Chưa vần'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CỘT PHẢI: KHU VỰC C — BÁO CÁO AI CRITIC (5 CỘT) */}
                        <div className="lg:col-span-5 space-y-5">
                            {aiCriticResult ? (
                                <div className="bg-[#fffdf9] rounded-3xl p-5 sm:p-7 border border-amber-900/15 shadow-sm space-y-6 relative animate-in fade-in">
                                    <span className="absolute top-2 right-2 text-xs text-amber-600/70 font-bold select-none">❖</span>

                                    {/* Huy hiệu tổng điểm */}
                                    <div className="text-center space-y-3 pb-5 border-b border-amber-200/60">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-300">
                                            Báo Cáo Thẩm Định Thi Pháp
                                        </span>
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 mx-auto flex items-center justify-center text-red-950 font-heritage font-extrabold text-2xl shadow-lg ring-4 ring-amber-100">
                                            {aiCriticResult.scores.totalScore}
                                        </div>
                                        <p className="text-xs text-stone-500">Thang điểm toàn diện 100 điểm</p>

                                        {/* Ba trụ cột điểm số */}
                                        <div className="grid grid-cols-3 gap-2 pt-2">
                                            <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-center">
                                                <p className="text-base font-extrabold text-stone-900 font-heritage">
                                                    {aiCriticResult.scores.toneScore}/40
                                                </p>
                                                <p className="text-[10px] text-stone-600 font-medium">Âm luật</p>
                                            </div>
                                            <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-center">
                                                <p className="text-base font-extrabold text-stone-900 font-heritage">
                                                    {aiCriticResult.scores.rhythmScore}/30
                                                </p>
                                                <p className="text-[10px] text-stone-600 font-medium">Vần điệu</p>
                                            </div>
                                            <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-center">
                                                <p className="text-base font-extrabold text-stone-900 font-heritage">
                                                    {aiCriticResult.scores.poeticScore}/30
                                                </p>
                                                <p className="text-[10px] text-stone-600 font-medium">Hồn thơ</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nhận xét tổng quan */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                            <Feather className="w-3.5 h-3.5 text-amber-800" />
                                            <span>Lời Bình Từ AI Critic:</span>
                                        </h4>
                                        <p className="text-xs sm:text-sm text-stone-700 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/70 leading-relaxed font-serif italic">
                                            &quot;{aiCriticResult.aiCritic.overallComment}&quot;
                                        </p>
                                    </div>

                                    {/* Ưu điểm nổi bật */}
                                    {aiCriticResult.aiCritic.strengths?.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Ưu điểm nổi bật:</span>
                                            </h4>
                                            <ul className="text-xs text-stone-700 space-y-1 ml-4 list-disc">
                                                {aiCriticResult.aiCritic.strengths.map((str, sIdx) => (
                                                    <li key={sIdx}>{str}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Gợi ý thay từ & cải biên (Interactive Suggestion Pills) */}
                                    {aiCriticResult.aiCritic.improvements?.length > 0 && (
                                        <div className="space-y-3 pt-2 border-t border-amber-200/60">
                                            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                                <span>Gợi ý thay từ để chuẩn luật & mượt mà:</span>
                                            </h4>

                                            <div className="space-y-2.5">
                                                {aiCriticResult.aiCritic.improvements.map((imp, iIdx) => (
                                                    <div key={iIdx} className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-stone-700">
                                                                Dòng {imp.lineIndex + 1}, tiếng {imp.syllablePosition}: &quot;{imp.originalWord}&quot;
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-stone-500">{imp.issueDescription}</p>

                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            <span className="text-[10px] text-stone-400 font-medium">Đề xuất:</span>
                                                            {imp.suggestions?.map((sug, sIdx) => (
                                                                <button
                                                                    key={sIdx}
                                                                    type="button"
                                                                    onClick={() => handleApplySuggestion(imp.lineIndex, imp.originalWord, sug.word)}
                                                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-2xs"
                                                                    title={sug.reason}
                                                                >
                                                                    <span>{sug.word}</span>
                                                                    {sug.isToneValid && (
                                                                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">
                                                                            Đúng luật
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bản thơ gợi ý cải biên */}
                                    {aiCriticResult.aiCritic.refinedVersion && (
                                        <div className="space-y-2 pt-2 border-t border-amber-200/60">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-stone-900">
                                                    Bản thơ trau chuốt (AI Preview):
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setContent(aiCriticResult.aiCritic.refinedVersion);
                                                        runRuleCheck(aiCriticResult.aiCritic.refinedVersion);
                                                    }}
                                                    className="text-xs text-amber-900 font-bold hover:underline"
                                                >
                                                    Áp dụng bản này
                                                </button>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-stone-200 font-serif text-xs text-stone-800 whitespace-pre-line leading-relaxed italic">
                                                {aiCriticResult.aiCritic.refinedVersion}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#fffdf9] rounded-3xl p-8 border border-amber-900/15 shadow-sm text-center space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-heritage font-bold text-stone-900 text-base">
                                            Chưa Có Báo Cáo Thẩm Định
                                        </h3>
                                        <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                                            Hãy gõ câu thơ Lục Bát bên trái và bấm nút <strong>AI Thẩm Định Thơ</strong> để nhận thang điểm 100, phân tích vần điệu và gợi ý sửa từ tinh tế.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: THƠ CỦA TÔI */}
                {activeTab === 'my-poems' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold font-heritage text-stone-900">
                                Tuyển tập tác phẩm của bạn ({myPoems.length})
                            </h2>
                            <button
                                onClick={handleNewPoem}
                                className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Feather className="w-3.5 h-3.5" />
                                <span>Sáng tác bài mới</span>
                            </button>
                        </div>

                        {loadingPoems ? (
                            <div className="text-center py-16">
                                <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto" />
                            </div>
                        ) : myPoems.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-amber-900/15 shadow-sm space-y-3">
                                <p className="text-stone-500 text-sm">Bạn chưa lưu bài thơ nào. Hãy quay lại Studio để sáng tác nhé!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myPoems.map((p) => (
                                    <div key={p._id} className="bg-white p-5 rounded-2xl border border-amber-900/15 shadow-sm space-y-3 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                                                }`}>
                                                    {p.status === 'published' ? 'Đã công bố' : 'Bản nháp'}
                                                </span>
                                                {p.scores?.totalScore > 0 && (
                                                    <span className="text-xs font-bold text-amber-800">
                                                        {p.scores.totalScore} / 100 điểm
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold font-heritage text-base text-stone-900">{p.title}</h3>
                                            <p className="text-xs text-stone-600 font-serif line-clamp-3 whitespace-pre-line mt-2">
                                                {p.content}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                                            <span className="text-[11px] text-stone-400">
                                                {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleLoadPoem(p)}
                                                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-lg font-bold"
                                                >
                                                    Mở sửa
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Bạn có chắc muốn xóa bài thơ này?')) {
                                                            await poetryService.deletePoem(p._id);
                                                            fetchMyPoems();
                                                        }
                                                    }}
                                                    className="p-1 text-stone-400 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: THƠ CỘNG ĐỒNG */}
                {activeTab === 'community' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold font-heritage text-stone-900">
                                Góc Đàm Đạo Thi Xã — Các Tác Phẩm Đã Công Bố
                            </h2>
                        </div>

                        {communityPoems.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-amber-900/15 shadow-sm">
                                <p className="text-stone-500 text-sm">Chưa có bài thơ công bố nào. Hãy là người đầu tiên công bố tác phẩm!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {communityPoems.map((p) => (
                                    <div key={p._id} className="bg-white p-6 rounded-3xl border border-amber-900/15 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold font-heritage text-base text-stone-900">{p.title}</h3>
                                                <p className="text-xs text-stone-500">Tác giả: {p.authorName || p.userId?.name}</p>
                                            </div>
                                            {p.scores?.totalScore > 0 && (
                                                <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                                    {p.scores.totalScore} đ
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3 bg-[#FAF8F5] rounded-xl font-serif text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed italic">
                                            {p.content}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100">
                                            <span>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                                            <button
                                                onClick={() => handleLoadPoem(p)}
                                                className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <span>Xem & Phân tích</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL: ĐỐI THƠ CÙNG AI */}
            {coWriteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-amber-900/20">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="font-heritage font-bold text-lg text-stone-900 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-amber-800" />
                                <span>Ứng Khẩu Đối Thơ Cùng AI</span>
                            </h3>
                            <button
                                onClick={() => setCoWriteModalOpen(false)}
                                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Nhập câu Lục của bạn (đúng 6 tiếng):
                                </label>
                                <input
                                    type="text"
                                    value={inputLucLine}
                                    onChange={(e) => setInputLucLine(e.target.value)}
                                    placeholder="Ví dụ: Công cha như núi Thái Sơn..."
                                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 font-serif"
                                />
                                <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
                                    <span>Số tiếng hiện tại: <strong>{inputLucLine.trim().split(/\s+/).filter(Boolean).length} / 6</strong></span>
                                </div>
                            </div>

                            {coWriteError && (
                                <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                                    {coWriteError}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleCoWrite}
                                disabled={isCoWriting || inputLucLine.trim().split(/\s+/).filter(Boolean).length !== 6}
                                className="w-full py-2.5 bg-gradient-to-r from-red-800 to-amber-900 hover:from-red-700 hover:to-amber-800 text-amber-100 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isCoWriting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                                        <span>AI đang tức cảnh sinh tình...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>AI Ứng Khẩu Câu Bát</span>
                                    </>
                                )}
                            </button>

                            {/* Danh sách các câu Bát được sinh ra */}
                            {coWriteCandidates.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-stone-100">
                                    <p className="text-xs font-bold text-stone-700">Các phương án câu Bát đã qua kiểm tra âm luật:</p>
                                    <div className="space-y-2">
                                        {coWriteCandidates.map((cand, cIdx) => (
                                            <div
                                                key={cIdx}
                                                className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between gap-3"
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-xs sm:text-sm font-serif font-bold text-stone-900">
                                                        {cand.batLine}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                                        <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-semibold">
                                                            {cand.mood || 'Dân dã'}
                                                        </span>
                                                        <span>{cand.isRhymeValid ? '✓ Hiệp vần chuẩn' : 'Chưa vần'}</span>
                                                        <span>• Điểm âm luật: {cand.toneScore}/40</span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertCouplet(cand.batLine)}
                                                    className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition flex-shrink-0"
                                                >
                                                    Chọn câu này
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoetryStudio;
