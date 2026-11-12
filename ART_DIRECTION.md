# Via Nova — Art direction proposals

**Status: awaiting your art-style approval.** These are three original visual explorations for the digital implementation of Stefan Alexander's Via Nova. No direction has been selected. Each sheet compares a city scene, enlarged building tiles, and a phone treatment.

The concepts were generated with the built-in image generation tool on 2026-11-12. All three images are saved in [art/proposals](art/proposals/); the exact prompts and generation notes are in [prompts.json](art/proposals/prompts.json). They explore visual language rather than reproduce the supplied PDF's illustrations.

## Shared visual requirements

The style must support a city assembled from square spaces on dominos and single rebuild tiles. Preserve the rulebook's building colors: **yellow Quarry, orange Market, blue Temple, red Barracks, green Library, purple Arch**. Distinct silhouettes and small functional icons supplement color: cut stone/tool, market stall, classical temple, military building/shield, library/scroll, and freestanding arch. Keep player ownership separate through colored bases, seat symbols, and labels.

Use clear Arabic 1 and 2 numerals for population. Reserve quiet, high-contrast panels for scoring, double-domino marks, + stacks, and Arch 3 or 2 2 2 marks. Scroll and banner shapes must remain distinguishable at phone scale. The player should recognize a building before studying its illustration.

All concepts need the same functional layers: building art, square boundary, domino grouping, scoring panel, action marks, ownership, and selection/preview overlays. Generate illustrations as assets; build geometry, rules symbols, labels, numbers, and highlights as crisp interface elements. A flattened concept image must never become the game board.

## 1. Fresco Civitas

![Fresco Civitas concept sheet](art/proposals/01-fresco-civitas.png)

**Character:** warm, inviting Roman civic life. Painted plaster, mineral pigments, terracotta roofs, and small illustrated architectural details give each city a handmade board-game presence.

**Treatment:** shallow isometric gouache buildings sit inside top-down square spaces. Ivory panels, dark umber type, rust Battle trays, and sage Invention trays create a calm frame. Suggested interface palette: plaster `#F4E7CE`, umber `#3C2A20`, terracotta `#A64B35`; retain the six functional building colors independently.

**Typography and motion:** a restrained inscription-inspired serif for titles, a highly legible sans serif for rules and values. Tiles settle with a short soft movement; rebuilds lift and replace a layer; action highlights use a brief painted-edge glow.

**Device fit:** gives a large tabletop warmth and a strong sense of place. Phones need simplified crops, stronger color fields, and less plaster texture than the sheet. Decorative portraits and borders belong on the entrance or loading screen, leaving gameplay space to the cities.

**Production cost and risk:** the most illustration-heavy direction. Small scenes can lose silhouette clarity and make yellow/orange or red/orange hard to distinguish. Commission or generate six consistent master buildings before expanding variants; keep symbol panels texture-free.

**Choose this if:** the priority is a welcoming illustrated board game with a rich Roman atmosphere.

## 2. Mosaic Forum

![Mosaic Forum concept sheet](art/proposals/02-mosaic-forum.png)

**Character:** bold geometric Roman mosaic. Large tesserae, architectural emblems, and mineral jewel colors give the game a distinctive ornamental identity.

**Treatment:** chunky building silhouettes and dark outlines sit against ivory grout. Midnight stone frames the table; cream panels separate controls from decoration. Suggested interface palette: midnight `#192D42`, limestone `#F2E3BF`, antique gold `#C99A3A`. The six building families retain their functional hues.

**Typography and motion:** sturdy serif display headings, plain sans serif labels. A tile drops into a socket; selected borders brighten as one continuous outline. Avoid shimmering individual tesserae, which would compete with legal-move highlights.

**Device fit:** strong emblems are recognizable across a tabletop and at small sizes. Phone tiles should use fewer, larger tesserae. Dark surrounds may work well in a dim room; bright-device testing must ensure that shadows and dark outlines do not swallow tile boundaries.

**Production cost and risk:** medium illustration effort, with strict consistency needed for tessera size and grout. The supplied sheet is too textured for final play and does not sufficiently distinguish the Invention areas by their frame treatment. Keep mosaic texture inside artwork and decorative margins; use plain scoring plaques and differentiated contest headings.

**Choose this if:** the priority is an unmistakable Roman visual identity with bold, symbolic components.

## 3. Architect's Atlas

![Architect's Atlas concept sheet](art/proposals/03-architects-atlas.png)

**Character:** a clear, contemporary city-planning atlas with Roman architectural drawings. Warm paper, fine charcoal contours, broad building colors, and generous spacing emphasize the placement puzzle.

**Treatment:** concise architectural emblems at normal scale, with detailed axonometric illustrations reserved for inspection and larger tiles. Suggested interface palette: warm paper `#F7F1E3`, charcoal `#30332F`, muted bronze `#977A4B`. Keep color fields more uniform and the paper texture lighter than in the generated sheet.

**Typography and motion:** a modest classical serif for the title and a humanist sans serif for controls and scoring. Preview placements with a clean ghost outline, trace matching edges, then show actions in an ordered strip. Rebuild motion exposes the replaced layer briefly without hiding the result.

**Device fit:** strongest starting point for small phone screens, keyboard focus, scoring overlays, and large late-game cities. Clear square boundaries and plain panels also suit a touch table viewed from multiple edges. Keep city growth unbounded by the decorative rectangular frame shown in the concept.

**Production cost and risk:** lowest expected illustration complexity and easiest to turn into a consistent component system. It can feel sparse without careful spacing and a few warm architectural details. The generated sheet remains more decorative than the intended production treatment; reducing borders will be part of the next pass.

**Choose this if:** the priority is spatial clarity across all four device categories.

## Comparison and recommendation

These are design judgments to validate in the component prototype, not measured usability results.

| Criterion | Fresco Civitas | Mosaic Forum | Architect's Atlas |
| --- | --- | --- | --- |
| Roman atmosphere | Warm, scenic | Strong, ornamental | Quiet, architectural |
| Phone readability potential | Good after simplification | Good with coarse tesserae | Strongest starting point |
| Shared-table presence | Rich and tactile | Bold and graphic | Calm and precise |
| Main risk | Illustration detail competes with symbols | Texture competes with boundaries | Too restrained or sparse |
| Relative production effort | High | Medium | Low to medium |

**Recommendation: Architect's Atlas.** Via Nova asks players to compare many colored edges, assess four contests, and read overlapping scoring footprints. Its clear component fields leave the most room for that information on phones while preserving a city-building identity on a shared table. Fresco Civitas is the alternative if illustrated warmth is the stronger priority.

## What the sheets do not approve

The generated scenes contain illustrative shortcuts. Population pieces appear on city tiles in some sheets; actual population belongs in reserve, on player boards, or in shared areas. The sheets omit or simplify scoring plaques, Arch action marks, double-domino marks, stacked rewards, and multiple players' cities. Mosaic Forum mischaracterizes the Invention frames. Blank scroll-like strips are composition placeholders, not new score tracks or components. The pictures do not establish legal positions, historical accuracy, a finite city boundary, or a complete tabletop layout.

The phone inset is a personal-screen concept and may show its owner's hand. A shared tabletop must keep unplayed hands on paired private devices. Full seat layouts and privacy interactions need their own functional review after style approval.

## Approval and next review

Approve **1 — Fresco Civitas**, **2 — Mosaic Forum**, or **3 — Architect's Atlas**, with any requested adjustments. Approval selects the visual direction; it does not sign off on the illustrative rule shortcuts above.

After selection, build a small production component sample before producing the complete asset set:

1. All six buildings at phone and tabletop sizes, including a marked domino and both Arch activations.
2. A rebuild with a scroll, one with a banner, and a two-tile + reward stack with both scoring panels visible.
3. Four player ownership treatments, 1/2 population pieces, and a contest with a tie and two rewards.
4. A late-game city with matching-edge previews, 3×3 scroll highlights, and row/column banner highlights across gaps.
5. Phone portrait/landscape, laptop, tablet, and four-seat tabletop views using those same components.

Review contrast, touch targets, color-independent recognition, symbol legibility, reduced motion, and actual tabletop viewing distance. Record the selected palette, font licenses, asset provenance, and any permissions for source materials before distributing production assets.
