const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const https = require('https');
const Poem = require('../models/Poem');
const { analyzeLucBatPoem, checkWordRhyme, getToneType, extractRime } = require('../utils/lucBatAnalyzer');

// Cấu hình Groq API & Model Fallback
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
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
    'ân': ['thân', 'gần', 'phần', 'chân', 'trần', 'vần', 'ngần', 'gian truân', 'muôn phần'],
    'u': ['thu', 'dù', 'ru', 'từ', 'như', 'mù', 'thiên thu', 'lãng du'],
    'ua': ['mùa', 'xưa', 'vừa', 'mua', 'khua', 'lùa', 'bốn mùa'],
    'uân': ['xuân', 'thuần', 'tuần', 'luân', 'thanh xuân', 'gian truân', 'bâng khuâng', 'thân', 'gần'],
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
    if (
        lower.includes('yêu') ||
        lower.includes('nhớ') ||
        lower.includes('thương') ||
        lower.includes('duyên') ||
        lower.includes('tình') ||
        lower.includes('hứa') ||
        lower.includes('thề') ||
        lower.includes('ước') ||
        lower.includes('thanh xuân') ||
        lower.includes('tuổi xuân') ||
        lower.includes('tuổi trẻ') ||
        lower.includes('chờ') ||
        lower.includes('đợi') ||
        lower.includes('vấn vương') ||
        lower.includes('son sắt') ||
        lower.includes('trọn đời') ||
        lower.includes('bên nhau') ||
        lower.includes('chung đôi') ||
        lower.includes('lứa đôi') ||
        lower.includes('người yêu') ||
        lower.includes('người tình') ||
        lower.includes('cách trở') ||
        lower.includes('bóng hình')
    ) {
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

// Từ điển cụm từ & từ láy tự nhiên theo tiếng liền kề (Collocation Map) để gợi ý sửa lỗi chuẩn mực ngữ nghĩa
const COLLOCATION_MAP = {
    lặng: {
        T: [
            { word: 'lẽ', reason: "Tạo thành từ láy 'lặng lẽ' mang thanh Trắc (ngã), gợi không gian êm đềm, thanh vắng rất thi vị." },
            { word: 'ngắt', reason: "Tạo thành 'lặng ngắt' mang thanh Trắc (sắc), diễn tả sự tĩnh mịch sâu lắng của cảnh vật." },
            { word: 'khuất', reason: "Tạo thành 'lặng khuất' mang thanh Trắc (sắc), gợi bóng hình khuất dần theo dòng nước." },
            { word: 'ngắm', reason: "Tạo thành 'lặng ngắm' mang thanh Trắc (sắc), thể hiện hành động chiêm ngưỡng tĩnh tại." }
        ],
        B: [
            { word: 'lờ', reason: "Tạo thành từ láy 'lặng lờ' mang thanh Bằng (huyền), gợi dòng nước êm ả trôi đi." },
            { word: 'trôi', reason: "Tạo thành 'lặng trôi' mang thanh Bằng (ngang), chỉ sự trôi chảy bình yên." },
            { word: 'nhìn', reason: "Tạo thành 'lặng nhìn' mang thanh Bằng (huyền), ánh mắt dõi theo trầm ngâm." }
        ]
    },
    lững: {
        T: [
            { word: 'thững', reason: "Tạo thành từ láy 'lững thững' mang thanh Trắc (ngã), gợi nhịp bước chậm rãi thong dong." }
        ],
        B: [
            { word: 'lờ', reason: "Tạo thành từ láy 'lững lờ' mang thanh Bằng (huyền), gợi dòng trôi êm đềm." }
        ]
    },
    mênh: {
        B: [
            { word: 'mông', reason: "Tạo thành từ láy 'mênh mông' mang thanh Bằng (ngang), mở ra không gian trời mây sông nước bao la." }
        ],
        T: [
            { word: 'mang', reason: "Tạo thành 'mênh mang' mang thanh Bằng." }
        ]
    },
    gió: {
        T: [
            { word: 'thổi', reason: "Tạo thành cụm 'gió thổi' mang thanh Trắc (hỏi), động từ tự nhiên giàu nhạc tính." },
            { word: 'lộng', reason: "Tạo thành 'gió lộng' mang thanh Trắc (nặng), diễn tả luồng gió khoáng đạt lồng lộng." },
            { word: 'thoảng', reason: "Tạo thành 'gió thoảng' mang thanh Trắc (hỏi), gợi làn gió nhẹ êm đềm." }
        ],
        B: [
            { word: 'về', reason: "Tạo thành 'gió về' mang thanh Bằng (huyền), gợi sự chuyển mùa dịu nhẹ." },
            { word: 'bay', reason: "Tạo thành 'gió bay' mang thanh Bằng (ngang), mở rộng không gian thi ca." }
        ]
    },
    nước: {
        T: [
            { word: 'chảy', reason: "Tạo thành 'nước chảy' mang thanh Trắc (hỏi), thuận theo dòng nước tự nhiên." },
            { word: 'cuộn', reason: "Tạo thành 'nước cuộn' mang thanh Trắc (nặng), diễn tả sức nước cuộn trào dào dạt." },
            { word: 'biếc', reason: "Tạo thành 'nước biếc' mang thanh Trắc (sắc), gợi màu sắc thanh trong của dòng sông." }
        ],
        B: [
            { word: 'trôi', reason: "Tạo thành 'nước trôi' mang thanh Bằng (ngang), êm ả thuận dòng." },
            { word: 'trong', reason: "Tạo thành 'nước trong' mang thanh Bằng (ngang), gợi sự tinh khiết mát lành." },
            { word: 'nguồn', reason: "Tạo thành 'nước nguồn' mang thanh Bằng (huyền), gợi cội nguồn ân tình nuôi dưỡng." }
        ]
    },
    nghĩa: {
        B: [
            { word: 'tình', reason: "Tạo thành 'nghĩa tình' mang thanh Bằng (huyền), chỉ ân nghĩa sâu nặng và tình cảm bền chặt." },
            { word: 'người', reason: "Tạo thành 'nghĩa người' mang thanh Bằng (huyền), chỉ tình nghĩa cao đẹp giữa người với người." },
            { word: 'sâu', reason: "Tạo thành 'nghĩa sâu' mang thanh Bằng (ngang), tôn vinh ân đức cao dày." },
            { word: 'thầy', reason: "Tạo thành 'nghĩa thầy' mang thanh Bằng (huyền), gợi đạo thầy trò tôn kính." }
        ],
        T: [
            { word: 'mẹ', reason: "Tạo thành 'nghĩa mẹ' mang thanh Trắc (nặng), đối ứng chuẩn mực với công cha." },
            { word: 'nặng', reason: "Tạo thành 'nghĩa nặng' mang thanh Trắc (nặng), khắc họa ân tình sâu đậm." }
        ]
    },
    công: {
        T: [
            { word: 'dưỡng', reason: "Tạo thành 'công dưỡng' mang thanh Trắc (ngã), tôn vinh công lao nuôi nấng bảo bọc." },
            { word: 'đức', reason: "Tạo thành 'công đức' mang thanh Trắc (sắc), công lao đức độ cao cả." }
        ],
        B: [
            { word: 'cha', reason: "Tạo thành 'công cha' mang thanh Bằng (ngang), hình tượng trụ cột thiêng liêng gia đình." },
            { word: 'sinh', reason: "Tạo thành 'công sinh' mang thanh Bằng (ngang), ơn sinh thành dưỡng dục." },
            { word: 'thầy', reason: "Tạo thành 'công thầy' mang thanh Bằng (huyền), ơn dạy dỗ nên người." }
        ]
    },
    ơn: {
        B: [
            { word: 'sâu', reason: "Tạo thành 'ơn sâu' mang thanh Bằng (ngang), gợi ơn nghĩa cao dày." },
            { word: 'người', reason: "Tạo thành 'ơn người' mang thanh Bằng (huyền), tri ân ân nhân sâu sắc." }
        ],
        T: [
            { word: 'nghĩa', reason: "Tạo thành 'ơn nghĩa' mang thanh Trắc (ngã), trọn vẹn đạo lý ân tình." }
        ]
    },
    thương: {
        T: [
            { word: 'nhớ', reason: "Tạo thành 'thương nhớ' mang thanh Trắc (sắc), bộc lộ nỗi niềm da diết." },
            { word: 'mến', reason: "Tạo thành 'thương mến' mang thanh Trắc (sắc), tình cảm trong sáng ấm áp." }
        ],
        B: [
            { word: 'nhau', reason: "Tạo thành 'thương nhau' mang thanh Bằng (ngang), tình cảm gắn bó son sắt." },
            { word: 'người', reason: "Tạo thành 'thương người' mang thanh Bằng (huyền), tình cảm nhân ái bao la." },
            { word: 'ai', reason: "Tạo thành 'thương ai' mang thanh Bằng (ngang), nỗi niềm hoài niệm xa vắng." }
        ]
    },
    lòng: {
        T: [
            { word: 'dạ', reason: "Tạo thành 'lòng dạ' mang thanh Trắc (nặng), chỉ tấm lòng chân thành sâu kín." },
            { word: 'nhớ', reason: "Tạo thành 'lòng nhớ' mang thanh Trắc (sắc), tâm trạng thương nhớ khôn nguôi." }
        ],
        B: [
            { word: 'son', reason: "Tạo thành 'lòng son' mang thanh Bằng (ngang), biểu tượng của tấm lòng thủy chung kiên định." },
            { word: 'thương', reason: "Tạo thành 'lòng thương' mang thanh Bằng (ngang), tình cảm dạt dào nhân ái." },
            { word: 'người', reason: "Tạo thành 'lòng người' mang thanh Bằng (huyền), sự cảm thông sâu sắc giữa nhân gian." }
        ]
    },
    bước: {
        T: [
            { word: 'tới', reason: "Tạo thành 'bước tới' mang thanh Trắc (sắc), chỉ hướng đi tiến về phía trước." }
        ],
        B: [
            { word: 'chân', reason: "Tạo thành 'bước chân' mang thanh Bằng (ngang), hình tượng bước đi quen thuộc." },
            { word: 'đi', reason: "Tạo thành 'bước đi' mang thanh Bằng (ngang), nhịp bước trên đường đời." }
        ]
    },
    đường: {
        T: [
            { word: 'dốc', reason: "Tạo thành 'đường dốc' mang thanh Trắc (sắc), gợi thử thách gian truân." },
            { word: 'vắng', reason: "Tạo thành 'đường vắng' mang thanh Trắc (sắc), gợi không gian tĩnh mịch cô liêu." }
        ],
        B: [
            { word: 'xa', reason: "Tạo thành 'đường xa' mang thanh Bằng (ngang), dặm trường phong sương." },
            { word: 'về', reason: "Tạo thành 'đường về' mang thanh Bằng (huyền), hướng về tổ ấm quê hương." },
            { word: 'dài', reason: "Tạo thành 'đường dài' mang thanh Bằng (huyền), hành trình cuộc đời mênh mông." }
        ]
    },
    thuyền: {
        T: [
            { word: 'lướt', reason: "Tạo thành 'thuyền lướt' mang thanh Trắc (sắc), diễn tả con thuyền lướt nhẹ trên sóng." },
            { word: 'đậu', reason: "Tạo thành 'thuyền đậu' mang thanh Trắc (nặng), bến sông bình yên." }
        ],
        B: [
            { word: 'ai', reason: "Tạo thành 'thuyền ai' mang thanh Bằng (ngang), hình tượng thi ca phiêu lãng." },
            { word: 'về', reason: "Tạo thành 'thuyền về' mang thanh Bằng (huyền), con thuyền trở về bến cũ." },
            { word: 'trôi', reason: "Tạo thành 'thuyền trôi' mang thanh Bằng (ngang), lững lờ theo dòng nước." }
        ]
    },
    chiều: {
        T: [
            { word: 'tím', reason: "Tạo thành 'chiều tím' mang thanh Trắc (sắc), màu sắc hoàng hôn lắng đọng." },
            { word: 'muộn', reason: "Tạo thành 'chiều muộn' mang thanh Trắc (nặng), thời khắc hoàng hôn tĩnh lặng." }
        ],
        B: [
            { word: 'nay', reason: "Tạo thành 'chiều nay' mang thanh Bằng (ngang), xác định thời gian thực tại." },
            { word: 'vàng', reason: "Tạo thành 'chiều vàng' mang thanh Bằng (huyền), ánh nắng chiều rực rỡ." },
            { word: 'buông', reason: "Tạo thành 'chiều buông' mang thanh Bằng (ngang), thời khắc hoàng hôn buông xuống." }
        ]
    },
    đêm: {
        T: [
            { word: 'vắng', reason: "Tạo thành 'đêm vắng' mang thanh Trắc (sắc), không gian thanh tịnh không tiếng động." },
            { word: 'lạnh', reason: "Tạo thành 'đêm lạnh' mang thanh Trắc (nặng), cảm giác se sắt cô đơn." }
        ],
        B: [
            { word: 'khuya', reason: "Tạo thành 'đêm khuya' mang thanh Bằng (ngang), thời khắc tĩnh mịch." },
            { word: 'trăng', reason: "Tạo thành 'đêm trăng' mang thanh Bằng (ngang), ánh trăng soi vằng vặc." }
        ]
    },
    trăng: {
        T: [
            { word: 'sáng', reason: "Tạo thành 'trăng sáng' mang thanh Trắc (sắc), ánh sáng vằng vặc thanh tao." },
            { word: 'tỏ', reason: "Tạo thành 'trăng tỏ' mang thanh Trắc (hỏi), vầng trăng soi tỏ lòng người." }
        ],
        B: [
            { word: 'thanh', reason: "Tạo thành 'trăng thanh' mang thanh Bằng (ngang), đêm trăng thanh bình tao nhã." },
            { word: 'vàng', reason: "Tạo thành 'trăng vàng' mang thanh Bằng (huyền), sắc trăng ấm áp cổ phong." },
            { word: 'nghiêng', reason: "Tạo thành 'trăng nghiêng' mang thanh Bằng (ngang), bóng trăng ngả nghiêng thi vị." }
        ]
    }
};

// Nhóm trường nghĩa (Semantic Groups) phục vụ thay thế đồng nghĩa theo từ loại
const SEMANTIC_GROUPS = [
    {
        words: ['trôi', 'lội', 'chảy', 'lướt', 'bay', 'đi', 'về', 'qua', 'bước', 'cuộn', 'xuôi'],
        T: [
            { word: 'lướt', reason: "Động từ 'lướt' mang thanh Trắc (sắc), diễn tả chuyển động nhẹ nhàng, êm dịu trên sóng nước." },
            { word: 'chảy', reason: "Động từ 'chảy' mang thanh Trắc (hỏi), giữ nguyên tính chất xuôi dòng tự nhiên." },
            { word: 'cuộn', reason: "Động từ 'cuộn' mang thanh Trắc (nặng), gợi sức chuyển động dạt dào của dòng nước." }
        ],
        B: [
            { word: 'trôi', reason: "Động từ 'trôi' mang thanh Bằng (ngang), diễn tả dòng trôi bình yên." },
            { word: 'xuôi', reason: "Động từ 'xuôi' mang thanh Bằng (ngang), chỉ chuyển động theo chiều dòng nước." },
            { word: 'về', reason: "Động từ 'về' mang thanh Bằng (huyền), gợi hướng đi trở lại chốn thân quen." }
        ]
    },
    {
        words: ['buồn', 'vui', 'sầu', 'nhớ', 'thương', 'lo', 'ngóng', 'trông', 'mong', 'tiếc', 'xót'],
        T: [
            { word: 'nhớ', reason: "Từ 'nhớ' mang thanh Trắc (sắc), bày tỏ tâm trạng nhớ nhung sâu nặng." },
            { word: 'ngóng', reason: "Từ 'ngóng' mang thanh Trắc (sắc), ánh mắt trông đợi khắc khoải." },
            { word: 'vấn', reason: "Từ 'vấn' mang thanh Trắc (sắc), nỗi niềm vương vấn trong lòng." }
        ],
        B: [
            { word: 'thương', reason: "Từ 'thương' mang thanh Bằng (ngang), tình cảm nhân hậu bao la." },
            { word: 'sầu', reason: "Từ 'sầu' mang thanh Bằng (huyền), tâm trạng man mác u hoài." },
            { word: 'mong', reason: "Từ 'mong' mang thanh Bằng (ngang), niềm hy vọng trông ngóng êm đềm." }
        ]
    },
    {
        words: ['mẹ', 'cha', 'con', 'thầy', 'bạn', 'người', 'anh', 'em', 'chàng', 'nàng', 'ai'],
        T: [
            { word: 'mẹ', reason: "Danh từ 'mẹ' mang thanh Trắc (nặng), thiêng liêng đạo hiếu." }
        ],
        B: [
            { word: 'người', reason: "Từ 'người' mang thanh Bằng (huyền), chỉ đấng sinh thành hoặc nhân vật thi ca một cách trang trọng." },
            { word: 'thầy', reason: "Từ 'thầy' mang thanh Bằng (huyền), chỉ người thầy hoặc bậc sinh thành." },
            { word: 'cha', reason: "Từ 'cha' mang thanh Bằng (ngang), trụ cột gia đình thiêng liêng." }
        ]
    }
];

/**
 * Tạo gợi ý thay từ chuẩn xác theo ngữ cảnh câu thơ và đúng âm luật (Bằng/Trắc)
 */
function getContextualToneSuggestion({ rawLine, pos, expectedTone, originalWord, lineIndex }) {
    const topic = detectPoemTopic(rawLine);
    const words = (rawLine || '').trim().split(/\s+/);
    const lineWordsLower = words.map((w) => w.toLowerCase());
    const cleanOrig = (originalWord || '').toLowerCase().replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '');
    const prevWord = pos > 1 && words[pos - 2] ? words[pos - 2].toLowerCase().replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '') : '';
    const nextWord = pos < words.length && words[pos] ? words[pos].toLowerCase().replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '') : '';

    const suggestions = [];
    const seenWords = new Set();
    seenWords.add(cleanOrig);

    // 1. Ưu tiên tra cứu Collocation Map theo tiếng đứng trước (prevWord)
    if (prevWord && COLLOCATION_MAP[prevWord] && COLLOCATION_MAP[prevWord][expectedTone]) {
        for (const item of COLLOCATION_MAP[prevWord][expectedTone]) {
            const wLower = item.word.toLowerCase();
            if (!seenWords.has(wLower) && !lineWordsLower.includes(wLower)) {
                seenWords.add(wLower);
                const previewLine = words.map((currW, idx) => (idx + 1 === pos ? item.word : currW)).join(' ');
                suggestions.push({
                    word: item.word,
                    reason: `${item.reason} — Câu sửa hoàn chỉnh: "${previewLine}".`,
                    actualTone: expectedTone,
                    toneName: getToneType(item.word).toneName,
                    isToneValid: true,
                    previewLine,
                });
                if (suggestions.length >= 2) break;
            }
        }
    }

    // 2. Tra cứu nhóm trường nghĩa đồng loại (Semantic Groups) theo originalWord
    if (suggestions.length < 2) {
        for (const group of SEMANTIC_GROUPS) {
            if (group.words.includes(cleanOrig)) {
                const candidates = group[expectedTone] || [];
                for (const item of candidates) {
                    const wLower = item.word.toLowerCase();
                    if (!seenWords.has(wLower) && !lineWordsLower.includes(wLower)) {
                        seenWords.add(wLower);
                        const previewLine = words.map((currW, idx) => (idx + 1 === pos ? item.word : currW)).join(' ');
                        suggestions.push({
                            word: item.word,
                            reason: `${item.reason} — Câu sửa hoàn chỉnh: "${previewLine}".`,
                            actualTone: expectedTone,
                            toneName: getToneType(item.word).toneName,
                            isToneValid: true,
                            previewLine,
                        });
                        if (suggestions.length >= 2) break;
                    }
                }
            }
            if (suggestions.length >= 2) break;
        }
    }

    // 3. Nếu vẫn chưa đủ 2 gợi ý, chọn từ thi vị tự nhiên theo thể thơ
    if (suggestions.length < 2) {
        const genericPool = expectedTone === 'B'
            ? [
                  { word: 'thương', reason: "Từ mang thanh Bằng (ngang) giàu sắc thái cảm xúc, giữ trọn vẹn chất thơ." },
                  { word: 'người', reason: "Từ mang thanh Bằng (huyền) mở rộng liên tưởng nhân văn tự nhiên." },
                  { word: 'lòng', reason: "Từ mang thanh Bằng (huyền) gắn liền với tâm tư thi nhân." }
              ]
            : [
                  { word: 'nhớ', reason: "Động từ mang thanh Trắc (sắc) giàu nhạc cảm và cảm xúc." },
                  { word: 'thoảng', reason: "Tính từ miêu tả mang thanh Trắc (hỏi) gợi sự nhẹ nhàng, tinh tế." },
                  { word: 'lặng', reason: "Từ mang thanh Trắc (nặng) gợi không gian tĩnh tại sâu lắng." }
              ];

        for (const item of genericPool) {
            const wLower = item.word.toLowerCase();
            if (!seenWords.has(wLower) && !lineWordsLower.includes(wLower)) {
                seenWords.add(wLower);
                const previewLine = words.map((currW, idx) => (idx + 1 === pos ? item.word : currW)).join(' ');
                suggestions.push({
                    word: item.word,
                    reason: `${item.reason} — Câu sửa hoàn chỉnh: "${previewLine}".`,
                    actualTone: expectedTone,
                    toneName: getToneType(item.word).toneName,
                    isToneValid: true,
                    previewLine,
                });
                if (suggestions.length >= 2) break;
            }
        }
    }

    return suggestions.slice(0, 2);
}

// Kho thi pháp Lục Bát cổ truyền tuyển chọn (câu hoàn chỉnh 100% chuẩn 8 tiếng & B-T-B-B theo nhóm vần)
const CURATED_CLASSICAL_COUPLETS = {
    'ơn': {
        family: [
            { batLine: 'Khắc ghi đạo hiếu chẳng sờn dạ con', mood: 'Trữ tình', rhymeWord: 'sờn', explanation: 'Nối tiếp lòng hiếu thảo, khắc ghi ơn sâu không bao giờ phai nhạt.' },
            { batLine: 'Lòng con ghi nhớ muôn ơn biển trời', mood: 'Triết lý', rhymeWord: 'ơn', explanation: 'Tôn vinh công lao dưỡng dục vô biên như trời biển của đấng sinh thành.' },
            { batLine: 'Nghĩa tình sâu nặng nào hơn tháng ngày', mood: 'Dân dã', rhymeWord: 'hơn', explanation: 'Khẳng định tình cha mẹ là điều thiêng liêng nhất trên đời.' }
        ],
        love: [
            { batLine: 'Đường xa có bạn chẳng sờn bước chân', mood: 'Trữ tình', rhymeWord: 'sờn', explanation: 'Có bạn đồng hành sẻ chia thì đường xa mấy cũng không quản bước chân.' },
            { batLine: 'Tìm nhau ghép lại cho hơn một mình', mood: 'Dân dã', rhymeWord: 'hơn', explanation: 'Rủ nhau cùng sẻ chia tâm sự cho vơi bớt nỗi cô quạnh một mình.' },
            { batLine: 'Lòng son giữ trọn nào sờn phong ba', mood: 'Triết lý', rhymeWord: 'sờn', explanation: 'Giữ tấm lòng kiên định son sắt không chùn bước trước sóng gió cuộc đời.' }
        ],
        default: [
            { batLine: 'Đường xa có bạn chẳng sờn bước chân', mood: 'Trữ tình', rhymeWord: 'sờn', explanation: 'Có bạn đồng hành sẻ chia thì đường xa mấy cũng không quản bước chân.' },
            { batLine: 'Đường xa vạn dặm nào sờn chí trai', mood: 'Triết lý', rhymeWord: 'sờn', explanation: 'Ý chí kiên định vượt qua mọi thử thách trên đường đời.' },
            { batLine: 'Thời gian thấm thoắt nào hơn nỗi niềm', mood: 'Trữ tình', rhymeWord: 'hơn', explanation: 'Lắng đọng cảm xúc trước dòng chảy thời gian.' }
        ]
    },
    'ông': {
        nature: [
            { batLine: 'Thuyền ai lặng lẽ xuôi dòng về đâu', mood: 'Trữ tình', rhymeWord: 'dòng', explanation: 'Bức tranh sông nước hoàng hôn êm đềm, giàu cảm xúc.' },
            { batLine: 'Thời gian lững thững mênh mông ráng chiều', mood: 'Triết lý', rhymeWord: 'mông', explanation: 'Không gian trời chiều mênh mông đối lập với sự hữu hạn của đời người.' },
            { batLine: 'Bến xưa ngóng đợi người trông bóng đò', mood: 'Dân dã', rhymeWord: 'trông', explanation: 'Hình ảnh bến sông đợi chờ con đò quen thuộc nơi làng quê.' }
        ],
        family: [
            { batLine: 'Ơn cha nghĩa mẹ trong lòng khắc ghi', mood: 'Trữ tình', rhymeWord: 'lòng', explanation: 'Khắc sâu hình bóng và ơn đức cha mẹ trong tâm khảm.' },
            { batLine: 'Biển trời che chở mênh mông cõi đời', mood: 'Triết lý', rhymeWord: 'mông', explanation: 'Tình cảm gia đình bao la như biển rộng sông dài.' },
            { batLine: 'Sớm hôm tần tảo đục trong quản gì', mood: 'Dân dã', rhymeWord: 'trong', explanation: 'Sự hy sinh không quản nắng mưa của cha mẹ vì đàn con.' }
        ],
        default: [
            { batLine: 'Thuyền ai lặng lẽ xuôi dòng về đâu', mood: 'Trữ tình', rhymeWord: 'dòng', explanation: 'Hình tượng con thuyền trôi theo dòng nước bình yên.' },
            { batLine: 'Bao năm dâu bể mênh mông tháng ngày', mood: 'Triết lý', rhymeWord: 'mông', explanation: 'Nhìn lại dòng đời mênh mông rộng lớn.' },
            { batLine: 'Bến xưa lặng lẽ trông người phương xa', mood: 'Dân dã', rhymeWord: 'trông', explanation: 'Nỗi mong ngóng người phương xa trở về.' }
        ]
    },
    'ong': {
        nature: [
            { batLine: 'Thuyền ai lặng lẽ xuôi dòng về đâu', mood: 'Trữ tình', rhymeWord: 'dòng', explanation: 'Bức tranh sông nước hoàng hôn êm đềm, giàu cảm xúc.' },
            { batLine: 'Thời gian lững thững mênh mông ráng chiều', mood: 'Triết lý', rhymeWord: 'mông', explanation: 'Không gian trời chiều mênh mông đối lập với sự hữu hạn của đời người.' },
            { batLine: 'Bến xưa ngóng đợi người trông bóng đò', mood: 'Dân dã', rhymeWord: 'trông', explanation: 'Hình ảnh bến sông đợi chờ con đò quen thuộc nơi làng quê.' }
        ],
        default: [
            { batLine: 'Thuyền ai lặng lẽ xuôi dòng về đâu', mood: 'Trữ tình', rhymeWord: 'dòng', explanation: 'Hình tượng con thuyền trôi theo dòng nước bình yên.' },
            { batLine: 'Bao năm dâu bể mênh mông tháng ngày', mood: 'Triết lý', rhymeWord: 'mông', explanation: 'Nhìn lại dòng đời mênh mông rộng lớn.' },
            { batLine: 'Bến xưa lặng lẽ trông người phương xa', mood: 'Dân dã', rhymeWord: 'trông', explanation: 'Nỗi mong ngóng người phương xa trở về.' }
        ]
    },
    'a': {
        philosophy: [
            { batLine: 'Chữ tài chữ mệnh khéo là ghét nhau', mood: 'Triết lý', rhymeWord: 'là', explanation: 'Câu bát kinh điển về sự mâu thuẫn giữa tài năng và số phận.' },
            { batLine: 'Mấy phen dâu bể phong ba cuộc đời', mood: 'Trữ tình', rhymeWord: 'ba', explanation: 'Nhìn lại những biến cố thăng trầm của kiếp người.' },
            { batLine: 'Thương nhau dẫu có cách xa muôn trùng', mood: 'Dân dã', rhymeWord: 'xa', explanation: 'Tình cảm gắn bó keo sơn vượt qua khoảng cách không gian.' }
        ],
        nature: [
            { batLine: 'Khói lam nhẹ tỏa mái nhà ấm êm', mood: 'Trữ tình', rhymeWord: 'nhà', explanation: 'Bức tranh hoàng hôn thôn dã bình yên.' },
            { batLine: 'Gió lay cành trúc la đà chốn xưa', mood: 'Triết lý', rhymeWord: 'đà', explanation: 'Cảnh thiên nhiên tĩnh mịch đượm vẻ hoài cổ.' },
            { batLine: 'Đường trần muôn dặm bôn ba tháng ngày', mood: 'Dân dã', rhymeWord: 'ba', explanation: 'Bước chân người lữ thứ trên dặm trường phong sương.' }
        ],
        default: [
            { batLine: 'Chữ tài chữ mệnh khéo là ghét nhau', mood: 'Triết lý', rhymeWord: 'là', explanation: 'Triết lý nhân sinh sâu sắc.' },
            { batLine: 'Khói lam nhẹ tỏa mái nhà ấm êm', mood: 'Trữ tình', rhymeWord: 'nhà', explanation: 'Hình ảnh mái ấm bình dị chốn quê.' },
            { batLine: 'Thương nhau dẫu có cách xa muôn trùng', mood: 'Dân dã', rhymeWord: 'xa', explanation: 'Tình người son sắt vượt qua gian khó.' }
        ]
    },
    'ương': {
        love: [
            { batLine: 'Trăng khuya soi bóng vấn vương mối tình', mood: 'Trữ tình', rhymeWord: 'vương', explanation: 'Tơ duyên vương vấn dưới ánh trăng khuya.' },
            { batLine: 'Đò xưa cách trở tơ vương nỗi niềm', mood: 'Triết lý', rhymeWord: 'vương', explanation: 'Nỗi niềm hoài niệm về người thương năm cũ.' },
            { batLine: 'Bao năm cách biệt quê hương nhớ về', mood: 'Dân dã', rhymeWord: 'hương', explanation: 'Nỗi nhớ da diết về mảnh đất quê hương người thương.' }
        ],
        default: [
            { batLine: 'Trăng khuya soi bóng vấn vương mối tình', mood: 'Trữ tình', rhymeWord: 'vương', explanation: 'Nỗi niềm vương vấn trong đêm thanh vắng.' },
            { batLine: 'Đò chiều lặng lẽ soi gương bóng người', mood: 'Triết lý', rhymeWord: 'gương', explanation: 'Hình ảnh dòng nước soi bóng người lữ khách.' },
            { batLine: 'Bao năm cách biệt quê hương nhớ về', mood: 'Dân dã', rhymeWord: 'hương', explanation: 'Tình yêu quê hương nguồn cội sâu sắc.' }
        ]
    },
    'ơi': {
        default: [
            { batLine: 'Thời gian lưu dấu muôn đời chẳng phai', mood: 'Triết lý', rhymeWord: 'đời', explanation: 'Khẳng định giá trị vững bền lưu lại với muôn đời.' },
            { batLine: 'Chắt chiu năm tháng đầy vơi nghĩa tình', mood: 'Trữ tình', rhymeWord: 'vơi', explanation: 'Ân tình sâu nặng gom góp qua tháng năm.' },
            { batLine: 'Mẹ hiền dạy dỗ từng lời sắt son', mood: 'Dân dã', rhymeWord: 'lời', explanation: 'Lời răn dạy quý giá của mẹ hiền theo suốt bước đường con.' }
        ]
    },
    'iên': {
        default: [
            { batLine: 'Mẹ hiền tần tảo dịu hiền sớm hôm', mood: 'Trữ tình', rhymeWord: 'hiền', explanation: 'Hình ảnh mẹ hiền tần tảo dưỡng dục đàn con.' },
            { batLine: 'Duyên nồng thắm đượm chữ duyên đá vàng', mood: 'Triết lý', rhymeWord: 'duyên', explanation: 'Tơ duyên bền chặt, son sắt theo năm tháng.' },
            { batLine: 'Lòng trần thanh tịnh bình yên cõi lòng', mood: 'Dân dã', rhymeWord: 'yên', explanation: 'Tâm hồn thanh thản, an nhiên giữa cuộc sống.' }
        ]
    },
    'au': {
        default: [
            { batLine: 'Đường xa vạn dặm trọn câu ước thề', mood: 'Trữ tình', rhymeWord: 'câu', explanation: 'Lời thề thủy chung dẫu cách trở vạn dặm đường dài.' },
            { batLine: 'Trăm năm tạc dạ khắc sâu chữ tình', mood: 'Triết lý', rhymeWord: 'sâu', explanation: 'Khắc ghi ân tình sâu sắc trong suốt cuộc đời.' },
            { batLine: 'Bao nhiêu cay đắng dãi dầu sớm hôm', mood: 'Dân dã', rhymeWord: 'dầu', explanation: 'Sự nhọc nhằn, chịu thương chịu khó sớm hôm.' }
        ]
    },
    'âu': {
        default: [
            { batLine: 'Đường xa vạn dặm trọn câu ước thề', mood: 'Trữ tình', rhymeWord: 'câu', explanation: 'Lời thề thủy chung dẫu cách trở vạn dặm đường dài.' },
            { batLine: 'Trăm năm tạc dạ khắc sâu chữ tình', mood: 'Triết lý', rhymeWord: 'sâu', explanation: 'Khắc ghi ân tình sâu sắc trong suốt cuộc đời.' },
            { batLine: 'Bao nhiêu cay đắng dãi dầu sớm hôm', mood: 'Dân dã', rhymeWord: 'dầu', explanation: 'Sự nhọc nhằn, chịu thương chịu khó sớm hôm.' }
        ]
    },
    'ay': {
        default: [
            { batLine: 'Thời gian thấm thoắt đổi thay ngỡ ngàng', mood: 'Triết lý', rhymeWord: 'thay', explanation: 'Sự biến chuyển nhanh chóng của thời gian và dòng đời.' },
            { batLine: 'Trời cao lãng đãng tầng mây trắng ngần', mood: 'Trữ tình', rhymeWord: 'mây', explanation: 'Khung cảnh trời mây thanh thoát, bao la.' },
            { batLine: 'Vòng tay ấm áp đong đầy nhớ thương', mood: 'Dân dã', rhymeWord: 'đầy', explanation: 'Cảm giác ấm cúng, chở che đầy thương nhớ.' }
        ]
    },
    'ây': {
        default: [
            { batLine: 'Thời gian thấm thoắt đổi thay ngỡ ngàng', mood: 'Triết lý', rhymeWord: 'thay', explanation: 'Sự biến chuyển nhanh chóng của thời gian và dòng đời.' },
            { batLine: 'Trời cao lãng đãng tầng mây trắng ngần', mood: 'Trữ tình', rhymeWord: 'mây', explanation: 'Khung cảnh trời mây thanh thoát, bao la.' },
            { batLine: 'Vòng tay ấm áp đong đầy nhớ thương', mood: 'Dân dã', rhymeWord: 'đầy', explanation: 'Cảm giác ấm cúng, chở che đầy thương nhớ.' }
        ]
    },
    'ai': {
        default: [
            { batLine: 'Thời gian dẫu chảy nguôi ngoai nỗi niềm', mood: 'Trữ tình', rhymeWord: 'ngoai', explanation: 'Nỗi niềm lắng dịu dần theo dòng chảy thời gian.' },
            { batLine: 'Tình xưa nghĩa cũ hoài hoài nhớ nhung', mood: 'Triết lý', rhymeWord: 'hoài', explanation: 'Kỷ niệm xưa cũ vẫn luôn vương vấn khôn nguôi.' },
            { batLine: 'Đường trần muôn dặm tương lai sáng ngời', mood: 'Dân dã', rhymeWord: 'lai', explanation: 'Niềm tin hướng về tương lai tươi sáng rộng mở.' }
        ]
    },
    'an': {
        default: [
            { batLine: 'Ơn sâu biển rộng ngút ngàn chẳng phai', mood: 'Trữ tình', rhymeWord: 'ngàn', explanation: 'Công ơn cao sâu vời vợi chẳng bao giờ phai nhòa.' },
            { batLine: 'Lời ru năm tháng chứa chan nghĩa tình', mood: 'Triết lý', rhymeWord: 'chan', explanation: 'Điệu ru dạt dào ân tình theo con suốt cuộc đời.' },
            { batLine: 'Bình minh rạng rỡ thênh thang đất trời', mood: 'Dân dã', rhymeWord: 'thang', explanation: 'Ánh bình minh rực rỡ mở ra không gian khoáng đạt.' }
        ]
    },
    'ang': {
        default: [
            { batLine: 'Ơn sâu biển rộng ngút ngàn chẳng phai', mood: 'Trữ tình', rhymeWord: 'ngàn', explanation: 'Công ơn cao sâu vời vợi chẳng bao giờ phai nhòa.' },
            { batLine: 'Lời ru năm tháng chứa chan nghĩa tình', mood: 'Triết lý', rhymeWord: 'chan', explanation: 'Điệu ru dạt dào ân tình theo con suốt cuộc đời.' },
            { batLine: 'Bình minh rạng rỡ thênh thang đất trời', mood: 'Dân dã', rhymeWord: 'thang', explanation: 'Ánh bình minh rực rỡ mở ra không gian khoáng đạt.' }
        ]
    },
    'anh': {
        default: [
            { batLine: 'Khói lam nhẹ tỏa mái tranh chốn quê', mood: 'Trữ tình', rhymeWord: 'tranh', explanation: 'Cảnh chiều quê yên bình bên mái tranh đơn sơ.' },
            { batLine: 'Cây cao tỏa bóng màu xanh ngút ngàn', mood: 'Triết lý', rhymeWord: 'xanh', explanation: 'Sức sống bền bỉ và tươi mát của thiên nhiên.' },
            { batLine: 'Cầu cho gia đạo yên lành ấm êm', mood: 'Dân dã', rhymeWord: 'lành', explanation: 'Ước nguyện cuộc sống gia đình yên vui, thuận hòa.' }
        ]
    },
    'iêu': {
        default: [
            { batLine: 'Cánh buồm thấp thoáng sớm chiều lướt trôi', mood: 'Trữ tình', rhymeWord: 'chiều', explanation: 'Cánh buồm nhấp nhô lướt sóng sớm chiều trên bến nước.' },
            { batLine: 'Tình thương rộng lớn bao điều chở che', mood: 'Triết lý', rhymeWord: 'điều', explanation: 'Tình thương bao la luôn chở che qua mọi sóng gió.' },
            { batLine: 'Tình cha ấm áp thương yêu ngút ngàn', mood: 'Dân dã', rhymeWord: 'yêu', explanation: 'Tình yêu thương vô bờ của cha nuôi con khôn lớn.' }
        ]
    },
    'uôn': {
        default: [
            { batLine: 'Tiếng chuông thanh thản nhẹ buông mái chùa', mood: 'Trữ tình', rhymeWord: 'buông', explanation: 'Tiếng chuông chùa ngân vang mang lại sự thanh tịnh.' },
            { batLine: 'Tình cha như suối đầu nguồn chảy ra', mood: 'Triết lý', rhymeWord: 'nguồn', explanation: 'Tình phụ tử dạt dào như dòng nước mát đầu nguồn.' },
            { batLine: 'Lòng riêng gửi trọn nỗi buồn cách xa', mood: 'Dân dã', rhymeWord: 'buồn', explanation: 'Nỗi buồn chia xa gửi trọn trong lòng.' }
        ]
    },
    'uông': {
        default: [
            { batLine: 'Tiếng chuông thanh thản nhẹ buông mái chùa', mood: 'Trữ tình', rhymeWord: 'buông', explanation: 'Tiếng chuông chùa ngân vang mang lại sự thanh tịnh.' },
            { batLine: 'Tình cha như suối đầu nguồn chảy ra', mood: 'Triết lý', rhymeWord: 'nguồn', explanation: 'Tình phụ tử dạt dào như dòng nước mát đầu nguồn.' },
            { batLine: 'Lòng riêng gửi trọn nỗi buồn cách xa', mood: 'Dân dã', rhymeWord: 'buồn', explanation: 'Nỗi buồn chia xa gửi trọn trong lòng.' }
        ]
    },
    'uân': {
        love: [
            { batLine: 'Trăm năm gửi gắm tấm thân bến bờ', mood: 'Trữ tình', rhymeWord: 'thân', explanation: 'Lời hứa trọn đời trao gửi niềm tin và bến đỗ yêu thương.' },
            { batLine: 'Dẫu xa vạn dặm tình gần chẳng phai', mood: 'Triết lý', rhymeWord: 'gần', explanation: 'Tình cảm sắt son, dẫu cách trở địa lý nhưng lòng vẫn luôn gần bên.' },
            { batLine: 'Đường trần muôn nẻo gian truân quản gì', mood: 'Dân dã', rhymeWord: 'truân', explanation: 'Cùng nhau vượt qua mọi thử thách, nhọc nhằn của cuộc sống.' }
        ],
        family: [
            { batLine: 'Con ngoan ghi nhớ muôn phần công ơn', mood: 'Trữ tình', rhymeWord: 'phần', explanation: 'Lòng hiếu thảo ghi khắc công ơn dưỡng dục sâu nặng.' },
            { batLine: 'Mẹ cha tần tảo gian truân tháng ngày', mood: 'Triết lý', rhymeWord: 'truân', explanation: 'Thấu hiểu những hy sinh nhọc nhằn của đấng sinh thành.' },
            { batLine: 'Bao năm dưỡng dục ân cần sớm hôm', mood: 'Dân dã', rhymeWord: 'cần', explanation: 'Tình mẹ cha chăm lo ân cần không kể nắng mưa.' }
        ],
        nature: [
            { batLine: 'Hoa khoe sắc thắm cõi trần thảnh thơi', mood: 'Trữ tình', rhymeWord: 'trần', explanation: 'Vẻ đẹp mùa xuân tươi tắn tràn ngập đất trời.' },
            { batLine: 'Gió đưa hương ngát lại gần bóng cây', mood: 'Triết lý', rhymeWord: 'gần', explanation: 'Làn gió xuân mang hương hoa dịu dàng sưởi ấm cảnh vật.' },
            { batLine: 'Chim ca ríu rít gian truân lùi xa', mood: 'Dân dã', rhymeWord: 'truân', explanation: 'Khúc ca xuân xua tan mọi nhọc nhằn buốt giá mùa đông.' }
        ],
        default: [
            { batLine: 'Trăm năm gửi gắm tấm thân bến bờ', mood: 'Trữ tình', rhymeWord: 'thân', explanation: 'Lời hứa trọn đời trao gửi niềm tin và bến đỗ yêu thương.' },
            { batLine: 'Dẫu xa vạn dặm tình gần chẳng phai', mood: 'Triết lý', rhymeWord: 'gần', explanation: 'Tình cảm sắt son dẫu cách trở muôn trùng.' },
            { batLine: 'Đường trần muôn nẻo gian truân quản gì', mood: 'Dân dã', rhymeWord: 'truân', explanation: 'Cùng nhau vượt qua mọi thử thách trên đường đời.' }
        ]
    },
    'ân': {
        love: [
            { batLine: 'Trăm năm gửi gắm tấm thân bến bờ', mood: 'Trữ tình', rhymeWord: 'thân', explanation: 'Lời hứa trọn đời trao gửi niềm tin và bến đỗ yêu thương.' },
            { batLine: 'Dẫu xa vạn dặm tình gần chẳng phai', mood: 'Triết lý', rhymeWord: 'gần', explanation: 'Tình cảm sắt son dẫu cách trở muôn trùng.' },
            { batLine: 'Đường trần muôn nẻo gian truân quản gì', mood: 'Dân dã', rhymeWord: 'truân', explanation: 'Cùng nhau vượt qua mọi thử thách trên đường đời.' }
        ],
        default: [
            { batLine: 'Trăm năm gửi gắm tấm thân bến bờ', mood: 'Trữ tình', rhymeWord: 'thân', explanation: 'Trao gửi niềm tin trọn vẹn và bến đỗ bình yên.' },
            { batLine: 'Dẫu xa vạn dặm tình gần chẳng phai', mood: 'Triết lý', rhymeWord: 'gần', explanation: 'Tấm lòng son sắt bền chặt theo năm tháng.' },
            { batLine: 'Đường trần muôn nẻo gian truân quản gì', mood: 'Dân dã', rhymeWord: 'truân', explanation: 'Vững bước vượt qua gian truân thử thách.' }
        ]
    }
};

/**
 * Lấy các phương án câu Bát chuẩn 100% âm luật & vần từ Kho thi pháp cổ truyền tuyển chọn
 */
function getCuratedClassicalCouplets(lucLine, word6Luc) {
    const topic = detectPoemTopic(lucLine);
    const rime = extractRime(word6Luc);

    let candidates = [];
    const rimeGroup = CURATED_CLASSICAL_COUPLETS[rime];
    if (rimeGroup) {
        candidates = rimeGroup[topic] || rimeGroup.default || [];
    }

    // Nếu không tìm thấy nhóm vần trực tiếp, tìm trong các vần thông tương hợp
    if (candidates.length === 0) {
        for (const [rKey, rVal] of Object.entries(CURATED_CLASSICAL_COUPLETS)) {
            const list = rVal[topic] || rVal.default || [];
            const matching = list.filter((item) => {
                const sampleWord = item.rhymeWord || item.batLine.split(/\s+/)[5];
                return sampleWord && checkWordRhyme(word6Luc, sampleWord).isRhyme;
            });
            if (matching.length > 0) {
                candidates = matching;
                break;
            }
        }
    }

    // Tuyệt đối chỉ giữ lại các câu thật sự hiệp vần chuẩn xác với tiếng thứ 6 của câu Lục
    const verifiedCandidates = candidates.filter((item) => {
        const rw = item.rhymeWord || item.batLine.split(/\s+/)[5];
        return rw && checkWordRhyme(word6Luc, rw).isRhyme;
    });

    return verifiedCandidates.slice(0, 3);
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

function postJsonHttps(urlStr, headers, bodyObj, timeoutMs = 25000) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const postData = Buffer.from(JSON.stringify(bodyObj), 'utf8');
        const req = https.request(
            {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: 'POST',
                family: 4, // Bắt buộc IPv4 để không bị timeout IPv6 trên Windows
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length,
                },
                timeout: timeoutMs,
            },
            (res) => {
                let data = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        text: async () => data,
                        json: async () => JSON.parse(data),
                    });
                });
            }
        );

        req.on('timeout', () => {
            req.destroy(new Error(`Timeout sau ${timeoutMs}ms`));
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(postData);
        req.end();
    });
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
                max_tokens: isQwen ? 1800 : 2500,
                temperature: 0.5,
            };

            // Tắt suy nghĩ nội bộ ở Qwen để không bị tràn token/rate limit, đặt low ở GPT-OSS
            if (isQwen) {
                body.reasoning_effort = 'none';
            } else if (isGptOss) {
                body.reasoning_effort = 'low';
            }

            clearTimeout(timeoutId);
            const response = await postJsonHttps(
                GROQ_API_URL,
                { Authorization: `Bearer ${apiKey.trim()}` },
                body,
                GROQ_TIMEOUT_MS
            );

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
                const smartSuggestions = getContextualToneSuggestion({
                    rawLine: l.rawText,
                    pos: iss.position,
                    expectedTone: iss.expected,
                    originalWord: iss.word,
                    lineIndex: lIdx,
                });
                improvements.push({
                    lineIndex: lIdx,
                    syllablePosition: iss.position,
                    originalWord: iss.word,
                    issueDescription: iss.message,
                    suggestions: smartSuggestions,
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

    // 2. Gọi AI để đánh giá Nhịp điệu và Hồn thơ với prompt chuyên sâu thi pháp & ngữ nghĩa câu thơ
    const detailedIssuesPrompt = [];
    ruleAnalysis.lines.forEach((l, lIdx) => {
        l.issues.forEach((iss) => {
            if (iss.type === 'tone') {
                const wordsInLine = l.rawText.trim().split(/\s+/);
                const prev = iss.position > 1 ? wordsInLine[iss.position - 2] : '';
                const next = iss.position < wordsInLine.length ? wordsInLine[iss.position] : '';
                const contextStr = prev ? `(đứng sau tiếng "${prev}")` : next ? `(đứng trước tiếng "${next}")` : '';
                detailedIssuesPrompt.push(
                    `- Dòng ${lIdx + 1} ("${l.rawText}"): Tiếng thứ ${iss.position} là "${iss.word}" ${contextStr} mang thanh ${iss.actual === 'B' ? 'Bằng' : 'Trắc'} trong khi luật Lục Bát bắt buộc phải là thanh ${iss.expected === 'B' ? 'BẰNG (không dấu hoặc dấu huyền)' : 'TRẮC (sắc, hỏi, ngã, nặng)'}.`
                );
            }
        });
    });

    const prompt = `Phân tích và thẩm định bài thơ Lục Bát sau:
Tựa đề: ${title}
Tác giả: ${authorName}
Nội dung bài thơ:
"""
${content}
"""

Kết quả kiểm tra âm luật từ Rule Engine:
- Tổng số dòng: ${ruleAnalysis.summary.totalLines}
- Lỗi bằng trắc: ${ruleAnalysis.summary.toneErrors}
- Lỗi vần điệu: ${ruleAnalysis.summary.rhymeErrors}

CHI TIẾT CÁC VỊ TRÍ CẦN GỢI Ý THAY TỪ:
${detailedIssuesPrompt.length > 0 ? detailedIssuesPrompt.join('\n') : 'Bài thơ tuân thủ tốt niêm luật.'}

NGUYÊN TẮC BẮT BUỘC KHI GỢI Ý THAY TỪ ("suggestions"):
1. ĐÚNG NGHĨA VÀ TỰ NHIÊN TRONG CÂU THƠ (THE FULL-SENTENCE TEST - QUAN TRỌNG NHẤT):
   - Bạn PHẢI đọc thử toàn bộ câu thơ khi ghép từ thay thế vào vị trí lỗi.
   - Câu thơ sau khi thay PHẢI có nghĩa tự nhiên, mượt mà, đúng ngữ pháp và bám sát mạch ý bài thơ.
   - TUYỆT ĐỐI CẤM: Gợi ý một từ chỉ vì đúng thanh Bằng/Trắc mà khi ghép vào câu lại trở thành từ ngữ ngô nghê, quái đản, phá hỏng ngữ pháp và ngữ nghĩa của câu thơ!
     * Ví dụ 1: Câu "Thuyền ai lặng trôi xuôi dòng về đâu", tiếng 4 "trôi" sai Trắc (cần Trắc), tiếng trước là "lặng".
       -> TUYỆT ĐỐI CẤM gợi ý "lội" vì "thuyền lặng lội" là từ ngữ ngô nghê, phản cảm!
       -> PHẢI gợi ý: "lẽ" (ghép thành "lặng lẽ" -> câu đọc thành: "Thuyền ai lặng lẽ xuôi dòng về đâu" - cực kỳ tự nhiên, giàu chất thơ và đúng 100% thanh Trắc), hoặc "ngắt" ("lặng ngắt"), "khuất" ("lặng khuất").
     * Ví dụ 2: Câu "Công cha như núi ngút ngàn / Nghĩa mẹ như nước ngập tràn biển sâu", tiếng 2 "mẹ" sai Bằng (cần Bằng), tiếng trước là "Nghĩa".
       -> TUYỆT ĐỐI CẤM gợi ý "con" hay "cha" vì "Nghĩa con như nước..." là phá hỏng đạo hiếu!
       -> PHẢI gợi ý: "tình" ("Nghĩa tình như nước..."), "người" ("Nghĩa người như nước..."), "thầy" ("Nghĩa thầy như nước...").
2. NGUYÊN TẮC TỪ LÁY & TỪ GHÉP (COLLOCATION):
   - Luôn ưu tiên chọn từ có thể ghép với tiếng trước hoặc tiếng sau thành từ láy hoặc từ ghép quen thuộc trong thi ca (ví dụ: "lặng lẽ", "mênh mông", "nhớ thương", "gió thổi", "bước chân", "dòng đời").
3. BẮT BUỘC ĐÚNG THANH ĐIỆU YÊU CẦU:
   - Thanh Bằng: Tiếng không dấu (ngang) và tiếng có dấu Huyền.
   - Thanh Trắc: Tiếng có dấu Sắc, Hỏi, Ngã, Nặng.

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
          "word": (từ thay thế gợi ý - BẮT BUỘC hợp nghĩa câu thơ và chuẩn 100% thanh Bằng/Trắc),
          "reason": (giải thích từ này ghép vào câu như thế nào và câu sửa đọc ra sao)
        }
      ]
    }
  ],
  "overallComment": "Nhận xét tổng thể về bài thơ",
  "refinedVersion": "Phiên bản bài thơ được AI trau chuốt mượt mà hơn (giữ nguyên tứ thơ)"
}`;

    const systemInstruction = `Bạn là Bậc thầy Chữa thơ & Giám khảo Thi pháp Lục Bát Cổ truyền Việt Nam của nền tảng VietHeritage AI.
QUY TẮC CỐT TỬ KHI GỢI Ý THAY TỪ (SUGGESTIONS):
1. ĐÚNG NGHĨA VÀ TỰ NHIÊN TRONG CÂU THƠ LÀ ƯU TIÊN SỐ 1:
   - Một từ gợi ý CHỈ CÓ GIÁ TRỊ khi nó thay thế vào câu thơ và làm cho câu thơ có nghĩa tự nhiên, mượt mà và đúng ngữ pháp.
   - Tuyệt đối CẤM ghép từ cơ học hoặc bốc từ vô nghĩa chỉ để ép cho đúng dấu Bằng/Trắc.
2. NGUYÊN TẮC CỤM TỪ (COLLOCATION):
   - Luôn kết hợp hài hòa với tiếng trước và tiếng sau để tạo thành từ láy, từ ghép chuẩn xác trong tiếng Việt.
3. CHỈ TRẢ VỀ DUY NHẤT MỘT KHỐI JSON HỢP LỆ THEO SCHEMA, TUYỆT ĐỐI KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO NGOÀI JSON.`;

    const groqCriticRes = await callGroqPoetryApi({ prompt, systemInstruction });
    let aiCritic = groqCriticRes.ok ? groqCriticRes.data : null;

    if (!aiCritic || typeof aiCritic.rhythmScore !== 'number') {
        aiCritic = fallbackPoetryCritic(content, ruleAnalysis);
    }

    // Đảm bảo giới hạn điểm
    const rhythmScore = Math.min(30, Math.max(0, Math.round(aiCritic.rhythmScore || 18)));
    const poeticScore = Math.min(30, Math.max(0, Math.round(aiCritic.poeticScore || 18)));
    const totalScore = Math.min(100, Math.max(0, toneScore + rhythmScore + poeticScore));

    // Yêu cầu quan trọng: Lọc và kiểm định nghiêm ngặt từng từ gợi ý thay thế qua Rule Engine
    if (Array.isArray(aiCritic.improvements)) {
        aiCritic.improvements.forEach((imp) => {
            const line = ruleAnalysis.lines[imp.lineIndex];
            const pos = imp.syllablePosition;
            const expectedTone = line?.tonePattern?.find((tp) => tp.position === pos)?.expectedTone;
            const originalWord = imp.originalWord || line?.tonePattern?.find((tp) => tp.position === pos)?.word || '';

            const validSuggestions = [];
            const wordsInLine = (line?.rawText || '').trim().split(/\s+/);
            const prevW = pos > 1 && wordsInLine[pos - 2] ? wordsInLine[pos - 2].toLowerCase().replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '') : '';

            // Bộ lọc loại bỏ những từ vô nghĩa hoặc phá hỏng câu thơ:
            const isNonsensical = (orig, sugWord, pWord) => {
                const s = sugWord.toLowerCase();
                const p = pWord.toLowerCase();
                const o = orig.toLowerCase();
                if (p === 'lặng' && ['lội', 'lộng', 'thổi', 'chạy', 'đá', 'nhảy'].includes(s)) return true;
                if (o === 'mẹ' && ['con', 'cha'].includes(s)) return true;
                if (['thanh', 'sắc', 'hỏi', 'ngã', 'nặng', 'từ', 'chữ', 'tiếng'].includes(s)) return true;
                return false;
            };

            if (Array.isArray(imp.suggestions)) {
                imp.suggestions.forEach((sug) => {
                    let cleanWord = (sug.word || '').replace(/^[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+|[.,/#!$%^&*;:{}=\-_~`()"'“”‘’?!…]+$/g, '').trim();
                    if (!cleanWord) return;

                    // Hiệu chỉnh chính tả quen thuộc khi đi sau từ láy
                    if (prevW === 'lặng' && cleanWord.toLowerCase() === 'lẻ') {
                        cleanWord = 'lẽ';
                    }

                    const wordTone = getToneType(cleanWord);
                    sug.word = cleanWord;
                    sug.actualTone = wordTone.toneType;
                    sug.toneName = wordTone.toneName;
                    sug.isToneValid = expectedTone ? wordTone.toneType === expectedTone : true;

                    // Lọc bỏ nếu từ mang sai thanh điệu yêu cầu
                    if (expectedTone && wordTone.toneType !== expectedTone) {
                        return;
                    }
                    // Lọc bỏ nếu từ gợi ý trùng với từ gốc
                    if (cleanWord.toLowerCase() === originalWord.toLowerCase()) {
                        return;
                    }
                    // Lọc bỏ nếu từ vô nghĩa hoặc phá hỏng câu thơ
                    if (isNonsensical(originalWord, cleanWord, prevW)) {
                        return;
                    }
                    // Lọc bỏ nếu lý do mang tính từ chối
                    if (sug.reason && (sug.reason.toLowerCase().includes('không dùng được') || sug.reason.toLowerCase().includes('không phù hợp'))) {
                        return;
                    }

                    const previewLine = wordsInLine.map((w, idx) => (idx + 1 === pos ? cleanWord : w)).join(' ');
                    sug.previewLine = previewLine;
                    if (!sug.reason || sug.reason.length < 15 || !sug.reason.includes('Câu')) {
                        sug.reason = `${sug.reason ? sug.reason.trim() + ' — ' : ''}Câu sửa hoàn chỉnh: "${previewLine}".`;
                    }

                    validSuggestions.push(sug);
                });
            }

            // Nếu AI không trả về gợi ý nào chuẩn âm luật và có nghĩa, bù đắp bằng Contextual Thesaurus thông minh
            if (validSuggestions.length === 0) {
                const smartFallbacks = getContextualToneSuggestion({
                    rawLine: line?.rawText,
                    pos,
                    expectedTone: expectedTone || 'B',
                    originalWord,
                    lineIndex: imp.lineIndex,
                });
                validSuggestions.push(...smartFallbacks);
            }

            imp.suggestions = validSuggestions;
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

    // 2. Xây dựng Prompt cho Groq AI: Tư duy văn xuôi trước, bám sát ngữ cảnh và cấm ghép từ vô nghĩa
    const prompt = `BẠN LÀ MỘT NGHỆ NHÂN ĐỐI THƠ LỤC BÁT DÂN GIAN VIỆT NAM THÔNG MINH, DÍ DỎM, NGÔN TỪ TỰ NHIÊN VÀ GIÀU CẢM XÚC.

NHIỆM VỤ:
Đọc câu Lục (6 tiếng) của người dùng, thấu hiểu tường tận NGỮ CẢNH và Ý NGHĨA, sau đó sáng tác 3 phương án câu Bát (8 tiếng) để đối đáp và tiếp nối mạch cảm xúc, hoàn thiện cặp thơ Lục Bát trọn vẹn.

CÂU LỤC CHÍNH THỨC CỦA NGƯỜI DÙNG VỪA NHẬP (6 tiếng):
"${cleanLuc}"
- Tiếng thứ 6 gieo vần: "${word6Luc}" (thanh ${tone6Name}, vần "${rime6}").
- Các từ thanh Bằng hiệp vần tự nhiên gợi ý cho vị trí thứ 6 câu Bát: ${suggestedWordsText}.
${contextClause}
NGUYÊN TẮC BẮT BUỘC (ƯU TIÊN TỪ TRÊN XUỐNG DƯỚI):
1. ĐÚNG NGỮ CẢNH & CÓ NGHĨA (QUAN TRỌNG NHẤT):
   - Câu thơ phải là tiếng Việt tự nhiên, trôi chảy, đúng ngữ pháp, mang thông điệp rõ ràng và bám sát nội dung, cảm xúc của câu Lục người dùng vừa nhập (chia sẻ, nối tiếp, trêu đùa hoặc đúc kết triết lý).
2. CẤM GHÉP TỪ VÔ NGHĨA:
   - Tuyệt đối KHÔNG nhồi nhét các từ đơn lẻ, từ Hán Việt sáo rỗng hoặc ghép từ chắp vá "râu ông nọ cắm cằm bà kia" chỉ để ép cho đúng dấu bằng/trắc. Nếu một từ không có nghĩa hoặc làm gãy câu, tuyệt đối KHÔNG được dùng.
3. QUY TRÌNH TƯ DUY BẮT BUỘC TRƯỚC KHI LÀM THƠ:
   - Bạn PHẢI suy nghĩ bằng văn xuôi trước (xác định định tiếp nối ý gì, hình tượng gì bằng một câu văn tự nhiên), sau đó mới chuyển thành câu thơ 8 tiếng.
4. GIEO VẦN TỰ NHIÊN:
   - Tiếng thứ 6 của câu Bát BẮT BUỘC hiệp vần với tiếng thứ 6 ("${word6Luc}") của câu Lục. Chọn 1 từ vần tự nhiên trong: [${suggestedWordsText}].
   - CHÚ Ý CỰC KỲ QUAN TRỌNG: Từ hiệp vần nằm ở vị trí THỨ 6 (yêu vận), TUYỆT ĐỐI KHÔNG ĐƯỢC ĐẶT Ở VỊ TRÍ THỨ 8 (cuối câu)!
5. NIÊM LUẬT BẰNG - TRẮC CÂU BÁT (8 TIẾNG):
   - Vị trí 1: Tự do | Vị trí 2: BẮT BUỘC BẰNG (B)
   - Vị trí 3: Tự do | Vị trí 4: BẮT BUỘC TRẮC (T)
   - Vị trí 5: Tự do | Vị trí 6: BẮT BUỘC BẰNG (B, hiệp vần)
   - Vị trí 7: Tự do | Vị trí 8: BẮT BUỘC BẰNG (B, đối bổng trầm với tiếng 6: tiếng 6 là Ngang thì tiếng 8 là Huyền, hoặc ngược lại).

VÍ DỤ ĐỐI XỨNG THEO ĐÚNG TƯ DUY VĂN XUÔI & SÁT NGỮ CẢNH:
* Người dùng: "Công cha như núi Thái Sơn" (tiếng 6: "Sơn", vần "ơn")
  -> Văn xuôi: Khắc ghi lòng hiếu thảo, ơn sâu dưỡng dục chẳng bao giờ phai mòn.
  -> Câu Bát: "Khắc ghi đạo hiếu chẳng sờn dạ con" (tiếng 6: "sờn" [B, vần Sơn], tiếng 8: "con" [B])

* Người dùng: "Chiều nay gió thổi bên sông" (tiếng 6: "sông", vần "ông")
  -> Văn xuôi: Cảnh sông nước hoàng hôn êm đềm, nhìn con thuyền lặng lẽ xuôi dòng về nơi xa.
  -> Câu Bát: "Thuyền ai lặng lẽ xuôi dòng về đâu" (tiếng 6: "dòng" [B, vần sông], tiếng 8: "đâu" [B])

* Người dùng: "một mình một cõi cô đơn" (tiếng 6: "đơn", vần "ơn")
  -> Văn xuôi: Động viên bạn đừng ôm mãi nỗi buồn, có bạn đồng hành sẻ chia thì đường xa chẳng quản.
  -> Câu Bát: "Đường xa có bạn chẳng sờn bước chân" (tiếng 6: "sờn" [B, vần đơn], tiếng 8: "chân" [B])

ĐỊNH DẠNG ĐẦU RA (CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI JSON HỢP LỆ THEO CẤU TRÚC SAU, MỖI TRƯỜNG NGẮN GỌN 1 CÂU):
{
  "analysis": {
    "verseMeaning": "Ý nghĩa súc tích của câu Lục trong 1 câu ngắn",
    "poeticForm": "Thơ Lục Bát — Câu Lục (6 tiếng)",
    "toneAnalysis": "Phân tích âm luật câu Lục",
    "emotionalTone": "Sắc thái cảm xúc (Thiết tha / Hào sảng / Trầm tư / Dí dỏm)"
  },
  "context": {
    "scene": "Bối cảnh không gian thời gian ngắn gọn",
    "theme": "Chủ đề chính",
    "artisticDirection": "Hướng đối ứng câu Bát ngắn gọn"
  },
  "candidates": [
    {
      "y_nghia_cau": "Diễn giải ý nghĩa câu Bát này bằng 1 câu văn xuôi bình thường trước khi chuyển thành thơ",
      "batLine": "Câu Bát 8 tiếng chuẩn 100% âm luật B-T-B-B và hiệp vần ở tiếng 6",
      "mood": "Trữ tình",
      "rhymeWord": "từ vần ở vị trí 6",
      "explanation": "Lời giải thích ngắn gọn dưới 15 từ",
      "harmonyScore": 98
    },
    {
      "y_nghia_cau": "Diễn giải ý nghĩa bằng văn xuôi ngắn gọn...",
      "batLine": "Câu Bát 8 tiếng chuẩn âm luật và vần...",
      "mood": "Triết lý",
      "rhymeWord": "...",
      "explanation": "Lời giải thích ngắn gọn dưới 15 từ",
      "harmonyScore": 96
    },
    {
      "y_nghia_cau": "Diễn giải ý nghĩa bằng văn xuôi ngắn gọn...",
      "batLine": "Câu Bát 8 tiếng chuẩn âm luật và vần...",
      "mood": "Dân dã",
      "rhymeWord": "...",
      "explanation": "Lời giải thích ngắn gọn dưới 15 từ",
      "harmonyScore": 95
    }
  ]
}`;

    const systemInstruction = `Bạn là một Nghệ nhân Thi pháp & Bậc thầy Đối thơ Lục Bát Cổ truyền Việt Nam của nền tảng VietHeritage AI: thông minh, dí dỏm, ngôn từ tự nhiên và giàu cảm xúc.

NGUYÊN TẮC BẮT BUỘC:
1. ĐÚNG NGỮ CẢNH & CÓ NGHĨA (QUAN TRỌNG NHẤT): Câu thơ phải là tiếng Việt tự nhiên, trôi chảy, đúng ngữ pháp, mang thông điệp rõ ràng bám sát nội dung câu người dùng vừa nhập.
2. CẤM GHÉP TỪ VÔ NGHĨA: Tuyệt đối KHÔNG nhồi nhét từ ngữ sáo rỗng hoặc ghép từ chắp vá "râu ông nọ cắm cằm bà kia" chỉ để ép cho đúng dấu bằng/trắc.
3. TƯ DUY VĂN XUÔI TRƯỚC KHI LÀM THƠ: Luôn xác định ý nghĩa văn xuôi cần truyền tải trước, sau đó mới gọt giũa thành câu thơ 8 tiếng.
4. ĐÚNG NIÊM LUẬT & HIỆP VẦN: Câu Bát đủ 8 tiếng, tiếng 6 hiệp vần lưng với tiếng 6 câu Lục, nhịp 2(B) - 4(T) - 6(B) - 8(B).

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
        if (!aiResult.analysis) aiResult.analysis = {};
        if (aiResult.phan_tich_ngu_canh && !aiResult.analysis.verseMeaning) {
            aiResult.analysis.verseMeaning = aiResult.phan_tich_ngu_canh;
        }

        for (const cand of aiResult.candidates) {
            const rawBat = String(cand.batLine || cand.cau_bat || '').trim();
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
                    explanation: cand.y_nghia_cau || cand.explanation || 'Đối ý tự nhiên, tiếp nối mạch cảm xúc và chuẩn mực âm luật.',
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

    // 4. Nếu AI chưa sinh đủ 3 phương án chuẩn 100% âm luật, tự động kích hoạt Kho thi pháp Lục Bát cổ truyền tuyển chọn
    if (validCandidates.length < 3) {
        const classicalCouplets = getCuratedClassicalCouplets(cleanLuc, word6Luc);
        for (const fb of classicalCouplets) {
            if (validCandidates.length >= 3) break;
            if (!seenBatLines.has(fb.batLine)) {
                seenBatLines.add(fb.batLine);
                const fullTest = `${cleanLuc}\n${fb.batLine}`;
                const fbAnalysis = analyzeLucBatPoem(fullTest);
                const fbBatLine = fbAnalysis.lines[1];
                const fbRhyme = fbAnalysis.rhymes[0] || null;

                // CHỈ THÊM VÀO KHI THỰC SỰ HIỆP VẦN VÀ ĐỦ 8 TIẾNG (TUYỆT ĐỐI KHÔNG ÉP HIỆP VẦN GIẢ)
                if (fbRhyme && fbRhyme.isRhyme && fbBatLine?.syllableCount === 8) {
                    validCandidates.push({
                        batLine: fb.batLine,
                        explanation: fb.explanation,
                        mood: fb.mood,
                        rhymeWord: fb.rhymeWord,
                        harmonyScore: fb.harmonyScore || 96,
                        syllableCount: 8,
                        isValidStructure: true,
                        toneScore: fbAnalysis.summary.toneScore || 40,
                        isRhymeValid: true,
                        rhymeReason: fbRhyme.reason || 'Vần hiệp chuẩn xác',
                        rhymeQuality: fbRhyme.quality || 'chinh',
                    });
                }
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
