/**
 * Learning Path Domain Constants & Pedagogical Configurations
 * Chứa danh mục chủ đề học tập, bộ lọc MongoDB, prompt Gemini và động cơ tạo bài học sư phạm mẫu.
 */

const GEMINI_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
];

const AVAILABLE_TOPIC_CONFIGS = [
    {
        id: 'ca-dao-tuc-ngu',
        title: 'Ca dao & Tục ngữ Việt Nam',
        category: 'ca-dao',
        description: 'Khám phá triết lý dân gian, đạo lý sống, tình yêu quê hương và gia đình qua những câu đúc kết truyền đời.',
        suggestedDays: [3, 7, 10, 14],
        icon: 'BookOpen',
        badge: 'Phổ biến nhất',
        calculateCount: (countMap) => (countMap['ca-dao'] || 0) + (countMap['tuc-ngu'] || 0),
    },
    {
        id: 'tuc-ngu',
        title: 'Tục ngữ & Tri thức Dân gian',
        category: 'tuc-ngu',
        description: 'Tập trung vào các câu tục ngữ đúc kết kinh nghiệm sống, đạo đức đối nhân xử thế và lao động.',
        suggestedDays: [3, 5, 7, 10],
        icon: 'Award',
        badge: 'Đặc sắc',
        calculateCount: (countMap) => countMap['tuc-ngu'] || 0,
    },
    {
        id: 'long-biet-on',
        title: 'Chuyên đề: Lòng biết ơn & Cội nguồn',
        category: 'thematic',
        description: 'Chùm ca dao, tục ngữ răn dạy lòng hiếu kính cha mẹ, tri ân thầy cô và nhớ ơn tiên tổ.',
        suggestedDays: [3, 5, 7],
        icon: 'Heart',
        badge: 'Ý nghĩa đạo lý',
        calculateCount: () => 8,
    },
    {
        id: 'doan-ket-nhan-ai',
        title: 'Chuyên đề: Đoàn kết & Tương thân tương ái',
        category: 'thematic',
        description: 'Tôn vinh tinh thần lá lành đùm lá rách, tình đồng bào và tình cảm keo sơn gắn kết dân tộc.',
        suggestedDays: [3, 5, 7],
        icon: 'Sparkles',
        badge: 'Nhân văn',
        calculateCount: () => 7,
    },
    {
        id: 'y-chi-nghi-luc',
        title: 'Chuyên đề: Ý chí & Rèn luyện nhân cách',
        category: 'thematic',
        description: 'Những lời răn về lòng kiên định vượt khó, học hỏi tri thức và hoàn thiện phẩm chất.',
        suggestedDays: [3, 5, 7],
        icon: 'Trophy',
        badge: 'Cảm hứng',
        calculateCount: () => 6,
    },
    {
        id: 'van-hoc-dan-gian',
        title: 'Toàn cảnh Di sản Dân gian Việt Nam',
        category: 'dan-gian',
        description: 'Hành trình kết hợp thần thoại, truyền thuyết, cổ tích và ca dao tục ngữ tiêu biểu.',
        suggestedDays: [7, 14, 21],
        icon: 'Compass',
        badge: 'Toàn diện',
        calculateCount: (countMap) =>
            (countMap['ca-dao'] || 0) +
            (countMap['tuc-ngu'] || 0) +
            (countMap['co-tich'] || 0) +
            (countMap['truyen-thuyet'] || 0) +
            (countMap['than-thoai'] || 0),
    },
    {
        id: 'all',
        title: 'Tất cả Kho tàng Văn hóa & Văn học',
        category: 'all',
        description: 'Tự do tùy biến với toàn bộ kho tàng tác phẩm từ dân gian đến trung đại và hiện đại.',
        suggestedDays: [7, 14, 21, 30],
        icon: 'Scroll',
        badge: 'Đầy đủ',
        calculateCount: (countMap, total) => total,
    },
];

/**
 * Trả về query filter MongoDB tương ứng với từng chủ đề
 */
function getTopicCandidateFilter(topic) {
    const filter = { status: 'published' };

    if (topic === 'ca-dao-tuc-ngu' || topic === 'ca-dao') {
        filter.category = { $in: ['ca-dao', 'tuc-ngu'] };
    } else if (topic === 'tuc-ngu') {
        filter.category = 'tuc-ngu';
    } else if (topic === 'long-biet-on') {
        filter.$or = [
            { topic: new RegExp('Lòng biết ơn|Hiếu|Cội nguồn', 'i') },
            { tags: { $in: ['Lòng biết ơn', 'Đạo lý', 'Tri ân', 'Uống nước nhớ nguồn'] } },
            { slug: { $in: ['uong-nuoc-nho-nguon', 'an-qua-nho-ke-trong-cay', 'cong-cha-nhu-nui-thai-son', 'me-gia-nhu-chuoi-ba-huong', 'on-cha-nang-lam-ai-oi'] } },
        ];
    } else if (topic === 'doan-ket-nhan-ai') {
        filter.$or = [
            { topic: new RegExp('Đoàn kết|Nhân ái|Vị tha', 'i') },
            { tags: { $in: ['Đoàn kết', 'Nhân ái', 'Bầu bí', 'Tương thân tương ái', 'Đồng bào'] } },
            { slug: { $in: ['bau-oi-thuong-lay-bi-cung', 'la-lanh-dum-la-rach', 'nhieu-dieu-phu-lay-gia-guong', 'thuong-nguoi-nhu-the-thuong-than', 'ga-cung-mot-me-cho-hoai-da-nhau'] } },
        ];
    } else if (topic === 'y-chi-nghi-luc') {
        filter.$or = [
            { topic: new RegExp('Ý chí|Nghị lực|Học tập|Rèn luyện', 'i') },
            { slug: { $in: ['co-cong-mai-sat-co-ngay-nen-kim', 'hoc-thay-khong-tay-hoc-ban', 'gan-muc-thi-den-gan-den-thi-rang', 'loi-noi-chang-mat-tien-mua'] } },
        ];
    } else if (topic === 'van-hoc-dan-gian' || topic === 'dan-gian') {
        filter.category = { $in: ['than-thoai', 'truyen-thuyet', 'co-tich', 'ca-dao', 'tuc-ngu'] };
    }

    return filter;
}

/**
 * Xây dựng prompt và hướng dẫn hệ thống cho AI Gemini
 */
function buildLearningPathPrompts({ topicLabel, goal, totalDays, dailyMinutes, worksPayload }) {
    const systemInstruction = `Bạn là Chuyên gia Sư phạm Di sản Văn hóa Việt Nam của nền tảng VietHeritage AI.
NHIỆM VỤ:
Tổ chức một lộ trình học tập cá nhân hóa kéo dài đúng ${totalDays} ngày cho người dùng dựa trên danh sách các tác phẩm CÓ THẬT từ cơ sở dữ liệu được cung cấp dưới đây.

QUY TẮC BẮT BUỘC (CRITICAL RULES):
1. TUYỆT ĐỐI KHÔNG tự sáng tác hay bịa thêm bất kỳ câu ca dao, tục ngữ hoặc tác phẩm nào. Mọi tác phẩm trong lộ trình PHẢI lấy từ danh sách [DANH SÁCH TÁC PHẨM CÓ THẬT].
2. Trong mỗi ngày học, trường "workIds" PHẢI chứa đúng chuỗi MongoDB ID từ danh sách (ví dụ: "6ad48775faacadf6370cf7a1"). Không tự sinh ID mới.
3. Sắp xếp lộ trình theo nguyên tắc sư phạm từ cơ bản đến nâng cao (FR-3):
   - Các ngày đầu: Làm quen tác phẩm gần gũi, giải thích từ ngữ và nghĩa đen.
   - Các ngày giữa: Đi sâu vào nghĩa bóng, hình tượng nghệ thuật và triết lý nhân sinh.
   - Các ngày sau: Bối cảnh văn hóa, đạo lý ứng xử xã hội và liên hệ thực tiễn.
   - Ngày cuối cùng: Ôn tập tổng kết và bài tập vận dụng.
4. Mỗi ngày học gồm:
   - "day": số thứ tự từ 1 đến ${totalDays}.
   - "title": Tiêu đề bài học hấp dẫn, mang chất văn hóa (ví dụ: "Ngày 1: Cội nguồn và Đạo lý Ơn sinh thành").
   - "objective": Mục tiêu bài học cụ thể.
   - "phase": 'basic' | 'intermediate' | 'advanced' | 'synthesis'.
   - "workIds": Mảng chứa 1 hoặc 2 ID tác phẩm từ danh sách được cung cấp.
   - "aiAnalysis": Lời bình giảng, phân tích sư phạm cô đọng, giàu cảm xúc (khoảng 2-3 đoạn ngắn).
   - "activity": Một hoạt động học tập thực tế ngắn (ví dụ: "Ghi chép lại một câu chuyện trong gia đình liên quan đến lời răn này").
   - "practiceQuestions": Mảng gồm 2-3 câu hỏi trắc nghiệm kiểm tra hiểu biết về tác phẩm trong ngày, mỗi câu có:
     * "question": Nội dung câu hỏi.
     * "options": Mảng 4 lựa chọn.
     * "correctIndex": Chỉ số đáp án đúng (0, 1, 2, hoặc 3).
     * "explanation": Giải thích vì sao đáp án đó đúng dựa trên triết lý tác phẩm.
   - "estimatedMinutes": Thời lượng học khoảng ${dailyMinutes} phút.
5. Định dạng đầu ra: BẮT BUỘC trả về định dạng JSON thuần túy (không kèm markdown ngoài khối JSON).`;

    const userPrompt = `[THÔNG TIN NGƯỜI HỌC]:
- Chủ đề: ${topicLabel}
- Mục tiêu cá nhân: ${goal}
- Thời lượng: ${totalDays} ngày (${dailyMinutes} phút/ngày)

[DANH SÁCH TÁC PHẨM CÓ THẬT TRONG DATABASE (${worksPayload.length} tác phẩm)]:
${JSON.stringify(worksPayload, null, 2)}

Hãy xây dựng lộ trình ${totalDays} ngày dạng JSON theo schema:
{
  "title": "Tiêu đề lộ trình phù hợp với mục tiêu người dùng",
  "days": [
    {
      "day": 1,
      "title": "...",
      "objective": "...",
      "phase": "basic",
      "workIds": ["id_chinh_xac_tu_danh_sach"],
      "aiAnalysis": "...",
      "activity": "...",
      "practiceQuestions": [
        {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0,
          "explanation": "..."
        }
      ],
      "estimatedMinutes": ${dailyMinutes}
    }
  ]
}`;

    return { systemInstruction, userPrompt };
}

/**
 * Động cơ Sư phạm Dự phòng Nội bộ (Fallback Curriculum Synthesizer):
 * Bảo đảm 100% hoạt động tin cậy và không phụ thuộc vào Gemini khi mạng nghẽn hoặc API hết quota.
 */
function synthesizeCurriculumFallback({ topicLabel, goal, totalDays, dailyMinutes, candidateWorks }) {
    const availableWorks = [...candidateWorks];
    const numDays = Math.min(totalDays, Math.max(availableWorks.length, 1));

    const days = [];
    for (let i = 0; i < numDays; i++) {
        const dayNum = i + 1;
        const progressRatio = (i + 1) / numDays;

        let phase = 'basic';
        let phaseTitle = 'Khởi động & Làm quen';
        if (progressRatio > 0.75) {
            phase = 'synthesis';
            phaseTitle = 'Vận dụng & Tổng kết';
        } else if (progressRatio > 0.5) {
            phase = 'advanced';
            phaseTitle = 'Đạo lý & Giá trị sống';
        } else if (progressRatio > 0.25) {
            phase = 'intermediate';
            phaseTitle = 'Nghĩa bóng & Ẩn dụ văn hóa';
        }

        const workIndex = i % availableWorks.length;
        const primaryWork = availableWorks[workIndex];
        const dayWorkIds = [primaryWork._id.toString()];

        const practiceQuestions = [
            {
                questionId: `day_${dayNum}_q1`,
                question: `Trong tác phẩm/câu "${primaryWork.title}", ý nghĩa nghĩa đen cơ bản nhất là gì?`,
                options: [
                    primaryWork.literalMeaning || `Hình ảnh cụ thể, trực quan được ông cha mượn từ đời sống để diễn đạt tư tưởng.`,
                    `Một quy định bắt buộc trong luật pháp phong kiến cổ truyền.`,
                    `Một câu chuyện thần thoại huyền ảo không liên quan đến đời thực.`,
                    `Một kinh nghiệm chữa bệnh dân gian thời xưa.`,
                ],
                correctIndex: 0,
                explanation: primaryWork.literalMeaning
                    ? `Ý nghĩa nghĩa đen: ${primaryWork.literalMeaning}`
                    : `Câu tục ngữ/ca dao mượn hình ảnh chân thực từ đời sống lao động để tạo nền tảng biểu đạt.`,
                culturalContext: primaryWork.historicalContext || '',
                workId: primaryWork._id,
                workTitle: primaryWork.title,
            },
            {
                questionId: `day_${dayNum}_q2`,
                question: `Tầng nghĩa bóng và bài học nhân sinh sâu sắc nhất mà "${primaryWork.title}" muốn răn dạy là gì?`,
                options: [
                    `Khuyên con người chỉ nên chú trọng vào lợi ích vật chất trước mắt.`,
                    primaryWork.lesson || primaryWork.figurativeMeaning || `Răn dạy con người sống có trước có sau, biết ơn cội nguồn và trân trọng giá trị đạo đức làm người.`,
                    `Khuyên con người không cần quan tâm đến mối quan hệ xung quanh.`,
                    `Mô tả lại hiện tượng thiên nhiên đơn thuần mà không mang ý nghĩa đạo lý.`,
                ],
                correctIndex: 1,
                explanation: primaryWork.lesson
                    ? `Bài học triết lý: ${primaryWork.lesson}`
                    : (primaryWork.figurativeMeaning ? `Ý nghĩa nghĩa bóng: ${primaryWork.figurativeMeaning}` : 'Lời răn dạy sâu sắc về đạo đức và nhân cách.'),
                culturalContext: primaryWork.thematicMeaning || '',
                workId: primaryWork._id,
                workTitle: primaryWork.title,
            },
        ];

        const dayTitle = `Ngày ${dayNum}: ${phaseTitle} — ${primaryWork.title}`;
        const objective = phase === 'basic'
            ? `Làm quen với nguyên văn, hiểu rõ câu chữ và bối cảnh đời sống của "${primaryWork.title}".`
            : phase === 'intermediate'
                ? `Giải mã tầng nghĩa bóng, nghệ thuật ẩn dụ và hình tượng văn hóa trong "${primaryWork.title}".`
                : phase === 'advanced'
                    ? `Phân tích sâu sắc bài học đạo lý, ứng xử nhân văn và giá trị văn hóa qua "${primaryWork.title}".`
                    : `Tổng kết tri thức, đúc rút bài học thực tiễn và liên hệ với cuộc sống hiện đại qua "${primaryWork.title}".`;

        const aiAnalysis = `Chào mừng bạn đến với bài học Ngày ${dayNum}! 
Hôm nay chúng ta cùng chiêm nghiệm "${primaryWork.title}". ${primaryWork.summary || ''}
${primaryWork.figurativeMeaning ? `Ẩn sâu bên dưới là triết lý: "${primaryWork.figurativeMeaning}".` : ''}
${primaryWork.lesson ? `Tiền nhân gửi gắm bài học đắt giá: "${primaryWork.lesson}".` : ''}
Hãy đọc kỹ phần nguyên văn, chiêm nghiệm và hoàn thành câu hỏi luyện tập bên dưới nhé!`;

        const activity = phase === 'basic'
            ? `Đọc to câu văn/câu thơ 3 lần, suy ngẫm về hình ảnh quen thuộc được nhắc đến và ghi nhớ nguyên văn.`
            : phase === 'intermediate'
                ? `Tìm một tình huống trong đời sống thực tế mà câu nói này có thể được áp dụng một cách ý nghĩa nhất.`
                : phase === 'advanced'
                    ? `Chia sẻ hoặc viết lại một kỷ niệm ngắn của bản thân hoặc gia đình phản ánh đúng bài học đạo lý này.`
                    : `Đúc kết lại 3 điều tâm đắc nhất bạn học được và đặt mục tiêu ứng dụng vào cách ứng xử hàng ngày.`;

        days.push({
            day: dayNum,
            title: dayTitle,
            objective,
            phase,
            workIds: dayWorkIds,
            aiAnalysis,
            activity,
            practiceQuestions,
            estimatedMinutes: dailyMinutes,
        });
    }

    return {
        title: `Lộ trình ${numDays} ngày: ${topicLabel} — Hướng tới ${goal.slice(0, 50)}`,
        days,
    };
}

module.exports = {
    GEMINI_MODELS,
    AVAILABLE_TOPIC_CONFIGS,
    getTopicCandidateFilter,
    buildLearningPathPrompts,
    synthesizeCurriculumFallback,
};
