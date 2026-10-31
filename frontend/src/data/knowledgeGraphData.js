/**
 * knowledgeGraphData.js
 * Dữ liệu tĩnh và cấu hình kỷ nguyên lịch sử cho Đồ thị Tri thức Văn hóa.
 */

// 5 Kỷ Nguyên Lịch Sử Văn Hóa Dân Gian (Cỗ Máy Thời Gian Ngàn Năm)
export const DEFAULT_ERAS = [
    {
        id: 1,
        code: 'hung-vuong',
        name: 'Kỷ Nguyên I: Cội Nguồn Dựng Nước & Thần Thoại Lạc Hồng',
        shortName: 'Thời Hùng Vương',
        timeSpan: 'TK VII TCN - TK II TCN',
        color: '#f59e0b',
        quote: 'Dù ai đi ngược về xuôi / Nhớ ngày Giỗ Tổ mùng mười tháng ba',
        insight: 'Buổi bình minh của dân tộc với khát vọng trị thủy sông Hồng (Sơn Tinh), ý chí quật cường chống ngoại xâm (Thánh Gióng) và đạo hiếu hạt gạo bánh chưng thời Lang Liêu.',
        story: 'Vào buổi sơ khai dựng nước, tổ tiên người Việt đã sáng tạo nên những thần thoại bất hủ. Từng nắm đất, ngọn núi đều gắn với các bậc tiền nhân khai mở non sông.',
        voiceNarration: 'Chào mừng bạn bước vào Kỷ nguyên thứ nhất: Cội nguồn dựng nước và thần thoại Lạc Hồng. Đây là buổi bình minh của dân tộc, nơi tình yêu non sông và đạo lý hiếu nghĩa được khởi phát từ thuở Hùng Vương dựng nước.',
    },
    {
        id: 2,
        code: 'lang-xa-ca-dao',
        name: 'Kỷ Nguyên II: Định Hình Bản Sắc Làng Xã & Ca Dao Thuần Việt',
        shortName: 'Dân Gian & Làng Xã',
        timeSpan: 'Thời kỳ Cổ điển & Nghìn năm văn hiến',
        color: '#10b981',
        quote: 'Bầu ơi thương lấy bí cùng / Tuy rằng khác giống nhưng chung một giàn',
        insight: 'Nếp sống cộng đồng bền chặt sau lũy tre làng, kết tinh thành thi pháp ca dao bất hủ: hình tượng con cò lặn lội, cây đa bến nước con đò và đạo lý tương thân tương ái lá lành đùm lá rách.',
        story: 'Văn hóa làng xã hình thành nên linh hồn của người Việt: sự cần cù, đức hy sinh của người phụ nữ, tình làng nghĩa xóm tối lửa tắt đèn có nhau và ước vọng công lý trong truyện cổ tích Thạch Sanh.',
        voiceNarration: 'Bước sang Kỷ nguyên thứ hai: Định hình bản sắc làng xã và ca dao thuần Việt. Sau lũy tre xanh, tình đồng bào ruột thịt và đức hy sinh tảo tần của người mẹ Việt Nam đã hóa thân thành cánh cò bay lả bay la trong từng câu hát ru.',
    },
    {
        id: 3,
        code: 'hao-khi-doc-lap',
        name: 'Kỷ Nguyên III: Hào Khí Độc Lập & Danh Tác Trung Đại',
        shortName: 'Lý - Trần - Hậu Lê',
        timeSpan: 'Thế kỷ XI - Thế kỷ XV',
        color: '#3b82f6',
        quote: 'Nam quốc sơn hà Nam đế cư / Tiệt nhiên định phận tại thiên thư',
        insight: 'Thời kỳ khẳng định nền độc lập tự chủ vĩ đại của non sông với bản Tuyên ngôn Độc lập đầu tiên của Lý Thường Kiệt và thiên cổ hùng văn Bình Ngô Đại Cáo của Nguyễn Trãi.',
        story: 'Khí phách Đông A quật cường đánh tan quân xâm lược trên sông Bạch Đằng và phòng tuyến Như Nguyệt, khẳng định chủ quyền lãnh thổ thiêng liêng bất khả xâm phạm.',
        voiceNarration: 'Kỷ nguyên thứ ba: Hào khí độc lập và danh tác trung đại. Dòng máu Lạc Hồng bừng sáng khí phách kiêu hãnh của triều đại Lý, Trần, Lê, khẳng định chủ quyền non sông muôn đời bền vững.',
    },
    {
        id: 4,
        code: 'mo-coi-thi-ca',
        name: 'Kỷ Nguyên IV: Mở Cõi Phương Nam & Đỉnh Cao Thi Ca',
        shortName: 'Mở Cõi & Thi Ca',
        timeSpan: 'Thế kỷ XVII - Đầu Thế kỷ XX',
        color: '#ec4899',
        quote: 'Chữ tâm kia mới bằng ba chữ tài / Tháp Mười đẹp nhất bông sen',
        insight: 'Cuộc hành trình mở mang bờ cõi về phương Nam sông nước trù phú, kết hợp với chiều sâu chủ nghĩa nhân đạo sâu sắc trong kiệt tác Truyện Kiều và hồn thơ hoài cổ Đèo Ngang.',
        story: 'Tâm hồn dân tộc đạt tới đỉnh cao nghệ thuật thi ca qua ngòi bút Đại thi hào Nguyễn Du, cùng hào khí phóng khoáng nghĩa tình của những lưu dân khai hoang mở đất phương Nam.',
        voiceNarration: 'Kỷ nguyên thứ tư: Mở cõi phương Nam và đỉnh cao thi ca. Từ sông Hương núi Ngự đến Đồng Tháp Mười sen nở ngát hương, tiếng thơ Đoạn trường tân thanh ngân vang khúc ca nhân đạo bất tử.',
    },
    {
        id: 5,
        code: 'khang-chien-hien-dai',
        name: 'Kỷ Nguyên V: Thời Đại Kháng Chiến & Sử Thi Hiện Đại',
        shortName: 'Sử Thi Kháng Chiến',
        timeSpan: 'Thế kỷ XX - Nay',
        color: '#ef4444',
        quote: 'Đầu súng trăng treo / Xe vẫn chạy vì miền Nam phía trước',
        insight: 'Mạch ngầm yêu nước ngàn năm được thổi bùng thành ngọn lửa cách mạng thần thánh, kết tinh vẻ đẹp người lính Cụ Hồ dũng cảm, lạc quan và ngời sáng tình đồng chí.',
        story: 'Từ rừng sâu Tây Bắc đến đường mòn Hồ Chí Minh bom lửa, chủ nghĩa anh hùng cách mạng hòa quyện cùng chất thơ lãng mạn, đúc kết thành trang sử vàng rực rỡ nhất của thế kỷ 20.',
        voiceNarration: 'Kỷ nguyên thứ năm: Thời đại kháng chiến và sử thi hiện đại. Lòng yêu nước truyền đời của tổ tiên đã chuyển hóa thành sức mạnh diệu kỳ đánh thắng hai đế quốc to, đưa non sông ca khúc khải hoàn thống nhất.',
    },
];

// Danh sách nốt trọng điểm tiêu biểu cho từng kỷ nguyên
export const FLAGSHIP_MAP = {
    1: ['arch_son_tinh', 'phil_yeu_nuoc', 'arch_thanh_giong', 'work_banh_chung'],
    2: ['arch_con_co', 'arch_cay_da_ben_nuoc', 'phil_tuong_than', 'work_thach_sanh'],
    3: ['work_nam_quoc_son_ha', 'work_binh_ngo_dai_cao', 'reg_thang_long'],
    4: ['work_truyen_kieu', 'work_qua_deo_ngang', 'reg_nam_bo', 'phil_nhan_dao'],
    5: ['work_dong_chi', 'work_bai_ca_vo_dat', 'phil_yeu_nuoc'],
};

export default {
    DEFAULT_ERAS,
    FLAGSHIP_MAP,
};
