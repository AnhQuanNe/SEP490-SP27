import { BookOpen, Award, Headphones } from 'lucide-react';

/**
 * ExhibitionArtifactSelector - Thanh chọn bảo vật di sản ở đáy trang
 * Thiết kế phong cách thẻ bảo tàng hoàng gia, hiển thị số góc chụp và nhãn Audio Guide.
 */
const ExhibitionArtifactSelector = ({
    artifacts,
    selectedArtifact,
    onSelectArtifact
}) => {
    if (!artifacts || artifacts.length === 0) return null;

    return (
        <div className="bg-gradient-to-b from-[#16100a]/95 to-[#0e0905]/95 p-4 sm:p-5 rounded-3xl border border-amber-600/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold px-1">
                <span className="uppercase tracking-wider flex items-center gap-2 text-amber-200">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Chọn hiện vật di sản cần khảo cứu:</span>
                </span>
                <span className="text-stone-400 font-normal text-[11px] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{artifacts.length} bảo vật tiêu biểu</span>
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {artifacts.map((artifact) => {
                    const currentId = selectedArtifact?.slug || selectedArtifact?.id || selectedArtifact?._id;
                    const targetId = artifact.slug || artifact.id || artifact._id;
                    const isSelected = currentId === targetId;
                    const thumbImage = artifact.gallery?.[0]?.image || artifact.mainImage || artifact.angles?.[1]?.image || artifact.angles?.[0]?.image;

                    return (
                        <button
                            key={targetId}
                            type="button"
                            onClick={() => onSelectArtifact(artifact)}
                            className={`flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                                isSelected
                                    ? 'bg-gradient-to-r from-amber-950/70 via-[#26190e]/90 to-amber-950/70 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]'
                                    : 'bg-[#140e09]/80 border-amber-900/30 hover:border-amber-500/50 hover:bg-[#1f150e]/90'
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={thumbImage} 
                                    alt={artifact.name}
                                    className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shadow-md group-hover:scale-105 transition-transform" 
                                />
                                {isSelected && (
                                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 text-[10px] font-black flex items-center justify-center border border-white shadow-xs">
                                        ✓
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                                    {artifact.name}
                                </p>
                                <p className="text-[11px] text-amber-300/80 truncate mt-0.5 font-serif">
                                    {artifact.era}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#20150d] text-amber-200/90 border border-amber-900/40 font-medium">
                                        🔍 {artifact.gallery?.length || 1} góc chụp
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 text-red-200 border border-red-500/30 font-semibold flex items-center gap-1">
                                        <Headphones className="w-2.5 h-2.5 text-red-400" />
                                        Audio Guide
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ExhibitionArtifactSelector;
