import { useState, useEffect, useRef } from 'react';
import {
    Bot,
    X,
    Minus,
    Send,
    Sparkles,
    BookOpen,
    ExternalLink,
    RotateCcw,
    CheckCircle2,
    MessageSquare,
    ChevronRight,
    HelpCircle,
    Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import aiService from '../../services/ai.service';
import GuestQuotaModal from '../common/GuestQuotaModal';

/**
 * Helper định dạng nội dung Markdown đơn giản (tiêu đề, in đậm, danh sách)
 */
function renderFormattedContent(text) {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
        // Tiêu đề ###
        if (line.startsWith('### ')) {
            return (
                <h4 key={idx} className="font-bold text-amber-300 text-sm mt-3 mb-1 font-heritage">
                    {line.replace('### ', '')}
                </h4>
            );
        }
        // Gạch đầu dòng
        if (line.trim().startsWith('- ')) {
            const content = line.trim().replace('- ', '');
            return (
                <li key={idx} className="ml-4 list-disc text-slate-200 text-xs sm:text-sm leading-relaxed my-0.5">
                    {renderInlineFormatting(content)}
                </li>
            );
        }
        // Trích dẫn >
        if (line.trim().startsWith('> ')) {
            return (
                <blockquote key={idx} className="border-l-2 border-amber-500/60 pl-3 italic text-amber-200/90 text-xs my-2">
                    {renderInlineFormatting(line.replace('> ', ''))}
                </blockquote>
            );
        }
        // Dòng ngăn cách ---
        if (line.trim() === '---') {
            return <hr key={idx} className="border-slate-700/60 my-2" />;
        }
        // Dòng trống
        if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
        }
        // Dòng văn bản bình thường
        return (
            <p key={idx} className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {renderInlineFormatting(line)}
            </p>
        );
    });
}

/**
 * Xử lý in đậm **text** và *nghiêng*
 */
function renderInlineFormatting(str) {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="text-amber-200/90">{part.slice(1, -1)}</em>;
        }
        return part;
    });
}

const HeritageChatModal = ({ isOpen, onClose, initialWork = null, initialQuestion = null, onSelectWork = null }) => {
    const { isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Xin chào bạn! Tôi là **VietHeritage AI** — Trợ lý nghiên cứu Di sản Văn học & Văn hóa Dân gian Việt Nam. 
Tôi có thể giúp bạn giải nghĩa các câu ca dao, phân tích biểu tượng nhân vật trong truyện cổ tích, hoặc tìm kiếm tác phẩm theo ý nghĩa nhân văn có dẫn nguồn kiểm chứng.
Bạn muốn tìm hiểu tác phẩm hoặc câu chuyện nào hôm nay?`,
            citations: [],
            suggestedQuestions: [
                'Ý nghĩa tiếng đàn thần Thạch Sanh là gì?',
                'Tại sao Thánh Gióng bay về trời sau khi đánh giặc?',
                'Những câu ca dao về chữ Hiếu và ơn cha mẹ?',
            ],
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextWork, setContextWork] = useState(initialWork);
    const [suggestions, setSuggestions] = useState([]);
    const [guestQuota, setGuestQuota] = useState({ remaining: null, limit: 5 });
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const messagesEndRef = useRef(null);

    // Tải thông tin quota của Guest nếu chưa đăng nhập
    useEffect(() => {
        if (isOpen && !isAuthenticated) {
            aiService.getQuota()
                .then((res) => {
                    if (res && res.remaining !== undefined) {
                        setGuestQuota({ remaining: res.remaining, limit: res.limit || 5 });
                    }
                })
                .catch(() => {});
        }
    }, [isOpen, isAuthenticated]);

    // Tải gợi ý câu hỏi ban đầu
    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                const data = await aiService.getSuggestions();
                setSuggestions(data);
            } catch (err) {
                console.warn('Lỗi tải gợi ý câu hỏi:', err.message);
            }
        };
        loadSuggestions();
    }, []);

    // Cập nhật khi có initialWork truyền từ ngoài vào (VD: bấm "Hỏi AI" từ modal chi tiết)
    useEffect(() => {
        if (initialWork) {
            setContextWork(initialWork);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Tôi đã nạp ngữ cảnh tư liệu tác phẩm **"${initialWork.title}"** (${initialWork.categoryName || 'Di sản văn học'}). Bạn muốn phân tích bối cảnh lịch sử, ý nghĩa nhân văn hay biểu tượng nghệ thuật nào của tác phẩm này?`,
                    citations: [
                        {
                            title: initialWork.title,
                            slug: initialWork.slug,
                            category: initialWork.category,
                            source: initialWork.source,
                        },
                    ],
                    suggestedQuestions: [
                        `Ý nghĩa biểu tượng chủ đạo trong ${initialWork.title}?`,
                        `Bối cảnh lịch sử và hoàn cảnh ra đời của ${initialWork.title}?`,
                        `Bài học nhân sinh mà ${initialWork.title} để lại?`,
                    ],
                },
            ]);
        }
    }, [initialWork]);

    // Tự động gửi câu hỏi nếu có initialQuestion truyền từ Smart Text Selection
    useEffect(() => {
        if (isOpen && initialQuestion && typeof initialQuestion === 'string') {
            const timer = setTimeout(() => {
                handleSend(initialQuestion, initialWork);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialQuestion, initialWork]);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    if (!isOpen) return null;

    const handleSend = async (questionToSend, workOverride = null) => {
        const q = questionToSend || input;
        if (!q.trim() || loading) return;

        // Nếu là Guest và đã hết lượt, mở ngay modal nhắc nhở đăng ký
        if (!isAuthenticated && guestQuota.remaining === 0) {
            setShowQuotaModal(true);
            return;
        }

        const userMsg = { role: 'user', content: q.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Lấy 4 tin nhắn gần nhất làm lịch sử
            const history = messages.slice(-4).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const targetWork = workOverride || contextWork || initialWork;
            const res = await aiService.ask({
                question: q.trim(),
                contextSlug: targetWork?.slug || null,
                history,
            });

            if (res.quota && res.quota.remaining !== undefined) {
                setGuestQuota({ remaining: res.quota.remaining, limit: res.quota.limit || 5 });
            }

            const botMsg = {
                role: 'assistant',
                content: res.answer,
                citations: res.citations || [],
                suggestedQuestions: res.suggestedQuestions || [],
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            if (err.code === 'GUEST_QUOTA_EXCEEDED' || err.status === 429) {
                setGuestQuota({ remaining: 0, limit: 5 });
                setShowQuotaModal(true);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `⚠️ **Hạn mức hôm nay đã hết:** Bạn đã sử dụng hết 5 lượt trải nghiệm AI miễn phí hôm nay. Vui lòng **Đăng ký** hoặc **Đăng nhập** tài khoản miễn phí để tiếp tục trò chuyện và tra cứu không giới hạn!`,
                        citations: [],
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `Rất tiếc, đã có sự cố khi kết nối tới Trợ lý AI: ${err.message || 'Vui lòng thử lại sau.'}`,
                        citations: [],
                    },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetChat = () => {
        setContextWork(null);
        setMessages([
            {
                role: 'assistant',
                content: `Cuộc hội thoại đã được đặt lại mới. Tôi là **VietHeritage AI**, sẵn sàng giải đáp mọi thắc mắc về văn học và di sản Việt Nam!`,
                citations: [],
                suggestedQuestions: [
                    'Ý nghĩa tiếng đàn thần Thạch Sanh là gì?',
                    'Tại sao Thánh Gióng bay về trời sau khi đánh giặc?',
                    'Những câu ca dao về chữ Hiếu và ơn cha mẹ?',
                ],
            },
        ]);
    };

    return (
        <>
            <div
                className="fixed bottom-22 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] h-[580px] max-h-[calc(100vh-105px)] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl shadow-2xl shadow-indigo-950/60 flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 zoom-in-95 duration-200"
                role="dialog"
                aria-label="VietHeritage AI Assistant"
            >
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-700/80 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                            <Bot className="w-4.5 h-4.5 text-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-1.5">
                                <h3 className="font-extrabold text-white text-sm tracking-tight font-heritage">
                                    VietHeritage AI
                                </h3>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Kiểm chứng</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                    {contextWork ? (
                                        <span>Tác phẩm: <strong className="text-amber-300">{contextWork.title}</strong></span>
                                    ) : (
                                        <span>Trợ lý RAG Dân gian</span>
                                    )}
                                </p>
                                {isAuthenticated ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                                        <Sparkles className="w-2 h-2 text-emerald-400" />
                                        <span>Không giới hạn</span>
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setShowQuotaModal(true)}
                                        className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/30 px-1.5 py-0.2 rounded-full border border-amber-500/30 transition cursor-pointer"
                                        title="Bấm để xem thông tin hạn mức"
                                    >
                                        <Lock className="w-2 h-2 text-amber-400" />
                                        <span>Còn {guestQuota.remaining !== null ? `${guestQuota.remaining}/5` : '...'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                <div className="flex items-center space-x-0.5">
                    <button
                        onClick={handleResetChat}
                        title="Xóa đoạn chat & Bắt đầu lại"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onClose}
                        title="Thu nhỏ cửa sổ chat"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        title="Đóng cửa sổ chat"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Subheader: Context badge if any */}
            {contextWork && (
                <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">Ngữ cảnh: <strong>{contextWork.title}</strong> ({contextWork.source})</span>
                    </div>
                    <button
                        onClick={() => setContextWork(null)}
                        className="text-[10px] underline hover:text-white ml-2 flex-shrink-0"
                    >
                        Bỏ chọn ngữ cảnh
                    </button>
                </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${msg.role === 'user'
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'bg-indigo-600 text-white'
                                }`}
                        >
                            {msg.role === 'user' ? 'Bạn' : <Bot className="w-4 h-4" />}
                        </div>

                        {/* Message Bubble */}
                        <div
                            className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-amber-600 text-white rounded-tr-none'
                                    : 'bg-slate-800/90 border border-slate-700/80 rounded-tl-none space-y-3'
                                }`}
                        >
                            <div className="space-y-1">
                                {renderFormattedContent(msg.content)}
                            </div>

                            {/* Citations (Dẫn nguồn kiểm chứng) */}
                            {msg.citations && msg.citations.length > 0 && (
                                <div className="pt-2 border-t border-slate-700/80 space-y-1.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        <span>Nguồn tư liệu đối chiếu:</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {msg.citations.map((cite, cIdx) => (
                                            <button
                                                key={cIdx}
                                                onClick={() => onSelectWork && onSelectWork(cite)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-700 hover:border-amber-500/50 hover:text-amber-300 transition text-left"
                                            >
                                                <span className="font-medium text-white">{cite.title}</span>
                                                <span className="text-slate-400 text-[10px]">({cite.source || 'Học thuật'})</span>
                                                <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Follow-up Questions */}
                            {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && idx === messages.length - 1 && (
                                <div className="pt-2 border-t border-slate-700/80 space-y-1.5">
                                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        <span>Gợi ý câu hỏi tiếp theo:</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {msg.suggestedQuestions.map((sug, sIdx) => (
                                            <button
                                                key={sIdx}
                                                onClick={() => handleSend(sug)}
                                                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/50 text-indigo-200 hover:bg-indigo-900/80 hover:text-white transition flex items-center gap-1"
                                            >
                                                <span>{sug}</span>
                                                <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="text-[11px] text-slate-400 ml-1">Đang tra cứu tư liệu & tổng hợp câu trả lời...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick discovery chips */}
            {suggestions.length > 0 && messages.length <= 2 && (
                <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar flex-shrink-0">
                    <span className="text-slate-400 text-[10px] font-semibold flex items-center gap-1 flex-shrink-0">
                        <HelpCircle className="w-3 h-3 text-amber-400" />
                        Gợi ý:
                    </span>
                    {suggestions.slice(0, 4).map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleSend(s.question)}
                            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 text-[11px] transition flex-shrink-0"
                        >
                            {s.question}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
                className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2 flex-shrink-0"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={contextWork ? `Hỏi AI về tác phẩm ${contextWork.title}...` : "Hỏi về ý nghĩa ca dao, truyện cổ tích, bối cảnh lịch sử..."}
                    disabled={loading}
                    className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl disabled:opacity-40 disabled:pointer-events-none transition shadow-md shadow-amber-500/20"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>

        {/* Modal thông báo hết quota trải nghiệm cho Guest */}
        <GuestQuotaModal
            isOpen={showQuotaModal}
            onClose={() => setShowQuotaModal(false)}
            title="Đã Hết Lượt Trải Nghiệm AI"
            message="Bạn đã dùng hết 5 lượt trải nghiệm AI miễn phí hôm nay. Hãy đăng ký hoặc đăng nhập tài khoản để tiếp tục trò chuyện và tra cứu không giới hạn!"
        />
        </>
    );
};

export default HeritageChatModal;
