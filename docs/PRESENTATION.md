# Component and animation review

Mosaic Forum (option 2) is the selected art direction. This milestone establishes the actual Svelte presentation layer before a rules engine is written. Nothing here creates network games or validates a complete turn.

## Open the workshop

With Node 24 and Bun 1.3.10 (or enter `nix develop`):

```sh
bun install --frozen-lockfile
bun run dev
```

The server is at `http://127.0.0.1:5196/`.

| Route | Review purpose |
| --- | --- |
| `/` or `/gallery/` | All 64 component samples, category browsing, search, light/dark backing, full-size inspector |
| `/dev/animations/` | All 15 motion studies, native viewport presets, timeline, and playback controls |
| `/review/` | Standalone personal-screen fixture, including direct placement and inspection callbacks |
| `/tabletop/` | Standalone two-to-four-player table fixture, with private hands concealed |

The lab supports `?scenario=rebuild&device=phone`, `?scenario=resolve&device=tabletop`, optional `landscape=1`, and `time=2.5`. The native-size link retains the chosen scenario and clock. The Players selector previews two, three, or four seats without applying player-count setup rules. Device previews use an actual iframe viewport (390×844 phone, 820×1180 tablet, 1440×1000 desktop, 1920×1080 tabletop); fit scales the iframe visually without changing its responsive breakpoints. Open at native size to assess actual touch/readability rather than scaled preview size. Orientation applies to mobile and tablet presets. Large cities and long component collections scroll deliberately.

## Shared production components

`src/lib/components/` contains the presentation components intended for production routes. It imports no fixtures, catalog, scenario definitions, or review controllers. Components consume typed props and emit `ViewIntent` choices. A future rules controller supplies authoritative data and accepts or rejects those choices; the renderer does not need to be replaced.

- `BuildingArt`, `Tile`, `Domino`, `ScoreSymbol`: original SVG mosaic architecture and layered components. Art, rule symbols, labels, selection, and scoring remain separate layers.
- `Population`, `PlayerMat`: all four identities, reserve, ready professions, upgrade values, and public counts.
- `RewardStack`, `ContestBoard`: both contest types, two areas per board, two rewards per area, overlapping rewards with both scoring plaques visible, and qualifying population totals.
- `SupplyDeck`, `DominoMarket`, `PrivateHand`, `StartingChoice`: concealed supplies, marked costs, starting selection, and private/tabletop projections.
- `CityBoard`: square geometry, staged/rotated domino preview, matching highlights, covered layers, zoom, and scoring footprints.
- `TurnControls`, `ActionQueue`, `GameLog`, `ScoreSheet`: the turn choices, earned actions, history, and final-score presentation.
- `GameSurface`, `MotionLayer`: the full personal/tabletop composition and the shared overlay that moves those same Tile/Population components between measured component anchors.

The gallery's `GalleryRenderer.svelte` composes these components directly. It does not contain substitute artwork or duplicate board renderers. `SceneHost.svelte`, used by both `/review/` and `/tabletop/`, feeds the same `GameSurface` used inside the lab iframe. All local interaction behavior belongs to that review controller, not to a second copy of the components.

The SVG mosaic treatment is code-native artwork, designed to remain sharp at every scale. It is inspired by the selected concept's architectural emblems and mineral colors; the concept sheet is not cut into production tile sprites.

## Timeline contract

`presentation/types.ts` and `intents.ts` are production-facing contracts. The scenario catalog and `review/fixtures.ts` are deliberately local review data. `sample(scenario, time, reduced)` is a pure presentation sampler: it creates a fresh fixture, applies explicit presentation beat patches, and returns the frame and traveling-piece progress. It never resolves arbitrary gameplay, chooses random tiles, or computes victory points.

The parent lab owns the clock. Same-origin messages from the owning iframe/parent synchronize it, checking both origin and source. Play, pause, replay, speed, beat jumps, reverse seek, loop, and reduced motion operate on that same clock. Reduced motion immediately renders the final fixture without travelers. The OS preference initializes and updates the setting; the checkbox can also be used for review.

Studies cover placement and matches; both Arch activations; creation and upgrades; Soldier and Engineer deployment; a tied contest and population returns; rebuilding; marked market takes and refill; private blind draws; handoff; both scoring footprints; supply exhaustion; and reconnect. Motion uses a measured start/end anchor, a smooth interpolation, and a short lift. Individual values and timing remain reviewable before production event integration.

On phones, population studies include a ready-player context and deployment/contest studies open the contest tab. Other views remain available. The tabletop fixes cities at their owners' edges, rotates their mats/cities outward, keeps all public boards on the shared display, and renders only a companion-device privacy prompt in place of the private hand. Pairing itself is not implemented in this milestone.

## Interaction review

On `/review/`, tap a domino in the hand, tap an empty city space, rotate, cancel or place, then inspect a building. These choices exercise the actual production callbacks, with local fixture changes. The review checks overlap to keep the composition coherent; it does not validate adjacency, action budgets, or legal complete turns. Clicking turn options, population, public rewards, or market choices launches the corresponding prepared study; these controls do not yet resolve arbitrary chosen game actions.

Starting selection demonstrates the weighted selection counter and the exact-four gate. Scores are explicitly supplied illustrative fixture totals. Opponent cities are supplied by the fixture, never invented inside the renderer. The component inventory covers every family and illustrated scoring condition, not the unknown complete distribution of 48 domino faces or exact turn-order setup allocations. Starting pairs use the colors visible in the supplied rules but letter assignment and coordinates remain pending manifest review.

## Verification and evidence

```sh
bun run check
bun run test:unit
bun run test:e2e
bun run build
```

`bun run verify` runs all four. Install Chromium once with `bunx playwright install chromium` (`--with-deps` on Linux). Browser tests render real routes, inspect every gallery sample, exercise native dialog close/focus, verify starting selection, drive all 15 timelines, seek backward, inspect a traveling piece, compare reduced-motion results, change native viewport dimensions, verify tabletop privacy, exercise placement/rotation/cancel/commit/inspection, pause on iframe interaction, and check two-to-four-player tabletop projections. Responsive checks cover phone portrait/landscape, tablet, and desktop. Static builds support a nested `PUBLIC_BASE_PATH` for retained PR previews.

Screenshots are generated under `test-results/review/`; Playwright reports and traces are ignored local artifacts and uploaded by CI. Selected reviewed images are committed in [docs/review](review/). They are review evidence, not universal pixel baselines. The CI browser run is Chromium; real Safari, mobile hardware, and tabletop hardware still need review before production approval.

The workflow verifies pull requests and builds retained same-repository previews at `https://anicolao.github.io/vianova/prNUMBER/`. GitHub Pages serves the `gh-pages` branch. Fork PRs run verification without publication credentials.
