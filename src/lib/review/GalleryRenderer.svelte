<script lang="ts">
  import Tile from '../components/Tile.svelte';
  import ActionQueue from '../components/ActionQueue.svelte';
  import Domino from '../components/Domino.svelte';
  import Population from '../components/Population.svelte';
  import ScoreSymbol from '../components/ScoreSymbol.svelte';
  import ContestBoard from '../components/ContestBoard.svelte';
  import PlayerMat from '../components/PlayerMat.svelte';
  import RewardStack from '../components/RewardStack.svelte';
  import CityBoard from '../components/CityBoard.svelte';
  import SupplyDeck from '../components/SupplyDeck.svelte';
  import PrivateHand from '../components/PrivateHand.svelte';
  import DominoMarket from '../components/DominoMarket.svelte';
  import StartingChoice from '../components/StartingChoice.svelte';
  import TurnControls from '../components/TurnControls.svelte';
  import ScoreSheet from '../components/ScoreSheet.svelte';
  import GameLog from '../components/GameLog.svelte';
  import { fixture, tile } from './fixtures';
  import type { GalleryItem } from './catalog';
  let { item, large = false }: { item: GalleryItem; large?: boolean } = $props();
  const f = fixture();
  let note = $state('');
</script>

<div
  class="renderer"
  class:large
  class:wide={item.kind === 'board' ||
    (item.kind === 'ui' &&
      !['dominos', 'battle', 'invention', 'empty-supply', 'arches'].includes(item.variant ?? ''))}
  data-review-id={item.id}
  data-renderer={item.renderer}
>
  {#if item.kind === 'tile'}<Tile tile={item.tile} />
  {:else if item.kind === 'domino'}<Domino domino={item.domino} back={item.variant === 'back'} />
  {:else if item.kind === 'person' && item.person}<div class="population-sample">
      <Population person={item.person} /><span
        >{item.person.value === 1 ? 'Ready population' : 'Upgraded population'}</span
      >
    </div>
  {:else if item.kind === 'mark' && item.mark}<div class="mark-sample">
      <Tile tile={tile('temple', item.id, { score: item.mark })} /><ScoreSymbol mark={item.mark} />
    </div>
  {:else if item.variant === 'battle' || item.variant === 'invention'}{#if item.kind === 'board'}<ContestBoard
        kind={item.variant}
        areas={f.areas.filter((a) => a.kind === item.variant)}
      />{:else}<SupplyDeck kind={item.variant} count={item.variant === 'battle' ? 15 : 12} />{/if}
  {:else if item.variant === 'dominos' || item.variant === 'empty-supply'}<SupplyDeck
      kind="dominos"
      count={item.variant === 'empty-supply' ? 0 : 24}
    />
  {:else if item.variant === 'reward'}<RewardStack reward={f.areas[0].rewards[0]} />
  {:else if item.renderer === 'PlayerMat'}<PlayerMat
      player={f.players.find((p) => p.owner === item.variant)!}
      active
    />
  {:else if item.variant === 'city'}<CityBoard cells={f.city} focus={{ matches: ['1,1', '1,2'] }} />
  {:else if item.variant === 'arches'}<div class="arch-supply">
      {#each Array(5) as _, i}<div style:margin-left={i ? '-55px' : '0'}>
          <Tile tile={tile('arch', `supply-arch-${i}`, { arch: '222' })} />
        </div>{/each}
    </div>
  {:else if item.variant === 'market'}<DominoMarket
      dominos={f.market}
      onTake={(id) => (note = `Selected ${id} for review.`)}
    />
  {:else if item.variant === 'hand' || item.variant === 'concealed'}<PrivateHand
      dominos={f.hand}
      privateView={item.variant !== 'concealed'}
      onSelect={(id) => (note = `Selected ${id} for review.`)}
    />
  {:else if item.variant === 'start-choice'}<StartingChoice
      dominos={[...f.hand, ...f.market.slice(0, 2)]}
      onKeep={(ids) => (note = `Kept ${ids.length} dominos in this local review.`)}
    />
  {:else if item.variant === 'action-queue'}<ActionQueue
      actions={[
        { id: 'upgrade', building: 'temple', count: 2, available: true },
        { id: 'recruit', building: 'market', count: 1, available: true }
      ]}
      onChoose={(id) => (note = `Review ${id} action`)}
      onSkip={() => (note = 'Remaining actions skipped in this review.')}
    />
  {:else if item.variant === 'actions'}<TurnControls
      onAction={(id) => (note = `Selected ${id} for review.`)}
    />
  {:else if item.variant === 'score-sheet'}<ScoreSheet rows={f.scores} />
  {:else if item.variant === 'chronicle'}<GameLog entries={f.log} />
  {/if}
  {#if note}<p class="sample-note" aria-live="polite">{note}</p>{/if}
</div>

<style>
  .renderer {
    --tile-size: 105px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 14px;
    max-width: 100%;
    width: 100%;
    min-width: 0;
    padding: 16px;
  }
  .renderer.large {
    --tile-size: 155px;
    padding: 24px;
  }
  .renderer.wide {
    padding: 18px;
    align-items: stretch;
  }
  .renderer :global(.contest-board) {
    width: 100%;
  }
  .renderer :global(.player-mat) {
    width: 100%;
    max-width: 400px;
    margin: auto;
  }
  .renderer :global(.supply) {
    color: #bdc7ad;
  }
  .renderer :global(.city-board) {
    width: 100%;
    max-width: 550px;
    margin: auto;
  }
  .population-sample {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .population-sample :global(.person) {
    width: 75px;
    height: 86px;
  }
  .population-sample span {
    font-size: 10px;
    color: #adbda7;
  }
  .mark-sample {
    display: flex;
    align-items: center;
    gap: 25px;
  }
  .mark-sample > :global(.score-symbol) {
    transform: scale(1.4);
    margin-right: 10px;
  }
  .arch-supply {
    display: flex;
    justify-content: center;
  }
  .sample-note {
    font-size: 11px;
    color: #f5dc9a;
    text-align: center;
  }
</style>
