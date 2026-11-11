<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { ATTAINMENT_GOOD } from './derive.js';

	/** Plan attainment as a ring. Green once the group is within a fifth of plan. */
	let { value }: { value: number } = $props();

	const r = 7;
	const c = 2 * Math.PI * r;
	const good = $derived(value >= ATTAINMENT_GOOD);
	const pct = $derived(Math.round(value * 100));
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 text-xs tabular-nums',
		good ? 'text-emerald-700 dark:text-emerald-400' : 'text-yellow-700 dark:text-yellow-500'
	)}
	title={`${pct}% of plan attained`}
>
	<svg viewBox="0 0 18 18" class="size-4 -rotate-90" aria-hidden="true">
		<circle cx="9" cy="9" {r} fill="none" stroke-width="2" class="stroke-muted" />
		<circle
			cx="9"
			cy="9"
			{r}
			fill="none"
			stroke-width="2"
			stroke-linecap="round"
			stroke-dasharray={`${c * value} ${c}`}
			class={good ? 'stroke-emerald-500' : 'stroke-yellow-500'}
		/>
	</svg>
	{pct}%
</span>
