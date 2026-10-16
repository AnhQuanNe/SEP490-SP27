const Work = require('../models/Work');

/**
 * Ngân hàng câu hỏi trắc nghiệm Di sản Văn học Dân gian Việt Nam
 */
const QUIZ_QUESTION_BANK = [
    {
        id: 'q1',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích',
        difficulty: 'de',
        relatedWorkSlug: 'thach-sanh',
        question: 'Trong truyện cổ tích Thạch Sanh, vật phẩm kỳ diệu nào đã thức tỉnh lòng trắc ẩn của quân giặc 18 nước chư hầu mà không cần đổ máu?',
        options: [
            'Búa thần đốn củi của cha để lại',
            'Cung tên vàng bắn rụng đại bàng',
            'Tiếng đàn thần giải oan và cảm hóa',
            'Chiếc gương thần nhìn thấu tâm can',
        ],
        correctIndex: 2,
        explanation: 'Tiếng đàn của Thạch Sanh gảy lên bên bờ sông giáp ranh khiến quân sĩ 18 nước chư hầu xúc động, nhớ cha mẹ, vợ con ở quê nhà nên bủn rủn tay chân, không đánh mà tan. Đây là biểu tượng của tinh thần yêu chuộng hòa bình của dân tộc.',
    },
    {
        id: 'q2',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'thach-sanh',
        question: 'Hình tượng "Niêu cơm thần" trong Thạch Sanh tượng trưng cho phẩm chất và khát vọng gì của nhân dân Việt Nam?',
        options: [
            'Khát vọng no ấm, lòng hiếu khách và đức tính vị tha vô tận',
            'Sự thịnh vượng của vương triều nhà vua đương thời',
            'Phép thuật thần thông của thái tử con trời Ngọc Hoàng',
            'Nền nông nghiệp lúa nước phát triển vượt bậc',
        ],
        correctIndex: 0,
        explanation: 'Niêu cơm nhỏ xíu nhưng ăn mãi không bao giờ vơi tượng trưng cho tiềm lực dồi dào, đức tính hiếu khách, lòng nhân ái bao la và khát vọng thái bình muôn thuở của nhân dân lao động.',
    },
    {
        id: 'q3',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        difficulty: 'de',
        relatedWorkSlug: 'thanh-giong',
        question: 'Tại sao sau khi đánh tan giặc Ân, tráng sĩ làng Gióng lại cởi bỏ áo giáp sắt rồi cưỡi ngựa bay thẳng về trời?',
        options: [
            'Vì bị thương nặng trong lúc giao tranh dữ dội',
            'Vì sợ triều đình truy hỏi gốc tích thần tiên',
            'Thể hiện tinh thần xả thân vì nước vô tư, không màng danh lợi bổng lộc',
            'Để tìm lại mẹ già đã khuất núi',
        ],
        correctIndex: 2,
        explanation: 'Hành động cởi giáp bay về trời nâng hình tượng Gióng thành vị anh hùng vô tư, thuần khiết — xả thân vì Tổ quốc khi lâm nguy và trở về cõi bất tử khi non sông đã sạch bóng quân thù.',
    },
    {
        id: 'q4',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Khởi nguyên',
        difficulty: 'de',
        relatedWorkSlug: 'son-tinh-thuy-tinh',
        question: 'Cuộc giao tranh bất phân thắng bại hàng năm giữa Sơn Tinh và Thủy Tinh phản ánh hiện thực lịch sử nào của cư dân Văn Lang?',
        options: [
            'Nạn cháy rừng kinh hoàng ở vùng núi Tản Viên',
            'Hiện tượng lũ lụt hàng năm ở đồng bằng sông Hồng và ý chí trị thủy kiên cường',
            'Cuộc chiến tranh giành lãnh thổ giữa các bộ tộc đồng bằng và miền núi',
            'Thời tiết mùa đông giá rét khắc nghiệt ở miền Bắc',
        ],
        correctIndex: 1,
        explanation: '"Nước dâng lên bao nhiêu, núi cao lên bấy nhiêu" là hình ảnh hoành tráng ca ngợi ý chí kiên cường, quật khởi của tổ tiên người Việt cổ trong công cuộc đắp đê, ngăn lũ, trị thủy bảo vệ mùa màng.',
    },
    {
        id: 'q5',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'nam-quoc-son-ha',
        question: 'Bài thơ "Nam quốc sơn hà" vang lên trên sông Như Nguyệt năm 1077 được coi là bản Tuyên ngôn Độc lập đầu tiên của nước ta vì lý do cốt lõi nào?',
        options: [
            'Vì bài thơ được viết bằng chữ Hán chuẩn mực nhất',
            'Vì khẳng định chủ quyền lãnh thổ thiêng liêng đã được định phận tại "Thiên thư"',
            'Vì là bài thơ dài nhất thời kỳ triều đại nhà Lý',
            'Vì bài thơ do chính vua Lý Thái Tổ trực tiếp sáng tác',
        ],
        correctIndex: 1,
        explanation: '"Nam quốc sơn hà Nam đế cư / Tiệt nhiên định phận tại thiên thư" dõng dạc tuyên ngôn quyền độc lập tự chủ và ranh giới bờ cõi của nước Nam là chân lý thiêng liêng bất khả xâm phạm.',
    },
    {
        id: 'q6',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'ca-dao-dong-bang-bac-bo',
        question: 'Hoàn thành câu ca dao răn dạy về chữ Hiếu và ơn nghĩa sinh thành: "Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn ..."',
        options: [
            'chảy xiết',
            'chảy ra',
            'mát trong',
            'dâng đầy',
        ],
        correctIndex: 1,
        explanation: '"Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn chảy ra" là câu ca dao kinh điển ví công đức trời biển của đấng sinh thành như dòng suối vô tận không bao giờ cạn.',
    },
    {
        id: 'q7',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'truyen-kieu',
        question: 'Tác phẩm "Truyện Kiều" (Đoạn trường tân thanh) của Đại thi hào Nguyễn Du viết theo thể thơ truyền thống nào của dân tộc?',
        options: [
            'Thơ Song thất lục bát',
            'Thơ Lục bát',
            'Thơ Thất ngôn bát cú Đường luật',
            'Thơ Tự do',
        ],
        correctIndex: 1,
        explanation: 'Truyện Kiều gồm 3.254 câu thơ lục bát, là đỉnh cao chói lọi nhất của nghệ thuật thơ ca và ngôn ngữ tiếng Việt trong lịch sử văn học dân tộc.',
    },
    {
        id: 'q8',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'tam-cam',
        question: 'Trong truyện Tấm Cám, quá trình hóa thân liên tiếp của cô Tấm (chim Vàng Anh -> cây Xoan đào -> khung cửi -> quả Thị) biểu thị điều gì?',
        options: [
            'Tấm biết nhiều phép biến hóa thần thông của Bụt',
            'Sức sống mãnh liệt, bất diệt của cái Thiện và tinh thần đấu tranh không khoan nhượng',
            'Mẹ con Cám có lòng bao dung cho Tấm cơ hội chuộc lỗi',
            'Ước mơ sống ẩn dật nơi thôn quê thanh bình',
        ],
        correctIndex: 1,
        explanation: 'Những lần hóa thân chứng minh cái Thiện dù bị trù dập đến đâu vẫn tái sinh mạnh mẽ hơn, quyết liệt hơn để giành lại hạnh phúc và trừng trị cái ác.',
    },
    {
        id: 'q9',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'hich-tuong-si',
        question: 'Trong "Hịch tướng sĩ", câu nói "Ta thường tới bữa quên ăn, nửa đêm vỗ gối, ruột đau như cắt, nước mắt đầm đìa..." bộc lộ tâm tư gì của Trần Hưng Đạo?',
        options: [
            'Nỗi xót xa khi nhìn thấy gia đình ly tán vì chiến tranh',
            'Lòng căm thù giặc tột cùng và nỗi đau đáu vì vận mệnh giang sơn xã tắc',
            'Cảm giác mệt mỏi sau nhiều ngày hành quân gian khổ',
            'Nỗi ân hận vì chưa kịp huấn luyện binh sĩ chu đáo',
        ],
        correctIndex: 1,
        explanation: 'Đoạn văn bộc lộ tấm lòng yêu nước thương dân nồng nàn, ý chí quyết tâm đền nợ nước, trả thù nhà cao độ của vị Tiết chế Quốc công trước họa xâm lăng của quân Nguyên Mông.',
    },
    {
        id: 'q10',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'ca-dao-dong-bang-bac-bo',
        question: 'Câu tục ngữ "Bầu ơi thương lấy bí cùng / Tuy rằng khác giống nhưng chung một giàn" mang ý nghĩa giáo dục cốt lõi nào?',
        options: [
            'Kinh nghiệm trồng trọt hoa màu đan xen của nông dân',
            'Tinh thần đoàn kết, tương thân tương ái giữa những người cùng một quê hương xứ sở',
            'Cần phải tiết kiệm lương thực phòng khi mất mùa',
            'Khuyên mọi người nên sống khép mình, không giao thiệp',
        ],
        correctIndex: 1,
        explanation: 'Câu ca dao mượn hình ảnh hai giống cây thân leo cùng chung giàn để nhắc nhở con người dù khác nhau về hoàn cảnh vẫn cần yêu thương, đùm bọc lẫn nhau.',
    },
];

/**
 * Lấy danh sách câu hỏi trắc nghiệm (ẩn đáp án đúng để client chơi)
 */
const getQuestions = async ({ category = 'all', count = 5 }) => {
    let pool = [...QUIZ_QUESTION_BANK];

    if (category && category !== 'all') {
        pool = pool.filter((q) => q.category === category);
    }

    // Nếu không đủ số lượng câu trong category thì lấy từ toàn bộ pool
    if (pool.length < count) {
        pool = [...QUIZ_QUESTION_BANK];
    }

    // Shuffle câu hỏi
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, pool.length));

    // Lấy thông tin tóm tắt của Work liên quan
    const slugs = selected.map((q) => q.relatedWorkSlug).filter(Boolean);
    const relatedWorks = await Work.find({ slug: { $in: slugs } })
        .select('title slug category categoryName')
        .lean();

    const workMap = {};
    for (const w of relatedWorks) {
        workMap[w.slug] = w;
    }

    // Ẩn correctIndex và explanation trước khi trả về cho client
    return selected.map((q) => ({
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        relatedWork: workMap[q.relatedWorkSlug] || null,
    }));
};

/**
 * Chấm điểm bài thi và trả về kết quả kèm danh hiệu & giải thích
 */
const submitQuiz = async ({ answers }) => {
    if (!Array.isArray(answers)) {
        throw new Error('Dữ liệu bài nộp không hợp lệ');
    }

    const questionMap = {};
    for (const q of QUIZ_QUESTION_BANK) {
        questionMap[q.id] = q;
    }

    let correctCount = 0;
    const details = [];

    for (const ans of answers) {
        const original = questionMap[ans.questionId];
        if (!original) continue;

        const isCorrect = original.correctIndex === ans.selectedIndex;
        if (isCorrect) correctCount += 1;

        details.push({
            questionId: original.id,
            question: original.question,
            category: original.category,
            categoryName: original.categoryName,
            userSelectedIndex: ans.selectedIndex,
            userAnswer: original.options[ans.selectedIndex] || 'Chưa chọn',
            correctIndex: original.correctIndex,
            correctAnswer: original.options[original.correctIndex],
            isCorrect,
            explanation: original.explanation,
            relatedWorkSlug: original.relatedWorkSlug,
        });
    }

    const totalQuestions = answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Xác định Danh hiệu Di sản (Heritage Badge)
    let badge = {
        title: 'Tập Sự Tri Thức',
        description: 'Hãy tiếp tục đọc thêm các câu chuyện dân gian để mở rộng kho tàng tri thức!',
        tier: 'bronze',
        icon: 'Scroll',
    };

    if (score === 100) {
        badge = {
            title: 'Trạng Nguyên Văn Học',
            description: 'Tuyệt đỉnh uyên bác! Bạn nắm trọn tinh hoa và chiều sâu triết lý của di sản dân tộc!',
            tier: 'gold',
            icon: 'Crown',
        };
    } else if (score >= 80) {
        badge = {
            title: 'Bảng Nhãn Di Sản',
            description: 'Vốn hiểu biết sâu rộng! Bạn am tường các sự tích và nét đẹp đạo lý cổ truyền!',
            tier: 'silver',
            icon: 'Award',
        };
    } else if (score >= 60) {
        badge = {
            title: 'Thám Hoa Dân Gian',
            description: 'Rất ấn tượng! Bạn có nền tảng vững vàng về văn học dân gian nước nhà.',
            tier: 'emerald',
            icon: 'Sparkles',
        };
    } else if (score >= 40) {
        badge = {
            title: 'Tú Tài Đồng Môn',
            description: 'Khá tốt! Bạn đã nắm được những câu chuyện cốt lõi của tiền nhân.',
            tier: 'amber',
            icon: 'BookOpen',
        };
    }

    return {
        totalQuestions,
        correctCount,
        score,
        passed: score >= 60,
        badge,
        details,
    };
};

module.exports = {
    getQuestions,
    submitQuiz,
};
