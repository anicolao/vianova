<script lang="ts">
  import { tick, onMount } from 'svelte';
  import { base } from '$app/paths';
  import WorkshopHeader from './WorkshopHeader.svelte';
  import GalleryRenderer from './GalleryRenderer.svelte';
  import { categories, galleryItems, type Category, type GalleryItem } from './catalog';
  import Tile from '../components/Tile.svelte';
  import { tile } from './fixtures';
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
  let category = $state<Category>('buildings');
  let query = $state('');
  let selected = $state<GalleryItem | null>(null);
  let dialog: HTMLDialogElement;
  let lastTrigger: HTMLElement | null = null;
  let dark = $state(true);
  let monochrome = $state(false);
  const current = $derived(categories.find((c) => c.id === category)!);
  const visible = $derived(
    galleryItems.filter(
      (item) =>
        (query ? true : item.category === category) &&
        `${item.id} ${item.title} ${item.description} ${item.renderer}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )
  );
  async function inspect(item: GalleryItem, event: MouseEvent) {
    lastTrigger = event.currentTarget as HTMLElement;
    selected = item;
    await tick();
    dialog.showModal();
  }
  function close() {
    dialog.close();
    selected = null;
    lastTrigger?.focus();
  }
</script>

<svelte:head
  ><title>Component gallery · Via Nova</title><meta
    name="description"
    content="Review Via Nova's production Svelte components in the Mosaic Forum art direction."
  /></svelte:head
>
<WorkshopHeader />
<main class="work-main" inert={!hydrated}>
  <section class="page-heading">
    <div>
      <div class="eyebrow">Mosaic Forum · v56 physical collection</div>
      <h1>The pieces of a new Rome.</h1>
      <p>
        Stone, parchment, wood. The pieces of Via Nova, made to be handled.<br
          class="desktop-break"
        /> Compare the symbols without colour, inspect the layers, then try the same pieces in play.
      </p>
    </div>
    <div class="collection-seal">
      <div class="seal-art">
        <Tile tile={tile('arch', 'hero', { arch: '222' })} /><Tile
          tile={tile('library', 'hero-library', {
            score: { shape: 'scroll', multiplier: 1, target: 'library' }
          })}
        />
      </div>
      <span><i></i> Mosaic direction selected</span>
    </div>
  </section>
  <div class="collection-bar">
    <div>
      <strong>{galleryItems.length}</strong><span>review samples</span><span class="separator"
        >/</span
      ><strong>128</strong><span>physical tiles</span><span class="separator">/</span><span
        >Rules v56</span
      >
    </div>
    <a href="{base}/dev/animations/">Explore the animation lab <span>→</span></a>
  </div>
  <div class="gallery-layout">
    <aside class="category-sidebar">
      <span class="eyebrow">The collection</span>
      <nav aria-label="Component categories">
        {#each categories as c}<button
            disabled={!hydrated}
            class:active={category === c.id && !query}
            onclick={() => {
              category = c.id;
              query = '';
            }}
            ><span>{c.name}</span><small
              >{galleryItems.filter((i) => i.category === c.id).length}</small
            ></button
          >{/each}
      </nav>
      <div class="collection-note">
        <span>∩</span>
        <p>
          Original mosaic artwork.<br />Crisp, layered components.<br />One shared visual system.
        </p>
      </div>
    </aside>
    <section class="gallery-content">
      <div class="gallery-toolbar">
        <div>
          <span class="eyebrow">{query ? 'Search results' : current.name}</span>
          <h2>{query ? `Results for “${query}”` : current.subtitle.split(',')[0]}</h2>
        </div>
        <label class="search"
          ><span aria-hidden="true">⌕</span><input
            type="search"
            disabled={!hydrated}
            aria-label="Search components"
            placeholder="Find a component…"
            bind:value={query}
          /></label
        >
      </div>
      <div class="section-top">
        <p>{visible.length} samples · Select Inspect for full size and component details.</p>
        <button
          class="background-switch"
          aria-pressed={monochrome}
          onclick={() => (monochrome = !monochrome)}
          >{monochrome ? 'Restore colour' : 'Compare without colour'}</button
        >
        <button class="background-switch" aria-pressed={!dark} onclick={() => (dark = !dark)}
          >{dark ? '◑ Light backing' : '◐ Dark backing'}</button
        >
      </div>
      <div class="component-grid">
        {#each visible as item}<article
            class="component-card"
            class:wide={item.kind === 'board' || item.category === 'interface'}
          >
            <div class="component-preview" class:light={!dark} class:monochrome>
              <GalleryRenderer {item} /><span class="sample-id">{item.id}</span>
            </div>
            <div class="card-details">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <button
                class="inspect"
                aria-label="Inspect {item.title}"
                onclick={(event) => inspect(item, event)}>Inspect <span>↗</span></button
              >
            </div>
            <div class="renderer-label">{item.renderer}</div>
          </article>{/each}
      </div>
      {#if !visible.length}<div class="empty-search">
          <h2>No matching pieces</h2>
          <p>Try “Arch”, “population”, “banner”, or “PlayerMat”.</p>
          <button class="control" onclick={() => (query = '')}>Clear search</button>
        </div>{/if}
    </section>
  </div>
  <div class="review-notice">
    <b>Built for review.</b> These are the shared Svelte presentation components for future game
    routes. The designer’s print-and-play manifest supplies every domino, rebuild face and starting
    allocation. Generated artwork, shared building symbols, scoring plaques and live values are
    separate production layers. Direct outcomes remain simulated. Two conflicting print-back entries
    are documented in COMPONENT_MANIFEST.md.
    <a href="https://github.com/anicolao/vianova/blob/feat/mosaic-component-gallery/COMPONENT_MANIFEST.md">Component manifest ↗</a>
  </div>
</main>
<footer class="work-footer">
  <span>Via Nova by Stefan Alexander · Digital implementation under GPLv3</span><span
    >Mosaic Forum / Component & interaction review</span
  >
</footer>
<dialog
  bind:this={dialog}
  oncancel={(event) => {
    event.preventDefault();
    close();
  }}
>
  {#if selected}<header class="dialog-heading">
      <div>
        <span class="eyebrow">{selected.id}</span>
        <h2>{selected.title}</h2>
      </div>
      <button class="control" onclick={close} aria-label="Close component inspector">Close ×</button
      >
    </header>
    <div class="inspector-stage"><GalleryRenderer item={selected} large /></div>
    <div class="inspector-description">
      <p>{selected.description}</p>
      <dl>
        <dt>Production renderer</dt>
        <dd>{selected.renderer}</dd>
        <dt>Review reference</dt>
        <dd>{selected.id}</dd>
      </dl>
      <a class="control" href="{base}/dev/animations/">Review in motion →</a>
    </div>{/if}
</dialog>

<style>
  .collection-seal {
    padding: 0 20px 0 0;
    flex-shrink: 0;
  }
  .seal-art {
    display: flex;
    align-items: center;
    gap: 10px;
    --tile-size: 78px;
    transform: rotate(-6deg);
    padding: 0 8px 15px;
  }
  .seal-art > :global(.tile):last-child {
    transform: rotate(12deg) translateY(6px);
  }
  .collection-seal > span {
    font-size: 10px;
    color: #6a795e;
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .collection-seal i {
    width: 6px;
    height: 6px;
    background: #6a8c67;
    border-radius: 50%;
  }
  .collection-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    border-block: 1px solid var(--line);
    padding: 18px 0;
    margin-bottom: 32px;
  }
  .collection-bar > div {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 11px;
    color: #717767;
  }
  .collection-bar strong {
    font-size: 16px;
    color: #2d4542;
  }
  .collection-bar .separator {
    color: #c5b793;
    margin: 0 10px;
  }
  .collection-bar > a {
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    display: flex;
    gap: 18px;
  }
  .gallery-layout {
    display: grid;
    grid-template-columns: 210px 1fr;
    gap: 38px;
  }
  .category-sidebar > .eyebrow {
    font-size: 9px;
    color: #9a8a6b;
    display: block;
    margin-bottom: 15px;
  }
  .category-sidebar nav {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .category-sidebar nav button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 9px;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    min-height: 46px;
    padding: 10px 12px;
    color: #586860;
    font-size: 12px;
    border-radius: 5px;
  }
  .category-sidebar nav button.active {
    background: #e6ddc9;
    border-color: #d7c9a8;
    color: #243b3c;
    font-weight: 700;
  }
  .category-sidebar small {
    font-size: 9px;
    color: #94876b;
    background: #ede7d9;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .collection-note {
    border-top: 1px solid #ded5c3;
    margin-top: 28px;
    padding: 24px 12px;
    color: #8e8b70;
  }
  .collection-note > span {
    font-size: 35px;
    color: #b19761;
  }
  .collection-note p {
    font-size: 10px;
    margin-top: 12px;
    line-height: 1.8;
  }
  .gallery-content {
    min-width: 0;
  }
  .gallery-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }
  .gallery-toolbar .eyebrow {
    font-size: 9px;
    color: #9b8350;
  }
  .gallery-toolbar h2 {
    font-size: 28px;
    margin-top: 5px;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fffbf2;
    border: 1px solid #d6cbb4;
    border-radius: 6px;
    padding: 0 11px;
    width: 225px;
    flex-shrink: 0;
  }
  .search > span {
    font-size: 24px;
    color: #928b74;
  }
  .search input {
    background: transparent;
    border: 0;
    padding: 11px 0;
    min-height: 44px;
    width: 100%;
    font-size: 12px;
    color: #32453f;
    min-width: 0;
    outline-offset: 0;
  }
  .section-top {
    margin-bottom: 18px;
  }
  .section-top p {
    font-size: 10px;
  }
  .background-switch {
    padding: 8px;
    border: 0;
    background: transparent;
    font-size: 10px;
    color: #75806d;
    white-space: nowrap;
    min-height: 38px;
  }
  .component-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  .component-card {
    min-width: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .component-preview {
    min-height: 204px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 50% 35%, #28474a, #102b34);
    border-radius: 5px;
    box-shadow: inset 0 0 30px #0004;
    position: relative;
    padding: 14px 0 27px;
  }
  .component-preview.monochrome :global(.renderer) {
    filter: grayscale(1);
  }
  .component-preview.light {
    background: radial-gradient(ellipse, #f7ecd4, #e5d9bc);
  }
  .sample-id {
    position: absolute;
    bottom: 9px;
    left: 14px;
    font-size: 8px;
    letter-spacing: 0.08em;
    color: #afbdac;
    opacity: 0.75;
  }
  .light .sample-id {
    color: #776c52;
  }
  .card-details {
    display: flex;
    gap: 8px;
    align-items: start;
    justify-content: space-between;
    padding: 17px 14px 12px;
    flex: 1;
  }
  .card-details h3 {
    font-size: 23px;
    margin-bottom: 4px;
  }
  .card-details p {
    font-size: 10px;
    color: #7a806f;
    line-height: 1.5;
    max-width: 235px;
  }
  .inspect {
    border: 0;
    background: transparent;
    font-size: 10px;
    font-weight: 700;
    color: #697963;
    padding: 6px 0 6px 6px;
    min-height: 44px;
    white-space: nowrap;
  }
  .inspect > span {
    font-size: 14px;
    color: #a28c54;
    margin-left: 5px;
  }
  .renderer-label {
    font-size: 8px;
    letter-spacing: 0.025em;
    color: #96927c;
    border-top: 1px solid #eee5d4;
    padding: 8px 14px;
    background: #faf6eb;
  }
  .component-card.wide {
    grid-column: span 2;
  }
  .component-card.wide .component-preview {
    min-height: 240px;
  }
  .component-card.wide :global(.renderer) {
    width: 100%;
  }
  .review-notice {
    font-size: 11px;
    line-height: 1.7;
    color: #7d7e68;
    background: #ece5d6;
    border: 1px solid #dfd4bd;
    border-radius: 7px;
    padding: 18px 22px;
    margin-top: 34px;
  }
  .review-notice b {
    color: #506453;
  }
  .review-notice a {
    white-space: nowrap;
    margin-left: 5px;
  }
  .empty-search {
    padding: 60px;
    text-align: center;
    background: #fff8e8;
    border: 1px dashed #d1bd8b;
    border-radius: 8px;
  }
  .empty-search p {
    margin: 10px 0 20px;
    font-size: 13px;
  }
  .dialog-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 22px 26px;
  }
  .dialog-heading h2 {
    margin-top: 3px;
    font-size: 33px;
  }
  .dialog-heading .eyebrow {
    font-size: 9px;
  }
  .dialog-heading .control {
    font-size: 11px;
  }
  .inspector-stage {
    background: radial-gradient(ellipse, #365454, #162f3d);
    min-height: 270px;
    padding: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 60svh;
    overflow: auto;
  }
  .inspector-description {
    padding: 22px 26px;
  }
  .inspector-description p {
    font-size: 13px;
    color: #657161;
  }
  .inspector-description dl {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 9px;
    font-size: 11px;
    margin: 20px 0;
  }
  .inspector-description dt {
    color: #8e886c;
  }
  .inspector-description dd {
    margin: 0;
  }
  .inspector-description .control {
    font-size: 11px;
  }
  @media (min-width: 1550px) {
    .component-preview {
      min-height: 235px;
    }
  }
  @media (max-width: 1100px) {
    .gallery-layout {
      grid-template-columns: 170px 1fr;
      gap: 24px;
    }
    .component-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .gallery-toolbar {
      flex-wrap: wrap;
    }
    .search {
      width: 100%;
    }
  }
  @media (max-width: 700px) {
    .collection-seal {
      display: none;
    }
    .collection-bar {
      align-items: start;
      padding: 15px 0;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .collection-bar > div {
      font-size: 10px;
    }
    .collection-bar .separator {
      margin: 0 4px;
    }
    .collection-bar > a {
      font-size: 11px;
    }
    .gallery-layout {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .category-sidebar > .eyebrow,
    .collection-note {
      display: none;
    }
    .category-sidebar nav {
      flex-direction: row;
      overflow: auto;
      padding-bottom: 7px;
    }
    .category-sidebar nav button {
      flex-shrink: 0;
      padding: 10px;
      font-size: 11px;
    }
    .gallery-toolbar {
      margin-bottom: 8px;
      gap: 15px;
    }
    .gallery-toolbar h2 {
      font-size: 26px;
    }
    .gallery-toolbar > div {
      min-width: 0;
    }
    .component-grid {
      gap: 12px;
    }
    .component-preview {
      min-height: 175px;
    }
    .component-preview :global(.renderer) {
      --tile-size: 104px;
      padding: 10px;
    }
    .component-card.wide {
      grid-column: 1/-1;
    }
    .component-card:has(:global(.domino)) {
      grid-column: 1/-1;
    }
    .card-details {
      padding: 12px;
      flex-direction: column;
      gap: 0;
    }
    .card-details h3 {
      font-size: 22px;
    }
    .card-details p {
      font-size: 10px;
    }
    .inspect {
      font-size: 10px;
      width: 100%;
      justify-content: space-between;
      text-align: left;
      display: flex;
      align-items: center;
    }
    .renderer-label {
      font-size: 7px;
      padding: 7px 12px;
    }
    .section-top {
      gap: 6px;
    }
    .section-top p {
      max-width: 210px;
    }
    .background-switch {
      font-size: 9px;
    }
    .review-notice {
      padding: 14px;
      margin-top: 24px;
      font-size: 10px;
    }
    .dialog-heading {
      padding: 16px;
    }
    .dialog-heading h2 {
      font-size: 27px;
    }
    .inspector-stage {
      padding: 10px;
    }
    .inspector-description {
      padding: 16px;
    }
    .desktop-break {
      display: none;
    }
  }
</style>
