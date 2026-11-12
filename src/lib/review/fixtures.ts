import {
  type Area,
  type Building,
  type Cell,
  type DominoData,
  type Owner,
  type Person,
  type SceneView,
  type TileData,
  owners,
  names
} from '../presentation/types';
export const tile = (
  building: Building,
  id: string = building,
  extra: Partial<TileData> = {}
): TileData => ({ id, building, ...extra });
export const domino = (a: Building, b: Building, id = `${a}-${b}`, double = false): DominoData => ({
  id,
  tiles: [tile(a, `${id}-a`, a === 'arch' ? { arch: '3' } : {}), tile(b, `${id}-b`)],
  double
});
export const person = (owner: Owner, value: 1 | 2, id: string): Person => ({
  id,
  owner,
  value,
  ownerLabel: names[owner]
});
export function cityFixture(): Cell[] {
  const rows: Building[][] = [
    ['market', 'quarry', 'temple', 'library'],
    ['quarry', 'market', 'barracks', 'temple'],
    ['library', 'temple', 'arch', 'market'],
    ['barracks', 'library', 'quarry']
  ];
  return rows.flatMap((row, y) =>
    row.map((b, x) => ({
      x,
      y,
      tile: tile(
        b,
        `city-${x}-${y}`,
        b === 'arch'
          ? { arch: '222' }
          : x === 0 && y === 0
            ? { start: 'A' }
            : x === 1 && y === 0
              ? { start: 'A' }
              : x === 1 && y === 1
                ? { score: { shape: 'scroll', multiplier: 1, target: 'temple' } }
                : x === 0 && y === 3
                  ? { score: { shape: 'banner', multiplier: 2, target: 'arch' } }
                  : x === 3 && y === 1
                    ? { score: { shape: 'banner', multiplier: 1, target: 'banner' } }
                    : {}
      )
    }))
  );
}
export function fixture(): SceneView {
  const area = (kind: 'battle' | 'invention', i: number): Area => ({
    id: `${kind}-${i}`,
    kind,
    label: `${kind === 'battle' ? 'Battle' : 'Invention'} ${i + 1}`,
    people: [
      person('teal', 2, `${kind}${i}-t1`),
      person('teal', 1, `${kind}${i}-t2`),
      person('coral', 2, `${kind}${i}-c1`),
      person('gold', 1, `${kind}${i}-g1`)
    ],
    rewards: [
      {
        id: `${kind}${i}-r0`,
        tiles: [
          tile(i === 0 ? 'temple' : 'quarry', `${kind}${i}-rt0`, {
            score: {
              shape: kind === 'battle' ? 'banner' : 'scroll',
              multiplier: 1,
              target: kind === 'battle' ? 'temple' : 'quarry'
            },
            plus: kind === 'battle' && i === 0
          }),
          ...(kind === 'battle' && i === 0
            ? [
                tile('library', 'stacked-library', {
                  score: { shape: 'banner', multiplier: 3, target: 'fixed' }
                })
              ]
            : [])
        ]
      },
      {
        id: `${kind}${i}-r1`,
        tiles: [
          tile(i === 0 ? 'market' : 'barracks', `${kind}${i}-rt1`, {
            score: {
              shape: kind === 'battle' ? 'banner' : 'scroll',
              multiplier: 3,
              target: kind === 'battle' ? 'pairs' : 'fixed'
            }
          })
        ]
      }
    ]
  });
  return {
    viewer: 'teal',
    city: cityFixture(),
    opponentCities: {
      coral: cityFixture().slice(0, 7),
      gold: cityFixture().slice(0, 7),
      lilac: cityFixture().slice(0, 6)
    },
    scores: [
      { owner: 'teal', name: names.teal, scrolls: 18, banners: 24, population: 6 },
      { owner: 'coral', name: names.coral, scrolls: 21, banners: 17, population: 5 },
      { owner: 'gold', name: names.gold, scrolls: 16, banners: 18, population: 4 },
      { owner: 'lilac', name: names.lilac, scrolls: 19, banners: 14, population: 3 }
    ],
    active: 'teal',
    supplies: [24, 15, 12],
    market: [
      domino('quarry', 'temple', 'm0'),
      domino('market', 'library', 'm1'),
      domino('barracks', 'quarry', 'm2', true),
      domino('arch', 'market', 'm3', true),
      domino('library', 'temple', 'm4')
    ],
    hand: [
      domino('market', 'temple', 'h0'),
      domino('library', 'quarry', 'h1'),
      domino('arch', 'barracks', 'h2', true)
    ],
    players: owners.map((owner, i) => ({
      owner,
      name: names[owner],
      reserve: Array.from({ length: owner === 'teal' ? 5 : owner === 'lilac' ? 13 : 9 }, (_, j) =>
        person(owner, 1, `${owner}-reserve-${j}`)
      ),
      soldiers: [person(owner, 1, `${owner}-soldier-0`), person(owner, 2, `${owner}-soldier-1`)],
      engineers: [person(owner, 1, `${owner}-engineer-0`)],
      arches: 5 - i,
      handCount: 3
    })),
    areas: [area('battle', 0), area('battle', 1), area('invention', 0), area('invention', 1)],
    log: [
      'Aurelia matched a Temple edge.',
      'Cassius deployed a Soldier to Battle 1.',
      'Livia took two dominos.'
    ]
  };
}
export const fullCity = (): Cell[] => [
  ...cityFixture(),
  ...Array.from({ length: 16 }, (_, i) => ({
    x: (i % 4) + 4,
    y: Math.floor(i / 4),
    tile: tile(
      (['temple', 'market', 'library', 'quarry', 'barracks', 'arch'] as Building[])[i % 6],
      `late-${i}`,
      i % 6 === 5
        ? { arch: '3' }
        : i % 3 === 0
          ? { score: { shape: i % 2 ? 'scroll' : 'banner', multiplier: 1, target: 'market' } }
          : {}
    )
  })),
  {
    x: 0,
    y: 5,
    tile: tile('temple', 'across-gap', {
      score: { shape: 'banner', multiplier: 1, target: 'temple' }
    })
  }
];
