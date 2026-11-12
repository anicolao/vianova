<script lang="ts">
  import { base } from '$app/paths';
  let { active = 'gallery' }: { active?: 'gallery' | 'lab' } = $props();
</script>

<header class="work-header">
  <div class="work-nav">
    <a class="brand" href="{base}/gallery/"
      ><span class="brand-mark"><span>∩</span></span>
      <div class="brand-title">VIA NOVA<small>THE DIGITAL WORKSHOP</small></div></a
    >
    <nav class="nav-links" aria-label="Workshop">
      <a
        class:current={active === 'gallery'}
        aria-current={active === 'gallery' ? 'page' : undefined}
        href="{base}/gallery/">Component gallery</a
      ><a
        class:current={active === 'lab'}
        aria-current={active === 'lab' ? 'page' : undefined}
        href="{base}/dev/animations/">Animation lab <span aria-hidden="true">↗</span></a
      >
    </nav>
  </div>
  <div class="mosaic-line"></div>
</header>
