<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Kbd } from '#lib/components/ui/kbd/index.js';
	import CommandPalette, { isApplePlatform } from './command-palette.svelte';
	import { demoCommandData } from './demo-data.js';

	let open = $state(false);

	// Show Ctrl instead of the Command glyph off Apple platforms.
	let modKey = $state('⌘');
	$effect(() => {
		if (!isApplePlatform()) modKey = 'Ctrl+';
	});
</script>

<Button
	variant="outline"
	class="w-56 justify-start font-normal text-muted-foreground"
	onclick={() => (open = true)}
>
	<SearchIcon />
	Search…
	<Kbd class="ml-auto">{modKey}K</Kbd>
</Button>

<CommandPalette data={demoCommandData} bind:open onSelect={() => {}} />
