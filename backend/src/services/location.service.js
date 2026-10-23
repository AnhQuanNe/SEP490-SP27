const mongoose = require('mongoose');
const Location = require('../models/Location');
const Work = require('../models/Work');

class LocationService {
    /**
     * Lấy danh sách địa phương văn hóa công khai kèm số lượng tác phẩm
     * Hỗ trợ lọc theo thể loại (category) và vùng miền (region)
     */
    async getLocations({ category = 'all', region = '' } = {}) {
        const locationQuery = { status: 'published' };
        if (region && region !== 'all') {
            locationQuery.region = region;
        }

        const locations = await Location.find(locationQuery).sort({ name: 1 }).lean();

        // Xây dựng điều kiện lọc tác phẩm
        const workMatch = { status: 'published' };
        if (category && category !== 'all') {
            if (category === 'ca-dao') {
                workMatch.category = 'ca-dao';
            } else if (category === 'tuc-ngu') {
                workMatch.category = 'tuc-ngu';
            } else if (category === 'dan-gian') {
                workMatch.category = { $in: ['than-thoai', 'truyen-thuyet', 'co-tich', 'ca-dao', 'tuc-ngu'] };
            } else {
                workMatch.category = category;
            }
        }

        // Đếm số lượng tác phẩm cho từng địa phương bằng aggregation để tránh N+1 query
        const workCounts = await Work.aggregate([
            { $match: workMatch },
            { $unwind: '$locationIds' },
            {
                $group: {
                    _id: '$locationIds',
                    count: { $sum: 1 },
                },
            },
        ]);

        const countMap = {};
        workCounts.forEach((item) => {
            countMap[item._id.toString()] = item.count;
        });

        // Ghép số lượng tác phẩm vào dữ liệu địa phương
        const result = locations.map((loc) => ({
            ...loc,
            worksCount: countMap[loc._id.toString()] || 0,
        }));

        return result;
    }

    /**
     * Lấy chi tiết một địa phương theo ID hoặc slug
     */
    async getLocationByIdOrSlug(idOrSlug) {
        const isObjectId = mongoose.isValidObjectId(idOrSlug);
        const query = isObjectId
            ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }], status: 'published' }
            : { slug: idOrSlug, status: 'published' };

        const location = await Location.findOne(query).lean();
        if (!location) return null;

        // Đếm tổng số tác phẩm công khai
        const worksCount = await Work.countDocuments({
            locationIds: location._id,
            status: 'published',
        });

        return {
            ...location,
            worksCount,
        };
    }

    /**
     * Lấy danh sách các tác phẩm công khai thuộc một địa phương
     * Hỗ trợ lọc theo thể loại và phân trang
     */
    async getLocationWorks(idOrSlug, { category = 'all', page = 1, limit = 10 } = {}) {
        const location = await this.getLocationByIdOrSlug(idOrSlug);
        if (!location) {
            return null;
        }

        const workQuery = {
            locationIds: location._id,
            status: 'published',
        };

        if (category && category !== 'all') {
            if (category === 'ca-dao') {
                workQuery.category = 'ca-dao';
            } else if (category === 'tuc-ngu') {
                workQuery.category = 'tuc-ngu';
            } else if (category === 'dan-gian') {
                workQuery.category = { $in: ['than-thoai', 'truyen-thuyet', 'co-tich', 'ca-dao', 'tuc-ngu'] };
            } else {
                workQuery.category = category;
            }
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [works, total] = await Promise.all([
            Work.find(workQuery)
                .select('title slug category categoryName quote summary author period region thematicMeaning source viewsCount likesCount locationRelations')
                .sort({ isFeatured: -1, viewsCount: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Work.countDocuments(workQuery),
        ]);

        // Gắn thông tin mối liên hệ địa lý (origin, associated, circulation, unknown) tương ứng với địa phương này
        const mappedWorks = works.map((w) => {
            const rel = (w.locationRelations || []).find(
                (r) => r.locationId && r.locationId.toString() === location._id.toString()
            );
            return {
                ...w,
                relationType: rel ? rel.relationType : 'unknown',
                relationNotes: rel ? rel.notes : '',
            };
        });

        return {
            location,
            works: mappedWorks,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1,
            },
        };
    }

    /**
     * Lấy toàn bộ dữ liệu phục vụ bản đồ tương tác (tọa độ markers + danh sách tác phẩm tiêu biểu)
     */
    async getMapWorks({ category = 'all', region = '' } = {}) {
        const locations = await this.getLocations({ category, region });

        // Lấy danh sách ID các địa phương
        const locationIds = locations.map((loc) => loc._id);

        const workMatch = {
            locationIds: { $in: locationIds },
            status: 'published',
        };

        if (category && category !== 'all') {
            if (category === 'ca-dao') {
                workMatch.category = 'ca-dao';
            } else if (category === 'tuc-ngu') {
                workMatch.category = 'tuc-ngu';
            } else if (category === 'dan-gian') {
                workMatch.category = { $in: ['than-thoai', 'truyen-thuyet', 'co-tich', 'ca-dao', 'tuc-ngu'] };
            } else {
                workMatch.category = category;
            }
        }

        // Lấy trước 3 tác phẩm tiêu biểu cho mỗi địa phương để preview nhanh
        const works = await Work.find(workMatch)
            .select('title slug category categoryName quote summary author source locationIds locationRelations')
            .sort({ isFeatured: -1, viewsCount: -1 })
            .lean();

        // Gom tác phẩm vào từng địa phương
        const worksByLocation = {};
        works.forEach((w) => {
            (w.locationIds || []).forEach((locId) => {
                const strId = locId.toString();
                if (!worksByLocation[strId]) {
                    worksByLocation[strId] = [];
                }
                const rel = (w.locationRelations || []).find(
                    (r) => r.locationId && r.locationId.toString() === strId
                );
                worksByLocation[strId].push({
                    _id: w._id,
                    title: w.title,
                    slug: w.slug,
                    category: w.category,
                    categoryName: w.categoryName,
                    quote: w.quote,
                    summary: w.summary,
                    author: w.author,
                    source: w.source,
                    relationType: rel ? rel.relationType : 'unknown',
                    relationNotes: rel ? rel.notes : '',
                });
            });
        });

        // Kết hợp dữ liệu
        const markers = locations.map((loc) => {
            const sampleWorks = (worksByLocation[loc._id.toString()] || []).slice(0, 5);
            return {
                ...loc,
                sampleWorks,
                totalWorks: loc.worksCount,
            };
        });

        return {
            category,
            totalLocations: locations.length,
            markers,
        };
    }

    // ===================================
    // ADMIN MANAGEMENT METHODS
    // ===================================

    async createLocation(data) {
        const slug =
            data.slug ||
            data.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

        const existing = await Location.findOne({ slug });
        if (existing) {
            throw new Error(`Địa phương với slug "${slug}" đã tồn tại!`);
        }

        const location = await Location.create({
            ...data,
            slug,
        });
        return location;
    }

    async updateLocation(id, data) {
        const location = await Location.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!location) {
            throw new Error('Không tìm thấy địa phương cần cập nhật');
        }
        return location;
    }

    async deleteLocation(id) {
        const location = await Location.findById(id);
        if (!location) {
            throw new Error('Không tìm thấy địa phương');
        }

        // Bỏ liên kết ở các tác phẩm liên quan
        await Work.updateMany(
            { locationIds: location._id },
            {
                $pull: {
                    locationIds: location._id,
                    locationRelations: { locationId: location._id },
                },
            }
        );

        await Location.findByIdAndDelete(id);
        return { message: 'Đã xóa địa phương thành công và cập nhật liên kết' };
    }
}

module.exports = new LocationService();
