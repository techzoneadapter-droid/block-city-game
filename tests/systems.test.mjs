import test from 'node:test';
import assert from 'node:assert/strict';
import { PuzzleRandom, fitsAnywhere, rescueTargets } from '../src/puzzleLogic.ts';
import { getDailyChallenge } from '../src/retention.ts';
import { getLevelDefinition, TOTAL_CAMPAIGN_LEVELS, CHAPTERS } from '../src/levels.ts';
import { validSession, readPuzzleSession, writePuzzleSession, clearPuzzleSession } from '../src/puzzleSession.ts';

const grid = value => Array.from({ length: 8 }, () => Array(8).fill(value));
const snapshot = () => ({ version: 1, key: '2026-09-23', level: 12, grid: grid(false), colors: grid(0x194e83), pieces: [{ shape: [[1, 0], [1, 1]], color: 0xffcc33, slot: 2 }], specialCells: ['1:2'], iceCells: ['3:4'], linesCleared: 2, score: 430, placementsMade: 8, combo: 1, bestCombo: 2, specialCleared: 0, iceBroken: 1, boostersUsed: 0, randomState: 73912, pendingClear: false });

test('Daily board and sequence repeat for a date, vary across dates, and resume exactly', () => {
  const first = getDailyChallenge('2026-09-23');
  assert.deepEqual(first, getDailyChallenge('2026-09-23'));
  assert.notDeepEqual(first.startingCells, getDailyChallenge('2026-09-24').startingCells);
  for (let day = 1; day <= 28; day++) {
    const daily = getDailyChallenge(`2026-02-${String(day).padStart(2, '0')}`);
    assert.equal(new Set(daily.startingCells.map(String)).size, daily.startingCells.length);
    assert.ok(daily.startingCells.every(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8));
  }
  const a = new PuzzleRandom(first.key), b = new PuzzleRandom(first.key);
  assert.deepEqual(Array.from({ length: 40 }, () => a.next()), Array.from({ length: 40 }, () => b.next()));
  const state = a.state, expected = Array.from({ length: 30 }, () => a.next());
  const resumed = new PuzzleRandom('unused'); resumed.state = state;
  assert.deepEqual(Array.from({ length: 30 }, () => resumed.next()), expected);
});

test('No Moves offers only rescues that make a tray piece fit, without changing the board', () => {
  const full = grid(true), shape = [[1, 1], [1, 1]], before = structuredClone(full);
  assert.equal(fitsAnywhere(full, shape), false);
  assert.deepEqual(rescueTargets(full, [shape]), { refresh: false, hammer: undefined, row: undefined });
  assert.deepEqual(full, before);
  full[7][0] = false;
  const pair = [[1, 1]], rescue = rescueTargets(full, [pair]);
  assert.ok(rescue.hammer);
  const copy = structuredClone(full); copy[rescue.hammer[0]][rescue.hammer[1]] = false;
  assert.equal(fitsAnywhere(copy, pair), true);
  assert.equal(full.flat().filter(v => !v).length, 1);
  assert.ok(rescue.row !== undefined);
  const rowCopy = structuredClone(full); rowCopy[rescue.row].fill(false);
  assert.equal(fitsAnywhere(rowCopy, pair), true);
});

test('All 30 levels and six chapters retain valid board coordinates and rewards', () => {
  assert.equal(TOTAL_CAMPAIGN_LEVELS, 30);
  assert.equal(CHAPTERS.length, 6);
  for (let level = 1; level <= 30; level++) {
    const definition = getLevelDefinition(level);
    assert.ok(definition.targetLines > 0 && definition.rewardStars > 0 && definition.rewardCoins > 0);
    for (const [r, c] of [...definition.startingCells || [], ...definition.specialCells || [], ...definition.iceCells || []])
      assert.ok(r >= 0 && r < 8 && c >= 0 && c < 8);
  }
});

test('Session reload retains board, tray slots, objectives, and RNG; campaign and Daily stay separate', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  const saved = snapshot();
  writePuzzleSession(true, saved);
  assert.deepEqual(readPuzzleSession(true, saved.key, 12), saved);
  assert.equal(readPuzzleSession(false, saved.key, 12), undefined);
  assert.equal(readPuzzleSession(true, '2026-09-24', 12), undefined);
  assert.equal(readPuzzleSession(true, saved.key, 13), undefined);
  clearPuzzleSession(true);
  assert.equal(readPuzzleSession(true, saved.key, 12), undefined);
});

test('Malformed, stale and oversized session data safely falls back to a fresh puzzle', () => {
  const saved = snapshot();
  for (const value of [null, {}, { ...saved, version: 2 }, { ...saved, grid: [[]] }, { ...saved, iceCells: ['8:0'] }, { ...saved, score: -1 }, { ...saved, pieces: [{ shape: [[0]], color: 0, slot: 1 }] }, { ...saved, pieces: [saved.pieces[0], saved.pieces[0]] }])
    assert.equal(validSession(value, saved.key, 12), false);
  globalThis.localStorage = { getItem: () => '{broken' };
  assert.equal(readPuzzleSession(true, saved.key, 12), undefined);
  globalThis.localStorage = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('quota'); }, removeItem: () => { throw Error('blocked'); } };
  assert.doesNotThrow(() => { writePuzzleSession(true, saved); clearPuzzleSession(true); });
  assert.equal(readPuzzleSession(true, saved.key, 12), undefined);
});
