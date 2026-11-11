<script lang="ts">
	import ArrowDownRightIcon from '@lucide/svelte/icons/arrow-down-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import { cn } from '#lib/utils.js';
	import { money, variancePct } from './derive.js';
	import type { Cell } from './types.js';

	let { cell }: { cell: Cell } = $props();

	const variance = $derived(cell.actual - cell.plan);
	const pct = $derived(variancePct(cell));
	// Outflows are stored negative, so the sign alone says favourable.
	const favourable = $derived(variance >= 0);
</script>

<span class="inline-flex items-center justify-end gap-1.5 tabular-nums">
	<span class="font-medium text-foreground">{money(variance)}</span>
	{#if pct !== undefined}
		<span
			class={cn(
				'inline-flex items-center text-xs',
				favourable ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
			)}
		>
			{#if favourable}
				<ArrowUpRightIcon class="size-3" />
			{:else}
				<ArrowDownRightIcon class="size-3" />
			{/if}
			{pct}%
		</span>
	{/if}
</span>
