<script lang="ts">
	import type { TPhaserRef } from '$lib/Game.svelte';
	import Game from '$lib/Game.svelte';

	let phaserRef: TPhaserRef = { game: null, scene: null };
</script>

<Game bind:phaserRef />
