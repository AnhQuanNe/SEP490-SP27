/**
 * SCRIPT CẬP NHẬT DỮ LIỆU DỊ BẢN DÂN GIAN HỌC THUẬT (FOLK VARIANTS)
 * Dự án: VietHeritage AI (SEP490)
 * Nguồn thẩm định: GS. Vũ Ngọc Phan, GS. Đinh Gia Khánh, GS. Nguyễn Đổng Chi, 
 *                  Viện Văn học & Kho tàng Ca dao Tục ngữ người Việt
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Work = require('../models/Work');

const variantsData = [
    {
        slug: 'gio-dua-canh-truc-la-da',
        variants: [
            {
                name: 'Nguyên bản Thăng Long — Hà Nội (Bắc Bộ)',
                region: 'Hà Nội / Bắc Bộ',
                quote: 'Gió đưa cành trúc la đà\nTiếng chuông Trấn Vũ canh gà Thọ Xương\nMịt mù khói tỏa ngàn sương\nNhịp chày Yên Thái mặt gương Tây Hồ.',
                content: 'Bản ca dao khắc họa không gian bảng lảng sương sớm của kinh thành Thăng Long xưa với các địa danh lịch sử nổi tiếng: Đền Quán Trấn Vũ (thờ Huyền Thiên Trấn Vũ), làng Thọ Xương, làng làm giấy dó Yên Thái bên bờ Hồ Tây thanh bình.',
                differenceNote: 'Gắn liền với không gian văn hóa Thăng Long nghìn năm văn hiến, nhấn mạnh vẻ đẹp cổ kính, thanh lịch và nhịp sống êm đềm của kinh đô.',
                scholarlyAnalysis: 'Đây là bản nguyên gốc chuẩn mực nhất được ghi chép trong nhiều tư liệu Hán Nôm cổ, biểu tượng cho thi vị trữ tình của đất Tràng An.',
                source: 'Ca dao Hà Nội — GS. Vũ Ngọc Phan, NXB Hà Nội.'
            },
            {
                name: 'Dị bản Nam Bộ (Lục Tỉnh Nam Kỳ / Cần Thơ)',
                region: 'Nam Bộ / Đồng bằng Sông Cửu Long',
                quote: 'Gió đưa cành trúc la đà\nTiếng chuông Trấn Vũ canh gà Thọ Xương\nThuyền ai trôi ngọn sông Tương\nPhải duyên thời xích, lỡ đường thời thôi.',
                content: 'Khi lưu dân người Việt vào phương Nam khai phá vùng đất mới, hai câu thơ đầu vẫn được lưu truyền như nỗi nhớ cội nguồn đất Bắc, nhưng hai câu sau được biến đổi hoàn toàn thành câu hát hò đối đáp lứa đôi mộc mạc trên sông nước phương Nam.',
                differenceNote: 'Hai câu cuối thay vì miêu tả cảnh Tây Hồ khói sương đã chuyển sang đề tài tâm tình lứa đôi mang tính phóng khoáng, tình cảm bộc trực của người Nam Bộ.',
                scholarlyAnalysis: 'Hiện tượng "Bắc kỳ Nam tiến" trong diễn xướng dân gian: Lưu dân mang theo ký ức văn hóa đất Thăng Long nhưng đã bản địa hóa theo tâm thức sông nước Nam Kỳ.',
                source: 'Văn học Dân gian Nam Bộ — Khoa Ngữ văn ĐHQG TP.HCM, NXB Trẻ.'
            },
            {
                name: 'Dị bản Xứ Huế (Miền Trung)',
                region: 'Thừa Thiên Huế / Miền Trung',
                quote: 'Gió đưa cành trúc la đà\nTiếng chuông Thiên Mụ canh gà Thọ Xương\nThuyền về xuôi mái sông Hương\nCó nghe khúc hát nhớ thương ai hoài.',
                content: 'Người dân Xứ Huế đã thay thế địa danh Đền Trấn Vũ bằng Chùa Thiên Mụ — danh thắng Phật giáo biểu tượng của sông Hương xứ Huế, tạo nên một thi ảnh trầm mặc, hoài niệm đặc trưng đất Cố đô.',
                differenceNote: 'Thay địa danh "Trấn Vũ" thành "Thiên Mụ", thay cảnh "Hồ Tây" thành "Sông Hương" để phù hợp với không gian địa văn hóa Cố đô Huế.',
                scholarlyAnalysis: 'Thể hiện tính địa phương hóa linh hoạt: Dân gian sẵn sàng mượn giai điệu ca dao quen thuộc để gắn kết với danh thắng tâm linh của quê hương mình.',
                source: 'Ca dao Dân ca Thừa Thiên Huế — Viện Văn hóa Dân gian, 1998.'
            }
        ]
    },
    {
        slug: 'thach-sanh',
        variants: [
            {
                name: 'Bản phổ thông người Kinh (Châu thổ sông Hồng)',
                region: 'Đồng bằng Bắc Bộ / Toàn quốc',
                quote: 'Đàn kêu tích tịch tình tang / Ai mang công chúa dưới hang trở về',
                content: 'Thạch Sanh mồ côi sống dưới gốc đa, được Ngọc Hoàng sai Thiên thần dạy võ nghệ và phép thần. Chàng giết Chằn tinh, bắn Đại bàng cứu công chúa Quỳnh Nga, giải thoát con vua Thủy Tề được tặng Đàn thần và Niêu cơm thần. Khi 18 nước chư hầu kéo quân sang đánh, Thạch Sanh gảy đàn khiến binh lính bỏ vũ khí quy phục, thết đãi niêu cơm thần ăn mãi không hết.',
                differenceNote: 'Cốt truyện hoàn chỉnh với các motif kỳ ảo: Chằn tinh, Đại bàng, Đàn thần cảm hóa chiến tranh và Niêu cơm thần hòa bình.',
                scholarlyAnalysis: 'Phản ánh khát vọng công lý, hòa bình và tư tưởng nhân đạo cao cả của dân tộc Việt Nam trước các cuộc chiến tranh xâm lược.',
                source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi, Tập 1.'
            },
            {
                name: 'Dị bản Sử thi Dân tộc Mường (Chàng Đực đá)',
                region: 'Hòa Bình / Miền núi Tây Bắc',
                quote: 'Tiếng khèn Thạch Sanh lay động rừng già, thần lũ chịu lui, người Mường yên ổn.',
                content: 'Trong truyện kể Mường, Thạch Sanh xuất thân sinh ra từ một khối đá lớn trên đỉnh núi đá vôi. Vũ khí của chàng không phải là gươm búa mà là chiếc nỏ thần bắn bách phát bách trúng và chiếc Khèn bè Mường. Tiếng khèn gọi gió, hóa giải oán hận giữa các bộ tộc bản địa.',
                differenceNote: 'Sinh ra từ đá (Thần thoại bọc đá cổ đại), sử dụng nỏ thần và khèn bè Mường thay vì đàn tỳ bà phương Bắc.',
                scholarlyAnalysis: 'Gốc tích Việt - Mường cổ đại phản ánh thời kỳ người tiền sử sống trong hang đá và chế ngự thú dữ trên vùng núi non Tây Bắc.',
                source: 'Văn học Dân gian Mường — GS. Đặng Nghiêm Vạn, NXB Khoa học Xã hội.'
            },
            {
                name: 'Dị bản Dân tộc Khmer Nam Bộ (Chàng Búa và Dạ Xoa)',
                region: 'Tây Nam Bộ (Sóc Trăng, Trà Vinh)',
                quote: 'Tâm Bồ Đề cảm hóa loài Dạ Xoa, búa thiêng cứu độ muôn dân khốn cùng.',
                content: 'Nhân vật chàng dũng sĩ nghèo cầm chiếc búa chặt củi đi chiến đấu với loài quái vật Dạ Xoa (Chằn/Yaksha) để cứu nàng công chúa Pơ-nhia. Điểm khác biệt lớn là chàng không giết tuyệt nọc loài Chằn mà dùng đạo lý từ bi để quy y cho Chằn tinh tu dưỡng làm điều thiện.',
                differenceNote: 'Mang màu sắc Phật giáo Nam tông Khmer sâu đậm: Hóa giải cái ác bằng tâm từ bi và lòng khoan dung thay vì tiêu diệt triệt để.',
                scholarlyAnalysis: 'Sự giao thoa giữa truyện cổ tích người Việt và triết lý Phật giáo Nam tông Khmer trong không gian văn hóa đa dân tộc Tây Nam Bộ.',
                source: 'Truyện cổ Khmer Nam Bộ — Viện Nghiên cứu Văn hóa Dân gian, 1995.'
            }
        ]
    },
    {
        slug: 'son-tinh-thuy-tinh',
        variants: [
            {
                name: 'Bản truyền thuyết Hùng Vương (Bản phổ thông)',
                region: 'Phú Thọ / Vùng Đất Tổ',
                quote: 'Voi chín ngà, gà chín cựa, ngựa chín hồng mao',
                content: 'Vua Hùng thứ 18 kén rể cho công chúa Mỵ Nương. Sơn Tinh (Chúa non Ba Vì) và Thủy Tinh (Chúa vùng biển sâu) cùng đến cầu hôn. Vua Hùng ra điều kiện sính lễ gồm các sản vật rừng núi hiếm có. Sơn Tinh đem lễ vật đến trước rước Mỵ Nương về núi. Thủy Tinh đến sau tức giận hô mưa gọi gió đánh ghen, hàng năm dâng nước sông Đà sông Hồng ngập tràn nhưng đều bị Sơn Tinh dâng núi cao hơn để ngăn chặn.',
                differenceNote: 'Mô tả cuộc kén rể mang màu sắc phong kiến sơ khai và sự thiên vị tế nhị của Vua Hùng cho vị thần bảo hộ núi non Ba Vì.',
                scholarlyAnalysis: 'Thần thoại hóa hiện tượng lũ lụt tự nhiên hàng năm của lưu vực sông Hồng và công cuộc đắp đê ngăn lũ bền bỉ của người Việt cổ.',
                source: 'Lĩnh Nam Chích Quái — Trần Thế Pháp (thế kỷ XIV).'
            },
            {
                name: 'Dị bản Sử thi Mường (Đẻ đất Đẻ nước — Dịt Dàng)',
                region: 'Hòa Bình / Phú Thọ',
                quote: 'Sông Đà gầm gào nước cuộn / Thần núi Tản vươn mình giữ bản làng',
                content: 'Trong sử thi Đẻ đất Đẻ nước, thần rừng núi đại ngàn Ba Vì và chúa Thủy Tộc sông Đà giao chiến không phải vì một người con gái, mà là cuộc chiến tranh giành lãnh địa sinh tồn giữa thế lực đại ngàn rừng xanh và thế lực sông lũ dữ dằn thời khai thiên lập địa.',
                differenceNote: 'Không có chi tiết kén rể công chúa Mỵ Nương; bản chất là thần thoại nguyên thủy về cuộc đụng độ giữa Lửa/Núi và Nước/Lũ.',
                scholarlyAnalysis: 'Tầng trầm tích nguyên thủy của thần thoại trước khi được các Nho sĩ thời phong kiến (thời Lý - Trần) văn bản hóa thành truyện truyền thuyết lịch sử Hùng Vương.',
                source: 'Sử thi Đẻ đất Đẻ nước — NXB Văn hóa Dân tộc.'
            }
        ]
    },
    {
        slug: 'su-tich-trau-cau',
        variants: [
            {
                name: 'Bản phổ thông Thời Hùng Vương (Kinh điển)',
                region: 'Toàn quốc',
                quote: 'Tân - Lang thắm đượm tình ruột thịt / Trầu Cau gắn bó nghĩa phu thê',
                content: 'Hai anh em sinh đôi Cao Tân và Cao Lang rất mực thương yêu nhau, cùng học đạo tại nhà thầy họ Lưu và người anh kết duyên với nàng Lưu thị. Vì sự hiểu lầm lúc sập tối khi nàng ôm nhầm người em, người em xấu hổ bỏ đi đến bên bờ sông gieo mình chết hóa thành tảng đá vôi. Người anh đi tìm kiệt sức hóa thành cây cau không cành. Người vợ tìm chồng ôm gốc cau hóa thành dây trầu không quấn chặt. Khi ăn chung lá trầu, hạt cau và vôi đá tạo nên màu đỏ son thắm thiết.',
                differenceNote: 'Nhấn mạnh bi kịch hiểu lầm vô tình và sự chuyển hóa thiêng liêng thành ba biểu tượng không thể tách rời.',
                scholarlyAnalysis: 'Giải thích nguồn gốc phong tục ăn trầu, lễ cưới hỏi và biểu tượng của tình anh em keo sơn, tình vợ chồng sắt son của người Việt.',
                source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.'
            },
            {
                name: 'Dị bản Dân tộc Mường (Chuyện Cây Cau và Nàng Vôi)',
                region: 'Vùng Tây Bắc / Thanh Hóa',
                quote: 'Lá cay quả chát hòa cùng đá trắng / Hóa giọt máu đào trừ khử tà ma',
                content: 'Truyện kể của đồng bào Mường gắn liền việc ăn trầu với tín ngưỡng trừ tà ma và nghi lễ cúng thần rừng, thần mó nước. Miếng trầu và hòn vôi được xem là chiếc khiên tâm linh bảo vệ phụ nữ sau sinh và thanh niên khi vào rừng sâu săn thú.',
                differenceNote: 'Gắn trầu cau với ma thuật bản địa và phong tục cúng tế bảo hộ con người trước thiên nhiên hoang dã.',
                scholarlyAnalysis: 'Thể hiện chức năng ma thuật tâm linh nguyên thủy của tục ăn trầu trước khi trở thành biểu tượng đạo lý gia đình trong xã hội Nho giáo.',
                source: 'Nghi lễ Dân gian Mường — Viện Văn học, 2002.'
            }
        ]
    },
    {
        slug: 'uong-nuoc-nho-nguon',
        variants: [
            {
                name: 'Bản tục ngữ cô đọng 4 chữ (Chuẩn mực)',
                region: 'Toàn quốc',
                quote: 'Uống nước nhớ nguồn',
                content: 'Câu tục ngữ cô đọng ngắn gọn nhưng mang dung lượng triết lý nhân sinh to lớn, nhắc nhở bổn phận đạo đức của mỗi con người khi thụ hưởng thành quả ấm no.',
                differenceNote: 'Kết cấu đối xứng 4 chữ kinh điển trong kho tàng Tục ngữ Việt Nam.',
                scholarlyAnalysis: 'Được đúc kết từ đời sống nông nghiệp lúa nước gắn liền với nguồn nước đầu ngọn núi.',
                source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân.'
            },
            {
                name: 'Dị bản liên hoàn ca dao dân gian',
                region: 'Đồng bằng Bắc Bộ',
                quote: 'Uống nước nhớ nguồn\nĂn quả nhớ kẻ trồng cây\nĂn khoai nhớ kẻ cho dây mà trồng\nCơm no chẳng lọ bơ đong\nÁo lành nhờ bởi mẹ bồng cha nâng.',
                content: 'Nhân dân đã ghép nối câu tục ngữ vào chùm ca dao lục bát mở rộng, liệt kê cụ thể từng hành động đền ơn: từ trái cây, củ khoai đến bát cơm no và manh áo ấm của cha mẹ.',
                differenceNote: 'Mở rộng từ 1 câu tục ngữ thành chùm ca dao sinh hoạt gia đình gần gũi, cụ thể.',
                scholarlyAnalysis: 'Quy luật phát triển từ "Tục ngữ đúc kết" sang "Ca dao giãi bày tâm sự" trong văn học dân gian.',
                source: 'Ca dao Dân gian Việt Nam — GS. Vũ Ngọc Phan.'
            },
            {
                name: 'Dị bản Nam Bộ (Miền Tây sông nước)',
                region: 'Nam Bộ',
                quote: 'Uống nước nhớ nguồn\nUống nước đục nhớ người đào giếng\nĂn cơm trắng nhớ người cuốc luống vỡ hoang.',
                content: 'Lưu dân Nam Bộ khi khai hoang lập ấp đối mặt với đồng chua nước mặn, nên câu tục ngữ được gắn liền trực tiếp với công lao của những tiền nhân "đào giếng tìm nước ngọt" và "cuốc luống vỡ hoang đất phèn".',
                differenceNote: 'Thay đổi hình ảnh thơ gắn với đời sống khai hoang mở cõi Nam Kỳ cực khổ nhưng hào hùng.',
                scholarlyAnalysis: 'Địa phương hóa triết lý đạo đức gắn liền với lịch sử khai hoang phương Nam thế kỷ XVII - XVIII.',
                source: 'Văn học Dân gian Nam Bộ — NXB Tổng hợp TP.HCM.'
            }
        ]
    },
    {
        slug: 'cong-cha-nhu-nui-thai-son',
        variants: [
            {
                name: 'Bản phổ biến Bắc Bộ (Mượn điển tích núi Thái Sơn)',
                region: 'Bắc Bộ / Toàn quốc',
                quote: 'Công cha như núi Thái Sơn\nNghĩa mẹ như nước trong nguồn chảy ra\nMột lòng thờ mẹ kính cha\nCho tròn chữ hiếu mới là đạo con.',
                content: 'Mượn hình ảnh ngọn núi Thái Sơn (ngọn núi cao hùng vĩ nhất trong Ngũ Nhạc) để so sánh với công lao chở che to lớn của người cha, và dòng suối nguồn vô tận với tình mẹ hiền.',
                differenceNote: 'Sử dụng hình tượng núi Thái Sơn mượn từ văn hóa Á Đông kinh điển.',
                scholarlyAnalysis: 'Bài ca dao đạo hiếu phổ biến nhất trong hệ thống giáo dục gia đình và nhà trường Việt Nam.',
                source: 'Kho tàng Ca dao người Việt — Nguyễn Xuân Kính.'
            },
            {
                name: 'Dị bản Nam Bộ & Miền Trung (Bản địa hóa thuần Việt)',
                region: 'Miền Trung & Nam Bộ',
                quote: 'Công cha như núi ngất trời\nNghĩa mẹ như nước ở ngoài Biển Đông\nNúi cao biển rộng mênh mông\nCù lao chín chữ ghi lòng con ơi.',
                content: 'Đồng bào miền Trung và Nam Bộ sống gắn liền với biển cả mênh mông và dải Trường Sơn sừng sững, nên đã thay thế "núi Thái Sơn" bằng "núi ngất trời" và "Biển Đông" — những hình tượng thiên nhiên thuần khiết của non sông đất Việt.',
                differenceNote: 'Thay "núi Thái Sơn" bằng "núi ngất trời", thay "nước trong nguồn" bằng "nước ngoài Biển Đông" hùng vĩ, gắn thêm khái niệm "Cù lao chín chữ".',
                scholarlyAnalysis: 'Quá trình bản địa hóa hoàn toàn: Thoát khỏi ảnh hưởng điển tích Trung Hoa để trở về với không gian địa lý Biển Đông thuần túy Việt Nam.',
                source: 'Ca dao Miền Trung và Nam Bộ — Viện Văn hóa Dân gian, 1999.'
            }
        ]
    },
    {
        slug: 'la-lanh-dum-la-rach',
        variants: [
            {
                name: 'Bản tục ngữ cô đọng',
                region: 'Toàn quốc',
                quote: 'Lá lành đùm lá rách',
                content: 'Câu tục ngữ 5 chữ kinh điển khuyên bảo lòng trắc ẩn, người có hoàn cảnh no đủ chở che cho người bất hạnh.',
                differenceNote: 'Kết cấu đối xứng quen thuộc trong đời sống thường nhật.',
                scholarlyAnalysis: 'Đúc kết từ tập quán gói bánh chưng bánh giầy lấy lá nguyên bao bọc ngoài lá rách.',
                source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân.'
            },
            {
                name: 'Dị bản dân gian tiến bậc (3 vế nhân ái)',
                region: 'Đồng bằng Bắc Bộ & Miền Trung',
                quote: 'Lá lành đùm lá rách\nLá rách ít đùm lá rách nhiều\nLá rách nhiều đùm lá tơi tả.',
                content: 'Mở rộng thêm hai vế tiếp nối đầy cảm động: Ngay cả người "rách ít" (chưa giàu có, vẫn còn chật vật) vẫn sẵn sàng sẻ chia với người "rách nhiều", và người "rách nhiều" vẫn nhường nhịn đùm bọc người "tơi tả" khốn cùng nhất.',
                differenceNote: 'Thêm hai vế bậc thang nhân nghĩa thể hiện sự đùm bọc không phân biệt giàu nghèo.',
                scholarlyAnalysis: 'Giá trị nhân văn tột cùng của tâm hồn Việt: Tình thương không phụ thuộc vào của cải vật chất.',
                source: 'Văn học Dân gian Việt Nam — GS. Đinh Gia Khánh.'
            }
        ]
    },
    {
        slug: 'an-qua-nho-ke-trong-cay',
        variants: [
            {
                name: 'Bản tục ngữ chuẩn quốc ngữ',
                region: 'Toàn quốc',
                quote: 'Ăn quả nhớ kẻ trồng cây',
                content: 'Bài học tri ân người lao động và tiền nhân đi trước đã dày công vun xới thành quả.',
                differenceNote: 'Cô đọng, mang tính giáo huấn đạo đức xã hội phổ quát.',
                scholarlyAnalysis: 'Bắt nguồn từ nền văn minh nông nghiệp nhiệt đới bốn mùa hoa trái.',
                source: 'Tục ngữ Việt Nam — GS. Vũ Ngọc Phan.'
            },
            {
                name: 'Dị bản ca dao đối đáp nghề thủ công',
                region: 'Vùng châu thổ Bắc Bộ & Làng nghề',
                quote: 'Ăn quả nhớ kẻ trồng cây\nĂn khoai nhớ kẻ cho dây mà trồng\nCầm chày nhớ bác thợ mộc\nCầm búa nhớ chú thợ rèn.',
                content: 'Mở rộng việc nhớ ơn không chỉ trong trồng trọt nông nghiệp mà lan tỏa đến tất cả người lao động thủ công trong xã hội: thợ mộc, thợ rèn — những người tạo ra công cụ sản xuất.',
                differenceNote: 'Tôn vinh liên hoàn các tầng lớp thợ thủ công làng nghề truyền thống.',
                scholarlyAnalysis: 'Phản ánh sự phân công lao động xã hội nông thôn Việt Nam thời trung cận đại.',
                source: 'Ca dao Lao động Làng nghề — Viện Nghiên cứu Văn hóa.'
            }
        ]
    },
    {
        slug: 'bau-oi-thuong-lay-bi-cung',
        variants: [
            {
                name: 'Bản ca dao 2 câu lục bát kinh điển',
                region: 'Toàn quốc',
                quote: 'Bầu ơi thương lấy bí cùng\nTuy rằng khác giống nhưng chung một giàn.',
                content: 'Bài học đoàn kết cộng đồng giữa các dân tộc, các vùng miền cùng chung một mái nhà non sông đất Việt.',
                differenceNote: 'Bản lưu truyền phổ biến nhất trong sách giáo khoa Tiểu học.',
                scholarlyAnalysis: 'Hình tượng "chung một giàn" tượng trưng cho bờ cõi non sông gấm vóc.',
                source: 'Ca dao Dân ca Việt Nam — GS. Vũ Ngọc Phan.'
            },
            {
                name: 'Dị bản mở rộng kết nghĩa đồng bào',
                region: 'Miền Trung & Tây Nguyên',
                quote: 'Bầu ơi thương lấy bí cùng\nTuy rằng khác giống nhưng chung một giàn\nThuyền nan một chuyến sang ngang\nNgười dưng chung lối hóa đàng bà con.',
                content: 'Nhân dân tiếp tục gắn kết hình tượng với những chuyến đò vượt lũ hoạn nạn, nơi những người xa lạ cùng sẻ chia tấm lòng nhân ái để trở thành ruột thịt.',
                differenceNote: 'Mở rộng chiều sâu tương trợ hoạn nạn qua hình tượng "Thuyền nan sang ngang".',
                scholarlyAnalysis: 'Tinh thần tương thân tương ái gắn với bối cảnh thiên tai lũ lụt khắc nghiệt của dải đất miền Trung.',
                source: 'Kho tàng Văn học Dân gian Miền Trung — NXB Thuận Hóa.'
            }
        ]
    }
];

async function seedVariants() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sep490';
        await mongoose.connect(uri);
        console.log('✅ Đã kết nối MongoDB thành công');

        let updatedCount = 0;
        for (const item of variantsData) {
            const res = await Work.updateOne(
                { slug: item.slug },
                { $set: { variants: item.variants } }
            );
            if (res.matchedCount > 0) {
                console.log(`[Variants Seed] Đã cập nhật ${item.variants.length} dị bản cho tác phẩm: ${item.slug}`);
                updatedCount++;
            } else {
                console.warn(`[Variants Seed] Không tìm thấy slug: ${item.slug}`);
            }
        }

        console.log(`\n🎉 HOÀN TẤT: Đã chuẩn hóa dị bản dân gian học thuật cho ${updatedCount} tác phẩm tiêu biểu!`);
    } catch (err) {
        console.error('❌ Lỗi cập nhật dị bản:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối MongoDB.');
    }
}

seedVariants();
