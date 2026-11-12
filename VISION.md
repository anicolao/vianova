# Via Nova — Vision

## The promise

Build a Roman city whose layout becomes an engine, then decide when to turn your growing influence into victory. The digital game should make every matching edge, deployed population, and rebuilt district easy to understand while preserving the tension of claiming rewards before rivals overtake you.

This is a faithful implementation developed with Stefan Alexander, Via Nova's designer and rights and copyright owner. The implementation is distributed under GPLv3 only. The supplied v56 rules are the initial authority; designer clarifications should become explicit, versioned decisions.

## What players should feel

A small city becomes a personal creation. A well-placed domino unlocks a useful sequence: recruit, upgrade, deploy. An Arch turns previous construction into a burst of activity. A contest victory brings a rebuild that improves future matches or creates a valuable scoring pattern. Waiting for a stronger claim should feel tempting and risky because other players can resolve the same area first.

Automation handles counting and administration. Players retain the decisions about placement, action order, population commitment, contest timing, reward selection, and rebuilding.

## Design pillars

- **The city is the interface.** Square adjacency, matching edges, permanent Arches, scroll neighborhoods, and banner lines must remain visible. Buildings and scoring symbols communicate distinct functions at a glance.
- **Shared contests create interaction.** Always show all four areas, each player's population value, qualifying status, rewards, and tie priority. A player should understand both what they can claim now and what rivals might take.
- **Consequences before commitment.** Preview matching actions, Arch activation order, population changes, and the exact scoring footprint of a rebuild. Let players arrange an action sequence themselves. Do not recommend an optimal move by default.
- **A city with a history.** Rebuilds should visibly replace buildings. The action log explains which tiles were claimed and where they were placed; a scoring breakdown shows why each visible symbol earns points.
- **One game across devices.** Personal browsers and the shared tabletop use the same rules, event history, and game components, with layouts suited to the people using them.

## Play on personal screens

Laptops and larger tablets show the player's city, the shared market and contests, and compact opponent cities together. Inspection can enlarge an opponent's city without losing whose turn it is or the current action sequence.

Phones prioritize a readable city and the current decision. Persistent compact summaries retain the market, contest qualification, and turn state; dedicated views enlarge those areas when needed. Pan and zoom support growing cities rather than shrinking tiles until they cannot be touched. Preserve the current selection when rotating the device. All placement has a tap-select, rotate, and tap-destination alternative to dragging.

Domino identities in hand and unselected starting tiles remain private. Public cities, played tiles, deployed population, ready soldiers and engineers, reserves, remaining Arch tiles, and revealed rewards are inspectable. Confirm any additional information-visibility decisions with Stefan.

## Gather around a tabletop

The horizontal touch display is the main play surface. Two to four players select physical seats; clockwise seat order establishes turn order after choosing a start player. Each city faces its owner. Shared controls can face the active player while keeping cities stable enough for everyone to follow play.

All public decisions remain available on the table: placement, action ordering, recruitment, upgrades, deployment, resolving areas, choosing revealed rewards, and rebuilding. A companion phone supplies the private hand and starting selection. Pair it to a seat through a QR invitation. Selecting a private domino for play should reveal only that domino when the player deliberately stages it on the public surface; the rest of the hand remains hidden.

The design must also handle interruptions: a disconnected phone can rejoin its existing seat, a table reload restores the game, and connection status explains whose input is needed. A shared-screen-only option may be explored later with an explicit understanding that a horizontal screen cannot guarantee hand privacy.

## Initial scope

Deliver complete v56 play for 2, 3, and 4 players: player-count setup, starting selection, all four turn options, optional action sequencing, both Arch types, all contest outcomes, stacked rewards, mandatory rebuild placement, the final-turn sequence, final resolution, and full scoring including shared victories.

Include invitations, reconnect, a readable history, contextual rules, and a component gallery using the actual production components. The art direction remains pending approval; the three proposals in [ART_DIRECTION.md](ART_DIRECTION.md) explore different treatments of the same game.

Computer opponents, public matchmaking, accounts and rankings, chat, expansions, native app packaging, and competitive anti-cheat are later possibilities. They are outside the initial release.

## Proposed technical and delivery foundation

Follow the useful patterns in Pantheon, Hanami, Can't Stop, and Istanbul: a responsive static web client, a pure rules model, versioned component manifests, deterministic seeded setup and draws, and an append-only stream of attributed choices. SvelteKit, TypeScript, Firebase anonymous identity, and Firestore are the starting proposal, not an installed stack or a requirement to copy every sibling implementation.

Replay must reconstruct the same cities, hands, supplies, contest standings, and result after a reload. Revision checks and retry identifiers prevent duplicate commands. Animation presents settled rules outcomes and never determines them. Private UI projections must not expose another player's hand. If the initial architecture uses trusted clients and seeded randomness, describe its limits honestly: presentation privacy does not provide protection against a player inspecting client state.

Allow cancellation of tentative placements and action choices. Define undo boundaries before implementing committed rollback, especially after draws, reward refills, or another player's decisions; v56 specifies no digital undo rule. Never reroll or redraw to make an undo appear reversible.

Deliver vertical slices that can be reviewed in a browser. Use rules fixtures for consequential edge cases and emulator-backed browser journeys for joining, play, recovery, and scoring. The gallery and animation lab should use the real renderer and representative legal positions.

## Acceptance criteria

- Two, three, and four players can finish a complete game with identical results on every client.
- Every placement preview identifies each matching edge; Arch previews distinguish the three-action choice from the ordered three-space activation.
- Contest resolution explains qualification, ranking, tie priority, both reward slots, and the destination and value of every returning meeple.
- Final scoring highlights a scroll's 3×3 neighborhood or a banner's complete row and column, including across gaps, and explains each subtotal.
- Keyboard, pointer, and touch can perform every action; controls use clear focus, accessible names, sufficient contrast, and non-color ownership cues. Aim for at least 44 CSS-pixel touch targets.
- Phone portrait and landscape, tablet, laptop, and the actual tabletop are visually reviewed using early and late-game cities. Dense states retain readable pieces through deliberate navigation and zoom.
- Shared-table play exposes no unplayed private domino and supports public turns without moving public controls onto phones.
- Reconnect preserves seats and in-progress decisions at their last accepted boundary; reduced motion reaches the same state without animation delays.
- Stefan reviews the rules manifest and resolves the open questions in [RULES_SUMMARY.md](RULES_SUMMARY.md) before the implementation claims full v56 fidelity.
