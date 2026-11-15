const { removeVietnameseTones } = require('../utils/vietnamese.utils');
const { GEMINI_MODELS } = require('../constants/geminiModels');

/**
 * Danh mục các câu chuyện rẽ nhánh kinh điển có sẵn
 */
const STORIES_CATALOG = [
    {
        slug: 'tam-cam',
        title: 'Tấm Cám: Khúc Biến Tấu Vàng Anh',
        subtitle: 'Thử thách lòng khoan dung, quyền lực và công lý',
        category: 'Truyện cổ tích thần kỳ',
        coverColor: 'from-amber-600 via-rose-700 to-amber-950',
        badgeTheme: 'Phượng Hoàng Tái Sinh',
        summary: 'Sau bao phen hóa thân, Tấm trở về hoàng cung. Trước mặt muôn dân và mẹ con Cám đang run rẩy, sự lựa chọn của Tấm sẽ định đoạt số phận vương triều.',
        initialStats: { tam: 50, tri: 50, dung: 50, longDan: 50 },
        starterChapter: {
            step: 1,
            chapterTitle: 'Hồi 1: Ngày Trở Về Cung Đình',
            sceneMood: 'dramatic',
            storyText: `Sau bao phen lưu lạc — khi hóa thành chim vàng anh che chở nhà vua, khi hóa đôi cây xoan đào tỏa bóng mát, khi làm khung cửi dệt lời răn dạy, rồi ẩn mình trong quả thị thơm của bà lão nghèo hiền hậu — Tấm đã trở về bên đức vua trong sự vỡ òa của hoàng tộc.

Mẹ con Cám đứng giữa sân rồng, mặt cắt không còn hạt máu, quỳ sụp dưới thềm ngọc run rẩy xin đền mạng. Đức vua truyền lệnh: "Nàng đã chịu muôn vàn kiếp nạn, nay sống chết của hai kẻ này tùy ý Hoàng hậu định đoạt."

Trước mắt bá quan văn võ và muôn dân trăm họ, Tấm nhìn mẹ con Cám. Nàng sẽ đưa ra quyết định gì?`,
            choices: [
                {
                    id: 'tam_c1',
                    cardTitle: 'Chiếu Chỉ Ân Xá',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Khoan dung tha tội chết, cấp ruộng đất và mở xưởng dệt lụa dạy nghề cho Cám phục thiện.',
                    folkQuote: 'Bầu ơi thương lấy bí cùng / Tuy rằng khác giống nhưng chung một giàn',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: 5, dung: 0, longDan: 15 },
                },
                {
                    id: 'tam_c2',
                    cardTitle: 'Nghiêm Trị Phép Nước',
                    sealText: 'PHÁP ĐỘ',
                    pillar: 'tri',
                    iconType: 'scale',
                    text: 'Chiếu theo luật nước, phế truất thường dân và lưu đày mẹ con Cám ra biên ải xa xôi.',
                    folkQuote: 'Quốc có quốc pháp, gia có gia quy',
                    requiredStat: null,
                    statChanges: { tam: -5, tri: 20, dung: 15, longDan: 5 },
                },
                {
                    id: 'tam_c3',
                    cardTitle: 'Hành Thiện Nhân Gian',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'feather',
                    text: 'Rời hoàng cung nhung lụa, rủ Cám cùng chu du khắp non sông cứu tế người nghèo khó.',
                    folkQuote: 'Thương người như thể thương thân / Thấy người đói rét chẳng ngần sẻ chia',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: -5, dung: 25, longDan: 20 },
                },
            ],
        },
    },
    {
        slug: 'thach-sanh',
        title: 'Thạch Sanh: Tiếng Đàn Hòa Hiếu',
        subtitle: 'Hóa giải hận thù bằng nhân nghĩa hay uy vũ chiến trận?',
        category: 'Truyện cổ tích dũng sĩ',
        coverColor: 'from-emerald-700 via-teal-800 to-slate-950',
        badgeTheme: 'Dũng Sĩ Nhân Từ',
        summary: 'Mười tám nước chư hầu đem quân vây hãm kinh thành. Thạch Sanh đứng trước sự lựa chọn: dùng vũ lực thị uy hay dùng tiếng đàn cảm hóa?',
        initialStats: { tam: 50, tri: 50, dung: 50, longDan: 50 },
        starterChapter: {
            step: 1,
            chapterTitle: 'Hồi 1: Vòng Vây Mười Tám Nước Chư Hầu',
            sceneMood: 'dramatic',
            storyText: `Nỗi oan ngục tối vừa được gột rửa, bộ mặt gian xảo bội bạc của mẹ con Lý Thông đã bị phơi bày. Nhưng niềm vui thái bình chưa trọn vẹn thì họa lớn ập đến: vua mười tám nước chư hầu vì phẫn nộ không cưới được công chúa đã hợp binh vạn cỗ chiến xa, cờ xí rợp trời vây kín kinh thành.

Tiếng tù và giục giã, đất trời rung chuyển. Nhà vua và triều đình lo sợ giang sơn sụp đổ, bèn trao ấn kiếm nguyên soái cho Thạch Sanh, giao phó tính mạng xã tắc.

Đứng trên mặt thành nhìn xuống muôn vạn binh đao sáng lòa, Thạch Sanh nắm chặt bảo kiếm và cây đàn thần trong tay. Chàng sẽ làm gì?`,
            choices: [
                {
                    id: 'ts_c1',
                    cardTitle: 'Tiếng Đàn Hòa Hiếu',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Gảy khúc đàn thần hóa giải oán hận và dọn niêu cơm thần vô tận thết đãi vạn quân chư hầu.',
                    folkQuote: 'Đem đại nghĩa để thắng hung tàn / Lấy chí nhân để thay cường bạo',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: 10, dung: 10, longDan: 20 },
                },
                {
                    id: 'ts_c2',
                    cardTitle: 'Trảm Tướng Thị Uy',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'sword',
                    text: 'Khoác hoàng bào vung búa thần xuất kích, trảm tướng tiên phong chư hầu trấn áp can qua.',
                    folkQuote: 'Trai thời trung hiếu làm đầu / Gặp cơn quốc nạn quản chi thân mình',
                    requiredStat: null,
                    statChanges: { tam: -10, tri: 5, dung: 25, longDan: 5 },
                },
                {
                    id: 'ts_c3',
                    cardTitle: 'Biện Thuyết Nghị Hòa',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scroll',
                    text: 'Một mình vào trướng giặc, đem đại nghĩa và thời thế phân tích để 18 quốc vương tự nguyện lui binh.',
                    folkQuote: 'Lời nói chẳng mất tiền mua / Lựa lời mà nói cho vừa lòng nhau',
                    requiredStat: null,
                    statChanges: { tam: 10, tri: 25, dung: 10, longDan: 15 },
                },
            ],
        },
    },
    {
        slug: 'an-duong-vuong',
        title: 'An Dương Vương: Bí Mật Nỏ Thần',
        subtitle: 'Chữ Tình trọn vẹn hay cơ đồ non sông ngút ngàn?',
        category: 'Truyền thuyết lịch sử',
        coverColor: 'from-amber-700 via-orange-900 to-stone-950',
        badgeTheme: 'Bảo Quốc An Dân',
        summary: 'Đêm trước ngày Trọng Thủy về phương Bắc, Mỵ Châu phát hiện bí mật về âm mưu đánh cắp nỏ thần. Đứng giữa tình phu thê và nợ nước, nàng sẽ chọn lối đi nào?',
        initialStats: { tam: 50, tri: 50, dung: 50, longDan: 50 },
        starterChapter: {
            step: 1,
            chapterTitle: 'Hồi 1: Đêm Trăng Trước Ngày Chia Biệt',
            sceneMood: 'dark',
            storyText: `Thành Cổ Loa chín vòng xoáy ốc sừng sững uy nghi, có nỏ thần Kim Quy trấn giữ bờ cõi. Đêm ấy, ánh trăng vằng vặc soi qua rèm lụa, Trọng Thủy sắp sửa từ biệt công chúa để về phương Bắc thăm cha là Triệu Đà.

Mỵ Châu tình cờ nghe được lời bàn mưu lén lút trong bóng tối giữa Trọng Thủy và tên gia tướng về việc hoán đổi chiếc lẫy nỏ thần rùa vàng. Trái tim nàng công chúa thắt nghẹn: một bên là người chồng từng hẹn thề gắn bó keo sơn, một bên là giang sơn vạn dặm của vua cha và sự an nguy của trăm họ Âu Lạc.

Gió lạnh rít qua tường thành Cổ Loa, Mỵ Châu phải đưa ra quyết định sinh tử ngay trong đêm nay:`,
            choices: [
                {
                    id: 'adv_c1',
                    cardTitle: 'Tráo Lẫy Giữ Nỏ',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scroll',
                    text: 'Bí mật đúc lẫy nỏ giả đem tráo đổi, cất giấu lẫy thật để vừa thử lòng phu quân vừa giữ yên xã tắc.',
                    folkQuote: 'Vỏ quýt dày có móng tay nhọn / Trí tuệ giữ yên vạn dặm giang sơn',
                    requiredStat: null,
                    statChanges: { tam: 0, tri: 25, dung: 10, longDan: 15 },
                },
                {
                    id: 'adv_c2',
                    cardTitle: 'Phong Tỏa Cổ Loa',
                    sealText: 'PHÁP ĐỘ',
                    pillar: 'dung',
                    iconType: 'shield',
                    text: 'Khẩn cấp tâu vua cha phong tỏa thành ốc, bắt giữ Trọng Thủy cùng thuộc hạ để tra xét dã tâm.',
                    folkQuote: 'Thà phụ tình riêng một khắc / Chẳng để non sông muôn thuở lầm than',
                    requiredStat: null,
                    statChanges: { tam: -10, tri: 15, dung: 25, longDan: 20 },
                },
                {
                    id: 'adv_c3',
                    cardTitle: 'Cảm Hóa Phu Quân',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Trực diện chất vấn Trọng Thủy trong đêm, lấy tình phu thê khuyên chàng từ bỏ mưu toan đao binh.',
                    folkQuote: 'Thuận vợ thuận chồng tát biển Đông cũng cạn',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: -5, dung: 5, longDan: -10 },
                },
            ],
        },
    },
    {
        slug: 'son-tinh-thuy-tinh',
        title: 'Sơn Tinh - Thủy Tinh: Đại Chiến Sơn Hà',
        subtitle: 'Chế ngự thiên tai bằng vũ lực hay hóa giải oán thù hòa hợp thủy thổ?',
        category: 'Truyền thuyết thần thoại',
        coverColor: 'from-blue-700 via-cyan-800 to-stone-950',
        badgeTheme: 'Sơn Hà Xã Tắc',
        summary: 'Thủy Tinh dâng nước biển Đông ngập lụt đồng bằng, sườn núi Tản Viên chao đảo trong bão lũ. Đứng trước nỗi thống khổ của trăm họ, Sơn Tinh sẽ chọn đối sách nào?',
        initialStats: { tam: 50, tri: 50, dung: 50, longDan: 50 },
        starterChapter: {
            step: 1,
            chapterTitle: 'Hồi 1: Nước Dâng Ngút Trời Núi Tản',
            sceneMood: 'dark',
            storyText: `Gió thét mây giông, sấm sét xé toạc bầu trời Phong Châu. Thủy Tinh vì uất hận chậm chân đến sau đã hô phong hoán vũ, kéo theo thủy quái, ba ba, thuồng luồng dâng nước biển Đông cuồn cuộn ngập lụt khắp đồng bằng châu thổ sông Hồng. Nước dâng cao bao nhiêu, chân núi Tản Viên lại theo đó mà rung chuyển dữ dội.

Đứng trên đỉnh Tản Viên nhìn xuống xóm làng chìm trong biển nước, muôn dân trăm họ gào khóc cầu cứu, Mỵ Nương run rẩy nép bên Sơn Tinh. Chúa non cao nắm chặt cây gậy thần trong tay, trước mắt là vận mệnh sinh tử của cả giang sơn. Sơn Tinh sẽ quyết định hành động ra sao?`,
            choices: [
                {
                    id: 'st_c1',
                    cardTitle: 'Dời Non Đắp Lũy',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'sword',
                    text: 'Vung gậy thần dời non lấp biển, nâng cao sườn núi đắp lũy đá kiên cố chặn đứng bão lũ thủy quái.',
                    folkQuote: 'Nước dâng cao bao nhiêu, núi dâng cao bấy nhiêu',
                    requiredStat: null,
                    statChanges: { tam: 10, tri: 5, dung: 25, longDan: 20 },
                },
                {
                    id: 'st_c2',
                    cardTitle: 'Hòa Hợp Thủy Thổ',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Cưỡi bạch tượng ra giữa dòng lũ, đàm phán phân định ranh giới nguồn nước để cứu muôn loài trăm họ.',
                    folkQuote: 'Một sự nhịn, chín sự lành / Hòa hợp đất trời nuôi dưỡng vạn vật',
                    requiredStat: null,
                    statChanges: { tam: 25, tri: 15, dung: 5, longDan: 15 },
                },
                {
                    id: 'st_c3',
                    cardTitle: 'Bát Quái Phá Lũ',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'compass',
                    text: 'Thi triển Bát Quái trận đồ khơi thông các dòng phụ lưu, biến sóng thần cuộn trào thành nguồn nước tưới tiêu.',
                    folkQuote: 'Trí giả bất hoặc, dũng giả bất cụ / Chuyển họa thiên tai thành phúc thái bình',
                    requiredStat: null,
                    statChanges: { tam: 5, tri: 30, dung: 10, longDan: 20 },
                },
            ],
        },
    },
    {
        slug: 'cay-khe',
        title: 'Cây Khế: Lời Hứa Chim Phượng Hoàng',
        subtitle: 'Vàng bạc vô tận nơi đảo xa hay tấm lòng thảo thơm cứu đời?',
        category: 'Truyền thuyết thần thoại',
        coverColor: 'from-amber-600 via-emerald-800 to-stone-950',
        badgeTheme: 'Minh Bạch & Phúc Đức',
        summary: 'Chim thần đưa người em nghèo ra đảo hoang nhặt vàng trả ơn quả khế. Trước kho báu vô tận giữa đại dương, người em sẽ lựa chọn cách thức dùng của cải ra sao?',
        initialStats: { tam: 50, tri: 50, dung: 50, longDan: 50 },
        starterChapter: {
            step: 1,
            chapterTitle: 'Hồi 1: Đôi Cánh Chim Thần Nơi Đảo Vàng',
            sceneMood: 'mystic',
            storyText: `Gió biển lồng lộng thổi qua đôi cánh phượng hoàng khổng lồ. Vượt qua muôn trùng sóng dữ, chim thần đáp xuống hòn đảo kỳ bí giữa đại dương — nơi vách đá hang sâu lấp lánh muôn ngàn thỏi vàng ròng, ngọc bích và kim cương lóa mắt.

Người em cầm trên tay chiếc túi ba gang may đúng lời dặn. Chim thần cất tiếng sang sảng: "Ngươi hãy lấy vàng theo đúng túi ba gang như đã ước hẹn." Nhưng nhìn thấy kho báu chất cao như núi, người em chợt nhớ tới quê nhà đang mùa hạn hán, dân làng đói khổ rách rưới, và cả người anh trai tham lam đang hắt hủi mình nơi xóm nghèo.

Trước kho vàng vô tận giữa biển khơi, người em sẽ đưa ra quyết định gì?`,
            choices: [
                {
                    id: 'ck_c1',
                    cardTitle: 'Cứu Tế Thôn Bản',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'feather',
                    text: 'Chỉ nhặt nửa túi vàng, xin chim thần ban tặng các giống lúa quý và cây ăn trái về cứu đói dân làng.',
                    folkQuote: 'Nhiễu điều phủ lấy giá gương / Người trong một nước phải thương nhau cùng',
                    requiredStat: null,
                    statChanges: { tam: 25, tri: 10, dung: 5, longDan: 25 },
                },
                {
                    id: 'ck_c2',
                    cardTitle: 'Lập Nghiệp Bền Lâu',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scroll',
                    text: 'Lấy đúng một túi ba gang, dùng một nửa san sẻ cho anh trai và nửa còn lại mở xưởng mộc dạy nghề.',
                    folkQuote: 'Khéo ăn thì no, khéo co thì ấm / Buôn có bạn, bán có phường',
                    requiredStat: null,
                    statChanges: { tam: 15, tri: 25, dung: 10, longDan: 15 },
                },
                {
                    id: 'ck_c3',
                    cardTitle: 'Thức Tỉnh Lương Tri',
                    sealText: 'ĐẠI NGHĨA',
                    pillar: 'dung',
                    iconType: 'lotus',
                    text: 'Không màng vàng bạc, khẩn cầu chim thần đưa người anh ra đảo ngắm cảnh tiên để thức tỉnh lòng tham.',
                    folkQuote: 'Anh em như thể tay chân / Rách lành đùm bọc, dở hay đỡ đần',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: 5, dung: 20, longDan: 10 },
                },
            ],
        },
    },
];

/**
 * Lấy danh mục truyện có thể chơi
 */
function getStoriesList() {
    return STORIES_CATALOG.map((s) => ({
        slug: s.slug,
        title: s.title,
        subtitle: s.subtitle,
        category: s.category,
        coverColor: s.coverColor,
        badgeTheme: s.badgeTheme,
        summary: s.summary,
        initialStats: s.initialStats,
        starterChapter: s.starterChapter,
    }));
}

/**
 * Tìm câu chuyện theo slug
 */
function getStoryBySlug(slug) {
    return STORIES_CATALOG.find((s) => s.slug === slug);
}

/**
 * Parser JSON an toàn, tự động khắc phục các lỗi quote hoặc newline từ LLM
 */
function safeParseStoryJson(rawText) {
    if (!rawText) return null;
    let text = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(text);
    } catch (e1) {
        // Khắc phục lỗi nếu LLM có thêm lời dẫn bên ngoài JSON
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            text = text.substring(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(text);
            } catch (e2) {}
        }

        // Khắc phục lỗi ký tự điều khiển xuống dòng trực tiếp trong chuỗi JSON
        try {
            const sanitized = text
                .replace(/(?<!\\)\r?\n/g, '\\n')
                .replace(/\t/g, '\\t');
            return JSON.parse(sanitized);
        } catch (e3) {
            // Khắc phục lỗi dấu nháy kép không escape bên trong storyText
            try {
                const fixed = text.replace(/"storyText"\s*:\s*"([\s\S]*?)"\s*,\s*"statChanges"/, (m, content) => {
                    const escapedContent = content.replace(/"/g, "'");
                    return `"storyText": "${escapedContent}", "statChanges"`;
                });
                return JSON.parse(fixed);
            } catch (e4) {
                return null;
            }
        }
    }
}

/**
 * Lấy danh sách toàn bộ Gemini API Key có sẵn (tự động phân tách dấu phẩy để xoay tua)
 */
function getGeminiApiKeys() {
    const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    return rawKeys
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k && !k.includes('your_gemini_api_key'));
}

let currentGeminiKeyIndex = 0;

/**
 * Tầng dự phòng cấp 2: Gọi Groq AI (Llama 3 / Mixtral) khi Gemini chạm giới hạn quota
 */
async function callGroqStoryEngine({ systemPrompt, story, nextStep, chosenText, isCustomAction, currentStats }) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || !groqKey.trim() || groqKey.includes('your_groq_api_key')) {
        return null;
    }

    const groqModels = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    const prompt = `Hãy tạo Hồi ${nextStep} cho dị bản ${story.title} sau khi người chơi ${isCustomAction ? 'đột phá thực hiện' : 'chọn'}: "${chosenText}".`;

    for (const model of groqModels) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${groqKey.trim()}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: isCustomAction ? 0.85 : 0.75,
                    max_tokens: 2048,
                }),
                signal: AbortSignal.timeout(8000),
            });

            if (response.ok) {
                const data = await response.json();
                const contentText = data?.choices?.[0]?.message?.content || '';
                const parsed = safeParseStoryJson(contentText);

                if (parsed && parsed.storyText) {
                    const newStats = {
                        tam: Math.min(100, Math.max(0, currentStats.tam + (parsed.statChanges?.tam || 0))),
                        tri: Math.min(100, Math.max(0, currentStats.tri + (parsed.statChanges?.tri || 0))),
                        dung: Math.min(100, Math.max(0, currentStats.dung + (parsed.statChanges?.dung || 0))),
                        longDan: Math.min(100, Math.max(0, currentStats.longDan + (parsed.statChanges?.longDan || 0))),
                    };

                    console.log(`[StoryBranch] Đã dệt cốt truyện thành công bằng Groq AI (${model})`);

                    return {
                        step: nextStep,
                        chapterTitle: parsed.chapterTitle || `Hồi ${nextStep}: Biến Cố Mới`,
                        sceneMood: parsed.sceneMood || 'dramatic',
                        storyText: parsed.storyText,
                        statChanges: parsed.statChanges || { tam: 0, tri: 0, dung: 0, longDan: 0 },
                        newStats,
                        isEnding: !!parsed.isEnding,
                        choices: parsed.choices || [],
                        endingData: parsed.endingData || null,
                        sourceType: `groq_story_engine (${model})`,
                    };
                }
            }
        } catch (err) {
            console.warn(`[StoryBranch - Groq] Model ${model} gặp sự cố:`, err.message);
        }
    }

    return null;
}

/**
 * Gọi Gemini AI (hỗ trợ Key Pool Rotation) & Fallback Groq AI để sinh tiếp chương tiếp theo có kiểm soát
 */
async function generateNextChapter({
    storySlug,
    step,
    chosenText,
    isCustomAction = false,
    previousHistory = [],
    currentStats = { tam: 50, tri: 50, dung: 50, longDan: 50 },
}) {
    const story = getStoryBySlug(storySlug);
    if (!story) {
        throw new Error(`Không tìm thấy câu chuyện với mã: ${storySlug}`);
    }

    const nextStep = (step || 1) + 1;
    const isTargetEnding = nextStep >= 5; // Cốt truyện kéo dài 4 - 5 hồi (Hồi 1 -> Hồi 2 -> Hồi 3 -> Hồi 4 -> Hồi Kết)

    const customDirective = isCustomAction
        ? `
[CHẾ ĐỘ SÁNG TẠO TỰ DO (SANDBOX CHOICE)]:
Người chơi vừa TỰ TAY GÕ HÀNH ĐỘNG RIÊNG: "${chosenText}".
- TUYỆT ĐỐI TÔN TRỌNG ý tưởng của người chơi! Không được gạt bỏ, không được 'tẩy trắng' hay bẻ lái thô bạo câu chuyện quay lại khuôn mẫu cổ tích quen thuộc.
- Hãy phản ánh chân thực hậu quả của hành động này: Những người xung quanh (Vua, bá quan, Cám, dân chúng, tướng sĩ...) sẽ sững sờ, hoảng loạn, ngỡ ngàng hay hưởng ứng ra sao trước bước đi bất ngờ này?
- TẠO BIẾN CỐ & KỊCH TÍNH: Tạo ra hệ quả trực tiếp, phản ứng dây chuyền sống động, cho thấy quyết định này làm xoay chuyển tình thế ra sao.
`
        : `
Người chơi vừa chọn hướng đi: "${chosenText}".
`;

    const systemPrompt = `Bạn là Game Master kiêm Nhà văn cốt truyện tương tác (Interactive Heritage Story Engine) cho kho tàng tích truyện Việt Nam.
Phong cách kể: Văn phong sắc sảo, điện ảnh, giàu tính hành động và cảm xúc chân thực của nhân vật, tránh xa sự sáo rỗng hay giáo điều.
${customDirective}
QUY TẮC BẮT BUỘC:
1. NGUYÊN TẮC KỂ CHUYỆN (STORY TEXT):
- Độ dài khoảng 140 - 200 từ, chia làm 2 - 3 đoạn văn ngắn rõ ràng, ngăn cách nhau bằng đúng 2 ký tự \\n\\n.
- Đưa lời thoại trực tiếp của nhân vật vào nếu có tình huống đối đáp (dùng dấu nháy đơn '...' hoặc dấu gạch ngang, TUYỆT ĐỐI KHÔNG dùng dấu nháy kép bên trong chuỗi text để tránh làm hỏng cấu trúc JSON).
- Đoạn cuối cùng phải kết thúc bằng một biến cố mở hoặc một tình thế nan giải/câu hỏi quyết định mà nhân vật phải đối mặt (VD: Trước tình thế ấy, nàng sẽ quyết định ra sao?).
- NGUYÊN TẮC SHOW, DON'T TELL: Kể hành động cụ thể, biểu cảm sắc nét. TUYỆT ĐỐI CẤM câu đúc kết triết lý giáo điều hay răn dạy đạo lý ở cuối đoạn (VD: CẤM các câu như '...dùng lòng nhân ái hóa giải...', '...cái giá phải trả là sự thanh thản...', '...gieo nhân nào gặt quả nấy...').
2. BỘ 3 THẺ TRÚC MỆNH LỆNH (CHOICES):
- Nếu chưa phải Hồi kết, cung cấp ĐÚNG 3 LỰA CHỌN ("choices") đại diện cho 3 Thẻ Trúc Đạo Lý dân gian mang tính thuần phong mỹ tục:
  + Thẻ 1 (Thiên về Tâm Đức / Khoan Dung): Lấy đức phục nhân, hóa giải oán thù, chia sẻ phúc đức. Không yêu cầu chỉ số (requiredStat: null).
  + Thẻ 2 (Thiên về Trí Mưu / Pháp Độ): Giữ nghiêm phép nước, mưu lược sâu sắc. Thẻ này CÓ THỂ ĐÒI HỎI ĐIỀU KIỆN chỉ số (VD: {"stat": "tri", "min": 55} hoặc {"stat": "dung", "min": 55}) để tạo thử thách nhập vai.
  + Thẻ 3 (Thiên về Dũng Khí / Đại Nghĩa): Khí phách kiên cường, dám dấn thân cứu tế muôn dân. Thẻ mở (requiredStat: null).
- Mỗi lựa chọn phải có đầy đủ:
  + "cardTitle": Tên thẻ bài cổ phong (3-5 từ, VD: Chiếu Chỉ Ân Xá, Phong Tỏa Cổ Loa, Lập Nghiệp Bền Lâu...)
  + "sealText": Chữ ấn triện son ngắn gọn (TÂM ĐỨC | TRÍ MƯU | DŨNG KHÍ | PHÁP ĐỘ | ĐẠI NGHĨA)
  + "pillar": Trụ cột chính ("tam" | "tri" | "dung" | "longDan")
  + "iconType": Biểu tượng văn hóa ("lotus" | "scale" | "sword" | "feather" | "scroll" | "compass")
  + "text": Miêu tả cụ thể hành động nhân vật sẽ làm (15 - 25 từ)
  + "folkQuote": Một câu ca dao hoặc tục ngữ dân gian tương ứng soi chiếu đạo lý
  + "requiredStat": {"stat": "tri" | "dung" | "tam", "min": 55} HOẶC null nếu không yêu cầu
  + "statChanges": Thay đổi điểm số tương ứng (+/- từ 5 đến 25)
3. Chỉ số hiện tại: Tâm: ${currentStats.tam}, Trí: ${currentStats.tri}, Dũng: ${currentStats.dung}, Lòng Dân: ${currentStats.longDan}.
4. Lịch sử các bước trước: ${JSON.stringify(previousHistory)}.
5. Bước hiện tại: ${nextStep} (Tổng hành trình gồm 4 - 5 Hồi). ${isTargetEnding ? 'ĐÂY LÀ HỒI KẾT (Ending). Hãy viết đoạn kết trọn vẹn, xúc động, đúc kết vận mệnh nhân vật một cách độc đáo.' : 'Đây là hồi phát triển cao trào (Hồi ' + nextStep + '/5), mở ra 3 lựa chọn Thẻ Trúc tiếp theo đối mặt với tình thế mới.'}

BẠN PHẢI TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON CHUẨN (KHÔNG ĐƯỢC KÈM LỜI DẪN, KHÔNG DÙNG BACKTICKS MARKDOWN, KHÔNG CÓ KÝ TỰ XUỐNG DÒNG THÔ TRONG CHUỖI STRING):
{
  "chapterTitle": "Tiêu đề của hồi này (VD: Hồi ${nextStep}: ...)",
  "sceneMood": "serene" | "dramatic" | "mystic" | "dark" | "triumphant",
  "storyText": "Nội dung kể chuyện dài khoảng 140 - 180 từ, giàu hình ảnh, kịch tính, mô tả tác động thực tế của lựa chọn vừa rồi.",
  "statChanges": {
    "tam": 10,
    "tri": 5,
    "dung": 0,
    "longDan": 10
  },
  "isEnding": ${isTargetEnding},
  "choices": ${
      isTargetEnding
          ? '[]'
          : `[
    {
      "id": "choice_1",
      "cardTitle": "Tên Thẻ Trúc 1 (Tâm Đức)",
      "sealText": "TÂM ĐỨC",
      "pillar": "tam",
      "iconType": "lotus",
      "text": "Miêu tả hành động lấy ân báo oán hoặc cứu tế muôn dân",
      "folkQuote": "Câu ca dao tục ngữ tương ứng",
      "requiredStat": null,
      "statChanges": { "tam": 20, "tri": 5, "dung": 0, "longDan": 15 }
    },
    {
      "id": "choice_2",
      "cardTitle": "Tên Thẻ Trúc 2 (Pháp Độ / Trí Mưu)",
      "sealText": "PHÁP ĐỘ",
      "pillar": "tri",
      "iconType": "scale",
      "text": "Miêu tả hành động giữ nghiêm phép nước hoặc mưu lược sâu xa",
      "folkQuote": "Câu ca dao tục ngữ tương ứng",
      "requiredStat": { "stat": "tri", "min": 55 },
      "statChanges": { "tam": -5, "tri": 20, "dung": 15, "longDan": 5 }
    },
    {
      "id": "choice_3",
      "cardTitle": "Tên Thẻ Trúc 3 (Dũng Khí / Đại Nghĩa)",
      "sealText": "DŨNG KHÍ",
      "pillar": "dung",
      "iconType": "feather",
      "text": "Miêu tả hành động khí phách xả thân vì nhân dân",
      "folkQuote": "Câu ca dao tục ngữ tương ứng",
      "requiredStat": null,
      "statChanges": { "tam": 15, "tri": 0, "dung": 25, "longDan": 20 }
    }
  ]`
  },
  "endingData": ${
      isTargetEnding
          ? `{
    "endingType": "Tên loại kết cục (VD: Đại Thái Bình / Bi Kịch Hào Hùng / Đạo Lý Thâm Sâu / Vương Triều Mới)",
    "badgeTitle": "Danh hiệu cổ phong tặng người chơi (VD: Đại Đức Minh Quân / Bồ Tát Tái Thế / Thiết Huyết Nữ Vương)",
    "moralComparison": "Đoạn văn 2-3 câu so sánh: Bản gốc dân gian giải quyết ra sao, còn dị bản do người chơi lựa chọn đã đem lại bài học nhân sinh mới mẻ nào."
  }`
          : 'null'
  }
}`;

    try {
        // =========================================================================
        // TẦNG 1: GOOGLE GEMINI AI (VỚI CƠ CHẾ XOAY VÒNG KEY ROTATION POOL)
        // =========================================================================
        const geminiKeys = getGeminiApiKeys();

    if (geminiKeys.length > 0) {
        const activeModels = ['gemini-3.6-flash', 'gemini-3.5-flash'];

        for (let k = 0; k < geminiKeys.length; k++) {
            const keyIdx = (currentGeminiKeyIndex + k) % geminiKeys.length;
            const apiKey = geminiKeys[keyIdx];

            for (const model of activeModels) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: systemPrompt }] },
                            contents: [
                                {
                                    role: 'user',
                                    parts: [{ text: `Hãy tạo Hồi ${nextStep} cho dị bản ${story.title} sau khi người chơi ${isCustomAction ? 'đột phá thực hiện' : 'chọn'}: "${chosenText}"` }],
                                },
                            ],
                            generationConfig: {
                                temperature: isCustomAction ? 0.85 : 0.75,
                                maxOutputTokens: 2048,
                                responseMimeType: 'application/json',
                            },
                        }),
                        signal: AbortSignal.timeout(5000),
                    });

                    // Nếu key chạm giới hạn (429 Rate Limit / 403 Quota Exceeded), đổi ngay sang key tiếp theo
                    if (response.status === 429 || response.status === 403) {
                        console.warn(`[StoryBranch] Key Gemini #${keyIdx + 1} chạm giới hạn (HTTP ${response.status}). Tự động đổi sang Key tiếp theo...`);
                        currentGeminiKeyIndex = (keyIdx + 1) % geminiKeys.length;
                        break;
                    }

                    if (response.ok) {
                        const data = await response.json();
                        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        const parsed = safeParseStoryJson(rawText);

                        if (parsed && parsed.storyText) {
                            const newStats = {
                                tam: Math.min(100, Math.max(0, currentStats.tam + (parsed.statChanges?.tam || 0))),
                                tri: Math.min(100, Math.max(0, currentStats.tri + (parsed.statChanges?.tri || 0))),
                                dung: Math.min(100, Math.max(0, currentStats.dung + (parsed.statChanges?.dung || 0))),
                                longDan: Math.min(100, Math.max(0, currentStats.longDan + (parsed.statChanges?.longDan || 0))),
                            };

                            return {
                                step: nextStep,
                                chapterTitle: parsed.chapterTitle || `Hồi ${nextStep}: Biến Cố Mới`,
                                sceneMood: parsed.sceneMood || 'dramatic',
                                storyText: parsed.storyText,
                                statChanges: parsed.statChanges || { tam: 0, tri: 0, dung: 0, longDan: 0 },
                                newStats,
                                isEnding: !!parsed.isEnding,
                                choices: parsed.choices || [],
                                endingData: parsed.endingData || null,
                                sourceType: geminiKeys.length > 1 ? `gemini_story_engine (Key #${keyIdx + 1})` : 'gemini_story_engine',
                            };
                        }
                    }
                } catch (err) {
                    console.warn(`[StoryBranch] Model ${model} (Key #${keyIdx + 1}) gặp sự cố:`, err.message);
                }
            }
        }
    }

    // =========================================================================
    // TẦNG 2: GROQ AI (LLAMA 3 / MIXTRAL) — DỰ PHÒNG MIỄN PHÍ TỐC ĐỘ CAO
    // =========================================================================
    const groqResult = await callGroqStoryEngine({
        systemPrompt,
        story,
        nextStep,
        chosenText,
        isCustomAction,
        currentStats,
    });
        if (groqResult) {
            return groqResult;
        }
    } catch (aiEngineErr) {
        console.warn('[StoryBranch] Toàn bộ engine AI ngoại vi gặp sự cố, tự động kích hoạt Tầng 3:', aiEngineErr.message);
    }

    // =========================================================================
    // TẦNG 3: LOCAL NARRATIVE ENGINE — DỰ PHÒNG CỤC BỘ KHÔNG CẦN INTERNET
    // =========================================================================
    return generateLocalFallbackChapter({ story, nextStep, chosenText, currentStats });
}

/**
 * Fallback thông minh nội bộ đảm bảo 100% người dùng luôn chơi được mượt mà
 */
function generateLocalFallbackChapter({ story, nextStep, chosenText, currentStats }) {
    const isEnding = nextStep >= 5;

    if (story.slug === 'tam-cam') {
        if (isEnding) {
            return {
                step: nextStep,
                chapterTitle: 'Hồi Kết: Ánh Lửa Làng Dệt & Đạo Làm Người',
                sceneMood: 'triumphant',
                storyText: `Những năm tháng sau đó, khắp vùng thôn quê tiếng thoi đưa lách cách ngân vang như khúc nhạc thái bình. Cám dưới sự bảo bọc và đức độ của Tấm đã chuyên tâm dệt nên những tấm the lụa đẹp nhất dâng lên triều đình, người nghèo trong làng ai cũng có manh áo ấm khi đông về. Dân gian truyền tụng tấm lòng bao dung của Hoàng hậu sáng tựa trăng rằm, hóa giải mọi oán hận trần thế.`,
                statChanges: { tam: 15, tri: 10, dung: 5, longDan: 20 },
                newStats: {
                    tam: Math.min(100, currentStats.tam + 15),
                    tri: Math.min(100, currentStats.tri + 10),
                    dung: Math.min(100, currentStats.dung + 5),
                    longDan: Math.min(100, currentStats.longDan + 20),
                },
                isEnding: true,
                choices: [],
                endingData: {
                    endingType: 'Cái Kết Đại Thái Bình',
                    badgeTitle: 'Bồ Tát Dân Gian',
                    moralComparison:
                        'Bản gốc kết thúc với sự trừng phạt nghiêm khắc thể hiện quan niệm "Ác giả ác báo" quyết liệt. Dị bản của bạn đã mở ra triết lý "Lấy đức phục nhân", chứng minh cái ác chỉ thực sự bị tiêu diệt khi lương tri được đánh thức.',
                },
                sourceType: 'local_narrative_engine',
            };
        }

        return {
            step: nextStep,
            chapterTitle: `Hồi ${nextStep}: Hương Thơm Cây Trái Nơi Xóm Cũ`,
            sceneMood: 'serene',
            storyText: `Đáp lại lựa chọn "${chosenText}", Tấm cùng Cám đưa nhau về làng xưa. Mẹ con dì ghẻ rưng rưng dòng lệ cảm kích, cúi đầu nhận ruộng đất cày cấy. Tấm mang nghề dệt lụa trong cung dạy cho các cô gái nghèo trong thôn. Làng xóm từ đây rộn ràng tiếng hát, nhà nhà no ấm. Nhưng khi tiếng đồn về xưởng dệt vang xa, triều đình lại cử sứ giả mang chỉ dụ mới đến...`,
            statChanges: { tam: 10, tri: 5, dung: 5, longDan: 15 },
            newStats: {
                tam: Math.min(100, currentStats.tam + 10),
                tri: Math.min(100, currentStats.tri + 5),
                dung: Math.min(100, currentStats.dung + 5),
                longDan: Math.min(100, currentStats.longDan + 15),
            },
            isEnding: false,
            choices: [
                {
                    id: 'tc_fb_1',
                    cardTitle: 'Dâng Kỹ Nghệ Cho Triều Đình',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scale',
                    text: 'Dâng toàn bộ kỹ nghệ dệt lụa cho triều đình để mở rộng nghề dệt khắp non sông',
                    folkQuote: 'Nước thịnh dân an / Non sông vững bền một dải',
                    requiredStat: { stat: 'tri', min: 60 },
                    statChanges: { tam: 5, tri: 15, dung: 5, longDan: 10 },
                },
                {
                    id: 'tc_fb_2',
                    cardTitle: 'Gìn Giữ Sản Nghiệp Thôn Quê',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Giữ nghề dệt làm sản nghiệp chung cho dân nghèo trong làng, sống đời thanh bần giản dị',
                    folkQuote: 'Đói no có bạn, rách lành có nhau',
                    requiredStat: null,
                    statChanges: { tam: 15, tri: 5, dung: 5, longDan: 20 },
                },
                {
                    id: 'tc_fb_3',
                    cardTitle: 'Khai Phá Vùng Đất Mới',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'feather',
                    text: 'Cùng mẹ con Cám mang nghề dệt đến những vùng biên cương xa xôi giúp dân nghèo lập nghiệp',
                    folkQuote: 'Dấn thân mở lối / Gieo mầm phúc đức muôn phương',
                    requiredStat: null,
                    statChanges: { tam: 10, tri: 5, dung: 20, longDan: 15 },
                },
            ],
            endingData: null,
            sourceType: 'local_narrative_engine',
        };
    }

    if (story.slug === 'thach-sanh') {
        if (isEnding) {
            return {
                step: nextStep,
                chapterTitle: 'Hồi Kết: Khúc Ca Khải Hoàn Hòa Hiếu Bất Diệt',
                sceneMood: 'triumphant',
                storyText: `Khói lửa can qua hoàn toàn lùi xa. Mười tám nước chư hầu đời đời tôn kính Đại Việt, dân chúng hai bên biên giới qua lại buôn bán thái bình, tiếng cười rộn rã khắp thôn trang. Thạch Sanh không chỉ là vị dũng sĩ diệt chằn tinh, bắn đại bàng năm nào, mà nay được muôn đời tôn xưng là biểu tượng của tinh thần hòa hiếu dân tộc — lấy nhân nghĩa thắng hung tàn, lấy trí dũng giữ trọn non sông.`,
                statChanges: { tam: 25, tri: 20, dung: 15, longDan: 30 },
                newStats: {
                    tam: Math.min(100, currentStats.tam + 25),
                    tri: Math.min(100, currentStats.tri + 20),
                    dung: Math.min(100, currentStats.dung + 15),
                    longDan: Math.min(100, currentStats.longDan + 30),
                },
                isEnding: true,
                choices: [],
                endingData: {
                    endingType: 'Thiên Hạ Đại Thái Bình',
                    badgeTitle: 'Đại Trí Dũng Hiệp Vương',
                    moralComparison:
                        'Bản gốc ca ngợi chiến thắng thần kỳ và công lý trừng trị kẻ gian ác. Dị bản của bạn nâng tầm triết lý: Người anh hùng vĩ đại nhất không phải là kẻ vung gươm chém nhiều quân thù nhất, mà là người biết dùng nhân nghĩa cảm hóa lòng người, biến kẻ thù thành tri âm bằng tiếng đàn hòa hiếu.',
                },
                sourceType: 'local_narrative_engine',
            };
        }

        return {
            step: nextStep,
            chapterTitle: `Hồi ${nextStep}: Tiếng Đàn Tri Âm & Niêu Cơm Thần Tích`,
            sceneMood: 'mystic',
            storyText: `Trước vạn cỗ chiến xa của 18 nước chư hầu, Thạch Sanh bước ra trận tiền. Chàng không vung búa sắt mà khoan thai gảy đàn thần. Tiếng đàn lúc dập dìu như ngọn gió đầu xuân, lúc da diết nỗi nhớ quê hương, khiến mười vạn quân sĩ phương xa bùi ngùi rơi giáp, ôm mặt khóc thương mẹ già con dại. Niêu cơm thần bé nhỏ được bày ra, tướng sĩ mười tám nước ăn mãi không vơi, thảy đều cúi đầu bái phục dũng khí và lòng nhân của chàng.`,
            statChanges: { tam: 20, tri: 15, dung: 10, longDan: 25 },
            newStats: {
                tam: Math.min(100, currentStats.tam + 20),
                tri: Math.min(100, currentStats.tri + 15),
                dung: Math.min(100, currentStats.dung + 10),
                longDan: Math.min(100, currentStats.longDan + 25),
            },
            isEnding: false,
            choices: [
                {
                    id: 'ts_fb_1',
                    cardTitle: 'Minh Ước Hòa Bình',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scale',
                    text: 'Ký kết Minh Ước Hòa Bình, thiết lập bang giao hòa hiếu lâu dài giữa các nước',
                    folkQuote: 'Đem đại nghĩa để thắng hung tàn / Lấy chí nhân để thay cường bạo',
                    requiredStat: null,
                    statChanges: { tam: 10, tri: 20, dung: 10, longDan: 20 },
                },
                {
                    id: 'ts_fb_2',
                    cardTitle: 'Ẩn Tích Dưới Gốc Đa',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Từ tạ ấn kiếm Nguyên soái, cùng công chúa trở về dưới gốc đa xưa dạy dân làm nương rẫy',
                    folkQuote: 'Công danh phú quý thoảng như mây / Trọn nghĩa vẹn tình ấm cõi say',
                    requiredStat: null,
                    statChanges: { tam: 25, tri: 5, dung: 10, longDan: 15 },
                },
                {
                    id: 'ts_fb_3',
                    cardTitle: 'Tuần Du Trấn Biên',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'sword',
                    text: 'Cầm quân tuần du khắp các cửa ải biên cương, giúp dân khai hoang lập ấp giữ yên bờ cõi',
                    folkQuote: 'Trai thời trung hiếu làm đầu / Gặp cơn quốc nạn quản chi thân mình',
                    requiredStat: null,
                    statChanges: { tam: 5, tri: 10, dung: 25, longDan: 20 },
                },
            ],
            endingData: null,
            sourceType: 'local_narrative_engine',
        };
    }

    if (story.slug === 'an-duong-vuong') {
        if (isEnding) {
            return {
                step: nextStep,
                chapterTitle: 'Hồi Kết: Trường Thành Cổ Loa Vạn Niên Bất Tử',
                sceneMood: 'triumphant',
                storyText: `Trước thế trận phòng thủ kiên cố và nỏ thần Kim Quy uy lực sấm sét, quân Triệu Đà thảm bại tan tác, phải vội vã dâng biểu xin hòa và lui binh về phương Bắc. Thành Cổ Loa chín vòng xoáy ốc sừng sững không một vết rạn nứt. Mỵ Châu không còn phải gánh chịu số phận bi kịch nơi bờ biển Dạ Hải, mà được muôn dân ngợi ca là bậc nữ kiệt trí dũng song toàn, người đã đặt giang sơn xã tắc lên trên tư tình mà vẫn giữ vẹn tấm lòng bao dung.`,
                statChanges: { tam: 20, tri: 25, dung: 25, longDan: 30 },
                newStats: {
                    tam: Math.min(100, currentStats.tam + 20),
                    tri: Math.min(100, currentStats.tri + 25),
                    dung: Math.min(100, currentStats.dung + 25),
                    longDan: Math.min(100, currentStats.longDan + 30),
                },
                isEnding: true,
                choices: [],
                endingData: {
                    endingType: 'Đại Thắng Non Sông Âu Lạc',
                    badgeTitle: 'Quốc Mẫu Trí Dũng Song Toàn',
                    moralComparison:
                        'Bản gốc là tấn bi kịch cảnh tỉnh muôn đời về việc "Trái tim lầm chỗ để trên đầu". Dị bản của bạn đã tái sinh hình tượng Mỵ Châu thành người phụ nữ tỉnh táo, mưu lược, biết đặt tình yêu đất nước làm gốc rễ mà vẫn bảo toàn phẩm giá và đạo lý làm người.',
                },
                sourceType: 'local_narrative_engine',
            };
        }

        return {
            step: nextStep,
            chapterTitle: `Hồi ${nextStep}: Chiếc Lẫy Thần & Cơn Sóng Ngầm Cổ Loa`,
            sceneMood: 'dramatic',
            storyText: `Trước hành động sáng suốt của Mỵ Châu: "${chosenText}", thế cờ Cổ Loa lập tức xoay chuyển ngoạn mục. Lẫy nỏ thần Kim Quy thật được bí mật canh phòng cẩn mật nơi tôn miếu, quân tuần thành lập tức tăng cường phòng vệ ở các vòng thành ốc. Trọng Thủy mang lẫy giả về phương Bắc ngỡ đại kế đã thành. Không lâu sau, Triệu Đà xua đại quân ồ ạt tấn công hòng đánh úp kinh đô...`,
            statChanges: { tam: 10, tri: 20, dung: 15, longDan: 25 },
            newStats: {
                tam: Math.min(100, currentStats.tam + 10),
                tri: Math.min(100, currentStats.tri + 20),
                dung: Math.min(100, currentStats.dung + 15),
                longDan: Math.min(100, currentStats.longDan + 25),
            },
            isEnding: false,
            choices: [
                {
                    id: 'adv_fb_1',
                    cardTitle: 'Lệnh Tiễn Sấm Sét',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'sword',
                    text: 'Cùng vua cha giương nỏ thần thật phát huy sấm sét bắn tan hạm đội giặc tại sông Cầu',
                    folkQuote: 'Nỏ thần một phát tan muôn giặc / Non nước ngàn năm vững thái bình',
                    requiredStat: null,
                    statChanges: { tam: 5, tri: 10, dung: 25, longDan: 20 },
                },
                {
                    id: 'adv_fb_2',
                    cardTitle: 'Đối Chất Quan Ải',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Đích thân ra trước quan ải đối chất cùng Trọng Thủy, khuyên chàng hồi tâm chuyển ý quy thuận Âu Lạc',
                    folkQuote: 'Lấy chân tình thức tỉnh lương tri / Trọn vẹn đạo đời dẫu biệt ly',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: 15, dung: 5, longDan: 15 },
                },
                {
                    id: 'adv_fb_3',
                    cardTitle: 'Bày Trận Thành Ốc',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scale',
                    text: 'Dụ quân Triệu Đà tiến sâu vào mê cung chín vòng thành Ốc rồi vây khốn bức hàng',
                    folkQuote: 'Trí mưu định quốc, hiểm địa thắng binh',
                    requiredStat: null,
                    statChanges: { tam: 5, tri: 25, dung: 15, longDan: 15 },
                },
            ],
            endingData: null,
            sourceType: 'local_narrative_engine',
        };
    }

    if (story.slug === 'son-tinh-thuy-tinh') {
        if (isEnding) {
            return {
                step: nextStep,
                chapterTitle: 'Hồi Kết: Bản Hùng Ca Sơn Hà Xã Tắc',
                sceneMood: 'triumphant',
                storyText: `Trời quang mây tạnh, đồng lúa chín vàng trải dài tít tắp đến tận chân trời châu thổ sông Hồng. Sơn Tinh và Thủy Tinh từ đây không còn là kẻ thù sinh tử, mà trở thành biểu tượng của sự hòa hợp âm dương giữa Đất và Nước. Người dân Đại Việt đời đời ghi nhớ công ơn vị Thánh vương Tản Viên đã dạy dân đắp đê ngăn lũ, biến hiểm họa thiên tai thành sức mạnh đoàn kết ngàn năm dựng nước.`,
                statChanges: { tam: 20, tri: 25, dung: 25, longDan: 30 },
                newStats: {
                    tam: Math.min(100, currentStats.tam + 20),
                    tri: Math.min(100, currentStats.tri + 25),
                    dung: Math.min(100, currentStats.dung + 25),
                    longDan: Math.min(100, currentStats.longDan + 30),
                },
                isEnding: true,
                choices: [],
                endingData: {
                    endingType: 'Đại Hòa Hợp Thủy Thổ',
                    badgeTitle: 'Tản Viên Minh Vương Đại Thánh',
                    moralComparison:
                        'Bản gốc là cuộc chiến đụng độ hàng năm phản ánh nỗi vất vả trước thiên tai bão lũ. Dị bản của bạn đã mở ra tư tưởng tiến bộ: Con người không chỉ chế ngự thiên tai mà còn biết thuận theo tự nhiên, chuyển hóa giông bão thành dòng phù sa trù phú.',
                },
                sourceType: 'local_narrative_engine',
            };
        }

        return {
            step: nextStep,
            chapterTitle: `Hồi ${nextStep}: Khơi Thông Dòng Lũ & Cánh Đồng Châu Thổ`,
            sceneMood: 'dramatic',
            storyText: `Hưởng ứng quyết định của Sơn Tinh: "${chosenText}", vạn dân vùng sông Hồng cùng hợp sức xẻ núi ngăn dòng, đắp nên những con đê vững chãi đầu tiên trong lịch sử dân tộc. Thủy Tinh nhìn thấy ý chí quật cường và lòng bao dung của Chúa non cao, cơn thịnh nộ dần nguôi ngoai, bèn thu bớt phong ba, biến dòng lũ hung dữ thành phù sa bồi đắp màu mỡ cho châu thổ.`,
            statChanges: { tam: 15, tri: 20, dung: 20, longDan: 25 },
            newStats: {
                tam: Math.min(100, currentStats.tam + 15),
                tri: Math.min(100, currentStats.tri + 20),
                dung: Math.min(100, currentStats.dung + 20),
                longDan: Math.min(100, currentStats.longDan + 25),
            },
            isEnding: false,
            choices: [
                {
                    id: 'st_fb_1',
                    cardTitle: 'Minh Ước Sơn Hà',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scale',
                    text: 'Lập đàn tế Trời Đất, ký Minh ước Sơn Hà đời đời hòa hợp với loài thủy tộc phương Nam',
                    folkQuote: 'Nước lùi non tiến, hòa khí sinh tài',
                    requiredStat: null,
                    statChanges: { tam: 15, tri: 25, dung: 10, longDan: 20 },
                },
                {
                    id: 'st_fb_2',
                    cardTitle: 'Dạy Dân Đắp Đê',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'Truyền dạy cho muôn dân phương pháp canh tác lúa nước theo mùa lũ, biến hiểm họa thành mùa vàng',
                    folkQuote: 'Thuận thiên dưỡng dân / Châu thổ ngàn đời trĩu hạt',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: 15, dung: 10, longDan: 25 },
                },
                {
                    id: 'st_fb_3',
                    cardTitle: 'Trấn Yểm Phong Ba',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'mountain',
                    text: 'Dựng cọc gỗ lim trấn yểm các ngã ba sông, chế ngự cuồng lưu bảo vệ vạn nhà',
                    folkQuote: 'Dũng khí dời non lấp biển / Uy danh rạng rỡ trời Nam',
                    requiredStat: null,
                    statChanges: { tam: 5, tri: 10, dung: 25, longDan: 20 },
                },
            ],
            endingData: null,
            sourceType: 'local_narrative_engine',
        };
    }

    if (story.slug === 'cay-khe') {
        if (isEnding) {
            return {
                step: nextStep,
                chapterTitle: 'Hồi Kết: Cội Rễ Phúc Đức Trường Tồn',
                sceneMood: 'triumphant',
                storyText: `Mái nhà tranh năm xưa nay đã trở thành nơi đong đầy tiếng cười hạnh phúc của cả thôn làng. Hai anh em hòa thuận sẻ chia như thuở ấu thơ, cây khế thần vẫn đơm hoa kết trái bốn mùa tỏa bóng mát chở che. Bài học về lòng thảo thơm và sự thức tỉnh lương tri của người anh đã được muôn đời truyền tụng, trở thành câu chuyện đạo lý đẹp nhất của xứ sở.`,
                statChanges: { tam: 30, tri: 20, dung: 15, longDan: 30 },
                newStats: {
                    tam: Math.min(100, currentStats.tam + 30),
                    tri: Math.min(100, currentStats.tri + 20),
                    dung: Math.min(100, currentStats.dung + 15),
                    longDan: Math.min(100, currentStats.longDan + 30),
                },
                isEnding: true,
                choices: [],
                endingData: {
                    endingType: 'Đại Phúc Vô Lượng',
                    badgeTitle: 'Bậc Thiện Nhân Phúc Trạch',
                    moralComparison:
                        'Bản gốc kết thúc với bi kịch người anh tham lam rơi xuống biển sâu răn dạy "Tham thì thâm". Dị bản của bạn nâng tầm triết lý: Của cải chân chính không phải là vàng bạc nhặt được, mà là sự thức tỉnh lương tri của con người và tấm lòng sẵn sàng chia sẻ vì hạnh phúc chung.',
                },
                sourceType: 'local_narrative_engine',
            };
        }

        return {
            step: nextStep,
            chapterTitle: `Hồi ${nextStep}: Mầm Xanh Nở Hoa Nơi Xóm Nghèo`,
            sceneMood: 'serene',
            storyText: `Trước nghĩa cử thơm thảo của người em: "${chosenText}", chim thần cảm kích vỗ cánh bay quanh cây khế ba vòng chúc phúc. Vàng bạc được dùng để đào giếng nước ngọt, mở trường dạy chữ cho trẻ thơ và dựng nhà cho người neo đơn. Người anh trai chứng kiến tấm lòng của em mình, hổ thẹn rơi nước mắt, quỳ xuống xin tha thứ và cùng em chăm sóc vườn cây.`,
            statChanges: { tam: 25, tri: 15, dung: 10, longDan: 25 },
            newStats: {
                tam: Math.min(100, currentStats.tam + 25),
                tri: Math.min(100, currentStats.tri + 15),
                dung: Math.min(100, currentStats.dung + 10),
                longDan: Math.min(100, currentStats.longDan + 25),
            },
            isEnding: false,
            choices: [
                {
                    id: 'ck_fb_1',
                    cardTitle: 'Mở Xưởng Dạy Nghề',
                    sealText: 'TRÍ MƯU',
                    pillar: 'tri',
                    iconType: 'scale',
                    text: 'Dùng một phần vàng mở xưởng mộc truyền nghề cho dân làng, gây dựng cơ nghiệp lâu dài',
                    folkQuote: 'Một nghề cho chín còn hơn chín nghề / Cơ nghiệp bền từ bàn tay chăm chỉ',
                    requiredStat: null,
                    statChanges: { tam: 10, tri: 20, dung: 5, longDan: 20 },
                },
                {
                    id: 'ck_fb_2',
                    cardTitle: 'Cứu Tế Muôn Dân',
                    sealText: 'TÂM ĐỨC',
                    pillar: 'tam',
                    iconType: 'lotus',
                    text: 'San sẻ của cải cứu trợ nạn đói cho xóm làng, khuyên anh trai cùng chung tay làm thiện tích đức',
                    folkQuote: 'Thương người như thể thương thân / Nhường cơm sẻ áo trọn phần nghĩa nhân',
                    requiredStat: null,
                    statChanges: { tam: 25, tri: 10, dung: 5, longDan: 25 },
                },
                {
                    id: 'ck_fb_3',
                    cardTitle: 'Thuận Theo Tự Nhiên',
                    sealText: 'DŨNG KHÍ',
                    pillar: 'dung',
                    iconType: 'feather',
                    text: 'Trả lại vàng thừa cho chim thần, chỉ giữ lấy hạt giống cây quý gieo trồng khắp non sông',
                    folkQuote: 'Gieo mầm phúc đức / Đơm hoa thơm cho đời đời',
                    requiredStat: null,
                    statChanges: { tam: 20, tri: 10, dung: 20, longDan: 20 },
                },
            ],
            endingData: null,
            sourceType: 'local_narrative_engine',
        };
    }

    // Mặc định cho các câu chuyện khác
    return {
        step: nextStep,
        chapterTitle: `Hồi ${nextStep}: Bánh Xe Vận Mệnh Chuyển Dời`,
        sceneMood: 'dramatic',
        storyText: `Trước lựa chọn dũng cảm: "${chosenText}", vận mệnh của câu chuyện đã bước sang một trang sử hoàn toàn mới. Bá tánh hoan ca, lòng người thuận phục. Bằng sự kết hợp giữa tài trí và tấm lòng son sắt vì đại cuộc, giang sơn dần vượt qua cơn giông bão, mở ra một thời kỳ thái bình thịnh trị được người đời ngợi ca.`,
        statChanges: { tam: 10, tri: 10, dung: 10, longDan: 10 },
        newStats: {
            tam: Math.min(100, currentStats.tam + 10),
            tri: Math.min(100, currentStats.tri + 10),
            dung: Math.min(100, currentStats.dung + 10),
            longDan: Math.min(100, currentStats.longDan + 10),
        },
        isEnding: true,
        choices: [],
        endingData: {
            endingType: 'Cái Kết Vinh Quang',
            badgeTitle: 'Hào Kiệt Non Sông',
            moralComparison:
                'Dị bản bạn vừa tạo ra đã thể hiện tinh thần làm chủ vận mệnh của con người Việt Nam: Biết linh hoạt chuyển hóa nguy nan thành thời cơ thái bình.',
        },
        sourceType: 'local_narrative_engine',
    };
}

module.exports = {
    getStoriesList,
    getStoryBySlug,
    generateNextChapter,
};
