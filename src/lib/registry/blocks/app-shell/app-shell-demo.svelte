<script lang="ts">
	import TruckIcon from '@lucide/svelte/icons/truck';
	import { mode, setMode } from 'mode-watcher';
	import AppShell from './app-shell.svelte';
	import { appShellData, appShellNotifications } from './demo-data.js';
	import type { AppShellPanel } from './types.js';

	let current = $state('fleet/overview');
	let panel = $state<AppShellPanel | null>(null);
	let notifications = $state(appShellNotifications);
	let asked = $state<string[]>([]);

	const screen = $derived(
		[...appShellData.modules.flatMap((m) => m.screens), ...appShellData.bookmarks].find(
			(s) => s.id === current
		)
	);

	const units = ['T-104', 'T-118', 'V-201', 'V-233', 'R-310', 'R-342'];
</script>

{#snippet conversation()}
	<div class="flex flex-col gap-2">
		{#each asked as prompt, i (i)}
			<p class="ms-8 self-end rounded-lg bg-muted px-3 py-2 text-xs">{prompt}</p>
		{/each}
	</div>
{/snippet}

<AppShell
	data={appShellData}
	bind:current
	bind:panel
	bind:notifications
	// The block only reports the switch; mode-watcher applies and remembers it, as in the shadcn-svelte dark mode guide.
	bind:dark={() => mode.current === 'dark', (on) => setMode(on ? 'dark' : 'light')}
	onAsk={(prompt) => (asked = [...asked, prompt])}
	onSettings={() => {}}
	onFeedback={() => {}}
	onSignOut={() => {}}
	conversation={asked.length ? conversation : undefined}
>
	{#snippet logo()}
		<TruckIcon />
	{/snippet}

	<div class="flex flex-col gap-4 p-4 md:p-6">
		<h1 class="text-lg font-semibold">{screen?.label ?? 'Overview'}</h1>
		<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each units as unit (unit)}
				<div class="flex gap-3 rounded-lg border p-3">
					<div class="size-14 shrink-0 rounded-md bg-muted"></div>
					<div class="flex min-w-0 flex-col gap-1">
						<p class="text-sm font-semibold">{unit}</p>
						<p class="truncate text-xs text-muted-foreground">On route · last seen 2 min ago</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</AppShell>
