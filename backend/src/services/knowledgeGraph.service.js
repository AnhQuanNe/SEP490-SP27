const Work = require('../models/Work');
const Location = require('../models/Location');
const {
    CATEGORY_COLORS,
    CULTURAL_ERAS,
} = require('../constants/knowledgeGraph.constants');
const { buildDynamicTours } = require('../constants/knowledgeGraphTours.constants');
const {
    findShortestPathBFS,
    calculateDegreeCentrality,
} = require('../utils/graphAlgorithms.util');
const knowledgeGraphAiService = require('./knowledgeGraphAi.service');

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

class KnowledgeGraphService {
    /**
     * Dựng đồ thị tri thức ĐỘNG 100% từ cơ sở dữ liệu MongoDB
     * Phân tách thành 4 tầng tri thức:
     * - Tầng 1: Triết lý & Đạo lý nhân sinh (Topic)
     * - Tầng 2: Cổ mẫu & Hình tượng biểu trưng (Tags)
     * - Tầng 3: Không gian văn hóa & Địa linh (Location)
     * - Tầng 4: Tác phẩm di sản (Work)
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
                type: 'philosophy',
                val: Math.min(32, 22 + count * 1.5),
                color: '#ec4899',
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

        const tagNodeIds = {};
        Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 60)
            .forEach(([tagName, count]) => {
                const tagId = `tag-${toSlug(tagName)}`;
                tagNodeIds[tagName] = tagId;
                addNode({
                    id: tagId,
                    name: `Hình tượng ${tagName}`,
                    rawTagName: tagName,
                    type: 'archetype',
                    val: Math.min(26, 18 + count * 1.2),
                    color: '#f59e0b',
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
                type: 'region',
                val: 18,
                color: '#3b82f6',
                icon: 'MapPin',
                summary: loc.description || `Địa danh lịch sử & không gian văn hóa: ${loc.name}`,
                details: `Vùng đất địa linh nhân kiệt, nơi khởi phát hoặc gắn liền với các truyền thuyết, ca dao và danh thắng Việt Nam.`,
                region: loc.region,
                coordinates: loc.coordinates,
                bornEra: 1,
                isDatabaseDerived: true,
            });
        });

        // -------------------------------------------------------------
        // TẦNG 4: TÁC PHẨM VĂN HỌC & CA DAO - TỤC NGỮ (Work Nodes từ DB)
        // -------------------------------------------------------------
        works.forEach((work) => {
            const workId = `work-${work._id}`;
            const detectedEra = detectWorkEra(work);
            addNode({
                id: workId,
                name: work.title,
                type: 'work',
                val: 10,
                color: CATEGORY_COLORS[work.category] || '#10b981',
                category: work.category,
                categoryName: work.categoryName,
                author: work.author || 'Dân gian truyền tụng',
                period: work.period || 'Lưu truyền dân gian',
                region: work.region || 'Toàn quốc',
                bornEra: detectedEra,
                summary: work.summary || work.literalMeaning || '',
                quote: work.quote || work.title,
                figurativeMeaning: work.figurativeMeaning,
                lesson: work.lesson,
                isDatabaseDerived: true,
            });

            // CẠNH 1: Tác phẩm ➔ Triết lý chủ đề (Work ➔ Philosophy)
            const topicName = (work.topic || 'Văn hóa & Đạo lý').trim();
            const topicNodeId = topicNodeIds[topicName];
            if (topicNodeId) {
                addLink(
                    workId,
                    topicNodeId,
                    'kết tinh tư tưởng',
                    'kết tinh tư tưởng',
                    `Tác phẩm "${work.title}" là minh chứng tiêu biểu kết tinh nên triết lý "${topicName}".`,
                    1.8
                );
            }

            // CẠNH 2: Tác phẩm ➔ Cổ mẫu / Hình tượng (Work ➔ Archetype)
            if (Array.isArray(work.tags)) {
                work.tags.forEach((rawTag) => {
                    const tag = rawTag.trim();
                    const tagNodeId = tagNodeIds[tag];
                    if (tagNodeId) {
                        addLink(
                            workId,
                            tagNodeId,
                            'khắc họa hình tượng',
                            'khắc họa hình tượng',
                            `Tác phẩm "${work.title}" sử dụng thi pháp dân gian để khắc họa sâu sắc hình tượng "${tag}".`,
                            1.2
                        );
                    }
                });
            }

            // CẠNH 3: Tác phẩm ➔ Không gian văn hóa / Địa linh (Work ➔ Region)
            if (Array.isArray(work.locationIds) && work.locationIds.length > 0) {
                work.locationIds.forEach((loc) => {
                    const locIdStr = loc._id ? loc._id.toString() : loc.toString();
                    const locNodeId = locationNodeIds[locIdStr];
                    if (locNodeId) {
                        addLink(
                            workId,
                            locNodeId,
                            'gắn liền vùng đất',
                            'gắn liền vùng đất',
                            `Tác phẩm "${work.title}" ra đời và gắn bó mật thiết với không gian địa linh "${loc.name || 'địa phương'}".`,
                            1.5
                        );
                    }
                });
            } else if (work.region && locations.length > 0) {
                // Heuristic kết nối theo vùng miền
                const workRegion = work.region.toLowerCase();
                const matchedLoc = locations.find((loc) => {
                    const locName = loc.name.toLowerCase();
                    const locSlug = (loc.slug || '').toLowerCase();
                    const locRegion = (loc.region || '').toLowerCase();

                    const geoKeywords = ['hà nội', 'thăng long', 'bắc ninh', 'kinh bắc', 'huế', 'sài gòn', 'đồng tháp', 'bến tre', 'hạ long', 'phú thọ', 'sơn tây'];
                    for (const kw of geoKeywords) {
                        if (workRegion.includes(kw) && (locName.includes(kw) || locSlug.includes(kw))) {
                            return true;
                        }
                    }

                    if ((workRegion.includes('bắc') || workRegion.includes('đồng bằng bắc')) && locRegion === 'bắc') return true;
                    if ((workRegion.includes('trung') || workRegion.includes('miền trung')) && locRegion === 'trung') return true;
                    if ((workRegion.includes('nam') || workRegion.includes('nam bộ') || workRegion.includes('sông nước')) && locRegion === 'nam') return true;
                    return false;
                });

                if (matchedLoc) {
                    const locNodeId = locationNodeIds[matchedLoc._id.toString()];
                    if (locNodeId) {
                        addLink(
                            workId,
                            locNodeId,
                            'âm vang phong thổ',
                            'âm vang phong thổ',
                            `Tác phẩm mang đậm sắc thái phong thổ và tâm thức văn hóa của vùng "${matchedLoc.name}".`,
                            1.0
                        );
                    }
                }
            }
        });

        // -------------------------------------------------------------
        // CẠNH LIÊN KẾT BẮC CẦU TẦNG CAO (Archetype ➔ Philosophy Bridges)
        // -------------------------------------------------------------
        Object.entries(tagToWorks).forEach(([tag, workNodeIdList]) => {
            const tagNodeId = tagNodeIds[tag];
            if (!tagNodeId) return;

            const associatedTopicCounts = {};
            workNodeIdList.forEach((wNodeId) => {
                const wId = wNodeId.replace('work-', '');
                const w = works.find((item) => item._id.toString() === wId);
                if (w && w.topic) {
                    associatedTopicCounts[w.topic] = (associatedTopicCounts[w.topic] || 0) + 1;
                }
            });

            Object.entries(associatedTopicCounts).forEach(([topic, freq]) => {
                const topicNodeId = topicNodeIds[topic];
                if (topicNodeId && freq >= 1) {
                    addLink(
                        tagNodeId,
                        topicNodeId,
                        'biểu trưng hóa',
                        'biểu trưng hóa',
                        `Hình tượng "${tag}" là cổ mẫu nghệ thuật biểu trưng hóa cho đạo lý "${topic}".`,
                        1.5
                    );
                }
            });
        });

        // CẠNH LIÊN KẾT GIỮA CÁC TÁC PHẨM CÙNG CỔ MẪU
        for (let i = 0; i < works.length; i++) {
            for (let j = i + 1; j < works.length; j++) {
                const w1 = works[i];
                const w2 = works[j];
                const tags1 = w1.tags || [];
                const tags2 = w2.tags || [];
                const sharedTags = tags1.filter((t) => tags2.includes(t));

                if (sharedTags.length >= 2) {
                    addLink(
                        `work-${w1._id}`,
                        `work-${w2._id}`,
                        'đồng điệu thi pháp',
                        'đồng điệu thi pháp',
                        `Cùng chia sẻ các cổ mẫu thi pháp dân gian: ${sharedTags.join(', ')}.`,
                        1.0
                    );
                }
            }
        }

        // CẠNH CẦU NỐI ĐẠI TƯ TƯỞNG GIỮA CÁC TRỤ CỘT TRIẾT LÝ
        const philosophyBridges = [
            {
                p1: 'yêu nước',
                p2: 'chính nghĩa',
                relation: 'đồng nguyên khí phách',
                desc: 'Lòng yêu nước kiên trung luôn song hành cùng khát vọng chính nghĩa và hòa bình non sông.',
            },
            {
                p1: 'tương thân',
                p2: 'gia đình',
                relation: 'nền tảng nhân sinh',
                desc: 'Tình cảm gia đình hiếu thảo là cái nôi nuôi dưỡng tinh thần nhân ái, đùm bọc cộng đồng.',
            },
            {
                p1: 'lao động',
                p2: 'thiên nhiên',
                relation: 'giao hòa sự sống',
                desc: 'Cần cù lao động sản xuất luôn gắn liền với tình yêu thiên nhiên và sự gắn bó với đất mẹ quê hương.',
            },
            {
                p1: 'trí tuệ',
                p2: 'đạo đức',
                relation: 'vẹn toàn nhân phẩm',
                desc: 'Trí tuệ dân gian là ngọn đuốc soi sáng, hoàn thiện phẩm hạnh và đạo lý làm người.',
            },
            {
                p1: 'gia đình',
                p2: 'yêu nước',
                relation: 'tình nhà nợ nước',
                desc: 'Từ tình yêu nếp nhà ấm êm bồi đắp và thăng hoa thành tình yêu quê hương, đất nước thiêng liêng.',
            },
            {
                p1: 'thiên nhiên',
                p2: 'yêu nước',
                relation: 'gấm vóc non sông',
                desc: 'Thiên nhiên tươi đẹp bồi tụ niềm tự hào về dải đất hình chữ S gấm vóc ngàn năm.',
            }
        ];

        philosophyBridges.forEach((bridge) => {
            const topic1Entry = Object.entries(topicNodeIds).find(([name]) => name.toLowerCase().includes(bridge.p1));
            const topic2Entry = Object.entries(topicNodeIds).find(([name]) => name.toLowerCase().includes(bridge.p2));
            if (topic1Entry && topic2Entry && topic1Entry[1] !== topic2Entry[1]) {
                addLink(
                    topic1Entry[1],
                    topic2Entry[1],
                    bridge.relation,
                    bridge.relation,
                    bridge.desc,
                    2.0
                );
            }
        });

        // Tính toán Degree Centrality & xác định Tứ Trụ Cốt Lõi qua thuật toán chuyên biệt
        const { majorHubs } = calculateDegreeCentrality(nodes, links, 4);

        // Xây dựng 4 kịch bản tham quan tiến hóa thi pháp chuẩn hóa học thuật
        const dynamicTours = buildDynamicTours(works, topicNodeIds, tagNodeIds);

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
     * Tìm đường đi ngắn nhất giữa 2 thực thể tri thức (BFS Graph Traversal)
     */
    async getShortestPath(sourceId, targetId) {
        const { nodes, links } = await this.getGraphData();
        return findShortestPathBFS(nodes, links, sourceId, targetId);
    }

    /**
     * AI Real 100%: Phân tích & Luận giải Mạch Ngầm Văn Hóa Nối Liền 2 Thực Thể (Gemini AI)
     */
    async explainPathWithAI(sourceId, targetId) {
        const pathResult = await this.getShortestPath(sourceId, targetId);
        return knowledgeGraphAiService.explainPathWithAI(pathResult);
    }

    /**
     * AI Real 100%: Luận giải chuyên sâu một thực thể tri thức đơn lẻ
     */
    async inspectNodeWithAI(nodeId) {
        const { nodes, links } = await this.getGraphData();
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (!targetNode) {
            return { success: false, message: 'Không tìm thấy thực thể trên đồ thị.' };
        }
        const neighborLinks = links.filter((l) => l.source === nodeId || l.target === nodeId);
        return knowledgeGraphAiService.inspectNodeWithAI(targetNode, neighborLinks, nodes);
    }

    /**
     * AI Real 100%: Tạo Tour Tiến Hóa Thi Pháp Tùy Chỉnh Bằng Gemini AI
     */
    async generateCustomEvolutionTour(keyword) {
        const { nodes } = await this.getGraphData();
        return knowledgeGraphAiService.generateCustomEvolutionTour(keyword, nodes);
    }
}

module.exports = new KnowledgeGraphService();
