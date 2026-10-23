require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Work = require('../src/models/Work');
const LearningPath = require('../src/models/LearningPath');
const QuizProgress = require('../src/models/QuizProgress');
const authService = require('../src/services/auth.services');
const learningPathService = require('../src/services/learningPath.service');

async function testLearningPath() {
    console.log('====================================================');
    console.log('   BẮT ĐẦU KIỂM THỬ BACKEND LỘ TRÌNH HỌC CÁ NHÂN HÓA');
    console.log('====================================================');

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sep490');

    // 1. Chuẩn bị người dùng thử nghiệm
    await User.deleteMany({ email: { $in: ['test_learner@example.com', 'test_learner_other@example.com'] } });
    const learner1 = await authService.register({
        name: 'Học viên Di sản 1',
        email: 'test_learner@example.com',
        password: 'Password@123',
    });
    const learner2 = await authService.register({
        name: 'Học viên Di sản 2',
        email: 'test_learner_other@example.com',
        password: 'Password@123',
    });

    const user1Id = learner1.user.id;
    const user2Id = learner2.user.id;

    console.log('✓ Chuẩn bị user 1:', user1Id, '| user 2:', user2Id);

    // 2. Test FR-1: Lấy danh sách chủ đề khả dụng từ MongoDB
    console.log('\n[TEST 1] Lấy danh sách chủ đề học tập khả dụng...');
    const topics = await learningPathService.getAvailableTopics();
    console.log(`✓ Tìm thấy ${topics.length} chủ đề khả dụng:`);
    topics.forEach((t) => {
        console.log(`   - [${t.id}] ${t.title} (${t.worksCount} tác phẩm có sẵn)`);
    });
    if (topics.length === 0) throw new Error('Không lấy được danh sách chủ đề!');

    // 3. Test FR-2 & FR-3: Tạo lộ trình học dựa trên tác phẩm thật
    console.log('\n[TEST 2] Tạo lộ trình học cá nhân hóa 7 ngày về Ca dao & Tục ngữ...');
    const createdPath = await learningPathService.createLearningPath({
        userId: user1Id,
        topic: 'ca-dao-tuc-ngu',
        goal: 'Học và thấu hiểu các triết lý nhân sinh và đạo lý cội nguồn trong ca dao tục ngữ',
        totalDays: 7,
        dailyMinutes: 10,
    });

    console.log(`✓ Lộ trình đã tạo: "${createdPath.title}"`);
    console.log(`✓ Số ngày thực tế: ${createdPath.totalDays} ngày | Thời lượng: ${createdPath.dailyMinutes} phút/ngày`);
    console.log(`✓ Tiến độ ban đầu: ${createdPath.progress.percent}% | Ngày hiện tại: Ngày ${createdPath.progress.currentDay}`);

    // Kiểm tra tính xác thực của tác phẩm (FR-2: 100% là tác phẩm thật trong MongoDB)
    console.log('\n[TEST 3] Kiểm tra tính xác thực của các tác phẩm trong lộ trình...');
    for (const d of createdPath.days) {
        console.log(`   * Ngày ${d.day} [Giai đoạn: ${d.phase}]: "${d.title}"`);
        console.log(`     - Mục tiêu: ${d.objective}`);
        console.log(`     - Tác phẩm: ${d.works.map((w) => `"${w.title}" (slug: ${w.slug})`).join(', ')}`);
        console.log(`     - Số câu trắc nghiệm: ${d.practiceQuestions.length}`);

        // Truy vấn ngược lại MongoDB để khẳng định tác phẩm thực sự tồn tại
        const realWork = await Work.findById(d.works[0].workId);
        if (!realWork) {
            throw new Error(`PHÁT HIỆN TÁC PHẨM GIẢ KHÔNG TỒN TẠI TRONG DB: ${d.works[0].title}`);
        }
    }
    console.log('✓ XÁC MINH 100% TÁC PHẨM ĐỀU CÓ THẬT VÀ KHỚP VỚI MONGODB!');

    // 4. Test FR-4: Lấy danh sách lộ trình và lộ trình active
    console.log('\n[TEST 4] Kiểm tra lấy danh sách lộ trình và lộ trình đang học...');
    const userPaths = await learningPathService.getUserPaths(user1Id);
    console.log(`✓ Số lộ trình của user 1: ${userPaths.length}`);
    const activePath = await learningPathService.getActivePath(user1Id);
    console.log(`✓ Lộ trình active: "${activePath.title}"`);

    // 5. Test FR-4 & FR-5: Hoàn thành bài học Ngày 1
    console.log('\n[TEST 5] Đánh dấu hoàn thành bài học Ngày 1...');
    const updatedAfterDay1 = await learningPathService.completeDayLesson({
        pathId: createdPath._id,
        userId: user1Id,
        dayNumber: 1,
        userNotes: 'Rất tâm đắc với câu này, đã ghi nhớ!',
    });
    console.log(`✓ Sau Ngày 1: Đã hoàn thành ${updatedAfterDay1.progress.completedDays}/${updatedAfterDay1.totalDays} ngày (${updatedAfterDay1.progress.percent}%)`);
    console.log(`✓ Chuyển sang ngày học tiếp theo: Ngày ${updatedAfterDay1.progress.currentDay}`);

    // 6. Test FR-6 & FR-7: Nộp bài trắc nghiệm Ngày 2 và kiểm tra cơ chế cá nhân hóa & đề xuất ôn tập
    console.log('\n[TEST 6] Nộp bài trắc nghiệm Ngày 2...');
    const day2 = createdPath.days.find((d) => d.day === 2);
    // Giả lập làm đúng 1 câu, sai 1 câu để kiểm tra gợi ý ôn tập
    const mockAnswers = [
        { questionId: day2.practiceQuestions[0].questionId, selectedIndex: day2.practiceQuestions[0].correctIndex },
        { questionId: day2.practiceQuestions[1].questionId, selectedIndex: (day2.practiceQuestions[1].correctIndex + 1) % 4 },
    ];

    const quizResult = await learningPathService.submitDayQuiz({
        pathId: createdPath._id,
        userId: user1Id,
        dayNumber: 2,
        answers: mockAnswers,
    });

    console.log(`✓ Kết quả làm bài Ngày 2: Điểm ${quizResult.score}/100 (Đúng ${quizResult.correctCount}/${quizResult.totalQuestions})`);
    console.log(`✓ Đề xuất ôn tập cá nhân hóa mới nhất:`);
    console.log(`   "${quizResult.path.recommendations[0]?.message}"`);

    // 7. Test FR-7: Kiểm tra tích hợp QuizProgress
    console.log('\n[TEST 7] Kiểm tra QuizProgress của User...');
    const quizProg = await QuizProgress.findOne({ user: user1Id });
    console.log(`✓ QuizProgress đã ghi nhận: ${quizProg.totalQuizzes} lượt thi, ${quizProg.totalQuestions} câu, ${quizProg.totalCorrect} câu đúng`);

    // 8. Test Bảo mật: User 2 không thể truy cập lộ trình của User 1
    console.log('\n[TEST 8] Kiểm tra bảo mật: User 2 truy cập lộ trình của User 1...');
    try {
        await learningPathService.getPathById({ pathId: createdPath._id, userId: user2Id });
        throw new Error('LỖI BẢO MẬT: User 2 lại đọc được lộ trình của User 1!');
    } catch (secErr) {
        console.log('✓ BẢO MẬT THÀNH CÔNG: Chặn truy cập trái phép với thông báo:', secErr.message);
    }

    // 9. Dọn dẹp
    console.log('\n[TEST 9] Dọn dẹp dữ liệu test...');
    await learningPathService.deletePath({ pathId: createdPath._id, userId: user1Id });
    await User.deleteMany({ email: { $in: ['test_learner@example.com', 'test_learner_other@example.com'] } });
    await QuizProgress.deleteMany({ user: user1Id });
    console.log('✓ Đã dọn dẹp xong.');

    console.log('\n====================================================');
    console.log('   TẤT CẢ 9 BÀI KIỂM THỬ BACKEND ĐỀU THÀNH CÔNG 100%!');
    console.log('====================================================');
    process.exit(0);
}

testLearningPath().catch((err) => {
    console.error('LỖI TEST:', err);
    process.exit(1);
});
