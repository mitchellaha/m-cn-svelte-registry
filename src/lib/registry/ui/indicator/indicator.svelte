<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '#lib/utils.js';

	export const indicatorVariants = tv({
		base: 'pointer-events-none absolute z-10 flex items-center justify-center rounded-full font-medium tabular-nums ring-2 ring-background',
		variants: {
			tone: {
				destructive: 'bg-destructive text-white',
				primary: 'bg-primary text-primary-foreground',
				muted: 'bg-muted-foreground text-background'
			},
			shape: {
				count: '-top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] leading-none',
				dot: 'top-0 right-0 size-2.5'
			}
		},
		defaultVariants: { tone: 'destructive', shape: 'count' }
	});

	export type IndicatorTone = VariantProps<typeof indicatorVariants>['tone'];

	export type IndicatorProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		/** Number shown on the badge. 0 or undefined hides it, unless `dot` is set. */
		count?: number;
		/** Counts above this show as `max+`. */
		max?: number;
		/** A plain dot instead of a number. */
		dot?: boolean;
		tone?: IndicatorTone;
		/** Screen-reader text for the mark, such as "3 unread". */
		label?: string;
	};
</script>

<script lang="ts">
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		count,
		max = 99,
		dot = false,
		tone = 'destructive',
		label,
		children,
		...restProps
	}: IndicatorProps = $props();

	const shown = $derived(dot || (count ?? 0) > 0);
	const text = $derived(count === undefined ? '' : count > max ? `${max}+` : String(count));
</script>

<span
	bind:this={ref}
	data-slot="indicator"
	class={cn('relative inline-flex', className)}
	{...restProps}
>
	{@render children?.()}
	{#if shown}
		<span
			data-slot="indicator-mark"
			class={indicatorVariants({ tone, shape: dot ? 'dot' : 'count' })}
			aria-hidden={label ? undefined : 'true'}
		>
			{#if !dot}{text}{/if}
			{#if label}<span class="sr-only">{label}</span>{/if}
		</span>
	{/if}
</span>
