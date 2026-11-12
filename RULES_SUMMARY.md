# Via Nova — Rules summary

Implementation reference for **Via Nova Rules v56**, by **Stefan Alexander**, supplied in [the seven-page PDF](Via%20Nova%20Rules%20-%20v56.pdf). Stefan Alexander owns the rights and copyright to Via Nova. Page references below refer to that PDF. This summary preserves the rules while calling out details that still require component data or designer clarification.

## Goal and components (p. 1)

For 2–4 players, ages 10+, approximately 30–40 minutes. Build a personal city, generate actions by matching buildings, and compete with soldiers and engineers for rebuild tiles. Score visible scrolls and banners at the end; the highest total wins.

| Component | Full set |
| --- | ---: |
| Dominos (two connected building spaces) | 48 |
| Starting tiles, marked A/B/C on their backs | 12 |
| Single purple Arch tiles | 20 |
| Battle rebuild tiles | 26 |
| Invention rebuild tiles | 22 |
| Population meeples, with 1 and 2 sides | 64, 16 per color |
| Player boards with turn-order setup | 4 |
| Battle board / Invention board | 1 each |

Each shared board has **two separate areas**, making four areas total. Each area offers two reward choices; a choice can be a stack of two rebuild tiles.

## Setup (pp. 2–3)

Shuffle dominos, Battle rebuilds, and Invention rebuilds separately. Randomly remove tiles according to player count:

| Players | Dominos removed / retained | Battle rebuilds removed / retained | Invention rebuilds removed / retained |
| --- | --- | --- | --- |
| 2 | 17 / 31 | 11 / 15 | 9 / 13 |
| 3 | 8 / 40 | 5 / 21 | 4 / 18 |
| 4 | 0 / 48 | 0 / 26 | 0 / 22 |

Reveal five dominos as the shared market. Reveal two reward choices in each of the four areas. If a revealed rebuild has a **+**, draw another from that supply and overlap the pair with both scoring panels visible. Ignore any + on the second tile: a stack never grows beyond two.

Choose a start player. In clockwise order, each player:

1. Takes the player board for their turn order.
2. Takes 16 meeples of one color into their reserve, 1-side up, and five single Arches.
3. Takes one A, one B, and one C starting tile and arranges them exactly as illustrated on p. 3, with black arrows pointing toward one another. The illustrated city has a stepped arrangement of six building spaces; it is not a freely chosen starting layout.
4. Draws five dominos and keeps a **total value of exactly four**. An unmarked domino has selection value 1; a double-domino-marked domino has value 2. Return the others to the bottom of the draw stack.
5. Moves reserve meeples to the Soldier and Engineer sections as specified by that turn-order board's Setup panel.
6. Places one 1-side meeple in **each** of the four Battle/Invention areas.

Starting-hand selection value is distinct from hand size. During play, every domino occupies one hand slot, including marked dominos. The turn-order-specific Soldier/Engineer allocations and exact starting-tile coordinates need a verified component manifest; do not replace them with identical allocations or a generic rectangle.

## Turn structure (pp. 4–6)

Choose **one** of the following four options. Complete its resulting actions and choices, then refill the market to five and pass left. Actions are optional and cannot be saved for later turns.

### 1. Place a domino

Place a domino from your hand in any orientation, with at least one edge touching an existing city tile. Matching is optional. Each edge of the newly placed domino that matches an existing building's color generates one action of that building type. Multiple matching edges can generate multiple actions. Resolve the earned actions in any order.

| Building | Color | One action |
| --- | --- | --- |
| Quarry | Yellow | Take a domino, as described below. |
| Market | Orange | Move one reserve meeple to your Soldier or Engineer section, 1-side up. |
| Temple | Blue | Upgrade one Soldier or Engineer on your player board from 1 to 2. |
| Barracks | Red | Deploy one Soldier from your player board to either Battle area, preserving its side. |
| Library | Green | Deploy one Engineer from your player board to either Invention area, preserving its side. |
| Arch | Purple | No matching action; see the special activation rules. |

**Taking a domino:** One action takes either an unmarked market domino or the top domino of the face-down stack. A marked market domino costs two actions. The hand limit is **five actual dominos**, marked or unmarked; at the limit you cannot take another. The PDF charges the extra action for a marked **market** tile, not for a blind draw. Market vacancies are refilled at turn end, not after each take.

**Domino Arch marked 3:** Choose one building adjacent to the newly placed Arch and take three actions of that building. You may choose the other half of the same domino. The other building's matching actions may be taken before or after these three actions. An existing Arch gives no action when matched or activated.

All Arches are permanent: neither an Arch on a domino nor a single Arch can ever be covered by a rebuild.

### 2. Place a single Arch

Place a single Arch from your supply next to a building in your city. Choose a straight direction: up, down, left, or right. Its **2 2 2** activates the next three spaces in that direction, starting immediately beside the Arch. Take two actions from each building **in that spatial order**.

An empty space or another Arch gives no actions but still uses one of the three positions. Do not skip a gap to reach a fourth space. This Arch also remains permanently uncovered.

### 3. Resolve areas

You may resolve one or more areas in which **you have at least three population**, counting a 2-side meeple as two. Choose the areas and their resolution order; eligible areas can be left unresolved.

For each chosen area:

1. Only players with at least three population qualify for rewards. Rank these players by population; break ties starting with the active player, then clockwise.
2. The highest-ranked player chooses one offered reward; the second-ranked takes the other. These players must take their rewards. Take both tiles if a chosen reward is stacked. All other players get nothing. If only one player qualifies, the unchosen reward stays.
3. Return **every player's** meeples from the area. Reward recipients return theirs to reserve, **1-side up**. Everyone who got no reward returns theirs to the matching Soldier or Engineer section on their player board, **2-side up**, including players below the qualifying threshold.
4. Immediately refill vacated reward slots, applying the + stacking rule, before resolving the next chosen area.

After resolving **all chosen areas**, every recipient places all awarded rebuild tiles over buildings in their own city. Place tiles individually in any order. You may cover previous rebuilds, but **never cover an Arch**. Only the top tile's building, color, and scoring symbol count. Rebuilding generates no actions; the replacement building can generate matches on future turns.

### 4. Take dominos

Take two Quarry-style “take a domino” actions. A marked market domino consumes both actions. The five-domino hand limit still applies.

## Ending the game (p. 7)

When any one of the three supplies runs out—domino draw stack, Battle rebuild supply, or Invention rebuild supply—finish the current turn. Then **each player gets one final turn**, ending with the player who emptied the supply. The triggering player therefore takes another turn. Leave reward spaces empty when there are insufficient rebuild tiles to refill them.

After those final turns, resolve **all four areas**. Award tiles and return meeples as usual, with the same three-population qualification. Final-resolution ties start with the player to the left of whoever took the last turn, then proceed clockwise. Place all awarded rebuilds before scoring.

## Scoring (p. 7)

Score every **visible** scroll and banner. A plain number scores that fixed number of points. Otherwise multiply its printed number by the number of matching items within its scoring footprint.

- **Scroll:** the 3×3 neighborhood centered on its tile, including diagonals and its own tile.
- **Banner:** its tile's entire row and column, including its own tile. Gaps do not interrupt the lines. Count the intersection tile once.

Count a matching item at most once for each scoring symbol. The same item may count again for a different scoring symbol.

The scoring key illustrated in v56 contains:

| Scoring condition | Scroll multiplier | Banner multiplier |
| --- | ---: | ---: |
| Fixed points | 3 points | 1 or 3 points |
| Quarries, Markets, Temples, Libraries, or Barracks | 1 per matching building | 1 per matching building |
| Arches | 2 per Arch | 2 per Arch |
| Scrolls | 2 per scroll | — |
| Banners | — | 1 per banner |
| Scroll-and-banner pairs | 3 per pair | 3 per pair |

For pairs, use the smaller of the scroll and banner counts within the footprint. Two scrolls and three banners make two pairs, worth six points. The scoring symbol itself may contribute to its own count. Fixed-value symbols are still scrolls or banners for other symbols' counts. The printed tile manifest must record each actual symbol and multiplier; this table describes the illustrated key, not the frequency of each tile.

Highest total wins. A tie is broken by the greatest population **on the player board**, counting upgraded meeples as two. Reserve population does not count. If still tied, share victory.

## Designer review and implementation questions

The text and diagrams establish the core rules, but the PDF is not a complete machine-readable component manifest. Resolve these items with Stefan before locking rules behavior:

- **Exact component inventory:** obtain every domino face, double-domino mark, rebuild face, + mark, and scoring symbol, together with the A/B/C starting coordinates and all four turn-order setup allocations. The overview pictures alone cannot establish the full distribution.
- **Setup procedure:** confirm per-player starting-hand draw/return order and any rule for an opening draw with no subset totaling exactly four. Confirm whether returned dominos retain a player-chosen or prescribed order.
- **Placement conventions:** confirm the formal square-grid placement constraints, rotations of starting tiles, and whether the single Arch's activation direction must start at an adjacent occupied building. The examples show empty, non-overlapping city spaces and edge adjacency.
- **Action timing:** clarify whether the three actions of a domino Arch must stay together, and exactly how two Quarry actions can be combined to buy a marked market domino when other generated actions intervene.
- **Exhaustion:** confirm when the end trigger latches if the draw stack is temporarily empty during setup; how to handle attempts to draw from an empty supply during final turns; and what an eligible claimant does when an area's reward slots are partly or entirely empty.
- **Final resolution:** confirm the order of the four areas and whether reward refills occur during that automatic resolution. The text says to resolve all areas and award as usual, without specifying area order.
- **Private information:** the phrase “hand” suggests private domino identities; confirm public hand counts, visibility of starting rejects, and whether removed tiles remain unseen.

Keep these decisions separate from the source summary, record Stefan's answers with a rules version, and test the resulting edge cases. Art proposals must never serve as evidence for tile counts, topology, or rules.
