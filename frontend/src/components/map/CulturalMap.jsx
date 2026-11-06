import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers, Compass, ShieldCheck } from 'lucide-react';

// Tọa độ trung tâm và giới hạn hiển thị bao quát toàn bộ lãnh thổ Việt Nam (gồm đất liền và 2 quần đảo Hoàng Sa, Trường Sa)
const VIETNAM_CENTER = [15.8, 109.0];
const DEFAULT_ZOOM = 5.8;

// Danh sách các nhà cung cấp bản đồ nền chất lượng cao, ưu tiên bản đồ chuẩn hiển thị đầy đủ Hoàng Sa & Trường Sa
const BASEMAP_PRESETS = [
    {
        id: 'google-vietnam',
        name: 'Bản đồ Việt Nam (Chuẩn Chủ Quyền)',
        url: 'https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}',
        attribution: '&copy; Google Maps • Lãnh thổ & Biển đảo Việt Nam',
        maxZoom: 19,
    },
    {
        id: 'google-hybrid',
        name: 'Vệ tinh & Non sông Biển đảo',
        url: 'https://mt1.google.com/vt/lyrs=y&hl=vi&gl=VN&x={x}&y={y}&z={z}',
        attribution: '&copy; Google Maps Imagery • Biển Đông Việt Nam',
        maxZoom: 19,
    },
    {
        id: 'carto-voyager',
        name: 'Bản đồ Di sản (Nhã nhặn)',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
    },
    {
        id: 'osm-standard',
        name: 'Bản đồ Mở Quốc tế (OSM)',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
        maxZoom: 19,
    },
];

// Dữ liệu chủ quyền thiêng liêng hai quần đảo Hoàng Sa và Trường Sa
export const SOVEREIGNTY_LANDMARKS = [
    {
        id: 'quan-dao-hoang-sa',
        slug: 'quan-dao-hoang-sa',
        name: 'Quần đảo Hoàng Sa',
        administrativeUnit: 'Thành phố Đà Nẵng, Việt Nam',
        coordinates: { lat: 16.5375, lng: 112.0100 },
        radius: 85000,
        zoomLevel: 8.5,
        historicalProof: 'Chúa Nguyễn thành lập Hải đội Hoàng Sa từ thế kỷ XVII; Phủ Biên Tạp Lục (Lê Quý Đôn - 1776), Châu bản Triều Nguyễn, Đại Nam Thực Lục.',
        culturalSignificance: 'Gắn liền với Lễ Khao lề thế lính Hoàng Sa (Di sản văn hóa phi vật thể Quốc gia) và kho tàng ca dao vượt biển kiên cường của cha ông.',
        poem: 'Hoàng Sa trời nước mênh mông\nNgười đi thì có mà không thấy về\nNông nả chiếu gon vuông tròn\nBó thân thi thể dập dồn sóng xô...',
    },
    {
        id: 'quan-dao-truong-sa',
        slug: 'quan-dao-truong-sa',
        name: 'Quần đảo Trường Sa',
        administrativeUnit: 'Tỉnh Khánh Hòa, Việt Nam',
        coordinates: { lat: 10.2500, lng: 114.2000 },
        radius: 160000,
        zoomLevel: 7.8,
        historicalProof: 'Đại Nam Nhất Thống Chí; hệ thống đo đạc hải trình và các cứ liệu lịch sử - pháp lý thực thi chủ quyền liên tục qua các thời kỳ.',
        culturalSignificance: 'Phên dậu tiền tiêu thiêng liêng bảo vệ Tổ quốc, biểu tượng bất khuất cho ý chí kiên cường bám biển gìn giữ chủ quyền của toàn dân tộc.',
        poem: 'Nước non một dải vẹn toàn\nHoàng Sa, Trường Sa mãi là máu thịt thiêng liêng của Tổ quốc Việt Nam!',
    },
];

const CulturalMap = ({
    locations = [],
    selectedLocation = null,
    onSelectLocation = () => {},
    isLoading = false,
}) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const sovereigntyLayerRef = useRef(null);
    const tileLayerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentBasemapIndex, setCurrentBasemapIndex] = useState(0);

    // 1. Khởi tạo bản đồ Leaflet một lần duy nhất với góc nhìn bao quát Việt Nam và 2 quần đảo
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: VIETNAM_CENTER,
            zoom: DEFAULT_ZOOM,
            minZoom: 5,
            maxZoom: 19,
            zoomControl: false,
            attributionControl: true,
        });

        // Thiết lập tile bản đồ khởi tạo (Google Maps chuẩn tiếng Việt có Hoàng Sa & Trường Sa)
        const initialPreset = BASEMAP_PRESETS[0];
        const tileLayer = L.tileLayer(initialPreset.url, {
            attribution: initialPreset.attribution,
            maxZoom: initialPreset.maxZoom,
            subdomains: initialPreset.subdomains || 'abc',
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        // Tạo layer group cho các địa danh văn hóa
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        // Tạo layer group vĩnh cửu cho Chủ quyền Biển đảo Hoàng Sa - Trường Sa
        const sovereigntyGroup = L.layerGroup().addTo(map);
        sovereigntyLayerRef.current = sovereigntyGroup;

        mapInstanceRef.current = map;

        // Render các cột mốc chủ quyền thiêng liêng
        renderSovereigntyMarkers(map, sovereigntyGroup);

        // Invalidate size sau khi mount để tránh lỗi xé hình
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Hàm render Cột mốc Chủ quyền Quốc gia trên Hoàng Sa & Trường Sa
    const renderSovereigntyMarkers = (map, group) => {
        if (!group) return;
        group.clearLayers();

        SOVEREIGNTY_LANDMARKS.forEach((item) => {
            const { lat, lng } = item.coordinates;

            // Vòng tròn khoanh vùng lãnh hải chủ quyền mềm mại
            L.circle([lat, lng], {
                radius: item.radius || 85000,
                color: '#f59e0b',
                dashArray: '5, 6',
                weight: 1.5,
                fillColor: '#ef4444',
                fillOpacity: 0.08,
            }).addTo(group);

            // Icon Cờ đỏ sao vàng & Biểu tượng Cột mốc Chủ quyền
            const markerHtml = `
                <div class="sovereignty-pin-container" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                        <span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                        <div style="width: 38px; height: 38px; border-radius: 9999px; background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4); border: 2.5px solid #fef08a;">
                            <span style="font-size: 18px; line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">🇻🇳</span>
                        </div>
                    </div>
                    <div style="margin-top: 4px; white-space: nowrap; background: rgba(15, 23, 42, 0.95); color: #fde047; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(245, 158, 11, 0.6); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); letter-spacing: 0.2px; font-family: inherit;">
                        ${item.name}
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                html: markerHtml,
                className: 'sovereignty-custom-icon',
                iconSize: [120, 60],
                iconAnchor: [60, 24],
                popupAnchor: [0, -25],
            });

            const marker = L.marker([lat, lng], { icon, zIndexOffset: 1000 });

            // Popup trang trọng khẳng định chủ quyền
            const popupContent = `
                <div style="min-width: 250px; max-width: 300px; font-family: inherit; padding: 4px 2px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-size: 20px;">🇻🇳</span>
                        <div>
                            <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #991b1b; text-transform: uppercase;">
                                ${item.name}
                            </h4>
                            <span style="font-size: 10px; font-weight: 700; color: #b45309;">
                                ${item.administrativeUnit}
                            </span>
                        </div>
                    </div>
                    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; font-size: 10.5px; color: #991b1b; font-weight: 600;">
                        ✓ Khẳng định Chủ quyền toàn vẹn lãnh thổ bất khả xâm phạm của Nước CHXHCN Việt Nam.
                    </div>
                    <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; line-height: 1.45;">
                        ${item.culturalSignificance}
                    </p>
                    <div style="font-size: 10px; color: #64748b; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
                        <strong>Căn cứ lịch sử:</strong> ${item.historicalProof}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { offset: [0, -10] });

            marker.on('click', () => {
                // Nếu danh sách locations từ database có địa phương này, kích hoạt chọn luôn
                const matched = locations.find(
                    (l) => l.slug === item.slug || l.name?.toLowerCase().includes(item.id.replace('quan-dao-', ''))
                );
                if (matched) {
                    onSelectLocation(matched);
                }
            });

            marker.addTo(group);
        });
    };

    // Đổi kiểu hiển thị bản đồ nền khi người dùng bấm nút Layers
    const handleChangeBasemap = () => {
        const nextIndex = (currentBasemapIndex + 1) % BASEMAP_PRESETS.length;
        setCurrentBasemapIndex(nextIndex);

        const map = mapInstanceRef.current;
        if (!map) return;

        const preset = BASEMAP_PRESETS[nextIndex];
        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        const newTileLayer = L.tileLayer(preset.url, {
            attribution: preset.attribution,
            maxZoom: preset.maxZoom,
            subdomains: preset.subdomains || 'abc',
        }).addTo(map);

        tileLayerRef.current = newTileLayer;
    };

    const selectedLocationId = selectedLocation?._id || selectedLocation?.slug || null;
    const lastAnimatedIdRef = useRef(null);

    // 2. Cập nhật markers khi danh sách locations hoặc selectedLocation thay đổi
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersGroup = markersLayerRef.current;
        if (!map || !markersGroup) return;

        markersGroup.clearLayers();

        locations.forEach((loc) => {
            if (!loc.coordinates || typeof loc.coordinates.lat !== 'number' || typeof loc.coordinates.lng !== 'number') {
                return;
            }

            // Nếu là Hoàng Sa hoặc Trường Sa đã được render ở sovereigntyLayer, vẫn hiển thị badge số tác phẩm nếu có
            const isHoangSaOrTruongSa = loc.slug === 'quan-dao-hoang-sa' || loc.slug === 'quan-dao-truong-sa';
            const isSelected = selectedLocationId && (selectedLocationId === loc._id || selectedLocationId === loc.slug);
            const count = loc.totalWorks || loc.worksCount || 0;

            // Nếu không phải Hoàng Sa/Trường Sa thì render marker địa phương thông thường
            if (!isHoangSaOrTruongSa) {
                const markerHtml = `
                    <div class="cultural-map-marker ${isSelected ? 'marker-selected' : ''}" style="position: relative;">
                        <div class="marker-pin ${isSelected ? 'bg-amber-600 scale-125 ring-4 ring-amber-300 ring-offset-2' : 'bg-slate-900 hover:bg-amber-700 hover:scale-110'} 
                            transition-all duration-200 w-9 h-9 rounded-full shadow-xl flex items-center justify-center text-white border-2 border-white cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${
                                count > 0
                                    ? `<span class="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                                        ${count > 99 ? '99+' : count}
                                       </span>`
                                    : ''
                            }
                        </div>
                        ${
                            isSelected
                                ? `<span class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md pointer-events-none">
                                    ${loc.name}
                                   </span>`
                                : ''
                        }
                    </div>
                `;

                const customIcon = L.divIcon({
                    html: markerHtml,
                    className: 'custom-div-icon',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                    popupAnchor: [0, -20],
                });

                const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon: customIcon });

                const popupContent = `
                    <div style="min-width: 180px; font-family: inherit;">
                        <h4 style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 0 0 4px 0;">${loc.name}</h4>
                        <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;">
                            ${loc.description ? loc.description.substring(0, 75) + '...' : 'Địa danh văn hóa tiêu biểu.'}
                        </p>
                        <div style="font-size: 11px; font-weight: 600; color: #d97706;">
                            ${count} tác phẩm gắn liền
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent, { offset: [0, -10] });

                marker.on('click', () => {
                    onSelectLocation(loc);
                });

                marker.addTo(markersGroup);
            }
        });
    }, [locations, selectedLocationId, onSelectLocation]);

    // 3. Zoom tới địa phương được chọn một cách mượt mà
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !selectedLocation?.coordinates) return;

        const locId = selectedLocation._id || selectedLocation.slug;
        if (locId === lastAnimatedIdRef.current) return;
        lastAnimatedIdRef.current = locId;

        const { lat, lng } = selectedLocation.coordinates;
        if (typeof lat === 'number' && typeof lng === 'number') {
            const isTruongSa = selectedLocation.slug === 'quan-dao-truong-sa';
            const targetZoom = isTruongSa ? 7.8 : Math.max(map.getZoom(), 8.5);
            map.flyTo([lat, lng], targetZoom, {
                duration: 0.7,
            });
        }
    }, [selectedLocation]);

    // Điều khiển bản đồ tùy biến
    const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
    const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

    // Về toàn cảnh Việt Nam bao quát 2 quần đảo
    const handleResetView = () => {
        lastAnimatedIdRef.current = null;
        mapInstanceRef.current?.flyTo(VIETNAM_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    };

    // Bay nhanh tới Hoàng Sa
    const handleFlyToHoangSa = () => {
        const hs = SOVEREIGNTY_LANDMARKS[0];
        mapInstanceRef.current?.flyTo([hs.coordinates.lat, hs.coordinates.lng], hs.zoomLevel, { duration: 0.8 });
        const matched = locations.find((l) => l.slug === hs.slug);
        if (matched) onSelectLocation(matched);
    };

    // Bay nhanh tới Trường Sa
    const handleFlyToTruongSa = () => {
        const ts = SOVEREIGNTY_LANDMARKS[1];
        mapInstanceRef.current?.flyTo([ts.coordinates.lat, ts.coordinates.lng], ts.zoomLevel, { duration: 0.8 });
        const matched = locations.find((l) => l.slug === ts.slug);
        if (matched) onSelectLocation(matched);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
        }, 150);
    };

    const currentPreset = BASEMAP_PRESETS[currentBasemapIndex];

    return (
        <div
            className={`relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100 transition-all duration-300 ${
                isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'w-full h-full min-h-[500px]'
            }`}
        >
            {/* Dải băng Khẳng định Chủ quyền Biển đảo Việt Nam trên bản đồ */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md text-xs font-bold pointer-events-auto">
                <span className="text-sm">🇻🇳</span>
                <span className="font-heritage tracking-wide">
                    Hoàng Sa & Trường Sa là của Việt Nam
                </span>
            </div>

            {/* Loading Indicator tinh tế */}
            {isLoading && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/90 flex items-center gap-2.5 text-xs font-bold text-slate-800 animate-in fade-in duration-150">
                    <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang cập nhật địa danh...</span>
                </div>
            )}

            {/* Container bản đồ Leaflet */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10" />

            {/* Cụm nút điều hướng & Phóng to / Bay tới Biển Đảo */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                {/* Nút bay nhanh tới Hoàng Sa */}
                <button
                    type="button"
                    onClick={handleFlyToHoangSa}
                    className="h-9 px-2.5 rounded-xl bg-red-900/90 hover:bg-red-800 text-amber-200 shadow-md border border-amber-400/50 flex items-center gap-1.5 text-[11px] font-bold transition active:scale-95"
                    title="Bay tới Quần đảo Hoàng Sa (TP. Đà Nẵng)"
                >
                    <span>🇻🇳</span>
                    <span>Hoàng Sa</span>
                </button>

                {/* Nút bay nhanh tới Trường Sa */}
                <button
                    type="button"
                    onClick={handleFlyToTruongSa}
                    className="h-9 px-2.5 rounded-xl bg-red-900/90 hover:bg-red-800 text-amber-200 shadow-md border border-amber-400/50 flex items-center gap-1.5 text-[11px] font-bold transition active:scale-95"
                    title="Bay tới Quần đảo Trường Sa (Tỉnh Khánh Hòa)"
                >
                    <span>🇻🇳</span>
                    <span>Trường Sa</span>
                </button>

                <div className="w-full h-px bg-slate-300/60 my-0.5"></div>

                <button
                    type="button"
                    onClick={handleZoomIn}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95"
                    title="Phóng to"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={handleZoomOut}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95"
                    title="Thu nhỏ"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={handleResetView}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95"
                    title="Về toàn cảnh Việt Nam & 2 Quần đảo"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={handleChangeBasemap}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95 group relative"
                    title={`Đổi kiểu bản đồ (Hiện tại: ${currentPreset.name})`}
                >
                    <Layers className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95"
                    title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Chú giải góc bản đồ (Map Legend) */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 text-[11px] font-medium text-slate-700 hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs">🇻🇳</span>
                    <span className="font-bold text-red-900">Hoàng Sa & Trường Sa</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-white shadow-xs"></span>
                    <span>Địa phương văn hóa</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-600 ring-2 ring-amber-300"></span>
                    <span>Đang chọn</span>
                </div>
                <div className="pl-2 border-l border-slate-300 text-slate-500 text-[10px]">
                    Kiểu nền: <strong className="text-amber-700">{currentPreset.name}</strong>
                </div>
            </div>
        </div>
    );
};

export default CulturalMap;
