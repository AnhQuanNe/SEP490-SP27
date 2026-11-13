/**
 * knowledgeGraphTours.constants.js
 * Quản lý định nghĩa và kịch bản 4 Tour Du Hành Tiến Hóa Thi Pháp (Semantic Drift Tours)
 * Chuẩn hóa 100% kiến thức học thuật theo chương trình Ngữ Văn chuẩn quốc gia (Bộ GD&ĐT)
 * Tích hợp mạch nguồn chuyển tiếp (Contextual Transition Bridges) mượt mà, sâu sắc giữa các chặng.
 */

/**
 * Xây dựng danh sách kịch bản tham quan động dựa trên dữ liệu thực tế từ cơ sở dữ liệu
 * @param {Array} works Danh sách tác phẩm từ MongoDB
 * @param {Object} topicNodeIds Map tên topic sang ID nốt đồ thị
 * @param {Object} tagNodeIds Map tên tag sang ID nốt đồ thị
 * @returns {Array} Danh sách 4 tour tiến hóa thi pháp tuyển chọn
 */
function buildDynamicTours(works, topicNodeIds, tagNodeIds) {
    const tours = [];

    // Helper tìm tác phẩm theo thứ tự ưu tiên của danh sách từ khóa/slug (ưu tiên từ khóa đứng trước)
    const findWork = (...keywords) => {
        for (const kw of keywords) {
            const k = kw.toLowerCase();
            const found = works.find((w) => {
                const slug = (w.slug || '').toLowerCase();
                const title = (w.title || '').toLowerCase();
                return slug === k || slug.includes(k) || title.includes(k);
            });
            if (found) return found;
        }
        return null;
    };

    // Helper tìm topic ID theo thứ tự ưu tiên của từ khóa
    const findTopicId = (...keywords) => {
        for (const kw of keywords) {
            const k = kw.toLowerCase();
            const entry = Object.entries(topicNodeIds).find(([name]) => name.toLowerCase().includes(k));
            if (entry) return entry[1];
        }
        return Object.values(topicNodeIds)[0];
    };

    // -------------------------------------------------------------
    // TOUR 1: TIẾN HÓA HÌNH TƯỢNG NGƯỜI ANH HÙNG VỆ QUỐC (Kỷ 1 -> Kỷ 3 -> Kỷ 5)
    // -------------------------------------------------------------
    const giongWork = findWork('thanh-giong', 'thánh gióng');
    const patriotMedieval = findWork('nam-quoc-son-ha', 'nam quốc', 'binh-ngo', 'bình ngô');
    const patriotModern = findWork('tay-tien', 'tây tiến', 'bai-tho-ve-tieu-doi-xe-khong-kinh', 'xe không kính', 'tiểu đội');
    const patriotTopicId = findTopicId('yêu nước', 'khí phách');

    const heroStops = [];
    if (giongWork) {
        heroStops.push({
            nodeId: `work-${giongWork._id}`,
            phase: 'Kỷ 1: Khởi nguyên Thần thoại',
            eraId: 1,
            title: giongWork.title,
            role: 'Vóc dáng người khổng lồ thời lập quốc',
            semanticDrift: 'Hình tượng anh hùng được thần thánh hóa thành người khổng lồ mang sức mạnh vũ trụ, phản ánh sức mạnh quật khởi sơ khai của cả cộng đồng thời dựng nước.',
            transition: 'Mở đầu dòng chảy vệ quốc từ cội nguồn huyền sử thời các vua Hùng dựng nước.',
            story: giongWork.summary || 'Cậu bé làng Phù Đổng vươn vai thành tráng sĩ cưỡi ngựa sắt dẹp tan giặc Ân.',
            quote: 'Đứa trẻ lên ba vươn vai thành tráng sĩ / Cưỡi ngựa sắt, nhổ tre ngà quét sạch bóng thù...',
            insight: 'Biểu tượng cho sức mạnh bất tử của nhân dân mỗi khi non sông lâm nguy.',
            voiceNarration: 'Mở đầu chuyến du hành tiến hóa thi pháp, chúng ta trở về thuở hồng hoang lập quốc với tượng đài Thánh Gióng. Lúc này, sức mạnh tự cường của dân tộc được thần thánh hóa thành vóc dáng người khổng lồ siêu phàm, vươn vai cưỡi ngựa sắt, nhổ tre ngà đánh tan giặc dữ để bảo vệ non sông.',
        });
    }
    if (patriotMedieval) {
        heroStops.push({
            nodeId: `work-${patriotMedieval._id}`,
            phase: 'Kỷ 3: Ý thức Chủ quyền & Hào khí Đông A',
            eraId: 3,
            title: patriotMedieval.title,
            role: 'Ý thức tự tôn dân tộc & Khí phách kiên trung',
            semanticDrift: 'Chuyển hóa từ thần thoại siêu thực sang ý thức chủ quyền bờ cõi thiêng liêng, lấy sức mạnh chính nghĩa và lòng trung quân ái quốc của con người thực tế làm điểm tựa.',
            transition: 'Rời cõi huyền sử thần thoại, khi quốc gia phong kiến Đại Việt bước vào kỷ nguyên độc lập tự chủ, vóc dáng người khổng lồ siêu nhiên đã chuyển hóa thành ý thức chủ quyền bờ cõi thiêng liêng của con người bằng xương bằng thịt.',
            story: patriotMedieval.summary || 'Bản tuyên ngôn độc lập hào hùng khẳng định chủ quyền cương vực Đại Việt bên phòng tuyến sông Như Nguyệt.',
            quote: patriotMedieval.quote || 'Nam quốc sơn hà Nam đế cư,\nTiệt nhiên định phận tại thiên thư.\nNhư hà nghịch lỗ lai xâm phạm,\nNhữ đẳng hành khan thủ bại hư!',
            insight: 'Ý thức độc lập chủ quyền là rường cột vững chắc nhất của lịch sử ngàn năm dựng nước.',
            voiceNarration: 'Chuyển tiếp từ cõi huyền thoại, khi lịch sử Đại Việt bước vào kỷ nguyên độc lập tự chủ, người anh hùng không còn nương tựa vào phép màu thần linh. Thay vào đó, tượng đài vệ quốc kết tinh thành ý thức chủ quyền bờ cõi thiêng liêng và hào khí quật cường trong bản tuyên ngôn hùng tráng Nam Quốc Sơn Hà bên chiến lũy sông Như Nguyệt.',
        });
    }
    if (patriotModern) {
        const isTayTien = (patriotModern.title || '').toLowerCase().includes('tây tiến') || (patriotModern.slug || '').includes('tay-tien');
        const isXeKhongKinh = (patriotModern.title || '').toLowerCase().includes('xe không kính') || (patriotModern.slug || '').includes('xe-khong-kinh') || (patriotModern.title || '').toLowerCase().includes('tiểu đội');

        let modernRole = 'Tâm hồn hào hoa & Tinh thần lạc quan cách mạng';
        let modernDrift = 'Hình tượng anh hùng hội tụ thành người chiến sĩ bình dị nhưng mang tâm hồn hào hoa, tinh thần ung dung lạc quan, biến mưa bom bão đạn thành khúc ca khải hoàn.';
        let modernTransition = 'Vượt qua gươm giáo thời phong kiến, ngọn lửa yêu nước bước vào thời đại kháng chiến của toàn dân tộc, nơi người anh hùng hòa mình vào dáng dấp bình dị của người lính thời đại mới.';
        let modernQuote = patriotModern.quote || 'Tây Tiến đoàn binh không mọc tóc,\nQuân xanh màu lá dữ oai hùm...';
        let modernVoice = `Đến thời đại kháng chiến, tượng đài anh hùng trở nên gần gũi vô cùng qua hình ảnh người chiến sĩ ${patriotModern.title}.`;

        if (isTayTien) {
            modernRole = 'Vẻ đẹp bi tráng & Tâm hồn lãng mạn hào hoa';
            modernDrift = 'Người anh hùng cách mạng không còn là tượng đài gươm giáo thời xưa, mà hiện lên với vẻ đẹp bi tráng giữa núi rừng Tây Bắc hiểm trở, mang cốt cách hào hoa của tuổi trẻ Thủ đô và lý tưởng xả thân vì độc lập tự do.';
            modernTransition = 'Rời khỏi gươm giáo và hào khí cung đình thời phong kiến, dòng chảy vệ quốc bước vào thời đại toàn dân kháng chiến, nơi người anh hùng chính là những chàng trai Hà thành rời giảng đường xông pha nơi chiến hào hiểm trở.';
            modernQuote = 'Tây Tiến đoàn binh không mọc tóc,\nQuân xanh màu lá dữ oai hùm.\nMắt trừng gửi mộng qua biên giới,\nĐêm mơ Hà Nội dáng kiều thơm...';
            modernVoice = 'Rời gươm giáo cung đình xưa, ngọn lửa vệ quốc bước vào thời đại kháng chiến toàn dân. Người anh hùng thời đại mới kết tinh trọn vẹn qua đoàn binh Tây Tiến của Quang Dũng. Giữa núi rừng miền Tây gian khổ khốc liệt, người lính hiện lên với vẻ đẹp vừa hào hùng bi tráng, vừa ngời sáng chất lãng mạn hào hoa của tuổi trẻ Thủ đô quyết tử cho Tổ quốc quyết sinh.';
        } else if (isXeKhongKinh) {
            modernRole = 'Tư thế hiên ngang & Nụ cười lạc quan cách mạng';
            modernDrift = 'Hình tượng anh hùng hội tụ thành người chiến sĩ lái xe Trường Sơn với tư thế ung dung, phong thái hiên ngang và tiếng cười lạc quan át đi mưa bom bão đạn của quân thù.';
            modernTransition = 'Từ hào khí xông pha nơi sa trường cổ điển, tinh thần vệ quốc hiện đại chuyển hóa thành tư thế ung dung, tinh nghịch và nụ cười ngạo nghễ của người lính lái xe Trường Sơn.';
            modernQuote = 'Không có kính, ừ thì có bụi,\nBụi phun tóc trắng như người già.\nChưa cần rửa, phì phèo châm điếu thuốc,\nNhìn nhau mặt lấm cười ha ha.';
            modernVoice = 'Đến cuộc kháng chiến chống Mỹ cứu nước, tượng đài anh hùng trở nên vô cùng sống động qua hình ảnh người lính lái xe Trường Sơn trong thơ Phạm Tiến Duật. Sự tàn khốc của bom đạn bị đẩy lùi bởi nụ cười ha ha lạc quan, tư thế hiên ngang và ý chí xẻ dọc Trường Sơn đi cứu nước.';
        }

        heroStops.push({
            nodeId: `work-${patriotModern._id}`,
            phase: 'Kỷ 5: Người lính bình dị thời đại mới',
            eraId: 5,
            title: patriotModern.title,
            role: modernRole,
            semanticDrift: modernDrift,
            transition: modernTransition,
            story: patriotModern.summary || 'Hình ảnh những người lính dũng cảm, phong thái hiên ngang giữa chiến trường khốc liệt.',
            quote: modernQuote,
            insight: 'Vẻ đẹp của chủ nghĩa anh hùng cách mạng kết tinh từ tinh thần lạc quan và lý tưởng cống hiến vì non sông.',
            voiceNarration: modernVoice,
        });
    }
    if (patriotTopicId) {
        heroStops.push({
            nodeId: patriotTopicId,
            phase: 'Đúc kết Mạch nguồn Thiêng liêng',
            eraId: 5,
            title: 'Lòng Yêu Nước & Khí Phách Vệ Quốc',
            role: 'Hồn thiêng sông núi ngàn đời',
            semanticDrift: 'Sự tiến hóa của hình tượng từ thần thoại đến con người đời thường minh chứng cho dòng chảy bất tử: khi Tổ quốc cần, mỗi người dân bình dị đều có thể hóa thân thành tráng sĩ.',
            transition: 'Từ vóc dáng thần thoại, qua tuyên ngôn bờ cõi đến nụ cười người lính hôm nay, mạch nguồn tiến hóa của người anh hùng hội tụ về trụ cột tư tưởng vĩnh cửu của dân tộc.',
            story: 'Mạch nguồn tinh thần mạnh mẽ nhất hun đúc nên bản lĩnh và cốt cách kiên cường của dân tộc Việt Nam.',
            quote: 'Non sông Việt Nam có trở nên tươi đẹp hay không chính là nhờ sự tiếp nối của các thế hệ.',
            insight: 'Hào khí dân tộc là cội rễ tinh thần xuyên suốt từ thuở lập quốc đến hôm nay.',
            voiceNarration: 'Hành trình khép lại nơi cội nguồn thiêng liêng nhất: Trụ cột Lòng yêu nước và Khí phách vệ quốc. Hơn bốn nghìn năm lịch sử, hình tượng người anh hùng đã tiến hóa từ huyền thoại vào hiện thực, khẳng định chân lý bất diệt: khi Tổ quốc cần, mỗi người dân bình dị đều có thể hóa thân thành tráng sĩ giữ gìn bờ cõi.',
        });
    }

    if (heroStops.length >= 2) {
        tours.push({
            id: 'tour-hero-evolution',
            title: 'Tiến Hóa Hình Tượng Người Anh Hùng Vệ Quốc',
            subtitle: 'Hành trình biến chuyển thi pháp từ Thần Thoại đến Người Lính Hiện Đại',
            badge: '🧬 Tiến Hóa Thi Pháp',
            icon: 'Shield',
            themeColor: '#f59e0b',
            duration: 'khoảng 3 phút',
            description: 'Khám phá sự trôi dạt ngữ nghĩa độc đáo: từ vóc dáng khổng lồ siêu nhiên của Thánh Gióng, qua hào khí Đông A kiên trung, đến nụ cười bình dị lạc quan của người lính thời đại mới.',
            stops: heroStops,
        });
    }

    // -------------------------------------------------------------
    // TOUR 2: TIẾN HÓA CỦA ĐẠO HIẾU & TÌNH NGHĨA GIA ĐÌNH (Ca dao -> Kiều -> Hoài cổ)
    // -------------------------------------------------------------
    const familyCaDao = findWork('cong-cha-nhu-nui-thai-son', 'công cha', 'me-gia', 'mẹ già');
    const kieuWork = findWork('truyen-kieu', 'truyện kiều', 'đoạn trường');
    const deoNgangWork = findWork('qua-deo-ngang', 'đèo ngang');
    const familyTopicId = findTopicId('gia đình', 'phong tục');

    const familyStops = [];
    if (familyCaDao) {
        familyStops.push({
            nodeId: `work-${familyCaDao._id}`,
            phase: 'Kỷ 2: Khởi sinh Đạo Hiếu Dân Gian',
            eraId: 2,
            title: familyCaDao.title,
            role: 'Đạo làm con & Công ơn sinh thành',
            semanticDrift: 'Đạo hiếu được ước lệ hóa cụ thể qua các biểu tượng thiên nhiên kỳ vĩ (núi cao, nguồn nước), xác lập chuẩn mực đạo đức đầu đời của người Việt.',
            transition: 'Khởi đầu mạch nguồn gia đạo từ những câu hát ru mộc mạc nuôi dưỡng tâm hồn thuở nằm nôi.',
            story: familyCaDao.summary || 'Lời răn dạy sâu sắc về công cha nghĩa mẹ.',
            quote: familyCaDao.quote || 'Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.\nMột lòng thờ mẹ kính cha,\nCho tròn chữ hiếu mới là đạo con.',
            insight: 'Chữ hiếu là cội nguồn của nhân cách và đạo lý làm người.',
            voiceNarration: 'Khởi đầu dòng chảy gia đạo, câu ca dao Công cha như núi Thái Sơn đã khắc ghi đạo làm con bằng những biểu tượng thiên nhiên kỳ vĩ. Đây chính là chuẩn mực đạo đức đầu đời, nhắc nhở mỗi con người về cội nguồn sinh thành và dưỡng dục thiêng liêng.',
        });
    }
    if (kieuWork) {
        familyStops.push({
            nodeId: `work-${kieuWork._id}`,
            phase: 'Kỷ 4: Đức Hi Sinh & Nỗi Đau Thân Phận',
            eraId: 4,
            title: kieuWork.title,
            role: 'Chữ Hiếu đặt trước bão táp nghịch cảnh',
            semanticDrift: 'Chữ Hiếu không còn là bổn phận êm đềm, mà được đẩy lên đỉnh điểm thử thách thành đức hi sinh tự nguyện vì gia đình, hòa cùng tiếng kêu nhân đạo xé lòng.',
            transition: 'Từ lời răn êm đềm thời ấu thơ, khi con người bước vào bão táp nghịch cảnh xã hội phong kiến, chữ Hiếu không còn là bổn phận phẳng lặng mà được đẩy lên đỉnh điểm thử thách thành đức hi sinh cao cả.',
            story: kieuWork.summary || 'Bi kịch nàng Kiều bán mình chuộc cha và em, hy sinh mối tình đầu son sắt.',
            quote: 'Duyên hội ngộ, đức cù lao,\nBên tình bên hiếu, bên nào nặng hơn?\nĐể lời thệ hải minh sơn,\nLàm con trước phải đền ơn sinh thành.',
            insight: 'Đức hi sinh vì người thân là đỉnh cao nhân bản của văn học trung đại.',
            voiceNarration: 'Rời khúc ru êm đềm thuở ấu thơ, bước vào thời đại trung đại đầy giông bão, chữ Hiếu qua ngòi bút Nguyễn Du được thử thách khốc liệt trước bi kịch số phận. Nàng Kiều đã đành lòng gác lại mối tình đầu son sắt, quyết định bán mình chuộc cha và em, nâng chữ Hiếu thành đức hi sinh nhân bản thiêng liêng thấu tận trời xanh.',
        });
    }
    if (deoNgangWork) {
        familyStops.push({
            nodeId: `work-${deoNgangWork._id}`,
            phase: 'Kỷ 4: Tình Nhà Hòa Cùng Nợ Nước',
            eraId: 4,
            title: deoNgangWork.title,
            role: 'Nỗi nhớ gia đình nơi đầu non góc biển',
            semanticDrift: 'Tình cảm gia đình được thi vị hóa trong không gian hoài niệm mênh mông, nỗi thương nhà da diết quyện hòa cùng nỗi trăn trở non sông thế sự.',
            transition: 'Từ nỗi đau hi sinh của số phận riêng lẻ, tình cảm gia đình tiếp tục mở rộng biên độ, hòa cùng nỗi trăn trở non sông của người lữ khách nơi đầu non góc biển.',
            story: deoNgangWork.summary || 'Cảnh Đèo Ngang lúc chiều tà và tâm trạng cô đơn của người lữ thứ.',
            quote: deoNgangWork.quote || 'Nhớ nước đau lòng con quốc quốc,\nThương nhà mỏi miệng cái gia gia.',
            insight: 'Gia đình là bến đỗ bình yên nhất trong tâm tưởng người lữ khách muôn phương.',
            voiceNarration: 'Từ bi kịch thân phận, tình cảm gia đình tiếp tục chuyển mình trong không gian lữ thứ của Bà Huyện Thanh Quan. Đứng trước Đèo Ngang lúc hoàng hôn buông xuống, tiếng lòng thương nhà da diết đã quyện hòa cùng nỗi nhớ nước, đưa tình cảm gia đình thăng hoa thành một nét tâm sự hoài niệm đầy sâu lắng.',
        });
    }
    if (familyTopicId) {
        familyStops.push({
            nodeId: familyTopicId,
            phase: 'Đúc kết Trụ cột Đạo đức',
            eraId: 4,
            title: 'Tình Cảm Gia Đình & Phong Tục',
            role: 'Gốc rễ bền chặt của văn hóa dân tộc',
            semanticDrift: 'Từ lời ca dao mộc mạc đến đức hi sinh trong bi kịch và nỗi nhớ nơi lữ thứ, tình cảm gia đình luôn là mạch nguồn thiêng liêng gắn kết mọi thế hệ.',
            transition: 'Trải qua lời ru ca dao, đức hi sinh trong bi kịch và nỗi nhớ nơi lữ thứ, tình thân gia đình kết tinh thành rường cột văn hóa bền chặt nhất của nếp nhà Việt Nam.',
            story: 'Gia đình là tế bào xã hội, nơi lưu giữ tinh hoa phong tục và đạo hiếu truyền đời.',
            quote: 'Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.',
            insight: 'Đạo hiếu phụng dưỡng là điểm tựa tâm hồn bất biến của người Việt.',
            voiceNarration: 'Hành trình chữ Hiếu khép lại tại trụ cột Tình cảm gia đình và Phong tục. Dù lịch sử có bao phen biến cải, đạo hiếu phụng dưỡng tổ tiên và sự gắn kết ruột thịt mãi là bệ phóng tâm hồn, gìn giữ cốt cách của con người Việt Nam qua muôn thế hệ.',
        });
    }

    if (familyStops.length >= 2) {
        tours.push({
            id: 'tour-family-evolution',
            title: 'Tiến Hóa Của Đạo Hiếu & Tình Nghĩa Gia Đình',
            subtitle: 'Từ Lời Răn Ca Dao, Đức Hi Sinh Nàng Kiều đến Nỗi Nhớ Nơi Lữ Thứ',
            badge: '🧬 Tiến Hóa Thi Pháp',
            icon: 'Heart',
            themeColor: '#ec4899',
            duration: 'khoảng 3 phút',
            description: 'Theo dõi bước chuyển mình của chữ Hiếu: từ bổn phận thiêng liêng thuở ấu thơ, nâng tầm thành đức hi sinh vĩ đại của nàng Kiều, đến nỗi niềm gắn kết giữa tình nhà và nợ nước.',
            stops: familyStops,
        });
    }

    // -------------------------------------------------------------
    // TOUR 3: TIẾN HÓA CỦA THIÊN NHIÊN NON NƯỚC & HỒN QUÊ (Ca dao -> Thơ cổ -> Thơ Mới)
    // -------------------------------------------------------------
    const natureCaDao = findWork('anh-di-anh-nho-que-nha', 'anh đi anh nhớ', 'canh rau muống');
    const natureMedieval = findWork('thu-dieu', 'thu điếu', 'câu cá mùa thu');
    const natureModern = findWork('day-thon-vi-da', 'vĩ dạ', 'thôn vĩ');
    const natureTopicId = findTopicId('thiên nhiên', 'giao cảm');

    const natureStops = [];
    if (natureCaDao) {
        natureStops.push({
            nodeId: `work-${natureCaDao._id}`,
            phase: 'Kỷ 2: Hồn Quê Dân Dã Thuần Phác',
            eraId: 2,
            title: natureCaDao.title,
            role: 'Hình tượng quê hương mộc mạc đời thường',
            semanticDrift: 'Cảnh sắc thiên nhiên và quê hương được đồng nhất với những hương vị và sinh hoạt bình dị nhất: bát canh rau muống, quả cà dầm tương, nụ cười người thương.',
            transition: 'Bắt đầu hành trình từ những hình ảnh dân dã, chân chất nhất của làng quê đồng bằng Bắc Bộ.',
            story: natureCaDao.summary || 'Nỗi nhớ da diết về những nét đẹp bình dị nhất của làng quê.',
            quote: 'Anh đi anh nhớ quê nhà,\nNhớ canh rau muống, nhớ cà dầm tương.\nNhớ ai dãi nắng dầm sương,\nNhớ ai tát nước bên đường hôm nao.',
            insight: 'Quê hương bắt đầu từ những điều thân thuộc và chân thành nhất.',
            voiceNarration: 'Mở đầu chuyến du ngoạn phong cảnh, thiên nhiên trong ca dao cổ truyền hiện lên thật thuần phác và gần gũi. Hồn quê không ở đâu xa mà kết tinh ngay trong hương vị bát canh rau muống, quả cà giòn tan và sự gắn bó nghĩa tình của người lao động.',
        });
    }
    if (natureMedieval) {
        natureStops.push({
            nodeId: `work-${natureMedieval._id}`,
            phase: 'Kỷ 4: Tâm Cảnh Giao Hòa & Nét Đẹp Ước Lệ',
            eraId: 4,
            title: natureMedieval.title,
            role: 'Cảnh sắc mùa thu tĩnh lặng của danh sĩ ẩn dật',
            semanticDrift: 'Thiên nhiên không còn thuần túy là nông thôn mộc mạc, mà trở thành chiếc gương soi tâm hồn thanh cao, tĩnh lặng và u uất trước thời cuộc của bậc đại thi hào.',
            transition: 'Từ cảnh quê sinh hoạt mộc mạc, bước sang văn học trung đại thế kỷ 19, thiên nhiên được nâng tầm thành thi pháp "tả cảnh ngụ tình", trở thành chiếc gương soi tâm hồn thanh cao và nỗi ưu thời mẫn thế của danh sĩ ẩn dật.',
            story: natureMedieval.summary || 'Bức tranh mùa thu trong trẻo, tĩnh lặng tuyệt đối nơi đồng bằng Bắc Bộ.',
            quote: 'Ao thu lạnh lẽo nước trong veo,\nMột chiếc thuyền câu bé tẻo teo.\nSóng biếc theo làn hơi gợn tí,\nLá vàng trước gió khẽ đưa vèo.',
            insight: 'Cảnh thu thanh vắng phản chiếu chiều sâu tĩnh tại của nhân cách Nho gia.',
            voiceNarration: 'Rời khung cảnh làng quê thuần phác, thiên nhiên bước vào ngòi bút thi hào Nguyễn Khuyến với sự chuyển dịch thi pháp sâu sắc. Cảnh sắc mùa thu Bắc Bộ trong vắt, tĩnh lặng tuyệt đối đã trở thành chiếc gương soi chiếu tâm cảnh cô đơn, thanh cao và nỗi niềm ưu ái với non sông của bậc danh sĩ thời thế đổi thay.',
        });
    }
    if (natureModern) {
        natureStops.push({
            nodeId: `work-${natureModern._id}`,
            phase: 'Kỷ 5: Cõi Mộng & Khát Khao Giao Cảm Cuộc Đời',
            eraId: 5,
            title: natureModern.title,
            role: 'Cảnh sắc xứ Huế huyền ảo & Cảm thức lãng mạn',
            semanticDrift: 'Thiên nhiên thăng hoa thành một cõi mộng lung linh, thanh khiết của xứ Huế, gắn liền với nỗi khát khao giao cảm và níu giữ sự sống mãnh liệt của cái tôi Thơ Mới.',
            transition: 'Từ ao thu tĩnh lặng u tịch của Nho sĩ, bước sang phong trào Thơ Mới 1932-1945, cái tôi lãng mạn đã đánh thức thiên nhiên thành cõi mộng lung linh xứ Huế và nỗi khát khao giao cảm mãnh liệt với con người.',
            story: natureModern.summary || 'Vẻ đẹp tinh khôi của vườn thôn Vĩ và tâm trạng hoài nghi, khắc khoải của thi nhân.',
            quote: 'Sao anh không về chơi thôn Vĩ?\nNhìn nắng hàng cau nắng mới lên.\nVườn ai mướt quá xanh như ngọc,\nLá trúc che ngang mặt chữ điền.',
            insight: 'Thiên nhiên là nguồn cứu rỗi tâm hồn, nơi con người gửi gắm tình yêu cuộc sống thiết tha.',
            voiceNarration: 'Bước sang phong trào Thơ Mới, thiên nhiên rũ bỏ nét ước lệ trầm mặc để bừng sáng vẻ đẹp tinh khôi qua Đây Thôn Vĩ Dạ của Hàn Mặc Tử. Vườn cau xứ Huế mướt xanh như ngọc trong ánh nắng mai không chỉ là cảnh sắc, mà đã hóa thành cõi mộng lung linh, cất lên tiếng gọi giao cảm tha thiết và nỗi níu giữ sự sống mãnh liệt của thi nhân.',
        });
    }
    if (natureTopicId) {
        natureStops.push({
            nodeId: natureTopicId,
            phase: 'Đúc kết Cảm hứng Non sông',
            eraId: 5,
            title: 'Tình Yêu Thiên Nhiên & Giao Cảm Cuộc Đời',
            role: 'Tình tự non nước muôn thuở',
            semanticDrift: 'Sự tiến hóa từ cảnh quê dân dã đến tâm cảnh trung đại và cõi mộng lãng mạn khẳng định thiên nhiên luôn là cội nguồn nuôi dưỡng cảm xúc thi ca Việt Nam.',
            transition: 'Từ bát canh quê dân dã, qua ao thu tĩnh mặc đến cõi mộng Thơ Mới, tình yêu non nước đã bồi tụ thành nguồn cảm hứng bất tận nuôi dưỡng tâm hồn dân tộc.',
            story: 'Tình yêu non nước gấm vóc hòa vào tình yêu con người và cuộc sống trần thế.',
            quote: 'Gió đưa cành trúc la đà,\nTiếng chuông Trấn Vũ canh gà Thọ Xương.',
            insight: 'Cảnh sắc quê hương là hồn cốt thiêng liêng của văn hóa dân tộc.',
            voiceNarration: 'Chuyến du hành khép lại tại trụ cột Tình yêu thiên nhiên non nước. Trải qua bao thăng trầm, thiên nhiên đất mẹ gấm vóc luôn là chiếc nôi chở che, là cội nguồn nuôi dưỡng tâm hồn và bản sắc thi ca của dân tộc Việt Nam.',
        });
    }

    if (natureStops.length >= 2) {
        tours.push({
            id: 'tour-nature-evolution',
            title: 'Tiến Hóa Hình Tượng Thiên Nhiên & Hồn Quê',
            subtitle: 'Từ Bát Canh Rau Muống, Ao Thu Tĩnh Lặng đến Vườn Cau Xanh Như Ngọc',
            badge: '🧬 Tiến Hóa Thi Pháp',
            icon: 'Mountain',
            themeColor: '#10b981',
            duration: 'khoảng 3 phút',
            description: 'Cùng du hành qua sự chuyển hóa thị giác thi ca: từ cảnh quê dân dã mộc mạc trong ca dao, qua ao thu tĩnh lặng lắng đọng của Nguyễn Khuyến, đến cõi mộng lung linh xứ Huế của Hàn Mặc Tử.',
            stops: natureStops,
        });
    }

    // -------------------------------------------------------------
    // TOUR 4: TIẾN HÓA CỦA ƯỚC VỌNG CHÍNH NGHĨA & HÒA BÌNH (Cổ tích -> Ca dao -> Đồng chí)
    // -------------------------------------------------------------
    const peaceFairyTale = findWork('thach-sanh', 'thạch sanh');
    const peaceCaDao = findWork('bau-oi-thuong-lay-bi-cung', 'bầu ơi', 'la-lanh-dum-la-rach', 'lá lành');
    const peaceModern = findWork('dong-chi', 'đồng chí');
    const peaceTopicId = findTopicId('chính nghĩa', 'hòa bình', 'tương thân');

    const peaceStops = [];
    if (peaceFairyTale) {
        peaceStops.push({
            nodeId: `work-${peaceFairyTale._id}`,
            phase: 'Kỷ 1: Khát Vọng Chính Nghĩa Thần Kỳ',
            eraId: 1,
            title: peaceFairyTale.title,
            role: 'Tiếng đàn hòa bình & Niêu cơm thần nhân đạo',
            semanticDrift: 'Ước vọng sơ khai về công lý xã hội, hóa giải chiến tranh bằng tiếng đàn tri âm thức tỉnh lương tri và niêu cơm nhân đạo thết đãi 18 nước chư hầu.',
            transition: 'Khởi đầu từ khát vọng hòa bình và công lý thuở sơ khai trong kho tàng cổ tích dân gian.',
            story: peaceFairyTale.summary || 'Chàng dũng sĩ Thạch Sanh trừ ác cứu nước, hóa giải binh đao 18 nước chư hầu.',
            quote: 'Đàn kêu tích tịch tình tang,\nAi mang công chúa dưới hang trở về.\nĐàn kêu ai chém chằn tinh,\nCho anh thiện sĩ ở đình làm quan.',
            insight: 'Tinh thần chuộng hòa bình và lòng nhân đạo cao cả của dân tộc từ thuở lập quốc.',
            voiceNarration: 'Ngay từ thuở sơ khai trong truyện cổ tích Thạch Sanh, tổ tiên ta đã gửi gắm khát vọng chính nghĩa và hòa bình. Tiếng đàn thần cảm hóa binh đao 18 nước chư hầu và niêu cơm nhân đạo ăn mãi không hết chính là biểu tượng sớm nhất cho tư tưởng hòa hiếu của dân tộc.',
        });
    }
    if (peaceCaDao) {
        peaceStops.push({
            nodeId: `work-${peaceCaDao._id}`,
            phase: 'Kỷ 2: Đạo Lý Tương Thân Đùm Bọc',
            eraId: 2,
            title: peaceCaDao.title,
            role: 'Đạo làm người thương nhau giữa cộng đồng',
            semanticDrift: 'Triết lý hòa ái được chuyển hóa thành nếp sống thường nhật: khuyên răn con người sống có trước có sau, đùm bọc sẻ chia khi cơ nhỡ hoạn nạn.',
            transition: 'Từ tiếng đàn thần kỳ trong cổ tích, tư tưởng nhân ái đã hòa vào đời sống sinh hoạt dân gian thường nhật, biến khát vọng hòa bình thành đạo lý tương thân đùm bọc giữa đồng bào.',
            story: peaceCaDao.summary || 'Lời nhắc nhở tha thiết về tình yêu thương giữa người với người trong cùng cộng đồng.',
            quote: 'Bầu ơi thương lấy bí cùng,\nTuy rằng khác giống nhưng chung một giàn.',
            insight: 'Tinh thần tương thân tương ái là chất keo gắn kết khối đại đoàn kết dân tộc.',
            voiceNarration: 'Từ biểu tượng thần kỳ của cổ tích, khát vọng hòa ái đã lắng sâu vào câu ca dao Bầu ơi thương lấy bí cùng. Triết lý hòa bình giờ đây hóa thành nếp sống thường nhật: khuyên răn con người sống đùm bọc, sẻ chia ngọt bùi để cùng nhau vượt qua mọi gian khó.',
        });
    }
    if (peaceModern) {
        peaceStops.push({
            nodeId: `work-${peaceModern._id}`,
            phase: 'Kỷ 5: Tình Đồng Chí & Sức Mạnh Đại Đoàn Kết',
            eraId: 5,
            title: peaceModern.title,
            role: 'Tình cảm tri kỷ giữa những người cùng chung lý tưởng',
            semanticDrift: 'Từ lòng thương người dân gian chuyển hóa thành tình đồng đội, tình đồng chí keo sơn của những người nông dân mặc áo lính chung một lý tưởng bảo vệ độc lập.',
            transition: 'Khi Tổ quốc bước vào cuộc chiến tranh giữ nước khốc liệt, tình yêu thương đồng loại trong ca dao đã chuyển hóa thành tình đồng chí, đồng đội keo sơn giữa những người lính chung một lý tưởng tự do.',
            story: peaceModern.summary || 'Vẻ đẹp chân thực, cảm động về tình đồng chí của những người lính thời kháng chiến.',
            quote: 'Súng bên súng, đầu sát bên đầu,\nĐêm rét chung chăn thành đôi tri kỷ,\nĐồng chí!',
            insight: 'Tình đồng chí là nguồn sức mạnh tinh thần to lớn làm nên những chiến thắng vĩ đại.',
            voiceNarration: 'Trong ngọn lửa kháng chiến vệ quốc, lòng nhân ái dân gian đã thăng hoa thành tình đồng chí thiêng liêng qua thơ Chính Hữu. Những người nông dân xa lạ, vì chung lý tưởng bảo vệ độc lập, đã gắn bó súng bên súng, đầu sát bên đầu, biến tình yêu thương thành sức mạnh đại đoàn kết đánh thắng mọi quân thù.',
        });
    }
    if (peaceTopicId) {
        peaceStops.push({
            nodeId: peaceTopicId,
            phase: 'Đúc kết Tinh thần Hòa Ái',
            eraId: 5,
            title: 'Chính Nghĩa & Ước Vọng Hòa Bình',
            role: 'Khát vọng trường tồn của dân tộc',
            semanticDrift: 'Mạch nguồn nhân nghĩa và ước vọng hòa bình từ niêu cơm Thạch Sanh đến tình đồng chí là minh chứng cho cốt cách nhân văn cao cả của người Việt qua ngàn năm.',
            transition: 'Từ tiếng đàn Thạch Sanh, qua lời ru bầu bí đến tình đồng chí nơi chiến hào, tư tưởng nhân đạo đã đúc kết thành chân lý ngàn đời: Lấy chí nhân thay cường bạo, đem đại nghĩa thắng hung tàn.',
            story: 'Đạo lý hòa ái, nhân văn luôn là kim chỉ nam dẫn lối dân tộc vượt qua mọi giông bão.',
            quote: 'Đem đại nghĩa để thắng hung tàn,\nLấy chí nhân để thay cường bạo.',
            insight: 'Chính nghĩa và lòng nhân ái là sức mạnh bất diệt của non sông.',
            voiceNarration: 'Hành trình kết tinh tại trụ cột Chính nghĩa và Ước vọng hòa bình. Mạch nguồn tư tưởng từ niêu cơm nhân đạo đến ngọn súng vệ quốc khẳng định cốt cách nhân văn cao đẹp của người Việt: lấy đại nghĩa thắng hung tàn, lấy chí nhân thay cường bạo để bảo vệ nền hòa bình trường tồn của non sông.',
        });
    }

    if (peaceStops.length >= 2) {
        tours.push({
            id: 'tour-peace-evolution',
            title: 'Tiến Hóa Của Ước Vọng Chính Nghĩa & Hòa Bình',
            subtitle: 'Từ Tiếng Đàn Thạch Sanh, Lời Khuyên Bầu Bí Đến Tình Đồng Chí Thiêng Liêng',
            badge: '🧬 Tiến Hóa Thi Pháp',
            icon: 'Sparkles',
            themeColor: '#3b82f6',
            duration: 'khoảng 3 phút',
            description: 'Theo dõi sự tiến hóa của lý tưởng hòa ái: từ tiếng đàn hòa bình và niêu cơm thần trừ gian tà trong truyện cổ tích, hóa thành đạo lý đùm bọc trong ca dao, rồi thăng hoa thành tình đồng chí keo sơn thời hiện đại.',
            stops: peaceStops,
        });
    }

    return tours;
}

module.exports = {
    buildDynamicTours,
};
