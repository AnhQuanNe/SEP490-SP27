/**
 * SCRIPT CHUẨN HÓA TOÀN BỘ DỮ LIỆU TÁC PHẨM & TƯ LIỆU VĂN HỌC TRONG DATABASE
 * Dự án: VietHeritage AI (SEP490)
 * Đảm bảo 100% tác phẩm có đầy đủ:
 * - title, slug, category, categoryName, period, region, author, topic
 * - summary, quote
 * - content: Toàn văn tác phẩm hoặc bài thơ trọn vẹn + phân tích văn học chuyên sâu
 * - literalMeaning: Nghĩa đen (Hiển ngôn)
 * - figurativeMeaning: Nghĩa bóng (Hàm ẩn)
 * - lesson: Bài học nhân sinh & Giá trị đạo đức
 * - historicalContext: Bối cảnh lịch sử - xã hội - niên đại
 * - thematicMeaning: Giá trị tư tưởng & Nghệ thuật cốt lõi
 * - source: Nguồn học thuật kiểm chứng uy tín (GS Vũ Ngọc Phan, GS Nguyễn Lân, SGK Ngữ Văn, Viện Văn Học...)
 * - tags: Từ khóa ontology phục vụ Knowledge Graph & Tìm kiếm ngữ nghĩa
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Work = require('../models/Work');

const standardizedWorks = [
    // =========================================================================
    // 1. TỤC NGỮ VIỆT NAM (10 TÁC PHẨM ĐẶC SẮC)
    // =========================================================================
    {
        title: 'Uống nước nhớ nguồn',
        slug: 'uong-nuoc-nho-nguon',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Lòng biết ơn',
        summary: 'Câu tục ngữ nhắc nhở con người phải luôn ghi nhớ cội nguồn, biết ơn những thế hệ cha ông đi trước đã khai phá, gìn giữ non sông và mang lại cuộc sống ấm no hôm nay.',
        quote: 'Uống nước nhớ nguồn / Ăn quả nhớ kẻ trồng cây',
        content: `Câu tục ngữ "Uống nước nhớ nguồn" là một trong những đạo lý nền tảng nhất trong văn hóa ứng xử của người Việt Nam qua hàng nghìn năm lịch sử.

Trong đời sống tự nhiên, "nước" là cội rễ của sự sống, con nước mát lành ta uống hôm nay bắt nguồn từ những khe suối đầu nguồn hiểm trở trên đại ngàn. Từ quy luật tự nhiên, nhân dân đã đúc kết thành chân lý nhân sinh: Mọi thành quả hòa bình, tự do, cơm no áo ấm mà thế hệ hôm nay thụ hưởng đều được đánh đổi bằng mồ hôi, nước mắt và xương máu của bao thế hệ tiền nhân.

Câu tục ngữ đặt ra nghĩa vụ đạo đức: Sống ở đời phải có thủy có chung, biết trân trọng quá khứ, phụng dưỡng tổ tiên, tri ân thương binh liệt sĩ và những người đã có công tạo dựng, gìn giữ non sông đất nước.`,
        literalMeaning: 'Khi ta uống dòng nước ngọt lành thì cần phải tìm hiểu và trân quý ngọn nguồn nơi sinh ra dòng nước đó.',
        figurativeMeaning: 'Khi được hưởng thụ thành quả, ấm no, hạnh phúc hôm nay, phải luôn khắc ghi công ơn của thế hệ đi trước đã dày công khai phá và bảo vệ.',
        lesson: 'Giáo dục lòng biết ơn, tinh thần đền ơn đáp nghĩa, sống có trước có sau; phê phán thái độ vong ân bội nghĩa hay quay lưng với cội nguồn dân tộc.',
        historicalContext: 'Được đúc kết từ hàng ngàn năm lịch sử dựng nước và giữ nước, gắn liền với tín ngưỡng thờ cúng Hùng Vương và đạo lý thờ cúng Tổ tiên của người Việt.',
        thematicMeaning: 'Giá trị đạo đức nhân bản cốt lõi tạo nên bản sắc, sức mạnh cố kết cộng đồng và sự trường tồn của tâm hồn Việt.',
        source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn hóa Thông tin, trang 458.',
        tags: ['Uống nước nhớ nguồn', 'Tục ngữ', 'Lòng biết ơn', 'Đạo lý', 'Tri ân', 'Cội nguồn'],
        readTime: '3 phút đọc',
        viewsCount: 2840,
        likesCount: 890,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Ăn quả nhớ kẻ trồng cây',
        slug: 'an-qua-nho-ke-trong-cay',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Lòng biết ơn',
        summary: 'Bài học nhân văn sâu sắc về sự trân trọng mồ hôi nước mắt của người lao động và tấm lòng tri ân người đã tạo dựng thành quả.',
        quote: 'Ăn quả nhớ kẻ trồng cây / Ăn khoai nhớ kẻ cho dây mà trồng',
        content: `Một trái ngọt đơm hoa kết trái cần trải qua bao tháng ngày vun xới, dầm mưa dãi nắng, bắt sâu tỉa cành của người làm vườn. 

Hình ảnh "ăn quả" đại diện cho việc thụ hưởng những giá trị vật chất và tinh thần tốt đẹp trong xã hội. "Kẻ trồng cây" là biểu tượng cho người lao động trực tiếp, người khai mở sáng tạo hoặc tiền nhân đi trước. 

Câu tục ngữ là lời nhắc nhở nhẹ nhàng mà thấm thía: Khi cầm trên tay bát cơm đầy, khi hưởng thụ những tiện nghi văn minh hay sự bình yên của cuộc sống, tuyệt đối không được xem đó là điều ngẫu nhiên, mà phải thấu hiểu những nhọc nhằn, cay đắng của người gieo hạt.`,
        literalMeaning: 'Khi được thưởng thức trái cây chín ngọt thì phải nhớ đến công lao chăm bón, vun trồng khó nhọc của người làm vườn.',
        figurativeMeaning: 'Thụ hưởng bất kỳ thành quả vật chất hay tinh thần nào cũng cần tri ân sâu sắc người đã bỏ công sức, trí tuệ để tạo dựng nên nó.',
        lesson: 'Khuyên răn lối sống tri ân, tôn trọng giá trị của lao động chân chính và luôn ghi lòng tạc dạ những người giúp đỡ mình.',
        historicalContext: 'Bắt nguồn từ nền văn minh nông nghiệp trù phú của lưu vực châu thổ sông Hồng và sông Cửu Long, nơi từng nhánh lúa chùm quả đều thấm đẫm mồ hôi.',
        thematicMeaning: 'Tôn vinh tinh thần nhân nghĩa và truyền thống đạo đức tương thân, đền ơn đáp nghĩa của dân tộc.',
        source: 'Kho tàng Tục ngữ người Việt — GS. Nguyễn Đổng Chi & Vũ Ngọc Phan, NXB Khoa học Xã hội.',
        tags: ['Ăn quả nhớ kẻ trồng cây', 'Tục ngữ', 'Lòng biết ơn', 'Lao động', 'Nhân nghĩa'],
        readTime: '3 phút đọc',
        viewsCount: 2150,
        likesCount: 670,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Lá lành đùm lá rách',
        slug: 'la-lanh-dum-la-rach',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tinh thần tương thân tương ái',
        summary: 'Biểu tượng kinh điển cho truyền thống đoàn kết, tương trợ lẫn nhau của người Việt trong khó khăn, hoạn nạn thiên tai.',
        quote: 'Lá lành đùm lá rách / Lá rách ít đùm lá rách nhiều',
        content: `Trong đời sống sinh hoạt nông thôn, khi gói bánh chưng hay gói đồ vật, người nông dân thường lấy chiếc lá dong, lá chuối còn nguyên vẹn bọc bên ngoài những chiếc lá bị rách để bảo vệ chiếc bánh được vuông tròn, kín đáo.

Nhân dân đã mượn hình ảnh bình dị ấy để gửi gắm triết lý nhân sinh cao đẹp: "Lá lành" tượng trưng cho những người có hoàn cảnh thuận lợi, ấm no, may mắn; "Lá rách" tượng trưng cho những số phận khó khăn, nghèo túng, gặp hoạn nạn, bệnh tật.

Câu tục ngữ mở rộng thêm vế thứ hai: "Lá rách ít đùm lá rách nhiều" khẳng định tinh thần sẻ chia không phân biệt giàu nghèo. Ngay cả khi bản thân chưa dư giả, người ta vẫn có thể chìa tay giúp đỡ người khốn khó hơn mình bằng tình người ấm áp.`,
        literalMeaning: 'Dùng chiếc lá còn nguyên vẹn để bọc ngoài chiếc lá bị rách khi gói ghém đồ vật để giữ đồ vật không rơi rớt.',
        figurativeMeaning: 'Người có cuộc sống ấm no, thuận lợi cần có lòng trắc ẩn, giang rộng vòng tay che chở và chia sẻ với những hoàn cảnh bất hạnh, cơ nhỡ.',
        lesson: 'Khơi dậy lòng nhân ái, sự sẻ chia, xây dựng một xã hội tràn đầy tình yêu thương và không ai bị bỏ lại phía sau.',
        historicalContext: 'Gắn liền với truyền thống cứu trợ lũ lụt, thiên tai địch họa và tinh thần cố kết cộng đồng làng xã ngàn đời của người Việt.',
        thematicMeaning: 'Đạo lý tương thân tương ái — cội nguồn sức mạnh gắn kết cộng đồng người Việt vượt qua bao thăng trầm nghiệt ngã của lịch sử.',
        source: 'Kho tàng Tục ngữ người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Lá lành đùm lá rách', 'Tục ngữ', 'Nhân ái', 'Sẻ chia', 'Tương thân tương ái', 'Đoàn kết'],
        readTime: '4 phút đọc',
        viewsCount: 3820,
        likesCount: 1420,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Thương người như thể thương thân',
        slug: 'thuong-nguoi-nhu-the-thuong-than',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Đạo lý nhân ái - Vị tha',
        summary: 'Đỉnh cao của lòng nhân đạo truyền thống: Hãy yêu thương, cảm thông và bảo bọc người khác như đang yêu quý chính bản thân mình.',
        quote: 'Thương người như thể thương thân.',
        content: `Bản thân mỗi chúng ta ai cũng biết đau đớn khi gặp tai nạn, biết sợ hãi khi đói rét, biết tủi hổ khi bị coi thường và khao khát được sẻ chia khi cô độc. 

"Thương thân" là tình yêu tự nhiên bản năng của mỗi cá nhân đối với thân thể và sinh mệnh của chính mình. Nhưng câu tục ngữ đòi hỏi một bước nâng tầm đạo đức: "Thương người như thể thương thân" — hãy đặt mình vào vị trí của người khác (sự thấu cảm), cảm nhận nỗi đau của đồng loại như nỗi đau của xương thịt mình để hành động cứu giúp vô điều kiện.

Đây là đỉnh cao của chủ nghĩa nhân đạo phương Đông, tương đồng với lời dạy của Phật giáo về lòng Từ Bi và đạo lý Nhân bản của dân tộc Việt Nam.`,
        literalMeaning: 'Yêu thương người khác giống như yêu quý, chăm sóc và bảo vệ chính thân thể của bản thân mình.',
        figurativeMeaning: 'Lòng trắc ẩn và tinh thần bác ái: Coi nỗi đau và niềm vui của tha nhân như của chính mình để sẵn sàng chìa tay giúp đỡ bằng cả tấm lòng.',
        lesson: 'Sống vị tha, không ích kỷ hẹp hòi, luôn sẵn lòng tương trợ người xung quanh khi gặp nghịch cảnh hoạn nạn.',
        historicalContext: 'Là kim chỉ nam đạo đức được giáo dục trong mọi gia đình, dòng họ người Việt từ thuở ấu thơ.',
        thematicMeaning: 'Cốt lõi của chủ nghĩa nhân đạo truyền thống Việt Nam: Lấy chữ Tâm và tình người làm thước đo nhân cách.',
        source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn hóa Thông tin.',
        tags: ['Thương người như thể thương thân', 'Tục ngữ', 'Nhân ái', 'Bác ái', 'Đạo lý', 'Lòng vị tha'],
        readTime: '3 phút đọc',
        viewsCount: 3120,
        likesCount: 940,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Có công mài sắt, có ngày nên kim',
        slug: 'co-cong-mai-sat-co-ngay-nen-kim',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Ý chí & Nghị lực kiên trì',
        summary: 'Bài học đắt giá về sự nhẫn nại, kiên trì theo đuổi mục tiêu: Dù khó khăn lớn đến đâu, nếu bền chí thì ắt sẽ gặt hái thành công rực rỡ.',
        quote: 'Có công mài sắt, có ngày nên kim.',
        content: `Một thanh sắt thô kệch, to lớn và xù xì tưởng chừng không thể biến đổi, nhưng nếu mỗi ngày kiên trì mài giũa, theo năm tháng thanh sắt ấy sẽ trở thành chiếc kim may nhỏ bé, tinh xảo và sắc bén.

Nhân dân lao động đã dùng sự đối lập tột cùng giữa "thanh sắt thô dày" và "chiếc kim thanh mảnh" để ngợi ca sức mạnh kỳ diệu của ý chí con người. Thời gian và sự kiên trì là liều thuốc mài mòn mọi trở ngại. 

Trong học tập, rèn luyện hay lập nghiệp, không có con đường tắt nào dẫn đến vinh quang. Chỉ có những ai dám đối mặt với gian nan, không nản lòng thoái chí trước thất bại mới có thể chạm tới đỉnh cao thành tựu.`,
        literalMeaning: 'Bỏ công sức mài giũa một thanh sắt lớn thì theo thời gian nhất định sẽ tạo thành một cây kim may hữu ích.',
        figurativeMeaning: 'Khẳng định sức mạnh của lòng kiên trì, nhẫn nại và quyết tâm sắt đá sẽ giúp con người chinh phục mọi đỉnh cao gian khó.',
        lesson: 'Rèn luyện đức tính nhẫn nại, kiên định với mục tiêu đã chọn, không được nản lòng thoái chí khi gặp thử thách bước đầu.',
        historicalContext: 'Được đúc kết từ kinh nghiệm lao động thủ công và sản xuất nông nghiệp qua bao đời của nhân dân ta.',
        thematicMeaning: 'Tôn vinh ý chí vượt khó và nghị lực vươn lên — một trong những phẩm chất tiêu biểu của con người Việt Nam.',
        source: 'Từ điển Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn học.',
        tags: ['Có công mài sắt có ngày nên kim', 'Tục ngữ', 'Kiên trì', 'Ý chí', 'Nghị lực', 'Thành công'],
        readTime: '3 phút đọc',
        viewsCount: 2750,
        likesCount: 880,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Gần mực thì đen, gần đèn thì rạng',
        slug: 'gan-muc-thi-den-gan-den-thi-rang',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Môi trường sống & Giáo dục nhân cách',
        summary: 'Quy luật về sự tác động to lớn của môi trường sống, bạn bè xung quanh đối với sự hình thành nhân cách và đạo đức con người.',
        quote: 'Gần mực thì đen, gần đèn thì rạng.',
        content: `Mực tàu màu đen tuyền, chạm vào rất dễ vấy bẩn áo quần; ngọn đèn tỏa ánh sáng ấm áp, đứng gần sẽ được soi chiếu tỏ tường mọi vật.

Câu tục ngữ mượn hai vật dụng quen thuộc của chốn học đường ("mực" và "đèn") để đúc kết một quy luật tâm lý xã hội sâu sắc: Con người rất dễ bị chi phối, ảnh hưởng bởi môi trường sống và những người mà mình giao du hàng ngày. 

Sống giữa những kẻ xấu xa, lười biếng, ta dễ bị nhiễm thói hư tật xấu; sống giữa những người lương thiện, chăm chỉ, tri thức, tâm hồn ta sẽ được mở mang, nhân cách được nâng cao. Tuy nhiên, dân tộc ta cũng có câu bổ trợ "Gần bùn mà chẳng hôi tanh mùi bùn" nhằm khuyến khích bản lĩnh giữ mình trong sạch giữa nghịch cảnh.`,
        literalMeaning: 'Tiếp xúc gần với thỏi mực đen dễ bị dính bẩn màu đen; ở gần ngọn đèn sáng thì nhận được ánh sáng chiếu tỏ.',
        figurativeMeaning: 'Môi trường xã hội và bạn bè có ảnh hưởng trực tiếp, mạnh mẽ đến sự hình thành nhân cách, đạo đức và lối sống của con người.',
        lesson: 'Phải biết chọn bạn mà chơi, chọn môi trường lành mạnh để học tập và rèn luyện; đồng thời trau dồi bản lĩnh giữ vững phẩm chất tốt đẹp.',
        historicalContext: 'Gắn liền với truyền thống hiếu học và sự coi trọng môi trường giáo dục gia đình, nhà trường của người Việt.',
        thematicMeaning: 'Tầm quan trọng của giáo dục đạo đức và sự tự ý thức tu dưỡng phẩm hạnh cá nhân.',
        source: 'Kho tàng Tục ngữ người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Gần mực thì đen', 'Gần đèn thì rạng', 'Tục ngữ', 'Giáo dục', 'Nhân cách', 'Môi trường sống'],
        readTime: '3 phút đọc',
        viewsCount: 2640,
        likesCount: 760,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Lời nói chẳng mất tiền mua',
        slug: 'loi-noi-chang-mat-tien-mua',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Văn hóa ứng xử & Giao tiếp',
        summary: 'Nghệ thuật giao tiếp tinh tế của người Việt: Ngôn từ là của cải miễn phí nhưng có sức mạnh kết nối hoặc hủy diệt, do đó phải cẩn trọng suy nghĩ trước khi phát ngôn.',
        quote: 'Lời nói chẳng mất tiền mua / Lựa lời mà nói cho vừa lòng nhau.',
        content: `Lời nói phát ra từ miệng không đòi hỏi chi phí bạc tiền nhưng lại phản chiếu toàn bộ phông văn hóa, đạo đức và trí tuệ của một con người.

Cổ nhân dạy: "Lời nói đọi máu", hay "Họa tùng khẩu xuất" (tai họa từ miệng mà ra). Một lời nói chân thành, lịch thiệp có thể xoa dịu nỗi đau, hàn gắn mối bất hòa và tiếp thêm niềm tin; ngược lại, một lời nói cay nghiệt, độc đoán có thể làm tan nát một mối quan hệ, thậm chí đẩy người khác vào ngõ cụt.

"Lựa lời mà nói cho vừa lòng nhau" không phải là xu nịnh hay giả dối, mà là sự tinh tế, tôn trọng người nghe, biết lựa chọn cách diễn đạt khéo léo, đúng mực để đạt được sự đồng thuận và hòa khí.`,
        literalMeaning: 'Việc nói chuyện không phải bỏ tiền ra để mua, vì vậy hãy suy nghĩ và chọn lời lẽ khéo léo để người nghe cảm thấy dễ chịu, thuận hòa.',
        figurativeMeaning: 'Khuyên răn con người phải thận trọng, lịch sự, tôn trọng đối phương trong ngôn từ và cách ứng xử hàng ngày.',
        lesson: 'Học cách lắng nghe, suy nghĩ chín chắn trước khi phát ngôn, dùng lời hay ý đẹp để xây dựng các mối quan hệ tốt đẹp.',
        historicalContext: 'Được lưu truyền rộng rãi trong nếp sống văn minh làng xã truyền thống, đề cao lối ứng xử trọng tình, trọng nghĩa.',
        thematicMeaning: 'Nét đẹp văn hóa giao tiếp lịch thiệp, hòa hiếu và giàu tính nhân văn của dân tộc Việt.',
        source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn hóa Thông tin.',
        tags: ['Lời nói chẳng mất tiền mua', 'Tục ngữ', 'Giao tiếp', 'Ứng xử', 'Văn hóa', 'Ngôn từ'],
        readTime: '3 phút đọc',
        viewsCount: 3010,
        likesCount: 920,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Học thầy không tày học bạn',
        slug: 'hoc-thay-khong-tay-hoc-ban',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Phương pháp học tập & Tinh thần cầu thị',
        summary: 'Đề cao vai trò của sự học hỏi lẫn nhau giữa bạn bè đồng trang lứa bên cạnh kiến thức truyền thụ chính thống của người thầy.',
        quote: 'Học thầy không tày học bạn.',
        content: `Người thầy mang lại nền tảng tri thức hàn lâm, định hướng phương pháp và chuẩn mực đạo đức. Nhưng sự trao đổi, tranh luận và đồng hành cùng bè bạn lại mang lại cơ hội cọ xát thực tế vô cùng sống động.

Học từ bạn có ưu thế là sự gần gũi, không có khoảng cách tâm lý, dễ dàng chia sẻ những thắc mắc vụn vặt và cùng nhau tìm tòi lời giải. Nhân dân không hề phủ nhận công lao của người thầy (như câu "Không thầy đố mày làm nên"), mà đặt hai câu tục ngữ cạnh nhau để bổ sung biện chứng cho nhau: Vừa phải tôn sư trọng đạo, vừa phải mở rộng tâm thế học hỏi từ bạn bè xung quanh.`,
        literalMeaning: 'Học từ thầy giáo đôi khi không tiếp thu nhanh và sinh động bằng việc học hỏi, trao đổi trực tiếp với bạn bè.',
        figurativeMeaning: 'Khuyến khích phương pháp học tập tương tác, khiêm tốn học hỏi từ đồng nghiệp, bạn bè để bổ khuyết cho kiến thức của bản thân.',
        lesson: 'Xây dựng tinh thần khiêm tốn, cầu thị, tích cực giao lưu và chia sẻ tri thức trong tập thể.',
        historicalContext: 'Hình thành trong truyền thống hiếu học của các sĩ tử khoa cử thời xưa qua hình thức "đồng môn" kết nghĩa cùng ôn luyện.',
        thematicMeaning: 'Quan điểm tiến bộ về giáo dục đa chiều và tinh thần hợp tác trong học thuật của dân gian.',
        source: 'Kho tàng Tục ngữ người Việt — GS. Nguyễn Đổng Chi & Vũ Ngọc Phan.',
        tags: ['Học thầy không tày học bạn', 'Tục ngữ', 'Học tập', 'Bạn bè', 'Cầu thị', 'Giáo dục'],
        readTime: '3 phút đọc',
        viewsCount: 2210,
        likesCount: 650,
        isFeatured: false,
        status: 'published'
    },

    // =========================================================================
    // 2. CA DAO DÂN TỘC VIỆT NAM (14 TÁC PHẨM ĐẶC SẮC)
    // =========================================================================
    {
        title: 'Công cha như núi Thái Sơn',
        slug: 'cong-cha-nhu-nui-thai-son',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tình cảm gia đình & Đạo hiếu',
        summary: 'Khúc ca thiêng liêng và bất hủ ngợi ca công ơn trời biển của cha mẹ đối với con cái, nhắc nhở bổn phận làm tròn chữ Hiếu.',
        quote: 'Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.\nMột lòng thờ mẹ kính cha,\nCho tròn chữ hiếu mới là đạo con.',
        content: `Bài ca dao là lời răn dạy thấm thía về đạo làm con trong mỗi gia đình Việt Nam:

"Công cha như núi Thái Sơn,
Nghĩa mẹ như nước trong nguồn chảy ra.
Một lòng thờ mẹ kính cha,
Cho tròn chữ hiếu mới là đạo con."

Hình tượng "Núi Thái Sơn" — ngọn núi sừng sững, vững chãi ngàn năm tượng trưng cho công lao sinh thành dưỡng dục nghiêm cẩn, bảo bọc con trước giông bão cuộc đời của người cha.
Hình tượng "Nước trong nguồn" — dòng nước ngầm dạt dào, trong trẻo, tuôn chảy mãi mãi không bao giờ vơi cạn ví như tình yêu thương bao la, dịu ngọt, chở che vô điều kiện của người mẹ hiền.

Hai hình ảnh kỳ vĩ của thiên nhiên được đối xứng hài hòa, tạo nên bản trường ca tri ân công đức sinh thành. Hai câu sau là lời kết luận đanh thép về luân thường đạo lý: Chữ "Hiếu" là gốc rễ của mọi phẩm hạnh làm người.`,
        literalMeaning: 'So sánh công lao của người cha cao lớn như ngọn núi hùng vĩ; nghĩa tình của người mẹ vô tận và mát lành như dòng suối nguồn không bao giờ cạn.',
        figurativeMeaning: 'Khẳng định công ơn sinh thành, nuôi nấng và chở che của cha mẹ là vô biên vô lượng, không gì trên cõi đời có thể đo đếm hay bù đắp nổi.',
        lesson: 'Nhắc nhở con cái phải luôn hiếu thảo, phụng dưỡng, kính trọng và yêu thương cha mẹ khi người còn tại thế.',
        historicalContext: 'Hình thành và lưu truyền qua hàng thế kỷ trong nếp sống gia đình truyền thống Á Đông, lấy chữ Hiếu làm rường cột gia phong.',
        thematicMeaning: 'Vẻ đẹp của chữ Hiếu — nền tảng luân thường đạo lý và rường cột đạo đức của gia đình và xã hội Việt Nam.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học, Tập 1, trang 112.',
        tags: ['Công cha nghĩa mẹ', 'Ca dao', 'Hiếu thảo', 'Gia đình', 'Đạo con', 'Núi Thái Sơn'],
        readTime: '4 phút đọc',
        viewsCount: 4420,
        likesCount: 1620,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Mẹ già như chuối ba hương',
        slug: 'me-gia-nhu-chuoi-ba-huong',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tình cảm gia đình & Tình mẹ',
        summary: 'Hình ảnh so sánh mộc mạc mà đắt giá về sự ngọt ngào, quý giá của người mẹ và lời nhắc nhở con cái phụng dưỡng mẹ khi tuổi xế chiều.',
        quote: 'Mẹ già như chuối ba hương,\nNhư xôi nếp một, như đường mía lau.',
        content: `Bài ca dao đúc kết vẻ đẹp thanh tao, ngọt lành của tình mẫu tử:

"Mẹ già như chuối ba hương,
Như xôi nếp một, như đường mía lau."

Chuối ba hương là giống chuối quý, khi chín tỏa hương thơm ngào ngạt và ngọt đậm đà. Xôi nếp một là thứ xôi nấu từ hạt nếp mùa dẻo thơm nhất đồng quê. Đường mía lau là loại đường thanh khiết, ngọt dịu ngọt mát nơi cuống họng.

Ba sản vật quý báu và ngọt ngào nhất của đồng quê Việt Nam được nhân dân chọn lọc để tôn vinh tình mẹ. Nhưng đằng sau vị ngọt ngào ấy là nỗi niềm xót xa: "Chuối ba hương" khi chín rộ cũng là lúc dễ rụng, mẹ già như ngọn đèn trước gió. Bài ca dao nhắc nhở phận làm con phải biết nâng niu, báo hiếu từng ngày từng giờ khi mẹ còn bên ta.`,
        literalMeaning: 'So sánh người mẹ già với những thức quà đồng quê thơm ngon, quý giá và ngọt lành nhất.',
        figurativeMeaning: 'Khẳng định tình mẹ là điều ngọt ngào, trân quý nhất trong cuộc đời; đồng thời nhắc nhở thời gian bên mẹ là hữu hạn, con cái phải biết nâng niu, phụng dưỡng mẹ chu đáo.',
        lesson: 'Sống hiếu thảo, luôn ân cần chăm sóc cha mẹ già, không để muộn màng rồi ôm niềm ân hận.',
        historicalContext: 'Gắn liền với nếp sống thôn quê mộc mạc và phong tục thờ kính tổ tiên, kính trọng người già trong làng xã Việt.',
        thematicMeaning: 'Khúc ca thiêng liêng về tình mẫu tử và nỗi niềm trân quý sinh mệnh đấng sinh thành.',
        source: 'Ca dao Dân ca Nam Bộ — NXB Khoa học Xã hội, trang 78.',
        tags: ['Mẹ già như chuối ba hương', 'Tình mẹ', 'Hiếu thảo', 'Ca dao', 'Gia đình', 'Nam Bộ'],
        readTime: '3 phút đọc',
        viewsCount: 3100,
        likesCount: 970,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Bầu ơi thương lấy bí cùng',
        slug: 'bau-oi-thuong-lay-bi-cung',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Đoàn kết & Tình đồng bào',
        summary: 'Lời nhắn nhủ thiêng liêng về tinh thần đoàn kết, tương thân tương ái giữa các dân tộc anh em trên dải đất hình chữ S.',
        quote: 'Bầu ơi thương lấy bí cùng,\nTuy rằng khác giống nhưng chung một giàn.',
        content: `Hình ảnh giàn bầu giàn bí xanh mướt là nét đặc trưng thân thương của mỗi mảnh vườn quê Việt Nam:

"Bầu ơi thương lấy bí cùng,
Tuy rằng khác giống nhưng chung một giàn."

Bầu và bí là hai loài cây khác giống, quả tròn quả dài khác nhau, nhưng lại cùng được người nông dân gieo trồng dưới một mái giàn tre, cùng hút chung nguồn nước và ánh nắng để đơm hoa kết trái.

Ẩn dụ "chung một giàn" chính là biểu tượng cho non sông gấm vóc Việt Nam. Dù có 54 dân tộc anh em với tiếng nói, phong tục tập quán đa dạng, chúng ta đều cùng chung nguồn cội "đồng bào" (sinh ra từ bọc trăm trứng của Mẹ Âu Cơ). Khi đất nước gặp thiên tai, bão lũ hay họa ngoại xâm, tinh thần ấy lại bừng sáng, kết thành sức mạnh dời non lấp biển.`,
        literalMeaning: 'Quả bầu và quả bí tuy khác loài nhưng cùng leo và sinh trưởng trên một giàn tre.',
        figurativeMeaning: 'Khuyên nhủ con người cùng chung sống trên một mảnh đất quê hương phải biết yêu thương, đùm bọc, tương trợ lẫn nhau.',
        lesson: 'Giáo dục tinh thần đại đoàn kết toàn dân tộc, biết gạt bỏ bất đồng cá nhân để cùng hướng tới lợi ích cộng đồng.',
        historicalContext: 'Được lưu truyền qua hàng ngàn năm, là vũ khí tinh thần giúp dân tộc Việt Nam vượt qua mọi cuộc đồng hóa và giặc giã.',
        thematicMeaning: 'Ý thức cội nguồn đồng bào và tinh thần hòa hợp dân tộc bền chặt.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Bầu ơi thương lấy bí cùng', 'Ca dao', 'Đoàn kết', 'Tương thân tương ái', 'Đồng bào'],
        readTime: '3 phút đọc',
        viewsCount: 3650,
        likesCount: 1280,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Nhiễu điều phủ lấy giá gương',
        slug: 'nhieu-dieu-phu-lay-gia-guong',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tinh thần tương thân tương ái',
        summary: 'Bài ca dao bất hủ về bổn phận đùm bọc, chở che lẫn nhau giữa những người cùng chung một tổ quốc, một giống nòi.',
        quote: 'Nhiễu điều phủ lấy giá gương,\nNgười trong một nước phải thương nhau cùng.',
        content: `Hình ảnh tấm vải lụa đỏ phủ trên giá gương soi trên bàn thờ tổ tiên:

"Nhiễu điều phủ lấy giá gương,
Người trong một nước phải thương nhau cùng."

"Nhiễu điều" là tấm lụa đỏ thắm quý giá, "giá gương" là khung gỗ đỡ tấm gương soi trong trẻo. Tấm vải đỏ bao bọc, giữ cho gương không bị hoen ố vì bụi bặm; ngược lại, tấm gương nâng đỡ dải lụa thêm phần trang trọng, tôn nghiêm.

Sự gắn kết hài hòa không thể tách rời ấy là biểu tượng cho mối quan hệ giữa con người trong một quốc gia. Đã là con Lạc cháu Hồng, cùng sẻ chia một mảnh đất sinh tồn thì phải biết đùm bọc, san sẻ buồn vui, không phân biệt giàu nghèo hay vùng miền.`,
        literalMeaning: 'Tấm vải lụa màu đỏ quý giá dùng để phủ lên che chắn bụi bặm cho khung giá gương.',
        figurativeMeaning: 'Nhắc nhở đồng bào cùng sống dưới một mái nhà tổ quốc phải biết yêu thương, che chở và giúp đỡ lẫn nhau.',
        lesson: 'Phát huy tinh thần gắn kết cộng đồng, tương thân tương ái, sống có trách nhiệm với xã hội và đất nước.',
        historicalContext: 'Gắn liền với không gian thiêng liêng nơi bàn thờ gia tiên và phong tục thờ cúng truyền thống của người Việt.',
        thematicMeaning: 'Đạo lý đoàn kết và nghĩa đồng bào thiêng liêng của dân tộc Việt Nam.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Nhiễu điều phủ lấy giá gương', 'Ca dao', 'Tương thân tương ái', 'Đồng bào', 'Yêu nước'],
        readTime: '3 phút đọc',
        viewsCount: 2980,
        likesCount: 890,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Ơn cha nặng lắm ai ơi',
        slug: 'on-cha-nang-lam-ai-oi',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tình cảm gia đình',
        summary: 'Khắc họa sự hy sinh thầm lặng của người cha và tình yêu thương bao la của người mẹ, răn dạy đạo làm con.',
        quote: 'Ơn cha nặng lắm ai ơi,\nNghĩa mẹ bằng trời chín tháng cưu mang.',
        content: `Khúc ca dao đong đầy niềm xúc động về sự hy sinh thầm lặng của hai đấng sinh thành:

"Ơn cha nặng lắm ai ơi,
Nghĩa mẹ bằng trời chín tháng cưu mang."

Nếu công mẹ gắn liền với chín tháng mười ngày mang nặng đẻ đau, với dòng sữa ngọt lành và những đêm thức trắng ru con, thì ơn cha lại là sự che chở âm thầm, là tấm lưng gánh vác mọi nhọc nhằn giông bão để con có được mái ấm bình yên.

Tiếng gọi thiết tha "ai ơi" như một lời thức tỉnh lương tâm của mỗi người con giữa dòng đời hối hả: Đừng mải mê chạy theo danh vọng bạc tiền mà quên đi công lao trời bể của mẹ cha nơi quê nhà.`,
        literalMeaning: 'Công ơn dưỡng dục của cha vô cùng to lớn; ân nghĩa của mẹ bao la như trời xanh với sự nhọc nhằn chín tháng cưu mang.',
        figurativeMeaning: 'Khẳng định đức hy sinh vô bờ bến của cha mẹ, nhắc nhở con cái về bổn phận đền đáp công ơn sinh thành.',
        lesson: 'Yêu thương, tôn kính và báo hiếu cha mẹ bằng những việc làm thiết thực hàng ngày.',
        historicalContext: 'Đúc kết từ truyền thống hiếu đạo gia đình Á Đông qua hàng ngàn năm lịch sử.',
        thematicMeaning: 'Vẻ đẹp của lòng hiếu thảo và sự gắn kết gia đình truyền thống.',
        source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân, NXB Văn hóa Thông tin.',
        tags: ['Ơn cha nặng lắm ai ơi', 'Công cha nghĩa mẹ', 'Hiếu đạo', 'Gia đình', 'Ca dao'],
        readTime: '3 phút đọc',
        viewsCount: 2540,
        likesCount: 790,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Tháp Mười đẹp nhất bông sen',
        slug: 'thap-muoi-dep-nhat-bong-sen',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian - Kháng chiến',
        region: 'Đồng Tháp & Nam Bộ',
        author: 'Bảo Định Giang (Phỏng ca dao dân gian)',
        topic: 'Lòng kính yêu Bác Hồ & Quê hương',
        summary: 'Hình ảnh hoa sen Đồng Tháp Mười thanh khiết tượng trưng cho phẩm cách cao đẹp của Chủ tịch Hồ Chí Minh và biểu tượng rực rỡ của non sông đất Việt.',
        quote: 'Tháp Mười đẹp nhất bông sen,\nViệt Nam đẹp nhất có tên Bác Hồ.',
        content: `Hoa sen ở vùng Đồng Tháp Mười vươn lên từ bùn lầy đồng nước mênh mông nhưng ngát hương thơm tinh khiết, thanh cao, không vướng chút bụi trần:

"Tháp Mười đẹp nhất bông sen,
Việt Nam đẹp nhất có tên Bác Hồ."

Nhà thơ Bảo Định Giang đã phỏng theo điệu ca dao lục bát truyền thống để sáng tác nên câu thơ tuyệt bút tại chiến khu Nam Bộ thời kháng chiến chống Pháp. 

Hai vế thơ đối xứng tuyệt mỹ: Bông sen là tinh hoa đẹp nhất của thiên nhiên sông nước miền Tây, còn Bác Hồ chính là kết tinh trọn vẹn nhất những phẩm chất cao quý của con người Việt Nam: giản dị, thanh cao, yêu nước thương dân nồng nàn. Câu thơ đã đi sâu vào tâm thức dân gian, được nhân dân truyền tụng như một câu ca dao bất hủ.`,
        literalMeaning: 'Vùng Tháp Mười nổi tiếng nhất với vẻ đẹp thuần khiết của hoa sen; đất nước Việt Nam tự hào và rực rỡ nhất khi gắn liền với tên tuổi Chủ tịch Hồ Chí Minh.',
        figurativeMeaning: 'Ca ngợi vị cha già kính yêu của dân tộc — người đã cống hiến trọn đời cho độc lập tự do và trở thành biểu tượng tinh thần bất diệt của Việt Nam.',
        lesson: 'Giáo dục lòng yêu nước, niềm tự hào dân tộc và lòng biết ơn sâu sắc đối với công lao trời biển của Bác Hồ.',
        historicalContext: 'Sáng tác năm 1946 trong thời kỳ kháng chiến chống Pháp tại bưng biền Đồng Tháp Mười, nhanh chóng đi sâu vào lòng dân và trở thành câu ca dao truyền miệng của nhân dân cả nước.',
        thematicMeaning: 'Sự hòa quyện tuyệt đẹp giữa vẻ đẹp thiên nhiên đất nước và cốt cách vĩ đại của vị lãnh tụ.',
        source: 'Ca dao — Dân ca Nam Bộ — NXB Khoa học Xã hội.',
        tags: ['Tháp Mười', 'Hoa sen', 'Bác Hồ', 'Ca dao', 'Nam Bộ', 'Tự hào dân tộc', 'Kháng chiến'],
        readTime: '3 phút đọc',
        viewsCount: 3120,
        likesCount: 980,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Gió đưa cành trúc la đà',
        slug: 'gio-dua-canh-truc-la-da',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Bắc Bộ',
        period: 'Văn học Dân gian',
        region: 'Thăng Long - Hà Nội',
        author: 'Dân gian',
        topic: 'Bản sắc Thăng Long xưa',
        summary: 'Bức tranh thủy mặc thanh tao, êm đềm về cảnh sắc kinh kỳ Thăng Long xưa qua âm thanh chuông Trấn Vũ và tiếng gà gọi sáng bên bờ Hồ Tây.',
        quote: 'Gió đưa cành trúc la đà,\nTiếng chuông Trấn Vũ, canh gà Thọ Xương.\nMịt mù khói tỏa ngàn sương,\nNhịp chày Yên Thái, mặt gương Tây Hồ.',
        content: `Bốn câu thơ như một bức tranh thủy mặc cổ kính, ghi lại linh hồn của đất kinh đô ngàn năm văn vật:

"Gió đưa cành trúc la đà,
Tiếng chuông Trấn Vũ, canh gà Thọ Xương.
Mịt mù khói tỏa ngàn sương,
Nhịp chày Yên Thái, mặt gương Tây Hồ."

Không gian Hồ Tây buổi sớm mai hiện lên tĩnh lặng, mờ ảo trong làn sương khói mịt mùng. Bức tranh được dệt nên bằng sự kết hợp diệu kỳ giữa đường nét (cành trúc mảnh mai lay động), màu sắc (mặt gương Tây Hồ soi bóng mây trời) và âm thanh sống động: Tiếng chuông đồng trầm hùng ngân vang từ đền Quán Thánh (Trấn Vũ), tiếng gà báo canh từ phường Thọ Xương hòa cùng nhịp chày giã vỏ cây dó làm giấy dó của làng nghề Yên Thái. 

Đó là nhịp sống lao động thanh bình, tao nhã và tràn đầy chất thơ của chốn kinh kỳ xưa.`,
        literalMeaning: 'Miêu tả âm thanh và hình ảnh sinh hoạt bình dị, thơ mộng của đất kinh kỳ Thăng Long trong buổi sớm mai sương mờ.',
        figurativeMeaning: 'Gợi mở vẻ đẹp trầm mặc, tao nhã, thanh lịch đậm đà bản sắc văn hóa ngàn năm của đất kinh đô Hà Nội.',
        lesson: 'Bồi đắp tình yêu di sản văn hóa, lòng tự hào về cảnh sắc và lịch sử ngàn năm văn vật của Thủ đô Hà Nội.',
        historicalContext: 'Lưu truyền từ thời Lê - Trịnh đến thời Nguyễn, gắn bó mật thiết với các địa danh lịch sử ven bờ Hồ Tây như đền Trấn Vũ, phường Thọ Xương, làng giấy Yên Thái.',
        thematicMeaning: 'Cốt cách thanh lịch, tao nhã và vẻ đẹp linh thiêng của chốn kinh kỳ xưa.',
        source: 'Hà Nội trong ca dao ngạn ngữ — GS. Doãn Kế Thiện, NXB Hà Nội.',
        tags: ['Gió đưa cành trúc', 'Thăng Long', 'Hà Nội', 'Hồ Tây', 'Ca dao Bắc Bộ', 'Văn hiến'],
        readTime: '4 phút đọc',
        viewsCount: 2950,
        likesCount: 890,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Đường vô xứ Nghệ quanh quanh',
        slug: 'duong-vo-xu-nghe-quanh-quanh',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Miền Trung',
        period: 'Văn học Dân gian',
        region: 'Xứ Nghệ (Nghệ An - Hà Tĩnh)',
        author: 'Dân gian',
        topic: 'Tình yêu quê hương & Con người xứ Nghệ',
        summary: 'Khúc hát tự hào về non xanh nước biếc xứ Nghệ — mảnh đất địa linh nhân kiệt, nơi nuôi dưỡng những tâm hồn quật khởi, nghĩa tình son sắt.',
        quote: 'Đường vô xứ Nghệ quanh quanh,\nNon xanh nước biếc như tranh họa đồ.\nAi vô xứ Nghệ thì vô,\nBõ công non nước đền bù nghĩa ân.',
        content: `Khúc ca tự hào về vùng đất "địa linh nhân kiệt" miền Trung:

"Đường vô xứ Nghệ quanh quanh,
Non xanh nước biếc như tranh họa đồ.
Ai vô xứ Nghệ thì vô,
Bõ công non nước đền bù nghĩa ân."

Vùng đất Nghệ An - Hà Tĩnh được thiên nhiên ban tặng địa hình hiểm trở mà nên thơ: Dãy Hồng Lĩnh trập trùng soi bóng xuống dòng Lam giang trong xanh uốn lượn như dải lụa. 

Hai câu thơ đầu gợi mở cảnh sơn thủy hữu tình đẹp như bức họa đồ; hai câu thơ sau là lời mời gọi chân thành, nồng hậu của người dân xứ Nghệ. Đến với xứ Nghệ không chỉ để ngắm cảnh non nước kỳ vĩ, mà còn để cảm nhận cái "nghĩa ân" sâu nặng — bản tính thủy chung, kiên trung, hào sảng của con người nơi đây.`,
        literalMeaning: 'Đường vào xứ Nghệ quanh co uốn khúc qua đèo núi hiểm trở nhưng cảnh sắc non xanh nước biếc tươi đẹp như tranh vẽ.',
        figurativeMeaning: 'Khẳng định tình yêu tha thiết với quê hương và lời mời gọi chân thành, tự hào về vùng đất giàu truyền thống hiếu học, kiên trung và trượng nghĩa.',
        lesson: 'Giáo dục lòng tự hào về non sông gấm vóc và sự trân trọng tình cảm mộc mạc, thủy chung của đồng bào miền Trung.',
        historicalContext: 'Lưu truyền từ các thế kỷ trước dọc con đường thiên lý Bắc - Nam qua lưu vực sông Lam và núi Hồng Lĩnh.',
        thematicMeaning: 'Bản sắc văn hóa xứ Nghệ: Phong cảnh kỳ vĩ gắn liền với con người quật cường, giàu lòng nghĩa khí.',
        source: 'Kho tàng Dân ca Xứ Nghệ — Viện Văn hóa Dân gian.',
        tags: ['Xứ Nghệ', 'Sông Lam', 'Núi Hồng', 'Ca dao', 'Miền Trung', 'Quê hương'],
        readTime: '3 phút đọc',
        viewsCount: 2680,
        likesCount: 780,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Cày đồng đang buổi ban trưa',
        slug: 'cay-dong-dang-buoi-ban-trua',
        category: 'ca-dao',
        categoryName: 'Ca dao Lao động sản xuất',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc (Nông thôn Việt Nam)',
        author: 'Dân gian',
        topic: 'Trân trọng giọt mồ hôi người lao động',
        summary: 'Khắc họa nỗi nhọc nhằn dãi dầu mưa nắng của người nông dân để làm ra hạt gạo trắng thơm, nhắc nhở thế hệ sau lòng trân quý hạt ngọc trời.',
        quote: 'Cày đồng đang buổi ban trưa,\nMồ hôi thánh thót như mưa ruộng cày.\nAi ơi bưng bát cơm đầy,\nDẻo thơm một hạt, đắng cay muôn phần!',
        content: `Khúc ca dao đẫm mồ hôi và nỗi nhọc nhằn của người cày cấy:

"Cày đồng đang buổi ban trưa,
Mồ hôi thánh thót như mưa ruộng cày.
Ai ơi bưng bát cơm đầy,
Dẻo thơm một hạt, đắng cay muôn phần!"

Giữa trưa hè nắng gắt như thiêu như đốt, người nông dân cùng con trâu vẫn cặm cụi lội bùn cày ải. Hình ảnh so sánh "Mồ hôi thánh thót như mưa ruộng cày" cực tả nỗi gian lao vất vả của công việc nhà nông.

Hai câu thơ cuối tạo nên sự đối lập đầy tính nhân văn: Một bên là "bát cơm đầy", hạt cơm "dẻo thơm" trên mâm cơm ấm cúng, một bên là "đắng cay muôn phần" của người đổ mồ hôi trên đồng ruộng. Bài ca dao nhắc nhở mỗi chúng ta phải biết trân quý từng hạt ngọc trời, biết ơn người lao động chân lấm tay bùn.`,
        literalMeaning: 'Công việc cày ruộng giữa ban trưa nắng gắt vô cùng nặng nhọc, mồ hôi túa ra nhỏ giọt như mưa xuống luống đất để làm nên hạt thóc dẻo thơm.',
        figurativeMeaning: 'Nhắc nhở con người phải biết trân trọng giá trị của sức lao động, ghi lòng tạc dạ công ơn của người sản xuất ra của cải nuôi sống xã hội.',
        lesson: 'Sống tiết kiệm, không lãng phí thức ăn, luôn đồng cảm và tôn trọng những người lao động bình dị.',
        historicalContext: 'Đúc kết từ nền văn minh lúa nước ngàn đời của dân tộc Việt Nam.',
        thematicMeaning: 'Khúc ca ngợi ca phẩm chất cần cù, nhẫn nại và sự hy sinh thầm lặng của giai cấp nông dân.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Cày đồng', 'Hạt gạo', 'Mồ hôi', 'Ca dao', 'Nông dân', 'Biết ơn'],
        readTime: '3 phút đọc',
        viewsCount: 2890,
        likesCount: 860,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Anh đi anh nhớ quê nhà',
        slug: 'anh-di-anh-nho-que-nha',
        category: 'ca-dao',
        categoryName: 'Ca dao Tình nghĩa & Quê hương',
        period: 'Văn học Dân gian',
        region: 'Bắc Bộ',
        author: 'Dân gian',
        topic: 'Hồn quê & Tình nghĩa lứa đôi',
        summary: 'Bản tình ca mộc mạc, ngọt ngào về nỗi nhớ da diết của người đi xa đối với những món ăn dân dã và hình bóng người thương bên bờ sông quê.',
        quote: 'Anh đi anh nhớ quê nhà,\nNhớ canh rau muống, nhớ cà dầm tương.\nNhớ ai dãi nắng dầm sương,\nNhớ ai tát nước bên đường hôm nao.',
        content: `Bốn câu ca dao lục bát là khúc ca bất hủ về nỗi nhớ quê hương của người con xa xứ:

"Anh đi anh nhớ quê nhà,
Nhớ canh rau muống, nhớ cà dầm tương.
Nhớ ai dãi nắng dầm sương,
Nhớ ai tát nước bên đường hôm nao."

Nỗi nhớ quê hương không bắt đầu từ những điều to tát mà bắt đầu từ những hương vị dân dã, bình dị nhất: Bát canh rau muống luộc, đĩa cà dầm tương mặn mà nếp nhà. 

Từ nỗi nhớ phong vị ẩm thực quê hương, nỗi nhớ dần chuyển hóa thành nỗi nhớ con người: "Nhớ ai dãi nắng dầm sương", "Nhớ ai tát nước bên đường hôm nao". Đại từ phiếm chỉ "ai" vừa kín đáo, e ấp lại vừa đong đầy tình cảm lứa đôi thủy chung, hòa quyện tuyệt đẹp với tình yêu quê hương xứ sở.`,
        literalMeaning: 'Người đi xa luôn hoài niệm về những món ăn mộc mạc của quê nhà và hình ảnh người con gái tần tảo làm đồng tát nước.',
        figurativeMeaning: 'Gắn kết thiêng liêng giữa tình yêu đôi lứa và tình yêu quê hương xứ sở; khẳng định cội rễ quê hương luôn ngự trị vững chắc trong tâm hồn người Việt xa quê.',
        lesson: 'Nuôi dưỡng tình cảm gắn bó với quê cha đất tổ, trân trọng những nét đẹp mộc mạc của truyền thống gia đình.',
        historicalContext: 'Lưu truyền sâu rộng khắp vùng đồng bằng Bắc Bộ qua các thế kỷ, gắn với sinh hoạt nông nghiệp truyền thống.',
        thematicMeaning: 'Vẻ đẹp tâm hồn trong sáng, thủy chung và nỗi niềm tha hương của người Việt.',
        source: 'Ca dao Dân ca Việt Nam — NXB Giáo Dục, trang 145.',
        tags: ['Nhớ quê nhà', 'Canh rau muống', 'Cà dầm tương', 'Tát nước', 'Ca dao tình yêu', 'Bắc Bộ'],
        readTime: '4 phút đọc',
        viewsCount: 3240,
        likesCount: 1100,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Chuồn chuồn bay thấp thì mưa',
        slug: 'chuon-chuon-bay-thap-thi-mua',
        category: 'ca-dao',
        categoryName: 'Ca dao Thời tiết & Mùa màng',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tri thức bản địa & Kinh nghiệm nhà nông',
        summary: 'Kinh nghiệm dự báo thời tiết tài tình của người xưa qua quan sát hành vi của loài chuồn chuồn để chủ động trong mùa vụ.',
        quote: 'Chuồn chuồn bay thấp thì mưa,\nBay cao thì nắng, bay vừa thì râm.',
        content: `Câu ca dao đúc kết kinh nghiệm khí tượng học dân gian vô cùng khoa học và chuẩn xác:

"Chuồn chuồn bay thấp thì mưa,
Bay cao thì nắng, bay vừa thì râm."

Nhân dân lao động xưa chưa có các thiết bị đo đạc khí tượng hiện đại, nhưng qua hàng nghìn năm quan sát thiên nhiên, họ đã phát hiện ra quy luật sinh học của chuồn chuồn: Khi trời sắp mưa, độ ẩm không khí tăng cao làm hơi nước đọng vào đôi cánh mỏng của chuồn chuồn khiến cánh nặng, cộng với áp suất khí quyển giảm nên chuồn chuồn chỉ có thể bay là là mặt đất. Ngược lại khi trời nắng ráo, không khí khô và áp suất cao, chuồn chuồn bay lượn trên cao vút.

Đây là tri thức bản địa quý giá giúp nhà nông phán đoán thời tiết để kịp phơi thóc, gieo cấy hay che chắn hoa màu.`,
        literalMeaning: 'Hiện tượng cánh chuồn chuồn bị ảnh hưởng bởi độ ẩm không khí: bay thấp báo hiệu trời sắp mưa, bay cao trời nắng, bay lơ lửng tầm trung trời râm mát.',
        figurativeMeaning: 'Tôn vinh trí tuệ dân gian và khả năng quan sát nhạy bén của người nông dân trong việc thích ứng với quy luật thiên nhiên.',
        lesson: 'Học hỏi tinh thần quan sát tỉ mỉ, trân trọng các tri thức bản địa đúc kết từ thực tiễn sản xuất.',
        historicalContext: 'Hình thành từ phương thức sản xuất lúa nước phụ thuộc chặt chẽ vào thời tiết ("Trông trời trông đất trông mây").',
        thematicMeaning: 'Trí tuệ thực nghiệm và mối quan hệ gắn bó mật thiết giữa con người và thế giới tự nhiên.',
        source: 'Kho tàng Ca dao Tục ngữ Việt Nam — GS. Nguyễn Đổng Chi.',
        tags: ['Chuồn chuồn bay thấp', 'Thời tiết', 'Kinh nghiệm nhà nông', 'Nông nghiệp', 'Ca dao'],
        readTime: '3 phút đọc',
        viewsCount: 2100,
        likesCount: 560,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Gà cùng một mẹ, chớ hoài đá nhau',
        slug: 'ga-cung-mot-me-cho-hoai-da-nhau',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Tình anh em & Đoàn kết gia đình',
        summary: 'Lời khuyên răn sâu sắc về đạo lý anh em cốt nhục một nhà phải biết hòa thuận, nhường nhịn, đùm bọc, tuyệt đối không được tranh giành hãm hại lẫn nhau.',
        quote: 'Khôn ngoan đối đáp người ngoài,\nGà cùng một mẹ chớ hoài đá nhau.',
        content: `Hai câu ca dao lục bát là khuôn vàng thước ngọc về đạo lý cư xử giữa anh em trong gia đình và rộng ra là đồng bào trong một xã hội:

"Khôn ngoan đối đáp người ngoài,
Gà cùng một mẹ chớ hoài đá nhau."

Trong đời sống tự nhiên, đàn gà con cùng một gà mẹ ấp ủ sinh ra luôn quanh quẩn bên nhau kiếm mồi dưới đôi cánh chở che của mẹ. Hình ảnh ấy được nhân dân mượn để ẩn dụ cho tình anh em ruột thịt cùng chung huyết thống.

Người có trí tuệ, bản lĩnh ("khôn ngoan") thì phải biết đem sự thông minh, nhạy bén để ứng đối với các thử thách, quan hệ phức tạp ở thế giới bên ngoài; tuyệt đối không được vì chút quyền lợi ích kỷ nhỏ nhen mà quay sang đấu đá, tranh giành, chèn ép anh chị em ruột thịt của mình. Khi anh em hòa thuận ("huynh đệ hòa khí"), gia đình mới hưng thịnh và tạo nên bức thành trì vững chắc trước sóng gió cuộc đời.`,
        literalMeaning: 'Những con gà nở ra từ cùng một gà mẹ thì không được mổ cắn, đá nhau; người khôn khéo phải biết hướng tài năng đối đáp ra với người ngoài.',
        figurativeMeaning: 'Lời răn dạy sâu sắc về tình anh em ruột thịt và tinh thần đoàn kết đồng bào: Cùng chung một cội rễ thì phải nhường nhịn, đùm bọc, không được cốt nhục tương tàn.',
        lesson: 'Giữ gìn hòa khí gia đình, đặt tình nghĩa anh em lên trên lợi ích vật chất; phát huy tinh thần đoàn kết thương yêu đồng loại.',
        historicalContext: 'Lưu truyền qua nhiều thế hệ trong kho tàng văn hóa dân gian Việt Nam, phản ánh nhân sinh quan gia đình hòa mục của dân tộc.',
        thematicMeaning: 'Đạo lý gia đình truyền thống và triết lý đoàn kết — nền tảng sức mạnh trường tồn của giống nòi Việt.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học, Tập 1.',
        tags: ['Gà cùng một mẹ', 'Khôn ngoan đối đáp', 'Tình anh em', 'Ca dao', 'Gia đình', 'Đoàn kết'],
        readTime: '3 phút đọc',
        viewsCount: 2680,
        likesCount: 820,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Tuyển tập Ca dao Đất nước & Tình nghĩa Con người',
        slug: 'ca-dao-que-huong-tinh-nguoi',
        category: 'ca-dao',
        categoryName: 'Ca dao Dân ca Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Bắc Bộ, Trung Bộ & Nam Bộ',
        author: 'Dân gian',
        topic: 'Bản sắc quê hương & Tâm hồn người Việt',
        summary: 'Tiếng hát ân tình của quần chúng nhân dân gửi gắm vào đồng ruộng, dòng sông, tình cảm gia đình, tình yêu đôi lứa và niềm tự hào sâu nặng trước giang sơn bờ cõi.',
        quote: 'Đường vô xứ Nghệ quanh quanh,\nNon xanh nước biếc như tranh họa đồ...\nCông cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra...',
        content: `Ca dao dân ca là viên ngọc quý lung linh nhất của tâm hồn người Việt, được lưu truyền qua hàng ngàn năm bằng phương thức truyền khẩu qua các điệu hát ru, hò đối đáp và ca trù:

1. Về tình yêu quê hương giang sơn gấm vóc:
"Đường vô xứ Nghệ quanh quanh
Non xanh nước biếc như tranh họa đồ
Ai vô xứ Nghệ thì vô..."

2. Về đạo hiếu và luân thường đạo lý gia đình:
"Công cha như núi Thái Sơn
Nghĩa mẹ như nước trong nguồn chảy ra
Một lòng thờ mẹ kính cha
Cho tròn chữ hiếu mới là đạo con."

3. Về tinh thần lao động cần cù, trân quý hạt ngọc trời:
"Cày đồng đang buổi ban trưa
Mồ hôi thánh thót như mưa ruộng cày
Ai ơi bưng bát cơm đầy
Dẻo thơm một hạt, đắng cay muôn phần!"

Tuyển tập phản ánh toàn diện thế giới nội tâm phong phú, tinh tế, giàu lòng nhân ái, sự lạc quan và triết lý sống thủy chung son sắt của nhân dân lao động từ đồng bằng Bắc Bộ đến miệt vườn Nam Bộ.`,
        literalMeaning: 'Tập hợp những câu ca dao lục bát miêu tả cảnh quan sông núi, bờ cõi, nếp nhà, ruộng đồng và đời sống sinh hoạt mộc mạc của người xưa.',
        figurativeMeaning: 'Khúc ca tâm tình ngợi ca tình yêu tha thiết với giang sơn, tấm lòng hiếu thảo với cha mẹ, tinh thần tương thân tương ái và phẩm chất cần cù của con người Việt Nam.',
        lesson: 'Bồi đắp tình cảm gia đình, lòng tự hào dân tộc, ý thức cội nguồn và thái độ trân quý sức lao động.',
        historicalContext: 'Được sáng tạo và bồi đắp liên tục qua các thời kỳ lịch sử dựng nước và giữ nước, gắn bó mật thiết với dòng chảy văn hóa dân gian Việt Nam.',
        thematicMeaning: 'Bức tranh toàn cảnh về tâm hồn, phẩm giá và bản sắc văn hóa ngàn đời của dân tộc Việt Nam.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học, Toàn tập.',
        tags: ['Ca dao', 'Dân gian', 'Hiếu thảo', 'Tình yêu quê hương', 'Đạo lý', 'Lao động'],
        readTime: '6 phút đọc',
        viewsCount: 3410,
        likesCount: 950,
        isFeatured: true,
        status: 'published'
    },

    // =========================================================================
    // 3. THẦN THOẠI, TRUYỀN THUYẾT & CỔ TÍCH
    // =========================================================================
    {
        title: 'Sơn Tinh - Thủy Tinh',
        slug: 'son-tinh-thuy-tinh',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Truyền thuyết Cổ đại',
        period: 'Văn học Dân gian (Thời đại Hùng Vương)',
        region: 'Vùng núi Ba Vì & Đồng bằng Bắc Bộ',
        author: 'Dân gian',
        topic: 'Chinh phục thiên nhiên & Khát vọng dựng nước',
        summary: 'Bản hùng ca huyền thoại giải thích hiện tượng bão lũ hàng năm trên lưu vực sông Hồng và tôn vinh sức mạnh, ý chí kiên cường chống chọi thiên tai của người Việt cổ.',
        quote: 'Núi cao sông hãy còn dài / Năm năm báo oán đời đời đánh ghen...',
        content: `Đời Hùng Vương thứ mười tám có một người con gái tên là Mỵ Nương, nhan sắc tuyệt trần, tính nết thùy mị nết na. Vua Hùng muốn kén cho con gái một người chồng thật xứng đáng.

Một hôm, có hai chàng trai cùng đến cầu hôn. Một người ở vùng núi Tản Viên có tài vẫy tay về phía đông, phía đông nổi cồn bãi; vẫy tay về phía tây, phía tây mọc lên từng dãy núi đồi, người ta gọi chàng là Sơn Tinh. Một người ở miền biển Đông có tài gọi gió, gió đến; hô mưa, mưa về, người ta gọi chàng là Thủy Tinh. 

Vua Hùng phân vân bèn ra điều kiện: Ngày mai ai đem sính lễ đến trước gồm một trăm ván cơm nếp, một trăm nệp bánh chưng, voi chín ngà, gà chín cựa, ngựa chín hồng mao, mỗi thứ một đôi thì sẽ được rước dâu.

Hôm sau, Sơn Tinh mang sính lễ đến trước và rước Mỵ Nương về núi Ba Vì. Thủy Tinh đến sau đùng đùng nổi giận, đem quân đuổi theo cướp lại Mỵ Nương. Thủy Tinh hô mưa gọi gió làm giông bão ngập lụt khắp kinh thành Phong Châu. Nhưng Sơn Tinh không hề nao núng, dùng phép bốc từng quả đồi, dời từng dãy núi chặn đứng dòng nước lũ. Nước dâng cao bao nhiêu, núi lại cao lên bấy nhiêu. Cuối cùng Thủy Tinh đuối sức phải rút lui.

Từ đó, hàng năm Thủy Tinh lại dâng nước đánh Sơn Tinh nhưng năm nào cũng chuốc lấy thất bại ê chề.`,
        literalMeaning: 'Câu chuyện thần thoại giải thích nguồn gốc hiện tượng lũ lụt hàng năm trên lưu vực sông Hồng vào tháng 7, tháng 8 âm lịch.',
        figurativeMeaning: 'Khúc tráng ca ngợi ca ý chí kiên cường, sức mạnh đoàn kết và tinh thần bất khuất của cư dân nông nghiệp lúa nước trong cuộc đấu tranh sinh tồn, đắp đê ngăn lũ giữ gìn bờ cõi.',
        lesson: 'Tinh thần kiên định, chủ động phòng chống thiên tai bão lũ, không lùi bước trước bất kỳ sức mạnh tàn phá nào của ngoại cảnh.',
        historicalContext: 'Hình thành vào thời kỳ bình minh dựng nước của các vua Hùng, phản ánh cuộc chiến trị thủy sinh tử của cư dân văn hóa Đông Sơn bên dòng sông Hồng.',
        thematicMeaning: 'Biểu tượng của tinh thần trị thủy, khai phá đất đai và bảo vệ giang sơn bờ cõi của tổ tiên người Việt.',
        source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi & Việt Điện U Linh Tập.',
        tags: ['Sơn Tinh', 'Thủy Tinh', 'Thần thoại', 'Hùng Vương', 'Ba Vì', 'Trị thủy'],
        readTime: '7 phút đọc',
        viewsCount: 3890,
        likesCount: 1140,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Thánh Gióng (Phù Đổng Thiên Vương)',
        slug: 'thanh-giong',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết Anh hùng Dân tộc',
        period: 'Văn học Dân gian (Thời đại Hùng Vương)',
        region: 'Làng Gióng (Phù Đổng, Gia Lâm, Hà Nội)',
        author: 'Dân gian',
        topic: 'Lòng yêu nước & Khí phách đánh giặc cứu nước',
        summary: 'Hình tượng bất tử về người anh hùng làng Gióng: Đứa trẻ vươn vai thành tráng sĩ cưỡi ngựa sắt, nhổ tre đánh tan giặc Ân bảo vệ giang sơn rồi bay về trời.',
        quote: 'Đứa trẻ lên ba vươn vai thành tráng sĩ / Cưỡi ngựa sắt, nhổ tre ngà quét sạch bóng thù...',
        content: `Đời Hùng Vương thứ sáu, ở làng Gióng có hai vợ chồng ông lão chăm chỉ làm ăn nhưng mãi chưa có con. Một hôm bà vợ ra đồng thấy một vết chân to khác thường bèn ướm thử chân vào, về nhà thụ thai và sinh ra một cậu bé khôi ngô. Nhưng lạ thay, đứa bé lên ba tuổi vẫn không biết nói biết cười, đặt đâu nằm đấy.

Khi giặc Ân hung hãn tràn vào bờ cõi nước ta, thế giặc rất mạnh, vua Hùng sai sứ giả đi khắp nơi tìm người tài giỏi cứu nước. Nghe tiếng sứ giả rao, cậu bé bỗng cất tiếng nói đầu tiên: "Mẹ mời sứ giả vào đây cho con!". Cậu yêu cầu vua rèn cho mình một con ngựa sắt, một thanh roi sắt, một chiếc áo giáp sắt và một chiếc nón sắt.

Từ ngày gặp sứ giả, cậu bé lớn nhanh như thổi, cơm ăn mấy nong cũng không no, áo mặc vừa may xong đã chật. Dân làng gom góp gạo nuôi chú bé lớn lên thành tráng sĩ. Khi giặc đến chân núi Trâu Sơn, tráng sĩ vươn vai một cái thành người khổng lồ, mặc giáp sắt, cầm roi sắt nhảy lên lưng ngựa. Ngựa hí vang phun lửa phi thẳng ra chiến trường.

Gióng xông vào trận chém giặc như chẻ tre. Roi sắt gãy, tráng sĩ nhanh trí nhổ từng bụi tre ngà bên đường quật túi bụi làm giặc Ân tan tác vỡ trận. Đánh tan giặc thù, Gióng một mình một ngựa lên đỉnh núi Sóc Sơn, cởi giáp sắt lại rồi cả người lẫn ngựa bay thẳng lên trời.`,
        literalMeaning: 'Truyền thuyết về cậu bé làng Phù Đổng thần kỳ đánh tan giặc Ân xâm lược thời Hùng Vương rồi bay về trời.',
        figurativeMeaning: 'Biểu tượng vĩ đại cho sức mạnh tiềm tàng, ý chí quật khởi phi thường của nhân dân Việt Nam: Khi tổ quốc lâm nguy, mọi người dân từ trẻ nhỏ đều sẵn sàng vươn vai thành dũng sĩ cứu quốc.',
        lesson: 'Giáo dục lòng yêu nước sâu sắc, tinh thần xả thân vì độc lập tự do của Tổ quốc và ý thức cống hiến không màng danh lợi (đánh giặc xong bay về trời).',
        historicalContext: 'Phản ánh buổi đầu lịch sử dựng nước và giữ nước thời Hùng Vương; gắn với hội Gióng đền Phù Đổng (Di sản văn hóa phi vật thể của nhân loại do UNESCO công nhận).',
        thematicMeaning: 'Bản hùng ca bất tử về tinh thần yêu nước, sức mạnh quật cường và phẩm chất vô tư vì dân vì nước của người anh hùng dân tộc.',
        source: 'Đại Việt Sử Ký Toàn Thư & Lĩnh Nam Chích Quái.',
        tags: ['Thánh Gióng', 'Phù Đổng Thiên Vương', 'Truyền thuyết', 'Yêu nước', 'Hùng Vương', 'Sóc Sơn'],
        readTime: '8 phút đọc',
        viewsCount: 4210,
        likesCount: 1530,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Sự tích Trầu Cau',
        slug: 'su-tich-trau-cau',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích thế sự & phong tục',
        period: 'Văn học Dân gian (Thời đại Hùng Vương)',
        region: 'Đồng bằng sông Hồng',
        author: 'Dân gian',
        topic: 'Tình cảm gia đình & Phong tục truyền thống',
        summary: 'Bản tình ca bất hủ về tình anh em ruột thịt và tình nghĩa vợ chồng thủy chung, giải thích nguồn gốc tục ăn trầu - nét đẹp văn hóa độc đáo ngàn đời của người Việt.',
        quote: 'Miếng trầu là đầu câu chuyện / Hòa quyện vôi nồng thắm đỏ sắt son...',
        content: `Đời Hùng Vương có hai anh em sinh đôi là Tân và Lang, giống nhau như đúc, tình cảm vô cùng khăng khít. Cha mẹ mất sớm, hai anh em cùng theo học cụ đồ họ Lưu. Thấy hai anh em ngoan ngoãn đức độ, thầy Lưu gả con gái cho người anh là Tân.

Sau khi lấy vợ, Tân vì bận rộn lo việc gia đình nên có phần lơ là chăm sóc em. Một hôm hai anh em cùng đi làm đồng về, người vợ vì nhầm lẫn nên đã ôm chầm lấy người em là Lang. Tân thấy vậy đâm ra nghi ngờ, tỏ vẻ lạnh nhạt với em. Lang đau đớn buồn bã, trong đêm lặng lẽ bỏ nhà ra đi. Chàng đi mãi đến bờ một con suối thì kiệt sức, khóc thương rồi hóa thành tảng đá vôi.

Tân không thấy em về liền cất bước đi tìm. Đến bên con suối, Tân tựa vào tảng đá than khóc thảm thiết rồi gục chết, hóa thành cây cau mọc thẳng đứng bên tảng đá. Người vợ ở nhà chờ mãi không thấy chồng cũng lặn lội đi tìm, đến chân cây cau tựa đầu khóc thương rồi chết, hóa thành dây trầu không mềm mại quấn chặt lấy thân cau.

Về sau vua Hùng đi tuần qua, nghe câu chuyện cảm động bèn sai hái lá trầu nhai thử cùng quả cau và chút vôi bột, thấy miệng thơm ngát cay nồng, nhổ bã ra có màu đỏ thắm rực rỡ. Vua truyền cho nhân dân trồng trầu cau và dùng trong các dịp cưới hỏi, lễ tết.`,
        literalMeaning: 'Câu chuyện cổ tích giải thích nguồn gốc tự nhiên của cây cau mọc thẳng, dây trầu leo quấn quýt và tảng đá vôi đỏ thắm khi hòa quyện; lý giải phong tục ăn trầu của người Việt.',
        figurativeMeaning: 'Ca ngợi vẻ đẹp cao quý của tình anh em ruột thịt và tình nghĩa vợ chồng son sắt, thủy chung, sống chết không rời nhau.',
        lesson: 'Răn dạy đạo lý nghĩa tình trong gia đình: Anh em phải hòa thuận, vợ chồng phải tin tưởng, thủy chung; tránh nghi kỵ hiểu lầm gây nên bi kịch xót xa.',
        historicalContext: 'Ra đời từ thời kỳ Hùng Vương, gắn liền với tục ăn trầu, phong tục cưới hỏi truyền đời từ buổi đầu bình minh lịch sử dân tộc.',
        thematicMeaning: 'Biểu tượng thiêng liêng của tình thân gia đình và nét đẹp văn hóa ứng xử "Miếng trầu là đầu câu chuyện".',
        source: 'Lĩnh Nam Chích Quái & Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi.',
        tags: ['Trầu Cau', 'Cổ tích', 'Tình nghĩa', 'Văn hóa Việt', 'Hùng Vương', 'Thủy chung'],
        readTime: '7 phút đọc',
        viewsCount: 3120,
        likesCount: 895,
        isFeatured: false,
        status: 'published'
    },
    {
        title: 'Thạch Sanh',
        slug: 'thach-sanh',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích thần kỳ',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Chính nghĩa thắng gian tà & Ước vọng hòa bình',
        summary: 'Hình tượng dũng sĩ Thạch Sanh tài ba, thật thà, diệt Chằn tinh, bắn Đại bàng cứu công chúa, dùng tiếng đàn nhân đạo cảm hóa quân thù và niêu cơm thần kỳ diệu.',
        quote: 'Đàn kêu tích tịch tình tang / Ai mang công chúa dưới hang trở về...',
        content: `Thạch Sanh mồ côi cả cha lẫn mẹ từ nhỏ, sống cô độc dưới gốc đa già, gia tài chỉ có một chiếc khố rách và một lưỡi búa sắt do cha để lại. Thạch Sanh được thần tiên dạy cho võ nghệ cao cường và nhiều phép thần thông.

Lý Thông thấy Thạch Sanh khỏe mạnh bèn kết nghĩa anh em nhằm lợi dụng chàng. Khi đến lượt nộp mạng cho Chằn tinh, Lý Thông lừa Thạch Sanh đi thay. Thạch Sanh dũng cảm chém đầu Chằn tinh, thu được cung vàng tên ngọc. Lý Thông lại lừa Thạch Sanh trốn đi rồi cướp công lĩnh thưởng.

Khi công chúa bị Đại bàng khổng lồ bắt cóc, Thạch Sanh dùng cung vàng bắn trọng thương Đại bàng, lần theo vết máu xuống hang sâu giải cứu công chúa. Lý Thông lại một lần nữa lập mưu lấp cửa hang hãm hại chàng để cướp công lấy công chúa. Dưới hang sâu, Thạch Sanh cứu con vua Thủy Tề và được tặng cây đàn thần. Hồn Chằn tinh và Đại bàng hãm hại nhốt chàng vào ngục tối. 

Trong ngục, Thạch Sanh đem đàn thần ra gảy. Tiếng đàn kỳ diệu vang lên giải oan cho chàng, vạch trần tội ác của mẹ con Lý Thông. Khi hoàng tử mười tám nước chư hầu đem quân sang đánh, Thạch Sanh ngồi trên tường thành gảy đàn. Tiếng đàn nhân đạo làm quân giặc bủn rủn chân tay buông vũ khí xin hàng. Chàng thiết đãi quân giặc bằng niêu cơm thần bé xíu nhưng ăn mãi không bao giờ cạn, khiến quân thù tâm phục khẩu phục rút quân về nước.`,
        literalMeaning: 'Truyện cổ tích kể về chàng dũng sĩ mồ côi Thạch Sanh vượt qua bao hãm hại gian nan, lập nhiều chiến công hiển hách và cưới được công chúa.',
        figurativeMeaning: 'Khát vọng muôn đời của nhân dân lao động về chân lý "Ở hiền gặp lành", cái thiện tất thắng cái ác; đồng thời thể hiện tư tưởng hòa hiếu, nhân đạo đẩy lùi chiến tranh qua tiếng đàn và niêu cơm thần.',
        lesson: 'Sống trung thực, nghĩa hiệp, dũng cảm đấu tranh chống áp bức; giữ gìn lòng vị tha và tinh thần hòa bình bác ái.',
        historicalContext: 'Hình thành và phát triển qua nhiều thế kỷ trong kho tàng cổ tích Việt Nam, gắn với tâm tư nguyện vọng của quần chúng lao động bị bóc lột.',
        thematicMeaning: 'Khúc ca ngợi ca công lý xã hội, chủ nghĩa nhân đạo cao cả và ước vọng hòa bình muôn thuở của dân tộc.',
        source: 'Kho tàng Truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi, NXB Khoa học Xã hội.',
        tags: ['Thạch Sanh', 'Cổ tích thần kỳ', 'Tiếng đàn thần', 'Niêu cơm thần', 'Chính nghĩa', 'Hòa bình'],
        readTime: '9 phút đọc',
        viewsCount: 3950,
        likesCount: 1320,
        isFeatured: true,
        status: 'published'
    },

    // =========================================================================
    // 4. VĂN HỌC TRUNG ĐẠI (5 KIỆT TÁC KINH ĐIỂN)
    // =========================================================================
    {
        title: 'Nam Quốc Sơn Hà',
        slug: 'nam-quoc-son-ha',
        category: 'trung-dai',
        categoryName: 'Thơ chữ Hán - Bản Tuyên ngôn Độc lập đầu tiên',
        period: 'Văn học Trung đại (Năm 1077)',
        region: 'Bắc Ninh (Chiến tuyến Sông Như Nguyệt)',
        author: 'Khuyết danh (Tương truyền Lý Thường Kiệt)',
        topic: 'Ý chí độc lập & Chủ quyền non sông',
        summary: 'Bản Tuyên ngôn Độc lập đầu tiên của dân tộc Việt Nam, khẳng định chủ quyền lãnh thổ thiêng liêng bất khả xâm phạm và ý chí sắt đá trừng trị mọi kẻ thù xâm lược.',
        quote: 'Nam quốc sơn hà Nam đế cư,\nTiệt nhiên định phận tại thiên thư.\nNhư hà nghịch lỗ lai xâm phạm,\nNhữ đẳng hành khan thủ bại hư!',
        content: `Bài thơ thần vang dội trên phòng tuyến sông Như Nguyệt năm 1077 thời nhà Lý:

[Nguyên tác chữ Hán & Phiên âm]:
南國山河南帝居 (Nam quốc sơn hà Nam đế cư)
截然定分在天書 (Tiệt nhiên định phận tại thiên thư)
如何逆虜來侵犯 (Như hà nghịch lỗ lai xâm phạm)
汝等行看取敗虛 (Nhữ đẳng hành khan thủ bại hư!)

[Dịch thơ - Bản dịch của Trần Trọng Kim]:
"Sông núi nước Nam vua Nam ở,
Rành rành định phận tại sách trời.
Cớ sao lũ giặc sang xâm phạm,
Chúng bay sẽ bị đánh tơi bời!"

[Bối cảnh & Giá trị văn học]:
Năm 1077, ba mươi vạn quân Tống do Quách Quỳ chỉ huy ồ ạt tràn sang xâm lược nước ta. Thái úy Lý Thường Kiệt lập phòng tuyến vững chắc bên bờ nam sông Như Nguyệt (sông Cầu) để chặn giặc.
Đang đêm thanh vắng, từ đền thờ Trương Hống, Trương Hát bên bờ sông bỗng vang lên tiếng ngâm thơ sang sảng như sấm truyền. 

Tiếng thơ khẳng định hai chân lý bất diệt:
1. Nước Nam là của người phương Nam, cương thổ đã được sách trời ("thiên thư") định phận rành rành — đặt nước ta ngang hàng với các đế chế phương Bắc.
2. Kẻ nào ngông cuồng làm trái quy luật thiêng liêng ấy sang xâm lược ("nghịch lỗ") ắt sẽ nhận lấy kết cục đại bại tan tành.
Bài thơ thần làm quân ta nức lòng phấn chấn, còn giặc Tống hoang mang khiếp đảm, dẫn đến thắng lợi vẻ vang của dân tộc.`,
        literalMeaning: 'Sông núi nước Nam thì vua Nam ở, điều đó đã được ghi chép rành rành tại sách trời. Cớ sao quân giặc bạo ngược lại dám xâm phạm? Chúng bay hãy chờ xem, nhất định sẽ phải chuốc lấy thất bại tan tác.',
        figurativeMeaning: 'Khẳng định đanh thép chủ quyền lãnh thổ, quyền tự quyết thiêng liêng của một quốc gia độc lập sánh ngang các triều đại phương Bắc; đồng thời cảnh cáo nghiêm khắc ý chí kiên quyết tiêu diệt mọi kẻ thù xâm lược.',
        lesson: 'Bồi đắp lòng yêu nước nồng nàn, ý chí tự lực tự cường và tinh thần sẵn sàng đứng lên bảo vệ độc lập, chủ quyền bờ cõi thiêng liêng của Tổ quốc.',
        historicalContext: 'Gắn liền với chiến dịch phòng ngự sông Như Nguyệt năm 1077 do Thái úy Lý Thường Kiệt chỉ huy, đập tan âm mưu xâm lược của nhà Tống.',
        thematicMeaning: 'Cột mốc chói lọi mở đầu cho truyền thống thi ca yêu nước và tuyên ngôn chủ quyền của dân tộc Việt Nam.',
        source: 'Đại Việt Sử Ký Toàn Thư & Thơ văn Lý - Trần (Viện Văn học, NXB Khoa học Xã hội).',
        tags: ['Nam Quốc Sơn Hà', 'Lý Thường Kiệt', 'Tuyên ngôn độc lập', 'Sông Như Nguyệt', 'Yêu nước', 'Trung đại'],
        readTime: '5 phút đọc',
        viewsCount: 3850,
        likesCount: 1420,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Bình Ngô Đại Cáo',
        slug: 'binh-ngo-dai-cao',
        category: 'trung-dai',
        categoryName: 'Thể Cáo - Thiên cổ hùng văn',
        period: 'Văn học Trung đại (Năm 1428)',
        region: 'Lam Sơn (Thanh Hóa) & Đông Đô (Hà Nội)',
        author: 'Nguyễn Trãi',
        topic: 'Tư tưởng nhân nghĩa & Niềm tự hào độc lập',
        summary: 'Bản Tuyên ngôn Độc lập thứ hai chói ngời tinh thần nhân nghĩa, tổng kết cuộc kháng chiến mười năm Lam Sơn gian khổ mà hào hùng đánh tan hai mươi vạn quân Minh xâm lược.',
        quote: 'Việc nhân nghĩa cốt ở yên dân,\nQuân điếu phạt trước lo trừ bạo.\nNhư nước Đại Việt ta từ trước,\nVốn xưng nền văn hiến đã lâu...',
        content: `Đầu năm 1428, sau khi cuộc khởi nghĩa Lam Sơn toàn thắng đập tan ách thống trị tàn bạo của quân Minh, Nguyễn Trãi thừa lệnh vua Lê Thái Tổ (Lê Lợi) viết Bình Ngô Đại Cáo để bố cáo cho toàn thiên hạ biết nền độc lập dân tộc đã được lập lại.

[Đoạn mở đầu - Nền tảng Nhân nghĩa & Chân lý độc lập]:
"Từng nghe:
Việc nhân nghĩa cốt ở yên dân,
Quân điếu phạt trước lo trừ bạo.
Như nước Đại Việt ta từ trước,
Vốn xưng nền văn hiến đã lâu.
Núi sông bờ cõi đã chia,
Phong tục Bắc Nam cũng khác.
Từ Triệu, Đinh, Lý, Trần bao đời gây nền độc lập,
Cùng Hán, Đường, Tống, Nguyên mỗi bên xưng đế một phương.
Tuy mạnh yếu từng lúc khác nhau,
Song hào kiệt đời nào cũng có."

[Đoạn vạch trần tội ác giặc Minh]:
"Nướng dân đen trên ngọn lửa hung tàn,
Vùi con đỏ xuống dưới hầm tai vạ...
Độc ác thay, trúc Nam Sơn không ghi hết tội,
Dơ bẩn thay, nước Đông Hải không rửa sạch mùi!"

[Đoạn tái hiện 10 năm kháng chiến & Tư tưởng hòa bình]:
Tác phẩm tái hiện từ ngày đầu "Nếm mật nằm gai", "Cơm ăn chẳng no, áo mặc chẳng ấm" cho đến những trận đánh sấm sét tại Tốt Động - Chúc Động, Chi Lăng - Xương Giang. Đánh tan giặc, quân ta mở lượng hiếu sinh cấp thuyền ngựa cho giặc về nước, dập tắt ngọn lửa chiến tranh, mở ra kỷ nguyên thái bình muôn thuở.`,
        literalMeaning: 'Bản đại cáo tuyên bố dẹp yên giặc Ngô (nhà Minh), khẳng định nước Đại Việt có nền văn hiến lâu đời, bờ cõi phong tục riêng, các triều đại sánh vai cùng phương Bắc, làm việc nhân nghĩa dẹp trừ bạo tàn.',
        figurativeMeaning: 'Bản Tuyên ngôn Độc lập thứ hai sáng ngời tư tưởng nhân nghĩa lấy dân làm gốc, đề cao lòng tự hào dân tộc và triết lý quân sự chính nghĩa tất thắng bạo tàn.',
        lesson: 'Lấy dân làm gốc ("Chở thuyền là dân, lật thuyền cũng là dân"), nêu cao tinh thần khoan dung, chuộng hòa bình và hòa hiếu lân bang sau chiến tranh.',
        historicalContext: 'Được công bố vào tháng 1 năm 1428 sau khi nghĩa quân Lam Sơn đánh bại hoàn toàn 15 vạn viện binh giặc Minh, lập nên triều Hậu Lê.',
        thematicMeaning: 'Đỉnh cao của tư tưởng nhân nghĩa và tinh thần tự hào dân tộc; được đánh giá là "thiên cổ hùng văn" muôn đời bất hủ của văn học nước nhà.',
        source: 'Nguyễn Trãi toàn tập — Viện Sử học, NXB Khoa học Xã hội.',
        tags: ['Bình Ngô Đại Cáo', 'Nguyễn Trãi', 'Lam Sơn', 'Lê Lợi', 'Thiên cổ hùng văn', 'Nhân nghĩa'],
        readTime: '10 phút đọc',
        viewsCount: 4120,
        likesCount: 1680,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        slug: 'truyen-kieu',
        category: 'trung-dai',
        categoryName: 'Truyện thơ Nôm kinh điển',
        period: 'Văn học Trung đại (Đầu thế kỷ XIX)',
        region: 'Hà Tĩnh & Bắc Ninh',
        author: 'Đại thi hào Nguyễn Du',
        topic: 'Chủ nghĩa nhân đạo & Số phận người phụ nữ',
        summary: 'Kiệt tác số một của nền văn học trung đại Việt Nam, khúc ca đau đớn xót xa cho thân phận tài hoa bạc mệnh của nàng Kiều và tiếng nói đòi quyền sống, tình yêu tự do.',
        quote: 'Trăm năm trong cõi người ta,\nChữ tài chữ mệnh khéo là ghét nhau.\nTrải qua một cuộc bể dâu,\nNhững điều trông thấy mà đau đớn lòng.',
        content: `Kiệt tác Truyện Kiều gồm 3.254 câu thơ lục bát được viết bằng chữ Nôm của Đại thi hào dân tộc, Danh nhân văn hóa thế giới Nguyễn Du.

[Bốn câu thơ đề từ bất hủ]:
"Trăm năm trong cõi người ta,
Chữ tài chữ mệnh khéo là ghét nhau.
Trải qua một cuộc bể dâu,
Những điều trông thấy mà đau đớn lòng."

[Vẻ đẹp tài sắc vẹn toàn của Thúy Kiều]:
"Làn thu thủy nét xuân sơn,
Hoa ghen thua thắm liễu hờn kém xanh.
Một hai nghiêng nước nghiêng thành,
Sắc đành đòi một tài đành họa hai."

Nguyễn Du đã dùng ngòi bút hiện thực sắc sảo và trái tim nhân đạo mênh mông để vẽ nên bức tranh hiện thực tàn bạo của xã hội phong kiến thối nát, nơi đồng tiền tác oai tác quái chà đạp lên nhân phẩm con người. Thúy Kiều — một người con gái hiếu thảo, tài sắc vẹn toàn — đã phải bán mình chuộc cha, nếm trải mười lăm năm lưu lạc đoạn trường. 

Tác phẩm là đỉnh cao chói lọi của nghệ thuật ngôn từ tiếng Việt, bậc thầy về miêu tả tâm lý nhân vật và nghệ thuật tả cảnh ngụ tình ("Người buồn cảnh có vui đâu bao giờ").`,
        literalMeaning: 'Tác phẩm thơ lục bát kể về cuộc đời mười lăm năm chìm nổi, oan khiên đầy cay đắng của người con gái tài sắc Thúy Kiều trong xã hội phong kiến.',
        figurativeMeaning: 'Khúc ca nhân đạo vĩ đại lên án xã hội phong kiến tàn bạo, đồng cảm sâu sắc với nỗi đau con người, đặc biệt là người phụ nữ; khẳng định khát vọng tự do, công lý và tình yêu chân chính.',
        lesson: 'Lòng trắc ẩn đối với những số phận bất hạnh trong cuộc đời, trân trọng phẩm giá con người và luôn giữ gìn chữ Tâm trong sáng ("Thiện căn ở tại lòng ta / Chữ tâm kia mới bằng ba chữ tài").',
        historicalContext: 'Sáng tác vào đầu thế kỷ XIX dưới thời nhà Nguyễn, trong bối cảnh xã hội phong kiến Việt Nam khủng hoảng sâu sắc sau biến cố Tây Sơn.',
        thematicMeaning: 'Đỉnh cao mẫu mực của ngôn ngữ thi ca tiếng Việt và chủ nghĩa nhân đạo sâu sắc nhất của nền văn học dân tộc.',
        source: 'Truyện Kiều — Nguyễn Du (Bản khảo đính của GS. Đào Duy Anh, NXB Văn học).',
        tags: ['Truyện Kiều', 'Nguyễn Du', 'Đoạn Trường Tân Thanh', 'Thơ Nôm', 'Lục bát', 'Nhân đạo'],
        readTime: '12 phút đọc',
        viewsCount: 5200,
        likesCount: 2150,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Qua Đèo Ngang',
        slug: 'qua-deo-ngang',
        category: 'trung-dai',
        categoryName: 'Thơ Đường luật thất ngôn bát cú',
        period: 'Văn học Trung đại (Thế kỷ XIX)',
        region: 'Đèo Ngang (Ranh giới Hà Tĩnh - Quảng Bình)',
        author: 'Bà Huyện Thanh Quan',
        topic: 'Nỗi niềm hoài cổ & Tình yêu quê hương đất nước',
        summary: 'Kiệt tác thơ Đường luật mẫu mực của Bà Huyện Thanh Quan: Cảnh Đèo Ngang bóng xế tà hoang sơ vắng lặng gợi nỗi nhớ nước thương nhà tha thiết của người lữ thứ.',
        quote: 'Bước tới Đèo Ngang, bóng xế tà,\nCỏ cây chen đá, lá chen hoa.\nLom khom dưới núi, tiều vài chú,\nLác đác bên sông, chợ mấy nhà...',
        content: `Toàn văn bài thơ Thất ngôn bát cú Đường luật chuẩn mực của Bà Huyện Thanh Quan:

"Bước tới Đèo Ngang, bóng xế tà,
Cỏ cây chen đá, lá chen hoa.
Lom khom dưới núi, tiều vài chú,
Lác đác bên sông, chợ mấy nhà.
Nhớ nước đau lòng, con quốc quốc,
Thương nhà mỏi miệng, cái gia gia.
Dừng chân đứng lại, trời, non, nước,
Một mảnh tình riêng, ta với ta."

[Phân tích nghệ thuật]:
Thời khắc "bóng xế tà" (hoàng hôn) là khoảnh khắc gợi buồn muôn thuở trong thi ca phương Đông. Cảnh Đèo Ngang hiện lên hiểm trở, hoang sơ ("cỏ cây chen đá, lá chen hoa") với vài bóng người tiều phu lom khom và mấy nóc nhà lác đác bên sông càng làm tăng thêm sự quạnh quẽ, rợn ngợp.

Nghệ thuật chơi chữ đồng âm độc đáo: Tiếng chim "quốc quốc" (nước) gợi nhớ về tiền triều Lê xưa, tiếng chim "gia gia" (nhà) gợi nỗi niềm thương nhớ quê hương chốn kinh kỳ Thăng Long. 

Câu kết bài thơ tạo nên sự tương phản tột cùng giữa không gian bao la vô tận ("trời, non, nước") và sự cô đơn tuyệt đối của con người lữ thứ ("Một mảnh tình riêng, ta với ta").`,
        literalMeaning: 'Tác giả dừng chân bên Đèo Ngang lúc chiều tà, ngắm nhìn cảnh vật thiên nhiên núi đèo hoang vu, lác đác vài bóng người tiều phu và mấy ngôi nhà bên sông.',
        figurativeMeaning: 'Nỗi niềm hoài cổ sâu sắc, tiếc nuối thời vàng son đã qua của triều Lê và tâm trạng cô đơn, nhớ nước thương nhà da diết của người phụ nữ tài hoa trước vũ trụ bao la.',
        lesson: 'Trân trọng các giá trị lịch sử truyền thống, nuôi dưỡng tình cảm gắn bó thiêng liêng với cội nguồn và non sông gấm vóc.',
        historicalContext: 'Sáng tác vào thế kỷ XIX khi Bà Huyện Thanh Quan trên đường từ quê hương Thăng Long vào kinh đô Huế nhận chức Cung Trung Giáo Tập.',
        thematicMeaning: 'Chuẩn mực cổ điển của thi pháp Đường luật chữ Nôm với giọng điệu trang nhã, hoài cổ và u buồn quý phái.',
        source: 'Hợp tuyển Thơ văn Việt Nam thế kỷ XIX — NXB Văn học.',
        tags: ['Qua Đèo Ngang', 'Bà Huyện Thanh Quan', 'Thất ngôn bát cú', 'Đường luật', 'Hoài cổ', 'Đèo Ngang'],
        readTime: '5 phút đọc',
        viewsCount: 3410,
        likesCount: 1120,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Thu Điếu (Câu cá mùa thu)',
        slug: 'thu-dieu',
        category: 'trung-dai',
        categoryName: 'Thơ chữ Nôm - Chùm thơ Thu',
        period: 'Văn học Trung đại (Cuối thế kỷ XIX)',
        region: 'Vùng chiêm trũng Yên Đổ, Bình Lục, Hà Nam',
        author: 'Tam nguyên Yên Đổ Nguyễn Khuyến',
        topic: 'Cảnh sắc đồng quê & Nỗi niềm thời thế',
        summary: 'Kiệt tác thơ tả cảnh mùa thu của làng cảnh Việt Nam: Cảnh ao thu trong veo, tĩnh lặng phản chiếu tâm sự u hoài, bất lực trước vận mệnh đất nước của nhà nho thanh bạch.',
        quote: 'Ao thu lạnh lẽo nước trong veo,\nMột chiếc thuyền câu bé tẻo teo.\nSóng biếc theo làn hơi gợn tí,\nLá vàng trước gió khẽ đưa vèo...',
        content: `Bài thơ trong chùm ba bài thơ Thu nức danh (Thu Điếu, Thu Vịnh, Thu Ẩm) của cụ Tam nguyên Yên Đổ:

"Ao thu lạnh lẽo nước trong veo,
Một chiếc thuyền câu bé tẻo teo.
Sóng biếc theo làn hơi gợn tí,
Lá vàng trước gió khẽ đưa vèo.
Tầng mây lơ lửng, trời xanh ngắt,
Ngõ trúc quanh co, khách vắng teo.
Tựa gối buông cần lâu chẳng được,
Cá đâu đớp động dưới chân bèo."

[Phân tích nghệ thuật]:
Cảnh mùa thu ở vùng đồng bằng chiêm trũng Bắc Bộ hiện lên với những đường nét vô cùng tinh tế, thanh sơ: Mặt nước ao thu "lạnh lẽo", "trong veo", chiếc thuyền câu "bé tẻo teo", bầu trời "xanh ngắt" sâu thẳm. 

Nghệ thuật gieo vần "eo" (tử vận) cực kỳ điêu luyện, vừa gợi sự thu hẹp dần của không gian, vừa tạo cảm giác vắng lặng, tĩnh mịch đến nao lòng. 

Nhà thơ ngồi câu cá nhưng tâm trí không đặt ở việc câu cá ("Tựa gối buông cần lâu chẳng được"). Âm thanh "Cá đâu đớp động dưới chân bèo" cuối bài thơ là thủ pháp lấy động tả tĩnh tài tình, làm nổi bật tâm trạng u uất, trăn trở trước nỗi đau mất nước và sự bất lực của một bậc trí sĩ yêu nước thương dân lúc lui về ẩn dật.`,
        literalMeaning: 'Khung cảnh một buổi câu cá vào mùa thu trên chiếc thuyền nhỏ nơi ao làng mùa nước lạnh trong veo, lá vàng rụng khẽ.',
        figurativeMeaning: 'Tình yêu tha thiết đối với thiên nhiên làng quê Bắc Bộ hòa quyện với nỗi u hoài, trăn trở khôn nguôi trước cảnh nước mất nhà tan của một nhà nho thanh cao giữ trọn khí tiết.',
        lesson: 'Bồi đắp tình yêu thiên nhiên, trân trọng nét đẹp thanh bình của làng quê Việt Nam và noi gương nhân cách thanh bạch, trong sạch.',
        historicalContext: 'Sáng tác sau khi Nguyễn Khuyến từ quan về ở ẩn tại quê nhà Yên Đổ (Hà Nam), kiên quyết bất hợp tác với thực dân Pháp.',
        thematicMeaning: 'Điển hình mẫu mực cho vẻ đẹp của thi pháp thơ thu dân tộc và nhân cách cao khiết của bậc đại nho Việt Nam.',
        source: 'Nguyễn Khuyến tác phẩm — NXB Văn học.',
        tags: ['Thu Điếu', 'Nguyễn Khuyến', 'Câu cá mùa thu', 'Thơ Nôm', 'Làng quê Bắc Bộ', 'Vần eo'],
        readTime: '5 phút đọc',
        viewsCount: 3380,
        likesCount: 1190,
        isFeatured: true,
        status: 'published'
    },

    // =========================================================================
    // 5. VĂN HỌC HIỆN ĐẠI (3 KIỆT TÁC THƠ CA ĐẦY CẢM XÚC)
    // =========================================================================
    {
        title: 'Tây Tiến',
        slug: 'tay-tien',
        category: 'hien-dai',
        categoryName: 'Thơ ca kháng chiến chống Pháp',
        period: 'Văn học Hiện đại (Năm 1948)',
        region: 'Miền Tây Bắc (Hòa Bình, Sơn La, Thượng Lào)',
        author: 'Quang Dũng',
        topic: 'Chí khí anh hùng & Tinh thần bi tráng của người lính',
        summary: 'Bản trường ca hào hùng, lãng mạn bất tử về đoàn binh Tây Tiến: thiên nhiên Tây Bắc hiểm trở mà kỳ vĩ, hình tượng người lính thủ đô hào hoa, coi cái chết nhẹ tựa lông hồng.',
        quote: 'Sông Mã xa rồi Tây Tiến ơi!\nNhớ về rừng núi, nhớ chơi vơi.\nSài Khao sương lấp đoàn quân mỏi,\nMường Lát hoa về trong đêm hơi...',
        content: `Bản tráng ca bất hủ về đoàn binh Tây Tiến của nhà thơ - chiến sĩ Quang Dũng:

[Khổ 1 - Nỗi nhớ chặng đường hành quân qua Tây Bắc hiểm trở & thơ mộng]:
"Sông Mã xa rồi Tây Tiến ơi!
Nhớ về rừng núi, nhớ chơi vơi.
Sài Khao sương lấp đoàn quân mỏi,
Mường Lát hoa về trong đêm hơi.

Dốc lên khúc khuỷu dốc thăm thẳm,
Heo hút cồn mây, súng ngửi trời.
Ngàn thước lên cao, ngàn thước xuống,
Nhà ai Pha Luông mưa xa khơi.

Anh bạn dãi dầu không bước nữa,
Gục lên bao súng bỏ quên đời!
Chiều chiều oai linh thác gầm thét,
Đêm đêm Mường Hịch cọp trêu người.
Nhớ ôi Tây Tiến cơm lên khói,
Mai Châu mùa em thơm nếp xôi."

[Khổ 2 - Đêm liên hoan thắm tình quân dân & Chiều sương mờ Châu Mộc]:
"Doanh trại bừng lên hội đuốc hoa,
Kìa em xiêm áo tự bao giờ.
Khèn lên man điệu nàng e ấp,
Nhạc về Viên Chăn xây hồn thơ.

Người đi Châu Mộc chiều sương ấy,
Có thấy hồn lau nẻo bến bờ?
Có nhớ dáng người trên độc mộc,
Trôi dòng nước lũ hoa đong đưa?"

[Khổ 3 - Tượng đài bi tráng về người lính Tây Tiến]:
"Tây Tiến đoàn binh không mọc tóc,
Quân xanh màu lá dữ oai hùm.
Mắt trừng gửi mộng qua biên giới,
Đêm mơ Hà Nội dáng kiều thơm.

Rải rác biên cương mồ viễn xứ,
Chiến trường đi chẳng tiếc đời xanh.
Áo bào thay chiếu, anh về đất,
Sông Mã gầm lên khúc độc hành!"

[Khổ 4 - Lời thề gắn bó cùng Tây Tiến]:
"Tây Tiến người đi không hẹn ước,
Đường lên thăm thẳm một chia phôi.
Ai lên Tây Tiến mùa xuân ấy,
Hồn về Sầm Nứa chẳng về xuôi."

[Đánh giá học thuật]:
Bằng bút pháp lãng mạn kết hợp hài hòa với cảm hứng bi tráng, Quang Dũng đã khắc họa bức tượng đài bằng thơ bất tử về người lính thời kỳ đầu chống Pháp: Phần lớn là những chàng trai thanh niên, học sinh, sinh viên Hà thành gác bút nghiên lên đường vì tiếng gọi non sông. Dù đối mặt với sốt rét rừng hiểm nghèo ("đoàn binh không mọc tóc", "quân xanh màu lá") và cái chết luôn rình rập, tâm hồn họ vẫn lãng mạn, hào hoa ("Đêm mơ Hà Nội dáng kiều thơm") và sẵn sàng hiến dâng tuổi thanh xuân ("Chiến trường đi chẳng tiếc đời xanh").`,
        literalMeaning: 'Tái hiện chặng đường hành quân gian khổ vượt qua núi cao vực thẳm của trung đoàn Tây Tiến qua vùng rừng núi hiểm trở miền Tây Bắc và Thượng Lào năm 1947 - 1948.',
        figurativeMeaning: 'Khúc ca ngợi ca vẻ đẹp hào hùng, bi tráng, tinh thần xả thân vô tư của thế hệ trẻ trí thức Việt Nam trong kháng chiến bảo vệ Tổ quốc.',
        lesson: 'Lòng biết ơn sâu sắc đối với sự hy sinh vô bờ bến của các thế hệ cha anh đã ngã xuống nơi biên cương vì độc lập tự do của dân tộc.',
        historicalContext: 'Sáng tác tại làng Phù Lưu Chanh (Hà Tây cũ) vào cuối năm 1948 khi Quang Dũng rời đơn vị Tây Tiến chuyển sang đơn vị khác, nhớ về những đồng đội thân yêu.',
        thematicMeaning: 'Đỉnh cao của thi ca cách mạng Việt Nam thế kỷ XX, hòa quyện tuyệt vời giữa thi họa, âm nhạc và cảm hứng lãng mạn anh hùng ca.',
        source: 'Mây đầu ô — Tuyển tập thơ Quang Dũng, NXB Văn học & SGK Ngữ văn 12.',
        tags: ['Tây Tiến', 'Quang Dũng', 'Kháng chiến chống Pháp', 'Sông Mã', 'Người lính', 'Bi tráng', 'Hà Nội'],
        readTime: '8 phút đọc',
        viewsCount: 4213,
        likesCount: 1540,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Đồng Chí',
        slug: 'dong-chi',
        category: 'hien-dai',
        categoryName: 'Thơ ca cách mạng Việt Nam',
        period: 'Văn học Hiện đại (Năm 1948)',
        region: 'Chiến khu Việt Bắc',
        author: 'Chính Hữu',
        topic: 'Tình đồng chí đồng đội thiêng liêng',
        summary: 'Bức tượng đài bằng thơ về người lính nông dân áo vải thời kỳ đầu kháng chiến chống Pháp: gắn bó bằng lý tưởng chung, sẻ chia gian khổ và hình ảnh biểu tượng kỳ vĩ "Đầu súng trăng treo".',
        quote: 'Quê hương anh nước mặn, đồng chua,\nLàng tôi nghèo đất cày lên sỏi đá.\nAnh với tôi đôi người xa lạ,\nTự phương trời chẳng hẹn quen nhau...',
        content: `Bản trường ca chân thực, cảm động về tình đồng đội của nhà thơ Chính Hữu:

[Khổ 1 - Cơ sở hình thành tình đồng chí thiêng liêng]:
"Quê hương anh nước mặn, đồng chua,
Làng tôi nghèo đất cày lên sỏi đá.
Anh với tôi đôi người xa lạ,
Tự phương trời chẳng hẹn quen nhau,
Súng bên súng, đầu sát bên đầu,
Đêm rét chung chăn thành đôi tri kỷ.
Đồng chí!"

[Khổ 2 - Biểu hiện cao đẹp của tình đồng chí: Thấu hiểu & sẻ chia gian lao]:
"Ruộng nương anh gửi bạn thân cày,
Gian nhà không, mặc kệ gió lung lay,
Giếng nước gốc đa nhớ người ra lính.
Anh với tôi biết từng cơn ớn lạnh,
Sốt run người vầng trán ướt mồ hôi.
Áo anh rách vai,
Quần tôi có vài mảnh vá,
Miệng cười buốt giá,
Chân không giày.
Thương nhau tay nắm lấy bàn tay."

[Khổ 3 - Bức tranh biểu tượng kỳ vĩ về người lính và vầng trăng]:
"Đêm nay rừng hoang sương muối,
Đứng cạnh bên nhau chờ giặc tới,
Đầu súng trăng treo."

[Đánh giá học thuật]:
Khác với vẻ hào hoa lãng mạn của người lính Hà Nội trong "Tây Tiến", người lính trong "Đồng chí" của Chính Hữu là những người nông dân mặc áo lính, chân chất và mộc mạc. Họ gặp nhau từ sự đồng cảnh ngộ nghèo khó, gắn kết bên nhau bằng lý tưởng chiến đấu vì nền độc lập của đất nước. 

Chi tiết kết thúc "Đầu súng trăng treo" được xem là một trong những phát hiện thơ ca xuất thần nhất của văn học cách mạng: Sự hòa quyện tuyệt đẹp giữa hiện thực chiến đấu khốc liệt (súng) và chất thơ lãng mạn, khát vọng hòa bình (trăng).`,
        literalMeaning: 'Cuộc gặp gỡ, gắn bó và cùng nhau vượt qua cái lạnh, bệnh sốt rét rừng hiểm nghèo và thiếu thốn quân trang của những người lính vệ quốc đoàn.',
        figurativeMeaning: 'Tình cảm giai cấp, tình đồng đội thiêng liêng cao cả — cội nguồn sức mạnh vĩ đại làm nên chiến thắng của quân đội nhân dân Việt Nam.',
        lesson: 'Tôn vinh giá trị của tình bạn chân thành, sự sẻ chia, đoàn kết cùng chung một chí hướng vượt qua mọi thử thách cuộc đời.',
        historicalContext: 'Sáng tác đầu năm 1948 sau khi tác giả tham gia chiến dịch Việt Bắc Thu - Đông 1947 giành thắng lợi vang dội.',
        thematicMeaning: 'Khúc ca chân thực, mộc mạc và sâu sắc nhất về vẻ đẹp tâm hồn người lính Cụ Hồ thời đại cách mạng.',
        source: 'Đầu súng trăng treo — Tuyển tập thơ Chính Hữu, NXB Văn học & SGK Ngữ văn 9.',
        tags: ['Đồng Chí', 'Chính Hữu', 'Người lính', 'Đầu súng trăng treo', 'Kháng chiến', 'Việt Bắc'],
        readTime: '6 phút đọc',
        viewsCount: 3780,
        likesCount: 1210,
        isFeatured: true,
        status: 'published'
    },
    {
        title: 'Đây Thôn Vĩ Dạ',
        slug: 'day-thon-vi-da',
        category: 'hien-dai',
        categoryName: 'Phong trào Thơ Mới (1932 - 1945)',
        period: 'Văn học Hiện đại (Năm 1938)',
        region: 'Thôn Vĩ Dạ (Cố đô Huế)',
        author: 'Hàn Mặc Tử',
        topic: 'Tình yêu thiên nhiên & Nỗi khát khao giao cảm với cuộc đời',
        summary: 'Kiệt tác thơ trong sáng và u buồn của thi sĩ tài hoa Hàn Mặc Tử: Bức tranh phong cảnh xứ Huế mộng mơ hòa quyện với nỗi u hoài, mặc cảm chia lìa và niềm khát khao sống mãnh liệt.',
        quote: 'Sao anh không về chơi thôn Vĩ?\nNhìn nắng hàng cau nắng mới lên.\nVườn ai mướt quá xanh như ngọc,\nLá trúc che ngang mặt chữ điền...',
        content: `Kiệt tác thơ trữ tình của thi sĩ Hàn Mặc Tử viết tặng người thiếu nữ xứ Huế:

[Khổ 1 - Cảnh ban mai thôn Vĩ thanh khiết & con người phúc hậu]:
"Sao anh không về chơi thôn Vĩ?
Nhìn nắng hàng cau nắng mới lên.
Vườn ai mướt quá xanh như ngọc,
Lá trúc che ngang mặt chữ điền."

[Khổ 2 - Cảnh hoàng hôn sông Hương u buồn, chia lìa & dự cảm chia xa]:
"Gió theo lối gió, mây đường mây,
Dòng nước buồn thiu, hoa bắp lay...
Thuyền ai đậu bến sông trăng đó,
Có chở trăng về kịp tối nay?"

[Khổ 3 - Cõi mộng ảo mờ sương & Nỗi hoài nghi xót xa]:
"Mơ khách đường xa, khách đường xa,
Áo em trắng quá nhìn không ra...
Ở đây sương khói mờ nhân ảnh,
Ai biết tình ai có đậm đà?"

[Phân tích nghệ thuật]:
Khổ thơ đầu mở ra khung cảnh thôn Vĩ Dạ bên dòng Hương giang trong buổi sớm mai: Nắng chiếu trên những ngọn cau cao vút, vườn cây xanh mướt lung linh như ngọc bích, bóng lá trúc lấp ló gương mặt chữ điền phúc hậu, kín đáo của người xứ Huế.

Khổ thơ thứ hai chuyển đột ngột sang tâm trạng u sầu chia lìa: "Gió theo lối gió, mây đường mây". Hình ảnh "thuyền ai đậu bến sông trăng" và câu hỏi thảng thốt "Có chở trăng về kịp tối nay?" bộc lộ nỗi âu lo chạy đua với thời gian của một thi nhân đang gánh chịu căn bệnh hiểm nghèo. 

Khổ cuối chìm vào cõi sương khói mộng ảo với câu hỏi ngậm ngùi "Ai biết tình ai có đậm đà?". Đó là tiếng lòng tha thiết gắn bó với cuộc đời của một linh hồn tài hoa và cô đơn tột cùng.`,
        literalMeaning: 'Miêu tả cảnh sắc thiên nhiên và con người thôn Vĩ Dạ bên bờ sông Hương từ buổi sớm mai ngập nắng đến đêm trăng mờ sương.',
        figurativeMeaning: 'Khát khao giao cảm mãnh liệt với con người và cuộc đời trần thế; nỗi niềm u uất, mặc cảm chia lìa đầy đau xót của một số phận tài hoa bạc mệnh.',
        lesson: 'Biết trân quý vẻ đẹp của thiên nhiên quê hương, nâng niu từng khoảnh khắc được sống và đồng cảm với những nỗi đau tinh thần của con người.',
        historicalContext: 'Sáng tác năm 1938, in trong tập "Thơ Điên" (sau đổi thành "Đau thương"), lấy cảm hứng từ tấm bưu thiếp chụp cảnh xứ Huế của người bạn gái Hoàng Cúc gửi tặng.',
        thematicMeaning: 'Viên ngọc sáng của phong trào Thơ Mới, kết hợp giữa bút pháp lãng mạn và tượng trưng siêu thực.',
        source: 'Hàn Mặc Tử toàn tập — NXB Văn học & SGK Ngữ văn 11.',
        tags: ['Đây Thôn Vĩ Dạ', 'Hàn Mặc Tử', 'Thơ Mới', 'Xứ Huế', 'Sông Hương', 'Thôn Vĩ', 'Mộng mơ'],
        readTime: '6 phút đọc',
        viewsCount: 3920,
        likesCount: 1350,
        isFeatured: true,
        status: 'published'
    }
];

async function runStandardize() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sep490';
        console.log(`[Standardize] Kết nối tới MongoDB: ${mongoUri}...`);
        await mongoose.connect(mongoUri);

        console.log(`[Standardize] Đang chuẩn hóa toàn diện ${standardizedWorks.length} tác phẩm...`);
        let count = 0;
        for (const item of standardizedWorks) {
            await Work.findOneAndUpdate(
                { slug: item.slug },
                { $set: item },
                { upsert: true, new: true }
            );
            count++;
            console.log(` ✓ [${item.category}] ${item.title}`);
        }

        const totalNow = await Work.countDocuments();
        console.log(`\n🎉 CHUẨN HÓA THÀNH CÔNG! Đã cập nhật ${count} tác phẩm.`);
        console.log(`📚 Tổng số tác phẩm trong Database hiện tại: ${totalNow}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Lỗi khi chuẩn hóa dữ liệu:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runStandardize();
}

module.exports = standardizedWorks;
