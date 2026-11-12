<script lang="ts">
  import RewardStack from './RewardStack.svelte';
  import Population from './Population.svelte';
  import { owners, type Area } from '../presentation/types';
  let {
    kind,
    areas,
    onReward,
    onResolve,
    compact = false
  }: {
    kind: 'battle' | 'invention';
    areas: Area[];
    onReward?: (area: string, reward: string) => void;
    onResolve?: (area: string) => void;
    compact?: boolean;
  } = $props();
</script>

<section
  class="contest-board {kind}"
  class:compact
  data-component="ContestBoard"
  aria-label="{kind === 'battle' ? 'Battle' : 'Invention'} board"
>
  <header>
    <span>{kind === 'battle' ? '⚔' : '▧'}</span>
    <div>
      <h3>{kind === 'battle' ? 'Battle' : 'Invention'}</h3>
      <p>{kind === 'battle' ? 'Soldiers' : 'Engineers'} compete here</p>
    </div>
    <span class="threshold">3+<small>qualify</small></span>
  </header>
  <div class="areas">
    {#each areas as area, i}<section class="area" data-anchor={area.id} aria-label={area.label}>
        <div class="area-top">
          <span class="eyebrow">Area {i + 1}</span>{#if onResolve}<button
              class="resolve"
              aria-label="Resolve {area.label}"
              onclick={() => onResolve(area.id)}>Resolve ↗</button
            >{/if}
        </div>
        <div class="rewards">
          {#each area.rewards as reward}<RewardStack
              {reward}
              onclick={onReward ? () => onReward(area.id, reward.id) : undefined}
            />{/each}{#if !area.rewards.length}<div class="no-rewards">Awaiting refill</div>{/if}
        </div>
        <div class="area-population">
          {#each owners as owner}{@const people = area.people.filter(
              (p) => p.owner === owner
            )}{@const total = people.reduce((n, p) => n + p.value, 0)}{#if total}<div
                class="contender"
                title="{people[0]?.ownerLabel ?? owner}: {total} population"
                aria-label="{people[0]?.ownerLabel ?? owner}: {total} population{total >= 3
                  ? ', qualifies'
                  : ''}"
              >
                <div class="contender-people">
                  {#each people as person}<Population {person} small />{/each}
                </div>
                <b class:qualifies={total >= 3}>{total}</b>
              </div>{/if}{/each}
        </div>
      </section>{/each}
  </div>
</section>

<style>
  .contest-board {
    --contest: #a34e40;
    --tint: #ecd6bf;
    --tile-size: 66px;
    background: var(--tint);
    border: 1px solid #c2ac81;
    border-radius: 8px;
    overflow: hidden;
    color: #30433a;
    min-width: 0;
  }
  .invention {
    --contest: #657e55;
    --tint: #e1e4ca;
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #bba781;
    background: linear-gradient(90deg, #fff1d28c, transparent);
  }
  header > span:first-child {
    font-size: 23px;
    color: var(--contest);
  }
  h3 {
    font-size: 24px;
    line-height: 1;
    color: var(--contest);
  }
  header p {
    font-size: 9px;
    margin-top: 2px;
    color: #746d58;
  }
  .threshold {
    margin-left: auto;
    border: 1px solid #8f8662;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 700;
    text-align: center;
    padding: 2px 6px;
    background: #fff4d3;
  }
  .threshold small {
    display: block;
    font-size: 7px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 400;
  }
  .areas {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .area {
    padding: 9px;
    min-width: 0;
  }
  .area + .area {
    border-left: 1px dashed #aa9970;
  }
  .area-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    min-height: 24px;
  }
  .area-top .eyebrow {
    font-size: 8px;
    letter-spacing: 0.08em;
  }
  .resolve {
    border: 0;
    border-radius: 4px;
    background: #fff4d18c;
    color: var(--contest);
    font-size: 10px;
    font-weight: 700;
    min-height: 44px;
    padding: 5px;
  }
  .rewards {
    display: flex;
    justify-content: space-around;
    align-items: end;
    gap: 5px;
    padding: 8px 0 12px;
    min-height: 100px;
  }
  .area-population {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    min-height: 50px;
    border-top: 1px solid #b9ac875c;
    padding-top: 5px;
  }
  .contender {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .contender-people {
    display: flex;
    flex-wrap: wrap;
  }
  .contender b {
    font-size: 9px;
    color: #716b56;
    border: 1px solid #aaa180;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
  }
  .contender b.qualifies {
    background: #425a49;
    color: #fff2c9;
    border-color: #425a49;
  }
  .no-rewards {
    font-size: 11px;
    color: #767664;
  }
  .compact {
    --tile-size: 51px;
  }
  .compact header {
    padding: 7px 9px;
  }
  .compact h3 {
    font-size: 21px;
  }
  .compact .area {
    padding: 5px;
  }
  .compact .rewards {
    min-height: 76px;
  }
  .compact .area-population {
    gap: 1px;
  }
  .compact .area-population :global(.person) {
    width: 19px;
    height: 24px;
  }
  .compact .contender b {
    width: 15px;
    height: 15px;
    font-size: 8px;
  }
  @media (max-width: 480px) {
    .contest-board {
      --tile-size: 54px;
    }
    .area {
      padding: 7px;
    }
    .area-population :global(.person) {
      width: 22px;
      height: 27px;
    }
  }
</style>
