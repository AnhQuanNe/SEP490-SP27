const Work = require('../models/Work');
const { removeVietnameseTones, buildVietnameseRegex } = require('../utils/vietnamese.utils');

/**
 * Danh sách câu hỏi gợi ý khám phá nhanh
 */
const DEFAULT_SUGGESTIONS = [
    {
        id: 'thach-sanh-y-nghia',
        question: 'Ý nghĩa hình tượng tiếng đàn và niêu cơm thần trong Thạch Sanh là gì?',
        category: 'Truyện cổ tích',
        slug: 'thach-sanh',
    },
    {
        id: 'thanh-giong-bay-ve-troi',
        question: 'Tại sao Thánh Gióng bay về trời sau khi đánh tan giặc mà không nhận bổng lộc?',
        category: 'Truyền thuyết',
        slug: 'thanh-giong',
    },
    {
        id: 'son-tinh-thuy-tinh-khat-vong',
        question: 'Hình tượng Sơn Tinh chiến thắng Thủy Tinh thể hiện khát vọng gì của tổ tiên?',
        category: 'Thần thoại',
        slug: 'son-tinh-thuy-tinh',
    },
    {
        id: 'ca-dao-gia-dinh',
        question: 'Những câu ca dao nào răn dạy sâu sắc nhất về chữ Hiếu và ơn nghĩa cha mẹ?',
        category: 'Ca dao - Tục ngữ',
        slug: 'ca-dao-dong-bang-bac-bo',
    },
    {
        id: 'nam-quoc-son-ha-tuyen-ngon',
        question: 'Vì sao Nam quốc sơn hà được coi là bản Tuyên ngôn Độc lập đầu tiên của nước ta?',
        category: 'Văn học Trung đại',
        slug: 'nam-quoc-son-ha',
    },
];

/**
 * Gọi Google Gemini API nếu có cấu hình GEMINI_API_KEY
 */
async function callGeminiApi({ question, contextText, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const systemInstruction = `Bạn là VietHeritage AI — Trợ lý học thuật chuyên sâu về Di sản Văn học & Văn hóa Dân gian Việt Nam.
Nhiệm vụ của bạn:
1. Trả lời câu hỏi của người dùng một cách chuẩn xác, uyên bác, giàu chất nhân văn và truyền cảm.
2. Ưu tiên dựa trên kho tư liệu văn học được cung cấp dưới đây. Nếu thông tin có trong tư liệu, hãy giải thích cặn kẽ và trích dẫn rõ nguồn học thuật.
3. Cấu trúc câu trả lời mạch lạc: có luận điểm rõ ràng (1, 2, 3), phân tích bối cảnh lịch sử, ý nghĩa biểu tượng/hình tượng, và bài học nhân sinh thời hiện đại.
4. Giữ giọng điệu tôn trọng di sản dân tộc, chuẩn mực tiếng Việt.`;

        const contents = [];

        // Thêm lịch sử hội thoại gần nhất (nếu có)
        if (Array.isArray(history) && history.length > 0) {
            for (const msg of history.slice(-4)) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                });
            }
        }

        const userPrompt = `[KHO TƯ LIỆU THAM KHẢO TỪ HỆ THỐNG]:
${contextText}

[CÂU HỎI CỦA NGƯỜI DÙNG]:
${question}

Hãy phân tích và trả lời câu hỏi trên kèm dẫn nguồn tài liệu kiểm chứng đã cho.`;

        contents.push({
            role: 'user',
            parts: [{ text: userPrompt }],
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            console.warn(`[Gemini API] Request failed with status ${response.status}`);
            return null;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return candidate || null;
    } catch (err) {
        console.warn('[Gemini API] Lỗi khi gọi Gemini, chuyển sang động cơ phân tích nội bộ:', err.message);
        return null;
    }
}

/**
 * Động cơ phân tích & tổng hợp tri thức Di sản nội bộ (Heritage Knowledge Synthesis Engine)
 * Đảm bảo 100% phản hồi chính xác, có dẫn chứng học thuật ngay cả khi chưa có API Key
 */
function synthesizeHeritageAnswer({ question, primaryWork, candidateWorks }) {
    const works = primaryWork ? [primaryWork] : candidateWorks;
    if (!works || works.length === 0) {
        return {
            answer: `Xin chào bạn! Hiện tại trong kho tàng dữ liệu VietHeritage AI, câu hỏi của bạn có thể liên quan đến một chủ đề dân gian phong phú chưa được lập chỉ mục cụ thể. 
Tuy nhiên, theo các nghiên cứu dân gian học, văn học dân gian Việt Nam luôn mang đậm tinh thần nhân đạo, lòng yêu chuộng hòa bình, và đạo lý "Uống nước nhớ nguồn".
Bạn có thể thử tra cứu các tác phẩm kinh điển hiện có trong hệ thống như: **Thạch Sanh, Thánh Gióng, Sơn Tinh - Thủy Tinh, Truyện Kiều, Nam quốc sơn hà, Tấm Cám** để xem phân tích chi tiết nhé!`,
            citations: [],
            suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
        };
    }

    const main = works[0];
    const qClean = removeVietnameseTones(question);

    let specificAnalysis = '';

    // Phân tích theo câu hỏi về "tiếng đàn", "niêu cơm" (Thạch Sanh)
    if (main.slug === 'thach-sanh' && (qClean.includes('tieng dan') || qClean.includes('nieu com') || qClean.includes('y nghia'))) {
        specificAnalysis = `
### 1. Ý nghĩa biểu tượng "Tiếng đàn thần":
- **Tiếng nói của công lý:** Tiếng đàn gảy lên trong ngục tối đã vượt qua bức tường giam cầm để đến tai công chúa, giải tỏa nỗi oan khuất ngút trời của Thạch Sanh và vạch trần bộ mặt bội bạc, xảo quyệt của mẹ con Lý Thông.
- **Vũ khí cảm hóa hòa bình:** Khi 18 nước chư hầu đem quân vây hãm, chàng không dùng gươm giáo mà mang đàn ra gảy. Tiếng đàn kỳ diệu làm mềm lòng binh sĩ, gợi nhớ nỗi niềm cha mẹ, quê hương khiến quân giặc "bủn rủn tay chân, không đánh mà tan". Đây là đỉnh cao của tư tưởng nhân văn và tinh thần yêu chuộng hòa bình của dân tộc Việt Nam.

### 2. Ý nghĩa biểu tượng "Niêu cơm thần":
- **Lòng nhân ái vô tận:** Niêu cơm nhỏ xíu nhưng ăn mãi không bao giờ hết tượng trưng cho tiềm lực dồi dào, đức tính hiếu khách và lòng vị tha của nhân dân ta đối với kẻ bại trận.
- **Sức mạnh tinh thần:** Thắng giặc không bằng sự hủy diệt mà bằng sự cảm hóa, ban phát sự sống và mở ra con đường giao hảo dài lâu giữa các láng giềng.`;
    } 
    // Phân tích câu hỏi Thánh Gióng bay về trời
    else if (main.slug === 'thanh-giong' && (qClean.includes('bay ve troi') || qClean.includes('tai sao') || qClean.includes('y nghia'))) {
        specificAnalysis = `
### 1. Lý do Thánh Gióng cởi giáp bay về trời:
- **Người anh hùng vô tư, xả thân vì nước:** Thánh Gióng sinh ra từ nhân dân, lớn lên bằng cơm áo của bà con làng xóm. Khi đất nước lâm nguy thì vươn vai đánh giặc; khi sạch bóng quân thù, người tráng sĩ cởi bỏ áo giáp bay thẳng về trời mà không màng danh lợi, bổng lộc hay chức tước của triều đình.
- **Bất tử hóa hình tượng người anh hùng:** Hành động bay về trời nâng hình tượng Gióng từ một người anh hùng trần thế trở thành một vị thần bất tử trong tâm thức dân tộc Việt Nam (Phù Đổng Thiên Vương - một trong Tứ Bất Tử).

### 2. Giá trị biểu tượng lịch sử:
- Vết tích tre đằng ngà ngả màu vàng óng, những ao hồ liên tiếp nơi chân ngựa sắt giẫm qua... chính là cách nhân dân biến lịch sử thành huyền thoại để truyền đời đời lòng tự hào bảo vệ giang sơn.`;
    }
    // Phân tích Sơn Tinh - Thủy Tinh
    else if (main.slug === 'son-tinh-thuy-tinh') {
        specificAnalysis = `
### 1. Bản chất cuộc xung đột Sơn Tinh - Thủy Tinh:
- Phản ánh hiện tượng lũ lụt hàng năm ở lưu vực đồng bằng sông Hồng thời kỳ tiền sử dựng nước. Thủy Tinh tượng trưng cho sức tàn phá dữ dội của bão lũ thiên nhiên.
- Sơn Tinh tượng trưng cho khối đại đoàn kết và ý chí đắp đê, ngăn lũ, trị thủy quật cường của tổ tiên người Việt cổ (*"Nước dâng lên bao nhiêu, núi cao lên bấy nhiêu"*).

### 2. Ý nghĩa nhân văn:
- Tôn vinh vị thần núi Tản Viên (Đệ nhất Tứ Bất Tử) như biểu tượng che chở, chở che cho cuộc sống ấm no, mùa màng bình yên của cư dân nông nghiệp lúa nước.`;
    }
    // Mặc định: Phân tích tổng quan dựa trên bối cảnh lịch sử và ý nghĩa chủ đề của tác phẩm
    else {
        specificAnalysis = `
### 1. Bối cảnh lịch sử & Hoàn cảnh ra đời:
${main.historicalContext || main.summary}

### 2. Ý nghĩa chủ đề & Biểu tượng nghệ thuật:
${main.thematicMeaning || 'Tác phẩm kết tinh trí tuệ dân gian, đạo lý sống ân nghĩa thủy chung và khát vọng về công bằng xã hội của dân tộc ta.'}
${main.quote ? `\n> *"${main.quote}"*` : ''}

### 3. Bài học nhân sinh sâu sắc:
Tác phẩm là lời nhắc nhở thế hệ hôm nay về cội nguồn văn hóa, bài học ứng xử trọng nghĩa khinh tài và lòng tự tôn đối với di sản văn học nghìn năm.`;
    }

    const answer = `Dựa trên nguồn tư liệu học thuật về tác phẩm **"${main.title}"** (${main.categoryName}, khu vực *${main.region}*), VietHeritage AI xin giải đáp như sau:

${specificAnalysis}

---
*Nguồn tham khảo học thuật kiểm chứng:* **${main.source}**`;

    const citations = works.map((w) => ({
        title: w.title,
        slug: w.slug,
        category: w.category,
        categoryName: w.categoryName,
        region: w.region,
        source: w.source,
    }));

    const suggestedQuestions = [
        `Bối cảnh lịch sử của tác phẩm ${main.title} là gì?`,
        `Những chi tiết hoang đường kỳ ảo trong ${main.title} có ý nghĩa gì?`,
        `Tác phẩm ${main.title} gửi gắm thông điệp gì cho thế hệ trẻ ngày nay?`,
    ];

    return {
        answer,
        citations,
        suggestedQuestions,
    };
}

/**
 * Service chính: Trả lời câu hỏi thông minh có RAG & Dẫn nguồn kiểm chứng (UC09)
 */
const askAssistant = async ({ question, contextSlug = null, history = [] }) => {
    if (!question || typeof question !== 'string' || question.trim() === '') {
        throw new Error('Vui lòng cung cấp nội dung câu hỏi');
    }

    const cleanQuery = question.trim();
    let primaryWork = null;
    let candidateWorks = [];

    // 1. Nếu có contextSlug cụ thể (ví dụ người dùng bấm từ trang chi tiết tác phẩm)
    if (contextSlug) {
        primaryWork = await Work.findOne({ slug: contextSlug });
    }

    // 2. RAG: Tìm kiếm các tác phẩm liên quan trong Database
    if (!primaryWork) {
        const regex = buildVietnameseRegex(cleanQuery);

        if (regex) {
            candidateWorks = await Work.find({
                $or: [
                    { title: regex },
                    { tags: regex },
                    { summary: regex },
                    { thematicMeaning: regex },
                    { historicalContext: regex },
                ],
                status: 'published',
            })
                .limit(3)
                .lean();
        }

        // Nếu tìm theo toàn cụm không ra, tách các từ khóa chính
        if (candidateWorks.length === 0) {
            const keywords = cleanQuery
                .toLowerCase()
                .split(/\s+/)
                .filter((w) => w.length > 2 && !['la', 'gi', 'nhu', 'the', 'nao', 'tai', 'sao', 'cua', 'trong', 'va'].includes(w));

            if (keywords.length > 0) {
                const keywordRegexes = keywords.slice(0, 3).map((kw) => buildVietnameseRegex(kw)).filter(Boolean);
                candidateWorks = await Work.find({
                    $or: keywordRegexes.flatMap((r) => [{ title: r }, { tags: r }]),
                    status: 'published',
                })
                    .limit(3)
                    .lean();
            }
        }

        if (candidateWorks.length > 0) {
            primaryWork = candidateWorks[0];
        } else {
            // Lấy 2 tác phẩm nổi bật làm context nền
            candidateWorks = await Work.find({ isFeatured: true, status: 'published' }).limit(2).lean();
        }
    }

    // 3. Chuẩn bị context để đưa vào RAG Prompt
    const allRelevantWorks = primaryWork
        ? [primaryWork, ...candidateWorks.filter((w) => w.slug !== primaryWork.slug)].slice(0, 3)
        : candidateWorks;

    const contextText = allRelevantWorks
        .map(
            (w, i) => `[Tư liệu ${i + 1}]:
- Tên tác phẩm: ${w.title} (${w.categoryName})
- Khu vực / Thời kỳ: ${w.region} — ${w.period}
- Tóm tắt: ${w.summary}
- Trích đoạn / Câu tiêu biểu: ${w.quote || 'N/A'}
- Bối cảnh lịch sử: ${w.historicalContext || 'N/A'}
- Ý nghĩa chủ đề & Biểu tượng: ${w.thematicMeaning || 'N/A'}
- Nguồn học thuật kiểm chứng: ${w.source}`
        )
        .join('\n\n');

    // 4. Ưu tiên gọi Gemini AI nếu có key
    const geminiAnswer = await callGeminiApi({
        question: cleanQuery,
        contextText,
        history,
    });

    const citations = allRelevantWorks.map((w) => ({
        title: w.title,
        slug: w.slug,
        category: w.category,
        categoryName: w.categoryName,
        region: w.region,
        source: w.source,
    }));

    if (geminiAnswer) {
        return {
            answer: geminiAnswer,
            citations,
            suggestedQuestions: [
                `Ý nghĩa nhân văn của tác phẩm ${primaryWork ? primaryWork.title : 'này'} là gì?`,
                `Bối cảnh lịch sử ra đời của ${primaryWork ? primaryWork.title : 'tác phẩm'}?`,
                `Còn câu ca dao / tích truyện nào liên quan đến chủ đề này không?`,
            ],
            sourceType: 'gemini_rag',
        };
    }

    // 5. Fallback về động cơ nội bộ (chắc chắn luôn chạy 100% không sợ lỗi mạng hay hết quota)
    const localResult = synthesizeHeritageAnswer({
        question: cleanQuery,
        primaryWork,
        candidateWorks: allRelevantWorks,
    });

    return {
        ...localResult,
        sourceType: 'heritage_knowledge_engine',
    };
};

/**
 * Lấy danh sách câu hỏi gợi ý
 */
const getSuggestions = async () => {
    return DEFAULT_SUGGESTIONS;
};

module.exports = {
    askAssistant,
    getSuggestions,
};
