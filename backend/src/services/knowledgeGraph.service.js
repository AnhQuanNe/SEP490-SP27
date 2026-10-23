const Work = require('../models/Work');
const {
    CULTURAL_ARCHETYPES,
    PHILOSOPHIES,
    CULTURAL_REGIONS,
    ARCHETYPE_PHILOSOPHY_LINKS,
    ARCHETYPE_REGION_LINKS,
    CATEGORY_COLORS,
    buildCulturalTours,
    CULTURAL_ERAS,
} = require('../constants/knowledgeGraph.constants');

const ARCHETYPE_ERA_MAP = {
    'arc-trau-cau': 1,
    'arc-hat-gao-noi-com': 1,
    'arc-cay-tre-canh-truc': 1,
    'arc-song-nui-dia-linh': 1,
    'arc-con-co': 2,
    'arc-cay-da-ben-nuoc': 2,
    'arc-bau-bi-la-lanh': 2,
    'arc-chuoi-ba-huong-thai-son': 2,
    'arc-hoa-sen': 4,
    'arc-nguoi-linh-ve-quoc': 5,
};

const PHILOSOPHY_ERA_MAP = {
    'phil-hieu-thao': 1,
    'phil-biet-on': 1,
    'phil-yeu-nuoc': 1,
    'phil-kien-tri': 1,
    'phil-nhan-ai': 2,
    'phil-chinh-nghia': 2,
    'phil-ung-xu': 2,
    'phil-tri-thuc': 3,
};

const REGION_ERA_MAP = {
    'reg-bac-bo': 1,
    'reg-toan-quoc': 1,
    'reg-thang-long': 2,
    'reg-xu-nghe': 2,
    'reg-hue': 4,
    'reg-nam-bo': 4,
    'reg-viet-bac': 5,
};

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
     * Khởi tạo và sinh dữ liệu đồ thị tri thức từ cơ sở dữ liệu thực tế
     */
    async getGraphData() {
        // Lấy tất cả tác phẩm đã xuất bản
        const works = await Work.find({ status: 'published' })
            .select('title slug category categoryName period region author summary quote topic tags literalMeaning figurativeMeaning lesson')
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

        const addLink = (source, target, label, relation, strength = 1) => {
            // Đảm bảo cả source và target đều tồn tại
            if (nodeMap.has(source) && nodeMap.has(target) && source !== target) {
                links.push({
                    source,
                    target,
                    label,
                    relation,
                    strength,
                });
            }
        };

        // 1. Thêm các Node Cổ mẫu (Archetypes) có gắn bornEra
        CULTURAL_ARCHETYPES.forEach((arc) => {
            addNode({
                ...arc,
                bornEra: ARCHETYPE_ERA_MAP[arc.id] || 1,
            });
        });

        // 2. Thêm các Node Triết lý (Philosophies) có gắn bornEra
        PHILOSOPHIES.forEach((phil) => {
            addNode({
                ...phil,
                bornEra: PHILOSOPHY_ERA_MAP[phil.id] || 1,
            });
        });

        // 3. Thêm các Node Vùng miền (Regions) có gắn bornEra
        CULTURAL_REGIONS.forEach((reg) => {
            addNode({
                ...reg,
                bornEra: REGION_ERA_MAP[reg.id] || 1,
            });
        });

        // 4. Liên kết Cổ mẫu với Triết lý (Archetype <-> Philosophy)
        ARCHETYPE_PHILOSOPHY_LINKS.forEach((l) => {
            addLink(l.source, l.target, l.label, l.relation, l.strength);
        });

        // 5. Liên kết Cổ mẫu với Vùng miền (Archetype <-> Region)
        ARCHETYPE_REGION_LINKS.forEach((l) => {
            addLink(l.source, l.target, l.label, l.relation, l.strength);
        });

        // 6. Thêm các Node Tác phẩm & Phân tích liên kết tự động
        works.forEach((work) => {
            const workNodeId = `work-${work._id}`;
            const categoryColor = CATEGORY_COLORS[work.category] || '#10b981';
            const workEra = detectWorkEra(work);

            addNode({
                id: workNodeId,
                name: work.title,
                type: 'work',
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
                tags: work.tags || [],
            });

            const contentText = `${work.title} ${work.summary || ''} ${work.quote || ''} ${work.topic || ''} ${(work.tags || []).join(' ')} ${work.lesson || ''}`.toLowerCase();

            // A. Khớp tác phẩm với Cổ mẫu (Work -> Archetype)
            CULTURAL_ARCHETYPES.forEach((arc) => {
                const isMatched = arc.keywords.some((kw) => contentText.includes(kw.toLowerCase()));
                if (isMatched) {
                    addLink(workNodeId, arc.id, 'EMBODIES', `Khắc họa ${arc.name}`, 1.5);
                }
            });

            // B. Khớp tác phẩm với Triết lý (Work -> Philosophy)
            if (contentText.includes('hiếu') || contentText.includes('cha') || contentText.includes('mẹ') || contentText.includes('gia đình')) {
                addLink(workNodeId, 'phil-hieu-thao', 'TRANSMITS', 'Răn dạy đạo hiếu', 1.5);
            }
            if (contentText.includes('nhớ nguồn') || contentText.includes('trồng cây') || contentText.includes('biết ơn') || contentText.includes('tri ân') || contentText.includes('mồ hôi')) {
                addLink(workNodeId, 'phil-biet-on', 'TRANSMITS', 'Đạo lý uống nước nhớ nguồn', 1.5);
            }
            if (contentText.includes('thương thân') || contentText.includes('bầu ơi') || contentText.includes('lá lành') || contentText.includes('giá gương') || contentText.includes('nhân ái') || contentText.includes('đoàn kết')) {
                addLink(workNodeId, 'phil-nhan-ai', 'TRANSMITS', 'Tình đồng bào, tương thân tương ái', 1.5);
            }
            if (contentText.includes('yêu nước') || contentText.includes('nam quốc sơn hà') || contentText.includes('bình ngô') || contentText.includes('thánh gióng') || contentText.includes('vệ quốc') || contentText.includes('tây tiến') || contentText.includes('đồng chí') || contentText.includes('bác hồ')) {
                addLink(workNodeId, 'phil-yeu-nuoc', 'TRANSMITS', 'Hào khí yêu nước và tự hào dân tộc', 1.5);
            }
            if (contentText.includes('thạch sanh') || contentText.includes('công lý') || contentText.includes('chính nghĩa') || contentText.includes('ở hiền')) {
                addLink(workNodeId, 'phil-chinh-nghia', 'TRANSMITS', 'Ước vọng chính nghĩa thắng bạo tàn', 1.5);
            }
            if (contentText.includes('mài sắt') || contentText.includes('nên kim') || contentText.includes('kiên trì') || contentText.includes('nghị lực') || contentText.includes('sơn tinh')) {
                addLink(workNodeId, 'phil-kien-tri', 'TRANSMITS', 'Ý chí rèn luyện kiên định', 1.5);
            }
            if (contentText.includes('học thầy') || contentText.includes('học bạn') || contentText.includes('tri thức') || contentText.includes('học tập')) {
                addLink(workNodeId, 'phil-tri-thuc', 'TRANSMITS', 'Khát vọng học hỏi và tri thức', 1.5);
            }
            if (contentText.includes('lời nói') || contentText.includes('giao tiếp') || contentText.includes('gần mực') || contentText.includes('ứng xử')) {
                addLink(workNodeId, 'phil-ung-xu', 'TRANSMITS', 'Văn hóa đối nhân xử thế', 1.5);
            }

            // C. Khớp tác phẩm với Không gian văn hóa (Work -> Region)
            const regionLower = (work.region || '').toLowerCase();
            if (regionLower.includes('thăng long') || regionLower.includes('hà nội')) {
                addLink(workNodeId, 'reg-thang-long', 'ORIGINATES_FROM', 'Bản sắc Thăng Long - Hà Nội', 1.2);
            } else if (regionLower.includes('bắc bộ') || regionLower.includes('ba vì') || regionLower.includes('phú thọ') || regionLower.includes('hà nam')) {
                addLink(workNodeId, 'reg-bac-bo', 'ORIGINATES_FROM', 'Cái nôi văn hóa Bắc Bộ', 1.2);
            } else if (regionLower.includes('xứ nghệ') || regionLower.includes('đèo ngang') || regionLower.includes('nghệ an') || regionLower.includes('hà tĩnh') || regionLower.includes('quảng bình')) {
                addLink(workNodeId, 'reg-xu-nghe', 'ORIGINATES_FROM', 'Không gian xứ Lam Hồng - Đèo Ngang', 1.2);
            } else if (regionLower.includes('huế') || regionLower.includes('vĩ dạ')) {
                addLink(workNodeId, 'reg-hue', 'ORIGINATES_FROM', 'Không gian cố đô Huế thơ mộng', 1.2);
            } else if (regionLower.includes('nam bộ') || regionLower.includes('đồng tháp')) {
                addLink(workNodeId, 'reg-nam-bo', 'ORIGINATES_FROM', 'Văn hóa đồng bằng Nam Bộ', 1.2);
            } else if (regionLower.includes('tây bắc') || regionLower.includes('việt bắc')) {
                addLink(workNodeId, 'reg-viet-bac', 'ORIGINATES_FROM', 'Chiến khu Tây Bắc - Việt Bắc', 1.2);
            } else {
                addLink(workNodeId, 'reg-toan-quoc', 'ORIGINATES_FROM', 'Văn hóa dân gian lưu truyền toàn quốc', 1);
            }
        });

        // Tính toán Degree Centrality (Bậc liên kết của mỗi Node) để xác định độ trung tâm
        const degreeMap = {};
        links.forEach((link) => {
            degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
            degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
        });

        // Bổ sung degree vào node để làm kích thước hiển thị cân đối
        nodes.forEach((node) => {
            const degree = degreeMap[node.id] || 1;
            node.degree = degree;
            // Nếu là Archetype hoặc Philosophy, tăng kích thước dựa trên degree
            if (node.type === 'archetype') {
                node.val = Math.max(22, 16 + degree * 1.5);
            } else if (node.type === 'philosophy') {
                node.val = Math.max(20, 15 + degree * 1.4);
            } else if (node.type === 'region') {
                node.val = Math.max(18, 14 + degree * 1.2);
            } else {
                node.val = Math.max(12, 10 + degree * 0.8);
            }
        });

        const tours = buildCulturalTours(works);

        return {
            summary: {
                totalNodes: nodes.length,
                totalLinks: links.length,
                archetypesCount: CULTURAL_ARCHETYPES.length,
                philosophiesCount: PHILOSOPHIES.length,
                regionsCount: CULTURAL_REGIONS.length,
                worksCount: works.length,
                toursCount: tours.length,
                erasCount: CULTURAL_ERAS.length,
            },
            categories: [
                { id: 'archetype', label: 'Cổ mẫu & Biểu tượng Dân gian', color: '#f59e0b', count: CULTURAL_ARCHETYPES.length },
                { id: 'philosophy', label: 'Triết lý & Đạo lý Nhân sinh', color: '#ec4899', count: PHILOSOPHIES.length },
                { id: 'region', label: 'Không gian Văn hóa Địa linh', color: '#3b82f6', count: CULTURAL_REGIONS.length },
                { id: 'work', label: 'Tác phẩm Ca dao - Tục ngữ - Truyện', color: '#10b981', count: works.length },
            ],
            eras: CULTURAL_ERAS,
            tours,
            nodes,
            links,
        };
    }

    /**
     * Tìm đường đi ngắn nhất giữa 2 thực thể tri thức (Shortest Cultural Path Algorithm - BFS)
     * Thể hiện kỹ thuật thuật toán đồ thị nâng cao trong bài báo cáo đồ án
     */
    async getShortestPath(sourceId, targetId) {
        const { nodes, links } = await this.getGraphData();

        // Tạo danh sách kề (Adjacency List)
        const adj = {};
        nodes.forEach((n) => (adj[n.id] = []));
        links.forEach((l) => {
            adj[l.source]?.push({ neighbor: l.target, relation: l.relation });
            adj[l.target]?.push({ neighbor: l.source, relation: l.relation });
        });

        // Thuật toán BFS tìm đường đi ngắn nhất
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
                    parentMap[edge.neighbor] = { node: current, relation: edge.relation };
                    queue.push(edge.neighbor);
                }
            }
        }

        if (!found) {
            return { found: false, path: [], links: [] };
        }

        // Truy vết đường đi từ target về source
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
                sourceName: parentNode?.name,
                targetName: currNode?.name,
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
}

module.exports = new KnowledgeGraphService();
