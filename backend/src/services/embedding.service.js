/**
 * VIETHERITAGE AI — TEXT EMBEDDING & VECTOR SIMILARITY SERVICE
 * Cung cấp giải thuật Real AI Vector Embedding sử dụng Google Gemini Embedding
 * và tính toán Cosine Similarity trực tiếp, hoàn toàn miễn phí.
 */

const EMBEDDING_MODELS = [
    'models/gemini-embedding-001',
    'models/gemini-embedding-2',
];

/**
 * Trích xuất chuỗi nội dung toàn diện của tác phẩm để biểu diễn ngữ nghĩa
 */
function buildWorkEmbeddingText(work) {
    if (!work) return '';
    const parts = [
        `Tác phẩm: ${work.title}`,
        work.categoryName ? `Thể loại: ${work.categoryName}` : '',
        work.topic ? `Chủ đề: ${work.topic}` : '',
        work.quote ? `Trích dẫn câu ca dao / tục ngữ: "${work.quote}"` : '',
        work.summary ? `Tóm tắt: ${work.summary}` : '',
        work.literalMeaning ? `Nghĩa đen: ${work.literalMeaning}` : '',
        work.figurativeMeaning ? `Nghĩa bóng và ẩn dụ: ${work.figurativeMeaning}` : '',
        work.lesson ? `Bài học nhân sinh đạo lý: ${work.lesson}` : '',
        work.thematicMeaning ? `Ý nghĩa biểu tượng: ${work.thematicMeaning}` : '',
        work.tags && work.tags.length > 0 ? `Từ khóa: ${work.tags.join(', ')}` : '',
    ].filter(Boolean);

    return parts.join('. ');
}

/**
 * Tính toán độ tương đồng Cosine Similarity giữa 2 vector cùng số chiều
 * Kết quả trả về nằm trong khoảng [-1.0, 1.0] (thường từ 0.0 đến 1.0 đối với text embedding)
 */
function cosineSimilarity(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
        return 0;
    }

    const len = Math.min(vecA.length, vecB.length);
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;

    for (let i = 0; i < len; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Gọi Google Gemini API để nhúng một đoạn văn bản thành vector 768 chiều
 * Tự động xoay vòng qua các model embedding miễn phí
 */
async function getEmbedding(text, targetDim = 768) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('[EmbeddingService] Không tìm thấy GEMINI_API_KEY trong .env');
        return null;
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
        return null;
    }

    // Giới hạn độ dài text để tránh vượt token limit
    const cleanText = text.trim().slice(0, 4000);

    for (const model of EMBEDDING_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: {
                        parts: [{ text: cleanText }],
                    },
                    outputDimensionality: targetDim,
                }),
                signal: AbortSignal.timeout(8000),
            });

            if (response.ok) {
                const data = await response.json();
                const values = data.embedding?.values;
                if (Array.isArray(values) && values.length > 0) {
                    return values;
                }
            } else {
                console.warn(`[EmbeddingService] Model ${model} trả về status ${response.status}`);
            }
        } catch (err) {
            console.warn(`[EmbeddingService] Lỗi gọi model ${model}:`, err.message);
        }
    }

    return null;
}

module.exports = {
    getEmbedding,
    cosineSimilarity,
    buildWorkEmbeddingText,
};

