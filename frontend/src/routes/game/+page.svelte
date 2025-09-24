


<script lang="ts">
  import PixiApp from "./PixiApp.svelte"
  import { onMount } from "svelte"
  
  
  onMount(() => {
    let dingSound = new Audio("/elevator-sound.mp3")
    dingSound.play()
  })
</script>
<main class="bg-black text-white w-screen h-screen">
  <PixiApp />
</main>