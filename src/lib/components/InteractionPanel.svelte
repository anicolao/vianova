<script lang="ts">
  import { tick } from 'svelte';
  import { rewardKey, type ControllerSnapshot } from '../presentation/controller';
  import type { ViewIntent } from '../presentation/intents';
  import Domino from './Domino.svelte';
  import Tile from './Tile.svelte';
  import Population from './Population.svelte';
  import RewardStack from './RewardStack.svelte';
  import CityBoard from './CityBoard.svelte';
  import PlayerMat from './PlayerMat.svelte';
  import PrivateHand from './PrivateHand.svelte';
  import DominoMarket from './DominoMarket.svelte';
  import SupplyDeck from './SupplyDeck.svelte';
  import ContestBoard from './ContestBoard.svelte';
  let {
    snapshot,
    onIntent,
    showContextTargets = false
  }: {
    snapshot: ControllerSnapshot;
    onIntent: (intent: ViewIntent) => void;
    showContextTargets?: boolean;
  } = $props();
  let panel = $state<HTMLElement>();
  const choiceKey = $derived(
    snapshot.interaction.selection
      ? JSON.stringify([
          snapshot.interaction.selection.kind,
          'id' in snapshot.interaction.selection
            ? snapshot.interaction.selection.id
            : 'area' in snapshot.interaction.selection
              ? snapshot.interaction.selection.area
              : null
        ])
      : snapshot.interaction.selectedAction
  );
  $effect(() => {
    const key = choiceKey;
    if (key) void tick().then(() => panel?.focus());
  });
  const v = $derived(snapshot.presentation.view),
    s = $derived(snapshot.interaction.selection),
    a = $derived(snapshot.availability);
  const person = $derived(
    s?.kind === 'person'
      ? v.players.find((p) => p.owner === s.owner)?.[s.group].find((p) => p.id === s.id)
      : undefined
  );
  const area = $derived(
    s?.kind === 'resolve' ? v.areas.find((area) => area.id === s.area) : undefined
  );
  const domino = $derived(
    s?.kind === 'market'
      ? v.market.find((d) => d.id === s.id)
      : s?.kind === 'place'
        ? v.hand.find((d) => d.id === s.id)
        : undefined
  );
  const rebuild = $derived(
    s?.kind === 'rebuild' ? v.rebuilds?.find((t) => t.id === s.id) : undefined
  );
</script>

{#if s || snapshot.interaction.selectedAction || snapshot.error || v.rebuilds?.length}<section
    class="interaction-panel"
    bind:this={panel}
    tabindex="-1"
    data-component="InteractionPanel"
    aria-label="Current choice"
    aria-busy={snapshot.pending}
  >
    {#if s?.kind === 'market'}<h3>Take this market domino?</h3>
      <div class="choice-art"><Domino {domino} /><code>{s.id}</code></div>
    {:else if s?.kind === 'place'}<h3>{s.at ? 'Review your placement' : 'Choose a city space'}</h3>
      <p>Domino <code>{s.id}</code>{s.at ? ` · (${s.at.x}, ${s.at.y})` : ''}</p>
    {:else if s?.kind === 'arch'}<h3>Place a permanent Arch</h3>
      <p>
        {s.at ? `At (${s.at.x}, ${s.at.y})` : 'Choose an empty city space.'} · Direction {[
          'right',
          'down',
          'left',
          'up'
        ][s.rotation]}
      </p>
    {:else if s?.kind === 'draw'}<h3>Draw one private domino?</h3>
      <p>The public log will not reveal its identity.</p>
    {:else if s?.kind === 'resolve'}<h3>{area?.label} · choose a reward</h3>
      <div class="reward-choices">
        {#each area?.rewards ?? [] as reward}<RewardStack
            {reward}
            selected={s.reward === reward.id}
            disabled={snapshot.pending || !a.rewards[rewardKey(area?.id ?? '', reward.id)]?.enabled}
            onclick={() => onIntent({ type: 'select-reward', area: s.area, reward: reward.id })}
          />{/each}
      </div>
      <p>
        {s.reward
          ? `Selected ${s.reward}. Awarded tiles will enter your rebuild tray.`
          : 'Select the exact reward to claim.'}
      </p>
    {:else if s?.kind === 'rebuild'}<h3>Choose a building to cover</h3>
      <div class="choice-art"><Tile tile={rebuild} /><code>{s.id}</code></div>
      <p>{s.at ? `Target (${s.at.x}, ${s.at.y})` : 'Tap an existing building in your city.'}</p>
    {:else if s?.kind === 'person'}<h3>Choose what this meeple does</h3>
      <div class="choice-art">
        {#if person}<Population {person} />{/if}<code>{s.id}</code>
      </div>
      <div class="choices">
        {#if s.group === 'reserve'}{#each ['soldiers', 'engineers'] as const as profession}<button
              class="control"
              aria-pressed={s.profession === profession}
              disabled={snapshot.pending}
              onclick={() => onIntent({ type: 'profession', profession })}
              >Create {profession === 'soldiers' ? 'Soldier' : 'Engineer'}</button
            >{/each}{:else}<button
            class="control"
            aria-pressed={s.operation === 'upgrade'}
            disabled={snapshot.pending || !a.upgrade.enabled}
            title={a.upgrade.reason}
            onclick={() => onIntent({ type: 'person-operation', operation: 'upgrade' })}
            >Upgrade to 2</button
          ><button
            class="control"
            aria-pressed={s.operation === 'deploy'}
            disabled={snapshot.pending || !a.deploy.enabled}
            onclick={() => onIntent({ type: 'person-operation', operation: 'deploy' })}
            >Deploy</button
          >{/if}
      </div>
      {#if s.operation === 'deploy'}<div class="choices">
          {#each v.areas as area}<button
              class="control"
              aria-pressed={s.area === area.id}
              disabled={snapshot.pending || !a.areas[area.id]?.enabled}
              title={a.areas[area.id]?.reason}
              onclick={() => onIntent({ type: 'select-area', area: area.id })}>{area.label}</button
            >{/each}
        </div>{/if}
    {:else if s?.kind === 'skip'}<h3>Skip remaining building actions?</h3>
      <p>All remaining actions will be discarded.</p>
    {:else if s?.kind === 'starting'}<h3>Keep this starting hand?</h3>
      <p>{s.ids.join(', ')}</p>
    {:else}<h3>Choose a target</h3>
      <p>
        {snapshot.interaction.selectedAction === 'draw'
          ? 'Select a market domino or the face-down stack.'
          : snapshot.interaction.selectedAction === 'resolve'
            ? 'Choose a contest area.'
            : snapshot.interaction.selectedAction === 'place'
              ? 'Choose a domino in your hand.'
              : 'Select the specific meeple to act with.'}
      </p>{/if}
    {#if showContextTargets && !s && snapshot.interaction.selectedAction}
      {@const action = snapshot.interaction.selectedAction}
      {#if action === 'place'}<PrivateHand
          dominos={v.hand}
          availability={a.hands}
          disabled={snapshot.pending}
          onSelect={(id) => onIntent({ type: 'select-domino', id })}
        />
      {:else if action === 'draw'}<DominoMarket
          dominos={v.market}
          availability={a.market}
          disabled={snapshot.pending}
          onTake={(id) => onIntent({ type: 'take-market', id })}
        /><SupplyDeck
          kind="dominos"
          count={v.supplies[0]}
          disabled={snapshot.pending || !a.draw.enabled}
          reason={a.draw.reason}
          onclick={() => onIntent({ type: 'draw' })}
        />
      {:else if action === 'resolve'}{#each ['battle', 'invention'] as const as kind}<ContestBoard
            {kind}
            areas={v.areas.filter((area) => area.kind === kind)}
            availability={a.areas}
            rewardAvailability={a.rewards}
            disabled={snapshot.pending}
            onResolve={(area) => onIntent({ type: 'resolve', area })}
            onReward={(area, reward) => onIntent({ type: 'select-reward', area, reward })}
          />{/each}
      {:else}{@const player = v.players.find((player) => player.owner === v.viewer)!}<PlayerMat
          {player}
          availability={a.people}
          disabled={snapshot.pending}
          onPerson={(group, id) => onIntent({ type: 'person', owner: player.owner, group, id })}
        />{/if}
    {/if}
    {#if showContextTargets && (s?.kind === 'place' || s?.kind === 'arch' || s?.kind === 'rebuild')}<CityBoard
        cells={v.city}
        disabled={snapshot.pending}
        staged={s.kind === 'place' && s.at ? { ...s.at, domino } : s.kind === 'arch' ? s.at : null}
        archTile={s.kind === 'arch'
          ? { id: 'arch-preview', building: 'arch', arch: '222' }
          : undefined}
        rotation={s.kind === 'place' || s.kind === 'arch' ? s.rotation : 0}
        onPlace={(x, y) => onIntent({ type: 'stage', x, y })}
        onSelect={(cell) =>
          onIntent(
            s.kind === 'rebuild'
              ? { type: 'target-cell', x: cell.x, y: cell.y }
              : { type: 'inspect-cell', owner: v.viewer, x: cell.x, y: cell.y }
          )}
      />{/if}
    {#if snapshot.error}<p role="alert" class="error">{snapshot.error}</p>{/if}
    {#if snapshot.pending}<p role="status">
        Applying your choice…
      </p>{:else if s && !a.confirm.enabled}<p class="reason">{a.confirm.reason}</p>{/if}
    {#if s || snapshot.interaction.selectedAction}<div class="controls">
        {#if s?.kind === 'place' || s?.kind === 'arch'}<button
            class="control"
            disabled={snapshot.pending}
            onclick={() => onIntent({ type: 'rotate' })}>↻ Rotate</button
          >{/if}<button
          class="control"
          disabled={snapshot.pending}
          onclick={() => onIntent({ type: 'cancel' })}>Cancel</button
        >{#if s}<button
            class="control primary"
            disabled={snapshot.pending || !a.confirm.enabled}
            onclick={() => onIntent({ type: 'commit' })}
            >{s.kind === 'place' || s.kind === 'arch'
              ? 'Place here ✓'
              : snapshot.error
                ? 'Retry confirmation'
                : 'Confirm choice'}</button
          >{/if}
      </div>{/if}
    {#if v.rebuilds?.length}<div class="rebuild-tray" aria-label="Rebuild tiles">
        <span>Rebuild tiles</span>{#each v.rebuilds as tile}<Tile
            {tile}
            selected={s?.kind === 'rebuild' && s.id === tile.id}
            disabled={snapshot.pending || !a.rebuilds[tile.id]?.enabled}
            onclick={() => onIntent({ type: 'select-rebuild', id: tile.id })}
          />{/each}
      </div>{/if}
  </section>{/if}

<style>
  .interaction-panel {
    --tile-size: 96px;
    padding: 15px;
    border: 1px solid #c4a562;
    background: #f3e4bf;
    border-radius: 8px;
    color: #293f38;
    min-width: 0;
  }
  .interaction-panel h3 {
    font-size: 24px;
  }
  .interaction-panel p {
    font-size: 12px;
    margin: 7px 0;
  }
  .choice-art,
  .reward-choices,
  .controls,
  .choices,
  .rebuild-tray {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 12px 0;
  }
  .choice-art code {
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  .controls .control,
  .choices .control {
    font-size: 11px;
  }
  .reason {
    color: #74633f;
  }
  .error {
    color: #993c31;
    font-weight: 700;
  }
  .rebuild-tray {
    border-top: 1px solid #c4a562;
    padding-top: 12px;
  }
  .rebuild-tray > span {
    font-size: 11px;
    width: 100%;
  }
  .choices [aria-pressed='true'] {
    outline: 2px solid #277b7a;
  }
</style>
