const Work = require('../models/Work');
const QuizProgress = require('../models/QuizProgress');
const QuizQuestion = require('../models/QuizQuestion');
const quizQuestionsData = require('../seeds/quizQuestions.data');

/**
 * Danh mục toàn bộ các Huy hiệu Thành tích (Achievement Badges)
 */
const ALL_ACHIEVEMENT_BADGES = [
    {
        id: 'first_quiz',
        title: 'Tân thủ Di sản',
        description: 'Hoàn thành lượt thi trắc nghiệm đầu tiên',
        icon: 'BookOpen',
        category: 'general',
        criterion: 'Hoàn thành 1 lượt trắc nghiệm bất kỳ',
    },
    {
        id: 'master_ca_dao',
        title: 'Am hiểu Ca dao',
        description: 'Trả lời đúng từ 5 câu Ca dao & Tục ngữ trở lên',
        icon: 'Sparkles',
        category: 'ca-dao',
        criterion: 'Đúng >= 5 câu thể loại Ca dao - Tục ngữ',
    },
    {
        id: 'master_tuc_ngu',
        title: 'Bậc thầy Tục ngữ',
        description: 'Trả lời đúng từ 10 câu Ca dao & Tục ngữ',
        icon: 'Award',
        category: 'ca-dao',
        criterion: 'Đúng >= 10 câu thể loại Ca dao - Tục ngữ',
    },
    {
        id: 'master_co_tich',
        title: 'Học giả Cổ tích',
        description: 'Trả lời đúng từ 5 câu Truyện cổ tích trở lên',
        icon: 'Crown',
        category: 'co-tich',
        criterion: 'Đúng >= 5 câu thể loại Truyện cổ tích',
    },
    {
        id: 'master_truyen_thuyet',
        title: 'Hào khí Truyền thuyết',
        description: 'Trả lời đúng từ 5 câu Thần thoại & Truyền thuyết',
        icon: 'Flame',
        category: 'truyen-thuyet',
        criterion: 'Đúng >= 5 câu Thần thoại & Truyền thuyết',
    },
    {
        id: 'master_trung_dai',
        title: 'Uyên bác Văn học Trung đại',
        description: 'Trả lời đúng từ 5 câu Văn học Trung đại trở lên',
        icon: 'Scroll',
        category: 'trung-dai',
        criterion: 'Đúng >= 5 câu thể loại Văn học Trung đại',
    },
    {
        id: 'perfect_score',
        title: 'Trạng nguyên Toàn năng',
        description: 'Đạt điểm tuyệt đối 100/100 trong một bài thi',
        icon: 'Trophy',
        category: 'special',
        criterion: 'Đạt điểm số 100 trong một lượt thi',
    },
    {
        id: 'daily_master',
        title: 'Chiến binh Bền bỉ',
        description: 'Hoàn thành Thử thách Hàng ngày (Daily Challenge)',
        icon: 'Calendar',
        category: 'daily',
        criterion: 'Vượt qua Thử thách Ngày đạt từ 60 điểm trở lên',
    },
    {
        id: 'quiz_veteran',
        title: 'Bách gia Chư tử',
        description: 'Hoàn thành từ 5 lượt thi trắc nghiệm trở lên',
        icon: 'Medal',
        category: 'milestone',
        criterion: 'Hoàn thành >= 5 bài thi trắc nghiệm',
    },
    {
        id: 'q11',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'uong-nuoc-nho-nguon',
        question: 'Câu tục ngữ "Uống nước nhớ nguồn" đúc kết truyền thống đạo lý tốt đẹp nào của dân tộc Việt Nam?',
        options: [
            'Lòng biết ơn, tri ân sâu sắc đối với tổ tiên, cội nguồn và những người có công',
            'Kinh nghiệm tìm nguồn nước sạch trong sinh hoạt nông thôn',
            'Ý thức bảo vệ môi trường sông hồ tự nhiên',
            'Khuyên mọi người tiết kiệm tài nguyên thiên nhiên',
        ],
        correctIndex: 0,
        explanation: '"Uống nước nhớ nguồn" nhắc nhở mỗi thế hệ khi được hưởng thụ thành quả phải luôn ghi nhớ công lao khai phá, dựng xây của các bậc tiền nhân đi trước.',
    },
    {
        id: 'q12',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'an-qua-nho-ke-trong-cay',
        question: 'Cặp hình ảnh "Ăn quả" và "Kẻ trồng cây" mang ý nghĩa ẩn dụ sâu xa gì?',
        options: [
            'Thành quả ngọt ngào của ngày hôm nay gắn liền với mồ hôi công sức vun trồng của thế hệ đi trước',
            'Khuyên người nông dân nên chăm sóc các giống cây ăn quả',
            'Nói về quy luật phát triển tự nhiên của cây cối',
            'Hướng dẫn kỹ thuật thu hoạch hoa quả đúng mùa vụ',
        ],
        correctIndex: 0,
        explanation: '"Ăn quả nhớ kẻ trồng cây" là bài học đạo nghĩa ân tình, nhắc nhở bổn phận biết ơn người đã đổ công sức tạo nên những giá trị tốt đẹp cho đời.',
    },
    {
        id: 'q13',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'co-cong-mai-sat-co-ngay-nen-kim',
        question: 'Ý nghĩa triết lý nhân sinh của câu tục ngữ "Có công mài sắt, có ngày nên kim" là gì?',
        options: [
            'Lòng kiên trì, nhẫn nại và ý chí bền bỉ sẽ giúp con người vượt qua mọi khó khăn để thành công',
            'Kỹ nghệ rèn đúc sắt thép thủ công của các làng nghề truyền thống',
            'Khuyên con người chỉ nên làm những việc nhỏ bé vừa sức',
            'Cần phải có nhiều công cụ bằng sắt thì mới làm nên việc lớn',
        ],
        correctIndex: 0,
        explanation: 'Hình ảnh thỏi sắt lớn được mài giũa thành cây kim nhỏ bé tượng trưng cho sự tôi luyện phi thường của ý chí con người trước thử thách cuộc đời.',
    },
    {
        id: 'q14',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'la-lanh-dum-la-rach',
        question: 'Tinh thần "Lá lành đùm lá rách" trong văn hóa người Việt thể hiện truyền thống nào?',
        options: [
            'Tinh thần tương thân tương ái, cưu mang giúp đỡ những hoàn cảnh khó khăn hơn mình',
            'Kinh nghiệm gói bánh chưng bánh tét ngày Tết cổ truyền',
            'Cách lựa chọn lá lợp mái nhà tránh mưa bão ở nông thôn',
            'Khuyên mọi người tiết kiệm chi tiêu gia đình',
        ],
        correctIndex: 0,
        explanation: '"Lá lành đùm lá rách" là biểu tượng sáng ngời của tình đồng bào ruột thịt, sẵn sàng sẻ chia giúp đỡ nhau lúc hoạn nạn nguy nan.',
    },
    {
        id: 'q15',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'hoc-thay-khong-tay-hoc-ban',
        question: 'Câu tục ngữ "Học thầy không tày học bạn" nhấn mạnh phương pháp học tập nào?',
        options: [
            'Tầm quan trọng của việc học hỏi, thảo luận và trao đổi tri thức cùng bạn bè trang lứa',
            'Khuyên học sinh không cần nghe lời thầy cô giáo',
            'Cho rằng học bạn dễ hơn và không bị áp lực thi cử',
            'Chỉ ra bạn bè bao giờ cũng giỏi hơn người thầy',
        ],
        correctIndex: 0,
        explanation: 'Câu tục ngữ không hạ thấp vai trò người thầy mà khuyên người học cần biết mở rộng tương tác, học hỏi lẫn nhau cùng bạn bè để mở mang kiến thức.',
    },
    {
        id: 'q16',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'nhieu-dieu-phu-lay-gia-guong',
        question: 'Hai câu thơ: "Nhiễu điều phủ lấy giá gương / Người trong một nước phải thương nhau cùng" khuyên răn điều gì?',
        options: [
            'Tình đoàn kết keo sơn, gắn bó máu thịt giữa các dân tộc anh em trên dải đất Việt Nam',
            'Cách bài trí bàn thờ gia tiên trang nghiêm vào ngày lễ tết',
            'Kinh nghiệm may vá trang phục bằng vải gấm lụa quý',
            'Quy định pháp luật của triều đình về trật tự an ninh xã hội',
        ],
        correctIndex: 0,
        explanation: 'Hình ảnh chiếc khăn nhiễu đỏ che chở giá gương tượng trưng cho sự đùm bọc, đồng lòng che chở lẫn nhau của những người con cùng chung một bọc mẹ Âu Cơ.',
    },
    {
        id: 'q17',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Khởi nguyên',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'son-tinh-thuy-tinh',
        question: 'Trong câu chuyện Sơn Tinh - Thủy Tinh, vua Hùng thứ 18 đã yêu cầu sính lễ cưới Mỵ Nương gồm những gì?',
        options: [
            'Voi chín ngà, gà chín cựa, ngựa chín hồng mao, mỗi thứ một đôi',
            'Một trăm hòm vàng bạc, một trăm viên ngọc trai biển sâu',
            'Năm trăm cây gỗ lim và một đàn trâu rừng trăm con',
            'Ba trăm vò rượu cần và gạo nếp thơm nương rẫy',
        ],
        correctIndex: 0,
        explanation: 'Sính lễ "voi chín ngà, gà chín cựa, ngựa chín hồng mao" là các sinh vật quý hiếm trên cạn, thể hiện sự ưu ái kín đáo của Vua Hùng đối với thần núi Sơn Tinh.',
    },
    {
        id: 'q18',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        difficulty: 'de',
        relatedWorkSlug: 'thanh-giong',
        question: 'Dấu tích nào ở vùng đất Sóc Sơn (Hà Nội) ngày nay gắn liền với truyền thuyết Phù Đổng Thiên Vương?',
        options: [
            'Dãy ao hồ hình móng chân ngựa sắt và bụi tre ngà ngả màu vàng óng',
            'Dấu chân khổng lồ của người khổng lồ dẫm lên phiến đá',
            'Một hang đá sâu chứa vũ khí đánh giặc thời Hùng Vương',
            'Bức tường thành bằng đất hình xoắn ốc',
        ],
        correctIndex: 0,
        explanation: 'Theo truyền thuyết, vó ngựa sắt của Gióng khi xung trận đã giẫm thành những ao hồ liên tiếp, và ngọn lửa thiêu cháy bụi tre biến chúng thành tre ngà màu vàng rực rỡ.',
    },
    {
        id: 'q19',
        category: 'co-tich',
        categoryName: 'Truyền cổ tích',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'thach-sanh',
        question: 'Lý Thông trong truyện Thạch Sanh đại diện cho hạng người nào trong xã hội phong kiến xưa?',
        options: [
            'Kẻ xảo quyệt, bất nhân bất nghĩa, cướp công đoạt lợi của người hiền lành',
            'Người quan chức thanh liêm nhưng nghiêm khắc',
            'Tầng lớp binh lính trung thành với triều đình',
            'Một thương nhân buôn bán lương thiện nhưng gặp vận rủi',
        ],
        correctIndex: 0,
        explanation: 'Hình tượng mẹ con Lý Thông là hiện thân của sự lừa lọc, vong ân bội nghĩa, đối lập gay gắt với vẻ đẹp đạo đức trong sáng, vị tha của dũng sĩ Thạch Sanh.',
    },
    {
        id: 'q20',
        category: 'co-tich',
        categoryName: 'Truyền cổ tích',
        difficulty: 'de',
        relatedWorkSlug: 'tam-cam',
        question: 'Chi tiết ông Bụt hiện lên giúp đỡ cô Tấm phản ánh niềm tin tín ngưỡng dân gian nào?',
        options: [
            'Ước mơ về công lý, cái Thiện luôn được các thế lực siêu nhiên phù hộ chở che lúc bế tắc',
            'Người nông dân có thể tự giải quyết mọi việc nhờ bùa chú',
            'Tấm là người có phép thuật thần tiên từ kiếp trước',
            'Bụt chỉ giúp đỡ những người biết nuôi cá bống',
        ],
        correctIndex: 0,
        explanation: 'Hình tượng ông Bụt trong truyện cổ tích Việt Nam đại diện cho khát vọng công bằng xã hội của nhân dân lao động: "Ở hiền gặp lành, ác giả ác báo".',
    },
    {
        id: 'q21',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'truyen-kieu',
        question: 'Hai câu thơ "Mai cốt cách, tuyết tinh thần / Mỗi người một vẻ, mười phân vẹn mười" miêu tả vẻ đẹp của ai?',
        options: [
            'Chị em Thúy Kiều và Thúy Vân',
            'Thúy Kiều và Đạm Tiên',
            'Thúy Kiều và Hoạn Thư',
            'Từ Hải và Thúy Kiều',
        ],
        correctIndex: 0,
        explanation: 'Nguyễn Du dùng bút pháp ước lệ tượng trưng để miêu tả vẻ đẹp cốt cách thanh tao như cành mai, tâm hồn trong trắng như tuyết của hai chị em Thúy Kiều và Thúy Vân.',
    },
    {
        id: 'q22',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'nam-quoc-son-ha',
        question: 'Bản dịch thơ nổi tiếng câu đầu "Nam quốc sơn hà Nam đế cư" thường được lưu truyền là gì?',
        options: [
            'Sông núi nước Nam vua Nam ở',
            'Đất nước Việt Nam muôn đời thịnh',
            'Bờ cõi nước Nam giặc chớ xâm',
            'Trời Nam phân định cõi giang sơn',
        ],
        correctIndex: 0,
        explanation: '"Sông núi nước Nam vua Nam ở / Rành rành định phận tại sách trời" là câu dịch thơ vang danh non sông khẳng định chủ quyền lãnh thổ của Đại Việt.',
    },
    {
        id: 'q23',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'hich-tuong-si',
        question: 'Hịch tướng sĩ của Trần Hưng Đạo được viết nhằm mục đích chính yếu nào trước cuộc kháng chiến chống Nguyên Mông lần 2?',
        options: [
            'Khích lệ tinh thần yêu nước, thức tỉnh ý thức trách nhiệm và rèn luyện võ nghệ cho tướng sĩ',
            'Trách phạt các tướng sĩ bỏ bê tập trận để săn bắn vui chơi',
            'Thông báo về số lượng viện binh phương Bắc sắp kéo sang',
            'Tuyên bố chiến lược rút lui về vùng ven biển bảo toàn lực lượng',
        ],
        correctIndex: 0,
        explanation: 'Bài hịch là lời hịch non sông, đánh thức lòng tự tôn dân tộc và tinh thần đoàn kết "Sát Thát", xốc lại nhuệ khí quyết chiến quyết thắng của toàn quân.',
    },
    {
        id: 'q24',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'thanh-giong',
        question: 'Trước khi cưỡi ngựa sắt ra trận, cậu bé Gióng đã có một yêu cầu đặc biệt gì với sứ giả triều đình?',
        options: [
            'Đúc một con ngựa sắt, một thanh gươm sắt, một áo giáp sắt và một nón sắt',
            'Cung cấp một vạn binh mã và thuyền chiến bọc đồng',
            'Một cây cung thần bằng ngà voi và tên vàng',
            'Một chiếc xe ngựa bọc thép và cờ lệnh thêu sáu chữ vàng',
        ],
        correctIndex: 0,
        explanation: 'Cậu bé lên ba không biết nói biết cười, nhưng tiếng nói đầu tiên là đòi gươm sắt, ngựa sắt, giáp sắt đi đánh giặc cứu nước — biểu tượng cho sức mạnh tiềm tàng của toàn thể dân tộc khi Tổ quốc lâm nguy.',
    },
    {
        id: 'q25',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Khởi nguyên',
        difficulty: 'de',
        relatedWorkSlug: 'son-tinh-thuy-tinh',
        question: 'Hình tượng thần Sơn Tinh (Tản Viên Sơn Thánh) trong tâm thức dân gian Việt Nam được tôn vinh là ai?',
        options: [
            'Một trong "Tứ bất tử" của tín ngưỡng dân gian Việt Nam',
            'Vị vua đầu tiên của nhà nước Văn Lang',
            'Vị tướng chỉ huy trận địa sông Bạch Đằng',
            'Vị thần nông nghiệp dạy dân trồng lúa nước',
        ],
        correctIndex: 0,
        explanation: 'Sơn Tinh (Tản Viên Sơn Thánh) đứng đầu trong hàng Tứ bất tử của văn hóa Việt Nam (cùng Chử Đồng Tử, Thánh Gióng và Mẫu Liễu Hạnh), tượng trưng cho sức mạnh chinh phục thiên nhiên và lòng nhân nghĩa.',
    },
];

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo múi giờ Việt Nam
 */
function getVietnamDateString() {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());
    } catch {
        return new Date().toISOString().slice(0, 10);
    }
}

/**
 * Helper gắn thông tin Work liên quan và ẩn đáp án đúng trước khi gửi về client
 */
async function attachRelatedWorks(questions) {
    const slugs = questions.map((q) => q.relatedWorkSlug).filter(Boolean);
    const relatedWorks = await Work.find({ slug: { $in: slugs } })
        .select('title slug category categoryName')
        .lean();

    const workMap = {};
    for (const w of relatedWorks) {
        workMap[w.slug] = w;
    }

    return questions.map((q) => ({
        id: q.questionId || q.id,
        category: q.category,
        categoryName: q.categoryName,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        relatedWork: q.relatedWork || workMap[q.relatedWorkSlug] || null,
    }));
}

/**
 * Lấy danh sách câu hỏi trắc nghiệm từ Database (MongoDB)
 * Hỗ trợ: 'all', category cụ thể, 'personalized' (cá nhân hóa cho user) và 'daily' (thử thách ngày)
 */
const getQuestions = async ({ category = 'all', count = 5, userId = null, difficulty = 'all' }) => {
    const requestedCount = Math.max(1, Number(count) || 5);
    const today = getVietnamDateString();

    // 1. CHẾ ĐỘ DAILY CHALLENGE (Thử thách ngày: seed cố định theo ngày YYYY-MM-DD)
    if (category === 'daily') {
        const pool = await QuizQuestion.find({ isActive: true }).lean();
        if (pool.length === 0) return [];

        let seed = 0;
        for (let i = 0; i < today.length; i++) {
            seed += today.charCodeAt(i) * (i + 1);
        }

        // Sắp xếp xác định theo seed của ngày
        const dailyPool = [...pool].sort((a, b) => {
            const hA = (seed * (a.questionId?.charCodeAt(1) || 1)) % 100;
            const hB = (seed * (b.questionId?.charCodeAt(1) || 1)) % 100;
            return hA - hB;
        });

        const selected = dailyPool.slice(0, Math.min(requestedCount, dailyPool.length));
        return attachRelatedWorks(selected);
    }

    // 2. CHẾ ĐỘ PERSONALIZED QUIZ (Cá nhân hóa cho Registered User dựa trên lịch sử điểm)
    if (category === 'personalized' && userId) {
        try {
            const progress = await QuizProgress.findOne({ user: userId });
            if (progress && progress.categoryStats) {
                const stats = progress.categoryStats;
                const categoryPerformances = [];
                const allCats = ['co-tich', 'truyen-thuyet', 'than-thoai', 'ca-dao', 'trung-dai'];

                for (const cat of allCats) {
                    const cStat = stats.get ? stats.get(cat) : stats[cat];
                    const total = cStat?.total || 0;
                    const correct = cStat?.correct || 0;
                    const accuracy = total > 0 ? correct / total : 0;
                    categoryPerformances.push({ cat, total, accuracy });
                }

                // Ưu tiên chủ đề làm ít câu nhất hoặc tỷ lệ đúng thấp nhất
                categoryPerformances.sort((a, b) => a.accuracy - b.accuracy || a.total - b.total);
                const weakCategory = categoryPerformances[0]?.cat || 'ca-dao';

                const weakQuestions = await QuizQuestion.aggregate([
                    { $match: { category: weakCategory, isActive: true } },
                    { $sample: { size: 3 } },
                ]);

                const remaining = Math.max(0, requestedCount - weakQuestions.length);
                const otherQuestions = await QuizQuestion.aggregate([
                    { $match: { category: { $ne: weakCategory }, isActive: true } },
                    { $sample: { size: remaining } },
                ]);

                const combined = [...weakQuestions, ...otherQuestions].sort(() => 0.5 - Math.random());
                if (combined.length > 0) {
                    return attachRelatedWorks(combined);
                }
            }
        } catch (err) {
            console.warn('[Personalized Quiz] Lỗi tính cá nhân hóa từ DB:', err.message);
        }
    }

    // 3. CHẾ ĐỘ THEO THỂ LOẠI CỤ THỂ HOẶC TOÀN BỘ (Sử dụng MongoDB $sample bốc ngẫu nhiên cực nhanh)
    const match = { isActive: true };
    if (category && category !== 'all' && category !== 'personalized' && category !== 'daily') {
        match.category = category;
    }
    if (difficulty && difficulty !== 'all') {
        match.difficulty = difficulty;
    }

    let selected = await QuizQuestion.aggregate([
        { $match: match },
        { $sample: { size: requestedCount } },
    ]);

    // Dự phòng trường hợp DB trống dữ liệu (fallback sang seed data)
    if (!selected || selected.length === 0) {
        let pool = [...quizQuestionsData];
        if (category && category !== 'all') {
            pool = pool.filter((q) => q.category === category);
        }
        if (difficulty && difficulty !== 'all') {
            pool = pool.filter((q) => q.difficulty === difficulty);
        }
        selected = pool.sort(() => 0.5 - Math.random()).slice(0, requestedCount);
    }

    return attachRelatedWorks(selected);
};

/**
 * Chấm điểm bài thi và lưu tiến độ cho Registered User (Guest không lưu)
 */
const submitQuiz = async ({ answers, userId = null, mode = 'standard', category = 'all' }) => {
    if (!Array.isArray(answers)) {
        throw new Error('Dữ liệu bài nộp không hợp lệ');
    }

    // Tra cứu danh sách câu hỏi trực tiếp từ Database
    const questionIds = answers.map((a) => a.questionId).filter(Boolean);
    const dbQuestions = await QuizQuestion.find({ questionId: { $in: questionIds } }).lean();

    const questionMap = {};
    for (const q of dbQuestions) {
        questionMap[q.questionId] = q;
    }

    // Dự phòng fallback sang file seed nếu chưa kịp query DB
    for (const seedQ of quizQuestionsData) {
        if (!questionMap[seedQ.questionId]) {
            questionMap[seedQ.questionId] = seedQ;
        }
    }

    let correctCount = 0;
    const details = [];
    const categoryCorrectDelta = {};
    const categoryTotalDelta = {};

    for (const ans of answers) {
        const original = questionMap[ans.questionId];
        if (!original) continue;

        const isCorrect = original.correctIndex === ans.selectedIndex;
        if (isCorrect) correctCount += 1;

        const cat = original.category || 'other';
        categoryTotalDelta[cat] = (categoryTotalDelta[cat] || 0) + 1;
        if (isCorrect) {
            categoryCorrectDelta[cat] = (categoryCorrectDelta[cat] || 0) + 1;
        }

        details.push({
            questionId: original.questionId,
            question: original.question,
            category: original.category,
            categoryName: original.categoryName,
            userSelectedIndex: ans.selectedIndex,
            userAnswer: original.options[ans.selectedIndex] || 'Chưa chọn',
            correctIndex: original.correctIndex,
            correctAnswer: original.options[original.correctIndex],
            isCorrect,
            explanation: original.explanation,
            culturalContext: original.culturalContext || '',
            academicSource: original.academicSource || '',
            relatedWorkSlug: original.relatedWorkSlug,
        });
    }

    const totalQuestions = answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Xác định Danh hiệu Di sản của bài thi (Session Badge)
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

    // NẾU LÀ GUEST (userId === null) -> Trả về kết quả ngay, KHÔNG lưu vào Database
    if (!userId) {
        return {
            totalQuestions,
            correctCount,
            score,
            passed: score >= 60,
            badge,
            details,
            isGuest: true,
            newlyUnlockedBadges: [],
        };
    }

    // NẾU LÀ REGISTERED USER -> Lưu tiến độ (Learning Progress & Badges) vào MongoDB
    let newlyUnlockedBadges = [];
    const today = getVietnamDateString();

    try {
        let progress = await QuizProgress.findOne({ user: userId });
        if (!progress) {
            progress = new QuizProgress({
                user: userId,
                totalQuizzes: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                categoryStats: new Map(),
                badges: [],
                history: [],
                dailyChallenge: { lastCompletedDate: null, streak: 0 },
            });
        }

        // 1. Cập nhật tổng số
        progress.totalQuizzes += 1;
        progress.totalQuestions += totalQuestions;
        progress.totalCorrect += correctCount;

        // 2. Cập nhật categoryStats
        for (const cat of Object.keys(categoryTotalDelta)) {
            const current = progress.categoryStats.get(cat) || { total: 0, correct: 0 };
            progress.categoryStats.set(cat, {
                total: (current.total || 0) + (categoryTotalDelta[cat] || 0),
                correct: (current.correct || 0) + (categoryCorrectDelta[cat] || 0),
            });
        }

        // 3. Xử lý Daily Challenge nếu ở chế độ 'daily'
        let isDailySuccess = false;
        if (mode === 'daily' && score >= 60) {
            isDailySuccess = true;
            if (progress.dailyChallenge.lastCompletedDate !== today) {
                progress.dailyChallenge.lastCompletedDate = today;
                progress.dailyChallenge.streak = (progress.dailyChallenge.streak || 0) + 1;
            }
        }

        // 4. Kiểm tra mở khóa Huy hiệu Thành tích mới (Achievement Badges)
        const earnedIds = new Set(progress.badges.map((b) => b.id));

        for (const bDef of ALL_ACHIEVEMENT_BADGES) {
            if (earnedIds.has(bDef.id)) continue;

            let isUnlocked = false;

            if (bDef.id === 'first_quiz' && progress.totalQuizzes >= 1) isUnlocked = true;
            if (bDef.id === 'perfect_score' && score === 100) isUnlocked = true;
            if (bDef.id === 'quiz_veteran' && progress.totalQuizzes >= 5) isUnlocked = true;
            if (bDef.id === 'daily_master' && isDailySuccess) isUnlocked = true;

            // Kiểm tra tích lũy câu đúng theo thể loại
            if (bDef.id === 'master_ca_dao') {
                const cStat = progress.categoryStats.get('ca-dao');
                if (cStat && cStat.correct >= 5) isUnlocked = true;
            }
            if (bDef.id === 'master_tuc_ngu') {
                const cStat = progress.categoryStats.get('ca-dao');
                if (cStat && cStat.correct >= 10) isUnlocked = true;
            }
            if (bDef.id === 'master_co_tich') {
                const cStat = progress.categoryStats.get('co-tich');
                if (cStat && cStat.correct >= 5) isUnlocked = true;
            }
            if (bDef.id === 'master_truyen_thuyet') {
                const truyenThuyetStat = progress.categoryStats.get('truyen-thuyet')?.correct || 0;
                const thanThoaiStat = progress.categoryStats.get('than-thoai')?.correct || 0;
                if (truyenThuyetStat + thanThoaiStat >= 5) isUnlocked = true;
            }
            if (bDef.id === 'master_trung_dai') {
                const cStat = progress.categoryStats.get('trung-dai');
                if (cStat && cStat.correct >= 5) isUnlocked = true;
            }

            if (isUnlocked) {
                const newBadge = {
                    id: bDef.id,
                    title: bDef.title,
                    description: bDef.description,
                    category: bDef.category,
                    icon: bDef.icon,
                    earnedAt: new Date(),
                };
                progress.badges.push(newBadge);
                newlyUnlockedBadges.push(newBadge);
            }
        }

        // 5. Lưu lại 15 lượt thi gần nhất vào lịch sử
        if (!progress.history) progress.history = [];
        progress.history.unshift({
            date: new Date(),
            mode,
            category,
            totalQuestions,
            correctCount,
            score,
            badgeTitle: badge.title,
        });

        if (progress.history.length > 15) {
            progress.history = progress.history.slice(0, 15);
        }

        await progress.save();
    } catch (saveErr) {
        console.error('[Quiz Progress] Lỗi lưu tiến độ người dùng:', saveErr.message);
    }

    return {
        totalQuestions,
        correctCount,
        score,
        passed: score >= 60,
        badge,
        details,
        isGuest: false,
        newlyUnlockedBadges,
    };
};

/**
 * Lấy toàn bộ thông tin tiến độ, thống kê theo thể loại & huy hiệu của Registered User
 */
const getUserProgress = async (userId) => {
    let progress = await QuizProgress.findOne({ user: userId }).lean();

    if (!progress) {
        return {
            totalQuizzes: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            overallAccuracy: 0,
            categoryStats: [],
            badges: [],
            allBadges: ALL_ACHIEVEMENT_BADGES.map((b) => ({ ...b, earned: false })),
            dailyChallenge: { completedToday: false, streak: 0 },
            history: [],
        };
    }

    const today = getVietnamDateString();
    const overallAccuracy =
        progress.totalQuestions > 0 ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100) : 0;

    const categoryNames = {
        'co-tich': 'Truyện cổ tích',
        'truyen-thuyet': 'Truyền thuyết',
        'than-thoai': 'Thần thoại',
        'ca-dao': 'Ca dao - Tục ngữ',
        'trung-dai': 'Văn học Trung đại',
    };

    const categoryStatsList = Object.keys(categoryNames).map((catKey) => {
        const stat = progress.categoryStats?.[catKey] || { total: 0, correct: 0 };
        return {
            id: catKey,
            category: catKey,
            name: categoryNames[catKey],
            categoryName: categoryNames[catKey],
            total: stat.total || 0,
            correct: stat.correct || 0,
            accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
        };
    });

    const earnedBadgeIds = new Set((progress.badges || []).map((b) => b.id));
    const allBadgesWithStatus = ALL_ACHIEVEMENT_BADGES.map((bDef) => {
        const isUnlocked = earnedBadgeIds.has(bDef.id);
        return {
            ...bDef,
            earned: isUnlocked,
            isUnlocked: isUnlocked,
            earnedAt: progress.badges?.find((b) => b.id === bDef.id)?.earnedAt || null,
        };
    });

    return {
        totalQuizzes: progress.totalQuizzes,
        totalQuestions: progress.totalQuestions,
        totalCorrect: progress.totalCorrect,
        overallAccuracy,
        categoryStats: categoryStatsList,
        badges: progress.badges,
        allBadges: allBadgesWithStatus,
        dailyChallenge: {
            completedToday: progress.dailyChallenge?.lastCompletedDate === today,
            streak: progress.dailyChallenge?.streak || 0,
        },
        history: progress.history || [],
    };
};

/**
 * AI Explanation cho một câu hỏi trắc nghiệm
 * Cung cấp phân tích đa tầng chuyên sâu: ý nghĩa nhân văn, bối cảnh lịch sử, bài học và nguồn học thuật
 */
const getAiQuestionExplanation = async ({ questionId, selectedAnswer = null }) => {
    // Tìm câu hỏi trong MongoDB, đồng thời populate thông tin tác phẩm liên quan
    let q = await QuizQuestion.findOne({ questionId }).populate('relatedWork').lean();

    // Fallback sang seed data nếu chưa tìm thấy trong DB
    if (!q) {
        q = quizQuestionsData.find((item) => item.questionId === questionId);
    }

    if (!q) {
        throw new Error('Không tìm thấy câu hỏi trong ngân hàng dữ liệu');
    }

    // Tra cứu thêm chi tiết tác phẩm liên quan nếu chưa có trong relatedWork
    let relatedDetail = q.relatedWork || null;
    if (!relatedDetail && q.relatedWorkSlug) {
        relatedDetail = await Work.findOne({ slug: q.relatedWorkSlug }).lean();
    }

    const isCorrect = selectedAnswer === q.options[q.correctIndex];

    const deepAnalysis = `
### 1. Phân tích cốt lõi & Đáp án chính xác:
- **Đáp án đúng:** **"${q.options[q.correctIndex]}"**
${isCorrect ? '✅ Bạn đã chọn hoàn toàn chính xác!' : `⚠️ Bạn đã chọn: *"${selectedAnswer || 'Chưa trả lời'}"*`}
- **Ý nghĩa trọng tâm:** ${q.explanation}

### 2. Chiều sâu Bối cảnh Văn hóa & Lịch sử:
${q.culturalContext || 'Tác phẩm phản ánh chân thực nhân sinh quan, thế giới quan và tâm hồn thuần hậu, giàu đức hy sinh của dân tộc Việt Nam qua hàng ngàn năm dựng nước và giữ nước.'}
${relatedDetail?.historicalContext ? `\n> *${relatedDetail.historicalContext}*` : ''}

### 3. Bài học Đạo lý & Triết lý Nhân sinh:
${relatedDetail?.thematicMeaning || 'Câu chuyện nhắc nhở thế hệ hôm nay luôn trân trọng đạo lý truyền thống, gìn giữ cội nguồn bản sắc và sống ân nghĩa, bao dung.'}

---
*Nguồn tư liệu đối chiếu học thuật:* **${q.academicSource || relatedDetail?.source || 'Viện Nghiên cứu Hán Nôm & Viện Văn học Việt Nam'}**`;

    return {
        questionId: q.questionId,
        question: q.question,
        correctAnswer: q.options[q.correctIndex],
        deepExplanation: deepAnalysis,
        academicSource: q.academicSource || relatedDetail?.source || 'Tư liệu Văn học Dân gian Việt Nam',
        relatedWork: relatedDetail
            ? {
                  title: relatedDetail.title,
                  slug: relatedDetail.slug,
                  categoryName: relatedDetail.categoryName,
              }
            : null,
    };
};

module.exports = {
    QUIZ_QUESTION_BANK: quizQuestionsData,
    ALL_ACHIEVEMENT_BADGES,
    getQuestions,
    submitQuiz,
    getUserProgress,
    getAiQuestionExplanation,
};
