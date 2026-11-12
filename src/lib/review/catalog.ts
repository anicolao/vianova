import {
  buildings,
  owners,
  type TileData,
  type DominoData,
  type Person,
  type ScoreMark
} from '../presentation/types';
import { tile, domino, person } from './fixtures';
export type Category = 'buildings' | 'dominos' | 'population' | 'scoring' | 'boards' | 'interface';
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
};
export const categories: { id: Category; name: string; subtitle: string }[] = [
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
          : 'Distinct silhouette, color field, and building name.',
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
  ...(['A', 'B', 'C'] as const).map(
    (letter, i): GalleryItem => ({
      id: `start-${letter}`,
      title: `Starting tile ${letter}`,
      category: 'dominos',
      kind: 'domino',
      renderer: 'Domino → Tile',
      description: 'Dotted edge and start label. Exact start layout awaits component manifest.',
      domino: {
        id: `start-${letter}`,
        tiles: [
          tile((['quarry', 'library', 'market'] as const)[i], `start-${letter}-0`, {
            start: letter
          }),
          tile((['market', 'barracks', 'quarry'] as const)[i], `start-${letter}-1`, {
            start: letter
          })
        ]
      }
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
