require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Location = require('../models/Location');
const Work = require('../models/Work');

const sampleLocations = [
    {
        name: 'Hà Nội (Kinh Kỳ Thăng Long)',
        slug: 'ha-noi-thang-long',
        region: 'Bắc',
        coordinates: {
            lat: 21.0285,
            lng: 105.8542,
        },
        description: 'Trung tâm văn hóa, chính trị ngàn năm văn hiến của Việt Nam. Nơi hội tụ các truyền thuyết khai sáng, thần thoại trị thủy bên dòng sông Hồng, đền Sóc Sơn và biểu tượng rùa vàng Hồ Gươm.',
        historicalContext: 'Từ định đô Thăng Long năm 1010 thời Lý đến nay, Hà Nội là cái nôi lắng đọng thi ca dân gian, ca dao kinh kỳ tao nhã và truyền thuyết lập quốc.',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        sources: 'Địa chí Thăng Long — Hà Nội, Viện Hàn lâm Khoa học Xã hội Việt Nam & NXB Hà Nội.',
        status: 'published',
    },
    {
        name: 'Phú Thọ (Đất Tổ Hùng Vương & Phong Châu)',
        slug: 'phu-tho-dat-to',
        region: 'Bắc',
        coordinates: {
            lat: 21.3912,
            lng: 105.3235,
        },
        description: 'Vùng đất cội nguồn của dân tộc Việt Nam, thủ phủ Phong Châu thời đại các vua Hùng dựng nước Văn Lang. Nơi phát tích các truyền thuyết khai nguyên và tín ngưỡng thờ cúng Tổ tiên.',
        historicalContext: 'Quần thể Khu di tích lịch sử Đền Hùng trên núi Nghĩa Lĩnh, trung tâm tín ngưỡng thờ cúng Hùng Vương - Di sản văn hóa phi vật thể của nhân loại (UNESCO công nhận).',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        sources: 'Đại Việt Sử Ký Toàn Thư & Lĩnh Nam Chích Quái (Trần Thế Pháp).',
        status: 'published',
    },
    {
        name: 'Bắc Ninh (Vùng văn hóa Xứ Kinh Bắc)',
        slug: 'bac-ninh-kinh-bac',
        region: 'Bắc',
        coordinates: {
            lat: 21.1861,
            lng: 106.0763,
        },
        description: 'Cái nôi cổ kính của nền văn minh sông Cầu, quê hương của Dân ca Quan họ được UNESCO vinh danh. Nơi đây gắn bó mật thiết với dòng thi ca dân gian, ca dao trữ tình và nhiều bậc danh sĩ.',
        historicalContext: 'Xứ Kinh Bắc xưa nổi tiếng với các làng nghề truyền thống, chùa Dâu, đền Đô và truyền thống hiếu học rực rỡ trong lịch sử khoa bảng nước Nam.',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        sources: 'Kinh Bắc Phong Thổ Ký & Dân ca Quan họ Bắc Ninh — NXB Văn hóa Dân tộc.',
        status: 'published',
    },
    {
        name: 'Hà Tĩnh (Nghi Xuân & Vùng Đất Lam Hồng)',
        slug: 'ha-tinh-nghi-xuan',
        region: 'Trung',
        coordinates: {
            lat: 18.3559,
            lng: 105.9057,
        },
        description: 'Vùng đất địa linh nhân kiệt dưới chân núi Hồng Lĩnh bên dòng sông Lam. Quê hương của Đại thi hào Nguyễn Du và cái nôi di sản Hát Ví, Giặm Nghệ Tĩnh.',
        historicalContext: 'Làng Tiên Điền, huyện Nghi Xuân là nơi dòng họ Nguyễn Tiên Điền sinh tụ, nơi nuôi dưỡng tâm hồn thi ca vĩ đại của tác giả kiệt tác Truyện Kiều.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        sources: 'Nghiên cứu văn học dân gian Xứ Nghệ — Viện Văn học Việt Nam.',
        status: 'published',
    },
    {
        name: 'Thừa Thiên Huế (Cố Đô Huế & Dòng Sông Hương)',
        slug: 'thua-thien-hue',
        region: 'Trung',
        coordinates: {
            lat: 16.4637,
            lng: 107.5909,
        },
        description: 'Kinh đô phong kiến cuối cùng của Việt Nam, vùng đất của sự lắng đọng thi ca nhã nhạc, ca huế trên sông Hương và trầm tích văn hóa dân gian miền Trung giao hòa văn hóa cung đình.',
        historicalContext: 'Quần thể di tích Cố đô Huế và Nhã nhạc cung đình Huế là các di sản thế giới; kho tàng ca dao Huế mang sắc thái thâm trầm, đằm thắm đặc trưng.',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        sources: 'Ca dao Dân ca Thừa Thiên Huế — Triều Nguyên, NXB Thuận Hóa.',
        status: 'published',
    },
    {
        name: 'Quảng Nam (Hội An & Đất Ngũ Phụng Tề Phi)',
        slug: 'quang-nam-hoi-an',
        region: 'Trung',
        coordinates: {
            lat: 15.8801,
            lng: 108.3380,
        },
        description: 'Xứ Quảng nổi danh là vùng đất "Chưa mưa đà thấm", nổi tiếng với tinh thần hiếu học, ý chí tự lực tự cường và kho tàng ca dao, hò bả trạo ven biển miền Trung.',
        historicalContext: 'Cảng thị cổ Hội An từng là trung tâm giao thương quốc tế thế kỷ XVI-XIX, giao thoa văn hóa đa dạng trong khi vẫn giữ hồn cốt dân tộc.',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        sources: 'Địa chí Quảng Nam & Ca dao Dân ca Xứ Quảng — NXB Đà Nẵng.',
        status: 'published',
    },
    {
        name: 'Thành phố Hồ Chí Minh (Bến Nghé - Gia Định)',
        slug: 'tphcm-ben-nghe',
        region: 'Nam',
        coordinates: {
            lat: 10.7769,
            lng: 106.7009,
        },
        description: 'Đô thị năng động mang dấu ấn mở cõi hơn 300 năm của người phương Nam. Nơi hội tụ tinh hoa nghĩa tình, lòng bao dung, đùm bọc hào hiệp của những đoàn lưu dân.',
        historicalContext: 'Gia Định thành xưa gắn liền với các áng văn thơ yêu nước của Nguyễn Đình Chiểu và tinh thần tương trợ "Lá lành đùm lá rách" sâu sắc.',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
        sources: 'Gia Định Thành Thông Chí (Trịnh Hoài Đức) & Văn hóa Dân gian Nam Bộ.',
        status: 'published',
    },
    {
        name: 'Cần Thơ (Đồng bằng Sông Cửu Long)',
        slug: 'can-tho-tay-do',
        region: 'Nam',
        coordinates: {
            lat: 10.0452,
            lng: 105.7469,
        },
        description: 'Thủ phủ miền Tây Nam Bộ "gạo trắng nước trong", không gian văn hóa sông nước miệt vườn, cái nôi của đờn ca tài tử và các điệu lý, câu hò hào sảng.',
        historicalContext: 'Được khai khẩn qua hàng trăm năm bền bỉ thích ứng với sông nước Mekong, nơi người dân sống nghĩa tình, trọng nhân ái "Bầu ơi thương lấy bí cùng".',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        sources: 'Văn minh Miệt Vườn — Sơn Nam, NXB Trẻ.',
        status: 'published',
    },
    {
        name: 'Cà Mau (Đất Mũi & Rừng U Minh)',
        slug: 'ca-mau-u-minh',
        region: 'Nam',
        coordinates: {
            lat: 9.1769,
            lng: 105.1524,
        },
        description: 'Vùng đất cực Nam của Tổ quốc, biểu tượng của sự kiên cường chinh phục tự nhiên hoang vu, giàu huyền thoại dân gian như chuyện cười Bác Ba Phi.',
        historicalContext: 'Đất phù sa bồi đắp lấn biển mỗi năm, gắn liền với ý chí bền gan vững chí "Có công mài sắt có ngày nên kim" của cha ông.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        sources: 'Đất Rừng Phương Nam — Đoàn Giỏi & Văn học dân gian Cà Mau.',
        status: 'published',
    },
    {
        name: 'Cao Bằng (Quận Cao Bình Xưa)',
        slug: 'cao-bang-cao-binh',
        region: 'Bắc',
        coordinates: {
            lat: 22.6667,
            lng: 106.2639,
        },
        description: 'Vùng non nước hữu tình phía Bắc, địa danh quận Cao Bình được văn học dân gian ghi nhận là quê hương khởi thủy của chàng dũng sĩ Thạch Sanh.',
        historicalContext: 'Không gian văn hóa Tày - Nùng phong phú, nơi lưu giữ nhiều cổ tích và truyền thuyết thần kỳ thời sơ sử.',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        sources: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.',
        status: 'published',
    },
];

async function seedLocations() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sep490';
        console.log(`[SeedLocations] Đang kết nối tới MongoDB: ${mongoUri}...`);
        await mongoose.connect(mongoUri);

        console.log('[SeedLocations] Làm mới danh sách địa phương văn hóa (Location)...');
        await Location.deleteMany({});
        const insertedLocations = await Location.insertMany(sampleLocations);
        console.log(`[SeedLocations] Đã thêm ${insertedLocations.length} địa phương văn hóa vào MongoDB!`);

        // Tạo map để tra cứu theo slug
        const locMap = {};
        insertedLocations.forEach((loc) => {
            locMap[loc.slug] = loc;
        });

        // Liên kết các tác phẩm với địa phương văn hóa tương ứng
        // Định nghĩa mối quan hệ địa lý chuẩn xác: origin, associated, circulation, unknown
        const workLocationMappings = [
            {
                workSlug: 'uong-nuoc-nho-nguon',
                locations: [
                    {
                        locSlug: 'phu-tho-dat-to',
                        relationType: 'associated',
                        notes: 'Gắn liền với tín ngưỡng Giỗ Tổ Hùng Vương và truyền thống tri ân cội nguồn dân tộc',
                    },
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'circulation',
                        notes: 'Lưu truyền sâu rộng tại các sinh hoạt cộng đồng và trường học kinh kỳ',
                    },
                ],
            },
            {
                workSlug: 'an-qua-nho-ke-trong-cay',
                locations: [
                    {
                        locSlug: 'phu-tho-dat-to',
                        relationType: 'circulation',
                        notes: 'Đạo lý nông nghiệp lúa nước lưu truyền từ thời các vua Hùng',
                    },
                    {
                        locSlug: 'thua-thien-hue',
                        relationType: 'circulation',
                        notes: 'Được ghi chép và răn dạy trong nếp sống gia phong xứ Huế',
                    },
                    {
                        locSlug: 'tphcm-ben-nghe',
                        relationType: 'associated',
                        notes: 'Gắn với tấm lòng nhớ ơn những bậc tiền hiền khai hoang mở đất phương Nam',
                    },
                ],
            },
            {
                workSlug: 'cong-cha-nhu-nui-thai-son',
                locations: [
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'circulation',
                        notes: 'Lời ru và câu ca dao phổ biến hàng đầu trong các gia đình Bắc Bộ',
                    },
                    {
                        locSlug: 'thua-thien-hue',
                        relationType: 'circulation',
                        notes: 'Lưu truyền rộng khắp trong các điệu hò ru con miền Trung',
                    },
                    {
                        locSlug: 'can-tho-tay-do',
                        relationType: 'circulation',
                        notes: 'Đi vào câu hò sông nước miệt vườn Nam Bộ',
                    },
                ],
            },
            {
                workSlug: 'bau-oi-thuong-lay-bi-cung',
                locations: [
                    {
                        locSlug: 'thua-thien-hue',
                        relationType: 'circulation',
                        notes: 'Lời ca dao nghĩa tình được hát ru qua nhiều thế hệ tại cố đô',
                    },
                    {
                        locSlug: 'can-tho-tay-do',
                        relationType: 'circulation',
                        notes: 'Thể hiện tinh thần hòa ái, tương trợ của lưu dân miền sông nước',
                    },
                ],
            },
            {
                workSlug: 'co-cong-mai-sat-co-ngay-nen-kim',
                locations: [
                    {
                        locSlug: 'ha-tinh-nghi-xuan',
                        relationType: 'circulation',
                        notes: 'Đúc kết phẩm chất bền bỉ vượt khó của cư dân vùng đất Lam Hồng',
                    },
                    {
                        locSlug: 'ca-mau-u-minh',
                        relationType: 'circulation',
                        notes: 'Ý chí kiên gan bền chí của những thế hệ khai phá rừng U Minh',
                    },
                ],
            },
            {
                workSlug: 'la-lanh-dum-la-rach',
                locations: [
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'circulation',
                        notes: 'Khởi xướng trong các phong trào cứu tế đồng bào từ kinh đô xưa',
                    },
                    {
                        locSlug: 'tphcm-ben-nghe',
                        relationType: 'associated',
                        notes: 'Biểu trưng cho nếp sống hào hiệp, nghĩa tình của người phương Nam',
                    },
                ],
            },
            {
                workSlug: 'hoc-thay-khong-tay-hoc-ban',
                locations: [
                    {
                        locSlug: 'quang-nam-hoi-an',
                        relationType: 'circulation',
                        notes: 'Gắn liền với truyền thống hiếu học và học nhóm của các danh sĩ đất Quảng',
                    },
                    {
                        locSlug: 'bac-ninh-kinh-bac',
                        relationType: 'circulation',
                        notes: 'Tinh thần bạn đồng môn trong các khoa thi cử tại vùng Kinh Bắc xưa',
                    },
                ],
            },
            {
                workSlug: 'chuon-chuon-bay-thap-thi-mua',
                locations: [
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'associated',
                        notes: 'Kinh nghiệm nhà nông châu thổ sông Hồng ven đê Thăng Long',
                    },
                    {
                        locSlug: 'bac-ninh-kinh-bac',
                        relationType: 'circulation',
                        notes: 'Phổ biến trong sinh hoạt canh tác vùng đồng bằng sông Cầu',
                    },
                ],
            },
            {
                workSlug: 'nhieu-dieu-phu-lay-gia-guong',
                locations: [
                    {
                        locSlug: 'bac-ninh-kinh-bac',
                        relationType: 'circulation',
                        notes: 'Lời ca dao đạo nghĩa truyền khẩu sâu rộng tại các làng xã Kinh Bắc',
                    },
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'circulation',
                        notes: 'Thấm nhuần trong gia phong và nếp sống văn hóa người Hà Nội',
                    },
                ],
            },
            {
                workSlug: 'thach-sanh',
                locations: [
                    {
                        locSlug: 'cao-bang-cao-binh',
                        relationType: 'origin',
                        notes: 'Nguyên văn ghi chép: "Ngày xưa ở quận Cao Bình...", nơi phát tích cổ tích Thạch Sanh',
                    },
                ],
            },
            {
                workSlug: 'thanh-giong',
                locations: [
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'origin',
                        notes: 'Khởi nguồn tại làng Phù Đổng (Gia Lâm) và đỉnh núi Sóc Sơn (Hà Nội)',
                    },
                    {
                        locSlug: 'bac-ninh-kinh-bac',
                        relationType: 'associated',
                        notes: 'Khu vực Kinh Bắc xưa nơi diễn ra các truyền thuyết giặc Ân',
                    },
                ],
            },
            {
                workSlug: 'son-tinh-thuy-tinh',
                locations: [
                    {
                        locSlug: 'ha-noi-thang-long',
                        relationType: 'origin',
                        notes: 'Gắn với Núi Tản Viên (Ba Vì, Hà Nội), nơi ngự của Sơn Tinh Đệ Nhất Phúc Thần',
                    },
                    {
                        locSlug: 'phu-tho-dat-to',
                        relationType: 'associated',
                        notes: 'Cung điện Hùng Vương kén rể tại kinh thành Phong Châu',
                    },
                ],
            },
            {
                workSlug: 'truyen-kieu',
                locations: [
                    {
                        locSlug: 'ha-tinh-nghi-xuan',
                        relationType: 'origin',
                        notes: 'Quê hương Tiên Điền (Nghi Xuân, Hà Tĩnh) của tác giả Nguyễn Du',
                    },
                    {
                        locSlug: 'bac-ninh-kinh-bac',
                        relationType: 'associated',
                        notes: 'Quê mẹ Nguyễn Du tại Từ Sơn (Bắc Ninh), cái nôi âm nhạc nuôi dưỡng hồn thơ Kiều',
                    },
                    {
                        locSlug: 'thua-thien-hue',
                        relationType: 'circulation',
                        notes: 'Nơi Nguyễn Du làm quan triều Nguyễn và Truyện Kiều được lưu truyền kinh thành',
                    },
                ],
            },
        ];

        console.log('[SeedLocations] Đang cập nhật liên kết địa phương vào từng tác phẩm trong Work...');
        for (const mapping of workLocationMappings) {
            const locIds = [];
            const locRelations = [];

            for (const item of mapping.locations) {
                const locDoc = locMap[item.locSlug];
                if (locDoc) {
                    locIds.push(locDoc._id);
                    locRelations.push({
                        locationId: locDoc._id,
                        relationType: item.relationType,
                        notes: item.notes,
                    });
                }
            }

            if (locIds.length > 0) {
                await Work.updateOne(
                    { slug: mapping.workSlug },
                    {
                        $set: {
                            locationIds: locIds,
                            locationRelations: locRelations,
                        },
                    }
                );
                console.log(`✓ Đã cập nhật ${locIds.length} địa phương cho tác phẩm: ${mapping.workSlug}`);
            }
        }

        console.log('\n========================================');
        console.log('🎉 NẠP DỮ LIỆU ĐỊA PHƯƠNG & BẢN ĐỒ VĂN HÓA HOÀN TẤT THÀNH CÔNG!');
        console.log('========================================');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi nạp dữ liệu địa phương:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedLocations();
