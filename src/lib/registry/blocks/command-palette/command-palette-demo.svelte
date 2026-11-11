<script lang="ts">
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import ConstructionIcon from '@lucide/svelte/icons/construction';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Kbd } from '#lib/components/ui/kbd/index.js';
	import CommandPalette from './command-palette.svelte';
	import { demoCommandData } from './demo-data.js';
	import type { CommandPaletteSelection } from './types.js';

	let open = $state(false);
	let screen = $state(demoCommandData.modules[0].screens[0]);
	let toast = $state<{ id: number; text: string } | null>(null);

	// Show Ctrl instead of the Command glyph off Apple platforms.
	let modKey = $state('⌘');
	$effect(() => {
		if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) modKey = 'Ctrl+';
	});

	// The toast hides itself a few seconds after each pick.
	$effect(() => {
		if (!toast) return;
		const id = toast.id;
		const timer = setTimeout(() => {
			if (toast?.id === id) toast = null;
		}, 4000);
		return () => clearTimeout(timer);
	});

	function onSelect(selection: CommandPaletteSelection) {
		if (selection.type === 'screen') {
			screen = selection.screen;
			toast = { id: Date.now(), text: `Opened ${selection.screen.label}` };
		} else {
			toast = { id: Date.now(), text: selection.action.label };
		}
	}
</script>

<!-- Mock app page with a search button in the header. -->
<div class="relative flex min-h-[480px] flex-col overflow-hidden bg-background">
	<header class="flex h-12 shrink-0 items-center gap-2 border-b px-3">
		<span class="flex items-center gap-2 text-sm font-semibold">
			<ConstructionIcon class="size-5" />
			<span class="hidden sm:inline">Ridgeline Site Works</span>
		</span>
		<Button
			variant="outline"
			size="sm"
			class="ml-auto w-40 justify-start text-muted-foreground sm:w-64"
			onclick={() => (open = true)}
		>
			<SearchIcon />
			Search…
			<Kbd class="ml-auto">{modKey}K</Kbd>
		</Button>
	</header>
	<div class="flex flex-1 flex-col gap-4 p-4">
		<div class="flex flex-col gap-0.5">
			<h1 class="text-base font-medium">{screen.label}</h1>
			<p class="text-sm text-muted-foreground">{screen.description}</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-3">
			<div class="h-24 rounded-lg border border-dashed bg-muted/30"></div>
			<div class="h-24 rounded-lg border border-dashed bg-muted/30"></div>
			<div class="h-24 rounded-lg border border-dashed bg-muted/30"></div>
		</div>
		<p class="text-xs text-muted-foreground">
			Press <Kbd>{modKey}K</Kbd> or use the search button to jump to a screen or run an action.
		</p>
	</div>
	{#if toast}
		<div
			role="status"
			class="absolute right-4 bottom-4 left-4 flex items-center gap-2 rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md sm:left-auto sm:w-72"
		>
			<CircleCheckIcon class="size-4 shrink-0 text-muted-foreground" />
			<span class="truncate">{toast.text}</span>
		</div>
	{/if}
</div>

<CommandPalette data={demoCommandData} bind:open {onSelect} />
