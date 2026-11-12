# UX design principles

Design the experience around handling game pieces. Players should feel they are arranging tiles, choosing cards, moving tokens, and interacting with boards.

## Design and implementation checklist

- **Build the components that will ship.** Use one shared implementation for the game, component gallery, and interaction review. Approved artwork, styling, and interaction behavior must carry into production without reimplementation. Do not create duplicate demo components or substitute renderers.

- **Give complete objects a graphical treatment.** Compose artwork, material, edges, symbols, highlights, and shadows into coherent pieces. Extend that care to boards, mats, decks, and trays. Rounded panels with illustrations inside are insufficient.

- **Make pieces the primary controls.** Select a card by touching the card; choose a reward by touching the reward. Show available destinations on the board. Preview placement, rotation, stacking, and movement in context. Support click/tap interaction; dragging can complement it.

- **Keep supporting controls contextual.** Put rotate, confirm, and cancel near the selected piece or destination. Reserve dialogs for tasks that require a separate decision space. Avoid making ordinary turns depend on a detached action toolbar.

- **Enlarge the same component in context.** When a location, card, or piece needs more room for precise interaction, expand it into a readable action surface while preserving its identity, current state, selection, and connection to its original position. Use the same shared renderer and interaction contracts at both sizes. Provide an obvious return that restores the player's place and keyboard focus. Motion should explain the spatial connection and respect reduced motion. The overview must still support comparing options before expansion; enlargement provides additional detail and room to act. Avoid wrapping an already framed component in another decorative frame that consumes the space enlargement was meant to provide. Keep supporting controls clear and subordinate to the object.

- **Support comparison as well as browsing.** Fans, stacks, and coverflows can communicate physicality, but must not force players to repeatedly uncover options to compare them. Provide a readable side-by-side or flat comparison view when the decision requires it. Preserve selection and state when switching views, and reuse the same shared components.

- **Make essential interactions discoverable.** Inspection and other important secondary actions need a visible alternative or clear guidance. Long press, right-click, and keyboard shortcuts may accelerate access, but must not be the only discoverable path. Ensure the visible alternative works with touch and keyboard.

- **Preserve object identity through transitions.** Track the specific piece or card instance as it moves, expands, rotates, changes state, or returns. Motion should explain its source and destination using the same graphical assembly; do not substitute a generic icon or confuse identical-looking copies. Preserve this continuity when reduced motion makes transitions immediate, and keep private information concealed throughout.

- **Design the whole interaction.** Include available, selected, targeting, preview, pending, confirmed, cancelled, unavailable, and rejected states where relevant. Use graphical feedback and motion to explain what changed, while preserving readable symbols and labels.

- **Keep feedback near its cause and outcomes explainable.** Show awards, costs, and state changes beside the relevant pieces or destinations, then update cumulative totals. Let players review the contributing cards, combinations, or actions behind a calculated result. A total and an animation alone are not an explanation. Preserve access to that explanation after transient feedback disappears.

- **Let players control the pace.** Automatic progression should provide clear pause, manual, and review options so movement, counting, and scoring do not outrun understanding. Keep these controls discoverable during play. Present a visible countdown when an action will happen automatically, allow immediate activation when appropriate, and preserve the current decision or review position when pausing. Reduced motion and slower decision pacing are separate preferences.

- **Keep review tools thin and honest.** They supply fixtures and playback controls to shared production components. Direct interaction must preserve the specific piece and destination selected. Canned animation studies must be clearly separate from interactive review. Reusable inspectors and interaction helpers belong in the shared presentation layer.

- **Separate presentation from game authority.** Shared components emit typed choices and render supplied state. Before a rules engine exists, use a deterministic fixture adapter through the intended production interface. Simulated outcomes must not require a second UI implementation. Components must support authoritative availability and rejection without embedding game legality.

- **Preserve usability across inputs and screens.** Provide keyboard access, visible focus, adequate touch targets, reduced motion, and readable scaling. Semantic HTML buttons are welcome when they visually and behaviorally represent the game objects.

## Definition of done

Before calling a component or interaction done:

- Demonstrate a complete interaction using the shared components, including cancellation and rejection.
- Confirm that the specific selected object and destination survive the full interaction.
- Inspect the result at actual phone and desktop sizes, and in tabletop mode where supported.
- Verify that gallery and review routes use the same component implementations and interaction primitives intended for production.
- Show that production can supply authoritative state without replacing the reviewed UI.
- Clearly document simulated outcomes and remaining integration work.
