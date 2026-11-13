import { describe, expect, it } from 'vitest';
import {
  cloneRegistration,
  parseRegistration,
  presentLayers,
  setPlacement,
  shippedRegistration,
  tileRegistration
} from './tile-registration';
import type { TileData } from './types';

describe('shared tile layer registration', () => {
  const tile: TileData = {
    id: 'actual-face',
    building: 'library',
    score: { shape: 'banner', multiplier: 1, target: 'quarry' },
    plus: true
  };
  it('calibrates independent face emblems and places ink in the plaque opening', () => {
    expect(parseRegistration(JSON.parse(JSON.stringify(shippedRegistration)))).toEqual(
      shippedRegistration
    );
    const scroll = shippedRegistration.scores.scroll,
      banner = shippedRegistration.scores.banner;
    for (const [shape, { material, ink }] of [
      ['scroll', scroll],
      ['banner', banner]
    ] as const) {
      expect(ink.x).toBeGreaterThanOrEqual(material.x + 8);
      expect(ink.x + ink.width).toBeLessThanOrEqual(material.x + material.width - 8);
      expect(ink.y).toBeGreaterThanOrEqual(material.y + 3);
      expect(ink.y + ink.height).toBeLessThanOrEqual(
        material.y + material.height - (shape === 'banner' ? 5 : 3)
      );
    }
    expect(shippedRegistration.faces.library.symbol).not.toBe(
      shippedRegistration.faces.barracks.symbol
    );
  });
  it('updates exactly one reusable scope without mutating shipped settings', () => {
    const initial = cloneRegistration();
    const p = { ...tileRegistration(initial, tile)['building-symbol'], x: 11 };
    const next = setPlacement(initial, tile, 'building-symbol', p);
    expect(next.faces.library.symbol.x).toBe(11);
    expect(next.faces.quarry).toEqual(initial.faces.quarry);
    expect(initial).toEqual(shippedRegistration);
    const score = setPlacement(next, tile, 'score-ink', {
      ...tileRegistration(next, tile)['score-ink'],
      y: 72
    });
    expect(score.scores.banner.ink.y).toBe(72);
    expect(score.scores.scroll).toEqual(initial.scores.scroll);
    expect(tileRegistration(score, { ...tile, id: 'other-physical-copy' })['score-ink'].y).toBe(72);
  });
  it('keeps reverse-art adjustments separate from Arch-front calibration', () => {
    const initial = cloneRegistration();
    const next = setPlacement(initial, tile, 'artwork', { ...initial.reverse.artwork, x: 2 }, true);
    expect(tileRegistration(next, tile, true).artwork.x).toBe(2);
    expect(next.faces).toEqual(initial.faces);
    expect(tileRegistration(next, { id: 'arch', building: 'arch' }).artwork.x).toBe(
      initial.faces.arch.artwork.x
    );
  });
  it('rejects corrupt or incompatible exports before they can enter an active view', () => {
    expect(() => parseRegistration({ ...cloneRegistration(), version: 2 })).toThrow('version');
    for (const value of [NaN, Infinity, -999, '12']) {
      const b = cloneRegistration();
      (b.faces.library.symbol as unknown as Record<string, unknown>).x = value;
      expect(() => parseRegistration(b)).toThrow('faces.library.symbol.x');
    }
    const b = cloneRegistration();
    b.scores.scroll.ink.width = 0;
    expect(() => parseRegistration(b)).toThrow('width');
    expect(() => parseRegistration({ version: 1 })).toThrow('faces');
  });
  it('reports actual layers for scoring, stacked, starting, Arch and reverse pieces', () => {
    expect(presentLayers(tile)).toEqual([
      'artwork',
      'building-symbol',
      'score-material',
      'score-ink',
      'plus'
    ]);
    expect(
      presentLayers({ id: 's', building: 'market', start: 'A', startCorner: 'top-right' })
    ).toEqual(['artwork', 'building-symbol', 'start-letter', 'start-arrow-top-right']);
    expect(
      presentLayers({ id: 'a', building: 'arch', arch: '222' }, false, 'domino', true)
    ).toEqual(['artwork', 'building-symbol', 'arch-value', 'protected']);
    expect(presentLayers(tile, true, 'battle')).toEqual(['artwork', 'back-mark']);
    expect(presentLayers(tile, true, 'domino')).toEqual(['artwork']);
  });
});
