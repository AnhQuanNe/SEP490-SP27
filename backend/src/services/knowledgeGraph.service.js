const Work = require('../models/Work');
const Location = require('../models/Location');
const {
    CATEGORY_COLORS,
    CULTURAL_ERAS,
} = require('../constants/knowledgeGraph.constants');
const { GEMINI_MODELS } = require('../constants/aiKnowledge.constants');

/**
 * Chuyển đổi chuỗi tiếng Việt thành slug an toàn cho ID đồ thị
 */
function toSlug(str) {
    if (!str) return 'unknown';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Dự đoán kỷ nguyên lịch sử cho tác phẩm dựa trên văn bản
 */
function detectWorkEra(work) {
    const text = `${work.title} ${work.period || ''} ${work.summary || ''} ${work.category || ''}`.toLowerCase();
    if (text.includes('1077') || text.includes('1428') || text.includes('nam quốc sơn hà') || text.includes('bình ngô') || text.includes('bạch đằng')) {
        return 3;
    }
    if (text.includes('hùng vương') || text.includes('sơn tinh') || text.includes('thủy tinh') || text.includes('thánh gióng') || text.includes('bánh chưng') || text.includes('trầu cau') || work.category === 'than-thoai' || work.category === 'truyen-thuyet') {
        return 1;
    }
    if (text.includes('1948') || text.includes('1969') || text.includes('chống mỹ') || text.includes('chống pháp') || text.includes('xe không kính') || text.includes('đồng chí') || text.includes('tây tiến') || text.includes('tiểu đội')) {
        return 5;
    }
    if (text.includes('kiều') || text.includes('nguyễn du') || text.includes('đèo ngang') || text.includes('thu điếu') || text.includes('vĩ dạ') || text.includes('tháp mười') || text.includes('đầu thế kỷ xix') || text.includes('cuối thế kỷ xix')) {
        return 4;
    }
    return 2;
}

/**
 * Gọi Gemini API với các model Flash miễn phí (Free Tier)
 */
async function callGeminiFree({ prompt, systemInstruction }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('[Gemini Knowledge Graph] GEMINI_API_KEY is not defined.');
        return null;
    }

    const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash',
        ...(GEMINI_MODELS || []),
    ];
    // Loại bỏ model trùng
    const uniqueModels = [...new Set(modelsToTry)];

    for (const model of uniqueModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: systemInstruction
                        ? { parts: [{ text: systemInstruction }] }
                        : undefined,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 3072, // Đảm bảo dư dả tokens cho cả thinking và toàn bộ bài thuyết minh trọn vẹn
                    },
                }),
                signal: AbortSignal.timeout(18000),
            });

            if (response.ok) {
                const data = await response.json();
                const candidate = data.candidates?.[0];
                const parts = candidate?.content?.parts || [];
                let fullText = parts.map((p) => p.text || '').join('').trim();

                // Loại bỏ bọc markdown code block nếu có
                fullText = fullText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

                if (fullText) {
                    const finishReason = candidate?.finishReason;
                    const endsWithPunctuation = /[.!?]["'”’]?\s*$/.test(fullText);

                    // Nếu câu văn bị ngắt giữa chừng do chạm trần token hoặc model dừng sớm
                    if (!endsWithPunctuation) {
                        // Tìm dấu chấm câu hoàn chỉnh cuối cùng (. ! ?)
                        const lastPunctIndex = Math.max(
                            fullText.lastIndexOf('.'),
                            fullText.lastIndexOf('!'),
                            fullText.lastIndexOf('?')
                        );

                        // Nếu phía trước đã có ít nhất 1-2 câu trọn vẹn (> 70 ký tự), cắt bỏ vế cụt ở đuôi
                        if (lastPunctIndex > 70) {
                            fullText = fullText.substring(0, lastPunctIndex + 1).trim();
                            return fullText;
                        }

                        // Nếu câu quá ngắn và bị cụt ngay câu đầu tiên (như "đã tìm thấy bến đ")
                        if (finishReason === 'MAX_TOKENS') {
                            console.warn(`[Gemini Knowledge Graph] Model ${model} output truncated at early sentence. Trying next model...`);
                            continue;
                        }

                        // Tự động khép lại bằng dấu chấm câu nếu nội dung đã tương đối hoàn chỉnh
                        fullText = fullText + '.';
                    }

                    return fullText;
                }
            }
        } catch (err) {
            console.warn(`[Gemini Knowledge Graph] Model ${model} failed:`, err.message);
        }
    }
    return null;
}

class KnowledgeGraphService {
    /**
     * Dựng đồ thị tri thức ĐỘNG 100% từ cơ sở dữ liệu MongoDB
     * Không hardcode, bám sát các trường: topic, tags, locationIds, category, summary, lesson
     */
    async getGraphData() {
        // 1. Truy vấn toàn bộ tác phẩm đã xuất bản (kèm thông tin địa danh liên kết)
        const works = await Work.find({ status: 'published' })
            .populate('locationIds', 'name slug region coordinates description')
            .select('title slug category categoryName period region author summary quote topic tags literalMeaning figurativeMeaning lesson locationIds')
            .lean();

        // 2. Truy vấn toàn bộ địa danh văn hóa đã xuất bản
        const locations = await Location.find({ status: 'published' })
            .select('name slug region coordinates description')
            .lean();

        const nodes = [];
        const links = [];
        const nodeMap = new Set();

        const addNode = (node) => {
            if (!nodeMap.has(node.id)) {
                nodeMap.add(node.id);
                nodes.push(node);
            }
        };

        const addLink = (source, target, label, relation, description = '', strength = 1) => {
            if (nodeMap.has(source) && nodeMap.has(target) && source !== target) {
                // Tránh tạo cạnh trùng lặp giữa 2 nốt
                const exists = links.some(
                    (l) => (l.source === source && l.target === target) || (l.source === target && l.target === source)
                );
                if (!exists) {
                    links.push({
                        source,
                        target,
                        label,
                        relation,
                        description: description || relation,
                        strength,
                    });
                }
            }
        };

        // -------------------------------------------------------------
        // TẦNG 1: CHỦ ĐỀ & TRIẾT LÝ NHÂN SINH (Topic Hub Nodes từ DB)
        // -------------------------------------------------------------
        const topicCounts = {};
        works.forEach((w) => {
            const top = (w.topic || 'Văn hóa & Đạo lý').trim();
            topicCounts[top] = (topicCounts[top] || 0) + 1;
        });

        const topicNodeIds = {};
        Object.entries(topicCounts).forEach(([topicName, count]) => {
            const topicId = `topic-${toSlug(topicName)}`;
            topicNodeIds[topicName] = topicId;
            addNode({
                id: topicId,
                name: topicName,
                type: 'philosophy', // Tầng 1: Triết lý nhân sinh
                val: Math.min(32, 22 + count * 1.5),
                color: '#ec4899', // Hồng tím đặc trưng
                icon: 'Heart',
                summary: `Chủ đề đạo đức & triết lý nhân sinh: "${topicName}". Kết tinh qua ${count} áng văn ca dao, tục ngữ truyền đời.`,
                details: `Giá trị tư tưởng cốt lõi được đúc kết qua hàng ngàn năm lịch sử, phản chiếu nhân sinh quan và đạo lý làm người của dân tộc Việt Nam.`,
                worksCount: count,
                bornEra: 1,
                isDatabaseDerived: true,
            });
        });

        // -------------------------------------------------------------
        // TẦNG 2: CỔ MẪU & HÌNH TƯỢNG BIỂU TRƯNG (Tag Nodes từ DB)
        // -------------------------------------------------------------
        const tagCounts = {};
        const tagToWorks = {};
        works.forEach((w) => {
            if (Array.isArray(w.tags)) {
                w.tags.forEach((rawTag) => {
                    const tag = rawTag.trim();
                    if (!tag) return;
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    if (!tagToWorks[tag]) tagToWorks[tag] = [];
                    tagToWorks[tag].push(`work-${w._id}`);
                });
            }
        });

        // Lọc các tag xuất hiện hoặc có giá trị biểu trưng cao để tạo nốt Cổ mẫu
        const tagNodeIds = {};
        Object.entries(tagCounts)
            // Lấy các tag có từ 1 tác phẩm trở lên (ưu tiên các tag phong phú)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30) // Giới hạn top 30 hình tượng để đồ thị không bị quá tải
            .forEach(([tagName, count]) => {
                const tagId = `tag-${toSlug(tagName)}`;
                tagNodeIds[tagName] = tagId;
                addNode({
                    id: tagId,
                    name: `Hình tượng ${tagName}`,
                    rawTagName: tagName,
                    type: 'archetype', // Tầng 2: Cổ mẫu văn hóa
                    val: Math.min(26, 18 + count * 1.2),
                    color: '#f59e0b', // Hổ phách/cam đặc trưng
                    icon: 'Sparkles',
                    summary: `Hình tượng nghệ thuật & cổ mẫu dân gian: "${tagName}". Xuất hiện trong ${count} tác phẩm và ngữ cảnh thi ca.`,
                    details: `Mẫu thức nghệ thuật ước lệ hóa tư tưởng dân gian thành các hình tượng gần gũi, thiêng liêng trong đời sống người Việt.`,
                    worksCount: count,
                    bornEra: 2,
                    isDatabaseDerived: true,
                });
            });

        // -------------------------------------------------------------
        // TẦNG 3: ĐỊA LINH VĂN HÓA & KHÔNG GIAN ĐỊA LÝ (Location Nodes từ DB)
        // -------------------------------------------------------------
        const locationNodeIds = {};
        locations.forEach((loc) => {
            const locId = `loc-${loc._id}`;
            locationNodeIds[loc._id.toString()] = locId;
            addNode({
                id: locId,
                name: loc.name,
                type: 'region', // Tầng 3: Địa linh văn hóa
                val: 22,
                color: '#3b82f6', // Xanh lam
                icon: 'Mountain',
                summary: loc.description || `Không gian văn hóa địa linh: ${loc.name} (${loc.region || 'Toàn quốc'}).`,
                details: `Vùng đất giàu truyền thống lịch sử, nuôi dưỡng mạch nguồn sáng tác và lưu truyền di sản qua bao thế hệ.`,
                region: loc.region || 'Toàn quốc',
                coordinates: loc.coordinates,
                bornEra: loc.region === 'Bắc' ? 1 : loc.region === 'Trung' ? 3 : 4,
                isDatabaseDerived: true,
            });
        });

        // -------------------------------------------------------------
        // TẦNG 4: TÁC PHẨM VĂN HỌC (Work Nodes từ DB) & CÁC CẠNH LIÊN KẾT
        // -------------------------------------------------------------
        works.forEach((work) => {
            const workNodeId = `work-${work._id}`;
            const categoryColor = CATEGORY_COLORS[work.category] || '#10b981';
            const workEra = detectWorkEra(work);

            // Thêm nốt Tác phẩm
            addNode({
                id: workNodeId,
                name: work.title,
                type: 'work', // Tầng 4: Tác phẩm
                category: work.category,
                categoryName: work.categoryName || work.category,
                slug: work.slug,
                val: 14,
                color: categoryColor,
                author: work.author || 'Dân gian',
                region: work.region || 'Toàn quốc',
                topic: work.topic || 'Văn hóa & Đạo lý',
                period: work.period || 'Văn học Dân gian',
                bornEra: workEra,
                summary: work.summary || '',
                quote: work.quote || '',
                lesson: work.lesson || '',
                figurativeMeaning: work.figurativeMeaning || '',
                literalMeaning: work.literalMeaning || '',
                tags: work.tags || [],
                isDatabaseDerived: true,
            });

            // A. Liên kết: Tác phẩm -> Nốt Chủ đề (Work -> Topic)
            const topic = (work.topic || 'Văn hóa & Đạo lý').trim();
            const topicNodeId = topicNodeIds[topic];
            if (topicNodeId) {
                addLink(
                    workNodeId,
                    topicNodeId,
                    'Thuộc chủ đề',
                    `Thuộc chủ đề đạo lý: ${topic}`,
                    `Tác phẩm "${work.title}" là minh chứng sâu sắc chuyển tải chủ đề đạo lý "${topic}".`,
                    2.2
                );
            }

            // B. Liên kết: Tác phẩm -> Nốt Cổ mẫu / Hình tượng (Work -> Tag)
            if (Array.isArray(work.tags)) {
                work.tags.forEach((tag) => {
                    const tagNodeId = tagNodeIds[tag.trim()];
                    if (tagNodeId) {
                        addLink(
                            workNodeId,
                            tagNodeId,
                            'Khắc họa hình tượng',
                            `Khắc họa hình tượng: ${tag}`,
                            `Tác phẩm "${work.title}" khai thác và làm sáng ngời hình tượng biểu trưng "${tag}".`,
                            1.8
                        );
                    }
                });
            }

            // C. Liên kết: Tác phẩm -> Địa danh văn hóa (Work -> Location)
            if (Array.isArray(work.locationIds) && work.locationIds.length > 0) {
                work.locationIds.forEach((loc) => {
                    const locObjId = loc._id ? loc._id.toString() : loc.toString();
                    const locNodeId = locationNodeIds[locObjId];
                    if (locNodeId) {
                        addLink(
                            workNodeId,
                            locNodeId,
                            'Gắn liền địa danh',
                            `Gắn liền với địa danh: ${loc.name || 'Địa phương'}`,
                            `Tác phẩm "${work.title}" bắt nguồn hoặc lưu truyền sâu rộng tại vùng đất "${loc.name || 'địa phương'}".`,
                            2.0
                        );
                    }
                });
            } else {
                // Nếu không có locationId cụ thể, khớp theo tên vùng miền (Bắc, Trung, Nam)
                const workRegion = (work.region || '').toLowerCase();
                const matchedLoc = locations.find((l) => {
                    const locName = l.name.toLowerCase();
                    return workRegion.includes(locName) || locName.includes(workRegion);
                });
                if (matchedLoc) {
                    const locNodeId = locationNodeIds[matchedLoc._id.toString()];
                    if (locNodeId) {
                        addLink(
                            workNodeId,
                            locNodeId,
                            'Gắn liền địa danh',
                            `Gắn liền với địa danh: ${matchedLoc.name}`,
                            `Tác phẩm "${work.title}" gắn bó với vùng không gian văn hóa "${matchedLoc.name}".`,
                            1.6
                        );
                    }
                }
            }
        });

        // -------------------------------------------------------------
        // D. LIÊN KẾT LIÊN VĂN BẢN (Intertextuality) & NỐI CHỦ ĐỀ VỚI HÌNH TƯỢNG
        // -------------------------------------------------------------
        // Nối Tag với Topic nếu tag đó xuất hiện nhiều trong các tác phẩm của Topic
        Object.entries(tagToWorks).forEach(([tagName, workIds]) => {
            const tagNodeId = tagNodeIds[tagName];
            if (!tagNodeId) return;

            // Đếm phân bổ topic cho tag này
            const topicFreq = {};
            workIds.forEach((wId) => {
                const rawId = wId.replace('work-', '');
                const w = works.find((item) => item._id.toString() === rawId);
                if (w && w.topic) {
                    topicFreq[w.topic] = (topicFreq[w.topic] || 0) + 1;
                }
            });

            Object.entries(topicFreq).forEach(([topName, freq]) => {
                const topicNodeId = topicNodeIds[topName];
                if (topicNodeId && freq >= 1) {
                    addLink(
                        tagNodeId,
                        topicNodeId,
                        'Biểu trưng cho',
                        `Biểu trưng cho chủ đề "${topName}"`,
                        `Hình tượng "${tagName}" thường được cha ông ta sử dụng làm ẩn dụ nghệ thuật chuyển tải giá trị "${topName}".`,
                        2.0
                    );
                }
            });
        });

        // Nối các tác phẩm có từ 2 tag chung trở lên (Đồng điệu tư tưởng & hình thức)
        for (let i = 0; i < works.length; i++) {
            for (let j = i + 1; j < works.length; j++) {
                const w1 = works[i];
                const w2 = works[j];
                const tags1 = new Set(w1.tags || []);
                const sharedTags = (w2.tags || []).filter((t) => tags1.has(t));

                if (sharedTags.length >= 2) {
                    addLink(
                        `work-${w1._id}`,
                        `work-${w2._id}`,
                        'Đồng điệu tư tưởng',
                        `Đồng điệu qua các hình tượng: ${sharedTags.join(', ')}`,
                        `"${w1.title}" và "${w2.title}" cùng chia sẻ các biểu tượng văn hóa: ${sharedTags.join(', ')}.`,
                        1.4
                    );
                }
            }
        }

        // Tính toán Degree Centrality để điều chỉnh kích thước nốt cân đối và xác định các Trụ cột cốt lõi
        const degreeMap = {};
        links.forEach((link) => {
            degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
            degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
        });

        // Xác định top Trụ cột Triết lý cốt lõi (Philosophy Pillars) có tầm ảnh hưởng lớn nhất
        const philosophyNodes = nodes.filter((n) => n.type === 'philosophy');
        philosophyNodes.sort((a, b) => {
            const degA = degreeMap[a.id] || 0;
            const degB = degreeMap[b.id] || 0;
            return degB - degA;
        });

        // Top 4 chủ đề triết lý quan trọng nhất được phong danh hiệu "Tứ Trụ Cốt Lõi" (Major Hubs)
        const topMajorHubIds = new Set(philosophyNodes.slice(0, 4).map((n) => n.id));

        nodes.forEach((node) => {
            const degree = degreeMap[node.id] || 1;
            node.degree = degree;

            if (topMajorHubIds.has(node.id)) {
                // Trụ cột văn hóa cốt lõi - Trọng tâm thị giác số 1 của đồ thị
                node.isMajorHub = true;
                node.isPillar = true;
                node.val = Math.max(38, 30 + degree * 1.5);
            } else if (node.type === 'philosophy') {
                node.val = Math.max(22, 18 + degree * 1.2);
            } else if (node.type === 'archetype') {
                node.val = Math.max(16, 13 + degree * 1.0);
            } else if (node.type === 'region') {
                node.val = Math.max(16, 13 + degree * 0.9);
            } else {
                // Tác phẩm lá non (Tầng 4) - Nhỏ gọn, tinh tế
                node.val = Math.max(8, 6 + degree * 0.5);
            }
        });

        // Danh sách các trụ cột di sản cốt lõi để người dùng mới dễ dàng tiếp cận
        const majorHubs = nodes
            .filter((n) => n.isMajorHub)
            .map((n) => ({
                id: n.id,
                name: n.name,
                type: n.type,
                color: n.color,
                degree: n.degree,
                summary: n.summary,
            }));

        // Xây dựng danh sách kịch bản tham quan động dựa trên dữ liệu thực tế
        const dynamicTours = this.buildDynamicToursFromDB(works, topicNodeIds, tagNodeIds);

        return {
            summary: {
                totalNodes: nodes.length,
                totalLinks: links.length,
                philosophiesCount: Object.keys(topicNodeIds).length,
                archetypesCount: Object.keys(tagNodeIds).length,
                regionsCount: locations.length,
                worksCount: works.length,
                erasCount: CULTURAL_ERAS.length,
            },
            majorHubs,
            categories: [
                { id: 'philosophy', label: 'Tầng 1: Triết Lý & Chủ Đề Đạo Đức', color: '#ec4899', count: Object.keys(topicNodeIds).length },
                { id: 'archetype', label: 'Tầng 2: Cổ Mẫu & Hình Tượng Dân Gian', color: '#f59e0b', count: Object.keys(tagNodeIds).length },
                { id: 'region', label: 'Tầng 3: Không Gian Văn Hóa & Địa Linh', color: '#3b82f6', count: locations.length },
                { id: 'work', label: 'Tầng 4: Tác Phẩm Ca Dao - Tục Ngữ - Truyện', color: '#10b981', count: works.length },
            ],
            eras: CULTURAL_ERAS,
            tours: dynamicTours,
            nodes,
            links,
        };
    }

    /**
     * Tự động sinh các tour du hành văn hóa dựa trên các chủ đề và tác phẩm thực tế trong DB
     */
    buildDynamicToursFromDB(works, topicNodeIds, tagNodeIds) {
        const tours = [];

        // 1. Tour về Đạo Hiếu & Tình Gia Đình (nếu có dữ liệu)
        const familyWorks = works.filter((w) => {
            const txt = `${w.title} ${w.topic || ''} ${w.quote || ''}`.toLowerCase();
            return txt.includes('hiếu') || txt.includes('cha') || txt.includes('mẹ') || txt.includes('gia đình');
        });
        if (familyWorks.length > 0) {
            const firstWork = familyWorks[0];
            const topicId = topicNodeIds[firstWork.topic] || Object.values(topicNodeIds)[0];
            tours.push({
                id: 'tour-dao-hieu-db',
                title: 'Mạch Nguồn Đạo Hiếu & Tình Thân Gia Đình',
                subtitle: `Khám phá qua ${familyWorks.length} tác phẩm ca dao tục ngữ thực tế`,
                badge: 'Di sản chọn lọc',
                icon: 'Heart',
                themeColor: '#ec4899',
                duration: 'khoảng 2 phút',
                description: 'Hành trình dẫn dắt từ hình tượng biểu trưng người mẹ, người cha đến rường cột chữ Hiếu trong tâm hồn người Việt.',
                stops: [
                    {
                        nodeId: `work-${firstWork._id}`,
                        phase: 'Tác phẩm tiêu biểu',
                        title: firstWork.title,
                        role: 'Tác phẩm di sản truyền đời',
                        story: firstWork.summary || firstWork.lesson || 'Lời răn dạy sâu sắc về tình nghĩa sinh thành.',
                        quote: firstWork.quote || firstWork.title,
                        insight: firstWork.lesson || 'Chữ hiếu là cội nguồn của nhân cách và đạo đức.',
                        voiceNarration: `Mở đầu chuyến hành trình, chúng ta cùng lắng đọng trước tác phẩm ${firstWork.title}. ${firstWork.quote ? `Dân gian có câu: ${firstWork.quote}.` : ''} ${firstWork.summary || ''}`,
                    },
                    {
                        nodeId: topicId,
                        phase: 'Đúc kết Triết lý',
                        title: 'Chủ Đề & Đạo Lý Nhân Sinh',
                        role: 'Hệ giá trị cốt lõi',
                        story: 'Tình cảm gia đình và đạo hiếu phụng dưỡng cha mẹ là nền móng vững chắc nhất của văn hóa Việt Nam.',
                        quote: 'Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn chảy ra',
                        insight: 'Đạo hiếu kết nối các thế hệ trong dòng chảy văn hóa bất tận.',
                        voiceNarration: 'Từ tác phẩm truyền đời, mạch nguồn tri thức đưa ta tới giá trị cốt lõi: Tình nghĩa gia đình và đạo hiếu muôn đời bền vững.',
                    },
                ],
            });
        }

        // 2. Tour về Lòng Yêu Nước & Ý Chí Bất Khuất
        const patriotWorks = works.filter((w) => {
            const txt = `${w.title} ${w.topic || ''} ${w.quote || ''}`.toLowerCase();
            return txt.includes('yêu nước') || txt.includes('nam quốc') || txt.includes('bình ngô') || txt.includes('thánh gióng');
        });
        if (patriotWorks.length > 0) {
            const pWork = patriotWorks[0];
            tours.push({
                id: 'tour-yeu-nuoc-db',
                title: 'Hào Khí Non Sông & Ý Chí Độc Lập',
                subtitle: `Khám phá các áng hùng văn và truyền thuyết vệ quốc`,
                badge: 'Hào hùng & Bất khuất',
                icon: 'Sparkles',
                themeColor: '#f59e0b',
                duration: 'khoảng 2 phút',
                description: 'Từ truyền thuyết chống ngoại xâm đến bản tuyên ngôn chủ quyền bờ cõi thiêng liêng.',
                stops: [
                    {
                        nodeId: `work-${pWork._id}`,
                        phase: 'Dấu ấn Hùng văn',
                        title: pWork.title,
                        role: 'Tác phẩm vệ quốc',
                        story: pWork.summary || 'Khẳng định độc lập chủ quyền thiêng liêng của dân tộc.',
                        quote: pWork.quote || pWork.title,
                        insight: 'Ý chí độc lập là mạch nguồn mạnh mẽ nhất của lịch sử ngàn năm dựng nước.',
                        voiceNarration: `Chào mừng bạn đến với dấu ấn vệ quốc vĩ đại của dân tộc qua tác phẩm ${pWork.title}. ${pWork.summary || ''}`,
                    },
                ],
            });
        }

        return tours;
    }

    /**
     * Tìm đường đi ngắn nhất giữa 2 thực thể tri thức (BFS)
     */
    async getShortestPath(sourceId, targetId) {
        const { nodes, links } = await this.getGraphData();

        // Tạo danh sách kề
        const adj = {};
        nodes.forEach((n) => (adj[n.id] = []));
        links.forEach((l) => {
            adj[l.source]?.push({ neighbor: l.target, relation: l.relation, label: l.label, description: l.description });
            adj[l.target]?.push({ neighbor: l.source, relation: l.relation, label: l.label, description: l.description });
        });

        // BFS
        const queue = [sourceId];
        const visited = new Set([sourceId]);
        const parentMap = {};

        let found = false;
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === targetId) {
                found = true;
                break;
            }

            for (const edge of adj[current] || []) {
                if (!visited.has(edge.neighbor)) {
                    visited.add(edge.neighbor);
                    parentMap[edge.neighbor] = {
                        node: current,
                        relation: edge.relation,
                        label: edge.label,
                        description: edge.description,
                    };
                    queue.push(edge.neighbor);
                }
            }
        }

        if (!found) {
            return { found: false, path: [], links: [] };
        }

        // Truy vết đường đi
        const pathNodes = [];
        const pathLinks = [];
        let curr = targetId;

        while (curr !== sourceId) {
            const p = parentMap[curr];
            const currNode = nodes.find((n) => n.id === curr);
            const parentNode = nodes.find((n) => n.id === p.node);
            pathNodes.unshift(currNode);
            pathLinks.unshift({
                source: p.node,
                target: curr,
                relation: p.relation,
                label: p.label,
                description: p.description,
                sourceName: parentNode?.name,
                sourceType: parentNode?.type,
                sourceSummary: parentNode?.summary || parentNode?.details || '',
                targetName: currNode?.name,
                targetType: currNode?.type,
                targetSummary: currNode?.summary || currNode?.details || '',
                targetLesson: currNode?.lesson || '',
            });
            curr = p.node;
        }
        pathNodes.unshift(nodes.find((n) => n.id === sourceId));

        return {
            found: true,
            length: pathNodes.length - 1,
            path: pathNodes,
            links: pathLinks,
        };
    }

    /**
     * TÍNH NĂNG AI REAL 100%: Phân tích & Luận giải Mạch Ngầm Văn Hóa Nối Liền 2 Thực Thể (Real-time Gemini AI)
     * Giải thích rõ vì sao từ Node A đến được Node B, hai bên có sợi dây liên kết gì và qua những mắt xích nào
     */
    async explainPathWithAI(sourceId, targetId) {
        const pathResult = await this.getShortestPath(sourceId, targetId);
        if (!pathResult.found || pathResult.path.length < 2) {
            return {
                ...pathResult,
                aiAnalysis: 'Không tìm thấy đường đi kết nối giữa hai thực thể này trên đồ thị tri thức.',
            };
        }

        const sourceNode = pathResult.path[0];
        const targetNode = pathResult.path[pathResult.path.length - 1];
        const sourceName = sourceNode?.name;
        const targetName = targetNode?.name;

        const typeLabels = {
            philosophy: 'Triết lý & Đạo lý nhân sinh',
            archetype: 'Cổ mẫu & Hình tượng biểu trưng',
            region: 'Không gian văn hóa & Địa linh',
            work: 'Tác phẩm di sản văn học',
        };

        const intermediateNodes = pathResult.path.slice(1, -1);
        const intermediateNames = intermediateNodes.map((n) => `"${n.name}"`).join(' ➔ ');

        // Xây dựng lộ trình các chặng tuần tự kèm ngữ cảnh phong phú
        const stepDescriptions = pathResult.links
            .map((l, i) => {
                const sType = typeLabels[l.sourceType] || l.sourceType || 'Thực thể';
                const tType = typeLabels[l.targetType] || l.targetType || 'Thực thể';
                let desc = `Chặng ${i + 1}: Từ "${l.sourceName}" (${sType}) bước sang "${l.targetName}" (${tType}) qua mối liên kết: "${l.label || l.relation}". Lý do liên kết: ${l.description || l.relation}.`;
                if (l.targetSummary) {
                    desc += ` [Ý nghĩa nốt đến: ${l.targetSummary}]`;
                }
                return desc;
            })
            .join('\n');

        const prompt = `Bạn là VietHeritage AI — Nhà nghiên cứu văn hóa dân gian và thi pháp học Việt Nam uyên bác.
Đồ thị tri thức VietHeritage vừa tìm thấy một mạch nguồn văn hóa kết nối từ "${sourceName}" đến "${targetName}" trải qua ${pathResult.length} chặng di sản.

Dữ liệu hành trình:
- Điểm khởi đầu (Node A): "${sourceName}" [${typeLabels[sourceNode?.type] || 'Thực thể'}]
  + Tóm lược: ${sourceNode?.summary || sourceNode?.details || 'Cội nguồn văn hóa'}
- Điểm đích đến (Node B): "${targetName}" [${typeLabels[targetNode?.type] || 'Thực thể'}]
  + Tóm lược: ${targetNode?.summary || targetNode?.details || 'Điểm kết tinh di sản'}
${intermediateNames ? `- Các mắt xích trung gian kết nối: ${intermediateNames}` : '- Mối liên kết trực tiếp giữa hai thực thể.'}

Lộ trình chi tiết từng chặng trên đồ thị:
${stepDescriptions}

MỤC TIÊU & NHIỆM VỤ CỦA BẠN:
Người dùng bấm nghe thuyết minh để hiểu VÌ SAO từ "${sourceName}" lại đến được "${targetName}", và HAI CÁI NÀY CÓ LIÊN KẾT GÌ VỚI NHAU.
Hãy sáng tác một lời thuyết minh truyền cảm hứng, sâu sắc và gãy gọn (đoạn văn liền mạch khoảng 4 đến 5 câu, độ dài khoảng 130 - 190 từ) với nội dung bắt buộc:
1. SỢI DÂY LIÊN KẾT CỐT LÕI: Nêu rõ sợi dây tư tưởng/nghệ thuật chung kết nối giữa "${sourceName}" và "${targetName}". Giải thích vì sao hai thực thể này dù khác biệt về thời gian hay thể loại nhưng lại có quan hệ kế thừa và gắn kết hữu cơ trong kho tàng văn hóa dân tộc.
2. LÝ GIẢI CÁC MẮT XÍCH CHUYỂN TIẾP: Giải thích rõ ràng vì sao từ "${sourceName}" lại bắc cầu qua ${intermediateNames ? `các mắt xích trung gian (${intermediateNames})` : 'mối liên kết này'} để dẫn tới "${targetName}". Chỉ ra tính logic văn hóa giữa các nốt kề nhau (ví dụ: từ triết lý đạo đức chuyển hóa thành hình tượng nghệ thuật dân gian, từ hình tượng nghệ thuật được khắc họa vào các áng văn thơ...).
3. SỰ THĂNG HOA TẠI ĐÍCH ĐẾN: Khẳng định khi chạm tới "${targetName}", mạch nguồn tư tưởng khởi nguyên đã kết tinh, thăng hoa thành giá trị nhân sinh hay biểu tượng bất tử nào.

YÊU CẦU ĐỊNH DẠNG ĐỂ GIỌNG ĐỌC AI PHÁT ÂM HOÀN HẢO:
- Viết thành MỘT ĐOẠN VĂN HOÀN CHỈNH DUY NHẤT. TUYỆT ĐỐI KHÔNG dùng gạch đầu dòng, KHÔNG đánh số thứ tự (1, 2, 3), KHÔNG đưa lời chào hay câu mở màn rườm rà.
- Ngôn từ trang nhã, giàu nhạc tính, câu văn có nhịp điệu uyển chuyển với các từ nối tự nhiên để khi đọc thành tiếng qua giọng đọc AI (Text-to-Speech) người nghe cảm thấy lôi cuốn, dễ hiểu và tâm đắc.`;

        const systemInstruction = `Bạn là trợ lý học thuật VietHeritage AI chuyên sâu về thi pháp học và văn hóa Việt Nam. Nhiệm vụ của bạn là giải thích sáng rõ, chuẩn xác và truyền cảm lý do kết nối logic giữa các thực thể văn hóa trên đồ thị tri thức, giúp người dùng hiểu sâu sắc căn nguyên và mối liên hệ giữa các di sản.`;

        const aiResponse = await callGeminiFree({ prompt, systemInstruction });

        // Fallback thông minh tự động ghép lộ trình nếu không có internet hoặc API key bận
        const fallbackSteps = pathResult.links
            .map((l, i) => `ở chặng ${i + 1}, từ "${l.sourceName}" chuyển tiếp đến "${l.targetName}" vì ${l.description || l.relation}`)
            .join('; ');
        const fallbackText = pathResult.length === 1
            ? `Hành trình văn hóa kết nối trực tiếp từ "${sourceName}" đến "${targetName}" qua quan hệ "${pathResult.links[0]?.description || pathResult.links[0]?.relation}", minh chứng cho sự gắn kết tự nhiên giữa tư tưởng và nghệ thuật trong di sản Việt Nam.`
            : `Hành trình từ "${sourceName}" đến "${targetName}" là mạch nguồn văn hóa xuyên suốt qua ${pathResult.length} chặng di sản: ${fallbackSteps}. Qua đó, giá trị tư tưởng từ khởi nguyên được bồi tụ, kế thừa và thăng hoa thành biểu tượng thiêng liêng ở điểm đích "${targetName}".`;

        return {
            ...pathResult,
            aiAnalysis: aiResponse || fallbackText,
            isAiGenerated: !!aiResponse,
        };
    }

    /**
     * TÍNH NĂNG AI REAL 100%: Luận giải chuyên sâu một thực thể tri thức đơn lẻ
     */
    async inspectNodeWithAI(nodeId) {
        const { nodes, links } = await this.getGraphData();
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (!targetNode) {
            return { success: false, message: 'Không tìm thấy thực thể trên đồ thị.' };
        }

        // Lấy các thực thể lân cận
        const neighborLinks = links.filter((l) => l.source === nodeId || l.target === nodeId);
        const neighborNames = neighborLinks.map((l) => {
            const otherId = l.source === nodeId ? l.target : l.source;
            const otherNode = nodes.find((n) => n.id === otherId);
            return `${otherNode?.name} (${l.relation})`;
        });

        const prompt = `Bạn là chuyên gia thi pháp học và văn hóa dân gian Việt Nam của VietHeritage.
Hãy phân tích CHUYÊN SÂU RIÊNG BIỆT cho thực thể văn hóa sau:
- Tên thực thể: "${targetNode.name}"
- Phân loại tầng tri thức: "${targetNode.type}"
- Tóm tắt ý nghĩa: ${targetNode.summary || targetNode.details || ''}
- Bài học / Đạo lý: ${targetNode.lesson || ''}
- Các thực thể liên kết xung quanh: ${neighborNames.join('; ') || 'Không có'}

Yêu cầu phân tích:
1. Hãy tập trung luận giải chính xác vào ý nghĩa biểu tượng, thi pháp nghệ thuật hoặc giá trị nhân sinh của RIÊNG thực thể "${targetNode.name}". Nếu đây là một hình tượng nghệ thuật / cổ mẫu dân gian (như Tiếng đàn thần, Niêu cơm, Con cò, Cây tre...), hãy nêu bật sức mạnh biểu tượng văn hóa đặc sắc của chính hình tượng đó.
2. Viết từ 3 đến 4 câu, sâu sắc, súc tích, văn phong học thuật truyền cảm. Tuyệt đối không chào hỏi rườm rà.`;

        const aiText = await callGeminiFree({
            prompt,
            systemInstruction: 'Bạn là chuyên gia thi pháp học và văn hóa dân gian Việt Nam.',
        });

        return {
            success: true,
            node: targetNode,
            aiInsight: aiText || targetNode.summary || 'Thực thể văn hóa tiêu biểu của dân tộc Việt Nam.',
            isAiGenerated: !!aiText,
        };
    }
}

module.exports = new KnowledgeGraphService();
