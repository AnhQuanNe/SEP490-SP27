/**
 * LucBatAnalyzer — Rule-based Engine kiểm tra âm luật & hiệp vần thơ Lục Bát
 * Tuân thủ quy tắc âm luật cổ truyền Việt Nam (Bằng - Trắc, Nhị - Tứ - Lục, Yêu vận, Cước vận)
 */

// Bảng ánh xạ nguyên âm có dấu sang nguyên âm gốc và thanh điệu
// Thanh: 0: Ngang (Bằng), 1: Huyền (Bằng), 2: Sắc (Trắc), 3: Hỏi (Trắc), 4: Ngã (Trắc), 5: Nặng (Trắc)
const TONE_MAP = {
    // Không dấu (Ngang - Bằng)
    'a': 0, 'ă': 0, 'â': 0, 'e': 0, 'ê': 0, 'i': 0, 'o': 0, 'ô': 0, 'ơ': 0, 'u': 0, 'ư': 0, 'y': 0,
    // Dấu Huyền (Bằng)
    'à': 1, 'ằ': 1, 'ầ': 1, 'è': 1, 'ề': 1, 'ì': 1, 'ò': 1, 'ồ': 1, 'ờ': 1, 'ù': 1, 'ừ': 1, 'ỳ': 1,
    // Dấu Sắc (Trắc)
    'á': 2, 'ắ': 2, 'ấ': 2, 'é': 2, 'ế': 2, 'í': 2, 'ó': 2, 'ố': 2, 'ớ': 2, 'ú': 2, 'ứ': 2, 'ý': 2,
    // Dấu Hỏi (Trắc)
    'ả': 3, 'ẳ': 3, 'ẩ': 3, 'ẻ': 3, 'ể': 3, 'ỉ': 3, 'ỏ': 3, 'ổ': 3, 'ở': 3, 'ủ': 3, 'ử': 3, 'ỷ': 3,
    // Dấu Ngã (Trắc)
    'ã': 4, 'ẵ': 4, 'ẫ': 4, 'ẽ': 4, 'ễ': 4, 'ĩ': 4, 'õ': 4, 'ỗ': 4, 'ỡ': 4, 'ũ': 4, 'ữ': 4, 'ỹ': 4,
    // Dấu Nặng (Trắc)
    'ạ': 5, 'ặ': 5, 'ậ': 5, 'ẹ': 5, 'ệ': 5, 'ị': 5, 'ọ': 5, 'ộ': 5, 'ợ': 5, 'ụ': 5, 'ự': 5, 'ỵ': 5,
};

// Bảng chuẩn hóa nguyên âm về dạng không dấu thanh để trích xuất vần (rime)
const VOWEL_BASE_MAP = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ằ': 'ă', 'ắ': 'ă', 'ẳ': 'ă', 'ẵ': 'ă', 'ặ': 'ă',
    'ầ': 'â', 'ấ': 'â', 'ẩ': 'â', 'ẫ': 'â', 'ậ': 'â',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ề': 'ê', 'ế': 'ê', 'ể': 'ê', 'ễ': 'ê', 'ệ': 'ê',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ồ': 'ô', 'ố': 'ô', 'ổ': 'ô', 'ỗ': 'ô', 'ộ': 'ô',
    'ờ': 'ơ', 'ớ': 'ơ', 'ở': 'ơ', 'ỡ': 'ơ', 'ợ': 'ơ',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ừ': 'ư', 'ứ': 'ư', 'ử': 'ư', 'ữ': 'ư', 'ự': 'ư',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
};

/**
 * Chuẩn hóa Unicode sang dạng NFC và xóa ký tự lạ
 */
function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFC').trim();
}

/**
 * Nhận diện thanh điệu của một tiếng (syllable)
 * Trả về:
 * - toneType: 'B' (Bằng), 'T' (Trắc), hoặc 'unknown'
 * - toneName: 'ngang', 'huyen', 'sac', 'hoi', 'nga', 'nang'
 */
function getToneType(syllable) {
    if (!syllable) return { toneType: 'unknown', toneName: 'unknown' };

    const clean = normalizeText(syllable.toLowerCase()).replace(/[^a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, '');
    if (!clean) return { toneType: 'unknown', toneName: 'unknown' };

    let detectedTone = 0; // Mặc định là thanh ngang nếu không tìm thấy dấu khác
    let foundTone = false;

    for (const char of clean) {
        if (TONE_MAP[char] !== undefined) {
            const tone = TONE_MAP[char];
            if (tone > 0) {
                detectedTone = tone;
                foundTone = true;
                break; // Trong tiếng Việt chỉ có tối đa 1 dấu thanh cho 1 tiếng
            }
        }
    }

    const toneNames = ['ngang', 'huyen', 'sac', 'hoi', 'nga', 'nang'];
    const toneType = (detectedTone === 0 || detectedTone === 1) ? 'B' : 'T';

    return {
        toneType,
        toneName: toneNames[detectedTone],
        isFlat: detectedTone === 0 || detectedTone === 1,
        isHuyen: detectedTone === 1,
        isNgang: detectedTone === 0,
    };
}

/**
 * Tách một tiếng thành Âm đầu (Onset) và Phần Vần (Rime)
 * Ví dụ: "nguồn" -> onset: "ng", rime: "uon"
 */
function extractRime(syllable) {
    if (!syllable) return '';
    const clean = normalizeText(syllable.toLowerCase()).replace(/[^a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, '');
    if (!clean) return '';

    // Khử dấu thanh sang nguyên âm gốc không dấu
    let baseStr = '';
    for (const ch of clean) {
        baseStr += VOWEL_BASE_MAP[ch] || ch;
    }

    // Tìm vị trí nguyên âm đầu tiên
    const vowels = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y'];
    let firstVowelIdx = -1;

    for (let i = 0; i < baseStr.length; i++) {
        // Xử lý phụ âm ghép "gi", "qu"
        if (i === 0 && baseStr.startsWith('gi') && baseStr.length > 2 && vowels.includes(baseStr[2])) {
            continue;
        }
        if (i === 0 && baseStr.startsWith('qu') && baseStr.length > 2 && vowels.includes(baseStr[2])) {
            continue;
        }

        if (vowels.includes(baseStr[i])) {
            firstVowelIdx = i;
            break;
        }
    }

    if (firstVowelIdx === -1) return baseStr;
    return baseStr.slice(firstVowelIdx);
}

/**
 * Kiểm tra xem hai tiếng có hiệp vần với nhau không
 * Trả về { isRhyme: boolean, rhymeQuality: 'chinh' | 'thong' | 'ep' | 'none', reason: string }
 */
function checkWordRhyme(wordA, wordB) {
    if (!wordA || !wordB) {
        return { isRhyme: false, rhymeQuality: 'none', reason: 'Thiếu từ để so sánh vần' };
    }

    const rimeA = extractRime(wordA);
    const rimeB = extractRime(wordB);
    const toneA = getToneType(wordA);
    const toneB = getToneType(wordB);

    // Cả hai tiếng hiệp vần trong Lục Bát ở vị trí (6-6) hoặc (8-6) PHẢI cùng là vần BẰNG
    if (toneA.toneType !== 'B' || toneB.toneType !== 'B') {
        return {
            isRhyme: false,
            rhymeQuality: 'none',
            reason: `Vần phải cùng thanh Bằng, nhưng "${wordA}" (${toneA.toneType}) và "${wordB}" (${toneB.toneType}) không đồng thanh.`,
        };
    }

    // 1. Vần chính (hoàn toàn trùng phần vần, ví dụ: "nguồn" - "tuôn", "nhà" - "xa")
    if (rimeA === rimeB) {
        return {
            isRhyme: true,
            rhymeQuality: 'chinh',
            reason: `Vần chính chuẩn mực ("${rimeA}")`,
        };
    }

    // 2. Vần thông (gần vần theo quy ước thi pháp cổ truyền)
    // Các nhóm vần thông phổ biến:
    const RHYME_FAMILIES = [
        ['anh', 'xanh', 'cang', 'ang'],
        ['ông', 'ung', 'ong'],
        ['ôi', 'ơi', 'ui'],
        ['ưa', 'ơ', 'a'],
        ['âu', 'âu', 'au', 'ao'],
        ['uon', 'uong', 'on'],
        ['iên', 'yên', 'en', 'ên'],
        ['ai', 'ay'],
        ['e', 'e', 'ia', 'ie'],
    ];

    for (const fam of RHYME_FAMILIES) {
        const matchA = fam.some((f) => rimeA.endsWith(f));
        const matchB = fam.some((f) => rimeB.endsWith(f));
        if (matchA && matchB) {
            return {
                isRhyme: true,
                rhymeQuality: 'thong',
                reason: `Vần thông tương hợp ("${rimeA}" - "${rimeB}")`,
            };
        }
    }

    // 3. Nếu cùng âm chính hoặc âm cuối gần gũi (vần ép / cần xem xét)
    if (rimeA.length > 1 && rimeB.length > 1 && (rimeA[0] === rimeB[0] || rimeA[rimeA.length - 1] === rimeB[rimeB.length - 1])) {
        return {
            isRhyme: false,
            rhymeQuality: 'ep',
            reason: `Gần âm nhưng chưa chuẩn vần ("${rimeA}" với "${rimeB}"), cần xem xét lại.`,
        };
    }

    return {
        isRhyme: false,
        rhymeQuality: 'none',
        reason: `Hai từ không hiệp vần ("${rimeA}" khác biệt với "${rimeB}").`,
    };
}

/**
 * Tách bài thơ thành từng dòng và các tiếng
 */
function tokenizePoem(poemText) {
    if (!poemText) return [];

    const rawLines = poemText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    return rawLines.map((line, lineIndex) => {
        // Tách các từ/tiếng dựa trên khoảng trắng và loại bỏ dấu câu bao quanh
        const rawWords = line.split(/\s+/).filter(Boolean);
        const syllables = rawWords.map((word, wordIndex) => {
            const cleanWord = word.replace(/^[.,/#!$%^&*;:{}=\-_`~()"'“”‘’]+|[.,/#!$%^&*;:{}=\-_`~()"'“”‘’]+$/g, '');
            const toneInfo = getToneType(cleanWord);
            return {
                position: wordIndex + 1,
                raw: word,
                clean: cleanWord,
                toneType: toneInfo.toneType,
                toneName: toneInfo.toneName,
                isHuyen: toneInfo.isHuyen,
                isNgang: toneInfo.isNgang,
            };
        });

        return {
            lineIndex,
            rawText: line,
            syllableCount: syllables.length,
            syllables,
        };
    });
}

/**
 * Phân tích cấu trúc và luật Bằng - Trắc cho từng câu thơ Lục Bát
 */
function analyzeLinePattern(lineObj, expectedType = null) {
    const { lineIndex, syllableCount, syllables, rawText } = lineObj;

    // Suy luận kiểu câu: 6 chữ là Lục, 8 chữ là Bát
    let lineType = expectedType;
    if (!lineType) {
        if (syllableCount === 6) lineType = 'luc';
        else if (syllableCount === 8) lineType = 'bat';
        else lineType = syllableCount < 7 ? 'luc' : 'bat';
    }

    const expectedCount = lineType === 'luc' ? 6 : 8;
    const isValidStructure = syllableCount === expectedCount;

    const issues = [];
    if (!isValidStructure) {
        issues.push({
            type: 'structure',
            severity: 'error',
            message: `Câu ${lineType === 'luc' ? 'Lục' : 'Bát'} yêu cầu đúng ${expectedCount} tiếng, hiện có ${syllableCount} tiếng.`,
        });
    }

    // Quy tắc Bằng - Trắc chuẩn:
    // Câu Lục: 2(B) - 4(T) - 6(B)
    // Câu Bát: 2(B) - 4(T) - 6(B) - 8(B)
    const requiredTones = lineType === 'luc' 
        ? { 2: 'B', 4: 'T', 6: 'B' }
        : { 2: 'B', 4: 'T', 6: 'B', 8: 'B' };

    const tonePattern = [];

    syllables.forEach((s) => {
        const pos = s.position;
        const expected = requiredTones[pos] || null;
        let status = 'neutral'; // Không bắt buộc luật (1, 3, 5, 7)
        let issueMsg = null;

        if (expected) {
            if (s.toneType === expected) {
                status = 'valid';
            } else if (s.toneType === 'unknown') {
                status = 'uncertain';
                issueMsg = `Không xác định được thanh điệu của tiếng "${s.clean}".`;
            } else {
                status = 'invalid';
                issueMsg = `Tiếng thứ ${pos} ("${s.clean}") có thanh ${s.toneType === 'B' ? 'Bằng' : 'Trắc'} (${s.toneName}), quy tắc yêu cầu thanh ${expected === 'B' ? 'Bằng' : 'Trắc'}.`;
                issues.push({
                    type: 'tone',
                    severity: 'error',
                    position: pos,
                    word: s.clean,
                    actual: s.toneType,
                    expected,
                    message: issueMsg,
                });
            }
        }

        tonePattern.push({
            position: pos,
            word: s.clean,
            raw: s.raw,
            actualTone: s.toneType,
            toneName: s.toneName,
            expectedTone: expected,
            status,
            issueMsg,
        });
    });

    // Xét riêng câu Bát: Tiếng 6 và Tiếng 8 cùng Bằng, nhưng nên một tiếng Trầm (Huyền) và một tiếng Bổng (Ngang)
    if (lineType === 'bat' && syllableCount >= 8) {
        const s6 = syllables[5];
        const s8 = syllables[7];
        if (s6 && s8 && s6.toneType === 'B' && s8.toneType === 'B') {
            if (s6.toneName === s8.toneName) {
                issues.push({
                    type: 'pitch_warning',
                    severity: 'warning',
                    message: `Tiếng 6 ("${s6.clean}") và tiếng 8 ("${s8.clean}") cùng mang thanh ${s6.toneName}. Luật cổ truyền khuyên nên một tiếng Bổng (Ngang) và một tiếng Trầm (Huyền) để câu thơ trầm bổng hơn.`,
                });
            }
        }
    }

    return {
        lineIndex,
        rawText,
        lineType,
        syllableCount,
        isValidStructure,
        expectedCount,
        tonePattern,
        issues,
    };
}

/**
 * LucBatAnalyzer — Hàm phân tích toàn diện bài thơ Lục Bát
 */
function analyzeLucBatPoem(poemText) {
    if (!poemText || !poemText.trim()) {
        return {
            isValid: false,
            summary: {
                totalLines: 0,
                validLines: 0,
                structuralErrors: 0,
                toneErrors: 0,
                rhymeErrors: 0,
                toneScore: 0,
            },
            lines: [],
            couplets: [],
            rhymes: [],
            allIssues: ['Chưa nhập nội dung bài thơ.'],
        };
    }

    const tokenizedLines = tokenizePoem(poemText);
    const analyzedLines = [];
    const couplets = [];
    const rhymes = [];
    const allIssues = [];

    let totalToneChecks = 0;
    let passedToneChecks = 0;
    let structuralErrors = 0;
    let toneErrors = 0;
    let rhymeErrors = 0;

    // 1. Phân tích từng dòng
    tokenizedLines.forEach((line, idx) => {
        // Dự kiến xen kẽ: Dòng chẵn (0, 2, 4...) là Lục, dòng lẻ (1, 3, 5...) là Bát
        const expectedType = idx % 2 === 0 ? 'luc' : 'bat';
        const analyzed = analyzeLinePattern(line, expectedType);
        analyzedLines.push(analyzed);

        if (!analyzed.isValidStructure) {
            structuralErrors += 1;
        }

        analyzed.tonePattern.forEach((tp) => {
            if (tp.expectedTone) {
                totalToneChecks += 1;
                if (tp.status === 'valid') {
                    passedToneChecks += 1;
                } else if (tp.status === 'invalid') {
                    toneErrors += 1;
                }
            }
        });

        analyzed.issues.forEach((iss) => {
            allIssues.push(`Dòng ${idx + 1}: ${iss.message}`);
        });
    });

    // 2. Phân tích các cặp câu Lục Bát và Hiệp Vần
    for (let i = 0; i < analyzedLines.length; i += 2) {
        const lucLine = analyzedLines[i];
        const batLine = analyzedLines[i + 1] || null;

        const couplet = {
            coupletIndex: Math.floor(i / 2) + 1,
            luc: lucLine,
            bat: batLine,
            isCoupletComplete: !!batLine,
        };

        // Kiểm tra Vần Lưng (Yêu vận): Tiếng 6 câu Lục <-> Tiếng 6 câu Bát
        if (lucLine && batLine) {
            const word6Luc = lucLine.tonePattern[5]?.word;
            const word6Bat = batLine.tonePattern[5]?.word;

            if (word6Luc && word6Bat) {
                const rhymeCheck = checkWordRhyme(word6Luc, word6Bat);
                const rhymeObj = {
                    type: 'yeu_van',
                    name: 'Vần Lưng (Yêu vận)',
                    coupletIndex: couplet.coupletIndex,
                    from: { line: i + 1, pos: 6, word: word6Luc },
                    to: { line: i + 2, pos: 6, word: word6Bat },
                    isRhyme: rhymeCheck.isRhyme,
                    quality: rhymeCheck.rhymeQuality,
                    reason: rhymeCheck.reason,
                };
                rhymes.push(rhymeObj);

                if (!rhymeCheck.isRhyme) {
                    rhymeErrors += 1;
                    allIssues.push(`Cặp câu ${couplet.coupletIndex}: Lỗi vần lưng — "${word6Luc}" (câu 6) không hiệp vần với "${word6Bat}" (câu 8).`);
                }
            }

            // Kiểm tra Vần Chân (Cước vận) chuyển sang cặp tiếp theo:
            // Tiếng 8 câu Bát <-> Tiếng 6 câu Lục kế tiếp (nếu có)
            const nextLucLine = analyzedLines[i + 2];
            if (nextLucLine) {
                const word8Bat = batLine.tonePattern[7]?.word;
                const word6NextLuc = nextLucLine.tonePattern[5]?.word;

                if (word8Bat && word6NextLuc) {
                    const nextRhymeCheck = checkWordRhyme(word8Bat, word6NextLuc);
                    const cươcVanObj = {
                        type: 'cuoc_van',
                        name: 'Vần Chân (Cước vận)',
                        coupletIndex: couplet.coupletIndex,
                        from: { line: i + 2, pos: 8, word: word8Bat },
                        to: { line: i + 3, pos: 6, word: word6NextLuc },
                        isRhyme: nextRhymeCheck.isRhyme,
                        quality: nextRhymeCheck.rhymeQuality,
                        reason: nextRhymeCheck.reason,
                    };
                    rhymes.push(cươcVanObj);

                    if (!nextRhymeCheck.isRhyme) {
                        rhymeErrors += 1;
                        allIssues.push(`Nối khổ: Lỗi vần chân — "${word8Bat}" (tiếng 8 câu bát) không hiệp vần với "${word6NextLuc}" (tiếng 6 câu lục kế tiếp).`);
                    }
                }
            }
        }

        couplets.push(couplet);
    }

    // 3. Tính điểm Âm luật (Thang 40 điểm theo SRS)
    // Tỷ lệ âm luật đúng (tối đa 25 điểm) + Tỷ lệ cấu trúc dòng chuẩn (tối đa 15 điểm)
    let toneRatio = totalToneChecks > 0 ? passedToneChecks / totalToneChecks : 0;
    let structureRatio = analyzedLines.length > 0 ? (analyzedLines.length - structuralErrors) / analyzedLines.length : 0;
    structureRatio = Math.max(0, structureRatio);

    let toneScore = Math.round(toneRatio * 25 + structureRatio * 15);
    // Trừ điểm nếu có lỗi vần
    toneScore = Math.max(0, toneScore - rhymeErrors * 4);
    toneScore = Math.min(40, toneScore);

    return {
        isValid: structuralErrors === 0 && toneErrors === 0 && rhymeErrors === 0,
        summary: {
            totalLines: analyzedLines.length,
            validLines: analyzedLines.filter((l) => l.isValidStructure && l.issues.length === 0).length,
            structuralErrors,
            toneErrors,
            rhymeErrors,
            totalToneChecks,
            passedToneChecks,
            toneScore, // 0 - 40
        },
        lines: analyzedLines,
        couplets,
        rhymes,
        allIssues,
    };
}

module.exports = {
    getToneType,
    extractRime,
    checkWordRhyme,
    tokenizePoem,
    analyzeLinePattern,
    analyzeLucBatPoem,
};
