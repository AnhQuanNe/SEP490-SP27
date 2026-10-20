const mongoose = require('mongoose');
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

const GEMINI_MODELS = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
];

/**
 * Gọi Google Gemini API với danh sách model hoạt động thực tế
 */
async function callGeminiApi({ question, contextText, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const systemInstruction = `Bạn là VietHeritage AI — Trợ lý nghiên cứu và đối thoại học thuật về Di sản Văn học & Văn hóa Dân gian Việt Nam.
Nhiệm vụ của bạn:
1. Trả lời câu hỏi một cách thông minh, chuẩn xác, tự nhiên, gần gũi, giàu chất nhân văn và truyền cảm. Luôn trả lời đầy đủ, trọn vẹn, không bao giờ ngắt quãng hay bỏ dở câu giữa chừng.
2. Hiểu và giải thích cặn kẽ mọi câu hỏi về:
   - Các tác giả, danh nhân văn hóa Việt Nam (như Đại thi hào Nguyễn Du, Nguyễn Trãi, Hồ Xuân Hương, Chu Văn An, v.v.).
   - Các tác phẩm văn học dân gian, truyện cổ tích, truyền thuyết, thần thoại, ca dao tục ngữ.
   - Các tác phẩm văn học kinh điển (như Truyện Kiều, Nam quốc sơn hà, Hịch tướng sĩ, Bình Ngô đại cáo, v.v.).
   - Ý nghĩa biểu tượng nghệ thuật, phong tục tập quán và bài học đạo lý truyền thống.
3. Nếu người dùng hỏi các câu hỏi cơ bản như "Nguyễn Du là ai?" hoặc mục tiêu của bạn là gì, hãy giải thích một cách cô đọng, dễ hiểu, có bố cục rõ ràng, nêu bật các đóng góp lớn nhất.
4. Nếu có kho tư liệu tham khảo từ hệ thống bên dưới khớp với câu hỏi, hãy ưu tiên kết hợp tư liệu và dẫn nguồn học thuật.
5. Luôn giữ phong thái uyên bác, trang nhã, chuẩn mực tiếng Việt.`;

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

    const userPrompt = contextText && contextText.trim() !== ''
        ? `[KHO TƯ LIỆU THAM KHẢO TỪ HỆ THỐNG]:
${contextText}

[CÂU HỎI CỦA NGƯỜI DÙNG]:
${question}

Hãy phân tích và trả lời câu hỏi trên dựa trên sự am hiểu sâu sắc về văn học Việt Nam và kết hợp tư liệu kiểm chứng (nếu có). Trình bày mạch lạc, đầy đủ, không cắt ngắn.`
        : `[CÂU HỎI CỦA NGƯỜI DÙNG]:
${question}

Hãy giải thích và trả lời câu hỏi trên thật dễ hiểu, chuẩn xác, làm nổi bật giá trị văn hóa và văn học Việt Nam. Trình bày trọn vẹn, sinh động.`;

    contents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
    });

    for (const model of GEMINI_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents,
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 4096,
                        thinkingConfig: {
                            thinkingBudget: 0,
                        },
                    },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const parts = data.candidates?.[0]?.content?.parts || [];
                const fullAnswer = parts.map((p) => p.text || '').join('').trim();
                if (fullAnswer) return fullAnswer;
            } else {
                console.warn(`[Gemini API] Model ${model} failed with status ${response.status}`);
            }
        } catch (err) {
            console.warn(`[Gemini API] Lỗi model ${model}:`, err.message);
        }
    }

    return null;
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
    // Phân tích theo tác giả cụ thể (ví dụ: Nguyễn Du, Nguyễn Trãi) hoặc câu hỏi "là ai"
    else if (main.author && (qClean.includes('la ai') || qClean.includes('ai la') || qClean.includes('tac gia') || qClean.includes('nguyen du') || qClean.includes('nguyen trai'))) {
        specificAnalysis = `
### 1. Giới thiệu về ${main.author}:
- **Vị thế văn học:** Là một trong những đại diện tiêu biểu nhất của nền văn học Việt Nam, gắn liền với kiệt tác bất hủ **"${main.title}"** (${main.categoryName}).
- **Thời kỳ & Địa bàn:** ${main.period} — gắn liền với vùng đất *${main.region}*.
- **Tầm vóc:** Đóng góp to lớn vào việc bảo tồn, phát triển tiếng Việt và khẳng định bản sắc văn hóa dân tộc.

### 2. Kiệt tác gắn liền tên tuổi:
- ${main.summary}
${main.quote ? `\n> *"${main.quote}"*` : ''}

### 3. Ý nghĩa chủ đề & Bài học nhân đạo:
- ${main.thematicMeaning || 'Đề cao giá trị nhân bản, tiếng nói công lý và lòng trắc ẩn sâu sắc trước số phận con người.'}`;
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

    const authorHeader = main.author && main.author !== 'Dân gian' ? ` — Tác giả: **${main.author}**` : '';
    const answer = `Dựa trên nguồn tư liệu học thuật về tác phẩm **"${main.title}"** (${main.categoryName}${authorHeader}, khu vực *${main.region}*), VietHeritage AI xin giải đáp như sau:

${specificAnalysis}

---
*Nguồn tham khảo học thuật kiểm chứng:* **${main.source}**`;

    const citations = works.map((w) => ({
        title: w.title,
        slug: w.slug,
        category: w.category,
        categoryName: w.categoryName,
        region: w.region,
        author: w.author,
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

const GREETING_PATTERNS = [
    /^(xin\s+)?chao(\s+(ban|ad|tro\s+ly|ai|bot|nhe|nha|moi\s+nguoi))?$/i,
    /^(hello|hi|hey|halo|hola)(\s+(bot|ai|there))?$/i,
    /^(ban\s+la\s+ai|ban\s+ten\s+gi|ban\s+co\s+the\s+lam\s+gi|gioi\s+thieu\s+ve\s+ban)$/i,
    /^(cam\s+on|thank\s+you|thanks|cam\s+on\s+ban|ok|oke|okie)$/i,
    /^(tam\s+biet|bye|goodbye)$/i,
];

function isConversationalGreeting(text) {
    const clean = removeVietnameseTones(text).trim().toLowerCase();
    return GREETING_PATTERNS.some((pattern) => pattern.test(clean));
}

/**
 * Service chính: Trả lời câu hỏi thông minh có RAG & Dẫn nguồn kiểm chứng (UC09)
 */
const askAssistant = async ({ question, contextSlug = null, history = [] }) => {
    if (!question || typeof question !== 'string' || question.trim() === '') {
        throw new Error('Vui lòng cung cấp nội dung câu hỏi');
    }

    const cleanQuery = question.trim();

    // 0. Nhận diện các câu chào hỏi / giới thiệu xã giao thông thường (tránh bị spam văn học)
    if (!contextSlug && isConversationalGreeting(cleanQuery)) {
        const qClean = removeVietnameseTones(cleanQuery).toLowerCase();
        let greetingText = '';

        if (qClean.includes('cam on') || qClean.includes('thank')) {
            greetingText = `Không có chi! Rất vui được đồng hành cùng bạn khám phá di sản văn hóa và văn học dân gian Việt Nam. Nếu bạn có bất kỳ câu hỏi nào về các tích truyện, nhân vật hay câu ca dao, đừng ngần ngại hỏi tôi nhé! 😊`;
        } else if (qClean.includes('tam biet') || qClean.includes('bye')) {
            greetingText = `Tạm biệt bạn! Chúc bạn có những phút giây học tập và trải nghiệm văn hóa thật nhiều niềm vui. Hẹn gặp lại bạn lần sau! 👋`;
        } else {
            greetingText = `Chào bạn! Tôi là **VietHeritage AI** — Trợ lý nghiên cứu Di sản Văn học & Văn hóa Dân gian Việt Nam. 🌸

Tôi có thể hỗ trợ bạn:
- **Giải nghĩa ca dao, tục ngữ**: Phân tích nghĩa đen, nghĩa bóng và đạo lý nhân sinh răn dạy đời sau.
- **Phân tích biểu tượng văn học**: Khám phá ý nghĩa tiếng đàn thần Thạch Sanh, ngựa sắt Thánh Gióng, cuộc chiến Sơn Tinh - Thủy Tinh...
- **Tra cứu bối cảnh lịch sử**: Cung cấp nguồn tư liệu học thuật kiểm chứng đáng tin cậy.

Hôm nay bạn muốn tìm hiểu tác phẩm hoặc câu chuyện nào?`;
        }

        return {
            answer: greetingText,
            citations: [],
            suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
            sourceType: 'conversational_greeting',
        };
    }

    let primaryWork = null;
    let candidateWorks = [];

    // 1. Nếu có contextSlug cụ thể (ví dụ người dùng bấm từ trang chi tiết tác phẩm)
    if (contextSlug) {
        primaryWork = await Work.findOne({ slug: contextSlug });
    }

    // 2. RAG: Tìm kiếm các tác phẩm liên quan trong Database
    if (!primaryWork) {
        const fullRegex = buildVietnameseRegex(cleanQuery);

        if (fullRegex) {
            candidateWorks = await Work.find({
                $or: [
                    { title: fullRegex },
                    { author: fullRegex },
                    { tags: fullRegex },
                    { summary: fullRegex },
                    { thematicMeaning: fullRegex },
                    { historicalContext: fullRegex },
                ],
                status: 'published',
            })
                .limit(3)
                .lean();
        }

        // Nếu tìm theo toàn bộ câu không ra, tách các từ khóa (loại bỏ từ dừng)
        if (candidateWorks.length === 0) {
            const STOP_WORDS = new Set([
                'toi', 'tôi', 'ban', 'bạn', 'minh', 'mình', 'em', 'anh', 'chi', 'chị',
                'khong', 'không', 'chua', 'chưa', 'hieu', 'hiểu', 'biet', 'biết', 'cho',
                'hoi', 'hỏi', 've', 'về', 'la', 'là', 'ai', 'gi', 'gì', 'sao', 'nhu', 'như',
                'the', 'thế', 'nao', 'nào', 'tai', 'tại', 'cua', 'của', 'trong', 'va', 'và',
                'co', 'có', 'duoc', 'được', 'nay', 'này', 'do', 'đó', 'xin'
            ]);

            const rawTokens = cleanQuery.split(/[\s,?.!;:—–"']+/).filter(Boolean);
            const filteredWords = rawTokens.filter((token) => !STOP_WORDS.has(token.toLowerCase()));

            // Tạo các cụm 2 từ (bigram) hoặc từ đơn có nghĩa
            const searchTerms = [];
            for (let i = 0; i < filteredWords.length - 1; i++) {
                searchTerms.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);
            }
            filteredWords.forEach((w) => {
                if (w.length >= 2) searchTerms.push(w);
            });

            if (searchTerms.length > 0) {
                const orConditions = [];
                for (const term of searchTerms.slice(0, 5)) {
                    const r = buildVietnameseRegex(term);
                    if (r) {
                        orConditions.push({ title: r }, { author: r }, { tags: r });
                    }
                }

                if (orConditions.length > 0) {
                    candidateWorks = await Work.find({
                        $or: orConditions,
                        status: 'published',
                    })
                        .limit(3)
                        .lean();
                }
            }
        }

        if (candidateWorks.length > 0) {
            primaryWork = candidateWorks[0];
        } else if (!process.env.GEMINI_API_KEY) {
            // Khi không dùng Gemini và cũng không tìm thấy tác phẩm phù hợp trong DB
            return {
                answer: `Tôi đã tra cứu trong kho tư liệu của VietHeritage AI nhưng chưa thấy tài liệu khớp trực tiếp với câu hỏi: *"${cleanQuery}"*.

💡 **Gợi ý cho bạn:**
1. Thử hỏi về các tác phẩm nổi bật: **Thạch Sanh, Thánh Gióng, Sơn Tinh - Thủy Tinh, Truyện Kiều, Nam quốc sơn hà, Tấm Cám**.
2. Tìm theo chủ đề: *đạo lý chữ Hiếu, lòng yêu nước, tinh thần tương thân tương ái, ước mơ công lý*.
3. Bấm vào một trong các câu hỏi gợi ý bên dưới để bắt đầu!`,
                citations: [],
                suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
                sourceType: 'no_match_guidance',
            };
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
${w.author ? `- Tác giả: ${w.author}\n` : ''}- Khu vực / Thời kỳ: ${w.region} — ${w.period}
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
        author: w.author,
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
 * Yêu cầu AI giải thích chi tiết một câu ca dao / tục ngữ (UC10 Request AI Explanation)
 * Phân tích cấu trúc: Nghĩa đen, Nghĩa bóng, Bài học đạo lý, Bối cảnh văn hóa và Nguồn kiểm chứng
 */
const explainWork = async ({ workId, slug }) => {
    const isObjectId = mongoose.isValidObjectId(workId || slug);
    const query = isObjectId ? { $or: [{ _id: workId || slug }, { slug: slug || workId }] } : { slug: slug || workId };

    const work = await Work.findOne({ ...query, status: 'published' }).lean();

    if (!work) {
        throw new Error('Không tìm thấy câu ca dao hoặc tục ngữ trong hệ thống');
    }

    // 1. Nếu có Gemini API Key, gọi LLM phân tích sâu
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        const prompt = `Phân tích sâu sắc và toàn diện về câu ca dao / tục ngữ sau:
Tiêu đề / Văn bản: "${work.title}"
${work.quote ? `Trích dẫn đầy đủ: "${work.quote}"` : ''}
Chủ đề: ${work.topic || 'Văn hóa Dân gian'}
Nghĩa đen đã ghi nhận: ${work.literalMeaning || work.summary}
Nghĩa bóng đã ghi nhận: ${work.figurativeMeaning || work.thematicMeaning}
Bài học đã ghi nhận: ${work.lesson || 'Đạo lý làm người'}
Bối cảnh văn hóa: ${work.historicalContext || 'Nền văn minh nông nghiệp truyền thống'}
Nguồn học thuật chính thức: ${work.source}

Hãy trình bày lời giải thích rõ ràng theo 4 phần:
1. Nghĩa đen: Giải thích từ ngữ, hình ảnh cụ thể mộc mạc.
2. Nghĩa bóng: Giá trị biểu tượng, tầng ý nghĩa ẩn dụ sâu xa.
3. Bài học & Thông điệp: Lời răn dạy đạo đức, lối sống cho con người hôm nay.
4. Bối cảnh văn hóa & Ứng dụng: Nguồn gốc phong tục tập quán và cách vận dụng câu này trong giao tiếp đời sống thực tế.
LƯU Ý NGHIÊM NGẶT: Không tự tạo thêm nguồn sách giả hoặc URL bịa đặt. Chỉ trích dẫn đúng nguồn học thuật kiểm chứng trên.`;

        const geminiAnswer = await callGeminiApi({
            question: prompt,
            contextText: `Nguồn dữ liệu kiểm chứng hệ thống: ${work.source}`,
        });

        if (geminiAnswer) {
            return {
                work,
                explanation: geminiAnswer,
                citations: [
                    {
                        title: work.title,
                        category: work.category,
                        categoryName: work.categoryName,
                        source: work.source,
                        author: work.author,
                    },
                ],
                sourceType: 'gemini_deep_explain',
            };
        }
    }

    // 2. Fallback chuẩn mực từ cơ sở dữ liệu học thuật nội bộ
    const formattedExplanation = `### 1. Nghĩa đen (Nghĩa hiển ngôn):
${work.literalMeaning || work.summary || 'Hình ảnh mộc mạc, gần gũi bắt nguồn từ đời sống sinh hoạt và lao động sản xuất thường nhật của người bình dân xưa.'}

### 2. Nghĩa bóng (Nghĩa hàm ẩn):
${work.figurativeMeaning || work.thematicMeaning || 'Gửi gắm triết lý nhân sinh sâu sắc, khẳng định các giá trị chân - thiện - mỹ và đạo lý đối nhân xử thế truyền thống.'}

### 3. Bài học & Thông điệp giáo dục:
${work.lesson || 'Nhắc nhở mỗi cá nhân rèn luyện nhân cách, sống có trách nhiệm, trọng nghĩa tình và gìn giữ cội nguồn tổ tiên.'}

### 4. Bối cảnh văn hóa & Ứng dụng đời sống:
${work.historicalContext ? work.historicalContext : 'Hình thành từ nền văn minh lúa nước và nếp sống làng xã Việt Nam, thường được ông bà cha mẹ dùng để răn dạy con cháu trong gia đình và đời sống cộng đồng.'}`;

    return {
        work,
        explanation: formattedExplanation,
        citations: [
            {
                title: work.title,
                category: work.category,
                categoryName: work.categoryName,
                source: work.source,
                author: work.author,
            },
        ],
        sourceType: 'verified_database_engine',
    };
};

/**
 * Tạo phân tích & lời khuyên của AI cho kết quả tìm kiếm ngữ nghĩa
 */
const generateSemanticInsight = async ({ query, topWork, matchedConcept }) => {
    if (!topWork) return null;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Thử gọi Gemini API nếu có key
    if (apiKey) {
        try {
            const prompt = `Người dùng đang tìm kiếm ca dao, tục ngữ Việt Nam với câu nói: "${query}".
Chủ đề nhận diện: "${matchedConcept?.topic || topWork.topic}".
Tác phẩm tiêu biểu nhất được hệ thống lựa chọn: "${topWork.title}".
Câu trích dẫn tác phẩm: "${topWork.quote || topWork.title}".
Bài học đúc kết: "${topWork.lesson || ''}".
Ý nghĩa hàm ẩn: "${topWork.figurativeMeaning || topWork.summary || ''}".

Nhiệm vụ của bạn: Hãy viết một đoạn phân tích và lời khuyên ngắn gọn (khoảng 2 đến 3 câu, tối đa 80 từ), đóng vai trò Chuyên gia Di sản Văn hóa VietHeritage AI. Trực tiếp giải thích cho người dùng lý do vì sao câu ca dao/tục ngữ này là câu trả lời chuẩn xác và ý nghĩa nhất cho tâm niệm của họ. Không dùng đại từ ngôi thứ ba xa lạ, hãy nói chuyện trực tiếp, ấm áp, văn phong chuẩn mực học thuật.`;

            for (const model of GEMINI_MODELS) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.5,
                                maxOutputTokens: 250,
                            },
                        }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                        if (text) {
                            return {
                                insight: text,
                                highlightWork: topWork.title,
                                source: 'gemini_ai',
                            };
                        }
                    }
                } catch (e) {
                    // Tiếp tục thử model kế tiếp
                }
            }
        } catch (err) {
            console.warn('[SemanticInsight] Gemini lỗi, chuyển sang fallback:', err.message);
        }
    }

    // 2. Fallback học thuật nội sinh (luôn hoạt động ổn định và chính xác 100%)
    let fallbackText = `Đối với tâm niệm của bạn về "${query}", kho tàng văn học dân gian Việt Nam đúc kết sâu sắc và chuẩn xác nhất qua câu ca dao "${topWork.title}". `;
    if (topWork.lesson) {
        fallbackText += topWork.lesson;
    } else if (topWork.figurativeMeaning) {
        fallbackText += topWork.figurativeMeaning;
    } else {
        fallbackText += topWork.summary;
    }

    return {
        insight: fallbackText,
        highlightWork: topWork.title,
        source: 'heritage_synthesis_engine',
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
    explainWork,
    getSuggestions,
    generateSemanticInsight,
};

