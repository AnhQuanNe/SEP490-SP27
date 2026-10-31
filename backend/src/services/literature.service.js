const mongoose = require('mongoose');
const Work = require('../models/Work');
require('../models/Location');
const { buildVietnameseRegex } = require('../utils/vietnamese.utils');

class LiteratureService {
    /**
     * Lấy danh sách tác phẩm nổi bật (Featured Works) cho trang chủ (UC06)
     */
    async getFeaturedWorks(limit = 6) {
        return await Work.find({
            status: 'published',
            isFeatured: true,
        })
            .sort({ viewsCount: -1, createdAt: -1 })
            .limit(Number(limit))
            .lean();
    }

    /**
     * Lấy danh mục văn học kèm số lượng tác phẩm thực tế trong DB
     */
    async getCategories() {
        const defaultCategories = [
            { id: 'all', label: 'Tất cả tư liệu' },
            { id: 'dan-gian', label: 'Văn học dân gian' },
            { id: 'than-thoai', label: 'Thần thoại & Cổ tích' },
            { id: 'ca-dao', label: 'Ca dao - Tục ngữ' },
            { id: 'trung-dai', label: 'Văn học Trung đại' },
            { id: 'hien-dai', label: 'Văn học Hiện đại' },
        ];

        // Đếm số lượng tác phẩm trong từng thể loại
        const counts = await Work.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        const countMap = {};
        let totalCount = 0;
        counts.forEach((item) => {
            countMap[item._id] = item.count;
            totalCount += item.count;
        });

        return defaultCategories.map((cat) => {
            let count = 0;
            if (cat.id === 'all') {
                count = totalCount;
            } else if (cat.id === 'dan-gian') {
                count = (countMap['than-thoai'] || 0) + (countMap['truyen-thuyet'] || 0) + (countMap['co-tich'] || 0) + (countMap['ca-dao'] || 0) + (countMap['tuc-ngu'] || 0);
            } else if (cat.id === 'than-thoai') {
                count = (countMap['than-thoai'] || 0) + (countMap['co-tich'] || 0) + (countMap['truyen-thuyet'] || 0);
            } else if (cat.id === 'ca-dao') {
                count = (countMap['ca-dao'] || 0) + (countMap['tuc-ngu'] || 0);
            } else {
                count = countMap[cat.id] || 0;
            }
            return {
                ...cat,
                count,
            };
        });
    }

    /**
     * Lấy danh sách từ khóa gợi ý phổ biến (Popular Tags)
     */
    async getPopularTags(limit = 8) {
        const works = await Work.find({ status: 'published' }).select('tags').lean();
        const tagCount = {};
        works.forEach((w) => {
            (w.tags || []).forEach((t) => {
                tagCount[t] = (tagCount[t] || 0) + 1;
            });
        });

        const sortedTags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
        if (sortedTags.length > 0) {
            return sortedTags.slice(0, limit);
        }

        return [
            'Thánh Gióng',
            'Thạch Sanh',
            'Truyện Kiều',
            'Nam quốc sơn hà',
            'Sự tích Trầu Cau',
            'Ca dao sông Hồng',
            'Bình Ngô đại cáo',
        ];
    }

    /**
     * Tìm kiếm và duyệt tác phẩm văn học (UC06 Browse & UC07 Search Folk Literature)
     * Hỗ trợ tìm kiếm thông minh tiếng Việt (cả có dấu và không dấu)
     */
    async searchWorks({ query = '', category = 'all', region = '', page = 1, limit = 12 }) {
        const filter = { status: 'published' };

        // Lọc theo Category nếu có
        if (category && category !== 'all') {
            if (category === 'dan-gian') {
                filter.category = { $in: ['than-thoai', 'truyen-thuyet', 'co-tich', 'ca-dao', 'tuc-ngu'] };
            } else if (category === 'than-thoai') {
                filter.category = { $in: ['than-thoai', 'truyen-thuyet', 'co-tich'] };
            } else if (category === 'ca-dao') {
                filter.category = { $in: ['ca-dao', 'tuc-ngu'] };
            } else {
                filter.category = category;
            }
        }

        // Lọc theo Vùng miền
        if (region) {
            filter.region = new RegExp(region, 'i');
        }

        // Tìm kiếm theo từ khóa thông minh (hỗ trợ cả gõ có dấu lẫn không dấu)
        if (query && query.trim() !== '') {
            const viRegex = buildVietnameseRegex(query);
            const rawRegex = new RegExp(query.trim(), 'i');
            const slugRegex = new RegExp(query.trim().toLowerCase().replace(/\s+/g, '-'), 'i');

            const searchOr = [
                { title: viRegex || rawRegex },
                { summary: viRegex || rawRegex },
                { quote: viRegex || rawRegex },
                { content: viRegex || rawRegex },
                { tags: viRegex || rawRegex },
                { author: viRegex || rawRegex },
                { region: viRegex || rawRegex },
                { slug: slugRegex },
            ];

            filter.$or = searchOr;
        }

        const skip = (Number(page) - 1) * Number(limit);
        let [works, total] = await Promise.all([
            Work.find(filter)
                .sort({ isFeatured: -1, viewsCount: -1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Work.countDocuments(filter),
        ]);

        // Fallback thông minh: Nếu người dùng tìm kiếm từ khóa mà trong danh mục hiện tại không có,
        // thử tìm trên toàn bộ hệ thống để không bao giờ bỏ sót tác phẩm của người dùng
        if (works.length === 0 && query && query.trim() !== '' && category && category !== 'all') {
            const fallbackFilter = { status: 'published' };
            const viRegex = buildVietnameseRegex(query);
            const rawRegex = new RegExp(query.trim(), 'i');
            const slugRegex = new RegExp(query.trim().toLowerCase().replace(/\s+/g, '-'), 'i');

            fallbackFilter.$or = [
                { title: viRegex || rawRegex },
                { summary: viRegex || rawRegex },
                { quote: viRegex || rawRegex },
                { content: viRegex || rawRegex },
                { tags: viRegex || rawRegex },
                { author: viRegex || rawRegex },
                { region: viRegex || rawRegex },
                { slug: slugRegex },
            ];

            const [fallbackWorks, fallbackTotal] = await Promise.all([
                Work.find(fallbackFilter)
                    .sort({ isFeatured: -1, viewsCount: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                Work.countDocuments(fallbackFilter),
            ]);

            if (fallbackWorks.length > 0) {
                works = fallbackWorks;
                total = fallbackTotal;
            }
        }

        return {
            works,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)) || 1,
            },
        };
    }

    /**
     * Tìm kiếm theo ý nghĩa bằng ngôn ngữ tự nhiên (UC09 Semantic Search)
     * Cho phép diễn đạt nhu cầu bằng văn nói (ví dụ: "Tìm tục ngữ nói về lòng biết ơn những người đã giúp đỡ mình")
     */
    async semanticSearch({ query = '', page = 1, limit = 10, userId = null }) {
        if (!query || query.trim() === '') {
            return {
                works: [],
                semanticConcept: null,
                pagination: { total: 0, page: 1, limit, totalPages: 1 },
                message: 'Vui lòng nhập nội dung hoặc ý nghĩa cần tìm kiếm',
            };
        }

        const trimmedQuery = query.trim();
        const lowerQuery = trimmedQuery.toLowerCase();

        // 1. Lấy tất cả tác phẩm đã xuất bản
        const allPublished = await Work.find({ status: 'published' }).lean();

        let filtered = [];
        let searchMethod = 'heuristic_concept_fallback';
        let matchedConceptTopic = null;
        let conceptDescription = null;

        // 2. ƯU TIÊN 1: REAL AI VECTOR EMBEDDING (Google gemini-embedding + Cosine Similarity)
        try {
            const { getEmbedding, cosineSimilarity } = require('./embedding.service');
            const queryVector = await getEmbedding(trimmedQuery, 768);

            if (queryVector && Array.isArray(queryVector) && queryVector.length === 768) {
                const worksWithEmbedding = allPublished.filter(
                    (w) => Array.isArray(w.embedding) && w.embedding.length === 768
                );

                if (worksWithEmbedding.length > 0) {
                    searchMethod = 'real_ai_vector_embedding';

                    // Tính điểm tương đồng Cosine Similarity cho từng tác phẩm
                    const scoredWorks = worksWithEmbedding.map((item) => {
                        const sim = cosineSimilarity(queryVector, item.embedding);
                        // Chuyển Cosine Similarity sang thang điểm phần trăm 0 - 100
                        const scorePercent = Math.min(99, Math.max(10, Math.round(sim * 100)));

                        return {
                            ...item,
                            _semanticScore: scorePercent,
                            _rawSimilarity: sim,
                        };
                    });

                    // Sắp xếp theo độ tương đồng giảm dần
                    scoredWorks.sort((a, b) => b._semanticScore - a._semanticScore);

                    // Ngưỡng lọc thông minh (Adaptive Semantic Thresholding):
                    // 1. Sàn tuyệt đối 60%: Độ tương đồng nền (Noise floor) của văn bản tiếng Việt ngẫu nhiên rơi vào khoảng 50-55%.
                    // 2. Tỷ lệ tương đối 88%: Chỉ giữ lại các tác phẩm đạt ít nhất 88% điểm so với tác phẩm đầu bảng.
                    // 3. Giới hạn Top-6 tinh hoa: Loại bỏ hoàn toàn các tác phẩm loãng/nhiễu ở phần đuôi.
                    const maxScore = scoredWorks[0]._semanticScore;
                    const ABSOLUTE_FLOOR = 60;
                    const RELATIVE_RATIO = 0.88;
                    const dynamicThreshold = Math.max(ABSOLUTE_FLOOR, Math.round(maxScore * RELATIVE_RATIO));

                    filtered = scoredWorks
                        .filter((item) => item._semanticScore >= dynamicThreshold)
                        .slice(0, 6);

                    if (filtered.length > 0) {
                        matchedConceptTopic = filtered[0].topic || 'Triết lý & Đạo lý Dân gian';
                        conceptDescription = `Tìm kiếm bằng Mô hình Vector Embedding (Google Text Embedding 768D & Cosine Similarity) • Phân tích ngữ nghĩa ẩn dụ tự nhiên`;
                    }
                }
            }
        } catch (embedErr) {
            console.warn('[SemanticSearch] Lỗi gọi Embedding Service, tự động fallback sang Heuristic:', embedErr.message);
        }

        // 3. ƯU TIÊN 2 (FALLBACK): Nếu chưa có vector hoặc gặp sự cố API, chạy Heuristic Concept Matching
        if (searchMethod !== 'real_ai_vector_embedding' || filtered.length === 0) {
            const CONCEPT_MAP = [
                {
                    topic: 'Lòng biết ơn',
                    keywords: ['biết ơn', 'nhớ ơn', 'tri ân', 'đền ơn', 'giúp đỡ', 'cội nguồn', 'uống nước', 'ăn quả', 'ơn nghĩa'],
                    description: 'Các câu ca dao, tục ngữ răn dạy lòng biết ơn, tri ân người giúp đỡ và cội nguồn cha ông.',
                },
                {
                    topic: 'Tình cảm gia đình',
                    keywords: ['cha mẹ', 'công cha', 'nghĩa mẹ', 'sinh thành', 'dưỡng dục', 'hiếu thảo', 'chữ hiếu', 'đạo con', 'con cái', 'gia đình', 'ông bà'],
                    description: 'Các câu ca dao, tục ngữ ca ngợi công ơn trời biển của cha mẹ và bổn phận hiếu kính của con cái.',
                },
                {
                    topic: 'Đoàn kết - Nhân ái',
                    keywords: ['đoàn kết', 'thương nhau', 'bầu bí', 'lá lành', 'lá rách', 'đùm bọc', 'chia sẻ', 'tương thân', 'tương ái', 'đồng bào', 'nhiễu điều', 'giá gương'],
                    description: 'Các câu ca dao, tục ngữ tôn vinh tình đồng bào, sự sẻ chia và tinh thần tương thân tương ái.',
                },
                {
                    topic: 'Ý chí - Nghị lực',
                    keywords: ['ý chí', 'nghị lực', 'kiên trì', 'bền bỉ', 'mài sắt', 'nên kim', 'vượt khó', 'quyết tâm', 'thành công', 'gian nan'],
                    description: 'Các câu ca dao, tục ngữ đúc kết về lòng kiên định, sự nhẫn nại vượt khó để thành công.',
                },
                {
                    topic: 'Học tập - Tri thức',
                    keywords: ['học tập', 'thầy cô', 'bạn bè', 'tri thức', 'học hỏi', 'cầu tiến', 'sách vở', 'học thầy', 'học bạn'],
                    description: 'Các câu ca dao, tục ngữ về tinh thần cầu tiến, học hỏi từ thầy cô và bè bạn.',
                },
                {
                    topic: 'Yêu nước - Chủ quyền - Tuyên ngôn độc lập',
                    keywords: ['tuyên ngôn', 'độc lập', 'chủ quyền', 'yêu nước', 'sông núi', 'sơn hà', 'đất nước', 'đầu tiên', 'sông cầu', 'như nguyệt', 'lý thường kiệt', 'bình ngô', 'thánh gióng', 'giặc', 'xâm lăng', 'nam quốc', 'cứu nước', 'bảo vệ', 'tổ quốc'],
                    description: 'Các tác phẩm kiệt tác khẳng định chủ quyền lãnh thổ thiêng liêng, bản tuyên ngôn độc lập và ý chí quật cường chống ngoại xâm của dân tộc.',
                },
                {
                    topic: 'Tình yêu đôi lứa - Thủy chung',
                    keywords: ['tình yêu', 'đôi lứa', 'thủy chung', 'son sắt', 'trầu cau', 'vợ chồng', 'nguyện ước', 'duyên phận', 'thương nhau'],
                    description: 'Các câu ca dao, tích truyện ca ngợi tình yêu trong sáng, sự gắn bó thủy chung son sắt và nghĩa vợ chồng.',
                },
                {
                    topic: 'Nhân đạo & Đạo lý làm người',
                    keywords: ['nhân đạo', 'truyện kiều', 'thúy kiều', 'nguyễn du', 'chính nghĩa', 'lẽ phải', 'đạo lý', 'làm người', 'công lý'],
                    description: 'Các tác phẩm mang giá trị nhân đạo sâu sắc, ngợi ca nhân phẩm con người và khát vọng công lý tự do.',
                },
                {
                    topic: 'Kinh nghiệm lao động - thời tiết',
                    keywords: ['thời tiết', 'chuồn chuồn', 'mưa nắng', 'mùa màng', 'cày cấy', 'nông dân', 'nhà nông', 'sản xuất', 'kinh nghiệm'],
                    description: 'Các câu ca dao, tục ngữ đúc kết tri thức dự báo thời tiết và kinh nghiệm canh tác nông nghiệp.',
                },
            ];

            let preferredCategory = null;
            if (lowerQuery.includes('tục ngữ') && !lowerQuery.includes('ca dao')) {
                preferredCategory = 'tuc-ngu';
            } else if (lowerQuery.includes('ca dao') && !lowerQuery.includes('tục ngữ')) {
                preferredCategory = 'ca-dao';
            }

            let matchedConcept = null;
            let maxMatches = 0;

            for (const concept of CONCEPT_MAP) {
                let matches = 0;
                for (const kw of concept.keywords) {
                    if (lowerQuery.includes(kw)) {
                        matches += 1;
                    }
                }
                if (matches > maxMatches) {
                    maxMatches = matches;
                    matchedConcept = concept;
                }
            }

            const scoredWorks = allPublished.map((item) => {
                let score = 0;
                const fullText = `${item.title} ${item.quote || ''} ${item.summary || ''} ${item.literalMeaning || ''} ${item.figurativeMeaning || ''} ${item.lesson || ''} ${item.thematicMeaning || ''} ${item.topic || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
                let hasConceptMatch = false;

                if (matchedConcept && item.topic === matchedConcept.topic) {
                    score += 80;
                    hasConceptMatch = true;
                }

                if (preferredCategory && item.category === preferredCategory) {
                    score += 30;
                }

                if (matchedConcept) {
                    for (const kw of matchedConcept.keywords) {
                        if (fullText.includes(kw)) {
                            score += 20;
                            hasConceptMatch = true;
                        }
                    }
                }

                const stopWords = ['tìm', 'các', 'câu', 'nói', 'về', 'cho', 'tôi', 'biết', 'những', 'của', 'là', 'được', 'có', 'phải', 'với', 'trong'];
                const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 1 && !stopWords.includes(t));

                for (const token of tokens) {
                    if (fullText.includes(token)) {
                        score += 15;
                    }
                }

                if (matchedConcept && !hasConceptMatch) {
                    score = 0;
                }

                return {
                    ...item,
                    _semanticScore: score,
                };
            });

            const candidates = scoredWorks.filter((item) => item._semanticScore > 0);
            const maxScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c._semanticScore)) : 0;
            const minThreshold = Math.max(60, Math.floor(maxScore * 0.45));

            filtered = candidates
                .filter((item) => item._semanticScore >= minThreshold)
                .sort((a, b) => b._semanticScore - a._semanticScore);

            matchedConceptTopic = matchedConcept ? matchedConcept.topic : null;
            conceptDescription = matchedConcept ? matchedConcept.description : null;
        }

        const total = filtered.length;
        const skip = (Number(page) - 1) * Number(limit);
        const paginatedWorks = filtered.slice(skip, skip + Number(limit));

        // 4. Lọc bỏ mảng vector embedding lớn trước khi trả về client để tiết kiệm băng thông
        const sanitizedWorks = paginatedWorks.map((work) => {
            const { embedding, ...safeWork } = work;
            return safeWork;
        });

        // 5. Tạo phân tích & lời khuyên của AI (AI Insight) cho tác phẩm tiêu biểu nhất
        let aiInsight = null;
        if (sanitizedWorks.length > 0) {
            try {
                const aiService = require('./ai.service');
                aiInsight = await aiService.generateSemanticInsight({
                    query: trimmedQuery,
                    topWork: sanitizedWorks[0],
                    matchedConcept: { topic: matchedConceptTopic, description: conceptDescription },
                });
            } catch (aiErr) {
                console.warn('[SemanticSearch] Lỗi tạo AI Insight:', aiErr.message);
            }
        }

        return {
            works: sanitizedWorks,
            semanticConcept: matchedConceptTopic,
            conceptDescription,
            searchMethod,
            aiInsight,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)) || 1,
            },
        };
    }

    /**
     * Gợi ý nội dung liên quan (UC11 Explore Related Content)
     */
    async getRelatedWorks(workIdOrSlug, limit = 4) {
        const currentWork = await Work.findOne({
            $or: [{ slug: workIdOrSlug }, ...(mongoose.isValidObjectId(workIdOrSlug) ? [{ _id: workIdOrSlug }] : [])],
            status: 'published',
        }).lean();

        if (!currentWork) return [];

        // Tìm các tác phẩm cùng chủ đề hoặc cùng thể loại hoặc chung tags
        const related = await Work.find({
            _id: { $ne: currentWork._id },
            status: 'published',
            $or: [
                { topic: currentWork.topic },
                { category: currentWork.category },
                { tags: { $in: currentWork.tags || [] } },
            ],
        })
            .sort({ viewsCount: -1, createdAt: -1 })
            .limit(Number(limit))
            .lean();

        return related;
    }

    /**
     * Xem chi tiết tác phẩm theo slug hoặc id (UC08 View Content Details)
     */
    async getWorkBySlug(slug) {
        const isObjectId = mongoose.isValidObjectId(slug);
        const query = isObjectId ? { $or: [{ slug }, { _id: slug }] } : { slug };
        const work = await Work.findOne({ ...query, status: 'published' })
            .populate('locationIds', 'name slug region coordinates')
            .populate('locationRelations.locationId', 'name slug region coordinates');
        if (work) {
            work.viewsCount += 1;
            await work.save();
        }
        return work;
    }
}

module.exports = new LiteratureService();
