/**
 * Xây dựng RegExp tìm kiếm tiếng Việt thông minh (hỗ trợ cả gõ có dấu lẫn không dấu)
 * Ví dụ: "thach sanh" sẽ tìm được cả "Thạch Sanh"
 * "kieu" sẽ tìm được "Truyện Kiều"
 * "giong" sẽ tìm được "Thánh Gióng"
 */
function buildVietnameseRegex(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return null;
    }

    const map = {
        'a': '[aàáảãạăằắẳẵặâầấẩẫậAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]',
        'e': '[eèéẻẽẹêềếểễệEÈÉẺẼẸÊỀẾỂỄỆ]',
        'i': '[iìíỉĩịIÌÍỈĨỊ]',
        'o': '[oòóỏõọôồốổỗộơờớởỡợOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]',
        'u': '[uùúủũụưừứửữựUÙÚỦŨỤƯỪỨỬỮỰ]',
        'y': '[yỳýỷỹỵYỲÝỶỸỴ]',
        'd': '[dđDĐ]',
    };

    // Chuẩn hóa chuỗi tìm kiếm, bỏ ký tự đặc biệt của regex
    const clean = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let pattern = '';

    for (const char of clean) {
        const lower = char.toLowerCase();
        if (map[lower]) {
            pattern += map[lower];
        } else if (/\s+/.test(char)) {
            pattern += '[\\s\\-_]+';
        } else {
            pattern += char;
        }
    }

    return new RegExp(pattern, 'i');
}

/**
 * Loại bỏ dấu tiếng Việt để so sánh chuỗi
 */
function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    return str.toLowerCase().trim();
}

module.exports = {
    buildVietnameseRegex,
    removeVietnameseTones,
};
