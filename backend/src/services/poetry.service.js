const Poem = require('../models/Poem');
const { analyzeLucBatPoem, checkWordRhyme, getToneType, extractRime } = require('../utils/lucBatAnalyzer');

// Tích hợp gọi Gemini AI
const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
];

async function callGeminiPoetryApi({ prompt, systemInstruction }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
        },
    };

    for (const model of GEMINI_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    let cleaned = text.trim();
                    if (cleaned.startsWith('```')) {
                        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
                    }
                    return JSON.parse(cleaned);
                }
            }
        } catch (err) {
            console.warn(`[Poetry AI] Lỗi model ${model}:`, err.message);
        }
    }
    return null;
}

/**
 * Phân tích âm luật bằng Rule Engine
 */
function analyzePoemRule(content) {
    return analyzeLucBatPoem(content);
}

/**
 * Thuật toán thẩm định thơ nội sinh khi không có kết nối Gemini
 */
function fallbackPoetryCritic(content, ruleAnalysis) {
    const { summary, lines, rhymes } = ruleAnalysis;
    
    // Tính điểm vần điệu (0 - 30)
    let rhymeValidCount = rhymes.filter((r) => r.isRhyme).length;
    let rhymeRatio = rhymes.length > 0 ? rhymeValidCount / rhymes.length : 1;
    let rhythmScore = Math.round(rhymeRatio * 20 + (summary.structuralErrors === 0 ? 10 : 4));
    rhythmScore = Math.min(30, Math.max(5, rhythmScore));

    // Tính điểm hồn thơ (0 - 30)
    let poeticScore = 20;
    if (summary.toneErrors === 0 && summary.rhymeErrors === 0) poeticScore += 6;
    if (content.length > 50) poeticScore += 2;
    poeticScore = Math.min(30, poeticScore);

    const strengths = [];
    if (summary.structuralErrors === 0) strengths.push('Cấu trúc số tiếng câu Lục (6) và câu Bát (8) chuẩn mực.');
    if (summary.toneErrors === 0) strengths.push('Tuân thủ nghiêm cẩn luật Bằng - Trắc ở các vị trí cốt tử (2 - 4 - 6 - 8).');
    if (rhymes.some((r) => r.isRhyme)) strengths.push('Hiệp vần tự nhiên, giàu nhạc tính và thuận miệng khi đọc.');
    if (strengths.length === 0) strengths.push('Tứ thơ mộc mạc, thể hiện tinh thần tìm tòi sáng tác thể thơ truyền thống.');

    const improvements = [];
    lines.forEach((l, lIdx) => {
        l.issues.forEach((iss) => {
            if (iss.type === 'tone') {
                improvements.push({
                    lineIndex: lIdx,
                    syllablePosition: iss.position,
                    originalWord: iss.word,
                    issueDescription: iss.message,
                    suggestions: [
                        {
                            word: iss.expected === 'B' ? 'thanh' : 'sắc',
                            reason: `Cần đổi sang tiếng mang thanh ${iss.expected === 'B' ? 'Bằng' : 'Trắc'} để chuẩn luật nhịp.`,
                            isToneValid: true,
                        },
                    ],
                });
            }
        });
    });

    return {
        rhythmScore,
        poeticScore,
        strengths,
        improvements,
        overallComment: summary.isValid
            ? 'Bài thơ đạt chuẩn mực cao về niêm luật Lục Bát cổ truyền. Âm hưởng nhịp nhàng, có tính biểu cảm tốt.'
            : 'Bài thơ có ý tứ đẹp, tuy nhiên cần hiệu chỉnh lại một số tiếng tại các vị trí chẵn để trọn vẹn niêm luật Bằng - Trắc.',
        refinedVersion: content,
    };
}

/**
 * Thẩm định thơ toàn diện (Rule Engine + AI Critic)
 */
async function critiquePoem({ content, title = 'Không đề', authorName = 'Tác giả' }) {
    if (!content || !content.trim()) {
        throw new Error('Vui lòng nhập nội dung bài thơ cần thẩm định');
    }

    // 1. Chạy Rule-based Engine trước
    const ruleAnalysis = analyzeLucBatPoem(content);
    const toneScore = ruleAnalysis.summary.toneScore; // 0 - 40

    // 2. Gọi AI để đánh giá Nhịp điệu và Hồn thơ
    const prompt = `Phân tích bài thơ Lục Bát sau:
Tựa đề: ${title}
Tác giả: ${authorName}
Nội dung bài thơ:
"""
${content}
"""

Kết quả kiểm tra âm luật từ Rule Engine:
- Tổng số dòng: ${ruleAnalysis.summary.totalLines}
- Lỗi cấu trúc số tiếng: ${ruleAnalysis.summary.structuralErrors}
- Lỗi bằng trắc: ${ruleAnalysis.summary.toneErrors}
- Lỗi vần điệu: ${ruleAnalysis.summary.rhymeErrors}
- Danh sách lỗi: ${ruleAnalysis.allIssues.join('; ')}

Yêu cầu trả về đúng định dạng JSON:
{
  "rhythmScore": (số nguyên từ 0 đến 30: đánh giá độ mượt mà của vần và nhịp thơ),
  "poeticScore": (số nguyên từ 0 đến 30: cảm xúc, hình tượng, chất văn học dân gian),
  "strengths": ["ưu điểm 1", "ưu điểm 2"],
  "improvements": [
    {
      "lineIndex": (số chỉ dòng bị lỗi, bắt đầu từ 0),
      "syllablePosition": (vị trí tiếng cần sửa, từ 1 đến 8),
      "originalWord": (từ gốc trong câu),
      "issueDescription": (mô tả lỗi hoặc lý do cần sửa),
      "suggestions": [
        {
          "word": (từ thay thế gợi ý),
          "reason": (giải thích tại sao từ này phù hợp cả ý thơ lẫn âm luật)
        }
      ]
    }
  ],
  "overallComment": "Nhận xét tổng thể về bài thơ",
  "refinedVersion": "Phiên bản bài thơ được AI trau chuốt mượt mà hơn (giữ nguyên tứ thơ)"
}`;

    const systemInstruction = `Bạn là Chuyên gia Thi pháp & Thẩm định Thơ Lục Bát Cổ truyền Việt Nam của nền tảng VietHeritage AI.
Hãy chấm điểm công tâm, nhân văn, sâu sắc và chỉ ra các điểm cần sửa chữa một cách chuẩn xác theo niêm luật thi pháp học. Luôn trả lời bằng định dạng JSON thuần túy.`;

    let aiCritic = await callGeminiPoetryApi({ prompt, systemInstruction });

    if (!aiCritic || typeof aiCritic.rhythmScore !== 'number') {
        aiCritic = fallbackPoetryCritic(content, ruleAnalysis);
    }

    // Đảm bảo giới hạn điểm
    const rhythmScore = Math.min(30, Math.max(0, Math.round(aiCritic.rhythmScore || 18)));
    const poeticScore = Math.min(30, Math.max(0, Math.round(aiCritic.poeticScore || 18)));
    const totalScore = Math.min(100, Math.max(0, toneScore + rhythmScore + poeticScore));

    // Yêu cầu quan trọng: Chạy lại Rule Engine cho từng từ gợi ý thay thế để xác thực âm luật
    if (Array.isArray(aiCritic.improvements)) {
        aiCritic.improvements.forEach((imp) => {
            const line = ruleAnalysis.lines[imp.lineIndex];
            const pos = imp.syllablePosition;
            const expectedTone = line?.tonePattern?.find((tp) => tp.position === pos)?.expectedTone;

            if (Array.isArray(imp.suggestions)) {
                imp.suggestions.forEach((sug) => {
                    const wordTone = getToneType(sug.word);
                    sug.actualTone = wordTone.toneType;
                    sug.toneName = wordTone.toneName;
                    sug.isToneValid = expectedTone ? wordTone.toneType === expectedTone : true;
                });
            }
        });
    }

    return {
        scores: {
            toneScore,     // 0 - 40 (Từ rule-based)
            rhythmScore,   // 0 - 30 (Từ AI / thẩm định nhạc tính)
            poeticScore,   // 0 - 30 (Từ AI / hồn thơ cảm xúc)
            totalScore,    // 0 - 100
        },
        ruleAnalysis,
        aiCritic: {
            rhythmScore,
            poeticScore,
            strengths: aiCritic.strengths || [],
            improvements: aiCritic.improvements || [],
            overallComment: aiCritic.overallComment || '',
            refinedVersion: aiCritic.refinedVersion || content,
        },
    };
}

/**
 * Đối thơ cùng AI: Nhận câu Lục (6 tiếng) -> Sinh câu Bát (8 tiếng) chuẩn luật & vần
 */
async function coWriteBatLine({ lucLine, context = '' }) {
    if (!lucLine || !lucLine.trim()) {
        throw new Error('Vui lòng nhập câu Lục (6 tiếng) để AI ứng khẩu câu Bát');
    }

    const cleanLuc = lucLine.trim();
    const words = cleanLuc.split(/\s+/).filter(Boolean);

    if (words.length !== 6) {
        throw new Error(`Câu Lục phải có đúng 6 tiếng (hiện bạn nhập ${words.length} tiếng).`);
    }

    // Phân tích câu Lục bằng rule engine
    const lineObj = {
        lineIndex: 0,
        rawText: cleanLuc,
        syllableCount: words.length,
        syllables: words.map((w, idx) => ({
            position: idx + 1,
            clean: w.replace(/^[.,/#!$%^&*;:{}=\-_`~()"'“”‘’]+|[.,/#!$%^&*;:{}=\-_`~()"'“”‘’]+$/g, ''),
            ...getToneType(w),
        })),
    };

    const analyzedLuc = lineObj;
    const word6Luc = lineObj.syllables[5].clean;
    const tone6Luc = lineObj.syllables[5].toneType;

    const rime6 = extractRime(word6Luc);

    const contextClause = context && context.trim()
        ? `\n[NGỮ CẢNH BÀI THƠ / TÁC PHẨM ĐANG SÁNG TÁC]:\n${context.trim()}\n`
        : '';

    const prompt = `Người dùng vừa sáng tác câu thơ Lục (6 tiếng):
"${cleanLuc}"
- Tiếng thứ 6 gieo vần là: "${word6Luc}" (thanh ${tone6Luc === 'B' ? 'Bằng' : 'Trắc'}, vần "${rime6}").
${contextClause}
NHIỆM VỤ THI PHÁP: Hãy ứng khẩu sáng tác 3 phương án câu Bát (đúng 8 tiếng) tiếp nối hoàn hảo câu Lục trên.

CÁC TIÊU CHÍ NGHỆ THUẬT & ÂM LUẬT BẮT BUỘC:
1. Thấu cảm tứ thơ & Ngữ cảnh:
   - Cảm thụ sâu sắc hình ảnh, không gian, thời gian và mạch cảm xúc trong câu Lục (và ngữ cảnh tác phẩm nếu có).
   - Câu Bát đối lại phải liên kết hữu cơ, tự nhiên như hơi thở, lời thơ mượt mà giàu chất nhạc và cảm xúc, tuyệt đối không ghép từ gượng gạo chỉ để đủ vần.
2. Đúng 8 tiếng (không thừa không thiếu một từ).
3. Hiệp vần chuẩn mực (Yêu vận):
   - Tiếng thứ 6 của câu Bát BẮT BUỘC phải hiệp vần với tiếng "${word6Luc}" (cùng mang thanh Bằng và cùng vần "${rime6}" hoặc vần thông hợp lệ).
4. Niêm luật Bằng - Trắc nghiêm ngặt:
   - Tiếng 2: Thanh BẰNG (ngang hoặc huyền)
   - Tiếng 4: Thanh TRẮC (sắc, hỏi, ngã, nặng)
   - Tiếng 6: Thanh BẰNG (hiệp vần với "${word6Luc}")
   - Tiếng 8: Thanh BẰNG
   - QUY TẮC TRẦM - BỔNG CỦA THI SĨ: Nếu tiếng thứ 6 là thanh Ngang (không dấu) thì tiếng thứ 8 nên mang thanh Huyền (hoặc ngược lại) để câu thơ có độ bổng trầm hài hòa, ngân nga êm dịu, không bị cụt âm.
5. Sáng tác 3 phương án với 3 sắc thái biểu cảm phong phú:
   - Phương án 1 (Trữ tình - Êm đềm): Tả cảnh ngụ tình, lời thơ dịu dàng, tiếp nối trực tiếp hình tượng câu Lục.
   - Phương án 2 (Triết lý - Nhân văn): Mở rộng chiều sâu chiêm nghiệm, đạo lý gia đình, tình nghĩa thủy chung hoặc nhân sinh.
   - Phương án 3 (Dân dã - Khoáng đạt): Đậm chất ca dao, mộc mạc, tha thiết, giàu chất họa chất nhạc đồng quê.

ĐỊNH DẠNG KẾT QUẢ: Trả về JSON thuần túy (không markdown bao bọc):
{
  "candidates": [
    {
      "batLine": "Câu thơ 8 tiếng phương án 1",
      "explanation": "Phân tích vẻ đẹp hình ảnh, tứ thơ và cách hiệp vần với '${word6Luc}'",
      "mood": "Trữ tình"
    },
    {
      "batLine": "Câu thơ 8 tiếng phương án 2",
      "explanation": "Phân tích vẻ đẹp hình ảnh, tứ thơ và cách hiệp vần với '${word6Luc}'",
      "mood": "Triết lý"
    },
    {
      "batLine": "Câu thơ 8 tiếng phương án 3",
      "explanation": "Phân tích vẻ đẹp hình ảnh, tứ thơ và cách hiệp vần với '${word6Luc}'",
      "mood": "Dân dã"
    }
  ]
}`;

    const systemInstruction = `Bạn là một Đại thi hào và bậc thầy thi pháp Lục Bát Việt Nam (tinh thông âm luật, nhạc tính uyển chuyển như Truyện Kiều và thấm đẫm tâm hồn ca dao dân tộc).
Mục tiêu tối thượng của bạn là sáng tác câu thơ tự nhiên, có hồn, giàu hình tượng, lay động lòng người và chuẩn mực âm luật tuyệt đối. Luôn trả lời JSON thuần túy.`;

    let aiResult = await callGeminiPoetryApi({ prompt, systemInstruction });

    // Fallback thông minh nếu không có kết nối Gemini hoặc API hết hạn
    if (!aiResult || !Array.isArray(aiResult.candidates) || aiResult.candidates.length === 0) {
        const RHYME_TEMPLATES = {
            'a': [
                { batLine: 'Đêm thanh soi bóng đường xa mịt mùng', explanation: `Hiệp vần "xa" với "${word6Luc}" (cùng vần a, thanh Bằng).`, mood: 'Trữ tình' },
                { batLine: 'Gió đưa thoang thoảng hương hoa ngọt ngào', explanation: `Hiệp vần "hoa" với "${word6Luc}" (cùng vần a, thanh Bằng).`, mood: 'Thanh cảnh' },
                { batLine: 'Nắng mai sưởi ấm lòng ta bao ngày', explanation: `Hiệp vần "ta" với "${word6Luc}" (cùng vần a, thanh Bằng).`, mood: 'Triết lý' },
            ],
            'on': [
                { batLine: 'Nghìn thu ghi khắc sắc son một lòng', explanation: `Hiệp vần "son" với "${word6Luc}" (cùng vần on, thanh Bằng).`, mood: 'Thủy chung' },
                { batLine: 'Trời cao chứng giám lòng con thảo hiền', explanation: `Hiệp vần "con" với "${word6Luc}" (cùng vần on, thanh Bằng).`, mood: 'Hiếu nghĩa' },
            ],
            'ong': [
                { batLine: 'Nghìn thu soi tỏ tấm lòng thảo thơm', explanation: `Hiệp vần "lòng" với "${word6Luc}" (cùng vần ong, thanh Bằng).`, mood: 'Triết lý' },
                { batLine: 'Thuyền xuôi bến vắng trên dòng sông sâu', explanation: `Hiệp vần "dòng" với "${word6Luc}" (cùng vần ong, thanh Bằng).`, mood: 'Trữ tình' },
            ],
            'ang': [
                { batLine: 'Trăng khuya soi bóng dịu dàng khắp nơi', explanation: `Hiệp vần "dàng" với "${word6Luc}" (cùng vần ang, thanh Bằng).`, mood: 'Trữ tình' },
                { batLine: 'Đường xa vạn dặm thênh thang lối về', explanation: `Hiệp vần "thang" với "${word6Luc}" (cùng vần ang, thanh Bằng).`, mood: 'Khoáng đạt' },
            ],
            'oi': [
                { batLine: 'Dẫu cho cách trở muôn nơi vẫn chờ', explanation: `Hiệp vần "nơi" với "${word6Luc}" (cùng vần ơi/oi thông vần, thanh Bằng).`, mood: 'Thủy chung' },
                { batLine: 'Thời gian thấm thoát đưa thoi qua dần', explanation: `Hiệp vần "thoi" với "${word6Luc}" (cùng vần oi, thanh Bằng).`, mood: 'Hoài niệm' },
            ],
            'ay': [
                { batLine: 'Bao năm tích đức dựng xây cơ đồ', explanation: `Hiệp vần "xây" với "${word6Luc}" (cùng vần ay, thanh Bằng).`, mood: 'Khuyên răn' },
                { batLine: 'Gió đông se lạnh từng ngày nhớ thương', explanation: `Hiệp vần "ngày" với "${word6Luc}" (cùng vần ay, thanh Bằng).`, mood: 'Trữ tình' },
            ],
            'au': [
                { batLine: 'Dù cho dâu bể trước sau vẹn toàn', explanation: `Hiệp vần "sau" với "${word6Luc}" (cùng vần au, thanh Bằng).`, mood: 'Đạo nghĩa' },
                { batLine: 'Lời xưa răn dạy khắc sâu tấc lòng', explanation: `Hiệp vần "sâu" với "${word6Luc}" (cùng vần âu/au thông vần, thanh Bằng).`, mood: 'Chiêm nghiệm' },
            ],
            'en': [
                { batLine: 'Giữ lòng trong sạch vững bền trước sau', explanation: `Hiệp vần "bền" với "${word6Luc}" (cùng vần ên/en thông vần, thanh Bằng).`, mood: 'Khí tiết' },
                { batLine: 'Bóng ai thấp thoáng bên thềm ngóng trông', explanation: `Hiệp vần "thềm" với "${word6Luc}" (cùng vần êm/en thông vần, thanh Bằng).`, mood: 'Trữ tình' },
            ],
        };

        let fallbackList = RHYME_TEMPLATES[rime6];
        if (!fallbackList) {
            for (const [key, tpls] of Object.entries(RHYME_TEMPLATES)) {
                if (rime6.endsWith(key) || key.endsWith(rime6)) {
                    fallbackList = tpls;
                    break;
                }
            }
        }

        aiResult = {
            candidates: fallbackList || [
                {
                    batLine: `Trời cao soi tỏ tấm lòng thảo thơm`,
                    explanation: `Tiếp nối ý tứ câu lục với nét đẹp truyền thống.`,
                    mood: 'Triết lý',
                },
                {
                    batLine: `Đường xa vạn dặm sắc son một lòng`,
                    explanation: `Ý thơ mở rộng về tình nghĩa keo sơn.`,
                    mood: 'Trữ tình',
                },
            ],
        };
    }

    // Chạy qua Rule Engine để kiểm tra tính hợp lệ của từng câu Bát
    const verifiedCandidates = aiResult.candidates.map((cand) => {
        const fullPoemTest = `${cleanLuc}\n${cand.batLine}`;
        const analysis = analyzeLucBatPoem(fullPoemTest);
        const batLineAnalysis = analysis.lines[1];
        const rhymeInfo = analysis.rhymes[0] || null;

        return {
            batLine: cand.batLine,
            explanation: cand.explanation,
            mood: cand.mood,
            syllableCount: batLineAnalysis?.syllableCount || 0,
            isValidStructure: batLineAnalysis?.isValidStructure || false,
            toneScore: analysis.summary.toneScore,
            isRhymeValid: rhymeInfo?.isRhyme || false,
            rhymeReason: rhymeInfo?.reason || '',
            rhymeQuality: rhymeInfo?.quality || 'none',
        };
    });

    // Sắp xếp: Ưu tiên câu đúng số tiếng, đúng vần và điểm âm luật cao nhất
    verifiedCandidates.sort((a, b) => {
        if (a.isRhymeValid !== b.isRhymeValid) return b.isRhymeValid ? 1 : -1;
        return b.toneScore - a.toneScore;
    });

    return {
        inputLucLine: cleanLuc,
        rhymeTargetWord: word6Luc,
        candidates: verifiedCandidates,
    };
}

/**
 * Lưu bài thơ / Bản nháp
 */
async function savePoem({ userId, poemId = null, title, content, authorName, status = 'draft', analysisResult = null }) {
    if (!title || !content) {
        throw new Error('Vui lòng nhập tựa đề và nội dung bài thơ');
    }

    let poem;
    if (poemId) {
        poem = await Poem.findOne({ _id: poemId, userId });
        if (!poem) {
            throw new Error('Không tìm thấy tác phẩm hoặc bạn không có quyền chỉnh sửa');
        }
        poem.title = title;
        poem.content = content;
        poem.authorName = authorName || poem.authorName;
        poem.status = status;
        if (analysisResult) {
            poem.analysisResult = analysisResult;
            poem.scores = analysisResult.scores || poem.scores;
        }
        await poem.save();
    } else {
        poem = await Poem.create({
            userId,
            title,
            content,
            authorName: authorName || 'Tác giả',
            status,
            analysisResult,
            scores: analysisResult?.scores || { toneScore: 0, rhythmScore: 0, poeticScore: 0, totalScore: 0 },
        });
    }

    return poem;
}

/**
 * Lấy danh sách bài thơ của tôi
 */
async function getMyPoems(userId) {
    return await Poem.find({ userId }).sort({ updatedAt: -1 }).lean();
}

/**
 * Lấy chi tiết bài thơ
 */
async function getPoemById(poemId, userId) {
    const poem = await Poem.findById(poemId).populate('userId', 'name avatar').lean();
    if (!poem) {
        throw new Error('Không tìm thấy bài thơ');
    }
    // Nếu là bài riêng tư hoặc bản nháp thì chỉ tác giả mới xem được
    if (poem.status !== 'published' && (!userId || poem.userId._id.toString() !== userId.toString())) {
        throw new Error('Bạn không có quyền truy cập bài thơ này');
    }
    return poem;
}

/**
 * Xóa bài thơ
 */
async function deletePoem(poemId, userId) {
    const poem = await Poem.findOneAndDelete({ _id: poemId, userId });
    if (!poem) {
        throw new Error('Không tìm thấy tác phẩm để xóa hoặc bạn không có quyền');
    }
    return { success: true, message: 'Đã xóa bài thơ thành công' };
}

/**
 * Lấy danh sách thơ cộng đồng đã công bố
 */
async function getCommunityPoems({ page = 1, limit = 12 }) {
    const skip = (page - 1) * limit;
    const [poems, total] = await Promise.all([
        Poem.find({ status: 'published' })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Poem.countDocuments({ status: 'published' }),
    ]);

    return {
        poems,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

module.exports = {
    analyzePoemRule,
    critiquePoem,
    coWriteBatLine,
    savePoem,
    getMyPoems,
    getPoemById,
    deletePoem,
    getCommunityPoems,
};
