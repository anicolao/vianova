<script lang="ts">
  import '@fontsource/cormorant-garamond/600.css';
  import '@fontsource/cormorant-garamond/700.css';
  import '@fontsource/atkinson-hyperlegible/400.css';
  import '@fontsource/atkinson-hyperlegible/700.css';
  import '$lib/theme.css';
  import RegistrationProvider from '$lib/review/RegistrationProvider.svelte';
  let { children } = $props();
</script>

<RegistrationProvider>{@render children()}</RegistrationProvider>
