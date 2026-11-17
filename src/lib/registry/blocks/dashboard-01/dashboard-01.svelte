<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { FeatureModule, FeatureScreen } from '$lib/registry/blocks/feature-menu/types.js';
	import type { DashboardData } from './types.js';

	export type Dashboard01Props = {
		data: DashboardData;
		/** Selected scope ids. Empty means everything. */
		scope?: string[];
		pinned?: string[];
		/** Id of the screen the user is on. */
		current?: string;
		onNavigate?: (screen: FeatureScreen, module: FeatureModule) => void;
		onSignOut?: () => void;
		/** Logo or product name at the far left of the header. */
		brand?: Snippet;
		/** Buttons beside the page heading. */
		actions?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	import AppHeader from '$lib/registry/blocks/app-header/app-header.svelte';
	import MetricLedger from '$lib/registry/blocks/metric-ledger/metric-ledger.svelte';
	import TreasuryWaterfallGrid from '$lib/registry/blocks/treasury-waterfall-grid/treasury-waterfall-grid.svelte';
	import { cn } from '#lib/utils.js';

	let {
		data,
		scope = $bindable([]),
		pinned = $bindable([]),
		current = $bindable(),
		onNavigate,
		onSignOut,
		brand,
		actions,
		class: className
	}: Dashboard01Props = $props();
</script>

<div class={cn('flex min-h-svh flex-col bg-muted/40', className)}>
	<AppHeader
		class="sticky top-0 z-30 border-b bg-background"
		scopeItems={data.header.scopeItems}
		scopeGroups={data.header.scopeGroups}
		bind:scope
		modules={data.header.modules}
		bind:pinned
		{current}
		actions={data.header.actions}
		user={data.header.user}
		onNavigate={(screen, module) => {
			current = screen.id;
			onNavigate?.(screen, module);
		}}
		{onSignOut}
		{brand}
	/>

	<main class="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div class="flex min-w-0 flex-col gap-1">
				<h1 class="text-xl font-semibold tracking-tight">{data.title}</h1>
				{#if data.description}
					<p class="text-sm text-muted-foreground">{data.description}</p>
				{/if}
			</div>
			{#if actions}
				<div class="flex items-center gap-2">{@render actions()}</div>
			{/if}
		</div>

		<section class="flex min-w-0 flex-col gap-3">
			<h2 class="text-sm font-medium">{data.ledger.heading}</h2>
			<MetricLedger title={data.ledger.title} data={data.ledger.data} />
		</section>

		<section class="flex min-w-0 flex-col gap-3">
			<h2 class="text-sm font-medium">{data.treasury.heading}</h2>
			<TreasuryWaterfallGrid
				data={data.treasury.data}
				defaultMonthIndex={data.treasury.defaultMonthIndex}
			/>
		</section>
	</main>
</div>
