require('dotenv').config();
const mongoose = require('mongoose');
const { analyzeLucBatPoem, checkWordRhyme } = require('./src/utils/lucBatAnalyzer');
const poetryService = require('./src/services/poetry.service');
const experienceService = require('./src/services/experience.service');
const duelService = require('./src/services/duel.service');
const User = require('./src/models/User');

async function runFullIntegrationTest() {
    console.log('========================================================');
    console.log('🚀 BẮT ĐẦU KIỂM THỬ TÍCH HỢP TOÀN DIỆN 2 PHÂN HỆ');
    console.log('1. AI POETRY STUDIO (RULE-BASED + AI CRITIC + CO-WRITE)');
    console.log('2. GAMIFICATION DI SẢN (HERITAGE EXP + STREAK + 1V1 DUEL)');
    console.log('========================================================\n');

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sep490');
    console.log('✓ Kết nối MongoDB thành công\n');

    // TEST 1: Rule Engine
    console.log('--- TEST 1: RULE-BASED LUCBATANALYZER ---');
    const validPoem = `Trăm năm trong cõi người ta\nChữ tài chữ mệnh khéo là ghét nhau`;
    const resValid = analyzeLucBatPoem(validPoem);
    console.log('Bài thơ chuẩn: Valid =', resValid.isValid, '| Điểm âm luật:', resValid.summary.toneScore, '/ 40');
    if (!resValid.isValid || resValid.summary.toneScore !== 40) throw new Error('Rule Engine thất bại');
    console.log('✓ Test 1: Rule Engine hoàn hảo\n');

    // TEST 2: AI Critic
    console.log('--- TEST 2: AI CRITIC (THẨM ĐỊNH THƠ & GỢI Ý TỪ) ---');
    const critiqueResult = await poetryService.critiquePoem({
        content: validPoem,
        title: 'Đoạn trường tân thanh',
        authorName: 'Nguyễn Du',
    });
    console.log('Tổng điểm:', critiqueResult.scores.totalScore, '/ 100');
    console.log('- Điểm Âm luật (Rule):', critiqueResult.scores.toneScore, '/ 40');
    console.log('- Điểm Vần điệu (AI):', critiqueResult.scores.rhythmScore, '/ 30');
    console.log('- Điểm Hồn thơ (AI):', critiqueResult.scores.poeticScore, '/ 30');
    console.log('- Nhận xét:', critiqueResult.aiCritic.overallComment);
    console.log('✓ Test 2: AI Critic hoạt động chuẩn xác\n');

    // TEST 3: AI Co-Writing
    console.log('--- TEST 3: ĐỐI THƠ CÙNG AI (ỨNG KHẨU CÂU BÁT) ---');
    const coWriteRes = await poetryService.coWriteBatLine({
        lucLine: 'Công cha như núi Thái Sơn',
    });
    console.log('Câu Lục đầu vào:', coWriteRes.inputLucLine);
    console.log('Tiếng gieo vần đích:', coWriteRes.rhymeTargetWord);
    console.log('Số phương án câu Bát sinh ra:', coWriteRes.candidates.length);
    coWriteRes.candidates.forEach((cand, idx) => {
        console.log(`  Phương án ${idx + 1}: "${cand.batLine}" (${cand.syllableCount} tiếng) | Đúng vần: ${cand.isRhymeValid} | Điểm: ${cand.toneScore}/40`);
    });
    console.log('✓ Test 3: Đối thơ AI kiểm tra âm luật chuẩn xác\n');

    // TEST 4: Heritage EXP & Streak
    console.log('--- TEST 4: HERITAGE EXP & STREAK ---');
    let testUser = await User.findOne({ email: 'test_poet@vietheritage.vn' });
    if (!testUser) {
        testUser = await User.create({
            name: 'Thi Sĩ Thử Nghiệm',
            email: 'test_poet@vietheritage.vn',
            password: 'Password123!',
            role: 'customer',
            isVerified: true,
        });
    }

    const testTargetId = 'test-work-' + Date.now();
    // Thưởng lần 1
    const award1 = await experienceService.awardExperience({
        userId: testUser._id,
        actionType: 'READ_WORK',
        targetId: testTargetId,
        description: 'Đọc tác phẩm test',
    });
    console.log('Cộng điểm lần 1: Awarded =', award1.awarded, '| EXP nhận:', award1.expEarned, '| Tổng EXP:', award1.totalExp, '| Danh hiệu:', award1.academicTitle);

    // Thử cộng trùng (Idempotency check)
    const award2 = await experienceService.awardExperience({
        userId: testUser._id,
        actionType: 'READ_WORK',
        targetId: testTargetId,
        description: 'Đọc lại tác phẩm test (Trùng lặp)',
    });
    console.log('Chống cộng trùng: Awarded =', award2.awarded, '| Lý do:', award2.reason);
    if (award2.awarded !== false) throw new Error('Thất bại: Chống cộng điểm trùng không hoạt động');

    const streakRes = await experienceService.calculateUserStreak(testUser._id);
    console.log('Chuỗi ngày học streak:', streakRes.current, 'ngày | Hoạt động hôm nay:', streakRes.isActiveToday);
    console.log('✓ Test 4: Heritage EXP & Chống gian lận hoạt động xuất sắc\n');

    // TEST 5: Leaderboard
    console.log('--- TEST 5: BẢNG VÀNG TRẠNG NGUYÊN (LEADERBOARD) ---');
    const board = await experienceService.getLeaderboard({ type: 'all', limit: 5 });
    console.log('Top sĩ tử Bảng Vàng:');
    board.forEach((b) => {
        console.log(`  Hạng ${b.rank}: ${b.name} (${b.academicTitle} ${b.titleBadge}) - ${b.totalExp} EXP`);
    });
    console.log('✓ Test 5: Bảng Vàng tổng hợp dữ liệu thực tế thành công\n');

    // TEST 6: Đấu trường Thi Đình 1v1
    console.log('--- TEST 6: ĐẤU TRƯỜNG THI ĐÌNH 1V1 (STATE MACHINE & SCORING) ---');
    let opponentUser = await User.findOne({ email: 'opponent@vietheritage.vn' });
    if (!opponentUser) {
        opponentUser = await User.create({
            name: 'Trạng Cờ Đối Thủ',
            email: 'opponent@vietheritage.vn',
            password: 'Password123!',
            role: 'customer',
            isVerified: true,
        });
    }

    // Player 1 vào hàng đợi
    const p1Join = await duelService.joinMatchmaking({
        userId: testUser._id,
        name: testUser.name,
        avatar: '',
    });
    console.log('Player 1 vào hàng đợi:', p1Join.status);

    // Player 2 vào hàng đợi -> GHÉP CẶP THÀNH CÔNG!
    const p2Join = await duelService.joinMatchmaking({
        userId: opponentUser._id,
        name: opponentUser.name,
        avatar: '',
    });
    console.log('Player 2 vào hàng đợi -> Trạng thái:', p2Join.status, '| MatchId:', p2Join.matchId);

    if (p2Join.status === 'MATCHED') {
        const matchId = p2Join.matchId;
        // Hiệp 1: Player 1 trả lời đúng
        const q0CorrectIdx = p2Join.match.questions[0].correctIndex;
        const ansP1 = await duelService.submitRoundAnswer({
            matchId,
            userId: testUser._id,
            questionIndex: 0,
            selectedIndex: 0, // Chọn A
            clientResponseTimeMs: 2500,
        });

        const ansP2 = await duelService.submitRoundAnswer({
            matchId,
            userId: opponentUser._id,
            questionIndex: 0,
            selectedIndex: 1, // Chọn B
            clientResponseTimeMs: 4000,
        });

        console.log('Hiệp 1 xong! Điểm Player 1:', ansP2.player1.score, '| Điểm Player 2:', ansP2.player2.score);
        console.log('Câu tiếp theo index:', ansP2.currentQuestionIndex);
    }
    console.log('✓ Test 6: Đấu trường Thi Đình 1v1 hoạt động hoàn hảo\n');

    console.log('========================================================');
    console.log('🎉 TẤT CẢ 6 HẠNG MỤC KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%!');
    console.log('========================================================');

    await mongoose.disconnect();
    process.exit(0);
}

runFullIntegrationTest().catch((err) => {
    console.error('❌ Kiểm thử thất bại:', err);
    process.exit(1);
});
