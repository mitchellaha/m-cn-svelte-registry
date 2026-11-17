<script lang="ts">
	import ConstructionIcon from '@lucide/svelte/icons/construction';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '#lib/components/ui/button/index.js';
	import Dashboard01 from './dashboard-01.svelte';
	import { dashboardData } from './dashboard-01-data.js';

	let scope = $state<string[]>([]);
	let pinned = $state<string[]>(['today']);
	let current = $state('fleet');
</script>

<Dashboard01 data={dashboardData} bind:scope bind:pinned bind:current onSignOut={() => {}}>
	{#snippet brand()}
		<span class="flex items-center gap-2 px-1 text-sm font-semibold">
			<ConstructionIcon class="size-5" />
			<span class="hidden sm:inline">Ridgeline Site Works</span>
		</span>
	{/snippet}
	{#snippet actions()}
		<Button variant="outline" size="sm">
			<DownloadIcon />
			Export
		</Button>
		<Button size="sm">
			<PlusIcon />
			New entry
		</Button>
	{/snippet}
</Dashboard01>
