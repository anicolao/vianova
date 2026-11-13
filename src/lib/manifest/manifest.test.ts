import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  archTiles,
  battleTiles,
  gameDominos,
  inventionTiles,
  manifest,
  singleTiles,
  startingCity,
  startingDominos
} from './index';
import { buildings } from '../presentation/types';
import { galleryItems } from '../review/catalog';

describe('designer v56 manifest', () => {
  it('regenerates byte for byte from the supplied workbook and source hashes', () => {
    expect(
      execFileSync('python3', ['scripts/import-manifest.py', '--check'], { encoding: 'utf8' })
    ).toContain('matches source files');
  });
  it('retains every physical piece, value, scoring condition, mark and provenance', () => {
    expect([
      gameDominos.length,
      startingDominos.length,
      archTiles.length,
      battleTiles.length,
      inventionTiles.length
    ]).toEqual([48, 12, 20, 26, 22]);
    const faces = [
      ...gameDominos.flatMap((d) => d.tiles),
      ...startingDominos.flatMap((d) => d.tiles),
      ...singleTiles
    ];
    expect(new Set(faces.map((t) => t.id)).size).toBe(188);
    for (const t of faces) {
      expect(buildings).toContain(t.building);
      if (t.score) {
        expect(['scroll', 'banner']).toContain(t.score.shape);
        expect([...buildings, 'banner', 'scroll', 'pairs', 'fixed']).toContain(t.score.target);
        expect([1, 2, 3]).toContain(t.score.multiplier);
      }
    }
    const counts = Object.fromEntries(
      buildings.map((b) => [
        b,
        gameDominos.flatMap((d) => d.tiles).filter((t) => t.building === b).length
      ])
    );
    expect(counts).toEqual({
      quarry: 17,
      market: 18,
      temple: 17,
      barracks: 18,
      library: 18,
      arch: 8
    });
    expect(battleTiles.filter((t) => t.plus)).toHaveLength(10);
    expect(inventionTiles.filter((t) => t.plus)).toHaveLength(4);
    expect(gameDominos.filter((d) => d.double)).toHaveLength(13);
    expect(gameDominos[25].tiles[1].score).toEqual({
      shape: 'scroll',
      multiplier: 3,
      target: 'fixed'
    });
    expect(battleTiles[25].source.assets.G).toBe('science_tile_back.pdf');
    expect(inventionTiles[3].source.assets.G).toBe('battle_tile_back.pdf');
    for (const piece of [...gameDominos, ...startingDominos, ...singleTiles]) {
      expect(piece.source.row).toBeGreaterThan(1);
      expect(piece.source.page).toBeGreaterThan(0);
    }
  });
  it('assembles exact A/B/C city and all four board allocations without colour-dependent order', () => {
    expect(startingCity().map((c) => `${c.x},${c.y}:${c.tile.building}`)).toEqual([
      '0,3:quarry',
      '1,3:market',
      '2,2:barracks',
      '2,1:library',
      '3,0:market',
      '4,0:quarry'
    ]);
    for (const b of manifest.playerBoards)
      expect(b.soldiers + b.engineers + b.reserve + 4).toBe(16);
    expect(manifest.playerBoards.map((b) => [b.soldiers, b.engineers, b.reserve])).toEqual([
      [2, 3, 7],
      [3, 3, 6],
      [4, 3, 5],
      [4, 4, 4]
    ]);
    expect(manifest.population.total).toBe(64);
    expect(startingCity(4).map((c) => c.tile.id)).not.toEqual(startingCity().map((c) => c.tile.id));
  });
  it('exposes every game domino and rebuild through the same gallery renderers', () => {
    for (const d of gameDominos) expect(galleryItems.find((i) => i.id === d.id)?.domino).toBe(d);
    for (const t of [...battleTiles, ...inventionTiles])
      expect(galleryItems.find((i) => i.id === t.id)?.tile).toBe(t);
  });
});
