const mongoose = require('mongoose');
const Location = require('../models/Location');
const Work = require('../models/Work');

const LOCATIONS_DATA = [
    {
        name: 'Hà Nội (Kinh Kỳ Thăng Long)',
        slug: 'ha-noi-thang-long',
        region: 'Bắc',
        coordinates: { lat: 21.0285, lng: 105.8542 },
        description: 'Trung tâm văn hóa, chính trị ngàn năm văn hiến của Việt Nam. Nơi hội tụ các truyền thuyết khai sáng, kiệt tác văn học trung đại và thơ ca hiện đại hào hoa.',
        historicalContext: 'Từ định đô Thăng Long năm 1010 thời Lý đến nay, Hà Nội là cái nôi lắng đọng thi ca dân tộc, văn học yêu nước và truyền thuyết lập quốc.',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        sources: 'Địa chí Thăng Long — Hà Nội, Viện Hàn lâm Khoa học Xã hội Việt Nam.',
        status: 'published',
    },
    {
        name: 'Phú Thọ (Đất Tổ Hùng Vương & Phong Châu)',
        slug: 'phu-tho-dat-to',
        region: 'Bắc',
        coordinates: { lat: 21.3912, lng: 105.3235 },
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
        coordinates: { lat: 21.1861, lng: 106.0763 },
        description: 'Cái nôi cổ kính của nền văn minh sông Cầu, quê hương của bài thơ thần Nam Quốc Sơn Hà bên sông Như Nguyệt và kiệt tác hiện thực Tắt đèn của Ngô Tất Tố.',
        historicalContext: 'Xứ Kinh Bắc xưa nổi tiếng với các danh lam cổ tích, phòng tuyến sông Như Nguyệt lịch sử và truyền thống hiếu học rực rỡ trong khoa bảng nước Nam.',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        sources: 'Kinh Bắc Phong Thổ Ký & Địa chí Bắc Ninh.',
        status: 'published',
    },
    {
        name: 'Hà Tĩnh (Nghi Xuân & Vùng Đất Lam Hồng)',
        slug: 'ha-tinh-nghi-xuan',
        region: 'Trung',
        coordinates: { lat: 18.3559, lng: 105.9057 },
        description: 'Vùng đất địa linh nhân kiệt dưới chân núi Hồng Lĩnh bên dòng sông Lam. Quê hương của Đại thi hào Nguyễn Du và cái nôi sinh dưỡng kiệt tác Truyện Kiều.',
        historicalContext: 'Làng Tiên Điền, huyện Nghi Xuân là nơi dòng họ Nguyễn Tiên Điền sinh tụ, nơi nuôi dưỡng tâm hồn thi ca vĩ đại của tác giả Đoạn Trường Tân Thanh.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        sources: 'Nghiên cứu văn học dân gian Xứ Nghệ — Viện Văn học Việt Nam.',
        status: 'published',
    },
    {
        name: 'Thừa Thiên Huế (Cố Đô Huế & Dòng Sông Hương)',
        slug: 'thua-thien-hue',
        region: 'Trung',
        coordinates: { lat: 16.4637, lng: 107.5909 },
        description: 'Mảnh đất Cố đô trầm mặc và thi vị bên dòng sông Hương thơ mộng, không gian nghệ thuật bất hủ của Đây Thôn Vĩ Dạ (Hàn Mặc Tử) và Ai đã đặt tên cho dòng sông? (Hoàng Phủ Ngọc Tường).',
        historicalContext: 'Kinh đô triều Nguyễn suốt hơn một thế kỷ, trung tâm văn hóa nghệ thuật và nhã nhạc cung đình di sản thế giới.',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        sources: 'Huế — Di sản & Bản sắc Văn hóa, Trung tâm Bảo tồn Di tích Cố đô Huế.',
        status: 'published',
    },
    {
        name: 'Quảng Nam (Hội An & Đất Ngũ Phụng Tề Phi)',
        slug: 'quang-nam-hoi-an',
        region: 'Trung',
        coordinates: { lat: 15.8801, lng: 108.338 },
        description: 'Vùng đất mở cõi trù phú bên dòng sông Thu Bồn, nơi giao thoa văn hóa Đông - Tây với đô thị cổ Hội An và truyền thống hiếu học nghĩa khí của đất Ngũ Phụng Tề Phi.',
        historicalContext: 'Thương cảng quốc tế Hội An từ thế kỷ XVI - XVIII, trung tâm văn hóa lớn tại Đàng Trong thời các chúa Nguyễn.',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        sources: 'Địa chí Quảng Nam & Lịch sử Đô thị cổ Hội An.',
        status: 'published',
    },
    {
        name: 'Thành phố Hồ Chí Minh (Bến Nghé - Gia Định)',
        slug: 'tphcm-ben-nghe',
        region: 'Nam',
        coordinates: { lat: 10.8231, lng: 106.6297 },
        description: 'Đô thị phương Nam sầm uất, cái nôi của tinh thần hào hiệp, trượng nghĩa và khí phách kiên cường bất khuất trong Văn tế nghĩa sĩ Cần Giuộc của cụ Đồ Chiểu.',
        historicalContext: 'Từ thời Lễ Thành hầu Nguyễn Hữu Cảnh kinh lược phương Nam lập phủ Gia Định năm 1698, mở mang bờ cõi trù phú.',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
        sources: 'Gia Định Thành Thông Chí — Trịnh Hoài Đức & Địa chí Văn hóa TP.HCM.',
        status: 'published',
    },
    {
        name: 'Cần Thơ (Đồng bằng Sông Cửu Long)',
        slug: 'can-tho-tay-do',
        region: 'Nam',
        coordinates: { lat: 10.0452, lng: 105.7469 },
        description: 'Trái tim của miền Tây Nam Bộ, trung tâm châu thổ sông Cửu Long với văn hóa chợ nổi trên sông và dòng chảy thi ca văn học sông nước Nam Bộ trù phú.',
        historicalContext: 'Đô thị thủ phủ miền Tây Nam Bộ hình thành bên bờ sông Hậu hiền hòa chở nặng phù sa ngọt lành.',
        image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
        sources: 'Văn hóa Sông nước Cửu Long — NXB Trẻ.',
        status: 'published',
    },
    {
        name: 'Cà Mau (Đất Mũi & Rừng U Minh)',
        slug: 'ca-mau-u-minh',
        region: 'Nam',
        coordinates: { lat: 9.1769, lng: 105.1524 },
        description: 'Mảnh đất cực Nam của Tổ quốc với rừng tràm U Minh và rừng đước bạt ngàn, bối cảnh kinh điển của Đất rừng phương Nam (Đoàn Giỏi) và Hương rừng Cà Mau (Sơn Nam).',
        historicalContext: 'Vùng đất mở cõi hoang sơ nhưng hào sảng nghĩa khí, căn cứ địa kháng chiến vững chắc của quân dân Nam Bộ.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        sources: 'Hương rừng Cà Mau — Sơn Nam & Đất rừng phương Nam — Đoàn Giỏi.',
        status: 'published',
    },
    {
        name: 'Cao Bằng (Quận Cao Bình Xưa)',
        slug: 'cao-bang-cao-binh',
        region: 'Bắc',
        coordinates: { lat: 22.6667, lng: 106.2667 },
        description: 'Vùng núi non trùng điệp biên cương phía Bắc, nơi phát tích truyện cổ tích Thạch Sanh và chiến khu Việt Bắc trong bài thơ Đồng Chí của Chính Hữu.',
        historicalContext: 'Vùng biên viễn hiểm trở giàu truyền thống yêu nước, căn cứ địa cách mạng đầu tiên của Bác Hồ khi về nước năm 1941.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        sources: 'Địa chí Cao Bằng & Kho tàng Truyện cổ tích Việt Nam.',
        status: 'published',
    },
    {
        name: 'Quần đảo Hoàng Sa (TP. Đà Nẵng)',
        slug: 'quan-dao-hoang-sa',
        region: 'Trung',
        coordinates: { lat: 16.5375, lng: 112.01 },
        description: 'Cương vực biển đảo thiêng liêng đời đời của Tổ quốc Việt Nam, gắn liền với Hải đội Hoàng Sa thời chúa Nguyễn và các tác phẩm thơ ca biển đảo quật cường.',
        historicalContext: 'Chúa Nguyễn thành lập Hải đội Hoàng Sa từ thế kỷ XVII; ghi nhận trong Phủ Biên Tạp Lục (Lê Quý Đôn 1776) và Châu bản Triều Nguyễn.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        sources: 'Phủ Biên Tạp Lục (Lê Quý Đôn - 1776) & Châu bản Triều Nguyễn.',
        status: 'published',
    },
    {
        name: 'Quần đảo Trường Sa (Tỉnh Khánh Hòa)',
        slug: 'quan-dao-truong-sa',
        region: 'Trung',
        coordinates: { lat: 10.25, lng: 114.2 },
        description: 'Phên dậu tiền tiêu bất khả xâm phạm trên biển Đông, biểu tượng thiêng liêng cho ý chí kiên cường giữ biển của dân tộc trong thi phẩm Tổ quốc nhìn từ biển.',
        historicalContext: 'Thực thi chủ quyền liên tục qua các triều đại lịch sử Việt Nam, biểu tượng anh hùng của người lính hải quân thời đại mới.',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        sources: 'Đại Nam Nhất Thống Chí & Tuyển tập Thơ ca Biển đảo Việt Nam.',
        status: 'published',
    },
    {
        name: 'Hà Nam (Vùng đất Làng Vũ Đại & Đồng chiêm trũng)',
        slug: 'ha-nam-lang-vu-dai',
        region: 'Bắc',
        coordinates: { lat: 20.545, lng: 105.9124 },
        description: 'Không gian nghệ thuật gắn liền với làng Vũ Đại trong các kiệt tác hiện thực của Nam Cao (Chí Phèo, Lão Hạc), bến đò Hoàng Giang trong Chuyện người con gái Nam Xương (Nguyễn Dữ) và chùm thơ thu của Tam Nguyên Yên Đổ Nguyễn Khuyến.',
        historicalContext: 'Đồng chiêm trũng châu thổ sông Hồng với làng Đại Hoàng (phủ Lý Nhân xưa), nơi sinh dưỡng những tài năng văn chương trác tuyệt và phản ánh chân thực số phận người nông dân Việt Nam trước cách mạng.',
        sources: 'Địa chí Hà Nam; Tuyển tập Nam Cao; Thơ văn Nguyễn Khuyến',
        status: 'published',
    },
    {
        name: 'Tây Bắc (Không gian nghệ thuật Sông Đà & Điện Biên)',
        slug: 'tay-bac-song-da-dien-bien',
        region: 'Bắc',
        coordinates: { lat: 21.3283, lng: 103.9144 },
        description: 'Vùng đất huyền thoại của núi rừng Tây Bắc, dòng sông Đà hung bạo trữ tình và bản Mèo Hồng Ngài trong các tác phẩm kinh điển: Vợ chồng A Phủ (Tô Hoài), Người lái đò Sông Đà (Nguyễn Tuân), Tây Tiến (Quang Dũng), Mùa Lạc (Nguyễn Khải).',
        historicalContext: 'Chiến trường Điện Biên Phủ lịch sử và dải biên cương Tây Bắc - cội nguồn cảm hứng lớn lao cho văn nghệ kháng chiến và công cuộc xây dựng cuộc sống mới.',
        sources: 'Văn học Kháng chiến chống Pháp; Ký sự Tây Bắc - Tô Hoài, Nguyễn Tuân',
        status: 'published',
    },
    {
        name: 'Quảng Ninh (Dòng sông Bạch Đằng & Biển trời Hòn Gai)',
        slug: 'quang-ninh-bach-dang-hon-gai',
        region: 'Bắc',
        coordinates: { lat: 20.9502, lng: 107.0734 },
        description: 'Không gian lịch sử và thi ca hào hùng gắn liền với Bạch Đằng Giang Phú của Trương Hán Siêu và bức tranh tráng lệ giàu sức sống trong thi phẩm Đoàn thuyền đánh cá của Huy Cận.',
        historicalContext: 'Cửa ngõ biển Đông với dòng sông Bạch Đằng ba lần đại thắng quân xâm lược phương Bắc và vùng vịnh Hạ Long kỳ quan thiên nhiên thế giới.',
        sources: 'Đại Việt Sử Ký Toàn Thư; Thơ Huy Cận',
        status: 'published',
    },
    {
        name: 'Tây Nguyên (Đại ngàn Kon Tum & Làng Xô Man)',
        slug: 'tay-nguyen-dai-ngan-xo-man',
        region: 'Trung',
        coordinates: { lat: 14.354, lng: 108.0075 },
        description: 'Vùng đất sử thi hào hùng của những cánh rừng xà nu bạt ngàn, gắn liền với thiên truyện bất hủ Rừng xà nu của nhà văn Nguyễn Trung Thành và thiên anh hùng ca Đất nước đứng lên của Nguyên Ngọc.',
        historicalContext: 'Đại ngàn Tây Nguyên trong những năm tháng kháng chiến chống Mỹ ác liệt, biểu tượng cho lòng yêu nước nồng nàn và ý chí quật khởi kiên cường của đồng bào các dân tộc thiểu số.',
        sources: 'Tuyển tập Nguyễn Trung Thành; Sử thi Tây Nguyên',
        status: 'published',
    },
    {
        name: 'Quảng Bình (Vùng đất Đèo Ngang & Tuyến đường Trường Sơn)',
        slug: 'quang-binh-deo-ngang',
        region: 'Trung',
        coordinates: { lat: 17.8767, lng: 106.4789 },
        description: 'Vùng đất non xanh nước biếc ghi dấu bài thơ tuyệt tác Qua Đèo Ngang của Bà Huyện Thanh Quan, hình tượng Mẹ Suốt chèo đò bên sông Gianh và tuyến đường Trường Sơn khói lửa trong Bài thơ về tiểu đội xe không kính.',
        historicalContext: 'Cửa ải phân giới địa lý lịch sử giữa Đàng Trong và Đàng Ngoài xưa, yết hầu giao thông kháng chiến Trường Sơn huyền thoại.',
        sources: 'Văn học Trung đại Việt Nam; Thơ ca kháng chiến chống Mỹ',
        status: 'published',
    },
    {
        name: 'Ninh Bình (Cố Đô Hoa Lư & Cội nguồn Chiếu Dời Đô)',
        slug: 'ninh-binh-hoa-lu',
        region: 'Bắc',
        coordinates: { lat: 20.2539, lng: 105.975 },
        description: 'Kinh đô đầu tiên của nhà nước phong kiến tập quyền Việt Nam, cội nguồn nơi vua Lý Thái Tổ ban Chiếu dời đô từ Hoa Lư về Thăng Long mở ra kỷ nguyên văn hiến rực rỡ.',
        historicalContext: 'Kinh đô Hoa Lư triều Đinh - Tiền Lê (thế kỷ X), căn cứ địa hiểm trở với núi non trùng điệp trước khi định đô tại đồng bằng châu thổ sông Hồng.',
        sources: 'Đại Việt Sử Ký Toàn Thư; Khảo cứu Cố đô Hoa Lư',
        status: 'published',
    },
];

const LITERARY_WORKS_DATA = [
    {
        title: 'Vợ chồng A Phủ',
        slug: 'vo-chong-a-phu',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện đại (1952)',
        region: 'Bắc',
        author: 'Tô Hoài',
        summary: 'Kiệt tác truyện ngắn trong tập "Truyện Tây Bắc", kể về số phận đau khổ tột cùng dưới ách áp bức của bọn chúa đất phong kiến và sức sống tiềm tàng quật khởi vươn lên giải phóng cuộc đời của đôi vợ chồng Mị và A Phủ tại Hồng Ngài.',
        quote: 'Mị còn trẻ. Mị vẫn còn trẻ. Mị muốn đi chơi. Bao nhiêu người có chồng cũng đi chơi ngày Tết...',
        content: 'Tác phẩm ra đời sau chuyến đi thực tế kéo dài 8 tháng của Tô Hoài cùng bộ đội giải phóng Tây Bắc năm 1952. Khắc họa sâu sắc bức tranh thiên nhiên Tây Bắc hùng vĩ, phong tục tập quán độc đáo của đồng bào Mông, đồng thời ngợi ca vẻ đẹp tâm hồn và sức sống mãnh liệt của con người vùng cao.',
        historicalContext: 'Chiến dịch Tây Bắc năm 1952 trong kháng chiến chống thực dân Pháp.',
        thematicMeaning: 'Khát vọng tự do, hạnh phúc và sức mạnh quật khởi của người lao động bị áp bức dưới sự soi đường của cách mạng.',
        topic: 'Số phận & Khát vọng Giải phóng',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Tuyển tập Tô Hoài',
        status: 'published',
        locSlugs: ['tay-bac-song-da-dien-bien'],
        relationType: 'origin',
        notes: 'Lấy bối cảnh bản Mèo Hồng Ngài (huyện Bắc Yên, tỉnh Sơn La xưa) giữa mùa xuân rực rỡ sắc hoa và tiếng sáo gọi bạn tình.'
    },
    {
        title: 'Người lái đò Sông Đà',
        slug: 'nguoi-lai-do-song-da',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện đại (1960)',
        region: 'Bắc',
        author: 'Nguyễn Tuân',
        summary: 'Tùy bút đặc sắc trích trong tập "Sông Đà", ca ngợi vẻ đẹp vừa hung bạo vừa trữ tình thơ mộng của dòng sông Đà, cùng phẩm chất anh hùng, tài hoa nghệ sĩ của người lái đò trên mặt trận lao động xây dựng Tổ quốc.',
        quote: 'Chúng thủy giai đông tẩu / Đà giang độc bắc lưu. Con Sông Đà tuôn dài tuôn dài như một áng tóc trữ tình...',
        content: 'Chuyến đi thực tế Tây Bắc năm 1958 của Nguyễn Tuân đã mở ra bức tranh kỳ vĩ về thiên nhiên non sông và con người Tây Bắc - chất vàng mười đã được thử lửa trong lao động cần lao.',
        historicalContext: 'Thời kỳ miền Bắc bước vào công cuộc khôi phục kinh tế và xây dựng xã hội chủ nghĩa sau năm 1954.',
        thematicMeaning: 'Ngợi ca thiên nhiên đất nước và vẻ đẹp tài hoa nghệ sĩ của người lao động bình dị.',
        topic: 'Thiên nhiên & Người lao động mới',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Tùy bút Sông Đà - Nguyễn Tuân',
        status: 'published',
        locSlugs: ['tay-bac-song-da-dien-bien'],
        relationType: 'origin',
        notes: 'Khắc họa trọn vẹn dòng sông Đà hiểm trở và trữ tình từ Lai Châu, Sơn La về đến Hòa Bình.'
    },
    {
        title: 'Chí Phèo',
        slug: 'chi-pheo',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện thực (1941)',
        region: 'Bắc',
        author: 'Nam Cao',
        summary: 'Đỉnh cao của chủ nghĩa hiện thực phê phán Việt Nam thế kỷ XX, phản ánh bi kịch bị tha hóa, lưu manh hóa của người nông dân lương thiện dưới ách bóc lột tàn bạo của tầng lớp cường hào ác bá và nỗi khát khao cháy bỏng được làm người lương thiện.',
        quote: 'Ai cho tao lương thiện? Làm sao cho mất được những vết mảnh chai trên mặt này? Tao không thể là người lương thiện nữa!',
        content: 'Nguyên mẫu làng Vũ Đại chính là làng Đại Hoàng, xã Hòa Hậu, huyện Lý Nhân, tỉnh Hà Nam - quê hương của tác giả Nam Cao. Tác phẩm tố cáo sâu sắc xã hội thực dân nửa phong kiến ngột ngạt bất công.',
        historicalContext: 'Xã hội nông thôn Việt Nam trước Cách mạng Tháng Tám năm 1945 dưới ách thực dân - phong kiến.',
        thematicMeaning: 'Khẳng định bản chất lương thiện bất diệt của con người ngay cả khi bị vùi dập đến cùng cực.',
        topic: 'Nhân đạo & Hiện thực phê phán',
        source: 'SGK Ngữ văn 11 - NXB Giáo dục Việt Nam; Tuyển tập Nam Cao',
        status: 'published',
        locSlugs: ['ha-nam-lang-vu-dai'],
        relationType: 'origin',
        notes: 'Bối cảnh làng Vũ Đại với những lò gạch cũ, vườn chuối ngút ngàn bên dòng sông Châu Giang, tỉnh Hà Nam.'
    },
    {
        title: 'Lão Hạc',
        slug: 'lao-hac',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện thực (1943)',
        region: 'Bắc',
        author: 'Nam Cao',
        summary: 'Truyện ngắn hiện thực lay động hàng triệu con tim về số phận khốn cùng của người nông dân già nghèo khó, chọn cái chết dữ dội bằng bả chó để giữ trọn vẹn nhân cách trong sạch và dành dụm chút vốn liếng cuối cùng cho con trai.',
        quote: 'Cuộc đời chưa hẳn đã đáng buồn, hay vẫn đáng buồn nhưng lại đáng buồn theo một nghĩa khác...',
        content: 'Lão Hạc là biểu tượng bất hủ cho tình phụ tử thiêng liêng, đức hy sinh cao cả và lòng tự trọng sáng ngời của người nông dân Việt Nam.',
        historicalContext: 'Nông thôn Bắc Bộ những năm đầu thập niên 1940 trước nạn đói 1945.',
        thematicMeaning: 'Ca ngợi vẻ đẹp nhân phẩm sáng ngời và tình thương con bao la của người cha nghèo khó.',
        topic: 'Tình cảm gia đình & Nhân cách',
        source: 'SGK Ngữ văn 8 - NXB Giáo dục Việt Nam; Tuyển tập Nam Cao',
        status: 'published',
        locSlugs: ['ha-nam-lang-vu-dai'],
        relationType: 'origin',
        notes: 'Không gian xóm nghèo ven sông Châu Giang tại làng Đại Hoàng, phủ Lý Nhân, tỉnh Hà Nam.'
    },
    {
        title: 'Tắt đèn',
        slug: 'tat-den',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện thực (1939)',
        region: 'Bắc',
        author: 'Ngô Tất Tố',
        summary: 'Bức tranh bi thảm và ngột ngạt của nông thôn Việt Nam trong những ngày sưu thuế căng thẳng, nổi bật với hình tượng chị Dậu - người phụ nữ nông dân giàu lòng vị tha, yêu thương chồng con và tiềm tàng tinh thần phản kháng mãnh liệt.',
        quote: 'Mày trói ngay chồng bà đi, bà cho mày xem! Chị Dậu nghiến hai hàm răng túm lấy cổ tên cai lệ ấn dúi ra cửa...',
        content: 'Tiểu thuyết gồm 26 chương với kết thúc bi kịch mang tính biểu tượng: Chị Dậu chạy ra ngoài giữa đêm tối đen như mực và như cái tiền đồ của chị.',
        historicalContext: 'Chính sách thuế thân tàn bạo của chính quyền thực dân Pháp tại các làng quê Bắc Kỳ thời Pháp thuộc.',
        thematicMeaning: 'Tố cáo chính sách sưu thuế phi nhân tính và ngợi ca vẻ đẹp phẩm chất người phụ nữ nông dân.',
        topic: 'Số phận người phụ nữ & Phản kháng',
        source: 'SGK Ngữ văn 8 - NXB Giáo dục Việt Nam; Tác phẩm Tắt đèn - Ngô Tất Tố',
        status: 'published',
        locSlugs: ['bac-ninh-kinh-bac'],
        relationType: 'origin',
        notes: 'Bối cảnh làng Đông Xá (thuộc tổng Yên Phụ, huyện Yên Phong, tỉnh Bắc Ninh quê hương Ngô Tất Tố).'
    },
    {
        title: 'Đoàn thuyền đánh cá',
        slug: 'doan-thuyen-danh-ca',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Thơ ca Hiện đại (1958)',
        region: 'Bắc',
        author: 'Huy Cận',
        summary: 'Bài thơ tràn ngập ánh sáng, âm thanh và sắc màu tráng lệ ngợi ca khí thế lao động hào hùng của những ngư dân vùng biển Hòn Gai - Quảng Ninh trong công cuộc xây dựng cuộc sống mới.',
        quote: 'Mặt trời xuống biển như hòn lửa / Sóng đã cài then, đêm sập cửa / Đoàn thuyền đánh cá lại ra khơi / Câu hát căng buồm cùng gió khơi...',
        content: 'Sáng tác trong chuyến đi thực tế dài ngày tại vùng mỏ và vịnh Hạ Long năm 1958, đánh dấu sự hồi sinh rực rỡ trong hồn thơ Huy Cận từ "Lửa thiêng" u buồn sang niềm vui cuộc đời mới.',
        historicalContext: 'Giai đoạn miền Bắc khôi phục kinh tế và hăng say lao động sau chiến thắng Điện Biên Phủ.',
        thematicMeaning: 'Ca ngợi sự hòa hợp giữa con người lao động làm chủ thiên nhiên và sự trù phú của biển trời Tổ quốc.',
        topic: 'Lao động & Vẻ đẹp Đất nước',
        source: 'SGK Ngữ văn 9 - NXB Giáo dục Việt Nam; Tập thơ Trời mỗi ngày lại sáng (1958)',
        status: 'published',
        locSlugs: ['quang-ninh-bach-dang-hon-gai'],
        relationType: 'origin',
        notes: 'Vùng biển Hòn Gai, Cẩm Phả và vịnh Hạ Long tỉnh Quảng Ninh trù phú tôm cá.'
    },
    {
        title: 'Chiếc thuyền ngoài xa',
        slug: 'chiec-thuyen-ngoai-xa',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Đổi mới (1983)',
        region: 'Trung',
        author: 'Nguyễn Minh Châu',
        summary: 'Truyện ngắn xuất sắc mang tính triết lý sâu sắc về mối quan hệ giữa nghệ thuật và cuộc sống, giữa cái nhìn bề ngoài toàn bích với hiện thực đời sống góc cạnh, lam lũ đầy nghịch lý của gia đình người đàn bà hàng chài miền Trung.',
        quote: 'Bản thân cái đẹp chính là đạo đức... Nhưng đằng sau cái đẹp toàn bích ấy lại là nỗi đau đớn nhọc nhằn khôn xiết của kiếp người...',
        content: 'Nghệ sĩ nhiếp ảnh Phùng chụp được bức ảnh tuyệt tác về chiếc thuyền ngoài xa trong sương sớm, nhưng khi thuyền cập bờ, anh bàng hoàng chứng kiến cảnh tượng người chồng vũ phu đánh đập vợ tàn bạo.',
        historicalContext: 'Giai đoạn đầu thời kỳ Đổi mới văn học sau 1975, hướng về những vấn đề thế sự nhân sinh.',
        thematicMeaning: 'Cần nhìn nhận cuộc đời và con người đa diện, nhiều chiều, không thể đơn giản xuôi chiều.',
        topic: 'Triết lý nghệ thuật & Thế sự nhân sinh',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Tuyển tập Nguyễn Minh Châu',
        status: 'published',
        locSlugs: ['quang-binh-deo-ngang', 'thua-thien-hue'],
        relationType: 'associated',
        notes: 'Bối cảnh vùng biển đầm phá miền Trung đầy nắng gió với bãi cát dài và chiếc thuyền chài trôi dạt mưu sinh.'
    },
    {
        title: 'Rừng xà nu',
        slug: 'rung-xa-nu',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện đại (1965)',
        region: 'Trung',
        author: 'Nguyễn Trung Thành',
        summary: 'Thiên truyện sử thi hoành tráng viết về cuộc chiến đấu bất khuất kiên cường của dân làng Xô Man vùng cao Tây Nguyên do cụ Mết và anh Tnú dẫn đầu trong phong trào Đồng khởi chống đế quốc Mỹ.',
        quote: 'Không có cây nào bị thương mà lại tuyệt chủng. Cạnh một cây xà nu mới ngã gục, đã có bốn năm cây con mọc lên, ngọn xanh rờn, hình nhọn mũi tên lao thẳng lên bầu trời...',
        content: 'Cây xà nu là biểu tượng trung tâm cho sức sống bất diệt, lòng kiên trung và phẩm chất anh hùng của đồng bào Tây Nguyên.',
        historicalContext: 'Chiến trường Tây Nguyên năm 1965 khi đế quốc Mỹ ồ ạt đưa quân viễn chinh vào miền Nam.',
        thematicMeaning: 'Chúng nó đã cầm súng, mình phải cầm giáo! Con đường đấu tranh vũ trang giải phóng dân tộc.',
        topic: 'Chủ nghĩa Anh hùng Cách mạng',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Tuyển tập Nguyễn Trung Thành',
        status: 'published',
        locSlugs: ['tay-nguyen-dai-ngan-xo-man'],
        relationType: 'origin',
        notes: 'Bối cảnh làng Xô Man nằm giữa đại ngàn rừng xà nu bạt ngàn tại tỉnh Kon Tum / Gia Lai.'
    },
    {
        title: 'Đất Nước (Trích Trường ca Mặt đường khát vọng)',
        slug: 'dat-nuoc-nguyen-khoa-diem',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Thơ ca Hiện đại (1971)',
        region: 'Trung',
        author: 'Nguyễn Khoa Điềm',
        summary: 'Đoạn trích thơ tuyệt tác định nghĩa khái niệm Đất Nước từ cội nguồn ca dao, cổ tích, phong tục tập quán bình dị đến chiều dài lịch sử bốn nghìn năm mồ hôi và xương máu của Nhân dân.',
        quote: 'Đất Nước bắt đầu với miếng trầu bây giờ bà ăn / Đất Nước lớn lên khi dân mình biết trồng tre mà đánh giặc... Đất Nước này là Đất Nước của Nhân dân...',
        content: 'Sáng tác tại chiến khu Trị Thiên năm 1971, thức tỉnh thanh niên trí thức các đô thị tạm chiếm miền Nam xuống đường đấu tranh chống xâm lược.',
        historicalContext: 'Chiến trường Trị Thiên khói lửa thời kỳ kháng chiến chống Mỹ.',
        thematicMeaning: 'Tư tưởng cốt lõi: "Đất Nước của Nhân dân, Đất Nước của ca dao thần thoại".',
        topic: 'Tình yêu Quê hương & Lòng yêu nước',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Trường ca Mặt đường khát vọng',
        status: 'published',
        locSlugs: ['thua-thien-hue'],
        relationType: 'origin',
        notes: 'Hoàn thành tại căn cứ địa kháng chiến huyện A Lưới, chiến khu Trị Thiên (Thừa Thiên Huế).'
    },
    {
        title: 'Ai đã đặt tên cho dòng sông?',
        slug: 'ai-da-dat-ten-cho-dong-song',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Bút ký Hiện đại (1981)',
        region: 'Trung',
        author: 'Hoàng Phủ Ngọc Tường',
        summary: 'Bút ký văn chương bậc thầy tái hiện vẻ đẹp đa dạng của dòng sông Hương xứ Huế: từ cô gái Di-gan phóng khoáng giữa rừng già Trường Sơn, người mẹ phù sa dịu dàng đến người tình thủy chung sâu lắng của Cố đô Huế.',
        quote: 'Trong những dòng sông đẹp ở các nước mà tôi thường nghe nói đến, hình như chỉ sông Hương là thuộc về một thành phố duy nhất...',
        content: 'Tác phẩm kết hợp nhuần nhuyễn giữa trí tuệ uyên bác, vốn văn hóa lịch sử sâu rộng và tâm hồn thi sĩ đắm say với vẻ đẹp thiên nhiên xứ Huế.',
        historicalContext: 'Việt Nam sau ngày hòa bình thống nhất đất nước, tôn vinh các giá trị di sản văn hóa dân tộc.',
        thematicMeaning: 'Tình yêu tha thiết, niềm tự hào sâu sắc dành cho dòng sông Hương và mảnh đất Cố đô nghìn năm văn vật.',
        topic: 'Thiên nhiên & Bản sắc Văn hóa Huế',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Bút ký Hoàng Phủ Ngọc Tường',
        status: 'published',
        locSlugs: ['thua-thien-hue'],
        relationType: 'origin',
        notes: 'Trọn vẹn lưu vực sông Hương từ thượng nguồn đại ngàn Trường Sơn qua Kim Long, Cố đô Huế ra phá Tam Giang.'
    },
    {
        title: 'Đất rừng phương Nam',
        slug: 'dat-rung-phuong-nam',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Tiểu thuyết Hiện đại (1957)',
        region: 'Nam',
        author: 'Đoàn Giỏi',
        summary: 'Thiên tiểu thuyết bất hủ đưa người đọc theo bước chân lưu lạc của cậu bé An khám phá vùng đất Nam Bộ trù phú, hoang sơ với rừng tràm U Minh, nghề săn cá sấu, lấy mật ong rừng và tấm lòng trượng nghĩa kiên cường của người phương Nam.',
        quote: 'Thế là từ đây, tôi bắt đầu cuộc đời lưu lạc, bước vào thế giới kỳ bí của rừng U Minh và sông nước Cửu Long...',
        content: 'Khắc họa sinh động đời sống phóng khoáng, dũng cảm và gắn bó sắt son với cách mạng của người dân Nam Bộ trong kháng chiến chống Pháp.',
        historicalContext: 'Thời kỳ kháng chiến chống Pháp tại chiến khu miền Tây Nam Bộ.',
        thematicMeaning: 'Ngợi ca vẻ đẹp trù phú của thiên nhiên phương Nam và nghĩa khí hào sảng của con người Nam Bộ.',
        topic: 'Thiên nhiên & Nghĩa khí Phương Nam',
        source: 'NXB Kim Đồng; Tuyển tập Đoàn Giỏi',
        status: 'published',
        locSlugs: ['ca-mau-u-minh', 'can-tho-tay-do'],
        relationType: 'origin',
        notes: 'Vùng sông nước Cửu Long, rừng tràm U Minh Thượng và U Minh Hạ (Cà Mau - Kiên Giang).'
    },
    {
        title: 'Hương rừng Cà Mau',
        slug: 'huong-rung-ca-mau',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện đại (1962)',
        region: 'Nam',
        author: 'Sơn Nam',
        summary: 'Tập truyện ngắn đậm đà phong vị sông nước Nam Bộ, tái hiện công cuộc khai hoang mở cõi đầy nhọc nhằn, hiểm nguy nhưng thấm đượm nghĩa tình của bao thế hệ lưu dân trên vùng đất Mũi Cà Mau cuối trời Tổ quốc.',
        quote: 'Hạt phù sa bồi đắp dải đất này cũng như mồ hôi nước mắt của tiền nhân khai khẩn...',
        content: 'Sơn Nam được mệnh danh là "nhà Nam Bộ học", ngôn ngữ mộc mạc, giàu từ địa phương, ghi lại tập quán bắt rắn, bắt sấu, dựng chòi giữ rừng độc nhất vô nhị.',
        historicalContext: 'Công cuộc khẩn hoang Nam Bộ thế kỷ XIX - XX và những biến thiên lịch sử đất rừng phương Nam.',
        thematicMeaning: 'Khúc tráng ca ngợi ca ý chí chinh phục thiên nhiên và lòng gắn bó máu thịt với quê hương xứ sở.',
        topic: 'Khai hoang mở cõi & Phong vị Nam Bộ',
        source: 'NXB Trẻ; Tuyển tập Sơn Nam',
        status: 'published',
        locSlugs: ['ca-mau-u-minh'],
        relationType: 'origin',
        notes: 'Vùng đất Mũi Cà Mau, ngã ba sông Ông Đốc và rừng đước bạt ngàn cuối dải đất hình chữ S.'
    },
    {
        title: 'Bạch Đằng Giang Phú',
        slug: 'bach-dang-giang-phu',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        period: 'Văn học Lý - Trần (Thế kỷ XIV)',
        region: 'Bắc',
        author: 'Trương Hán Siêu',
        summary: 'Kiệt tác thể phú cổ điển bằng chữ Hán, tái hiện chiến công lẫy lừng của Ngô Quyền và Trần Hưng Đạo trên sông Bạch Đằng, đồng thời đúc kết chân lý lịch sử: non sông vững bền cốt ở đức lớn của con người chứ không chỉ ở thế hiểm non sông.',
        quote: 'Đến đây sông nước mênh mông / Sóng dồn lớp lớp, ngút trùng cồn dâu / Giáo gãy chìm sâu, xương khô gò đống... Quả là trời đất sinh ra nơi hiểm yếu / Cũng bởi nhân tài giữ vững cơ đồ!',
        content: 'Trương Hán Siêu du ngoạn sông Bạch Đằng, lắng nghe các bô lão kể lại chiến tích xưa, dâng trào niềm hoài niệm lịch sử và tự hào dân tộc sâu sắc.',
        historicalContext: 'Thời Trần sau ba lần đại thắng quân xâm lược Mông Nguyên hiển hách.',
        thematicMeaning: 'Niềm tự hào dân tộc và bài học trị quốc: "Cốt ở đức lớn, đâu phải vì đất hiểm".',
        topic: 'Lịch sử & Hào khí Đông A',
        source: 'SGK Ngữ văn 10 - NXB Giáo dục Việt Nam; Thơ văn Lý - Trần',
        status: 'published',
        locSlugs: ['quang-ninh-bach-dang-hon-gai'],
        relationType: 'origin',
        notes: 'Dòng sông Bạch Đằng lịch sử chảy giữa Quảng Ninh và Hải Phòng với bãi cọc ngầm đánh tan giặc ngoại xâm.'
    },
    {
        title: 'Chuyện người con gái Nam Xương',
        slug: 'chuyen-nguoi-con-gai-nam-xuong',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        period: 'Văn học Trung đại (Thế kỷ XVI)',
        region: 'Bắc',
        author: 'Nguyễn Dữ',
        summary: 'Truyện truyền kỳ trích trong "Truyền kỳ mạn lục", xót thương cho số phận oan khuất của nàng Vũ Nương - người phụ nữ đức hạnh, hiếu nghĩa vẹn toàn nhưng bị mối nghi ngờ vô căn cứ của người chồng đẩy đến bi kịch trầm mình tự vẫn.',
        quote: 'Kẻ bạc mệnh này duyên phận hẩm hiu, chồng con rẫy bỏ, điều đâu bay buộc, tiếng chịu nhuốc nhơ... Xin soi xét tấm lòng trong trắng!',
        content: 'Kết hợp hài hòa giữa yếu tố hiện thực tố cáo chế độ phụ quyền nam quyền độc đoán và yếu tố kỳ ảo (thế giới thủy cung của Linh Phi) an ủi người phụ nữ.',
        historicalContext: 'Xã hội phong kiến Việt Nam thời kỳ nội chiến Nam - Bắc triều đầy loạn lạc thế kỷ XVI.',
        thematicMeaning: 'Ngợi ca phẩm hạnh cao đẹp và bày tỏ niềm cảm thông sâu sắc với bi kịch người phụ nữ trong xã hội cũ.',
        topic: 'Số phận người phụ nữ & Nhân đạo',
        source: 'SGK Ngữ văn 9 - NXB Giáo dục Việt Nam; Truyền kỳ mạn lục - Nguyễn Dữ',
        status: 'published',
        locSlugs: ['ha-nam-lang-vu-dai'],
        relationType: 'origin',
        notes: 'Bến đò Hoàng Giang, huyện Nam Xương (nay là huyện Lý Nhân, tỉnh Hà Nam) nơi dựng đền thờ Vũ Nương.'
    },
    {
        title: 'Chiếu dời đô (Thiên đô chiếu)',
        slug: 'chieu-doi-do',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        period: 'Văn học Lý - Trần (Năm 1010)',
        region: 'Bắc',
        author: 'Lý Thái Tổ (Lý Công Uẩn)',
        summary: 'Áng văn chính luận kiệt xuất của vua Lý Thái Tổ trình bày lý do dời đô từ vùng núi hiểm trở Hoa Lư ra trung tâm đồng bằng châu thổ sông Hồng - mảnh đất Đại La (Thăng Long), khẳng định tầm nhìn chiến lược phát triển đất nước trường tồn.',
        quote: 'Huống chi thành Đại La, đô cũ của Cao Vương: Ở vào nơi trung tâm trời đất; được cái thế rồng cuộn hổ ngồi... Thật là chốn tụ hội trọng yếu của bốn phương đất nước; đúng là nơi kinh đô bậc nhất của đế vương muôn đời!',
        content: 'Ban hành mùa thu năm Canh Tuất (1010), mở đầu cho lịch sử nghìn năm văn hiến Thăng Long - Hà Nội.',
        historicalContext: 'Vua Lý Thái Tổ vừa lên ngôi, mở ra vương triều nhà Lý hưng thịnh.',
        thematicMeaning: 'Khát vọng xây dựng một quốc gia độc lập, thống nhất, hùng mạnh và trường tồn.',
        topic: 'Ý chí Tự cường & Tầm nhìn Quốc gia',
        source: 'SGK Ngữ văn 8 - NXB Giáo dục Việt Nam; Đại Việt Sử Ký Toàn Thư',
        status: 'published',
        locSlugs: ['ninh-binh-hoa-lu', 'ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Văn bản quyết định lịch sử nối liền Cố đô Hoa Lư (Ninh Bình) với Kinh thành Thăng Long (Hà Nội).'
    },
    {
        title: 'Văn tế nghĩa sĩ Cần Giuộc',
        slug: 'van-te-nghia-si-can-giuoc',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        period: 'Văn học Trung đại (1861)',
        region: 'Nam',
        author: 'Nguyễn Đình Chiểu',
        summary: 'Đỉnh cao của thể văn tế Việt Nam, dựng tượng đài bất hủ đầu tiên về người nghĩa binh nông dân Nam Bộ áo vải chân đất, tay cầm ngọn tầm vông đứng lên chống giặc Pháp xâm lược.',
        quote: 'Nhớ linh xưa: Cui cút làm ăn; toan lo nghèo khó... Bữa thấy bòng bong che trắng lốp, muốn tới ăn gan; ngày xem ống khói chạy đen sì, muốn ra cắn cổ... Sống đánh giặc, thác cũng đánh giặc, linh hồn theo giúp cơ binh!',
        content: 'Viết theo yêu cầu của Tuần phủ Gia Định Đỗ Thúc Tịnh để đọc tại lễ truy điệu các nghĩa sĩ hy sinh trong trận tập kích đồn Cần Giuộc đêm rằm tháng 11 năm 1861.',
        historicalContext: 'Thực dân Pháp tấn công đánh chiếm Gia Định và các tỉnh Nam Kỳ lục tỉnh đầu thập niên 1860.',
        thematicMeaning: 'Tôn vinh tinh thần yêu nước xả thân vì nghĩa lớn của những người nông dân bình dị.',
        topic: 'Lòng yêu nước & Khí phách Nam Bộ',
        source: 'SGK Ngữ văn 11 - NXB Giáo dục Việt Nam; Thơ văn Nguyễn Đình Chiểu',
        status: 'published',
        locSlugs: ['tphcm-ben-nghe'],
        relationType: 'origin',
        notes: 'Khắc họa khí phách người nông dân lục tỉnh Nam Kỳ quanh vùng đất Bến Nghé - Gia Định và nghĩa trang Cần Giuộc.'
    },
    {
        title: 'Viếng lăng Bác',
        slug: 'vieng-lang-bac',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Thơ ca Hiện đại (1976)',
        region: 'Bắc',
        author: 'Viễn Phương',
        summary: 'Bài thơ chứa chan niềm xúc động thiêng liêng, lòng biết ơn sâu sắc và nỗi tiếc thương vô hạn của một người con miền Nam sau ngày thống nhất lần đầu ra thăm lăng Chủ tịch Hồ Chí Minh.',
        quote: 'Con ở miền Nam ra thăm lăng Bác / Đã thấy trong sương hàng tre bát ngát / Ôi! Hàng tre xanh xanh Việt Nam / Bão táp mưa sa đứng thẳng hàng...',
        content: 'Sáng tác tháng 4 năm 1976 khi lăng Chủ tịch Hồ Chí Minh vừa được khánh thành. Đã được nhạc sĩ Hoàng Hiệp phổ nhạc thành ca khúc đi cùng năm tháng.',
        historicalContext: 'Đất nước hoàn toàn thống nhất sau đại thắng mùa xuân 1975.',
        thematicMeaning: 'Lòng kính yêu vô hạn của đồng bào cả nước đối với Bác Hồ kính yêu.',
        topic: 'Tình cảm với Lãnh tụ & Đất nước',
        source: 'SGK Ngữ văn 9 - NXB Giáo dục Việt Nam; Tập thơ Như mây mùa xuân',
        status: 'published',
        locSlugs: ['ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Quảng trường Ba Đình và Lăng Chủ tịch Hồ Chí Minh tại thủ đô Hà Nội linh thiêng.'
    },
    {
        title: 'Mùa Lạc',
        slug: 'mua-lac',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Văn học Hiện đại (1960)',
        region: 'Bắc',
        author: 'Nguyễn Khải',
        summary: 'Truyện ngắn xuất sắc về sự hồi sinh kỳ diệu của con người trên mảnh đất Điện Biên sau chiến tranh, tiêu biểu là số phận người đàn bà góa bụa Đào tìm lại được niềm tin yêu cuộc đời và hạnh phúc lứa đôi giữa mùa thu hoạch lạc bội thu.',
        quote: 'Sự sống nảy sinh từ cái chết, hạnh phúc hiện hình từ những hy sinh gian khổ, ở đời này không có con đường cùng, chỉ có những ranh giới, điều cốt yếu là phải có sức mạnh để bước qua những ranh giới ấy...',
        content: 'Sau chiến dịch Điện Biên, các chiến sĩ quân đội chuyển ngành lên xây dựng nông trường Điện Biên, biến bãi chiến trường bom đạn xưa thành cánh đồng trù phú.',
        historicalContext: 'Công cuộc xây dựng lại vùng Tây Bắc sau chiến thắng lịch sử Điện Biên Phủ 1954.',
        thematicMeaning: 'Triết lý nhân sinh sâu sắc: Sức sống của con người luôn trỗi dậy mạnh mẽ sau đau thương mất mát.',
        topic: 'Hồi sinh & Niềm tin Cuộc sống',
        source: 'SGK Ngữ văn 12 - NXB Giáo dục Việt Nam; Tuyển tập Nguyễn Khải',
        status: 'published',
        locSlugs: ['tay-bac-song-da-dien-bien'],
        relationType: 'origin',
        notes: 'Bối cảnh nông trường Điện Biên trên thung lũng Mường Thanh tỉnh Điện Biên.'
    },
    {
        title: 'Sự tích Hồ Gươm (Sự tích Trả gươm)',
        slug: 'su-tich-ho-guom',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết',
        period: 'Văn học Dân gian (Thời Hậu Lê)',
        region: 'Bắc',
        author: 'Dân gian',
        summary: 'Truyền thuyết bất hủ giải thích tên gọi Hồ Hoàn Kiếm, ca ngợi tính chất chính nghĩa, toàn dân của cuộc khởi nghĩa Lam Sơn và khát vọng hòa bình muôn thuở của dân tộc Việt Nam.',
        quote: 'Rùa Vàng bơi về phía thuyền rồng, ngậm lấy thanh kiếm báu Thuận Thiên rồi lặn xuống đáy nước...',
        content: 'Lê Lợi mượn được lưỡi gươm ở Thanh Hóa và chuôi gươm ở bìa rừng để đánh đuổi quân Minh. Sau khi thái bình định đô tại Thăng Long, Rùa Vàng nổi lên đòi gươm.',
        historicalContext: 'Cuộc khởi nghĩa Lam Sơn (1418 - 1427) và sự thành lập triều Hậu Lê.',
        thematicMeaning: 'Khẳng định sức mạnh đoàn kết toàn dân và khát vọng yêu chuộng hòa bình của dân tộc.',
        topic: 'Lịch sử & Hòa bình dân tộc',
        source: 'Kho tàng Truyện dân gian Việt Nam; SGK Ngữ văn 6',
        status: 'published',
        locSlugs: ['ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Hồ Lục Thủy xưa - tức Hồ Hoàn Kiếm (Hồ Gươm) ngay giữa lòng thủ đô Hà Nội ngàn năm văn hiến.'
    },
    {
        title: 'Hải đội Hoàng Sa & Ký sự Phủ Biên Tạp Lục',
        slug: 'ky-su-hai-doi-hoang-sa',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        period: 'Văn học Trung đại (1776)',
        region: 'Trung',
        author: 'Bác học Lê Quý Đôn',
        summary: 'Tác phẩm văn sử học kinh điển ghi chép cặn kẽ hải trình, việc xác lập chủ quyền và hoạt động của Hải đội Hoàng Sa thời các chúa Nguyễn: hàng năm vào tháng 3 ra khơi đến các đảo thu lượm hải vật, đo đạc hải trình và bảo vệ bờ cõi.',
        quote: 'Phủ Quảng Ngãi, huyện Bình Sơn có xã An Vĩnh, ở ngoài bờ biển, ngoài biển về phía đông bắc có nhiều cù lao, các núi linh tinh hơn 130 ngọn... Chúa Nguyễn đặt đội Hoàng Sa 70 suất...',
        content: 'Chứng cứ lịch sử và văn chương bác học sáng ngời khẳng định chủ quyền nghìn đời của dân tộc Việt Nam trên hai quần đảo Hoàng Sa và Trường Sa.',
        historicalContext: 'Thời chúa Nguyễn Đàng Trong thế kỷ XVII - XVIII.',
        thematicMeaning: 'Khẳng định ý chí kiên cường bám biển và chủ quyền biển đảo thiêng liêng bất khả xâm phạm của Tổ quốc.',
        topic: 'Chủ quyền Biển đảo & Lịch sử',
        source: 'Phủ Biên Tạp Lục - Lê Quý Đôn (1776); Đại Nam Thực Lục',
        status: 'published',
        locSlugs: ['quan-dao-hoang-sa', 'quan-dao-truong-sa'],
        relationType: 'origin',
        notes: 'Hải đội Hoàng Sa xuất phát từ cửa biển Sa Kỳ và đảo Lý Sơn vươn khơi xác lập chủ quyền trên quần đảo Hoàng Sa và Trường Sa.'
    },
    {
        title: 'Tổ quốc nhìn từ biển',
        slug: 'to-quoc-nhin-tu-bien',
        category: 'hien-dai',
        categoryName: 'Văn học Hiện đại',
        period: 'Thơ ca Đương đại (2009)',
        region: 'Trung',
        author: 'Nguyễn Việt Chiến',
        summary: 'Bài thơ hào hùng lay động hàng triệu trái tim người Việt, khắc họa hình tượng Tổ quốc sừng sững nhìn từ trùng khơi sóng gió với những người lính đảo kiên cường đứng gác nơi tiền tiêu Trường Sa và Hoàng Sa.',
        quote: 'Nếu Tổ quốc đang bão giông từ biển / Có một phần máu thịt ở Hoàng Sa / Ngàn năm trước con theo cha xuống biển / Mẹ lên rừng mang bốn chín con theo...',
        content: 'Bài thơ được bình chọn là một trong những thi phẩm xúc động nhất về tình yêu biển đảo, nhắc nhở thế hệ hôm nay ghi nhớ công ơn bao thế hệ đã ngã xuống vì chủ quyền biển đảo.',
        historicalContext: 'Thời kỳ bảo vệ chủ quyền biển đảo thềm lục địa Việt Nam đầu thế kỷ XXI.',
        thematicMeaning: 'Khơi dậy lòng yêu nước, niềm tự hào dân tộc và trách nhiệm bảo vệ vẹn toàn lãnh thổ quốc gia.',
        topic: 'Chủ quyền Biển đảo & Tình yêu Tổ quốc',
        source: 'Báo Văn Nghệ; Tuyển tập Thơ Biển đảo Việt Nam',
        status: 'published',
        locSlugs: ['quan-dao-truong-sa', 'quan-dao-hoang-sa'],
        relationType: 'associated',
        notes: 'Âm hưởng Trường Sa và Hoàng Sa - phên dậu thiêng liêng nơi đầu sóng ngọn gió của Tổ quốc Việt Nam.'
    },
    {
        title: 'Đất Quảng Nam chưa mưa đà thấm',
        slug: 'dat-quang-nam-chua-mua-da-tham',
        category: 'co-tich',
        categoryName: 'Cổ tích & Dân gian',
        period: 'Văn học Dân gian Xứ Quảng',
        region: 'Trung',
        author: 'Dân gian Xứ Quảng',
        summary: 'Tác phẩm văn học dân gian gắn liền với mảnh đất Ngũ Phụng Tề Phi, ngợi ca tính cách bộc trực, hiếu học, trượng nghĩa và tấm lòng hiếu khách thủy chung của con người xứ Quảng bên dòng sông Thu Bồn.',
        quote: 'Đất Quảng Nam chưa mưa đà thấm / Rượu Hồng Đào chưa nhấm đà say / Lòng ta như ngọn gió bay / Vấn vương phố Hội những ngày bên em...',
        content: 'Khắc họa bức tranh văn hóa độc đáo của phố cổ Hội An, di sản thánh địa Mỹ Sơn và tinh thần khai phóng của vùng đất mở cõi miền Trung.',
        historicalContext: 'Thời kỳ phát triển thịnh vượng của thương cảng quốc tế Hội An thế kỷ XVI - XVIII.',
        thematicMeaning: 'Ca ngợi tình người đằm thắm và truyền thống văn hóa hiếu học, kiên trung của con người xứ Quảng.',
        topic: 'Bản sắc Xứ Quảng & Tình yêu quê hương',
        source: 'Địa chí Quảng Nam; Tạp chí Văn hóa Xứ Quảng',
        status: 'published',
        locSlugs: ['quang-nam-hoi-an'],
        relationType: 'origin',
        notes: 'Gắn liền với không gian phố cổ Hội An, sông Thu Bồn và vùng đất văn vật Ngũ Phụng Tề Phi.'
    }
];

const EXISTING_WORK_LOCATIONS = [
    {
        slug: 'day-thon-vi-da',
        locs: ['thua-thien-hue'],
        relationType: 'origin',
        notes: 'Lấy cảm hứng từ mối tình đơn phương và cảnh sắc thôn Vĩ Dạ bên dòng sông Hương xứ Huế thơ mộng.'
    },
    {
        slug: 'nam-quoc-son-ha',
        locs: ['bac-ninh-kinh-bac', 'ha-noi-thang-long'],
        relationType: 'associated',
        notes: 'Tuyên ngôn độc lập đầu tiên vang lên bên phòng tuyến sông Như Nguyệt (Bắc Ninh) chặn đứng 30 vạn quân Tống.'
    },
    {
        slug: 'binh-ngo-dai-cao',
        locs: ['ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Bản tuyên ngôn độc lập thứ hai được công bố tại kinh thành Thăng Long sau đại thắng quân Minh.'
    },
    {
        slug: 'qua-deo-ngang',
        locs: ['quang-binh-deo-ngang', 'ha-tinh-nghi-xuan'],
        relationType: 'origin',
        notes: 'Kiệt tác thơ Đường luật thất ngôn bát cú sáng tác khi nữ sĩ dừng chân ngắm cảnh Đèo Ngang lúc chiều tà.'
    },
    {
        slug: 'thu-dieu',
        locs: ['ha-nam-lang-vu-dai'],
        relationType: 'origin',
        notes: 'Khung cảnh mùa thu làng quê Yên Đổ (Bình Lục, Hà Nam) với ao thu lạnh lẽo, ngõ trúc quanh co.'
    },
    {
        slug: 'tay-tien',
        locs: ['tay-bac-song-da-dien-bien'],
        relationType: 'origin',
        notes: 'Hành quân hào hùng và bi tráng của đoàn quân Tây Tiến qua Mường Lát, Pha Luông, Sài Khao, Sông Mã.'
    },
    {
        slug: 'dong-chi',
        locs: ['cao-bang-cao-binh'],
        relationType: 'associated',
        notes: 'Viết tại chiến khu Việt Bắc sau chiến dịch Việt Bắc thu đông 1947, tôn vinh tình đồng chí cao đẹp.'
    },
    {
        slug: 'bai-tho-ve-tieu-doi-xe-khong-kinh',
        locs: ['quang-binh-deo-ngang'],
        relationType: 'origin',
        notes: 'Khắc họa khí phách hiên ngang lạc quan của người lính lái xe trên tuyến đường Trường Sơn khói lửa.'
    },
    {
        slug: 'truyen-kieu',
        locs: ['ha-tinh-nghi-xuan', 'ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Kiệt tác truyện thơ của Đại thi hào Nguyễn Du gắn liền quê hương Tiên Điền (Nghi Xuân, Hà Tĩnh) và Thăng Long.'
    },
    {
        slug: 'thanh-giong',
        locs: ['ha-noi-thang-long', 'bac-ninh-kinh-bac'],
        relationType: 'origin',
        notes: 'Truyền thuyết gắn liền làng Phù Đổng (Gia Lâm) và tượng đài Núi Sóc (Sóc Sơn, Hà Nội).'
    },
    {
        slug: 'son-tinh-thuy-tinh',
        locs: ['phu-tho-dat-to', 'ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Không gian huyền thoại Núi Tản Viên (Ba Vì, Hà Nội) và vùng đất Tổ Phong Châu (Phú Thọ).'
    },
    {
        slug: 'thach-sanh',
        locs: ['cao-bang-cao-binh'],
        relationType: 'origin',
        notes: 'Truyện cổ tích gắn liền vùng núi rừng Cao Bằng (núi Cốc Vành và hang chằn tinh).'
    },
    {
        slug: 'su-tich-trau-cau',
        locs: ['ha-noi-thang-long'],
        relationType: 'origin',
        notes: 'Truyền thuyết cổ xưa về nghĩa vợ chồng và tình anh em hòa thuận lưu truyền khắp đồng bằng Bắc Bộ.'
    }
];

/**
 * Tự động đồng bộ Địa danh & Tác phẩm văn học vào MongoDB
 * Chạy an toàn (Idempotent - không gây trùng lặp) mỗi khi Server khởi động
 */
async function seedLiteratureMap() {
    try {
        console.log('[Seed Literature Map] Đang kiểm tra dữ liệu bản đồ văn học...');

        // 1. Đồng bộ các địa phương văn hóa
        for (const loc of LOCATIONS_DATA) {
            await Location.findOneAndUpdate(
                { slug: loc.slug },
                { $set: loc },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            );
        }

        // Lấy danh sách map slug -> _id
        const allLocs = await Location.find({}, '_id slug').lean();
        const locMap = {};
        allLocs.forEach(l => { locMap[l.slug] = l._id; });

        // 2. Gỡ bỏ liên kết địa phương của Ca dao & Tục ngữ (vì văn học truyền khẩu không thể gán vào 1 tỉnh cụ thể)
        await Work.updateMany(
            { category: { $in: ['ca-dao', 'tuc-ngu'] }, locationIds: { $exists: true, $not: { $size: 0 } } },
            { $set: { locationIds: [], locationRelations: [] } }
        );

        // 3. Cập nhật các tác phẩm có sẵn vào đúng vị trí địa lý
        for (const item of EXISTING_WORK_LOCATIONS) {
            const locIds = item.locs.map(s => locMap[s]).filter(Boolean);
            if (locIds.length > 0) {
                const relations = locIds.map(id => ({
                    locationId: id,
                    relationType: item.relationType,
                    notes: item.notes,
                }));
                await Work.updateOne(
                    { slug: item.slug },
                    { $set: { locationIds: locIds, locationRelations: relations } }
                );
            }
        }

        // 4. Đồng bộ các tác phẩm văn học kiệt tác mới
        for (const w of LITERARY_WORKS_DATA) {
            const locIds = (w.locSlugs || []).map(s => locMap[s]).filter(Boolean);
            const relations = locIds.map(id => ({
                locationId: id,
                relationType: w.relationType || 'origin',
                notes: w.notes || '',
            }));

            const payload = {
                title: w.title,
                slug: w.slug,
                category: w.category,
                categoryName: w.categoryName,
                period: w.period,
                region: w.region,
                author: w.author,
                summary: w.summary,
                quote: w.quote || '',
                content: w.content || '',
                historicalContext: w.historicalContext || '',
                thematicMeaning: w.thematicMeaning || '',
                topic: w.topic || 'Văn học Di sản',
                source: w.source,
                status: 'published',
                locationIds: locIds,
                locationRelations: relations,
            };

            await Work.findOneAndUpdate(
                { slug: w.slug },
                { $set: payload },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            );
        }

        console.log('[Seed Literature Map] ✅ Bản đồ Tác phẩm Văn học đã được đồng bộ tự động thành công!');
        return { success: true };
    } catch (err) {
        console.error('[Seed Literature Map] ❌ Lỗi đồng bộ bản đồ:', err.message);
        throw err;
    }
}

module.exports = seedLiteratureMap;
