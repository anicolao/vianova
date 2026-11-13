# Artwork and fonts

The selected direction is **Mosaic Forum**, option 2 in ART_DIRECTION.md. The original generated concept sheets and exact prompts remain in `art/proposals/` for provenance.

Production-facing art is original code-native SVG in `src/lib/components/BuildingArt.svelte`: six architectural motifs with a shared tessera pattern, dark grout outlines, mineral building colors, and cream stone. Borders, scoring symbols, values, ownership, and preview overlays are composed independently in Svelte/CSS. No published tile artwork or cropped concept-sheet components are shipped in the browser.

The code-native artwork is part of this GPL-3.0-only implementation. Concept art remains generated exploration; approval of the mosaic direction does not approve every detail of the original concept sheet.

Locally bundled fonts come from pinned Fontsource packages:

| Font | Use | License |
| --- | --- | --- |
| Cormorant Garamond, 600/700 | Titles and city/player names | SIL Open Font License 1.1 |
| Atkinson Hyperlegible, 400/700 | UI, labels, and values | SIL Open Font License 1.1 |

Copies of the installed font license notices are in `static/licenses/`. Fonts are bundled at build time, with no third-party font requests during use. Source game credit and ownership remain in NOTICE.
