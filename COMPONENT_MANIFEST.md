# Via Nova v56 component manifest

Complete physical inventory transcribed from Stefan Alexander’s [print-and-play workbook](pnp/Via%20Nova%20v56.xlsx), cross-checked against all four print PDFs and the rules. The versioned [machine-readable manifest](src/lib/manifest/v56.json) retains **every physical copy**, source worksheet/row, original asset filenames, PDF front-page/grid position and SHA-256 source hashes. Print backs are not extra pieces. Page/grid positions use front reading order; each following page is the duplex back. The workbook’s unused/filler back cells are excluded.

Regenerate with `python3 scripts/import-manifest.py`; verify with `python3 scripts/import-manifest.py --check`. The importer uses only Python’s standard library. Printed setup values and rules-diagram coordinates are explicit, reviewed transcription in that script. This is component data, not a rules engine.

| Physical component | Quantity | Notes |
| --- | ---: | --- |
| Game dominos | 48 | 96 building spaces; 13 marked, 35 unmarked |
| Starting dominos | 12 | Four each A/B/C; 24 building spaces |
| Single permanent Arches | 20 | Five per player, each 2·2·2 |
| Battle rebuilds | 26 | 16 conditional banners, ten + fixed-3 banners |
| Invention rebuilds | 22 | 18 conditional scrolls, four + fixed-3 scrolls |
| Population meeples | 64 | Four colour sets of 16, each reversible 1/2; not printed in pnp |
| Turn-order player boards | 4 | Setup differs by order, independently of colour |
| Shared boards | 2 | Battle and Invention; two areas each, two reward slots per area |

**128 physical tiles**, 188 building spaces, 64 meeples, six boards. Digital backs use a common navy mosaic material with explicit supply/starting symbols, preserving logical identity rather than reproducing conflicting print-back files. No other physical counters, decks or player pieces are listed in the supplied rules/reference set.

## Building and scoring identity

| Building | Designer symbol | Supporting colour |
| --- | --- | --- |
| Quarry | Pickaxe | Yellow |
| Market | Amphora | Orange |
| Temple | Pedestal/column capital | Blue |
| Barracks | Crossed swords | Red |
| Library | Open book | Green |
| Arch | Single arched gateway | Purple |

The same monochrome silhouette appears on each building and whenever a score/action refers to that family. Artwork is not used as a miniature scoring icon. Scrolls have rolled ends and a 3×3 footprint; banners hang from a rod, have square tabs, and use a row/column cross. Pair marks combine the scroll and banner silhouettes. Numerals, +, starting letters and double-cost marks remain separate live layers. Colours support recognition.

Ordinary domino half totals: Quarry 17, Market 18, Temple 17, Barracks 18, Library 18, Arch 8. The eight domino Arches have a 3-action mark; single Arches have 2·2·2. `double` is a two-action market cost, not a same-building pair. Identical copies retain distinct IDs.

## Setup

| Turn order | Soldiers | Engineers | In four shared areas | Reserve | Arches |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1st | 2 | 3 | 4 (one per area) | 7 | 5 |
| 2nd | 3 | 3 | 4 | 6 | 5 |
| 3rd | 4 | 3 | 4 | 5 | 5 |
| 4th | 4 | 4 | 4 | 4 | 5 |

All 16 population start value 1. Draw five dominos and keep value four (marked counts two); five public market slots; hand limit five. Each shared area qualifies at population three.

| Players | Remove dominos | Remove Battle | Remove Invention | Retained dominos including market |
| --- | ---: | ---: | ---: | ---: |
| 2 | 17 | 11 | 9 | 31 |
| 3 | 8 | 5 | 4 | 40 |
| 4 | 0 | 0 | 0 | 48 |

Starting layout uses x right, y down, normalized from rules p3, with empty diagonal gaps preserved:

| Group | Physical IDs | Source rows | First space | Second space |
| --- | --- | --- | --- | --- |
| A | start-57…60 | dominos 58–61 | Quarry (0,3) | Market (1,3) |
| B | start-53…56 | dominos 54–57 | Barracks (2,2) | Library (2,1) |
| C | start-49…52 | dominos 50–53 | Market (3,0) | Quarry (4,0) |

Black arrows face inward: A Market’s upper-right corner; B lower/upper junctions; C Market’s lower-left corner. B source artwork is sideways; digital building artwork stays upright while its two squares occupy the same vertical geometry. All four players receive the same layout.

## Source discrepancies retained

- `single tiles!G47` gives Battle 26 an Invention print-back filename, while type, front banner and logical `F47` identify Battle.
- `single tiles!G51` gives Invention 4 a Battle print-back filename, while type, front scroll and logical `F51` identify Invention.
- The summary planning row lists six Arches for two players. Printed twenty Arches and rules p3 establish five per player; the planning calculation is not used.
- Summary “dominos in game” values 26/35/43 exclude the five-domino market. Retained supply plus market is 31/40/48.

These are documented source conflicts, not silently repaired print files. The manifest preserves the original cells; logical classification follows type/front/F back and the printed rules.

## Game domino fronts

Physical rows, not just unique combinations. IDs match gallery references. “2” cost means marked.

| ID | First half | Second half | Cost | Workbook row |
| --- | --- | --- | ---: | ---: |
| domino-01 | Library | Temple · banner 1 VP | 1 | 2 |
| domino-02 | Library | Temple | 1 | 3 |
| domino-03 | Library | Temple | 1 | 4 |
| domino-04 | Library | Barracks · banner 1 VP | 1 | 5 |
| domino-05 | Library | Barracks | 1 | 6 |
| domino-06 | Market | Temple · banner 1 VP | 1 | 7 |
| domino-07 | Market | Temple | 1 | 8 |
| domino-08 | Market | Temple | 1 | 9 |
| domino-09 | Market | Library · banner 1 VP | 1 | 10 |
| domino-10 | Market | Library | 1 | 11 |
| domino-11 | Market · banner 1 VP | Library | 1 | 12 |
| domino-12 | Market | Barracks · banner 1 VP | 1 | 13 |
| domino-13 | Market | Barracks | 1 | 14 |
| domino-14 | Barracks | Temple | 1 | 15 |
| domino-15 | Barracks | Temple | 1 | 16 |
| domino-16 | Barracks | Temple | 1 | 17 |
| domino-17 | Quarry · banner 1 VP | Temple | 1 | 18 |
| domino-18 | Quarry | Temple | 1 | 19 |
| domino-19 | Quarry · banner 1 VP | Library | 1 | 20 |
| domino-20 | Quarry | Library | 1 | 21 |
| domino-21 | Quarry | Market | 1 | 22 |
| domino-22 | Quarry | Market | 1 | 23 |
| domino-23 | Quarry | Barracks | 1 | 24 |
| domino-24 | Quarry | Barracks | 1 | 25 |
| domino-25 | Quarry | Barracks | 1 | 26 |
| domino-26 | Barracks | Quarry · scroll 3 VP | 2 | 27 |
| domino-27 | Quarry | Market · scroll 3 VP | 2 | 28 |
| domino-28 | Quarry | Library · scroll 3 VP | 2 | 29 |
| domino-29 | Quarry | Temple · scroll 3 VP | 2 | 30 |
| domino-30 | Temple | Barracks · scroll 3 VP | 2 | 31 |
| domino-31 | Barracks | Library | 1 | 32 |
| domino-32 | Barracks | Market | 1 | 33 |
| domino-33 | Library · banner 1 VP | Market | 1 | 34 |
| domino-34 | Market · banner 1 VP | Temple | 1 | 35 |
| domino-35 | Barracks | Library | 1 | 36 |
| domino-36 | Quarry | Quarry | 1 | 37 |
| domino-37 | Market | Market | 1 | 38 |
| domino-38 | Barracks | Barracks | 1 | 39 |
| domino-39 | Library | Library | 1 | 40 |
| domino-40 | Temple | Temple | 1 | 41 |
| domino-41 | Arch [Arch 3] | Quarry | 2 | 42 |
| domino-42 | Arch [Arch 3] | Quarry | 2 | 43 |
| domino-43 | Arch [Arch 3] | Market | 2 | 44 |
| domino-44 | Arch [Arch 3] | Market | 2 | 45 |
| domino-45 | Arch [Arch 3] | Barracks | 2 | 46 |
| domino-46 | Arch [Arch 3] | Library | 2 | 47 |
| domino-47 | Arch [Arch 3] | Library | 2 | 48 |
| domino-48 | Arch [Arch 3] | Temple | 2 | 49 |

## Battle rebuild fronts

| ID | Face and scoring | Workbook row |
| --- | --- | ---: |
| battle-01 | Market · banner 1/quarry | 22 |
| battle-02 | Temple · banner 1/quarry | 23 |
| battle-03 | Barracks · banner 1/market | 24 |
| battle-04 | Quarry · banner 1/market | 25 |
| battle-05 | Library · banner 1/temple | 26 |
| battle-06 | Temple · banner 1/temple | 27 |
| battle-07 | Market · banner 1/library | 28 |
| battle-08 | Quarry · banner 1/library | 29 |
| battle-09 | Barracks · banner 1/library | 30 |
| battle-10 | Library · banner 1/barracks | 31 |
| battle-11 | Temple · banner 2/arch | 32 |
| battle-12 | Library · banner 2/arch | 33 |
| battle-13 | Market · banner 1/banner | 34 |
| battle-14 | Quarry · banner 1/banner | 35 |
| battle-15 | Barracks · banner 1/banner | 36 |
| battle-16 | Temple · banner 3/pairs | 37 |
| battle-17 | Quarry · banner 3 VP · + | 38 |
| battle-18 | Quarry · banner 3 VP · + | 39 |
| battle-19 | Market · banner 3 VP · + | 40 |
| battle-20 | Market · banner 3 VP · + | 41 |
| battle-21 | Temple · banner 3 VP · + | 42 |
| battle-22 | Temple · banner 3 VP · + | 43 |
| battle-23 | Library · banner 3 VP · + | 44 |
| battle-24 | Library · banner 3 VP · + | 45 |
| battle-25 | Barracks · banner 3 VP · + | 46 |
| battle-26 | Barracks · banner 3 VP · + | 47 |

## Invention rebuild fronts

| ID | Face and scoring | Workbook row |
| --- | --- | ---: |
| invention-01 | Quarry · scroll 1/quarry | 48 |
| invention-02 | Library · scroll 1/quarry | 49 |
| invention-03 | Market · scroll 1/market | 50 |
| invention-04 | Barracks · scroll 1/market | 51 |
| invention-05 | Temple · scroll 1/temple | 52 |
| invention-06 | Temple · scroll 1/temple | 53 |
| invention-07 | Library · scroll 1/library | 54 |
| invention-08 | Barracks · scroll 1/barracks | 55 |
| invention-09 | Library · scroll 1/barracks | 56 |
| invention-10 | Quarry · scroll 1/barracks | 57 |
| invention-11 | Temple · scroll 2/arch | 58 |
| invention-12 | Market · scroll 2/arch | 59 |
| invention-13 | Market · scroll 2/scroll | 60 |
| invention-14 | Library · scroll 2/scroll | 61 |
| invention-15 | Temple · scroll 2/scroll | 62 |
| invention-16 | Quarry · scroll 3/pairs | 63 |
| invention-17 | Barracks · scroll 3/pairs | 64 |
| invention-18 | Temple · scroll 3/pairs | 65 |
| invention-19 | Temple · scroll 3 VP · + | 66 |
| invention-20 | Quarry · scroll 3 VP · + | 67 |
| invention-21 | Barracks · scroll 3 VP · + | 68 |
| invention-22 | Market · scroll 3 VP · + | 69 |

`arch-01`…`arch-20` are the twenty identical single Arch 2·2·2 fronts (single tiles rows 2–21, first print page). Population IDs will be assigned by the eventual game setup; reversible value faces do not double the physical count.
