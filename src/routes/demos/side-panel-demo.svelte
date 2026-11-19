<script lang="ts">
	import { onMount } from 'svelte';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { Button } from '#lib/components/ui/button/index.js';
	import { SidePanel } from '$lib/registry/ui/side-panel/index.js';

	let open = $state(false);
	// Opens docked on wide screens; on narrow ones it would cover the page as a sheet.
	onMount(() => {
		open = matchMedia('(min-width: 1024px)').matches;
	});
</script>

<div class="flex h-96 overflow-hidden rounded-lg border bg-muted/40">
	<div class="flex flex-1 flex-col items-start gap-3 p-4">
		<p class="text-sm font-medium">Page content</p>
		<p class="max-w-xs text-xs text-muted-foreground">
			The panel docks beside the page on wide screens and opens as a sheet on narrow ones.
		</p>
		<Button variant="outline" onclick={() => (open = !open)}>
			{open ? 'Close' : 'Open'} panel
		</Button>
	</div>
	<SidePanel bind:open title="Activity" width="18rem" class="border-l">
		{#snippet actions()}
			<Button variant="ghost" size="icon-sm" aria-label="Panel settings">
				<SettingsIcon />
			</Button>
		{/snippet}
		<ul class="flex flex-col divide-y text-xs">
			{#each ['Route 12 started', 'Unit 1019 checked in', 'Inspection passed', 'Fuel card used'] as item (item)}
				<li class="px-4 py-3">{item}</li>
			{/each}
		</ul>
	</SidePanel>
</div>
