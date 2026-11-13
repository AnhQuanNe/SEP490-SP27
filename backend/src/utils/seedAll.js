/**
 * VietHeritage AI - Unified Master Database Seeder
 * Chạy toàn bộ dữ liệu khởi tạo cho dự án trong 1 lệnh duy nhất:
 * npm run seed
 */
const { spawnSync } = require('child_process');
const path = require('path');

const SEED_STEPS = [
    { name: '1. Quản trị viên & Thiết lập hệ thống (UC19)', file: path.join(__dirname, 'seedAdmin.js') },
    { name: '2. Tác phẩm Ca dao, Tục ngữ & Văn học kinh điển', file: path.join(__dirname, 'seedLiterature.js') },
    { name: '3. Bản đồ Di sản & Địa danh Văn hóa', file: path.join(__dirname, 'seedLocations.js') },
    { name: '4. Bảo vật Di sản Không gian 3D/Toàn cảnh', file: path.join(__dirname, 'seedArtifacts.js') },
    { name: '5. Dị bản Dân gian Học thuật Toàn diện', file: path.join(__dirname, 'seedAllFolkVariants.js') },
    { name: '6. Ngân hàng 100 Câu hỏi Trắc nghiệm Di sản', file: path.join(__dirname, '../seeds/seedQuizQuestions.js') },
];

console.log('===============================================================');
console.log('🚀 BẮT ĐẦU KHỞI TẠO DỮ LIỆU TOÀN DIỆN CHO VIETHERITAGE AI');
console.log('===============================================================\n');

const startTime = Date.now();

for (const step of SEED_STEPS) {
    console.log(`\n---------------------------------------------------------------`);
    console.log(`▶ ĐANG THỰC HIỆN: ${step.name}`);
    console.log(`---------------------------------------------------------------`);

    const result = spawnSync(process.execPath, [step.file], {
        stdio: 'inherit',
        env: process.env,
    });

    if (result.status !== 0) {
        console.error(`\n❌ [LỖI] Bước "${step.name}" thất bại với mã lỗi ${result.status}. Dừng quá trình seed.`);
        process.exit(result.status || 1);
    }
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('\n===============================================================');
console.log(`🎉 HOÀN THÀNH TOÀN BỘ SEED DỮ LIỆU THÀNH CÔNG! (Thời gian: ${elapsedSec}s)`);
console.log('---------------------------------------------------------------');
console.log('Tài khoản Quản trị mặc định:');
console.log('  - Email:    admin@vietheritage.vn');
console.log('  - Mật khẩu: Admin@123456');
console.log('===============================================================\n');
process.exit(0);
