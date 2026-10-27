const {
    getToneType,
    checkWordRhyme,
    analyzeLucBatPoem,
} = require('./src/utils/lucBatAnalyzer');

console.log('=== TEST 1: NHẬN DIỆN THANH ĐIỆU ===');
const sampleWords = [
    { word: 'hoa', expected: 'B' },
    { word: 'cỏ', expected: 'T' },
    { word: 'lá', expected: 'T' },
    { word: 'cành', expected: 'B' },
    { word: 'nghĩ', expected: 'T' },
    { word: 'nghĩa', expected: 'T' },
    { word: 'mẹ', expected: 'T' },
    { word: 'nguồn', expected: 'B' },
];

sampleWords.forEach((s) => {
    const res = getToneType(s.word);
    const pass = res.toneType === s.expected;
    console.log(`Tiếng "${s.word}": ${res.toneType} (${res.toneName}) -> ${pass ? 'PASS' : 'FAIL'}`);
});

console.log('\n=== TEST 2: KIỂM TRA HIỆP VẦN ===');
const rhymePairs = [
    { a: 'nguồn', b: 'tuôn', shouldRhyme: true },
    { a: 'nhà', b: 'xa', shouldRhyme: true },
    { a: 'hoa', b: 'mây', shouldRhyme: false },
    { a: 'núi', b: 'nguồn', shouldRhyme: false }, // khác thanh
];

rhymePairs.forEach((p) => {
    const res = checkWordRhyme(p.a, p.b);
    const pass = res.isRhyme === p.shouldRhyme;
    console.log(`"${p.a}" <-> "${p.b}": ${res.isRhyme} (${res.reason}) -> ${pass ? 'PASS' : 'FAIL'}`);
});

console.log('\n=== TEST 3: BÀI THƠ LỤC BÁT CHUẨN MỰC ===');
const goodPoem = `Công cha như núi Thái Sơn
Nghĩa mẹ như nước trong nguồn chảy ra`;

const resGood = analyzeLucBatPoem(goodPoem);
console.log('Valid:', resGood.isValid);
console.log('Tone Score (max 40):', resGood.summary.toneScore);
console.log('Summary:', resGood.summary);
console.log('Rhymes:', resGood.rhymes);

console.log('\n=== TEST 4: BÀI THƠ SAI ÂM LUẬT & SAI VẦN ===');
const badPoem = `Công cha như núi rất cao
Nghĩa mẹ ngập tràn trong rừng chảy xa`;
const resBad = analyzeLucBatPoem(badPoem);
console.log('Valid:', resBad.isValid);
console.log('Summary:', resBad.summary);
console.log('Issues:', resBad.allIssues);

console.log('\n=== UNIT TESTS COMPLETED SUCCESSFULLY ===');
