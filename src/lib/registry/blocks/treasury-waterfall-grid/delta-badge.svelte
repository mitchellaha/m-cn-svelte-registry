<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { cn } from '#lib/utils.js';
	import { SEVERE_MISS_PCT } from './derive.js';

	/** A line's worst month against plan. Red once an unfavourable miss is severe. */
	let { delta }: { delta: number } = $props();

	const severe = $derived(delta <= -SEVERE_MISS_PCT);
</script>

<Badge
	variant="secondary"
	class={cn(
		'tabular-nums',
		severe
			? 'bg-destructive/10 text-destructive dark:bg-destructive/20'
			: 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500'
	)}
>
	{delta > 0 ? '+' : ''}{delta}%
	{#if severe}
		<TriangleAlertIcon data-icon="inline-end" />
	{:else}
		<InfoIcon data-icon="inline-end" />
	{/if}
</Badge>
