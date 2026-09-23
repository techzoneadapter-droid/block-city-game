/** Versioned, validated resume data. Animation state never belongs in a save. */
export type PuzzleSession = {
  version: 1;
  key: string;
  level: number;
  grid: boolean[][];
  colors: number[][];
  pieces: Array<{ shape: number[][]; color: number; slot: number }>;
  specialCells: string[];
  iceCells: string[];
  linesCleared: number;
  score: number;
  placementsMade: number;
  combo: number;
  bestCombo: number;
  specialCleared: number;
  iceBroken: number;
  boostersUsed: number;
  randomState: number;
  pendingClear: boolean;
};
const nonnegative = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const matrix = (v: unknown, cell: (v: unknown) => boolean): boolean => Array.isArray(v) && v.length === 8 && v.every(row => Array.isArray(row) && row.length === 8 && row.every(cell));
const color = (v: unknown) => nonnegative(v) && v <= 0xffffff;
const coordinates = (v: unknown): boolean => Array.isArray(v) && v.length <= 64 && v.every(key => typeof key === 'string' && /^[0-7]:[0-7]$/.test(key));
export function validSession(value: unknown, key: string, level: number): value is PuzzleSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as PuzzleSession;
  return v.version === 1 && v.key === key && v.level === level && typeof v.pendingClear === 'boolean' &&
    matrix(v.grid, c => typeof c === 'boolean') && matrix(v.colors, color) &&
    coordinates(v.specialCells) && coordinates(v.iceCells) &&
    ['linesCleared', 'score', 'placementsMade', 'combo', 'bestCombo', 'specialCleared', 'iceBroken', 'boostersUsed', 'randomState'].every(k => nonnegative(v[k as keyof PuzzleSession])) &&
    Array.isArray(v.pieces) && v.pieces.length <= 3 && v.pieces.every(p => {
      if (!p || !color(p.color) || !nonnegative(p.slot) || p.slot > 2 || !Array.isArray(p.shape) || !p.shape.length || p.shape.length > 4) return false;
      const width = p.shape[0]?.length;
      return width > 0 && width <= 4 && p.shape.every(row => Array.isArray(row) && row.length === width && row.every(c => c === 0 || c === 1)) && p.shape.some(row => row.includes(1));
    }) && new Set(v.pieces.map(p => p.slot)).size === v.pieces.length;
}
const storageKey = (daily: boolean) => `block-city-puzzle-${daily ? 'daily' : 'campaign'}-v1`;
export function readPuzzleSession(daily: boolean, key: string, level: number): PuzzleSession | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey(daily)) || 'null');
    return validSession(value, key, level) ? value : undefined;
  } catch { return undefined; }
}
export function writePuzzleSession(daily: boolean, session: PuzzleSession) {
  try { localStorage.setItem(storageKey(daily), JSON.stringify(session)); } catch { /* Storage may be unavailable. */ }
}
export function clearPuzzleSession(daily: boolean) {
  try { localStorage.removeItem(storageKey(daily)); } catch { /* Storage may be unavailable. */ }
}
