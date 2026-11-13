# Shipped mosaic layers

Generated with the built-in **imagegen** tool on 2026-11-12. [prompts.json](prompts.json) contains every exact prompt and original output location. Project-bound display assets are checked in at [static/assets/mosaic](../../static/assets/mosaic/): six building faces (768 px square), navy reverse, two transparent scoring plaques (768 px wide), transparent wooden meeple (384 px high), three 1536 px board/mat substrates, and a 1536 px recessed stone tray. Alpha was preserved during derivative resizing with macOS `sips`; no opaque checkerboard was substituted.

Artwork, physical edge and blank material zones are image layers. Building silhouettes, score conditions, numerals, ownership, starting arrows and selection feedback remain live shared component layers. These images are never complete flattened game components or alternate gallery renderers. See [ART_DIRECTION.md](../../ART_DIRECTION.md), [VISUAL_DESIGN.md](../../VISUAL_DESIGN.md) and [docs/PRESENTATION.md](../../docs/PRESENTATION.md).


## Banner revision · 2026-11-13

The active banner is [score-banner-v2.png](../../static/assets/mosaic/score-banner-v2.png), a 768 px wide alpha derivative generated with built-in imagegen. It replaces the original decorative plaque with a hanging cloth silhouette. [banner-v2.json](banner-v2.json) records the exact edit prompt, original output and edit target. The v1 image is retained for provenance. The shared component renders v2 whole so its tails survive at game size; the calibration, live score ink and family symbols remain separate layers.
