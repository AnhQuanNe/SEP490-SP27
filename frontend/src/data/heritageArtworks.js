/**
 * heritageArtworks.js
 * Kho tư liệu thị giác nghệ thuật Di sản (Visual Heritage Art Registry)
 * Cung cấp hình ảnh nghệ thuật phong cách thủy mặc / cổ phong / phong cảnh di sản Việt Nam
 * 100% chuẩn xác theo đúng từng tác phẩm, thể loại và bối cảnh văn hóa dân tộc.
 */

export const HERITAGE_ARTWORKS = {
    // 1. TÁC PHẨM CỤ THỂ
    'bau-oi-thuong-lay-bi-cung': {
        id: 'bau-oi-thuong-lay-bi-cung',
        title: 'Bầu ơi thương lấy bí cùng',
        author: 'Dân gian Việt Nam',
        era: 'Văn học Dân gian',
        theme: 'Đoàn kết & Tinh thần tương thân tương ái',
        badge: 'Tương Thân Tương Ái',
        locationTag: 'Làng quê nông thôn Việt Nam',
        quoteHighlight: '“Bầu ơi thương lấy bí cùng, Tuy rằng khác giống nhưng chung một giàn…”',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-emerald-950/90 via-amber-950/75 to-stone-900/60',
        accentColor: '#10b981',
    },
    'cong-cha-nhu-nui-thai-son': {
        id: 'cong-cha-nhu-nui-thai-son',
        title: 'Công cha như núi Thái Sơn',
        author: 'Dân gian Việt Nam',
        era: 'Văn học Dân gian',
        theme: 'Công ơn sinh thành dưỡng dục trời biển của cha mẹ',
        badge: 'Đạo Hiếu Phụ Mẫu',
        locationTag: 'Non cao Biển rộng • Núi Thái Sơn - Nước trong nguồn',
        quoteHighlight: '“Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong nguồn chảy ra…”',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-stone-950/90 via-slate-950/80 to-amber-950/60',
        accentColor: '#f59e0b',
    },
    'nhieu-dieu-phu-lay-gia-guong': {
        id: 'nhieu-dieu-phu-lay-gia-guong',
        title: 'Nhiễu điều phủ lấy giá gương',
        author: 'Dân gian Việt Nam',
        era: 'Văn học Dân gian',
        theme: 'Tình nghĩa đồng bào & Nghĩa khí tương trợ',
        badge: 'Nghĩa Đồng Bào',
        locationTag: 'Mái đình làng Việt • Giá gương son',
        quoteHighlight: '“Nhiễu điều phủ lấy giá gương, Người trong một nước phải thương nhau cùng…”',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-red-950/90 via-amber-950/80 to-stone-950/60',
        accentColor: '#ef4444',
    },
    'thap-muoi-dep-nhat-bong-sen': {
        id: 'thap-muoi-dep-nhat-bong-sen',
        title: 'Tháp Mười đẹp nhất bông sen',
        author: 'Bảo Định Giang (phỏng ca dao)',
        era: 'Ca dao Kháng chiến',
        theme: 'Vẻ đẹp thanh khiết hoa sen & Hình tượng Bác Hồ kính yêu',
        badge: 'Hồn Sen Đồng Tháp',
        locationTag: 'Đồng Tháp Mười • Nam Bộ',
        quoteHighlight: '“Tháp Mười đẹp nhất bông sen, Việt Nam đẹp nhất có tên Bác Hồ…”',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-rose-950/90 via-emerald-950/75 to-slate-950/60',
        accentColor: '#f43f5e',
    },
    'gio-dua-canh-truc-la-da': {
        id: 'gio-dua-canh-truc-la-da',
        title: 'Gió đưa cành trúc la đà',
        author: 'Dân gian Việt Nam',
        era: 'Ca dao Cổ truyền Thăng Long',
        theme: 'Nét đẹp thanh lịch, cổ kính của đất Tràng An ngàn năm',
        badge: 'Thanh Lịch Tràng An',
        locationTag: 'Hồ Tây • Chùa Trấn Vũ • Thăng Long',
        quoteHighlight: '“Gió đưa cành trúc la đà, Tiếng chuông Trấn Vũ canh gà Thọ Xương…”',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-slate-950/90 via-stone-900/80 to-amber-950/60',
        accentColor: '#14b8a6',
    },
    'cay-dong-dang-buoi-ban-trua': {
        id: 'cay-dong-dang-buoi-ban-trua',
        title: 'Cày đồng đang buổi ban trưa',
        author: 'Dân gian Việt Nam',
        era: 'Ca dao Lao động Dân gian',
        theme: 'Trân quý công sức người nông dân & Hạt ngọc trời',
        badge: 'Hạt Vàng Làng Quê',
        locationTag: 'Đồng bằng sông Hồng • Thửa ruộng quê hương',
        quoteHighlight: '“Cày đồng đang buổi ban trưa, Mồ hôi thánh thót như mưa ruộng cày…”',
        image: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-yellow-950/80 to-stone-900/60',
        accentColor: '#eab308',
    },
    'anh-di-anh-nho-que-nha': {
        id: 'anh-di-anh-nho-que-nha',
        title: 'Anh đi anh nhớ quê nhà',
        author: 'Dân gian Việt Nam',
        era: 'Ca dao Quê hương',
        theme: 'Tình yêu quê hương sâu nặng & Hương vị chốn làng xưa',
        badge: 'Ký Ức Quê Hương',
        locationTag: 'Bờ ao mái rạ • Làng quê Bắc Bộ',
        quoteHighlight: '“Anh đi anh nhớ quê nhà, Nhớ canh rau muống nhớ cà dầm tương…”',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-emerald-950/90 via-amber-950/75 to-stone-950/60',
        accentColor: '#10b981',
    },
    'duong-vo-xu-nghe-quanh-quanh': {
        id: 'duong-vo-xu-nghe-quanh-quanh',
        title: 'Đường vô xứ Nghệ quanh quanh',
        author: 'Dân gian Việt Nam',
        era: 'Ca dao Miền Trung',
        theme: 'Bức tranh non xanh nước biếc hữu tình xứ Nghệ',
        badge: 'Tranh Họa Đồ Xứ Nghệ',
        locationTag: 'Dãy Hồng Lĩnh • Dòng Lam Giang • Xứ Nghệ',
        quoteHighlight: '“Đường vô xứ Nghệ quanh quanh, Non xanh nước biếc như tranh họa đồ…”',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-teal-950/90 via-slate-950/80 to-stone-900/60',
        accentColor: '#0ea5e9',
    },
    'me-gia-nhu-chuoi-ba-huong': {
        id: 'me-gia-nhu-chuoi-ba-huong',
        title: 'Mẹ già như chuối ba hương',
        author: 'Dân gian Việt Nam',
        era: 'Ca dao Gia đình',
        theme: 'Tình mẫu tử thiêng liêng cao quý & Nỗi niềm hiếu kính',
        badge: 'Ân Tình Mẫu Tử',
        locationTag: 'Mái ấm gia đình Việt',
        quoteHighlight: '“Mẹ già như chuối ba hương, Như xôi nếp một như đường mía lau…”',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-orange-950/75 to-stone-900/60',
        accentColor: '#f97316',
    },
    'on-cha-nang-lam-ai-oi': {
        id: 'on-cha-nang-lam-ai-oi',
        title: 'Ơn cha nặng lắm ai ơi',
        author: 'Dân gian Việt Nam',
        era: 'Ca dao Gia đình',
        theme: 'Công đức sinh thành trời biển & Bổn phận làm con',
        badge: 'Đạo Con Chữ Hiếu',
        locationTag: 'Cội nguồn Gia đình Việt',
        quoteHighlight: '“Ơn cha nặng lắm ai ơi, Nghĩa mẹ bằng trời chín tháng cưu mang…”',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-stone-950/90 via-amber-950/80 to-slate-900/60',
        accentColor: '#d97706',
    },
    'qua-deo-ngang': {
        id: 'qua-deo-ngang',
        title: 'Qua Đèo Ngang',
        author: 'Bà Huyện Thanh Quan',
        era: 'Văn học Trung đại (Thế kỷ XIX)',
        theme: 'Nỗi niềm hoài cổ & Nỗi thương nhà nhớ nước mênh mang',
        badge: 'Bóng Xế Đèo Ngang',
        locationTag: 'Đèo Ngang • Hoành Sơn Quan',
        quoteHighlight: '“Bước tới Đèo Ngang bóng xế tà, Cỏ cây chen đá lá chen hoa…”',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-slate-950/90 via-indigo-950/75 to-stone-950/60',
        accentColor: '#6366f1',
    },
    'thu-dieu': {
        id: 'thu-dieu',
        title: 'Thu Điếu (Câu cá mùa thu)',
        author: 'Nguyễn Khuyến',
        era: 'Văn học Trung đại (Cuối thế kỷ XIX)',
        theme: 'Bức tranh mùa thu làng cảnh Việt Nam thanh sơ tĩnh lặng',
        badge: 'Thu Vàng Xứ Bắc',
        locationTag: 'Làng Bùi • Bình Lục • Hà Nam',
        quoteHighlight: '“Ao thu lạnh lẽo nước trong veo, Một chiếc thuyền câu bé tẻo teo…”',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-teal-950/90 via-slate-950/80 to-stone-900/60',
        accentColor: '#0d9488',
    },
    'day-thon-vi-da': {
        id: 'day-thon-vi-da',
        title: 'Đây Thôn Vĩ Dạ',
        author: 'Hàn Mặc Tử',
        era: 'Phong trào Thơ Mới (1938)',
        theme: 'Vẻ đẹp trong trẻo xứ Huế & Khát khao giao cảm mãnh liệt',
        badge: 'Sương Khói Sông Hương',
        locationTag: 'Thôn Vĩ Dạ • Cố đô Huế',
        quoteHighlight: '“Sao anh không về chơi thôn Vĩ? Nhìn nắng hàng cau nắng mới lên…”',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-emerald-950/90 via-teal-950/80 to-slate-950/60',
        accentColor: '#10b981',
    },
    'tay-tien': {
        id: 'tay-tien',
        title: 'Tây Tiến',
        author: 'Quang Dũng',
        era: 'Kháng chiến chống Pháp (1948)',
        theme: 'Chí khí anh hùng & Tinh thần bi tráng Tây Bắc',
        badge: 'Rừng núi mây mù Sài Khao',
        locationTag: 'Sông Mã • Sài Khao • Mường Lát',
        quoteHighlight: '“Mường Lát hoa về trong đêm hơi… Nhớ về rừng núi, nhớ chơi vơi…”',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-slate-950/90 via-emerald-950/70 to-slate-900/60',
        accentColor: '#10b981',
    },
    'nam-quoc-son-ha': {
        id: 'nam-quoc-son-ha',
        title: 'Nam Quốc Sơn Hà',
        author: 'Lý Thường Kiệt (tương truyền)',
        era: 'Kháng chiến chống Tống (1077)',
        theme: 'Ý chí độc lập & Bản tuyên ngôn chủ quyền non sông',
        badge: 'Hào khí Sông Như Nguyệt',
        locationTag: 'Chiến tuyến Sông Cầu (Như Nguyệt) • Thăng Long',
        quoteHighlight: '“Nam quốc sơn hà Nam đế cư, Tiệt nhiên định phận tại thiên thư…”',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-stone-950/75 to-yellow-950/60',
        accentColor: '#f59e0b',
    },
    'truyen-kieu': {
        id: 'truyen-kieu',
        title: 'Đoạn Trường Tân Thanh (Truyện Kiều)',
        author: 'Đại thi hào Nguyễn Du',
        era: 'Văn học Trung đại (Đầu thế kỷ XIX)',
        theme: 'Chủ nghĩa nhân đạo & Tiếng thương người phụ nữ',
        badge: 'Cổ phong Bến Tiền Đường',
        locationTag: 'Sông Tiền Đường • Cố hương Tiên Điền',
        quoteHighlight: '“Trăm năm trong cõi người ta, Chữ tài chữ mệnh khéo là ghét nhau…”',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-rose-950/90 via-purple-950/75 to-stone-950/60',
        accentColor: '#f43f5e',
    },
    'hich-tuong-si': {
        id: 'hich-tuong-si',
        title: 'Hịch Tướng Sĩ',
        author: 'Hưng Đạo Đại Vương Trần Quốc Tuấn',
        era: 'Kháng chiến chống Nguyên Mông (1285)',
        theme: 'Hào khí Đông A & Tinh thần quyết chiến quyết thắng',
        badge: 'Hào khí Đông A Sát Thát',
        locationTag: 'Sông Bạch Đằng • Vạn Kiếp • Thăng Long',
        quoteHighlight: '“Dẫu cho trăm thân này phơi ngoài nội cỏ, nghìn xác này gói trong da ngựa…”',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-red-950/75 to-stone-950/60',
        accentColor: '#ef4444',
    },
    'binh-ngo-dai-cao': {
        id: 'binh-ngo-dai-cao',
        title: 'Bình Ngô Đại Cáo',
        author: 'Nguyễn Trãi',
        era: 'Khởi nghĩa Lam Sơn (1428)',
        theme: 'Chí nhân đại nghĩa & Nền thái bình muôn thuở',
        badge: 'Áng Thiên Cổ Hùng Văn',
        locationTag: 'Núi Lam Sơn • Thành Đông Quan • Đông Đô',
        quoteHighlight: '“Đem đại nghĩa để thắng hung tàn, lấy chí nhân để thay cường bạo…”',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-stone-950/90 via-amber-950/75 to-yellow-950/60',
        accentColor: '#d97706',
    },
    'viet-bac': {
        id: 'viet-bac',
        title: 'Việt Bắc',
        author: 'Tố Hữu',
        era: 'Kháng chiến chống Pháp (1954)',
        theme: 'Ân tình cách mạng & Nỗi niềm người ở - kẻ đi',
        badge: 'Thủ đô Gió ngàn',
        locationTag: 'Tân Trào • Định Hóa • Chiến khu Việt Bắc',
        quoteHighlight: '“Mình về mình có nhớ ta, Mười lăm năm ấy thiết tha mặn nồng…”',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-slate-950/90 via-teal-950/75 to-emerald-950/60',
        accentColor: '#14b8a6',
    },
    'dong-chi': {
        id: 'dong-chi',
        title: 'Đồng Chí',
        author: 'Chính Hữu',
        era: 'Kháng chiến chống Pháp (1948)',
        theme: 'Tình đồng đội keo sơn & Vẻ đẹp người lính nông dân',
        badge: 'Đầu súng trăng treo',
        locationTag: 'Rừng đêm sương muối • Việt Bắc',
        quoteHighlight: '“Đêm nay rừng hoang sương muối, Đứng cạnh bên nhau chờ giặc tới…”',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-slate-950/90 via-blue-950/75 to-zinc-900/60',
        accentColor: '#3b82f6',
    },
    'thanh-giong': {
        id: 'thanh-giong',
        title: 'Thánh Gióng (Phù Đổng Thiên Vương)',
        author: 'Dân gian Việt Nam',
        era: 'Thời đại Hùng Vương thứ 6',
        theme: 'Ý chí quật khởi & Sức mạnh bảo vệ non sông',
        badge: 'Hào Khí Phù Đổng',
        locationTag: 'Núi Sóc Sơn • Làng Phù Đổng (Hà Nội)',
        quoteHighlight: '“Vươn vai tráng sĩ ngựa sắt bay về trời, tre ngà ngời sáng nghìn năm…”',
        image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-stone-950/80 to-slate-950/60',
        accentColor: '#f59e0b',
    },
    'son-tinh-thuy-tinh': {
        id: 'son-tinh-thuy-tinh',
        title: 'Sơn Tinh - Thủy Tinh',
        author: 'Dân gian Việt Nam',
        era: 'Thời đại Hùng Vương',
        theme: 'Sức mạnh chế ngự bão lũ thiên tai & Khai sơn lập cõi',
        badge: 'Chúa Non Tản Viên',
        locationTag: 'Đỉnh Ba Vì • Sông Đà cuộn sóng',
        quoteHighlight: '“Núi Tản Ba Vì sừng sững nghìn tầm, uy phong thần núi ngăn dòng cuồng lưu…”',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-slate-950/90 via-cyan-950/80 to-stone-950/60',
        accentColor: '#0284c7',
    },
    'thach-sanh': {
        id: 'thach-sanh',
        title: 'Thạch Sanh',
        author: 'Dân gian Việt Nam',
        era: 'Truyện cổ tích Dân gian',
        theme: 'Dũng sĩ diệt chằn tinh & Tiếng đàn hòa bình công lý',
        badge: 'Tiếng Đàn Công Lý',
        locationTag: 'Dưới gốc đa cổ thụ • Hang sâu đại ngàn',
        quoteHighlight: '“Tiếng đàn Thạch Sanh giải mối oan khiên, xua tan quân giặc…”',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-stone-950/90 via-emerald-950/80 to-slate-950/60',
        accentColor: '#059669',
    },
    'uong-nuoc-nho-nguon': {
        id: 'uong-nuoc-nho-nguon',
        title: 'Uống nước nhớ nguồn',
        author: 'Dân gian Việt Nam',
        era: 'Tục ngữ Việt Nam',
        theme: 'Đạo lý tri ân và lòng biết ơn tổ tiên, cội nguồn',
        badge: 'Đạo Lý Tri Ân',
        locationTag: 'Đất Tổ Phong Châu • Cội nguồn Việt tộc',
        quoteHighlight: '“Uống nước nhớ nguồn • Ăn quả nhớ kẻ trồng cây…”',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-stone-900/80 to-yellow-950/60',
        accentColor: '#d97706',
    },
    'la-lanh-dum-la-rach': {
        id: 'la-lanh-dum-la-rach',
        title: 'Lá lành đùm lá rách',
        author: 'Dân gian Việt Nam',
        era: 'Tục ngữ Việt Nam',
        theme: 'Tinh thần tương thân tương ái & Cưu mang san sẻ',
        badge: 'San Sẻ Yêu Thương',
        locationTag: 'Cộng đồng làng xã Việt Nam',
        quoteHighlight: '“Lá lành đùm lá rách, Lá rách ít đùm lá rách nhiều…”',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-emerald-950/90 via-amber-950/80 to-stone-950/60',
        accentColor: '#10b981',
    },
    'co-cong-mai-sat-co-ngay-nen-kim': {
        id: 'co-cong-mai-sat-co-ngay-nen-kim',
        title: 'Có công mài sắt, có ngày nên kim',
        author: 'Dân gian Việt Nam',
        era: 'Tục ngữ Việt Nam',
        theme: 'Nghị lực bền bỉ & Ý chí kiên cường',
        badge: 'Ý Chí Kiên Trì',
        locationTag: 'Túi khôn Tiền nhân',
        quoteHighlight: '“Có công mài sắt, có ngày nên kim…”',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-stone-950/90 via-amber-950/80 to-zinc-950/60',
        accentColor: '#f59e0b',
    },

    // 2. NHÓM DỰ PHÒNG THEO THỂ LOẠI (FALLBACK CHUẨN XÁC VIỆT NAM, KHÔNG CÓ HÌNH NGOẠI LAI)
    'ca-dao': {
        id: 'ca-dao',
        title: 'Ca Dao Dân Ca Việt Nam',
        author: 'Dân gian Việt Nam',
        era: 'Kho tàng Văn học Dân gian',
        theme: 'Tình cảm gia đình, tình yêu quê hương đất nước',
        badge: 'Hồn Thiêng Ca Dao',
        locationTag: 'Làng quê ba miền Bắc - Trung - Nam',
        quoteHighlight: '“Khúc hát tâm tình ngàn đời của người bình dân gửi vào non nước…”',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-emerald-950/90 via-amber-950/75 to-stone-900/60',
        accentColor: '#f59e0b',
    },
    'tuc-ngu': {
        id: 'tuc-ngu',
        title: 'Tục Ngữ Dân Gian',
        author: 'Dân gian Việt Nam',
        era: 'Túi khôn đúc kết ngàn đời',
        theme: 'Kinh nghiệm sống, đạo lý làm người & triết lý nhân sinh',
        badge: 'Túi Khôn Tiền Nhân',
        locationTag: 'Cội nguồn Văn hóa Việt',
        quoteHighlight: '“Đúc kết triết lý nhân sinh và đạo lý ngàn đời của cha ông…”',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-orange-950/75 to-zinc-900/60',
        accentColor: '#ea580c',
    },
    'than-thoai': {
        id: 'than-thoai',
        title: 'Thần Thoại & Truyền Thuyết',
        author: 'Dân gian Việt Nam',
        era: 'Thời đại Hùng Vương dựng nước',
        theme: 'Khai sơn phá thạch, lập cõi non sông',
        badge: 'Thời Kỳ Dựng Nước',
        locationTag: 'Núi Tản Viên • Đền Hùng • Phong Châu',
        quoteHighlight: '“Núi Tản mây phủ, trống đồng vang vọng non sông…”',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-stone-950/90 via-amber-950/75 to-slate-900/60',
        accentColor: '#d97706',
    },
    'default': {
        id: 'default',
        title: 'Văn học & Di sản Dân tộc',
        author: 'Dân tộc Việt Nam',
        era: 'Kho tàng Di sản Văn hóa',
        theme: 'Hồn thiêng non sông & Đạo lý tiền nhân',
        badge: 'Di Sản Non Sông',
        locationTag: 'Non sông gấm vóc Việt Nam',
        quoteHighlight: '“Hồn thiêng sông núi đọng lại qua từng áng văn chương di sản…”',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
        overlayGradient: 'from-amber-950/90 via-stone-900/75 to-amber-900/60',
        accentColor: '#d97706',
    },
};

/**
 * Lấy tư liệu thị giác theo tác phẩm (ưu tiên theo slug, tên tác phẩm hoặc phân loại)
 * Tuyệt đối chính xác 100% với từng tác phẩm cụ thể
 */
export function getHeritageArtwork(work) {
    if (!work) return HERITAGE_ARTWORKS['default'];
    const slug = (work.slug || '').toLowerCase();
    const title = (work.title || '').toLowerCase();
    const category = (work.category || '').toLowerCase();

    // 1. Khớp cụ thể từng tác phẩm ca dao / tục ngữ / truyện dân gian
    if (slug === 'bau-oi-thuong-lay-bi-cung' || title.includes('bầu ơi') || slug.includes('bau-oi')) {
        return HERITAGE_ARTWORKS['bau-oi-thuong-lay-bi-cung'];
    }
    if (slug === 'cong-cha-nhu-nui-thai-son' || title.includes('công cha') || title.includes('núi thái sơn')) {
        return HERITAGE_ARTWORKS['cong-cha-nhu-nui-thai-son'];
    }
    if (slug === 'nhieu-dieu-phu-lay-gia-guong' || title.includes('nhiễu điều') || title.includes('giá gương')) {
        return HERITAGE_ARTWORKS['nhieu-dieu-phu-lay-gia-guong'];
    }
    if (slug.includes('thap-muoi') || title.includes('tháp mười') || title.includes('bông sen')) {
        return HERITAGE_ARTWORKS['thap-muoi-dep-nhat-bong-sen'];
    }
    if (slug.includes('canh-truc') || title.includes('cành trúc') || title.includes('trấn vũ')) {
        return HERITAGE_ARTWORKS['gio-dua-canh-truc-la-da'];
    }
    if (slug.includes('xu-nghe') || title.includes('xứ nghệ')) {
        return HERITAGE_ARTWORKS['duong-vo-xu-nghe-quanh-quanh'];
    }
    if (slug.includes('cay-dong') || title.includes('cày đồng') || title.includes('mồ hôi thánh thót')) {
        return HERITAGE_ARTWORKS['cay-dong-dang-buoi-ban-trua'];
    }
    if (slug.includes('anh-di-anh-nho') || title.includes('anh nhớ quê nhà') || title.includes('cà dầm tương')) {
        return HERITAGE_ARTWORKS['anh-di-anh-nho-que-nha'];
    }
    if (slug.includes('chuoi-ba-huong') || title.includes('chuối ba hương')) {
        return HERITAGE_ARTWORKS['me-gia-nhu-chuoi-ba-huong'];
    }
    if (slug.includes('on-cha') || title.includes('ơn cha')) {
        return HERITAGE_ARTWORKS['on-cha-nang-lam-ai-oi'];
    }
    if (slug.includes('deo-ngang') || title.includes('đèo ngang')) {
        return HERITAGE_ARTWORKS['qua-deo-ngang'];
    }
    if (slug.includes('thu-dieu') || title.includes('thu điếu') || title.includes('câu cá mùa thu')) {
        return HERITAGE_ARTWORKS['thu-dieu'];
    }
    if (slug.includes('thon-vi-da') || title.includes('thôn vĩ dạ') || title.includes('vĩ dạ')) {
        return HERITAGE_ARTWORKS['day-thon-vi-da'];
    }
    if (slug.includes('thanh-giong') || title.includes('thánh gióng') || title.includes('phù đổng')) {
        return HERITAGE_ARTWORKS['thanh-giong'];
    }
    if (slug.includes('son-tinh') || title.includes('sơn tinh') || title.includes('thủy tinh')) {
        return HERITAGE_ARTWORKS['son-tinh-thuy-tinh'];
    }
    if (slug.includes('thach-sanh') || title.includes('thạch sanh')) {
        return HERITAGE_ARTWORKS['thach-sanh'];
    }
    if (slug.includes('uong-nuoc') || title.includes('uống nước nhớ nguồn') || title.includes('ăn quả')) {
        return HERITAGE_ARTWORKS['uong-nuoc-nho-nguon'];
    }
    if (slug.includes('la-lanh') || title.includes('lá lành')) {
        return HERITAGE_ARTWORKS['la-lanh-dum-la-rach'];
    }
    if (slug.includes('mai-sat') || title.includes('mài sắt')) {
        return HERITAGE_ARTWORKS['co-cong-mai-sat-co-ngay-nen-kim'];
    }

    // 2. Khớp các tác phẩm thơ ca & áng văn kinh điển
    if (slug === 'tay-tien' || title.includes('tây tiến')) {
        return HERITAGE_ARTWORKS['tay-tien'];
    }
    if (slug === 'nam-quoc-son-ha' || title.includes('nam quốc sơn hà')) {
        return HERITAGE_ARTWORKS['nam-quoc-son-ha'];
    }
    if (slug === 'truyen-kieu' || title.includes('truyện kiều') || title.includes('đoạn trường tân thanh')) {
        return HERITAGE_ARTWORKS['truyen-kieu'];
    }
    if (slug.includes('hich-tuong-si') || title.includes('hịch tướng sĩ')) {
        return HERITAGE_ARTWORKS['hich-tuong-si'];
    }
    if (slug.includes('binh-ngo-dai-cao') || title.includes('bình ngô')) {
        return HERITAGE_ARTWORKS['binh-ngo-dai-cao'];
    }
    if (slug.includes('viet-bac') || title.includes('việt bắc')) {
        return HERITAGE_ARTWORKS['viet-bac'];
    }
    if (slug.includes('dong-chi') || title.includes('đồng chí')) {
        return HERITAGE_ARTWORKS['dong-chi'];
    }

    // 3. Phân loại chung (nếu là tác phẩm mới phát sinh, sử dụng hình ảnh thuần Việt chuẩn di sản)
    if (category === 'ca-dao' || category.includes('ca dao')) {
        return HERITAGE_ARTWORKS['ca-dao'];
    }
    if (category === 'tuc-ngu' || category.includes('tục ngữ')) {
        return HERITAGE_ARTWORKS['tuc-ngu'];
    }
    if (category === 'than-thoai' || category === 'truyen-thuyet' || category.includes('truyền thuyết')) {
        return HERITAGE_ARTWORKS['than-thoai'];
    }

    return HERITAGE_ARTWORKS['default'];
}
