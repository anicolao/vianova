import defaults from './tile-registration.json' with { type: 'json' };
import { buildings, type Building, type TileData } from './types';

/** Percent of the full tile, rotation in degrees, opacity 0–1. No scenario semantics. */
export type LayerPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};
export const markLayers = [
  'arch-value',
  'start-letter',
  'start-arrow-top-right',
  'start-arrow-bottom-left',
  'plus',
  'back-mark',
  'protected'
] as const;
export const tileLayers = [
  'artwork',
  'building-symbol',
  'score-material',
  'score-ink',
  ...markLayers
] as const;
export type TileLayer = (typeof tileLayers)[number];
export type TileRegistration = Record<TileLayer, LayerPlacement>;
export type RegistrationBook = {
  version: 1;
  reverse: { artwork: LayerPlacement };
  faces: Record<Building, { artwork: LayerPlacement; symbol: LayerPlacement }>;
  scores: Record<'scroll' | 'banner', { material: LayerPlacement; ink: LayerPlacement }>;
  marks: Record<(typeof markLayers)[number], LayerPlacement>;
};
/** Optional shared layer inspection, also usable by production component inspectors. */
export type LayerPresentation = {
  active?: TileLayer;
  hidden?: TileLayer[];
  guides?: boolean;
  separation?: number;
  order?: readonly TileLayer[];
};
export const registrationContext = Symbol('Via Nova tile registration');
export const layerNames: Record<TileLayer, string> = {
  artwork: 'Mosaic face and stone edge',
  'building-symbol': 'Building emblem',
  'score-material': 'Scoring plaque',
  'score-ink': 'Scoring ink',
  'arch-value': 'Arch actions',
  'start-letter': 'Starting letter',
  'start-arrow-top-right': 'Upper-right assembly arrow',
  'start-arrow-bottom-left': 'Lower-left assembly arrow',
  plus: 'Stacked reward +',
  'back-mark': 'Reverse identity',
  protected: 'Permanent label'
};
export const limits = {
  x: [-50, 150],
  y: [-50, 150],
  width: [1, 200],
  height: [1, 200],
  rotation: [-180, 180],
  opacity: [0, 1]
} as const;
export function parseRegistration(value: unknown): RegistrationBook {
  const object = (v: unknown, path: string): Record<string, unknown> => {
    if (!v || typeof v !== 'object' || Array.isArray(v))
      throw new Error(`${path} must be an object`);
    return v as Record<string, unknown>;
  };
  const placement = (v: unknown, path: string): LayerPlacement => {
    const p = object(v, path),
      next = {} as LayerPlacement;
    for (const key of Object.keys(limits) as (keyof LayerPlacement)[]) {
      const n = p[key],
        [min, max] = limits[key];
      if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max)
        throw new Error(`${path}.${key} must be ${min}–${max}`);
      next[key] = n;
    }
    return next;
  };
  const root = object(value, 'Registration');
  if (root.version !== 1) throw new Error('Registration version must be 1');
  const faces = object(root.faces, 'faces'),
    scores = object(root.scores, 'scores'),
    marks = object(root.marks, 'marks');
  return {
    version: 1,
    reverse: { artwork: placement(object(root.reverse, 'reverse').artwork, 'reverse.artwork') },
    faces: Object.fromEntries(
      buildings.map((b) => {
        const f = object(faces[b], `faces.${b}`);
        return [
          b,
          {
            artwork: placement(f.artwork, `faces.${b}.artwork`),
            symbol: placement(f.symbol, `faces.${b}.symbol`)
          }
        ];
      })
    ) as RegistrationBook['faces'],
    scores: Object.fromEntries(
      (['scroll', 'banner'] as const).map((s) => {
        const f = object(scores[s], `scores.${s}`);
        return [
          s,
          {
            material: placement(f.material, `scores.${s}.material`),
            ink: placement(f.ink, `scores.${s}.ink`)
          }
        ];
      })
    ) as RegistrationBook['scores'],
    marks: Object.fromEntries(
      markLayers.map((k) => [k, placement(marks[k], `marks.${k}`)])
    ) as RegistrationBook['marks']
  };
}
export const shippedRegistration = parseRegistration(defaults);
export const cloneRegistration = (book: RegistrationBook = shippedRegistration): RegistrationBook =>
  parseRegistration(book);
export function tileRegistration(
  book: RegistrationBook,
  tile?: TileData,
  back = false
): TileRegistration {
  const face = book.faces[tile?.building ?? 'arch'],
    score = book.scores[tile?.score?.shape ?? 'scroll'];
  return {
    artwork: back ? book.reverse.artwork : face.artwork,
    'building-symbol': face.symbol,
    'score-material': score.material,
    'score-ink': score.ink,
    ...book.marks
  };
}
export function setPlacement(
  book: RegistrationBook,
  tile: TileData,
  layer: TileLayer,
  placement: LayerPlacement,
  back = false
): RegistrationBook {
  const next = cloneRegistration(book);
  if (layer === 'artwork' && back) next.reverse.artwork = { ...placement };
  else if (layer === 'artwork' || layer === 'building-symbol')
    next.faces[tile.building][layer === 'artwork' ? 'artwork' : 'symbol'] = { ...placement };
  else if (layer === 'score-material' || layer === 'score-ink')
    next.scores[tile.score?.shape ?? 'scroll'][layer === 'score-material' ? 'material' : 'ink'] = {
      ...placement
    };
  else next.marks[layer] = { ...placement };
  return parseRegistration(next);
}
export function presentLayers(
  tile?: TileData,
  back = false,
  backKind = 'domino',
  protectedArch = false
): TileLayer[] {
  if (back) return backKind === 'domino' ? ['artwork'] : ['artwork', 'back-mark'];
  if (!tile) return [];
  const present: TileLayer[] = [
    'artwork',
    'building-symbol',
    ...(tile.start ? (['start-letter'] as const) : []),
    ...(tile.startCorner ? [`start-arrow-${tile.startCorner}` as TileLayer] : []),
    ...(tile.score ? (['score-material', 'score-ink'] as const) : []),
    ...(tile.arch ? (['arch-value'] as const) : []),
    ...(tile.plus ? (['plus'] as const) : []),
    ...(protectedArch && tile.building === 'arch' ? (['protected'] as const) : [])
  ];
  return tileLayers.filter((layer) => present.includes(layer));
}
export const placementCSS = (p: LayerPlacement) =>
  `left:${p.x}%;top:${p.y}%;width:${p.width}%;height:${p.height}%;--layer-rotation:${p.rotation}deg;opacity:${p.opacity}`;
