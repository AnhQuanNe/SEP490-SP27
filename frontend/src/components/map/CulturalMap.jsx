import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers } from 'lucide-react';

// Tọa độ trung tâm và giới hạn địa lý của Việt Nam
const VIETNAM_CENTER = [16.2, 107.5];
const DEFAULT_ZOOM = 6;

// Danh sách các nhà cung cấp bản đồ nền miễn phí, chất lượng cao, không yêu cầu API key
const BASEMAP_PRESETS = [
    {
        id: 'esri-street',
        name: 'Đường phố & Văn hóa',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri, DeLorme, NAVTEQ',
        maxZoom: 18,
    },
    {
        id: 'esri-topo',
        name: 'Địa hình Non sông',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri, DeLorme, NAVTEQ, TomTom',
        maxZoom: 18,
    },
    {
        id: 'google-roadmap',
        name: 'Bản đồ chi tiết',
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        attribution: '&copy; Google Maps',
        maxZoom: 19,
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
    const tileLayerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentBasemapIndex, setCurrentBasemapIndex] = useState(0);

    // 1. Khởi tạo bản đồ Leaflet một lần duy nhất
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: VIETNAM_CENTER,
            zoom: DEFAULT_ZOOM,
            minZoom: 5,
            maxZoom: 18,
            zoomControl: false,
            attributionControl: true,
        });

        // Thiết lập tile bản đồ khởi tạo
        const initialPreset = BASEMAP_PRESETS[0];
        const tileLayer = L.tileLayer(initialPreset.url, {
            attribution: initialPreset.attribution,
            maxZoom: initialPreset.maxZoom,
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        // Tạo layer group cho markers
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Invalidate size sau khi render để tránh lỗi xé hình
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

            const isSelected = selectedLocationId && (selectedLocationId === loc._id || selectedLocationId === loc.slug);
            const count = loc.totalWorks || loc.worksCount || 0;

            // Tạo custom marker icon bằng HTML & CSS
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

            // Popup xem nhanh
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
        });
    }, [locations, selectedLocationId, onSelectLocation]);

    // 3. Zoom tới địa phương được chọn một cách mượt mà và không trùng lặp
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !selectedLocation?.coordinates) return;

        const locId = selectedLocation._id || selectedLocation.slug;
        if (locId === lastAnimatedIdRef.current) return;
        lastAnimatedIdRef.current = locId;

        const { lat, lng } = selectedLocation.coordinates;
        if (typeof lat === 'number' && typeof lng === 'number') {
            map.flyTo([lat, lng], Math.max(map.getZoom(), 8.5), {
                duration: 0.6,
            });
        }
    }, [selectedLocation]);

    // Điều khiển bản đồ tùy biến
    const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
    const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
    const handleResetView = () => {
        lastAnimatedIdRef.current = null;
        mapInstanceRef.current?.flyTo(VIETNAM_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
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
            {/* Loading Indicator tinh tế, không che khuất màn hình */}
            {isLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/90 flex items-center gap-2.5 text-xs font-bold text-slate-800 animate-in fade-in duration-150">
                    <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang cập nhật địa danh...</span>
                </div>
            )}

            {/* Container bản đồ thực tế */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10" />

            {/* Nút điều hướng & Tiện ích trên bản đồ */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
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
                    title="Về toàn cảnh Việt Nam"
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
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-white shadow-xs"></span>
                    <span>Địa phương văn hóa</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-600 ring-2 ring-amber-300"></span>
                    <span>Đang chọn</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                        N
                    </span>
                    <span>Số tác phẩm</span>
                </div>
                <div className="pl-2 border-l border-slate-300 text-slate-500 text-[10px]">
                    Kiểu nền: <strong className="text-amber-700">{currentPreset.name}</strong>
                </div>
            </div>
        </div>
    );
};

export default CulturalMap;
