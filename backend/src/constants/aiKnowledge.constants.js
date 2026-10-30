/**
 * VIETHERITAGE AI KNOWLEDGE & CURATED ENCYCLOPEDIA CONSTANTS
 * Kho tri thức bách khoa toàn thư nhân vật di sản, địa danh, thuật ngữ
 * và các tiện ích tra cứu thực thể nhanh phục vụ Trợ lý AI và Smart Selection.
 */
const { removeVietnameseTones } = require('../utils/vietnamese.utils');

/**
 * Danh sách câu hỏi gợi ý khám phá nhanh
 */
const DEFAULT_SUGGESTIONS = [
    {
        id: 'thach-sanh-y-nghia',
        question: 'Ý nghĩa hình tượng tiếng đàn và niêu cơm thần trong Thạch Sanh là gì?',
        category: 'Truyện cổ tích',
        slug: 'thach-sanh',
    },
    {
        id: 'thanh-giong-bay-ve-troi',
        question: 'Tại sao Thánh Gióng bay về trời sau khi đánh tan giặc mà không nhận bổng lộc?',
        category: 'Truyền thuyết',
        slug: 'thanh-giong',
    },
    {
        id: 'son-tinh-thuy-tinh-khat-vong',
        question: 'Hình tượng Sơn Tinh chiến thắng Thủy Tinh thể hiện khát vọng gì của tổ tiên?',
        category: 'Thần thoại',
        slug: 'son-tinh-thuy-tinh',
    },
    {
        id: 'ca-dao-gia-dinh',
        question: 'Những câu ca dao nào răn dạy sâu sắc nhất về chữ Hiếu và ơn nghĩa cha mẹ?',
        category: 'Ca dao - Tục ngữ',
        slug: 'ca-dao-dong-bang-bac-bo',
    },
    {
        id: 'nam-quoc-son-ha-tuyen-ngon',
        question: 'Vì sao Nam quốc sơn hà được coi là bản Tuyên ngôn Độc lập đầu tiên của nước ta?',
        category: 'Văn học Trung đại',
        slug: 'nam-quoc-son-ha',
    },
];

const GEMINI_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
];

/**
 * KHO TRI THỨC NHÂN VẬT DI SẢN CHUYÊN SÂU (CURATED CHARACTERS)
 * Phục vụ Smart Text Selection và AI Chat Assistant
 */
const CURATED_CHARACTERS = [
    {
        id: 'my-nuong',
        keywords: ['my nuong', 'mi nuong', 'nang my nuong', 'nang mi nuong'],
        name: 'Mỵ Nương (Mị Nương)',
        identity: 'Con gái Vua Hùng thứ 18 (Hùng Duệ Vương). Nàng là người con gái nhan sắc tuyệt trần, cốt cách đoan trang, hiền thục nết na, được vua cha hết mực thương yêu và muốn kén cho nàng một người chồng thật xứng đáng.',
        role: 'Là nhân vật trung tâm kết nối toàn bộ diễn biến tác phẩm "Sơn Tinh - Thủy Tinh". Cuộc kén rể cho Mỵ Nương là nguồn cơn trực tiếp dẫn đến cuộc hội ngộ cầu hôn của hai vị thần kiệt xuất, tạo nên cuộc chạy đua sính lễ kịch tính và trận đại chiến long trời lở đất giữa Sơn Tinh và Thủy Tinh.',
        symbolicMeaning: 'Hiện thân cho vẻ đẹp tinh khôi, thùy mị của người con gái Lạc Hồng thời kỳ sơ khai dựng nước; đại diện cho sự gắn kết hòa hợp giữa con người với đất nước giang sơn, đồng thời phản ánh phong tục hôn nhân kén rể trọng tài đức thời các Vua Hùng.',
        workTitle: 'Sơn Tinh - Thủy Tinh',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Kho tàng Truyền thuyết Dân gian Việt Nam & Việt Điện U Linh Tập.',
    },
    {
        id: 'son-tinh',
        keywords: ['son tinh', 'tan vien', 'tan vien son thanh', 'than nui'],
        name: 'Sơn Tinh (Tản Viên Sơn Thánh)',
        identity: 'Chúa tể cai quản vùng non cao Tản Viên (Ba Vì), người đứng đầu hàng "Tứ Bất Tử" thiêng liêng trong tín ngưỡng dân gian Việt Nam. Chàng có phép thuật biến hóa khôn lường: vẫy tay về phía đông thì nổi cồn bãi, vẫy tay về phía tây thì mọc lên từng dãy núi đồi.',
        role: 'Đem đủ sính lễ "voi chín ngà, gà chín cựa, ngựa chín hồng mao" đến trước rước Mỵ Nương về núi. Khi Thủy Tinh dâng nước đánh phá, Sơn Tinh chỉ huy nhân dân bốc từng quả đồi, dời từng dãy núi, dựng thành lũy ngăn dòng nước lũ, đánh bại Thủy Tinh sau nhiều tháng giao tranh kiên cường.',
        symbolicMeaning: 'Biểu tượng vĩ đại cho sức mạnh đại đoàn kết và ý chí quật cường trị thủy, khai hoang đắp đê ngăn lũ của người Việt cổ lưu vực sông Hồng ("Nước dâng lên bao nhiêu, núi cao lên bấy nhiêu"); vị phúc thần tối cao che chở cho mùa màng và bình yên của dân tộc.',
        workTitle: 'Sơn Tinh - Thủy Tinh',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Lĩnh Nam Chích Quái & Kho tàng Thần thoại Việt Nam.',
    },
    {
        id: 'thuy-tinh',
        keywords: ['thuy tinh', 'than nuoc', 'than bien'],
        name: 'Thủy Tinh (Thần Nước)',
        identity: 'Chúa tể cai quản miền Biển Đông mênh mông sâu thẳm, sở hữu quyền năng siêu nhiên: gọi gió, gió đến; hô mưa, mưa về, điều khiển muôn loài thủy quái làm rung chuyển trời đất.',
        role: 'Nhân vật đối kháng kịch tính; do đến sau một bước không lấy được Mỵ Nương bèn nổi giận lôi đình, đem quân đuổi theo đòi cướp lại nàng; dâng nước sông lên cuồn cuộn đánh dồn dập vào núi Ba Vì. Hàng năm chàng đều dâng nước đánh Sơn Tinh nhưng sức cùng lực kiệt đành phải rút quân.',
        symbolicMeaning: 'Hiện thân nhân hóa của sức tàn phá hung hãn của bão lũ, mưa ngập diễn ra định kỳ hàng năm ở lưu vực sông Hồng; phản ánh sự khốc liệt của tự nhiên buổi đầu khai hoang lập nghiệp của dân tộc ta.',
        workTitle: 'Sơn Tinh - Thủy Tinh',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Kho tàng Truyền thuyết Dân gian Việt Nam.',
    },
    {
        id: 'vua-hung',
        keywords: ['vua hung', 'hung vuong', 'hung vuong thu muoi tam'],
        name: 'Vua Hùng (Hùng Vương thứ 18)',
        identity: 'Vị thủ lĩnh đứng đầu nhà nước Văn Lang cổ đại, người cha mẫu mực khao khát tìm kiếm chàng rể vừa có tài vừa có đức cho con gái yêu Mỵ Nương.',
        role: 'Đứng trước tài năng ngang ngửa của hai vị thần, vua khéo léo đặt ra sính lễ độc đáo "Voi chín ngà, gà chín cựa, ngựa chín hồng mao" — toàn là những sản vật quý hiếm trên đất liền.',
        symbolicMeaning: 'Thể hiện sự anh minh và trí tuệ dân gian; sự lựa chọn khéo léo ngầm ưu ái vị thần bảo vệ đất liền và núi rừng quê hương, phản ánh phong tục thách cưới và nét văn hóa thời đại các Vua Hùng dựng nước.',
        workTitle: 'Sơn Tinh - Thủy Tinh',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Đại Việt Sử Ký Toàn Thư & Truyền thuyết Hùng Vương.',
    },
    {
        id: 'thach-sanh',
        keywords: ['thach sanh', 'dung si thach sanh'],
        name: 'Thạch Sanh',
        identity: 'Chàng dũng sĩ mồ côi nghèo khó sống dưới gốc đa, vốn là Thái tử con Ngọc Hoàng giáng trần; tính tình thật thà, chất phác, dũng mãnh và giàu lòng thương người.',
        role: 'Nhân vật chính diện trung tâm lập hàng loạt chiến công vĩ đại: chém Chằn tinh trừ hại cho dân, bắn Đại bàng cứu công chúa Quỳnh Nga, cứu con vua Thủy Tề được tặng đàn thần; dùng tiếng đàn thần vạch trần tội ác của Lý Thông và dùng niêu cơm thần thu phục 18 nước chư hầu.',
        symbolicMeaning: 'Hiện thân hoàn mỹ cho vẻ đẹp đạo đức, sức mạnh chính nghĩa và ước mơ công lý của nhân dân lao động ("ở hiền gặp lành"); đồng thời là đỉnh cao của tinh thần nhân đạo và khát vọng hòa bình của dân tộc Việt Nam.',
        workTitle: 'Thạch Sanh',
        workSlug: 'thach-sanh',
        source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.',
    },
    {
        id: 'ly-thong',
        keywords: ['ly thong', 'me con ly thong'],
        name: 'Lý Thông',
        identity: 'Kẻ làm nghề nấu rượu ở đầu làng, bản chất xảo trá, vụ lợi, nham hiểm và bất nhân.',
        role: 'Nhân vật phản diện điển hình; giả kết nghĩa anh em để lừa Thạch Sanh đi nộp mạng thế thân cho Chằn tinh, cướp công cứu công chúa rồi nhốt chàng vào ngục tối nhằm đoạt chức Quận công và vinh hoa phú quý.',
        symbolicMeaning: 'Đại diện cho sự vong ân bội nghĩa, lòng tham không đáy và những toan tính xấu xa trong xã hội; kết cục bị sét đánh chết hóa thành bọ hung là lời răn dạy đanh thép về luật nhân quả "ác giả ác báo".',
        workTitle: 'Thạch Sanh',
        workSlug: 'thach-sanh',
        source: 'Kho tàng Truyện cổ tích Việt Nam.',
    },
    {
        id: 'quynh-nga',
        keywords: ['quynh nga', 'cong chua quynh nga', 'cong chua'],
        name: 'Công chúa Quỳnh Nga',
        identity: 'Con gái yêu của nhà vua, người thiếu nữ xinh đẹp đoan trang nhưng gặp phải đại nạn bị yêu quái Đại bàng khổng lồ bắt cắp giam dưới hang sâu.',
        role: 'Nhân chứng sống động của công lý; sau khi được cứu, nàng bị câm trước sự lừa dối bất công của Lý Thông; chỉ cất tiếng cười nói rộn rã khi nghe tiếng đàn thần của Thạch Sanh vẳng lên từ ngục tối, giúp vua cha nhận rõ sự thật.',
        symbolicMeaning: 'Biểu tượng cho sự thật và công lý không thể bị chôn vùi bởi sự gian dối; tượng trưng cho phần thưởng xứng đáng trao cho người dũng cảm và chính trực.',
        workTitle: 'Thạch Sanh',
        workSlug: 'thach-sanh',
        source: 'Kho tàng Truyện cổ tích Việt Nam.',
    },
    {
        id: 'thanh-giong',
        keywords: ['thanh giong', 'giong', 'phu dong thien vuong'],
        name: 'Thánh Gióng (Phù Đổng Thiên Vương)',
        identity: 'Cậu bé làng Phù Đổng sinh ra kỳ diệu sau khi mẹ ướm chân vào vết chân khổng lồ, lên ba tuổi không biết nói cười, chỉ nằm ngửa một chỗ.',
        role: 'Khi nghe tiếng sứ giả truyền hịch tìm người cứu nước, Gióng vụt lớn thành tráng sĩ khổng lồ vươn vai nghìn trượng; cưỡi ngựa sắt, mặc áo giáp sắt, vung roi sắt quét sạch giặc Ân; khi roi gãy nhổ tre đằng ngà tiếp tục quật tan quân thù. Đánh tan giặc, Gióng cởi áo giáp bay thẳng về trời.',
        symbolicMeaning: 'Biểu tượng bất tử cho tinh thần yêu nước quật khởi và sức mạnh tiềm tàng vĩ đại của toàn thể nhân dân khi độc lập dân tộc bị đe dọa; hình tượng người anh hùng xả thân vì nước vô tư, không màng danh lợi bổng lộc.',
        workTitle: 'Thánh Gióng (Phù Đổng Thiên Vương)',
        workSlug: 'thanh-giong',
        source: 'Kho tàng Truyền thuyết Dân gian Việt Nam & Lĩnh Nam Chích Quái.',
    },
    {
        id: 'thuy-kieu',
        keywords: ['thuy kieu', 'nang kieu', 'kieu'],
        name: 'Vương Thúy Kiều',
        identity: 'Đại tiểu thư họ Vương tài sắc vẹn toàn hiếm có trong thiên hạ ("Làn thu thủy nét xuân sơn / Hoa ghen thua thắm liễu hờn kém xanh"), tinh thông cầm - kỳ - thi - họa và giàu lòng hiếu nghĩa.',
        role: 'Nhân vật trung tâm của kiệt tác Đoạn Trường Tân Thanh; trải qua mười lăm năm lưu lạc đoạn trường ("thanh lâu hai lượt, thanh y hai lần"), bán mình chuộc cha và bảo bọc gia đình, hy sinh mối tình đầu son sắt cùng Kim Trọng.',
        symbolicMeaning: 'Hiện thân bi tráng cho bi kịch "tài mệnh tương đố" và số phận ba chìm bảy nổi của người phụ nữ dưới chế độ phong kiến bất công; đồng thời thể hiện khát vọng tự do yêu đương, nhân phẩm cao khiết và tấm lòng nhân đạo bao la của Đại thi hào Nguyễn Du.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du, NXB Văn học.',
    },
    {
        id: 'kim-trong',
        keywords: ['kim trong', 'kim sinh'],
        name: 'Kim Trọng',
        identity: 'Chàng thư sinh phong nhã, con nhà trâm anh thế phiệt ("Văn chương nết đất, thông minh tính trời"), khôi ngô tuấn tú và giàu lòng trắc ẩn.',
        role: 'Mối tình đầu trong sáng, say đắm và tự do của Thúy Kiều; cùng nàng đính ước thề nguyền dưới ánh trăng vàng; mười lăm năm sau vẫn một lòng giữ trọn thủy chung đi tìm kiếm và đón Kiều trở về đoàn tụ sum vầy.',
        symbolicMeaning: 'Mẫu hình người tình lý tưởng, biểu tượng cho khát vọng tình yêu tự do vượt qua những rào cản lễ giáo phong kiến hà khắc.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'tu-hai',
        keywords: ['tu hai'],
        name: 'Từ Hải',
        identity: 'Vị anh hùng hảo hán cái thế "đầu đội trời chân đạp đất", ngang tàng xưng vương xưng bá ("Vai năm tấc rộng thân mười thước cao / Gươm đàn nửa gánh non sông một chèo").',
        role: 'Người tri kỷ thấu hiểu và trân trọng sâu sắc nhân phẩm của Kiều; chuộc nàng khỏi lầu xanh, phong nàng làm phu nhân và lập dàn cho nàng đền ơn báo oán rạng rỡ.',
        symbolicMeaning: 'Hiện thân cho người anh hùng tự do của nhân dân, khát vọng công lý quật khởi đập tan xiềng xích bạo tàn của chế độ phong kiến thống trị.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'thuy-van',
        keywords: ['thuy van'],
        name: 'Vương Thúy Vân',
        identity: 'Em gái Thúy Kiều, nhan sắc đoan trang phúc hậu ("Khuôn trăng đầy đặn nét ngài nở nang / Hoa cười ngọc thốt đoan trang / Mây thua nước tóc tuyết nhường màu da").',
        role: 'Người nhận lời thỉnh cầu "trao duyên" của chị để kết duyên cùng Kim Trọng, gánh vác chữ tình dang dở và bảo toàn hạnh phúc gia đình.',
        symbolicMeaning: 'Biểu tượng cho nét đẹp bình dị, êm ấm, dung hòa của người phụ nữ truyền thống, có số phận êm đềm bình yên đối lập với sự truân chuyên sóng gió của Thúy Kiều.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'ly-thuong-kiet',
        keywords: ['ly thuong kiet', 'thai uy ly thuong kiet'],
        name: 'Thái úy Lý Thường Kiệt',
        identity: 'Vị danh tướng anh hùng dân tộc thời nhà Lý, nhà chiến lược quân sự và chính trị kiệt xuất của Đại Việt thế kỷ XI.',
        role: 'Chỉ huy quân dân Đại Việt xây dựng phòng tuyến sông Như Nguyệt, đập tan 30 vạn quân xâm lược nhà Tống năm 1077; truyền đọc bài thơ thần làm rung chuyển tâm lý quân giặc.',
        symbolicMeaning: 'Tác giả bản Tuyên ngôn Độc lập đầu tiên "Nam quốc sơn hà", biểu tượng bất diệt cho ý chí độc lập tự chủ và khí phách kiên cường bảo vệ bờ cõi giang sơn.',
        workTitle: 'Nam Quốc Sơn Hà',
        workSlug: 'nam-quoc-son-ha',
        source: 'Đại Việt Sử Ký Toàn Thư.',
    },
    {
        id: 'le-loi',
        keywords: ['le loi', 'binh dinh vuong'],
        name: 'Lê Lợi (Bình Định Vương)',
        identity: 'Thủ lĩnh khởi nghĩa Lam Sơn, vị anh hùng giải phóng dân tộc lập nên triều đại Hậu Lê rực rỡ.',
        role: 'Dấy cờ khởi nghĩa từ chốn hoang dã Lam Sơn, nếm mật nằm gai suốt 10 năm gian khổ lãnh đạo quân dân quét sạch quân xâm lược nhà Minh giành lại giang sơn.',
        symbolicMeaning: 'Biểu tượng cho tinh thần kiên trì bất khuất, sự tập hợp đại đoàn kết muôn dân đánh đuổi ngoại xâm.',
        workTitle: 'Bình Ngô Đại Cáo',
        workSlug: 'binh-ngo-dai-cao',
        source: 'Nguyễn Trãi toàn tập & Lam Sơn Thực Lục.',
    },
    {
        id: 'nguyen-trai',
        keywords: ['nguyen trai', 'uc trai'],
        name: 'Nguyễn Trãi (Hiệu Ức Trai)',
        identity: 'Đại danh nhân văn hóa thế giới, nhà quân sự, chính trị, nhà thơ kiệt xuất thời Hậu Lê.',
        role: 'Quân sư đắc lực bên cạnh Lê Lợi, vạch ra đường lối mưu phạt tâm công "đánh vào lòng người"; chấp bút bản thiên cổ hùng văn "Bình Ngô đại cáo".',
        symbolicMeaning: 'Đỉnh cao của tư tưởng nhân nghĩa Việt Nam ("Việc nhân nghĩa cốt ở yên dân / Quân điếu phạt trước lo trừ bạo").',
        workTitle: 'Bình Ngô Đại Cáo',
        workSlug: 'binh-ngo-dai-cao',
        source: 'Nguyễn Trãi toàn tập — Viện Sử học.',
    },
    {
        id: 'nguoi-linh-tay-tien',
        keywords: ['nguoi linh tay tien', 'tay tien', 'chien si tay tien', 'doan quan tay tien', 'doan binh khong moc toc', 'anh ve quoc'],
        name: 'Người lính Trung đoàn 52 Tây Tiến',
        identity: 'Những chàng trai trẻ, phần lớn là học sinh, sinh viên trí thức Hà thành xếp bút nghiên lên đường tòng quân năm 1947.',
        role: 'Vượt qua gian lao khắc nghiệt, sốt rét rừng hiểm nghèo trên cung đường rừng Tây Bắc và Thượng Lào, chiến đấu kiên cường với lý tưởng "Chiến trường đi chẳng tiếc đời xanh".',
        symbolicMeaning: 'Vẻ đẹp bi tráng, hào hoa, lãng mạn và tinh thần xả thân kiêu hãnh của thế hệ thanh niên kháng chiến buổi đầu dựng nước và giữ nước.',
        workTitle: 'Tây Tiến',
        workSlug: 'tay-tien',
        source: 'Kỷ yếu Di tích Lịch sử Tây Tiến & Tuyển tập thơ Quang Dũng.',
    },
    {
        id: 'nguoi-linh-dong-chi',
        keywords: ['nguoi linh dong chi', 'dong chi', 'anh voi toi doi nguoi xa la', 'nguoi nong dan mac ao linh'],
        name: 'Người lính trong "Đồng Chí"',
        identity: 'Những người nông dân mặc áo lính xuất thân từ những vùng quê nghèo lam lũ "nước mặn đồng chua", "đất cày lên sỏi đá".',
        role: 'Gặp nhau nơi chiến khu Việt Bắc, cùng chung lý tưởng chiến đấu, chia ngọt sẻ bùi manh áo rách, bát cơm ấm và sưởi ấm cho nhau trong đêm rét rừng hoang sương muối.',
        symbolicMeaning: 'Biểu tượng cao đẹp của tình đồng chí mộc mạc, thiêng liêng và sức mạnh cố kết vĩ đại làm nên chiến thắng của quân và dân ta.',
        workTitle: 'Đồng Chí',
        workSlug: 'dong-chi',
        source: 'Tuyển tập thơ Chính Hữu — NXB Văn học.',
    },
    {
        id: 'trau-cau-anh-em',
        keywords: ['cao tan', 'cao lang', 'luu thi', 'nang luu thi', 'trau cau'],
        name: 'Hai anh em Cao Tân, Cao Lang và Nàng Lưu thị',
        identity: 'Hai anh em sinh đôi yêu thương nhau hết mực và người vợ hiền thục nết na.',
        role: 'Bi kịch hiểu lầm dẫn đến sự hy sinh đầy xúc động; người em hóa thành tảng đá vôi, người anh hóa thành cây cau sừng sững, người vợ hóa thành dây trầu không quấn quýt bên thân cau.',
        symbolicMeaning: 'Biểu tượng vĩnh hằng cho tình anh em ruột thịt keo sơn và tình nghĩa vợ chồng thủy chung son sắt; khởi nguồn phong tục trầu cau trong văn hóa cưới hỏi của người Việt.',
        workTitle: 'Sự tích Trầu Cau',
        workSlug: 'su-tich-trau-cau',
        source: 'Kho tàng Truyện cổ tích Việt Nam.',
    },
    {
        id: 'nguoi-linh-xe-khong-kinh',
        keywords: ['nguoi linh lai xe', 'tieu doi xe khong kinh', 'nguoi linh truong son', 'lai xe truong son'],
        name: 'Người lính lái xe Trường Sơn (Tiểu đội xe không kính)',
        identity: 'Những chàng trai trẻ tuổi, phần lớn là thanh niên xung phong, học sinh sinh viên tòng quân lái xe vận tải quân sự chi viện trên tuyến đường Trường Sơn khói lửa năm 1969.',
        role: 'Nhân vật trữ tình trung tâm đối mặt trực diện với bom giật bom rung, mưa bom bão đạn nhưng luôn giữ vững tay lái với tư thế ung dung "Nhìn đất, nhìn trời, nhìn thẳng", nụ cười ha ha bất chấp bụi gió.',
        symbolicMeaning: 'Hiện thân cho chủ nghĩa anh hùng cách mạng Việt Nam thời chống Mỹ: tinh thần dũng cảm, sự lạc quan phơi phới, tình đồng chí keo sơn và ý chí sắt đá "Xẻ dọc Trường Sơn đi cứu nước / Mà lòng phơi phới dậy tương lai".',
        workTitle: 'Bài thơ về tiểu đội xe không kính',
        workSlug: 'bai-tho-ve-tieu-doi-xe-khong-kinh',
        source: 'Tập thơ Vầng trăng quầng lửa (1970) & SGK Ngữ văn 9.',
    },
    {
        id: 'pham-tien-duat',
        keywords: ['pham tien duat', 'nha tho pham tien duat'],
        name: 'Nhà thơ Phạm Tiến Duật',
        identity: 'Một trong những gương mặt tiêu biểu nhất của thế hệ các nhà thơ thời kỳ kháng chiến chống Mỹ, được mệnh danh là "con chim lửa của Trường Sơn huyền thoại".',
        role: 'Trực tiếp tham gia chiến đấu trong lực lượng bộ đội vận tải Trường Sơn, trải nghiệm thực tế khốc liệt và ghi lại bằng chất giọng thơ tếu táo, giàu chất văn xuôi và tinh thần thời đại.',
        symbolicMeaning: 'Người thư ký trung thực và tài hoa của mặt trận Trường Sơn, đưa chất sống hiện thực bộn bề vào thơ ca tạo nên một phong cách độc đáo bậc nhất.',
        workTitle: 'Bài thơ về tiểu đội xe không kính',
        workSlug: 'bai-tho-ve-tieu-doi-xe-khong-kinh',
        source: 'Tuyển tập thơ Phạm Tiến Duật — NXB Hội Nhà văn.',
    },
    {
        id: 'han-mac-tu',
        keywords: ['han mac tu', 'nguyen trong tri', 'thi si han mac tu', 'nha tho han mac tu', 'tac gia han mac tu'],
        name: 'Thi sĩ Hàn Mặc Tử (Nguyễn Trọng Trí)',
        identity: 'Một trong những nhà thơ tài hoa, độc đáo và bi thương bậc nhất của phong trào Thơ Mới (1932 - 1945), chủ soái trường thơ Loạn (Bình Định). Sinh năm 1912 tại Đồng Hới (Quảng Bình), sớm bộc lộ thiên tài thi ca và mất năm 1940 tại trại phong Quy Hòa (Quy Nhơn) khi mới 28 tuổi.',
        role: 'Vừa là tác giả sáng tác, vừa là cái tôi trữ tình trung tâm của kiệt tác "Đây Thôn Vĩ Dạ". Giữa chuỗi ngày cô độc chống chọi với căn bệnh nan y và dự cảm chia lìa nhân thế, nhà thơ gửi gắm tình yêu tha thiết, trong trẻo hướng về xứ Huế mộng mơ, đồng thời bộc lộ nỗi khát khao giao cảm cháy bỏng với cuộc đời.',
        symbolicMeaning: 'Biểu tượng cho sức sáng tạo phi thường và tình yêu sự sống bất diệt vượt lên nỗi đau thể xác; một hồn thơ kết tinh hài hòa giữa cảm xúc lãng mạn thanh khiết với bút pháp tượng trưng, siêu thực huyền ảo.',
        workTitle: 'Đây Thôn Vĩ Dạ',
        workSlug: 'day-thon-vi-da',
        source: 'Hàn Mặc Tử — Tác phẩm & Lời bình, NXB Văn học.',
    },
    {
        id: 'hoang-cuc',
        keywords: ['hoang cuc', 'hoang thi kim cuc', 'kim cuc', 'nang hoang cuc'],
        name: 'Hoàng Thị Kim Cúc (Nàng Hoàng Cúc)',
        identity: 'Người con gái xứ Huế dịu dàng, con gái quan Tri phủ Phan Thiết (ông Hoàng Long); mối tình đơn phương trong sáng, e ấp thuở thanh xuân của Hàn Mặc Tử thời làm việc tại Sở Đạc điền Quy Nhơn.',
        role: 'Người gửi tặng tấm bưu thiếp phong cảnh xứ Huế kèm lời thăm hỏi khi biết tin Hàn Mặc Tử mắc bạo bệnh. Bức bưu thiếp ấy đã khơi dậy miền ký ức tươi đẹp và trở thành nguồn cảm hứng kỳ diệu để thi sĩ viết nên bài thơ "Đây Thôn Vĩ Dạ".',
        symbolicMeaning: 'Hiện thân cho vẻ đẹp dịu dàng, kín đáo, thanh khiết và ý nhị của người con gái sông Hương ("Lá trúc che ngang mặt chữ điền"); là giai nhân trong mộng khơi dậy tình yêu đời và khát vọng sống trong lòng thi nhân.',
        workTitle: 'Đây Thôn Vĩ Dạ',
        workSlug: 'day-thon-vi-da',
        source: 'Thi nhân Việt Nam — Hoài Thanh, Hoài Chân.',
    },
    {
        id: 'khach-duong-xa',
        keywords: ['khach duong xa', 'ao em trang qua', 'mo khach duong xa'],
        name: 'Hình tượng "Khách đường xa"',
        identity: 'Hình ảnh vừa thực vừa ảo trong tâm tưởng của thi sĩ Hàn Mặc Tử; vừa là bóng hình người thiếu nữ xứ Huế trong tà áo trắng tinh khôi, vừa là sự phân thân của chính thi nhân giữa cõi thực và cõi mộng.',
        role: 'Xuất hiện ở khổ thơ thứ 3 của "Đây Thôn Vĩ Dạ" gắn liền với sương khói mờ ảo; thể hiện bước chân gấp gáp, khoảng cách xa xôi diệu vợi và sự hữu hạn của đời người trước dòng chảy vô tình của thời gian.',
        symbolicMeaning: 'Mặc cảm chia lìa, bi kịch cô đơn tột cùng và nỗi hoài nghi đầy khắc khoải về tình người trong nhân thế ("Ở đây sương khói mờ nhân ảnh / Ai biết tình ai có đậm đà?").',
        workTitle: 'Đây Thôn Vĩ Dạ',
        workSlug: 'day-thon-vi-da',
        source: 'Bình giảng Văn học 11 — GS. Phan Cự Đệ.',
    },
    {
        id: 'quang-dung',
        keywords: ['quang dung', 'bui dinh diem', 'nha tho quang dung', 'tac gia quang dung'],
        name: 'Nhà thơ Quang Dũng (Bùi Đình Diệm)',
        identity: 'Nghệ sĩ tài hoa xuất chúng của nền văn học kháng chiến Việt Nam (1921 - 1988), quê tại Phượng Trì, Đan Phượng, Hà Nội. Ông là nghệ sĩ đa tài: làm thơ, viết văn, vẽ tranh và soạn nhạc.',
        role: 'Đại đội trưởng thuộc Trung đoàn 52 Tây Tiến; cùng đồng đội chia ngọt sẻ bùi trên địa bàn miền núi Tây Bắc và Thượng Lào hiểm trở. Rời đơn vị cuối năm 1948, tại làng Phù Lưu Chanh, nỗi nhớ da diết về đồng đội đã thôi thúc ông viết nên kiệt tác "Tây Tiến".',
        symbolicMeaning: 'Đại diện tiêu biểu cho người trí thức Hà thành xếp bút nghiên lên đường cứu nước: mang trong mình chất lãng mạn, hào hoa, phong nhã kết hợp với khí phách kiên cường, bi tráng của người lính Cụ Hồ.',
        workTitle: 'Tây Tiến',
        workSlug: 'tay-tien',
        source: 'Mây đầu ô — Tuyển tập thơ Quang Dũng, NXB Văn học.',
    },
    {
        id: 'chinh-huu',
        keywords: ['chinh huu', 'tran dinh dac', 'nha tho chinh huu', 'tac gia chinh huu'],
        name: 'Nhà thơ Chính Hữu (Trần Đình Đắc)',
        identity: 'Đại tá Quân đội Nhân dân Việt Nam, nguyên Phó Tổng thư ký Hội Nhà văn Việt Nam (1926 - 2007), quê tại Can Lộc, Hà Tĩnh. Nhà thơ chiến sĩ tiền bối của nền thi ca kháng chiến Việt Nam.',
        role: 'Chính trị viên đại đội trực tiếp tham gia chiến đấu trong chiến dịch Việt Bắc thu đông 1947. Đầu năm 1948, sau trận sốt rét thập tử nhất sinh nơi chiến hào nhờ sự chăm sóc chí tình của đồng đội, ông đã viết bài thơ "Đồng chí" để tri ân tình cảm thiêng liêng ấy.',
        symbolicMeaning: 'Tiếng thơ cô đọng, hàm súc, giàu chất hiện thực trần trụi mà thăng hoa cảm xúc; định nghĩa bất hủ về tình đồng chí giai cấp trong văn học cách mạng.',
        workTitle: 'Đồng Chí',
        workSlug: 'dong-chi',
        source: 'Đầu súng trăng treo — Tuyển tập thơ Chính Hữu, NXB Văn học.',
    },
    {
        id: 'ba-huyen-thanh-quan',
        keywords: ['ba huyen thanh quan', 'nguyen thi hinh', 'nu si ba huyen thanh quan'],
        name: 'Nữ sĩ Bà Huyện Thanh Quan (Nguyễn Thị Hinh)',
        identity: 'Nữ thi sĩ tài danh kiệt xuất thời nhà Nguyễn (thế kỷ XIX), người làng Nghi Tàm, huyện Vĩnh Thuận (nay thuộc Tây Hồ, Hà Nội); là phu nhân tri huyện Lưu Nghị (Thanh Quan). Bà từng được vua Minh Mạng triệu vào kinh đô Huế phong chức Cung Trung Giáo Tập.',
        role: 'Tác giả kiêm cái tôi trữ tình của bài thơ "Qua Đèo Ngang"; được sáng tác khi bà dừng chân bên đỉnh Đèo Ngang heo hút lúc bóng tà dương buông xuống trên đường vào kinh đô nhận chức.',
        symbolicMeaning: 'Hồn thơ thâm trầm, trang nhã, niêm luật Đường thi mẫu mực tuyệt đỉnh; bộc lộ nỗi đau đáu hoài cổ nhớ thời vàng son triều Lê và tình yêu tha thiết với vẻ đẹp giang sơn đất nước.',
        workTitle: 'Qua Đèo Ngang',
        workSlug: 'qua-deo-ngang',
        source: 'Hợp tuyển Thơ văn Việt Nam thế kỷ XIX.',
    },
    {
        id: 'nguyen-khuyen',
        keywords: ['nguyen khuyen', 'tam nguyen yen do', 'nha tho nguyen khuyen'],
        name: 'Tam nguyên Yên Đổ Nguyễn Khuyến',
        identity: 'Bậc đại khoa đỗ đầu cả ba kỳ thi Hương, Hội, Đình (1835 - 1909), quê tại làng Và, xã Yên Đổ, huyện Bình Lục, tỉnh Hà Nam. Vị quan thanh liêm, chính trực, bậc thầy thi ca viết về cảnh sắc làng quê Việt Nam.',
        role: 'Tác giả kiêm hình tượng "người câu cá" trong bài thơ "Thu Điếu"; sau khi từ quan về ở ẩn giữ trọn khí tiết, ông mượn thú câu cá thanh tao nơi ao thu làng quê để ký thác tâm sự thời thế.',
        symbolicMeaning: 'Tấm lòng yêu nước thầm kín, nỗi đau xót u hoài trước cảnh nước mất nhà tan; biểu tượng cho nhân cách thanh cao, bất khuất của nhà nho truyền thống Việt Nam.',
        workTitle: 'Thu Điếu (Câu cá mùa thu)',
        workSlug: 'thu-dieu',
        source: 'Thơ văn Nguyễn Khuyến — NXB Văn học.',
    },
    {
        id: 'nguyen-du',
        keywords: ['nguyen du', 'to nhu', 'thanh hien', 'dai thi hao nguyen du'],
        name: 'Đại thi hào Nguyễn Du (Tố Như, Thanh Hiên)',
        identity: 'Đại thi hào dân tộc, Danh nhân văn hóa thế giới (1765 - 1820), quê tại Tiên Điền, Nghi Xuân, Hà Tĩnh. Con người có vốn sống sâu rộng, từng nếm trải thăng trầm "mười năm gió bụi" nên có con mắt trông thấu sáu cõi và tấm lòng nghĩ suốt nghìn đời.',
        role: 'Tác giả sáng tạo kiệt tác Truyện Kiều (Đoạn Trường Tân Thanh); mượn cốt truyện Kim Vân Kiều Truyện để phản ánh bức tranh hiện thực xã hội và số phận con người Việt Nam thế kỷ XVIII - XIX.',
        symbolicMeaning: 'Đỉnh cao của chủ nghĩa nhân đạo sâu sắc ("Chữ tâm kia mới bằng ba chữ tài") và bậc thầy nghệ thuật ngôn từ tiếng Việt.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du, NXB Văn học.',
    },
    {
        id: 'thuc-sinh',
        keywords: ['thuc sinh', 'chang thuc'],
        name: 'Thúc Sinh',
        identity: 'Con nhà buôn họ Thúc giàu có, phong lưu, chuộc Thúy Kiều khỏi lầu xanh làm vợ lẽ.',
        role: 'Người tình say đắm nhưng nhu nhược, hèn nhát trước sự ghen tuông tàn nhẫn của vợ cả Hoạn Thư, đẩy Kiều vào cảnh trớ trêu đau khổ.',
        symbolicMeaning: 'Đại diện cho mẫu đàn ông phóng túng, đa tình nhưng thiếu bản lĩnh bảo vệ người mình yêu trong xã hội cũ.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'hoan-thu',
        keywords: ['hoan thu', 'tieu thu hoan thu'],
        name: 'Hoạn Thư',
        identity: 'Vợ cả Thúc Sinh, con quan Lại bộ Thượng thư; thông minh, sắc sảo, quý phái nhưng thâm hiểm trong việc ghen tuông.',
        role: 'Bắt cóc Thúy Kiều, đổi tên thành Hoa Nô bắt hầu hạ và đánh đàn trước mặt Thúc Sinh để hành hạ tinh thần; sau được Kiều tha bổng vì phục tài ăn nói khôn khéo.',
        symbolicMeaning: 'Điển hình cho thói ghen tuông thâm nho của giới quý tộc nhưng cũng là người sắc sảo bậc nhất ("Khôn ngoan đến mực, nói năng phải lời").',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'ma-giam-sinh',
        keywords: ['ma giam sinh', 'ho ma'],
        name: 'Mã Giám Sinh',
        identity: 'Kẻ buôn thịt bán người giả danh thư sinh Quốc Tử Giám đến mua Kiều về lầu xanh.',
        role: 'Bộ mặt trơ trẽn, con buôn lọc lừa "đắn đo cân sắc cân tài / ép cung cầm nguyệt thử bài quạt thơ".',
        symbolicMeaning: 'Hiện thân của thế lực đồng tiền tanh tưởi chà đạp lên nhân phẩm con người trong xã hội phong kiến.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'so-khanh',
        keywords: ['so khanh', 'chang so khanh'],
        name: 'Sở Khanh',
        identity: 'Kẻ lừa tình chuyên nghiệp tay sai của Tú Bà, giả vờ làm trượng phu giúp Kiều trốn chạy rồi bắt lại ép làm gái lầu xanh.',
        role: 'Nguyên nhân đẩy Thúy Kiều rơi vào hố sâu tủi nhục đoạn trường lần thứ hai.',
        symbolicMeaning: 'Tên gọi trở thành danh từ chung trong tiếng Việt chỉ kẻ bội bạc, lừa gạt tình cảm phụ nữ.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'dam-tien',
        keywords: ['dam tien', 'nang dam tien', 'ma dam tien'],
        name: 'Đạm Tiên',
        identity: 'Một ca nhi tài sắc thời trước nhưng bạc mệnh sớm qua đời, nấm mồ vô chủ bên đường được Kiều viếng và thắp hương trong tiết Thanh minh.',
        role: 'Hiện thân trong giấc mộng của Kiều, báo trước số kiếp đoạn trường "sổ đoạn trường có tên"; là tấm gương phản chiếu số phận bi kịch của người phụ nữ tài sắc trong xã hội phong kiến.',
        symbolicMeaning: 'Biểu tượng cho thân phận "hồng nhan bạc mệnh" và dự cảm định mệnh bi đát suốt mười lăm năm lưu lạc của Thúy Kiều.',
        workTitle: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du.',
    },
    {
        id: 'bac-ho',
        keywords: ['bac ho', 'ho chi minh', 'chu tich ho chi minh', 'nguoi', 'bac'],
        name: 'Chủ tịch Hồ Chí Minh (Bác Hồ)',
        identity: 'Lãnh tụ vĩ đại của Đảng và dân tộc Việt Nam, Anh hùng giải phóng dân tộc, Danh nhân văn hóa thế giới (1890 - 1969).',
        role: 'Hình tượng trung tâm kết tinh trong câu thơ phỏng ca dao của nhà thơ Bảo Định Giang: "Tháp Mười đẹp nhất bông sen / Việt Nam đẹp nhất có tên Bác Hồ".',
        symbolicMeaning: 'Hoa sen tượng trưng cho vẻ đẹp thanh cao, tinh khiết, "gần bùn mà chẳng hôi tanh mùi bùn", chính là hiện thân sinh động nhất cho nhân cách cao đẹp, bình dị và tâm hồn bao la của Bác Hồ kính yêu.',
        workTitle: 'Tháp Mười đẹp nhất bông sen',
        workSlug: 'thap-muoi-dep-nhat-bong-sen',
        source: 'Bảo Định Giang toàn tập — NXB Văn học.',
    },
    {
        id: 'bao-dinh-giang',
        keywords: ['bao dinh giang', 'nha tho bao dinh giang'],
        name: 'Nhà thơ Bảo Định Giang',
        identity: 'Nhà thơ, nhà văn cách mạng tiêu biểu của Nam Bộ (1919 - 2005), quê tại Tiền Giang. Tác giả câu thơ lục bát sáng tác năm 1946 tại Đồng Tháp Mười nhanh chóng đi vào lòng dân gian như một câu ca dao bất hủ.',
        role: 'Tác giả sáng tác câu thơ ca ngợi Bác Hồ giữa những ngày đầu kháng chiến Nam Bộ.',
        symbolicMeaning: 'Thể hiện tấm lòng son sắt hướng về Cụ Hồ và Trung ương của đồng bào Nam Bộ "thành đồng Tổ quốc".',
        workTitle: 'Tháp Mười đẹp nhất bông sen',
        workSlug: 'thap-muoi-dep-nhat-bong-sen',
        source: 'Thơ ca Kháng chiến Nam Bộ.',
    },
    {
        id: 'nguoi-nong-dan',
        keywords: ['nguoi nong dan', 'nong dan', 'nguoi cay', 'dan cay', 'con trau'],
        name: 'Hình tượng Người Nông Dân Việt Nam',
        identity: 'Người lao động chân lấm tay bùn ngàn đời gắn liền với đồng ruộng, làng quê, con trâu và nền văn minh lúa nước sông Hồng.',
        role: 'Chủ thể trữ tình trong "Cày đồng đang buổi ban trưa", "Anh đi anh nhớ quê nhà"... Trực tiếp làm ra hạt gạo dẻo thơm nuôi sống xã hội.',
        symbolicMeaning: 'Biểu tượng cho đức tính cần cù, kiên nhẫn, chịu thương chịu khó và tấm lòng yêu quê hương đất nước tha thiết ("Bưng bát cơm đầy / Dẻo thơm một hạt, đắng cay muôn phần").',
        workTitle: 'Ca dao Dân ca Việt Nam',
        workSlug: 'cay-dong-dang-buoi-ban-trua',
        source: 'Kho tàng Ca dao Dân ca người Việt — GS. Vũ Ngọc Phan.',
    },
    {
        id: 'nguoi-me',
        keywords: ['me gia', 'nguoi me', 'cong cha ao me', 'me'],
        name: 'Hình tượng Người Mẹ Việt Nam trong Ca dao',
        identity: 'Người mẹ tảo tần, chịu thương chịu khó, dành trọn vẹn cả cuộc đời hy sinh thầm lặng vì chồng vì con.',
        role: 'Hình tượng trung tâm trong "Mẹ già như chuối ba hương", "Công cha như núi Thái Sơn", "Ơn cha nặng lắm ai ơi".',
        symbolicMeaning: 'Biểu tượng cho tình mẫu tử thiêng liêng, ngọt ngào bao dung như chuối ba hương, nải chuối tiêu chín mọng; nhắc nhở sâu sắc đạo hiếu làm con.',
        workTitle: 'Ca dao Dân ca Việt Nam',
        workSlug: 'me-gia-nhu-chuoi-ba-huong',
        source: 'Ca dao Tục ngữ Việt Nam.',
    },
    {
        id: 'me-giong',
        keywords: ['me giong', 'ba me lang phu dong'],
        name: 'Người mẹ làng Phù Đổng (Mẹ Thánh Gióng)',
        identity: 'Người mẹ nông dân nghèo khó, phúc hậu sống một mình tại làng Phù Đổng; ướm chân vào vết chân khổng lồ ngoài đồng mà thụ thai sinh ra Gióng.',
        role: 'Một mình nuôi con khôn lớn; khi Gióng đòi ăn cơm để đi đánh giặc, bà cùng bà con làng xóm gom góp từng nồi cơm, manh áo nuôi Gióng lớn nhanh như thổi.',
        symbolicMeaning: 'Biểu tượng cho người mẹ Việt Nam vĩ đại và tinh thần đùm bọc, nuôi dưỡng người anh hùng cứu nước của toàn thể cộng đồng làng xã.',
        workTitle: 'Thánh Gióng (Phù Đổng Thiên Vương)',
        workSlug: 'thanh-giong',
        source: 'Kho tàng Truyền thuyết Dân gian Việt Nam.',
    },
    {
        id: 'than-nhu-nguyet',
        keywords: ['than nhu nguyet', 'truong hong', 'truong hat'],
        name: 'Hai vị thần Trương Hống, Trương Hát (Thần sông Như Nguyệt)',
        identity: 'Hai vị tướng tài thời Triệu Việt Vương, kiên trung tuẫn tiết không chịu hàng giặc, được nhân dân tôn làm phúc thần bảo hộ phòng tuyến sông Như Nguyệt.',
        role: 'Tương truyền đêm đêm hiển linh trong đền đọc vang bài thơ thần "Nam quốc sơn hà", tạo nên uy lực tâm lý thần thánh làm quân Tống hoang mang khiếp đảm.',
        symbolicMeaning: 'Sự hòa quyện giữa ý chí con người và hồn thiêng sông núi, khẳng định chủ quyền lãnh thổ thiêng liêng bất khả xâm phạm.',
        workTitle: 'Nam Quốc Sơn Hà',
        workSlug: 'nam-quoc-son-ha',
        source: 'Việt Điện U Linh Tập & Đại Việt Sử Ký Toàn Thư.',
    },
    {
        id: 'lieu-thang',
        keywords: ['lieu thang', 'tuong lieu thang'],
        name: 'Tướng giặc Liễu Thăng',
        identity: 'An Viễn hầu, Tổng binh chỉ huy 10 vạn viện binh nhà Minh từ Quảng Tây tiến vào Đại Việt hòng giải cứu Đông Quan năm 1427.',
        role: 'Tướng giặc ngạo mạn, chủ quan khinh địch, bị nghĩa quân Lam Sơn phục kích chém đầu tại ải Chi Lăng.',
        symbolicMeaning: 'Bài học đắt giá cho những kẻ xâm lược hung hăng bạo tàn, minh chứng cho sức mạnh quân sự mưu lược của quân dân Đại Việt.',
        workTitle: 'Bình Ngô Đại Cáo',
        workSlug: 'binh-ngo-dai-cao',
        source: 'Đại Việt Sử Ký Toàn Thư.',
    },
];

/**
 * KHO TRI THỨC VỊ TRÍ ĐỊA LÝ & BỐI CẢNH LỊCH SỬ THỰC TẾ (CURATED LOCATIONS)
 */
const CURATED_LOCATIONS = [
    {
        id: 'tan-vien',
        keywords: ['tan vien', 'nui tan vien', 'ba vi', 'nui ba vi'],
        title: 'Núi Tản Viên (Dãy núi Ba Vì)',
        realLocation: 'Dãy núi Ba Vì thuộc địa phận huyện Ba Vì, thành phố Hà Nội (giáp ranh tỉnh Hòa Bình). Đỉnh cao nhất là Đỉnh Vua (1.296m), bên cạnh đỉnh Tản Viên (1.281m) đỉnh thắt cổ bồng xòe tròn như chiếc ô.',
        historicalContext: 'Vùng đất thiêng của xứ Đoài cổ xưa, trung tâm văn hóa của người Việt cổ thời kỳ các Vua Hùng dựng nước Văn Lang; nơi có đền Thượng thờ Đệ nhất Phúc thần Tản Viên Sơn Thánh.',
        literaryRole: 'Điểm tựa không gian nghệ thuật thiêng liêng, biểu tượng cho sự trường tồn vững chãi của bờ cõi đất liền trước sức tàn phá của bão lũ sông Hồng ("Nước dâng lên bao nhiêu, núi cao lên bấy nhiêu").',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Dư Địa Chí — Nguyễn Trãi & Kho tàng Thần thoại Việt Nam.',
    },
    {
        id: 'bien-dong',
        keywords: ['bien dong', 'vung bien dong', 'mien bien dong'],
        title: 'Vùng Biển Đông Việt Nam',
        realLocation: 'Vùng biển rộng lớn phía Đông bao bọc toàn bộ dải duyên hải Việt Nam, nối liền Thái Bình Dương và Ấn Độ Dương.',
        historicalContext: 'Không gian sinh tồn, đánh bắt hải sản và phát triển kinh tế biển ngàn đời của cư dân Việt cổ từ thời tiền sử.',
        literaryRole: 'Khởi nguồn của sóng cả, bão dông và sức mạnh thủy triều cuồng nộ; địa bàn xuất phát của Thủy Tinh trong trận chiến với Sơn Tinh.',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Kho tàng Văn hóa Biển Việt Nam & Địa chí Quốc gia.',
    },
    {
        id: 'nhu-nguyet',
        keywords: ['nhu nguyet', 'song cau', 'song nhu nguyet'],
        title: 'Chiến tuyến Sông Như Nguyệt (Sông Cầu)',
        realLocation: 'Đoạn sông Cầu chảy qua địa phận huyện Yên Phong, tỉnh Bắc Ninh.',
        historicalContext: 'Nơi Thái úy Lý Thường Kiệt xây dựng phòng tuyến chiến lược hiểm yếu chặn đứng và đập tan 30 vạn quân xâm lược nhà Tống vào mùa xuân năm 1077, lưu danh bản thơ thần Nam quốc sơn hà.',
        literaryRole: 'Dòng sông lịch sử gắn liền với bản Tuyên ngôn Độc lập đầu tiên của nước nhà, biểu tượng cho ý chí tự cường bất khuất.',
        workSlug: 'nam-quoc-son-ha',
        source: 'Đại Việt Sử Ký Toàn Thư & Viện Sử học.',
    },
    {
        id: 'sai-khao',
        keywords: ['sai khao', 'sai khao suong lap'],
        title: 'Bản Sài Khao & Tuyến đường Tây Tiến',
        realLocation: 'Bản Sài Khao thuộc xã Mường Lý, huyện Mường Lát, tỉnh Thanh Hóa (giáp ranh biên giới Việt - Lào).',
        historicalContext: 'Một trong những chặng dừng chân gian nan nhất của Trung đoàn 52 Tây Tiến trong những năm 1947 - 1948. Núi cao hiểm trở, quanh năm mây mù che phủ, khí hậu khắc nghiệt và từng là ổ sốt rét rừng hoành hành dữ dội.',
        literaryRole: 'Không gian thử thách khắc nghiệt làm nổi bật ý chí thép và sự kiên cường của đoàn binh Tây Tiến trước thiên nhiên hoang dã.',
        workSlug: 'tay-tien',
        source: 'Kỷ yếu Di tích Lịch sử Trung đoàn 52 Tây Tiến & SGK Ngữ văn 12.',
    },
    {
        id: 'muong-lat',
        keywords: ['muong lat', 'muong lat hoa ve'],
        title: 'Địa danh Mường Lát (Thanh Hóa)',
        realLocation: 'Huyện vùng cao biên giới phía Tây của tỉnh Thanh Hóa, tiếp giáp trực tiếp với tỉnh Hủa Phăn (Lào).',
        historicalContext: 'Địa bàn hoạt động chiến lược của đoàn quân Tây Tiến nhằm bảo vệ biên cương phía Tây và phối hợp với bộ đội Pha-thét Lào đánh tiêu hao sinh lực thực dân Pháp.',
        literaryRole: 'Không gian mở ra vẻ đẹp lãng mạn, thơ mộng của núi rừng miền Tây ("Mường Lát hoa về trong đêm hơi").',
        workSlug: 'tay-tien',
        source: 'Mây đầu ô — Tuyển tập thơ Quang Dũng, NXB Văn học.',
    },
    {
        id: 'pha-luong',
        keywords: ['pha luong', 'nha ai pha luong'],
        title: 'Đỉnh núi Pha Luông (Mộc Châu)',
        realLocation: 'Đỉnh Pha Luông cao hơn 2.000m, thuộc ranh giới tự nhiên giữa huyện Mộc Châu (Sơn La) và tỉnh Hủa Phăn (Lào), được ví là "nóc nhà Mộc Châu".',
        historicalContext: 'Vùng cao hiểm trở nơi chiến sĩ Tây Tiến vượt dốc đứng để lập phòng tuyến ngăn bước tiến quân Pháp.',
        literaryRole: 'Bức tranh sơn thủy hữu tình qua câu thơ toàn thanh bằng nhẹ bẫng ("Nhà ai Pha Luông mưa xa khơi").',
        workSlug: 'tay-tien',
        source: 'SGK Ngữ văn 12 — NXB Giáo Dục.',
    },
    {
        id: 'muong-hich',
        keywords: ['muong hich', 'cop treu nguoi'],
        title: 'Địa danh Mường Hịch (Hòa Bình)',
        realLocation: 'Xã Mường Hịch, huyện Mai Châu, tỉnh Hòa Bình.',
        historicalContext: 'Cung đường hành quân hiểm trở giữa đại ngàn âm u, thời kháng chiến còn đầy thú dữ rình rập người đi rừng.',
        literaryRole: 'Khắc họa không gian rừng thiêng nước độc, tăng thêm chất hiểm nguy thử thách bản lĩnh người lính.',
        workSlug: 'tay-tien',
        source: 'Văn học Kháng chiến — Viện Văn học.',
    },
    {
        id: 'mai-chau',
        keywords: ['mai chau', 'thom nep xoi'],
        title: 'Thung lũng Mai Châu (Hòa Bình)',
        realLocation: 'Thung lũng huyện Mai Châu, tỉnh Hòa Bình — địa bàn cư trú lâu đời của đồng bào dân tộc Thái.',
        historicalContext: 'Nơi dừng chân ấm áp của chiến sĩ Tây Tiến sau những đợt hành quân dài ngày, được đồng bào tiếp tế cơm nếp, gạo mới.',
        literaryRole: 'Biểu tượng cho tình quân dân cá nước thắm thiết, xua tan cái lạnh giá nhọc nhằn của núi rừng.',
        workSlug: 'tay-tien',
        source: 'SGK Ngữ văn 12 — NXB Giáo Dục.',
    },
    {
        id: 'song-ma',
        keywords: ['song ma', 'dong song ma'],
        title: 'Dòng Sông Mã oai hùng',
        realLocation: 'Con sông lớn bắt nguồn từ Điện Biên, chảy qua Sơn La, sang Lào rồi quay lại Thanh Hóa đổ ra biển Đông, nổi tiếng với nhiều ghềnh thác hiểm trở.',
        historicalContext: 'Chứng nhân lịch sử theo suốt bước chân của đoàn binh Tây Tiến từ những ngày đầu thành lập đến ngày khúc độc hành tiễn biệt liệt sĩ.',
        literaryRole: 'Dòng sông mang tính biểu tượng thiêng liêng; tiếng gầm thét của sông Mã là khúc tráng ca bất tử của non sông tiễn đưa linh hồn người tử sĩ.',
        workSlug: 'tay-tien',
        source: 'Mây đầu ô — Tuyển tập thơ Quang Dũng.',
    },
    {
        id: 'lam-son',
        keywords: ['lam son', 'khoi nghia lam son'],
        title: 'Đất khởi nghĩa Lam Sơn (Thanh Hóa)',
        realLocation: 'Vùng đất thuộc huyện Thọ Xuân, tỉnh Thanh Hóa — quê hương và căn cứ địa khởi nghĩa của Lê Lợi.',
        historicalContext: 'Nơi nổ ra cuộc khởi nghĩa Lam Sơn 10 năm gian khổ (1418 - 1428) đánh đuổi quân Minh xâm lược giành lại độc lập cho Đại Việt.',
        literaryRole: 'Địa bàn lịch sử khởi nguồn cho bản thiên cổ hùng văn "Bình Ngô đại cáo".',
        workSlug: 'binh-ngo-dai-cao',
        source: 'Lam Sơn Thực Lục & Nguyễn Trãi toàn tập.',
    },
    {
        id: 'thon-vi-da',
        keywords: ['thon vi da', 'vi da', 'lang vi da'],
        title: 'Thôn Vĩ Dạ (Cố đô Huế)',
        realLocation: 'Ngôi làng cổ xinh đẹp bên bờ sông Hương, thuộc phường Vĩ Dạ, thành phố Huế, tỉnh Thừa Thiên Huế.',
        historicalContext: 'Thời Nguyễn, Vĩ Dạ nổi tiếng với những phủ đệ quý tộc và những khu vườn thanh nhã rợp bóng cau xanh, trúc biếc; là nơi sinh sống của gia đình tiểu thư Hoàng Cúc — mối tình đơn phương của thi sĩ Hàn Mặc Tử.',
        literaryRole: 'Không gian mở ra vẻ đẹp thanh khiết, thơ mộng của thiên nhiên xứ Huế lúc bình minh ("Nắng hàng cau nắng mới lên / Vườn ai mướt quá xanh như ngọc"), đồng thời là miền ký ức khơi nguồn cho nỗi niềm u uất và dự cảm chia lìa.',
        workSlug: 'day-thon-vi-da',
        source: 'Hàn Mặc Tử — Tác phẩm & Lời bình, NXB Văn học.',
    },
    {
        id: 'song-huong',
        keywords: ['song huong', 'huong giang', 'dong huong giang', 'dong nuoc buon thiu'],
        title: 'Dòng Sông Hương (Hương Giang xứ Huế)',
        realLocation: 'Con sông thơ mộng chảy qua trung tâm thành phố Huế, bắt nguồn từ dãy Trường Sơn và đổ ra biển Thuận An.',
        historicalContext: 'Chứng nhân lịch sử ngàn đời của Cố đô Huế, nguồn cảm hứng bất tận của các thế hệ thi nhân từ Nguyễn Du, Bà Huyện Thanh Quan đến Hàn Mặc Tử, Tố Hữu, Hoàng Phủ Ngọc Tường.',
        literaryRole: 'Không gian biểu hiện dòng chảy tâm trạng; trong khổ thơ thứ hai của "Đây Thôn Vĩ Dạ", dòng nước sông Hương lững lờ trôi mang theo nỗi buồn chia phôi ("Dòng nước buồn thiu, hoa bắp lay").',
        workSlug: 'day-thon-vi-da',
        source: 'Dư Địa Chí Thừa Thiên Huế & Văn học Lớp 11.',
    },
    {
        id: 'ben-song-trang',
        keywords: ['song trang', 'ben song trang', 'thuyen cho trang'],
        title: 'Bến Sông Trăng (Không gian Nghệ thuật Huyền ảo)',
        realLocation: 'Không gian nghệ thuật tượng trưng siêu thực được thăng hoa từ bến nước sông Hương thực tế về đêm.',
        historicalContext: 'Gắn liền với thế giới thơ "Trăng" độc đáo của Hàn Mặc Tử — nơi ánh trăng trở thành sinh thể sống bầu bạn và chia sẻ nỗi cô đơn tột cùng của thi nhân.',
        literaryRole: 'Chiếc thuyền chở đầy ánh trăng neo đậu hay trôi đi là ẩn dụ cho niềm khao khát hạnh phúc và nỗi hoài nghi, chạy đua với thời gian trước sự đe dọa của căn bệnh tử thần ("Thuyền ai đậu bến sông trăng đó / Có chở trăng về kịp tối nay?").',
        workSlug: 'day-thon-vi-da',
        source: 'Thi pháp Thơ Mới — GS. Trần Đình Sử.',
    },
    {
        id: 'viet-bac',
        keywords: ['viet bac', 'chien khu viet bac', 'rung hoang suong muoi'],
        title: 'Chiến khu Việt Bắc (Thủ đô Kháng chiến)',
        realLocation: 'Vùng căn cứ địa địa đầu Tổ quốc bao gồm 6 tỉnh: Cao Bằng, Bắc Kạn, Lạng Sơn, Hà Giang, Tuyên Quang, Thái Nguyên (Thủ đô Gió ngàn).',
        historicalContext: 'Căn cứ đầu não của Trung ương Đảng và Bác Hồ lãnh đạo cuộc kháng chiến chống thực dân Pháp (1946 - 1954); nơi diễn ra chiến thắng Thu Đông 1947 đập tan cuộc tấn công của giặc Pháp.',
        literaryRole: 'Không gian chiến hào khắc nghiệt nơi rừng hoang sương muối, thử thách ý chí chiến đấu và tôi luyện nên tình đồng chí thiêng liêng cao đẹp ("Đêm nay rừng hoang sương muối / Đứng cạnh bên nhau chờ giặc tới / Đầu súng trăng treo").',
        workSlug: 'dong-chi',
        source: 'Lịch sử Kháng chiến Chống Pháp — Viện Lịch sử Quân sự.',
    },
    {
        id: 'yen-do-binh-luc',
        keywords: ['yen do', 'binh luc', 'ao thu', 'lang va'],
        title: 'Làng Và, Vùng Chiêm trũng Yên Đổ (Bình Lục, Hà Nam)',
        realLocation: 'Làng An Đổ (làng Và), xã Trung Lương, huyện Bình Lục, tỉnh Hà Nam — vùng đồng chiêm trũng đặc trưng của đồng bằng Bắc Bộ.',
        historicalContext: 'Quê hương của Tam nguyên Yên Đổ Nguyễn Khuyến; nơi nhà thơ lui về ở ẩn sau khi từ quan để giữ trọn khí tiết trước sự mua chuộc của thực dân Pháp.',
        literaryRole: 'Không gian tĩnh lặng, trong veo của chiếc ao thu làng quê ("Ao thu lạnh lẽo nước trong veo / Một chiếc thuyền câu bé tẻo teo"), phản chiếu tâm sự u uất, tĩnh lặng mà đầy bão dông của bậc túc nho yêu nước.',
        workSlug: 'thu-dieu',
        source: 'Địa chí Hà Nam & Thơ văn Nguyễn Khuyến.',
    },
    {
        id: 'soc-son-phu-dong',
        keywords: ['soc son', 'nui soc', 'phu dong', 'lang giong'],
        title: 'Khu Di tích Đền Gióng (Phù Đổng & Núi Sóc)',
        realLocation: 'Làng Phù Đổng (huyện Gia Lâm) và Núi Sóc (huyện Sóc Sơn), thành phố Hà Nội.',
        historicalContext: 'Nơi sinh ra và là chiến trường người anh hùng Thánh Gióng đánh tan giặc Ân; trên đỉnh núi Sóc, Gióng cởi áo giáp sắt bay thẳng về trời.',
        literaryRole: 'Biểu tượng cho tinh thần xả thân vô tư của người anh hùng cứu nước; không gian thiêng liêng lưu dấu tích vó ngựa sắt thành ao hồ và tre đằng ngà.',
        workSlug: 'thanh-giong',
        source: 'Kho tàng Di sản Văn hóa Thăng Long - Hà Nội.',
    },
    {
        id: 'phong-chau',
        keywords: ['phong chau', 'kinh do phong chau', 'phu tho', 'den hung'],
        title: 'Kinh đô Phong Châu (Khu Di tích Đền Hùng, Phú Thọ)',
        realLocation: 'Khu vực thành phố Việt Trì và huyện Lâm Thao, tỉnh Phú Thọ; trung tâm là núi Nghĩa Lĩnh.',
        historicalContext: 'Kinh đô của nhà nước Văn Lang cổ đại dưới thời 18 đời Vua Hùng dựng nước dựng non.',
        literaryRole: 'Cái nôi văn minh sông Hồng, nơi diễn ra cuộc thách cưới kén rể lẫy lừng giữa Sơn Tinh và Thủy Tinh.',
        workSlug: 'son-tinh-thuy-tinh',
        source: 'Đại Việt Sử Ký Toàn Thư & Di tích Quốc gia đặc biệt Đền Hùng.',
    },
    {
        id: 'tien-duong',
        keywords: ['tien duong', 'song tien duong'],
        title: 'Dòng Sông Tiền Đường (Không gian Đoạn trường trong Truyện Kiều)',
        realLocation: 'Con sông lớn chảy qua tỉnh Chiết Giang, nổi tiếng với hiện tượng thủy triều dâng cuồn cuộn vào ngày rằm tháng Tám.',
        historicalContext: 'Địa danh lịch sử trong tác phẩm của Nguyễn Du, nơi Thúy Kiều trầm mình quyên sinh sau bi kịch Từ Hải bị lừa sát hại.',
        literaryRole: 'Không gian hóa giải mọi oan khiên đoạn trường của mười lăm năm lưu lạc; nơi sư Giác Duyên cứu vớt Kiều, đưa nàng thoát khỏi bể khổ trần gian.',
        workSlug: 'truyen-kieu',
        source: 'Truyện Kiều — Nguyễn Du, NXB Văn học.',
    },
    {
        id: 'xu-nghe',
        keywords: ['xu nghe', 'nghe an', 'ha tinh', 'song lam', 'nui hong linh', 'hong linh'],
        title: 'Vùng Đất Xứ Nghệ (Nghệ An - Hà Tĩnh)',
        realLocation: 'Dải đất miền Trung bao gồm hai tỉnh Nghệ An và Hà Tĩnh, được bao bọc bởi núi Hồng Lĩnh 99 ngọn và dòng sông Lam thơ mộng.',
        historicalContext: 'Vùng đất địa linh nhân kiệt, cái nôi sinh dưỡng biết bao danh nhân, anh hùng hào kiệt (Mai Hắc Đế, Nguyễn Du, Phan Bội Châu, Hồ Chí Minh...); quê hương của di sản dân ca Ví Giặm được UNESCO vinh danh.',
        literaryRole: 'Không gian văn hóa sơn thủy hữu tình, mộc mạc và sâu nặng nghĩa tình trong câu ca dao "Đường vô xứ Nghệ quanh quanh / Non xanh nước biếc như tranh họa đồ".',
        workSlug: 'duong-vo-xu-nghe-quanh-quanh',
        source: 'Địa chí Văn hóa Xứ Nghệ — GS. Ninh Viết Giao.',
    },
    {
        id: 'deo-ngang',
        keywords: ['deo ngang', 'hoanh son'],
        title: 'Đèo Ngang (Dãy Hoành Sơn)',
        realLocation: 'Con đèo hiểm trở trên dãy Hoành Sơn, ranh giới tự nhiên giữa tỉnh Hà Tĩnh và Quảng Bình.',
        historicalContext: 'Cửa ngõ huyết mạch Bắc - Nam thời phong kiến; nơi Bà Huyện Thanh Quan dừng chân trên đường vào kinh đô Huế nhận chức Cung Trung Giáo Tập.',
        literaryRole: 'Điểm tựa không gian hoang sơ heo hút lúc chiều tà, gợi mở nỗi nhớ nước thương nhà và tâm sự hoài cổ tiếc nuối thời vàng son.',
        workSlug: 'qua-deo-ngang',
        source: 'Hợp tuyển Thơ văn Việt Nam thế kỷ XIX.',
    },
    {
        id: 'ho-tay',
        keywords: ['ho tay', 'tran vu', 'tho xuong', 'yen thai'],
        title: 'Quần thể Di sản Ven Hồ Tây (Thăng Long xưa)',
        realLocation: 'Khu vực quanh Hồ Tây (Hà Nội): Đền Quán Thánh (Trấn Vũ), phường Thọ Xương, làng nghề giấy dó Yên Thái.',
        historicalContext: 'Cảnh sinh hoạt văn hóa, tôn giáo và làng nghề truyền thống của đất kinh kỳ Thăng Long thời Lê - Trịnh và thời Nguyễn.',
        literaryRole: 'Khắc họa bức tranh Thăng Long ngàn năm văn hiến thanh bình, tao nhã qua âm thanh chuông đền và tiếng chày giã giấy.',
        workSlug: 'gio-dua-canh-truc-la-da',
        source: 'Hà Nội trong ca dao ngạn ngữ — GS. Doãn Kế Thiện.',
    },
    {
        id: 'thap-muoi',
        keywords: ['thap muoi', 'dong thap muoi'],
        title: 'Vùng Đồng Tháp Mười',
        realLocation: 'Vùng trũng ngập nước rộng lớn thuộc các tỉnh Long An, Tiền Giang, Đồng Tháp ở miền Tây Nam Bộ.',
        historicalContext: 'Căn cứ địa cách mạng kiên cường thời kỳ kháng chiến chống Pháp và chống Mỹ.',
        literaryRole: 'Không gian văn hóa sông nước trù phú nơi bừng nở những đóa sen ngát hương, tôn vinh hình tượng Bác Hồ kính yêu.',
        workSlug: 'thap-muoi-dep-nhat-bong-sen',
        source: 'Ca dao Dân ca Nam Bộ — NXB Khoa học Xã hội.',
    },
    {
        id: 'duong-truong-son',
        keywords: ['truong son', 'duong truong son', 'duong mon ho chi minh', 'tuyen lua truong son'],
        title: 'Tuyến đường Trường Sơn (Đường mòn Hồ Chí Minh)',
        realLocation: 'Tuyến đường vận tải chiến lược quân sự dọc theo dãy núi Trường Sơn hùng vĩ, vắt ngang qua lãnh thổ Việt Nam, Lào và Campuchia.',
        historicalContext: 'Mạch máu giao thông huyết mạch chi viện sức người sức của từ hậu phương miền Bắc cho tiền tuyến miền Nam (1959 - 1975), nơi hứng chịu hơn 3 triệu tấn bom đạn của quân đội Mỹ.',
        literaryRole: 'Không gian thử thách khắc nghiệt tột cùng của chiến tranh hiện đại, nơi bừng sáng tinh thần lạc quan, chủ nghĩa anh hùng cách mạng và ý chí giải phóng dân tộc.',
        workSlug: 'bai-tho-ve-tieu-doi-xe-khong-kinh',
        source: 'Lịch sử Bộ đội Trường Sơn — NXB Quân đội Nhân dân.',
    },
];

/**
 * KHO TỪ ĐIỂN TỪ NGỮ KHÓ, TỪ HÁN VIỆT, TỪ CỔ & ẨN DỤ (CURATED TERMS)
 */
const CURATED_TERMS = [
    {
        id: 'thuy-mi',
        keywords: ['thuy mi', 'nhan sac thuy mi'],
        term: 'Thùy mị (Thủy mị)',
        definition: 'Từ Hán Việt ghép từ "Thùy" (rủ xuống, khiêm nhường) và "Mị" (đẹp đẽ, dịu dàng). Chỉ tính cách hiền dịu, nết na, nề nếp, đoan trang và nhu mì của người phụ nữ.',
        contextualMeaning: 'Khắc họa trọn vẹn vẻ đẹp đức hạnh toàn bích của công chúa Mỵ Nương trong tác phẩm "Sơn Tinh - Thủy Tinh", mẫu người con gái lý tưởng thời Hùng Vương.',
        expressiveValue: 'Tôn vinh vẻ đẹp truyền thống của người phụ nữ Việt Nam, tạo sự đối xứng hài hòa với sự mạnh mẽ, dũng mãnh của hai vị thần đến cầu hôn.',
    },
    {
        id: 'ken-re',
        keywords: ['ken re', 'muon ken cho con'],
        term: 'Kén rể',
        definition: 'Hành động chọn lựa cẩn trọng, khắt khe của cha mẹ để tìm được người con rể xứng đáng nhất về cả đức độ, tài năng và gia thế cho con gái.',
        contextualMeaning: 'Phản ánh vị thế vương tộc cao quý của Vua Hùng thứ 18 và tạo nên nút thắt kịch tính then chốt khởi đầu cuộc tranh tài giữa hai vị thần.',
        expressiveValue: 'Khắc họa nét phong tục hôn nhân truyền thống coi trọng người hiền tài của tổ tiên ta buổi đầu dựng nước.',
    },
    {
        id: 'sinh-le',
        keywords: ['sinh le', 'sinh le cuoi', 'le vat'],
        term: 'Sính lễ',
        definition: 'Lễ vật mà nhà trai đem đến dâng lên nhà gái theo phong tục tập quán cưới hỏi truyền thống để cầu hôn.',
        contextualMeaning: 'Gồm "Voi chín ngà, gà chín cựa, ngựa chín hồng mao" — các sản vật kỳ hiếm trên cạn biểu tượng cho tài nguyên sơn lâm đất Việt.',
        expressiveValue: 'Biểu hiện trí tuệ dân gian, vừa tạo thử thách kén chọn anh tài vừa ngầm nghiêng về vị thần bảo hộ đất đai, núi rừng non nước (Sơn Tinh).',
    },
    {
        id: 'tiet-nhien',
        keywords: ['tiet nhien', 'tiet nhien dinh phan'],
        term: 'Tiệt nhiên (截然)',
        definition: 'Từ Hán Việt mang nghĩa dứt khoát, rõ ràng, minh bạch, tuyệt đối không có gì phải nghi ngờ hay bàn cãi.',
        contextualMeaning: 'Xuất hiện trong câu mở đầu bài thơ thần: "Tiệt nhiên định phận tại thiên thư" (Nam quốc sơn hà). Khẳng định chủ quyền đất nước là chân lý hiển nhiên bất biến của đất trời.',
        expressiveValue: 'Tạo giọng điệu đanh thép, hào sảng, mang tính khẳng định tuyệt đối ý chí độc lập tự cường của một dân tộc có chủ quyền.',
    },
    {
        id: 'thien-thu',
        keywords: ['thien thu', 'tai thien thu'],
        term: 'Thiên thư (天書)',
        definition: 'Từ Hán Việt có nghĩa là "Sách trời", chỉ ý chỉ thiêng liêng cao nhất của vũ trụ và tạo hóa đã được định đoạt.',
        contextualMeaning: 'Khẳng định bờ cõi nước Nam do chính Vua Nam ở là luật lệ đã được ghi trong sách trời, bất kỳ ai xâm phạm đều là nghịch thiên.',
        expressiveValue: 'Nâng ý chí bảo vệ giang sơn lên tầm chân lý vũ trụ, tạo sức mạnh tinh thần cổ vũ binh sĩ và làm run sợ quân giặc.',
    },
    {
        id: 'nghich-lo',
        keywords: ['nghich lo', 'nhu ha nghich lo'],
        term: 'Nghịch lỗ (逆虜)',
        definition: 'Từ Hán Việt ghép từ "Nghịch" (làm trái đạo lý, phản trắc) và "Lỗ" (quân cướp, kẻ xâm lăng bạo ngược).',
        contextualMeaning: 'Chỉ đích danh quân xâm lược nhà Tống dám đem quân xâm phạm bờ cõi Đại Việt trái với mệnh trời và lòng người.',
        expressiveValue: 'Bộc lộ thái độ khinh bỉ, căm giận và cảnh báo đanh thép về kết cục thảm bại tất yếu của kẻ xâm lược phi nghĩa.',
    },
    {
        id: 'dieu-phat',
        keywords: ['dieu phat', 'quan dieu phat'],
        term: 'Điếu phạt (弔伐)',
        definition: 'Rút gọn từ thành ngữ "Điếu dân phạt tội" — Thương xót nỗi đau của dân lành mà dấy quân trừng phạt kẻ bạo ngược có tội.',
        contextualMeaning: 'Tuyên ngôn mục đích chính nghĩa của khởi nghĩa Lam Sơn trong "Bình Ngô đại cáo": Lấy sự yên ổn và hạnh phúc của nhân dân làm gốc.',
        expressiveValue: 'Đỉnh cao của tư tưởng nhân văn và lòng nhân ái Việt Nam; đánh giặc không vì cướp đoạt mà vì chính nghĩa cứu dân cứu nước.',
    },
    {
        id: 'doan-truong',
        keywords: ['doan truong', 'doan truong tan thanh'],
        term: 'Đoạn trường (斷腸)',
        definition: 'Từ Hán Việt có nghĩa đen là "đứt từng khúc ruột". Nghĩa bóng diễn tả nỗi đau đớn, xót xa đến tột cùng về tinh thần.',
        contextualMeaning: 'Nhan đề kiệt tác "Đoạn Trường Tân Thanh" (Tiếng kêu mới về nỗi đau đứt ruột), phản chiếu mười lăm năm lưu lạc cay đắng của Thúy Kiều.',
        expressiveValue: 'Gợi mở tấm lòng trắc ẩn bao la của Nguyễn Du trước số phận bi kịch của con người tài hoa mà bạc mệnh dưới chế độ phong kiến bất công.',
    },
    {
        id: 'dem-hoi',
        keywords: ['dem hoi', 'trong dem hoi'],
        term: 'Đêm hơi',
        definition: 'Sự sáng tạo ngôn từ độc đáo, mới lạ của thi sĩ Quang Dũng trong bài thơ "Tây Tiến".',
        contextualMeaning: 'Không dùng "đêm sương" hay "đêm lạnh" thông thường, mà là "đêm hơi" — màn đêm ngập tràn hơi ẩm, sương nước và hơi thở hoang dã của đại ngàn Tây Bắc.',
        expressiveValue: 'Vừa gợi mở không gian huyền ảo, ma mị của núi rừng hiểm trở, vừa đong đầy chất thơ lãng mạn hào hoa của người lính trí thức thủ đô.',
    },
    {
        id: 'choi-voi',
        keywords: ['choi voi', 'nho choi voi'],
        term: 'Chơi vơi',
        definition: 'Từ láy tượng hình tượng thanh miêu tả trạng thái lơ lửng bồng bềnh, không nơi bấu víu giữa không gian mênh mông.',
        contextualMeaning: 'Diễn tả một nỗi nhớ da diết, trống trải và khôn nguôi của Quang Dũng khi chia tay đơn vị cũ ("Sông Mã xa rồi Tây Tiến ơi / Nhớ về rừng núi nhớ chơi vơi").',
        expressiveValue: 'Gợi cảm giác bâng khuâng, sâu lắng, nâng nỗi nhớ cụ thể thành nỗi nhớ mênh mang bao trùm cả không gian và thời gian.',
    },
    {
        id: 'sung-ngui-troi',
        keywords: ['sung ngui troi', 'ngui troi'],
        term: 'Súng ngửi trời',
        definition: 'Hình tượng nhân hóa táo bạo, độc đáo và hóm hỉnh của nhà thơ Quang Dũng.',
        contextualMeaning: 'Miêu tả mũi súng của người chiến sĩ đeo sau lưng khi leo lên đỉnh đèo dốc đứng cao chót vót chạm tới tầng mây mù.',
        expressiveValue: 'Vừa cực tả độ dốc đứng cheo leo của địa hình Tây Bắc, vừa thể hiện tư thế ngạo nghễ, tinh thần lạc quan, tếu táo và khí phách hiên ngang của người lính.',
    },
    {
        id: 'nuoc-man-dong-chua',
        keywords: ['nuoc man dong chua', 'dong chua'],
        term: 'Nước mặn đồng chua',
        definition: 'Thành ngữ dân gian chỉ những vùng đất duyên hải nhiễm phèn, ngập mặn khó khăn cho canh tác nông nghiệp.',
        contextualMeaning: 'Xuất hiện trong bài thơ "Đồng Chí" của Chính Hữu, khắc họa hoàn cảnh xuất thân nghèo khó, lam lũ của người lính vệ quốc.',
        expressiveValue: 'Tạo sự đối xứng mộc mạc với "đất cày lên sỏi đá", làm nổi bật điểm chung về số phận nghèo khó — cơ sở tự nhiên hình thành tình đồng chí keo sơn.',
    },
    {
        id: 'dau-sung-trang-treo',
        keywords: ['dau sung trang treo', 'trang treo'],
        term: 'Đầu súng trăng treo',
        definition: 'Hình ảnh biểu tượng nghệ thuật tuyệt mỹ kết tinh toàn bộ bài thơ "Đồng Chí".',
        contextualMeaning: 'Gợi cảnh thực trong đêm phục kích chờ giặc giữa rừng sương muối: trăng khuya hạ thấp dần ngang tầm mũi súng người lính canh gác.',
        expressiveValue: 'Sự kết hợp hoàn hảo giữa hiện thực chiến đấu khốc liệt (súng) và lãng mạn hòa bình (trăng); chiến đấu hôm nay chính là để bảo vệ ánh trăng thanh bình cho đất mẹ.',
    },
    {
        id: 'mat-chu-dien',
        keywords: ['mat chu dien', 'la truc che ngang mat chu dien'],
        term: 'Mặt chữ điền',
        definition: 'Theo nhân tướng học Á Đông, đây là khuôn mặt vuông vức đầy đặn hình chữ Điền (田), biểu trưng cho người trung thực, đôn hậu, phúc hậu và đoan trang.',
        contextualMeaning: 'Xuất hiện trong bài "Đây Thôn Vĩ Dạ" của Hàn Mặc Tử ("Lá trúc che ngang mặt chữ điền"), gợi tả gương mặt thanh tú kín đáo của con người xứ Huế.',
        expressiveValue: 'Khắc họa vẻ đẹp kín đáo, e ấp và thanh tao của người con gái Huế ẩn hiện sau bóng trúc hiền hòa.',
    },
    {
        id: 'quoc-quoc-gia-gia',
        keywords: ['quoc quoc', 'gia gia', 'nho nuoc', 'thuong nha'],
        term: 'Quốc quốc - Gia gia',
        definition: 'Nghệ thuật chơi chữ đồng âm kinh điển mượn tiếng chim cuốc kêu "quốc quốc" (quốc = nước) và chim đa đa kêu "gia gia" (gia = nhà).',
        contextualMeaning: 'Xuất hiện trong bài "Qua Đèo Ngang" của Bà Huyện Thanh Quan lúc chiều tà nơi đèo cao hoang vắng.',
        expressiveValue: 'Thủ pháp lấy động tả tĩnh mượn tiếng chim hoang vắng để bộc lộ sâu sắc nỗi nhớ nước thương nhà và tâm sự hoài cổ tiếc nuối thời vàng son triều Lê.',
    },
    {
        id: 'ung-dung-buong-lai',
        keywords: ['ung dung', 'ung dung buong lai', 'nhin thang', 'nhin dat nhin troi nhin thang'],
        term: 'Ung dung buồng lái & Nhìn thẳng',
        definition: 'Tư thế điềm tĩnh, tự chủ, ung dung đĩnh đạc và bản lĩnh không hề nao núng trước hiểm nguy bom đạn.',
        contextualMeaning: 'Đảo ngữ "Ung dung buồng lái ta ngồi" kết hợp với cái "nhìn thẳng" kiêu hãnh của người lính lái xe giữa buồng lái trơ trọi không kính chắn gió trên đường Trường Sơn.',
        expressiveValue: 'Khắc họa bản lĩnh phi thường, khí phách ngạo nghễ và tư thế làm chủ hoàn cảnh, làm chủ chiến trường của thế hệ trẻ Việt Nam thời đánh Mỹ.',
    },
    {
        id: 'bep-hoang-cam',
        keywords: ['bep hoang cam', 'hoang cam', 'dung giua troi'],
        term: 'Bếp Hoàng Cầm',
        definition: 'Loại bếp dã chiến do chiến sĩ Hoàng Cầm sáng chế, có hệ thống rãnh dẫn khói tản sát mặt đất để nấu ăn mà không bị máy bay trinh sát địch phát hiện.',
        contextualMeaning: 'Biểu tượng cho đời sống sinh hoạt dã chiến gian khổ mà ấm áp: nơi đồng đội quây quần bên nhau "Chung bát đũa nghĩa là gia đình đấy".',
        expressiveValue: 'Tôn vinh sự gắn bó keo sơn của tình đồng chí, biến những người xa lạ thành anh em một nhà giữa chốn rừng sâu khói lửa.',
    },
    {
        id: 'trai-tim-trong-xe',
        keywords: ['mot trai tim', 'trai tim trong xe', 'chi can trong xe co mot trai tim'],
        term: 'Chỉ cần trong xe có một trái tim',
        definition: 'Hình ảnh ẩn dụ và hoán dụ nghệ thuật đỉnh cao kết tinh toàn bộ tư tưởng và linh hồn của bài thơ.',
        contextualMeaning: 'Dù xe thiếu thốn đủ thứ (không kính, không đèn, không mui, thùng xe xước), chiếc xe vẫn băng băng tiến về phía trước vì bên trong buồng lái có một trái tim yêu nước nồng nàn.',
        expressiveValue: 'Khẳng định sức mạnh tinh thần, ý chí và lý tưởng cứu nước của con người là nhân tố quyết định chiến thắng mọi bom đạn sắt thép tàn khốc của kẻ thù.',
    },
];

/**
 * Helper tra cứu nhanh thực thể nhân vật, địa danh, từ ngữ trong Curated Knowledge
 */
function findCuratedCharacter(text) {
    if (!text) return null;
    const clean = removeVietnameseTones(text).toLowerCase().trim();
    if (clean.length < 2) return null;

    // 1. Exact match with any keyword
    for (const c of CURATED_CHARACTERS) {
        for (const kw of c.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (clean === cleanKw) return c;
        }
    }

    // 2. Contains match (text contains keyword, e.g. "nhà thơ Hàn Mặc Tử" contains "han mac tu")
    for (const c of CURATED_CHARACTERS) {
        for (const kw of c.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (cleanKw.length >= 3 && clean.includes(cleanKw)) return c;
        }
    }

    // 3. Reverse contains (keyword contains text, e.g. text is "Hàn Mặc Tử", kw is "thi si han mac tu")
    for (const c of CURATED_CHARACTERS) {
        for (const kw of c.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (clean.length >= 4 && cleanKw.includes(clean)) return c;
        }
    }

    return null;
}

function findCuratedLocation(text) {
    if (!text) return null;
    const clean = removeVietnameseTones(text).toLowerCase().trim();
    if (clean.length < 2) return null;

    // 1. Exact match with any keyword
    for (const loc of CURATED_LOCATIONS) {
        for (const kw of loc.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (clean === cleanKw) return loc;
        }
    }

    // 2. Contains match (text contains keyword)
    for (const loc of CURATED_LOCATIONS) {
        for (const kw of loc.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (cleanKw.length >= 3 && clean.includes(cleanKw)) return loc;
        }
    }

    // 3. Reverse contains
    for (const loc of CURATED_LOCATIONS) {
        for (const kw of loc.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (clean.length >= 4 && cleanKw.includes(clean)) return loc;
        }
    }

    return null;
}

function findCuratedTerm(text) {
    if (!text) return null;
    const clean = removeVietnameseTones(text).toLowerCase().trim();
    if (clean.length < 2) return null;

    for (const t of CURATED_TERMS) {
        for (const kw of t.keywords) {
            const cleanKw = removeVietnameseTones(kw).toLowerCase().trim();
            if (clean === cleanKw) return t;
            if (cleanKw.length >= 3 && clean.includes(cleanKw)) return t;
            if (clean.length >= 4 && cleanKw.includes(clean)) return t;
        }
    }

    return null;
}

const GREETING_PATTERNS = [
    /^(xin\s+)?chao(\s+(ban|ad|tro\s+ly|ai|bot|nhe|nha|moi\s+nguoi))?$/i,
    /^(hello|hi|hey|halo|hola)(\s+(bot|ai|there))?$/i,
    /^(ban\s+la\s+ai|ban\s+ten\s+gi|ban\s+co\s+the\s+lam\s+gi|gioi\s+thieu\s+ve\s+ban)$/i,
    /^(cam\s+on|thank\s+you|thanks|cam\s+on\s+ban|ok|oke|okie)$/i,
    /^(tam\s+biet|bye|goodbye)$/i,
];

function isConversationalGreeting(text) {
    const clean = removeVietnameseTones(text).trim().toLowerCase();
    return GREETING_PATTERNS.some((pattern) => pattern.test(clean));
}

const OFF_TOPIC_PATTERNS = [
    // Ăn uống sinh hoạt đời thường
    /\b(hom nay|trua nay|toi nay|sang nay|chieu nay)\s+an\s+gi\b/i,
    /\ban\s+gi\s+(hom nay|trua nay|toi nay|sang nay|chieu nay|ngon|day|bay gio)\b/i,
    /\b(thuc don|mon ngon|mon an hang ngay|nau mon gi|an gi bay gio)\b/i,
    // Thời tiết
    /\b(thoi tiet|du bao thoi tiet|troi mua|troi nang|nhiet do hom nay)\b/i,
    // Lập trình / Tech
    /\b(viet code|lap trinh|fix bug|code python|code java|code c\+\+|reactjs)\b/i,
    // Toán / Khoa học
    /\b(giai phuong trinh|dao ham|tich phan|cong thuc hoa hoc)\b/i,
    // Tài chính đời thường / May rủi
    /\b(gia vang|chung khoan|xo so|ty so bong da|soi keo)\b/i,
    // Mua sắm đồ công nghệ
    /\b(mua dien thoai|iphone bao nhieu|mua laptop|mua xe may)\b/i,
];

function isOffTopicQuery(text) {
    if (!text) return false;
    const clean = removeVietnameseTones(text).trim().toLowerCase();
    return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(clean));
}

module.exports = {
    DEFAULT_SUGGESTIONS,
    GEMINI_MODELS,
    CURATED_CHARACTERS,
    CURATED_LOCATIONS,
    CURATED_TERMS,
    findCuratedCharacter,
    findCuratedLocation,
    findCuratedTerm,
    GREETING_PATTERNS,
    isConversationalGreeting,
    OFF_TOPIC_PATTERNS,
    isOffTopicQuery,
};
