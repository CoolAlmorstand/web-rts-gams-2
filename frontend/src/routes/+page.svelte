

<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  
  
  onMount(() => {
    let dingSound = new Audio("/elevator-sound.mp3")
    dingSound.play()
  })
</script>

<main class="flex flex-col justify-center items-center w-screen h-screen bg-black text-white">
  <button on:click={(() => goto("/game"))} class="text-black bg-white rounded-lg px-5 py-2">
    Create Game
  </button>
</main>