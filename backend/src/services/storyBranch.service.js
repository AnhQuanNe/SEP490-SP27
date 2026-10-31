const { removeVietnameseTones } = require('../utils/vietnamese.utils');

const GEMINI_MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
];

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
                    text: 'Khoan dung tha tội chết, cấp ruộng đất cho về quê làm ruộng và mở trường dạy dệt vải cho con em nghèo khó',
                    hint: '+Tâm (Lòng nhân ái), +Lòng Dân',
                    statChanges: { tam: 15, tri: 5, dung: 0, longDan: 15 },
                },
                {
                    id: 'tam_c2',
                    text: 'Chiếu theo phép nước nghiêm trị, tịch thu gia sản và đày mẹ con Cám đi khai hoang biên ải',
                    hint: '+Trí (Phép nước), +Dũng (Cương quyết)',
                    statChanges: { tam: -5, tri: 15, dung: 15, longDan: 5 },
                },
                {
                    id: 'tam_c3',
                    text: 'Từ bỏ nhung lụa hoàng cung, rủ Cám cùng rời cung phiêu bạt nhân gian để hành thiện cứu giúp người cơ hàn',
                    hint: '+Dũng (Khí phách), +Đặc Biệt',
                    statChanges: { tam: 20, tri: -5, dung: 20, longDan: 10 },
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
                    text: 'Một mình bước ra trận tiền, gảy đàn thần làm mềm lòng binh sĩ và dọn niêu cơm thần đãi tiệc hòa hiếu',
                    hint: '+Tâm (Nhân nghĩa), +Lòng Dân',
                    statChanges: { tam: 20, tri: 10, dung: 10, longDan: 15 },
                },
                {
                    id: 'ts_c2',
                    text: 'Thân chinh cưỡi ngựa xuất kích, vung búa thần chém tướng giặc để thị uy dũng khí Đại Việt',
                    hint: '+Dũng (Chiến trận), -Tâm',
                    statChanges: { tam: -10, tri: 5, dung: 25, longDan: 5 },
                },
                {
                    id: 'ts_c3',
                    text: 'Cử sứ giả mời 18 vị quốc vương vào trướng nghị hòa, dùng tài hùng biện và phân tích lẽ được mất để lui binh',
                    hint: '+Trí (Ngoại giao), +Thái bình',
                    statChanges: { tam: 5, tri: 20, dung: 5, longDan: 15 },
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
                    text: 'Bí mật chế tạo chiếc lẫy nỏ giả đem giấu lẫy thật đi, giả vờ không biết để thử lòng Trọng Thủy',
                    hint: '+Trí (Mưu lược sâu sắc), +Bảo vệ nỏ',
                    statChanges: { tam: 0, tri: 20, dung: 10, longDan: 15 },
                },
                {
                    id: 'adv_c2',
                    text: 'Lập tức mang bí mật tâu lên vua cha An Dương Vương để phong tỏa kinh đô, bắt giữ những kẻ mưu phản',
                    hint: '+Dũng (Quyết đoán), +Quốc Pháp',
                    statChanges: { tam: -10, tri: 10, dung: 20, longDan: 20 },
                },
                {
                    id: 'adv_c3',
                    text: 'Thẳng thắn đối chất cùng Trọng Thủy, khuyên chàng gạt bỏ tham vọng đao binh của Triệu Đà để bảo vệ hạnh phúc gia đình',
                    hint: '+Tâm (Tình nghĩa), -Trí',
                    statChanges: { tam: 15, tri: -5, dung: 5, longDan: -10 },
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
                    text: 'Vung gậy thần bốc từng quả đồi, dựng lũy đá ngăn nước, đồng thời mở kho lương và điều thuyền bè cứu vớt bá tánh',
                    hint: '+Dũng (Khí phách kiên cường), +Lòng Dân',
                    statChanges: { tam: 10, tri: 5, dung: 20, longDan: 20 },
                },
                {
                    id: 'st_c2',
                    text: 'Cưỡi mây xuống giữa tâm bão lũ gặp Thủy Tinh, đề nghị đàm phán phân chia lưu vực sông và nguồn nước tưới tiêu cho dân',
                    hint: '+Trí (Mưu lược hòa hiếu), +Tâm',
                    statChanges: { tam: 20, tri: 15, dung: 5, longDan: 10 },
                },
                {
                    id: 'st_c3',
                    text: 'Lập trận đồ Bát Quái dẫn nước lũ ra biển Đông, đào kênh khơi thông dòng chảy biến hiểm họa thành hệ thống thủy lợi ngàn năm',
                    hint: '+Trí (Đại trí tuệ thủy lợi), +Quốc gia trường tồn',
                    statChanges: { tam: 5, tri: 25, dung: 10, longDan: 15 },
                },
            ],
        },
    },
    {
        slug: 'cay-khe',
        title: 'Cây Khế: Lời Hứa Chim Phượng Hoàng',
        subtitle: 'Vàng bạc vô tận nơi đảo xa hay tấm lòng thảo thơm cứu đời?',
        category: 'Truyện cổ tích thần kỳ',
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
                    text: 'Chỉ nhặt nửa túi ba gang vừa đủ sống, khẩn khoản xin chim thần chở thêm các giống cây ăn quả và lúa nước quý về giúp dân làng thoát nghèo',
                    hint: '+Tâm (Nhân ái tột bậc), +Lòng Dân',
                    statChanges: { tam: 25, tri: 10, dung: 5, longDan: 25 },
                },
                {
                    id: 'ck_c2',
                    text: 'Lấy đúng một túi ba gang vàng ròng, đem về chia đều cho người anh một nửa và thành lập xưởng thủ công tạo kế sinh nhai cho bá tánh',
                    hint: '+Trí (Kiến thiết kinh tế), +Lấy đức báo oán',
                    statChanges: { tam: 15, tri: 20, dung: 10, longDan: 15 },
                },
                {
                    id: 'ck_c3',
                    text: 'Khuyên chim thần đưa người anh cùng ra đảo một lần để tự mắt thấy sự linh diệu của trời đất, từ đó cảm hóa lòng tham của anh',
                    hint: '+Tâm (Tình ruột thịt), +Thử thách',
                    statChanges: { tam: 20, tri: 5, dung: 15, longDan: 5 },
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
 * Gọi Gemini AI để sinh tiếp chương tiếp theo có kiểm soát
 */
async function generateNextChapter({
    storySlug,
    step,
    chosenText,
    previousHistory = [],
    currentStats = { tam: 50, tri: 50, dung: 50, longDan: 50 },
}) {
    const story = getStoryBySlug(storySlug);
    if (!story) {
        throw new Error(`Không tìm thấy câu chuyện với mã: ${storySlug}`);
    }

    const nextStep = (step || 1) + 1;
    const isTargetEnding = nextStep >= 4; // Sau 3-4 bước thì dẫn tới Kết cục (Ending)

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
        const systemPrompt = `Bạn là Nghệ nhân kể chuyện cổ tích dân gian Việt Nam kiêm Game Master của một trò chơi phiêu lưu tương tác (Interactive Heritage Story Engine).
Phong cách: Văn phong trang trọng, gợi cảm, thấm đẫm phong vị cổ tích dân gian Việt Nam.

QUY TẮC BẮT BUỘC:
1. Dựa trên lựa chọn gần nhất của người chơi: "${chosenText}".
2. Lịch sử các bước trước: ${JSON.stringify(previousHistory)}.
3. Chỉ số hiện tại: Tâm: ${currentStats.tam}, Trí: ${currentStats.tri}, Dũng: ${currentStats.dung}, Lòng Dân: ${currentStats.longDan}.
4. Bước hiện tại: ${nextStep}. ${isTargetEnding ? 'ĐÂY LÀ HỒI KẾT (Ending). Hãy viết đoạn kết trọn vẹn, xúc động, đúc kết vận mệnh nhân vật.' : 'Đây là hồi cao trào, mở ra 2 đến 3 lựa chọn tiếp theo.'}

BẠN PHẢI TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON CHUẨN (KHÔNG ĐƯỢC KÈM LỜI DẪN, KHÔNG DÙNG BACKTICKS MARKDOWN):
{
  "chapterTitle": "Tiêu đề của hồi này (VD: Hồi ${nextStep}: ...)",
  "sceneMood": "serene" | "dramatic" | "mystic" | "dark" | "triumphant",
  "storyText": "Nội dung kể chuyện dài khoảng 130 - 180 từ, giàu hình ảnh, mô tả tác động của lựa chọn vừa rồi.",
  "statChanges": {
    "tam": số nguyên từ -15 đến +20 (thay đổi lòng nhân ái),
    "tri": số nguyên từ -15 đến +20 (thay đổi trí tuệ/mưu lược),
    "dung": số nguyên từ -15 đến +20 (thay đổi khí phách/dũng khí),
    "longDan": số nguyên từ -15 đến +20 (thay đổi uy tín/sự ủng hộ của nhân dân)
  },
  "isEnding": ${isTargetEnding},
  "choices": ${
      isTargetEnding
          ? '[]'
          : `[
    {
      "id": "choice_a",
      "text": "Nội dung lựa chọn tiếp theo A",
      "hint": "Gợi ý tác động (VD: +Tâm, +Lòng Dân)"
    },
    {
      "id": "choice_b",
      "text": "Nội dung lựa chọn tiếp theo B",
      "hint": "Gợi ý tác động (VD: +Trí, +Dũng)"
    }
  ]`
  },
  "endingData": ${
      isTargetEnding
          ? `{
    "endingType": "Tên loại kết cục (VD: Đại Thái Bình / Bi Kịch Hào Hùng / Đạo Lý Thâm Sâu)",
    "badgeTitle": "Danh hiệu cổ phong tặng người chơi (VD: Đại Đức Minh Quân / Bồ Tát Tái Thế / Thiết Huyết Anh Hùng)",
    "moralComparison": "Đoạn văn 2-3 câu so sánh: Bản gốc răn dạy điều gì, còn dị bản do người chơi lựa chọn đã đem lại bài học nhân sinh mới mẻ nào."
  }`
          : 'null'
  }
}`;

        for (const model of GEMINI_MODELS) {
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
                                parts: [{ text: `Hãy tạo Hồi ${nextStep} cho dị bản ${story.title} sau khi người chơi chọn: "${chosenText}"` }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        },
                    }),
                    signal: AbortSignal.timeout(9000),
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleaned);

                    // Tính toán cập nhật stats mới
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
                        sourceType: 'gemini_story_engine',
                    };
                }
            } catch (err) {
                console.warn(`[StoryBranch] Model ${model} gặp sự cố:`, err.message);
            }
        }
    }

    // Fallback cục bộ khi không có API key hoặc network ngắt quãng
    return generateLocalFallbackChapter({ story, nextStep, chosenText, currentStats });
}

/**
 * Fallback thông minh nội bộ đảm bảo 100% người dùng luôn chơi được mượt mà
 */
function generateLocalFallbackChapter({ story, nextStep, chosenText, currentStats }) {
    const isEnding = nextStep >= 3;

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
                    id: 'fallback_c1',
                    text: 'Dâng toàn bộ kỹ nghệ dệt lụa cho triều đình để mở rộng nghề dệt khắp non sông',
                    hint: '+Trí tuệ, +Quốc gia thịnh vượng',
                },
                {
                    id: 'fallback_c2',
                    text: 'Giữ nghề dệt làm sản nghiệp chung cho dân nghèo trong làng, sống đời thanh bần giản dị',
                    hint: '+Lòng Dân, +Thanh thản',
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
                    id: 'ts_next_1',
                    text: 'Ký kết Minh Ước Hòa Bình, thiết lập bang giao hòa hiếu lâu dài giữa các nước',
                    hint: '+Trí tuệ, +Thái bình thịnh trị',
                },
                {
                    id: 'ts_next_2',
                    text: 'Từ tạ ấn kiếm Nguyên soái, cùng công chúa trở về dưới gốc đa xưa dạy dân làm nương rẫy',
                    hint: '+Tâm đức, +Khí phách thanh cao',
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
                    id: 'adv_next_1',
                    text: 'Cùng vua cha giương nỏ thần thật phát huy sấm sét bắn tan hạm đội giặc tại sông Cầu',
                    hint: '+Dũng khí, +Bảo quốc an dân',
                },
                {
                    id: 'adv_next_2',
                    text: 'Đích thân ra trước quan ải đối chất cùng Trọng Thủy, khuyên chàng hồi tâm chuyển ý quy thuận Âu Lạc',
                    hint: '+Tâm tình, +Thử thách lòng người',
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
                    id: 'st_next_1',
                    text: 'Lập đàn tế Trời Đất, ký Minh ước Sơn Hà đời đời hòa hợp với loài thủy tộc phương Nam',
                    hint: '+Trí tuệ, +Thái bình thịnh trị',
                },
                {
                    id: 'st_next_2',
                    text: 'Truyền dạy cho muôn dân phương pháp canh tác lúa nước theo mùa lũ, biến hiểm họa thành mùa vàng',
                    hint: '+Lòng Dân, +Bách nghệ phồn vinh',
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
                    id: 'ck_next_1',
                    text: 'Cùng người anh lập Quỹ Tương Tế Làng Xã, trích một phần hoa lợi hàng năm để cứu tế dân nghèo',
                    hint: '+Đại Phúc Đức, +Lòng Dân',
                },
                {
                    id: 'ck_next_2',
                    text: 'Trồng thêm một vạn cây ăn quả quanh bờ đê để chim muông muôn phương tìm về làm tổ, tạo cảnh thái bình',
                    hint: '+Tâm đức, +Thuận hòa tự nhiên',
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
