# Review evidence

Current captures from the actual shared Svelte components after the generated mosaic artwork, full v56 inventory and interaction-controller cleanup. `bun run verify` passes: zero Svelte errors/warnings, 34 unit tests, 28 Chromium browser journeys and the static build. Screenshots establish rendered evidence; they do not establish designer approval or human icon recognition. Phone/tablet/tabletop hardware review remains outstanding.

## Tile registration

The `/dev/layers/` route renders the actual shared tile assembly. It provides direct drag/keyboard/numeric edits, per-layer visibility/isolation, exploded stacking, real-size comparison, undo/redo, recoverable drafts, browser-wide application and portable JSON export.

![Shared tile registration with corrected defaults](layer-registration.png)

![Exploded stack with a deliberately displaced test draft](layer-stack.png)

![Phone editor with an unapplied imported draft](layer-registration-phone.png)

Scoring ink now follows one registered SVG canvas inside a generated nine-slice plaque; emblem geometry is independently calibrated per family. Applied geometry updates the already-open gallery and animation iframe. These captures are inspection evidence, not designer approval.

## Layered physical pieces

![Generated mosaic component gallery](gallery-desktop.png)

![Actual phone gallery](gallery-phone.png)

![Monochrome symbol comparison](mosaic-monochrome.png)

![Shared building/scoring symbols and distinct plaques](mosaic-scoring.png)

## Same pieces in game compositions

![Actual phone game components](mosaic-game-phone.png)

![Native 1920×1080 tabletop](tabletop-native.png)

The tabletop keeps 96–104 px pieces and pans city windows, reserve wells and the central shared region locally instead of shrinking scoring symbols. The visible scroll hint leads to the market and actions. These layout choices still need physical-device review.

![Desktop game components](surface-desktop.png)

![Shared-component animation lab](lab-desktop.png)

![Tabletop lab](lab-tabletop.png)

## Object-specific interaction states

![Shared pending/rejection/retry interaction](interaction-error.png)

![Shared production building inspector](interaction-inspector.png)

![Direct interaction distinct from prepared playback](lab-direct.png)

All outcomes are simulated through the fixture adapter; no rules authority or multiplayer service is implemented. The browser suite also captures phone landscape and tablet layouts under `test-results/review/`; CI uploads the complete report and failure traces. See [the integration boundary](../PRESENTATION.md), [component manifest](../../COMPONENT_MANIFEST.md) and [artwork prompt ledger](../../art/mosaic/prompts.json).
