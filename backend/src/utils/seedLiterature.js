require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Work = require('../models/Work');

const sampleWorks = [
    {
        title: 'Thạch Sanh',
        slug: 'thach-sanh',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích thần kỳ',
        period: 'Văn học Dân gian',
        region: 'Đồng bằng Bắc Bộ',
        author: 'Dân gian',
        summary: 'Câu chuyện ca ngợi lòng dũng cảm, sự chân thật và khát vọng công lý hòa bình của người lao động qua hình tượng chàng dũng sĩ mồ côi diệt chằn tinh, bắn đại bàng và tiếng đàn, niêu cơm thần kỳ cảm hóa quân xâm lược.',
        quote: 'Đàn kêu ai chém chằn tinh / Cho mày vinh hiển dự mình quyền sang...',
        content: `Ngày xưa, ở quận Cao Bình có hai vợ chồng già tuổi ngoài năm mươi mà chưa có con. Thấy họ tốt bụng, Ngọc Hoàng bèn sai thái tử đầu thai làm con. Người vợ mang thai ba năm mới sinh ra một cậu bé khôi ngô, đặt tên là Thạch Sanh. 
Lớn lên, cha mẹ mất sớm, chàng sống lủi thủi dưới gốc đa, gia tài chỉ có một chiếc khố rách và một lưỡi búa của cha để lại. Thạch Sanh kết nghĩa anh em với Lý Thông, nhưng bị mẹ con Lý Thông nhiều lần lừa đi nộp mạng cho Chằn tinh và Đại bàng. Với tài năng phi thường và lòng quả cảm, chàng đã tiêu diệt yêu quái, cứu công chúa Quỳnh Nga và con vua Thủy Tề.
Bị Lý Thông hãm hại nhốt vào ngục tối, Thạch Sanh gảy đàn thần. Tiếng đàn thần vang lên giải nỗi oan khuất, vạch trần tội ác của kẻ gian xảo. Khi mười tám nước chư hầu đem quân sang đánh, Thạch Sanh mang đàn ra gảy khiến quân giặc bủn rủn tay chân, rồi dọn niêu cơm thần thết đãi, ăn mãi không bao giờ vơi. Quân giặc tâm phục khẩu phục rút về nước.`,
        historicalContext: 'Phản ánh ước mơ ngàn đời của nhân dân lao động thời kỳ chế độ phong kiến sơ khai về một xã hội công bằng, nơi cái thiện chiến thắng cái ác, và khát vọng hòa bình hữu nghị giữa các quốc gia.',
        thematicMeaning: 'Tiếng đàn thần tượng trưng cho tiếng nói của công lý và sức mạnh thức tỉnh của nghệ thuật chân chính; niêu cơm thần biểu trưng cho lòng nhân ái, sự vị tha và tiềm lực vô tận của nhân dân Việt Nam.',
        source: 'Kho tàng truyện cổ tích Việt Nam — GS. Nguyễn Đổng Chi, NXB Trẻ tái bản 2014.',
        tags: ['Thạch Sanh', 'Truyện cổ tích', 'Công lý', 'Tiếng đàn thần', 'Văn học dân gian'],
        readTime: '8 phút đọc',
        viewsCount: 1420,
        likesCount: 388,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Thánh Gióng (Phù Đổng Thiên Vương)',
        slug: 'thanh-giong',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        period: 'Văn học Dân gian',
        region: 'Hà Nội (Kinh Bắc)',
        author: 'Dân gian',
        summary: 'Biểu tượng quật cường ngàn đời của tinh thần yêu nước và sức mạnh bảo vệ non sông. Người anh hùng làng Phù Đổng vươn vai thành tráng sĩ, cưỡi ngựa sắt, nhổ tre đằng ngà quét sạch giặc Ân.',
        quote: 'Bụi tre đằng ngà rực màu chiến thắng / Bay về trời để lại tiếng thơm muôn đời sau...',
        content: `Đời Hùng Vương thứ sáu, ở làng Gióng có hai vợ chồng ông lão chăm chỉ làm ăn nhưng mãi không có con. Một hôm bà ra đồng thấy một vết chân to liền đặt chân ướm thử, về nhà thụ thai mười hai tháng sinh ra một cậu bé khôi ngô nhưng lên ba tuổi vẫn không biết nói, biết cười, đặt đâu nằm đấy.
Khi giặc Ân sang xâm lược bờ cõi, thế nước nguy ngập, vua sai sứ giả đi tìm người tài giỏi cứu nước. Nghe tiếng loa rao, chú bé bỗng cất tiếng nói xin vua rèn cho ngựa sắt, áo giáp sắt, roi sắt để đi đánh giặc. Từ hôm đó chú bé lớn nhanh như thổi, ăn bao nhiêu cơm cũng không đủ.
Khi sứ giả mang đồ sắt tới, chú bé vươn vai biến thành tráng sĩ mình cao hơn trượng, nhảy lên ngựa sắt phi thẳng ra chiến trận. Roi sắt gãy, tráng sĩ nhổ từng bụi tre ngà bên đường quất túi bụi vào quân giặc. Giặc tan, tráng sĩ cưỡi ngựa lên đỉnh núi Sóc Sơn rồi bay thẳng về trời.`,
        historicalContext: 'Hình thành từ thời kỳ dựng nước Văn Lang - Âu Lạc, gắn liền với công cuộc chống ngoại xâm phương Bắc và sự tích vùng đất Gia Lâm, Sóc Sơn (Hà Nội).',
        thematicMeaning: 'Tượng trưng cho sức mạnh quàn quật của khối đại đoàn kết toàn dân khi Tổ quốc lâm nguy; hiện thân cho lý tưởng người anh hùng vô tư, xả thân cứu nước không màng danh lợi bổng lộc.',
        source: 'Lĩnh Nam Chích Quái & Đại Việt Sử Ký Toàn Thư.',
        tags: ['Thánh Gióng', 'Truyền thuyết', 'Yêu nước', 'Hùng Vương', 'Sóc Sơn'],
        readTime: '6 phút đọc',
        viewsCount: 1890,
        likesCount: 520,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Sơn Tinh - Thủy Tinh',
        slug: 'son-tinh-thuy-tinh',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Truyền thuyết khởi nguyên',
        period: 'Văn học Dân gian',
        region: 'Núi Tản Viên (Ba Vì, Hà Nội)',
        author: 'Dân gian',
        summary: 'Bản anh hùng ca lãng mạn giải thích hiện tượng lũ lụt hàng năm ở đồng bằng châu thổ sông Hồng và tôn vinh ý chí trị thủy phi thường của tổ tiên người Việt cổ.',
        quote: 'Núi cao bao nhiêu gậy thần nâng bấy nhiêu / Nước sông dâng dâng ngập bờ, núi vẫn vững vàng chọc trời xanh...',
        content: `Hùng Vương thứ mười tám có một người con gái tên là Mỵ Nương, sắc đẹp tuyệt trần. Nhà vua muốn kén cho con một người chồng xứng đáng. Có hai chàng trai cùng đến cầu hôn một ngày: một người ở vùng núi Tản Viên là Sơn Tinh (chúa miền non cao), một người ở miền biển Đông là Thủy Tinh (chúa vùng nước thẳm). Cả hai đều có tài năng phi thường ngang ngửa nhau.
Vua bèn ra điều kiện sính lễ gồm: Một trăm ván cơm nếp, một trăm nệp bánh chưng, voi chín ngà, gà chín cựa, ngựa chín hồng mao, ai đem đến trước sẽ được rước dâu. 
Hôm sau Sơn Tinh đem đủ lễ vật đến trước và rước Mỵ Nương về núi. Thủy Tinh đến sau đùng đùng nổi giận, hô mưa gọi gió, dâng nước sông lên cuồn cuộn đánh Sơn Tinh. Sơn Tinh không hề nao núng, dùng phép bốc từng quả đồi, dời từng dãy núi dựng thành lũy ngăn dòng nước lũ. Nước dâng cao bao nhiêu, đồi núi lại cao lên bấy nhiêu. Cuối cùng Thủy Tinh kiệt sức phải rút lui. Từ đó, năm nào Thủy Tinh cũng dâng nước đánh Sơn Tinh nhưng đều thất bại.`,
        historicalContext: 'Bắt nguồn từ cuộc đấu tranh trường kỳ của người Việt cổ ven lưu vực sông Đà, sông Hồng trước thiên tai lũ lụt khắc nghiệt để bảo vệ mùa màng và xóm làng.',
        thematicMeaning: 'Sơn Tinh là biểu tượng của tinh thần trị thủy quật cường, trí tuệ kiên định của nhân dân lao động; Thủy Tinh đại diện cho sức mạnh tàn phá của thiên tai bão lũ.',
        source: 'Việt Điện U Linh Tập & Kho tàng thần thoại Việt Nam.',
        tags: ['Sơn Tinh Thủy Tinh', 'Thần thoại', 'Trị thủy', 'Ba Vì', 'Sông Hồng'],
        readTime: '7 phút đọc',
        viewsCount: 1650,
        likesCount: 410,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        slug: 'truyen-kieu',
        category: 'trung-dai',
        categoryName: 'Truyện thơ Nôm kinh điển',
        period: 'Văn học Trung đại (TK XVIII-XIX)',
        region: 'Nghi Xuân (Hà Tĩnh) & Bắc Ninh',
        author: 'Đại thi hào Nguyễn Du',
        summary: 'Kiệt tác văn học vĩ đại nhất của nền thi ca dân tộc, khắc họa cuộc đời mười lăm năm lưu lạc trắc trở của nàng Kiều, đồng thời cất lên tiếng kêu cứu cho phẩm giá con người và tấm lòng nhân đạo bao la.',
        quote: 'Trăm năm trong cõi người ta / Chữ tài chữ mệnh khéo là ghét nhau / Trải qua một cuộc bể dâu / Những điều trông thấy mà đau đớn lòng...',
        content: `Đoạn Trường Tân Thanh (thường gọi là Truyện Kiều) gồm 3.254 câu thơ lục bát tài hoa tuyệt đỉnh. Tác phẩm kể về Thúy Kiều - một thiếu nữ tài sắc vẹn toàn, hiếu nghĩa đủ đầy. Vì gia đình mắc oan khi kẻ buôn tơ vu vạ, Kiều đành hy sinh mối tình đầu son sắt với chàng Kim Trọng để bán mình chuộc cha và em.
Suốt mười lăm năm chìm nổi giữa dòng đời ô trọc, nàng lần lượt bị xô đẩy qua lầu xanh Mã Giám Sinh, chịu đọa đày dưới tay Tú Bà, Hoạn Thư, Sở Khanh, nương nhờ cửa Phật rồi gặp gỡ anh hùng Từ Hải. Khi Từ Hải bị mắc lừa Hồ Tôn Hiến, Kiều đau đớn trầm mình xuống sông Tiền Đường tự vẫn, may mắn được sư Giác Duyên cứu vớt. Sau mười lăm năm đoản trường, nàng đoàn tụ với gia đình và Kim Trọng, đổi duyên nồng thắm thành tình bạn thanh cao tri kỷ.`,
        historicalContext: 'Sáng tác vào đầu thế kỷ XIX trong bối cảnh xã hội phong kiến Việt Nam khủng hoảng sâu sắc, các giá trị nhân văn bị đồng tiền và cường quyền chà đạp.',
        thematicMeaning: 'Giá trị hiện thực sâu sắc tố cáo các thế lực phong kiến tàn bạo; giá trị nhân đạo cao cả khẳng định vẻ đẹp tâm hồn, tài năng, khát vọng tự do và tình yêu chân chính của con người.',
        source: 'Nguyễn Du toàn tập — Viện Văn học & NXB Văn học Việt Nam.',
        tags: ['Truyện Kiều', 'Nguyễn Du', 'Thơ Nôm', 'Lục bát', 'Văn học trung đại'],
        readTime: '15 phút trích đọc',
        viewsCount: 3100,
        likesCount: 940,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Tuyển tập Ca dao Đất nước & Tình nghĩa Con người',
        slug: 'ca-dao-que-huong-tinh-nguoi',
        category: 'ca-dao',
        categoryName: 'Ca dao - Dân ca truyền khẩu',
        period: 'Văn học Dân gian',
        region: 'Bắc Bộ, Trung Bộ & Nam Bộ',
        author: 'Dân gian',
        summary: 'Tiếng hát ân tình của quần chúng nhân dân gửi gắm vào đồng ruộng, dòng sông, tình cảm gia đình, tình yêu đôi lứa và niềm tự hào sâu nặng trước giang sơn bờ cõi.',
        quote: 'Rủ nhau xuống biển mò cua / Lên ngàn bẻ nón cho vừa lòng anh...',
        content: `Ca dao dân ca là viên ngọc quý của tâm hồn người Việt, được lưu truyền qua hàng ngàn năm bằng phương thức truyền khẩu.
1. Về tình yêu quê hương đất nước:
"Đường vô xứ Nghệ quanh quanh
Non xanh nước biếc như tranh họa đồ
Ai vô xứ Nghệ thì vô..."

2. Về tình cảm gia đình, đạo lý làm con:
"Công cha như núi Thái Sơn
Nghĩa mẹ như nước trong nguồn chảy ra
Một lòng thờ mẹ kính cha
Cho tròn chữ hiếu mới là đạo con."

3. Về khát vọng lao động và ý chí bền bỉ:
"Cày đồng đang buổi ban trưa
Mồ hôi thánh thót như mưa ruộng cày
Ai ơi bưng bát cơm đầy
Dẻo thơm một hạt, đắng cay muôn phần!"`,
        historicalContext: 'Được sáng tạo và bồi đắp liên tục qua các thế hệ người lao động, gắn bó hữu cơ với các điệu hát ru, hò đối đáp, quan họ và đờn ca tài tử.',
        thematicMeaning: 'Phản ánh thế giới nội tâm phong phú, tinh tế, giàu lòng nhân ái, sự lạc quan và triết lý sống thủy chung son sắt của dân tộc Việt Nam.',
        source: 'Kho tàng Ca dao người Việt — GS. Vũ Ngọc Phan, NXB Văn học.',
        tags: ['Ca dao', 'Dân gian', 'Hiếu thảo', 'Tình yêu quê hương', 'Đạo lý'],
        readTime: '6 phút đọc',
        viewsCount: 1250,
        likesCount: 320,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Sự tích Trầu Cau',
        slug: 'su-tich-trau-cau',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích thế sự & phong tục',
        period: 'Văn học Dân gian',
        region: 'Đồng bằng sông Hồng',
        author: 'Dân gian',
        summary: 'Bản tình ca bất hủ về tình anh em ruột thịt và tình nghĩa vợ chồng thủy chung, giải thích nguồn gốc tục ăn trầu - nét đẹp văn hóa độc đáo ngàn đời của người Việt.',
        quote: 'Miếng trầu là đầu câu chuyện / Hòa quyện vôi nồng thắm đỏ sắt son...',
        content: `Đời Hùng Vương có hai anh em sinh đôi là Tân và Lang, giống nhau như đúc, tình cảm vô cùng khăng khít. Cha mẹ mất, hai anh em theo học cụ đồ họ Lưu. Thấy hai anh em đức độ, thầy gả con gái cho người anh là Tân.
Từ ngày có vợ, Tân vì mải lo việc gia đình nên có phần lơ là em. Một hôm hai anh em cùng đi làm đồng về, người vợ vì nhầm lẫn nên đã ôm chầm lấy người em. Tân thấy vậy đâm ra nghi ngờ, lạnh nhạt với Lang. Lang buồn bã bỏ nhà ra đi, đi mãi đến bờ một con suối thì kiệt sức chết đi, hóa thành tảng đá vôi.
Tân không thấy em về liền đi tìm, đến bên con suối, tựa vào tảng đá khóc thương rồi kiệt sức hóa thành cây cau mọc thẳng đứng bên tảng đá. Người vợ ở nhà chờ mãi không thấy chồng cũng cất bước đi tìm, đến chân cây cau khóc thương rồi chết, hóa thành dây trầu không quấn chặt lấy thân cau. Về sau vua Hùng đi tuần qua, nghe câu chuyện cảm động bèn truyền lấy lá trầu bọc quả cau nhai thử cùng chút vôi, thấy miệng thơm cay, nhổ bã ra có màu đỏ thắm. Từ đó vua truyền dạy dùng trầu cau trong các dịp cưới hỏi và lễ tết.`,
        historicalContext: 'Ra đời từ thời kỳ Hùng Vương, gắn liền với phong tục hôn nhân và tục ăn trầu có mặt từ buổi đầu bình minh lịch sử dân tộc.',
        thematicMeaning: 'Biểu tượng của tình anh em keo sơn, tình vợ chồng son sắt keo gắn không thể tách rời; lý giải cội nguồn phong tục "Miếng trầu là đầu câu chuyện".',
        source: 'Lĩnh Nam Chích Quái & Cổ tích dân gian Việt Nam.',
        tags: ['Trầu Cau', 'Cổ tích', 'Tình nghĩa', 'Văn hóa Việt', 'Hùng Vương'],
        readTime: '7 phút đọc',
        viewsCount: 1120,
        likesCount: 295,
        isFeatured: false,
        status: 'published',
    },
    {
        title: 'Nam Quốc Sơn Hà',
        slug: 'nam-quoc-son-ha',
        category: 'trung-dai',
        categoryName: 'Thơ chữ Hán - Bản Tuyên ngôn Độc lập đầu tiên',
        period: 'Văn học Trung đại (Thế kỷ XI)',
        region: 'Bắc Ninh (Chiến tuyến Sông Như Nguyệt)',
        author: 'Khuyết danh (Tương truyền Lý Thường Kiệt)',
        summary: 'Bản Tuyên ngôn Độc lập đầu tiên của dân tộc Việt Nam, khẳng định chủ quyền lãnh thổ thiêng liêng bất khả xâm phạm và ý chí sắt đá trừng trị mọi kẻ thù xâm lăng.',
        quote: 'Nam quốc sơn hà Nam đế cư / Tiệt nhiên định phận tại thiên thư / Như hà nghịch lỗ lai xâm phạm / Nhữ đẳng hành khan thủ bại hư.',
        content: `Năm 1077, ba mươi vạn quân Tống do Quách Quỳ chỉ huy ồ ạt tràn sang xâm lược nước ta. Thái úy Lý Thường Kiệt lập phòng tuyến vững chắc bên bờ nam sông Như Nguyệt (sông Cầu) để chặn giặc.
Đang đêm thanh vắng, giữa lúc quân ta và quân giặc đang giằng co quyết liệt, từ trong đền thờ Trương Hống, Trương Hát bên bờ sông bỗng vang lên tiếng ngâm thơ sang sảng như sấm truyền:
"Nam quốc sơn hà Nam đế cư
Tiệt nhiên định phận tại thiên thư
Như hà nghịch lỗ lai xâm phạm
Nhữ đẳng hành khan thủ bại hư!"
(Dịch thơ:
Sông núi nước Nam vua Nam ở
Rành rành định phận tại sách trời
Cớ sao lũ giặc sang xâm phạm
Chúng bay sẽ bị đánh tơi bời!)
Tiếng thơ thần kỳ vang dội khắp núi sông làm cho tinh thần quân ta phấn chấn tột độ, còn quân giặc hoang mang, khiếp đảm mất hết nhuệ khí. Sau trận tập kích quyết định, quân Tống đại bại, buộc phải chấp nhận giảng hòa rút quân.`,
        historicalContext: 'Gắn liền với chiến dịch phòng ngự sông Như Nguyệt năm 1077 thời nhà Lý, đánh dấu bước phát triển vượt bậc của ý thức dân tộc tự chủ.',
        thematicMeaning: 'Khẳng định độc lập, tự chủ và toàn vẹn cương vực đất nước; khẳng định chân lý lịch sử không thế lực bạo tàn nào có thể đảo ngược.',
        source: 'Đại Việt Sử Ký Toàn Thư & Văn học Lý - Trần (Viện Văn học).',
        tags: ['Nam Quốc Sơn Hà', 'Lý Thường Kiệt', 'Tuyên ngôn độc lập', 'Sông Cầu', 'Yêu nước'],
        readTime: '5 phút đọc',
        viewsCount: 2450,
        likesCount: 780,
        isFeatured: true,
        status: 'published',
    },
    {
        title: 'Bình Ngô Đại Cáo',
        slug: 'binh-ngo-dai-cao',
        category: 'trung-dai',
        categoryName: 'Thể Cáo - Thiên cổ hùng văn',
        period: 'Văn học Trung đại (Năm 1428)',
        region: 'Lam Sơn (Thanh Hóa) & Đông Đô (Hà Nội)',
        author: 'Nguyễn Trãi',
        summary: 'Bản Tuyên ngôn Độc lập thứ hai chói ngời tinh thần nhân nghĩa, tổng kết cuộc kháng chiến mười năm Lam Sơn gian khổ mà hào hùng đánh tan hai mươi vạn quân Minh xâm lược.',
        quote: 'Việc nhân nghĩa cốt ở yên dân / Quân điếu phạt trước lo trừ bạo...',
        content: `Sau khi cuộc khởi nghĩa Lam Sơn toàn thắng, dẹp tan ách đô hộ tàn bạo của giặc Minh, đầu năm 1428, Nguyễn Trãi thừa lệnh vua Lê Thái Tổ (Lê Lợi) viết Bình Ngô Đại Cáo để bố cáo cho toàn thiên hạ biết nền độc lập dân tộc đã được lập lại.
Tác phẩm mở đầu bằng nguyên lý nhân nghĩa và chân lý về sự tồn tại độc lập lâu đời của nước Đại Việt:
"Từng nghe:
Việc nhân nghĩa cốt ở yên dân,
Quân điếu phạt trước lo trừ bạo.
Như nước Đại Việt ta từ trước,
Vốn xưng nền văn hiến đã lâu.
Núi sông bờ cõi đã chia,
Phong tục Bắc Nam cũng khác.
Từ Triệu, Đinh, Lý, Trần bao đời gây nền độc lập,
Cùng Hán, Đường, Tống, Nguyên mỗi bên xưng đế một phương..."
Đoạn tiếp theo vạch trần tội ác trời không dung đất không tha của quân cuồng Minh: "Độc ác thay, trúc Nam Sơn không ghi hết tội / Dơ bẩn thay, nước Đông Hải không rửa sạch mùi!". Sau đó tái hiện quá trình khởi nghĩa Lam Sơn đầy gian khổ: "Nếm mật nằm gai", "Cơm ăn chẳng no, áo mặc chẳng ấm", cho đến giai đoạn phản công thần tốc lẫm liệt, đập tan đạo quân tiếp viện của Liễu Thăng, Mộc Thạnh. Cuối cùng kết thúc bằng lời tuyên bố hào sảng về kỷ nguyên thái bình muôn thuở.`,
        historicalContext: 'Được công bố vào tháng 1 năm 1428 sau khi nghĩa quân Lam Sơn đánh bại hoàn toàn quân Minh, mở ra triều đại Hậu Lê rực rỡ.',
        thematicMeaning: 'Đỉnh cao của tư tưởng nhân nghĩa, tinh thần yêu chuộng hòa bình và niềm tự hào dân tộc; được đánh giá là "thiên cổ hùng văn" muôn đời bất hủ.',
        source: 'Nguyễn Trãi toàn tập — Viện Sử học, NXB Khoa học Xã hội.',
        tags: ['Bình Ngô Đại Cáo', 'Nguyễn Trãi', 'Lam Sơn', 'Lê Lợi', 'Thiên cổ hùng văn'],
        readTime: '12 phút trích đọc',
        viewsCount: 2200,
        likesCount: 650,
        isFeatured: true,
        status: 'published',
    },
];

async function seedData() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sep490';
        console.log(`[SeedLiterature] Đang kết nối tới MongoDB: ${mongoUri}...`);
        await mongoose.connect(mongoUri);

        console.log('[SeedLiterature] Xóa dữ liệu cũ của bảng Work nếu có...');
        await Work.deleteMany({});

        console.log(`[SeedLiterature] Đang thêm ${sampleWorks.length} tác phẩm văn học dân gian & kinh điển...`);
        const inserted = await Work.insertMany(sampleWorks);
        console.log(`[SeedLiterature] Thành công nạp ${inserted.length} tác phẩm vào MongoDB!`);

        process.exit(0);
    } catch (error) {
        console.error('[SeedLiterature] Lỗi nạp dữ liệu:', error);
        process.exit(1);
    }
}

seedData();
