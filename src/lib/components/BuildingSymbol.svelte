<script lang="ts">
  import type { Building } from '../presentation/types';
  const viewBoxes: Record<Building, string> = {
    quarry: '4 2 26 28',
    market: '2 2 28 28',
    temple: '2 2 28 28',
    barracks: '3 2 26 28',
    library: '0 2 32 28',
    arch: '2 2 28 28'
  };
  let { building }: { building: Building } = $props();
</script>

<!-- Designer's six semantic silhouettes; shared by buildings, scores and actions. -->
<svg
  viewBox={viewBoxes[building]}
  class="building-symbol"
  data-building-symbol={building}
  aria-hidden="true"
>
  {#if building === 'quarry'}
    <path d="M5 6Q19 2 29 13L25 16Q18 9 7 10Z" fill="currentColor" />
    <path d="M19 8L7 28" fill="none" stroke="currentColor" stroke-width="5" />
  {:else if building === 'market'}
    <path d="M11 3H21V7L20 10Q26 15 23 24L19 29H13L9 24Q6 15 12 10L11 7Z" fill="currentColor" />
    <path
      d="M10 11Q1 7 5 20L10 22M22 11Q31 7 27 20L22 22"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    />
  {:else if building === 'temple'}
    <path d="M3 3H29V8H24L21 12V22L29 25V29H3V25L11 22V12L8 8H3Z" fill="currentColor" />
  {:else if building === 'barracks'}
    <path d="M4 3L10 5L24 22L20 26L6 9ZM28 3L22 5L8 22L12 26L26 9Z" fill="currentColor" />
    <path
      d="M17 24L25 17M7 17L15 24M23 25L28 29M9 25L4 29"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    />
  {:else if building === 'library'}
    <path d="M3 6Q9 2 15 7V27Q9 23 3 26ZM17 7Q23 2 29 6V26Q23 23 17 27Z" fill="currentColor" />
    <path
      d="M1 9V29Q8 26 14 30H18Q24 26 31 29V9"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    />
  {:else}
    <path d="M3 3H29V9H27V29H20V19Q20 11 16 11Q12 11 12 19V29H5V9H3Z" fill="currentColor" />
  {/if}
</svg>

<style>
  .building-symbol {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>
