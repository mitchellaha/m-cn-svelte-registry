<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/** The white panel the toolbar and the table sit in. */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="frame-panel"
	class={cn('rounded-lg border bg-background p-3 shadow-xs', className)}
	{...restProps}
>
	{@render children?.()}
</div>
