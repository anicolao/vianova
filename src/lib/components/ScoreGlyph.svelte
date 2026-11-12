<script lang="ts">
  let { shape }: { shape: 'scroll' | 'banner' | 'pairs' } = $props();
</script>

<svg class="score-glyph" viewBox="0 0 36 32" aria-hidden="true" data-score-glyph={shape}>
  {#if shape === 'scroll'}
    <path d="M8 6H28V26H8Z" fill="currentColor" /><path
      d="M5 5V27M31 5V27"
      stroke="currentColor"
      stroke-width="5"
      stroke-linecap="round"
    />
  {:else if shape === 'banner'}
    <path d="M5 6H31V28H23V23H13V28H5Z" fill="currentColor" /><path
      d="M3 3H33"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
    />
  {:else}
    <path d="M5 3H30V12H5Z M4 18H32V29H24V25H12V29H4Z" fill="currentColor" /><path
      d="M3 2V13M32 2V13"
      stroke="currentColor"
      stroke-width="3"
    />
  {/if}
</svg>

<style>
  .score-glyph {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
