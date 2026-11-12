# Via Nova

Build a city worthy of Rome. Match buildings to generate actions, train soldiers and engineers, and time your claims in shared Battle and Invention areas. The rebuild tiles you win transform your city and create new ways to score.

This project is a digital implementation of **Via Nova by Stefan Alexander**, developed in collaboration with its designer. Stefan Alexander owns the rights and copyright to Via Nova. The implementation is licensed under **GNU GPL version 3 only (GPL-3.0-only)**; see [LICENSE](LICENSE). This project does not transfer ownership of the underlying game.

The supplied v56 rules describe a game for **2–4 players**, ages **10+**, with a physical play time of **30–40 minutes**. The digital version targets laptops, tablets, phones, and a shared horizontal touch table that players can gather around.

## Project documents

- [VISION.md](VISION.md): intended experience, device modes, scope, and delivery principles.
- [RULES_SUMMARY.md](RULES_SUMMARY.md): implementation-oriented summary of the supplied rules, including scoring and questions for the designer.
- [ART_DIRECTION.md](ART_DIRECTION.md): three illustrated visual proposals, tradeoffs, and an approval checklist.
- [docs/PRESENTATION.md](docs/PRESENTATION.md): component architecture, animation review, routes, and validation.
- [docs/ASSETS.md](docs/ASSETS.md): original mosaic artwork and bundled font provenance.
- [Via Nova Rules - v56.pdf](Via%20Nova%20Rules%20-%20v56.pdf): source rules, including component and setup illustrations.

## Current status

**Mosaic Forum (option 2) is the selected art direction.** A Svelte 5 / SvelteKit workshop now demonstrates the production-facing presentation components before rules implementation. The gallery contains 64 review samples spanning all component families and the illustrated scoring key. The animation lab has 15 scrub-able action studies, rendered through the same Svelte components in native mobile, tablet, desktop, and tabletop viewports.

There is no rules engine, networking, or complete playable game yet. The standalone review routes support local placement, rotation, cancellation, inspection, and prepared action demonstrations. Component faces and setup values are representative fixtures pending Stefan's complete manifest.

## Run the workshop

Use Node 24 and Bun 1.3.10, or enter the supplied `nix develop` shell:

```sh
bun install --frozen-lockfile
bun run dev
```

Open `http://127.0.0.1:5196/` or `/gallery/` for the component collection, `/dev/animations/` for the lab, `/review/` for the personal-screen fixture, and `/tabletop/` for the shared-table fixture. The lab offers fit/native scale, portrait/landscape, timeline scrubbing, playback speed, loop, beat selection, and reduced motion. See the [review guide](docs/PRESENTATION.md) for controls and architectural boundaries.

Run `bunx playwright install chromium` once, then `bun run verify` for Svelte/TypeScript checks, presentation unit tests, Chromium browser journeys, and the static build. Same-repository PRs publish retained GitHub Pages previews at `/vianova/prNUMBER/` after verification.

## Planned play

Create a private table, invite friends by link or code, and play from individual browsers. Each player sees the public cities, contests, and market alongside their own private domino hand.

On a shared tabletop, players take physical seats around one display. Cities, contests, placement, and public actions remain on the table. Companion phones hold private domino hands and starting-hand choices; selecting a domino on the phone can stage it for placement on the table. A same-display hand reveal, if added, must be an explicit privacy compromise chosen by the group.

The first release should support complete v56 play for all three player counts, readable action previews, automatic bookkeeping, reconnect recovery, and an explainable final score. See the vision for the proposed technical foundation and acceptance criteria.

## Relationship to nearby projects

The sibling projects `../pantheon`, `../hanami`, `../cantstop`, and `../istanbul` provide local examples of responsive play, shared-table seating, component galleries, animation review, and replayable multiplayer games. Via Nova should reuse their proven patterns where useful while keeping its own city-building and contest rules authoritative.

## Rights and distribution

The implementation is distributed under [GPLv3 only](LICENSE). See [NOTICE](NOTICE) for project attribution and the distinction between the implementation and the underlying game. Preserve Stefan Alexander's game credit and ownership notice throughout the project. Record permissions and distribution terms for the supplied PDF, original game artwork, fonts, and any other bundled material separately; the software license alone does not state those permissions. Newly generated art proposals and their prompts are documented in the art direction files.
