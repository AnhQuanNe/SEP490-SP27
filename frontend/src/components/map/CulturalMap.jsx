import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers, Compass, ShieldCheck, Flag, Landmark } from 'lucide-react';

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
    mapMode = 'places', // 'places' | 'ancient'
    ancientLandmarks = [],
    selectedAncientLandmark = null,
    onSelectAncientLandmark = () => {},
}) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const sovereigntyLayerRef = useRef(null);
    const ancientLayerRef = useRef(null);
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

        // Tạo layer group cho Địa danh Cổ & Cửa ải Lịch sử
        const ancientGroup = L.layerGroup().addTo(map);
        ancientLayerRef.current = ancientGroup;

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
                    <div style="margin-top: 4px; white-space: nowrap; background: rgba(15, 23, 42, 0.95); color: #fde047; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(245, 158, 11, 0.6); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); letter-spacing: 0.2px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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
                <div style="min-width: 250px; max-width: 300px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px 2px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-size: 20px;">🇻🇳</span>
                        <div>
                            <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #991b1b; text-transform: uppercase; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.2px;">
                                ${item.name}
                            </h4>
                            <span style="font-size: 10px; font-weight: 700; color: #b45309; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                ${item.administrativeUnit}
                            </span>
                        </div>
                    </div>
                    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; font-size: 10.5px; color: #991b1b; font-weight: 600; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.4;">
                        ✓ Khẳng định Chủ quyền toàn vẹn lãnh thổ bất khả xâm phạm của Nước CHXHCN Việt Nam.
                    </div>
                    <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; line-height: 1.45; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${item.culturalSignificance}
                    </p>
                    <div style="font-size: 10px; color: #64748b; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong>Căn cứ lịch sử:</strong> ${item.historicalProof}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { offset: [0, -10] });

            marker.on('click', () => {
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

    // =========================================================================
    // LAYER 1: RENDER CÁC ĐỊA PHƯƠNG VĂN HÓA THÔNG THƯỜNG (MAP MODE: 'places')
    // =========================================================================
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersGroup = markersLayerRef.current;
        if (!map || !markersGroup) return;

        if (mapMode !== 'places') {
            markersGroup.clearLayers();
            return;
        }

        markersGroup.clearLayers();

        locations.forEach((loc) => {
            if (!loc.coordinates || typeof loc.coordinates.lat !== 'number' || typeof loc.coordinates.lng !== 'number') {
                return;
            }

            const isSelected = selectedLocationId && (loc._id === selectedLocationId || loc.slug === selectedLocationId);
            const count = loc.totalWorks || loc.worksCount || 0;

            const iconHtml = `
                <div class="custom-marker-wrapper" style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
                    <div style="
                        width: ${isSelected ? '36px' : '28px'};
                        height: ${isSelected ? '36px' : '28px'};
                        border-radius: 9999px;
                        background: ${isSelected ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : '#0f172a'};
                        border: ${isSelected ? '3px solid #fef08a' : '2px solid #ffffff'};
                        box-shadow: ${isSelected ? '0 10px 15px -3px rgba(217, 119, 6, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #ffffff;
                        font-weight: 800;
                        font-size: ${isSelected ? '12px' : '10px'};
                        transition: all 0.2s ease;
                    ">
                        ${count > 0 ? count : '•'}
                    </div>
                    <div style="
                        margin-top: 2px;
                        white-space: nowrap;
                        background: ${isSelected ? '#92400e' : 'rgba(15, 23, 42, 0.9)'};
                        color: ${isSelected ? '#fef08a' : '#ffffff'};
                        font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 10px;
                        font-weight: 700;
                        padding: 1px 6px;
                        border-radius: 6px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                    ">
                        ${loc.name}
                    </div>
                </div>
            `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'cultural-pin-icon',
                iconSize: [60, 48],
                iconAnchor: [30, 20],
                popupAnchor: [0, -20],
            });

            const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon: customIcon });

            const popupContent = `
                <div style="min-width: 180px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <h4 style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 0 0 4px 0; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${loc.name}</h4>
                    <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.4; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${loc.description ? loc.description.substring(0, 75) + '...' : 'Địa danh văn hóa tiêu biểu.'}
                    </p>
                    <div style="font-size: 11px; font-weight: 600; color: #d97706; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${count} tác phẩm gắn liền
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent, { offset: [0, -10] });

            marker.on('click', () => {
                onSelectLocation(loc);
            });

            marker.addTo(markersGroup);
        });
    }, [locations, selectedLocationId, mapMode, onSelectLocation]);

    // =========================================================================
    // LAYER 2: RENDER ĐỊA DANH CỔ & CỬA ẢI LỊCH SỬ (MAP MODE: 'ancient')
    // =========================================================================
    useEffect(() => {
        const map = mapInstanceRef.current;
        const ancientGroup = ancientLayerRef.current;
        if (!map || !ancientGroup) return;

        if (mapMode !== 'ancient') {
            ancientGroup.clearLayers();
            return;
        }

        ancientGroup.clearLayers();

        ancientLandmarks.forEach((item) => {
            const { lat, lng } = item.coordinates || {};
            if (typeof lat !== 'number' || typeof lng !== 'number') return;

            const isSelected = selectedAncientLandmark && (selectedAncientLandmark.id === item.id || selectedAncientLandmark.slug === item.slug);
            const landmarkPhoto = item.imagery?.modern?.url || item.imagery?.ancient?.url;
            const shortName = item.ancientName?.split('(')[0]?.trim();

            // Icon Huy hiệu Ảnh thực cảnh Di tích / Cửa ải Lịch sử
            const iconHtml = `
                <div class="ancient-landmark-pin group" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; position: relative;">
                    <!-- Vòng sáng hào quang khi được chọn -->
                    ${isSelected ? '<span style="position: absolute; top: -4px; width: 52px; height: 52px; border-radius: 9999px; background-color: rgba(217, 119, 6, 0.45); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></span>' : ''}
                    
                    <!-- Khung ảnh thực tế di tích với viền hoàng gia -->
                    <div style="
                        position: relative;
                        width: ${isSelected ? '46px' : '38px'};
                        height: ${isSelected ? '46px' : '38px'};
                        border-radius: 9999px;
                        background: #78350f;
                        border: ${isSelected ? '3px solid #fbbf24' : '2.5px solid #fde68a'};
                        box-shadow: ${isSelected ? '0 0 16px rgba(245, 158, 11, 0.85), 0 8px 16px rgba(0,0,0,0.45)' : '0 4px 10px rgba(120, 53, 15, 0.35)'};
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: transform 0.2s ease;
                    ">
                        ${landmarkPhoto ? `
                            <img 
                                src="${landmarkPhoto}" 
                                alt="${item.ancientName}" 
                                referrerpolicy="no-referrer"
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            />
                            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: #78350f; color: #fde68a; font-size: ${isSelected ? '18px' : '15px'};">
                                🏯
                            </div>
                        ` : `
                            <span style="font-size: ${isSelected ? '18px' : '15px'}; color: #fef08a;">🏯</span>
                        `}
                    </div>

                    <!-- Mũi nhọn đính vị bên dưới avatar ảnh -->
                    <div style="
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 6px solid ${isSelected ? '#fbbf24' : '#fde68a'};
                        margin-top: -1px;
                        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
                    "></div>

                    <!-- Thẻ tên cổ danh / cửa ải -->
                    <div style="
                        margin-top: 3px;
                        white-space: nowrap;
                        max-width: 120px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        background: ${isSelected ? 'linear-gradient(135deg, #7c2d12 0%, #991b1b 100%)' : 'rgba(24, 24, 27, 0.94)'};
                        color: ${isSelected ? '#fef08a' : '#fef3c7'};
                        font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: ${isSelected ? '10px' : '9.5px'};
                        font-weight: 800;
                        padding: 1.5px 7px;
                        border-radius: 9999px;
                        border: 1px solid ${isSelected ? '#f59e0b' : 'rgba(217, 119, 6, 0.55)'};
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35);
                        letter-spacing: 0.2px;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    ">
                        ${shortName}
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                html: iconHtml,
                className: 'ancient-custom-icon',
                iconSize: [120, 68],
                iconAnchor: [60, isSelected ? 26 : 22],
                popupAnchor: [0, isSelected ? -28 : -24],
            });

            const marker = L.marker([lat, lng], { icon, zIndexOffset: isSelected ? 900 : 500 });

            const popupContent = `
                <div style="min-width: 240px; max-width: 280px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-radius: 10px; overflow: hidden;">
                    ${landmarkPhoto ? `
                        <div style="width: 100%; height: 110px; overflow: hidden; position: relative; margin-bottom: 8px; border-radius: 8px; background: #1c1917;">
                            <img 
                                src="${landmarkPhoto}" 
                                alt="${item.ancientName}" 
                                referrerpolicy="no-referrer"
                                style="width: 100%; height: 100%; object-fit: cover;" 
                            />
                            <span style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.75); color: #fde68a; font-size: 9px; font-weight: 700; padding: 1.5px 6px; border-radius: 4px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                ${item.imagery?.modern?.era || 'Di tích hôm nay'}
                            </span>
                        </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                        <span style="font-size: 15px;">🏛️</span>
                        <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #9a3412; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${item.ancientName}</h4>
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${item.dynasty}
                    </div>
                    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 3px 6px; font-size: 10.5px; color: #78350f; margin-bottom: 6px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong>📍 Hiện nay:</strong> ${item.modernLocation}
                    </div>
                    <p style="font-size: 10.5px; color: #334155; margin: 0 0 6px 0; line-height: 1.45; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${item.historicalEvent ? (item.historicalEvent.length > 100 ? item.historicalEvent.substring(0, 100) + '...' : item.historicalEvent) : ''}
                    </p>
                    <div style="font-size: 10px; color: #d97706; font-weight: 700; text-align: right; border-top: 1px solid #f1f5f9; padding-top: 4px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        Xem đối chiếu ảnh Xưa - Nay →
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { offset: [0, -10] });

            marker.on('click', () => {
                onSelectAncientLandmark(item);
            });

            marker.addTo(ancientGroup);
        });
    }, [ancientLandmarks, selectedAncientLandmark, mapMode, onSelectAncientLandmark]);

    // 3. Smooth flyTo khi chọn địa danh hoặc cổ danh
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Nếu ở Ancient mode và có selectedAncientLandmark
        if (mapMode === 'ancient' && selectedAncientLandmark?.coordinates) {
            const { lat, lng } = selectedAncientLandmark.coordinates;
            map.flyTo([lat, lng], 10, { duration: 0.9 });
            return;
        }

        // Nếu ở Places mode và có selectedLocation
        if (mapMode === 'places' && selectedLocation?.coordinates) {
            const locId = selectedLocation._id || selectedLocation.slug;
            if (locId === lastAnimatedIdRef.current) return;
            lastAnimatedIdRef.current = locId;

            const { lat, lng } = selectedLocation.coordinates;
            if (typeof lat === 'number' && typeof lng === 'number') {
                const isTruongSa = selectedLocation.slug === 'quan-dao-truong-sa';
                const targetZoom = isTruongSa ? 7.8 : Math.max(map.getZoom(), 8.5);
                map.flyTo([lat, lng], targetZoom, { duration: 0.7 });
            }
        }
    }, [selectedLocation, selectedAncientLandmark, mapMode]);

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
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 text-amber-300 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md text-[10px] sm:text-xs font-bold pointer-events-auto max-w-[calc(100%-120px)] sm:max-w-none">
                <span className="text-xs sm:text-sm flex-shrink-0">🇻🇳</span>
                <span className="font-heritage tracking-wide truncate">
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
            <div ref={mapContainerRef} className="w-full h-full min-h-[360px] sm:min-h-[500px] z-10" />

            {/* Cụm nút điều hướng & Phóng to / Bay tới Biển Đảo */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col gap-1.5 sm:gap-2">
                {/* Nút bay nhanh tới Hoàng Sa */}
                <button
                    type="button"
                    onClick={handleFlyToHoangSa}
                    className="h-9 px-2.5 rounded-xl bg-red-900/90 hover:bg-red-800 text-amber-200 shadow-md border border-amber-400/50 flex items-center gap-1.5 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                    title="Bay tới Quần đảo Hoàng Sa (TP. Đà Nẵng)"
                >
                    <span>🇻🇳</span>
                    <span>Hoàng Sa</span>
                </button>

                {/* Nút bay nhanh tới Trường Sa */}
                <button
                    type="button"
                    onClick={handleFlyToTruongSa}
                    className="h-9 px-2.5 rounded-xl bg-red-900/90 hover:bg-red-800 text-amber-200 shadow-md border border-amber-400/50 flex items-center gap-1.5 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                    title="Bay tới Quần đảo Trường Sa (Tỉnh Khánh Hòa)"
                >
                    <span>🇻🇳</span>
                    <span>Trường Sa</span>
                </button>

                <div className="w-full h-px bg-slate-300/60 my-0.5"></div>

                <button
                    type="button"
                    onClick={handleZoomIn}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Phóng to"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={handleZoomOut}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Thu nhỏ"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={handleResetView}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Về toàn cảnh Việt Nam & 2 Quần đảo"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={handleChangeBasemap}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title={`Đổi kiểu bản đồ (Hiện tại: ${currentPreset.name})`}
                >
                    <Layers className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-amber-700 shadow-md border border-slate-200/80 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Chú giải góc bản đồ (Map Legend) tùy theo Mode */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 text-[11px] font-medium text-slate-700 hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs">🇻🇳</span>
                    <span className="font-bold text-red-900">Hoàng Sa & Trường Sa</span>
                </div>
                {mapMode === 'places' && (
                    <>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-slate-900 border border-white shadow-xs"></span>
                            <span>Địa phương</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-amber-600 ring-2 ring-amber-300"></span>
                            <span>Đang chọn</span>
                        </div>
                    </>
                )}
                {mapMode === 'ancient' && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs">🏯</span>
                        <span className="font-bold text-amber-800">Cổ danh & Cửa ải Lịch sử</span>
                    </div>
                )}
                <div className="pl-2 border-l border-slate-300 text-slate-500 text-[10px]">
                    Nền: <strong className="text-amber-700">{currentPreset.name}</strong>
                </div>
            </div>
        </div>
    );
};

export default CulturalMap;
