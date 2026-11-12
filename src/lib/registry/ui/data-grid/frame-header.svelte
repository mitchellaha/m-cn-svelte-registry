<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/** Title on the left, actions on the right; wraps when narrow. */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="frame-header"
	class={cn('flex flex-wrap items-center justify-between gap-3 px-3 py-2.5', className)}
	{...restProps}
>
	{@render children?.()}
</div>
