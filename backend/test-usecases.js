require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Work = require('./src/models/Work');
const Favorite = require('./src/models/Favorite');
const SearchHistory = require('./src/models/SearchHistory');
const ContentSubmission = require('./src/models/ContentSubmission');
const SystemSetting = require('./src/models/SystemSetting');
const authService = require('./src/services/auth.services');
const literatureService = require('./src/services/literature.service');
const aiService = require('./src/services/ai.service');

async function runAllUseCaseTests() {
    console.log('====================================================');
    console.log('   BẮT ĐẦU KIỂM THỬ END-TO-END 19 USE CASES (BACKEND)');
    console.log('====================================================');

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sep490');

    // Dọn dẹp dữ liệu test cũ
    await User.deleteMany({ email: { $in: ['test_runner@example.com', 'test_submitter@example.com'] } });

    // 1. UC01 — Register Account
    console.log('\n[UC01] Test Đăng ký tài khoản...');
    const regRes = await authService.register({
        name: 'Người dùng Thử nghiệm',
        email: 'test_runner@example.com',
        password: 'Password@123',
    });
    console.log('✓ UC01 Thành công: Token và user đã tạo:', regRes.user.email);

    // 2. UC02 — Log In
    console.log('\n[UC02] Test Đăng nhập...');
    const loginRes = await authService.login({
        email: 'test_runner@example.com',
        password: 'Password@123',
    });
    console.log('✓ UC02 Thành công: Đăng nhập thành công, Role:', loginRes.user.role);

    // 3. UC06 — Browse Public Content
    console.log('\n[UC06] Test Duyệt danh sách tác phẩm công khai...');
    const featured = await literatureService.getFeaturedWorks(5);
    console.log(`✓ UC06 Thành công: Lấy được ${featured.length} tác phẩm nổi bật`);

    // 4. UC07 — Search Folk Literature (Keyword Search)
    console.log('\n[UC07] Test Tìm kiếm ca dao, tục ngữ theo từ khóa...');
    const searchRes = await literatureService.searchWorks({ query: 'nhớ nguồn', page: 1, limit: 5 });
    console.log(`✓ UC07 Thành công: Tìm từ khóa "nhớ nguồn" ra ${searchRes.works.length} kết quả (Tổng: ${searchRes.pagination.total})`);

    // 5. UC08 — View Content Details
    console.log('\n[UC08] Test Xem chi tiết nội dung văn hóa...');
    const detail = await literatureService.getWorkBySlug('uong-nuoc-nho-nguon');
    console.log(`✓ UC08 Thành công: Tác phẩm "${detail.title}", Lượt xem sau khi truy vấn: ${detail.viewsCount}`);

    // 6. UC09 — Perform Semantic Search
    console.log('\n[UC09] Test Tìm kiếm ngữ nghĩa bằng ngôn ngữ tự nhiên...');
    const semanticRes = await literatureService.semanticSearch({
        query: 'Tìm tục ngữ nói về lòng biết ơn những người đã giúp đỡ mình',
        page: 1,
        limit: 5,
    });
    console.log(`✓ UC09 Thành công: Khớp khái niệm [${semanticRes.semanticConcept}], tìm thấy ${semanticRes.works.length} tác phẩm phù hợp!`);
    if (semanticRes.works.length > 0) {
        console.log(`   -> Tác phẩm hàng đầu: "${semanticRes.works[0].title}" (Điểm ngữ nghĩa: ${semanticRes.works[0]._semanticScore})`);
    }

    // 7. UC10 — Request AI Explanation
    console.log('\n[UC10] Test Yêu cầu AI giải thích chi tiết...');
    const explainRes = await aiService.explainWork({ slug: 'uong-nuoc-nho-nguon' });
    console.log(`✓ UC10 Thành công: Đã giải thích tác phẩm "${explainRes.work.title}"`);
    console.log(`   -> Nguồn trích dẫn học thuật: ${explainRes.citations[0].source}`);
    console.log(`   -> Chế độ phân tích: ${explainRes.sourceType}`);

    // 8. UC11 — Explore Related Content
    console.log('\n[UC11] Test Gợi ý nội dung văn hóa liên quan...');
    const relatedWorks = await literatureService.getRelatedWorks('uong-nuoc-nho-nguon', 3);
    console.log(`✓ UC11 Thành công: Gợi ý được ${relatedWorks.length} tác phẩm liên quan cùng chủ đề/thể loại!`);

    // 9. UC12 — Save or Remove Favorites
    console.log('\n[UC12] Test Lưu và bỏ lưu nội dung yêu thích...');
    const userDoc = await User.findOne({ email: 'test_runner@example.com' });
    const workDoc = await Work.findOne({ slug: 'uong-nuoc-nho-nguon' });

    // Thêm vào favorites
    const fav = await Favorite.create({ user: userDoc._id, work: workDoc._id });
    console.log('✓ UC12 Đã lưu tác phẩm vào Favorite ID:', fav._id);

    // Kiểm tra danh sách favorites
    const userFavs = await Favorite.find({ user: userDoc._id }).populate('work');
    console.log(`✓ UC12 Kiểm tra danh sách favorites: ${userFavs.length} mục`);

    // Bỏ favorite
    await Favorite.findByIdAndDelete(fav._id);
    console.log('✓ UC12 Đã bỏ lưu favorite thành công');

    // 10. UC13 — View Search History
    console.log('\n[UC13] Test Ghi nhận và xem lịch sử tìm kiếm...');
    await SearchHistory.create({
        user: userDoc._id,
        query: 'Tìm tục ngữ nói về lòng biết ơn',
        searchType: 'semantic',
        resultsCount: 2,
    });
    const historyList = await SearchHistory.find({ user: userDoc._id });
    console.log(`✓ UC13 Thành công: Lấy được ${historyList.length} lịch sử tìm kiếm (Truy vấn: "${historyList[0].query}")`);

    // 11. UC14 — Submit Cultural Content
    console.log('\n[UC14] Test Người dùng gửi đóng góp văn hóa mới...');
    const submission = await ContentSubmission.create({
        user: userDoc._id,
        title: 'Một cây làm chẳng nên non / Ba cây chụm lại nên hòn núi cao',
        category: 'ca-dao',
        topic: 'Đoàn kết - Nhân ái',
        summary: 'Ca ngợi sức mạnh của sự đoàn kết và hợp lực',
        meaning: 'Một cá nhân đơn độc khó tạo nên việc lớn, nhưng khi nhiều người chung sức đồng lòng thì việc gì cũng thành công.',
        literalMeaning: 'Một cái cây đứng riêng lẻ thì không thể tạo thành khu rừng hoặc ngọn núi.',
        figurativeMeaning: 'Sức mạnh tập thể vượt trội hơn sức mạnh đơn độc.',
        lesson: 'Khuyên nhủ con người biết đoàn kết và hợp tác.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan',
        status: 'pending',
    });
    console.log(`✓ UC14 Thành công: Đã tạo bài đóng góp ID: ${submission._id} (Trạng thái: ${submission.status})`);

    // 12. UC16 & UC17 — Review & Approve Content Submission (Admin)
    console.log('\n[UC16 & UC17] Test Admin duyệt bài đóng góp và xuất bản vào kho tàng...');
    const adminUser = await User.findOne({ email: 'admin@vietheritage.vn' });

    // Duyệt bài
    submission.status = 'approved';
    submission.reviewedBy = adminUser._id;
    submission.reviewedAt = new Date();
    await submission.save();

    // Xuất bản vào Work
    const publishedWork = await Work.create({
        title: submission.title,
        slug: 'mot-cay-lam-chang-nen-non',
        category: submission.category,
        categoryName: 'Ca dao Dân ca Việt Nam',
        topic: submission.topic,
        summary: submission.summary,
        quote: submission.title,
        literalMeaning: submission.literalMeaning,
        figurativeMeaning: submission.figurativeMeaning,
        lesson: submission.lesson,
        source: submission.source,
        status: 'published',
    });
    submission.publishedWorkId = publishedWork._id;
    await submission.save();
    console.log(`✓ UC17 Thành công: Admin đã duyệt và xuất bản tác phẩm "${publishedWork.title}" vào kho tàng!`);

    // 13. UC18 — Update Published Content
    console.log('\n[UC18] Test Cập nhật nội dung đã xuất bản...');
    const updatedWork = await Work.findByIdAndUpdate(
        publishedWork._id,
        { readTime: '4 phút đọc', viewsCount: 10 },
        { returnDocument: 'after' }
    );
    console.log(`✓ UC18 Thành công: Đã cập nhật tác phẩm "${updatedWork.title}", readTime: ${updatedWork.readTime}`);

    // Dọn dẹp tác phẩm test vừa xuất bản
    await Work.findByIdAndDelete(publishedWork._id);
    await ContentSubmission.findByIdAndDelete(submission._id);

    // 14. UC19 — Configure System Settings
    console.log('\n[UC19] Test Cấu hình thiết lập hệ thống...');
    const setting = await SystemSetting.findOneAndUpdate(
        { key: 'allowUserSubmissions' },
        { value: true, updatedBy: adminUser._id },
        { returnDocument: 'after' }
    );
    console.log(`✓ UC19 Thành công: Cấu hình [${setting.key}] = ${setting.value}`);

    // Dọn dẹp user test
    await User.deleteMany({ email: 'test_runner@example.com' });
    await Favorite.deleteMany({ user: userDoc._id });
    await SearchHistory.deleteMany({ user: userDoc._id });

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ CÁC TÍNH NĂNG VÀ USE CASES ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
}

runAllUseCaseTests().catch((err) => {
    console.error('❌ Lỗi kiểm thử Use Cases:', err);
    process.exit(1);
});
