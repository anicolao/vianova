<script lang="ts">
  import { type Person } from '../presentation/types';
  let {
    person,
    small = false,
    onclick
  }: { person: Person; small?: boolean; onclick?: () => void } = $props();
</script>

{#snippet figure()}<svg viewBox="0 0 40 46" aria-hidden="true"
    ><path
      d="M12 15C6 10 12 2 20 2S34 10 28 15L36 25L30 29L28 23V42H12V23L10 29L4 25Z"
      fill="var(--person-color)"
      stroke="#263d40"
      stroke-width="2"
    /><path d="M15 16Q20 19 25 16" fill="none" stroke="#fff4d9" opacity=".6" /><text
      x="20"
      y="35"
      text-anchor="middle"
      fill="#fff9e6"
      font-size="22"
      font-weight="700"
      font-family="Atkinson Hyperlegible,sans-serif">{person.value}</text
    ></svg
  >{/snippet}
{#if onclick}<button
    class="person {person.owner}"
    class:small
    aria-label="{person.ownerLabel ?? person.owner} population {person.value}"
    {onclick}
    data-component="Population">{@render figure()}</button
  >{:else}<span
    class="person {person.owner}"
    class:small
    role="img"
    aria-label="{person.ownerLabel ?? person.owner} population {person.value}"
    data-component="Population">{@render figure()}</span
  >{/if}

<style>
  .person {
    --person-color: #277b7a;
    width: 33px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    background: transparent;
    filter: drop-shadow(0 2px 1px #0002);
  }
  .person svg {
    width: 100%;
    height: 100%;
  }
  .person.coral {
    --person-color: #b85f53;
  }
  .person.gold {
    --person-color: #947222;
  }
  .person.lilac {
    --person-color: #85649d;
  }
  .person.small {
    width: 25px;
    height: 30px;
  }
  button.person {
    width: 44px;
    height: 44px;
  }
</style>
