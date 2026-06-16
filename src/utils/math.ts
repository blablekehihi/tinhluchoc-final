import { SubShape, CalculationResult, ParallelAxisRow, CentroidResult } from '../types';

export function calculateSectionProperties(shapes: SubShape[]): CalculationResult {
  if (shapes.length === 0) {
    return {
      centroid: {
        x: 0,
        y: 0,
        totalArea: 0,
        steps: {
          totalAreaFormula: '∑A_i = 0',
          totalAreaVal: 0,
          sumAx: 0,
          sumAy: 0,
          xBarFormula: 'X̄ = 0',
          yBarFormula: 'Ȳ = 0'
        }
      },
      rows: [],
      totalIx: 0,
      totalIy: 0,
      rx: 0,
      ry: 0
    };
  }

  // 1. Calculate Areas and local centroids
  let totalArea = 0;
  let sumAx = 0;
  let sumAy = 0;

  const rows: ParallelAxisRow[] = shapes.map((shape) => {
    let area = 0;
    let ix0 = 0;
    let iy0 = 0;
    let ix0Formula = '';
    let iy0Formula = '';

    const sign = shape.isHole ? -1 : 1;

    if (shape.type === 'rectangle') {
      const w = shape.width;
      const h = shape.height;
      area = w * h;
      ix0 = (w * Math.pow(h, 3)) / 12;
      iy0 = (h * Math.pow(w, 3)) / 12;
      
      ix0Formula = `(b·h³)/12 = (${w.toFixed(1)}·${h.toFixed(1)}³)/12`;
      iy0Formula = `(h·b³)/12 = (${h.toFixed(1)}·${w.toFixed(1)}³)/12`;
    } else if (shape.type === 'circle') {
      const r = shape.radius;
      area = Math.PI * Math.pow(r, 2);
      ix0 = (Math.PI * Math.pow(r, 4)) / 4;
      iy0 = ix0;

      ix0Formula = `(π·r⁴)/4 = (π·${r.toFixed(1)}⁴)/4`;
      iy0Formula = `(π·r⁴)/4 = (π·${r.toFixed(1)}⁴)/4`;
    } else if (shape.type === 'ibeam') {
      const bf = shape.fWidth ?? 80;
      const h = shape.height ?? 100;
      const tf = shape.fThickness ?? 15;
      const tw = shape.wThickness ?? 12;
      const hw = Math.max(1, h - 2 * tf);
      
      area = 2 * bf * tf + hw * tw;
      ix0 = (bf * Math.pow(h, 3)) / 12 - ((bf - tw) * Math.pow(hw, 3)) / 12;
      iy0 = (2 * tf * Math.pow(bf, 3)) / 12 + (hw * Math.pow(tw, 3)) / 12;

      ix0Formula = `[(bf·h³)-(bf-tw)·hw³]/12 = [(${bf}·${h}³)-(${(bf - tw).toFixed(1)})·${hw.toFixed(1)}³]/12`;
      iy0Formula = `[2·tf·bf³+hw·tw³]/12 = [2·${tf}·${bf}³+${hw.toFixed(1)}·${tw}³]/12`;
    } else if (shape.type === 'tsection') {
      const bf = shape.fWidth ?? 80;
      const h = shape.height ?? 100;
      const tf = shape.fThickness ?? 15;
      const tw = shape.wThickness ?? 12;
      const hw = Math.max(1, h - tf);
      
      const Af = bf * tf;
      const Aw = tw * hw;
      area = Af + Aw;
      
      // local centroid from bottom of stem
      const yBase = (Aw * (hw / 2) + Af * (hw + tf / 2)) / area;
      const df = (hw + tf / 2) - yBase;
      const dw = yBase - hw / 2;
      
      ix0 = ((bf * Math.pow(tf, 3)) / 12 + Af * Math.pow(df, 2)) + ((tw * Math.pow(hw, 3)) / 12 + Aw * Math.pow(dw, 2));
      iy0 = (tf * Math.pow(bf, 3)) / 12 + (hw * Math.pow(tw, 3)) / 12;

      ix0Formula = `∑(I_i0+A·d²) = [(${bf}·${tf}³)/12+${Af.toFixed(0)}·${df.toFixed(1)}²]+[(${tw}·${hw}³)/12+${Aw.toFixed(0)}·${dw.toFixed(1)}²]`;
      iy0Formula = `[tf·bf³+hw·tw³]/12 = [${tf}·${bf}³+${hw.toFixed(1)}·${tw}³]/12`;
    } else if (shape.type === 'hollowrect') {
      const b = shape.width;
      const h = shape.height;
      const t = shape.thickness ?? 6;
      const bi = Math.max(1, b - 2 * t);
      const hi = Math.max(1, h - 2 * t);
      
      area = b * h - bi * hi;
      ix0 = (b * Math.pow(h, 3)) / 12 - (bi * Math.pow(hi, 3)) / 12;
      iy0 = (h * Math.pow(b, 3)) / 12 - (hi * Math.pow(bi, 3)) / 12;

      ix0Formula = `(b·h³-bi·hi³)/12 = (${b}·${h}³-${bi}·${hi}³)/12`;
      iy0Formula = `(h·b³-hi·bi³)/12 = (${h}·${b}³-${hi}·${bi}³)/12`;
    } else if (shape.type === 'hollowcircle') {
      const R = shape.radius;
      const t = shape.thickness ?? 6;
      const r = Math.max(1, R - t);
      
      area = Math.PI * (Math.pow(R, 2) - Math.pow(r, 2));
      ix0 = (Math.PI * (Math.pow(R, 4) - Math.pow(r, 4))) / 4;
      iy0 = ix0;

      ix0Formula = `π(R⁴-r⁴)/4 = π(${R}⁴-${r}⁴)/4`;
      iy0Formula = `π(R⁴-r⁴)/4 = π(${R}⁴-${r}⁴)/4`;
    }

    // Adjust for solid vs hole
    const signedArea = sign * area;
    const signedIx0 = sign * ix0;
    const signedIy0 = sign * iy0;

    totalArea += signedArea;
    sumAx += signedArea * shape.cx;
    sumAy += signedArea * shape.cy;

    return {
      id: shape.id,
      name: shape.name,
      type: shape.type,
      isHole: shape.isHole,
      area: signedArea, // signed
      cx: shape.cx,
      cy: shape.cy,
      ix0: signedIx0, // signed
      iy0: signedIy0, // signed
      ix0Formula,
      iy0Formula,
      dx: 0,
      dy: 0,
      adx2: 0,
      ady2: 0,
      ixTotal: 0,
      iyTotal: 0
    };
  });

  // Calculate global centroid
  // Guard against divide-by-zero or empty total area
  const xBar = totalArea !== 0 ? sumAx / totalArea : 0;
  const yBar = totalArea !== 0 ? sumAy / totalArea : 0;

  const totalAreaFormula = shapes
    .map(s => {
      const sign = s.isHole ? '-' : '+';
      if (s.type === 'rectangle') return `${sign}(${s.width}×${s.height})`;
      if (s.type === 'circle') return `${sign}(π×${s.radius}²)`;
      if (s.type === 'ibeam') return `${sign}(IBeam)`;
      if (s.type === 'tsection') return `${sign}(TSection)`;
      if (s.type === 'hollowrect') return `${sign}(HollowBox)`;
      if (s.type === 'hollowcircle') return `${sign}(HollowPipe)`;
      return `${sign}A`;
    })
    .join(' ');

  const xBarFormula = `X̄ = ∑(A_i · x_i) / ∑A_i = (${sumAx.toFixed(1)}) / (${totalArea.toFixed(1)})`;
  const yBarFormula = `Ȳ = ∑(A_i · y_i) / ∑A_i = (${sumAy.toFixed(1)}) / (${totalArea.toFixed(1)})`;

  const centroidResult: CentroidResult = {
    x: xBar,
    y: yBar,
    totalArea,
    steps: {
      totalAreaFormula,
      totalAreaVal: totalArea,
      sumAx,
      sumAy,
      xBarFormula,
      yBarFormula
    }
  };

  // 2. Parallel Axis Calculations
  let totalIx = 0;
  let totalIy = 0;

  const updatedRows = rows.map((row) => {
    const sign = row.isHole ? -1 : 1;
    // vertical distance to global Y-centroid (used for Ix)
    const dx = row.cy - yBar;
    // horizontal distance to global X-centroid (used for Iy)
    const dy = row.cx - xBar;

    // parallel axis term: A * d^2 (keep sign matching the area)
    const adx2 = sign * Math.abs(row.area) * Math.pow(dx, 2);
    const ady2 = sign * Math.abs(row.area) * Math.pow(dy, 2);

    const ixTotal = row.ix0 + adx2;
    const iyTotal = row.iy0 + ady2;

    totalIx += ixTotal;
    totalIy += iyTotal;

    return {
      ...row,
      dx,
      dy,
      adx2,
      ady2,
      ixTotal,
      iyTotal
    };
  });

  // Radii of Gyration: r = sqrt(I / A)
  // Guard against negatives or zero area in square root
  const rx = totalIx > 0 && totalArea > 0 ? Math.sqrt(totalIx / totalArea) : 0;
  const ry = totalIy > 0 && totalArea > 0 ? Math.sqrt(totalIy / totalArea) : 0;

  return {
    centroid: centroidResult,
    rows: updatedRows,
    totalIx,
    totalIy,
    rx,
    ry
  };
}

/**
 * Generates default presets for engineering sections
 */
export function getPresets(): { [key: string]: { shapes: SubShape[], descZh: string, descEn: string, nameZh: string, nameEn: string } } {
  return {
    rectangle: {
      nameZh: '單一實心矩形',
      nameEn: 'Solid Rectangle',
      descZh: '最基礎的截面，形心位於幾何中心。Ix = b·h³/12, Iy = h·b³/12。',
      descEn: 'The most basic section with centroid at geometric center. Ix = bh³/12, Iy = hb³/12.',
      shapes: [
        {
          id: 'rect_1',
          name: 'Main Rectangle / 主矩形',
          type: 'rectangle',
          width: 60,
          height: 100,
          radius: 0,
          cx: 0,
          cy: 0,
          isHole: false
        }
      ]
    },
    circle: {
      nameZh: '實心圓形',
      nameEn: 'Solid Circle',
      descZh: '圓對稱截面，橫載面各軸向剛化相同。Ix = Iy = π·r⁴/4。',
      descEn: 'Axial-symmetric section. Stiffening is identical on both axes. Ix = Iy = πr⁴/4.',
      shapes: [
        {
          id: 'circle_1',
          name: 'Main Circle / 主圓形',
          type: 'circle',
          width: 0,
          height: 0,
          radius: 40,
          cx: 0,
          cy: 0,
          isHole: false
        }
      ]
    },
    ibeam: {
      nameZh: '工字鋼 (I型鋼)',
      nameEn: 'I-Beam (Universal Beam)',
      descZh: '由上翼板、腹板、下翼板三個矩形組合而成，效率極高的抗彎截面。',
      descEn: 'Composed of 3 rectangles: Top Flange, Web, and Bottom Flange. Highly optimized for bending.',
      shapes: [
        {
          id: 'ibeam_top_flange',
          name: 'Top Flange / 上翼板',
          type: 'rectangle',
          width: 80,
          height: 15,
          radius: 0,
          cx: 0,
          cy: 50, // center is at y = 50
          isHole: false
        },
        {
          id: 'ibeam_web',
          name: 'Web / 腹板',
          type: 'rectangle',
          width: 12,
          height: 85,
          radius: 0,
          cx: 0,
          cy: 0, // center at y = 0
          isHole: false
        },
        {
          id: 'ibeam_bottom_flange',
          name: 'Bottom Flange / 下翼板',
          type: 'rectangle',
          width: 80,
          height: 15,
          radius: 0,
          cx: 0,
          cy: -50, // center at y = -50
          isHole: false
        }
      ]
    },
    tsection: {
      nameZh: 'T型截面',
      nameEn: 'T-Section',
      descZh: '非對稱截面，由翼板與腹板兩個矩形拼合，形心會偏向翼板一側。',
      descEn: 'Asymmetrical section. Composed of a Flange and a Web. The centroid shifts toward the flange.',
      shapes: [
        {
          id: 't_flange',
          name: 'Flange / 翼板',
          type: 'rectangle',
          width: 90,
          height: 16,
          radius: 0,
          cx: 0,
          cy: 35,
          isHole: false
        },
        {
          id: 't_web',
          name: 'Web / 腹板',
          type: 'rectangle',
          width: 16,
          height: 70,
          radius: 0,
          cx: 0,
          cy: -8,
          isHole: false
        }
      ]
    },
    box: {
      nameZh: '中空箱型截面',
      nameEn: 'Box Section (Hollow Rectangle)',
      descZh: '中空結構，常用於梁柱。透過將外側大矩形與內側減去（Hole）小矩形組合而成。',
      descEn: 'Hollow structure widely used for columns/beams. Created by subtracting a smaller rectangle (Hole) from an outer rectangle.',
      shapes: [
        {
          id: 'box_outer',
          name: 'Outer Boundary / 外矩形',
          type: 'rectangle',
          width: 80,
          height: 80,
          radius: 0,
          cx: 0,
          cy: 0,
          isHole: false
        },
        {
          id: 'box_inner',
          name: 'Inner Cutout (Hole) / 內中空',
          type: 'rectangle',
          width: 60,
          height: 60,
          radius: 0,
          cx: 0,
          cy: 0,
          isHole: true
        }
      ]
    }
  };
}
