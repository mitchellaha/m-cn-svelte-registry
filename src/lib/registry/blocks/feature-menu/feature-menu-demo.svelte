<script lang="ts">
	import ConstructionIcon from '@lucide/svelte/icons/construction';
	import FeatureMenu from './feature-menu.svelte';
	import { demoModules } from './demo-data.js';

	let current = $state('daily-logs');
	let pinned = $state<string[]>(['today', 'fleet']);

	const screens = demoModules.flatMap((m) => m.screens.map((screen) => ({ screen, module: m })));
	const active = $derived(screens.find((e) => e.screen.id === current));
	const pinnedLabels = $derived(
		pinned.flatMap((id) => screens.find((e) => e.screen.id === id)?.screen.label ?? [])
	);
</script>

<!-- Mock app: the menu trigger sits in a header bar so its popover opens downward. -->
<div class="flex min-h-[560px] flex-col bg-background">
	<header class="flex h-12 shrink-0 items-center gap-2 border-b px-3">
		<span class="flex items-center gap-2 text-sm font-semibold">
			<ConstructionIcon class="size-5" />
			<span class="hidden sm:inline">Ridgeline Site Works</span>
		</span>
		<span class="h-5 w-px bg-border"></span>
		<FeatureMenu
			modules={demoModules}
			bind:pinned
			{current}
			onNavigate={(screen) => (current = screen.id)}
		/>
	</header>
	<div class="flex flex-1 flex-col gap-4 p-4">
		{#if active}
			<div class="flex flex-col gap-0.5">
				<p class="text-xs text-muted-foreground">{active.module.label}</p>
				<h1 class="text-base font-medium">{active.screen.label}</h1>
				<p class="text-sm text-muted-foreground">{active.screen.description}</p>
			</div>
		{/if}
		<div class="grid gap-3 sm:grid-cols-2">
			<div class="h-24 rounded-lg border border-dashed bg-muted/30"></div>
			<div class="h-24 rounded-lg border border-dashed bg-muted/30"></div>
		</div>
		<p class="text-xs text-muted-foreground">
			Pinned: {pinnedLabels.length ? pinnedLabels.join(', ') : 'nothing yet'}
		</p>
	</div>
</div>
