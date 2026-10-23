const mongoose = require('mongoose');
const Work = require('../models/Work');
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

        // 1. Bản đồ khái niệm ngữ nghĩa & chủ đề văn hóa dân gian Việt Nam
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
                topic: 'Kinh nghiệm lao động - thời tiết',
                keywords: ['thời tiết', 'chuồn chuồn', 'mưa nắng', 'mùa màng', 'cày cấy', 'nông dân', 'nhà nông', 'sản xuất', 'kinh nghiệm'],
                description: 'Các câu ca dao, tục ngữ đúc kết tri thức dự báo thời tiết và kinh nghiệm canh tác nông nghiệp.',
            },
        ];

        // 2. Phát hiện ý định loại nội dung (ca dao hay tục ngữ)
        let preferredCategory = null;
        if (lowerQuery.includes('tục ngữ') && !lowerQuery.includes('ca dao')) {
            preferredCategory = 'tuc-ngu';
        } else if (lowerQuery.includes('ca dao') && !lowerQuery.includes('tục ngữ')) {
            preferredCategory = 'ca-dao';
        }

        // 3. Khớp các khái niệm ngữ nghĩa
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

        // 4. Lấy tất cả tác phẩm đã xuất bản để chấm điểm ngữ nghĩa
        const allPublished = await Work.find({ status: 'published' }).lean();

        // 5. Tính điểm ngữ nghĩa (Semantic Scoring)
        const scoredWorks = allPublished.map((item) => {
            let score = 0;
            const fullText = `${item.title} ${item.quote || ''} ${item.summary || ''} ${item.literalMeaning || ''} ${item.figurativeMeaning || ''} ${item.lesson || ''} ${item.thematicMeaning || ''} ${item.topic || ''} ${(item.tags || []).join(' ')}`.toLowerCase();

            // Khớp theo Topic đã nhận diện được
            if (matchedConcept && item.topic === matchedConcept.topic) {
                score += 50;
            }

            // Khớp category ưa thích (ví dụ người dùng nói rõ "tìm tục ngữ...")
            if (preferredCategory && item.category === preferredCategory) {
                score += 25;
            }

            // Khớp các từ khóa của concept
            if (matchedConcept) {
                for (const kw of matchedConcept.keywords) {
                    if (fullText.includes(kw)) {
                        score += 15;
                    }
                }
            }

            // Khớp trực tiếp các từ đơn có ý nghĩa trong query (bỏ từ dừng)
            const stopWords = ['tìm', 'các', 'câu', 'nói', 'về', 'cho', 'tôi', 'biết', 'những', 'của', 'là', 'được', 'có'];
            const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 1 && !stopWords.includes(t));

            for (const token of tokens) {
                if (fullText.includes(token)) {
                    score += 10;
                }
            }

            return {
                ...item,
                _semanticScore: score,
            };
        });

        // 6. Lọc và sắp xếp theo điểm ngữ nghĩa giảm dần
        const filtered = scoredWorks
            .filter((item) => item._semanticScore > 0)
            .sort((a, b) => b._semanticScore - a._semanticScore);

        const total = filtered.length;
        const skip = (Number(page) - 1) * Number(limit);
        const paginatedWorks = filtered.slice(skip, skip + Number(limit));

        return {
            works: paginatedWorks,
            semanticConcept: matchedConcept ? matchedConcept.topic : null,
            conceptDescription: matchedConcept ? matchedConcept.description : null,
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
