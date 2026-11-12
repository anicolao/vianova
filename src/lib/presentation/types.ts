/** Presentation contracts. No legality, hidden deck, or scoring engine lives here. */
export const buildings = ['quarry', 'market', 'temple', 'barracks', 'library', 'arch'] as const;
export type Building = (typeof buildings)[number];
export type Owner = 'teal' | 'coral' | 'gold' | 'lilac';
export const owners: Owner[] = ['teal', 'coral', 'gold', 'lilac'];
export const buildingInfo: Record<Building, { name: string; action: string; color: string }> = {
  quarry: { name: 'Quarry', action: 'Take a domino', color: '#d8b64b' },
  market: { name: 'Market', action: 'Create a Soldier or Engineer', color: '#db8c40' },
  temple: { name: 'Temple', action: 'Upgrade a Soldier or Engineer', color: '#73a9c2' },
  barracks: { name: 'Barracks', action: 'Deploy a Soldier', color: '#b9564b' },
  library: { name: 'Library', action: 'Deploy an Engineer', color: '#7c9e69' },
  arch: { name: 'Arch', action: 'Activate adjacent buildings', color: '#a78cbd' }
};
export type ScoreMark = {
  shape: 'scroll' | 'banner';
  multiplier: number;
  target: Building | 'scroll' | 'banner' | 'pairs' | 'fixed';
};
export type TileData = {
  id: string;
  building: Building;
  score?: ScoreMark;
  arch?: '3' | '222';
  plus?: boolean;
  start?: 'A' | 'B' | 'C';
  startCorner?: 'top-right' | 'bottom-left';
};
export type DominoData = { id: string; tiles: [TileData, TileData]; double?: boolean };
export type Cell = { x: number; y: number; tile: TileData; covered?: TileData };
export type Person = { id: string; owner: Owner; value: 1 | 2; ownerLabel?: string };
export type Reward = { id: string; tiles: TileData[] };
export type Area = {
  id: string;
  kind: 'battle' | 'invention';
  label: string;
  people: Person[];
  rewards: Reward[];
};
export type PlayerView = {
  owner: Owner;
  name: string;
  reserve: Person[];
  soldiers: Person[];
  engineers: Person[];
  arches: number;
  handCount: number;
};
export type Focus = {
  cells?: string[];
  matches?: string[];
  scoring?: 'scroll' | 'banner';
  origin?: string;
};
export type ScoreRow = {
  owner: Owner;
  name: string;
  scrolls: number;
  banners: number;
  population: number;
};
export type SceneView = {
  viewer: Owner;
  city: Cell[];
  opponentCities: Partial<Record<Owner, Cell[]>>;
  scores: ScoreRow[];
  players: PlayerView[];
  areas: Area[];
  market: DominoData[];
  hand: DominoData[];
  active: Owner;
  supplies: [number, number, number];
  log: string[];
  final?: boolean;
  seats: { owner: Owner; position: 'north' | 'south' | 'east' | 'west' }[];
  rebuilds?: TileData[];
  startingDominos?: DominoData[];
};
export type GeneratedAction = {
  id: string;
  building: Building;
  count: number;
  available: boolean;
  reason?: string;
};
export type MotionSprite = {
  id: string;
  kind: 'tile' | 'person';
  tile?: TileData;
  person?: Person;
  from: string;
  to: string;
  label: string;
  progress: number;
};
/** Settled presentation plus optional sampled motion. No scenario IDs, beats or clock. */
export type GamePresentation = {
  view: SceneView;
  focus: Focus;
  actions?: GeneratedAction[];
  ordered?: boolean;
  context: 'city' | 'population' | 'contests';
  label: string;
  detail: string;
  motions: MotionSprite[];
};
export const ownerSymbols: Record<Owner, string> = { teal: '◆', coral: '●', gold: '▲', lilac: '✦' };
export const cellKey = (x: number, y: number) => `${x},${y}`;
export function scoreLabel(mark: ScoreMark) {
  const target =
    mark.target === 'fixed'
      ? 'points'
      : mark.target === 'pairs'
        ? 'scroll-and-banner pair'
        : mark.target;
  return mark.target === 'fixed' ? `${mark.multiplier} points` : `${mark.multiplier} per ${target}`;
}
