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
     * Xem chi tiết tác phẩm theo slug hoặc id (UC08 View Content Details)
     */
    async getWorkBySlug(slug) {
        const work = await Work.findOne({ slug, status: 'published' });
        if (work) {
            work.viewsCount += 1;
            await work.save();
        }
        return work;
    }
}

module.exports = new LiteratureService();
