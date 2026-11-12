import { describe, it, expect } from 'vitest';
import { getScenario, sample, scenarios } from './scenarios';
import { galleryItems } from '../review/catalog';
import { fixture } from '../review/fixtures';
import { owners } from './types';
describe('presentation timeline', () => {
  it('supports exact reverse seeking without accumulating patches', () => {
    for (const s of scenarios) {
      const before = sample(s, 0);
      sample(s, s.duration);
      sample(s, s.duration / 2);
      expect(sample(s, 0)).toEqual(before);
    }
  });
  it('reduced motion has the same final projection, without travelers', () => {
    for (const s of scenarios) {
      expect(sample(s, 0, true).view).toEqual(sample(s, s.duration).view);
      expect(sample(s, 0.5, true).motions).toEqual([]);
    }
  });
  it('clamps invalid, negative, and overlong clocks', () => {
    const s = scenarios[0];
    expect(sample(s, -5)).toEqual(sample(s, 0));
    expect(sample(s, NaN)).toEqual(sample(s, 0));
    expect(sample(s, Infinity)).toEqual(sample(s, 0));
    expect(sample(s, 100)).toEqual(sample(s, s.duration));
  });
  it('samples moving pieces only during their own interval', () => {
    const s = getScenario('recruit');
    expect(sample(s, 0).motions).toHaveLength(0);
    expect(sample(s, 1).motions[0].progress).toBeGreaterThan(0);
    expect(sample(s, 2).motions).toHaveLength(0);
  });
  it('keeps source fixtures immutable and IDs/beat times valid', () => {
    for (const s of scenarios) {
      const original = s.fixture();
      sample(s, s.duration);
      expect(s.fixture()).toEqual(original);
      expect(s.beats[0].at).toBe(0);
      expect([...s.beats.map((b) => b.at)].sort((a, b) => a - b)).toEqual(s.beats.map((b) => b.at));
      expect(s.beats.at(-1)!.at).toBeLessThan(s.duration);
    }
  });
  it('uses one stable reference for every gallery sample and scene', () => {
    expect(new Set(galleryItems.map((i) => i.id)).size).toBe(galleryItems.length);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
    expect(galleryItems.filter((i) => i.kind === 'mark')).toHaveLength(19);
  });
  it('uses all sixteen physical population pieces in each base fixture', () => {
    const v = fixture();
    for (const owner of owners) {
      const p = v.players.find((p) => p.owner === owner)!;
      expect(
        p.reserve.length +
          p.soldiers.length +
          p.engineers.length +
          v.areas.flatMap((a) => a.people).filter((p) => p.owner === owner).length
      ).toBe(16);
    }
  });
  it('keeps Arch line order and the scoring footprints explicit', () => {
    const line = getScenario('arch-line');
    expect(line.beats.slice(1).map((b) => b.label)).toEqual([
      'Space 1 · Temple',
      'Space 2 · Arch',
      'Space 3 · Market'
    ]);
    const scoring = getScenario('scoring');
    expect(sample(scoring, 0).focus.cells).toHaveLength(9);
    expect(sample(scoring, 3).focus.cells).toContain('0,5');
    expect(sample(scoring, 3).focus.cells).toContain('0,0');
  });
});

it('keeps all physical meeples in the contest resolution fixture', () => {
  const s = getScenario('resolve');
  for (const time of [0, s.duration]) {
    const v = sample(s, time).view;
    for (const owner of owners) {
      const p = v.players.find((p) => p.owner === owner)!;
      expect(
        p.reserve.length +
          p.soldiers.length +
          p.engineers.length +
          v.areas.flatMap((a) => a.people).filter((p) => p.owner === owner).length
      ).toBe(16);
    }
  }
});
