/**
 * SCRIPT KIỂM THỬ KẾT NỐI GOOGLE GEMINI API THỰC TẾ
 * Dự án: VietHeritage AI
 * Chức năng: Kiểm tra xem GEMINI_API_KEY trong .env có hoạt động thật sự không,
 *            gửi request thực tế lên máy chủ Google và in kết quả.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-8b',
];

async function testGeminiKey() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('====================================================');
    console.log('🔍 KIỂM THỬ KẾT NỐI GOOGLE GEMINI API — VIETHERITAGE AI');
    console.log('====================================================');

    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
        console.error('❌ CHƯA TÌM THẤY GEMINI_API_KEY TRONG FILE .env!');
        console.log('\n👉 Hướng dẫn khắc phục:');
        console.log('1. Vào https://aistudio.google.com/ lấy key (bắt đầu bằng AIzaSy...)');
        console.log('2. Mở file backend/.env và thêm: GEMINI_API_KEY=chuỗi_key_của_bạn');
        console.log('3. Chạy lại lệnh này: node src/utils/testGeminiKey.js');
        process.exit(1);
    }

    console.log(`✓ Đã tìm thấy GEMINI_API_KEY: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
    console.log('📡 Đang gửi request kiểm thử lên máy chủ Google AI Studio...');

    const prompt = 'Hãy giới thiệu ngắn gọn trong 2 câu về nét đẹp độc đáo của ca dao Việt Nam.';
    let success = false;

    for (const model of GEMINI_MODELS) {
        try {
            console.log(`\n⏳ Thử nghiệm với model: [${model}]...`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (reply) {
                    console.log(`✅ KẾT NỐI THÀNH CÔNG RỰC RỠ VỚI MODEL: ${model}!`);
                    console.log('----------------------------------------------------');
                    console.log('🤖 Phản hồi thời gian thực từ Google Gemini AI:');
                    console.log(reply.trim());
                    console.log('----------------------------------------------------');
                    success = true;
                    break;
                }
            } else {
                const errText = await response.text();
                console.warn(`⚠ Model ${model} phản hồi status ${response.status}: ${errText.slice(0, 150)}...`);
            }
        } catch (err) {
            console.warn(`⚠ Lỗi kết nối model ${model}:`, err.message);
        }
    }

    if (success) {
        console.log('\n🎉 XÁC NHẬN: Hệ thống của bạn đã kích hoạt AI THẬT 100%!');
        console.log('Giờ đây tất cả tính năng Chatbot, Gia sư AI, Thẩm định thơ, Phân tích 4 tầng nghĩa đều được sinh ra từ Google LLM.');
    } else {
        console.error('\n❌ Không kết nối được với Google Gemini. Vui lòng kiểm tra lại tính hợp lệ của API Key hoặc kết nối mạng.');
    }
    console.log('====================================================\n');
}

testGeminiKey();
