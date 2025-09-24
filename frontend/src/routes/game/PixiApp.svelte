<script lang="ts">
  import pixiEngine from "$lib/pixi-js/pixi-js"
  import type { SvelteComponentTyped } from "svelte"
  import { onMount, onDestroy } from 'svelte';
  
  let main: HTMLElement;
  
  onMount(async () => {
    await pixiEngine.initialize()
    pixiEngine.mountCanvas(main)
  })
  
</script>



<main bind:this={main}>
  
  
</main>