<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button, type ButtonProps } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils.js';

	/** The expand button in a row's first cell. Plain props, so any table library can drive it. */
	let {
		expanded,
		label,
		class: className,
		...restProps
	}: Omit<ButtonProps, 'href' | 'children'> & {
		expanded: boolean;
		/** Accessible name, e.g. "Collapse Cash". */
		label: string;
	} = $props();
</script>

<Button
	variant="ghost"
	size="icon-xs"
	data-grid="row-toggle"
	class={cn('-ms-1.5', className)}
	aria-label={label}
	aria-expanded={expanded}
	{...restProps}
>
	<ChevronRightIcon class={cn('transition-transform', expanded && 'rotate-90')} />
</Button>
