<script lang="ts">
  let { value }: { value: number } = $props();
</script>

<!-- A square building-tile frame distinguishes action counts from laurel VP values. -->
<svg class="action-value" viewBox="0 0 24 24" aria-hidden="true" data-action-value={value}>
  <path class="frame" d="M3 1.5H21L22.5 3V21L21 22.5H3L1.5 21V3Z" />
  <path class="lintel" d="M2 5H22M7 2V5M17 2V5" />
  <text x="12" y="13" dominant-baseline="central" text-anchor="middle">{value}</text>
</svg>

<style>
  .action-value {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .frame {
    fill: #f5e7c5;
    stroke: #967332;
    stroke-width: 1.5;
    stroke-linejoin: round;
  }
  .lintel {
    fill: none;
    stroke: #967332;
    stroke-width: 1;
  }
  text {
    fill: #30251a;
    font:
      700 18px 'Atkinson Hyperlegible',
      sans-serif;
  }
</style>
