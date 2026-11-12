import type { Cell, DominoData, TileData } from './types';
export type Point = { x: number; y: number };
/** One rotation convention for previews, commands, and committed placement. */
export function dominoCells(domino: DominoData, origin: Point, rotation: number): Cell[] {
  const r = ((rotation % 4) + 4) % 4;
  const offsets = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 }
  ];
  return [
    { ...origin, tile: domino.tiles[0] },
    { x: origin.x + offsets[r].x, y: origin.y + offsets[r].y, tile: domino.tiles[1] }
  ];
}
export function cityGeometry(cells: Cell[], ghosts: Cell[] = [], editable = false) {
  const points = [...cells, ...ghosts];
  const margin = editable ? 2 : 0;
  const minX = (points.length ? Math.min(...points.map((p) => p.x)) : 0) - margin;
  const maxX = (points.length ? Math.max(...points.map((p) => p.x)) : 0) + margin;
  const minY = (points.length ? Math.min(...points.map((p) => p.y)) : 0) - margin;
  const maxY = (points.length ? Math.max(...points.map((p) => p.y)) : 0) + margin;
  const width = maxX - minX + 1,
    height = maxY - minY + 1;
  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    coords: Array.from({ length: width * height }, (_, i) => ({
      x: minX + (i % width),
      y: minY + Math.floor(i / width)
    }))
  };
}
export function placementGhost(
  domino: DominoData | undefined,
  arch: TileData | undefined,
  origin: Point | null,
  rotation: number
): Cell[] {
  return !origin
    ? []
    : domino
      ? dominoCells(domino, origin, rotation)
      : arch
        ? [{ ...origin, tile: arch }]
        : [];
}
