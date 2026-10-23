import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ForceGraph from 'force-graph';
import {
    Sparkles,
    Search,
    Compass,
    Layers,
    Share2,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    X,
    ExternalLink,
    BookOpen,
    Info,
    ArrowRight,
    MapPin,
    Flame,
    Volume2,
    VolumeX,
    Route,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Loader2,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Heart,
    HeartHandshake,
    Shield,
    Clock,
    Award
} from 'lucide-react';
import literatureService from '../services/literature.service';
import './KnowledgeGraph.css';

// 5 Kỷ Nguyên Lịch Sử Văn Hóa Dân Gian (Cỗ Máy Thời Gian Ngàn Năm)
const DEFAULT_ERAS = [
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

// Web Audio API âm thanh chuông dân gian đa âm sắc theo thang ngũ cung
function playTraditionalChime(pitchMultiplier = 1) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Tần số nốt ngũ cung (E5 - 659.25Hz * pitchMultiplier)
        osc.type = 'sine';
        const startFreq = 659.25 * pitchMultiplier;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.33, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.65);
    } catch {
        // Trình duyệt chặn autoplay âm thanh
    }
}

const KnowledgeGraph = () => {
    const containerRef = useRef(null);
    const graphInstance = useRef(null);

    // Dữ liệu đồ thị gốc từ backend
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State tương tác UI
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeNode, setActiveNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isOntologyModalOpen, setIsOntologyModalOpen] = useState(false);

    // Cỗ Máy Thời Gian Di Sản (Cultural Time-Lapse Evolution)
    const [isTimeMachineActive, setIsTimeMachineActive] = useState(false);
    const [selectedEraId, setSelectedEraId] = useState(0); // 0 = Toàn Vũ Trụ, 1..5 = 5 Kỷ Nguyên
    const [isTimeLapsePlaying, setIsTimeLapsePlaying] = useState(false);
    const [timeLapseProgress, setTimeLapseProgress] = useState(0);
    const [isEraVoiceEnabled, setIsEraVoiceEnabled] = useState(true);
    const [isStoryCardCollapsed, setIsStoryCardCollapsed] = useState(false);
    const timeLapseIntervalRef = useRef(null);
    const timeLapseTimeoutRef = useRef(null);
    const selectedEraIdRef = useRef(selectedEraId);
    const isTimeMachineActiveRef = useRef(isTimeMachineActive);

    useEffect(() => {
        selectedEraIdRef.current = selectedEraId;
        isTimeMachineActiveRef.current = isTimeMachineActive;
    }, [selectedEraId, isTimeMachineActive]);

    // Shortest path modal
    const [isPathModalOpen, setIsPathModalOpen] = useState(false);
    const [pathSource, setPathSource] = useState('');
    const [pathTarget, setPathTarget] = useState('');
    const [pathResult, setPathResult] = useState(null);
    const [isFindingPath, setIsFindingPath] = useState(false);

    // AI Guided Cultural Tour state (Chuyến Du Hành Văn Hóa Tự Động)
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);
    const [activeTour, setActiveTour] = useState(null);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [isTourPlaying, setIsTourPlaying] = useState(false);
    const [isVoiceNarrationEnabled, setIsVoiceNarrationEnabled] = useState(true);
    const [tourTimerProgress, setTourTimerProgress] = useState(0);
    const [tourNarrationStatus, setTourNarrationStatus] = useState('reading'); // 'narrating' | 'contemplating' | 'reading' | 'paused'
    const advanceTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const utteranceRef = useRef(null);
    const activeTourRef = useRef(activeTour);
    const tourStepIndexRef = useRef(tourStepIndex);
    const activeNodeRef = useRef(activeNode);
    const hoveredNodeRef = useRef(hoveredNode);
    const highlightedElementsRef = useRef({ nodes: new Set(), links: new Set() });

    // Đồng bộ refs cho ForceGraph canvas callback
    useEffect(() => {
        activeTourRef.current = activeTour;
        tourStepIndexRef.current = tourStepIndex;
    }, [activeTour, tourStepIndex]);

    // Kích hoạt preload danh sách giọng đọc tiếng Việt của trình duyệt
    useEffect(() => {
        if (!window.speechSynthesis) return;
        const preload = () => {
            window.speechSynthesis.getVoices?.();
        };
        preload();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = preload;
        }
    }, []);

    // Set các nodes và links nằm trong mạng lân cận của node được chọn, hover, path, hoặc tour đang chạy
    const highlightedElements = useMemo(() => {
        const nodes = new Set();
        const links = new Set();

        // 1. Nếu đang chạy Chuyến Du Hành Văn Hóa
        if (activeTour?.stops) {
            const currentStop = activeTour.stops[tourStepIndex];
            if (currentStop) {
                nodes.add(currentStop.nodeId);
                // Nối đường liên kết với chặng trước đó
                if (tourStepIndex > 0) {
                    const prevStop = activeTour.stops[tourStepIndex - 1];
                    nodes.add(prevStop.nodeId);
                    links.add(`${prevStop.nodeId}-${currentStop.nodeId}`);
                    links.add(`${currentStop.nodeId}-${prevStop.nodeId}`);
                }
                // Nối đường liên kết với chặng tiếp theo (nếu có)
                if (tourStepIndex < activeTour.stops.length - 1) {
                    const nextStop = activeTour.stops[tourStepIndex + 1];
                    nodes.add(nextStop.nodeId);
                    links.add(`${currentStop.nodeId}-${nextStop.nodeId}`);
                    links.add(`${nextStop.nodeId}-${currentStop.nodeId}`);
                }
            }
            return { nodes, links };
        }

        // 2. Nếu đang xem kết quả đường đi ngắn nhất
        if (pathResult?.path?.length) {
            pathResult.path.forEach((p) => nodes.add(p.id));
            pathResult.links.forEach((l) => {
                links.add(`${l.source}-${l.target}`);
                links.add(`${l.target}-${l.source}`);
            });
            return { nodes, links };
        }

        // 3. Nếu đang chọn hoặc hover một Node cụ thể (Focus spotlight)
        const focusNode = activeNode || hoveredNode;
        if (focusNode) {
            nodes.add(focusNode.id);
            if (graphData?.links) {
                graphData.links.forEach((link) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    if (sourceId === focusNode.id) {
                        nodes.add(targetId);
                        links.add(`${sourceId}-${targetId}`);
                        links.add(`${targetId}-${sourceId}`);
                    } else if (targetId === focusNode.id) {
                        nodes.add(sourceId);
                        links.add(`${sourceId}-${targetId}`);
                        links.add(`${targetId}-${sourceId}`);
                    }
                });
            }
        }

        return { nodes, links };
    }, [activeNode, hoveredNode, pathResult, activeTour, tourStepIndex, graphData]);

    // Luôn cập nhật highlightedElementsRef để canvas đọc không bị trễ
    useEffect(() => {
        highlightedElementsRef.current = highlightedElements;
        activeNodeRef.current = activeNode;
        hoveredNodeRef.current = hoveredNode;
        // Kích hoạt render lại canvas mà không reset simulation
        if (graphInstance.current) {
            graphInstance.current.refresh?.();
        }
    }, [highlightedElements, activeNode, hoveredNode]);

    // Tải dữ liệu đồ thị từ backend
    useEffect(() => {
        const fetchGraph = async () => {
            try {
                setIsLoading(true);
                const data = await literatureService.getKnowledgeGraph();
                setGraphData(data);
                if (data.nodes?.length > 1) {
                    setPathSource(data.nodes[0].id);
                    setPathTarget(data.nodes[1].id);
                }
            } catch (err) {
                console.error('Lỗi khi tải Đồ thị Tri thức:', err);
                setError('Không thể kết nối đến máy chủ Đồ thị Tri thức.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchGraph();
    }, []);

    // Danh sách Kỷ nguyên văn hóa (từ backend hoặc fallback mặc định)
    const activeErasList = useMemo(() => {
        if (graphData?.eras && Array.isArray(graphData.eras) && graphData.eras.length > 0) {
            return graphData.eras;
        }
        return DEFAULT_ERAS;
    }, [graphData]);

    // Dữ liệu chi tiết Kỷ nguyên hiện tại đang chọn
    const currentEraData = useMemo(() => {
        if (selectedEraId === 0) {
            return {
                id: 0,
                name: 'Toàn Cảnh Vũ Trụ Tri Thức Vĩnh Cửu',
                shortName: 'Vũ Trụ Vĩnh Cửu',
                timeSpan: 'Hơn 4.000 năm Lịch Sử & Văn Hiến',
                color: '#f59e0b',
                quote: 'Non sông gấm vóc ngàn thu / Tinh hoa hội tụ hồn thiêng lưu truyền',
                insight: 'Tổng hòa toàn bộ 4 tầng tri thức: Cổ Mẫu, Triết Lý, Địa Linh và Tác Phẩm được tích lũy liên tục và truyền thừa qua các thế hệ người Việt.',
                story: 'Qua hàng ngàn năm dựng nước và giữ nước, các tầng tri thức văn hóa dân gian không hề mất đi mà tích tụ, bồi đắp và gắn kết thành một thể thống nhất hữu cơ bền chặt.',
                voiceNarration: 'Bạn đang chiêm ngưỡng Toàn cảnh Vũ Trụ Tri Thức Dân Gian Việt Nam, nơi toàn bộ các biểu tượng cổ mẫu, triết lý nhân sinh và kho tàng tác phẩm được kết tinh qua hơn 4000 năm lịch sử.',
            };
        }
        return activeErasList.find((e) => e.id === selectedEraId) || activeErasList[0];
    }, [activeErasList, selectedEraId]);

    // Thống kê số lượng thực thể tích lũy theo từng Kỷ nguyên
    const eraStats = useMemo(() => {
        if (!graphData?.nodes) return { total: 0, newCount: 0, newArchetypes: 0, newWorks: 0 };
        if (selectedEraId === 0) {
            return {
                total: graphData.nodes.length,
                newCount: graphData.nodes.length,
                newArchetypes: graphData.nodes.filter((n) => n.type === 'archetype').length,
                newWorks: graphData.nodes.filter((n) => n.type === 'work').length,
            };
        }
        const cumulative = graphData.nodes.filter((n) => (n.bornEra || 1) <= selectedEraId);
        const newInEra = graphData.nodes.filter((n) => (n.bornEra || 1) === selectedEraId);
        return {
            total: cumulative.length,
            newCount: newInEra.length,
            newArchetypes: newInEra.filter((n) => n.type === 'archetype').length,
            newWorks: newInEra.filter((n) => n.type === 'work').length,
        };
    }, [graphData, selectedEraId]);

    // Danh sách các nốt vừa mới khởi sinh trong Kỷ nguyên hiện tại
    const newlyEmergedNodes = useMemo(() => {
        if (!graphData?.nodes || selectedEraId === 0) return [];
        return graphData.nodes.filter((n) => (n.bornEra || 1) === selectedEraId);
    }, [graphData, selectedEraId]);

    // Khởi tạo Canvas Force-Graph
    useEffect(() => {
        if (!containerRef.current || !graphData || isLoading) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Lọc dữ liệu theo category và Cỗ Máy Thời Gian nếu có
        const filteredNodes = graphData.nodes.filter((node) => {
            if (isTimeMachineActive && selectedEraId > 0) {
                const era = node.bornEra || 1;
                if (era > selectedEraId) return false;
            }
            if (selectedCategory === 'all') return true;
            return node.type === selectedCategory;
        });
        const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

        const filteredLinks = graphData.links.filter((link) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
        });

        // Khởi tạo đồ thị
        const graph = ForceGraph()(containerRef.current)
            .width(width)
            .height(height)
            .graphData({
                nodes: JSON.parse(JSON.stringify(filteredNodes)),
                links: JSON.parse(JSON.stringify(filteredLinks)),
            })
            .backgroundColor('transparent')
            .nodeId('id')
            .nodeVal('val')
            .linkSource('source')
            .linkTarget('target')
            // Cấu hình vật lý đàn hồi mượt mà, phân bố nốt rộng rãi
            .d3AlphaDecay(0.015)
            .d3VelocityDecay(0.35)
            .cooldownTicks(200)
            // Hiệu ứng dòng năng lượng văn hóa chuyển động dọc theo liên kết
            .linkDirectionalParticles((link) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const isHighlighted =
                    highlightedElementsRef.current.links.has(`${sourceId}-${targetId}`) ||
                    highlightedElementsRef.current.links.has(`${targetId}-${sourceId}`);
                return isHighlighted ? 3 : 1;
            })
            .linkDirectionalParticleSpeed((d) => (d.strength || 1) * 0.005)
            .linkDirectionalParticleWidth((d) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                const isHighlighted =
                    highlightedElementsRef.current.links.has(`${sourceId}-${targetId}`) ||
                    highlightedElementsRef.current.links.has(`${targetId}-${sourceId}`);
                return isHighlighted ? 3 : 1.2;
            })
            .linkDirectionalParticleColor(() => '#fbbf24')
            .linkColor((link) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const isHighlighted =
                    highlightedElementsRef.current.links.has(`${sourceId}-${targetId}`) ||
                    highlightedElementsRef.current.links.has(`${targetId}-${sourceId}`);
                if (isHighlighted) return 'rgba(251, 191, 36, 0.95)';
                const hasFocus = activeNodeRef.current || hoveredNodeRef.current || activeTourRef.current;
                if (hasFocus) return 'rgba(255, 255, 255, 0.02)'; // Làm mờ triệt để các đường không liên quan
                return 'rgba(255, 255, 255, 0.08)'; // Mờ nhẹ mặc định, tránh cảm giác mạng nhện rối mắt
            })
            .linkWidth((link) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const isHighlighted =
                    highlightedElementsRef.current.links.has(`${sourceId}-${targetId}`) ||
                    highlightedElementsRef.current.links.has(`${targetId}-${sourceId}`);
                return isHighlighted ? 2.5 : 0.8;
            })
            // Tùy biến vẽ Node trên Canvas để đạt độ sắc nét và thẩm mỹ cao nhất
            .nodeCanvasObject((node, ctx, globalScale) => {
                const currentActiveNode = activeNodeRef.current;
                const currentHoveredNode = hoveredNodeRef.current;
                const isSelected = currentActiveNode?.id === node.id;
                const isHovered = currentHoveredNode?.id === node.id;
                const isTourCurrentNode = activeTourRef.current?.stops[tourStepIndexRef.current]?.nodeId === node.id;
                const isNewInCurrentEra = isTimeMachineActiveRef.current && selectedEraIdRef.current > 0 && (node.bornEra || 1) === selectedEraIdRef.current;
                
                const hasFocus = currentActiveNode || currentHoveredNode || activeTourRef.current || pathResult?.path?.length;
                const isHighlighted = !hasFocus || highlightedElementsRef.current.nodes.has(node.id);

                const baseVal = node.val || 10;
                // Kích thước nốt phân cấp rõ ràng theo tầng tri thức
                const r = Math.sqrt(Math.max(0, baseVal)) * (node.type === 'philosophy' ? 2.4 : node.type === 'archetype' ? 2.1 : 1.7);

                ctx.save();

                // 1. Vẽ vòng hào quang (Outer Glow)
                if (isHighlighted && (isSelected || isHovered || isTourCurrentNode || isNewInCurrentEra || (!hasFocus && (node.type === 'archetype' || node.type === 'philosophy')))) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r + (isTourCurrentNode ? 9 : isSelected ? 7 : isNewInCurrentEra ? 6 : isHovered ? 5 : 3), 0, 2 * Math.PI, false);
                    ctx.fillStyle = isTourCurrentNode
                        ? 'rgba(251, 191, 36, 0.45)'
                        : isNewInCurrentEra
                        ? 'rgba(245, 158, 11, 0.4)'
                        : isSelected
                        ? 'rgba(251, 191, 36, 0.35)'
                        : `${node.color || '#10b981'}30`;
                    ctx.shadowColor = isTourCurrentNode ? '#fbbf24' : isNewInCurrentEra ? '#f59e0b' : (node.color || '#10b981');
                    ctx.shadowBlur = isTourCurrentNode ? 24 : isNewInCurrentEra ? 18 : isSelected ? 20 : isHovered ? 14 : 8;
                    ctx.fill();
                }

                // 2. Vẽ hình tròn nốt chính
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = isHighlighted ? (node.color || '#10b981') : 'rgba(55, 65, 81, 0.18)';
                ctx.shadowBlur = 0;
                ctx.fill();

                // Viền sáng cho nốt
                ctx.lineWidth = isTourCurrentNode ? 3.5 : isSelected ? 2.5 : isHovered ? 2 : 1;
                ctx.strokeStyle = isTourCurrentNode
                    ? '#fbbf24'
                    : isSelected
                    ? '#ffffff'
                    : isHighlighted
                    ? 'rgba(255, 255, 255, 0.65)'
                    : 'rgba(255, 255, 255, 0.08)';
                ctx.stroke();

                // Vòng hào quang đứt nét chuyển động nhịp thở cho nốt mới sinh trong kỷ nguyên này
                if (isNewInCurrentEra) {
                    const pulse = (Math.sin(Date.now() / 220) + 1) / 2;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r + 4 + pulse * 4, 0, 2 * Math.PI, false);
                    ctx.lineWidth = 1.8;
                    ctx.strokeStyle = `rgba(245, 158, 11, ${0.45 + pulse * 0.5})`;
                    ctx.setLineDash([4, 2]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // 3. Quy tắc hiển thị nhãn chữ thông minh (Tránh rối mắt & chống đè chữ)
                let shouldShowLabel = false;
                const isFocused = isSelected || isHovered || isTourCurrentNode;

                if (isFocused || isNewInCurrentEra) {
                    shouldShowLabel = true;
                } else if (hasFocus && highlightedElementsRef.current.nodes.has(node.id)) {
                    shouldShowLabel = true;
                } else if (!hasFocus) {
                    // Mặc định khi chưa chọn gì: CHỈ hiện Triết lý và Cổ mẫu
                    if (node.type === 'philosophy' || node.type === 'archetype') {
                        shouldShowLabel = true;
                    } else if (globalScale >= 2.0) {
                        shouldShowLabel = true;
                    }
                }

                if (shouldShowLabel && isHighlighted) {
                    let label = node.name || '';
                    if (!isFocused && label.length > 20 && node.type !== 'philosophy') {
                        label = label.slice(0, 18) + '...';
                    } else if (!isFocused && label.length > 26) {
                        label = label.slice(0, 24) + '...';
                    }

                    const fontSize = Math.max(9, Math.min(13, 12 / Math.sqrt(globalScale)));
                    ctx.font = `${(node.type === 'archetype' || node.type === 'philosophy' || isFocused) ? '600' : '400'} ${fontSize}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const textY = node.y + r + fontSize + 4;
                    const textWidth = ctx.measureText(label).width;

                    // Vẽ badge đệm bo góc sau nhãn để chữ luôn sắc nét, không bị dây nối cắt ngang
                    ctx.beginPath();
                    const padX = 6;
                    const padY = 2.5;
                    const bX = node.x - textWidth / 2 - padX;
                    const bY = textY - fontSize / 2 - padY;
                    const bW = textWidth + padX * 2;
                    const bH = fontSize + padY * 2;
                    
                    ctx.fillStyle = isFocused ? 'rgba(15, 23, 42, 0.95)' : 'rgba(6, 9, 14, 0.8)';
                    ctx.strokeStyle = isFocused ? (node.color || '#fbbf24') : 'rgba(255, 255, 255, 0.12)';
                    ctx.lineWidth = 1;

                    if (ctx.roundRect) {
                        ctx.roundRect(bX, bY, bW, bH, 4);
                    } else {
                        ctx.rect(bX, bY, bW, bH);
                    }
                    ctx.fill();
                    ctx.stroke();

                    // Màu chữ phân tầng
                    ctx.fillStyle = isTourCurrentNode 
                        ? '#fbbf24' 
                        : isSelected 
                        ? '#fbbf24' 
                        : isHovered 
                        ? '#ffffff'
                        : node.type === 'philosophy'
                        ? '#f472b6'
                        : node.type === 'archetype'
                        ? '#fcd34d'
                        : '#e2e8f0';

                    ctx.fillText(label, node.x, textY);
                }

                ctx.restore();
            })
            .nodePointerAreaPaint((node, color, ctx) => {
                const r = Math.sqrt(Math.max(0, node.val || 10)) * 2.2 + 4;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fill();
            })
            // Xử lý sự kiện click vào Node
            .onNodeClick((node) => {
                if (isSoundEnabled) playTraditionalChime();

                // Nếu đang trong Chuyến Du Hành và click trúng một chặng dừng chân
                if (activeTourRef.current?.stops) {
                    const stopIndex = activeTourRef.current.stops.findIndex((s) => s.nodeId === node.id);
                    if (stopIndex !== -1) {
                        setTourStepIndex(stopIndex);
                        return;
                    }
                }

                setActiveNode(node);
                setPathResult(null); // Xóa path highlight nếu đang mở

                // Zoom và căn giữa camera mượt mà vào Node được click
                graph.centerAt(node.x, node.y, 800);
                graph.zoom(2.2, 800);
            })
            .onNodeHover((node) => {
                setHoveredNode(node || null);
                if (containerRef.current) {
                    containerRef.current.style.cursor = node ? 'pointer' : 'grab';
                }
            })
            .onBackgroundClick(() => {
                setActiveNode(null);
                setPathResult(null);
            });

        // Tinh chỉnh lực để các nốt phân bố thoáng đãng, không bị chụm cục
        if (graph.d3Force('charge')) {
            graph.d3Force('charge')
                .strength((node) => {
                    if (node.type === 'philosophy') return -480;
                    if (node.type === 'archetype') return -400;
                    if (node.type === 'region') return -340;
                    return -220;
                })
                .distanceMin(30)
                .distanceMax(1200);
        }
        if (graph.d3Force('link')) {
            graph.d3Force('link')
                .distance((link) => {
                    const s = typeof link.source === 'object' ? link.source.type : '';
                    const t = typeof link.target === 'object' ? link.target.type : '';
                    if ((s === 'archetype' && t === 'philosophy') || (s === 'philosophy' && t === 'archetype')) {
                        return 135;
                    }
                    if (s === 'region' || t === 'region') {
                        return 120;
                    }
                    return 85;
                });
        }

        graphInstance.current = graph;

        // Auto zoom-to-fit sau khi load xong
        const timer = setTimeout(() => {
            graph.zoomToFit(600, 40);
        }, 500);

        // Lắng nghe sự kiện resize màn hình
        const handleResize = () => {
            if (containerRef.current && graphInstance.current) {
                graphInstance.current
                    .width(containerRef.current.clientWidth)
                    .height(containerRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            if (graphInstance.current) {
                graphInstance.current._destructor?.();
            }
        };
    }, [graphData, isSoundEnabled, isLoading]);

    // Cập nhật động dữ liệu đồ thị khi đổi Kỷ nguyên Thời gian hoặc Danh mục
    useEffect(() => {
        if (!graphInstance.current || !graphData || isLoading) return;

        const filteredNodes = graphData.nodes.filter((node) => {
            if (isTimeMachineActive && selectedEraId > 0) {
                const era = node.bornEra || 1;
                if (era > selectedEraId) return false;
            }
            if (selectedCategory === 'all') return true;
            return node.type === selectedCategory;
        });
        const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

        const filteredLinks = graphData.links.filter((link) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
        });

        graphInstance.current.graphData({
            nodes: JSON.parse(JSON.stringify(filteredNodes)),
            links: JSON.parse(JSON.stringify(filteredLinks)),
        });

        if (isTimeMachineActive) {
            if (selectedEraId === 0) {
                graphInstance.current.zoomToFit(800, 50);
            } else {
                // Tự động điều phối camera bay lượn đến cổ mẫu tiêu biểu của Kỷ nguyên
                const flagshipMap = {
                    1: ['arc-trau-cau', 'arc-hat-gao-noi-com', 'arc-cay-tre-canh-truc'],
                    2: ['arc-con-co', 'arc-cay-da-ben-nuoc'],
                    3: ['phil-yeu-nuoc', 'arc-song-nui-dia-linh'],
                    4: ['arc-hoa-sen'],
                    5: ['phil-yeu-nuoc'],
                };
                const preferred = flagshipMap[selectedEraId] || [];
                const target =
                    filteredNodes.find((n) => preferred.includes(n.id)) ||
                    filteredNodes.find((n) => (n.bornEra || 1) === selectedEraId);

                if (target && typeof target.x === 'number' && typeof target.y === 'number') {
                    graphInstance.current.centerAt(target.x + 90, target.y, 900);
                    graphInstance.current.zoom(2.2, 900);
                } else {
                    graphInstance.current.zoomToFit(800, 50);
                }
            }
        }
    }, [isTimeMachineActive, selectedEraId, selectedCategory, graphData, isLoading]);

    // Bộ não điều phối Tiến Hóa Thời Gian (Time-Lapse Auto Playback & Voice Narration)
    useEffect(() => {
        if (!isTimeMachineActive || !isTimeLapsePlaying) {
            clearInterval(timeLapseIntervalRef.current);
            clearTimeout(timeLapseTimeoutRef.current);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setTimeLapseProgress(0);
            return;
        }

        const currentEra =
            selectedEraId === 0
                ? activeErasList[0]
                : activeErasList.find((e) => e.id === selectedEraId) || activeErasList[0];
        if (!currentEra) return;

        if (isSoundEnabled) {
            playTraditionalChime(0.75 + (currentEra.id || 1) * 0.15);
        }

        // Trường hợp 1: Thuyết minh bằng giọng đọc AI
        if (isEraVoiceEnabled && window.speechSynthesis && currentEra.voiceNarration) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(currentEra.voiceNarration);
            utterance.lang = 'vi-VN';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices?.() || [];
            const viVoice = voices.find((v) => v.lang?.toLowerCase().includes('vi'));
            if (viVoice) utterance.voice = viVoice;

            const wordCount = currentEra.voiceNarration.trim().split(/\s+/).length;
            const estimatedDurationMs = Math.max(7000, wordCount * 330);
            const startTime = Date.now();

            setTimeLapseProgress(0);
            clearInterval(timeLapseIntervalRef.current);
            timeLapseIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const pct = Math.min(98, (elapsed / estimatedDurationMs) * 100);
                setTimeLapseProgress(pct);
            }, 100);

            utterance.onend = () => {
                clearInterval(timeLapseIntervalRef.current);
                setTimeLapseProgress(100);
                timeLapseTimeoutRef.current = setTimeout(() => {
                    setSelectedEraId((prev) => (prev >= 5 ? 1 : prev + 1));
                }, 1200);
            };

            utterance.onerror = () => {
                clearInterval(timeLapseIntervalRef.current);
                timeLapseTimeoutRef.current = setTimeout(() => {
                    setSelectedEraId((prev) => (prev >= 5 ? 1 : prev + 1));
                }, 1000);
            };

            window.speechSynthesis.speak(utterance);

            return () => {
                clearInterval(timeLapseIntervalRef.current);
                clearTimeout(timeLapseTimeoutRef.current);
                if (window.speechSynthesis) window.speechSynthesis.cancel();
            };
        } else {
            // Trường hợp 2: Không dùng giọng đọc (chạy thanh tiến trình 6.5s mỗi kỷ nguyên)
            const duration = 6500;
            const startTime = Date.now();
            setTimeLapseProgress(0);

            clearInterval(timeLapseIntervalRef.current);
            timeLapseIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const pct = Math.min(100, (elapsed / duration) * 100);
                setTimeLapseProgress(pct);

                if (pct >= 100) {
                    clearInterval(timeLapseIntervalRef.current);
                    timeLapseTimeoutRef.current = setTimeout(() => {
                        setSelectedEraId((prev) => (prev >= 5 ? 1 : prev + 1));
                    }, 800);
                }
            }, 100);

            return () => {
                clearInterval(timeLapseIntervalRef.current);
                clearTimeout(timeLapseTimeoutRef.current);
            };
        }
    }, [isTimeMachineActive, isTimeLapsePlaying, selectedEraId, isEraVoiceEnabled, isSoundEnabled, activeErasList]);

    // Xử lý tìm kiếm nốt
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || !graphData?.nodes) return [];
        const q = searchQuery.toLowerCase().trim();
        return graphData.nodes
            .filter((n) => n.name.toLowerCase().includes(q) || (n.summary && n.summary.toLowerCase().includes(q)))
            .slice(0, 6);
    }, [searchQuery, graphData]);

    const handleSelectSearchNode = (node) => {
        setActiveNode(node);
        setSearchQuery('');
        if (graphInstance.current) {
            if (isSoundEnabled) playTraditionalChime();
            const runtimeNodes = graphInstance.current.graphData()?.nodes || [];
            const target = runtimeNodes.find((n) => n.id === node.id);
            if (target && typeof target.x === 'number') {
                graphInstance.current.centerAt(target.x, target.y, 900);
                graphInstance.current.zoom(2.5, 900);
            }
        }
    };

    // Điều khiển Zoom / Camera
    const handleZoomIn = () => {
        if (!graphInstance.current) return;
        graphInstance.current.zoom(graphInstance.current.zoom() * 1.3, 400);
    };

    const handleZoomOut = () => {
        if (!graphInstance.current) return;
        graphInstance.current.zoom(graphInstance.current.zoom() / 1.3, 400);
    };

    const handleResetView = () => {
        if (!graphInstance.current) return;
        setActiveNode(null);
        setPathResult(null);
        graphInstance.current.zoomToFit(600, 40);
    };

    // Tìm đường đi văn hóa ngắn nhất (Shortest Cultural Path)
    const handleFindShortestPath = async () => {
        if (!pathSource || !pathTarget || pathSource === pathTarget) return;
        try {
            setIsFindingPath(true);
            const res = await literatureService.getKnowledgeGraphShortestPath(pathSource, pathTarget);
            setPathResult(res);
            setIsPathModalOpen(false);

            // Zoom bao trọn đường đi vừa tìm thấy
            if (graphInstance.current && res.path?.length > 0) {
                if (isSoundEnabled) playTraditionalChime();
                const runtimeNodes = graphInstance.current.graphData()?.nodes || [];
                const firstNode = runtimeNodes.find((n) => n.id === res.path[0].id);
                if (firstNode && typeof firstNode.x === 'number') {
                    graphInstance.current.centerAt(firstNode.x, firstNode.y, 900);
                    graphInstance.current.zoom(1.9, 900);
                }
            }
        } catch (err) {
            console.error('Lỗi tìm đường đi văn hóa:', err);
        } finally {
            setIsFindingPath(false);
        }
    };

    // Điều khiển Chuyến Du Hành Văn Hóa Tự Động
    const handleStartTour = (tour) => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        clearTimeout(advanceTimeoutRef.current);
        clearInterval(progressIntervalRef.current);
        setActiveTour(tour);
        setTourStepIndex(0);
        setIsTourPlaying(true);
        setTourTimerProgress(0);
        setTourNarrationStatus(isVoiceNarrationEnabled ? 'narrating' : 'reading');
        setIsTourModalOpen(false);
        setActiveNode(null);
        setPathResult(null);
    };

    const handleExitTour = () => {
        clearTimeout(advanceTimeoutRef.current);
        clearInterval(progressIntervalRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setActiveTour(null);
        setIsTourPlaying(false);
        setTourTimerProgress(0);
        setTourNarrationStatus('paused');
        handleResetView();
    };

    const handleNextTourStep = () => {
        if (!activeTour) return;
        clearTimeout(advanceTimeoutRef.current);
        clearInterval(progressIntervalRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (tourStepIndex < activeTour.stops.length - 1) {
            setTourStepIndex((prev) => prev + 1);
            setTourTimerProgress(0);
        } else {
            setIsTourPlaying(false);
            setTourTimerProgress(100);
            setTourNarrationStatus('contemplating');
        }
    };

    const handlePrevTourStep = () => {
        if (!activeTour) return;
        clearTimeout(advanceTimeoutRef.current);
        clearInterval(progressIntervalRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (tourStepIndex > 0) {
            setTourStepIndex((prev) => prev - 1);
            setTourTimerProgress(0);
        }
    };

    const handleToggleTourPlay = () => {
        setIsTourPlaying((prev) => {
            const next = !prev;
            if (!next) {
                // Tạm dừng du hành và âm thanh
                if (window.speechSynthesis && window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                }
                setTourNarrationStatus('paused');
            } else {
                // Tiếp tục du hành
                if (window.speechSynthesis && window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                    setTourNarrationStatus('narrating');
                }
            }
            return next;
        });
    };

    // Phím tắt điều khiển du hành tiện lợi cho người dùng (Keyboard Shortcuts)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;

            if (e.key === 'Escape') {
                if (isTourModalOpen) setIsTourModalOpen(false);
                else if (isPathModalOpen) setIsPathModalOpen(false);
                else if (activeNode) setActiveNode(null);
                else if (activeTour) handleExitTour();
            } else if (activeTour) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    handleToggleTourPlay();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleNextTourStep();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handlePrevTourStep();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTour, isTourModalOpen, isPathModalOpen, activeNode, tourStepIndex]);

    // Khi chuyển chặng tour: Bay camera mượt mà đến nốt hiện tại
    useEffect(() => {
        if (!activeTour || !graphData || !graphInstance.current) return;
        const currentStop = activeTour.stops[tourStepIndex];
        if (!currentStop) return;

        const flyToCurrentNode = () => {
            if (!graphInstance.current) return false;
            const runtimeNodes = graphInstance.current.graphData()?.nodes || [];
            const targetNode = runtimeNodes.find((n) => n.id === currentStop.nodeId);

            if (targetNode && typeof targetNode.x === 'number' && typeof targetNode.y === 'number') {
                if (isSoundEnabled) playTraditionalChime();
                graphInstance.current.centerAt(targetNode.x, targetNode.y, 1100);
                graphInstance.current.zoom(2.5, 1100);
                return true;
            }
            return false;
        };

        const success = flyToCurrentNode();
        if (!success) {
            const timer = setTimeout(flyToCurrentNode, 350);
            return () => clearTimeout(timer);
        }
    }, [activeTour, tourStepIndex, graphData, isSoundEnabled]);

    // Bộ não điều phối Thuyết Minh Giọng Đọc & Đợi đọc xong trọn vẹn mới chuyển chặng
    useEffect(() => {
        if (!activeTour || !isTourPlaying) {
            clearTimeout(advanceTimeoutRef.current);
            clearInterval(progressIntervalRef.current);
            return;
        }

        const currentStop = activeTour.stops[tourStepIndex];
        if (!currentStop) return;

        clearTimeout(advanceTimeoutRef.current);
        clearInterval(progressIntervalRef.current);
        setTourTimerProgress(0);

        // Chuẩn bị văn bản thuyết minh liền mạch giàu tính văn học
        const fullNarrativeText =
            currentStop.voiceNarration ||
            `${currentStop.transition ? currentStop.transition + ' ' : ''}${currentStop.title}. ${currentStop.story}${currentStop.quote ? ' ' + currentStop.quote : ''}`;
        const cleanSpeechText = fullNarrativeText.replace(/[/]/g, ', ').replace(/\s+/g, ' ').trim();
        const wordCount = cleanSpeechText.split(/\s+/).filter(Boolean).length;

        // Trường hợp 1: Có bật thuyết minh giọng đọc AI
        if (isVoiceNarrationEnabled && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setTourNarrationStatus('narrating');

            const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            utterance.pitch = 1.0;

            // Tìm giọng đọc tiếng Việt tự nhiên nhất trên thiết bị người dùng
            const voices = window.speechSynthesis.getVoices?.() || [];
            const viVoice = voices.find(
                (v) =>
                    v.lang === 'vi-VN' ||
                    v.lang?.toLowerCase().startsWith('vi') ||
                    (v.name && v.name.toLowerCase().includes('vietnam'))
            );
            if (viVoice) {
                utterance.voice = viVoice;
            }

            utteranceRef.current = utterance;

            // Ước tính thời lượng đọc tự nhiên (~360ms/từ + 2.0s chuẩn bị)
            const estimatedDuration = Math.max(7000, wordCount * 360 + 2000);
            let isUtteranceEnded = false;

            const handleSpeechFinished = () => {
                if (isUtteranceEnded) return;
                isUtteranceEnded = true;
                clearInterval(progressIntervalRef.current);
                setTourTimerProgress(100);
                setTourNarrationStatus('contemplating');

                // Khoảng lặng chiêm nghiệm 2.2 giây sau khi thuyết minh xong trước khi chuyển chặng
                advanceTimeoutRef.current = setTimeout(() => {
                    if (tourStepIndex < activeTour.stops.length - 1) {
                        setTourStepIndex((idx) => idx + 1);
                    } else {
                        setIsTourPlaying(false);
                    }
                }, 2200);
            };

            utterance.onend = handleSpeechFinished;
            utterance.onerror = (e) => {
                console.warn('SpeechSynthesis event interrupted or error:', e);
                if (!isUtteranceEnded) {
                    handleSpeechFinished();
                }
            };

            try {
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.warn('Cannot speak utterance:', err);
                handleSpeechFinished();
            }

            // Thanh tiến trình nhích dần lên đến 95% theo nhịp điệu bài đọc
            const startTime = Date.now();
            progressIntervalRef.current = setInterval(() => {
                if (isUtteranceEnded) return;
                const elapsed = Date.now() - startTime;
                const pct = Math.min(95, (elapsed / estimatedDuration) * 95);
                setTourTimerProgress(pct);
            }, 100);

            // Safety timer dự phòng nếu trình duyệt không kích hoạt onend
            const safetyTimer = setTimeout(() => {
                if (!isUtteranceEnded) {
                    handleSpeechFinished();
                }
            }, estimatedDuration + 8000);

            return () => {
                clearInterval(progressIntervalRef.current);
                clearTimeout(advanceTimeoutRef.current);
                clearTimeout(safetyTimer);
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
            };
        } else {
            // Trường hợp 2: Chế độ tắt tiếng (Đọc bằng mắt theo tốc độ đọc tự nhiên)
            setTourNarrationStatus('reading');
            const readingDuration = Math.max(8000, wordCount * 340 + 2500);
            const startTime = Date.now();

            progressIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const pct = Math.min(100, (elapsed / readingDuration) * 100);
                setTourTimerProgress(pct);

                if (pct >= 100) {
                    clearInterval(progressIntervalRef.current);
                    setTourNarrationStatus('contemplating');
                    advanceTimeoutRef.current = setTimeout(() => {
                        if (tourStepIndex < activeTour.stops.length - 1) {
                            setTourStepIndex((idx) => idx + 1);
                        } else {
                            setIsTourPlaying(false);
                        }
                    }, 1200);
                }
            }, 100);

            return () => {
                clearInterval(progressIntervalRef.current);
                clearTimeout(advanceTimeoutRef.current);
            };
        }
    }, [activeTour, tourStepIndex, isTourPlaying, isVoiceNarrationEnabled]);

    return (
        <div className="kg-universe-container">
            {/* Top Navigation & Controls Bar */}
            <div className="kg-topbar">
                {/* Brand Title & Category Filters - Clean Vertical Stack (No absolute overlap) */}
                <div className="flex flex-col gap-1.5 pointer-events-auto min-w-0 max-w-[65%]">
                    {/* Header Card */}
                    <div className="kg-interactive-panel px-3 py-1.5 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 text-stone-900 font-bold flex-shrink-0">
                            <Share2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide whitespace-nowrap">
                                Vũ Trụ Tri Thức
                            </h1>
                            <span className="kg-header-badge py-0.5 px-1.5 text-[9px] hidden lg:inline-flex">
                                <Sparkles className="w-2.5 h-2.5" />
                                Graph
                            </span>
                        </div>

                        <div className="h-3.5 w-px bg-white/10 hidden sm:block mx-0.5" />

                        {/* Nút Kích Hoạt Cỗ Máy Thời Gian Di Sản */}
                        <button
                            onClick={() => {
                                if (!isTimeMachineActive) {
                                    if (activeTour) handleExitTour();
                                    setIsTimeMachineActive(true);
                                    setSelectedEraId(1);
                                    if (isSoundEnabled) playTraditionalChime(0.9);
                                } else {
                                    setIsTimeMachineActive(false);
                                    setIsTimeLapsePlaying(false);
                                    setSelectedEraId(0);
                                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                                }
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer hover:scale-105 flex-shrink-0 ${
                                isTimeMachineActive
                                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 border border-amber-300 shadow-amber-500/30'
                                    : 'bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 border border-amber-500/30 text-amber-200 hover:text-white'
                            }`}
                            title="Khám phá sự tiến hóa của Đồ thị Tri thức qua 5 Kỷ nguyên lịch sử"
                        >
                            <Clock
                                className={`w-3 h-3 flex-shrink-0 ${isTimeMachineActive ? 'text-stone-950 animate-spin' : 'text-amber-400'}`}
                                style={{ animationDuration: '6s' }}
                            />
                            <span>⏳ Cỗ Máy Thời Gian</span>
                            {isTimeMachineActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping ml-0.5" />
                            )}
                        </button>

                        <div className="h-3.5 w-px bg-white/10 hidden sm:block mx-0.5" />

                        {/* Nút Tìm hiểu Ý Nghĩa 4 Tầng Tri Thức */}
                        <button
                            onClick={() => setIsOntologyModalOpen(true)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-300 hover:text-white transition-all shadow-sm font-semibold whitespace-nowrap cursor-pointer hover:scale-105 flex-shrink-0"
                            title="Khám phá cấu trúc 4 tầng tri thức VietHeritage"
                        >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>Ý Nghĩa 4 Tầng</span>
                        </button>
                    </div>

                    {/* Category Filter Pills (Ngay bên dưới, thẳng hàng, KHÔNG đè lên header) */}
                    <div className="kg-interactive-panel px-2 py-1 flex items-center gap-1 overflow-x-auto kg-custom-scroll">
                        {[
                            { id: 'all', label: 'Tất cả', color: '#f59e0b' },
                            { id: 'archetype', label: 'Cổ mẫu', color: '#f59e0b' },
                            { id: 'philosophy', label: 'Triết lý', color: '#ec4899' },
                            { id: 'region', label: 'Địa linh', color: '#3b82f6' },
                            { id: 'work', label: 'Tác phẩm', color: '#10b981' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`kg-filter-pill text-[11px] py-0.5 px-2.5 whitespace-nowrap ${selectedCategory === cat.id ? 'active' : ''}`}
                            >
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Actions: Search + Tour + Shortest Path */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pointer-events-auto">
                    {/* Search Autocomplete */}
                    <div className="kg-search-box kg-interactive-panel hidden md:block flex-shrink-0 !w-36 lg:!w-44">
                        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Tìm nốt..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="kg-search-input text-xs py-1.5 pl-8 pr-6"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-2 text-stone-400 hover:text-white"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}

                        {/* Dropdown gợi ý tìm kiếm */}
                        {searchResults.length > 0 && (
                            <div className="kg-search-dropdown kg-custom-scroll">
                                {searchResults.map((node) => (
                                    <button
                                        key={node.id}
                                        onClick={() => handleSelectSearchNode(node)}
                                        className="w-full text-left p-2.5 hover:bg-white/10 flex items-center gap-2.5 border-b border-white/5 last:border-0 transition-colors"
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: node.color || '#10b981' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-white truncate">
                                                {node.name}
                                            </div>
                                            <div className="text-[10px] text-stone-400 capitalize">
                                                {node.type === 'archetype'
                                                    ? 'Cổ mẫu dân gian'
                                                    : node.type === 'philosophy'
                                                    ? 'Triết lý nhân sinh'
                                                    : node.type === 'region'
                                                    ? 'Không gian văn hóa'
                                                    : 'Tác phẩm văn học'}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nút Khởi Hành Chuyến Du Hành Văn Hóa Tự Động */}
                    <button
                        onClick={() => setIsTourModalOpen(true)}
                        className="kg-interactive-panel px-2.5 py-1.5 flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-100 border-amber-500/40 hover:border-amber-400 bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 shadow-md shadow-amber-500/10 transition-all hover:scale-105 whitespace-nowrap flex-shrink-0"
                        title="Khởi hành Chuyến Du Hành Văn Hóa Tự Động (AI Tour Guide)"
                    >
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse flex-shrink-0" />
                        <span className="whitespace-nowrap">Du Hành AI</span>
                    </button>

                    {/* Nút Khám phá Đường dẫn Tri thức */}
                    <button
                        onClick={() => setIsPathModalOpen(true)}
                        className="kg-interactive-panel px-2.5 py-1.5 flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-white border-white/10 hover:border-white/20 transition-colors whitespace-nowrap flex-shrink-0"
                        title="Tìm đường đi ngắn nhất giữa 2 thực thể tri thức (BFS Graph Traversal)"
                    >
                        <Route className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="whitespace-nowrap">Đường Đi<span className="hidden xl:inline"> Văn Hóa</span></span>
                    </button>
                </div>
            </div>

            {/* Canvas Render Area */}
            <div ref={containerRef} className="kg-canvas-wrapper" />

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-sm z-30">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-amber-300 tracking-wide">
                        Đang dệt mạng lưới Đồ thị Tri thức Dân gian...
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                        Tính toán liên kết thực thể ngữ nghĩa & cổ mẫu văn học
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/90 z-30">
                    <p className="text-red-400 font-semibold mb-3">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
                    >
                        Tải lại trang
                    </button>
                </div>
            )}

            {/* Floating Navigation / Zoom Controls (Góc dưới phải) */}
            <div className="kg-floating-tools">
                <button
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    className="kg-tool-btn"
                    title={isSoundEnabled ? 'Tắt âm thanh tương tác' : 'Bật âm thanh chuông ngũ cung'}
                >
                    {isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
                </button>
                <button onClick={handleZoomIn} className="kg-tool-btn" title="Phóng to">
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={handleZoomOut} className="kg-tool-btn" title="Thu nhỏ">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={handleResetView} className="kg-tool-btn" title="Cân bằng về tâm đồ thị">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* HUD Thống kê Khoa học & Chỉ số Centrality (Góc dưới trái) */}
            {graphData?.summary && (
                <div className="kg-interactive-panel kg-hud-stats hidden md:block">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Chỉ Số Mạng Lưới Tri Thức
                        </span>
                        <button
                            onClick={() => setIsOntologyModalOpen(true)}
                            className="text-[11px] text-amber-400 hover:text-amber-200 underline font-medium cursor-pointer flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            4 Tầng Tri Thức
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-white/10">
                        <div>
                            <div className="text-base font-bold text-white">
                                {graphData.summary.totalNodes}
                            </div>
                            <div className="text-[10px] text-stone-400">Thực thể</div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-amber-400">
                                {graphData.summary.totalLinks}
                            </div>
                            <div className="text-[10px] text-stone-400">Mối liên kết</div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-rose-400">
                                {graphData.summary.philosophiesCount}
                            </div>
                            <div className="text-[10px] text-stone-400">Triết lý</div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-emerald-400">
                                {graphData.summary.worksCount}
                            </div>
                            <div className="text-[10px] text-stone-400">Tác phẩm</div>
                        </div>
                    </div>
                    {pathResult && (
                        <div className="mt-2.5 pt-2 border-t border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                            <span>Đã vẽ đường đi: <b>{pathResult.length} bước nhảy</b></span>
                            <button
                                onClick={() => setPathResult(null)}
                                className="text-stone-400 hover:text-white underline text-[11px]"
                            >
                                Xóa đường đi
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Slide-Over Drawer khi click vào 1 Node */}
            {activeNode && (
                <div className="kg-drawer kg-custom-scroll">
                    {/* Header Drawer */}
                    <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm"
                                    style={{ backgroundColor: activeNode.color || '#10b981' }}
                                >
                                    {activeNode.type === 'philosophy'
                                        ? '🟣 Tầng 1: Triết lý nhân sinh (Gốc rễ)'
                                        : activeNode.type === 'archetype'
                                        ? '🟠 Tầng 2: Cổ mẫu văn hóa (Cành cây)'
                                        : activeNode.type === 'region'
                                        ? '🔵 Tầng 3: Địa linh văn hóa (Không gian sống)'
                                        : '🟢 Tầng 4: Tác phẩm văn học (Lá non)'}
                                </span>
                                {activeNode.degree && (
                                    <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        <Flame className="w-3 h-3" />
                                        Bậc: {activeNode.degree} liên kết
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {activeNode.name}
                            </h2>
                            {activeNode.region && (
                                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-stone-400" />
                                    {activeNode.region}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setActiveNode(null)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nội dung chi tiết Drawer */}
                    <div className="p-6 space-y-5 overflow-y-auto flex-1 kg-custom-scroll">
                        {/* Quote hoặc Trích dẫn nổi bật nếu là tác phẩm */}
                        {activeNode.quote && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm italic font-serif leading-relaxed">
                                &ldquo;{activeNode.quote}&rdquo;
                            </div>
                        )}

                        {/* Tóm tắt / Ý nghĩa */}
                        {activeNode.summary && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-amber-400" />
                                    Ý Nghĩa Văn Hóa & Tinh Hoa Dân Gian
                                </h3>
                                <p className="text-sm text-stone-200 leading-relaxed font-light">
                                    {activeNode.summary}
                                </p>
                            </div>
                        )}

                        {/* Chi tiết học thuật / Phân tích thi pháp */}
                        {activeNode.details && (
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                                <h3 className="text-xs font-semibold text-amber-300 mb-1">
                                    Thi Pháp & Chiều Sâu Cổ Mẫu:
                                </h3>
                                <p className="text-xs text-stone-300 leading-relaxed">
                                    {activeNode.details}
                                </p>
                            </div>
                        )}

                        {/* Bài học răn dạy */}
                        {activeNode.lesson && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                                    Bài Học Nhân Sinh:
                                </h3>
                                <p className="text-sm text-stone-300 leading-relaxed">
                                    {activeNode.lesson}
                                </p>
                            </div>
                        )}

                        {/* Tags liên quan */}
                        {activeNode.tags?.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                                    Từ Khóa Ngữ Nghĩa:
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {activeNode.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-stone-300"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Danh sách các thực thể liên kết trực tiếp (1st Degree Neighbors) */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
                                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                                Các Thực Thể Liên Kết Trực Tiếp:
                            </h3>
                            <div className="space-y-2">
                                {graphData?.links
                                    ?.filter((link) => {
                                        const s = typeof link.source === 'object' ? link.source.id : link.source;
                                        const t = typeof link.target === 'object' ? link.target.id : link.target;
                                        return s === activeNode.id || t === activeNode.id;
                                    })
                                    .slice(0, 8)
                                    .map((link, idx) => {
                                        const s = typeof link.source === 'object' ? link.source.id : link.source;
                                        const t = typeof link.target === 'object' ? link.target.id : link.target;
                                        const neighborId = s === activeNode.id ? t : s;
                                        const neighborNode = graphData.nodes.find((n) => n.id === neighborId);
                                        if (!neighborNode) return null;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectSearchNode(neighborNode)}
                                                className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between transition-colors group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: neighborNode.color || '#10b981' }}
                                                    />
                                                    <div className="truncate">
                                                        <div className="text-xs font-medium text-stone-200 group-hover:text-amber-300 transition-colors">
                                                            {neighborNode.name}
                                                        </div>
                                                        <div className="text-[10px] text-stone-400">
                                                            {link.relation || link.label}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center gap-3">
                        {activeNode.slug ? (
                            <Link
                                to={`/kham-pha?q=${encodeURIComponent(activeNode.name)}`}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-600/20"
                            >
                                <BookOpen className="w-4 h-4" />
                                Tra Cứu Tác Phẩm
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    setPathSource(activeNode.id);
                                    setIsPathModalOpen(true);
                                }}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors"
                            >
                                <Route className="w-4 h-4" />
                                Chọn Làm Điểm Bắt Đầu Đường Đi
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Tìm Đường Đi Văn Hóa Ngắn Nhất (Shortest Cultural Path Modal) */}
            {isPathModalOpen && (
                <div className="kg-path-modal">
                    <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <Route className="w-5 h-5 text-amber-400" />
                            <h3 className="text-base font-bold text-white">
                                Khai Phá Đường Đi Văn Hóa
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsPathModalOpen(false)}
                            className="p-1 rounded-lg text-stone-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <p className="text-xs text-stone-300 leading-relaxed">
                            Thuật toán đồ thị <b>BFS (Breadth-First Search)</b> sẽ tìm chuỗi liên kết ngữ nghĩa ngắn nhất nối liền giữa hai thực thể tư tưởng hoặc cổ mẫu dân gian bất kỳ.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-stone-400 mb-1">
                                    Thực thể khởi nguồn (Source Node):
                                </label>
                                <select
                                    value={pathSource}
                                    onChange={(e) => setPathSource(e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-white/15 text-xs text-white outline-none focus:border-amber-400"
                                >
                                    {graphData?.nodes?.map((n) => (
                                        <option key={n.id} value={n.id}>
                                            [{n.type.toUpperCase()}] {n.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-400 mb-1">
                                    Thực thể đích đến (Target Node):
                                </label>
                                <select
                                    value={pathTarget}
                                    onChange={(e) => setPathTarget(e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-white/15 text-xs text-white outline-none focus:border-amber-400"
                                >
                                    {graphData?.nodes?.map((n) => (
                                        <option key={n.id} value={n.id}>
                                            [{n.type.toUpperCase()}] {n.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleFindShortestPath}
                                disabled={isFindingPath || pathSource === pathTarget}
                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isFindingPath ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang duyệt cây đồ thị...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Khai Phá Đường Đi Ngữ Nghĩa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tìm hiểu Ý Nghĩa & Cấu Trúc 4 Tầng Tri Thức */}
            {isOntologyModalOpen && (
                <div className="kg-tour-modal-overlay">
                    <div className="kg-tour-modal-box max-w-3xl">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-stone-950" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                                            Đột Phá Của VietHeritage: Mạch Ngầm Triết Lý Ngàn Năm
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                                            Knowledge Ontology
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-300 mt-1.5 font-light leading-relaxed">
                                        Văn hóa dân gian Việt Nam không tồn tại đơn lẻ, mà có mạch ngầm triết lý xuyên suốt hàng ngàn năm. Đồ thị này sinh ra để kết nối những sợi dây vô hình đó lại với nhau thành <b>4 tầng tri thức</b>:
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOntologyModalOpen(false)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 4 Tầng Tri Thức Cards */}
                        <div className="p-6 space-y-3.5 overflow-y-auto max-h-[60vh] kg-custom-scroll">
                            {/* Tầng 1: Triết lý nhân sinh */}
                            <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/30 hover:border-pink-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                        🟣
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-pink-300">
                                                Tầng 1: Triết Lý Nhân Sinh
                                            </h4>
                                            <span className="text-[10px] px-2 py-0.2 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold">
                                                Gốc rễ vững chắc
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                            <b>Đạo lý cốt lõi:</b> Đạo Hiếu, Uống nước nhớ nguồn, Tương thân tương ái & Tinh thần đùm bọc, Lòng yêu nước & Khát vọng hòa bình...
                                        </p>
                                        <p className="text-[11px] text-stone-400 mt-0.5">
                                            Là hệ giá trị nhân sinh trường tồn, nuôi dưỡng bản lĩnh và phẩm giá người Việt qua hàng thiên niên kỷ.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('philosophy');
                                        setIsOntologyModalOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Lọc xem Triết lý</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Tầng 2: Cổ mẫu văn hóa */}
                            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                        🟠
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-amber-300">
                                                Tầng 2: Cổ Mẫu Văn Hóa (Archetypes)
                                            </h4>
                                            <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                                                Cành cây biểu trưng
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                            <b>Các biểu tượng kinh điển của người Việt:</b> Hình tượng Con Cò & Cánh Vạc, Cây Đa - Bến Nước - Con Đò, Miếng Trầu Cau, Hạt Gạo & Niêu Cơm Thần, Cây Tre & Cành Trúc, Núi Thái Sơn & Chuối Ba Hương...
                                        </p>
                                        <p className="text-[11px] text-stone-400 mt-0.5">
                                            Mẫu thức nghệ thuật ước lệ hóa tư tưởng dân gian thành các hình tượng gần gũi, thiêng liêng.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('archetype');
                                        setIsOntologyModalOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Lọc xem Cổ mẫu</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Tầng 3: Không gian địa linh */}
                            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                        🔵
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-blue-300">
                                                Tầng 3: Địa Linh Văn Hóa
                                            </h4>
                                            <span className="text-[10px] px-2 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                                                Không gian nuôi dưỡng
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                            <b>Không gian địa lý & văn hóa 3 miền:</b> Kinh Kỳ Thăng Long & Bắc Bộ ngàn năm văn hiến, Xứ Lam Hồng & Đèo Ngang kiên cường sâu lắng, Đồng Tháp Mười & Nam Bộ hào sảng nghĩa tình...
                                        </p>
                                        <p className="text-[11px] text-stone-400 mt-0.5">
                                            Mảnh đất nuôi dưỡng mạch nguồn cảm hứng sáng tác của nhân dân qua từng thời kỳ lịch sử.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('region');
                                        setIsOntologyModalOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Lọc xem Địa linh</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Tầng 4: Tác phẩm văn học */}
                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 mt-0.5 text-base">
                                        🟢
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-emerald-300">
                                                Tầng 4: Tác Phẩm Văn Học
                                            </h4>
                                            <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                                                Lá non & hoa trái
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                                            <b>Các bài ca dao, tục ngữ, truyện cổ tích:</b> Thạch Sanh, Sự tích Trầu Cau, Truyện Kiều, Bài ca vỡ đất, Lời ru của mẹ, Thơ Áo trắng...
                                        </p>
                                        <p className="text-[11px] text-stone-400 mt-0.5">
                                            Là sản phẩm biểu đạt cụ thể, đơm hoa kết trái từ các cổ mẫu và bám rễ sâu vào triết lý sống.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('work');
                                        setIsOntologyModalOpen(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Lọc xem Tác phẩm</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Footer Modal Actions */}
                        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-xs text-stone-400">
                                💡 Nhấp chuột vào bất kỳ nốt nào trên đồ thị để khám phá liên kết trực tiếp của nó.
                            </span>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setIsOntologyModalOpen(false);
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                                >
                                    Xem Toàn Bộ Vũ Trụ
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOntologyModalOpen(false);
                                        setIsTourModalOpen(true);
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <Play className="w-3 h-3 fill-stone-950" />
                                    <span>Khởi Hành Du Hành AI</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chọn Chuyến Du Hành Văn Hóa Tự Động */}
            {isTourModalOpen && (
                <div className="kg-tour-modal-overlay">
                    <div className="kg-tour-modal-box">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                        <Play className="w-4 h-4 fill-amber-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        Chọn Chuyến Du Hành Văn Hóa Tự Động
                                    </h3>
                                </div>
                                <p className="text-xs text-stone-400 mt-1">
                                    AI sẽ tự động điều khiển camera bay lượn và thuyết minh từng chặng theo mạch tư tưởng của cha ông
                                </p>
                            </div>
                            <button
                                onClick={() => setIsTourModalOpen(false)}
                                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Danh sách 4 Tours */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto kg-custom-scroll">
                            {graphData?.tours?.map((tour) => (
                                <div
                                    key={tour.id}
                                    onClick={() => handleStartTour(tour)}
                                    className="kg-tour-card group"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <span
                                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-950"
                                            style={{ backgroundColor: tour.themeColor || '#f59e0b' }}
                                        >
                                            {tour.badge}
                                        </span>
                                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-stone-400" />
                                            {tour.duration}
                                        </span>
                                    </div>

                                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                                        {tour.title}
                                    </h4>
                                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                                        {tour.description}
                                    </p>

                                    {/* Danh sách các chặng dừng */}
                                    <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-stone-300">
                                            <span className="text-amber-400 font-bold">{tour.stops.length}</span>
                                            <span className="text-stone-400">chặng dừng chân</span>
                                        </div>
                                        <button className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all">
                                            <Play className="w-3 h-3 fill-stone-950" />
                                            <span>Khởi Hành</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* GIAO DIỆN CHUYẾN DU HÀNH ĐANG CHẠY (Cinematic Tour Story & Controls) */}
            {activeTour && activeTour.stops[tourStepIndex] && (
                <>
                    {/* 1. Hộp Thuyết Minh Văn Hóa (Story Card - Compact & Ghim Góc Phải) */}
                    <div className="kg-tour-story-card">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-950"
                                style={{ backgroundColor: activeTour.themeColor || '#f59e0b' }}
                            >
                                {activeTour.badge || activeTour.title}
                            </span>
                            <div className="flex items-center gap-1.5">
                                {activeTour.stops[tourStepIndex].phase && (
                                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                        {activeTour.stops[tourStepIndex].phase}
                                    </span>
                                )}
                                <span className="text-[11px] text-stone-300 font-bold bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                                    {tourStepIndex + 1}/{activeTour.stops.length}
                                </span>
                            </div>
                        </div>

                        <div className="text-[10px] text-stone-400 uppercase tracking-wider mb-1 font-medium">
                            {activeTour.stops[tourStepIndex].role}
                        </div>

                        <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                            {activeTour.stops[tourStepIndex].title}
                        </h3>

                        {/* Hộp Chuyển Tiếp Bối Cảnh (Contextual Transition Bridge) */}
                        {activeTour.stops[tourStepIndex].transition && (
                            <div className="kg-tour-transition-box mb-2.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse flex-shrink-0" />
                                    <span>Mạch Nguồn Chuyển Tiếp</span>
                                </div>
                                <p className="text-[11px] text-amber-100/90 italic font-serif leading-relaxed">
                                    &ldquo;{activeTour.stops[tourStepIndex].transition}&rdquo;
                                </p>
                            </div>
                        )}

                        <p className="text-xs text-stone-200 leading-relaxed font-light mb-2.5">
                            {activeTour.stops[tourStepIndex].story}
                        </p>

                        {/* Quote Ca dao/Thơ */}
                        {activeTour.stops[tourStepIndex].quote && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs italic font-serif leading-relaxed mb-2.5 shadow-sm">
                                &ldquo;{activeTour.stops[tourStepIndex].quote}&rdquo;
                            </div>
                        )}

                        {/* Đúc kết triết lý */}
                        {activeTour.stops[tourStepIndex].insight && (
                            <div className="text-[11px] text-stone-400 flex items-start gap-1 leading-snug mb-2">
                                <span className="text-amber-400 font-bold flex-shrink-0">💡 Triết lý:</span>
                                <span className="line-clamp-2 text-stone-300">{activeTour.stops[tourStepIndex].insight}</span>
                            </div>
                        )}

                        {/* Trạng thái Thuyết Minh Thời Gian Thực (Chờ đọc xong trọn vẹn mới chuyển chặng) */}
                        <div className="flex items-center justify-between text-[11px] mt-2 mb-1.5 pt-2 border-t border-white/10">
                            {tourNarrationStatus === 'narrating' ? (
                                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                                    <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                                    <span>AI đang đọc thuyết minh...</span>
                                </span>
                            ) : tourNarrationStatus === 'contemplating' ? (
                                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold animate-pulse">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Đã đọc xong • Chuẩn bị chuyển chặng...</span>
                                </span>
                            ) : tourNarrationStatus === 'paused' ? (
                                <span className="flex items-center gap-1.5 text-stone-400">
                                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Tạm dừng du hành</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-stone-300">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Đang đọc chiêm nghiệm...</span>
                                </span>
                            )}
                            <span className="text-stone-400 font-mono text-[10px]">
                                {Math.round(tourTimerProgress)}%
                            </span>
                        </div>

                        {/* Thanh đếm ngược thời gian tự động chuyển chặng */}
                        <div className="kg-tour-timer-track">
                            <div
                                className="kg-tour-timer-fill"
                                style={{ width: `${tourTimerProgress}%` }}
                            />
                        </div>

                        {/* Thông báo khi hoàn tất cả 5 chặng */}
                        {tourStepIndex === activeTour.stops.length - 1 && tourTimerProgress >= 100 && (
                            <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-2 animation-fade-in">
                                <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                    <span>Đã hoàn thành chuyến du hành!</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => {
                                            setTourStepIndex(0);
                                            setIsTourPlaying(true);
                                            setTourTimerProgress(0);
                                        }}
                                        className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 transition-all"
                                        title="Nghe lại tour từ chặng đầu"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Nghe lại
                                    </button>
                                    <button
                                        onClick={() => setIsTourModalOpen(true)}
                                        className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 transition-all"
                                        title="Chọn một chuyến du hành khác"
                                    >
                                        Tour khác
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Thanh Điều Khiển Du Hành (Floating HUD Controls) */}
                    <div className="kg-tour-hud-bar">
                        {/* Nút lùi chặng */}
                        <button
                            onClick={handlePrevTourStep}
                            disabled={tourStepIndex === 0}
                            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Chặng trước"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>

                        {/* Nút Play / Pause */}
                        <button
                            onClick={handleToggleTourPlay}
                            className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
                            title={isTourPlaying ? 'Tạm dừng du hành' : 'Tiếp tục du hành'}
                        >
                            {isTourPlaying ? (
                                <Pause className="w-4 h-4 fill-stone-950" />
                            ) : (
                                <Play className="w-4 h-4 fill-stone-950 ml-0.5" />
                            )}
                        </button>

                        {/* Nút tiến chặng */}
                        <button
                            onClick={handleNextTourStep}
                            disabled={tourStepIndex === activeTour.stops.length - 1}
                            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Chặng tiếp theo"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>

                        <div className="h-4 w-px bg-white/20 mx-1" />

                        {/* Nút bật/tắt thuyết minh giọng đọc AI */}
                        <button
                            onClick={() => setIsVoiceNarrationEnabled(!isVoiceNarrationEnabled)}
                            className={`p-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                isVoiceNarrationEnabled
                                    ? 'text-amber-300 bg-amber-500/15'
                                    : 'text-stone-400 hover:text-white'
                            }`}
                            title={isVoiceNarrationEnabled ? 'Tắt giọng đọc AI' : 'Bật giọng đọc AI'}
                        >
                            {isVoiceNarrationEnabled ? (
                                <Volume2 className="w-4 h-4 text-amber-400" />
                            ) : (
                                <VolumeX className="w-4 h-4 text-stone-400" />
                            )}
                            <span className="hidden sm:inline text-[11px]">
                                {isVoiceNarrationEnabled ? 'Giọng Đọc Bật' : 'Tắt Tiếng'}
                            </span>
                        </button>

                        <div className="h-4 w-px bg-white/20 mx-1" />

                        {/* Nút thoát chuyến du hành */}
                        <button
                            onClick={handleExitTour}
                            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-500/20 text-stone-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title="Kết thúc chuyến du hành"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Thoát Tour</span>
                        </button>
                    </div>
                </>
            )}

            {/* GIAO DIỆN CỖ MÁY THỜI GIAN DI SẢN (Time-Lapse Controls & Floating Story Card) */}
            {isTimeMachineActive && (
                <>
                    {/* 1. Hộp Thuyết Minh Kỷ Nguyên (Floating Narrative Card - Nhẹ nhàng, sắc sảo) */}
                    {isStoryCardCollapsed ? (
                        <div
                            onClick={() => setIsStoryCardCollapsed(false)}
                            className="kg-timemachine-story-card collapsed flex items-center justify-between gap-2.5 cursor-pointer hover:border-amber-400 group"
                            title="Bấm để mở rộng thuyết minh kỷ nguyên"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full animate-ping flex-shrink-0"
                                    style={{ backgroundColor: currentEraData.color || '#f59e0b' }}
                                />
                                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                    {selectedEraId === 0 ? 'Toàn Cảnh Vũ Trụ' : `Kỷ ${selectedEraId}: ${currentEraData.shortName}`}
                                </span>
                                <span className="text-[10px] text-amber-300 font-mono flex-shrink-0">
                                    +{eraStats.newCount} mới
                                </span>
                            </div>
                            <span className="text-[10px] text-stone-400 group-hover:text-amber-300 flex items-center gap-0.5 flex-shrink-0">
                                Mở ▾
                            </span>
                        </div>
                    ) : (
                        <div className="kg-timemachine-story-card">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span
                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-950"
                                    style={{ backgroundColor: currentEraData.color || '#f59e0b' }}
                                >
                                    {selectedEraId === 0 ? 'Toàn Cảnh' : `Kỷ Nguyên ${selectedEraId}`}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-medium text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                        {currentEraData.timeSpan}
                                    </span>
                                    <button
                                        onClick={() => setIsStoryCardCollapsed(true)}
                                        className="p-1 rounded text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                                        title="Thu gọn bảng thuyết minh"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                                {currentEraData.name}
                            </h3>

                            {/* Quote Ca Dao / Thơ Văn / Tuyên ngôn */}
                            {currentEraData.quote && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs italic font-serif leading-relaxed mb-2 shadow-sm">
                                    &ldquo;{currentEraData.quote}&rdquo;
                                </div>
                            )}

                            {/* Tinh hoa mới khởi sinh trong Kỷ nguyên (Tương tác trực tiếp) */}
                            {newlyEmergedNodes.length > 0 && (
                                <div className="mb-2.5 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                                            <span>Mới khởi sinh ({newlyEmergedNodes.length}):</span>
                                        </span>
                                        <span className="text-stone-400 text-[9px] font-normal lowercase">chạm để bay tới</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto kg-custom-scroll pr-0.5">
                                        {newlyEmergedNodes.slice(0, 8).map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() => handleSelectSearchNode(n)}
                                                className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/35 border border-amber-400/30 hover:border-amber-400 text-[10px] text-amber-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer group shadow-sm"
                                                title={`Khám phá nốt: ${n.name}`}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: n.color || '#10b981' }}
                                                />
                                                <span className="truncate max-w-[100px]">{n.name}</span>
                                                <ArrowRight className="w-2.5 h-2.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tóm tắt bối cảnh lịch sử */}
                            <p className="text-xs text-stone-200 leading-relaxed font-light mb-2">
                                {currentEraData.story}
                            </p>

                            {/* Chiều sâu tư tưởng cốt lõi */}
                            {currentEraData.insight && (
                                <div className="text-[11px] text-stone-300 bg-white/[0.03] p-2 rounded-lg border border-white/5 mb-2 leading-relaxed">
                                    <span className="text-amber-400 font-bold block mb-0.5">💡 Chiều sâu tư tưởng:</span>
                                    {currentEraData.insight}
                                </div>
                            )}

                            {/* Thống kê thực thể tích lũy */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px]">
                                <div className="bg-white/5 p-2 rounded-lg">
                                    <div className="text-stone-400">Thực thể tích tụ:</div>
                                    <div className="text-amber-300 font-bold text-xs mt-0.5">
                                        {eraStats.total} nốt tri thức
                                    </div>
                                </div>
                                <div className="bg-white/5 p-2 rounded-lg">
                                    <div className="text-stone-400">
                                        {selectedEraId === 0 ? 'Toàn vũ trụ:' : `Khởi sinh trong Kỷ ${selectedEraId}:`}
                                    </div>
                                    <div className="text-emerald-400 font-bold text-xs mt-0.5">
                                        +{eraStats.newCount} nốt mới
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái Thuyết minh Tiến hóa */}
                            {isTimeLapsePlaying && (
                                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-white/10 text-amber-300 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                                        <span>{isEraVoiceEnabled ? 'AI đang đọc thuyết minh...' : 'Đang diễn tiến thời gian...'}</span>
                                    </span>
                                    <span className="text-stone-400 font-mono text-[10px]">
                                        {Math.round(timeLapseProgress)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Thanh Điều Khiển Cỗ Máy Thời Gian (Dock Bar ở đáy màn hình) */}
                    <div className="kg-timemachine-panel">
                        {/* Thanh tiến trình chuyển động */}
                        {isTimeLapsePlaying && (
                            <div className="w-full h-1 bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 transition-all duration-100 ease-linear"
                                    style={{ width: `${timeLapseProgress}%` }}
                                />
                            </div>
                        )}

                        <div className="p-3 sm:p-4 flex flex-col gap-3">
                            {/* Dòng điều khiển trên */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                                        <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-white">
                                                {currentEraData.shortName || currentEraData.name}
                                            </span>
                                            <span className="text-[10px] text-amber-300/90 bg-amber-500/15 px-2 py-0.2 rounded border border-amber-500/30">
                                                {currentEraData.timeSpan}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-stone-400 mt-0.5">
                                            {selectedEraId === 0
                                                ? 'Toàn bộ 4 tầng tri thức tích lũy qua ngàn năm'
                                                : `Kỷ nguyên ${selectedEraId}/5 • ${eraStats.total} thực thể tích tụ (+${eraStats.newCount} khởi sinh)`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {/* Nút lùi kỷ nguyên */}
                                    <button
                                        onClick={() => {
                                            const prev = selectedEraId <= 1 ? 5 : selectedEraId - 1;
                                            setSelectedEraId(prev);
                                            if (isSoundEnabled) playTraditionalChime(0.75 + prev * 0.15);
                                        }}
                                        className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                                        title="Kỷ nguyên trước"
                                    >
                                        <SkipBack className="w-4 h-4" />
                                    </button>

                                    {/* Nút Phát / Tạm dừng Time-Lapse */}
                                    <button
                                        onClick={() => {
                                            if (!isTimeLapsePlaying && selectedEraId === 0) {
                                                setSelectedEraId(1);
                                            }
                                            setIsTimeLapsePlaying(!isTimeLapsePlaying);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-transform active:scale-95"
                                    >
                                        {isTimeLapsePlaying ? (
                                            <>
                                                <Pause className="w-3.5 h-3.5 fill-stone-950" />
                                                <span>Tạm Dừng</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3.5 h-3.5 fill-stone-950 ml-0.5" />
                                                <span>Phát Tiến Hóa</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Nút tiến kỷ nguyên */}
                                    <button
                                        onClick={() => {
                                            const next = selectedEraId >= 5 ? 1 : selectedEraId + 1;
                                            setSelectedEraId(next);
                                            if (isSoundEnabled) playTraditionalChime(0.75 + next * 0.15);
                                        }}
                                        className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                                        title="Kỷ nguyên tiếp theo"
                                    >
                                        <SkipForward className="w-4 h-4" />
                                    </button>

                                    <div className="h-4 w-px bg-white/15 mx-1" />

                                    {/* Nút bật/tắt giọng đọc AI */}
                                    <button
                                        onClick={() => {
                                            if (isEraVoiceEnabled && window.speechSynthesis) {
                                                window.speechSynthesis.cancel();
                                            }
                                            setIsEraVoiceEnabled(!isEraVoiceEnabled);
                                        }}
                                        className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                                            isEraVoiceEnabled ? 'text-amber-300 bg-amber-500/15' : 'text-stone-400 hover:text-white'
                                        }`}
                                        title={isEraVoiceEnabled ? 'Tắt giọng đọc kỷ nguyên' : 'Bật giọng đọc kỷ nguyên'}
                                    >
                                        {isEraVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    </button>

                                    {/* Nút Đóng Cỗ Máy Thời Gian */}
                                    <button
                                        onClick={() => {
                                            setIsTimeMachineActive(false);
                                            setIsTimeLapsePlaying(false);
                                            setSelectedEraId(0);
                                            if (window.speechSynthesis) window.speechSynthesis.cancel();
                                        }}
                                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                        title="Đóng Cỗ Máy Thời Gian"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Stepper buttons (Kỷ 0 + Kỷ 1..5) */}
                            <div className="grid grid-cols-6 gap-1.5 pt-1 border-t border-white/10">
                                <button
                                    onClick={() => {
                                        setSelectedEraId(0);
                                        if (isSoundEnabled) playTraditionalChime(1);
                                    }}
                                    className={`kg-era-step-btn ${selectedEraId === 0 ? 'active border-amber-400' : ''}`}
                                >
                                    <span className="text-[10px] font-bold text-amber-300">Vũ Trụ</span>
                                    <span className="text-[9px] text-stone-400 hidden sm:inline">Vĩnh Cửu</span>
                                </button>
                                {activeErasList.map((era) => {
                                    const isSelected = selectedEraId === era.id;
                                    return (
                                        <button
                                            key={era.id}
                                            onClick={() => {
                                                setSelectedEraId(era.id);
                                                if (isSoundEnabled) playTraditionalChime(0.75 + era.id * 0.15);
                                            }}
                                            className={`kg-era-step-btn ${isSelected ? 'active' : ''}`}
                                            style={{
                                                borderColor: isSelected ? era.color : undefined,
                                            }}
                                        >
                                            <span
                                                className="text-[10px] font-bold truncate max-w-full"
                                                style={{ color: isSelected ? era.color : '#e2e8f0' }}
                                            >
                                                Kỷ {era.id}
                                            </span>
                                            <span className="text-[9px] text-stone-400 truncate max-w-full hidden sm:inline">
                                                {era.shortName}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default KnowledgeGraph;
