/**
 * knowledgeGraphAi.service.js
 * Quản lý toàn bộ tích hợp Trí tuệ Nhân tạo (Gemini AI Real-time) cho Đồ thị Tri thức
 * Bao gồm: Luận giải đường đi văn hóa, Phân tích nốt đơn lẻ, và Thiết kế tour tiến hóa thi pháp tùy chỉnh.
 */

const { GEMINI_MODELS } = require('../constants/aiKnowledge.constants');

class KnowledgeGraphAiService {
    /**
     * Gọi Gemini API với cơ chế Failover qua danh sách mô hình miễn phí (Free Tier)
     * Tự động xử lý dọn dẹp câu cụt và khép dấu câu hoàn chỉnh
     */
    async callGeminiFree({ prompt, systemInstruction }) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('[Gemini Knowledge Graph] GEMINI_API_KEY is not defined.');
            return null;
        }

        // Ưu tiên các model Flash tốc độ cao, hoạt động ổn định và miễn phí
        const candidateModels = [
            'gemini-flash-lite-latest',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            'gemini-3-flash-preview',
            'gemini-2.5-flash',
        ];

        const uniqueModels = [...new Set(candidateModels)];

        for (const model of uniqueModels) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.65,
                        topP: 0.9,
                        maxOutputTokens: 1024,
                    },
                };

                if (systemInstruction) {
                    payload.systemInstruction = {
                        parts: [{ text: systemInstruction }],
                    };
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const data = await response.json();
                    const candidate = data.candidates?.[0];
                    let fullText = candidate?.content?.parts?.[0]?.text?.trim();
                    const finishReason = candidate?.finishReason;

                    if (fullText) {
                        const endsWithPunctuation = /[.?!:"'”’]$/.test(fullText);

                        if (!endsWithPunctuation) {
                            const lastPunctIndex = Math.max(
                                fullText.lastIndexOf('.'),
                                fullText.lastIndexOf('!'),
                                fullText.lastIndexOf('?')
                            );

                            // Nếu phía trước đã có ít nhất 1-2 câu trọn vẹn (> 70 ký tự), cắt bỏ vế cụt ở đuôi
                            if (lastPunctIndex > 70) {
                                fullText = fullText.substring(0, lastPunctIndex + 1).trim();
                                return fullText;
                            }

                            // Nếu câu quá ngắn và bị cụt ngay câu đầu tiên
                            if (finishReason === 'MAX_TOKENS') {
                                console.warn(`[Gemini Knowledge Graph] Model ${model} output truncated. Trying next model...`);
                                continue;
                            }

                            fullText = fullText + '.';
                        }

                        return fullText;
                    }
                }
            } catch (err) {
                console.warn(`[Gemini Knowledge Graph] Model ${model} failed:`, err.message);
            }
        }
        return null;
    }

    /**
     * AI Real 100%: Luận giải chuyên sâu mạch nguồn văn hóa kết nối 2 thực thể
     */
    async explainPathWithAI(pathResult) {
        if (!pathResult.found || pathResult.path.length < 2) {
            return {
                ...pathResult,
                aiAnalysis: 'Không tìm thấy đường đi kết nối giữa hai thực thể này trên đồ thị tri thức.',
            };
        }

        const sourceNode = pathResult.path[0];
        const targetNode = pathResult.path[pathResult.path.length - 1];
        const sourceName = sourceNode?.name;
        const targetName = targetNode?.name;

        const typeLabels = {
            philosophy: 'Triết lý & Đạo lý nhân sinh',
            archetype: 'Cổ mẫu & Hình tượng biểu trưng',
            region: 'Không gian văn hóa & Địa linh',
            work: 'Tác phẩm di sản văn học',
        };

        const intermediateNodes = pathResult.path.slice(1, -1);
        const intermediateNames = intermediateNodes.map((n) => `"${n.name}"`).join(' ➔ ');

        // Xây dựng lộ trình các chặng tuần tự kèm ngữ cảnh phong phú
        const stepDescriptions = pathResult.links
            .map((l, i) => {
                const sType = typeLabels[l.sourceType] || l.sourceType || 'Thực thể';
                const tType = typeLabels[l.targetType] || l.targetType || 'Thực thể';
                let desc = `Chặng ${i + 1}: Từ "${l.sourceName}" (${sType}) bước sang "${l.targetName}" (${tType}) qua mối liên kết: "${l.label || l.relation}". Lý do liên kết: ${l.description || l.relation}.`;
                if (l.targetSummary) {
                    desc += ` [Ý nghĩa nốt đến: ${l.targetSummary}]`;
                }
                return desc;
            })
            .join('\n');

        const prompt = `Bạn là VietHeritage AI — Nhà nghiên cứu văn hóa dân gian và thi pháp học Việt Nam uyên bác.
Đồ thị tri thức VietHeritage vừa tìm thấy một mạch nguồn văn hóa kết nối từ "${sourceName}" đến "${targetName}" trải qua ${pathResult.length} chặng di sản.

Dữ liệu hành trình:
- Điểm khởi đầu (Node A): "${sourceName}" [${typeLabels[sourceNode?.type] || 'Thực thể'}]
  + Tóm lược: ${sourceNode?.summary || sourceNode?.details || 'Cội nguồn văn hóa'}
- Điểm đích đến (Node B): "${targetName}" [${typeLabels[targetNode?.type] || 'Thực thể'}]
  + Tóm lược: ${targetNode?.summary || targetNode?.details || 'Điểm kết tinh di sản'}
${intermediateNames ? `- Các mắt xích trung gian kết nối: ${intermediateNames}` : '- Mối liên kết trực tiếp giữa hai thực thể.'}

Lộ trình chi tiết từng chặng trên đồ thị:
${stepDescriptions}

MỤC TIÊU & NHIỆM VỤ CỦA BẠN:
Người dùng bấm nghe thuyết minh để hiểu VÌ SAO từ "${sourceName}" lại đến được "${targetName}", và HAI CÁI NÀY CÓ LIÊN KẾT GÌ VỚI NHAU.
Hãy sáng tác một lời thuyết minh truyền cảm hứng, sâu sắc và gãy gọn (đoạn văn liền mạch khoảng 4 đến 5 câu, độ dài khoảng 130 - 190 từ) với nội dung bắt buộc:
1. SỢI DÂY LIÊN KẾT CỐT LÕI: Nêu rõ sợi dây tư tưởng/nghệ thuật chung kết nối giữa "${sourceName}" và "${targetName}". Giải thích vì sao hai thực thể này dù khác biệt về thời gian hay thể loại nhưng lại có quan hệ kế thừa và gắn kết hữu cơ trong kho tàng văn hóa dân tộc.
2. LÝ GIẢI CÁC MẮT XÍCH CHUYỂN TIẾP: Giải thích rõ ràng vì sao từ "${sourceName}" lại bắc cầu qua ${intermediateNames ? `các mắt xích trung gian (${intermediateNames})` : 'mối liên kết này'} để dẫn tới "${targetName}". Chỉ ra tính logic văn hóa giữa các nốt kề nhau (ví dụ: từ triết lý đạo đức chuyển hóa thành hình tượng nghệ thuật dân gian, từ hình tượng nghệ thuật được khắc họa vào các áng văn thơ...).
3. SỰ THĂNG HOA TẠI ĐÍCH ĐẾN: Khẳng định khi chạm tới "${targetName}", mạch nguồn tư tưởng khởi nguyên đã kết tinh, thăng hoa thành giá trị nhân sinh hay biểu tượng bất tử nào.

YÊU CẦU ĐỊNH DẠNG ĐỂ GIỌNG ĐỌC AI PHÁT ÂM HOÀN HẢO:
- Viết thành MỘT ĐOẠN VĂN HOÀN CHỈNH DUY NHẤT. TUYỆT ĐỐI KHÔNG dùng gạch đầu dòng, KHÔNG đánh số thứ tự (1, 2, 3), KHÔNG đưa lời chào hay câu mở màn rườm rà.
- Ngôn từ trang nhã, giàu nhạc tính, câu văn có nhịp điệu uyển chuyển với các từ nối tự nhiên để khi đọc thành tiếng qua giọng đọc AI (Text-to-Speech) người nghe cảm thấy lôi cuốn, dễ hiểu và tâm đắc.`;

        const systemInstruction = `Bạn là trợ lý học thuật VietHeritage AI chuyên sâu về thi pháp học và văn hóa Việt Nam. Nhiệm vụ của bạn là giải thích sáng rõ, chuẩn xác và truyền cảm lý do kết nối logic giữa các thực thể văn hóa trên đồ thị tri thức, giúp người dùng hiểu sâu sắc căn nguyên và mối liên hệ giữa các di sản.`;

        const aiResponse = await this.callGeminiFree({ prompt, systemInstruction });

        // Fallback thông minh tự động ghép lộ trình nếu không có internet hoặc API key bận
        const fallbackSteps = pathResult.links
            .map((l, i) => `ở chặng ${i + 1}, từ "${l.sourceName}" chuyển tiếp đến "${l.targetName}" vì ${l.description || l.relation}`)
            .join('; ');
        const fallbackText = pathResult.length === 1
            ? `Hành trình văn hóa kết nối trực tiếp từ "${sourceName}" đến "${targetName}" qua quan hệ "${pathResult.links[0]?.description || pathResult.links[0]?.relation}", minh chứng cho sự gắn kết tự nhiên giữa tư tưởng và nghệ thuật trong di sản Việt Nam.`
            : `Hành trình từ "${sourceName}" đến "${targetName}" là mạch nguồn văn hóa xuyên suốt qua ${pathResult.length} chặng di sản: ${fallbackSteps}. Qua đó, giá trị tư tưởng từ khởi nguyên được bồi tụ, kế thừa và thăng hoa thành biểu tượng thiêng liêng ở điểm đích "${targetName}".`;

        return {
            ...pathResult,
            aiAnalysis: aiResponse || fallbackText,
            isAiGenerated: !!aiResponse,
        };
    }

    /**
     * AI Real 100%: Luận giải chuyên sâu một thực thể tri thức đơn lẻ
     */
    async inspectNodeWithAI(targetNode, neighborLinks, allNodes) {
        if (!targetNode) {
            return { success: false, message: 'Không tìm thấy thực thể trên đồ thị.' };
        }

        const neighborNames = neighborLinks.map((l) => {
            const otherId = l.source === targetNode.id ? l.target : l.source;
            const otherNode = allNodes.find((n) => n.id === otherId);
            return `${otherNode?.name} (${l.relation})`;
        });

        const prompt = `Bạn là chuyên gia thi pháp học và văn hóa dân gian Việt Nam của VietHeritage.
Hãy phân tích CHUYÊN SÂU RIÊNG BIỆT cho thực thể văn hóa sau:
- Tên thực thể: "${targetNode.name}"
- Phân loại tầng tri thức: "${targetNode.type}"
- Tóm tắt ý nghĩa: ${targetNode.summary || targetNode.details || ''}
- Bài học / Đạo lý: ${targetNode.lesson || ''}
- Các thực thể liên kết xung quanh: ${neighborNames.join('; ') || 'Không có'}

Yêu cầu phân tích:
1. Hãy tập trung luận giải chính xác vào ý nghĩa biểu tượng, thi pháp nghệ thuật hoặc giá trị nhân sinh của RIÊNG thực thể "${targetNode.name}". Nếu đây là một hình tượng nghệ thuật / cổ mẫu dân gian (như Tiếng đàn thần, Niêu cơm, Con cò, Cây tre...), hãy nêu bật sức mạnh biểu tượng văn hóa đặc sắc của chính hình tượng đó.
2. Viết từ 3 đến 4 câu, sâu sắc, súc tích, văn phong học thuật truyền cảm. Tuyệt đối không chào hỏi rườm rà.`;

        const aiText = await this.callGeminiFree({
            prompt,
            systemInstruction: 'Bạn là chuyên gia thi pháp học và văn hóa dân gian Việt Nam.',
        });

        return {
            success: true,
            node: targetNode,
            aiInsight: aiText || targetNode.summary || 'Thực thể văn hóa tiêu biểu của dân tộc Việt Nam.',
            isAiGenerated: !!aiText,
        };
    }

    /**
     * AI Real 100%: Tạo Tour Tiến Hóa Thi Pháp Tùy Chỉnh Bằng Gemini AI theo từ khóa
     */
    async generateCustomEvolutionTour(keyword, nodes) {
        if (!keyword || !keyword.trim()) {
            throw new Error('Vui lòng cung cấp chủ đề hoặc từ khóa hình tượng để AI thiết kế tour');
        }

        const worksList = nodes
            .filter((n) => n.type === 'work')
            .map((w) => ({ id: w.id, title: w.name, era: w.bornEra, topic: w.topic, tags: w.tags }))
            .slice(0, 35);

        const prompt = `Bạn là VietHeritage AI — Nhà nghiên cứu thi pháp học và sự tiến hóa biểu tượng văn hóa Việt Nam uyên bác.
Người dùng yêu cầu tạo một "Chuyến Du Hành Tiến Hóa Thi Pháp (Semantic Drift Tour)" theo chủ đề hoặc hình tượng: "${keyword.trim()}".

Danh sách các tác phẩm có sẵn trong Đồ thị tri thức (gồm bornEra từ 1 đến 5):
${JSON.stringify(worksList, null, 2)}

Hãy chọn ra 3 đến 4 thực thể từ danh sách trên (bắt buộc chọn các tác phẩm trải dài qua các thời kỳ khác nhau: ví dụ Kỷ 1/2 ➔ Kỷ 3/4 ➔ Kỷ 5) để minh họa rõ nét nhất sự biến đổi ngữ nghĩa (Semantic Drift) của hình tượng "${keyword.trim()}" qua dòng chảy lịch sử.

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc sau, TUYỆT ĐỐI KHÔNG thêm lời giải thích hay bọc markdown ngoài JSON:
{
  "id": "tour-custom-${Date.now()}",
  "title": "Tiến Hóa Hình Tượng ${keyword.trim()}",
  "subtitle": "Hành trình biến đổi thi pháp qua các thời kỳ lịch sử",
  "badge": "🧬 AI Tiến Hóa Thi Pháp",
  "themeColor": "#f59e0b",
  "duration": "khoảng 3 phút",
  "description": "Lời giới thiệu súc tích về cách hình tượng ${keyword.trim()} biến đổi ngữ nghĩa từ cội nguồn dân gian đến văn học hiện đại.",
  "stops": [
    {
      "nodeId": "id_chính_xác_của_tác_phẩm_từ_danh_sách",
      "phase": "Kỷ nguyên X: Tên giai đoạn",
      "eraId": 1,
      "title": "Tên tác phẩm",
      "role": "Ý nghĩa biểu tượng thời kỳ này",
      "semanticDrift": "Phân tích 1-2 câu sâu sắc về bước chuyển ngữ nghĩa / thi pháp của hình tượng ở giai đoạn này so với trước đó",
      "transition": "Lời nối chuyển tiếp bối cảnh mượt mà, logic từ chặng trước sang chặng này (ví dụ: Từ cội nguồn dân gian mộc mạc bước sang chiều sâu hoài niệm trung đại...)",
      "story": "Tóm tắt ý nghĩa tác phẩm",
      "quote": "Câu thơ hoặc trích dẫn tiêu biểu",
      "insight": "Đúc kết chiều sâu tư tưởng",
      "voiceNarration": "Đoạn văn thuyết minh truyền cảm hứng để giọng đọc AI phát âm (khoảng 2-3 câu văn liền mạch có lời nối tự nhiên)"
    }
  ]
}`;

        const aiResponse = await this.callGeminiFree({
            prompt,
            systemInstruction: 'Bạn là chuyên gia thi pháp học Việt Nam. Luôn trả về đúng định dạng JSON chuẩn không bọc markdown để hệ thống parse.',
        });

        if (aiResponse) {
            try {
                let cleaned = aiResponse.trim();
                if (cleaned.startsWith('```')) {
                    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
                }
                const parsed = JSON.parse(cleaned);
                if (parsed.stops && Array.isArray(parsed.stops) && parsed.stops.length >= 2) {
                    return parsed;
                }
            } catch (err) {
                console.warn('[Gemini Custom Tour] Parse JSON thất bại, chuyển sang tour dự phòng:', err.message);
            }
        }

        // Fallback thông minh nếu AI bận
        return this.buildFallbackCustomTour(keyword.trim(), nodes);
    }

    /**
     * Tour dự phòng nếu không kết nối được Gemini API
     */
    buildFallbackCustomTour(keyword, nodes) {
        const works = nodes.filter((n) => n.type === 'work');
        const era1Work = works.find((w) => (w.bornEra || 1) === 1) || works[0];
        const era3Work = works.find((w) => (w.bornEra || 1) === 3 || (w.bornEra || 1) === 4) || works[1];
        const era5Work = works.find((w) => (w.bornEra || 1) === 5) || works[works.length - 1];

        return {
            id: `tour-custom-${Date.now()}`,
            title: `Tiến Hóa Hình Tượng ${keyword}`,
            subtitle: 'Hành trình biến chuyển thi pháp qua các thời kỳ',
            badge: '🧬 AI Tiến Hóa Thi Pháp',
            themeColor: '#f59e0b',
            duration: 'khoảng 3 phút',
            description: `Hành trình dẫn dắt người xem chiêm ngưỡng sự chuyển biến sâu sắc của hình tượng "${keyword}" từ khởi nguyên dân gian đến thời đại mới.`,
            stops: [
                {
                    nodeId: era1Work.id,
                    phase: 'Kỷ 1: Khởi nguyên Cổ điển',
                    eraId: era1Work.bornEra || 1,
                    title: era1Work.name,
                    role: 'Cội nguồn biểu tượng sơ khai',
                    semanticDrift: `Hình tượng "${keyword}" ban đầu được gắn với tư duy thần thoại hóa hoặc lời răn dạy đạo lý thuần khiết thời kỳ đầu dựng nước.`,
                    transition: `Khởi đầu dòng chảy thi pháp từ cội nguồn dân gian thời kỳ sơ khởi.`,
                    story: era1Work.summary || 'Ý nghĩa di sản truyền đời.',
                    quote: era1Work.quote || era1Work.name,
                    insight: 'Cội nguồn định hình bản sắc văn hóa dân tộc.',
                    voiceNarration: `Mở đầu hành trình tiến hóa, chúng ta cùng chiêm ngưỡng tác phẩm ${era1Work.name}, nơi hình tượng ${keyword} khởi sinh với vẻ đẹp mộc mạc và thiêng liêng.`,
                },
                {
                    nodeId: era3Work.id,
                    phase: 'Kỷ 3/4: Chiều sâu Trung đại',
                    eraId: era3Work.bornEra || 3,
                    title: era3Work.name,
                    role: 'Khúc xạ qua nhân sinh quan trí thức',
                    semanticDrift: `Sang thời kỳ trung đại, hình tượng "${keyword}" được triết lý hóa sâu sắc hơn, soi rọi tâm trạng thế sự và chiều sâu nhân đạo của danh sĩ nước Nam.`,
                    transition: `Rời khỏi cội nguồn mộc mạc, hình tượng "${keyword}" bước vào văn học trung đại với chiều sâu chiêm nghiệm thế sự và nỗi niềm nhân thế.`,
                    story: era3Work.summary || 'Tác phẩm kết tinh tinh hoa văn học trung đại.',
                    quote: era3Work.quote || era3Work.name,
                    insight: 'Sự bồi đắp tư tưởng và ngôn ngữ thi ca qua bao thăng trầm.',
                    voiceNarration: `Chuyển tiếp sang thời kỳ trung đại, tác phẩm ${era3Work.name} đã nâng tầm hình tượng ${keyword} thành một biểu tượng đa nghĩa, chan chứa nỗi niềm thế sự của danh sĩ nước Nam.`,
                },
                {
                    nodeId: era5Work.id,
                    phase: 'Kỷ 5: Hội tụ Hiện đại',
                    eraId: era5Work.bornEra || 5,
                    title: era5Work.name,
                    role: 'Thăng hoa cùng cảm thức thời đại mới',
                    semanticDrift: `Đến thời hiện đại, hình tượng "${keyword}" hòa vào nhịp sống cách mạng và cảm thức tự do, khẳng định sức sống trường tồn bất diệt trong tâm hồn người Việt.`,
                    transition: `Từ nỗi niềm hoài cổ trung đại, hình tượng "${keyword}" thăng hoa cùng nhịp sống cách mạng và tư tưởng tự do của thời đại mới.`,
                    story: era5Work.summary || 'Dấu ấn hào hùng của thời đại mới.',
                    quote: era5Work.quote || era5Work.name,
                    insight: 'Sự tiếp nối và phát triển rực rỡ của mạch nguồn di sản.',
                    voiceNarration: `Và cuối cùng, tác phẩm ${era5Work.name} đã hoàn thiện dòng chảy thi pháp, đưa hình tượng ${keyword} hội tụ thành sức mạnh tinh thần bất tử của thời đại mới.`,
                },
            ],
        };
    }
}

module.exports = new KnowledgeGraphAiService();

