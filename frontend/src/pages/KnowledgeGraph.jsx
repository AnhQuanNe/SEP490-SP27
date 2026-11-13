import { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph from 'force-graph';
import { forceCollide, forceRadial, forceCenter } from 'd3-force-3d';
import literatureService from '../services/literature.service';
import { DEFAULT_ERAS } from '../data/knowledgeGraphData';
import { playTraditionalChime } from '../utils/graphAudio';
import GraphHeaderToolbar from '../components/knowledge-graph/GraphHeaderToolbar';
import GraphNodeDetailSidebar from '../components/knowledge-graph/GraphNodeDetailSidebar';
import GraphPathModal from '../components/knowledge-graph/GraphPathModal';
import GraphPathResultHUD from '../components/knowledge-graph/GraphPathResultHUD';
import GraphOntologyModal from '../components/knowledge-graph/GraphOntologyModal';
import GraphTourModal from '../components/knowledge-graph/GraphTourModal';
import GraphTourPlayerHUD from '../components/knowledge-graph/GraphTourPlayerHUD';
import GraphTimeMachineHUD from '../components/knowledge-graph/GraphTimeMachineHUD';
import GraphMajorHubsBar from '../components/knowledge-graph/GraphMajorHubsBar';
import { Loader2, AlertCircle } from 'lucide-react';
import './KnowledgeGraph.css';

/**
 * KnowledgeGraph - Vũ Trụ Tri Thức Văn Hóa Dân Gian
 * Trang điều phối chính hiển thị đồ thị tương tác ForceGraph, Cỗ máy thời gian,
 * Chuyến du hành AI Guided Tour và khai phá đường đi văn hóa (BFS).
 */
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
    const [pathError, setPathError] = useState(null);

    // Đảm bảo khi mở Modal tìm đường thì 2 điểm khởi nguồn và đích luôn hợp lệ và khác nhau
    useEffect(() => {
        if (isPathModalOpen && graphData?.nodes?.length > 1) {
            const currentSource = pathSource || graphData.nodes[0].id;
            if (!pathSource) {
                setPathSource(currentSource);
            }
            if (!pathTarget || pathTarget === currentSource) {
                const alt = graphData.nodes.find((n) => n.id !== currentSource);
                if (alt) setPathTarget(alt.id);
            }
        }
    }, [isPathModalOpen, graphData, pathSource, pathTarget]);

    // AI Guided Cultural Tour state (Chuyến Du Hành Văn Hóa Tự Động)
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);
    const [activeTour, setActiveTour] = useState(null);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [isTourPlaying, setIsTourPlaying] = useState(false);
    const [isVoiceNarrationEnabled, setIsVoiceNarrationEnabled] = useState(true);
    const [tourTimerProgress, setTourTimerProgress] = useState(0);
    const [tourNarrationStatus, setTourNarrationStatus] = useState('reading');
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
                if (tourStepIndex > 0) {
                    const prevStop = activeTour.stops[tourStepIndex - 1];
                    nodes.add(prevStop.nodeId);
                    links.add(`${prevStop.nodeId}-${currentStop.nodeId}`);
                    links.add(`${currentStop.nodeId}-${prevStop.nodeId}`);
                }
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

    // Đồng bộ highlightedElementsRef
    useEffect(() => {
        highlightedElementsRef.current = highlightedElements;
        activeNodeRef.current = activeNode;
        hoveredNodeRef.current = hoveredNode;
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

    // Danh sách Kỷ nguyên văn hóa
    const activeErasList = useMemo(() => {
        if (graphData?.eras && Array.isArray(graphData.eras) && graphData.eras.length > 0) {
            return graphData.eras;
        }
        return DEFAULT_ERAS;
    }, [graphData]);

    // Dữ liệu chi tiết Kỷ nguyên hiện tại
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

    // Danh sách nốt mới khởi sinh trong Kỷ nguyên hiện tại
    const newlyEmergedNodes = useMemo(() => {
        if (!graphData?.nodes || selectedEraId === 0) return [];
        return graphData.nodes.filter((n) => (n.bornEra || 1) === selectedEraId);
    }, [graphData, selectedEraId]);

    // Khởi tạo Canvas Force-Graph
    useEffect(() => {
        if (!containerRef.current || !graphData || isLoading) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

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
            .d3AlphaDecay(0.015)
            .d3VelocityDecay(0.35)
            .cooldownTicks(200)
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
                if (hasFocus) return 'rgba(255, 255, 255, 0.02)';
                return 'rgba(255, 255, 255, 0.08)';
            })
            .linkWidth((link) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const isHighlighted =
                    highlightedElementsRef.current.links.has(`${sourceId}-${targetId}`) ||
                    highlightedElementsRef.current.links.has(`${targetId}-${sourceId}`);
                return isHighlighted ? 2.5 : 0.8;
            })
            .linkCanvasObjectMode(() => 'after')
            .linkCanvasObject((link, ctx, globalScale) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const isHighlighted =
                    highlightedElementsRef.current.links.has(`${sourceId}-${targetId}`) ||
                    highlightedElementsRef.current.links.has(`${targetId}-${sourceId}`);

                if (!isHighlighted) return;

                const currentActive = activeNodeRef.current;
                const currentHovered = hoveredNodeRef.current;
                const isPathActive = pathResult?.path?.length > 0;

                // Kiểm tra xem link có đang được rê chuột trực tiếp vào không
                const isDirectHover = currentHovered && (sourceId === currentHovered.id || targetId === currentHovered.id);

                // Quy tắc chống đè chữ: Nếu một nốt có nhiều nhánh liên kết, chỉ hiện nhãn khi rê chuột vào nốt đó hoặc khi đang xem đường đi
                if (!isPathActive && currentActive && !isDirectHover && highlightedElementsRef.current.links.size > 6) {
                    return;
                }

                const rawLabel = link.label || link.relation || '';
                if (!rawLabel) return;

                // Chuyển đổi nhãn snake_case/kỹ thuật thành từ ngữ tiếng Việt tự nhiên và thanh lịch
                const cleanLabelMap = {
                    'BIỂU_TRƯNG_CHO': 'biểu trưng',
                    'THUỘC_CHỦ_ĐỀ': 'thuộc chủ đề',
                    'MANG_HÌNH_TƯỢNG': 'hình tượng',
                    'GẮN_LIỀN_ĐỊA_DANH': 'xuất xứ',
                    'ĐỒNG_ĐIỆU_TƯ_TƯỞNG': 'đồng điệu',
                    'SYMBOLISES': 'biểu trưng',
                    'TRANSMITS': 'chuyển tải',
                    'EMBODIES': 'khắc họa',
                    'ORIGINATES_FROM': 'gắn liền',
                };
                const displayLabel = cleanLabelMap[rawLabel] || rawLabel.toLowerCase().replace(/_/g, ' ');

                const s = link.source;
                const t = link.target;
                if (typeof s !== 'object' || typeof t !== 'object' || typeof s.x !== 'number' || typeof t.x !== 'number') return;

                // Tính toán vị trí dãn về phía nốt vệ tinh bên ngoài (62% quãng đường) để tránh chụm chữ ở tâm
                const isSourceCenter = currentActive && s.id === currentActive.id;
                const tFactor = isSourceCenter ? 0.62 : 0.38;
                const labelX = s.x + (t.x - s.x) * tFactor;
                const labelY = s.y + (t.y - s.y) * tFactor;

                const fontSize = Math.max(8.5, Math.min(10.5, 10 / Math.sqrt(globalScale)));
                ctx.save();
                ctx.font = `500 ${fontSize}px sans-serif`;
                const textWidth = ctx.measureText(displayLabel).width;

                // Nền bo góc nhỏ gọn, tinh tế
                const padX = 5;
                const padY = 2.5;
                ctx.fillStyle = isDirectHover ? 'rgba(15, 23, 42, 0.95)' : 'rgba(24, 24, 27, 0.82)';
                ctx.strokeStyle = isDirectHover ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)';
                ctx.lineWidth = isDirectHover ? 1.2 : 0.8;

                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(labelX - textWidth / 2 - padX, labelY - fontSize / 2 - padY, textWidth + padX * 2, fontSize + padY * 2, 4);
                } else {
                    ctx.rect(labelX - textWidth / 2 - padX, labelY - fontSize / 2 - padY, textWidth + padX * 2, fontSize + padY * 2);
                }
                ctx.fill();
                ctx.stroke();

                // Chữ nhãn mềm mại
                ctx.fillStyle = isDirectHover ? '#fef08a' : '#fcd34d';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(displayLabel, labelX, labelY);
                ctx.restore();
            })
            .nodeCanvasObject((node, ctx, globalScale) => {
                const currentActiveNode = activeNodeRef.current;
                const currentHoveredNode = hoveredNodeRef.current;
                const isSelected = currentActiveNode?.id === node.id;
                const isHovered = currentHoveredNode?.id === node.id;
                const isTourCurrentNode = activeTourRef.current?.stops[tourStepIndexRef.current]?.nodeId === node.id;
                const isNewInCurrentEra = isTimeMachineActiveRef.current && selectedEraIdRef.current > 0 && (node.bornEra || 1) === selectedEraIdRef.current;
                const isMajorHub = Boolean(node.isMajorHub || node.isPillar);
                
                const hasFocus = currentActiveNode || currentHoveredNode || activeTourRef.current || pathResult?.path?.length;
                const isHighlighted = !hasFocus || highlightedElementsRef.current.nodes.has(node.id);

                // Tính toán bán kính phân tầng rõ rệt: Major Hub lớn vượt trội, Work lá non nhỏ gọn tinh tế
                const baseVal = node.val || 12;
                const r = Math.sqrt(Math.max(0, baseVal)) * (
                    isMajorHub 
                        ? 3.8 
                        : node.type === 'philosophy' 
                        ? 2.8 
                        : node.type === 'archetype' 
                        ? 2.4 
                        : node.type === 'region' 
                        ? 2.3 
                        : 1.5
                );

                ctx.save();

                // 1. Vẽ vòng hào quang năng lượng (Aura Glow & Pulsing Supernova)
                if (isHighlighted) {
                    if (isMajorHub && !hasFocus) {
                        // Hiệu ứng nhịp đập vũ trụ (Cosmic Pulsing Aura) cho 5 Trụ cột cốt lõi
                        const pulse = (Math.sin(Date.now() / 450) + 1) / 2;
                        
                        // Vành hào quang khuếch tán ngoài cùng
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r + 12 + pulse * 6, 0, 2 * Math.PI, false);
                        ctx.fillStyle = `${node.color || '#ec4899'}22`;
                        ctx.shadowColor = node.color || '#ec4899';
                        ctx.shadowBlur = 28 + pulse * 10;
                        ctx.fill();

                        // Vành đai tia sáng vàng kim bao quanh Trụ cột
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r + 5 + pulse * 3, 0, 2 * Math.PI, false);
                        ctx.lineWidth = 1.4;
                        ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + pulse * 0.4})`;
                        ctx.setLineDash([4, 3]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    } else if (isSelected || isHovered || isTourCurrentNode || isNewInCurrentEra || (hasFocus && highlightedElementsRef.current.nodes.has(node.id))) {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r + (isTourCurrentNode ? 9 : isSelected ? 8 : isNewInCurrentEra ? 6 : isHovered ? 5 : 3), 0, 2 * Math.PI, false);
                        ctx.fillStyle = isTourCurrentNode
                            ? 'rgba(251, 191, 36, 0.45)'
                            : isNewInCurrentEra
                            ? 'rgba(245, 158, 11, 0.4)'
                            : isSelected
                            ? 'rgba(251, 191, 36, 0.4)'
                            : `${node.color || '#10b981'}35`;
                        ctx.shadowColor = isTourCurrentNode ? '#fbbf24' : isNewInCurrentEra ? '#f59e0b' : (node.color || '#10b981');
                        ctx.shadowBlur = isTourCurrentNode ? 24 : isNewInCurrentEra ? 18 : isSelected ? 22 : isHovered ? 14 : 8;
                        ctx.fill();
                    }
                }

                // 2. Vẽ hình tròn nốt chính
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = isHighlighted ? (node.color || '#10b981') : 'rgba(55, 65, 81, 0.18)';
                ctx.shadowBlur = 0;
                ctx.fill();

                // Viền ngoài nốt
                ctx.lineWidth = isTourCurrentNode ? 3.5 : isSelected ? 2.8 : isMajorHub ? 2.6 : isHovered ? 2 : 1;
                ctx.strokeStyle = isTourCurrentNode
                    ? '#fbbf24'
                    : isSelected
                    ? '#ffffff'
                    : isMajorHub
                    ? '#fef08a'
                    : isHighlighted
                    ? 'rgba(255, 255, 255, 0.65)'
                    : 'rgba(255, 255, 255, 0.08)';
                ctx.stroke();

                // Lõi sáng trắng tinh tú ở tâm Trụ cột cốt lõi
                if (isMajorHub && isHighlighted) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, Math.max(2.5, r * 0.22), 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                }

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

                // 3. Quy tắc hiển thị nhãn chữ (Phân cấp thị giác thông minh & Chống ngợp)
                let shouldShowLabel = false;
                const isFocused = isSelected || isHovered || isTourCurrentNode;

                if (isFocused || isNewInCurrentEra) {
                    // Luôn hiện nhãn cho nốt đang chọn, rê chuột, hoặc nốt trong tour
                    shouldShowLabel = true;
                } else if (hasFocus) {
                    // Khi đang focus vào một nốt: hiện nhãn của nốt đó và các nốt kết nối trực tiếp
                    if (highlightedElementsRef.current.nodes.has(node.id)) {
                        shouldShowLabel = true;
                    }
                } else {
                    // CHẾ ĐỘ MẶC ĐỊNH KHI MỚI VÀO (TOÀN CẢNH):
                    // 1. Chỉ các Trụ cột cốt lõi (Major Hubs) mới được hiển thị nhãn rõ ràng
                    if (isMajorHub) {
                        shouldShowLabel = true;
                    } 
                    // 2. Khi người dùng zoom vào vừa phải (globalScale >= 1.6):
                    // Hé lộ nhãn Cổ mẫu & Triết lý phụ
                    else if (globalScale >= 1.6 && (node.type === 'archetype' || node.type === 'philosophy' || node.type === 'region')) {
                        shouldShowLabel = true;
                    } 
                    // 3. Khi người dùng zoom sâu (globalScale >= 2.4):
                    // Hé lộ toàn bộ tên tác phẩm lá non
                    else if (globalScale >= 2.4) {
                        shouldShowLabel = true;
                    }
                }

                if (shouldShowLabel && isHighlighted) {
                    let label = node.name || '';
                    if (isMajorHub && !label.startsWith('👑 ')) {
                        label = `👑 ${label}`;
                    }
                    
                    // Nếu nốt đang được chọn, rê chuột, hoặc là nốt liên kết trực tiếp trong tầm ngắm: hiển thị trọn vẹn tên
                    const isDirectNeighbor = hasFocus && highlightedElementsRef.current.nodes.has(node.id);
                    const isProminentlyViewed = isFocused || isDirectNeighbor || isMajorHub;

                    if (!isProminentlyViewed && label.length > 24) {
                        label = label.slice(0, 22) + '...';
                    } else if (label.length > 38) {
                        label = label.slice(0, 36) + '...';
                    }

                    const baseFontSize = isMajorHub ? 13 : (node.type === 'archetype' || node.type === 'philosophy') ? 11 : 10;
                    const fontSize = Math.max(9, Math.min(isMajorHub ? 15 : 13, baseFontSize / Math.sqrt(globalScale)));
                    ctx.font = `${isMajorHub ? 'bold' : (node.type === 'archetype' || node.type === 'philosophy' || isFocused) ? '600' : '400'} ${fontSize}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const textY = node.y + r + fontSize + (isMajorHub ? 6 : 4);
                    const textWidth = ctx.measureText(label).width;

                    ctx.beginPath();
                    const padX = isMajorHub ? 8 : 6;
                    const padY = isMajorHub ? 3.5 : 2.5;
                    const bX = node.x - textWidth / 2 - padX;
                    const bY = textY - fontSize / 2 - padY;
                    const bW = textWidth + padX * 2;
                    const bH = fontSize + padY * 2;
                    
                    ctx.fillStyle = isFocused 
                        ? 'rgba(15, 23, 42, 0.96)' 
                        : isMajorHub 
                        ? 'rgba(10, 15, 26, 0.92)' 
                        : 'rgba(6, 9, 14, 0.8)';
                    ctx.strokeStyle = isFocused 
                        ? (node.color || '#fbbf24') 
                        : isMajorHub 
                        ? 'rgba(251, 191, 36, 0.85)' 
                        : 'rgba(255, 255, 255, 0.12)';
                    ctx.lineWidth = isMajorHub ? 1.4 : 1;

                    if (ctx.roundRect) {
                        ctx.roundRect(bX, bY, bW, bH, isMajorHub ? 6 : 4);
                    } else {
                        ctx.rect(bX, bY, bW, bH);
                    }
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = isTourCurrentNode 
                        ? '#fbbf24' 
                        : isSelected 
                        ? '#fbbf24' 
                        : isMajorHub
                        ? '#fef08a'
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
                const isMajorHub = Boolean(node.isMajorHub || node.isPillar);
                const baseVal = node.val || 12;
                const r = Math.sqrt(Math.max(0, baseVal)) * (
                    isMajorHub ? 3.8 : node.type === 'philosophy' ? 2.8 : node.type === 'archetype' ? 2.4 : node.type === 'region' ? 2.3 : 1.5
                ) + 6;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fill();
            })
            .onNodeClick((node) => {
                if (isSoundEnabled) playTraditionalChime();

                if (activeTourRef.current?.stops) {
                    const stopIndex = activeTourRef.current.stops.findIndex((s) => s.nodeId === node.id);
                    if (stopIndex !== -1) {
                        setTourStepIndex(stopIndex);
                        return;
                    }
                }

                setActiveNode(node);
                // Giữ lại pathResult để người dùng có thể vừa xem đường đi vừa xem chi tiết nốt trên đường đi
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

        graph.minZoom(0.55).maxZoom(4.2);

        if (graph.d3Force('charge')) {
            graph.d3Force('charge')
                .strength((node) => {
                    const isMajorHub = Boolean(node.isMajorHub || node.isPillar);
                    if (isMajorHub) return -720;
                    if (node.type === 'philosophy') return -460;
                    if (node.type === 'archetype') return -360;
                    if (node.type === 'region') return -320;
                    return -180;
                })
                .distanceMin(30)
                .distanceMax(950);
        }
        if (graph.d3Force('link')) {
            graph.d3Force('link')
                .distance((link) => {
                    const l = link.label || '';
                    if (l.includes('chủ đề')) return 165;
                    if (l.includes('địa danh') || l.includes('xuất xứ')) return 145;
                    if (l.includes('hình tượng')) return 130;
                    if (l.includes('biểu trưng')) return 140;
                    return 110;
                });
        }
        // Thêm lực chống đè nốt (Collision force) giúp các nốt dãn ra, không bị rối mắt
        try {
            graph.d3Force('collide', forceCollide().radius((node) => {
                const isMajorHub = Boolean(node.isMajorHub || node.isPillar);
                const baseVal = node.val || 12;
                return Math.sqrt(Math.max(0, baseVal)) * (isMajorHub ? 4.2 : 3.0) + (isMajorHub ? 32 : 18);
            }).iterations(2));
        } catch (e) {
            console.warn('Không thể khởi tạo collide force:', e);
        }

        // Lực hút định hướng về tâm (Radial & Center): Giữ các nốt luôn quây quần thành một dải ngân hà thống nhất, không trôi dạt ra góc xa
        try {
            graph.d3Force('radial', forceRadial(0, 0, 0).strength((node) => {
                return (node.degree && node.degree > 3) ? 0.03 : 0.08;
            }));
            graph.d3Force('center', forceCenter(0, 0));
        } catch (e) {
            console.warn('Không thể khởi tạo radial/center force:', e);
        }

        graphInstance.current = graph;

        const timer = setTimeout(() => {
            graph.zoomToFit(700, 70);
            // Đảm bảo mức zoom ban đầu luôn bung tỏa đầy đặn màn hình, không bị teo nhỏ
            setTimeout(() => {
                const currentZ = graph.zoom();
                if (currentZ < 0.95) {
                    graph.zoom(1.18, 600);
                }
            }, 750);
        }, 500);

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

    // Cập nhật động dữ liệu đồ thị khi đổi Kỷ nguyên hoặc Danh mục
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

    // Bộ não điều phối Tiến Hóa Thời Gian
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
        graphInstance.current.centerAt(0, 0, 700);
        graphInstance.current.zoom(1.18, 700);
    };

    // Tìm đường đi văn hóa ngắn nhất (BFS) kèm AI Luận Giải (Gemini)
    const handleFindShortestPath = async () => {
        if (!pathSource || !pathTarget || pathSource === pathTarget) return;

        try {
            setIsFindingPath(true);
            setPathError(null);
            setActiveNode(null); // Đóng sidebar chi tiết nốt đơn lẻ để nhường không gian cho con đường

            let res;
            try {
                res = await literatureService.explainPathWithAI(pathSource, pathTarget);
            } catch (aiErr) {
                console.warn('Lỗi AI explainPath, chuyển sang BFS trực tiếp:', aiErr);
                res = await literatureService.getKnowledgeGraphShortestPath(pathSource, pathTarget);
            }

            const finalData = res?.data || res;

            if (finalData && finalData.found && finalData.path?.length > 1) {
                setPathResult(finalData);
                setPathError(null);
                setIsPathModalOpen(false);

                if (graphInstance.current) {
                    if (isSoundEnabled) playTraditionalChime();
                    // Tìm tọa độ trung tâm của toàn bộ con đường để camera bao quát hoàn hảo
                    const runtimeNodes = graphInstance.current.graphData()?.nodes || [];
                    const pathNodeIds = new Set(finalData.path.map((p) => p.id));
                    const matchedNodes = runtimeNodes.filter((n) => pathNodeIds.has(n.id) && typeof n.x === 'number');

                    if (matchedNodes.length > 0) {
                        const avgX = matchedNodes.reduce((sum, n) => sum + n.x, 0) / matchedNodes.length;
                        const avgY = matchedNodes.reduce((sum, n) => sum + n.y, 0) / matchedNodes.length;
                        // Nâng camera lên nửa trên màn hình (cộng offset Y +115) để toàn bộ con đường hiển thị thoáng đãng phía trên hộp HUD
                        graphInstance.current.centerAt(avgX, avgY + 115, 900);
                        graphInstance.current.zoom(1.3, 900);
                    }
                }
            } else {
                setPathError('Không tìm thấy đường đi giữa 2 thực thể này trên đồ thị. Hãy thử chọn các thực thể khác!');
            }
        } catch (err) {
            console.error('Lỗi tìm đường đi văn hóa:', err);
            setPathError('Có lỗi xảy ra khi duyệt cây đồ thị hoặc kết nối máy chủ.');
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
                if (window.speechSynthesis && window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                }
                setTourNarrationStatus('paused');
            } else {
                if (window.speechSynthesis && window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                    setTourNarrationStatus('narrating');
                }
            }
            return next;
        });
    };

    // Phím tắt bàn phím
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

    // Khi chuyển chặng tour: Bay camera đến nốt hiện tại
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

    // Điều phối giọng đọc thuyết minh của Tour
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

        const fullNarrativeText =
            currentStop.voiceNarration ||
            `${currentStop.transition ? currentStop.transition + ' ' : ''}${currentStop.title}. ${currentStop.story}${currentStop.quote ? ' ' + currentStop.quote : ''}`;
        const cleanSpeechText = fullNarrativeText.replace(/[/]/g, ', ').replace(/\s+/g, ' ').trim();
        const wordCount = cleanSpeechText.split(/\s+/).filter(Boolean).length;

        if (isVoiceNarrationEnabled && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setTourNarrationStatus('narrating');

            const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95;
            utterance.pitch = 1.0;

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
            const estimatedDuration = Math.max(7000, wordCount * 360 + 2000);
            let isUtteranceEnded = false;

            const handleSpeechFinished = () => {
                if (isUtteranceEnded) return;
                isUtteranceEnded = true;
                clearInterval(progressIntervalRef.current);
                setTourTimerProgress(100);
                setTourNarrationStatus('contemplating');

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

            const startTime = Date.now();
            progressIntervalRef.current = setInterval(() => {
                if (isUtteranceEnded) return;
                const elapsed = Date.now() - startTime;
                const pct = Math.min(95, (elapsed / estimatedDuration) * 95);
                setTourTimerProgress(pct);
            }, 100);

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
            {/* 1. THANH CÔNG CỤ ĐỈNH TRANG */}
            <GraphHeaderToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                onSelectSearchNode={handleSelectSearchNode}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                isSoundEnabled={isSoundEnabled}
                setIsSoundEnabled={setIsSoundEnabled}
                isTimeMachineActive={isTimeMachineActive}
                setIsTimeMachineActive={setIsTimeMachineActive}
                isTourModalOpen={isTourModalOpen}
                setIsTourModalOpen={setIsTourModalOpen}
                isPathModalOpen={isPathModalOpen}
                setIsPathModalOpen={setIsPathModalOpen}
                isOntologyModalOpen={isOntologyModalOpen}
                setIsOntologyModalOpen={setIsOntologyModalOpen}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                graphData={graphData}
            />

            {/* 1.5. THANH ĐỊNH HƯỚNG TRỤ CỘT CỐT LÕI (DÀNH CHO NGƯỜI DÙNG MỚI) */}
            <GraphMajorHubsBar
                majorHubs={graphData?.majorHubs}
                activeNode={activeNode}
                onSelectHub={handleSelectSearchNode}
                isTimeMachineActive={isTimeMachineActive}
                isTourActive={Boolean(activeTour)}
                isPathResultActive={Boolean(pathResult?.path?.length)}
            />

            {/* 2. KHUNG VẼ CANVAS ĐỒ THỊ FORCEGRAPH */}
            <div ref={containerRef} className="kg-canvas-wrapper" />

            {/* Trạng thái tải dữ liệu */}
            {isLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
                    <p className="text-sm font-medium text-stone-200">
                        Đang khởi tạo Vũ Trụ Tri Thức & Tính toán Lực liên kết...
                    </p>
                </div>
            )}

            {/* Trạng thái báo lỗi kết nối */}
            {error && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-red-950/80 border border-red-500/50 p-4 rounded-xl text-red-200 text-xs flex items-center gap-2 shadow-2xl">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>{error}</span>
                </div>
            )}

            {/* 3. CHI TIẾT NỐT TRI THỨC (DRAWER) */}
            <GraphNodeDetailSidebar
                activeNode={activeNode}
                onClose={() => setActiveNode(null)}
                graphData={graphData}
                onSelectSearchNode={handleSelectSearchNode}
                onSelectPathSource={(sourceId) => {
                    setPathSource(sourceId);
                    if (pathTarget === sourceId && graphData?.nodes?.length > 1) {
                        const altNode = graphData.nodes.find((n) => n.id !== sourceId);
                        if (altNode) setPathTarget(altNode.id);
                    }
                    setIsPathModalOpen(true);
                }}
            />

            {/* 4. MODAL TÌM ĐƯỜNG ĐI VĂN HÓA (BFS) */}
            <GraphPathModal
                isOpen={isPathModalOpen}
                onClose={() => {
                    setIsPathModalOpen(false);
                    setPathError(null);
                }}
                pathSource={pathSource}
                setPathSource={(val) => {
                    setPathSource(val);
                    setPathError(null);
                }}
                pathTarget={pathTarget}
                setPathTarget={(val) => {
                    setPathTarget(val);
                    setPathError(null);
                }}
                isFindingPath={isFindingPath}
                onFindShortestPath={handleFindShortestPath}
                graphData={graphData}
                pathError={pathError}
            />

            {/* 4.5. HUD HIỂN THỊ ĐƯỜNG ĐI VĂN HÓA KÈM AI LUẬN GIẢI */}
            <GraphPathResultHUD
                pathResult={pathResult}
                onClose={() => setPathResult(null)}
                onSelectNode={(node) => {
                    setActiveNode(node);
                    if (graphInstance.current) {
                        if (isSoundEnabled) playTraditionalChime();
                        const runtimeNodes = graphInstance.current.graphData()?.nodes || [];
                        const runtimeTarget = runtimeNodes.find((n) => n.id === node.id);
                        if (runtimeTarget && typeof runtimeTarget.x === 'number') {
                            // Camera bay thẳng đến nốt đó trên đường đi
                            graphInstance.current.centerAt(runtimeTarget.x, runtimeTarget.y, 800);
                            graphInstance.current.zoom(2.2, 800);
                        }
                    }
                }}
                isSoundEnabled={isSoundEnabled}
                isSidebarOpen={Boolean(activeNode)}
            />

            {/* 5. MODAL GIẢI THÍCH 4 TẦNG TRI THỨC */}
            <GraphOntologyModal
                isOpen={isOntologyModalOpen}
                onClose={() => setIsOntologyModalOpen(false)}
                onSelectCategory={setSelectedCategory}
                onOpenTourModal={() => setIsTourModalOpen(true)}
            />

            {/* 6. MODAL CHỌN CHUYẾN DU HÀNH VĂN HÓA AI */}
            <GraphTourModal
                isOpen={isTourModalOpen}
                onClose={() => setIsTourModalOpen(false)}
                tours={graphData?.tours}
                onStartTour={handleStartTour}
            />

            {/* 7. GIAO DIỆN CHUYẾN DU HÀNH ĐANG CHẠY (STORY CARD & CONTROLS HUD) */}
            <GraphTourPlayerHUD
                activeTour={activeTour}
                tourStepIndex={tourStepIndex}
                tourNarrationStatus={tourNarrationStatus}
                tourTimerProgress={tourTimerProgress}
                isTourPlaying={isTourPlaying}
                isVoiceNarrationEnabled={isVoiceNarrationEnabled}
                setIsVoiceNarrationEnabled={setIsVoiceNarrationEnabled}
                onPrevTourStep={handlePrevTourStep}
                onNextTourStep={handleNextTourStep}
                onToggleTourPlay={handleToggleTourPlay}
                onExitTour={handleExitTour}
                onRestartTour={() => {
                    setTourStepIndex(0);
                    setIsTourPlaying(true);
                    setTourTimerProgress(0);
                }}
                onOpenTourModal={() => setIsTourModalOpen(true)}
            />

            {/* 8. GIAO DIỆN CỖ MÁY THỜI GIAN DI SẢN (TIME-LAPSE & DOCK BAR) */}
            <GraphTimeMachineHUD
                isActive={isTimeMachineActive}
                selectedEraId={selectedEraId}
                setSelectedEraId={setSelectedEraId}
                currentEraData={currentEraData}
                activeErasList={activeErasList}
                eraStats={eraStats}
                newlyEmergedNodes={newlyEmergedNodes}
                isStoryCardCollapsed={isStoryCardCollapsed}
                setIsStoryCardCollapsed={setIsStoryCardCollapsed}
                isTimeLapsePlaying={isTimeLapsePlaying}
                setIsTimeLapsePlaying={setIsTimeLapsePlaying}
                timeLapseProgress={timeLapseProgress}
                isEraVoiceEnabled={isEraVoiceEnabled}
                setIsEraVoiceEnabled={setIsEraVoiceEnabled}
                isSoundEnabled={isSoundEnabled}
                playTraditionalChime={playTraditionalChime}
                onSelectSearchNode={handleSelectSearchNode}
                onCloseTimeMachine={() => {
                    setIsTimeMachineActive(false);
                    setIsTimeLapsePlaying(false);
                    setSelectedEraId(0);
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
            />
        </div>
    );
};

export default KnowledgeGraph;
