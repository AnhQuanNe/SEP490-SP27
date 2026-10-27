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
