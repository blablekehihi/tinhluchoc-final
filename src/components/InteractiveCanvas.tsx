import React, { useMemo, useState, useEffect } from 'react';
import { SubShape } from '../types';

interface InteractiveCanvasProps {
  shapes: SubShape[];
  centroid: { x: number; y: number };
  hoveredId: string | null;
  onHoverShape: (id: string | null) => void;
  selectedId: string | null;
  onSelectShape: (id: string | null) => void;
  onUpdateShape: (id: string, updates: Partial<SubShape>) => void;
  lang: 'zh' | 'en';
}

export default function InteractiveCanvas({
  shapes,
  centroid,
  hoveredId,
  onHoverShape,
  selectedId,
  onSelectShape,
  onUpdateShape,
  lang,
}: InteractiveCanvasProps) {
  const canvasWidth = 400;
  const canvasHeight = 400;
  const padding = 40;

  // Dragging state for moving shapes
  const [dragState, setDragState] = useState<{
    shapeId: string;
    startX: number;
    startY: number;
    initCx: number;
    initCy: number;
  } | null>(null);

  // Dragging state for resizing shapes
  const [resizeDragState, setResizeDragState] = useState<{
    shapeId: string;
    handleType: 'width' | 'height' | 'radius' | 'fWidth';
    startX: number;
    startY: number;
    initVal: number;
  } | null>(null);

  // Calculate scaling factor safely
  const bounds = useMemo(() => {
    if (shapes.length === 0) {
      return { minX: -50, maxX: 50, minY: -50, maxY: 50 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    shapes.forEach((shape) => {
      if (shape.type === 'rectangle' || shape.type === 'hollowrect') {
        const halfW = shape.width / 2;
        const halfH = shape.height / 2;
        minX = Math.min(minX, shape.cx - halfW);
        maxX = Math.max(maxX, shape.cx + halfW);
        minY = Math.min(minY, shape.cy - halfH);
        maxY = Math.max(maxY, shape.cy + halfH);
      } else if (shape.type === 'circle' || shape.type === 'hollowcircle') {
        minX = Math.min(minX, shape.cx - shape.radius);
        maxX = Math.max(maxX, shape.cx + shape.radius);
        minY = Math.min(minY, shape.cy - shape.radius);
        maxY = Math.max(maxY, shape.cy + shape.radius);
      } else if (shape.type === 'ibeam' || shape.type === 'tsection') {
        const halfW = (shape.fWidth ?? 80) / 2;
        const halfH = (shape.height ?? 100) / 2;
        minX = Math.min(minX, shape.cx - halfW);
        maxX = Math.max(maxX, shape.cx + halfW);
        minY = Math.min(minY, shape.cy - halfH);
        maxY = Math.max(maxY, shape.cy + halfH);
      }
    });

    // Also include global centroid of compound shape
    minX = Math.min(minX, centroid.x);
    maxX = Math.max(maxX, centroid.x);
    minY = Math.min(minY, centroid.y);
    maxY = Math.max(maxY, centroid.y);

    // If limits are flat
    if (minX === maxX) { minX -= 10; maxX += 10; }
    if (minY === maxY) { minY -= 10; maxY += 10; }

    // Add extra padding to physical boundaries
    const dx = maxX - minX;
    const dy = maxY - minY;
    minX -= dx * 0.15;
    maxX += dx * 0.15;
    minY -= dy * 0.15;
    maxY += dy * 0.15;

    return { minX, maxX, minY, maxY };
  }, [shapes, centroid]);

  // Uniform Scale Factor & Mapping function
  const scaleInfo = useMemo(() => {
    const physW = bounds.maxX - bounds.minX;
    const physH = bounds.maxY - bounds.minY;

    const scaleX = (canvasWidth - padding * 2) / physW;
    const scaleY = (canvasHeight - padding * 2) / physH;
    const scale = Math.min(scaleX, scaleY);

    const physCx = (bounds.minX + bounds.maxX) / 2;
    const physCy = (bounds.minY + bounds.maxY) / 2;

    const svgCx = canvasWidth / 2;
    const svgCy = canvasHeight / 2;

    const toSvgX = (x: number) => svgCx + (x - physCx) * scale;
    const toSvgY = (y: number) => svgCy - (y - physCy) * scale; // Invert Y axis for screen space
    const toSvgDist = (d: number) => d * scale;

    return { toSvgX, toSvgY, toSvgDist, scale, physW, physH };
  }, [bounds, canvasWidth, canvasHeight]);

  const { toSvgX, toSvgY, toSvgDist, scale } = scaleInfo;

  // Track dragging changes for center coordinates (cx, cy)
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      const physDeltaX = deltaX / scale;
      const physDeltaY = -deltaY / scale;

      const rawCx = dragState.initCx + physDeltaX;
      const rawCy = dragState.initCy + physDeltaY;
      
      onUpdateShape(dragState.shapeId, {
        cx: Math.max(-150, Math.min(150, Math.round(rawCx))),
        cy: Math.max(-150, Math.min(150, Math.round(rawCy))),
      });
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, scale, onUpdateShape]);

  // Track dragging changes for shape resizing (width, height, etc)
  useEffect(() => {
    if (!resizeDragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeDragState.startX;
      const deltaY = e.clientY - resizeDragState.startY;

      const physDeltaX = deltaX / scale;
      const physDeltaY = -deltaY / scale;

      const shape = shapes.find((s) => s.id === resizeDragState.shapeId);
      if (!shape) return;

      if (resizeDragState.handleType === 'width') {
        const newVal = Math.round(resizeDragState.initVal + physDeltaX * 2);
        onUpdateShape(resizeDragState.shapeId, {
          width: Math.max(5, Math.min(205, newVal)),
        });
      } else if (resizeDragState.handleType === 'height') {
        const newVal = Math.round(resizeDragState.initVal + physDeltaY * 2);
        onUpdateShape(resizeDragState.shapeId, {
          height: Math.max(5, Math.min(205, newVal)),
        });
      } else if (resizeDragState.handleType === 'radius') {
        const newVal = Math.round(resizeDragState.initVal + physDeltaX);
        onUpdateShape(resizeDragState.shapeId, {
          radius: Math.max(5, Math.min(105, newVal)),
        });
      } else if (resizeDragState.handleType === 'fWidth') {
        const newVal = Math.round(resizeDragState.initVal + physDeltaX * 2);
        onUpdateShape(resizeDragState.shapeId, {
          fWidth: Math.max(5, Math.min(205, newVal)),
        });
      }
    };

    const handleMouseUp = () => {
      setResizeDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeDragState, scale, shapes, onUpdateShape]);

  // 3. Grid markings
  const gridLines = useMemo(() => {
    const rangeX = bounds.maxX - bounds.minX;
    // determine suitable step size (e.g. 5, 10, 20, 50, 100)
    let step = 10;
    if (rangeX > 500) step = 100;
    else if (rangeX > 250) step = 50;
    else if (rangeX > 100) step = 20;
    else if (rangeX > 40) step = 10;
    else if (rangeX > 15) step = 5;
    else step = 2;

    const xStart = Math.floor(bounds.minX / step) * step;
    const xEnd = Math.ceil(bounds.maxX / step) * step;
    const yStart = Math.floor(bounds.minY / step) * step;
    const yEnd = Math.ceil(bounds.maxY / step) * step;

    const vLines: number[] = [];
    for (let x = xStart; x <= xEnd; x += step) {
      vLines.push(x);
    }

    const hLines: number[] = [];
    for (let y = yStart; y <= yEnd; y += step) {
      hLines.push(y);
    }

    return { vLines, hLines, step };
  }, [bounds]);

  return (
    <div className="relative border border-slate-800 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl shadow-xl shadow-black/30 flex flex-col items-center h-full justify-between">
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <span className="text-[10px] bg-slate-800/85 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-md font-mono font-bold tracking-wider uppercase shadow-xs">
          {lang === 'zh' ? '交互式截面圖' : 'Interactive Section View'}
        </span>
      </div>

      <div className="absolute top-4 right-4 text-right">
        <div className="text-[10px] font-mono text-slate-500 font-semibold">
          Scale: 1px = {(1 / scale).toFixed(2)} mm
        </div>
      </div>

      {/* Dynamic interactive guide label/banner */}
      <div className="text-[10px] text-center text-slate-300 mt-8 mb-1.5 flex items-center gap-1.5 justify-center bg-slate-950/40 border border-slate-900/50 px-3.5 py-1.5 rounded-xl w-full max-w-[380px] shadow-sm select-none">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
        </span>
        <span className="font-sans leading-normal">
          {lang === 'zh' 
            ? '💡 可在圖上拖曳移動元件；點選元件後拉動黃色圓點把手即可調節尺寸' 
            : '💡 Drag shapes to move them. Click any shape to drag yellow handles to resize.'}
        </span>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full max-w-[380px] bg-slate-950/80 border border-slate-900/80 rounded-xl shadow-inner select-none mt-2 mb-2"
        id="section-v-canvas"
        onMouseDown={(e) => {
          // If user clicked the canvas background (not inside a group/shape/handle), deselect selection
          if (e.target === e.currentTarget || (e.target as SVGElement).tagName === 'svg' || (e.target as SVGElement).tagName === 'line') {
            onSelectShape(null);
          }
        }}
      >
        <defs>
          {/* Diagonal pattern for representing a subtracted hole */}
          <pattern
            id="diagonalHatch"
            width="10"
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
          </pattern>
          <pattern
            id="holeHatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="8"
              x2="8"
              y2="0"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>

        {/* 1. Grid Lines */}
        <g stroke="#1e293b" strokeWidth="0.8">
          {gridLines.vLines.map((x) => (
            <line
              key={`gl-v-${x}`}
              x1={toSvgX(x)}
              y1={0}
              x2={toSvgX(x)}
              y2={canvasHeight}
              strokeDasharray="2,4"
            />
          ))}
          {gridLines.hLines.map((y) => (
            <line
              key={`gl-h-${y}`}
              x1={0}
              y1={toSvgY(y)}
              x2={canvasWidth}
              y2={toSvgY(y)}
              strokeDasharray="2,4"
            />
          ))}
        </g>

        {/* 2. Grid Labels */}
        <g fill="#475569" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="500">
          {/* X Grid Labels */}
          {gridLines.vLines.map((x) => {
            const yPos = toSvgY(0);
            const safeY = Math.max(12, Math.min(canvasHeight - 6, yPos + 12));
            return (
              <text
                key={`lbl-v-${x}`}
                x={toSvgX(x)}
                y={safeY}
                textAnchor="middle"
                opacity="0.85"
              >
                {x}
              </text>
            );
          })}
          {/* Y Grid Labels */}
          {gridLines.hLines.map((y) => {
            const xPos = toSvgX(0);
            const safeX = Math.max(6, Math.min(canvasWidth - 16, xPos - 8));
            return (
              <text
                key={`lbl-h-${y}`}
                x={safeX}
                y={toSvgY(y) + 3}
                textAnchor="end"
                opacity="0.85"
              >
                {y}
              </text>
            );
          })}
        </g>

        {/* 3. Base Reference Axes (Global Origin (0,0)) */}
        <g stroke="#334155" strokeWidth="1.2">
          {/* X axis */}
          <line
            x1={0}
            y1={toSvgY(0)}
            x2={canvasWidth}
            y2={toSvgY(0)}
            opacity="0.6"
          />
          {/* Y axis */}
          <line
            x1={toSvgX(0)}
            y1={0}
            x2={toSvgX(0)}
            y2={canvasHeight}
            opacity="0.6"
          />
        </g>

        {/* 4. Draw Shapes */}
        {shapes.map((shape) => {
          const isSelected = selectedId === shape.id;
          const isHovered = hoveredId === shape.id || isSelected;
          const x = toSvgX(shape.cx);
          const y = toSvgY(shape.cy);

          const handleMouseDownShape = (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            onSelectShape(shape.id);
            setDragState({
              shapeId: shape.id,
              startX: e.clientX,
              startY: e.clientY,
              initCx: shape.cx,
              initCy: shape.cy,
            });
          };

          return (
            <g
              key={shape.id}
              onMouseEnter={() => onHoverShape(shape.id)}
              onMouseLeave={() => onHoverShape(null)}
              onMouseDown={handleMouseDownShape}
              className="cursor-move transition-all duration-150"
              style={{ outline: 'none' }}
              id={`svg-shape-${shape.id}`}
            >
              {shape.type === 'rectangle' && (
                <rect
                  x={x - toSvgDist(shape.width) / 2}
                  y={y - toSvgDist(shape.height) / 2}
                  width={toSvgDist(shape.width)}
                  height={toSvgDist(shape.height)}
                  rx="2"
                  fill={
                    shape.isHole
                      ? 'url(#diagonalHatch)'
                      : isHovered
                      ? '#38bdf8'
                      : '#0284c7'
                  }
                  fillOpacity={shape.isHole ? 1 : isHovered ? 0.35 : 0.18}
                  stroke={
                    shape.isHole
                      ? '#f43f5e'
                      : isHovered
                      ? '#38bdf8'
                      : '#0ea5e9'
                  }
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray={shape.isHole ? '4,3' : '0'}
                />
              )}

              {shape.type === 'circle' && (
                <circle
                  cx={x}
                  cy={y}
                  r={toSvgDist(shape.radius)}
                  fill={
                    shape.isHole
                      ? 'url(#diagonalHatch)'
                      : isHovered
                      ? '#38bdf8'
                      : '#0284c7'
                  }
                  fillOpacity={shape.isHole ? 1 : isHovered ? 0.35 : 0.18}
                  stroke={
                    shape.isHole
                      ? '#f43f5e'
                      : isHovered
                      ? '#38bdf8'
                      : '#0ea5e9'
                  }
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray={shape.isHole ? '4,3' : '0'}
                />
              )}

              {shape.type === 'ibeam' && (() => {
                const bf_s = toSvgDist(shape.fWidth ?? 80);
                const h_s = toSvgDist(shape.height ?? 100);
                const tf_s = toSvgDist(shape.fThickness ?? 15);
                const tw_s = toSvgDist(shape.wThickness ?? 12);
                
                const dPath = `
                  M ${x - bf_s / 2} ${y - h_s / 2}
                  H ${x + bf_s / 2}
                  V ${y - h_s / 2 + tf_s}
                  H ${x + tw_s / 2}
                  V ${y + h_s / 2 - tf_s}
                  H ${x + bf_s / 2}
                  V ${y + h_s / 2}
                  H ${x - bf_s / 2}
                  V ${y + h_s / 2 - tf_s}
                  H ${x - tw_s / 2}
                  V ${y - h_s / 2 + tf_s}
                  H ${x - bf_s / 2}
                  Z
                `.trim();

                return (
                  <path
                    d={dPath}
                    fill={
                      shape.isHole
                        ? 'url(#diagonalHatch)'
                        : isHovered
                        ? '#38bdf8'
                        : '#0284c7'
                    }
                    fillOpacity={shape.isHole ? 1 : isHovered ? 0.35 : 0.18}
                    stroke={
                      shape.isHole
                        ? '#f43f5e'
                        : isHovered
                        ? '#38bdf8'
                        : '#0ea5e9'
                    }
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeDasharray={shape.isHole ? '4,3' : '0'}
                  />
                );
              })()}

              {shape.type === 'tsection' && (() => {
                const bf = shape.fWidth ?? 80;
                const h = shape.height ?? 100;
                const tf = shape.fThickness ?? 15;
                const tw = shape.wThickness ?? 12;
                const hw = Math.max(1, h - tf);
                
                const Af = bf * tf;
                const Aw = tw * hw;
                const yBase = (Aw * (hw / 2) + Af * (hw + tf / 2)) / (Af + Aw);

                const bf_s = toSvgDist(bf);
                const h_s = toSvgDist(h);
                const tf_s = toSvgDist(tf);
                const tw_s = toSvgDist(tw);
                const hw_s = toSvgDist(hw);
                const yBase_s = toSvgDist(yBase);

                const dPath = `
                  M ${x - bf_s / 2} ${y - (h_s - yBase_s)}
                  H ${x + bf_s / 2}
                  V ${y - (hw_s - yBase_s)}
                  H ${x + tw_s / 2}
                  V ${y + yBase_s}
                  H ${x - tw_s / 2}
                  V ${y - (hw_s - yBase_s)}
                  H ${x - bf_s / 2}
                  Z
                `.trim();

                return (
                  <path
                    d={dPath}
                    fill={
                      shape.isHole
                        ? 'url(#diagonalHatch)'
                        : isHovered
                        ? '#38bdf8'
                        : '#0284c7'
                    }
                    fillOpacity={shape.isHole ? 1 : isHovered ? 0.35 : 0.18}
                    stroke={
                      shape.isHole
                        ? '#f43f5e'
                        : isHovered
                        ? '#38bdf8'
                        : '#0ea5e9'
                    }
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeDasharray={shape.isHole ? '4,3' : '0'}
                  />
                );
              })()}

              {shape.type === 'hollowrect' && (() => {
                const b_s = toSvgDist(shape.width);
                const h_s = toSvgDist(shape.height);
                const t_s = toSvgDist(shape.thickness ?? 6);
                const bi_s = Math.max(1, b_s - 2 * t_s);
                const hi_s = Math.max(1, h_s - 2 * t_s);

                const dPath = `
                  M ${x - b_s / 2} ${y - h_s / 2} 
                  h ${b_s} 
                  v ${h_s} 
                  h ${-b_s} 
                  Z 
                  M ${x - bi_s / 2} ${y - hi_s / 2} 
                  h ${bi_s} 
                  v ${hi_s} 
                  h ${-bi_s} 
                  Z
                `.trim();

                return (
                  <path
                    d={dPath}
                    fillRule="evenodd"
                    fill={
                      shape.isHole
                        ? 'url(#diagonalHatch)'
                        : isHovered
                        ? '#38bdf8'
                        : '#0284c7'
                    }
                    fillOpacity={shape.isHole ? 1 : isHovered ? 0.35 : 0.18}
                    stroke={
                      shape.isHole
                        ? '#f43f5e'
                        : isHovered
                        ? '#38bdf8'
                        : '#0ea5e9'
                    }
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeDasharray={shape.isHole ? '4,3' : '0'}
                  />
                );
              })()}

              {shape.type === 'hollowcircle' && (() => {
                const R_s = toSvgDist(shape.radius);
                const t_s = toSvgDist(shape.thickness ?? 6);
                const r_s = Math.max(1, R_s - t_s);

                const dPath = `
                  M ${x} ${y - R_s} 
                  A ${R_s} ${R_s} 0 1 0 ${x} ${y + R_s} 
                  A ${R_s} ${R_s} 0 1 0 ${x} ${y - R_s} 
                  M ${x} ${y - r_s} 
                  A ${r_s} ${r_s} 0 1 1 ${x} ${y + r_s} 
                  A ${r_s} ${r_s} 0 1 1 ${x} ${y - r_s}
                `.trim();

                return (
                  <path
                    d={dPath}
                    fillRule="evenodd"
                    fill={
                      shape.isHole
                        ? 'url(#diagonalHatch)'
                        : isHovered
                        ? '#38bdf8'
                        : '#0284c7'
                    }
                    fillOpacity={shape.isHole ? 1 : isHovered ? 0.35 : 0.18}
                    stroke={
                      shape.isHole
                        ? '#f43f5e'
                        : isHovered
                        ? '#38bdf8'
                        : '#0ea5e9'
                    }
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeDasharray={shape.isHole ? '4,3' : '0'}
                  />
                );
              })()}

              {/* Subshell Centroid Mark */}
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill={shape.isHole ? '#f43f5e' : '#0ea5e9'}
                stroke="#0f172a"
                strokeWidth="1.2"
              />
              <text
                x={x + 6}
                y={y - 6}
                fontSize="8.5"
                fontFamily="sans-serif"
                fill={shape.isHole ? '#f43f5e' : '#38bdf8'}
                fontWeight="600"
                className="pointer-events-none"
              >
                G{shapes.indexOf(shape) + 1}
              </text>
            </g>
          );
        })}

        {/* Draw active handles and bbox on top */}
        {shapes.map((shape) => {
          if (shape.id !== selectedId) return null;

          // compute envelope
          let minX = shape.cx;
          let maxX = shape.cx;
          let minY = shape.cy;
          let maxY = shape.cy;

          if (shape.type === 'rectangle' || shape.type === 'hollowrect') {
            minX = shape.cx - shape.width / 2;
            maxX = shape.cx + shape.width / 2;
            minY = shape.cy - shape.height / 2;
            maxY = shape.cy + shape.height / 2;
          } else if (shape.type === 'circle' || shape.type === 'hollowcircle') {
            minX = shape.cx - shape.radius;
            maxX = shape.cx + shape.radius;
            minY = shape.cy - shape.radius;
            maxY = shape.cy + shape.radius;
          } else if (shape.type === 'ibeam' || shape.type === 'tsection') {
            const halfW = (shape.fWidth ?? 80) / 2;
            const halfH = (shape.height ?? 100) / 2;
            minX = shape.cx - halfW;
            maxX = shape.cx + halfW;
            minY = shape.cy - halfH;
            maxY = shape.cy + halfH;
          }

          const leftSvg = toSvgX(minX);
          const rightSvg = toSvgX(maxX);
          const topSvg = toSvgY(maxY);
          const bottomSvg = toSvgY(minY);

          // Render handles based on type
          return (
            <g key={`handles-${shape.id}`}>
              {/* Bounding box guide overlay */}
              <rect
                x={leftSvg - 4}
                y={topSvg - 4}
                width={rightSvg - leftSvg + 8}
                height={bottomSvg - topSvg + 8}
                fill="none"
                stroke="#eab308"
                strokeWidth="1.2"
                strokeDasharray="4,4"
                opacity="0.8"
                className="pointer-events-none"
              />

              {/* Resize handles */}
              {/* 1. Right handle (Width / Radius / fWidth) */}
              {(shape.type === 'rectangle' || shape.type === 'hollowrect' || shape.type === 'circle' || shape.type === 'hollowcircle' || shape.type === 'ibeam' || shape.type === 'tsection') && (
                <g>
                  {/* Outer subtle halo ring */}
                  <circle
                    cx={rightSvg}
                    cy={toSvgY(shape.cy)}
                    r="8.5"
                    fill="transparent"
                    className="cursor-ew-resize"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const initVal = shape.type === 'circle' || shape.type === 'hollowcircle'
                        ? shape.radius
                        : shape.type === 'ibeam' || shape.type === 'tsection'
                        ? (shape.fWidth ?? 80)
                        : shape.width;
                      setResizeDragState({
                        shapeId: shape.id,
                        handleType: shape.type === 'circle' || shape.type === 'hollowcircle'
                          ? 'radius'
                          : shape.type === 'ibeam' || shape.type === 'tsection'
                          ? 'fWidth'
                          : 'width',
                        startX: e.clientX,
                        startY: e.clientY,
                        initVal,
                      });
                    }}
                  />
                  <circle
                    cx={rightSvg}
                    cy={toSvgY(shape.cy)}
                    r="4.5"
                    fill="#eab308"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-ew-resize pointer-events-none"
                  />
                </g>
              )}

              {/* 2. Top handle (Height) */}
              {(shape.type === 'rectangle' || shape.type === 'hollowrect' || shape.type === 'ibeam' || shape.type === 'tsection') && (() => {
                let handleY = topSvg;
                if (shape.type === 'tsection') {
                  const bf = shape.fWidth ?? 80;
                  const h = shape.height ?? 100;
                  const tf = shape.fThickness ?? 15;
                  const tw = shape.wThickness ?? 12;
                  const hw = Math.max(1, h - tf);
                  const Af = bf * tf;
                  const Aw = tw * hw;
                  const yBase = (Af + Aw) > 0 ? (Aw * (hw / 2) + Af * (hw + tf / 2)) / (Af + Aw) : 0;
                  // top edge height is (h - yBase) above center
                  handleY = toSvgY(shape.cy + (h - yBase));
                }

                return (
                  <g>
                    {/* Outer subtle halo ring */}
                    <circle
                      cx={toSvgX(shape.cx)}
                      cy={handleY}
                      r="8.5"
                      fill="transparent"
                      className="cursor-ns-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setResizeDragState({
                          shapeId: shape.id,
                          handleType: 'height',
                          startX: e.clientX,
                          startY: e.clientY,
                          initVal: shape.height,
                        });
                      }}
                    />
                    <circle
                      cx={toSvgX(shape.cx)}
                      cy={handleY}
                      r="4.5"
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="cursor-ns-resize pointer-events-none"
                    />
                  </g>
                );
              })()}
            </g>
          );
        })}

        {/* 5. Global Centroidal Axes (X̄ / Ȳ) */}
        {shapes.length > 0 && (
          <g>
            {/* Horizontal centroid axis */}
            <line
              x1={0}
              y1={toSvgY(centroid.y)}
              x2={canvasWidth}
              y2={toSvgY(centroid.y)}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="6,4"
              className="pointer-events-none"
            />
            {/* Vertical centroid axis */}
            <line
              x1={toSvgX(centroid.x)}
              y1={0}
              x2={toSvgX(centroid.x)}
              y2={canvasHeight}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="6,4"
              className="pointer-events-none"
            />

            {/* Global Centroid Dot */}
            <g transform={`translate(${toSvgX(centroid.x)}, ${toSvgY(centroid.y)})`}>
              {/* Outer halo */}
              <circle
                r="8"
                fill="#fbbf24"
                fillOpacity="0.25"
                className="animate-pulse pointer-events-none"
              />
              {/* Crosshair target circle */}
              <circle
                r="4.5"
                fill="#d97706"
                stroke="#0f172a"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
              <text
                x="10"
                y="-10"
                fontSize="10.5"
                fontFamily="sans-serif"
                fontWeight="bold"
                fill="#fbbf24"
                className="pointer-events-none font-sans"
              >
                G (X̄, Ȳ)
              </text>
            </g>
          </g>
        )}
      </svg>

      <div className="w-full mt-4 flex flex-wrap justify-between gap-y-2 text-[11px] px-1 text-slate-400 font-semibold font-mono border-t border-slate-800/60 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-sky-400/40 bg-sky-400/10 rounded-xs"></span>
          <span>{lang === 'zh' ? '實心材料 (+)' : 'Solid Parts (+)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 border border-rose-500 rounded-xs"
            style={{ backgroundImage: 'url(#diagonalHatch)', backgroundSize: '15px 15px' }}
          ></span>
          <span>{lang === 'zh' ? '挖空材料 (-)' : 'Hole Parts (-)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 border-t-2 border-dashed border-amber-400 inline-block h-1"></span>
          <span>{lang === 'zh' ? '形心軸 (G)' : 'Centroid Axis (G)'}</span>
        </div>
      </div>
    </div>
  );
}
