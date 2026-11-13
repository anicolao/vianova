<script lang="ts">
  import { onMount, setContext, type Snippet } from 'svelte';
  import { writable } from 'svelte/store';
  import { base } from '$app/paths';
  import {
    cloneRegistration,
    parseRegistration,
    registrationContext,
    type RegistrationBook
  } from '../presentation/tile-registration';
  import { reviewRegistrationContext, type RegistrationSession } from './registration-session';
  let { children }: { children: Snippet } = $props();
  const store = writable<RegistrationBook>(cloneRegistration());
  const key = `vianova:${base}:tile-registration:v1`;
  let error = $state('');
  setContext(registrationContext, store);
  setContext<RegistrationSession>(reviewRegistrationContext, {
    subscribe: store.subscribe,
    apply(book) {
      const checked = parseRegistration(book);
      // Persist before changing the active session: failure leaves it unchanged.
      localStorage.setItem(key, JSON.stringify(checked));
      store.set(checked);
      error = '';
    },
    reset() {
      localStorage.removeItem(key);
      store.set(cloneRegistration());
      error = '';
    }
  });
  onMount(() => {
    const load = () => {
      try {
        const text = localStorage.getItem(key);
        store.set(text ? parseRegistration(JSON.parse(text)) : cloneRegistration());
        error = '';
      } catch {
        error = 'Saved layer settings could not be loaded. Shipped settings are in use.';
        store.set(cloneRegistration());
      }
    };
    load();
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) load();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  });
</script>

{#if error}<aside role="alert">
    {error} <a href="{base}/dev/layers/">Review layer settings</a>
  </aside>{/if}
{@render children()}

<style>
  aside {
    padding: 10px 20px;
    background: #ffedce;
    color: #613a15;
    font-size: 14px;
  }
</style>
