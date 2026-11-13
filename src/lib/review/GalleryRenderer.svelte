<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createPresentationController } from '../presentation/controller';
  import { createFixtureAdapter } from './fixture-adapter';
  import { owners, type Owner, type GamePresentation } from '../presentation/types';
  import type { ViewIntent } from '../presentation/intents';
  import InteractionPanel from '../components/InteractionPanel.svelte';
  import BuildingInspector from '../components/BuildingInspector.svelte';
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
  import ScoringReview from '../components/ScoringReview.svelte';
  import GameLog from '../components/GameLog.svelte';
  import { manifest, startingCity } from '../manifest';
  import { fixture, tile } from './fixtures';
  import type { GalleryItem } from './catalog';
  let { item, large = false }: { item: GalleryItem; large?: boolean } = $props();
  const controller = createPresentationController(makePresentation(), createFixtureAdapter());
  function makePresentation(): GamePresentation {
    const v = fixture();
    if (item.renderer === 'PlayerMat' && owners.includes(item.variant as Owner)) {
      v.viewer = item.variant as Owner;
      v.active = v.viewer;
    }
    if (item.setupOrder) {
      const setup = manifest.playerBoards[item.setupOrder - 1];
      const p = v.players.find((p) => p.owner === v.viewer)!;
      const pieces = Array.from({ length: 16 }, (_, n) => ({
        id: `setup-${item.setupOrder}-${n}`,
        owner: v.viewer,
        value: 1 as const
      }));
      p.soldiers = pieces.splice(0, setup.soldiers);
      p.engineers = pieces.splice(0, setup.engineers);
      p.reserve = pieces.splice(0, setup.reserve);
      p.arches = 5;
      p.handCount = 0;
    }
    if (item.variant === 'starting-city') v.city = startingCity();
    if (item.kind === 'person' && item.person) {
      v.viewer = item.person.owner;
      v.active = v.viewer;
      v.players.find((p) => p.owner === v.viewer)!.soldiers[0] = item.person;
    }
    if (item.variant === 'start-choice') v.startingDominos = [...v.hand, ...v.market.slice(0, 2)];
    if (item.kind === 'tile' && item.tile) v.city[0].tile = item.tile;
    return {
      view: v,
      focus: {},
      context: 'city',
      label: 'Choose specific objects',
      detail: 'Simulated fixture adapter',
      motions: [],
      actions: [
        { id: 'upgrade', building: 'temple', count: 2, available: true },
        { id: 'recruit', building: 'market', count: 1, available: true }
      ]
    };
  }
  $effect(() => {
    item.id;
    controller.replace(makePresentation());
  });
  const snapshot = $derived($controller),
    f = $derived(snapshot.presentation.view),
    a = $derived(snapshot.availability),
    i = $derived(snapshot.interaction),
    selection = $derived(i.selection);
  const send = (intent: ViewIntent) => controller.dispatch(intent);
  const inspectorCells = $derived(
    i.inspector?.owner === f.viewer
      ? f.city
      : i.inspector
        ? (f.opponentCities[i.inspector.owner] ?? [])
        : []
  );
  const inspected = $derived(
    i.inspector
      ? (inspectorCells.find((c) => c.x === i.inspector!.x && c.y === i.inspector!.y) ?? null)
      : null
  );
  onDestroy(() => controller.destroy());
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
  {#if item.kind === 'tile' && item.variant?.endsWith('-back')}<Tile
      back
      backKind={item.variant.slice(0, -5)}
    />
  {:else if item.kind === 'tile'}<Tile
      tile={item.tile}
      onclick={() => send({ type: 'inspect-cell', owner: f.viewer, x: 0, y: 0 })}
    />
  {:else if item.kind === 'domino'}<Domino domino={item.domino} back={item.variant === 'back'} />
  {:else if item.kind === 'person' && item.person}<div class="population-sample">
      <Population
        person={f.players
          .find((p) => p.owner === item.person!.owner)
          ?.soldiers.find((p) => p.id === item.person!.id) ??
          f.areas.flatMap((a) => a.people).find((p) => p.id === item.person!.id) ??
          item.person}
        onclick={() =>
          send({
            type: 'person',
            owner: item.person!.owner,
            group: 'soldiers',
            id: item.person!.id
          })}
      /><span>{item.person.value === 1 ? 'Ready population' : 'Upgraded population'}</span>
    </div>
  {:else if item.kind === 'mark' && item.mark}<div class="mark-sample">
      <Tile tile={tile('temple', item.id, { score: item.mark })} /><ScoreSymbol mark={item.mark} />
    </div>
  {:else if item.variant === 'battle' || item.variant === 'invention'}{#if item.kind === 'board'}<ContestBoard
        kind={item.variant}
        areas={f.areas.filter((a) => a.kind === item.variant)}
        availability={a.areas}
        rewardAvailability={a.rewards}
        disabled={snapshot.pending}
        onResolve={(area) => send({ type: 'resolve', area })}
        onReward={(area, reward) => send({ type: 'select-reward', area, reward })}
      />{:else}<SupplyDeck kind={item.variant} count={item.variant === 'battle' ? 15 : 12} />{/if}
  {:else if item.variant === 'dominos' || item.variant === 'empty-supply'}<SupplyDeck
      kind="dominos"
      count={item.variant === 'empty-supply' ? 0 : 24}
    />
  {:else if item.variant === 'reward'}{@const reward = f.areas[0].rewards.find(
      (r) => r.id === 'battle0-r0'
    )}{#if reward}<RewardStack
        {reward}
        onclick={() => send({ type: 'select-reward', area: f.areas[0].id, reward: reward.id })}
      />{:else}<p>Reward claimed</p>{/if}
  {:else if item.renderer === 'PlayerMat'}<PlayerMat
      player={f.players.find((p) => p.owner === item.variant)!}
      active
      availability={a.people}
      disabled={snapshot.pending}
      onPerson={(group, id) => send({ type: 'person', owner: f.viewer, group, id })}
    />
  {:else if item.variant === 'city' || item.variant === 'starting-city'}<CityBoard
      cells={f.city}
      focus={{ matches: ['1,1', '1,2'] }}
      onSelect={(cell) =>
        send(
          selection?.kind === 'rebuild'
            ? { type: 'target-cell', x: cell.x, y: cell.y }
            : { type: 'inspect-cell', owner: f.viewer, x: cell.x, y: cell.y }
        )}
    />
  {:else if item.variant === 'arches'}<div class="arch-supply">
      {#each Array(5) as _, i}<div style:margin-left={i ? '-55px' : '0'}>
          <Tile tile={tile('arch', `supply-arch-${i}`, { arch: '222' })} />
        </div>{/each}
    </div>
  {:else if item.variant === 'market'}<DominoMarket
      dominos={f.market}
      availability={a.market}
      disabled={snapshot.pending}
      selected={selection?.kind === 'market' ? selection.id : null}
      onTake={(id) => send({ type: 'take-market', id })}
    />
  {:else if item.variant === 'hand' || item.variant === 'concealed'}<PrivateHand
      dominos={f.hand}
      privateView={item.variant !== 'concealed'}
      availability={a.hands}
      disabled={snapshot.pending}
      selected={selection?.kind === 'place' ? selection.id : null}
      onSelect={(id) => send({ type: 'select-domino', id })}
    />
  {:else if item.variant === 'start-choice'}{#if f.startingDominos}<StartingChoice
        selectedIds={i.startingIds}
        selectionValue={a.startingValue}
        canKeep={a.startingKeep.enabled}
        onToggle={(id) => send({ type: 'toggle-starting', id })}
        dominos={f.startingDominos}
        disabled={snapshot.pending}
        onKeep={(ids) => send({ type: 'keep-starting', ids })}
      />
    {:else}<PrivateHand dominos={f.hand} />{/if}
  {:else if item.variant === 'action-queue'}<ActionQueue
      actions={snapshot.presentation.actions ?? []}
      selected={i.selectedAction}
      disabled={snapshot.pending}
      skipAvailable={a.skip.enabled}
      onChoose={(action) => send({ type: 'choose-action', action })}
      onSkip={() => send({ type: 'skip-actions' })}
    />
  {:else if item.variant === 'actions'}<TurnControls
      selected={i.selectedAction}
      availability={a.turn}
      disabled={snapshot.pending}
      onAction={(action) => send({ type: 'choose-action', action })}
    />
  {:else if item.variant === 'score-sheet'}<ScoringReview
      rows={f.scores}
      cells={f.city}
      open={i.scoring}
      onToggle={() => send({ type: 'inspect-score' })}
      onSelect={(cell) => send({ type: 'inspect-cell', owner: f.viewer, x: cell.x, y: cell.y })}
    />
  {:else if item.variant === 'chronicle'}<GameLog entries={f.log} />
  {/if}
  <InteractionPanel {snapshot} onIntent={send} showContextTargets={item.variant !== 'city'} />
  <BuildingInspector cell={inspected} onClose={() => send({ type: 'close-inspector' })} />
  {#if f.log[0]?.startsWith('Simulated:')}<p class="sample-note" aria-live="polite">
      {f.log[0]}
    </p>{/if}
</div>

<style>
  .renderer {
    --tile-size: 128px;
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
    --tile-size: 220px;
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
