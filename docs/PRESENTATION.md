# Component and interaction review

Mosaic Forum (option 2) is selected. This milestone reviews the actual shared Svelte presentation and interaction layer before a rules engine or networking is implemented. The fixture adapter simulates outcomes; it is not a faithful game authority.

## Open the workshop

Use Node 24 and Bun 1.3.10 (or enter `nix develop`):

```sh
bun install --frozen-lockfile
bun run dev
```

Open `http://127.0.0.1:5196/`:

| Route | Purpose |
| --- | --- |
| `/dev/layers/` | Actual tile layer assembly, isolated/exploded inspection, alignment controls, local review application and JSON export |
| `/` or `/gallery/` | Complete v56 inventory and component/state samples; search, metadata inspection, and direct interaction with the same controller and UI primitives |
| `/dev/animations/` | 15 explicitly labeled prepared studies, plus direct interaction inside the actual route iframe |
| `/review/` | Personal-screen interaction against the deterministic fixture adapter |
| `/tabletop/` | The same controller and presentation in the shared-table composition; private hands remain concealed |

The lab supports `?scenario=rebuild&device=phone`, `?scenario=resolve&device=tabletop`, `players=2|3|4`, optional `landscape=1`, and `time=2.5`. It renders actual iframe viewports: phone 390×844, tablet 820×1180, desktop 1440×1000, and tabletop 1920×1080. Fit scales the view without changing its responsive breakpoints. The native-size link preserves the selected study, clock and player count. Cities and collections scroll deliberately.

Standalone `/review/?city=signed` shifts the fixture across negative coordinates; `/review/?city=empty` starts with an empty city. These are additional geometry review fixtures, not game setup variants.

## The production integration boundary

There is one implementation of the interaction UI. Future game routes instantiate `createPresentationController(initialPresentation, gameAdapter)` and render **the existing `GamePresenter.svelte`**. They must not replace reviewed dialogs, selection flows, controls, or board renderers with newly written versions.

The controller and all production components live in `src/lib/presentation/` and `src/lib/components/`. They import no fixtures, scenario definitions, timeline types or review controllers. Regression coverage enforces that boundary.

| Shared contract / primitive | Responsibility |
| --- | --- |
| `GamePresentation` | Projected public/private data, supplied seat positions, labels, focus, generated actions and optional sampled motion sprites. No scenario ID, beat, study clock or outcome mutation. |
| `ViewIntent` | Specific UI choices, including stable object IDs, signed coordinates, operations, professions, area/reward IDs, confirm, cancel, skip and inspector dismissal. |
| `PresentationController` | The single shared UI state machine for drafts, targeting, rotations, selected actions, starting selection, confirmation, pending/error/retry and inspection. Its store feeds both gallery samples and game surfaces. |
| `InteractionAdapter.availability` | Supplies current availability and reasons, including turn/queue actions, individual objects, operations, targets, confirmation and starting selection. Components display these decisions; they do not decide game legality. |
| `InteractionAdapter.execute` | Accepts a typed `Command`, the current presentation and an abort signal; returns the resulting presentation or rejects. Only confirmation invokes it. |
| `GamePresenter` / `GameSurface` | Compose the exact shared components and bind intents to the controller. The presenter includes the shared building inspector. The surface uses supplied seat/owner mappings rather than assuming a color occupies a particular edge. |
| `InteractionPanel` / `BuildingInspector` / `ScoringReview` | Shared confirmation, targeting, pending/error/retry, rebuild tray, native building dialog, and city/score inspection round trip. Gallery and routes use these same primitives. |
| `geometry.ts` | The one signed-coordinate placement/rotation convention used by ghosts and submitted placements. Bounds include existing negative coordinates, all rotated ghost cells and a two-space editable margin on every edge. Empty and compact cities use the same geometry. |

`replace(presentation)` installs a new authoritative projection, cancels an in-flight adapter request, invalidates stale responses and clears tentative interaction state. A production host decides when an accepted revision requires replacement. Animation scheduling and privacy-safe projections remain upstream responsibilities; motion rendering accepts sampled sprites without knowing a study clock. A production adapter may derive animation presentations from accepted events without changing the reviewed components.

Pending execution locks mutable choices and confirmation until the result arrives. It does not promise rollback of a command already submitted to a future authority. Before submission, Cancel discards the draft without changing the projection. On rejection, the shared panel preserves the selected objects and allows retry or cancellation. Read-only inspector dismissal is independent of a pending command.

## What can be reviewed directly

- Select a particular market domino, see its identity and selection highlight, cancel or confirm, observe pending feedback, then see that exact domino leave the market and enter the private hand. A blind draw conceals the public identity.
- Select an actual domino from the hand, choose signed coordinates, rotate through all four directions, inspect its ghost, then cancel or place the same tile identities. Both halves use the same shared geometry in preview and execution.
- Choose a particular area and reward. Confirmation removes that reward from that area and places its actual tile IDs in the rebuild tray. Select a rebuild tile, target an existing city building, and confirm. The simulated adapter rejects Arch coverage and overlapping placement through supplied confirmation availability.
- Select a particular ready or reserve meeple by stable ID. Choose upgrade, profession or deployment target. Confirming changes that exact meeple. Invalid operations and targets are visibly disabled, with reasons.
- Select a turn or generated action and review its pressed state. Skip requests confirmation; cancellation preserves the queue and confirmation clears it. Simulated population actions decrement their supplied fixture queue entries.
- Inspect a building, scoring mark and covered layer in the shared native inspector, close with Escape or Close, and return focus to the triggering tile.
- Select starting candidates through shared controller state; the adapter supplies weighted value and Keep availability. Keep stages a confirmation, then applies the selected IDs to the hand.
- Use **Simulate next rejection** in a standalone review host to exercise the same shared error and retry UI that production adapter failures will use. The fixture adapter introduces a fixed short delay so pending states are observable.

Gallery specimens are compositions of these actual components. Their isolated controller instances use the same fixture adapter. Interactive samples render `InteractionPanel` and `BuildingInspector`; they do not replace actions with feedback-only notes or send chosen IDs to canned studies. The metadata inspector around a gallery specimen remains a review tool, distinct from the shared in-game building inspector.

## Prepared studies and direct interaction are distinct

Only `src/lib/review/scenarios.ts`, `timeline-types.ts`, fixtures, the adapter and review hosts know about studies. `sample(study,time,reduced)` deterministically produces prepared presentations and motion sprites. No production component consumes scenario IDs, beats, or clock time.

The parent lab controls play, pause, replay, speed, beat jumps, reverse seek, loop and reduced motion. Origin/source-checked messages feed prepared presentations into the iframe host. Reduced motion settles the same fixture without traveling pieces.

Any direct intent pauses playback and switches the visible label to **Direct interaction · simulated fixture outcomes**. Inputs then run through the shared controller and fixture adapter. They never call `go('draw')`, `go('resolve')` or another study shortcut. The prepared timeline does not mutate these direct results. **Return to prepared study**, a timeline seek, study selection, or explicit playback resets the fixture deliberately. Standalone hosts offer separate Reset and Play prepared study controls.

## Simulated outcomes and remaining limitations

`src/lib/review/fixture-adapter.ts` implements the production adapter interface for review only. Its outcomes are deterministic examples for the selected objects. It checks membership, turn availability, hand capacity, overlap, permanent Arches, profession targets and starting selection to keep the fixture coherent. These checks are not a complete implementation of v56.

It does **not** validate adjacency or matching edges, generate legal building actions, enforce all turn/action budgets, rank contest players, award other players' contest rewards, refill supplies according to the full game rules, perform final resolution, or calculate victory points. Contest simulation gives the chosen reward to the viewer and explicitly simulates population returns; awarded tiles can be rebuilt one at a time. Supplied scores are illustrative. Fixed draws and starting candidate examples remain study fixtures; the verified component inventory is separately supplied by `src/lib/manifest/v56.json`.

The production adapter still needs a rules reducer, authoritative availability and choice validation, seeded draws, multiplayer persistence/revision handling, private projections/paired-device transport, accepted-event animation scheduling, and scoring. It must revalidate commands after submission, because availability can change. Those integrations replace simulated data/outcomes, **not the reviewed UI or its interaction state machine**.

The shared-table view keeps private hands off the public DOM. Phone pairing is still unimplemented. Seat positions are projection data; actual physical-seat selection and multi-viewer authorization remain production work. Real Safari, phone/tablet hardware and tabletop hardware review remain outstanding.

## Verification and evidence

```sh
bun run verify
```

This runs Svelte/TypeScript checks, unit tests, Chromium browser journeys and the static build. Install Chromium once with `bunx playwright install chromium` (`--with-deps` on Linux).

Targeted unit coverage includes signed/empty/compact bounds and all rotations, exact command IDs, cancel/confirm/skip, adapter-provided availability, pending/rejection/retry, inspector state, weighted starting selection, queue updates and stale async response suppression. Browser tests exercise the actual gallery, standalone personal/tabletop routes and lab iframe; they verify selected identities, resulting DOM state, disabled/pending/error feedback, negative-coordinate ghosts/placements, inspector focus, privacy and separation from prepared playback. Existing component, 15-study playback and responsive journeys continue to run.

Captures and traces are generated in `test-results/` and uploaded by CI; selected current evidence is in [review/](review/). Screenshots are review evidence, not universal pixel baselines. Same-repository PRs publish retained previews at `https://anicolao.github.io/vianova/prNUMBER/`; fork PRs verify without publication credentials.


## Artwork and inventory integration

`src/lib/manifest/v56.json` records every physical tile and source provenance. `scripts/import-manifest.py --check` detects source/output drift; manifest unit tests assert counts, scoring marks, colours, setup geometry and complete inventory gallery coverage. See [COMPONENT_MANIFEST.md](../COMPONENT_MANIFEST.md) for source conflicts and exact fronts. Inventory specimens are source-derived; interactive examples retain their named synthetic IDs so deterministic interaction studies are reproducible. They must not be treated as a seeded game deal.

`BuildingArt` is generated raster artwork, not a markup building illustration. The physical rim is part of that artwork. `Tile` layers one shared `BuildingSymbol`, a generated scroll/banner substrate plus live `ScoreSymbol` ink, Arch values, + and starting markers, followed by selection/focus. `Population` layers generated carved wood with live ownership shape/value. `ContestBoard` and `PlayerMat` use generated board substrates and live reward/population assemblies. All routes and animation travelers consume those same components and image paths. The generated assets and exact prompts are recorded in [art/mosaic/](../art/mosaic/); symbols intentionally remain vector silhouettes as required by the visual standard. No score, ownership or game decision is flattened into a painting.

Pieces retain 96–104 px tile faces in play; the city/market/hand use local panning rather than reducing essential scoring marks. The gallery also has a grayscale comparison control. Compact/tabletop city windows, reserve wells and the shared-table region pan locally within the same geometry; physical seat orientation does not swap renderers. The smallest primary building symbol is at least 24 px; score targets 24 px, footprint 18 px and values at least 16 px. These are measured browser constraints, not evidence of human recognition or physical-table approval. Real phone/tablet/tabletop viewing-distance and designer icon recognition review remain outstanding.


## Tile layer registration

Open `/dev/layers/` (the **Tile layers** navigation link), choose a physical manifest face or reverse, then select a layer in the stack or on the piece. Drag in the assembled canvas, use arrow keys for 0.5% nudges (Shift: 2%), or edit X/Y, width/height, rotation and opacity. Dimensions are percentages of the full tile; the inspector also reports preview pixels. Hide/isolate actual layers, toggle bounds or grayscale, and separate the assembly in depth. Reassemble before dragging. The 96, 104 and 128 px comparisons always use assembled, unscaled instances of the same production `Tile`; isolated thumbnails do too. Numeric controls remain available on touch/keyboard and during exploded inspection.

Draft changes remain in the editor and recover in that browser tab across reloads. **Apply to gallery and lab** validates and saves them to base-path-scoped browser local storage, then updates the existing gallery, personal/tabletop views and animation iframe via the shared registration context and storage events. It does not modify repository files or other browsers. **Remove browser overrides** restores shipped settings everywhere; **Discard draft**, layer reset and undo/redo provide explicit recovery. Invalid JSON or non-finite/out-of-range coordinates are rejected before application.

**Download JSON** exports the exact format of `src/lib/presentation/tile-registration.json`. To publish an approved calibration, replace that checked-in file with the export, run `bun run verify`, and commit it. No renderer, stylesheet or interaction reimplementation is needed. Browser overrides can mask newer shipped defaults, so remove them when reviewing an updated source calibration. Draft/export data includes geometry only, never hidden-layer or exploded inspection settings. The schema is versioned; change its version deliberately when future incompatible artwork/configuration changes require recalibration.

The production boundary is `TileRegistration` plus `RegisteredLayer` and the shared default JSON. `Tile` works without a review provider: it reads shipped defaults, or accepts a supplied registration/context. Only `review/RegistrationProvider.svelte` and the review route know about browser persistence, editor history or authoring controls. Production game authority and presentation controllers are unchanged.

Calibration scopes are deliberate: artwork and emblems per building family, reverse artwork separately, material and ink per scroll/banner shape, and common Arch/starting/+ /reverse identity/protection marks. The bitmap includes the building illustration, stone rim and pale reserved regions: the editor cannot move those baked image features independently. Scoring plaques use the same generated raster material with nine-slice borders; live scoring ink is a uniformly scalable SVG assembly. Symbol viewBoxes trim excess whitespace, and starting arrows stay inside the face boundary. The current offsets and plaques are a corrected first pass, still subject to designer recognition and physical-device review.
