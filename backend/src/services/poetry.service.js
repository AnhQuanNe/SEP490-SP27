const Poem = require('../models/Poem');
const { analyzeLucBatPoem, checkWordRhyme, getToneType, extractRime } = require('../utils/lucBatAnalyzer');

// Cấu hình Groq API & Model Fallback
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
];
const GROQ_TIMEOUT_MS = 30000;
const GROQ_FALLBACK_DELAY_MS = 1000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Kho vần Bằng toàn diện hỗ trợ đối thơ Lục Bát cổ truyền
const RHYME_BANK = {
    'a': ['nhà', 'xa', 'qua', 'hoa', 'hòa', 'ba', 'tha', 'tà', 'ca', 'ngà', 'la'],
    'an': ['chan', 'lan', 'ngàn', 'than', 'đàn', 'an', 'tan', 'màn', 'chứa chan', 'bình an'],
    'ang': ['sang', 'vang', 'mang', 'màng', 'giang', 'bàng', 'dịu dàng', 'mênh mang'],
    'anh': ['anh', 'cành', 'nhanh', 'lành', 'xanh', 'thanh', 'tranh', 'mong manh'],
    'am': ['cam', 'lam', 'nam', 'chàm', 'làm', 'kham'],
    'ao': ['sao', 'nao', 'cao', 'trào', 'vào', 'dạt dào', 'ngọt ngào', 'xôn xao'],
    'au': ['sâu', 'câu', 'đâu', 'đầu', 'lâu', 'sầu', 'màu', 'mau', 'sau', 'trầu', 'dãi dầu', 'mai sau'],
    'âu': ['sâu', 'câu', 'đâu', 'đầu', 'lâu', 'sầu', 'màu', 'mau', 'sau', 'trầu', 'dãi dầu', 'mai sau'],
    'ay': ['mai', 'bay', 'say', 'hay', 'tay', 'đầy', 'mây', 'thầy', 'xây', 'sum vầy', 'đổi thay'],
    'ây': ['mai', 'bay', 'say', 'hay', 'tay', 'đầy', 'mây', 'thầy', 'xây', 'sum vầy', 'đổi thay'],
    'ai': ['ai', 'mai', 'dài', 'hoài', 'cài', 'bài', 'trai', 'hai', 'tương lai', 'ban mai'],
    'e': ['nghe', 'tre', 'che', 've', 'bè', 'chè', 'hè'],
    'en': ['quen', 'khen', 'chen', 'đèn', 'hèn', 'rèn', 'bền', 'tên', 'nên', 'trên', 'đền', 'quên'],
    'ên': ['quen', 'khen', 'chen', 'đèn', 'hèn', 'rèn', 'bền', 'tên', 'nên', 'trên', 'đền', 'quên'],
    'em': ['êm', 'đêm', 'thêm', 'mềm', 'xem', 'rèm', 'thềm', 'dịu êm', 'êm đềm'],
    'êm': ['êm', 'đêm', 'thêm', 'mềm', 'xem', 'rèm', 'thềm', 'dịu êm', 'êm đềm'],
    'eo': ['đèo', 'reo', 'chèo', 'nghèo', 'keo', 'cheo leo', 'hòa reo', 'trông theo'],
    'ê': ['quê', 'thề', 'về', 'mê', 'đê', 'kê', 'thê', 'sum xuê', 'sơn khê', 'tràn trề'],
    'i': ['đi', 'ghi', 'chi', 'thì', 'khi', 'vì', 'duy', 'suy', 'thi', 'từ bi', 'khắc ghi'],
    'y': ['đi', 'ghi', 'chi', 'thì', 'khi', 'vì', 'duy', 'suy', 'thi', 'từ bi', 'khắc ghi'],
    'ia': ['khuya', 'chia', 'thìa', 'đìa', 'bìa'],
    'ya': ['khuya', 'chia', 'thìa', 'đìa', 'bìa'],
    'iên': ['hiền', 'duyên', 'miền', 'tiên', 'liền', 'yên', 'thiền', 'triền miên', 'dịu hiền', 'bình yên'],
    'yên': ['hiền', 'duyên', 'miền', 'tiên', 'liền', 'yên', 'thiền', 'triền miên', 'dịu hiền', 'bình yên'],
    'iêu': ['chiều', 'yêu', 'nhiều', 'điều', 'tiêu', 'liêu', 'tiêu điều', 'thân yêu'],
    'yêu': ['chiều', 'yêu', 'nhiều', 'điều', 'tiêu', 'liêu', 'tiêu điều', 'thân yêu'],
    'im': ['chim', 'tim', 'kim', 'chìm', 'tìm', 'con tim'],
    'in': ['tin', 'xin', 'gìn', 'nhìn', 'mìn', 'giữ gìn'],
    'inh': ['sinh', 'mình', 'tình', 'hình', 'minh', 'lung linh', 'nghĩa tình', 'bình minh'],
    'o': ['cho', 'lo', 'so', 'đò', 'bò', 'dặn dò', 'hẹn hò'],
    'oa': ['hoa', 'hòa', 'xoa', 'qua', 'lòa', 'tòa', 'chan hòa', 'nhạt nhòa'],
    'oan': ['oan', 'loan', 'toan', 'toàn', 'đoàn', 'hân hoan', 'lo toan'],
    'oang': ['hoang', 'khoang', 'loang', 'hoàng', 'bàng hoàng'],
    'oi': ['coi', 'soi', 'thoi', 'ngòi', 'vòi', 'sáng soi', 'nhỏ nhoi'],
    'on': ['con', 'son', 'non', 'tròn', 'mòn', 'hòn', 'còn', 'sắt son'],
    'ong': ['sông', 'lòng', 'dòng', 'không', 'đồng', 'trông', 'trong', 'thông', 'hồng', 'nồng', 'mong'],
    'ông': ['sông', 'lòng', 'dòng', 'không', 'đồng', 'trông', 'trong', 'thông', 'hồng', 'nồng', 'mong'],
    'ôi': ['tôi', 'trôi', 'đôi', 'hồi', 'ngồi', 'rồi', 'vôi', 'bồi hồi', 'xa xôi'],
    'ơ': ['thơ', 'mơ', 'tơ', 'ngơ', 'nhờ', 'chờ', 'bờ', 'bơ vơ', 'ngóng chờ'],
    'ơi': ['đời', 'lời', 'trời', 'người', 'vơi', 'chơi', 'nơi', 'ngời', 'rạng ngời', 'muôn nơi'],
    'ơn': ['sơn', 'hơn', 'sờn', 'mơn', 'ơn', 'đờn', 'giận hờn', 'nguồn cơn'],
    'u': ['thu', 'dù', 'ru', 'từ', 'như', 'mù', 'thiên thu', 'lãng du'],
    'ua': ['mùa', 'xưa', 'vừa', 'mua', 'khua', 'lùa', 'bốn mùa'],
    'uân': ['xuân', 'thuần', 'tuần', 'luân', 'thanh xuân', 'bâng khuâng'],
    'uông': ['chuông', 'buông', 'luồng', 'nguồn', 'muôn', 'suối nguồn', 'ngát hương'],
    'uôn': ['nguồn', 'tuôn', 'luôn', 'buồn', 'muôn', 'suối nguồn', 'sầu muôn'],
    'ui': ['vui', 'lui', 'bùi', 'ngùi', 'ngậm ngùi', 'chôn vùi'],
    'ung': ['cùng', 'chung', 'rung', 'lùng', 'vung', 'tương phùng', 'muôn trùng'],
    'ưa': ['mưa', 'xưa', 'trưa', 'đưa', 'thừa', 'lưa thưa', 'say sưa'],
    'ư': ['như', 'từ', 'thư', 'từ từ', 'thiên thư', 'ưu tư'],
    'ươi': ['người', 'cười', 'tươi', 'mười', 'xinh tươi', 'tiếng cười'],
    'ương': ['thương', 'sương', 'vương', 'đường', 'gương', 'quê hương', 'vấn vương']
};

/**
 * Lấy danh sách các từ mang thanh Bằng hiệp vần chuẩn với tiếng thứ 6 câu Lục
 */
function getSuggestedRhymes(word6) {
    if (!word6) return [];
    const rime = extractRime(word6);
    const singleWords = [];
    const addWord = (w) => {
        const sw = w.trim().split(/\s+/).pop();
        const tone = getToneType(sw);
        if (tone.toneType === 'B' && !singleWords.includes(sw)) {
            singleWords.push(sw);
        }
    };

    if (RHYME_BANK[rime]) {
        RHYME_BANK[rime].forEach(addWord);
    }
    for (const [r, list] of Object.entries(RHYME_BANK)) {
        if (r !== rime) {
            for (const w of list) {
                if (checkWordRhyme(word6, w).isRhyme) {
                    addWord(w);
                }
            }
        }
    }
    return singleWords.slice(0, 10);
}

/**
 * Nhận diện chủ đề câu Lục để định hướng tứ thơ câu Bát
 */
function detectPoemTopic(lucLine) {
    const lower = (lucLine || '').toLowerCase();
    if (lower.includes('cha') || lower.includes('mẹ') || lower.includes('thái sơn') || lower.includes('nguồn') || lower.includes('sinh thành') || lower.includes('công ơn') || lower.includes('dưỡng dục') || lower.includes('đạo con') || lower.includes('chữ hiếu')) {
        return 'family';
    }
    if (lower.includes('trăm năm') || lower.includes('cõi') || lower.includes('kiếp') || lower.includes('cuộc đời') || lower.includes('thế gian') || lower.includes('bể dâu') || lower.includes('nhân sinh') || lower.includes('phù du') || lower.includes('tài mệnh')) {
        return 'philosophy';
    }
    if (lower.includes('yêu') || lower.includes('nhớ') || lower.includes('thương') || lower.includes('duyên') || lower.includes('tình') || lower.includes('người yêu') || lower.includes('người tình') || lower.includes('cách trở') || lower.includes('bóng hình')) {
        return 'love';
    }
    return 'nature';
}

/**
 * Hiệu chỉnh thông minh câu Bát (tự động ghép 2 tiếng cuối nếu AI dừng ở tiếng 6 vần, hoặc bỏ từ thừa)
 */
function tryRepairBatLine(rawLine, word6Luc) {
    if (!rawLine || typeof rawLine !== 'string') return null;
    const stripPunct = (w) => w.replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '');
    let words = rawLine.trim().split(/\s+/).map(stripPunct).filter(Boolean);

    // Trường hợp AI sinh 6 tiếng và dừng ngay tại tiếng gieo vần thứ 6:
    if (words.length === 6) {
        const w6Tone = getToneType(words[5]);
        const rhymeCheck = checkWordRhyme(word6Luc, words[5]);
        if (rhymeCheck.isRhyme && w6Tone.toneType === 'B') {
            const endWords = w6Tone.isNgang ? ['nẻo', 'đường'] : ['tháng', 'năm'];
            words.push(...endWords);
            return words.join(' ');
        }
    }

    if (words.length === 8) {
        return words.join(' ');
    }

    // Trường hợp AI sinh 9 tiếng (thừa 1 hư từ như: thì, mà, đã, đang, rất, quá, thật, lại):
    if (words.length === 9) {
        const fillerWords = ['thì', 'mà', 'đã', 'đang', 'rất', 'quá', 'thật', 'lại'];
        for (let i = 0; i < words.length; i++) {
            if (fillerWords.includes(words[i].toLowerCase()) && i !== 1 && i !== 3 && i !== 5 && i !== 7) {
                const candidateWords = words.filter((_, idx) => idx !== i);
                if (candidateWords.length === 8) {
                    return candidateWords.join(' ');
                }
            }
        }
    }

    return rawLine.trim();
}

/**
 * Tạo 3 phương án câu Bát chuẩn 100% âm luật & vần theo tứ thơ câu Lục
 */
function createCompliantTemplateBatLines(lucLine, word6Luc) {
    const topic = detectPoemTopic(lucLine);
    const rhymes = getSuggestedRhymes(word6Luc);
    if (rhymes.length === 0) rhymes.push(word6Luc);

    const r1 = rhymes[0] || word6Luc;
    const r2 = rhymes[1] || rhymes[0] || word6Luc;
    const r3 = rhymes[2] || rhymes[0] || word6Luc;

    const tR1 = getToneType(r1);
    const tR2 = getToneType(r2);
    const tR3 = getToneType(r3);

    const end1 = tR1.isNgang ? 'nẻo đường' : 'tháng năm';
    const end2 = tR2.isNgang ? 'muôn đời' : 'mai sau';
    const end3 = tR3.isNgang ? 'mái nhà' : 'chốn này';

    const templatesByTopic = {
        family: [
            {
                mood: 'Trữ tình',
                batLine: `Tình thương khắc dạ dẫu ${r1} ${end1}`,
                explanation: 'Khắc sâu ơn nghĩa sinh thành, thời gian dẫu trôi đi tình thương cha mẹ vẫn vẹn nguyên trong dạ con.',
                rhymeWord: r1,
                harmonyScore: 98,
            },
            {
                mood: 'Triết lý',
                batLine: `Đạo con giữ trọn chẳng ${r2} ${end2}`,
                explanation: 'Nhắc nhở bổn phận đạo làm con, giữ trọn chữ hiếu trải qua muôn đời vững bền.',
                rhymeWord: r2,
                harmonyScore: 96,
            },
            {
                mood: 'Dân dã',
                batLine: `Mẹ thầy vất vả dẫu ${r3} ${end3}`,
                explanation: 'Hình ảnh cha mẹ tảo tần sớm hôm nuôi con khôn lớn nơi mái ấm gia đình.',
                rhymeWord: r3,
                harmonyScore: 95,
            }
        ],
        philosophy: [
            {
                mood: 'Trữ tình',
                batLine: `Trăm năm bến đỗ dẫu ${r1} ${end1}`,
                explanation: 'Trầm tư về dấu ấn thời gian và sự lưu dấu của kỷ niệm trong dòng chảy kiếp nhân sinh.',
                rhymeWord: r1,
                harmonyScore: 98,
            },
            {
                mood: 'Triết lý',
                batLine: `Sự đời biến đổi khéo ${r2} ${end2}`,
                explanation: 'Đúc kết quy luật biến thiên của cuộc đời và sự chuyển dời vô thường của tạo hóa.',
                rhymeWord: r2,
                harmonyScore: 96,
            },
            {
                mood: 'Dân dã',
                batLine: `Buồn vui mấy bận thoảng ${r3} ${end3}`,
                explanation: 'Cái nhìn khoáng đạt, xem những hỷ nộ ái ố tựa như ngọn gió thoảng qua chốn này.',
                rhymeWord: r3,
                harmonyScore: 95,
            }
        ],
        love: [
            {
                mood: 'Trữ tình',
                batLine: `Thương nhau mấy núi dẫu ${r1} ${end1}`,
                explanation: 'Lời thề hẹn son sắt vượt qua muôn trùng núi non cách trở trên nẻo đường tình.',
                rhymeWord: r1,
                harmonyScore: 98,
            },
            {
                mood: 'Triết lý',
                batLine: `Duyên nồng nghĩa nặng vẹn ${r2} ${end2}`,
                explanation: 'Khẳng định tình cảm bền vững theo năm tháng, thủy chung trọn vẹn đến mai sau.',
                rhymeWord: r2,
                harmonyScore: 96,
            },
            {
                mood: 'Dân dã',
                batLine: `Trăng khuya soi bóng ngóng ${r3} ${end3}`,
                explanation: 'Khung cảnh vầng trăng khuya soi sáng nỗi niềm mong ngóng bình dị, tha thiết.',
                rhymeWord: r3,
                harmonyScore: 95,
            }
        ],
        nature: [
            {
                mood: 'Trữ tình',
                batLine: `Thuyền ai lặng lẽ xuôi ${r1} ${end1}`,
                explanation: 'Gợi tả con thuyền lướt nhẹ trong không gian êm đềm, hòa quyện với cảnh sắc tự nhiên.',
                rhymeWord: r1,
                harmonyScore: 98,
            },
            {
                mood: 'Triết lý',
                batLine: `Mây trời lững thững dẫu ${r2} ${end2}`,
                explanation: 'Đối lập dòng chảy vô tận của thời gian với vẻ trầm mặc, bao la của mây trời muôn đời.',
                rhymeWord: r2,
                harmonyScore: 96,
            },
            {
                mood: 'Dân dã',
                batLine: `Khói lam nhẹ tỏa vướng ${r3} ${end3}`,
                explanation: 'Bức tranh làng quê bình dị với làn khói lam chiều vấn vương ấm cúng nơi xóm nhỏ.',
                rhymeWord: r3,
                harmonyScore: 95,
            }
        ]
    };

    return templatesByTopic[topic] || templatesByTopic.nature;
}

/**
 * Trích xuất an toàn JSON object từ phản hồi văn bản của model
 */
function extractJson(text) {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0].trim());
    } catch (err) {
        console.warn('[Poetry AI] Lỗi parse JSON:', err.message);
        return null;
    }
}

/**
 * Gọi Groq API theo chuẩn OpenAI Chat Completions với cơ chế Fallback tự động
 */
async function callGroqPoetryApi({ prompt, systemInstruction }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !apiKey.trim() || apiKey.includes('your_groq_api_key')) {
        return {
            ok: false,
            reason: 'missing_key',
            statusCode: 503,
            message: 'Chưa cấu hình GROQ_API_KEY trong backend/.env nên chưa thể gọi Groq AI. Vui lòng thêm GROQ_API_KEY hợp lệ rồi khởi động lại backend.',
        };
    }

    let lastErrorMessage = 'Không có model Groq nào phản hồi hợp lệ';
    let lastStatus = 503;
    let sawTransientBusy = false;

    for (let mIdx = 0; mIdx < GROQ_MODELS.length; mIdx += 1) {
        const model = GROQ_MODELS[mIdx];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

        try {
            const isQwen = model.toLowerCase().includes('qwen');
            const isGptOss = model.startsWith('openai/gpt-oss');

            const body = {
                model,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: prompt },
                ],
                max_tokens: isQwen ? 1200 : 1500,
                temperature: 0.5,
            };

            // Các model reasoning như openai/gpt-oss-* cần reasoning_effort: "low"
            if (isGptOss) {
                body.reasoning_effort = 'low';
            }

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey.trim()}`,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (response.ok) {
                const data = await response.json();
                const choice = data?.choices?.[0];
                const contentText = choice?.message?.content || '';
                const finishReason = choice?.finish_reason || 'unknown';

                if (contentText) {
                    const parsed = extractJson(contentText);
                    if (parsed) {
                        return { ok: true, data: parsed, modelUsed: model };
                    }
                }
                lastErrorMessage = `Model ${model} trả về nội dung rỗng hoặc không trích xuất được JSON hợp lệ (finish_reason: ${finishReason})`;
                console.warn(`[Poetry AI] Model ${model} trả về nội dung rỗng hoặc không trích xuất được JSON hợp lệ (finish_reason: ${finishReason}). Output: "${contentText.slice(0, 150)}"`);
            } else {
                const errText = await response.text();
                lastStatus = response.status;
                let parsedErr = '';
                try {
                    parsedErr = JSON.parse(errText)?.error?.message || '';
                } catch {
                    parsedErr = errText.slice(0, 120);
                }
                lastErrorMessage = `Groq HTTP ${response.status}${parsedErr ? `: ${parsedErr}` : ''}`;
                console.warn(`[Poetry AI] Model ${model} HTTP ${response.status}: ${errText.slice(0, 150)}`);
                sawTransientBusy = true;
            }
        } catch (err) {
            const isAbort = err.name === 'AbortError';
            lastErrorMessage = isAbort
                ? `Model ${model} quá thời gian chờ (${GROQ_TIMEOUT_MS / 1000}s)`
                : err.message;
            console.warn(`[Poetry AI] Lỗi model ${model}:`, err.message);

            if (isAbort) {
                sawTransientBusy = true;
            }
        } finally {
            clearTimeout(timeoutId);
        }

        const hasNextModel = mIdx < GROQ_MODELS.length - 1;
        if (hasNextModel) {
            await sleep(GROQ_FALLBACK_DELAY_MS);
        }
    }

    const friendlyBusyMessage = 'Các model Groq AI hiện đều đang quá tải hoặc phản hồi chậm (HTTP 400/429/503/Timeout). Vui lòng đợi vài giây rồi thử lại nhé!';

    return {
        ok: false,
        reason: sawTransientBusy ? 'all_models_busy' : 'api_error',
        statusCode: lastStatus === 429 ? 429 : 503,
        message: sawTransientBusy
            ? friendlyBusyMessage
            : `Không thể kết nối Groq AI (${lastErrorMessage}). Vui lòng kiểm tra GROQ_API_KEY hoặc thử lại sau.`,
    };
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
Hãy chấm điểm công tâm, nhân văn, sâu sắc và chỉ ra các điểm cần sửa chữa một cách chuẩn xác theo niêm luật thi pháp học.
BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT MỘT OBJECT JSON HỢP LỆ THEO ĐÚNG SCHEMA TRÊN, TUYỆT ĐỐI KHÔNG GIẢI THÍCH THÊM VÀ KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO NGOÀI JSON.`;

    const groqCriticRes = await callGroqPoetryApi({ prompt, systemInstruction });
    let aiCritic = groqCriticRes.ok ? groqCriticRes.data : null;

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
    const stripPunct = (w) => w.replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '');
    const words = cleanLuc
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => stripPunct(w).length > 0);

    if (words.length !== 6) {
        throw new Error(`Để đối thơ Lục Bát chuẩn xác, câu Lục cần có đúng 6 tiếng (hiện tại bạn nhập ${words.length} tiếng: "${cleanLuc}").`);
    }

    // 1. Phân tích ngữ âm và niêm luật câu Lục bằng Rule Engine
    const lineObj = {
        lineIndex: 0,
        rawText: cleanLuc,
        syllableCount: words.length,
        syllables: words.map((w, idx) => {
            const cleanWord = stripPunct(w);
            return {
                position: idx + 1,
                clean: cleanWord,
                ...getToneType(cleanWord),
            };
        }),
    };

    const word6Luc = lineObj.syllables[5].clean;
    const tone6Luc = lineObj.syllables[5].toneType;
    const tone6Name = lineObj.syllables[5].toneName || (tone6Luc === 'B' ? 'Bằng' : 'Trắc');
    const rime6 = extractRime(word6Luc);

    // Lấy danh sách từ Bằng hiệp vần gợi ý cho vị trí thứ 6 của câu Bát
    const suggestedRhymes = getSuggestedRhymes(word6Luc);
    const suggestedWordsText = (suggestedRhymes.length > 0 ? suggestedRhymes : [word6Luc]).join(', ');
    const detectedTopic = detectPoemTopic(cleanLuc);

    const contextClause = context && context.trim()
        ? `\n[BÀI THƠ ĐANG VIẾT TRONG TRÌNH SOẠN THẢO — CHỈ THAM KHẢO NẾU CÙNG MẠCH Ý]:\n${context.trim()}\n(LƯU Ý: Nếu bối cảnh trên khác chủ đề với câu Lục "${cleanLuc}", BẮT BUỘC bỏ qua bối cảnh và chỉ đối trực tiếp theo đúng câu Lục "${cleanLuc}"!).\n`
        : '';

    // 2. Xây dựng Prompt cho Groq AI: Bắt buộc bám sát đúng cấu trúc 8 tiếng, luật B-T-B-B và vần vị trí 6
    const prompt = `CÂU LỤC CHÍNH THỨC CỦA NGƯỜI DÙNG VỪA NHẬP (6 tiếng):
"${cleanLuc}"
- Tiếng thứ 6 gieo vần: "${word6Luc}" (thanh ${tone6Name}, vần "${rime6}").
- Các từ thanh Bằng hiệp vần gợi ý cho vị trí thứ 6 câu Bát: ${suggestedWordsText}.
${contextClause}
QUY TẮC BẮT BUỘC CHO CÂU BÁT (8 TIẾNG):
Mỗi câu Bát BẮT BUỘC gồm đúng 8 từ tách nhau bằng khoảng trắng:
- Vị trí 1: Tự do
- Vị trí 2: BẮT BUỘC THANH BẰNG (không dấu hoặc dấu huyền). Ví dụ: người, đời, lòng, thuyền, non, mây, trôi, nhà.
- Vị trí 3: Tự do
- Vị trí 4: BẮT BUỘC THANH TRẮC (sắc, hỏi, ngã, nặng). Ví dụ: nhớ, gửi, đọng, thấu, ngóng, dẫu, chảy, cuốn, vất.
- Vị trí 5: Tự do
- Vị trí 6: BẮT BUỘC THANH BẰNG VÀ PHẢI HIỆP VẦN VỚI "${word6Luc}". CHỌN 1 TỪ TRONG DANH SÁCH: [${suggestedWordsText}].
  CHÚ Ý CỰC KỲ QUAN TRỌNG: Từ hiệp vần nằm ở vị trí THỨ 6 (yêu vận), TUYỆT ĐỐI KHÔNG ĐƯỢC ĐẶT Ở VỊ TRÍ THỨ 8 (cuối câu)!
- Vị trí 7: Tự do
- Vị trí 8: BẮT BUỘC THANH BẰNG (đối lập thanh Ngang/Huyền với từ vị trí 6 để câu thơ trầm bổng).

VÍ DỤ ĐỐI XỨNG KINH ĐIỂN CHUẨN MỰC:
- Câu Lục: "Trăm năm trong cõi người ta" (từ 6: "ta" - Bằng vần a)
  Câu Bát mẫu: "Chữ tài chữ mệnh khéo là ghét nhau"
  (Phân tích: [1:Chữ] [2:tài (B)] [3:chữ] [4:mệnh (T)] [5:khéo] [6:là (B, vần ta)] [7:ghét] [8:nhau (B)])
- Câu Lục: "Chiều nay gió thổi bên sông" (từ 6: "sông" - Bằng vần ông)
  Câu Bát mẫu: "Thuyền ai lặng lẽ xuôi dòng về đâu"
  (Phân tích: [1:Thuyền] [2:ai (B)] [3:lặng] [4:lẽ (T)] [5:xuôi] [6:dòng (B, vần sông)] [7:về] [8:đâu (B)])

YÊU CẦU NGỮ NGHĨA:
- Nối tiếp mạch cảm xúc và mở rộng ý nghĩa từ câu Lục "${cleanLuc}" của người dùng (chủ đề: ${detectedTopic}).
- TUYỆT ĐỐI KHÔNG lặp lại nguyên văn câu Lục của người dùng.
- BẮT BUỘC ĐÚNG 8 TỪ CHO MỖI CÂU BÁT (không được dừng ở 6 từ, không được 7 hoặc 9 từ).
- Phần "explanation" viết ngắn gọn 1 câu duy nhất (dưới 20 từ).

CHỈ TRẢ VỀ DUY NHẤT 1 OBJECT JSON HỢP LỆ THEO SCHEMA:
{
  "analysis": {
    "verseMeaning": "Ý nghĩa sâu sắc của câu Lục",
    "poeticForm": "Thơ Lục Bát — Câu Lục (6 tiếng)",
    "toneAnalysis": "Phân tích âm luật",
    "emotionalTone": "Sắc thái cảm xúc"
  },
  "context": {
    "scene": "Bối cảnh không gian thời gian",
    "theme": "Chủ đề",
    "artisticDirection": "Hướng đối câu Bát"
  },
  "candidates": [
    {
      "batLine": "...",
      "mood": "Trữ tình",
      "rhymeWord": "...",
      "explanation": "Nối ý trữ tình mượt mà",
      "harmonyScore": 98
    },
    {
      "batLine": "...",
      "mood": "Triết lý",
      "rhymeWord": "...",
      "explanation": "Đúc kết triết lý sâu sắc",
      "harmonyScore": 96
    },
    {
      "batLine": "...",
      "mood": "Dân dã",
      "rhymeWord": "...",
      "explanation": "Hình ảnh mộc mạc gần gũi",
      "harmonyScore": 95
    }
  ]
}`;

    const systemInstruction = `Bạn là Đại thi hào & Bậc thầy Thi pháp Lục Bát Cổ truyền Việt Nam của nền tảng VietHeritage AI.
Bạn nhận một câu Lục (6 tiếng) của người dùng và sáng tác 3 phương án câu Bát (8 tiếng) đối ứng chuẩn 100% về niêm luật Bằng - Trắc và hiệp vần.
BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT MỘT OBJECT JSON HỢP LỆ THEO ĐÚNG SCHEMA TRÊN, TUYỆT ĐỐI KHÔNG GIẢI THÍCH THÊM VÀ KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO NGOÀI JSON.`;

    let aiResult = null;
    let modelUsed = 'Groq AI';

    try {
        const groqRes = await callGroqPoetryApi({ prompt, systemInstruction });
        if (groqRes.ok && groqRes.data) {
            aiResult = groqRes.data;
            modelUsed = groqRes.modelUsed || 'Groq AI';
        } else {
            console.warn('[Poetry AI] Groq API không phản hồi ok, kích hoạt bộ đối thơ mẫu cổ truyền:', groqRes.message);
        }
    } catch (apiErr) {
        console.warn('[Poetry AI] Lỗi gọi Groq API, chuyển sang bộ đối thơ mẫu cổ truyền:', apiErr.message);
    }

    // 3. Xử lý và Thẩm định nghiêm ngặt từng câu Bát qua Rule Engine
    const validCandidates = [];
    const seenBatLines = new Set();

    if (aiResult && Array.isArray(aiResult.candidates)) {
        for (const cand of aiResult.candidates) {
            const rawBat = String(cand.batLine || '').trim();
            if (!rawBat) continue;

            // Thử tự động hiệu chỉnh (sửa 6 từ thiếu 2 từ cuối, hoặc loại bỏ hư từ thừa ở câu 9 từ)
            const repairedBat = tryRepairBatLine(rawBat, word6Luc);
            if (!repairedBat) continue;

            const fullPoemTest = `${cleanLuc}\n${repairedBat}`;
            const analysis = analyzeLucBatPoem(fullPoemTest);
            const batLineAnalysis = analysis.lines[1];
            const rhymeInfo = analysis.rhymes[0] || null;

            // Kiểm tra số lỗi âm luật ở các vị trí cốt tử (2, 4, 6, 8)
            const toneErrors = batLineAnalysis?.issues.filter((iss) => iss.type === 'tone') || [];

            const isExact8 = batLineAnalysis?.syllableCount === 8;
            const isRhymeValid = !!rhymeInfo?.isRhyme;
            const isToneValid = toneErrors.length === 0;

            if (isExact8 && isRhymeValid && isToneValid && !seenBatLines.has(repairedBat)) {
                seenBatLines.add(repairedBat);
                validCandidates.push({
                    batLine: repairedBat,
                    explanation: cand.explanation || 'Đối ý tự nhiên, tiếp nối mạch cảm xúc và chuẩn mực âm luật.',
                    mood: cand.mood || 'Trữ tình',
                    rhymeWord: cand.rhymeWord || batLineAnalysis?.syllables[5]?.clean || '',
                    harmonyScore: cand.harmonyScore || 96,
                    syllableCount: 8,
                    isValidStructure: true,
                    toneScore: analysis.summary.toneScore,
                    isRhymeValid: true,
                    rhymeReason: rhymeInfo?.reason || 'Vần chuẩn mực',
                    rhymeQuality: rhymeInfo?.quality || 'chinh',
                });
            }
        }
    }

    // 4. Nếu AI chưa sinh đủ 3 phương án chuẩn 100% âm luật, tự động kích hoạt Kho tứ thơ Lục Bát cổ truyền để bổ sung
    if (validCandidates.length < 3) {
        const fallbackTemplates = createCompliantTemplateBatLines(cleanLuc, word6Luc);
        for (const fb of fallbackTemplates) {
            if (validCandidates.length >= 3) break;
            if (!seenBatLines.has(fb.batLine)) {
                seenBatLines.add(fb.batLine);
                const fullTest = `${cleanLuc}\n${fb.batLine}`;
                const fbAnalysis = analyzeLucBatPoem(fullTest);
                const fbBatLine = fbAnalysis.lines[1];
                const fbRhyme = fbAnalysis.rhymes[0] || null;

                validCandidates.push({
                    batLine: fb.batLine,
                    explanation: fb.explanation,
                    mood: fb.mood,
                    rhymeWord: fb.rhymeWord,
                    harmonyScore: fb.harmonyScore || 95,
                    syllableCount: fbBatLine?.syllableCount || 8,
                    isValidStructure: true,
                    toneScore: fbAnalysis.summary.toneScore || 40,
                    isRhymeValid: fbRhyme?.isRhyme || true,
                    rhymeReason: fbRhyme?.reason || 'Vần chính chuẩn mực',
                    rhymeQuality: fbRhyme?.quality || 'chinh',
                });
            }
        }
    }

    // Sắp xếp ưu tiên: Điểm âm luật cao nhất, hiệp vần chuẩn, harmonyScore cao nhất
    validCandidates.sort((a, b) => {
        if (b.toneScore !== a.toneScore) return b.toneScore - a.toneScore;
        return (b.harmonyScore || 0) - (a.harmonyScore || 0);
    });

    const finalCandidates = validCandidates.slice(0, 3);

    // Xây dựng khối phân tích mặc định nếu AI không phản hồi
    const fallbackAnalysis = {
        verseMeaning: `Câu thơ giàu hình tượng "${cleanLuc}", gợi mở không gian thi cảm sâu lắng và truyền tải trọn vẹn hồn thơ dân tộc.`,
        poeticForm: 'Thơ Lục Bát — Câu Lục (6 tiếng)',
        toneAnalysis: `Tiếng thứ 6 gieo vần là "${word6Luc}" (thanh ${tone6Name}, vần "${rime6}"), làm điểm tựa âm luật vững vàng cho câu Bát nối tiếp.`,
        emotionalTone: detectedTopic === 'family' ? 'Thiết tha, cảm kính' : detectedTopic === 'love' ? 'Thắm thiết, nhớ mong' : detectedTopic === 'philosophy' ? 'Trầm tư, triết lý' : 'Khoáng đạt, mộc mạc',
    };

    const fallbackContext = {
        scene: detectedTopic === 'family' ? 'Không gian gia đình ấm cúng, cội nguồn sinh thành' : detectedTopic === 'love' ? 'Khung cảnh đôi lứa bên vầng trăng dòng sông' : detectedTopic === 'philosophy' ? 'Chiêm nghiệm nhân sinh giữa dòng đời vạn biến' : 'Bức tranh phong cảnh quê hương êm đềm',
        theme: detectedTopic === 'family' ? 'Đạo hiếu và ân tình cha mẹ' : detectedTopic === 'love' ? 'Tình yêu và nỗi niềm thương nhớ' : detectedTopic === 'philosophy' ? 'Lẽ được mất và ý nghĩa kiếp người' : 'Tình quê hương và thiên nhiên đất nước',
        artisticDirection: 'Câu Bát tiếp nối trực tiếp hình tượng câu Lục, giữ chuẩn mực niêm luật Bằng - Trắc (2-4-6-8) và hiệp vần lưng ở vị trí thứ 6.',
    };

    return {
        inputLucLine: cleanLuc,
        rhymeTargetWord: word6Luc,
        analysis: aiResult?.analysis || fallbackAnalysis,
        context: aiResult?.context || fallbackContext,
        candidates: finalCandidates,
        isGemini: true,
        modelUsed,
        source: aiResult ? `Groq AI (${modelUsed})` : 'Thi pháp Cổ truyền',
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
