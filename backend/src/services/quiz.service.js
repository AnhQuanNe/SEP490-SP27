const Work = require('../models/Work');

/**
 * Ngân hàng câu hỏi trắc nghiệm Di sản Văn học Dân gian Việt Nam
 */
const QUIZ_QUESTION_BANK = [
    {
        id: 'q1',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích',
        difficulty: 'de',
        relatedWorkSlug: 'thach-sanh',
        question: 'Trong truyện cổ tích Thạch Sanh, vật phẩm kỳ diệu nào đã thức tỉnh lòng trắc ẩn của quân giặc 18 nước chư hầu mà không cần đổ máu?',
        options: [
            'Búa thần đốn củi của cha để lại',
            'Cung tên vàng bắn rụng đại bàng',
            'Tiếng đàn thần giải oan và cảm hóa',
            'Chiếc gương thần nhìn thấu tâm can',
        ],
        correctIndex: 2,
        explanation: 'Tiếng đàn của Thạch Sanh gảy lên bên bờ sông giáp ranh khiến quân sĩ 18 nước chư hầu xúc động, nhớ cha mẹ, vợ con ở quê nhà nên bủn rủn tay chân, không đánh mà tan. Đây là biểu tượng của tinh thần yêu chuộng hòa bình của dân tộc.',
    },
    {
        id: 'q2',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'thach-sanh',
        question: 'Hình tượng "Niêu cơm thần" trong Thạch Sanh tượng trưng cho phẩm chất và khát vọng gì của nhân dân Việt Nam?',
        options: [
            'Khát vọng no ấm, lòng hiếu khách và đức tính vị tha vô tận',
            'Sự thịnh vượng của vương triều nhà vua đương thời',
            'Phép thuật thần thông của thái tử con trời Ngọc Hoàng',
            'Nền nông nghiệp lúa nước phát triển vượt bậc',
        ],
        correctIndex: 0,
        explanation: 'Niêu cơm nhỏ xíu nhưng ăn mãi không bao giờ vơi tượng trưng cho tiềm lực dồi dào, đức tính hiếu khách, lòng nhân ái bao la và khát vọng thái bình muôn thuở của nhân dân lao động.',
    },
    {
        id: 'q3',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        difficulty: 'de',
        relatedWorkSlug: 'thanh-giong',
        question: 'Tại sao sau khi đánh tan giặc Ân, tráng sĩ làng Gióng lại cởi bỏ áo giáp sắt rồi cưỡi ngựa bay thẳng về trời?',
        options: [
            'Vì bị thương nặng trong lúc giao tranh dữ dội',
            'Vì sợ triều đình truy hỏi gốc tích thần tiên',
            'Thể hiện tinh thần xả thân vì nước vô tư, không màng danh lợi bổng lộc',
            'Để tìm lại mẹ già đã khuất núi',
        ],
        correctIndex: 2,
        explanation: 'Hành động cởi giáp bay về trời nâng hình tượng Gióng thành vị anh hùng vô tư, thuần khiết — xả thân vì Tổ quốc khi lâm nguy và trở về cõi bất tử khi non sông đã sạch bóng quân thù.',
    },
    {
        id: 'q4',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Khởi nguyên',
        difficulty: 'de',
        relatedWorkSlug: 'son-tinh-thuy-tinh',
        question: 'Cuộc giao tranh bất phân thắng bại hàng năm giữa Sơn Tinh và Thủy Tinh phản ánh hiện thực lịch sử nào của cư dân Văn Lang?',
        options: [
            'Nạn cháy rừng kinh hoàng ở vùng núi Tản Viên',
            'Hiện tượng lũ lụt hàng năm ở đồng bằng sông Hồng và ý chí trị thủy kiên cường',
            'Cuộc chiến tranh giành lãnh thổ giữa các bộ tộc đồng bằng và miền núi',
            'Thời tiết mùa đông giá rét khắc nghiệt ở miền Bắc',
        ],
        correctIndex: 1,
        explanation: '"Nước dâng lên bao nhiêu, núi cao lên bấy nhiêu" là hình ảnh hoành tráng ca ngợi ý chí kiên cường, quật khởi của tổ tiên người Việt cổ trong công cuộc đắp đê, ngăn lũ, trị thủy bảo vệ mùa màng.',
    },
    {
        id: 'q5',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'nam-quoc-son-ha',
        question: 'Bài thơ "Nam quốc sơn hà" vang lên trên sông Như Nguyệt năm 1077 được coi là bản Tuyên ngôn Độc lập đầu tiên của nước ta vì lý do cốt lõi nào?',
        options: [
            'Vì bài thơ được viết bằng chữ Hán chuẩn mực nhất',
            'Vì khẳng định chủ quyền lãnh thổ thiêng liêng đã được định phận tại "Thiên thư"',
            'Vì là bài thơ dài nhất thời kỳ triều đại nhà Lý',
            'Vì bài thơ do chính vua Lý Thái Tổ trực tiếp sáng tác',
        ],
        correctIndex: 1,
        explanation: '"Nam quốc sơn hà Nam đế cư / Tiệt nhiên định phận tại thiên thư" dõng dạc tuyên ngôn quyền độc lập tự chủ và ranh giới bờ cõi của nước Nam là chân lý thiêng liêng bất khả xâm phạm.',
    },
    {
        id: 'q6',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'ca-dao-dong-bang-bac-bo',
        question: 'Hoàn thành câu ca dao răn dạy về chữ Hiếu và ơn nghĩa sinh thành: "Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn ..."',
        options: [
            'chảy xiết',
            'chảy ra',
            'mát trong',
            'dâng đầy',
        ],
        correctIndex: 1,
        explanation: '"Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn chảy ra" là câu ca dao kinh điển ví công đức trời biển của đấng sinh thành như dòng suối vô tận không bao giờ cạn.',
    },
    {
        id: 'q7',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'truyen-kieu',
        question: 'Tác phẩm "Truyện Kiều" (Đoạn trường tân thanh) của Đại thi hào Nguyễn Du viết theo thể thơ truyền thống nào của dân tộc?',
        options: [
            'Thơ Song thất lục bát',
            'Thơ Lục bát',
            'Thơ Thất ngôn bát cú Đường luật',
            'Thơ Tự do',
        ],
        correctIndex: 1,
        explanation: 'Truyện Kiều gồm 3.254 câu thơ lục bát, là đỉnh cao chói lọi nhất của nghệ thuật thơ ca và ngôn ngữ tiếng Việt trong lịch sử văn học dân tộc.',
    },
    {
        id: 'q8',
        category: 'co-tich',
        categoryName: 'Truyện cổ tích',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'tam-cam',
        question: 'Trong truyện Tấm Cám, quá trình hóa thân liên tiếp của cô Tấm (chim Vàng Anh -> cây Xoan đào -> khung cửi -> quả Thị) biểu thị điều gì?',
        options: [
            'Tấm biết nhiều phép biến hóa thần thông của Bụt',
            'Sức sống mãnh liệt, bất diệt của cái Thiện và tinh thần đấu tranh không khoan nhượng',
            'Mẹ con Cám có lòng bao dung cho Tấm cơ hội chuộc lỗi',
            'Ước mơ sống ẩn dật nơi thôn quê thanh bình',
        ],
        correctIndex: 1,
        explanation: 'Những lần hóa thân chứng minh cái Thiện dù bị trù dập đến đâu vẫn tái sinh mạnh mẽ hơn, quyết liệt hơn để giành lại hạnh phúc và trừng trị cái ác.',
    },
    {
        id: 'q9',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'hich-tuong-si',
        question: 'Trong "Hịch tướng sĩ", câu nói "Ta thường tới bữa quên ăn, nửa đêm vỗ gối, ruột đau như cắt, nước mắt đầm đìa..." bộc lộ tâm tư gì của Trần Hưng Đạo?',
        options: [
            'Nỗi xót xa khi nhìn thấy gia đình ly tán vì chiến tranh',
            'Lòng căm thù giặc tột cùng và nỗi đau đáu vì vận mệnh giang sơn xã tắc',
            'Cảm giác mệt mỏi sau nhiều ngày hành quân gian khổ',
            'Nỗi ân hận vì chưa kịp huấn luyện binh sĩ chu đáo',
        ],
        correctIndex: 1,
        explanation: 'Đoạn văn bộc lộ tấm lòng yêu nước thương dân nồng nàn, ý chí quyết tâm đền nợ nước, trả thù nhà cao độ của vị Tiết chế Quốc công trước họa xâm lăng của quân Nguyên Mông.',
    },
    {
        id: 'q10',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'ca-dao-dong-bang-bac-bo',
        question: 'Câu tục ngữ "Bầu ơi thương lấy bí cùng / Tuy rằng khác giống nhưng chung một giàn" mang ý nghĩa giáo dục cốt lõi nào?',
        options: [
            'Kinh nghiệm trồng trọt hoa màu đan xen của nông dân',
            'Tinh thần đoàn kết, tương thân tương ái giữa những người cùng một quê hương xứ sở',
            'Cần phải tiết kiệm lương thực phòng khi mất mùa',
            'Khuyên mọi người nên sống khép mình, không giao thiệp',
        ],
        correctIndex: 1,
        explanation: 'Câu ca dao mượn hình ảnh hai giống cây thân leo cùng chung giàn để nhắc nhở con người dù khác nhau về hoàn cảnh vẫn cần yêu thương, đùm bọc lẫn nhau.',
    },
    {
        id: 'q11',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'uong-nuoc-nho-nguon',
        question: 'Câu tục ngữ "Uống nước nhớ nguồn" đúc kết truyền thống đạo lý tốt đẹp nào của dân tộc Việt Nam?',
        options: [
            'Lòng biết ơn, tri ân sâu sắc đối với tổ tiên, cội nguồn và những người có công',
            'Kinh nghiệm tìm nguồn nước sạch trong sinh hoạt nông thôn',
            'Ý thức bảo vệ môi trường sông hồ tự nhiên',
            'Khuyên mọi người tiết kiệm tài nguyên thiên nhiên',
        ],
        correctIndex: 0,
        explanation: '"Uống nước nhớ nguồn" nhắc nhở mỗi thế hệ khi được hưởng thụ thành quả phải luôn ghi nhớ công lao khai phá, dựng xây của các bậc tiền nhân đi trước.',
    },
    {
        id: 'q12',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'an-qua-nho-ke-trong-cay',
        question: 'Cặp hình ảnh "Ăn quả" và "Kẻ trồng cây" mang ý nghĩa ẩn dụ sâu xa gì?',
        options: [
            'Thành quả ngọt ngào của ngày hôm nay gắn liền với mồ hôi công sức vun trồng của thế hệ đi trước',
            'Khuyên người nông dân nên chăm sóc các giống cây ăn quả',
            'Nói về quy luật phát triển tự nhiên của cây cối',
            'Hướng dẫn kỹ thuật thu hoạch hoa quả đúng mùa vụ',
        ],
        correctIndex: 0,
        explanation: '"Ăn quả nhớ kẻ trồng cây" là bài học đạo nghĩa ân tình, nhắc nhở bổn phận biết ơn người đã đổ công sức tạo nên những giá trị tốt đẹp cho đời.',
    },
    {
        id: 'q13',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'co-cong-mai-sat-co-ngay-nen-kim',
        question: 'Ý nghĩa triết lý nhân sinh của câu tục ngữ "Có công mài sắt, có ngày nên kim" là gì?',
        options: [
            'Lòng kiên trì, nhẫn nại và ý chí bền bỉ sẽ giúp con người vượt qua mọi khó khăn để thành công',
            'Kỹ nghệ rèn đúc sắt thép thủ công của các làng nghề truyền thống',
            'Khuyên con người chỉ nên làm những việc nhỏ bé vừa sức',
            'Cần phải có nhiều công cụ bằng sắt thì mới làm nên việc lớn',
        ],
        correctIndex: 0,
        explanation: 'Hình ảnh thỏi sắt lớn được mài giũa thành cây kim nhỏ bé tượng trưng cho sự tôi luyện phi thường của ý chí con người trước thử thách cuộc đời.',
    },
    {
        id: 'q14',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'la-lanh-dum-la-rach',
        question: 'Tinh thần "Lá lành đùm lá rách" trong văn hóa người Việt thể hiện truyền thống nào?',
        options: [
            'Tinh thần tương thân tương ái, cưu mang giúp đỡ những hoàn cảnh khó khăn hơn mình',
            'Kinh nghiệm gói bánh chưng bánh tét ngày Tết cổ truyền',
            'Cách lựa chọn lá lợp mái nhà tránh mưa bão ở nông thôn',
            'Khuyên mọi người tiết kiệm chi tiêu gia đình',
        ],
        correctIndex: 0,
        explanation: '"Lá lành đùm lá rách" là biểu tượng sáng ngời của tình đồng bào ruột thịt, sẵn sàng sẻ chia giúp đỡ nhau lúc hoạn nạn nguy nan.',
    },
    {
        id: 'q15',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'hoc-thay-khong-tay-hoc-ban',
        question: 'Câu tục ngữ "Học thầy không tày học bạn" nhấn mạnh phương pháp học tập nào?',
        options: [
            'Tầm quan trọng của việc học hỏi, thảo luận và trao đổi tri thức cùng bạn bè trang lứa',
            'Khuyên học sinh không cần nghe lời thầy cô giáo',
            'Cho rằng học bạn dễ hơn và không bị áp lực thi cử',
            'Chỉ ra bạn bè bao giờ cũng giỏi hơn người thầy',
        ],
        correctIndex: 0,
        explanation: 'Câu tục ngữ không hạ thấp vai trò người thầy mà khuyên người học cần biết mở rộng tương tác, học hỏi lẫn nhau cùng bạn bè để mở mang kiến thức.',
    },
    {
        id: 'q16',
        category: 'ca-dao',
        categoryName: 'Ca dao - Tục ngữ',
        difficulty: 'de',
        relatedWorkSlug: 'nhieu-dieu-phu-lay-gia-guong',
        question: 'Hai câu thơ: "Nhiễu điều phủ lấy giá gương / Người trong một nước phải thương nhau cùng" khuyên răn điều gì?',
        options: [
            'Tình đoàn kết keo sơn, gắn bó máu thịt giữa các dân tộc anh em trên dải đất Việt Nam',
            'Cách bài trí bàn thờ gia tiên trang nghiêm vào ngày lễ tết',
            'Kinh nghiệm may vá trang phục bằng vải gấm lụa quý',
            'Quy định pháp luật của triều đình về trật tự an ninh xã hội',
        ],
        correctIndex: 0,
        explanation: 'Hình ảnh chiếc khăn nhiễu đỏ che chở giá gương tượng trưng cho sự đùm bọc, đồng lòng che chở lẫn nhau của những người con cùng chung một bọc mẹ Âu Cơ.',
    },
    {
        id: 'q17',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Khởi nguyên',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'son-tinh-thuy-tinh',
        question: 'Trong câu chuyện Sơn Tinh - Thủy Tinh, vua Hùng thứ 18 đã yêu cầu sính lễ cưới Mỵ Nương gồm những gì?',
        options: [
            'Voi chín ngà, gà chín cựa, ngựa chín hồng mao, mỗi thứ một đôi',
            'Một trăm hòm vàng bạc, một trăm viên ngọc trai biển sâu',
            'Năm trăm cây gỗ lim và một đàn trâu rừng trăm con',
            'Ba trăm vò rượu cần và gạo nếp thơm nương rẫy',
        ],
        correctIndex: 0,
        explanation: 'Sính lễ "voi chín ngà, gà chín cựa, ngựa chín hồng mao" là các sinh vật quý hiếm trên cạn, thể hiện sự ưu ái kín đáo của Vua Hùng đối với thần núi Sơn Tinh.',
    },
    {
        id: 'q18',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        difficulty: 'de',
        relatedWorkSlug: 'thanh-giong',
        question: 'Dấu tích nào ở vùng đất Sóc Sơn (Hà Nội) ngày nay gắn liền với truyền thuyết Phù Đổng Thiên Vương?',
        options: [
            'Dãy ao hồ hình móng chân ngựa sắt và bụi tre ngà ngả màu vàng óng',
            'Dấu chân khổng lồ của người khổng lồ dẫm lên phiến đá',
            'Một hang đá sâu chứa vũ khí đánh giặc thời Hùng Vương',
            'Bức tường thành bằng đất hình xoắn ốc',
        ],
        correctIndex: 0,
        explanation: 'Theo truyền thuyết, vó ngựa sắt của Gióng khi xung trận đã giẫm thành những ao hồ liên tiếp, và ngọn lửa thiêu cháy bụi tre biến chúng thành tre ngà màu vàng rực rỡ.',
    },
    {
        id: 'q19',
        category: 'co-tich',
        categoryName: 'Truyền cổ tích',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'thach-sanh',
        question: 'Lý Thông trong truyện Thạch Sanh đại diện cho hạng người nào trong xã hội phong kiến xưa?',
        options: [
            'Kẻ xảo quyệt, bất nhân bất nghĩa, cướp công đoạt lợi của người hiền lành',
            'Người quan chức thanh liêm nhưng nghiêm khắc',
            'Tầng lớp binh lính trung thành với triều đình',
            'Một thương nhân buôn bán lương thiện nhưng gặp vận rủi',
        ],
        correctIndex: 0,
        explanation: 'Hình tượng mẹ con Lý Thông là hiện thân của sự lừa lọc, vong ân bội nghĩa, đối lập gay gắt với vẻ đẹp đạo đức trong sáng, vị tha của dũng sĩ Thạch Sanh.',
    },
    {
        id: 'q20',
        category: 'co-tich',
        categoryName: 'Truyền cổ tích',
        difficulty: 'de',
        relatedWorkSlug: 'tam-cam',
        question: 'Chi tiết ông Bụt hiện lên giúp đỡ cô Tấm phản ánh niềm tin tín ngưỡng dân gian nào?',
        options: [
            'Ước mơ về công lý, cái Thiện luôn được các thế lực siêu nhiên phù hộ chở che lúc bế tắc',
            'Người nông dân có thể tự giải quyết mọi việc nhờ bùa chú',
            'Tấm là người có phép thuật thần tiên từ kiếp trước',
            'Bụt chỉ giúp đỡ những người biết nuôi cá bống',
        ],
        correctIndex: 0,
        explanation: 'Hình tượng ông Bụt trong truyện cổ tích Việt Nam đại diện cho khát vọng công bằng xã hội của nhân dân lao động: "Ở hiền gặp lành, ác giả ác báo".',
    },
    {
        id: 'q21',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'truyen-kieu',
        question: 'Hai câu thơ "Mai cốt cách, tuyết tinh thần / Mỗi người một vẻ, mười phân vẹn mười" miêu tả vẻ đẹp của ai?',
        options: [
            'Chị em Thúy Kiều và Thúy Vân',
            'Thúy Kiều và Đạm Tiên',
            'Thúy Kiều và Hoạn Thư',
            'Từ Hải và Thúy Kiều',
        ],
        correctIndex: 0,
        explanation: 'Nguyễn Du dùng bút pháp ước lệ tượng trưng để miêu tả vẻ đẹp cốt cách thanh tao như cành mai, tâm hồn trong trắng như tuyết của hai chị em Thúy Kiều và Thúy Vân.',
    },
    {
        id: 'q22',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'nam-quoc-son-ha',
        question: 'Bản dịch thơ nổi tiếng câu đầu "Nam quốc sơn hà Nam đế cư" thường được lưu truyền là gì?',
        options: [
            'Sông núi nước Nam vua Nam ở',
            'Đất nước Việt Nam muôn đời thịnh',
            'Bờ cõi nước Nam giặc chớ xâm',
            'Trời Nam phân định cõi giang sơn',
        ],
        correctIndex: 0,
        explanation: '"Sông núi nước Nam vua Nam ở / Rành rành định phận tại sách trời" là câu dịch thơ vang danh non sông khẳng định chủ quyền lãnh thổ của Đại Việt.',
    },
    {
        id: 'q23',
        category: 'trung-dai',
        categoryName: 'Văn học Trung đại',
        difficulty: 'kho',
        relatedWorkSlug: 'hich-tuong-si',
        question: 'Hịch tướng sĩ của Trần Hưng Đạo được viết nhằm mục đích chính yếu nào trước cuộc kháng chiến chống Nguyên Mông lần 2?',
        options: [
            'Khích lệ tinh thần yêu nước, thức tỉnh ý thức trách nhiệm và rèn luyện võ nghệ cho tướng sĩ',
            'Trách phạt các tướng sĩ bỏ bê tập trận để săn bắn vui chơi',
            'Thông báo về số lượng viện binh phương Bắc sắp kéo sang',
            'Tuyên bố chiến lược rút lui về vùng ven biển bảo toàn lực lượng',
        ],
        correctIndex: 0,
        explanation: 'Bài hịch là lời hịch non sông, đánh thức lòng tự tôn dân tộc và tinh thần đoàn kết "Sát Thát", xốc lại nhuệ khí quyết chiến quyết thắng của toàn quân.',
    },
    {
        id: 'q24',
        category: 'truyen-thuyet',
        categoryName: 'Truyền thuyết lịch sử',
        difficulty: 'trung-binh',
        relatedWorkSlug: 'thanh-giong',
        question: 'Trước khi cưỡi ngựa sắt ra trận, cậu bé Gióng đã có một yêu cầu đặc biệt gì với sứ giả triều đình?',
        options: [
            'Đúc một con ngựa sắt, một thanh gươm sắt, một áo giáp sắt và một nón sắt',
            'Cung cấp một vạn binh mã và thuyền chiến bọc đồng',
            'Một cây cung thần bằng ngà voi và tên vàng',
            'Một chiếc xe ngựa bọc thép và cờ lệnh thêu sáu chữ vàng',
        ],
        correctIndex: 0,
        explanation: 'Cậu bé lên ba không biết nói biết cười, nhưng tiếng nói đầu tiên là đòi gươm sắt, ngựa sắt, giáp sắt đi đánh giặc cứu nước — biểu tượng cho sức mạnh tiềm tàng của toàn thể dân tộc khi Tổ quốc lâm nguy.',
    },
    {
        id: 'q25',
        category: 'than-thoai',
        categoryName: 'Thần thoại & Khởi nguyên',
        difficulty: 'de',
        relatedWorkSlug: 'son-tinh-thuy-tinh',
        question: 'Hình tượng thần Sơn Tinh (Tản Viên Sơn Thánh) trong tâm thức dân gian Việt Nam được tôn vinh là ai?',
        options: [
            'Một trong "Tứ bất tử" của tín ngưỡng dân gian Việt Nam',
            'Vị vua đầu tiên của nhà nước Văn Lang',
            'Vị tướng chỉ huy trận địa sông Bạch Đằng',
            'Vị thần nông nghiệp dạy dân trồng lúa nước',
        ],
        correctIndex: 0,
        explanation: 'Sơn Tinh (Tản Viên Sơn Thánh) đứng đầu trong hàng Tứ bất tử của văn hóa Việt Nam (cùng Chử Đồng Tử, Thánh Gióng và Mẫu Liễu Hạnh), tượng trưng cho sức mạnh chinh phục thiên nhiên và lòng nhân nghĩa.',
    },
];

/**
 * Lấy danh sách câu hỏi trắc nghiệm (ẩn đáp án đúng để client chơi)
 */
const getQuestions = async ({ category = 'all', count = 5, difficulty = 'all' }) => {
    let pool = [...QUIZ_QUESTION_BANK];

    if (category && category !== 'all') {
        const filtered = pool.filter((q) => q.category === category);
        if (filtered.length > 0) {
            pool = filtered;
        }
    }

    if (difficulty && difficulty !== 'all') {
        const diffFiltered = pool.filter((q) => q.difficulty === difficulty);
        if (diffFiltered.length > 0) {
            pool = diffFiltered;
        }
    }

    // Nếu số câu trong pool nhỏ hơn số yêu cầu, ta giữ toàn bộ pool
    // Shuffle câu hỏi
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, pool.length));

    // Lấy thông tin tóm tắt của Work liên quan
    const slugs = selected.map((q) => q.relatedWorkSlug).filter(Boolean);
    const relatedWorks = await Work.find({ slug: { $in: slugs } })
        .select('title slug category categoryName')
        .lean();

    const workMap = {};
    for (const w of relatedWorks) {
        workMap[w.slug] = w;
    }

    // Ẩn correctIndex và explanation trước khi trả về cho client
    return selected.map((q) => ({
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        relatedWork: workMap[q.relatedWorkSlug] || null,
    }));
};

/**
 * Chấm điểm bài thi và trả về kết quả kèm danh hiệu & giải thích
 */
const submitQuiz = async ({ answers }) => {
    if (!Array.isArray(answers)) {
        throw new Error('Dữ liệu bài nộp không hợp lệ');
    }

    const questionMap = {};
    for (const q of QUIZ_QUESTION_BANK) {
        questionMap[q.id] = q;
    }

    let correctCount = 0;
    const details = [];

    for (const ans of answers) {
        const original = questionMap[ans.questionId];
        if (!original) continue;

        const isCorrect = original.correctIndex === ans.selectedIndex;
        if (isCorrect) correctCount += 1;

        details.push({
            questionId: original.id,
            question: original.question,
            category: original.category,
            categoryName: original.categoryName,
            userSelectedIndex: ans.selectedIndex,
            userAnswer: original.options[ans.selectedIndex] || 'Chưa chọn',
            correctIndex: original.correctIndex,
            correctAnswer: original.options[original.correctIndex],
            isCorrect,
            explanation: original.explanation,
            relatedWorkSlug: original.relatedWorkSlug,
        });
    }

    const totalQuestions = answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Xác định Danh hiệu Di sản (Heritage Badge)
    let badge = {
        title: 'Tập Sự Tri Thức',
        description: 'Hãy tiếp tục đọc thêm các câu chuyện dân gian để mở rộng kho tàng tri thức!',
        tier: 'bronze',
        icon: 'Scroll',
    };

    if (score === 100) {
        badge = {
            title: 'Trạng Nguyên Văn Học',
            description: 'Tuyệt đỉnh uyên bác! Bạn nắm trọn tinh hoa và chiều sâu triết lý của di sản dân tộc!',
            tier: 'gold',
            icon: 'Crown',
        };
    } else if (score >= 80) {
        badge = {
            title: 'Bảng Nhãn Di Sản',
            description: 'Vốn hiểu biết sâu rộng! Bạn am tường các sự tích và nét đẹp đạo lý cổ truyền!',
            tier: 'silver',
            icon: 'Award',
        };
    } else if (score >= 60) {
        badge = {
            title: 'Thám Hoa Dân Gian',
            description: 'Rất ấn tượng! Bạn có nền tảng vững vàng về văn học dân gian nước nhà.',
            tier: 'emerald',
            icon: 'Sparkles',
        };
    } else if (score >= 40) {
        badge = {
            title: 'Tú Tài Đồng Môn',
            description: 'Khá tốt! Bạn đã nắm được những câu chuyện cốt lõi của tiền nhân.',
            tier: 'amber',
            icon: 'BookOpen',
        };
    }

    return {
        totalQuestions,
        correctCount,
        score,
        passed: score >= 60,
        badge,
        details,
    };
};

module.exports = {
    getQuestions,
    submitQuiz,
};
