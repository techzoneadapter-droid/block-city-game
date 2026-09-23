/** Difficulty randomness is separate from cosmetic particles and animation. */
export class PuzzleRandom {
  state: number;
  constructor(key: string) {
    this.state = 2166136261;
    for (const character of key) this.state = Math.imul(this.state ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
}

export type Grid = boolean[][];
export type Shape = number[][];
export function fitsAnywhere(grid: Grid, shape: Shape): boolean {
  return grid.some((row, r) => row.some((_, c) => shape.every((line, dy) =>
    line.every((block, dx) => !block || (r + dy < grid.length && c + dx < row.length && !grid[r + dy][c + dx])))));
}

/** Simulate on a copy: offering a rescue never mutates or charges the game. */
export function rescueTargets(grid: Grid, shapes: Shape[]) {
  const canContinue = (candidate: Grid) => shapes.some(shape => fitsAnywhere(candidate, shape));
  let hammer: [number, number] | undefined;
  let row: number | undefined;
  let mostBlocks = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length && !hammer; c++) {
      if (!grid[r][c]) continue;
      const copy = grid.map(line => [...line]);
      copy[r][c] = false;
      if (canContinue(copy)) hammer = [r, c];
    }
    const count = grid[r].filter(Boolean).length;
    if (count <= mostBlocks) continue;
    const copy = grid.map(line => [...line]);
    copy[r].fill(false);
    if (canContinue(copy)) { row = r; mostBlocks = count; }
  }
  return { refresh: grid.some(line => line.some(cell => !cell)), hammer, row };
}
