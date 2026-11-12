/** Verified v56 inventory. Source metadata is retained alongside presentation data. */
import data from './v56.json' with { type: 'json' };
import type { Cell, DominoData, TileData } from '../presentation/types';
import { dominoCells } from '../presentation/geometry';
export type Source = {
  sheet: string;
  row: number;
  index: number;
  pdf: string;
  page: number;
  gridRow: number;
  gridColumn: number;
  assets: Record<string, string>;
};
export type ManifestDomino = DominoData & { back: string; source: Source };
export type ManifestTile = TileData & { back: 'battle' | 'invention' | null; source: Source };
export const manifest = data;
export const gameDominos = data.dominos as unknown as ManifestDomino[];
export const startingDominos = data.startingDominos as unknown as ManifestDomino[];
export const singleTiles = data.singleTiles as ManifestTile[];
export const battleTiles = singleTiles.filter((t) => t.back === 'battle');
export const inventionTiles = singleTiles.filter((t) => t.back === 'invention');
export const archTiles = singleTiles.filter((t) => !t.back);
export function startingCity(copy = 1): Cell[] {
  return data.setup.startingLayout.flatMap((p) => {
    const d = startingDominos.filter((d) => d.back === `start-${p.group}`)[copy - 1];
    if (!d) throw new Error('Starting copy must be 1–4');
    return dominoCells(d, { x: p.origin[0], y: p.origin[1] }, p.rotation);
  });
}
