const mongoose = require('mongoose');
const Work = require('../models/Work');
const { removeVietnameseTones, buildVietnameseRegex } = require('../utils/vietnamese.utils');
const {
    DEFAULT_SUGGESTIONS,
    GEMINI_MODELS,
    CURATED_CHARACTERS,
    CURATED_LOCATIONS,
    CURATED_TERMS,
    findCuratedCharacter,
    findCuratedLocation,
    findCuratedTerm,
    GREETING_PATTERNS,
    isConversationalGreeting,
    isOffTopicQuery,
} = require('../constants/aiKnowledge.constants');
/**
 * Gọi Google Gemini API với danh sách model hoạt động thực tế
 */
async function callGeminiApi({ question, contextText, history = [], customInstruction = null }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const systemInstruction = customInstruction || `Bạn là VietHeritage AI — Trợ lý nghiên cứu và đối thoại học thuật về Di sản Văn học & Văn hóa Dân gian Việt Nam.
Nhiệm vụ của bạn:
1. Trả lời câu hỏi một cách thông minh, chuẩn xác, tự nhiên, gần gũi, giàu chất nhân văn và truyền cảm. Luôn trả lời đầy đủ, trọn vẹn, không bao giờ ngắt quãng hay bỏ dở câu giữa chừng.
2. Hiểu và giải thích cặn kẽ mọi câu hỏi về:
   - Các nhân vật văn học, thần thoại, truyền thuyết, cổ tích (Mỵ Nương, Sơn Tinh, Thủy Tinh, Thạch Sanh, Thánh Gióng, Thúy Kiều, Kim Trọng, v.v.): Luôn giải thích rõ Đây là ai, Vai trò trong tác phẩm và Ý nghĩa biểu tượng văn hóa.
   - Các địa danh thực tế và bối cảnh lịch sử gắn liền với tác phẩm văn học.
   - Giải nghĩa các từ khó, từ Hán Việt, từ cổ, từ tượng hình tượng thanh, ca dao, tục ngữ và biện pháp nghệ thuật.
3. Luôn giữ phong thái uyên bác, trang nhã, chuẩn mực tiếng Việt có trích dẫn học thuật.
4. NGUYÊN TẮC GIỚI HẠN PHẠM VI (SCOPE GUARDRAIL - RẤT QUAN TRỌNG):
   - Bạn CHỈ hỗ trợ các câu hỏi liên quan đến: Di sản văn học, văn hóa dân gian, lịch sử, nhân vật, tác phẩm, ca dao, tục ngữ, nghệ thuật truyền thống Việt Nam.
   - Khi người dùng hỏi những câu hỏi HOÀN TOÀN KHÔNG LIÊN QUAN đến văn học/di sản (ví dụ: hỏi ăn uống đời thường như "hôm nay ăn gì", "trưa nay ăn gì", thời tiết, lập trình, toán học, y tế, mua sắm, giá vàng, chuyện phiếm đời thường...):
     + BẠN PHẢI LỊCH SỰ TỪ CHỐI trả lời một cách nhã nhặn, ngắn gọn.
     + TUYỆT ĐỐI KHÔNG gượng ép liên hệ, không "bẻ lái" câu hỏi đời thường sang các tác phẩm văn học nếu người dùng không hỏi về văn học.
     + Nhắc lại vai trò là Trợ lý Di sản Văn học và gợi ý người dùng các chủ đề văn học phù hợp.`;

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

HƯỚNG DẪN XỬ LÝ QUAN TRỌNG:
- Nếu câu hỏi của người dùng KHÔNG liên quan đến văn học hay di sản văn hóa Việt Nam (ví dụ hỏi sinh hoạt đời thường như "hôm nay ăn gì", thời tiết, công nghệ, toán...), hãy LỊCH SỰ TỪ CHỐI và hướng dẫn người dùng quay lại chủ đề di sản; TUYỆT ĐỐI KHÔNG gượng ép liên hệ với các tư liệu trên.
- Nếu câu hỏi phù hợp với chủ đề văn học/di sản, hãy phân tích và trả lời câu hỏi dựa trên sự am hiểu sâu sắc về văn học Việt Nam và kết hợp tư liệu kiểm chứng trên. Trình bày mạch lạc, đầy đủ, không cắt ngắn.`
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
                        temperature: 0.6,
                        maxOutputTokens: 4096,
                    },
                }),
                signal: AbortSignal.timeout(25000),
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
 * Phản hồi chính xác, trực diện đúng trọng tâm câu hỏi người dùng, có dẫn chứng học thuật kiểm chứng.
 */
function hasAnalyticalIntent(text) {
    if (!text) return false;
    const clean = removeVietnameseTones(text).toLowerCase();
    const keywords = [
        'tai sao', 'vi sao', 'y nghia', 'hinh tuong', 'bieu tuong', 'ly do', 'chi tiet',
        'khat vong', 'thong diep', 'bai hoc', 'sao lai', 'bay ve troi', 'tieng dan',
        'nieu com', 'ken re', 'hoa than', 'chiec bong', 'tuyen ngon',
        'tai sao lai', 'vi sao lai', 'co y nghia gi', 'the hien dieu gi', 'chung minh',
        'ran day', 'gia tri nhan dao', 'gia tri hien thuc', 'tinh than', 'phan tich',
        'di ban', 'bien the', 'so sanh', 'khac nhau'
    ];
    return keywords.some((kw) => clean.includes(kw));
}

function isAskingWho(text) {
    if (!text) return false;
    const clean = removeVietnameseTones(text).toLowerCase();
    if (hasAnalyticalIntent(text)) return false;
    const whoPatterns = [
        /\bla ai\b/,
        /\bai la\b/,
        /\bgioi thieu ve\b/,
        /\bcho biet ve\b/,
        /\bxuat than\b/,
        /\bdanh tinh\b/,
        /\btieu su\b/,
        /\bnhan vat nay la ai\b/,
    ];
    return whoPatterns.some((p) => p.test(clean));
}

function synthesizeHeritageAnswer({ question, primaryWork, candidateWorks }) {
    const works = primaryWork ? [primaryWork] : (candidateWorks || []);
    const qClean = removeVietnameseTones(question).toLowerCase();

    const matchedChar = findCuratedCharacter(question);
    const matchedLoc = findCuratedLocation(question);
    const matchedTerm = findCuratedTerm(question);

    const main = primaryWork || (works && works[0]) || (matchedChar ? {
        title: matchedChar.workTitle,
        slug: matchedChar.workSlug,
        categoryName: 'Di sản Văn học Dân gian',
        region: 'Việt Nam',
        source: matchedChar.source,
    } : null);

    const isAnalytical = hasAnalyticalIntent(question);
    const askingWho = isAskingWho(question);

    // =========================================================================
    // ƯU TIÊN 1: CÁC CÂU HỎI TRỌNG TÂM / PHÂN TÍCH CHỦ ĐỀ CỤ THỂ (THEMATIC FOCUS)
    // =========================================================================

    // 1. Thánh Gióng - Bay về trời / Không nhận bổng lộc
    if (
        (qClean.includes('thanh giong') || qClean.includes('phu dong') || (main && main.slug === 'thanh-giong')) &&
        (qClean.includes('bay ve troi') || qClean.includes('tai sao') || qClean.includes('vi sao') || qClean.includes('bong loc') || qClean.includes('coi ao giap') || qClean.includes('y nghia') || qClean.includes('roi sat') || qClean.includes('ngua sat'))
    ) {
        const answer = `Dựa trên nguồn tư liệu học thuật về truyền thuyết **"Thánh Gióng (Phù Đổng Thiên Vương)"** (Truyền thuyết Anh hùng Dân tộc, khu vực *Làng Gióng, Gia Lâm, Hà Nội*), VietHeritage AI xin giải đáp trực tiếp câu hỏi của bạn như sau:

### 1. Trực tiếp giải đáp: Vì sao Thánh Gióng bay về trời sau khi đánh giặc mà không nhận bổng lộc?
Hành động Thánh Gióng sau khi đánh tan giặc Ân đến chân núi Sóc Sơn bèn cởi bỏ giáp sắt, cưỡi ngựa bay thẳng lên trời mà không về triều bái kiến nhận thưởng mang hai tầng ý nghĩa triết lý sâu sắc:

- **Biểu tượng của người anh hùng xả thân vì nước vô tư, thuần khiết:**
  Thánh Gióng sinh ra từ nhân dân, lớn lên bằng những hạt gạo và manh áo do bà con lối xóm gom góp nuôi dưỡng. Khi Tổ quốc lâm nguy, người tráng sĩ vươn vai đứng dậy đánh tan quân xâm lược; giặc tan rồi, chàng thanh thản bay về trời, tuyệt nhiên không màng danh lợi, chức tước hay bổng lộc vua ban. Đó là đỉnh cao của phẩm chất vì nước quên thân, cống hiến trọn vẹn mà không đòi hỏi bất kỳ sự đền đáp nào.

- **Khát vọng bất tử hóa người anh hùng trong tâm thức dân tộc:**
  Nhân dân không muốn người anh hùng cứu nước phải chịu cảnh già nua, bệnh tật hay những vướng bận danh lợi của cõi trần. Hành động cởi áo giáp bay về trời đã nâng Gióng từ một người anh hùng phàm trần thành một vị Thần bất tử (**Phù Đổng Thiên Vương** — đứng đầu hàng *Tứ Bất Tử* linh thiêng trong tín ngưỡng dân gian Việt Nam), sống mãi cùng non sông đất nước.

### 2. Giá trị biểu tượng nghệ thuật & Dấu tích lịch sử:
- **Dấu tích địa lý hóa huyền thoại:** Vết chân ngựa sắt để lại những ao hồ liên tiếp quanh vùng Sóc Sơn, Gia Lâm; những bụi tre đằng ngà ngả màu vàng óng do lửa ngựa thiêu đốt... là cách nhân dân biến lịch sử thành huyền thoại để truyền đời niềm tự hào bảo vệ giang sơn.
- **Lời răn dạy muôn đời:** Sự nghiệp giữ nước là của toàn dân, và người vì nghĩa lớn phải luôn giữ tâm sáng, không để danh lợi làm hoen ố tấm lòng phụng sự Tổ quốc.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Kho tàng Truyền thuyết Dân gian Việt Nam & Lĩnh Nam Chích Quái.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Thánh Gióng (Phù Đổng Thiên Vương)',
                    slug: 'thanh-giong',
                    category: 'truyen-thuyet',
                    categoryName: 'Truyền thuyết Dân gian',
                    region: 'Đồng bằng Bắc Bộ',
                    source: 'Kho tàng Truyền thuyết Dân gian Việt Nam & Lĩnh Nam Chích Quái',
                },
            ],
            suggestedQuestions: [
                'Hình tượng Thánh Gióng vươn vai nghìn trượng mang ý nghĩa gì?',
                'Tại sao nhân dân lại gom góp cơm áo để nuôi Thánh Gióng lớn?',
                'Tín ngưỡng Tứ Bất Tử của người Việt bao gồm những vị thần nào?',
            ],
        };
    }

    // 2. Thạch Sanh - Tiếng đàn thần & Niêu cơm thần
    if (
        (qClean.includes('thach sanh') || qClean.includes('ly thong') || (main && main.slug === 'thach-sanh')) &&
        (qClean.includes('tieng dan') || qClean.includes('nieu com') || qClean.includes('y nghia') || qClean.includes('chan tinh') || qClean.includes('dai bang'))
    ) {
        const answer = `Dựa trên nguồn tư liệu học thuật về truyện cổ tích **"Thạch Sanh"** (Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi), VietHeritage AI xin giải đáp trực tiếp ý nghĩa của hai hình tượng nghệ thuật độc đáo này:

### 1. Ý nghĩa biểu tượng "Tiếng đàn thần":
- **Tiếng nói của công lý & sự thật:** Tiếng đàn cất lên từ ngục tối đã vượt qua mọi bức tường ngăn cách để thấu đến tai công chúa, giải tỏa nỗi oan khiên ngút trời của Thạch Sanh và vạch trần bộ mặt bội bạc, xảo trá của mẹ con Lý Thông. Tiếng đàn đại diện cho lẽ phải không bao giờ bị dập tắt.
- **Vũ khí cảm hóa hòa bình nhân đạo:** Khi 18 nước chư hầu đem quân vây hãm biên cương, Thạch Sanh không dùng đao kiếm mà mang đàn ra gảy. Tiếng đàn kỳ diệu làm mềm lòng binh sĩ, khơi dậy nỗi nhớ quê hương, cha mẹ, vợ con khiến quân giặc "bủn rủn tay chân, không đánh mà tan". Đây là đỉnh cao tư tưởng chuộng hòa bình, lấy nhân nghĩa để thu phục lòng người của dân tộc Việt Nam.

### 2. Ý nghĩa biểu tượng "Niêu cơm thần":
- **Lòng nhân ái bao la & Tiềm lực dồi dào:** Niêu cơm nhỏ xíu nhưng ăn mãi không vơi tượng trưng cho tiềm lực vô tận, đức tính hiếu khách và lòng vị tha cao thượng của nhân dân ta đối với kẻ bại trận.
- **Chiến thắng bằng tinh thần hòa hiếu:** Đánh thắng giặc không bằng sự hủy diệt, mà bằng sự chu cấp sinh dưỡng, mở ra con đường giao hảo dài lâu giữa các quốc gia láng giềng.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Thạch Sanh',
                    slug: 'thach-sanh',
                    category: 'truyen-co-tich',
                    categoryName: 'Truyện cổ tích Thần kỳ',
                    region: 'Đồng bằng Bắc Bộ',
                    source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi',
                },
            ],
            suggestedQuestions: [
                'Xung đột giữa Thạch Sanh và Lý Thông thể hiện quy luật nhân quả gì?',
                'Tại sao Thạch Sanh sống dưới gốc đa lại là hình tượng đại diện cho nhân dân lao động?',
                'Các chi tiết diệt Chằn tinh và bắn Đại bàng mang ý nghĩa gì?',
            ],
        };
    }

    // 3. Sơn Tinh - Thủy Tinh - Khát vọng trị thủy
    if (
        (qClean.includes('son tinh') || qClean.includes('thuy tinh') || (main && main.slug === 'son-tinh-thuy-tinh')) &&
        (qClean.includes('khat vong') || qClean.includes('tai sao') || qClean.includes('vi sao') || qClean.includes('danh nhau') || qClean.includes('tri thuy') || qClean.includes('y nghia') || qClean.includes('ken re'))
    ) {
        const answer = `Dựa trên nguồn tư liệu học thuật về thần thoại **"Sơn Tinh - Thủy Tinh"** (Kho tàng Thần thoại Việt Nam & Lĩnh Nam Chích Quái), VietHeritage AI xin giải đáp trực tiếp câu hỏi của bạn:

### 1. Bản chất cuộc xung đột & Khát vọng trị thủy của tổ tiên:
- **Hiện thực hóa thiên tai lũ lụt:** Cuộc đại chiến giữa Sơn Tinh và Thủy Tinh phản ánh hiện tượng bão lũ thiên nhiên diễn ra định kỳ hàng năm ở lưu vực đồng bằng sông Hồng thời kỳ tiền sử dựng nước Văn Lang.
- **Khát vọng quật cường chế ngự thiên nhiên:** Sơn Tinh dời từng quả đồi, bốc từng dãy núi, đắp thành lũy ngăn dòng nước lũ (*"Nước dâng lên bao nhiêu, núi cao lên bấy nhiêu"*). Hình tượng này tôn vinh ý chí sắt đá, sức mạnh đại đoàn kết đắp đê ngăn lũ và chinh phục tự nhiên của người Việt cổ.

### 2. Ý nghĩa nhân văn & Phong tục cội nguồn:
- **Tôn vinh vị thần bảo hộ:** Tản Viên Sơn Thánh (Sơn Tinh) được suy tôn là Đệ nhất Phúc thần trong hàng Tứ Bất Tử, vị thần tối cao che chở cho mùa màng và đời sống bình yên của cư dân nông nghiệp lúa nước.
- **Phong tục kén rể thời Hùng Vương:** Sính lễ "voi chín ngà, gà chín cựa, ngựa chín hồng mao" là những sản vật độc đáo trên đất liền, thể hiện sự anh minh của Vua Hùng khi ngầm ưu ái vị thần bảo vệ đất mẹ và giang sơn.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Kho tàng Thần thoại Dân gian Việt Nam & Lĩnh Nam Chích Quái.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Sơn Tinh - Thủy Tinh',
                    slug: 'son-tinh-thuy-tinh',
                    category: 'than-thoai',
                    categoryName: 'Thần thoại Dân gian',
                    region: 'Vùng Đất Tổ Phú Thọ & Ba Vì',
                    source: 'Lĩnh Nam Chích Quái & Kho tàng Thần thoại Việt Nam',
                },
            ],
            suggestedQuestions: [
                'Ý nghĩa hình ảnh công chúa Mỵ Nương trong tác phẩm?',
                'Tại sao Tản Viên Sơn Thánh lại đứng đầu trong Tứ Bất Tử?',
                'Phong tục thách cưới thời Hùng Vương phản ánh nét văn hóa gì?',
            ],
        };
    }

    // 4. Nam quốc sơn hà - Tuyên ngôn độc lập đầu tiên
    if (
        (qClean.includes('nam quoc son ha') || qClean.includes('ly thuong kiet') || (main && main.slug === 'nam-quoc-son-ha')) &&
        (qClean.includes('tuyen ngon') || qClean.includes('doc lap') || qClean.includes('vi sao') || qClean.includes('tai sao') || qClean.includes('y nghia'))
    ) {
        const answer = `Dựa trên nguồn tư liệu học thuật về bài thơ thần **"Nam quốc sơn hà"** (Đại Việt Sử Ký Toàn Thư & Lịch sử Văn học Việt Nam), VietHeritage AI xin giải đáp vì sao tác phẩm được coi là bản Tuyên ngôn Độc lập đầu tiên của nước ta:

### 1. Vì sao Nam quốc sơn hà là bản Tuyên ngôn Độc lập đầu tiên?
Bài thơ vang lên bên phòng tuyến sông Như Nguyệt (năm 1077) như một lời hịch non sông, mang đầy đủ giá trị pháp lý, đạo lý và lịch sử của một bản Tuyên ngôn Độc lập:

- **Khẳng định chủ quyền lãnh thổ bất khả xâm phạm:**
  *"Nam quốc sơn hà Nam đế cư"* — Sông núi nước Nam thì vua nước Nam ở. Dùng từ "Đế" (ngang hàng với Hoàng đế phương Bắc) thay vì "Vương" là sự khẳng định đanh thép về tư thế độc lập, tự chủ và bình đẳng của một quốc gia có chủ quyền.
- **Khẳng định lẽ phải chính nghĩa và quy luật tự nhiên:**
  *"Tiệt nhiên định phận tại thiên thư"* — Ranh giới bờ cõi đã được phân định rành rành ở sách trời, là chân lý lịch sử không ai có quyền đảo ngược hay chối bỏ.
- **Ý chí quật cường & Cảnh cáo đanh thép kẻ xâm lược:**
  *"Như hà nghịch lỗ lai xâm phạm / Nhữ đẳng hành khan thủ bại hư"* — Kẻ nào đi ngược lại đạo trời và lẽ phải xâm phạm đất nước này, ắt sẽ chuốc lấy thất bại thảm hại tan tành.

### 2. Giá trị biểu tượng & Tầm vóc thời đại:
Bài thơ là vũ khí tư tưởng sắc bén, vừa cổ vũ tinh thần quyết chiến quyết thắng của quân dân nhà Lý, vừa đặt nền móng tư tưởng độc lập tự cường cho suốt chiều dài lịch sử dựng nước và giữ nước.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Đại Việt Sử Ký Toàn Thư & Viện Nghiên cứu Hán Nôm.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Nam quốc sơn hà',
                    slug: 'nam-quoc-son-ha',
                    category: 'van-hoc-trung-dai',
                    categoryName: 'Văn học Trung đại',
                    region: 'Sông Như Nguyệt (Bắc Ninh)',
                    source: 'Đại Việt Sử Ký Toàn Thư & Viện Nghiên cứu Hán Nôm',
                },
            ],
            suggestedQuestions: [
                'Bối cảnh lịch sử ra đời bài thơ Nam quốc sơn hà bên sông Như Nguyệt?',
                'Tại sao việc xưng "Đế" thay vì xưng "Vương" lại mang ý nghĩa bước ngoặt?',
                'So sánh cảm hứng độc lập giữa Nam quốc sơn hà và Bình Ngô đại cáo?',
            ],
        };
    }

    // 5. Ca dao về Chữ Hiếu & Công ơn cha mẹ
    if (
        (qClean.includes('ca dao') || qClean.includes('tuc ngu') || (main && main.slug === 'ca-dao-dong-bang-bac-bo')) &&
        (qClean.includes('chu hieu') || qClean.includes('hieu') || qClean.includes('cha me') || qClean.includes('on nghia') || qClean.includes('thai son') || qClean.includes('trong nguon'))
    ) {
        const answer = `Dựa trên nguồn tư liệu học thuật về **Ca dao - Tục ngữ Việt Nam**, VietHeritage AI xin giải đáp sâu sắc về đạo lý chữ Hiếu và ơn nghĩa cha mẹ trong văn hóa truyền thống:

### 1. Những câu ca dao răn dạy sâu sắc nhất về chữ Hiếu:
1. **Bài học cội nguồn bất hủ:**
   > *"Công cha như núi Thái Sơn,*
   > *Nghĩa mẹ như nước trong nguồn chảy ra.*
   > *Một lòng thờ mẹ kính cha,*
   > *Cho tròn chữ hiếu mới là đạo con."*
   - Hình ảnh so sánh kỳ vĩ lấy thiên nhiên bao la (núi Thái Sơn sừng sững, dòng suối nguồn vô tận) để khắc họa công lao trời biển của đấng sinh thành — công cha vững chãi định hướng, tình mẹ bao la vỗ về.

2. **Khắc họa nỗi nhọc nhằn hy sinh:**
   > *"Nuôi con buôn bán tảo tần,*
   > *Chỉ mong con lớn nên thân với đời.*
   > *Những khi trái nắng trở trời,*
   > *Mẹ con thức trọn nghìn lời âu lo."*

3. **Lời nguyện cầu hiếu thảo:**
   > *"Đêm đêm thắp ngọn đèn trời,*
   > *Cầu cho cha mẹ sống đời với con."*

### 2. Ý nghĩa nhân văn & Triết lý sống của người Việt:
- Trong văn hóa truyền thống Việt Nam, **chữ Hiếu đứng đầu trăm nết thiện** (*Bách hạnh hiếu vi tiên*). Chữ Hiếu không dừng lại ở sự phụng dưỡng vật chất mà là lòng biết ơn sâu nặng, sự thấu hiểu đức hy sinh và gìn giữ gia phong, nề nếp gia đình qua muôn thế hệ.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Kho tàng Ca dao Tục ngữ Người Việt — Viện Văn học.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Ca dao Đồng bằng Bắc Bộ',
                    slug: 'ca-dao-dong-bang-bac-bo',
                    category: 'ca-dao-tuc-ngu',
                    categoryName: 'Ca dao - Dân ca',
                    region: 'Đồng bằng Bắc Bộ',
                    source: 'Kho tàng Ca dao Tục ngữ Người Việt — Viện Văn học',
                },
            ],
            suggestedQuestions: [
                'Tại sao người xưa lại so sánh công cha với núi Thái Sơn và nghĩa mẹ với nước trong nguồn?',
                'Những câu ca dao nào răn dạy về tình nghĩa vợ chồng thủy chung?',
                'Hình tượng con cò trong ca dao phản ánh số phận người phụ nữ ra sao?',
            ],
        };
    }

    // 6. Lang Liêu - Bánh chưng bánh giầy
    if (qClean.includes('banh chung') || qClean.includes('banh giay') || qClean.includes('lang lieu')) {
        const answer = `Dựa trên truyền thuyết **"Sự tích Bánh chưng bánh giầy"** (Truyền thuyết Hùng Vương & Lĩnh Nam Chích Quái), VietHeritage AI xin giải đáp ý nghĩa hình tượng:

### 1. Ý nghĩa biểu tượng Bánh chưng - Bánh giầy:
- **Triết lý Trời - Đất & Vũ trụ quan sơ khai:** Bánh giầy tròn tượng trưng cho Trời, bánh chưng vuông tượng trưng cho Đất (*"Trời tròn Đất vuông"*). Sự kết hợp giữa hai loại bánh thể hiện sự hòa hợp âm dương, càn khôn giao hòa sinh sôi nảy nở.
- **Tôn vinh hạt gạo & Nền văn minh lúa nước:** Hạt gạo là "hạt ngọc trời", nuôi sống con người từ bao đời. Lựa chọn bánh làm từ gạo nếp bình dị mà thiêng liêng thể hiện sự tôn vinh mồ hôi công sức lao động của người nông dân.

### 2. Bài học hiếu thảo & Lựa chọn người hiền tài:
- Chàng hoàng tử nghèo khó Lang Liêu được thần linh chỉ dẫn và vua cha truyền ngôi là lời khẳng định chân lý: Người trị vì đất nước phải thấu hiểu nỗi vất vả của dân nghèo và biết quý trọng cội nguồn văn hóa nông nghiệp.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Truyền thuyết Hùng Vương & Lĩnh Nam Chích Quái.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Sự tích Bánh chưng bánh giầy',
                    slug: 'banh-chung-banh-giay',
                    category: 'truyen-thuyet',
                    categoryName: 'Truyền thuyết Hùng Vương',
                    region: 'Đất Tổ Phú Thọ',
                    source: 'Lĩnh Nam Chích Quái & Truyền thuyết Hùng Vương',
                },
            ],
            suggestedQuestions: [
                'Tại sao Lang Liêu là hoàng tử nghèo khó nhất nhưng lại được nối ngôi?',
                'Ý nghĩa phong tục làm bánh chưng ngày Tết của người Việt ngày nay?',
            ],
        };
    }

    // 7. Tấm Cám - Quá trình hóa thân của cô Tấm
    if ((qClean.includes('tam cam') || qClean.includes('co tam')) && (qClean.includes('hoa than') || qClean.includes('vang anh') || qClean.includes('xoan dao') || qClean.includes('khung cui') || qClean.includes('qua thi') || qClean.includes('tai sao') || qClean.includes('y nghia'))) {
        const answer = `Dựa trên truyện cổ tích **"Tấm Cám"** (Kho tàng Truyện cổ tích Việt Nam), VietHeritage AI xin giải đáp ý nghĩa quá trình hóa thân liên tục của cô Tấm:

### 1. Vì sao cô Tấm phải trải qua 4 lần hóa thân?
Bốn lần hóa thân (chim Vàng Anh -> cây Xoan đào -> khung cửi -> quả thị) mang ý nghĩa bước ngoặt trong tư tưởng dân gian:
- **Sức sống bất diệt của cái Thiện:** Cái Thiện có thể bị vùi dập, hãm hại tàn nhẫn nhưng không bao giờ bị tiêu diệt. Tấm chết đi nhưng hồn nàng vẫn hóa thân bền bỉ vào những vật dụng bình dị, gắn bó mật thiết với cuộc sống.
- **Sự chuyển biến từ thụ động sang chủ động đấu tranh:** Ở nửa đầu truyện, Tấm luôn khóc và chờ đợi Bụt giúp đỡ. Nhưng ở nửa sau, nàng chủ động cất lên tiếng nói cảnh cáo kẻ ác (*"Phơi áo chồng tao, phơi lao phơi sào, chớ phơi bờ rào, rách áo chồng tao"*; *"Kẽo cà kẽo kẹt, lấy tranh chồng chị, chị khoét mắt ra"*). Đó là cuộc đấu tranh quyết liệt không khoan nhượng để giành lại quyền sống và hạnh phúc chính đáng.

### 2. Ý nghĩa quả thị & Đỉnh cao công lý dân gian:
- Tấm bước ra từ quả thị thơm ngát là sự tái sinh hoàn mỹ nhất — trở về hình hài con người đẹp đẽ, hiền thục qua quả thị được bà lão nghèo chăm chút nâng niu. Đó là sự đúc kết niềm tin bất biến: *"Ở hiền gặp lành, ác giả ác báo"*.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Tấm Cám',
                    slug: 'tam-cam',
                    category: 'truyen-co-tich',
                    categoryName: 'Truyện cổ tích Dân gian',
                    region: 'Đồng bằng Bắc Bộ',
                    source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi',
                },
            ],
            suggestedQuestions: [
                'Ý nghĩa hình ảnh quả thị và bà lão bán nước trong đoạn kết?',
                'Quy luật nhân quả được thể hiện như thế nào trong truyện Tấm Cám?',
            ],
        };
    }

    // 8. Hồn Trương Ba, da hàng thịt
    if (qClean.includes('truong ba') || qClean.includes('hang thit')) {
        const answer = `Dựa trên kiệt tác kịch **"Hồn Trương Ba, da hàng thịt"** của tác giả Lưu Quang Vũ, VietHeritage AI xin giải đáp xung đột triết lý sâu sắc:

### 1. Vì sao Trương Ba quyết định trả lại thân xác và chấp nhận cái chết?
- **Bi kịch "bên trong một đằng, bên ngoài một nẻo":** Trương Ba — một tâm hồn thanh cao, nhân hậu, yêu cờ — phải trú ngụ trong thân xác thô lỗ, phàm phu của anh hàng thịt. Sự khập khiễng ấy khiến ông dần bị tha hóa bởi những đòi hỏi bản năng của thể xác, làm tổn thương sâu sắc những người thân yêu nhất (vợ, con dâu, cháu gái).
- **Khát vọng sống toàn vẹn là chính mình:** Lời thoại bất hủ của Trương Ba: *"Không thể bên trong một đằng, bên ngoài một nẻo được. Tôi muốn được là tôi toàn vẹn"*. Ông chấp nhận cái chết thể xác để linh hồn mình mãi mãi giữ được sự trong sạch, thanh cao trong ký ức của gia đình và người đời.

### 2. Thông điệp triết học thời đại:
- Cuộc sống chỉ thực sự có ý nghĩa khi con người được sống chân thật với chính mình, có sự thống nhất hài hòa giữa linh hồn và thể xác, giữa tư tưởng cao đẹp và hành động thực tế.

---
*Nguồn tham khảo học thuật kiểm chứng:* **Kịch bản Văn học Việt Nam Hiện đại — Lưu Quang Vũ.**`;

        return {
            answer,
            citations: [
                {
                    title: 'Hồn Trương Ba, da hàng thịt',
                    slug: 'hon-truong-ba-da-hang-thit',
                    category: 'kich-ban-van-hoc',
                    categoryName: 'Kịch bản Văn học Hiện đại',
                    region: 'Hà Nội',
                    source: 'Kịch bản Văn học Việt Nam Hiện đại — Lưu Quang Vũ',
                },
            ],
            suggestedQuestions: [
                'Ý nghĩa cuộc đối thoại giữa Hồn Trương Ba và Xác hàng thịt?',
                'Thông điệp về sự sống đích thực mà Lưu Quang Vũ gửi gắm qua vở kịch?',
            ],
        };
    }

    // =========================================================================
    // ƯU TIÊN 1.X: HỎI VỀ DỊ BẢN DÂN GIAN & SO SÁNH ĐỐI CHIẾU (FOLKLORIC VARIANTS & COMPARISON)
    // =========================================================================
    const isAskingVariants = qClean.includes('di ban') || qClean.includes('bien the') || qClean.includes('so sanh') || qClean.includes('khac nhau');
    const targetVariantWork = primaryWork || (works && works.find(w => w.variants && w.variants.length > 0));

    if (isAskingVariants && targetVariantWork && targetVariantWork.variants && targetVariantWork.variants.length > 0) {
        const variantsList = targetVariantWork.variants;
        const answer = `Dựa trên nghiên cứu học thuật của Viện Văn học và các công trình của GS. Vũ Ngọc Phan, GS. Đinh Gia Khánh, GS. Nguyễn Đổng Chi, tác phẩm dân gian **"${targetVariantWork.title}"** tồn tại **${variantsList.length} dị bản/biến thể chính thức** phản ánh quy luật truyền miệng và tính địa văn hóa:

### 1. Khảo sát các Dị bản Dân gian:
${variantsList.map((v, i) => `#### Dị bản ${i + 1}: ${v.name} (${v.region})
- **Văn bản / Câu ca:** "${v.quote || v.content}"
- **Điểm khác biệt cốt lõi:** ${v.differenceNote}
- **Góc nhìn học thuật & nhân học:** ${v.scholarlyAnalysis}
- **Tài liệu kiểm chứng:** ${v.source}`).join('\n\n')}

### 2. Tổng kết Giá trị So sánh Đối chiếu:
Hiện tượng dị bản chứng minh rằng tác phẩm dân gian không phải là một "văn bản đóng" bất biến, mà liên tục được tái sáng tạo trong quá trình diễn xướng để phù hợp với tâm thức, nếp sống và cảnh quan sinh thái của từng vùng miền và cộng đồng tộc người.

---
*Nguồn tham khảo học thuật kiểm chứng:* **${targetVariantWork.source || 'Kho tàng Văn học Dân gian Việt Nam'}**`;

        return {
            answer,
            citations: [
                {
                    title: targetVariantWork.title,
                    slug: targetVariantWork.slug,
                    category: targetVariantWork.category,
                    categoryName: targetVariantWork.categoryName || 'Văn học Dân gian',
                    region: targetVariantWork.region,
                    author: targetVariantWork.author || 'Dân gian',
                    source: targetVariantWork.source,
                },
            ],
            suggestedQuestions: [
                `Ý nghĩa của việc so sánh dị bản trong nghiên cứu văn học dân gian?`,
                `Tác phẩm ${targetVariantWork.title} phản ánh bối cảnh lịch sử nào?`,
                `Bài học đạo lý nhân sinh của ${targetVariantWork.title}?`,
            ],
        };
    }

    // =========================================================================
    // ƯU TIÊN 2: NẾU NGƯỜI DÙNG HỎI TRA CỨU DANH TÍNH / THỰC THỂ (ENTITY LOOKUP)
    // =========================================================================

    // 2.A. Tra cứu nhân vật (khi câu hỏi là "ai là", "là ai", "giới thiệu" hoặc tra cứu ngắn gọn tên nhân vật)
    if (matchedChar && (!isAnalytical || askingWho || qClean.length < 28)) {
        const targetWork = primaryWork || (works && works[0]) || {
            title: matchedChar.workTitle,
            categoryName: 'Di sản Văn học Dân gian',
            region: 'Việt Nam',
            source: matchedChar.source,
        };

        const answer = `Dựa trên nguồn tư liệu học thuật về tác phẩm **"${targetWork.title}"** (${targetWork.categoryName || 'Di sản văn học'}, khu vực *${targetWork.region || 'Việt Nam'}*), VietHeritage AI xin giải đáp về nhân vật **"${matchedChar.name}"** như sau:

### 1. Nhân vật này là ai? (Xuất thân & Danh tính):
${matchedChar.identity}

### 2. Vai trò của nhân vật trong tác phẩm "${targetWork.title}":
${matchedChar.role}

### 3. Ý nghĩa biểu tượng & Giá trị văn hóa:
${matchedChar.symbolicMeaning}

---
*Nguồn tham khảo học thuật kiểm chứng:* **${matchedChar.source || targetWork.source || 'Kho tàng Di sản Văn học Việt Nam'}**`;

        return {
            answer,
            citations: [
                {
                    title: targetWork.title,
                    slug: targetWork.slug || matchedChar.workSlug,
                    category: targetWork.category || 'van-hoc',
                    categoryName: targetWork.categoryName || 'Di sản văn học',
                    region: targetWork.region,
                    author: targetWork.author || 'Dân gian',
                    source: matchedChar.source || targetWork.source,
                },
            ],
            suggestedQuestions: [
                `Vai trò của nhân vật ${matchedChar.name} đối với chủ đề tác phẩm?`,
                `Bối cảnh lịch sử của tác phẩm ${targetWork.title} là gì?`,
                `Hình tượng ${matchedChar.name} gửi gắm thông điệp gì cho thế hệ trẻ?`,
            ],
        };
    }

    // 2.B. Tra cứu địa danh thực tế (khi câu hỏi hỏi về địa danh, vị trí)
    if (matchedLoc && (!isAnalytical || qClean.includes('o dau') || qClean.includes('dia danh') || qClean.includes('vi tri'))) {
        const targetWork = primaryWork || (works && works[0]) || {
            title: 'Di sản Văn học',
            categoryName: 'Địa chí Văn học',
            region: 'Việt Nam',
            source: matchedLoc.source,
        };

        const answer = `Dựa trên nguồn tư liệu học thuật về tác phẩm **"${targetWork.title}"**, VietHeritage AI xin giải đáp chi tiết về địa danh **"${matchedLoc.title}"** như sau:

### 1. Vị trí địa lý thực tế:
${matchedLoc.realLocation}

### 2. Bối cảnh lịch sử thực tế:
${matchedLoc.historicalContext}

### 3. Ý nghĩa không gian trong tác phẩm "${targetWork.title}":
${matchedLoc.literaryRole}

---
*Nguồn tham khảo học thuật kiểm chứng:* **${matchedLoc.source || 'Địa chí Văn học & Lịch sử Việt Nam'}**`;

        return {
            answer,
            citations: [
                {
                    title: targetWork.title,
                    slug: targetWork.slug || matchedLoc.workSlug,
                    category: targetWork.category || 'dia-danh',
                    categoryName: targetWork.categoryName || 'Địa chí Văn học',
                    region: targetWork.region,
                    source: matchedLoc.source,
                },
            ],
            suggestedQuestions: [
                `Địa danh ${matchedLoc.title} nằm ở đâu trên bản đồ ngày nay?`,
                `Bối cảnh lịch sử gắn liền với địa danh ${matchedLoc.title}?`,
                `Ý nghĩa không gian nghệ thuật của tác phẩm ${targetWork.title}?`,
            ],
        };
    }

    // 2.C. Tra cứu từ ngữ khó / Điển tích
    if (matchedTerm) {
        const targetWork = primaryWork || (works && works[0]) || {
            title: 'Văn học Việt Nam',
            source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam',
        };

        const answer = `Dựa trên ngữ liệu học thuật, VietHeritage AI xin giải nghĩa chi tiết về từ ngữ: **"${matchedTerm.term}"** như sau:

### 1. Giải nghĩa từ vựng (Nghĩa từ điển / Hán Việt / Từ cổ):
${matchedTerm.definition}

### 2. Ý nghĩa trong ngữ cảnh tác phẩm "${targetWork.title}":
${matchedTerm.contextualMeaning}

### 3. Giá trị biểu đạt & Cách hiểu chuẩn xác:
${matchedTerm.expressiveValue}

---
*Nguồn tham khảo học thuật kiểm chứng:* **Từ điển Tiếng Việt & Kho tàng Văn học Dân gian Việt Nam**`;

        return {
            answer,
            citations: [
                {
                    title: targetWork.title,
                    slug: targetWork.slug,
                    category: targetWork.category,
                    source: 'Từ điển Tiếng Việt & Kho tàng Văn học Dân gian Việt Nam',
                },
            ],
            suggestedQuestions: [
                `Tại sao tác giả lại sử dụng từ ngữ "${matchedTerm.term}"?`,
                `Ý nghĩa chủ đề lớn của tác phẩm ${targetWork.title}?`,
            ],
        };
    }

    // =========================================================================
    // ƯU TIÊN 3: PHÂN TÍCH TỔNG QUAN THEO TÁC PHẨM TRONG HỆ THỐNG
    // =========================================================================
    if (!main) {
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

    let specificAnalysis = '';
    if (main.variants && main.variants.length > 0 && (qClean.includes('di ban') || qClean.includes('bien the') || qClean.includes('so sanh') || qClean.includes('khac nhau') || qClean.includes('vung mien') || qClean.includes('mien nam') || qClean.includes('mien bac') || qClean.includes('muong'))) {
        specificAnalysis = `
### 1. Khảo sát Quy luật Dị bản trong Văn học Dân gian:
Do phương thức truyền miệng và sự giao lưu văn hóa liên vùng, tác phẩm **"${main.title}"** tồn tại **${main.variants.length} dị bản/biến thể chính thức** được các nhà nghiên cứu dân gian học ghi nhận:

${main.variants.map((v, i) => `#### Dị bản ${i + 1}: ${v.name} (${v.region})
- **Văn bản / Câu ca:** "${v.quote || v.content}"
- **Điểm khác biệt:** ${v.differenceNote}
- **Góc nhìn học thuật & nhân học:** ${v.scholarlyAnalysis}
- **Nguồn kiểm chứng:** ${v.source}`).join('\n\n')}

### 2. Ý nghĩa Học thuật & Địa văn hóa:
Sự xuất hiện của các dị bản minh chứng cho tính sinh động của văn học truyền miệng và quá trình "bản địa hóa" sâu sắc của văn hóa dân gian Việt Nam theo từng không gian sinh tồn.`;
    } else if (main.author && (qClean.includes('la ai') || qClean.includes('ai la') || qClean.includes('tac gia') || qClean.includes('nguyen du') || qClean.includes('nguyen trai'))) {
        specificAnalysis = `
### 1. Giới thiệu về tác giả ${main.author}:
- **Vị thế văn học:** Là một trong những đại diện tiêu biểu nhất của nền văn học Việt Nam, gắn liền với tác phẩm **"${main.title}"** (${main.categoryName || 'Di sản văn học'}).
- **Thời kỳ & Địa bàn:** ${main.period || 'Dân gian'} — gắn liền với vùng đất *${main.region || 'Việt Nam'}*.
- **Tầm vóc:** Đóng góp to lớn vào việc bảo tồn, phát triển tiếng Việt và khẳng định bản sắc văn hóa dân tộc.

### 2. Tác phẩm gắn liền tên tuổi:
- ${main.summary || 'Tác phẩm kết tinh trí tuệ và tình cảm nhân dân.'}
${main.quote ? `\n> *"${main.quote}"*` : ''}

### 3. Ý nghĩa chủ đề & Bài học nhân đạo:
- ${main.thematicMeaning || 'Đề cao giá trị nhân bản, tiếng nói công lý và lòng trắc ẩn sâu sắc trước số phận con người.'}`;
    } else {
        specificAnalysis = `
### 1. Bối cảnh lịch sử & Hoàn cảnh ra đời:
${main.historicalContext || main.summary || 'Tác phẩm gắn liền với cội nguồn văn hóa và lịch sử dựng nước của dân tộc Việt Nam.'}

- **Ý nghĩa chủ đề:** ${main.thematicMeaning || 'Gửi gắm ước mơ của nhân dân về công lý, hòa bình và đạo nghĩa làm người.'}
${main.quote ? `\n> *"${main.quote}"*` : ''}`;
    }

    const authorHeader = main.author && main.author !== 'Dân gian' ? ` — Tác giả: **${main.author}**` : '';
    const answer = `Dựa trên nguồn tư liệu học thuật về tác phẩm **"${main.title}"** (${main.categoryName || 'Di sản văn học'}${authorHeader}, khu vực *${main.region || 'Việt Nam'}*), VietHeritage AI xin giải đáp như sau:

${specificAnalysis}

---
*Nguồn tham khảo học thuật kiểm chứng:* **${main.source || 'Kho tàng Di sản Văn học Việt Nam'}**`;

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
        `Những chi tiết biểu tượng trong ${main.title} có ý nghĩa gì?`,
        main.variants && main.variants.length > 0
            ? `Tác phẩm ${main.title} có những dị bản địa phương hoặc dân tộc nào?`
            : `Tác phẩm ${main.title} gửi gắm thông điệp gì cho thế hệ trẻ ngày nay?`,
    ];

    return {
        answer,
        citations,
        suggestedQuestions,
    };
}




/**
 * Service chính: Trả lời câu hỏi thông minh linh hoạt, đúng trọng tâm
 */
const askAssistant = async ({ question, contextSlug = null, history = [] }) => {
    if (!question || typeof question !== 'string' || question.trim() === '') {
        throw new Error('Vui lòng cung cấp nội dung câu hỏi');
    }

    const cleanQuery = question.trim();
    const qClean = removeVietnameseTones(cleanQuery).toLowerCase();

    // 0.5. Nhận diện và từ chối các câu hỏi nằm ngoài phạm vi di sản (Out-of-scope Guardrail)
    if (!contextSlug && isOffTopicQuery(cleanQuery)) {
        return {
            answer: `Xin chào bạn! Tôi là **VietHeritage AI** — Trợ lý chuyên sâu về Di sản Văn học & Văn hóa Dân gian Việt Nam. 🌸\n\nRất tiếc tôi **chỉ hỗ trợ giải đáp các câu hỏi trong phạm vi Văn học, Văn hóa Dân gian và Lịch sử truyền thống Việt Nam**, nên không thể tư vấn về các chủ đề đời sống thường nhật như thực đơn ăn uống hàng ngày, thời tiết, công nghệ hay tài chính.\n\n💡 **Bạn có thể hỏi tôi về các chủ đề văn học hấp dẫn như:**\n- *Ý nghĩa các phong tục và ẩm thực truyền thống trong văn học (Sự tích bánh chưng bánh giầy, tục ăn trầu...)*\n- *Phân tích hình tượng nhân vật (Thạch Sanh, Thánh Gióng, Sơn Tinh, Thúy Kiều...)*\n- *Khám phá bối cảnh lịch sử và ý nghĩa của các tác phẩm (Bình Ngô Đại Cáo, Nam Quốc Sơn Hà, Tây Tiến...)*\n\nBạn muốn tìm hiểu tác phẩm hoặc câu chuyện nào hôm nay?`,
            citations: [],
            suggestedQuestions: DEFAULT_SUGGESTIONS.map((s) => s.question).slice(0, 3),
            sourceType: 'out_of_scope_guardrail',
        };
    }

    // 0. Nhận diện các câu chào hỏi xã giao thông thường
    if (!contextSlug && isConversationalGreeting(cleanQuery)) {
        let greetingText = '';

        if (qClean.includes('cam on') || qClean.includes('thank')) {
            greetingText = `Không có chi! Rất vui được đồng hành cùng bạn khám phá di sản văn hóa và văn học Việt Nam. Nếu bạn có bất kỳ câu hỏi nào về các tích truyện, nhân vật hay câu ca dao, đừng ngần ngại hỏi tôi nhé! 😊`;
        } else if (qClean.includes('tam biet') || qClean.includes('bye')) {
            greetingText = `Tạm biệt bạn! Chúc bạn có những phút giây học tập và trải nghiệm văn hóa thật nhiều niềm vui. Hẹn gặp lại bạn lần sau! 👋`;
        } else {
            greetingText = `Chào bạn! Tôi là **VietHeritage AI** — Trợ lý nghiên cứu và đàm đạo Di sản Văn học & Văn hóa Dân gian Việt Nam. 🌸

Tôi có thể hỗ trợ bạn:
- **Giải thích nhân vật**: Giới thiệu nhân vật là ai, vai trò và ý nghĩa biểu tượng (Mỵ Nương, Sơn Tinh, Thủy Tinh, Thạch Sanh, Thúy Kiều...).
- **Tra cứu địa danh & bối cảnh**: Khám phá vị trí địa lý thực tế và sự kiện lịch sử (núi Ba Vì, Sài Khao, Mường Lát, sông Như Nguyệt...).
- **Giải nghĩa từ ngữ khó**: Phân tích nghĩa từ điển, nghĩa Hán Việt và hàm ý sâu sắc trong văn cảnh tác phẩm.

Hôm nay bạn muốn tìm hiểu tác phẩm hoặc nhân vật nào?`;
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

    // 1. Nếu có contextSlug cụ thể (ví dụ người dùng bấm từ modal chi tiết tác phẩm)
    if (contextSlug) {
        primaryWork = await Work.findOne({ slug: contextSlug }).lean();
        if (primaryWork) candidateWorks = [primaryWork];
    }

    // 1.5. Nếu chưa có primaryWork, nhận diện thông minh từ nội dung câu hỏi
    if (!primaryWork) {
        try {
            // 1.5.a. Tìm xem câu hỏi có chứa tên của tác phẩm hoặc slug nào trong DB không
            const allWorks = await Work.find(
                { status: 'published' },
                'title slug author tags summary historicalContext thematicMeaning categoryName region period source variants quote literalMeaning figurativeMeaning lesson'
            ).lean();

            for (const w of allWorks) {
                const titleClean = removeVietnameseTones(w.title).toLowerCase();
                const slugClean = (w.slug || '').replace(/-/g, ' ').toLowerCase();
                // Khớp chính xác tên tác phẩm hoặc slug
                if (
                    qClean.includes(titleClean) ||
                    (titleClean.length > 5 && qClean.includes(titleClean.slice(0, 12))) ||
                    (slugClean.length >= 4 && qClean.includes(slugClean))
                ) {
                    primaryWork = w;
                    candidateWorks = [w];
                    break;
                }
            }

            // 1.5.b. Nếu chưa thấy, tìm xem câu hỏi có chứa tên nhân vật quen thuộc không
            if (!primaryWork) {
                const matchedChar = findCuratedCharacter(cleanQuery);
                if (matchedChar) {
                    primaryWork = allWorks.find((w) => w.slug === matchedChar.workSlug) || null;
                    if (primaryWork) candidateWorks = [primaryWork];
                }
            }

            // 1.5.c. Nếu chưa thấy, tìm xem câu hỏi có chứa địa danh quen thuộc không
            if (!primaryWork) {
                const matchedLoc = findCuratedLocation(cleanQuery);
                if (matchedLoc && matchedLoc.workSlug) {
                    primaryWork = allWorks.find((w) => w.slug === matchedLoc.workSlug) || null;
                    if (primaryWork) candidateWorks = [primaryWork];
                }
            }

            // 1.5.d. Nếu chưa thấy, tìm theo tác giả nổi tiếng
            if (!primaryWork) {
                const matchedByAuthor = allWorks.filter((w) => {
                    if (!w.author || w.author === 'Dân gian') return false;
                    const authorNorm = removeVietnameseTones(w.author).toLowerCase();
                    return authorNorm.length >= 4 && qClean.includes(authorNorm);
                });
                if (matchedByAuthor.length > 0) {
                    primaryWork = matchedByAuthor[0];
                    candidateWorks = matchedByAuthor.slice(0, 3);
                }
            }

            // 2. RAG: Tìm kiếm các tác phẩm liên quan trong Database nếu vẫn chưa có primaryWork
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

                    if (candidateWorks.length > 0) {
                        primaryWork = candidateWorks[0];
                    }
                }

                // Nếu tìm theo toàn bộ câu không ra, tách các từ khóa
                if (candidateWorks.length === 0) {
                    const STOP_WORDS = new Set([
                        'toi', 'tôi', 'ban', 'bạn', 'minh', 'mình', 'em', 'anh', 'chi', 'chị',
                        'khong', 'không', 'chua', 'chưa', 'hieu', 'hiểu', 'biet', 'biết', 'cho',
                        'hoi', 'hỏi', 've', 'về', 'la', 'là', 'ai', 'gi', 'gì', 'sao', 'nhu', 'như',
                        'the', 'thế', 'nao', 'nào', 'tai', 'tại', 'cua', 'của', 'trong', 'va', 'và',
                        'co', 'có', 'duoc', 'được', 'nay', 'này', 'do', 'đó', 'xin', 'hay', 'hãy',
                        'phan', 'phân', 'tich', 'tích', 'y', 'ý', 'nghia', 'nghĩa', 'giai', 'giải', 'thich', 'thích',
                        'hom', 'hôm', 'ngay', 'ngày', 'an', 'ăn', 'uong', 'uống', 'di', 'đi', 'o', 'ở', 'dau', 'đâu',
                        'gio', 'giờ', 'trua', 'trưa', 'toi', 'tối', 'sang', 'sáng'
                    ]);

                    const rawTokens = cleanQuery.split(/[\s,?.!;:—–"\']+/).filter(Boolean);
                    const filteredWords = rawTokens.filter((token) => !STOP_WORDS.has(token.toLowerCase()));

                    const searchTerms = [];
                    for (let i = 0; i < filteredWords.length - 1; i++) {
                        searchTerms.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);
                    }
                    filteredWords.forEach((w) => {
                        if (w.length >= 2) searchTerms.push(w);
                    });

                    if (searchTerms.length > 0) {
                        const orConditions = [];
                        for (const term of searchTerms.slice(0, 10)) {
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

                            if (candidateWorks.length > 0) {
                                primaryWork = candidateWorks[0];
                            }
                        }
                    }
                }
            }
        } catch (dbErr) {
            console.warn('[askAssistant] Lỗi tra cứu DB:', dbErr.message);
        }
    }
    // 2. Chuẩn bị context nếu có tác phẩm trùng khớp
    let contextText = null;
    if (primaryWork) {
        contextText = `[Tác phẩm đối chiếu]:
- Tên tác phẩm: ${primaryWork.title} (${primaryWork.categoryName || 'Di sản văn học'})
${primaryWork.author ? `- Tác giả: ${primaryWork.author}\n` : ''}- Khu vực / Thời kỳ: ${primaryWork.region || 'Toàn quốc'} — ${primaryWork.period || 'Dân gian'}
- Tóm tắt: ${primaryWork.summary || 'N/A'}
- Trích đoạn / Câu tiêu biểu: ${primaryWork.quote || 'N/A'}
- Bối cảnh lịch sử: ${primaryWork.historicalContext || 'N/A'}
- Ý nghĩa chủ đề & Biểu tượng: ${primaryWork.thematicMeaning || 'N/A'}
- Nguồn học thuật kiểm chứng: ${primaryWork.source || 'Kho tàng Di sản Văn học Việt Nam'}`;
    }

    // 3. Ưu tiên gọi Gemini AI nếu có key
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

    // 4. Fallback thông minh nội bộ
    const localResult = synthesizeHeritageAnswer({
        question: cleanQuery,
        primaryWork,
        candidateWorks: candidateWorks || [],
    });

    return {
        ...localResult,
        sourceType: 'heritage_knowledge_engine',
    };
};

/**
 * Yêu cầu AI giải thích chi tiết một câu ca dao / tục ngữ (UC10 Request AI Explanation)
 */
const explainWork = async ({ workId, slug }) => {
    const isObjectId = mongoose.isValidObjectId(workId || slug);
    const query = isObjectId ? { $or: [{ _id: workId || slug }, { slug: slug || workId }] } : { slug: slug || workId };

    const work = await Work.findOne({ ...query, status: 'published' }).lean();

    if (!work) {
        throw new Error('Không tìm thấy câu ca dao hoặc tục ngữ trong hệ thống');
    }

    const variantsSnippet = work.variants && work.variants.length > 0
        ? `\nDữ liệu Dị bản Dân gian đã ghi nhận:\n` + work.variants.map((v, i) => 
            `- Dị bản ${i + 1} (${v.name} - ${v.region}): "${v.quote || ''}"\n  + Nội dung/Ghi nhận: ${v.content}\n  + Điểm khác biệt: ${v.differenceNote}\n  + Phân tích học thuật: ${v.scholarlyAnalysis}\n  + Nguồn: ${v.source}`
          ).join('\n')
        : '';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        const prompt = `Phân tích sâu sắc và toàn diện về câu ca dao / tục ngữ / tác phẩm dân gian sau:
Tiêu đề / Văn bản: "${work.title}"
${work.quote ? `Trích dẫn đầy đủ: "${work.quote}"` : ''}
Chủ đề: ${work.topic || 'Văn hóa Dân gian'}
Nghĩa đen đã ghi nhận: ${work.literalMeaning || work.summary}
Nghĩa bóng đã ghi nhận: ${work.figurativeMeaning || work.thematicMeaning}
Bài học đã ghi nhận: ${work.lesson || 'Đạo lý làm người'}
Bối cảnh văn hóa: ${work.historicalContext || 'Nền văn minh nông nghiệp truyền thống'}
Nguồn học thuật chính thức: ${work.source}
${variantsSnippet}

Hãy trình bày lời giải thích rõ ràng theo các phần:
1. Nghĩa đen: Giải thích từ ngữ, hình ảnh cụ thể mộc mạc.
2. Nghĩa bóng: Giá trị biểu tượng, tầng ý nghĩa ẩn dụ sâu xa.
3. Bài học & Thông điệp: Lời răn dạy đạo đức, lối sống cho con người hôm nay.
4. Bối cảnh văn hóa & Ứng dụng: Nguồn gốc phong tục tập quán và cách vận dụng câu này trong giao tiếp đời sống thực tế.
${work.variants && work.variants.length > 0 ? '5. Khảo sát Dị bản & So sánh Liên vùng: Phân tích sự biến đổi của tác phẩm qua các vùng miền/dân tộc, làm sáng tỏ tính linh hoạt của văn học truyền miệng và tâm thức địa phương.' : ''}`;

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

    let formattedExplanation = `### 1. Nghĩa đen (Nghĩa hiển ngôn):
${work.literalMeaning || work.summary || 'Hình ảnh mộc mạc, gần gũi bắt nguồn từ đời sống sinh hoạt và lao động sản xuất thường nhật của người bình dân xưa.'}

### 2. Nghĩa bóng (Nghĩa hàm ẩn):
${work.figurativeMeaning || work.thematicMeaning || 'Gửi gắm triết lý nhân sinh sâu sắc, khẳng định các giá trị chân - thiện - mỹ và đạo lý đối nhân xử thế truyền thống.'}

### 3. Bài học & Thông điệp giáo dục:
${work.lesson || 'Nhắc nhở mỗi cá nhân rèn luyện nhân cách, sống có trách nhiệm, trọng nghĩa tình và gìn giữ cội nguồn tổ tiên.'}

### 4. Bối cảnh văn hóa & Ứng dụng đời sống:
${work.historicalContext ? work.historicalContext : 'Hình thành từ nền văn minh lúa nước và nếp sống làng xã Việt Nam, thường được ông bà cha mẹ dùng để răn dạy con cháu trong gia đình và đời sống cộng đồng.'}`;

    if (work.variants && work.variants.length > 0) {
        formattedExplanation += `\n\n### 5. Dị bản Dân gian & So sánh Liên vùng:
Tác phẩm ghi nhận **${work.variants.length} dị bản/biến thể** đặc sắc trong không gian văn hóa người Việt:\n` +
            work.variants.map((v, i) => 
                `* **${v.name} (${v.region}):**\n  - *Văn bản / Trích dẫn:* "${v.quote || v.content}"\n  - *Khác biệt cốt lõi:* ${v.differenceNote}\n  - *Góc nhìn học thuật:* ${v.scholarlyAnalysis}\n  - *Tài liệu kiểm chứng:* ${v.source}`
            ).join('\n\n');
    }

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

    let fallbackText = `Đối với tâm niệm của bạn về "${query}", kho tàng văn học dân gian Việt Nam đúc kết sâu sắc và chuẩn xác nhất qua câu ca dao "${topWork.title}". `;
    if (topWork.lesson) {
        fallbackText += topWork.lesson;
    } else if (topWork.figurativeMeaning) {
        fallbackText += topWork.figurativeMeaning;
    } else {
        fallbackText += topWork.summary;
    }

    if (process.env.GEMINI_API_KEY) {
        try {
            const prompt = `Bạn là Trợ lý Di sản VietHeritage AI. Người dùng vừa tìm kiếm ý nghĩa câu ca dao / tục ngữ với câu hỏi: "${query}".
Tác phẩm phù hợp nhất trong kho tàng dữ liệu là: "${topWork.title}".
- Nội dung / Trích dẫn: "${topWork.quote || topWork.title}"
- Nghĩa bóng / Bài học: "${topWork.lesson || topWork.figurativeMeaning || topWork.thematicMeaning || topWork.summary || ''}"

Hãy viết 1 đoạn văn ngắn (2-3 câu), truyền cảm, trang nhã, giải thích trực tiếp tại sao câu ca dao / tục ngữ này là minh chứng tiêu biểu và sâu sắc nhất cho tâm niệm tìm kiếm trên của người dùng.`;

            const aiAnswer = await callGeminiApi({
                question: prompt,
                contextText: `Tác phẩm: ${topWork.title}\n${topWork.summary || ''}\n${topWork.lesson || ''}`,
            });

            if (aiAnswer && aiAnswer.length > 30) {
                return {
                    insight: aiAnswer,
                    highlightWork: topWork.title,
                    source: 'gemini_smart_semantic_insight',
                };
            }
        } catch (err) {
            console.warn('[generateSemanticInsight] Gemini fallback:', err.message);
        }
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

// =========================================================================
// FEATURE: AI CULTURAL TUTOR — GIA SƯ VĂN HÓA AI (CA DAO & TỤC NGỮ)
// =========================================================================

const TUTOR_TOPICS = [
    {
        id: 'long-biet-on',
        name: 'Lòng biết ơn & Cội nguồn',
        topicKey: 'Lòng biết ơn',
        icon: 'Heart',
        description: 'Khám phá truyền thống "Uống nước nhớ nguồn", tri ân công đức tổ tiên, ông bà, cha mẹ và những người giúp đỡ.',
        sampleQuestions: [
            'Ý nghĩa câu "Ăn quả nhớ kẻ trồng cây" là gì?',
            'Tại sao người Việt luôn đặt chữ "Nhớ nguồn" lên hàng đầu?',
            'Làm thế nào để vận dụng bài học biết ơn trong thời đại ngày nay?'
        ],
        keywords: ['biết ơn', 'uống nước nhớ nguồn', 'ăn quả nhớ kẻ trồng cây', 'cội nguồn', 'tổ tiên', 'tri ân']
    },
    {
        id: 'tinh-cam-gia-dinh',
        name: 'Tình cảm gia đình & Hiếu nghĩa',
        topicKey: 'Tình cảm gia đình',
        icon: 'Home',
        description: 'Học tập đạo làm con, sự hy sinh của cha mẹ, nghĩa vụ anh em ruột thịt và chữ Hiếu thiêng liêng.',
        sampleQuestions: [
            'Hình tượng "núi Thái Sơn" và "nước trong nguồn" có ý nghĩa gì?',
            'Câu ca dao "Anh em như thể tay chân" nhắn nhủ điều gì?',
            'Đạo hiếu của người Việt xưa và nay có điểm gì tương đồng?'
        ],
        keywords: ['gia đình', 'công cha', 'nghĩa mẹ', 'chữ hiếu', 'thái sơn', 'anh em', 'cha mẹ', 'con cái']
    },
    {
        id: 'dao-duc-loi-song',
        name: 'Đạo đức & Nhân cách sống',
        topicKey: 'Đạo đức - Lối sống',
        icon: 'ShieldCheck',
        description: 'Tìm hiểu chuẩn mực nhân cách, sự trung thực, khiêm tốn, phẩm giá "Đói cho sạch, rách cho thơm".',
        sampleQuestions: [
            'Ý nghĩa câu tục ngữ "Đói cho sạch, rách cho thơm"?',
            'Câu "Gần mực thì đen, gần đèn thì rạng" khuyên ta điều gì?',
            'Lối sống trọng nghĩa tình thể hiện thế nào trong ứng xử hàng ngày?'
        ],
        keywords: ['đạo đức', 'lối sống', 'nhân cách', 'đói cho sạch', 'gần mực thì đen', 'trung thực', 'khiêm tốn']
    },
    {
        id: 'y-chi-hoc-tap',
        name: 'Ý chí & Tinh thần học tập',
        topicKey: 'Ý chí - Nghị lực',
        icon: 'GraduationCap',
        description: 'Rèn luyện nghị lực kiên trì, tinh thần hiếu học, tôn sư trọng đạo và học tập suốt đời.',
        sampleQuestions: [
            'Bài học ý chí từ câu "Có công mài sắt, có ngày nên kim"?',
            'Ý nghĩa so sánh giữa "học thầy" và "học bạn" trong tục ngữ?',
            'Làm sao rèn luyện tính kiên nhẫn khi gặp thử thách trong cuộc sống?'
        ],
        keywords: ['ý chí', 'học tập', 'nghị lực', 'có công mài sắt', 'học thầy', 'học bạn', 'kiên trì', 'hiếu học']
    },
    {
        id: 'que-huong-doan-ket',
        name: 'Tình yêu quê hương & Tương thân tương ái',
        topicKey: 'Đoàn kết - Nhân ái',
        icon: 'Users',
        description: 'Khơi dậy tinh thần đại đoàn kết, đồng bào "lá lành đùm lá rách", yêu thương nòi giống Việt.',
        sampleQuestions: [
            'Hình tượng "Bầu ơi thương lấy bí cùng" mang thông điệp gì?',
            'Ý nghĩa của câu "Nhiễu điều phủ lấy giá gương"?',
            'Tinh thần đoàn kết dân tộc giúp đất nước vượt qua thử thách ra sao?'
        ],
        keywords: ['đoàn kết', 'tương thân tương ái', 'bầu ơi thương lấy bí cùng', 'nhiễu điều', 'lá lành đùm lá rách', 'quê hương', 'đồng bào']
    }
];

const UNRELATED_PATTERNS = [
    /\b(bitcoin|crypto|chung\s+khoan|co\s+phieu|tien\s+ao|forex)\b/i,
    /\b(viet\s+code|lap\s+trinh|javascript|python|java|html|css|react|nodejs|c\+\+|sql)\b/i,
    /\b(giai\s+toan|phuong\s+trinh|dao\s+ham|tich\s+phan|hinh\s+hoc|tam\s+giac)\b/i,
    /\b(choi\s+game|lien\s+quan|lien\s+minh|pubg|fifa|game\s+thu)\b/i,
    /\b(thoi\s+tiet\s+ngay\s+mai|du\s+bao\s+thoi\s+tiet|gia\s+vang|ti\s+so\s+bong\s+da)\b/i,
];

function isUnrelatedQuery(text) {
    const clean = removeVietnameseTones(text).trim().toLowerCase();
    // Ngoại lệ nếu có nhắc đến văn hóa, ca dao, tục ngữ
    if (clean.includes('ca dao') || clean.includes('tuc ngu') || clean.includes('van hoa') || clean.includes('van hoc') || clean.includes('y nghia')) {
        return false;
    }
    return UNRELATED_PATTERNS.some((p) => p.test(clean));
}

/**
 * Lấy danh sách các chủ đề học tập cho Gia sư AI
 */
const getTutorTopics = async () => {
    return TUTOR_TOPICS;
};

/**
 * Động cơ tổng hợp bài giảng sư phạm nội bộ khi không có Gemini API
 */
function synthesizeTutorAnswer({ question, primaryWork, candidateWorks, topicInfo }) {
    if (!primaryWork && (!candidateWorks || candidateWorks.length === 0)) {
        return {
            reply: `Chào bạn! Tôi là **Gia sư văn hóa AI** của VietHeritage. 

Về câu hỏi: *"${question}"*, hiện tại tôi chưa tìm thấy tài liệu văn bản ca dao hoặc tục ngữ cụ thể trực tiếp trong kho tàng dữ liệu số. 

💡 **Gợi ý học tập cho bạn:**
- Bạn có thể chọn một trong 5 chủ đề tiêu biểu ở thanh điều hướng: **Lòng biết ơn, Tình cảm gia đình, Đạo đức & Lối sống, Ý chí học tập, Đoàn kết quê hương**.
- Hoặc bạn có thể bấm vào một trong các câu hỏi gợi ý bên dưới để cùng tôi khám phá nhé!`,
            citations: [],
            suggestedQuestions: topicInfo?.sampleQuestions || [
                'Ý nghĩa câu "Ăn quả nhớ kẻ trồng cây" là gì?',
                'Hình tượng "núi Thái Sơn" và "nước trong nguồn" có ý nghĩa gì?',
                'Bài học ý chí từ câu "Có công mài sắt, có ngày nên kim"?'
            ],
            isCultural: true,
            sourceType: 'tutor_local_engine',
        };
    }

    const work = primaryWork || candidateWorks[0];
    const categoryLabel = work.categoryName || (work.category === 'tuc-ngu' ? 'Tục ngữ Việt Nam' : 'Ca dao Việt Nam');

    const reply = `Xin chào bạn! Với vai trò là **Gia sư văn hóa AI**, tôi rất vui được cùng bạn phân tích và tìm hiểu sâu sắc về: **"${work.title}"** (${categoryLabel}).

${work.quote ? `> *"${work.quote}"*\n` : ''}
### 1. Ý nghĩa cốt lõi:
- **Nghĩa đen (Nghĩa hiển ngôn):** ${work.literalMeaning || work.summary || 'Hình ảnh mộc mạc, gần gũi xuất phát từ đời sống lao động và sinh hoạt hằng ngày của người Việt.'}
- **Nghĩa bóng (Nghĩa hàm ẩn):** ${work.figurativeMeaning || work.thematicMeaning || 'Gửi gắm triết lý nhân sinh sâu sắc, khẳng định các giá trị chân - thiện - mỹ trong văn hóa dân tộc.'}

### 2. Bài học đạo lý & Giáo dục nhân cách:
${work.lesson || 'Nhắc nhở mỗi cá nhân giữ gìn đạo lý sống có trước có sau, trân trọng cội nguồn và rèn luyện đạo đức.'}

### 3. Vận dụng thực tiễn trong đời sống hiện đại:
- **Trong giao tiếp & ứng xử:** Biết nói lời cảm ơn chân thành, đối xử khiêm nhường, luôn trân quý công sức của những người đã nâng đỡ mình.
- **Trong học tập & công việc:** Giữ vững tinh thần trách nhiệm, gắn kết đồng đội, kiên trì theo đuổi mục tiêu và không ngại gian khổ.
- **Trong gia đình & cộng đồng:** Thực hành chữ Hiếu với cha mẹ, chia sẻ với những hoàn cảnh khó khăn và gìn giữ nếp nhà hòa thuận.

### 4. Nguồn gốc & Tư liệu kiểm chứng:
- **Tác phẩm lưu trữ:** ${work.title}
- **Chủ đề văn hóa:** ${work.topic || 'Văn học Dân gian'}
- **Nguồn học thuật kiểm chứng:** ${work.source || 'Kho tàng Văn học Dân gian Việt Nam — NXB Giáo dục.'}

*(Lưu ý: Nội dung trích dẫn nguồn trên được đối chiếu trực tiếp từ cơ sở dữ liệu học thuật VietHeritage AI; phần phân tích mở rộng được thực hiện bởi Gia sư văn hóa AI).*`;

    const suggestedQuestions = [
        `Làm sao để vận dụng bài học của "${work.title}" vào môi trường làm việc hiện nay?`,
        `Còn câu ca dao hay tục ngữ nào cùng chủ đề "${work.topic || 'này'}" không?`,
        `Bối cảnh lịch sử ra đời của câu "${work.title}" có gì đặc biệt?`
    ];

    return {
        reply,
        suggestedQuestions,
        isCultural: true,
        sourceType: 'tutor_local_engine',
    };
}

/**
 * Xử lý phiên học tập và hội thoại cùng Gia sư văn hóa AI
 */
const tutorChat = async ({ message, topic = null, history = [], selectedWorkSlug = null }) => {
    if (!message || typeof message !== 'string' || message.trim() === '') {
        throw new Error('Vui lòng nhập nội dung câu hỏi cho Gia sư văn hóa AI');
    }

    const cleanMsg = message.trim();

    // 1. Kiểm tra nếu câu hỏi hoàn toàn không liên quan đến văn hóa/văn học
    if (isUnrelatedQuery(cleanMsg)) {
        return {
            reply: `Chào bạn! Tôi là **Gia sư văn hóa AI** của nền tảng VietHeritage AI, chuyên đồng hành cùng bạn học tập, tìm hiểu về **Ca dao, Tục ngữ và Di sản Văn hóa Việt Nam**.

Câu hỏi của bạn dường như chưa thuộc phạm vi văn hóa, văn học hoặc đạo lý truyền thống dân tộc. 

🌿 **Bạn có thể khám phá cùng tôi:**
1. **Giải nghĩa ca dao, tục ngữ:** Nghĩa đen, nghĩa bóng, bài học đạo đức và cách ứng dụng vào đời sống hiện đại.
2. **Khám phá theo 5 chủ đề trọng tâm:** Lòng biết ơn, Tình cảm gia đình, Đạo đức & Lối sống, Ý chí học tập, Đoàn kết quê hương.
3. **Tra cứu nguồn gốc:** Các tài liệu học thuật kiểm chứng được lưu trữ trong hệ thống.

Bạn hãy chọn một trong các câu hỏi gợi ý bên dưới hoặc hỏi tôi về một câu ca dao cụ thể nhé!`,
            relatedWorks: [],
            citations: [],
            suggestedQuestions: [
                'Ý nghĩa câu "Uống nước nhớ nguồn" là gì?',
                'Tại sao tục ngữ nói "Có công mài sắt, có ngày nên kim"?',
                'Câu ca dao nào răn dạy sâu sắc nhất về ơn nghĩa cha mẹ?'
            ],
            activeTopic: null,
            isCultural: false,
            sourceType: 'unrelated_topic_guard',
        };
    }

    // 2. Xác định chủ đề tương ứng (nếu có)
    let topicInfo = null;
    if (topic) {
        topicInfo = TUTOR_TOPICS.find((t) => t.id === topic || t.name === topic || t.topicKey === topic);
    }

    // 3. Truy vấn kho dữ liệu Work (MongoDB) để lấy các tư liệu học thuật kiểm chứng
    let primaryWork = null;
    let candidateWorks = [];

    if (selectedWorkSlug) {
        primaryWork = await Work.findOne({ slug: selectedWorkSlug, status: 'published' }).lean();
    }

    // Tìm kiếm tác phẩm liên quan dựa trên tên hoặc từ khóa câu hỏi
    const regex = buildVietnameseRegex(cleanMsg);
    if (regex) {
        candidateWorks = await Work.find({
            $or: [
                { title: regex },
                { quote: regex },
                { tags: regex },
                { topic: regex },
                { summary: regex },
            ],
            status: 'published',
        })
            .limit(4)
            .lean();
    }

    // Nếu chưa có tác phẩm và có topicInfo, lấy các tác phẩm thuộc topic đó từ DB
    if ((!candidateWorks || candidateWorks.length === 0) && topicInfo) {
        const topicRegex = buildVietnameseRegex(topicInfo.topicKey);
        candidateWorks = await Work.find({
            $or: [
                { topic: topicRegex },
                { tags: topicRegex },
            ],
            status: 'published',
        })
            .limit(4)
            .lean();
    }

    if (!primaryWork && candidateWorks.length > 0) {
        primaryWork = candidateWorks[0];
    }

    // Lập danh sách tác phẩm liên quan duy nhất
    const allRelevantWorks = primaryWork
        ? [primaryWork, ...candidateWorks.filter((w) => w._id.toString() !== primaryWork._id.toString())].slice(0, 4)
        : candidateWorks.slice(0, 4);

    // Chuẩn bị danh sách trích dẫn nguồn học thuật kiểm chứng
    const citations = allRelevantWorks.map((w) => ({
        title: w.title,
        slug: w.slug,
        category: w.category,
        categoryName: w.categoryName,
        source: w.source,
        author: w.author,
        topic: w.topic,
    }));

    // 4. Nếu có Gemini API Key, gọi LLM với chỉ dẫn sư phạm chuyên sâu của Gia sư văn hóa
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        const contextText = allRelevantWorks
            .map(
                (w, i) => `[Tư liệu kiểm chứng ${i + 1} từ Database]:
- Tên tác phẩm / Câu: ${w.title} (${w.categoryName || w.category})
- Trích dẫn câu đầy đủ: ${w.quote || w.title}
- Chủ đề: ${w.topic || 'Văn hóa Dân gian'}
- Nghĩa đen đã ghi nhận: ${w.literalMeaning || w.summary}
- Nghĩa bóng đã ghi nhận: ${w.figurativeMeaning || w.thematicMeaning}
- Bài học đã ghi nhận: ${w.lesson || 'N/A'}
- Nguồn học thuật kiểm chứng: ${w.source}`
            )
            .join('\n\n');

        const tutorInstruction = `Bạn là "Gia sư văn hóa AI" (AI Cultural Tutor) của nền tảng VietHeritage AI, đồng hành và truyền cảm hứng về Ca dao, Tục ngữ và Di sản Văn hóa Việt Nam.

MỤC TIÊU SƯ PHẠM:
1. Giải thích cho người học một cách ân cần, mạch lạc, hấp dẫn và uyên bác.
2. Luôn cấu trúc câu trả lời theo 4 phần rõ ràng:
   - **1. Ý nghĩa cốt lõi (Nghĩa đen & Nghĩa bóng)**: Làm sáng tỏ hình ảnh thực tế và ẩn dụ triết lý.
   - **2. Bài học đạo lý & Giáo dục nhân cách**: Nêu bật giá trị sống và đạo đức làm người.
   - **3. Vận dụng thực tiễn trong đời sống hiện đại**: Hướng dẫn cách áp dụng vào giao tiếp gia đình, học tập, công việc và đối nhân xử thế.
   - **4. Nguồn gốc & Tư liệu kiểm chứng**: Trích dẫn chính xác nguồn sách/học giả được cung cấp trong [Tư liệu kiểm chứng từ Database].
3. NGUYÊN TẮC BẢO TOÀN TƯ LIỆU:
   - Phân biệt rõ tư liệu đã có trong cơ sở dữ liệu và diễn giải mở rộng của bạn.
   - TUYỆT ĐỐI KHÔNG tự tạo tên sách, tác giả hoặc URL kiểm chứng giả mạo.
   - Nếu câu hỏi vượt ngoài dữ liệu có sẵn, hãy khiêm tốn nêu rõ giới hạn tư liệu và phân tích dựa trên tri thức dân gian học phổ quát.`;

        const geminiAnswer = await callGeminiApi({
            question: cleanMsg,
            contextText,
            history,
            customInstruction: tutorInstruction,
        });

        if (geminiAnswer) {
            const followUps = primaryWork
                ? [
                      `Làm thế nào để vận dụng bài học của "${primaryWork.title}" vào đời sống hằng ngày?`,
                      `Có câu ca dao, tục ngữ nào cùng chủ đề "${primaryWork.topic || 'này'}" không?`,
                      `Ý nghĩa của câu này trong bối cảnh xã hội xưa và nay khác nhau ra sao?`
                  ]
                : topicInfo?.sampleQuestions || [
                      'Ý nghĩa câu "Ăn quả nhớ kẻ trồng cây" là gì?',
                      'Hình tượng "núi Thái Sơn" và "nước trong nguồn" có ý nghĩa gì?',
                      'Bài học ý chí từ câu "Có công mài sắt, có ngày nên kim"?'
                  ];

            return {
                reply: geminiAnswer,
                relatedWorks: allRelevantWorks,
                citations,
                suggestedQuestions: followUps,
                activeTopic: topicInfo,
                isCultural: true,
                sourceType: 'gemini_tutor',
            };
        }
    }

    // 5. Fallback về động cơ sư phạm nội bộ (chạy mượt mà 100% không lo lỗi mạng hay quota)
    const localResult = synthesizeTutorAnswer({
        question: cleanMsg,
        primaryWork,
        candidateWorks: allRelevantWorks,
        topicInfo,
    });

    return {
        ...localResult,
        relatedWorks: allRelevantWorks,
        citations,
        activeTopic: topicInfo,
    };
};

/**
 * Trợ lý AI hỗ trợ người dùng soạn thảo và phân tích 4 tầng nghĩa cho bài đóng góp
 */
const draftSubmissionAssist = async ({ title, category = 'ca-dao' }) => {
    if (!title || !title.trim()) {
        throw new Error('Vui lòng cung cấp câu ca dao hoặc tục ngữ');
    }

    const cleanTitle = title.trim();
    let existingWork = null;
    try {
        existingWork = await Work.findOne({
            $or: [
                { title: new RegExp(cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
                { quote: new RegExp(cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
            ],
        }).maxTimeMS(2000).lean();
    } catch (e) {}

    if (existingWork) {
        return {
            meaning: existingWork.summary || '',
            literalMeaning: existingWork.literalMeaning || '',
            figurativeMeaning: existingWork.figurativeMeaning || '',
            lesson: existingWork.lesson || '',
            historicalContext: existingWork.historicalContext || '',
            topic: existingWork.topic || 'Đạo lý - Nhân ái',
            region: existingWork.region || 'Toàn quốc',
            source: existingWork.source || 'Kho tàng Văn học Dân gian Việt Nam',
            isExistingInDatabase: true,
            existingWorkSlug: existingWork.slug,
            sourceType: 'database_match',
        };
    }

    const lower = cleanTitle.toLowerCase();
    let topic = 'Kinh nghiệm sống - Đạo lý';
    let source = 'Kho tàng Ca dao Tục ngữ Dân tộc Việt Nam — NXB Văn học';

    if (lower.includes('cong cha') || lower.includes('nghia me') || lower.includes('me cha') || lower.includes('anh em') || lower.includes('cha me')) {
        topic = 'Tình cảm gia đình';
        source = 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học';
    } else if (lower.includes('nho nguon') || lower.includes('uong nuoc') || lower.includes('on')) {
        topic = 'Lòng biết ơn';
        source = 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn học';
    }

    return {
        meaning: `Câu "${cleanTitle}" là lời đúc kết sâu sắc của cha ông về đạo lý sống, khuyên răn con người giữ gìn phẩm hạnh cao đẹp.`,
        literalMeaning: 'Nghĩa đen bắt nguồn từ các hình ảnh, biểu tượng và sinh hoạt gần gũi trong đời sống nông nghiệp lúa nước truyền thống.',
        figurativeMeaning: `Nghĩa bóng truyền tải thông điệp về ${topic.toLowerCase()}, nhắc nhở mỗi cá nhân sống chan hòa, hướng thiện.`,
        lesson: 'Khuyên nhủ thế hệ hôm nay luôn rèn luyện phẩm chất tốt đẹp, biết yêu thương, chia sẻ và cống hiến cho gia đình, xã hội.',
        historicalContext: 'Lưu truyền qua nhiều thế hệ trong kho tàng văn hóa dân gian Việt Nam, phản ánh nhân sinh quan nhân đạo.',
        topic,
        region: 'Toàn quốc',
        source,
        isExistingInDatabase: false,
        sourceType: 'heritage_synthesis_engine',
    };
};

/**
 * SMART TEXT SELECTION ENGINE NÂNG CẤP TOÀN DIỆN:
 * 1. 👤 Nhân vật (Đây là ai, xuất thân, vai trò trong tác phẩm, ý nghĩa biểu tượng)
 * 2. 📍 Vị trí địa lý & Bối cảnh lịch sử thực tế
 * 3. 📖 Giải nghĩa từ ngữ khó (nghĩa từ vựng, Hán Việt, từ cổ, ngữ cảnh trong tác phẩm)
 * 4. 💡 Biện pháp tu từ & Hiệu quả biểu đạt
 */
const analyzeSnippet = async ({ snippet, workSlug = null, workTitle = null, analysisType = 'general' }) => {
    if (!snippet || typeof snippet !== 'string' || snippet.trim() === '') {
        throw new Error('Vui lòng cung cấp đoạn trích hoặc từ ngữ cần phân tích');
    }

    const cleanSnippet = snippet.trim();
    const cleanNoTone = removeVietnameseTones(cleanSnippet).toLowerCase().trim();

    // 0. Tải thông tin tác phẩm liên quan trong Database (nếu có)
    let workContext = null;
    if (workSlug || workTitle) {
        try {
            workContext = await Work.findOne({
                $or: [{ slug: workSlug }, { title: workTitle }],
                status: 'published',
            }).maxTimeMS(2000).lean();
        } catch (e) {}
    }

    const workName = workContext?.title || 'Di sản Văn học';
    const authorName = workContext?.author || '';
    const authorNoTone = removeVietnameseTones(authorName).toLowerCase().trim();
    const categoryLower = (workContext?.category || '').toLowerCase();
    const genreLower = (workContext?.genre || '').toLowerCase();
    const isPoetry = categoryLower.includes('thơ') || genreLower.includes('thơ') ||
        ['day-thon-vi-da', 'tay-tien', 'dong-chi', 'qua-deo-ngang', 'thu-dieu', 'bai-tho-ve-tieu-doi-xe-khong-kinh'].includes(workContext?.slug);
    const isFolk = categoryLower.includes('dân gian') || categoryLower.includes('cổ tích') || categoryLower.includes('truyền thuyết') || categoryLower.includes('ca dao');

    // 1. NHẬN DIỆN THỰC THỂ & ĐIỀU HƯỚNG CHÉO THÔNG MINH (CROSS-CATEGORY RESOLVER)
    const matchedChar = findCuratedCharacter(cleanSnippet);
    const matchedLoc = findCuratedLocation(cleanSnippet);
    const matchedTerm = findCuratedTerm(cleanSnippet);

    // Kiểm tra xem đoạn bôi đen có phải là tác giả của tác phẩm hiện tại không
    const isAuthorOfWork = authorNoTone && (
        cleanNoTone === authorNoTone ||
        cleanNoTone.includes(authorNoTone) ||
        authorNoTone.includes(cleanNoTone) ||
        cleanNoTone === 'tac gia' ||
        cleanNoTone.includes('thi si') ||
        cleanNoTone.includes('nha tho')
    );

    // =========================================================================
    // BỘ ĐIỀU PHỐI CHÉO THỰC THỂ THÔNG MINH TOÀN DIỆN (FULL CROSS-CATEGORY RESOLVER)
    // Tự động nhận diện bản chất thực thể khi người dùng bấm nhầm tab,
    // ưu tiên trả tri thức chuẩn đã kiểm chứng (0s, 0 token) và bảo vệ Quota Gemini.
    // =========================================================================

    // TÌNH HUỐNG 1: Người dùng bấm "Nhân vật & Tác giả" (analysisType === 'character')
    if (analysisType === 'character' && !matchedChar && !isAuthorOfWork) {
        // 1.A. Nhưng từ này thực chất là ĐỊA DANH
        if (matchedLoc) {
            return {
                snippet: cleanSnippet,
                analysisType: 'location',
                suggestedType: 'location',
                isRedirected: true,
                redirectNotice: `💡 "${cleanSnippet}" là ĐỊA DANH / KHÔNG GIAN ĐỊA LÝ, không phải nhân vật hay tác giả. Hệ thống đã tự động chuyển sang mục Địa danh để cung cấp tư liệu chuẩn xác nhất.`,
                title: `📍 Vị trí địa lý: ${matchedLoc.title}`,
                details: `**1. Vị trí địa lý thực tế:**\n${matchedLoc.realLocation}\n\n**2. Bối cảnh lịch sử thực tế:**\n${matchedLoc.historicalContext}\n\n**3. Ý nghĩa không gian trong tác phẩm:**\n${matchedLoc.literaryRole}`,
                source: matchedLoc.source || workContext?.source || 'Địa chí & Lịch sử Việt Nam — VietHeritage AI',
                sourceType: 'curated_location_ontology',
            };
        }
        // 1.B. Nhưng từ này thực chất là TỪ KHÓ / THUẬT NGỮ VĂN HỌC (như "mặt chữ điền", "súng ngửi trời"...)
        if (matchedTerm) {
            return {
                snippet: cleanSnippet,
                analysisType: 'definition',
                suggestedType: 'definition',
                isRedirected: true,
                redirectNotice: `💡 "${cleanSnippet}" là TỪ NGỮ / HÌNH ẢNH NGHỆ THUẬT, không phải nhân vật hay tác giả. Hệ thống đã tự động chuyển sang mục Giải nghĩa từ.`,
                title: `📖 Giải nghĩa từ ngữ: "${matchedTerm.term}"`,
                details: `**1. Giải nghĩa từ vựng (Nghĩa từ điển / Nhân trắc / Cổ ngữ):**\n${matchedTerm.definition}\n\n**2. Ý nghĩa trong ngữ cảnh tác phẩm:**\n${matchedTerm.contextualMeaning}\n\n**3. Giá trị biểu đạt & Cách hiểu chuẩn xác:**\n${matchedTerm.expressiveValue}`,
                source: 'Từ điển Tiếng Việt & Kho tàng Ngôn ngữ Di sản — VietHeritage AI',
                sourceType: 'curated_term_ontology',
            };
        }
    }

    // TÌNH HUỐNG 2: Người dùng bấm "Địa danh" (analysisType === 'location')
    if (analysisType === 'location' && !matchedLoc) {
        // 2.A. Nhưng từ này thực chất là TÁC GIẢ hoặc NHÂN VẬT
        if (matchedChar || isAuthorOfWork) {
            const finalChar = matchedChar || findCuratedCharacter(authorName);
            const displayWork = workContext?.title || finalChar?.workTitle || workName;
            const charName = finalChar?.name || (isAuthorOfWork ? authorName : cleanSnippet);
            return {
                snippet: cleanSnippet,
                analysisType: 'character',
                suggestedType: 'character',
                isRedirected: true,
                redirectNotice: `💡 "${cleanSnippet}" là TÁC GIẢ / NHÂN VẬT VĂN HỌC, không phải địa danh. Hệ thống đã tự động chuyển sang mục Nhân vật & Tác giả.`,
                title: `👤 Nhân vật & Tác giả: ${charName} (${displayWork})`,
                details: finalChar
                    ? `**1. Đây là ai? (Xuất thân & Danh tính):**\n${finalChar.identity}\n\n**2. Vai trò trong tác phẩm "${displayWork}":**\n${finalChar.role}\n\n**3. Ý nghĩa biểu tượng & Giá trị văn hóa:**\n${finalChar.symbolicMeaning}`
                    : `**1. Tác giả sáng tạo:**\n**${authorName}** là tác giả của tác phẩm "${workName}".\n\n**2. Vai trò & Phong cách sáng tác:**\nHóa thân vào cái tôi trữ tình, định hình phong cách nghệ thuật độc đáo và truyền tải thông điệp nhân văn sâu sắc.`,
                source: finalChar?.source || workContext?.source || 'Kho tàng Di sản Văn học Việt Nam — VietHeritage AI',
                sourceType: 'curated_character_ontology',
            };
        }
        // 2.B. Nhưng từ này thực chất là TỪ KHÓ / THUẬT NGỮ VĂN HỌC (Ví dụ: "mặt chữ điền", "súng ngửi trời"...)
        if (matchedTerm) {
            return {
                snippet: cleanSnippet,
                analysisType: 'definition',
                suggestedType: 'definition',
                isRedirected: true,
                redirectNotice: `💡 "${cleanSnippet}" là TỪ NGỮ / HÌNH ẢNH NGHỆ THUẬT, không phải địa danh. Hệ thống đã tự động chuyển sang mục Giải nghĩa từ.`,
                title: `📖 Giải nghĩa từ ngữ: "${matchedTerm.term}"`,
                details: `**1. Giải nghĩa từ vựng (Nghĩa từ điển / Nhân trắc / Cổ ngữ):**\n${matchedTerm.definition}\n\n**2. Ý nghĩa trong ngữ cảnh tác phẩm:**\n${matchedTerm.contextualMeaning}\n\n**3. Giá trị biểu đạt & Cách hiểu chuẩn xác:**\n${matchedTerm.expressiveValue}`,
                source: 'Từ điển Tiếng Việt & Kho tàng Ngôn ngữ Di sản — VietHeritage AI',
                sourceType: 'curated_term_ontology',
            };
        }
    }

    // TÌNH HUỐNG 3: Người dùng bấm "Giải nghĩa từ" (analysisType === 'definition')
    if (analysisType === 'definition' && !matchedTerm) {
        // 3.A. Nhưng từ này thực chất là ĐỊA DANH
        if (matchedLoc) {
            return {
                snippet: cleanSnippet,
                analysisType: 'location',
                suggestedType: 'location',
                isRedirected: true,
                redirectNotice: `💡 "${cleanSnippet}" là ĐỊA DANH / KHÔNG GIAN ĐỊA LÝ, không phải từ ngữ thông thường. Hệ thống đã tự động chuyển sang mục Địa danh để cung cấp tư liệu chuẩn xác nhất.`,
                title: `📍 Vị trí địa lý: ${matchedLoc.title}`,
                details: `**1. Vị trí địa lý thực tế:**\n${matchedLoc.realLocation}\n\n**2. Bối cảnh lịch sử thực tế:**\n${matchedLoc.historicalContext}\n\n**3. Ý nghĩa không gian trong tác phẩm:**\n${matchedLoc.literaryRole}`,
                source: matchedLoc.source || workContext?.source || 'Địa chí & Lịch sử Việt Nam — VietHeritage AI',
                sourceType: 'curated_location_ontology',
            };
        }
        // 3.B. Nhưng từ này thực chất là TÁC GIẢ hoặc NHÂN VẬT
        if (matchedChar || isAuthorOfWork) {
            const finalChar = matchedChar || findCuratedCharacter(authorName);
            const displayWork = workContext?.title || finalChar?.workTitle || workName;
            const charName = finalChar?.name || (isAuthorOfWork ? authorName : cleanSnippet);
            return {
                snippet: cleanSnippet,
                analysisType: 'character',
                suggestedType: 'character',
                isRedirected: true,
                redirectNotice: `💡 "${cleanSnippet}" là TÁC GIẢ / NHÂN VẬT VĂN HỌC, không phải từ ngữ thông thường. Hệ thống đã tự động chuyển sang mục Nhân vật & Tác giả.`,
                title: `👤 Nhân vật & Tác giả: ${charName} (${displayWork})`,
                details: finalChar
                    ? `**1. Đây là ai? (Xuất thân & Danh tính):**\n${finalChar.identity}\n\n**2. Vai trò trong tác phẩm "${displayWork}":**\n${finalChar.role}\n\n**3. Ý nghĩa biểu tượng & Giá trị văn hóa:**\n${finalChar.symbolicMeaning}`
                    : `**1. Tác giả sáng tạo:**\n**${authorName}** là tác giả của tác phẩm "${workName}".\n\n**2. Vai trò & Phong cách sáng tác:**\nHóa thân vào cái tôi trữ tình, định hình phong cách nghệ thuật độc đáo và truyền tải thông điệp nhân văn sâu sắc.`,
                source: finalChar?.source || workContext?.source || 'Kho tàng Di sản Văn học Việt Nam — VietHeritage AI',
                sourceType: 'curated_character_ontology',
            };
        }
    }

    if (analysisType === 'character' || isAuthorOfWork || (matchedChar && analysisType === 'general')) {
        // Ưu tiên 1: Khớp trong Curated Characters Ontology
        const finalChar = matchedChar || (isAuthorOfWork ? findCuratedCharacter(authorName) : null);
        if (finalChar) {
            const displayWork = workContext?.title || finalChar.workTitle;
            return {
                snippet: cleanSnippet,
                analysisType: 'character',
                title: `👤 Nhân vật & Tác giả: ${finalChar.name} (${displayWork})`,
                details: `**1. Đây là ai? (Xuất thân & Danh tính):**\n${finalChar.identity}\n\n**2. Vai trò trong tác phẩm "${displayWork}":**\n${finalChar.role}\n\n**3. Ý nghĩa biểu tượng & Giá trị văn hóa:**\n${finalChar.symbolicMeaning}`,
                source: finalChar.source || workContext?.source || 'Kho tàng Di sản Văn học Việt Nam — VietHeritage AI',
                sourceType: 'curated_character_ontology',
            };
        }

        // Ưu tiên 2: Nếu có cấu hình Gemini API Key, gọi AI để phân tích chuẩn xác ngữ cảnh học thuật
        if (process.env.GEMINI_API_KEY) {
            try {
                const geminiPrompt = `Hãy giải thích chi tiết, chuẩn mực học thuật về nhân vật, tác giả hoặc hình tượng văn học "${cleanSnippet}" trong tác phẩm "${workName}" (${workContext?.author ? `Tác giả: ${workContext.author}` : ''}):
1. Đây là ai? (Nguồn gốc, danh tính, xuất thân, bối cảnh thực tế)
2. Vai trò trong tác phẩm? (Lưu ý: Nếu đây là thơ ca/trữ tình thì phân tích theo cái tôi trữ tình hoặc hình tượng thơ; nếu là truyện/kịch bản thì phân tích theo nhân vật và xung đột; nếu là tác giả sáng tác thì nêu phong cách sáng tác)
3. Ý nghĩa biểu tượng & giá trị văn hóa?
Trình bày rõ ràng theo đúng 3 mục được đánh số trên.`;
                const aiAnswer = await callGeminiApi({
                    question: geminiPrompt,
                    contextText: `${workContext?.content || ''}\n${workContext?.summary || ''}`,
                });
                if (aiAnswer && aiAnswer.length > 50) {
                    return {
                        snippet: cleanSnippet,
                        analysisType: 'character',
                        title: `👤 Nhân vật & Tác giả: "${cleanSnippet}" (${workName})`,
                        details: aiAnswer,
                        source: 'Trí tuệ nhân tạo VietHeritage AI & Cơ sở tri thức Văn học Việt Nam',
                        sourceType: 'gemini_ai_literary_analysis',
                    };
                }
            } catch (aiErr) {
                console.warn('[analyzeSnippet] Gemini API call fallback:', aiErr.message);
            }
        }

        // Ưu tiên 3: Heuristic chuẩn xác theo thể loại văn học (Genre-Aware Fallback)
        let fallbackDetails = '';
        if (isAuthorOfWork) {
            fallbackDetails = `**1. Đây là ai? (Tác giả sáng tạo):**\n**${authorName}** là tác giả của tác phẩm "${workName}", sáng tác trong thời kỳ ${workContext?.era || workContext?.period || 'văn học Việt Nam'}.\n\n**2. Vai trò trong tác phẩm:**\n${isPoetry ? 'Hóa thân trọn vẹn vào cái tôi trữ tình, gửi gắm những rung động sâu sắc, tình yêu thiên nhiên đất nước và khát khao giao cảm mãnh liệt với cõi đời.' : 'Là người dẫn dắt tư tưởng, kết tinh những triết lý nhân sinh và truyền tải thông điệp nhân đạo sâu sắc qua ngòi bút tài hoa.'}\n\n**3. Ý nghĩa biểu tượng & Giá trị văn hóa:**\n${workContext?.thematicMeaning || 'Đóng góp to lớn vào diện mạo và sự phát triển phong phú của nền văn học dân tộc.'}`;
        } else if (isPoetry) {
            fallbackDetails = `**1. Hình tượng nhân vật trong thi phẩm:**\nHình tượng **"${cleanSnippet}"** trong bài thơ "${workName}" ${authorName ? `của ${authorName}` : ''} là một nét khắc họa thẩm mỹ giàu cảm xúc, kết tinh tư tưởng và chiều sâu tâm trạng của cái tôi trữ tình.\n\n**2. Vai trò trong tác phẩm:**\nĐóng vai trò là linh hồn của cảm xúc, khơi nguồn cho mạch liên tưởng nghệ thuật và làm nổi bật vẻ đẹp tâm hồn con người trước thiên nhiên và cuộc đời.\n\n**3. Ý nghĩa biểu tượng văn hóa:**\n${workContext?.thematicMeaning || 'Góp phần thể hiện vẻ đẹp tâm hồn dân tộc và tình yêu tha thiết với con người, non sông đất Việt.'}`;
        } else if (isFolk) {
            fallbackDetails = `**1. Nhân vật trong văn học dân gian:**\nNhân vật **"${cleanSnippet}"** trong ${workName} là hình tượng tiêu biểu đúc kết từ trí tuệ và tâm hồn của nhân dân lao động qua nhiều thế hệ lưu truyền.\n\n**2. Vai trò trong tác phẩm:**\nĐại diện cho vẻ đẹp đạo đức, phẩm chất cao quý và ước mơ hướng thiện, khát vọng công lý "ở hiền gặp lành" của nhân dân.\n\n**3. Ý nghĩa biểu tượng văn hóa:**\n${workContext?.thematicMeaning || 'Đúc kết đạo lý làm người và bài học nhân sinh sâu sắc của cha ông lưu truyền cho hậu thế.'}`;
        } else {
            fallbackDetails = `**1. Nhân vật & Hình tượng:**\nHình tượng **"${cleanSnippet}"** trong tác phẩm "${workName}" đại diện cho tư tưởng, khí phách và tinh thần của thời đại ${workContext?.era || workContext?.period || ''}.\n\n**2. Vai trò trong tác phẩm:**\nLà hạt nhân kết nối tư tưởng chủ đạo, thể hiện trọn vẹn thông điệp nhân văn và lý tưởng mà tác giả gửi gắm.\n\n**3. Ý nghĩa biểu tượng văn hóa:**\n${workContext?.thematicMeaning || 'Khẳng định vẻ đẹp nhân cách và những giá trị trường tồn trong dòng chảy văn hóa Việt Nam.'}`;
        }

        return {
            snippet: cleanSnippet,
            analysisType: 'character',
            title: `👤 Nhân vật & Tác giả: "${cleanSnippet}" (${workName})`,
            details: fallbackDetails,
            source: workContext?.source || 'Nghiên cứu Nhân vật Văn học — VietHeritage AI',
            sourceType: 'genre_aware_character_analysis',
        };
    }

    // 2. PHÂN TÍCH LOẠI VỊ TRÍ ĐỊA LÝ & BỐI CẢNH LỊCH SỬ THỰC TẾ
    if (analysisType === 'location' || (matchedLoc && analysisType === 'general')) {
        if (matchedLoc) {
            return {
                snippet: cleanSnippet,
                analysisType: 'location',
                title: `📍 Vị trí địa lý: ${matchedLoc.title}`,
                details: `**1. Vị trí địa lý thực tế:**\n${matchedLoc.realLocation}\n\n**2. Bối cảnh lịch sử thực tế:**\n${matchedLoc.historicalContext}\n\n**3. Ý nghĩa không gian trong tác phẩm:**\n${matchedLoc.literaryRole}`,
                source: matchedLoc.source || workContext?.source || 'Địa chí & Lịch sử Việt Nam — VietHeritage AI',
                sourceType: 'curated_location_ontology',
            };
        }

        // Thử gọi Gemini AI nếu có key
        if (process.env.GEMINI_API_KEY) {
            try {
                const geminiPrompt = `Hãy giải thích chi tiết, chuẩn xác về địa danh hoặc không gian địa lý "${cleanSnippet}" gắn liền với tác phẩm "${workName}":
1. Vị trí địa lý thực tế: Nơi này ở đâu trong bản đồ Việt Nam/thực tế hiện nay?
2. Bối cảnh lịch sử thực tế: Gắn liền với sự kiện, giai đoạn lịch sử hay phong cảnh văn hóa nào?
3. Ý nghĩa không gian nghệ thuật: Đóng vai trò gì trong cảm hứng sáng tác của tác phẩm?
Trình bày rõ ràng theo đúng 3 mục trên.`;
                const aiAnswer = await callGeminiApi({
                    question: geminiPrompt,
                    contextText: `${workContext?.content || ''}\n${workContext?.historicalContext || ''}`,
                });
                if (aiAnswer && aiAnswer.length > 50) {
                    return {
                        snippet: cleanSnippet,
                        analysisType: 'location',
                        title: `📍 Vị trí địa lý: "${cleanSnippet}" (${workName})`,
                        details: aiAnswer,
                        source: 'Trí tuệ nhân tạo VietHeritage AI & Cơ sở tri thức Địa chí Việt Nam',
                        sourceType: 'gemini_ai_location_analysis',
                    };
                }
            } catch (locErr) {
                console.warn('[analyzeSnippet] Gemini location fallback:', locErr.message);
            }
        }

        // Fallback địa danh theo dữ liệu tác phẩm
        return {
            snippet: cleanSnippet,
            analysisType: 'location',
            title: `📍 Địa danh & Bối cảnh: "${cleanSnippet}"`,
            details: `**1. Vị trí địa lý & Không gian:**\nĐịa danh hoặc không gian **"${cleanSnippet}"** gắn liền với vùng đất ${workContext?.region || 'thiêng liêng của non sông đất Việt'}.\n\n**2. Bối cảnh lịch sử thực tế:**\n${workContext?.historicalContext || 'Không gian văn hóa lịch sử gắn liền với các chặng đường dựng nước, giữ nước và đời sống sinh hoạt của nhân dân.'}\n\n**3. Ý nghĩa không gian nghệ thuật:**\nLà điểm tựa không gian giúp tác giả tái hiện chân thực bức tranh đời sống, vẻ đẹp sơn thủy hữu tình và tâm trạng nhân vật trữ tình.`,
            source: workContext?.source || 'Từ điển Địa danh Văn học — VietHeritage AI',
            sourceType: 'heuristic_location_analysis',
        };
    }

    // 3. Phân tích loại GIẢI NGHĨA TỪ NGỮ (analysisType === 'definition' hoặc khớp từ ngữ khó)
    if (analysisType === 'definition' || matchedTerm) {
        if (matchedTerm) {
            return {
                snippet: cleanSnippet,
                analysisType: 'definition',
                title: `📖 Giải nghĩa từ ngữ: "${matchedTerm.term}"`,
                details: `**1. Giải nghĩa từ vựng (Nghĩa từ điển / Hán Việt / Từ cổ):**\n${matchedTerm.definition}\n\n**2. Ý nghĩa trong ngữ cảnh tác phẩm:**\n${matchedTerm.contextualMeaning}\n\n**3. Giá trị biểu đạt & Cách hiểu chuẩn xác:**\n${matchedTerm.expressiveValue}`,
                source: 'Từ điển Tiếng Việt & Kho tàng Ngôn ngữ Di sản — VietHeritage AI',
                sourceType: 'curated_term_ontology',
            };
        }

        // ƯU TIÊN 2: NẾU CÓ GEMINI API KEY, GỌI GEMINI AI ĐỂ PHÂN TÍCH TỪ VỰNG CHUẨN XÁC
        if (process.env.GEMINI_API_KEY) {
            try {
                const geminiPrompt = `Hãy giải thích chi tiết, chuẩn mực học thuật về từ ngữ hoặc hình ảnh văn học "${cleanSnippet}" trong tác phẩm "${workName}" (${workContext?.author ? `Tác giả: ${workContext.author}` : ''}):
1. Giải nghĩa từ vựng (Nghĩa từ điển, cấu tạo từ ghép/từ láy/từ Hán Việt/từ cổ, nghĩa gốc)
2. Ý nghĩa trong ngữ cảnh tác phẩm "${workName}" (Gắn với cảm xúc trữ tình, bối cảnh bài thơ/truyện)
3. Giá trị biểu đạt & hiệu quả nghệ thuật (Gợi hình, gợi cảm, nhạc tính, đóng góp vào chủ đề)
Trình bày rõ ràng theo đúng 3 mục được đánh số trên.`;
                const aiAnswer = await callGeminiApi({
                    question: geminiPrompt,
                    contextText: `${workContext?.content || ''}\n${workContext?.summary || ''}\n${workContext?.quote || ''}`,
                });
                if (aiAnswer && aiAnswer.length > 50) {
                    return {
                        snippet: cleanSnippet,
                        analysisType: 'definition',
                        title: `📖 Giải nghĩa từ ngữ: "${cleanSnippet}" (${workName})`,
                        details: aiAnswer,
                        source: 'Trí tuệ nhân tạo VietHeritage AI & Cơ sở tri thức Ngôn ngữ học',
                        sourceType: 'gemini_ai_term_analysis',
                    };
                }
            } catch (termErr) {
                console.warn('[analyzeSnippet] Gemini term fallback:', termErr.message);
            }
        }

        const isReduplicated = cleanSnippet.split(/\s+/).length === 2 &&
            cleanSnippet.split(/\s+/)[0].slice(0, 1).toLowerCase() === cleanSnippet.split(/\s+/)[1].slice(0, 1).toLowerCase();

        return {
            snippet: cleanSnippet,
            analysisType: 'definition',
            title: `📖 Giải nghĩa từ ngữ: "${cleanSnippet}"`,
            details: `**1. Nghĩa từ vựng & Cấu tạo:**\nTừ ngữ **"${cleanSnippet}"** ${isReduplicated ? 'là một từ láy giàu tính tạo hình và gợi cảm' : 'là từ ngữ chọn lọc, mang sắc thái biểu cảm sâu sắc'}.\n\n**2. Ý nghĩa trong văn cảnh tác phẩm ${workContext ? `"${workContext.title}"` : ''}:**\nĐược sử dụng nhằm làm nổi bật tâm trạng, khắc họa tính cách nhân vật hoặc mở ra bức tranh cảnh sắc thiên nhiên giàu sức sống.\n\n**3. Giá trị biểu đạt:**\nGiúp người đọc cảm nhận được sự tinh tế, chuẩn xác và vẻ đẹp trong sáng, phong phú của tiếng Việt.`,
            source: workContext?.source || 'Từ điển Tiếng Việt — Viện Ngôn ngữ học',
            sourceType: 'heuristic_term_analysis',
        };
    }

    // 4. Phân tích loại BIỆN PHÁP TU TỪ (analysisType === 'rhetoric')
    if (analysisType === 'rhetoric') {
        if (process.env.GEMINI_API_KEY) {
            try {
                const geminiPrompt = `Hãy phân tích chi tiết biện pháp tu từ và thủ pháp nghệ thuật của cụm từ/hình ảnh "${cleanSnippet}" trong tác phẩm "${workName}" (${workContext?.author ? `Tác giả: ${workContext.author}` : ''}):
1. Thủ pháp nghệ thuật & biện pháp tu từ được sử dụng (Điệp từ, ẩn dụ, hoán dụ, nhân hóa, tương phản, phối thanh...)
2. Hiệu quả biểu đạt thẩm mỹ trong văn cảnh tác phẩm "${workName}"
3. Đóng góp vào phong cách tác giả và tư tưởng chủ đề tác phẩm
Trình bày rõ ràng theo đúng 3 mục được đánh số trên.`;
                const aiAnswer = await callGeminiApi({
                    question: geminiPrompt,
                    contextText: `${workContext?.content || ''}\n${workContext?.summary || ''}\n${workContext?.quote || ''}`,
                });
                if (aiAnswer && aiAnswer.length > 50) {
                    return {
                        snippet: cleanSnippet,
                        analysisType: 'rhetoric',
                        title: `💡 Biện pháp tu từ: "${cleanSnippet}" (${workName})`,
                        details: aiAnswer,
                        source: 'Trí tuệ nhân tạo VietHeritage AI & Thi pháp học Việt Nam',
                        sourceType: 'gemini_ai_rhetoric_analysis',
                    };
                }
            } catch (rhetoricErr) {
                console.warn('[analyzeSnippet] Gemini rhetoric fallback:', rhetoricErr.message);
            }
        }
        const isReduplicated = cleanSnippet.split(/\s+/).length === 2 &&
            cleanSnippet.split(/\s+/)[0].slice(0, 1).toLowerCase() === cleanSnippet.split(/\s+/)[1].slice(0, 1).toLowerCase();

        return {
            snippet: cleanSnippet,
            analysisType: 'rhetoric',
            title: `💡 Biện pháp tu từ: "${cleanSnippet}"`,
            details: `**1. Thủ pháp nghệ thuật:**\nCụm từ **"${cleanSnippet}"** được sử dụng như một điểm nhấn nghệ thuật đắt giá trong tác phẩm. ${isReduplicated ? 'Biện pháp điệp âm, phối thanh từ láy tạo nhạc tính du dương trầm bổng.' : 'Sử dụng hình ảnh gợi cảm và biện pháp tu từ hàm súc.'}\n\n**2. Hiệu quả biểu đạt thẩm mỹ:**\nTạo nên sự hòa quyện giữa nhạc và họa, vừa khắc họa rõ nét hình tượng vừa khơi gợi những rung cảm thẩm mỹ sâu lắng trong lòng độc giả.\n\n**3. Đóng góp vào chủ đề tác phẩm:**\nLàm nổi bật thông điệp nhân văn và phong cách nghệ thuật tài hoa của tác giả.`,
            source: workContext?.source || 'Thi pháp học Văn học Việt Nam',
            sourceType: 'heuristic_rhetoric_analysis',
        };
    }

    // 5. Mặc định 'general'
    return {
        snippet: cleanSnippet,
        analysisType: 'general',
        title: `Khám phá chuyên sâu: "${cleanSnippet}"`,
        details: `**1. Ngữ cảnh xuất hiện:**\nCụm từ / hình ảnh **"${cleanSnippet}"** ${workContext ? `trong tác phẩm "${workContext.title}"` : 'trong tác phẩm'} mang giá trị biểu đạt tinh tế.\n\n**2. Ý nghĩa nhân văn & Nghệ thuật:**\nKết hợp nhuần nhuyễn giữa hiện thực đời sống và cảm hứng nghệ thuật, phản chiếu chiều sâu tư tưởng và tâm hồn dân tộc Việt Nam.`,
        source: workContext?.source || 'Kho tàng Di sản Văn học Việt Nam',
        sourceType: 'general_heritage_synthesis',
    };
};

module.exports = {
    draftSubmissionAssist,
    askAssistant,
    explainWork,
    getSuggestions,
    getTutorTopics,
    tutorChat,
    generateSemanticInsight,
    analyzeSnippet,
};
