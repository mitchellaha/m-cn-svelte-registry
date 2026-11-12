<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/** The bordered box around the table. The table scrolls sideways inside it. */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="data-grid"
	class={cn('overflow-hidden rounded-lg border', className)}
	{...restProps}
>
	{@render children?.()}
</div>
