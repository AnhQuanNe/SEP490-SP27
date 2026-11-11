const Poem = require('../models/Poem');
const { analyzeLucBatPoem, checkWordRhyme, getToneType, extractRime } = require('../utils/lucBatAnalyzer');

// Tích hợp gọi Gemini AI
const GEMINI_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
];

async function callGeminiPoetryApi({ prompt, systemInstruction }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim() || apiKey.includes('your_gemini_api_key')) return null;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: systemInstruction }] },
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
            const timeoutId = setTimeout(() => controller.abort(), 15000);

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
                    const parsed = JSON.parse(cleaned);
                    return { ...parsed, isGemini: true, modelUsed: model };
                }
            } else {
                const errText = await response.text();
                console.warn(`[Poetry AI] Model ${model} HTTP ${response.status}: ${errText.slice(0, 100)}`);
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
        throw new Error('Vui lòng nhập câu thơ (câu Lục) để AI phân tích và ứng khẩu câu đối');
    }

    const cleanLuc = lucLine.trim();
    const words = cleanLuc.split(/\s+/).filter(Boolean);

    if (words.length !== 6) {
        throw new Error(`Để đối thơ Lục Bát chuẩn xác, câu Lục cần có đúng 6 tiếng (hiện tại bạn nhập ${words.length} tiếng: "${cleanLuc}").`);
    }

    // 1. Phân tích ngữ âm và niêm luật câu Lục bằng Rule Engine
    const lineObj = {
        lineIndex: 0,
        rawText: cleanLuc,
        syllableCount: words.length,
        syllables: words.map((w, idx) => ({
            position: idx + 1,
            clean: w.replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’]+$/g, ''),
            ...getToneType(w),
        })),
    };

    const word6Luc = lineObj.syllables[5].clean;
    const tone6Luc = lineObj.syllables[5].toneType;
    const tone6Name = lineObj.syllables[5].toneName || (tone6Luc === 'B' ? 'Bằng' : 'Trắc');
    const rime6 = extractRime(word6Luc);

    const contextClause = context && context.trim()
        ? `\n[NGỮ CẢNH BÀI THƠ / TÁC PHẨM ĐANG SÁNG TÁC]:\n${context.trim()}\n`
        : '';

    // 2. Xây dựng Prompt cho Google Gemini AI: Yêu cầu phân tích câu thơ, xác định ngữ cảnh và sáng tác câu đối
    const prompt = `Người dùng vừa sáng tác câu thơ Lục (6 tiếng):
"${cleanLuc}"
- Tiếng thứ 6 gieo vần là: "${word6Luc}" (thanh ${tone6Name}, hiệp vần "${rime6}").
${contextClause}
NHIỆM VỤ NGHỆ THUẬT:
Bạn là một Đại thi hào và Bậc thầy Thi pháp học Lục Bát & Văn học Dân gian Việt Nam (tinh thông niêm luật Truyện Kiều và thấm đượm hồn ca dao dân tộc). Hãy thực hiện 3 phần việc quan trọng:

1. PHÂN TÍCH CÂU THƠ (analysis):
- verseMeaning: Phân tích sâu sắc tứ thơ, hình tượng nghệ thuật, thông điệp mà tác giả gửi gắm trong câu thơ 6 tiếng này.
- poeticForm: "Thơ Lục Bát — Câu Lục (6 tiếng)".
- toneAnalysis: Phân tích niêm luật Bằng - Trắc (các vị trí 2-4-6) và tiếng gieo vần chủ chốt "${word6Luc}" (thanh ${tone6Name}, vần "${rime6}").
- emotionalTone: Sắc thái cảm xúc chủ đạo (ví dụ: tha thiết, hoài niệm, triết lý, man mác, ấm áp, hào sảng...).

2. XÁC ĐỊNH NGỮ CẢNH (context):
- scene: Bối cảnh không gian và thời gian nghệ thuật (ví dụ: dòng sông bến nước quê hương, đêm trăng tĩnh lặng, cảnh sum vầy gia đình, chiều tà bâng khuâng...).
- theme: Chủ đề bao quát (ví dụ: Công ơn cha mẹ / Tình yêu quê hương xứ sở / Tình nghĩa thủy chung / Chiêm nghiệm nhân sinh...).
- artisticDirection: Định hướng nghệ thuật để câu Bát tiếp theo liên kết tự nhiên, nâng tầm câu Lục thành cặp câu thơ lục bát toàn bích.

3. SÁNG TÁC 3 PHƯƠNG ÁN CÂU BÁT ĐỐI LẠI (candidates):
Yêu cầu âm luật và thi pháp bắt buộc cho câu Bát (8 tiếng):
- BẮT BUỘC ĐÚNG 8 TIẾNG (không thừa không thiếu một từ).
- HIỆP VẦN (Yêu vận): Tiếng thứ 6 của câu Bát BẮT BUỘC phải hiệp vần với tiếng "${word6Luc}" (cùng vần "${rime6}" hoặc vần thông hợp lệ, mang thanh BẰNG).
- NIÊM LUẬT BẰNG - TRẮC: Tiếng 2 (Bằng) - Tiếng 4 (Trắc) - Tiếng 6 (Bằng, hiệp vần) - Tiếng 8 (Bằng).
- QUY TẮC TRẦM - BỔNG: Nếu tiếng 6 là thanh Ngang (không dấu) thì tiếng 8 nên là thanh Huyền (hoặc ngược lại) để câu thơ có độ bổng trầm ngân nga hài hòa.
- 3 phương án biểu cảm phong phú:
  + Phương án 1 (Trữ tình): Tả cảnh ngụ tình dịu dàng, tiếp nối hình tượng câu Lục.
  + Phương án 2 (Triết lý): Mở rộng chiều sâu đạo lý, nhân văn, tình nghĩa.
  + Phương án 3 (Dân dã / Khoáng đạt): Đậm đà phong vị ca dao dân ca, mộc mạc, tha thiết.
- Mỗi phương án phân tích rõ:
  + batLine: Câu thơ 8 tiếng.
  + mood: "Trữ tình" | "Triết lý" | "Dân dã" | "Khoáng đạt".
  + rhymeWord: Tiếng thứ 6 trong câu Bát gieo vần với "${word6Luc}".
  + explanation: Phân tích cụ thể cách câu này tiếp nối ý tứ, hòa quyện với ngữ cảnh của câu Lục và hiệu quả biểu cảm.
  + harmonyScore: Điểm độ hòa hợp (90 - 99).

ĐỊNH DẠNG JSON BẮT BUỘC (trả về JSON thuần túy, không có markdown):
{
  "analysis": {
    "verseMeaning": "...",
    "poeticForm": "Thơ Lục Bát — Câu Lục (6 tiếng)",
    "toneAnalysis": "...",
    "emotionalTone": "..."
  },
  "context": {
    "scene": "...",
    "theme": "...",
    "artisticDirection": "..."
  },
  "candidates": [
    {
      "batLine": "...",
      "mood": "Trữ tình",
      "rhymeWord": "...",
      "explanation": "...",
      "harmonyScore": 96
    },
    {
      "batLine": "...",
      "mood": "Triết lý",
      "rhymeWord": "...",
      "explanation": "...",
      "harmonyScore": 95
    },
    {
      "batLine": "...",
      "mood": "Dân dã",
      "rhymeWord": "...",
      "explanation": "...",
      "harmonyScore": 94
    }
  ]
}`;

    const systemInstruction = `Bạn là một Đại thi hào và Bậc thầy Thi pháp học Lục Bát & Văn học Dân gian Việt Nam của hệ thống VietHeritage AI.
Nhiệm vụ của bạn là thấu cảm tinh tế tứ thơ của người dùng, phân tích tường tận ngữ cảnh văn hóa, và ứng khẩu các câu thơ đối lại tuyệt mỹ về cả ý tứ, hình tượng lẫn niêm luật Bằng - Trắc và hiệp vần. Luôn luôn trả lời bằng định dạng JSON thuần túy.`;

    let aiResult = await callGeminiPoetryApi({ prompt, systemInstruction });

    // 3. Fallback thông minh: Phân tích ngữ cảnh nội sinh và sinh câu đối chuẩn luật nếu chưa cấu hình API key
    if (!aiResult || !Array.isArray(aiResult.candidates) || aiResult.candidates.length === 0) {
        const lowerLuc = cleanLuc.toLowerCase();
        let detectedTheme = 'Chiêm nghiệm nhân sinh & Đạo lý sống tốt đẹp';
        let detectedScene = 'Không gian thi ca thanh nhã, khoáng đạt giữa đất trời';
        let detectedEmotion = 'Trầm lắng, suy tư, hướng thiện';
        let detectedMeaning = `Câu thơ mở ra một tứ thơ tao nhã với hình tượng giản dị mà gợi cảm, thể hiện cảm xúc chân thành của tác giả.`;

        if (/cha|mẹ|ơn|công|thái sơn|nguồn|sinh|dưỡng|nuôi/.test(lowerLuc)) {
            detectedTheme = 'Đạo hiếu & Công ơn sinh thành dưỡng dục của cha mẹ';
            detectedScene = 'Không gian gia đình ấm cúng, núi cao biển rộng thiêng liêng';
            detectedEmotion = 'Dạt dào lòng hiếu thảo, kính trọng và biết ơn sâu sắc';
            detectedMeaning = `Câu thơ ngợi ca công ơn trời biển của đấng sinh thành, dùng hình ảnh non cao biển rộng để khắc họa tấm lòng hiếu nghĩa muôn đời.`;
        } else if (/trăng|đò|sông|nước|bến|thuyền|cầu|mây|gió|chiều|thu/.test(lowerLuc)) {
            detectedTheme = 'Tình duyên lứa đôi & Phong cảnh non nước quê hương hữu tình';
            detectedScene = 'Bến sông quê chiều tà, bóng trăng thanh bình soi bóng dòng nước êm trôi';
            detectedEmotion = 'Bâng khuâng, man mác hoài niệm, trữ tình êm ả';
            detectedMeaning = `Khắc họa bức tranh non nước bến đò hữu tình đượm chút nhớ thương bâng khuâng, gửi gắm tâm sự tinh tế qua cảnh vật thiên nhiên.`;
        } else if (/quê|làng|đồng|lúa|cò|tre|nắng|mưa|đất|mái đình/.test(lowerLuc)) {
            detectedTheme = 'Tình yêu quê hương xứ sở & Vẻ đẹp làng quê Việt Nam';
            detectedScene = 'Cánh đồng lúa chín vàng bát ngát, lũy tre xanh nghiêng bóng, khói lam chiều';
            detectedEmotion = 'Ấm áp, thân thương, đậm đà hồn quê xứ sở';
            detectedMeaning = `Gợi nhắc vẻ đẹp bình dị, thuần hậu của làng quê Việt Nam với những hình tượng thân quen gắn bó máu thịt từ thuở ấu thơ.`;
        } else if (/bạn|nghĩa|tình|thủy chung|sắc son|lòng|tấm lòng/.test(lowerLuc)) {
            detectedTheme = 'Tình nghĩa thủy chung, sắt son gắn bó';
            detectedScene = 'Không gian gắn kết nghĩa tình thâm sâu qua năm tháng thử thách';
            detectedEmotion = 'Chân thành, kiên định, bền chặt';
            detectedMeaning = `Khẳng định giá trị cao quý của tình nghĩa và lòng thủy chung trong đối nhân xử thế giữa người với người.`;
        }

        const fallbackAnalysis = {
            verseMeaning: detectedMeaning,
            poeticForm: 'Thơ Lục Bát — Câu Lục (6 tiếng)',
            toneAnalysis: `Tiếng thứ 2 mang thanh ${lineObj.syllables[1]?.toneType === 'B' ? 'Bằng' : 'Trắc'}, tiếng thứ 4 mang thanh ${lineObj.syllables[3]?.toneType === 'T' ? 'Trắc' : 'Bằng'}, tiếng thứ 6 "${word6Luc}" mang thanh ${tone6Name} (hiệp vần "${rime6}").`,
            emotionalTone: detectedEmotion,
        };

        const fallbackContext = {
            scene: detectedScene,
            theme: detectedTheme,
            artisticDirection: `Tiếp nối câu Lục bằng câu Bát hài hòa về hình tượng, tiếng thứ 6 gieo vần "${rime6}" cùng thanh Bằng với "${word6Luc}", tiếng thứ 8 giữ thanh Bằng tạo âm hưởng ngân nga.`,
        };

        const RHYME_TEMPLATES = {
            'a': [
                { batLine: 'Đêm thanh soi bóng đường xa mịt mùng', explanation: `Hiệp vần "xa" với "${word6Luc}" (cùng vần a, thanh Bằng), tiếp nối không gian êm đềm.`, mood: 'Trữ tình', rhymeWord: 'xa', harmonyScore: 95 },
                { batLine: 'Gió đưa thoang thoảng hương hoa ngọt ngào', explanation: `Hiệp vần "hoa" với "${word6Luc}" (cùng vần a, thanh Bằng), gợi cảm giác bình yên thư thái.`, mood: 'Dân dã', rhymeWord: 'hoa', harmonyScore: 94 },
                { batLine: 'Nắng mai sưởi ấm lòng ta bao ngày', explanation: `Hiệp vần "ta" với "${word6Luc}" (cùng vần a, thanh Bằng), đúc kết ý niệm nhân sinh ấm áp.`, mood: 'Triết lý', rhymeWord: 'ta', harmonyScore: 93 },
            ],
            'on': [
                { batLine: 'Nghìn thu ghi khắc sắc son một lòng', explanation: `Hiệp vần "son" với "${word6Luc}" (cùng vần on, thanh Bằng), khẳng định tấm lòng trước sau như một.`, mood: 'Triết lý', rhymeWord: 'son', harmonyScore: 96 },
                { batLine: 'Trời cao chứng giám lòng con thảo hiền', explanation: `Hiệp vần "con" với "${word6Luc}" (cùng vần on, thanh Bằng), trọn vẹn chữ hiếu thiêng liêng.`, mood: 'Trữ tình', rhymeWord: 'con', harmonyScore: 95 },
                { batLine: 'Dù cho vất vả mỏi mòn chẳng phai', explanation: `Hiệp vần "mòn" với "${word6Luc}" (cùng vần on, thanh Bằng), thể hiện đức kiên trì bền bỉ.`, mood: 'Dân dã', rhymeWord: 'mòn', harmonyScore: 92 },
            ],
            'ong': [
                { batLine: 'Nghìn thu soi tỏ tấm lòng thảo thơm', explanation: `Hiệp vần "lòng" với "${word6Luc}" (cùng vần ong, thanh Bằng), biểu đạt đạo lý nhân nghĩa.`, mood: 'Triết lý', rhymeWord: 'lòng', harmonyScore: 96 },
                { batLine: 'Thuyền xuôi bến vắng trên dòng sông sâu', explanation: `Hiệp vần "dòng" với "${word6Luc}" (cùng vần ong, thanh Bằng), mở rộng không gian sông nước hữu tình.`, mood: 'Trữ tình', rhymeWord: 'dòng', harmonyScore: 94 },
                { batLine: 'Nguyện đem tâm huyết đắp bồi non sông', explanation: `Hiệp vần "sông" với "${word6Luc}" (cùng vần ong, thanh Bằng), gửi gắm khát vọng dựng xây quê hương.`, mood: 'Dân dã', rhymeWord: 'sông', harmonyScore: 93 },
            ],
            'ang': [
                { batLine: 'Trăng khuya soi bóng dịu dàng khắp nơi', explanation: `Hiệp vần "dàng" với "${word6Luc}" (cùng vần ang, thanh Bằng), gợi ánh trăng hiền hòa bao dung.`, mood: 'Trữ tình', rhymeWord: 'dàng', harmonyScore: 96 },
                { batLine: 'Đường xa vạn dặm thênh thang lối về', explanation: `Hiệp vần "thang" với "${word6Luc}" (cùng vần ang, thanh Bằng), tạo âm hưởng khoáng đạt, rộng mở.`, mood: 'Khoáng đạt', rhymeWord: 'thang', harmonyScore: 95 },
                { batLine: 'Một đời giữ dạ thẳng ngay đàng hoàng', explanation: `Hiệp vần "hoàng" với "${word6Luc}" (cùng vần ang, thanh Bằng), tôn vinh phẩm giá thanh cao.`, mood: 'Triết lý', rhymeWord: 'hoàng', harmonyScore: 93 },
            ],
            'oi': [
                { batLine: 'Dẫu cho cách trở muôn nơi vẫn chờ', explanation: `Hiệp vần "nơi" với "${word6Luc}" (vần thông ơi/oi, thanh Bằng), đượm sắc thái thủy chung son sắt.`, mood: 'Trữ tình', rhymeWord: 'nơi', harmonyScore: 95 },
                { batLine: 'Thời gian thấm thoát đưa thoi qua dần', explanation: `Hiệp vần "thoi" với "${word6Luc}" (cùng vần oi, thanh Bằng), gợi cảm thức về thời gian và đời người.`, mood: 'Triết lý', rhymeWord: 'thoi', harmonyScore: 94 },
                { batLine: 'Nghe trong tiếng gió gọi mời xa xôi', explanation: `Hiệp vần "mời" với "${word6Luc}" (vần thông ơi/oi, thanh Bằng), gợi tiếng gọi bình dị của quê hương.`, mood: 'Dân dã', rhymeWord: 'mời', harmonyScore: 92 },
            ],
            'ay': [
                { batLine: 'Bao năm tích đức dựng xây cơ đồ', explanation: `Hiệp vần "xây" với "${word6Luc}" (cùng vần ay, thanh Bằng), khuyên nhủ con người chăm lo tu dưỡng.`, mood: 'Triết lý', rhymeWord: 'xây', harmonyScore: 95 },
                { batLine: 'Gió đông se lạnh từng ngày nhớ thương', explanation: `Hiệp vần "ngày" với "${word6Luc}" (cùng vần ay, thanh Bằng), chan chứa niềm thương nhớ dịu êm.`, mood: 'Trữ tình', rhymeWord: 'ngày', harmonyScore: 94 },
                { batLine: 'Cùng nhau chung sức từ đây sum vầy', explanation: `Hiệp vần "đây" với "${word6Luc}" (cùng vần ay, thanh Bằng), ấm áp không khí đoàn viên hội ngộ.`, mood: 'Dân dã', rhymeWord: 'đây', harmonyScore: 93 },
            ],
            'au': [
                { batLine: 'Dù cho dâu bể trước sau vẹn toàn', explanation: `Hiệp vần "sau" với "${word6Luc}" (cùng vần au, thanh Bằng), trọn vẹn nghĩa tình trước sau như một.`, mood: 'Triết lý', rhymeWord: 'sau', harmonyScore: 96 },
                { batLine: 'Lời xưa răn dạy khắc sâu tấc lòng', explanation: `Hiệp vần "sâu" với "${word6Luc}" (vần thông âu/au, thanh Bằng), ghi nhớ bài học tiền nhân.`, mood: 'Trữ tình', rhymeWord: 'sâu', harmonyScore: 95 },
                { batLine: 'Đường đời dẫu có khổ đau vẫn cười', explanation: `Hiệp vần "đau" với "${word6Luc}" (cùng vần au, thanh Bằng), tinh thần lạc quan yêu đời vượt khó.`, mood: 'Dân dã', rhymeWord: 'đau', harmonyScore: 92 },
            ],
            'en': [
                { batLine: 'Giữ lòng trong sạch vững bền trước sau', explanation: `Hiệp vần "bền" với "${word6Luc}" (vần thông ên/en, thanh Bằng), ngợi ca cốt cách thanh cao.`, mood: 'Triết lý', rhymeWord: 'bền', harmonyScore: 95 },
                { batLine: 'Bóng ai thấp thoáng bên thềm ngóng trông', explanation: `Hiệp vần "thềm" với "${word6Luc}" (vần thông êm/en, thanh Bằng), hình bóng dịu dàng chờ mong.`, mood: 'Trữ tình', rhymeWord: 'thềm', harmonyScore: 94 },
                { batLine: 'Qua bao mưa nắng thêm bền tình xưa', explanation: `Hiệp vần "bền" với "${word6Luc}" (vần thông ên/en, thanh Bằng), tình nghĩa bền chặt theo thời gian.`, mood: 'Dân dã', rhymeWord: 'bền', harmonyScore: 93 },
            ],
            'inh': [
                { batLine: 'Sáng soi non nước quang vinh ngàn đời', explanation: `Hiệp vần "vinh" với "${word6Luc}" (cùng vần inh, thanh Bằng), ngợi ca non sông tươi đẹp.`, mood: 'Khoáng đạt', rhymeWord: 'vinh', harmonyScore: 96 },
                { batLine: 'Khắc ghi câu hẹn nghĩa tình sắt son', explanation: `Hiệp vần "tình" với "${word6Luc}" (cùng vần inh, thanh Bằng), đượm sắc thái thủy chung.`, mood: 'Trữ tình', rhymeWord: 'tình', harmonyScore: 95 },
                { batLine: 'Tự hào truyền thống văn minh tiên rồng', explanation: `Hiệp vần "minh" với "${word6Luc}" (cùng vần inh, thanh Bằng), ngợi ca nguồn cội dân tộc.`, mood: 'Triết lý', rhymeWord: 'minh', harmonyScore: 94 },
            ],
            'anh': [
                { batLine: 'Dưới trời mây trắng trong lành sớm mai', explanation: `Hiệp vần "lành" với "${word6Luc}" (cùng vần anh, thanh Bằng), gợi cảm giác tinh khôi, trong trẻo.`, mood: 'Trữ tình', rhymeWord: 'lành', harmonyScore: 96 },
                { batLine: 'Sử vàng lưu dấu hùng anh rạng ngời', explanation: `Hiệp vần "anh" với "${word6Luc}" (cùng vần anh, thanh Bằng), ghi nhớ công đức tiền nhân.`, mood: 'Triết lý', rhymeWord: 'anh', harmonyScore: 95 },
                { batLine: 'Nước non một dải tươi xanh bốn mùa', explanation: `Hiệp vần "xanh" với "${word6Luc}" (cùng vần anh, thanh Bằng), vẻ đẹp non sông đất nước.`, mood: 'Dân dã', rhymeWord: 'xanh', harmonyScore: 93 },
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
            analysis: fallbackAnalysis,
            context: fallbackContext,
            candidates: fallbackList || [
                {
                    batLine: 'Nghìn thu ghi tạc tấm lòng thảo thơm',
                    explanation: `Tiếp nối mạch cảm xúc câu Lục với nét đẹp đạo lý truyền thống của dân tộc.`,
                    mood: 'Triết lý',
                    rhymeWord: 'lòng',
                    harmonyScore: 95,
                },
                {
                    batLine: 'Đường xa vạn dặm sắt son một lòng',
                    explanation: `Mở rộng tứ thơ về tình nghĩa thủy chung gắn kết keo sơn.`,
                    mood: 'Trữ tình',
                    rhymeWord: 'lòng',
                    harmonyScore: 94,
                },
                {
                    batLine: 'Gió đưa thoang thoảng hương thơm ngọt ngào',
                    explanation: `Tả cảnh ngụ tình dịu dàng, đem lại cảm giác êm đềm sâu lắng.`,
                    mood: 'Dân dã',
                    rhymeWord: 'thơm',
                    harmonyScore: 92,
                },
            ],
            isGemini: false,
        };
    }

    // 4. Chạy qua Rule Engine để kiểm tra âm luật chuẩn xác từng câu Bát
    const verifiedCandidates = (aiResult.candidates || []).map((cand) => {
        const fullPoemTest = `${cleanLuc}\n${cand.batLine}`;
        const analysis = analyzeLucBatPoem(fullPoemTest);
        const batLineAnalysis = analysis.lines[1];
        const rhymeInfo = analysis.rhymes[0] || null;

        return {
            batLine: cand.batLine,
            explanation: cand.explanation,
            mood: cand.mood || 'Trữ tình',
            rhymeWord: cand.rhymeWord || '',
            harmonyScore: cand.harmonyScore || 95,
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
        analysis: aiResult.analysis,
        context: aiResult.context,
        candidates: verifiedCandidates,
        isGemini: !!aiResult.isGemini,
        source: aiResult.isGemini
            ? `Google Gemini (${aiResult.modelUsed || 'AI Studio'})`
            : 'Thi pháp học Di sản (Chưa cấu hình GEMINI_API_KEY)',
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
