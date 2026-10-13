const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../../.env' });
const Lesson = require('../models/Lesson');

const sampleLessons = [
    // Chặng 1: Khởi động & Chào hỏi cơ bản
    {
        title: 'Cử chỉ "Xin chào"',
        signConcept: 'Xin chào',
        pinyinOrEn: 'Hello / Greeting',
        category: 'Chào hỏi & Giao tiếp',
        stage: 1,
        order: 1,
        description: 'Nâng cả hai bàn tay lên ngang hai bên thái dương / mang tai, các ngón tay mở thẳng hướng lên trên và đưa nhẹ ra trước với nét mặt thân thiện.',
        instructions: [
            'Bước 1: Nâng cả 2 bàn tay lên ngang 2 bên thái dương / mang tai.',
            'Bước 2: Lòng bàn tay mở phẳng hướng nhẹ vào nhau hoặc ra trước.',
            'Bước 3: Giữ tư thế 2 tay cân đối 1.5 giây để AI xác thực đủ 42 điểm khớp.',
        ],
        tips: 'Đứng cách camera khoảng 0.8m - 1.2m để AI bắt trọn 42 điểm landmark của cả 2 bàn tay.',
        region: 'Toàn quốc (Phổ thông)',
        standardVideoUrl: '/videos/xin-chao.mp4',
        xpReward: 50,
        difficulty: 'Cơ bản',
        targetHandAngle: 165,
        holdTimeRequired: 1.5,
    },
    {
        title: 'Cử chỉ "Cảm ơn"',
        signConcept: 'Cảm ơn',
        pinyinOrEn: 'Thank You',
        category: 'Chào hỏi & Giao tiếp',
        stage: 1,
        order: 2,
        description: 'Đặt đầu các ngón tay của bàn tay thuận chạm nhẹ vào cằm, rồi đưa nhẹ thẳng về phía người đối diện.',
        instructions: [
            'Bước 1: Mở phẳng bàn tay thuận, đầu ngón tay chạm nhẹ vào cằm.',
            'Bước 2: Hướng lòng bàn tay về phía ngực mình.',
            'Bước 3: Đưa tay hướng về phía trước, lòng bàn tay lật ngửa nhẹ.',
        ],
        tips: 'Kết hợp mỉm cười nhẹ nhàng và giữ thế tay trước cằm 1.5 giây.',
        region: 'Toàn quốc (Phổ thông)',
        standardVideoUrl: 'https://cdn.example.com/videos/cam-on.mp4',
        xpReward: 50,
        difficulty: 'Cơ bản',
        targetHandAngle: 155,
        holdTimeRequired: 1.5,
    },
    {
        title: 'Cử chỉ "Tạm biệt"',
        signConcept: 'Tạm biệt',
        pinyinOrEn: 'Goodbye',
        category: 'Chào hỏi & Giao tiếp',
        stage: 1,
        order: 3,
        description: 'Đưa bàn tay mở lên ngang ngực hoặc vai, gập và mở 4 ngón tay nhịp nhàng hướng về người đối diện.',
        instructions: [
            'Bước 1: Đưa bàn tay mở lên ngang vai.',
            'Bước 2: Lòng bàn tay hướng về phía trước.',
            'Bước 3: Vẫy gập các ngón tay từ 2 - 3 lần.',
        ],
        tips: 'Giữ khuỷu tay mở góc 45 độ thoải mái.',
        region: 'Toàn quốc (Phổ thông)',
        standardVideoUrl: 'https://cdn.example.com/videos/tam-biet.mp4',
        xpReward: 50,
        difficulty: 'Cơ bản',
        targetHandAngle: 170,
        holdTimeRequired: 1.5,
    },
    {
        title: 'Cử chỉ "Tôi yêu bạn" (ILY Sign)',
        signConcept: 'Tôi yêu bạn',
        pinyinOrEn: 'I Love You (ILY)',
        category: 'Chào hỏi & Giao tiếp',
        stage: 1,
        order: 4,
        description: 'Xòe ngón cái, ngón trỏ và ngón út, gập hai ngón giữa lại và hướng lòng bàn tay về phía đối phương.',
        instructions: [
            'Bước 1: Nắm bàn tay lại trước ngực.',
            'Bước 2: Mở thẳng ngón cái, ngón trỏ và ngón út.',
            'Bước 3: Giữ hai ngón giữa gập chặt sát lòng bàn tay.',
        ],
        tips: 'Đảm bảo ngón trỏ và ngón út giơ thẳng đứng, giữ nguyên 1.5 giây.',
        region: 'Quốc tế & Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/i-love-you.mp4',
        xpReward: 50,
        difficulty: 'Cơ bản',
        targetHandAngle: 180,
        holdTimeRequired: 1.5,
    },

    // Chặng 2: Số đếm & Thời gian
    {
        title: 'Số đếm ngón tay từ 1 đến 5',
        signConcept: 'Số đếm 1 - 5',
        pinyinOrEn: 'Numbers 1 to 5',
        category: 'Số đếm & Thời gian',
        stage: 2,
        order: 1,
        description: 'Quy ước giơ từng ngón tay theo thứ tự từ ngón trỏ đến ngón cái theo chuẩn ngôn ngữ ký hiệu Việt Nam.',
        instructions: [
            'Số 1: Giơ ngón trỏ thẳng đứng.',
            'Số 2: Giơ ngón trỏ và ngón giữa.',
            'Số 3: Giơ ngón trỏ, giữa và ngón áp út (hoặc ngón cái, trỏ, giữa tùy vùng).',
            'Số 4: Giơ 4 ngón tay khép ngón cái.',
            'Số 5: Xòe cả 5 ngón tay.',
        ],
        tips: 'Lòng bàn tay hướng ra trước, các ngón tay thẳng và dứt khoát.',
        region: 'Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/so-dem-1-5.mp4',
        xpReward: 60,
        difficulty: 'Cơ bản',
        targetHandAngle: 160,
        holdTimeRequired: 1.5,
    },
    {
        title: 'Số đếm từ 6 đến 10',
        signConcept: 'Số đếm 6 - 10',
        pinyinOrEn: 'Numbers 6 to 10',
        category: 'Số đếm & Thời gian',
        stage: 2,
        order: 2,
        description: 'Biểu diễn số đếm từ 6 đến 10 bằng các thế kết hợp ngón cái.',
        instructions: [
            'Số 6: Chạm ngón cái vào ngón út.',
            'Số 7: Chạm ngón cái vào ngón áp út.',
            'Số 8: Chạm ngón cái vào ngón giữa.',
            'Số 9: Chạm ngón cái vào ngón trỏ.',
            'Số 10: Lắc nắm đấm ngón cái giơ lên.',
        ],
        tips: 'Chú ý thế ngón cái tiếp xúc chuẩn vào từng đốt ngón tay.',
        region: 'Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/so-dem-6-10.mp4',
        xpReward: 60,
        difficulty: 'Trung bình',
        targetHandAngle: 150,
        holdTimeRequired: 1.5,
    },
    {
        title: 'Cử chỉ "Hôm nay"',
        signConcept: 'Hôm nay',
        pinyinOrEn: 'Today',
        category: 'Số đếm & Thời gian',
        stage: 2,
        order: 3,
        description: 'Hai bàn tay mở ngửa ngón cong nhẹ, nhấn xuống hai nhịp trước ngực.',
        instructions: [
            'Bước 1: Đặt hai tay trước ngực, lòng bàn tay ngửa lên.',
            'Bước 2: Nhấn nhẹ hai tay xuống dưới đồng thời 2 lần.',
        ],
        tips: 'Động tác hai tay song song và dứt khoát.',
        region: 'Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/hom-nay.mp4',
        xpReward: 60,
        difficulty: 'Cơ bản',
        targetHandAngle: 140,
        holdTimeRequired: 1.5,
    },

    // Chặng 3: Gia đình & Xưng hô
    {
        title: 'Cử chỉ "Bố / Cha"',
        signConcept: 'Bố',
        pinyinOrEn: 'Father',
        category: 'Gia đình & Xưng hô',
        stage: 3,
        order: 1,
        description: 'Đầu ngón tay cái chạm nhẹ vào vùng cằm hoặc mép miệng biểu thị râu của người đàn ông.',
        instructions: [
            'Bước 1: Bàn tay thuận mở tự nhiên.',
            'Bước 2: Ngón cái chạm nhẹ vào cằm.',
        ],
        tips: 'Giữ thế tay 1.5s để AI nhận diện góc tiếp xúc.',
        region: 'Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/bo.mp4',
        xpReward: 75,
        difficulty: 'Cơ bản',
        targetHandAngle: 160,
        holdTimeRequired: 1.5,
    },
    {
        title: 'Cử chỉ "Mẹ"',
        signConcept: 'Mẹ',
        pinyinOrEn: 'Mother',
        category: 'Gia đình & Xưng hô',
        stage: 3,
        order: 2,
        description: 'Đầu ngón tay cái chạm nhẹ vào má hoặc tai biểu thị người phụ nữ.',
        instructions: [
            'Bước 1: Bàn tay thuận mở tự nhiên.',
            'Bước 2: Ngón cái chạm nhẹ vào gò má phải.',
        ],
        tips: 'Nét mặt ấm áp, tay đặt đúng vị trí gò má.',
        region: 'Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/me.mp4',
        xpReward: 75,
        difficulty: 'Cơ bản',
        targetHandAngle: 160,
        holdTimeRequired: 1.5,
    },

    // Chặng 4: Xã hội & Cấp cứu
    {
        title: 'Cử chỉ "Cần giúp đỡ"',
        signConcept: 'Cần giúp đỡ',
        pinyinOrEn: 'Need Help',
        category: 'Y tế & Khẩn cấp',
        stage: 4,
        order: 1,
        description: 'Bàn tay trái ngửa làm bệ đỡ, bàn tay phải nắm lại giơ ngón cái lên đặt vào lòng tay trái và cùng nâng lên.',
        instructions: [
            'Bước 1: Đặt bàn tay trái mở ngửa phẳng trước ngực.',
            'Bước 2: Bàn tay phải nắm lại, ngón cái dựng đứng chỉ lên.',
            'Bước 3: Đặt tay phải lên lòng bàn tay trái và nâng nhẹ cả hai tay lên.',
        ],
        tips: 'Cử chỉ hai tay phối hợp vững vàng, ánh mắt hướng về phía trước.',
        region: 'Toàn quốc',
        standardVideoUrl: 'https://cdn.example.com/videos/giup-do.mp4',
        xpReward: 100,
        difficulty: 'Trung bình',
        targetHandAngle: 175,
        holdTimeRequired: 1.5,
    },
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sep490';
        await mongoose.connect(mongoUri);
        console.log('✅ Đã kết nối MongoDB thành công');

        // Xóa các bài học cũ nếu có để tránh trùng lặp
        await Lesson.deleteMany({});
        console.log('🗑️ Đã làm sạch collection lessons cũ');

        // Thêm danh sách bài học mẫu
        const inserted = await Lesson.insertMany(sampleLessons);
        console.log(`🎉 Đã nạp thành công ${inserted.length} bài học mẫu chuẩn vào MongoDB!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi nạp Seed Data:', error);
        process.exit(1);
    }
}

seed();
