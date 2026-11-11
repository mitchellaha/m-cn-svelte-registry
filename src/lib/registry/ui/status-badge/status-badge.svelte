<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { WithElementRef } from '#lib/utils.js';

	// Tones read the --ok, --warn, --crit and --idle tokens (and their -bg pairs)
	// that this item adds to the consumer's stylesheet. The dark: repeats beat the
	// outline badge's dark:bg-input/30.
	export const statusBadgeVariants = tv({
		base: 'border-transparent',
		variants: {
			tone: {
				ok: 'bg-ok-bg text-ok dark:bg-ok-bg',
				warn: 'bg-warn-bg text-warn dark:bg-warn-bg',
				crit: 'bg-crit-bg text-crit dark:bg-crit-bg',
				idle: 'bg-idle-bg text-idle dark:bg-idle-bg'
			}
		},
		defaultVariants: { tone: 'idle' }
	});

	export type StatusBadgeTone = NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>;

	export type StatusBadgeProps = WithElementRef<HTMLAnchorAttributes> & {
		tone?: StatusBadgeTone;
	};
</script>

<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		tone = 'idle',
		children,
		...restProps
	}: StatusBadgeProps = $props();
</script>

<Badge
	bind:ref
	data-slot="status-badge"
	data-tone={tone}
	variant="outline"
	class={cn(statusBadgeVariants({ tone }), className)}
	{...restProps}
>
	{@render children?.()}
</Badge>
