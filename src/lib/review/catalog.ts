import { gameDominos, startingDominos, battleTiles, inventionTiles } from '../manifest';
import {
  buildings,
  owners,
  type TileData,
  type DominoData,
  type Person,
  type ScoreMark
} from '../presentation/types';
import { tile, domino, person } from './fixtures';
export type Category =
  | 'buildings'
  | 'dominos'
  | 'population'
  | 'scoring'
  | 'boards'
  | 'interface'
  | 'inventory-dominos'
  | 'inventory-battle'
  | 'inventory-invention'
  | 'setup';
export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: Category;
  renderer: string;
  kind: 'tile' | 'domino' | 'person' | 'mark' | 'board' | 'ui';
  tile?: TileData;
  domino?: DominoData;
  person?: Person;
  mark?: ScoreMark;
  variant?: string;
  setupOrder?: number;
};
export const categories: { id: Category; name: string; subtitle: string }[] = [
  {
    id: 'inventory-dominos',
    name: '48 game dominos',
    subtitle: 'Every physical domino, in designer workbook order.'
  },
  {
    id: 'inventory-battle',
    name: '26 Battle rebuilds',
    subtitle: 'Every Battle front, including ten + tiles.'
  },
  {
    id: 'inventory-invention',
    name: '22 Invention rebuilds',
    subtitle: 'Every Invention front, including four + tiles.'
  },
  {
    id: 'setup',
    name: 'Starting components',
    subtitle: 'A/B/C copies, exact six-space city and turn-order allocations.'
  },
  {
    id: 'buildings',
    name: 'Buildings & Arches',
    subtitle: 'Six building families, permanent Arches, and rebuild layers.'
  },
  {
    id: 'dominos',
    name: 'Dominos & supplies',
    subtitle: 'The market, marked tiles, starting pieces, and concealed supplies.'
  },
  {
    id: 'population',
    name: 'Population',
    subtitle: 'Four player identities, each with 1 and 2 population faces.'
  },
  {
    id: 'scoring',
    name: 'Scrolls & banners',
    subtitle: 'Every scoring condition illustrated in the v56 scoring key.'
  },
  {
    id: 'boards',
    name: 'Boards & rewards',
    subtitle: 'Shared contests, population wells, player boards, and stacked rewards.'
  },
  {
    id: 'interface',
    name: 'Play & privacy',
    subtitle: 'Production presentation components composed into game decisions.'
  }
];
export const galleryItems: GalleryItem[] = [
  ...gameDominos.map(
    (d): GalleryItem => ({
      id: d.id,
      title: `Domino ${d.source.index} · ${d.tiles.map((t) => t.building).join(' / ')}`,
      category: 'inventory-dominos',
      kind: 'domino',
      renderer: 'Domino → Tile → BuildingArt + BuildingSymbol',
      domino: d,
      description: `${d.double ? 'Marked · costs 2' : 'Unmarked · costs 1'}. Physical copy ${d.source.index}/48. Workbook dominos row ${d.source.row}; PDF p${d.source.page}, row ${d.source.gridRow}, column ${d.source.gridColumn}.`
    })
  ),
  ...[...battleTiles, ...inventionTiles].map(
    (t): GalleryItem => ({
      id: t.id,
      title: `${t.back === 'battle' ? 'Battle' : 'Invention'} ${t.id.slice(-2)} · ${t.building}${t.plus ? ' +' : ''}`,
      category: t.back === 'battle' ? 'inventory-battle' : 'inventory-invention',
      kind: 'tile',
      renderer: 'Tile → BuildingArt + BuildingSymbol + ScoreSymbol',
      tile: t,
      description: `Physical tile · ${t.score?.shape}. Workbook single tiles row ${t.source.row}; PDF p${t.source.page}, row ${t.source.gridRow}, column ${t.source.gridColumn}.${t.source.row === 47 || t.source.row === 51 ? ' Conflicting print-back metadata documented in manifest.' : ''}`
    })
  ),
  ...(['A', 'B', 'C'] as const).flatMap((letter) => {
    const copies = startingDominos.filter((d) => d.back === `start-${letter}`);
    return [false, true].map(
      (back): GalleryItem => ({
        id: `start-${letter}${back ? '-back' : ''}`,
        title: `Starting ${letter}${back ? ' reverse' : ' front'} · 4 copies`,
        category: 'setup',
        kind: 'domino',
        renderer: 'Domino → Tile',
        domino: copies[0],
        variant: back ? 'back' : undefined,
        description: `${copies.map((d) => d.id).join(', ')}. ${copies[0].tiles.map((t) => t.building).join(' / ')}. Source dominos rows ${copies[0].source.row}–${copies.at(-1)!.source.row}. Arrows show assembly corners.`
      })
    );
  }),
  {
    id: 'starting-city',
    title: 'Exact starting city',
    category: 'setup',
    kind: 'board',
    renderer: 'CityBoard → Tile',
    variant: 'starting-city',
    description:
      'Rules p3: A Quarry/Market at (0,3)/(1,3); B Barracks/Library at (2,2)/(2,1); C Market/Quarry at (3,0)/(4,0). Four copies of this six-space layout.'
  },
  ...[1, 2, 3, 4].map(
    (n): GalleryItem => ({
      id: `setup-board-${n}`,
      title: `Turn order ${n} setup`,
      category: 'setup',
      kind: 'board',
      renderer: 'PlayerMat',
      setupOrder: n,
      variant: owners[n - 1],
      description: `${[2, 3, 4, 4][n - 1]} Soldiers; ${[3, 3, 3, 4][n - 1]} Engineers; ${[7, 6, 5, 4][n - 1]} reserve; one population in each of four areas; five Arches. All population begins value 1. Board order is independent of colour.`
    })
  ),
  ...(['battle', 'invention'] as const).map((kind) => ({
    id: `${kind}-back`,
    title: `${kind} reverse`,
    category: 'dominos' as const,
    kind: 'tile' as const,
    renderer: 'Tile',
    variant: `${kind}-back`,
    description:
      'Distinct supply symbol on a generated navy mosaic reverse. Logical back follows the manifest, including documented print-file discrepancies.'
  })),
  ...buildings.map(
    (b): GalleryItem => ({
      id: `building-${b}`,
      category: 'buildings',
      kind: 'tile',
      renderer: 'Tile → BuildingArt',
      title: b[0].toUpperCase() + b.slice(1),
      description:
        b === 'arch'
          ? 'Purple · permanent · cannot be covered.'
          : 'Generated mosaic building, tactile stone edge and shared monochrome identity symbol.',
      tile: tile(b, `building-${b}`)
    })
  ),
  {
    id: 'arch-three',
    category: 'buildings',
    kind: 'tile',
    renderer: 'Tile',
    title: 'Domino Arch · 3',
    description: 'Three actions from one adjacent building.',
    tile: tile('arch', 'arch-three', { arch: '3' })
  },
  {
    id: 'arch-line',
    category: 'buildings',
    kind: 'tile',
    renderer: 'Tile',
    title: 'Single Arch · 2 2 2',
    description: 'Two actions from each of the next three spaces, in order.',
    tile: tile('arch', 'arch-line', { arch: '222' })
  },
  {
    id: 'rebuild-scroll',
    category: 'buildings',
    kind: 'tile',
    renderer: 'Tile → ScoreSymbol',
    title: 'Invention rebuild',
    description: 'A visible scroll scores a centered 3×3 neighborhood.',
    tile: tile('library', 'invention-scroll', {
      score: { shape: 'scroll', multiplier: 1, target: 'library' }
    })
  },
  {
    id: 'rebuild-banner',
    category: 'buildings',
    kind: 'tile',
    renderer: 'Tile → ScoreSymbol',
    title: 'Battle rebuild',
    description: 'A banner scores its complete row and column.',
    tile: tile('barracks', 'battle-banner', {
      score: { shape: 'banner', multiplier: 3, target: 'pairs' }
    })
  },
  ...[domino('market', 'temple', 'ordinary'), domino('arch', 'library', 'marked', true)].map(
    (d): GalleryItem => ({
      id: `domino-${d.id}`,
      title: d.double ? 'Marked domino' : 'Ordinary domino',
      category: 'dominos',
      kind: 'domino',
      renderer: 'Domino → Tile',
      description: d.double
        ? 'Two market actions; one hand slot.'
        : 'Two connected building spaces; rotate together.',
      domino: d
    })
  ),
  {
    id: 'domino-back',
    title: 'Domino back',
    category: 'dominos',
    kind: 'domino',
    renderer: 'Domino',
    description: 'Conceals both building identities.',
    variant: 'back'
  },
  ...(['dominos', 'battle', 'invention'] as const).map(
    (kind): GalleryItem => ({
      id: `supply-${kind}`,
      title: `${kind[0].toUpperCase() + kind.slice(1)} supply`,
      category: 'dominos',
      kind: 'ui',
      renderer: 'SupplyDeck',
      variant: kind,
      description: 'Face-down supply with a public remaining count.'
    })
  ),
  {
    id: 'empty-supply',
    title: 'Exhausted supply',
    category: 'dominos',
    kind: 'ui',
    renderer: 'SupplyDeck',
    variant: 'empty-supply',
    description: 'An empty supply starts the final-turn sequence.'
  },
  {
    id: 'arch-supply',
    title: 'Five single Arches',
    category: 'dominos',
    kind: 'ui',
    renderer: 'Tile',
    variant: 'arches',
    description: 'Each player begins with five permanent Arch tiles.'
  },
  ...owners.flatMap((owner) =>
    [1, 2].map(
      (value): GalleryItem => ({
        id: `population-${owner}-${value}`,
        title: `${owner[0].toUpperCase() + owner.slice(1)} · ${value}`,
        category: 'population',
        kind: 'person',
        renderer: 'Population',
        description: 'Ownership has a color and a shape label on the player board.',
        person: person(owner, value as 1 | 2, `${owner}-${value}`)
      })
    )
  ),
  ...(['scroll', 'banner'] as const).flatMap((shape) =>
    [
      ...buildings.map(
        (target): ScoreMark => ({ shape, target, multiplier: target === 'arch' ? 2 : 1 })
      ),
      { shape, target: shape, multiplier: shape === 'scroll' ? 2 : 1 } as ScoreMark,
      { shape, target: 'pairs', multiplier: 3 } as ScoreMark,
      { shape, target: 'fixed', multiplier: 3 } as ScoreMark,
      ...(shape === 'banner' ? [{ shape, target: 'fixed', multiplier: 1 } as ScoreMark] : [])
    ].map(
      (mark): GalleryItem => ({
        id: `${shape}-${mark.target}-${mark.multiplier}`,
        title: `${shape[0].toUpperCase() + shape.slice(1)} · ${mark.target}`,
        category: 'scoring',
        kind: 'mark',
        renderer: 'ScoreSymbol + Tile',
        mark,
        description:
          shape === 'scroll'
            ? 'Centered 3×3, including this tile.'
            : 'Entire row and column, including across gaps.'
      })
    )
  ),
  ...(['battle', 'invention'] as const).map((kind) => ({
    id: `board-${kind}`,
    category: 'boards' as const,
    kind: 'board' as const,
    renderer: 'ContestBoard',
    title: `${kind === 'battle' ? 'Battle' : 'Invention'} board`,
    variant: kind,
    description: 'Two independent areas, two reward slots in each, qualify at 3.'
  })),
  {
    id: 'reward-stack',
    category: 'boards',
    kind: 'board',
    renderer: 'RewardStack',
    title: 'Stacked + reward',
    variant: 'reward',
    description: 'Both scoring panels remain visible. Claim both tiles.'
  },
  ...owners.map(
    (owner): GalleryItem => ({
      id: `mat-${owner}`,
      category: 'boards',
      kind: 'board',
      renderer: 'PlayerMat',
      title: `${owner[0].toUpperCase() + owner.slice(1)} player board`,
      variant: owner,
      description: 'Reserve, ready Soldiers and Engineers, Arch count, and public hand count.'
    })
  ),
  {
    id: 'city',
    category: 'boards',
    kind: 'board',
    renderer: 'CityBoard',
    title: 'A growing city',
    variant: 'city',
    description: 'Square geometry, matching edges, zoom, and permanent Arches.'
  },
  ...[
    {
      id: 'market',
      title: 'Five-domino market',
      renderer: 'DominoMarket',
      description: 'Public choices with marked costs and turn-end refill.'
    },
    {
      id: 'hand',
      title: 'Private hand',
      renderer: 'PrivateHand',
      description: 'Tap to select a domino. Never expose an unplayed hand on the table.'
    },
    {
      id: 'concealed',
      title: 'Tabletop privacy',
      renderer: 'PrivateHand',
      description: 'Companion-phone prompt replaces the public hand.'
    },
    {
      id: 'start-choice',
      title: 'Starting-hand selection',
      renderer: 'StartingChoice',
      description: 'Select a value of exactly four from five drawn dominos.'
    },
    {
      id: 'action-queue',
      title: 'Generated action queue',
      renderer: 'ActionQueue',
      description: 'Matching actions can be chosen in order, or skipped.'
    },
    {
      id: 'actions',
      title: 'Turn controls',
      renderer: 'TurnControls',
      description: 'Four turn options and direct placement controls.'
    },
    {
      id: 'score-sheet',
      title: 'Final score',
      renderer: 'ScoreSheet',
      description: 'Illustrative totals with a visible tie rule.'
    },
    {
      id: 'chronicle',
      title: 'Chronicle',
      renderer: 'GameLog',
      description: 'Readable public action history without private draw identities.'
    }
  ].map((item): GalleryItem => ({ ...item, category: 'interface', kind: 'ui', variant: item.id }))
];
