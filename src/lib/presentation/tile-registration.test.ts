import { describe, expect, it } from 'vitest';
import {
  cloneRegistration,
  parseRegistration,
  presentLayers,
  setPlacement,
  shippedRegistration,
  tileRegistration
} from './tile-registration';
import { buildings, type TileData } from './types';

describe('shared tile layer registration', () => {
  const tile: TileData = {
    id: 'actual-face',
    building: 'library',
    score: { shape: 'banner', multiplier: 1, target: 'quarry' },
    plus: true
  };
  it('shares supplied calibration across families with the cloth banner ink adjustment', () => {
    expect(parseRegistration(JSON.parse(JSON.stringify(shippedRegistration)))).toEqual(
      shippedRegistration
    );
    const symbol = { x: 5, y: 5, width: 15, height: 15, rotation: 0, opacity: 1 };
    const material = { x: 0, y: 74, width: 100, height: 26, rotation: 0, opacity: 1 };
    const ink = { x: 25, y: 78, width: 55, height: 20, rotation: 0, opacity: 1 };
    for (const building of buildings) {
      expect(shippedRegistration.faces[building].symbol).toEqual(symbol);
      for (const shape of ['scroll', 'banner'] as const) {
        const expectedInk = { ...ink, y: shape === 'banner' ? 79.5 : 78 };
        const layout = tileRegistration(shippedRegistration, {
          id: `${building}-${shape}`,
          building,
          score: { shape, multiplier: 1, target: 'quarry' }
        });
        expect(layout['building-symbol']).toEqual(symbol);
        expect(layout['score-material']).toEqual(material);
        expect(layout['score-ink']).toEqual(expectedInk);
        expect(ink.x).toBeGreaterThanOrEqual(material.x);
        expect(ink.x + ink.width).toBeLessThanOrEqual(material.x + material.width);
        expect(expectedInk.y).toBeGreaterThanOrEqual(material.y);
        expect(expectedInk.y + expectedInk.height).toBeLessThanOrEqual(
          material.y + material.height
        );
      }
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
