import { useState, useEffect, useRef } from 'react';
import { 
    GraduationCap, 
    Sparkles, 
    BookOpen, 
    Heart, 
    Home as HomeIcon, 
    ShieldCheck, 
    Users, 
    RotateCcw, 
    Send, 
    ExternalLink, 
    MessageSquare, 
    HelpCircle, 
    Lightbulb, 
    Quote, 
    ArrowRight,
    Loader2,
    Compass,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { aiService } from '../services/ai.service';
import WorkDetailModal from '../components/common/WorkDetailModal';

/**
 * Xử lý in đậm **text** và *nghiêng*
 */
function renderInlineFormatting(str) {
    if (!str) return null;
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-amber-950 font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="text-stone-700 italic">{part.slice(1, -1)}</em>;
        }
        return part;
    });
}

/**
 * Render nội dung câu trả lời của Gia sư theo từng khối sư phạm
 */
function renderTutorMessage(content) {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, idx) => {
        const trimmed = line.trim();

        // Tiêu đề khối ###
        if (trimmed.startsWith('### ')) {
            const title = trimmed.replace('### ', '');
            return (
                <div key={idx} className="mt-4 mb-2 pt-2 border-t border-amber-200/60 first:border-0 first:pt-0">
                    <h4 className="font-heritage font-bold text-base text-amber-900 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-amber-600 rounded-full inline-block" />
                        {title}
                    </h4>
                </div>
            );
        }

        // Trích dẫn ca dao/tục ngữ >
        if (trimmed.startsWith('> ')) {
            const quoteText = trimmed.replace('> ', '');
            return (
                <div key={idx} className="my-3 p-3.5 bg-amber-50/90 rounded-xl border-l-4 border-amber-500 shadow-sm">
                    <p className="font-heritage italic text-amber-950 text-sm sm:text-base leading-relaxed">
                        {renderInlineFormatting(quoteText)}
                    </p>
                </div>
            );
        }

        // Gạch đầu dòng -
        if (trimmed.startsWith('- ')) {
            const itemText = trimmed.replace('- ', '');
            return (
                <div key={idx} className="flex items-start gap-2 my-1.5 text-xs sm:text-sm text-stone-800 leading-relaxed ml-2">
                    <span className="text-amber-600 text-sm mt-0.5">•</span>
                    <span>{renderInlineFormatting(itemText)}</span>
                </div>
            );
        }

        // Dòng phân cách ---
        if (trimmed === '---') {
            return <hr key={idx} className="border-amber-200/50 my-3" />;
        }

        // Dòng trống
        if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
        }

        // Đoạn văn thông thường
        return (
            <p key={idx} className="text-xs sm:text-sm text-stone-800 leading-relaxed my-1">
                {renderInlineFormatting(line)}
            </p>
        );
    });
}

const TOPIC_ICONS = {
    'Heart': Heart,
    'Home': HomeIcon,
    'ShieldCheck': ShieldCheck,
    'GraduationCap': GraduationCap,
    'Users': Users,
};

const AiTutor = () => {
    // State cho chủ đề học tập
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topicsLoading, setTopicsLoading] = useState(true);

    // State cho lịch sử hội thoại
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Xin chào bạn! Tôi là **Gia sư văn hóa AI** của nền tảng VietHeritage AI. 🌸

Tôi sẽ đồng hành cùng bạn học tập, hiểu sâu sắc về vẻ đẹp ngôn từ, triết lý nhân sinh và bài học thực tiễn của kho tàng **Ca dao & Tục ngữ Việt Nam**.

Hãy chọn một chủ đề học tập bên trái hoặc hỏi tôi về bất kỳ câu ca dao, tục ngữ nào bạn muốn tìm hiểu nhé!`,
            citations: [],
            relatedWorks: [],
            suggestedQuestions: [
                'Ý nghĩa câu tục ngữ "Uống nước nhớ nguồn" là gì?',
                'Hình tượng "núi Thái Sơn" và "nước trong nguồn" thể hiện đạo hiếu ra sao?',
                'Tại sao tục ngữ nói "Có công mài sắt, có ngày nên kim"?'
            ],
            isCultural: true,
        },
    ]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal chi tiết tác phẩm (tái sử dụng WorkDetailModal)
    const [modalWork, setModalWork] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const chatContainerRef = useRef(null);
    const isFirstRender = useRef(true);
    const inputRef = useRef(null);

    // Tự động cuộn xuống cuối khung chat khi có tin nhắn mới (chỉ cuộn cục bộ trong container, bỏ qua lần load trang đầu tiên)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, loading]);

    // Tải danh sách chủ đề học tập từ backend
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setTopicsLoading(true);
                const data = await aiService.getTutorTopics();
                setTopics(data || []);
                if (data && data.length > 0) {
                    setSelectedTopic(data[0]);
                }
            } catch (err) {
                console.error('Lỗi tải chủ đề Gia sư AI:', err);
            } finally {
                setTopicsLoading(false);
            }
        };
        fetchTopics();
    }, []);

    // Gửi tin nhắn tới Gia sư AI
    const handleSend = async (customText = null, selectedWorkSlug = null) => {
        const queryText = (customText || input).trim();
        if (!queryText || loading) return;

        setError(null);
        setInput('');

        // Thêm tin nhắn của người dùng vào giao diện
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: queryText,
        };

        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // Lấy ngữ cảnh hội thoại gần nhất (loại bỏ tin chào mừng mẫu)
            const chatHistory = messages
                .filter((m) => m.id !== 'welcome')
                .slice(-6)
                .map((m) => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content,
                }));

            const response = await aiService.chatWithTutor({
                message: queryText,
                topic: selectedTopic?.id || null,
                history: chatHistory,
                selectedWorkSlug,
            });

            const tutorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.reply,
                citations: response.citations || [],
                relatedWorks: response.relatedWorks || [],
                suggestedQuestions: response.suggestedQuestions || [],
                isCultural: response.isCultural !== false,
            };

            setMessages((prev) => [...prev, tutorMsg]);
        } catch (err) {
            console.error('Lỗi khi trò chuyện với Gia sư AI:', err);
            setError('Không thể kết nối đến Gia sư AI lúc này. Vui lòng thử lại sau.');
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'Xin lỗi bạn, kết nối tới hệ thống tri thức đang bị gián đoạn. Vui lòng bấm thử lại hoặc chọn một câu hỏi gợi ý khác.',
                    citations: [],
                    relatedWorks: [],
                    suggestedQuestions: selectedTopic?.sampleQuestions || [],
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    // Chọn chủ đề học tập
    const handleSelectTopic = (topic) => {
        setSelectedTopic(topic);
        const topicWelcome = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Bạn vừa chuyển sang chủ đề học tập: **"${topic.name}"** 📖

${topic.description}

Dưới đây là một số câu hỏi gợi ý để chúng ta bắt đầu bài học này:`,
            citations: [],
            relatedWorks: [],
            suggestedQuestions: topic.sampleQuestions || [],
            isCultural: true,
        };
        setMessages((prev) => [...prev, topicWelcome]);
    };

    // Làm mới / Bắt đầu phiên học mới
    const handleResetConversation = () => {
        setMessages([
            {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: `Đã bắt đầu một phiên học tập mới cùng **Gia sư văn hóa AI**! 

Chủ đề hiện tại: **${selectedTopic?.name || 'Văn hóa Ca dao & Tục ngữ'}**. 
Bạn muốn đặt câu hỏi hoặc phân tích câu ca dao nào?`,
                citations: [],
                relatedWorks: [],
                suggestedQuestions: selectedTopic?.sampleQuestions || [
                    'Ý nghĩa câu "Ăn quả nhớ kẻ trồng cây" là gì?',
                    'Hình tượng "núi Thái Sơn" và "nước trong nguồn" có ý nghĩa gì?',
                    'Bài học ý chí từ câu "Có công mài sắt, có ngày nên kim"?'
                ],
                isCultural: true,
            },
        ]);
        setError(null);
    };

    // Mở modal xem chi tiết tác phẩm
    const handleOpenWorkDetail = (work) => {
        setModalWork(work);
        setModalOpen(true);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF6ED] py-6 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col font-vietnam">
            {/* Header giới thiệu tính năng */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/10 pb-5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold mb-2">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                        <span>Không gian học tập tương tác</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heritage tracking-tight flex items-center gap-2.5">
                        <span>Gia sư văn hóa AI</span>
                        <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                        Đồng hành giải nghĩa ca dao, tục ngữ Việt Nam theo 4 chiều kích: 
                        <strong className="text-amber-900 font-medium"> Nghĩa đen & nghĩa bóng</strong>, 
                        <strong className="text-amber-900 font-medium"> Bài học đạo lý</strong>, 
                        <strong className="text-amber-900 font-medium"> Vận dụng thực tiễn</strong> và 
                        <strong className="text-amber-900 font-medium"> Nguồn học thuật kiểm chứng</strong>.
                    </p>
                </div>

                {/* Các nút điều khiển phiên học */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={handleResetConversation}
                        title="Bắt đầu lại cuộc trò chuyện mới"
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300/80 rounded-xl shadow-sm transition hover:shadow active:scale-95"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                        <span>Phiên học mới</span>
                    </button>
                </div>
            </div>

            {/* Layout 2 cột: Cột trái (Chủ đề & Gợi ý) - Cột phải (Hộp thoại tương tác) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
                {/* CỘT TRÁI: DANH SÁCH CHỦ ĐỀ HỌC TẬP (4 CỘT TRÊN DESKTOP) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-heritage font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-amber-700" />
                                <span>Chủ đề học tập trọng tâm</span>
                            </h2>
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                5 Chủ đề
                            </span>
                        </div>
                        <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                            Chọn chủ đề bạn quan tâm để gia sư định hướng bài giảng và gợi ý câu hỏi phù hợp:
                        </p>

                        {topicsLoading ? (
                            <div className="space-y-2 py-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topics.map((t) => {
                                    const IconComp = TOPIC_ICONS[t.icon] || BookOpen;
                                    const isSelected = selectedTopic?.id === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => handleSelectTopic(t)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                                                isSelected
                                                    ? 'bg-amber-900 text-white border-amber-900 shadow-md scale-[1.01]'
                                                    : 'bg-white hover:bg-amber-50/70 border-stone-200/80 text-stone-800 hover:border-amber-300'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                                                isSelected ? 'bg-amber-800 text-amber-200' : 'bg-amber-100/70 text-amber-800'
                                            }`}>
                                                <IconComp className="w-4 h-4" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className={`text-xs sm:text-sm font-bold font-heritage truncate ${
                                                    isSelected ? 'text-white' : 'text-stone-900'
                                                }`}>
                                                    {t.name}
                                                </p>
                                                <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                                                    isSelected ? 'text-amber-200' : 'text-stone-500'
                                                }`}>
                                                    {t.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Khối giới thiệu phương pháp sư phạm */}
                    <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/70 rounded-2xl border border-amber-200/70 p-4 text-xs text-stone-700 shadow-sm hidden lg:block">
                        <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>Nguyên tắc đối thoại của Gia sư AI</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-stone-600 leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-700 font-bold">✓</span>
                                <span>Phân tích đầy đủ <strong>nghĩa đen, nghĩa bóng</strong> và <strong>bài học giáo dục</strong>.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-700 font-bold">✓</span>
                                <span>Gợi ý <strong>vận dụng thực tiễn</strong> vào học tập, giao tiếp và gia đình hiện đại.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-700 font-bold">✓</span>
                                <span>Chỉ dẫn <strong>nguồn kiểm chứng có thật</strong> từ sách nghiên cứu và từ điển.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-700 font-bold">✓</span>
                                <span>Không bịa đặt trích dẫn hay xuyên tạc di sản văn hóa dân gian.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* CỘT PHẢI: KHUNG HỘI THOẠI & HỌC TẬP TƯƠNG TÁC (8 CỘT) */}
                <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden min-h-[580px] h-[72vh]">
                    {/* Thanh thông tin chủ đề đang học */}
                    <div className="px-4 py-3 bg-stone-50/90 border-b border-stone-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                                <span className="text-[11px] text-stone-500 block leading-none">Chủ đề đang học</span>
                                <span className="text-xs sm:text-sm font-bold text-stone-900 font-heritage truncate">
                                    {selectedTopic?.name || 'Văn hóa Ca dao & Tục ngữ Việt Nam'}
                                </span>
                            </div>
                        </div>

                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Sẵn sàng giảng dạy</span>
                        </span>
                    </div>

                    {/* Vùng hiển thị tin nhắn (Scrollable) */}
                    <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF8F5]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-amber-900 text-white rounded-br-none'
                                            : msg.isError
                                            ? 'bg-red-50 border border-red-200 text-red-950 rounded-bl-none'
                                            : 'bg-white border border-stone-200/80 text-stone-900 rounded-bl-none'
                                    }`}
                                >
                                    {/* Header tin nhắn */}
                                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-black/5">
                                        {msg.role === 'user' ? (
                                            <>
                                                <span className="text-xs font-semibold text-amber-200">Bạn</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                                                    <GraduationCap className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-bold text-amber-900 font-heritage">
                                                    Gia sư văn hóa AI
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Nội dung tin nhắn */}
                                    {msg.role === 'user' ? (
                                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-amber-50">
                                            {msg.content}
                                        </p>
                                    ) : (
                                        <div className="tutor-response-body">
                                            {renderTutorMessage(msg.content)}
                                        </div>
                                    )}

                                    {/* Tác phẩm liên quan từ Database (nếu có) */}
                                    {msg.relatedWorks && msg.relatedWorks.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-amber-200/50">
                                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                                                <span>Ca dao & Tục ngữ liên quan từ kho dữ liệu:</span>
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {msg.relatedWorks.map((work) => (
                                                    <div
                                                        key={work._id || work.slug}
                                                        className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/60 transition group flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[10px] font-bold text-amber-800 bg-white/80 px-1.5 py-0.5 rounded border border-amber-200/50">
                                                                    {work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ' : 'Ca dao')}
                                                                </span>
                                                                {work.topic && (
                                                                    <span className="text-[10px] text-stone-500 truncate">
                                                                        {work.topic}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-bold text-stone-900 font-heritage line-clamp-1 group-hover:text-amber-900">
                                                                "{work.title}"
                                                            </p>
                                                        </div>

                                                        <div className="mt-2 pt-2 border-t border-amber-200/40 flex items-center justify-between text-[11px]">
                                                            <button
                                                                onClick={() => handleSend(`Hãy giải thích sâu sắc câu: "${work.title}"`, work.slug)}
                                                                className="text-amber-800 font-semibold hover:underline flex items-center gap-0.5"
                                                            >
                                                                <span>Hỏi câu này</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenWorkDetail(work)}
                                                                className="text-stone-500 hover:text-stone-800 flex items-center gap-0.5"
                                                            >
                                                                <span>Chi tiết</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nguồn trích dẫn học thuật kiểm chứng */}
                                    {msg.citations && msg.citations.length > 0 && (
                                        <div className="mt-3 pt-2 text-[11px] text-stone-500 border-t border-stone-200/50">
                                            <p className="font-semibold text-stone-700 flex items-center gap-1 mb-1">
                                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                                <span>Nguồn tư liệu đối chiếu:</span>
                                            </p>
                                            <ul className="list-disc ml-4 space-y-0.5 text-[10px] text-stone-600 italic">
                                                {msg.citations.map((c, i) => (
                                                    <li key={i}>
                                                        <strong>{c.title}</strong>: {c.source || 'Kho tàng Dân gian Việt Nam.'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Câu hỏi gợi ý tiếp nối (Follow-up questions) */}
                                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-stone-200/50">
                                            <p className="text-[11px] font-bold text-stone-500 mb-2 flex items-center gap-1">
                                                <HelpCircle className="w-3 h-3 text-amber-600" />
                                                <span>Câu hỏi mở rộng tiếp theo:</span>
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {msg.suggestedQuestions.map((q, qIdx) => (
                                                    <button
                                                        key={qIdx}
                                                        onClick={() => handleSend(q)}
                                                        disabled={loading}
                                                        className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 transition active:scale-95 disabled:opacity-50"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator khi Gia sư đang suy nghĩ & soạn thảo */}
                        {loading && (
                            <div className="flex flex-col items-start">
                                <div className="max-w-[85%] rounded-2xl p-4 bg-white border border-stone-200/80 text-stone-900 rounded-bl-none shadow-sm flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center animate-spin">
                                        <Loader2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-800">
                                            Gia sư đang phân tích và tra cứu tư liệu học thuật...
                                        </p>
                                        <p className="text-[11px] text-stone-500 italic">
                                            Đang đối chiếu kho ca dao & trích xuất bài học thực tiễn
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Vùng nhập liệu câu hỏi */}
                    <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
                        {error && (
                            <div className="mb-2 p-2 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Hỏi gia sư về ca dao, tục ngữ thuộc chủ đề "${selectedTopic?.name || 'Văn hóa'}"...`}
                                disabled={loading}
                                className="flex-grow px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="px-4 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
                            >
                                <span>Gửi</span>
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                            <span>Nhấn Enter để gửi tin nhắn</span>
                            <span className="hidden sm:inline">Trích dẫn chuẩn từ kho tàng văn học dân gian Việt Nam</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal chi tiết tác phẩm (Tái sử dụng WorkDetailModal của UC08) */}
            {modalOpen && modalWork && (
                <WorkDetailModal
                    work={modalWork}
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onWorkSelect={(w) => {
                        setModalWork(w);
                    }}
                />
            )}
        </div>
    );
};

export default AiTutor;
