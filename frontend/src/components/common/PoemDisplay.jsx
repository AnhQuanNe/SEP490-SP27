import React from 'react';

/**
 * Tách các câu thơ được phân cách bởi dấu '/' hoặc ký tự xuống dòng '\n'
 * Loại bỏ dấu '/' và khoảng trắng dư thừa
 */
export const splitPoemLines = (text) => {
    if (!text || typeof text !== 'string') return [];
    let cleaned = text.trim();
    // Bỏ ngoặc kép bao ngoài nếu có
    if (
        (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith('“') && cleaned.endsWith('”')) ||
        (cleaned.startsWith('\'') && cleaned.endsWith('\''))
    ) {
        cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned
        .split(/\s*(?:\/|\n)\s*/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
};

/**
 * Đếm số lượng từ trong một dòng thơ
 */
const countWords = (line) => {
    if (!line) return 0;
    return line.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Component hiển thị thơ, ca dao, tục ngữ chuẩn cấu trúc nhịp điệu tiếng Việt:
 * - Tự động xuống dòng đúng cấu trúc nhịp điệu của thơ
 * - Xóa bỏ hoàn toàn các dấu gạch chéo '/' thô ráp
 * - Tự động nhận diện thể thơ Lục Bát (câu 6 chữ - câu 8 chữ) để thụt dòng câu bát chuẩn mực
 * - Hiển thị đẹp mắt, trang nhã với font chữ font-heritage
 */
const PoemDisplay = ({
    text,
    align = 'left', // 'left' | 'center'
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
    showQuotes = true,
    className = '',
    lineClassName = '',
}) => {
    if (!text) return null;

    const lines = splitPoemLines(text);
    if (lines.length === 0) return null;

    // Kích cỡ chữ linh hoạt
    const sizeMap = {
        xs: 'text-xs leading-relaxed',
        sm: 'text-xs sm:text-sm leading-relaxed',
        md: 'text-sm sm:text-base md:text-lg leading-relaxed',
        lg: 'text-base sm:text-lg md:text-xl leading-relaxed',
    };

    const currentSize = sizeMap[size] || sizeMap.md;

    // Trường hợp câu ngắn 1 vế (tục ngữ đơn, không ngắt dòng)
    if (lines.length === 1) {
        return (
            <p className={`font-heritage font-bold text-amber-950 italic ${currentSize} ${className}`}>
                {showQuotes ? `“${lines[0]}”` : lines[0]}
            </p>
        );
    }

    // Nhận diện thể thơ Lục Bát (cặp câu 6 - 8)
    const isLucBat =
        lines.length >= 2 &&
        lines.every((line, idx) => {
            const words = countWords(line);
            // Dòng chẵn (0, 2): khoảng 6 từ (dung sai 5-7), dòng lẻ (1, 3): khoảng 8 từ (dung sai 7-9)
            return idx % 2 === 0 ? words >= 5 && words <= 7 : words >= 7 && words <= 9;
        });

    return (
        <div
            className={`font-heritage font-bold text-amber-950 italic transition-all ${currentSize} ${className}`}
        >
            <div className={`space-y-1 sm:space-y-1.5 ${align === 'center' ? 'text-center' : 'text-left'}`}>
                {lines.map((line, idx) => {
                    // Nếu là lục bát và không căn giữa: câu 8 chữ thụt lề phải (indent)
                    const isBat = isLucBat && idx % 2 === 1;
                    const indentClass =
                        isLucBat && align !== 'center' ? (isBat ? 'pl-6 sm:pl-8' : 'pl-0') : '';

                    let lineText = line;
                    if (showQuotes) {
                        if (idx === 0) lineText = `“${lineText}`;
                        if (idx === lines.length - 1) lineText = `${lineText}”`;
                    }

                    return (
                        <p
                            key={idx}
                            className={`tracking-wide text-amber-950 ${indentClass} ${lineClassName}`}
                        >
                            {lineText}
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

export default PoemDisplay;
