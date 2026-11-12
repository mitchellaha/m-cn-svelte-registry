<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { sparkPaths } from './sparkline.js';

	const WIDTH = 96;
	const HEIGHT = 28;

	/** Colour comes from the text colour: pass `class="text-chart-1"` to change it. */
	let { values, class: className }: { values: (number | null)[]; class?: string } = $props();

	const paths = $derived(sparkPaths(values, WIDTH, HEIGHT));
</script>

{#if paths}
	<svg
		viewBox="0 0 {WIDTH} {HEIGHT}"
		preserveAspectRatio="none"
		aria-hidden="true"
		class={cn('h-7 w-full overflow-visible text-primary', className)}
	>
		<path d={paths.area} fill="currentColor" fill-opacity="0.12" />
		<path
			d={paths.line}
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			vector-effect="non-scaling-stroke"
		/>
	</svg>
{/if}
