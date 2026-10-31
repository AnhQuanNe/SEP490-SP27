/**
 * SCRIPT TỰ ĐỘNG SINH VECTOR EMBEDDING CHO TẤT CẢ TÁC PHẨM TRONG DATABASE
 * Chạy 1 lần để nhúng toàn bộ kho tàng ca dao/tục ngữ thành vector 768 chiều.
 * Hoàn toàn miễn phí sử dụng Google gemini-embedding API.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Work = require('../models/Work');
const { getEmbedding, buildWorkEmbeddingText } = require('../services/embedding.service');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
    console.log('=== BẮT ĐẦU SINH REAL AI VECTOR EMBEDDINGS CHO TÁC PHẨM ===');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sep490';
    console.log('-> Kết nối MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const isForce = process.argv.includes('--force');
    const query = isForce
        ? { status: 'published' }
        : { status: 'published', $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] };

    const worksToEmbed = await Work.find(query);
    console.log(`-> Tìm thấy ${worksToEmbed.length} tác phẩm cần tạo vector embedding...`);

    if (worksToEmbed.length === 0) {
        console.log('✓ Tất cả tác phẩm đã có vector embedding đầy đủ! Không cần chạy lại.');
        await mongoose.disconnect();
        process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < worksToEmbed.length; i++) {
        const work = worksToEmbed[i];
        const textToEmbed = buildWorkEmbeddingText(work);
        process.stdout.write(`[${i + 1}/${worksToEmbed.length}] Đang embed "${work.title}"... `);

        try {
            const vector = await getEmbedding(textToEmbed, 768);
            if (vector && vector.length === 768) {
                await Work.updateOne({ _id: work._id }, { $set: { embedding: vector } });
                console.log(`✓ Xong (768 chiều)`);
                successCount++;
            } else {
                console.log(`✗ Thất bại (Không nhận được vector)`);
                failCount++;
            }
        } catch (err) {
            console.log(`✗ Lỗi: ${err.message}`);
            failCount++;
        }

        // Tạm nghỉ 250ms giữa các request để đảm bảo an toàn hạn mức Free Tier
        await sleep(250);
    }

    console.log('\n=== KẾT QUẢ TẠO VECTOR EMBEDDING ===');
    console.log(`- Thành công: ${successCount} tác phẩm`);
    console.log(`- Thất bại: ${failCount} tác phẩm`);
    console.log('====================================');

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error('Lỗi nghiêm trọng:', err);
    process.exit(1);
});

