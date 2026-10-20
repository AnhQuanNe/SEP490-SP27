require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Work = require('../models/Work');

const additionalWorks = [
    // ==========================================
    // 1. CA DAO DÂN GIAN NỔI TIẾNG
    // ==========================================
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
        quote: 'Tháp Mười đẹp nhất bông sen / Việt Nam đẹp nhất có tên Bác Hồ.',
        content: `Hoa sen ở Đồng Tháp Mười vươn lên từ bùn lầy đồng nước mênh mông nhưng tỏa ngát hương thơm tinh khiết, thanh cao. 
Cũng như vậy, tên tuổi và cuộc đời của Chủ tịch Hồ Chí Minh là kết tinh trọn vẹn những phẩm chất cao quý nhất của con người Việt Nam: giản dị, kiên cường, trọn đời vì nước vì dân.`,
        literalMeaning: 'Vùng Tháp Mười nổi tiếng nhất với vẻ đẹp thuần khiết của hoa sen; đất nước Việt Nam tự hào và đẹp đẽ nhất khi gắn liền với tên tuổi Bác Hồ.',
        figurativeMeaning: 'Ca ngợi vị cha già kính yêu của dân tộc — người đã cống hiến trọn đời cho độc lập tự do và trở thành biểu tượng tinh thần bất diệt của Việt Nam.',
        lesson: 'Giáo dục lòng yêu nước, niềm tự hào dân tộc và lòng biết ơn sâu sắc đối với công lao trời biển của Bác Hồ.',
        historicalContext: 'Sáng tác trong thời kỳ kháng chiến chống Pháp tại chiến khu Đồng Tháp Mười, nhanh chóng đi sâu vào lòng dân và trở thành câu ca dao truyền miệng của nhân dân Nam Bộ.',
        thematicMeaning: 'Sự hòa quyện tuyệt đẹp giữa vẻ đẹp thiên nhiên đất nước và cốt cách vĩ đại của lãnh tụ.',
        source: 'Ca dao — Dân ca Nam Bộ — NXB Khoa học Xã hội.',
        tags: ['Tháp Mười', 'Hoa sen', 'Bác Hồ', 'Ca dao', 'Nam Bộ', 'Tự hào dân tộc'],
        readTime: '3 phút đọc',
        viewsCount: 3120,
        likesCount: 980,
        isFeatured: true,
        status: 'published',
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
        quote: 'Gió đưa cành trúc la đà / Tiếng chuông Trấn Vũ, canh gà Thọ Xương / Mịt mù khói tỏa ngàn sương / Nhịp chày Yên Thái, mặt gương Tây Hồ.',
        content: `Cảnh sắc hồ Tây buổi sớm mai mờ sương hiện lên tĩnh lặng và cổ kính. Gió sớm lay nhẹ cành trúc mảnh mai, tiếng chuông đồng từ đền Quán Thánh (Trấn Vũ) ngân vang trầm bổng hòa cùng tiếng gà gáy báo canh của phường Thọ Xương. 
Xa xa, khói sương giăng mắc mịt mùng trên mặt nước Hồ Tây như tấm gương khổng lồ soi bóng trời mây, điểm xuyết nhịp chày giã vỏ cây dó làm giấy của làng nghề Yên Thái vang vọng nhịp sống thanh bình ngàn năm văn hiến.`,
        literalMeaning: 'Miêu tả âm thanh và hình ảnh sinh hoạt bình dị, thơ mộng của đất kinh kỳ Thăng Long trong buổi sớm mai mù sương.',
        figurativeMeaning: 'Gợi mở vẻ đẹp trầm mặc, tao nhã, đậm đà bản sắc văn hóa ngàn năm của đất kinh đô Hà Nội.',
        lesson: 'Bồi đắp tình yêu di sản văn hóa, lòng tự hào về cảnh sắc và lịch sử ngàn năm văn vật của Thủ đô.',
        historicalContext: 'Lưu truyền từ thời Lê - Trịnh đến thời Nguyễn, gắn bó mật thiết với các địa danh lịch sử ven bờ Hồ Tây như đền Trấn Vũ, phường Thọ Xương, làng giấy Yên Thái.',
        thematicMeaning: 'Cốt cách thanh lịch, tao nhã và vẻ đẹp linh thiêng của chốn kinh kỳ xưa.',
        source: 'Hà Nội trong ca dao ngạn ngữ — GS. Doãn Kế Thiện, NXB Hà Nội.',
        tags: ['Gió đưa cành trúc', 'Thăng Long', 'Hà Nội', 'Hồ Tây', 'Ca dao Bắc Bộ', 'Văn hiến'],
        readTime: '4 phút đọc',
        viewsCount: 2950,
        likesCount: 890,
        isFeatured: true,
        status: 'published',
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
        quote: 'Đường vô xứ Nghệ quanh quanh / Non xanh nước biếc như tranh họa đồ / Ai vô xứ Nghệ thì vô / Bõ công non nước đền bù nghĩa ân.',
        content: `Vùng đất Nghệ An - Hà Tĩnh được thiên nhiên ban tặng địa hình hiểm trở mà nên thơ: núi non trùng điệp, sông Lam xanh mát uốn lượn như dải lụa. 
Cảnh sắc hữu tình như bức tranh sơn thủy thu nhỏ, chào đón những người con và du khách bốn phương đến để chiêm nghiệm vẻ đẹp giang sơn và cái tình nồng hậu, thủy chung của người dân xứ Nghệ.`,
        literalMeaning: 'Đường vào xứ Nghệ quanh co qua nhiều đèo núi nhưng phong cảnh sơn thủy hữu tình, tươi đẹp như tranh vẽ.',
        figurativeMeaning: 'Khẳng định tình yêu tha thiết với quê hương và lời mời gọi chân thành, tự hào về vùng đất giàu truyền thống hiếu học, kiên trung.',
        lesson: 'Giáo dục lòng tự hào về non sông gấm vóc và sự trân trọng tình cảm mộc mạc, thủy chung của con người miền Trung.',
        historicalContext: 'Lưu truyền từ các thế kỷ trước dọc con đường thiên lý Bắc - Nam qua đèo Ngang và lưu vực sông Lam.',
        thematicMeaning: 'Bản sắc văn hóa xứ Nghệ: phong cảnh kỳ vĩ gắn liền với con người bền gan, giàu lòng trượng nghĩa.',
        source: 'Kho tàng Dân ca Xứ Nghệ — Viện Văn hóa Dân gian.',
        tags: ['Xứ Nghệ', 'Sông Lam', 'Núi Hồng', 'Ca dao', 'Miền Trung', 'Quê hương'],
        readTime: '3 phút đọc',
        viewsCount: 2680,
        likesCount: 780,
        isFeatured: true,
        status: 'published',
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
        quote: 'Cày đồng đang buổi ban trưa / Mồ hôi thánh thót như mưa ruộng cày / Ai ơi bưng bát cơm đầy / Dẻo thơm một hạt, đắng cay muôn phần!',
        content: `Giữa trưa hè nắng như thiêu như đốt, người nông dân cùng con trâu vẫn cặm cụi cày xới trên đồng ruộng khô cằn. Những giọt mồ hôi mặn chát rơi lã chã xuống từng luống đất cày như những giọt mưa. 
Mỗi hạt cơm trắng ngần, dẻo thơm trên mâm cơm hàng ngày là sự kết tinh của bao nỗi nhọc nhằn, cơ cực, \"một nắng hai sương\" của bàn tay lao động.`,
        literalMeaning: 'Công việc cày ruộng giữa ban trưa nắng gắt vô cùng nặng nhọc, mồ hôi túa ra thấm đẫm luống cày để làm nên hạt thóc dẻo thơm.',
        figurativeMeaning: 'Nhắc nhở con người phải biết trân trọng giá trị sức lao động, lòng biết ơn với người làm ra của cải vật chất cho xã hội.',
        lesson: 'Sống tiết kiệm, không lãng phí thức ăn, luôn đồng cảm và kính trọng những người lao động chân lấm tay bùn.',
        historicalContext: 'Đúc kết từ nền văn minh lúa nước ngàn đời của dân tộc Việt Nam.',
        thematicMeaning: 'Khúc ca ngợi ca phẩm chất cần cù, nhẫn nại và sự hy sinh thầm lặng của giai cấp nông dân.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Cày đồng', 'Hạt gạo', 'Mồ hôi', 'Ca dao', 'Nông dân', 'Biết ơn'],
        readTime: '3 phút đọc',
        viewsCount: 2890,
        likesCount: 860,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Anh đi anh nhớ quê nhà',
        slug: 'anh-di-anh-nho-que-nha',
        category: 'ca-dao',
        categoryName: 'Ca dao Tình nghĩa & Quê hương',
        period: 'Văn học Dân gian',
        region: 'Bắc Bộ',
        author: 'Dân gian',
        topic: 'Nỗi nhớ quê hương & Tình người bình dị',
        summary: 'Tiếng lòng tha thiết của người con xa xứ: nhớ từng món ăn dân dã (canh rau muống, cà dầm tương) và nhớ bóng dáng người thương cần mẫn tát nước bên đường.',
        quote: 'Anh đi anh nhớ quê nhà / Nhớ canh rau muống, nhớ cà dầm tương / Nhớ ai dãi nắng dầm sương / Nhớ ai tát nước bên đường hôm nao.',
        content: `Hành trang trong tâm khảm của người đi xa không phải lầu son gác tía mà là những nét sinh hoạt mộc mạc nhất của làng quê: bát canh rau muống luộc dầm sấu, quả cà pháo dầm tương giòn tan. 
Và lắng đọng sâu kín nhất là hình bóng người thương dãi dầu mưa nắng, tảo tần lao động tát gàu nước bên mương tưới mát đồng lúa quê nhà.`,
        literalMeaning: 'Người đi xa nhớ về những món ăn quen thuộc nơi quê cha đất tổ và nhớ người con gái quê lam lũ, chịu khó.',
        figurativeMeaning: 'Tình yêu quê hương bắt đầu từ những điều dung dị, chân phương nhất; tình cảm lứa đôi thủy chung gắn liền với hồn quê sâu đậm.',
        lesson: 'Giữ gìn cội nguồn, luôn hướng về quê cha đất tổ dù đi bốn phương trời.',
        historicalContext: 'Lưu truyền qua nhiều thế kỷ trong tâm thức của những lứa trai làng lên đường tòng quân hoặc đi làm ăn xa xứ.',
        thematicMeaning: 'Chân dung làng quê Việt Nam thanh bình và vẻ đẹp thủy chung, nhân hậu của con người quê kiểng.',
        source: 'Ca dao Dân ca Việt Nam — NXB Giáo Dục.',
        tags: ['Nhớ quê nhà', 'Canh rau muống', 'Cà dầm tương', 'Tát nước', 'Ca dao tình yêu'],
        readTime: '3 phút đọc',
        viewsCount: 2740,
        likesCount: 820,
        isFeatured: true,
        status: 'published',
    },

    // ==========================================
    // 2. TỤC NGỮ DÂN GIAN ĐÚC KẾT SÂU SẮC
    // ==========================================
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
        content: `Bản thân ta biết đau khi gặp hoạn nạn, biết khổ khi thiếu thốn, biết mừng khi được che chở; thì người khác cũng có cảm xúc y như vậy. 
Câu tục ngữ ngắn gọn đúc kết đạo lý sống nhân bản tuyệt đỉnh của người Việt: Đặt mình vào hoàn cảnh của đồng loại để thấu cảm, bao dung và sẻ chia.`,
        literalMeaning: 'Yêu thương người khác giống như yêu quý và chăm sóc chính thân thể, cuộc sống của bản thân mình.',
        figurativeMeaning: 'Lòng trắc ẩn và tinh thần bác ái: Coi nỗi đau của người khác như nỗi đau của chính mình để sẵn sàng chìa tay giúp đỡ.',
        lesson: 'Sống vị tha, không ích kỷ hẹp hòi, luôn tương trợ đồng bào khi hoạn nạn, cơ nhỡ.',
        historicalContext: 'Là kim chỉ nam đạo đức được giáo dục trong mọi gia đình, dòng họ người Việt từ thuở ấu thơ.',
        thematicMeaning: 'Cốt lõi của chủ nghĩa nhân đạo truyền thống Việt Nam.',
        source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân.',
        tags: ['Thương người như thể thương thân', 'Tục ngữ', 'Nhân ái', 'Bác ái', 'Đạo lý'],
        readTime: '3 phút đọc',
        viewsCount: 2610,
        likesCount: 790,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Gần mực thì đen, gần đèn thì rạng',
        slug: 'gan-muc-thi-den-gan-den-thi-rang',
        category: 'tuc-ngu',
        categoryName: 'Tục ngữ Việt Nam',
        period: 'Văn học Dân gian',
        region: 'Toàn quốc',
        author: 'Dân gian',
        topic: 'Môi trường sống & Rèn luyện nhân cách',
        summary: 'Quy luật về ảnh hưởng của môi trường sống: Gần gũi kẻ xấu dễ bị tha hóa, tiếp xúc với bậc hiền tài thì trí tuệ và đạo đức được mở mang, soi sáng.',
        quote: 'Gần mực thì đen, gần đèn thì rạng.',
        content: `\"Mực\" đen tượng trưng cho những thói hư tật xấu, môi trường tiêu cực. Tiếp xúc lâu ngày với mực sẽ dễ bị vấy bẩn.\n\"Đèn\" là nguồn ánh sáng, tượng trưng cho tri thức, sự văn minh, điều thiện và những người tử tế. Đứng gần đèn thì bóng tối bị xua tan, tâm hồn được soi tỏ.`,
        literalMeaning: 'Ở gần thỏi mực nho thì dễ dính đen bẩn; ở gần ngọn đèn dầu thì được chiếu sáng rõ ràng.',
        figurativeMeaning: 'Môi trường xã hội và những người bạn ta kết giao có tác động quyết định đến nhân cách và tương lai của mỗi cá nhân.',
        lesson: 'Biết chọn bạn mà chơi, chọn môi trường lành mạnh để học tập và rèn luyện; tránh xa cám dỗ và tệ nạn xã hội.',
        historicalContext: 'Đúc kết từ việc học chữ Nho của các sĩ tử xưa mài mực đọc sách dưới ánh đèn dầu.',
        thematicMeaning: 'Bài học triết lý sâu sắc về giáo dục gia đình và tự rèn luyện bản lĩnh cá nhân.',
        source: 'Kho tàng Tục ngữ người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Gần mực thì đen', 'Gần đèn thì rạng', 'Tục ngữ', 'Giáo dục', 'Nhân cách'],
        readTime: '3 phút đọc',
        viewsCount: 2480,
        likesCount: 750,
        isFeatured: true,
        status: 'published',
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
        summary: 'Nghệ thuật giao tiếp tinh tế của người Việt: Ngôn từ là của cải miễn phí nhưng lại có sức mạnh kết nối hoặc hủy diệt, do đó phải cẩn trọng suy nghĩ trước khi phát ngôn.',
        quote: 'Lời nói chẳng mất tiền mua / Lựa lời mà nói cho vừa lòng nhau.',
        content: `Lời nói phát ra từ miệng không đòi hỏi chi phí bạc tiền nhưng lại phản chiếu toàn bộ phông văn hóa, trí tuệ và tấm lòng của người nói. 
\"Cho vừa lòng nhau\" không phải là a dua, tâng bốc dối trá, mà là thái độ lịch thiệp, hòa nhã, tôn trọng người nghe để giữ hòa khí và đạt hiệu quả giao tiếp tốt nhất.`,
        literalMeaning: 'Việc nói chuyện không phải bỏ tiền ra để mua, vì vậy hãy suy nghĩ và chọn lời lẽ khéo léo để người nghe cảm thấy dễ chịu, hài lòng.',
        figurativeMeaning: 'Khuyên răn con người phải thận trọng, lịch sự, tôn trọng đối phương trong ngôn từ và cách ứng xử hàng ngày.',
        lesson: 'Uốn lưỡi bảy lần trước khi nói, tránh lời cay độc gây tổn thương người khác.',
        historicalContext: 'Được lưu truyền rộng rãi trong nếp sống văn minh làng xã truyền thống.',
        thematicMeaning: 'Văn hóa giao tiếp lịch thiệp, hòa hiếu và giàu tính nhân văn của dân tộc.',
        source: 'Từ điển Thành ngữ và Tục ngữ Việt Nam — GS. Nguyễn Lân.',
        tags: ['Lời nói chẳng mất tiền mua', 'Tục ngữ', 'Giao tiếp', 'Ứng xử', 'Văn hóa'],
        readTime: '3 phút đọc',
        viewsCount: 2390,
        likesCount: 710,
        isFeatured: false,
        status: 'published',
    },

    // ==========================================
    // 3. NHỮNG BÀI THƠ KIỆT TÁC KINH ĐIỂN VIỆT NAM
    // ==========================================
    {
        title: 'Qua Đèo Ngang',
        slug: 'qua-deo-ngang',
        category: 'trung-dai',
        categoryName: 'Thơ Đường luật thất ngôn bát cú',
        period: 'Văn học Trung đại (Thế kỷ XIX)',
        region: 'Đèo Ngang (Ranh giới Quảng Bình & Hà Tĩnh)',
        author: 'Bà Huyện Thanh Quan',
        topic: 'Nỗi buồn hoài cổ & Lòng yêu nước',
        summary: 'Kiệt tác thơ Đường luật mẫu mực nhất nền thi ca Việt Nam, khắc họa cảnh hoàng hôn hoang vắng nơi Đèo Ngang và nỗi cô đơn hoài cổ da diết của người lữ khách trước thế sự.',
        quote: 'Bước tới Đèo Ngang, bóng xế tà / Cỏ cây chen đá, lá chen hoa / Lom khom dưới núi, tiều vài chú / Lác đác bên sông, chợ mấy nhà...',
        content: `Bước tới Đèo Ngang, bóng xế tà,
Cỏ cây chen đá, lá chen hoa.
Lom khom dưới núi, tiều vài chú,
Lác đác bên sông, chợ mấy nhà.
Nhớ nước đau lòng, con quốc quốc,
Thương nhà mỏi miệng, cái gia gia.
Dừng chân đứng lại, trời, non, nước,
Một mảnh tình riêng, ta với ta.

Bài thơ được sáng tác khi nữ sĩ trên đường từ Bắc Hà vào kinh đô Huế nhận chức Cung Trung Giáo Tập. Đứng trên đỉnh đèo Ngang lúc chiều tà, đối diện với cảnh non nước bao la hoang vắng, tiếng chim đa đa và chim cuốc gọi hoàng hôn khắc khoải làm trỗi dậy nỗi niềm hoài cổ thương nhớ triều đại cũ và nỗi cô đơn mênh mông của kiếp người.`,
        literalMeaning: 'Cảnh tượng thiên nhiên hoang sơ, heo hút ở đỉnh Đèo Ngang lúc xế chiều với vài tiều phu đốn củi và mấy nóc nhà thưa thớt.',
        figurativeMeaning: 'Nỗi niềm u uẩn hoài niệm về quá khứ vàng son của Thăng Long, nỗi buồn ly hương và tấm lòng yêu nước thầm kín của nữ sĩ.',
        lesson: 'Cảm nhận chiều sâu của ngôn ngữ thơ Đường luật Việt Nam và tình cảm sâu lắng với quê hương đất nước.',
        historicalContext: 'Sáng tác vào thời nhà Nguyễn đầu thế kỷ XIX khi triều đình dời đô từ Thăng Long vào Phú Xuân (Huế).',
        thematicMeaning: 'Nỗi sầu nhân thế hoài cổ, vẻ đẹp trang nhã cổ điển và đỉnh cao nghệ thuật chơi chữ, đối xứng trong thơ Đường.',
        source: 'Hợp tuyển Thơ văn Việt Nam thế kỷ XIX — NXB Văn học.',
        tags: ['Qua Đèo Ngang', 'Bà Huyện Thanh Quan', 'Thất ngôn bát cú', 'Đường luật', 'Hoài cổ'],
        readTime: '6 phút đọc',
        viewsCount: 3820,
        likesCount: 1290,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Thu Điếu (Câu cá mùa thu)',
        slug: 'thu-dieu',
        category: 'trung-dai',
        categoryName: 'Thơ chữ Nôm - Chùm thơ Thu',
        period: 'Văn học Trung đại (Cuối thế kỷ XIX)',
        region: 'Bình Lục (Hà Nam)',
        author: 'Tam nguyên Yên Đổ Nguyễn Khuyến',
        topic: 'Mùa thu làng cảnh Việt Nam & Tâm sự yêu nước thầm kín',
        summary: 'Bài thơ thu hay nhất trong thi ca Việt Nam, mở ra không gian mùa thu thanh sơ, tĩnh lặng tuyệt đối nơi đồng bằng Bắc Bộ và nỗi u hoài non nước của bậc danh nho.',
        quote: 'Ao thu lạnh lẽo nước trong veo / Một chiếc thuyền câu bé tẻo teo / Sóng biếc theo làn hơi gợn tí / Lá vàng trước gió khẽ đưa vèo...',
        content: `Ao thu lạnh lẽo nước trong veo,
Một chiếc thuyền câu bé tẻo teo.
Sóng biếc theo làn hơi gợn tí,
Lá vàng trước gió khẽ đưa vèo.
Tầng mây lơ lửng trời xanh ngắt,
Ngõ trúc quanh co khách vắng teo.
Tựa gối ôm cần lâu chẳng được,
Cá đâu đớp động dưới chân bèo.

Thu Điếu nằm trong chùm ba bài thơ thu nức tiếng của Nguyễn Khuyến. Cảnh thu hiện lên với gam màu thanh đạm: mặt nước ao thu trong veo, ngọn gió heo may se lạnh, lá vàng rụng khẽ khàng và bầu trời thu xanh ngắt mênh mông. Cái tĩnh lặng của bức tranh chỉ bị đánh động bởi tiếng cá đớp mồi mơ hồ, phản chiếu tâm trạng u uẩn, bất lực của nhà nho yêu nước trước cảnh nước mất nhà tan.`,
        literalMeaning: 'Bức tranh cảnh sắc một buổi câu cá mùa thu nơi làng quê Bắc Bộ tĩnh mịch, trong trẻo.',
        figurativeMeaning: 'Tâm sự u uẩn, đau xót của bậc trí thức thanh cao cáo quan về quê ẩn dật, luôn đau đáu nỗi niềm vận mệnh non sông.',
        lesson: 'Tình yêu gắn bó máu thịt với thiên nhiên làng quê và nhân cách thanh cao, khinh ghét danh lợi hèn mọn.',
        historicalContext: 'Được sáng tác khi Nguyễn Khuyến từ quan về ẩn cư tại quê nhà làng Vị Hạ (Ý Yên, Nam Định / Hà Nam) sau khi thực dân Pháp đánh chiếm Bắc Kỳ.',
        thematicMeaning: 'Tuyệt tác thơ Nôm tả cảnh ngụ tình, điển hình cho vẻ đẹp tâm hồn thuần Việt.',
        source: 'Nguyễn Khuyến tác phẩm — NXB Văn học.',
        tags: ['Thu Điếu', 'Nguyễn Khuyến', 'Câu cá mùa thu', 'Thơ Nôm', 'Làng quê Bắc Bộ'],
        readTime: '5 phút đọc',
        viewsCount: 3670,
        likesCount: 1150,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Đây Thôn Vĩ Dạ',
        slug: 'day-thon-vi-da',
        category: 'hien-dai',
        categoryName: 'Phong trào Thơ Mới (1932 - 1945)',
        period: 'Văn học Hiện đại (Năm 1938)',
        region: 'Thôn Vĩ Dạ (Cố đô Huế)',
        author: 'Hàn Mặc Tử',
        topic: 'Tình yêu cuộc sống thiết tha & Nỗi mặc cảm chia lìa',
        summary: 'Bản tình ca da diết, mộng ảo xứ Huế: Vườn Vĩ Dạ xanh mướt như ngọc, dòng sông Hương trăng ngập tràn và nỗi khát khao giao cảm với cuộc đời trần thế của thi sĩ tài hoa đoản mệnh.',
        quote: 'Sao anh không về chơi thôn Vĩ? / Nhìn nắng hàng cau nắng mới lên / Vườn ai mướt quá xanh như ngọc / Lá trúc che ngang mặt chữ điền...',
        content: `Sao anh không về chơi thôn Vĩ?
Nhìn nắng hàng cau nắng mới lên.
Vườn ai mướt quá, xanh như ngọc,
Lá trúc che ngang mặt chữ điền.

Gió theo lối gió, mây đường mây,
Dòng nước buồn thiu, hoa bắp lay...
Thuyền ai đậu bến sông trăng đó,
Có chở trăng về kịp tối nay?

Mơ khách đường xa, khách đường xa,
Áo em trắng quá nhìn không ra...
Ở đây sương khói mờ nhân ảnh,
Ai biết tình ai có đậm đà?

Bài thơ lấy cảm hứng từ bức bưu ảnh phong cảnh Huế của Hoàng Cúc gửi tặng Hàn Mặc Tử khi ông đang lâm bệnh nặng tại trại phong Quy Hòa. Ba khổ thơ là ba trạng thái cảm xúc: từ bức tranh thôn Vĩ ban mai tinh khôi, sang dòng sông Hương đêm trăng huyền ảo chia lìa, và khép lại trong cõi mộng sương khói mịt mờ với câu hỏi hoài nghi mà khát khao tình người đến cháy bỏng.`,
        literalMeaning: 'Cảnh sắc miệt vườn thôn Vĩ Dạ bên bờ sông Hương xứ Huế lúc ban mai và đêm trăng huyền ảo.',
        figurativeMeaning: 'Khát vọng sống, khát khao tình yêu và nỗi buồn chia phôi đau đớn của một tâm hồn thi nhân trước ngưỡng cửa định mệnh.',
        lesson: 'Trân trọng vẻ đẹp từng khoảnh khắc của sự sống và tấm lòng nhân ái, ấm áp giữa con người.',
        historicalContext: 'Được in trong tập \"Thơ Điên\" (sau đổi thành \"Hương thơm\"), sáng tác năm 1938 tại Quy Nhơn.',
        thematicMeaning: 'Đỉnh cao của thơ ca lãng mạn Việt Nam thế kỷ XX, hòa quyện giữa vẻ đẹp đài các xứ Huế và bi kịch cá nhân thi sĩ.',
        source: 'Hàn Mặc Tử toàn tập — NXB Văn học.',
        tags: ['Đây Thôn Vĩ Dạ', 'Hàn Mặc Tử', 'Thơ Mới', 'Xứ Huế', 'Sông Hương'],
        readTime: '6 phút đọc',
        viewsCount: 3950,
        likesCount: 1380,
        isFeatured: true,
        status: 'published',
    },
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
        quote: 'Sông Mã xa rồi Tây Tiến ơi! / Nhớ về rừng núi, nhớ chơi vơi / Sài Khao sương lấp đoàn quân mỏi / Mường Lát hoa về trong đêm hơi...',
        content: `Sông Mã xa rồi Tây Tiến ơi!
Nhớ về rừng núi, nhớ chơi vơi.
Sài Khao sương lấp đoàn quân mỏi,
Mường Lát hoa về trong đêm hơi.

Dốc lên khúc khuỷu dốc thăm thẳm,
Heo hút cồn mây, súng ngửi trời.
Ngàn thước lên cao, ngàn thước xuống,
Nhà ai Pha Luông mưa xa khơi...

Tây Tiến đoàn binh không mọc tóc,
Quân xanh màu lá dữ oai hùm.
Mắt trừng gửi mộng qua biên giới,
Đêm mơ Hà Nội dáng kiều thơm.

Rải rác biên cương mồ viễn xứ,
Chiến trường đi chẳng tiếc đời xanh.
Áo bào thay chiếu, anh về đất,
Sông Mã gầm lên khúc độc hành!

Bằng bút pháp lãng mạn kết hợp cảm hứng bi tráng, Quang Dũng đã dựng nên bức tượng đài bất tử về người lính Tây Tiến — phần lớn là những thanh niên trí thức Hà thành gác bút nghiên lên đường cứu quốc, hiên ngang vượt qua sốt rét rừng, dốc cao vực sâu, ngã xuống nơi biên cương vì độc lập tự do của Tổ quốc.`,
        literalMeaning: 'Tái hiện chặng đường hành quân gian khổ của trung đoàn Tây Tiến qua vùng rừng núi hiểm trở miền Tây Bắc và Thượng Lào năm 1947 - 1948.',
        figurativeMeaning: 'Khúc ca ngợi ca vẻ đẹp hào hùng, bi tráng, tinh thần xả thân vô tư của thế hệ trẻ Việt Nam trong kháng chiến vệ quốc.',
        lesson: 'Lòng biết ơn sâu sắc đối với các anh hùng liệt sĩ đã hy sinh xương máu cho nền độc lập dân tộc.',
        historicalContext: 'Sáng tác tại làng Phù Lưu Chanh năm 1948 khi Quang Dũng rời đơn vị Tây Tiến chuyển sang đơn vị khác.',
        thematicMeaning: 'Đỉnh cao của thi ca cách mạng Việt Nam, kết hợp tinh hoa thi họa và âm nhạc.',
        source: 'Mây đầu ô — Tuyển tập thơ Quang Dũng, NXB Văn học.',
        tags: ['Tây Tiến', 'Quang Dũng', 'Kháng chiến chống Pháp', 'Sông Mã', 'Người lính'],
        readTime: '8 phút đọc',
        viewsCount: 4210,
        likesCount: 1540,
        isFeatured: true,
        status: 'published',
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
        summary: 'Bức tượng đài bằng thơ về người lính nông dân áo vải thời kỳ đầu kháng chiến chống Pháp: gắn bó bằng lý tưởng chung, sẻ chia gian khổ và hình ảnh biểu tượng kỳ vĩ \"Đầu súng trăng treo\".',
        quote: 'Quê hương anh nước mặn, đồng chua / Làng tôi nghèo đất cày lên sỏi đá / Anh với tôi đôi người xa lạ / Tự phương trời chẳng hẹn quen nhau...',
        content: `Quê hương anh nước mặn, đồng chua
Làng tôi nghèo đất cày lên sỏi đá.
Anh với tôi đôi người xa lạ
Tự phương trời chẳng hẹn quen nhau,
Súng bên súng, đầu sát bên đầu,
Đêm rét chung chăn thành đôi tri kỷ.
Đồng chí!

Ruộng nương anh gửi bạn thân cày,
Gian nhà không, mặc kệ gió lung lay,
Giếng nước gốc đa nhớ người ra lính.
Anh với tôi biết từng cơn ớn lạnh,
Sốt run người vầng trán ướt mồ hôi.
Áo anh rách vai,
Quần tôi có vài mảnh vá,
Miệng cười buốt giá,
Chân không giày.
Thương nhau tay nắm lấy bàn tay.

Đêm nay rừng hoang sương muối,
Đứng cạnh bên nhau chờ giặc tới,
Đầu súng trăng treo.

Bài thơ thể hiện tình đồng chí keo sơn của những người lính xuất thân từ nông dân cùng chung lý tưởng giải phóng dân tộc. Hình ảnh kết thúc \"Đầu súng trăng treo\" là một phát hiện thơ ca xuất thần, hòa quyện giữa hiện thực khốc liệt của chiến tranh và chất lãng mạn hòa bình của tâm hồn người chiến sĩ.`,
        literalMeaning: 'Cuộc gặp gỡ, gắn bó và cùng nhau vượt qua cái lạnh, bệnh sốt rét, thiếu thốn quân trang của những người lính vệ quốc đoàn.',
        figurativeMeaning: 'Tình cảm giai cấp, tình đồng đội cao cả — cội nguồn sức mạnh làm nên chiến thắng của quân đội nhân dân Việt Nam.',
        lesson: 'Tôn vinh giá trị của tình bạn, sự sẻ chia, đoàn kết cùng chung một chí hướng vượt qua mọi thử thách cuộc đời.',
        historicalContext: 'Sáng tác đầu năm 1948 sau chiến dịch Việt Bắc Thu - Đông 1947 thắng lợi vang dội.',
        thematicMeaning: 'Khúc ca chân thực, mộc mạc và sâu sắc nhất về vẻ đẹp tâm hồn người lính thời đại Hồ Chí Minh.',
        source: 'Đầu súng trăng treo — Tuyển tập thơ Chính Hữu, NXB Văn học.',
        tags: ['Đồng Chí', 'Chính Hữu', 'Người lính', 'Đầu súng trăng treo', 'Kháng chiến'],
        readTime: '6 phút đọc',
        viewsCount: 3780,
        likesCount: 1210,
        isFeatured: true,
        status: 'published',
    }
];

async function runSeed() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sep490';
        console.log(`[SeedAdditionalWorks] Đang kết nối tới MongoDB: ${mongoUri}...`);
        await mongoose.connect(mongoUri);

        console.log(`[SeedAdditionalWorks] Đang nạp ${additionalWorks.length} tác phẩm ca dao, tục ngữ & thơ ca nổi tiếng...`);
        let count = 0;
        for (const item of additionalWorks) {
            await Work.findOneAndUpdate(
                { slug: item.slug },
                { $set: item },
                { upsert: true, new: true }
            );
            count++;
            console.log(` ✓ [${item.categoryName}] ${item.title}`);
        }

        const totalNow = await Work.countDocuments();
        console.log(`\n🎉 NẠP THÀNH CÔNG! Đã cập nhật ${count} tác phẩm.`);
        console.log(`📚 Tổng số tác phẩm trong Database hiện tại: ${totalNow}`);

        process.exit(0);
    } catch (err) {
        console.error('Lỗi khi nạp dữ liệu:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runSeed();
}

module.exports = additionalWorks;
