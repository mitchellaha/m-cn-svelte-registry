<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/** The tinted outer box. Holds a FrameHeader and a FramePanel. */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="frame"
	class={cn('flex w-full flex-col rounded-xl border bg-muted/40 p-1', className)}
	{...restProps}
>
	{@render children?.()}
</div>
