export type ShapeType = 'rectangle' | 'circle' | 'ibeam' | 'tsection' | 'hollowrect' | 'hollowcircle';

export interface SubShape {
  id: string;
  name: string;
  type: ShapeType;
  // Dimensions
  width: number;  // for rectangle, outer width of hollowrect
  height: number; // for rectangle, outer height of hollowrect
  radius: number; // for circle, outer radius of hollowcircle
  // Dimensions for complex shapes
  fWidth?: number;     // Flange width (for I-Beam, T-Section)
  fThickness?: number; // Flange thickness (for I-Beam, T-Section)
  wThickness?: number; // Web thickness (for I-Beam, T-Section)
  thickness?: number;  // Wall thickness (for hollowrect, hollowcircle)
  // Centroid of this sub-shape relative to global origin (0, 0)
  cx: number;
  cy: number;
  // Whether it is a solid component or a hole (negative space)
  isHole: boolean;
}

export interface CentroidResult {
  x: number;
  y: number;
  totalArea: number;
  steps: {
    totalAreaFormula: string;
    totalAreaVal: number;
    sumAx: number;
    sumAy: number;
    xBarFormula: string;
    yBarFormula: string;
  };
}

export interface ParallelAxisRow {
  id: string;
  name: string;
  type: ShapeType;
  isHole: boolean;
  area: number;
  // Local centroids
  cx: number;
  cy: number;
  // Local moments of inertia
  ix0: number; // local ix about its own centroid
  iy0: number; // local iy
  ix0Formula: string;
  iy0Formula: string;
  // Distances to global centroid (X_bar, Y_bar)
  dx: number; // cy - Y_bar
  dy: number; // cx - X_bar
  // Parallel axis terms A * d^2
  adx2: number; // A * dx^2
  ady2: number; // A * dy^2
  // Sub-totals
  ixTotal: number; // ix0 + A*dx^2 (or subtracted if hole)
  iyTotal: number; // iy0 + A*dy^2 (or subtracted if hole)
}

export interface CalculationResult {
  centroid: CentroidResult;
  rows: ParallelAxisRow[];
  totalIx: number;
  totalIy: number;
  rx: number; // radius of gyration rx
  ry: number; // radius of gyration ry
}

export type PresetType = 'rectangle' | 'circle' | 'ibeam' | 'tsection' | 'box';

export interface Preset {
  id: PresetType;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  shapes: SubShape[];
}
