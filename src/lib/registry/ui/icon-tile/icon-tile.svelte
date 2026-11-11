<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '#lib/utils.js';

	export const iconTileVariants = tv({
		base: 'inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground [&_svg]:shrink-0',
		variants: {
			size: {
				sm: 'size-6 [&_svg]:size-3.5',
				default: 'size-8 [&_svg]:size-4',
				lg: 'size-10 [&_svg]:size-5'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type IconTileSize = VariantProps<typeof iconTileVariants>['size'];

	export type IconTileProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		size?: IconTileSize;
	};
</script>

<script lang="ts">
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		size = 'default',
		children,
		...restProps
	}: IconTileProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="icon-tile"
	class={cn(iconTileVariants({ size }), className)}
	{...restProps}
>
	{@render children?.()}
</span>
