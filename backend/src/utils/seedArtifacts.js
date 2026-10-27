require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Artifact = require('../models/Artifact');

const artifactsData = [
    {
        slug: 'ngua-sat-tre-dang-nga',
        name: 'Ngựa Sắt & Bụi Tre Đằng Ngà',
        subtitle: 'Hào khí Thánh Gióng — Biểu tượng sức mạnh quật khởi của dân tộc',
        textbookUnit: 'Ngữ văn Lớp 6 — Bài 1: Lắng nghe lịch sử nước mình (Truyền thuyết)',
        era: 'Thời đại Hùng Vương thứ 6 (Nước Văn Lang cổ đại)',
        location: 'Làng Phù Đổng (Gia Lâm, Hà Nội) & Núi Sóc (Sóc Sơn, Hà Nội)',
        textbookExcerpt: '“Sứ giả vào, đứa bé bảo: «Ông về tâu với vua sắm cho ta một con ngựa sắt, một cái roi sắt và một tấm áo giáp sắt, ta sẽ phá tan lũ giặc này». […] Chú bé vùng dậy, vươn vai một cái bỗng biến thành một tráng sĩ mình cao hơn trượng, oai phong lẫm liệt. Tráng sĩ bước lên vỗ vào mông ngựa, ngựa hí dài mấy tiếng vang dội. […] Roi sắt gãy, tráng sĩ bèn nhổ những cụm tre cạnh đường quật túi bụi vào giặc. Giặc tan vỡ…”',
        textbookSource: 'Theo SGK Ngữ văn 6 — Chân trời sáng tạo & Kết nối tri thức',
        angles: [
            {
                deg: 0,
                label: 'Chính Diện',
                image: 'https://res.cloudinary.com/duh7umnxa/image/upload/v1792981202/iron_horse_front_a3a8f7.jpg',
                hotspots: [
                    { id: 'spot-front-head', title: 'Đầu Ngựa & Mắt Đỏ Rực Lửa', tag: 'Thần khí', x: 50, y: 18, detail: 'Đầu ngựa rèn đúc oai nghiêm, cặp mắt đỏ phát sáng thần thoại xông thẳng vào quân giặc.' },
                    { id: 'spot-front-chest', title: 'Giáp Ngực Hoa Văn Xoắn Ốc', tag: 'Kỹ nghệ cổ', x: 50, y: 44, detail: 'Dải hoa văn xoắn ốc đồng tâm mang đậm dấu ấn nghệ thuật đúc kim khí thời Hùng Vương.' },
                    { id: 'spot-front-bamboo', title: 'Khóm Tre Vàng Đằng Ngà', tag: 'Cội nguồn', x: 74, y: 38, detail: 'Thân tre ngà óng ả vươn cao kiêu hãnh cạnh chiến mã.' }
                ]
            },
            {
                deg: 45,
                label: 'Toàn Cảnh',
                image: 'https://res.cloudinary.com/duh7umnxa/image/upload/v1792981188/iron_horse_bamboo_br4il5.jpg',
                hotspots: [
                    { id: 'spot-armor', title: 'Ngựa Sắt & Giáp Sắt Thần', tag: 'Vũ khí kim khí', x: 42, y: 45, detail: 'Hình tượng ngựa sắt biểu trưng cho sức mạnh công nghệ quân sự và tinh thần đoàn kết toàn dân.' },
                    { id: 'spot-bamboo', title: 'Bụi Tre Đằng Ngà Thần Kỳ', tag: 'Cội nguồn đất mẹ', x: 68, y: 35, detail: 'Cây tre mộc mạc biến thành vũ khí thần kỳ quét sạch quân thù.' },
                    { id: 'spot-fire', title: 'Vệt Lửa Ngựa Thần & Tre Ngà', tag: 'Dấu tích lịch sử', x: 32, y: 28, detail: 'Dấu tích ngọn lửa thiêu cháy giặc Ân lưu lại sắc vàng ngàn năm.' }
                ]
            },
            {
                deg: 90,
                label: 'Cạnh Bên',
                image: 'https://res.cloudinary.com/duh7umnxa/image/upload/v1792981214/iron_horse_side_jrftj1.jpg',
                hotspots: [
                    { id: 'spot-side-body', title: 'Thân Ngựa Cuồn Cuộn Cơ Bắp', tag: 'Tráng sĩ', x: 50, y: 45, detail: 'Cơ bắp ngựa sắt rèn đúc oai vệ, yên ngựa chạm khắc hoa văn cổ uy nghiêm.' },
                    { id: 'spot-side-bamboo', title: 'Rừng Tre Vàng Bất Khuất', tag: 'Đất mẹ chở che', x: 23, y: 35, detail: 'Hàng tre vàng óng ả thẳng tắp che chở hậu phương làng quê.' },
                    { id: 'spot-side-hoof', title: 'Móng Sắt Đạp Đất Giang Sơn', tag: 'Dấu chân lịch sử', x: 63, y: 70, detail: 'Dấu chân ngựa sắt dẫm giặc để lại các ao hồ liên tiếp quanh vùng Gia Bình.' }
                ]
            }
        ],
        fourLayers: {
            literal: 'Con ngựa rèn bằng sắt khối cao lớn phun ra lửa cùng những khóm tre có thân màu vàng ngà óng ả mọc nhiều ở vùng đồng bằng Bắc Bộ.',
            symbolic: 'Biểu tượng cho sức mạnh tiềm tàng, ý chí quật cường và sự lớn dậy phi thường của dân tộc Việt Nam trước hiểm họa xâm lăng.',
            philosophical: 'Bài học "Tận trung báo quốc không màng danh lợi". Gióng đánh giặc xong, cởi giáp sắt để lại, cưỡi ngựa bay thẳng về trời chứ không hề về triều đình nhận phong thưởng.',
            folkQuotes: [
                'Ai ơi nhớ hội bách thần / Nhớ ngày mùng chín tháng tư hội Gióng.',
                'Nong cơm, nong cà nuôi chàng tráng sĩ / Ngựa sắt vươn vai quét sạch giặc thù.',
                'Làng Gióng thờ ngựa bay lên trời / Tre ngà còn đọng sắc vàng ngàn năm.'
            ]
        },
        academicSource: 'GS. Đinh Gia Khánh — Văn học dân gian Việt Nam; GS. Trần Quốc Vượng — Địa văn hóa và Điển tích Sóc Sơn.',
        audioNarrationScript: 'Chào mừng quý khách đến với không gian khảo cứu bảo vật Ngựa Sắt và Bụi Tre Đằng Ngà. Đây là hình tượng thần thoại bất hủ trong truyền thuyết Thánh Gióng thời Hùng Vương thứ sáu. Hình tượng tráng sĩ nhổ tre quật giặc nhắc nhở chúng ta bài học muôn đời: Sức mạnh bảo vệ giang sơn bắt nguồn từ lòng đoàn kết toàn dân và tinh thần tận trung báo quốc không màng danh lợi.',
        order: 1
    },
    {
        slug: 'trong-dong-dong-son',
        name: 'Trống Đồng Đông Sơn',
        subtitle: 'Bảo vật Quốc gia — Bản đồ Vũ trụ quan & Đỉnh cao văn minh Sông Hồng',
        textbookUnit: 'Lịch sử & Địa lí Lớp 6 — Bài 14: Nhà nước Văn Lang, Âu Lạc',
        era: 'Văn hóa Đông Sơn (Khoảng thế kỷ VII TCN - Thế kỷ I SCN)',
        location: 'Làng Đông Sơn (Thanh Hóa) & Bảo tàng Lịch sử Quốc gia (Hà Nội)',
        textbookExcerpt: '“Trống đồng là di vật tiêu biểu nhất cho nền văn hóa Đông Sơn. Hoa văn trên mặt trống đồng phản ánh đời sống vật chất và tinh thần phong phú của người Việt cổ: hình mặt trời nhiều cánh ở tâm, đàn chim Lạc tung cánh bay, cảnh giã gạo, múa hát, chèo thuyền chiến…”',
        textbookSource: 'Theo SGK Lịch sử & Địa lí 6 — Bộ Giáo dục & Đào tạo',
        angles: [
            {
                deg: 0,
                label: 'Mặt Trống Chính Diện (0°)',
                image: 'https://res.cloudinary.com/duh7umnxa/image/upload/v1792981133/dong_son_drum_v1aty7.jpg',
                hotspots: [
                    { id: 'spot-sun', title: 'Ngôi Sao Mặt Trời 14 Cánh', tag: 'Tín ngưỡng', x: 50, y: 43, detail: 'Tâm điểm của vũ trụ, phản ánh tín ngưỡng sùng kính Thần Mặt Trời của cư dân nông nghiệp lúa nước.' },
                    { id: 'spot-birds', title: 'Đàn Chim Lạc Tung Cánh', tag: 'Vật tổ', x: 62, y: 35, detail: 'Chim Lạc sải cánh bay ngược chiều kim đồng hồ, biểu tượng cho chu kỳ thời gian và sự trường tồn của giống nòi.' },
                    { id: 'spot-festival', title: 'Vòng Hoa Văn Người Nhảy Múa & Giã Gạo', tag: 'Đời sống', x: 38, y: 50, detail: 'Hình ảnh cư dân múa hát, giã gạo chày đôi thể hiện tinh thần thượng võ và nếp sống cộng đồng ấm no.' }
                ]
            }
        ],
        fourLayers: {
            literal: 'Nhạc khí đúc bằng đồng thau với kỹ thuật luyện kim đỉnh cao, mặt trống phẳng, thân thon hình nón cụt, đáy nở rộng.',
            symbolic: 'Biểu tượng tối cao của quyền lực Lạc vương, Lạc hầu; tiếng sấm linh thiêng xua đuổi tai ương và hiệu triệu muôn dân tụ hội.',
            philosophical: 'Triết lý hòa hợp giữa Con người - Đất trời - Tự nhiên; niềm tự hào về cội nguồn văn minh độc lập rực rỡ từ thời cổ đại.',
            folkQuotes: [
                'Dù ai đi ngược về xuôi / Nhớ ngày Giỗ Tổ mùng mười tháng ba.',
                'Trống đồng vang vọng ngàn năm / Hồn thiêng sông núi ngàn đời không phai.',
                'Con người có tổ có tông / Như cây có cội, như sông có nguồn.'
            ]
        },
        academicSource: 'Viện Khảo cổ học Việt Nam; GS. Hà Văn Tấn — Văn hóa Đông Sơn ở Việt Nam.',
        audioNarrationScript: 'Chào mừng quý khách đến với kiệt tác bảo vật quốc gia Trống Đồng Đông Sơn, đỉnh cao của nền văn minh kim khí Lạc Việt hơn 2500 năm trước. Mặt trời 14 tia rực rỡ ở tâm điểm cùng đàn chim Lạc bay ngược chiều kim đồng hồ là bản trường ca bất tử ngợi ca sự sống, niềm tin vào vũ trụ và ý chí tự cường trường tồn của nòi giống Tiên Rồng.',
        order: 2
    }
];

async function seedArtifacts() {
    try {
        console.log('🔄 Đang kết nối MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sep490');
        console.log('✅ Đã kết nối MongoDB thành công.');

        console.log('🧹 Xóa dữ liệu cũ của Artifacts...');
        await Artifact.deleteMany({});

        console.log('🌱 Đang nạp dữ liệu bảo vật với link Cloudinary...');
        for (const item of artifactsData) {
            await Artifact.create(item);
            console.log(`  ✓ Đã nạp bảo vật: "${item.name}" [${item.slug}]`);
        }

        console.log(`\n🎉 HOÀN TẤT! Đã nạp thành công ${artifactsData.length} bảo vật di sản vào MongoDB.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi nạp dữ liệu:', error);
        process.exit(1);
    }
}

seedArtifacts();
