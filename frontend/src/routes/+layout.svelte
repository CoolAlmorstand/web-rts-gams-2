<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
  import "../app.css"
  
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  Math.clamp = clamp
  
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
