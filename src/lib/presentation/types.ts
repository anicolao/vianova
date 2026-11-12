/** Presentation contracts. No legality, hidden deck, or scoring engine lives here. */
export const buildings = ['quarry', 'market', 'temple', 'barracks', 'library', 'arch'] as const;
export type Building = (typeof buildings)[number];
export type Owner = 'teal' | 'coral' | 'gold' | 'lilac';
export const owners: Owner[] = ['teal', 'coral', 'gold', 'lilac'];
export const names: Record<Owner, string> = {
  teal: 'Aurelia',
  coral: 'Cassius',
  gold: 'Livia',
  lilac: 'Marcus'
};
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
};
export type MotionCue = {
  id: string;
  kind: 'tile' | 'person';
  tile?: TileData;
  person?: Person;
  from: string;
  to: string;
  start: number;
  end: number;
  label: string;
};
export type Beat = {
  at: number;
  label: string;
  detail: string;
  focus?: Focus;
  patch?: (view: SceneView) => void;
};
export type Scenario = {
  id: string;
  group: string;
  title: string;
  description: string;
  duration: number;
  beats: Beat[];
  motions: MotionCue[];
  fixture: () => SceneView;
};
export type Frame = {
  sceneId: string;
  context: 'city' | 'population' | 'contests';
  actions?: { id: string; building: Building; count: number; available: boolean }[];
  ordered?: boolean;
  view: SceneView;
  focus: Focus;
  beat: number;
  label: string;
  detail: string;
  motions: (MotionCue & { progress: number })[];
  progress: number;
};
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
