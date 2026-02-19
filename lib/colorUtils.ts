export interface Paint {
  id: string;
  name: string;
  hex: string;
  pigment: string;
  brand?: string;
}

export interface BrandData {
  brand: string;
  id: string;
  colors: Paint[];
}

export interface PaintWithParts {
  paint: Paint;
  parts: number;
}

export interface MixResult {
  paints: PaintWithParts[];
  mixedHex: string;
  accuracy: number;
  suggestion?: Paint;
}

// ─── Hex / RGB helpers ───────────────────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}

// ─── RYB ↔ RGB (Gosset & Chen trilinear interpolation) ───────────────────────

// 8 corners of the RYB unit cube expressed in RGB [0..1]
const RYB_CORNERS: [number, number, number][] = [
  [1.000, 1.000, 1.000], // RYB(0,0,0) → white
  [1.000, 0.000, 0.000], // RYB(1,0,0) → red
  [1.000, 1.000, 0.000], // RYB(0,1,0) → yellow
  [1.000, 0.500, 0.000], // RYB(1,1,0) → orange
  [0.163, 0.373, 0.600], // RYB(0,0,1) → blue
  [0.380, 0.000, 0.460], // RYB(1,0,1) → purple
  [0.000, 0.660, 0.200], // RYB(0,1,1) → green
  [0.200, 0.094, 0.000], // RYB(1,1,1) → dark brown/black
];

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/** Convert RYB [0..1] → RGB [0..1] via trilinear interpolation */
function rybToRgbNorm(r: number, y: number, b: number): [number, number, number] {
  const [c000, c100, c010, c110, c001, c101, c011, c111] = RYB_CORNERS;
  return [0, 1, 2].map(i => {
    const x00 = lerp(c000[i], c100[i], r);
    const x10 = lerp(c010[i], c110[i], r);
    const x01 = lerp(c001[i], c101[i], r);
    const x11 = lerp(c011[i], c111[i], r);
    const xy0 = lerp(x00, x10, y);
    const xy1 = lerp(x01, x11, y);
    return lerp(xy0, xy1, b);
  }) as [number, number, number];
}

/** Convert RGB [0..1] → RYB [0..1] via numerical inversion (gradient descent) */
function rgbToRybNorm(rIn: number, gIn: number, bIn: number): [number, number, number] {
  let ryb: [number, number, number] = [rIn, gIn, bIn];

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  for (let iter = 0; iter < 150; iter++) {
    const pred = rybToRgbNorm(...ryb);
    const errR = rIn - pred[0];
    const errG = gIn - pred[1];
    const errB = bIn - pred[2];
    const errSq = errR * errR + errG * errG + errB * errB;
    if (errSq < 1e-9) break;

    const eps = 0.005;
    const lr = 0.15;

    const nextRyb = [...ryb] as [number, number, number];
    for (let dim = 0; dim < 3; dim++) {
      const rybPlus = [...ryb] as [number, number, number];
      rybPlus[dim] = clamp01(rybPlus[dim] + eps);
      const predPlus = rybToRgbNorm(...rybPlus);
      const dfdR = (predPlus[0] - pred[0]) / eps;
      const dfdG = (predPlus[1] - pred[1]) / eps;
      const dfdB = (predPlus[2] - pred[2]) / eps;
      const grad = dfdR * errR + dfdG * errG + dfdB * errB;
      nextRyb[dim] = clamp01(ryb[dim] + lr * grad);
    }
    ryb = nextRyb;
  }
  return ryb;
}

// ─── sRGB → CIE L*a*b* ───────────────────────────────────────────────────────

function linearize(v: number): number {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const rl = linearize(r);
  const gl = linearize(g);
  const bl = linearize(b);
  return [
    rl * 0.4124 + gl * 0.3576 + bl * 0.1805,
    rl * 0.2126 + gl * 0.7152 + bl * 0.0722,
    rl * 0.0193 + gl * 0.1192 + bl * 0.9505,
  ];
}

function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // D65 reference white
  const xn = 0.95047, yn = 1.0, zn = 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function hexToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/** CIE76 Euclidean distance in Lab space (0 = identical, ~100 max perceptual) */
export function colorDistance(hexA: string, hexB: string): number {
  const [L1, a1, b1] = hexToLab(hexA);
  const [L2, a2, b2] = hexToLab(hexB);
  return Math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

// ─── Subtractive mixing in RYB space ─────────────────────────────────────────

/**
 * Mix paints subtractively using RYB colour space.
 * weights: normalised fractions that sum to 1.
 * Returns the mixed colour as a hex string.
 */
export function mixPaintsRYB(hexColors: string[], weights: number[]): string {
  if (hexColors.length === 0) return '#000000';
  if (hexColors.length === 1) return hexColors[0];

  // Convert each hex → RYB, blend, convert back
  let rSum = 0, ySum = 0, bSum = 0;
  hexColors.forEach((hex, i) => {
    const [r, g, b] = hexToRgb(hex);
    const [ry, yy, by] = rgbToRybNorm(r / 255, g / 255, b / 255);
    rSum += ry * weights[i];
    ySum += yy * weights[i];
    bSum += by * weights[i];
  });

  const [rm, gm, bm] = rybToRgbNorm(rSum, ySum, bSum);
  return rgbToHex(rm * 255, gm * 255, bm * 255);
}

// ─── Combination generator ───────────────────────────────────────────────────

/** Integer-parts combos for up to 3 paints (parts 1–4, all ordered) */
const PARTS_2: [number, number][] = [
  [1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [1, 4], [4, 1], [2, 3], [3, 2],
];
const PARTS_3: [number, number, number][] = [
  [1, 1, 1], [2, 1, 1], [1, 2, 1], [1, 1, 2],
  [3, 1, 1], [1, 3, 1], [1, 1, 3], [2, 2, 1], [2, 1, 2], [1, 2, 2],
];

function combos<T>(arr: T[], k: number): T[][] {
  if (k === 1) return arr.map(x => [x]);
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    for (const rest of combos(arr.slice(i + 1), k - 1)) {
      result.push([arr[i], ...rest]);
    }
  }
  return result;
}

// ─── Main mix-finding algorithm ───────────────────────────────────────────────

/**
 * Convert a Lab distance to a 0-100 accuracy percentage.
 * Lab distance 0 → 100%, distance ≥50 → 0%
 */
function distToAccuracy(dist: number): number {
  return Math.max(0, Math.round((1 - dist / 28) * 100));
}

export function findBestMix(
  targetHex: string,
  selectedPaints: Paint[],
  allPaints: Paint[],
): MixResult {
  if (selectedPaints.length === 0) {
    return {
      paints: [],
      mixedHex: '#808080',
      accuracy: 0,
    };
  }

  let bestDist = Infinity;
  let bestMixed = '#808080';
  let bestCombo: Paint[] = [];
  let bestParts: number[] = [];

  //1-paint matches 
  for (const p of selectedPaints) {
    const dist = colorDistance(targetHex, p.hex);
    if (dist < bestDist) {
      bestDist = dist;
      bestMixed = p.hex;
      bestCombo = [p];
      bestParts = [1];
    }
  }

  // 2-paint mixes
  for (const pair of combos(selectedPaints, 2)) {
    for (const [a, b] of PARTS_2) {
      const total = a + b;
      const weights = [a / total, b / total];
      const mixed = mixPaintsRYB(pair.map(p => p.hex), weights);
      const dist = colorDistance(targetHex, mixed);
      if (dist < bestDist) {
        bestDist = dist;
        bestMixed = mixed;
        bestCombo = pair;
        bestParts = [a, b];
      }
    }
  }

  //3-paint mixes (only when ≥3 paints selected)
  if (selectedPaints.length >= 3) {
    for (const triple of combos(selectedPaints, 3)) {
      for (const [a, b, c] of PARTS_3) {
        const total = a + b + c;
        const weights = [a / total, b / total, c / total];
        const mixed = mixPaintsRYB(triple.map(p => p.hex), weights);
        const dist = colorDistance(targetHex, mixed);
        if (dist < bestDist) {
          bestDist = dist;
          bestMixed = mixed;
          bestCombo = triple;
          bestParts = [a, b, c];
        }
      }
    }
  }

  const accuracy = distToAccuracy(bestDist);

  // Suggest an unowned paint if accuracy < 80% 
  let suggestion: Paint | undefined;
  if (accuracy < 80) {
    // Find the paint from the full library (not already in best combo) that,
    // when added 1:1 with the current mix, brings us closest to the target.
    const ownedIds = new Set(bestCombo.map(p => p.id));
    let bestSuggestDist = bestDist;

    const testRatios: [number, number][] = [[0.25, 0.75], [0.5, 0.5], [0.75, 0.25]];
    for (const candidate of allPaints) {
      if (ownedIds.has(candidate.id)) continue;
      for (const [w1, w2] of testRatios) {
        const mixed = mixPaintsRYB([bestMixed, candidate.hex], [w1, w2]);
        const dist = colorDistance(targetHex, mixed);
        if (dist < bestSuggestDist) {
          bestSuggestDist = dist;
          suggestion = candidate;
        }
      }
    }
  }

  return {
    paints: bestCombo.map((p, i) => ({ paint: p, parts: bestParts[i] })),
    mixedHex: bestMixed,
    accuracy,
    suggestion,
  };
}
