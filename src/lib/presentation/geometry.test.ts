import { describe, it, expect } from 'vitest';
import { cityGeometry, dominoCells } from './geometry';
import { tile, domino } from '../review/fixtures';
describe('shared signed placement geometry', () => {
  it('keeps negative buildings and a two-space growth margin on every edge', () => {
    const g = cityGeometry(
      [
        { x: -3, y: -4, tile: tile('temple') },
        { x: 2, y: 1, tile: tile('market') }
      ],
      [],
      true
    );
    expect(g).toMatchObject({ minX: -5, minY: -6, maxX: 4, maxY: 3 });
    expect(g.coords).toContainEqual({ x: -3, y: -4 });
  });
  it('uses the same four signed rotations for ghosts and commands', () => {
    const d = domino('market', 'temple');
    for (const [r, expected] of [
      [0, { x: 0, y: -1 }],
      [1, { x: -1, y: 0 }],
      [2, { x: -2, y: -1 }],
      [3, { x: -1, y: -2 }]
    ] as const) {
      const placed = dominoCells(d, { x: -1, y: -1 }, r);
      expect(placed[1]).toMatchObject(expected);
      const g = cityGeometry([], placed, true);
      expect(g.coords).toContainEqual(expected);
      expect(placed[0].tile.id).toBe(d.tiles[0].id);
    }
  });
  it('renders empty and compact cities without throwing or shifting anchor coordinates', () => {
    expect(cityGeometry([], [], true).coords).toContainEqual({ x: -2, y: -2 });
    expect(cityGeometry([{ x: -5, y: 3, tile: tile('arch') }])).toMatchObject({
      width: 1,
      height: 1,
      minX: -5,
      minY: 3
    });
  });
});
