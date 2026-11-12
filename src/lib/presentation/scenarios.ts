import { fixture, tile, domino, person, fullCity } from '../review/fixtures';
import type { Scenario, SceneView, Beat, MotionCue, Frame } from './types';
const beat = (
  at: number,
  label: string,
  detail: string,
  patch?: (view: SceneView) => void,
  focus?: Beat['focus']
): Beat => ({ at, label, detail, patch, focus });
const p = (value: 1 | 2 = 1) => person('teal', value, 'traveler');
const move = (
  id: string,
  kind: 'tile' | 'person',
  from: string,
  to: string,
  start: number,
  end: number,
  label: string,
  extra: Partial<MotionCue> = {}
): MotionCue => ({ id, kind, from, to, start, end, label, ...extra });
const addLog = (view: SceneView, text: string) => {
  view.log.unshift(text);
};
export const scenarios: Scenario[] = [
  {
    id: 'place',
    group: 'City building',
    title: 'Place & match',
    description:
      'Stage a domino, rotate it, inspect matching edges, then place it. The resulting actions stay visible.',
    duration: 4.8,
    fixture: () => {
      const v = fixture();
      v.city.find((c) => c.x === 3 && c.y === 2)!.tile = tile('temple', 'match-top');
      v.city.find((c) => c.x === 2 && c.y === 3)!.tile = tile('temple', 'match-left');
      return v;
    },
    beats: [
      beat(0, 'Choose a domino', 'Select a domino in your private hand. Tap a space to stage it.'),
      beat(
        1,
        'Find matching edges',
        'Two highlighted Temple edges generate two upgrade actions.',
        undefined,
        { cells: ['3,2', '3,3'], matches: ['3,2', '2,3'] }
      ),
      beat(
        2.6,
        'Place the domino',
        'The chosen domino becomes public; the rest of the hand stays private.',
        (v) => {
          v.city.push(
            { x: 3, y: 3, tile: tile('temple', 'placed-temple') },
            { x: 3, y: 4, tile: tile('market', 'placed-market') }
          );
          v.hand = v.hand.slice(1);
          v.players[0].handCount = v.hand.length;
          addLog(v, 'Aurelia placed a domino: 2 Temple actions.');
        },
        { cells: ['3,3', '3,4'], matches: ['3,3'] }
      )
    ],
    motions: [
      move('placed', 'tile', 'hand', 'city-3,3', 1.4, 2.6, 'Place Temple', {
        tile: tile('temple', 'flying-temple')
      })
    ]
  },
  {
    id: 'arch-three',
    group: 'City building',
    title: 'Domino Arch · 3',
    description:
      'Choose one adjacent building for three actions. The other half of the domino keeps its matching actions.',
    duration: 5,
    fixture: () => {
      const v = fixture();
      v.city.find((c) => c.x === 2 && c.y === 2)!.tile = tile('arch', 'domino-arch', { arch: '3' });
      return v;
    },
    beats: [
      beat(
        0,
        'Choose an adjacent building',
        'The purple Arch activates one adjacent building three times.',
        undefined,
        { cells: ['2,2'], matches: ['2,1', '1,2', '3,2'] }
      ),
      beat(1.4, 'Choose the Market', 'A Market may create Soldiers or Engineers.', undefined, {
        cells: ['3,2'],
        matches: ['3,2']
      }),
      beat(
        2.6,
        'Three Market actions',
        'Create three population, allocating each as a Soldier or Engineer.',
        (v) => {
          v.players[0].reserve = v.players[0].reserve.slice(3);
          v.players[0].soldiers.push(p(), p());
          v.players[0].engineers.push(p());
          addLog(v, 'Arch: 3 Market actions.');
        },
        { cells: ['3,2'] }
      )
    ],
    motions: [
      move('arch-person', 'person', 'reserve-teal', 'soldiers-teal', 1.5, 2.6, 'Create Soldier', {
        person: p()
      })
    ]
  },
  {
    id: 'arch-line',
    group: 'City building',
    title: 'Single Arch · 2 2 2',
    description:
      'Read the next three spaces in one direction, in order. A gap or Arch still occupies one of those spaces.',
    duration: 6,
    fixture: () => {
      const v = fixture();
      v.city.find((c) => c.x === 0 && c.y === 2)!.tile = tile('arch', 'line-arch', { arch: '222' });
      return v;
    },
    beats: [
      beat(
        0,
        'Read the line',
        'Two actions at each of three consecutive spaces. Resolve them in order.',
        undefined,
        { cells: ['0,2'], matches: ['1,2', '2,2', '3,2'] }
      ),
      beat(1.5, 'Space 1 · Temple', 'Two upgrade actions.', undefined, { cells: ['1,2'] }),
      beat(3, 'Space 2 · Arch', 'No actions here. This space still counts.', undefined, {
        cells: ['2,2']
      }),
      beat(
        4.5,
        'Space 3 · Market',
        'Two create actions. The fourth space is not activated.',
        (v) => addLog(v, 'Arch line: Temple → Arch (skip) → Market.'),
        { cells: ['3,2'] }
      )
    ],
    motions: []
  },
  {
    id: 'recruit',
    group: 'Population',
    title: 'Create population',
    description:
      'A Market action moves one reserve meeple to the Soldier or Engineer section, with value 1.',
    duration: 3.5,
    fixture,
    beats: [
      beat(0, 'Choose a profession', 'Create a Soldier or an Engineer from your reserve.'),
      beat(1.8, 'One new Soldier', 'The meeple arrives 1-side up.', (v) => {
        v.players[0].reserve = v.players[0].reserve.slice(1);
        v.players[0].soldiers.push(p());
        addLog(v, 'Aurelia created a Soldier (1).');
      })
    ],
    motions: [
      move('recruit', 'person', 'reserve-teal', 'soldiers-teal', 0.5, 1.8, 'Reserve → Soldier', {
        person: p()
      })
    ]
  },
  {
    id: 'upgrade',
    group: 'Population',
    title: 'Upgrade · 1 → 2',
    description:
      'A Temple action flips a ready Soldier or Engineer. Population already deployed stays unchanged.',
    duration: 3.5,
    fixture,
    beats: [
      beat(
        0,
        'Choose a ready meeple',
        'Only Soldiers and Engineers on the player board can be upgraded.'
      ),
      beat(
        1.8,
        'Two population',
        'The face changes from 1 to 2, keeping profession and ownership.',
        (v) => {
          v.players[0].soldiers[0].value = 2;
          addLog(v, 'Aurelia upgraded a Soldier to 2.');
        }
      )
    ],
    motions: [
      move('flip', 'person', 'soldiers-teal', 'soldiers-teal', 0.5, 1.8, 'Upgrade Soldier', {
        person: p(2)
      })
    ]
  },
  ...(['soldier', 'engineer'] as const).map(
    (role): Scenario => ({
      id: `deploy-${role}`,
      group: 'Population',
      title: `Deploy ${role === 'soldier' ? 'Soldier' : 'Engineer'}`,
      description: `A ${role === 'soldier' ? 'Barracks' : 'Library'} action moves a ready ${role} into one chosen ${role === 'soldier' ? 'Battle' : 'Invention'} area, retaining its value.`,
      duration: 3.8,
      fixture: () => {
        const v = fixture();
        v.players[0][role === 'soldier' ? 'soldiers' : 'engineers'][0].value = 2;
        return v;
      },
      beats: [
        beat(0, 'Choose a contest', 'The two areas are separate competitions.'),
        beat(2, 'Population committed', 'Value 2 is retained on deployment.', (v) => {
          const key = role === 'soldier' ? 'soldiers' : 'engineers';
          v.players[0][key] = v.players[0][key].slice(1);
          v.areas[role === 'soldier' ? 0 : 2].people.push(p(2));
          addLog(v, `Aurelia deployed a ${role} (2).`);
        })
      ],
      motions: [
        move(
          `deploy-${role}`,
          'person',
          `${role === 'soldier' ? 'soldiers' : 'engineers'}-teal`,
          role === 'soldier' ? 'battle-0' : 'invention-0',
          0.5,
          2,
          'Deploy 2',
          { person: p(2) }
        )
      ]
    })
  ),
  {
    id: 'resolve',
    group: 'Contests & rebuilds',
    title: 'Resolve a contest',
    description:
      'Qualify at 3, rank population, and break ties from the active player. Winners return to reserve at 1; everyone else returns ready at 2.',
    duration: 7,
    fixture: () => {
      const v = fixture();
      v.areas[0].people.push(person('coral', 1, 'coral-tie'));
      v.players[1].reserve = v.players[1].reserve.slice(1);
      return v;
    },
    beats: [
      beat(
        0,
        'A tie at three',
        'Aurelia and Cassius qualify at 3. Active-player priority gives Aurelia first choice.'
      ),
      beat(
        1.8,
        'First choice · stacked reward',
        'Aurelia takes both tiles; Cassius takes the other reward.'
      ),
      beat(
        4,
        'Return everyone',
        'Recipients return to reserve at 1. Livia receives no tile and returns to Soldiers at 2.',
        (v) => {
          for (const citizen of v.areas[0].people) {
            const player = v.players.find((player) => player.owner === citizen.owner)!;
            if (citizen.owner === 'teal' || citizen.owner === 'coral')
              player.reserve.push({ ...citizen, value: 1 });
            else player.soldiers.push({ ...citizen, value: 2 });
          }
          v.areas[0].people = [];
          v.areas[0].rewards = [];
          addLog(v, 'Battle 1: Aurelia first, Cassius second; Livia returns at 2.');
        }
      ),
      beat(
        5.8,
        'Refill rewards',
        'Refill vacated slots immediately. Rebuild after all selected areas are resolved.',
        (v) => {
          v.areas[0].rewards = fixture().areas[1].rewards;
          v.supplies[1] -= 2;
        }
      )
    ],
    motions: [
      move('reward', 'tile', 'battle-0', 'city-1,1', 1.8, 3.2, 'Claim rebuild', {
        tile: tile('temple', 'claimed')
      }),
      move('return-winner', 'person', 'battle-0', 'reserve-teal', 3, 4, 'Winner returns at 1', {
        person: p()
      }),
      move(
        'return-other',
        'person',
        'battle-0',
        'soldiers-gold',
        3.3,
        4.6,
        'No reward: return at 2',
        { person: person('gold', 2, 'returned') }
      )
    ]
  },
  {
    id: 'rebuild',
    group: 'Contests & rebuilds',
    title: 'Rebuild the city',
    description:
      'Replace a non-Arch building. Only the top layer counts; rebuilding itself generates no actions.',
    duration: 4.5,
    fixture,
    beats: [
      beat(0, 'Choose a building to cover', 'The purple Arch remains protected.', undefined, {
        cells: ['1,1']
      }),
      beat(
        2.5,
        'New building, new scoring',
        'A banner replaces the old scroll. The underlying tile is retained as a covered layer.',
        (v) => {
          const c = v.city.find((c) => c.x === 1 && c.y === 1)!;
          c.covered = c.tile;
          c.tile = tile('library', 'rebuilt', {
            score: { shape: 'banner', multiplier: 1, target: 'temple' }
          });
          addLog(v, 'Aurelia rebuilt Market as Library. No actions gained.');
        },
        { cells: ['1,1'] }
      )
    ],
    motions: [
      move('rebuild', 'tile', 'battle-0', 'city-1,1', 0.5, 2.5, 'Cover the Market', {
        tile: tile('library', 'rebuild-flight', {
          score: { shape: 'banner', multiplier: 1, target: 'temple' }
        })
      })
    ]
  },
  {
    id: 'draw',
    group: 'Market & turns',
    title: 'Take & refill dominos',
    description:
      'A marked market domino costs two take actions but occupies one hand slot. Refill the market at turn end.',
    duration: 5,
    fixture,
    beats: [
      beat(
        0,
        'Two take actions',
        'Take two ordinary dominos, one marked market domino, or blind draws.'
      ),
      beat(
        2,
        'Marked domino → hand',
        'The selected public domino moves into the private hand.',
        (v) => {
          v.hand.push(v.market[2]);
          v.market.splice(2, 1);
          v.players[0].handCount++;
          addLog(v, 'Aurelia took a marked domino for 2 actions.');
        }
      ),
      beat(
        3.8,
        'Refill to five',
        'Reveal a replacement from the domino supply at the end of the turn.',
        (v) => {
          v.market.push(domino('temple', 'barracks', 'refill'));
          v.supplies[0]--;
        }
      )
    ],
    motions: [
      move('draw', 'tile', 'market-m2', 'hand', 0.5, 2, 'Take marked domino', {
        tile: tile('barracks', 'draw-flight')
      }),
      move('refill', 'tile', 'supply-dominos', 'market-m4', 2.5, 3.8, 'Refill market', {
        tile: tile('temple', 'refill-flight')
      })
    ]
  },
  {
    id: 'blind-draw',
    group: 'Market & turns',
    title: 'Draw from the stack',
    description:
      'A blind draw reveals only to the player. The shared table shows a face-down tile traveling to the paired private hand.',
    duration: 3.5,
    fixture,
    beats: [
      beat(0, 'One take action', 'Draw the top domino without exposing it to the shared table.'),
      beat(
        2,
        'Private hand updated',
        'One new domino; no public identity in the table log.',
        (v) => {
          v.hand.push(domino('library', 'market', 'blind'));
          v.players[0].handCount++;
          v.supplies[0]--;
          addLog(v, 'Aurelia drew one domino from the stack.');
        }
      )
    ],
    motions: [move('blind', 'tile', 'supply-dominos', 'hand', 0.5, 2, 'Private draw')]
  },
  {
    id: 'handoff',
    group: 'Market & turns',
    title: 'Pass the turn',
    description:
      'The active seat changes, the private hand closes, and the next player receives the controls.',
    duration: 4,
    fixture,
    beats: [
      beat(0, 'Complete the turn', 'Refill the market before passing.'),
      beat(
        2,
        'Cassius is playing',
        'Cities stay at their owners’ edges. Only shared action controls change focus.',
        (v) => {
          v.active = 'coral';
          addLog(v, 'Aurelia passed to Cassius.');
        }
      )
    ],
    motions: []
  },
  {
    id: 'scoring',
    group: 'End of game',
    title: 'Scrolls & banners',
    description:
      'A scroll sees its 3×3 neighborhood; a banner sees the entire row and column, across gaps. Each subtotal stays inspectable.',
    duration: 7,
    fixture: () => ({ ...fixture(), city: fullCity() }),
    beats: [
      beat(
        0,
        'Scroll · local neighborhood',
        'The centered 3×3 footprint includes the scoring tile itself.',
        undefined,
        {
          scoring: 'scroll',
          origin: '1,1',
          cells: ['0,0', '1,0', '2,0', '0,1', '1,1', '2,1', '0,2', '1,2', '2,2']
        }
      ),
      beat(
        3,
        'Banner · row and column',
        'The intersection counts once, and empty spaces do not interrupt the lines.',
        undefined,
        {
          scoring: 'banner',
          origin: '0,5',
          cells: fullCity()
            .filter((c) => c.x === 0 || c.y === 5)
            .map((c) => `${c.x},${c.y}`)
        }
      ),
      beat(
        5.8,
        'Review each subtotal',
        'These are illustrative review totals, not a calculated rules result.',
        (v) => {
          v.final = true;
          addLog(v, 'Review final scoring, then share the result.');
        }
      )
    ],
    motions: []
  },
  {
    id: 'final-round',
    group: 'End of game',
    title: 'Supply exhausted',
    description:
      'Latch the end trigger, finish the current turn, then give every player a final turn ending with the triggering player.',
    duration: 5,
    fixture,
    beats: [
      beat(0, 'One supply is empty', 'The remaining supply count is visible.', (v) => {
        v.supplies[0] = 0;
      }),
      beat(2, 'Final turns', 'Each player gets one more turn. Then all four areas resolve.'),
      beat(4, 'Final area resolution', 'Place all awarded rebuilds before scoring.', (v) => {
        v.final = true;
        addLog(v, 'Final resolution follows the last turn.');
      })
    ],
    motions: []
  },
  {
    id: 'reconnect',
    group: 'Recovery',
    title: 'Return to the table',
    description:
      'A connection interruption leaves the city visible. Recovery returns to the last accepted decision without replaying old movement.',
    duration: 4,
    fixture,
    beats: [
      beat(0, 'Connection interrupted', 'Your city stays visible. Waiting to reconnect.'),
      beat(
        2,
        'Back at the same decision',
        'Review fixture restored. No new tiles or random results are generated.',
        (v) => addLog(v, 'Connection restored.')
      )
    ],
    motions: []
  }
];
export function getScenario(id: string | null | undefined): Scenario {
  return scenarios.find((s) => s.id === id) ?? scenarios[0];
}
/** Pure time sampling: supports pause, reverse seeking, and future event-driven playback. */
export function sample(scenario: Scenario, time: number, reduced = false): Frame {
  const t = reduced
    ? scenario.duration
    : Math.max(0, Math.min(Number.isFinite(time) ? time : 0, scenario.duration));
  const view = scenario.fixture();
  let current = 0;
  scenario.beats.forEach((b, i) => {
    if (t >= b.at) {
      b.patch?.(view);
      current = i;
    }
  });
  const b = scenario.beats[current];
  const actions: Frame['actions'] =
    scenario.id === 'place' && current >= 1
      ? [{ id: 'upgrade', building: 'temple', count: 2, available: true }]
      : scenario.id === 'arch-three' && current >= 1
        ? [{ id: 'recruit', building: 'market', count: 3, available: true }]
        : scenario.id === 'arch-line'
          ? [
              { id: 'upgrade', building: 'temple', count: 2, available: current <= 1 },
              { id: 'skip', building: 'arch', count: 0, available: false },
              { id: 'recruit', building: 'market', count: 2, available: current >= 3 }
            ]
          : undefined;
  return {
    actions,
    ordered: scenario.id === 'arch-line',
    sceneId: scenario.id,
    context:
      scenario.id.startsWith('deploy') || scenario.id === 'resolve'
        ? 'contests'
        : scenario.group === 'Population'
          ? 'population'
          : 'city',
    view,
    focus: b.focus ?? {},
    beat: current,
    label: b.label,
    detail: b.detail,
    progress: t / scenario.duration,
    motions: scenario.motions
      .filter((m) => t >= m.start && t < m.end)
      .map((m) => ({ ...m, progress: (t - m.start) / (m.end - m.start) }))
  };
}
