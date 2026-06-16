import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  Settings,
  Flame,
  Binary,
  Info,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  BookOpen
} from 'lucide-react';
import { SubShape, CalculationResult, PresetType } from './types';
import { calculateSectionProperties, getPresets } from './utils/math';
import InteractiveCanvas from './components/InteractiveCanvas';

export default function App() {
  const presets = useMemo(() => getPresets(), []);
  
  // Configuration UI state
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [activePreset, setActivePreset] = useState<PresetType | 'custom'>('ibeam');
  const [shapes, setShapes] = useState<SubShape[]>(presets.ibeam.shapes);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'centroid' | 'ix' | 'iy' | 'gyration'>('centroid');
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [expandedShapeId, setExpandedShapeId] = useState<string | null>(null);

  // Math results
  const result: CalculationResult = useMemo(() => {
    return calculateSectionProperties(shapes);
  }, [shapes]);

  // Dimension Limits
  const DIM_LIMITS = {
    rectWidth: { min: 2, max: 200, step: 1 },
    rectHeight: { min: 2, max: 200, step: 1 },
    circleRadius: { min: 2, max: 100, step: 1 },
    fWidth: { min: 5, max: 200, step: 1 },
    fThickness: { min: 2, max: 50, step: 1 },
    wThickness: { min: 2, max: 50, step: 1 },
    thickness: { min: 1, max: 50, step: 1 },
    cx: { min: -150, max: 150, step: 1 },
    cy: { min: -150, max: 150, step: 1 }
  };

  // Preset activation
  const handleSelectPreset = (presetKey: PresetType) => {
    setActivePreset(presetKey);
    setShapes(JSON.parse(JSON.stringify(presets[presetKey].shapes)));
    setExpandedShapeId(null);
  };

  // Add rectangle
  const handleAddRectangle = () => {
    const newId = `rect_${Date.now()}`;
    const newShape: SubShape = {
      id: newId,
      name: `Rect ${shapes.length + 1} / 矩形元件 ${shapes.length + 1}`,
      type: 'rectangle',
      width: 40,
      height: 40,
      radius: 0,
      cx: 0,
      cy: 0,
      isHole: false
    };
    setShapes([...shapes, newShape]);
    setActivePreset('custom');
    setExpandedShapeId(newId);
  };

  // Add circle
  const handleAddCircle = () => {
    const newId = `circle_${Date.now()}`;
    const newShape: SubShape = {
      id: newId,
      name: `Circle ${shapes.length + 1} / 圓形元件 ${shapes.length + 1}`,
      type: 'circle',
      width: 0,
      height: 0,
      radius: 20,
      cx: 0,
      cy: 0,
      isHole: false
    };
    setShapes([...shapes, newShape]);
    setActivePreset('custom');
    setExpandedShapeId(newId);
  };

  // Add I-Beam
  const handleAddIBeam = () => {
    const newId = `ibeam_${Date.now()}`;
    const newShape: SubShape = {
      id: newId,
      name: `I-Beam ${shapes.length + 1} / 工字型鋼 ${shapes.length + 1}`,
      type: 'ibeam',
      width: 0,
      height: 80,
      radius: 0,
      fWidth: 60,
      fThickness: 12,
      wThickness: 10,
      cx: 0,
      cy: 0,
      isHole: false
    };
    setShapes([...shapes, newShape]);
    setActivePreset('custom');
    setExpandedShapeId(newId);
  };

  // Add T-Section
  const handleAddTSection = () => {
    const newId = `tsection_${Date.now()}`;
    const newShape: SubShape = {
      id: newId,
      name: `T-Section ${shapes.length + 1} / T型截面 ${shapes.length + 1}`,
      type: 'tsection',
      width: 0,
      height: 80,
      radius: 0,
      fWidth: 60,
      fThickness: 12,
      wThickness: 10,
      cx: 0,
      cy: 0,
      isHole: false
    };
    setShapes([...shapes, newShape]);
    setActivePreset('custom');
    setExpandedShapeId(newId);
  };

  // Add Hollow Rectangle (Box section)
  const handleAddHollowRect = () => {
    const newId = `hrect_${Date.now()}`;
    const newShape: SubShape = {
      id: newId,
      name: `Box Sec. ${shapes.length + 1} / 箱型截面 ${shapes.length + 1}`,
      type: 'hollowrect',
      width: 60,
      height: 60,
      radius: 0,
      thickness: 6,
      cx: 0,
      cy: 0,
      isHole: false
    };
    setShapes([...shapes, newShape]);
    setActivePreset('custom');
    setExpandedShapeId(newId);
  };

  // Add Hollow Circle (Pipe section)
  const handleAddHollowCircle = () => {
    const newId = `hcircle_${Date.now()}`;
    const newShape: SubShape = {
      id: newId,
      name: `Pipe Sec. ${shapes.length + 1} / 管型截面 ${shapes.length + 1}`,
      type: 'hollowcircle',
      width: 0,
      height: 0,
      radius: 30,
      thickness: 6,
      cx: 0,
      cy: 0,
      isHole: false
    };
    setShapes([...shapes, newShape]);
    setActivePreset('custom');
    setExpandedShapeId(newId);
  };

  // Update specific field
  const handleUpdateShape = (id: string, updates: Partial<SubShape>) => {
    setShapes(
      shapes.map((s) => {
        if (s.id === id) {
          return { ...s, ...updates };
        }
        return s;
      })
    );
    setActivePreset('custom');
  };

  // Delete shape
  const handleDeleteShape = (id: string) => {
    setShapes(shapes.filter((s) => s.id !== id));
    setActivePreset('custom');
    if (expandedShapeId === id) setExpandedShapeId(null);
  };

  // Reset current shapes
  const handleReset = () => {
    if (activePreset !== 'custom') {
      handleSelectPreset(activePreset as PresetType);
    } else {
      setShapes([]);
      setExpandedShapeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased bg-radial-[at_50%_0%] from-slate-900/60 via-slate-950 to-slate-950">
      {/* HEADER SECTION */}
      <header className="bg-slate-950/60 backdrop-blur-md border-b border-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 border border-sky-500/30 text-sky-400 p-2 rounded-xl shadow-sm flex items-center justify-center">
              <Layers className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight font-display leading-none">
                {lang === 'zh' ? '截面慣性矩 智慧教學輔助系統' : 'Section Moment of Inertia Educational Tool'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium font-sans">
                {lang === 'zh' 
                  ? '靜力學：工程組合形狀、平行軸定理、形心與回轉半徑一鍵算'
                  : 'Statics: Compound Shapes, Centroids, Parallel-Axis Theorem & Gyration Radii'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language option */}
            <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-800">
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'zh'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-lang-zh"
              >
                繁中
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-lang-en"
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showGuide 
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title={lang === 'zh' ? '教程說明' : 'Help / Guide'}
              id="btn-toggle-guide"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:py-6 flex flex-col gap-6">
        
        {/* EDUCATIONAL TOP BANNERS */}
        {showGuide && (
          <div className="bg-gradient-to-br from-slate-900/40 via-indigo-950/15 to-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
              <Layers className="w-32 h-32 text-sky-400" />
            </div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider font-display">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                {lang === 'zh' ? '靜力學核心學理指南' : 'Key Statics Concept Guide'}
              </h3>
              <button 
                onClick={() => setShowGuide(false)} 
                className="text-[10px] text-slate-400 hover:text-white font-bold border border-slate-800 rounded-lg px-2 py-0.5 bg-slate-950/60 hover:bg-slate-900 transition-all cursor-pointer"
                id="btn-close-guide"
              >
                {lang === 'zh' ? '隱藏指南' : 'Hide Guide'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] text-slate-450 leading-relaxed font-sans">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900/60 shadow-inner">
                <p className="font-bold text-slate-200 mb-1.5 font-display flex items-center gap-1">
                  <span className="text-sky-400 font-mono">1.</span> {lang === 'zh' ? '整體形心 (Centroid)' : 'Overall Centroid'}
                </p>
                <p className="text-slate-400">
                  {lang === 'zh' 
                    ? '截面面積的幾何中心。利用力矩原理計算：X̄ = ∑(A_i·x_i) / ∑A_i 與 Ȳ = ∑(A_i·y_i) / ∑A_i。中空或挖空截面的面積 A_i 與力矩項需取負值計算。'
                    : 'The geometric center of area. Calculated by weighting parts: X̄ = ∑(A_i·x_i) / ∑A_i and Ȳ = ∑(A_i·y_i) / ∑A_i. Subtracted holes represent negative areas.'}
                </p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900/60 shadow-inner">
                <p className="font-bold text-slate-200 mb-1.5 font-display flex items-center gap-1">
                  <span className="text-indigo-400 font-mono">2.</span> {lang === 'zh' ? '自身慣性矩 (Self Inertia)' : 'Self-Inertia'}
                </p>
                <p className="text-slate-400">
                  {lang === 'zh' 
                    ? '各子圖形對自身形心軸的慣性矩 I_x0、I_y0。例如矩形為 b·h³/12 (繞水平軸) 及 h·b³/12 (繞垂直軸)；圓形為 π·r⁴/4。'
                    : "Individual Moment of Inertia about its own centroidal axes. Rectangle: I_x0 = bh³/12 (horizontal) and hb³/12 (vertical). Circle: I_x0 = Iy0 = πr⁴/4."}
                </p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900/60 shadow-inner">
                <p className="font-bold text-slate-200 mb-1.5 font-display flex items-center gap-1">
                  <span className="text-emerald-400 font-mono">3.</span> {lang === 'zh' ? '平行軸定理 (Parallel-Axis)' : 'Parallel-Axis Theorem'}
                </p>
                <p className="text-slate-400">
                  {lang === 'zh' 
                    ? '重要關係式：I = I_0 + A·d²。將子圖形繞自身形心軸的慣性矩 I_0，轉換至整體形心軸。d 是兩平行軸之間的垂直距離 (dy 或 dx)。'
                    : 'Relates inertia relative to parallel axes: I = I_0 + Ad². It transfers self-inertia I_0 to the combined centroidal axis. d equals distance between axes.'}
                </p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900/60 shadow-inner">
                <p className="font-bold text-slate-200 mb-1.5 font-display flex items-center gap-1">
                  <span className="text-amber-400 font-mono">4.</span> {lang === 'zh' ? '轉動半徑 (Radius of Gyration)' : 'Radius of Gyration'}
                </p>
                <p className="text-slate-400">
                  {lang === 'zh' 
                    ? '定義為 r_x = √(I_x / A_total) 與 r_y = √(I_y / A_total)。代表若將截面面積集中在一條線上，此線距形心軸的等效距離。常用於柱挫屈分析。'
                    : 'The equivalent distance from the centroidal axis defined as r_x = √(I_x / A_total) and r_y = √(I_y / A_total). Crucial for structural buckling analyses.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE ROOT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: PRESET SELECTOR & SUB-SHAPE MANAGER (lg:col-span-12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Presets Card */}
            <div className="border border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/20">
              <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-3.5 uppercase tracking-wider font-display">
                <Layers className="w-4 h-4 text-sky-400" />
                {lang === 'zh' ? '工程常用截面範本' : 'Typical Engineering Sections'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-2 gap-2 mb-3">
                {Object.keys(presets).map((key) => {
                  const p = presets[key];
                  const isCur = activePreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key as PresetType)}
                      className={`text-xs text-left p-3 rounded-xl border transition-all flex flex-col justify-between h-[68px] cursor-pointer ${
                        isCur
                          ? 'bg-sky-500/10 border-sky-500/55 text-sky-450 font-bold shadow-md shadow-sky-500/5'
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-800'
                      }`}
                      id={`btn-preset-${key}`}
                    >
                      <span className="font-bold text-[11px] sm:text-[11.5px] font-display">
                        {lang === 'zh' ? p.nameZh : p.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5 line-clamp-1 w-full font-sans">
                        {lang === 'zh' ? p.descZh : p.descEn}
                      </span>
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setActivePreset('custom');
                    setShapes([]);
                    setExpandedShapeId(null);
                  }}
                  className={`text-xs text-left p-3 rounded-xl border transition-all flex flex-col justify-between h-[68px] cursor-pointer ${
                    activePreset === 'custom' && shapes.length === 0
                      ? 'bg-amber-500/10 border-amber-500/55 text-amber-450 font-bold shadow-md shadow-amber-500/5'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-800'
                  }`}
                  id="btn-preset-custom-empty"
                >
                  <span className="font-bold flex items-center gap-1 text-[11px] sm:text-[11.5px] text-slate-300 font-display">
                    ⭐ {lang === 'zh' ? '自訂空面板' : 'Custom Empty'}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5 font-sans">
                    {lang === 'zh' ? '從零開始自由排布' : 'Start building from scratch'}
                  </span>
                </button>
              </div>

              {/* Active description */}
              {activePreset !== 'custom' && (
                <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl text-[11px] leading-relaxed text-slate-400 flex items-start gap-1.5 font-sans mt-3">
                  <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">{lang === 'zh' ? '範本描述：' : 'Description: '}</strong>
                    {lang === 'zh' ? presets[activePreset as PresetType].descZh : presets[activePreset as PresetType].descEn}
                  </span>
                </div>
              )}
            </div>

            {/* Custom Sub-Shapes Builder */}
            <div className="border border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/20 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-950/40 -mx-5 -mt-5 px-5 py-4 border-b border-slate-800/80 rounded-t-2xl">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide font-display">
                    <Settings className="w-4 h-4 text-sky-400" />
                    {lang === 'zh' ? '組合截面元件管理器' : 'Interactive Shape Builder'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 font-sans">
                    {lang === 'zh' 
                      ? '自訂各單獨元件形狀、尺寸和相對於 (0,0) 的位置座標' 
                      : 'Customize dimensions & locations about local origin (0,0)'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleReset}
                    className="p-1 px-3 border border-slate-800 rounded-lg text-[10px] uppercase tracking-wider font-semibold font-mono bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title={lang === 'zh' ? '重置為當前範本' : 'Reset to current preset'}
                    id="btn-reset-shape"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {lang === 'zh' ? '重置' : 'Reset'}
                  </button>
                </div>
              </div>

              {/* Components List */}
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {shapes.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-850 rounded-xl text-slate-500 bg-slate-950/15">
                    <p className="text-xs font-semibold mb-1 text-slate-400">
                      {lang === 'zh' ? '沒有任何截面元件' : 'No sections defined'}
                    </p>
                    <p className="text-[10px] text-slate-550">
                      {lang === 'zh' ? '請點擊下方按鈕加入矩形或圓形，或選用預設範本' : 'Click buttons below to add Rectangles or Circles.'}
                    </p>
                  </div>
                ) : (
                  shapes.map((shape, idx) => {
                    const isExpanded = expandedShapeId === shape.id;
                    const indexLabel = idx + 1;
                    return (
                      <div
                        key={shape.id}
                        className={`border rounded-xl transition-all ${
                          hoveredShapeId === shape.id
                            ? 'border-sky-500 bg-slate-900/40 shadow-xs'
                            : isExpanded
                            ? 'border-slate-800 bg-slate-900/20'
                            : 'border-slate-900 bg-slate-950/30 hover:border-slate-800 hover:bg-slate-900/10'
                        }`}
                        onMouseEnter={() => setHoveredShapeId(shape.id)}
                        onMouseLeave={() => setHoveredShapeId(null)}
                        id={`item-shape-card-${shape.id}`}
                      >
                        {/* Summary Row */}
                        <div
                          onClick={() => setExpandedShapeId(isExpanded ? null : shape.id)}
                          className="flex items-center justify-between p-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5.5 h-5.5 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-400 font-mono">
                              {indexLabel}
                            </span>
                            <div className="text-xs">
                              <div className="font-bold text-slate-200 flex items-center gap-1.5 font-display">
                                <span>
                                  {shape.type === 'rectangle'
                                    ? (lang === 'zh' ? `矩形 (${shape.width} × ${shape.height})` : `Rect (${shape.width}×${shape.height})`)
                                    : (lang === 'zh' ? `圓形 (r = ${shape.radius})` : `Circle (r=${shape.radius})`)}
                                </span>
                                {shape.isHole && (
                                  <span className="bg-rose-500/10 border border-rose-505/30 text-rose-450 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                    {lang === 'zh' ? '中空 / 減' : 'Hole'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Position: ({shape.cx}, {shape.cy})
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                handleUpdateShape(shape.id, { isHole: !shape.isHole });
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                shape.isHole
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350'
                              }`}
                              title={lang === 'zh' ? '切換實心 / 中空' : 'Toggle Solid / Hole'}
                              id={`shape-toggle-hole-${shape.id}`}
                            >
                              <Binary className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteShape(shape.id)}
                              className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-550/40 hover:bg-rose-500/10 bg-slate-955 cursor-pointer transition-all"
                              title={lang === 'zh' ? '刪除元件' : 'Delete part'}
                              id={`shape-delete-${shape.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpandedShapeId(isExpanded ? null : shape.id)}
                              className="p-1 rounded text-slate-500 hover:text-slate-350 transition-all cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Editor Panel */}
                        {isExpanded && (
                          <div className="border-t border-slate-900/60 p-4 bg-slate-950/45 rounded-b-xl flex flex-col gap-3.5 text-xs text-slate-300">
                            {/* Shape Name Input */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-550 uppercase tracking-widest mb-1.5 font-mono">
                                {lang === 'zh' ? '元件自訂標籤 (英文/中文)' : 'Name Flag'}
                              </label>
                              <input
                                type="text"
                                className="w-full border border-slate-900 bg-slate-950 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500/60 font-semibold"
                                value={shape.name}
                                onChange={(e) => handleUpdateShape(shape.id, { name: e.target.value })}
                                id={`input-name-${shape.id}`}
                              />
                            </div>

                            {/* Shape Dimensions Sliders */}
                            {shape.type === 'rectangle' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '寬度 b (X向)' : 'Width b'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.width} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.rectWidth.min}
                                    max={DIM_LIMITS.rectWidth.max}
                                    step={DIM_LIMITS.rectWidth.step}
                                    value={shape.width}
                                    onChange={(e) => handleUpdateShape(shape.id, { width: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-width-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '高度 h (Y向)' : 'Height h'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.height} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.rectHeight.min}
                                    max={DIM_LIMITS.rectHeight.max}
                                    step={DIM_LIMITS.rectHeight.step}
                                    value={shape.height}
                                    onChange={(e) => handleUpdateShape(shape.id, { height: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-height-${shape.id}`}
                                  />
                                </div>
                              </div>
                            )}

                            {shape.type === 'circle' && (
                              <div>
                                <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                  <span className="font-bold text-slate-400">{lang === 'zh' ? '半徑 r' : 'Radius r'}</span>
                                  <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.radius} mm</span>
                                </div>
                                <input
                                  type="range"
                                  min={DIM_LIMITS.circleRadius.min}
                                  max={DIM_LIMITS.circleRadius.max}
                                  step={DIM_LIMITS.circleRadius.step}
                                  value={shape.radius}
                                  onChange={(e) => handleUpdateShape(shape.id, { radius: parseInt(e.target.value) })}
                                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                  id={`slider-radius-${shape.id}`}
                                />
                              </div>
                            )}

                            {shape.type === 'ibeam' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '總高度 h' : 'Total Height h'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.height} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.rectHeight.min}
                                    max={DIM_LIMITS.rectHeight.max}
                                    step={DIM_LIMITS.rectHeight.step}
                                    value={shape.height}
                                    onChange={(e) => handleUpdateShape(shape.id, { height: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-height-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '翼網寬 bf' : 'Flange Width bf'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.fWidth ?? 60} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.fWidth.min}
                                    max={DIM_LIMITS.fWidth.max}
                                    step={DIM_LIMITS.fWidth.step}
                                    value={shape.fWidth ?? 60}
                                    onChange={(e) => handleUpdateShape(shape.id, { fWidth: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-fwidth-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '翼網厚 tf' : 'Flange Thick tf'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.fThickness ?? 12} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.fThickness.min}
                                    max={DIM_LIMITS.fThickness.max}
                                    step={DIM_LIMITS.fThickness.step}
                                    value={shape.fThickness ?? 12}
                                    onChange={(e) => handleUpdateShape(shape.id, { fThickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-fthick-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '腹網厚 tw' : 'Web Thick tw'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.wThickness ?? 10} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.wThickness.min}
                                    max={DIM_LIMITS.wThickness.max}
                                    step={DIM_LIMITS.wThickness.step}
                                    value={shape.wThickness ?? 10}
                                    onChange={(e) => handleUpdateShape(shape.id, { wThickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-wthick-${shape.id}`}
                                  />
                                </div>
                              </div>
                            )}

                            {shape.type === 'tsection' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '總高度 H' : 'Total Height H'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.height} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.rectHeight.min}
                                    max={DIM_LIMITS.rectHeight.max}
                                    step={DIM_LIMITS.rectHeight.step}
                                    value={shape.height}
                                    onChange={(e) => handleUpdateShape(shape.id, { height: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-height-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '翼板寬 bf' : 'Flange Width bf'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.fWidth ?? 60} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.fWidth.min}
                                    max={DIM_LIMITS.fWidth.max}
                                    step={DIM_LIMITS.fWidth.step}
                                    value={shape.fWidth ?? 60}
                                    onChange={(e) => handleUpdateShape(shape.id, { fWidth: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-fwidth-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '翼板厚 tf' : 'Flange Thick tf'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.fThickness ?? 12} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.fThickness.min}
                                    max={DIM_LIMITS.fThickness.max}
                                    step={DIM_LIMITS.fThickness.step}
                                    value={shape.fThickness ?? 12}
                                    onChange={(e) => handleUpdateShape(shape.id, { fThickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-fthick-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '腹板厚 tw' : 'Web Thick tw'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.wThickness ?? 10} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.wThickness.min}
                                    max={DIM_LIMITS.wThickness.max}
                                    step={DIM_LIMITS.wThickness.step}
                                    value={shape.wThickness ?? 10}
                                    onChange={(e) => handleUpdateShape(shape.id, { wThickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-wthick-${shape.id}`}
                                  />
                                </div>
                              </div>
                            )}

                            {shape.type === 'hollowrect' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '外寬度 b' : 'Outer Width b'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.width} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.rectWidth.min}
                                    max={DIM_LIMITS.rectWidth.max}
                                    step={DIM_LIMITS.rectWidth.step}
                                    value={shape.width}
                                    onChange={(e) => handleUpdateShape(shape.id, { width: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-width-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '外高度 h' : 'Outer Height h'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.height} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.rectHeight.min}
                                    max={DIM_LIMITS.rectHeight.max}
                                    step={DIM_LIMITS.rectHeight.step}
                                    value={shape.height}
                                    onChange={(e) => handleUpdateShape(shape.id, { height: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-height-${shape.id}`}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '壁厚 t' : 'Wall Thick t'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.thickness ?? 6} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.thickness.min}
                                    max={DIM_LIMITS.thickness.max}
                                    step={DIM_LIMITS.thickness.step}
                                    value={shape.thickness ?? 6}
                                    onChange={(e) => handleUpdateShape(shape.id, { thickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-thick-${shape.id}`}
                                  />
                                </div>
                              </div>
                            )}

                            {shape.type === 'hollowcircle' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '外半徑 R' : 'Outer Rad R'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.radius} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.circleRadius.min}
                                    max={DIM_LIMITS.circleRadius.max}
                                    step={DIM_LIMITS.circleRadius.step}
                                    value={shape.radius}
                                    onChange={(e) => handleUpdateShape(shape.id, { radius: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-radius-${shape.id}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                    <span className="font-bold text-slate-400">{lang === 'zh' ? '壁厚 t' : 'Wall Thick t'}</span>
                                    <span className="font-mono text-sky-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.thickness ?? 6} mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={DIM_LIMITS.thickness.min}
                                    max={DIM_LIMITS.thickness.max}
                                    step={DIM_LIMITS.thickness.step}
                                    value={shape.thickness ?? 6}
                                    onChange={(e) => handleUpdateShape(shape.id, { thickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    id={`slider-thick-${shape.id}`}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Centroid Offsets Sliders */}
                            <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-slate-900/60">
                              <div>
                                <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                  <span className="font-bold text-slate-400">{lang === 'zh' ? '心座標 cx (x_i)' : 'Center cx'}</span>
                                  <span className="font-mono text-amber-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.cx > 0 ? `+${shape.cx}` : shape.cx} mm</span>
                                </div>
                                <input
                                  type="range"
                                  min={DIM_LIMITS.cx.min}
                                  max={DIM_LIMITS.cx.max}
                                  step={DIM_LIMITS.cx.step}
                                  value={shape.cx}
                                  onChange={(e) => handleUpdateShape(shape.id, { cx: parseInt(e.target.value) })}
                                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-450"
                                  id={`slider-cx-${shape.id}`}
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-[10.5px] mb-1 font-sans">
                                  <span className="font-bold text-slate-400">{lang === 'zh' ? '心座標 cy (y_i)' : 'Center cy'}</span>
                                  <span className="font-mono text-amber-400 font-bold bg-slate-950/80 border border-slate-900 px-1.5 py-0.2 rounded">{shape.cy > 0 ? `+${shape.cy}` : shape.cy} mm</span>
                                </div>
                                <input
                                  type="range"
                                  min={DIM_LIMITS.cy.min}
                                  max={DIM_LIMITS.cy.max}
                                  step={DIM_LIMITS.cy.step}
                                  value={shape.cy}
                                  onChange={(e) => handleUpdateShape(shape.id, { cy: parseInt(e.target.value) })}
                                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-450"
                                  id={`slider-cy-${shape.id}`}
                                />
                              </div>
                            </div>
                            
                            {/* Manual numerical input fields */}
                            <div className="grid grid-cols-4 gap-2 text-[10.5px] font-sans pt-1 border-t border-slate-900/40">
                              {shape.type === 'rectangle' && (
                                <>
                                  <div>
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">b (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.width} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { width: Math.max(1, Math.min(500, parseInt(e.target.value) || 1)) })}
                                      id={`num-b-${shape.id}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">h (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.height} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { height: Math.max(1, Math.min(500, parseInt(e.target.value) || 1)) })}
                                      id={`num-h-${shape.id}`}
                                    />
                                  </div>
                                </>
                              )}
                              {shape.type === 'circle' && (
                                <div className="col-span-2">
                                  <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">r (mm)</label>
                                  <input 
                                    type="number" 
                                    value={shape.radius} 
                                    className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                    onChange={(e) => handleUpdateShape(shape.id, { radius: Math.max(1, Math.min(250, parseInt(e.target.value) || 1)) })}
                                    id={`num-r-${shape.id}`}
                                  />
                                </div>
                              )}
                              {(shape.type === 'ibeam' || shape.type === 'tsection') && (
                                <>
                                  <div>
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">h (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.height} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { height: Math.max(1, Math.min(500, parseInt(e.target.value) || 1)) })}
                                      id={`num-h-${shape.id}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">bf (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.fWidth ?? 60} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { fWidth: Math.max(1, Math.min(500, parseInt(e.target.value) || 1)) })}
                                      id={`num-bf-${shape.id}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-0.5 font-mono text-[8px] uppercase font-bold tracking-wider">tf (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.fThickness ?? 12} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { fThickness: Math.max(1, Math.min(250, parseInt(e.target.value) || 1)) })}
                                      id={`num-tf-${shape.id}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-0.5 font-mono text-[8px] uppercase font-bold tracking-wider">tw (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.wThickness ?? 10} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { wThickness: Math.max(1, Math.min(250, parseInt(e.target.value) || 1)) })}
                                      id={`num-tw-${shape.id}`}
                                    />
                                  </div>
                                </>
                              )}
                              {shape.type === 'hollowrect' && (
                                <>
                                  <div>
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">b (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.width} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { width: Math.max(1, Math.min(500, parseInt(e.target.value) || 1)) })}
                                      id={`num-b-${shape.id}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">h (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.height} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { height: Math.max(1, Math.min(500, parseInt(e.target.value) || 1)) })}
                                      id={`num-h-${shape.id}`}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-slate-400 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">t (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.thickness ?? 6} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { thickness: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
                                      id={`num-t-${shape.id}`}
                                    />
                                  </div>
                                </>
                              )}
                              {shape.type === 'hollowcircle' && (
                                <>
                                  <div className="col-span-2">
                                    <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">R (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.radius} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { radius: Math.max(1, Math.min(250, parseInt(e.target.value) || 1)) })}
                                      id={`num-R-${shape.id}`}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-slate-400 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">t (mm)</label>
                                    <input 
                                      type="number" 
                                      value={shape.thickness ?? 6} 
                                      className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                      onChange={(e) => handleUpdateShape(shape.id, { thickness: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
                                      id={`num-t-${shape.id}`}
                                    />
                                  </div>
                                </>
                              )}
                              <div>
                                <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">X-offset</label>
                                <input 
                                  type="number" 
                                  value={shape.cx} 
                                  className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                  onChange={(e) => handleUpdateShape(shape.id, { cx: Math.max(-500, Math.min(500, parseInt(e.target.value) || 0)) })}
                                  id={`num-cx-${shape.id}`}
                                />
                              </div>
                              <div>
                                <label className="text-slate-500 block mb-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">Y-offset</label>
                                <input 
                                  type="number" 
                                  value={shape.cy} 
                                  className="w-full border border-slate-900 bg-slate-950 px-1 py-1 rounded text-center text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                                  onChange={(e) => handleUpdateShape(shape.id, { cy: Math.max(-500, Math.min(500, parseInt(e.target.value) || 0)) })}
                                  id={`num-cy-${shape.id}`}
                                />
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Elements Buttons Block */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-900">
                <button
                  onClick={handleAddRectangle}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/5 text-sky-400 font-bold hover:bg-sky-500/10 text-xs transition-colors cursor-pointer shadow-2xs"
                  id="btn-add-rect"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  {lang === 'zh' ? '加入矩形元件' : 'Add Rectangle'}
                </button>
                <button
                  onClick={handleAddCircle}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50/5 text-indigo-400 font-bold hover:bg-indigo-500/10 text-xs transition-colors cursor-pointer shadow-2xs"
                  id="btn-add-circle"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  {lang === 'zh' ? '加入圓形元件' : 'Add Circle'}
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT PANEL: VISUALIZATION CANVAS & INTEGRATED MECHANICAL OUTPUT (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Split viewport layout for canvas and fast dashboard parameters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Profile Canvas Drawing (col-span-12 md:col-span-7) */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <InteractiveCanvas
                  shapes={shapes}
                  centroid={result.centroid}
                  hoveredId={hoveredShapeId}
                  onHoverShape={setHoveredShapeId}
                  selectedId={expandedShapeId}
                  onSelectShape={setExpandedShapeId}
                  onUpdateShape={handleUpdateShape}
                  lang={lang}
                />
              </div>

              {/* Fast Output summary Dashboard card (col-span-12 md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col gap-4">
                
                <div className="border border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/20 flex-1 flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle technical background grid accent */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3">
                      <span className="text-[10px] font-bold text-slate-450 tracking-wider uppercase font-mono">
                        {lang === 'zh' ? '整體幾何特徵' : 'Global Section Properties'}
                      </span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>

                    {/* Area Summary */}
                    <div className="my-2.5 text-slate-300">
                      <span className="text-[11px] font-medium block text-slate-400 font-sans">
                        {lang === 'zh' ? '1. 總截面面積 (A_total)' : 'Total Cross Area Area (A)'}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold font-mono text-white tracking-tight">
                          {result.centroid.totalArea.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">mm²</span>
                      </div>
                    </div>

                    {/* Centroid coordinates dashboard */}
                    <div className="my-3.5 text-slate-300">
                      <span className="text-[11px] font-medium block text-slate-400 font-sans">
                        {lang === 'zh' ? '2. 整體形心位置 G (X̄, Ȳ)' : 'Overall Centroid G (X̄, Ȳ)'}
                      </span>
                      <div className="flex gap-4 mt-1.5 font-mono">
                        <div className="bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-900 flex-1">
                          <span className="text-[9px] text-slate-550 block uppercase font-bold tracking-wide">X̄ (Horizontal)</span>
                          <span className="text-base font-bold text-amber-455">
                            {result.centroid.x.toFixed(2)} <span className="text-[10px] text-slate-600 font-normal">mm</span>
                          </span>
                        </div>
                        <div className="bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-900 flex-1">
                          <span className="text-[9px] text-slate-550 block uppercase font-bold tracking-wide">Ȳ (Vertical)</span>
                          <span className="text-base font-bold text-amber-455">
                            {result.centroid.y.toFixed(2)} <span className="text-[10px] text-slate-600 font-normal">mm</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning on Negative Area */}
                  {result.centroid.totalArea <= 0 && shapes.length > 0 && (
                    <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl px-3 py-2 text-[10px] text-rose-300 relative z-10 leading-relaxed mb-3">
                       ❌ {lang === 'zh' ? '警告：組合面積小於或等於零，物理上不合理，請減少挖空 (Hole) 尺寸或增加主截面尺寸。' : 'Warning: Total area <= 0. Holes must be smaller than the main body.'}
                    </div>
                  )}

                  <div className="border-t border-slate-900 pt-3 relative z-10 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-455 tracking-wider uppercase font-mono">
                      {lang === 'zh' ? '形心慣性矩 I (平移後值)' : 'Moments of Inertia to Centroidal axes'}
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-slate-300 font-mono">
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-2.5 text-center">
                        <span className="text-[9px] text-slate-455 block uppercase font-bold tracking-wide">Ix (Horizontal)</span>
                        <span className="text-base font-bold text-sky-400">
                          {result.totalIx.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[9px] text-slate-505 block mt-0.5">mm⁴</span>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 text-center">
                        <span className="text-[9px] text-slate-455 block uppercase font-bold tracking-wide">Iy (Vertical)</span>
                        <span className="text-base font-bold text-indigo-400">
                          {result.totalIy.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[9px] text-slate-505 block mt-0.5">mm⁴</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radii of Gyration card */}
                <div className="border border-slate-800 bg-slate-900/20 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                  <span className="text-[10px] font-bold text-slate-455 block uppercase tracking-wider mb-2.5 font-mono">
                    {lang === 'zh' ? '回轉半徑 (Radius of Gyration)' : 'Radius of Gyration'}
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono">
                    <div className="bg-slate-950/50 border border-slate-900/60 p-3 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 block font-mono">rx = √(Ix / A)</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-md font-bold text-slate-200">
                          {result.rx.toFixed(3)}
                        </span>
                        <span className="text-[10px] text-slate-500">mm</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-900/60 p-3 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] text-slate-550 block font-mono">ry = √(Iy / A)</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-md font-bold text-slate-200">
                          {result.ry.toFixed(3)}
                        </span>
                        <span className="text-[10px] text-slate-550">mm</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: DETAILED STEP-BY-STEP CALCULATION DISSECTION & FORMULAS (FULL WIDTH) */}
        <div className="border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
          
          <div className="bg-slate-950/80 text-slate-100 p-5 border-b border-slate-900 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider font-sans text-sky-450">
                <Binary className="w-4 h-4 text-sky-400 shrink-0" />
                {lang === 'zh' ? '學生分步驗算與公式推導區' : 'Bilingual Interactive Step-by-Step Calculation Logger'}
              </h2>
              <p className="text-[11px] text-slate-450 mt-1 font-sans">
                {lang === 'zh' 
                  ? '本區完整揭露形心和平行軸定理的每一步代入，供您人工算對照、核對學期作業或考題。' 
                  : 'Full transparency of algebraic plugging-in for easy verification, homework comparisons, and exam studies.'}
              </p>
            </div>
            
            {/* Step Selection Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80 max-w-full overflow-x-auto">
              {(['centroid', 'ix', 'iy', 'gyration'] as const).map((tab) => {
                const labelsZh = { centroid: '1. 形心座標', ix: '2. 繞X迴轉 Ix', iy: '3. 繞Y迴轉 Iy', gyration: '4. 迴轉半徑' };
                const labelsEn = { centroid: '1. Centroid', ix: '2. Moment Ix', iy: '3. Moment Iy', gyration: '4. Radius r' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                    id={`btn-tab-${tab}`}
                  >
                    {lang === 'zh' ? labelsZh[tab] : labelsEn[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5">
            {/* TAB 1: CENTROID STEP-BY-STEP CALCULATION */}
            {activeTab === 'centroid' && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 text-xs leading-relaxed text-slate-300">
                  <h4 className="font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-sky-400" />
                    {lang === 'zh' ? '幾何形心計算公式說理' : 'Centroid Algebraic Method'}
                  </h4>
                  <p className="mb-2 text-slate-400">
                    {lang === 'zh' 
                      ? '要計算整體複合圖形的重心(形心)，我們將其拆為多個簡單子元件 A_i。利用斷面一次矩(First Moment of Area)平衡原理：' 
                      : 'To calculate the centroid (geometric center) of a composite section, split it into basic parts. Balancing moments of area:'}
                  </p>
                  
                  {/* Styled elegant Fractions for Centroid */}
                  <div className="flex flex-col sm:flex-row gap-6 my-4 items-center justify-center bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner max-w-sm sm:max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-sky-400">X̄ = </span>
                      <span className="inline-flex flex-col items-center justify-center text-center">
                        <span className="border-b border-slate-700 px-3 pb-0.5 font-bold text-slate-200">∑(A_i · x_i)</span>
                        <span className="pt-0.5 font-bold text-slate-200">∑A_i</span>
                      </span>
                    </div>
                    <div className="hidden sm:block border-l border-slate-805 h-8"></div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-sky-400">Ȳ = </span>
                      <span className="inline-flex flex-col items-center justify-center text-center">
                        <span className="border-b border-slate-700 px-3 pb-0.5 font-bold text-slate-200">∑(A_i · y_i)</span>
                        <span className="pt-0.5 font-bold text-slate-250">∑A_i</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400">
                    {lang === 'zh'
                      ? '注意：對於挖空或中空元件（Hole），其面積 A_i 的數值為「負值」，對對應的一般力矩也是扣減關係。'
                      : 'Note: Areas of hollow cutouts and holes are negative, meaning they correctly subtract from the overall area and moment sums.'}
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-900 font-mono text-[10px] uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">{lang === 'zh' ? '元件名稱' : 'Component Name'}</th>
                        <th className="p-3">{lang === 'zh' ? '類型' : 'Shape'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '面積 A_i (mm²)' : 'Area A_i (mm²)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? 'x_i (mm)' : 'Centroid x_i (mm)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? 'y_i (mm)' : 'Centroid y_i (mm)'}</th>
                        <th className="p-3 text-right text-sky-400 bg-sky-950/10">{lang === 'zh' ? 'A_i · x_i (mm³)' : 'Moment A_i·x_i (mm³)'}</th>
                        <th className="p-3 text-right text-indigo-400 bg-indigo-950/10">{lang === 'zh' ? 'A_i · y_i (mm³)' : 'Moment A_i·y_i (mm³)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`border-b border-slate-900/60 hover:bg-slate-900/40 transition-colors ${
                            hoveredShapeId === row.id ? 'bg-sky-500/5' : ''
                          }`}
                          onMouseEnter={() => setHoveredShapeId(row.id)}
                          onMouseLeave={() => setHoveredShapeId(null)}
                        >
                          <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-200">{row.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-950 font-mono ${
                              row.isHole ? 'bg-rose-500/80' : row.type === 'rectangle' ? 'bg-sky-400' : 'bg-indigo-400'
                            }`}>
                              {row.isHole ? 'hole/挖空' : row.type}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-450 font-semibold' : 'text-slate-300'}`}>
                            {row.isHole ? '-' : ''}{Math.abs(row.area).toFixed(1)}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">{row.cx}</td>
                          <td className="p-3 text-right font-mono text-slate-400">{row.cy}</td>
                          <td className="p-3 text-right font-mono bg-sky-500/5 text-sky-400">
                            {(row.area * row.cx).toFixed(1)}
                          </td>
                          <td className="p-3 text-right font-mono bg-indigo-500/5 text-indigo-405">
                            {(row.area * row.cy).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                      {/* Sums Row */}
                      <tr className="bg-slate-950 text-white font-bold font-mono">
                        <td colSpan={3} className="p-3 text-right">
                          {lang === 'zh' ? '總和 (∑)：' : 'Sum Total (∑):'}
                        </td>
                        <td className="p-3 text-right text-emerald-400">
                          {result.centroid.totalArea.toFixed(1)}
                        </td>
                        <td colSpan={2} className="p-3"></td>
                        <td className="p-3 text-right text-sky-400 bg-sky-950/20">
                          {result.rows.reduce((acc, r) => acc + (r.area * r.cx), 0).toFixed(1)}
                        </td>
                        <td className="p-3 text-right text-indigo-405 bg-indigo-950/20">
                          {result.rows.reduce((acc, r) => acc + (r.area * r.cy), 0).toFixed(1)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Combined Equations step */}
                <div className="bg-slate-950/50 rounded-xl p-4 font-mono text-xs border border-slate-900 mt-2 flex flex-col gap-3 text-slate-300">
                  <div className="font-bold text-slate-400 border-b border-slate-900 pb-1.5 flex items-center justify-between">
                    <span>💡 {lang === 'zh' ? '代入數值推導步驟' : 'Calculations Step-by-Step:'}</span>
                    <span className="text-[10px] text-slate-600 font-sans">Values in standard units</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="text-sky-400 font-bold">1. {lang === 'zh' ? '計算總面積 Sum of Area' : 'Total Area sum'}:</span>
                      <p className="mt-1 font-sans text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                        A_total = {result.centroid.steps.totalAreaFormula} = <strong className="text-white">{result.centroid.totalArea.toFixed(2)}</strong> mm²
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-emerald-400 font-bold">2. {lang === 'zh' ? '水平形心座標 X̄ (對 Y 軸之矩)' : 'Horizontal Centroid X̄ (relative to origin):'}</span>
                        <p className="mt-1 font-sans text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 leading-loose">
                          X̄ = ∑(A_i·x_i) / ∑A_i <br />
                          X̄ = {result.centroid.steps.xBarFormula} <br />
                          X̄ = <strong className="text-amber-400 text-sm font-mono">{result.centroid.x.toFixed(4)} mm</strong>
                        </p>
                      </div>
                      <div>
                        <span className="text-indigo-455 font-bold">3. {lang === 'zh' ? '垂直形心座標 Ȳ (對 X 軸之矩)' : 'Vertical Centroid Ȳ (relative to origin):'}</span>
                        <p className="mt-1 font-sans text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 leading-loose">
                          Ȳ = ∑(A_i·y_i) / ∑A_i <br />
                          Ȳ = {result.centroid.steps.yBarFormula} <br />
                          Ȳ = <strong className="text-amber-400 text-sm font-mono">{result.centroid.y.toFixed(4)} mm</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MOMENT ix VIA PARALLEL-AXIS THEOREM */}
            {activeTab === 'ix' && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 text-xs leading-relaxed text-slate-350">
                  <h4 className="font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-sky-400" />
                    {lang === 'zh' ? '水平慣性矩 Ix 的平行軸定理' : 'Parallel Axis Theorem for Ix'}
                  </h4>
                  <p className="mb-2 text-slate-400">
                    {lang === 'zh'
                      ? '繞水平形心軸的慣性矩 Ix 代表「抵抗繞 X 方向彎曲（垂直位移）」的能力。對於每一個組合元件 i，利用平行軸定理轉換：'
                      : 'The moment of inertia around the horizontal axis (Ix) measures the resistance against horizontal axis bending. Using Parallel Axis Theorem:'}
                  </p>
                  
                  {/* Styled Math Fractions for Ix Parallel Axis Theorem */}
                  <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner max-w-sm mx-auto my-3 text-xs leading-relaxed">
                    <div className="font-semibold font-mono text-center text-slate-200">
                      Ix = ∑( I_x0,i + A_i · dy,i² )
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 font-medium text-center">
                      {lang === 'zh' 
                        ? 'dy,i = (y_i - Ȳ) 是元件形心至整體形心的垂直距離 (mm)' 
                        : 'dy,i = (y_i - Ȳ) is the vertical distance from sub-centroid to global Y-centroid.'}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-900 font-mono text-[10px] uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">{lang === 'zh' ? '元件名稱' : 'Component Name'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '自身慣性矩 I_x0 (mm⁴)' : 'Self-Inertia I_x0 (mm⁴)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '面積 A_i (mm²)' : 'Area A_i (mm²)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '垂直距離 dy (mm)' : 'Vertical d_y (mm)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '平移項 A · dy² (mm⁴)' : 'Ad_y² Term (mm⁴)'}</th>
                        <th className="p-3 text-right text-sky-400 bg-sky-950/10">{lang === 'zh' ? '總合 I_x,i (mm⁴)' : 'Total I_x,i (mm⁴)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`border-b border-slate-900/60 hover:bg-slate-900/40 transition-colors ${
                            hoveredShapeId === row.id ? 'bg-sky-500/5' : ''
                          }`}
                          onMouseEnter={() => setHoveredShapeId(row.id)}
                          onMouseLeave={() => setHoveredShapeId(null)}
                        >
                          <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-200">{row.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">{row.ix0Formula}</div>
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-400' : 'text-slate-355'}`}>
                            {row.ix0.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-400' : 'text-slate-355'}`}>
                            {row.area.toFixed(1)}
                          </td>
                          {/* dy = cy - Ȳ */}
                          <td className="p-3 text-right font-mono text-slate-400">
                            {row.dx.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-450' : 'text-slate-400'}`}>
                            {row.adx2.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                          </td>
                          <td className="p-3 text-right font-mono bg-sky-500/5 font-bold text-sky-400">
                            {row.ixTotal.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                      ))}
                      {/* Overall Integration sum */}
                      <tr className="bg-slate-950 text-white font-bold font-mono">
                        <td colSpan={2} className="p-3 text-right">
                          {lang === 'zh' ? '整體慣性矩 Ix = ∑(I_x0 + A_i·dy²) ：' : 'Total Moment of Inertia Ix = ∑(I_x0 + A·dy²):'}
                        </td>
                        <td className="p-3 text-right text-slate-500">
                          {result.rows.reduce((acc, r) => acc + r.ix0, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-right text-slate-500">
                          {result.centroid.totalArea.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right text-slate-500">
                          {result.rows.reduce((acc, r) => acc + r.adx2, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-right text-sky-400 bg-sky-950/20 font-bold">
                          {result.totalIx.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 font-mono text-xs border border-slate-900 mt-2">
                  <span className="font-bold text-slate-400 block mb-2">📝 {lang === 'zh' ? '每元件代入細化算式 (數學驗證)' : 'Algebraic Breakdown of Each Part for Ix:'}</span>
                  <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900 font-sans text-slate-400 leading-relaxed text-xs">
                    {result.rows.map((row, idx) => (
                      <div key={row.id} className="border-b border-dashed border-slate-900 pb-2 last:border-0 last:pb-0">
                        <strong className="text-slate-200">元件 {idx + 1} ({row.name})：</strong> <br />
                        <span className="font-mono text-slate-500 pl-4 inline-block mt-1">
                          I_x{idx + 1} = I_x0 + A·d² <br />
                          I_x{idx + 1} = ({row.ix0.toFixed(1)}) + ({row.area.toFixed(1)}) · ({row.dx.toFixed(2)})² <br />
                          I_x{idx + 1} = {row.ix0.toFixed(1)} + {row.adx2.toFixed(1)} = <strong className="text-amber-400">{row.ixTotal.toFixed(1)} mm⁴</strong>
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-slate-900 pt-2 font-bold text-slate-350 flex justify-between mt-1 font-mono">
                      <span>{lang === 'zh' ? '∑ Ix 累計加總 =' : 'Combined Sum Ix ='}</span>
                      <span className="text-sky-450 text-sm">
                        {result.rows.map((r, i) => `${r.ixTotal >= 0 && i !== 0 ? '+' : ''}${r.ixTotal.toFixed(0)}`).join(' ')} = 
                        <strong className="ml-1 text-base underline text-sky-400">{result.totalIx.toLocaleString('en-US', { maximumFractionDigits: 1 })} mm⁴</strong>
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: MOMENT iy VIA PARALLEL-AXIS THEOREM */}
            {activeTab === 'iy' && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 text-xs leading-relaxed text-slate-350">
                  <h4 className="font-bold text-slate-100 mb-1.5 flex items-center gap-1.5 font-sans">
                    <CheckCircle className="w-4 h-4 text-sky-400" />
                    {lang === 'zh' ? '垂直慣性矩 Iy 的平行軸定理' : 'Parallel Axis Theorem for Iy'}
                  </h4>
                  <p className="mb-2 text-slate-400">
                    {lang === 'zh'
                      ? '繞垂直形心軸的慣性矩 Iy 代表「抵抗繞 Y 方向彎曲（水平位移）」的能力。利用平行軸定理將子慣性矩轉化：'
                      : 'The moment of inertia around the vertical axis (Iy) measures the resistance against horizontal bending. Using parallel axis transfer:'}
                  </p>

                  <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner max-w-sm mx-auto my-3 text-xs leading-relaxed">
                    <div className="font-semibold font-mono text-center text-slate-200">
                      Iy = ∑( I_y0,i + A_i · dx,i² )
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 font-medium text-center">
                      {lang === 'zh' 
                        ? 'dx,i = (x_i - X̄) 是元件形心至整體形心的水平距離 (mm)' 
                        : 'dx,i = (x_i - X̄) is the horizontal distance from sub-centroid to global X-centroid.'}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-900 font-mono text-[10px] uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">{lang === 'zh' ? '元件名稱' : 'Component Name'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '自身慣性矩 I_y0 (mm⁴)' : 'Self-Inertia I_y0 (mm⁴)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '面積 A_i (mm²)' : 'Area A_i (mm²)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '水平距離 dx (mm)' : 'Horizontal d_x (mm)'}</th>
                        <th className="p-3 text-right">{lang === 'zh' ? '平移項 A · dx² (mm⁴)' : 'Ad_x² Term (mm⁴)'}</th>
                        <th className="p-3 text-right text-indigo-400 bg-indigo-950/10">{lang === 'zh' ? '總合 I_y,i (mm⁴)' : 'Total I_y,i (mm⁴)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`border-b border-slate-900/60 hover:bg-slate-900/40 transition-colors ${
                            hoveredShapeId === row.id ? 'bg-sky-500/5' : ''
                          }`}
                          onMouseEnter={() => setHoveredShapeId(row.id)}
                          onMouseLeave={() => setHoveredShapeId(null)}
                        >
                          <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-200">{row.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">{row.iy0Formula}</div>
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-400' : 'text-slate-355'}`}>
                            {row.iy0.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-400' : 'text-slate-355'}`}>
                            {row.area.toFixed(1)}
                          </td>
                          {/* dx = cx - X̄ */}
                          <td className="p-3 text-right font-mono text-slate-400">
                            {row.dy.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right font-mono ${row.isHole ? 'text-rose-450' : 'text-slate-400'}`}>
                            {row.ady2.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                          </td>
                          <td className="p-3 text-right font-mono bg-indigo-500/5 font-bold text-indigo-400">
                            {row.iyTotal.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                      ))}
                      {/* Sum row */}
                      <tr className="bg-slate-950 text-white font-bold font-mono">
                        <td colSpan={2} className="p-3 text-right">
                          {lang === 'zh' ? '整體慣性矩 Iy = ∑(I_y0 + A_i·dx²) ：' : 'Total Moment of Inertia Iy = ∑(I_y0 + A·dx²):'}
                        </td>
                        <td className="p-3 text-right text-slate-500">
                          {result.rows.reduce((acc, r) => acc + r.iy0, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-right text-slate-500">
                          {result.centroid.totalArea.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right text-slate-500">
                          {result.rows.reduce((acc, r) => acc + r.ady2, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-right text-indigo-400 bg-indigo-950/20 font-bold">
                          {result.totalIy.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 font-mono text-xs border border-slate-900 mt-2">
                  <span className="font-bold text-slate-400 block mb-2">📝 {lang === 'zh' ? '每元件代入細化算式 (數學驗證)' : 'Algebraic Breakdown of Each Part for Iy:'}</span>
                  <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900 font-sans text-slate-400 leading-relaxed text-xs">
                    {result.rows.map((row, idx) => (
                      <div key={row.id} className="border-b border-dashed border-slate-900 pb-2 last:border-0 last:pb-0">
                        <strong className="text-slate-200">元件 {idx + 1} ({row.name})：</strong> <br />
                        <span className="font-mono text-slate-500 pl-4 inline-block mt-1">
                          I_y{idx + 1} = I_y0 + A·d² <br />
                          I_y{idx + 1} = ({row.iy0.toFixed(1)}) + ({row.area.toFixed(1)}) · ({row.dy.toFixed(2)})² <br />
                          I_y{idx + 1} = {row.iy0.toFixed(1)} + {row.ady2.toFixed(1)} = <strong className="text-indigo-400">{row.iyTotal.toFixed(1)} mm⁴</strong>
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-slate-900 pt-2 font-bold text-slate-355 flex justify-between mt-1 font-mono">
                      <span>{lang === 'zh' ? '∑ Iy 累計加總 =' : 'Combined Sum Iy ='}</span>
                      <span className="text-indigo-400 text-sm">
                        {result.rows.map((r, i) => `${r.iyTotal >= 0 && i !== 0 ? '+' : ''}${r.iyTotal.toFixed(0)}`).join(' ')} = 
                        <strong className="ml-1 text-base underline text-indigo-400">{result.totalIy.toLocaleString('en-US', { maximumFractionDigits: 1 })} mm⁴</strong>
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: RADII OF GYRATION CALCULATIONS */}
            {activeTab === 'gyration' && (
              <div className="flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 font-sans text-slate-700">
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-blue-600 font-bold" />
                    {lang === 'zh' ? '迴轉半徑 (轉動半徑) 數值代入算式' : 'Radius of Gyration Formula Proof'}
                  </h4>
                  <p className="mb-3">
                    {lang === 'zh'
                      ? '迴轉半徑（Radius of Gyration，用 r 或 k 表示）描述了面積分布對其形心軸之分散程度。常用於結構挫屈（Buckling）計算，迴轉半徑越小，說明在此方向越容易發生壓曲失穩。'
                      : 'The radius of gyration characterizes the distribution of an area about its centroidal axis. If an entire area could be concentrated at a discrete distance r, it would yield the same inertia.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner flex flex-col items-center">
                      <span className="font-bold text-sky-400 mb-2 font-mono text-[10px] uppercase tracking-wider">rx = √(Ix / A)</span>
                      <div className="font-mono text-center flex flex-col gap-1 text-slate-400">
                        <div>rx = √({result.totalIx.toLocaleString('en-US', { maximumFractionDigits: 1 })} / {result.centroid.totalArea.toLocaleString('en-US', { maximumFractionDigits: 1 })})</div>
                        <div>rx = √({(result.totalIx / (result.centroid.totalArea || 1)).toFixed(3)})</div>
                        <div className="text-amber-400 font-bold text-sm mt-1">rx = {result.rx.toFixed(4)} mm</div>
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner flex flex-col items-center">
                      <span className="font-bold text-sky-400 mb-2 font-mono text-[10px] uppercase tracking-wider">ry = √(Iy / A)</span>
                      <div className="font-mono text-center flex flex-col gap-1 text-slate-400">
                        <div>ry = √({result.totalIy.toLocaleString('en-US', { maximumFractionDigits: 1 })} / {result.centroid.totalArea.toLocaleString('en-US', { maximumFractionDigits: 1 })})</div>
                        <div>ry = √({(result.totalIy / (result.centroid.totalArea || 1)).toFixed(3)})</div>
                        <div className="text-amber-400 font-bold text-sm mt-1">ry = {result.ry.toFixed(4)} mm</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900 leading-normal text-slate-350">
                    <h5 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5 font-sans tracking-wide">
                      💡 {lang === 'zh' ? '工程學啟示與分析' : 'Engineering Insights:'}
                    </h5>
                    {result.rx > result.ry ? (
                      <p>
                        {lang === 'zh' 
                          ? `此截面的 rx (${result.rx.toFixed(2)} mm) 大於 ry (${result.ry.toFixed(2)} mm)。這代表在受壓荷載作用下，該結構梁/柱在繞 Y 軸（水平位移、平面內左-右彎曲）的方向更為脆弱，發生挫屈時將優先向弱軸（即迴轉半徑較小的 Y 軸）發生彎曲。`
                          : `The radius of gyration rx (${result.rx.toFixed(2)} mm) is strictly larger than ry (${result.ry.toFixed(2)} mm). Under vertical axial compression, column buckling will occur preferentially about the weak axis: the Y axis (minor axis with the smallest gyration radius).`}
                      </p>
                    ) : result.ry > result.rx ? (
                      <p>
                        {lang === 'zh' 
                          ? `此截面的 ry (${result.ry.toFixed(2)} mm) 大於 rx (${result.rx.toFixed(2)} mm)。這代表在受壓荷載作用下，該結構在繞 X 軸（垂直位移、平面內上-下彎曲）的方向更為脆弱，壓彎挫屈時將優先發生弱軸方向（即 X 軸）失穩。`
                          : `The radius of gyration ry (${result.ry.toFixed(2)} mm) is strictly larger than rx (${result.rx.toFixed(2)} mm). Under axial load, buckling will preferentially occur about the weak axis: the X axis (minor axis with the smallest gyration radius).`}
                      </p>
                    ) : (
                      <p>
                        {lang === 'zh'
                          ? '此截面的 rx 與 ry 完全相等！說明它具有軸向對稱剛度分佈。在任意方向受壓時，發生挫屈的機率均等。圓形、正方形、同心圆中空管通常具備此良好特性。'
                          : 'The radii of gyration are exactly identical in both axes! This column/beam offers equal structural stability against buckling in all lateral directions (e.g. perfect symmetric circles/squares).'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>

        {/* COMPREHENSIVE TEXTBOOK HELP FAQ BANNER */}
        <div className="border border-slate-800 bg-slate-900/20 backdrop-blur-md rounded-2xl p-6 text-xs text-slate-400">
          <h3 className="font-bold text-slate-200 mb-4 uppercase tracking-wider flex items-center gap-1.5 font-mono text-[11px] text-sky-400">
            <HelpCircle className="w-4 h-4 text-sky-450" />
            {lang === 'zh' ? '靜力學截面特性常見問與答 (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60">
              <p className="font-bold text-slate-200 mb-2 text-[13px] text-sky-400">
                Q1: {lang === 'zh' ? '如果我在大圓內心挖一個等圓，慣性矩會是零嗎？' : 'What happens if a hole is placed exactly at the center with equal size?'}
              </p>
              <p className="text-slate-400">
                {lang === 'zh'
                  ? '是的。本系統支持負面積（挖空元件）。如果內孔半徑與外圓形相同（等心且尺寸重合），其總面積、總慣性矩將被扣減至 0。'
                  : 'Yes. Since holes use negative algebra, putting a hole overlapping the main body with equal sizes yields exactly 0 net area and 0 inertia.'}
              </p>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60">
              <p className="font-bold text-slate-200 mb-2 text-[13px] text-sky-400">
                Q2: {lang === 'zh' ? '什麼是慣性半徑/轉動半徑，為什麼用它而不光看慣性矩？' : 'Why use Radius of Gyration instead of just Moment of Inertia?'}
              </p>
              <p className="text-slate-400">
                {lang === 'zh'
                  ? '慣性矩為長度的四次方(mm⁴)，不便於直接與截面尺寸對比。轉動半徑為長度單位(mm)，直觀表徵了面積對抗彎曲的「等效半徑」，可用於歐拉公式確定長柱的細長比。'
                  : "Moment of Inertia has units of L⁴ (mm⁴), which is complex for cross-section dimension ratios. Radius of gyration is in mm, allowing simple slenderness ratio verification for columns."}
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950/40 border-t border-slate-900 mt-auto py-5 text-center text-xs text-slate-500 font-mono">
        <div>
          Section Moment of Inertia Calculator &copy; 2026. Made with React & Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
