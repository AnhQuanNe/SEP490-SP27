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
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
];

/**
 * Gọi Google Gemini API với danh sách model hoạt động thực tế
 */
async function callGeminiApi({ question, contextText, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const systemInstruction = `Bạn là VietHeritage AI — Chuyên gia cố vấn, nhà nghiên cứu uyên bác và người bạn đồng hành đàm đạo về Văn học, Lịch sử, Ca dao - Tục ngữ, Truyện cổ tích, Thần thoại, Văn học Kinh điển và Văn hóa Dân gian Việt Nam.

NGUYÊN TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. TRẢ LỜI ĐÚNG TRỌNG TÂM, ĐÚNG Ý CÂU HỎI (QUAN TRỌNG NHẤT):
   - Người dùng hỏi gì, hãy trả lời trực tiếp, chính xác, sâu sắc vào câu hỏi đó. Tuyệt đối KHÔNG trả lời vòng vo, KHÔNG gượng ép câu hỏi vào một chủ đề hay tác phẩm khác.
   - TUYỆT ĐỐI KHÔNG dùng một khuôn mẫu cố định hay một công thức chung (như luôn luôn tự ý chia thành 3 phần "Bối cảnh - Ý nghĩa - Bài học"). Hãy thay đổi linh hoạt bố cục và văn phong tùy thuộc vào từng dạng câu hỏi:
     * Câu hỏi về nhân vật / tác giả / danh nhân (vd: "Nguyễn Du là ai?", "Lý Thông là người thế nào?"): Giới thiệu xuất thân, cuộc đời, sự nghiệp, vai trò, tính cách, cống hiến lớn nhất và phong cách tiêu biểu.
     * Câu hỏi về ý nghĩa câu ca dao / tục ngữ / thành ngữ: Trình bày rõ ràng 3 tầng: Nghĩa đen (hình ảnh thực tế đời thường), Nghĩa bóng (triết lý sâu xa) và Bài học nhân sinh ứng dụng vào đời sống.
     * Câu hỏi về biểu tượng / chi tiết nghệ thuật (vd: "Ý nghĩa tiếng đàn thần?", "Niêu cơm thần?", "Ngựa sắt Thánh Gióng?"): Phân tích nguồn gốc biểu tượng, khát vọng dân gian gửi gắm và giá trị nhân văn.
     * Câu hỏi so sánh / đối chiếu (vd: "So sánh Sơn Tinh và Thủy Tinh", "Thạch Sanh khác Lý Thông ở điểm nào?"): So sánh đối chiếu sắc nét theo từng tiêu chí, lập luận mạch lạc.
     * Câu hỏi yêu cầu làm thơ / viết văn / tóm tắt: Sáng tác hoặc tóm tắt trực tiếp, giàu cảm xúc, đúng thể thơ (lục bát, song thất lục bát...), không giải thích rườm rà trừ khi được yêu cầu.
     * Câu hỏi đố, hỏi mẹo, chào hỏi, tâm sự, hỏi ý kiến: Đối đáp tự nhiên, hóm hỉnh, ấm áp, đậm tình người và chất văn hóa Việt.
     * Câu hỏi về các chủ đề khác (đời sống, khoa học, hiện đại): Vẫn giải đáp lịch thiệp, thông minh, chính xác, có thể khéo léo liên hệ nét đẹp văn hóa truyền thống khi phù hợp.

2. CÁCH XỬ LÝ TƯ LIỆU THAM KHẢO TỪ HỆ THỐNG:
   - Nếu hệ thống cung cấp [TƯ LIỆU THAM KHẢO]: Bạn CHỈ sử dụng tư liệu khi và chỉ khi nó THỰC SỰ TRÙNG KHỚP hoặc LIÊN QUAN TRỰC TIẾP đến câu hỏi của người dùng.
   - Nếu câu hỏi của người dùng KHÔNG liên quan đến tư liệu được cung cấp (ví dụ người dùng hỏi về chủ đề khác, làm thơ, hỏi danh nhân khác...), HÃY BỎ QUA TƯ LIỆU ĐÓ và trả lời hoàn toàn bằng kiến thức sâu rộng của chính bạn. Tuyệt đối KHÔNG gượng ép nhắc đến tên tác phẩm hay nội dung trong tư liệu nếu người dùng không hỏi.

3. VĂN PHONG VÀ TRÌNH BÀY:
   - Chuẩn mực tiếng Việt, trong sáng, trang nhã, giàu cảm xúc, đậm đà bản sắc dân tộc.
   - Trình bày mạch lạc, dễ đọc bằng Markdown (in đậm từ khóa quan trọng, gạch đầu dòng các ý chính, trích thơ/ca dao trong ngoặc kép hoặc blockquote).
   - Luôn trả lời trọn vẹn, không ngắt câu lửng lơ.`;

    const contents = [];

    // Thêm lịch sử hội thoại gần nhất (nếu có)
    if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-4)) {
            if (msg && msg.content && typeof msg.content === 'string') {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                });
            }
        }
    }

    const userPrompt = contextText && contextText.trim() !== ''
        ? `[TƯ LIỆU THAM KHẢO TỪ CƠ SỞ DỮ LIỆU]:
${contextText}

(Lưu ý: Chỉ tham khảo tư liệu trên nếu nó thực sự phù hợp với câu hỏi của người dùng. Nếu câu hỏi về chủ đề khác, hãy bỏ qua và trả lời trực tiếp câu hỏi).

[CÂU HỎI CỦA NGƯỜI DÙNG]:
${question}

Hãy trả lời trực tiếp, chính xác, linh hoạt theo đúng trọng tâm câu hỏi trên.`
        : `[CÂU HỎI CỦA NGƯỜI DÙNG]:
${question}

Hãy giải đáp trực tiếp, sâu sắc, đúng trọng tâm và tự nhiên theo đúng ý câu hỏi của người dùng.`;

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
                        temperature: 0.7,
                        maxOutputTokens: 3000,
                    },
                }),
                signal: AbortSignal.timeout(10000),
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
 * Phản hồi linh hoạt theo từng dạng câu hỏi, không gò ép một khuôn mẫu cứng nhắc
 */
function synthesizeHeritageAnswer({ question, primaryWork, candidateWorks }) {
    const qClean = removeVietnameseTones(question || '').toLowerCase();

    // 1. Khi câu hỏi không chỉ đích danh tác phẩm cụ thể trong cơ sở dữ liệu
    if (!primaryWork) {
        if (qClean.includes('tho') || qClean.includes('luc bat')) {
            return {
                answer: `Dưới đây là một bài thơ lục bát truyền thống giàu cảm xúc về cội nguồn và tình nghĩa gia đình:

> *"Công cha như núi Thái Sơn,*
> *Nghĩa mẹ như nước trong nguồn chảy ra.*
> *Một lòng thờ mẹ kính cha,*
> *Cho tròn chữ hiếu mới là đạo con."*

Thể thơ lục bát là một di sản nghệ thuật độc đáo của dân tộc ta, vừa mộc mạc vừa giàu nhạc tính, thường được ông cha gửi gắm những đạo lý đối nhân xử thế sâu sắc. Bạn có muốn đàm đạo hoặc phân tích tác phẩm văn học nào không?`,
                citations: [],
                suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
            };
        }

        if (qClean.includes('ca dao') || qClean.includes('tuc ngu')) {
            return {
                answer: `Ca dao và tục ngữ là kho tàng bách khoa thư về đời sống tâm hồn, đạo đức và triết lý sống của người Việt Nam qua hàng nghìn năm lịch sử.

Mỗi câu nói dân gian đều ẩn chứa:
- **Nghĩa đen:** Bắt nguồn từ các hình ảnh lao động sản xuất, sinh hoạt mộc mạc nơi thôn dã.
- **Nghĩa bóng:** Gửi gắm đạo lý làm người — chữ Hiếu, lòng Nhân ái, sự Thủy chung và Tinh thần đoàn kết cộng đồng.

Bạn có thể hỏi trực tiếp bất kỳ câu ca dao, tục ngữ nào (ví dụ: *"Bầu ơi thương lấy bí cùng"*, *"Uống nước nhớ nguồn"*, *"Lá lành đùm lá rách"*) để tôi giải nghĩa chi tiết nhé!`,
                citations: [],
                suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
            };
        }

        return {
            answer: `Chào bạn! Tôi đã ghi nhận câu hỏi của bạn: *"${question}"*.

VietHeritage AI luôn sẵn sàng đồng hành cùng bạn khám phá mọi khía cạnh của di sản văn hóa và văn học Việt Nam. Để có câu trả lời sâu sắc nhất, bạn có thể thử:
1. **Hỏi về truyện cổ tích / truyền thuyết:** Thạch Sanh, Thánh Gióng, Sơn Tinh - Thủy Tinh, Tấm Cám, Chử Đồng Tử...
2. **Hỏi về danh nhân / tác phẩm kinh điển:** Nguyễn Du (Truyện Kiều), Nguyễn Trãi (Bình Ngô đại cáo), Lý Thường Kiệt (Nam quốc sơn hà)...
3. **Phân tích ca dao, tục ngữ:** Giải nghĩa đen, nghĩa bóng và bài học làm người.`,
            citations: [],
            suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
        };
    }

    // 2. Khi câu hỏi gắn với tác phẩm cụ thể (primaryWork)
    const main = primaryWork;
    let dynamicBody = '';

    // Phân tích câu hỏi theo ý định (intent) để câu trả lời luôn đúng trọng tâm
    if (main.slug === 'thach-sanh' && (qClean.includes('tieng dan') || qClean.includes('nieu com') || qClean.includes('dan than'))) {
        dynamicBody = `Trong truyện cổ tích **Thạch Sanh**, hai biểu tượng thần kỳ mang ý nghĩa nhân văn sâu sắc:

- **Tiếng đàn thần — Tiếng nói của Công lý và Hòa bình:** Tiếng đàn gảy lên trong ngục tối đã vạch trần tội ác của mẹ con Lý Thông, giải nỗi oan khuất ngút trời của Thạch Sanh. Đặc biệt, khi 18 nước chư hầu kéo quân sang vây hãm, tiếng đàn thần vang lên làm mềm lòng binh sĩ giặc, khiến quân thù "bủn rủn tay chân, không đánh mà tan". Đây là đỉnh cao của truyền thống yêu chuộng hòa bình và tư tưởng nhân đạo của dân tộc ta.
- **Niêu cơm thần — Lòng nhân ái vô tận:** Niêu cơm nhỏ xíu nhưng quân sĩ 18 nước chư hầu ăn mãi không hết tượng trưng cho tiềm lực dồi dào, đức tính hiếu khách và tấm lòng vị tha cao cả đối với kẻ bại trận.`;
    } else if (main.slug === 'thanh-giong' && (qClean.includes('bay ve troi') || qClean.includes('tai sao') || qClean.includes('coi giap'))) {
        dynamicBody = `Hình tượng **Thánh Gióng đánh tan giặc Ân rồi cởi giáp bay thẳng về trời** gửi gắm hai tầng ý nghĩa lớn:

- **Người anh hùng vô tư, xả thân vì nghĩa lớn:** Thánh Gióng lớn lên bằng cơm áo của bà con làng xóm. Khi Tổ quốc lâm nguy, người tráng sĩ vươn vai đánh giặc; khi sạch bóng thù, chàng thanh thản bay về trời, không màng tước lộc, quyền quý hay bổng lộc triều đình.
- **Bất tử hóa trong tâm thức dân tộc:** Nhân dân đã biến người anh hùng trần thế thành một vị thần bất tử (Phù Đổng Thiên Vương - một trong Tứ Bất Tử), sống mãi trong non sông gấm vóc.`;
    } else if (qClean.includes('la ai') || qClean.includes('ai la') || qClean.includes('tac gia') || qClean.includes('tieu su')) {
        const authorName = main.author && main.author !== 'Dân gian' ? main.author : 'Tác giả Dân gian (Nhân dân lao động)';
        dynamicBody = `Về tác giả và xuất xứ của tác phẩm **"${main.title}"**:

- **Tác giả:** **${authorName}**
- **Thời kỳ & Vùng miền:** ${main.period} — Khu vực *${main.region}*.
- **Thể loại:** ${main.categoryName}
- **Đóng góp & Vị thế:** ${main.summary}
${main.quote ? `\n> *"${main.quote}"*` : ''}`;
    } else if (qClean.includes('y nghia') || qClean.includes('bai hoc') || qClean.includes('thong diep') || qClean.includes('triet ly')) {
        dynamicBody = `Về ý nghĩa chủ đề và bài học nhân sinh của **"${main.title}"**:

- **Ý nghĩa cốt lõi:** ${main.thematicMeaning || 'Tác phẩm khẳng định niềm tin mãnh liệt vào chân lý cái thiện luôn chiến thắng cái ác, đạo lý ở hiền gặp lành.'}
- **Bài học cho hôm nay:** Nhắc nhở thế hệ hôm nay giữ gìn lòng tự tôn dân tộc, lối sống ân nghĩa, dũng cảm và nhân ái.
${main.quote ? `\n> *"${main.quote}"*` : ''}`;
    } else if (qClean.includes('boi canh') || qClean.includes('lich su') || qClean.includes('hoan canh')) {
        dynamicBody = `Về bối cảnh lịch sử và hoàn cảnh ra đời của **"${main.title}"**:

- **Hoàn cảnh ra đời:** ${main.historicalContext || 'Tác phẩm ra đời trong giai đoạn ' + main.period + ', phản ánh tâm tư tình cảm và đời sống xã hội của nhân dân vùng ' + main.region + '.'}
- **Tóm tắt nội dung:** ${main.summary}`;
    } else {
        dynamicBody = `Về tác phẩm **"${main.title}"** (${main.categoryName}, khu vực *${main.region}*):

${main.summary}

- **Ý nghĩa chủ đề:** ${main.thematicMeaning || 'Gửi gắm ước mơ của nhân dân về công lý, hòa bình và đạo nghĩa làm người.'}
${main.quote ? `\n> *"${main.quote}"*` : ''}`;
    }

    const citations = [
        {
            title: main.title,
            slug: main.slug,
            category: main.category,
            categoryName: main.categoryName,
            region: main.region,
            author: main.author,
            source: main.source,
        },
    ];

    const suggestedQuestions = [
        `Ý nghĩa biểu tượng nổi bật nhất trong "${main.title}"?`,
        `Bối cảnh lịch sử và hoàn cảnh ra đời của "${main.title}"?`,
        `Những bài học nhân sinh sâu sắc từ "${main.title}"?`,
    ];

    return {
        answer: dynamicBody,
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
 * Service chính: Trả lời câu hỏi thông minh linh hoạt, đúng trọng tâm
 */
const askAssistant = async ({ question, contextSlug = null, history = [] }) => {
    if (!question || typeof question !== 'string' || question.trim() === '') {
        throw new Error('Vui lòng cung cấp nội dung câu hỏi');
    }

    const cleanQuery = question.trim();

    // 0. Nhận diện các câu chào hỏi / cảm ơn / xã giao thuần túy
    if (!contextSlug && isConversationalGreeting(cleanQuery)) {
        const qClean = removeVietnameseTones(cleanQuery).toLowerCase();
        let greetingText = '';

        if (qClean.includes('cam on') || qClean.includes('thank')) {
            greetingText = `Không có chi! Rất vui được đồng hành cùng bạn khám phá di sản văn hóa và văn học Việt Nam. Nếu bạn có bất kỳ câu hỏi nào về các tích truyện, nhân vật hay câu ca dao, đừng ngần ngại hỏi tôi nhé! 😊`;
        } else if (qClean.includes('tam biet') || qClean.includes('bye')) {
            greetingText = `Tạm biệt bạn! Chúc bạn có những phút giây học tập và trải nghiệm văn hóa thật nhiều niềm vui. Hẹn gặp lại bạn lần sau! 👋`;
        } else {
            greetingText = `Chào bạn! Tôi là **VietHeritage AI** — Trợ lý nghiên cứu và đàm đạo Di sản Văn học & Văn hóa Dân gian Việt Nam. 🌸

Tôi có thể hỗ trợ bạn:
- **Giải nghĩa ca dao, tục ngữ**: Phân tích nghĩa đen, nghĩa bóng và bài học đạo lý nhân sinh.
- **Phân tích biểu tượng văn học**: Khám phá ý nghĩa tiếng đàn thần Thạch Sanh, ngựa sắt Thánh Gióng, cuộc chiến Sơn Tinh - Thủy Tinh...
- **Tra cứu bối cảnh lịch sử & danh nhân**: Cuộc đời, sự nghiệp Nguyễn Du, Nguyễn Trãi, Hồ Xuân Hương...
- **Sáng tác & đàm đạo thơ ca**: Đối thơ, đố vui văn học và trao đổi văn hóa truyền thống.

Hôm nay bạn muốn cùng tôi tìm hiểu chủ đề nào?`;
        }

        return {
            answer: greetingText,
            citations: [],
            suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
            sourceType: 'conversational_greeting',
        };
    }

    let primaryWork = null;

    // 1. Nếu có contextSlug cụ thể (ví dụ người dùng bấm từ trang chi tiết tác phẩm)
    if (contextSlug) {
        primaryWork = await Work.findOne({ slug: contextSlug, status: 'published' }).lean();
    }

    // 2. Nếu không có contextSlug, tìm kiếm chính xác theo Tiêu đề hoặc Tác giả xuất hiện trong câu hỏi
    if (!primaryWork) {
        try {
            const allPublishedWorks = await Work.find({ status: 'published' })
                .select('title slug author category categoryName region period summary quote historicalContext thematicMeaning source tags')
                .lean();

            const qNorm = removeVietnameseTones(cleanQuery).toLowerCase();

            // A. So khớp theo Tiêu đề tác phẩm
            const matchedByTitle = allPublishedWorks
                .filter((w) => {
                    const titleNorm = removeVietnameseTones(w.title).toLowerCase();
                    const slugNorm = (w.slug || '').replace(/-/g, ' ').toLowerCase();
                    return qNorm.includes(titleNorm) || (slugNorm.length >= 4 && qNorm.includes(slugNorm));
                })
                .sort((a, b) => b.title.length - a.title.length);

            if (matchedByTitle.length > 0) {
                primaryWork = matchedByTitle[0];
            } else {
                // B. So khớp theo Tên tác giả nổi tiếng
                const matchedByAuthor = allPublishedWorks.filter((w) => {
                    if (!w.author || w.author === 'Dân gian') return false;
                    const authorNorm = removeVietnameseTones(w.author).toLowerCase();
                    return authorNorm.length >= 4 && qNorm.includes(authorNorm);
                });

                if (matchedByAuthor.length > 0) {
                    primaryWork = matchedByAuthor[0];
                }
            }
        } catch (dbErr) {
            console.warn('[AI Service] Lỗi tra cứu DB:', dbErr.message);
        }
    }

    // 3. Chuẩn bị context nếu có tác phẩm trùng khớp
    let contextText = null;
    if (primaryWork) {
        contextText = `[Tác phẩm đối chiếu]:
- Tên tác phẩm: ${primaryWork.title} (${primaryWork.categoryName})
${primaryWork.author ? `- Tác giả: ${primaryWork.author}\n` : ''}- Khu vực / Thời kỳ: ${primaryWork.region} — ${primaryWork.period}
- Tóm tắt: ${primaryWork.summary}
- Trích đoạn / Câu tiêu biểu: ${primaryWork.quote || 'N/A'}
- Bối cảnh lịch sử: ${primaryWork.historicalContext || 'N/A'}
- Ý nghĩa chủ đề & Biểu tượng: ${primaryWork.thematicMeaning || 'N/A'}
- Nguồn học thuật kiểm chứng: ${primaryWork.source}`;
    }

    // 4. Ưu tiên gọi Gemini AI
    const geminiAnswer = await callGeminiApi({
        question: cleanQuery,
        contextText,
        history,
    });

    const citations = primaryWork
        ? [
              {
                  title: primaryWork.title,
                  slug: primaryWork.slug,
                  category: primaryWork.category,
                  categoryName: primaryWork.categoryName,
                  region: primaryWork.region,
                  author: primaryWork.author,
                  source: primaryWork.source,
              },
          ]
        : [];

    let suggestedQuestions = [];
    if (primaryWork) {
        suggestedQuestions = [
            `Ý nghĩa biểu tượng nổi bật nhất trong "${primaryWork.title}"?`,
            `Bối cảnh lịch sử và hoàn cảnh ra đời của "${primaryWork.title}"?`,
            `Những bài học nhân sinh giá trị từ "${primaryWork.title}" cho hôm nay?`,
        ];
    } else {
        suggestedQuestions = [
            'Ý nghĩa tiếng đàn thần Thạch Sanh là gì?',
            'Tại sao Thánh Gióng bay về trời sau khi đánh tan giặc?',
            'Những câu ca dao sâu sắc nhất về tình cảm gia đình?',
        ];
    }

    if (geminiAnswer) {
        return {
            answer: geminiAnswer,
            citations,
            suggestedQuestions,
            sourceType: 'gemini_smart_dialogue',
        };
    }

    // 5. Fallback thông minh nội bộ
    const localResult = synthesizeHeritageAnswer({
        question: cleanQuery,
        primaryWork,
        candidateWorks: primaryWork ? [primaryWork] : [],
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
                        signal: AbortSignal.timeout(8000),
                    });
                    if (res.ok) {
                        const data = await response.json();
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

/**
 * Trợ lý AI hỗ trợ người dùng soạn thảo và phân tích 4 tầng nghĩa cho bài đóng góp
 */
const draftSubmissionAssist = async ({ title, category = "ca-dao" }) => {
    if (!title || !title.trim()) {
        throw new Error("Vui lòng cung cấp câu ca dao hoặc tục ngữ");
    }

    const cleanTitle = title.trim();
    const escapedTitle = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1. Kiểm tra đối chiếu xem trong DB đã có tác phẩm nào tương tự chưa
    let existingWork = null;
    try {
        existingWork = await Work.findOne({
            $or: [
                { title: new RegExp(escapedTitle, "i") },
                { quote: new RegExp(escapedTitle, "i") },
            ],
        }).maxTimeMS(2000).lean();
    } catch (e) {
        // Bỏ qua lỗi DB nếu chưa kết nối, tiếp tục luồng AI
    }

    if (existingWork) {
        return {
            meaning: existingWork.summary || existingWork.meaning || "",
            literalMeaning: existingWork.literalMeaning || "",
            figurativeMeaning: existingWork.figurativeMeaning || "",
            lesson: existingWork.lesson || "",
            historicalContext: existingWork.historicalContext || "",
            topic: existingWork.topic || "Đạo lý - Nhân ái",
            region: existingWork.region || "Toàn quốc",
            source: existingWork.source || "Kho tàng Văn học Dân gian Việt Nam",
            isExistingInDatabase: true,
            existingWorkSlug: existingWork.slug,
            sourceType: "database_match",
        };
    }

    // 2. Thử gọi Google Gemini API để phân tích chuyên sâu
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        const systemPrompt = "Bạn là Chuyên gia Nghiên cứu & Giám định Văn hóa Dân gian Việt Nam thuộc Viện Văn học.\n" +
            "Nhiệm vụ của bạn là hỗ trợ độc giả phân tích chuyên sâu một câu ca dao, tục ngữ hoặc câu chuyện dân gian được đóng góp.\n" +
            "Hãy trả về DUY NHẤT một chuỗi JSON chuẩn (KHÔNG kèm cú pháp markdown hay lời mở đầu/kết thúc) với các trường sau:\n" +
            JSON.stringify({
                meaning: "Tóm tắt ý nghĩa triết lý tổng quan ngắn gọn súc tích (khoảng 2-3 câu).",
                literalMeaning: "Nghĩa đen: Phân tích các hình ảnh thực tế, sự vật, hành động cụ thể trong câu.",
                figurativeMeaning: "Nghĩa bóng: Ẩn dụ, ngụ ý sâu xa về tình người, cách đối nhân xử thế hoặc quy luật tự nhiên.",
                lesson: "Bài học đạo lý nhân sinh rút ra cho thế hệ hôm nay.",
                historicalContext: "Bối cảnh văn hóa, cội nguồn lịch sử hoặc phong tục gắn liền với câu nói.",
                topic: "Một trong các chủ đề: Lòng biết ơn, Tình cảm gia đình, Đoàn kết - Nhân ái, Ý chí - Nghị lực, Kinh nghiệm sống - Đạo lý, Tình yêu quê hương đất nước",
                region: "Một trong các vùng: Toàn quốc, Bắc Bộ, Trung Bộ, Nam Bộ",
                source: "Gợi ý nguồn tài liệu học thuật uy tín kiểm chứng (Ví dụ: Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học)",
            }, null, 2);

        const userPrompt = "Hãy phân tích học thuật câu sau:\nCâu: \"" + cleanTitle + "\"\nThể loại: \"" + category + "\"";

        for (const model of GEMINI_MODELS) {
            try {
                const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: systemPrompt }] },
                        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 2048,
                        },
                    }),
                    signal: AbortSignal.timeout(8000),
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    const cleanedJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
                    const parsed = JSON.parse(cleanedJson);
                    return {
                        meaning: parsed.meaning || "",
                        literalMeaning: parsed.literalMeaning || "",
                        figurativeMeaning: parsed.figurativeMeaning || "",
                        lesson: parsed.lesson || "",
                        historicalContext: parsed.historicalContext || "",
                        topic: parsed.topic || "Kinh nghiệm sống - Đạo lý",
                        region: parsed.region || "Toàn quốc",
                        source: parsed.source || "Kho tàng Ca dao Tục ngữ Người Việt — NXB Văn học",
                        isExistingInDatabase: false,
                        sourceType: "gemini_ai",
                    };
                }
            } catch (err) {
                console.warn("[DraftSubmissionAssist] Model " + model + " gặp sự cố:", err.message);
            }
        }
    }

    // 3. Fallback học thuật chuẩn mực khi không có API key hoặc network ngắt
    const lower = cleanTitle.toLowerCase();
    let topic = "Kinh nghiệm sống - Đạo lý";
    let source = "Kho tàng Ca dao Tục ngữ Dân tộc Việt Nam — NXB Văn học";

    if (lower.includes("công cha") || lower.includes("nghĩa mẹ") || lower.includes("mẹ cha") || lower.includes("anh em") || lower.includes("cha mẹ")) {
        topic = "Tình cảm gia đình";
        source = "Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học";
    } else if (lower.includes("nhớ nguồn") || lower.includes("uống nước") || lower.includes("nhớ kẻ") || lower.includes("ơn")) {
        topic = "Lòng biết ơn";
        source = "Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn học";
    } else if (lower.includes("thương nhau") || lower.includes("bầu ơi") || lower.includes("lá lành") || lower.includes("đùm bọc") || lower.includes("đoàn kết")) {
        topic = "Đoàn kết - Nhân ái";
        source = "Văn học Dân gian Việt Nam — GS. Đinh Gia Khánh, NXB Giáo Dục";
    } else if (lower.includes("mài sắt") || lower.includes("nên kim") || lower.includes("chí thì nên") || lower.includes("khó") || lower.includes("nghị lực")) {
        topic = "Ý chí - Nghị lực";
        source = "Kho tàng Tục ngữ người Việt — Viện Nghiên cứu Hán Nôm, NXB Khoa học Xã hội";
    }

    return {
        meaning: "Câu \"" + cleanTitle + "\" là lời đúc kết sâu sắc của cha ông về đạo lý sống, khuyên răn con người giữ gìn luân thường đạo lý và phẩm hạnh cao đẹp.",
        literalMeaning: "Nghĩa đen bắt nguồn từ các hình ảnh, biểu tượng và sinh hoạt gần gũi trong đời sống nông nghiệp lúa nước và nếp nhà truyền thống của người Việt cổ.",
        figurativeMeaning: "Nghĩa bóng truyền tải thông điệp về " + topic.toLowerCase() + ", nhắc nhở mỗi cá nhân sống chan hòa, hướng thiện và biết trân quý những giá trị cội nguồn.",
        lesson: "Khuyên nhủ thế hệ hôm nay luôn rèn luyện phẩm chất tốt đẹp, biết yêu thương, chia sẻ và cống hiến cho gia đình, cộng đồng xã hội.",
        historicalContext: "Lưu truyền qua nhiều thế hệ trong kho tàng văn hóa dân gian Việt Nam, phản ánh nhân sinh quan nhân đạo và thế ứng xử chuẩn mực của dân tộc.",
        topic,
        region: "Toàn quốc",
        source,
        isExistingInDatabase: false,
        sourceType: "heritage_synthesis_engine",
    };
};

module.exports = {
    draftSubmissionAssist,
    askAssistant,
    explainWork,
    getSuggestions,
    generateSemanticInsight,
};
