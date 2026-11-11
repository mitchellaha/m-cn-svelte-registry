<script lang="ts" module>
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { WithElementRef } from '#lib/utils.js';

	// Two segments: the key on the left in a stronger shade, the value on the right in a lighter one.
	export const compoundTagVariants = tv({
		slots: {
			base: 'inline-flex max-w-full shrink-0 items-stretch overflow-hidden rounded-sm font-medium whitespace-nowrap select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
			left: 'inline-flex items-center gap-1',
			right: 'inline-flex min-w-0 items-center gap-1',
			remove:
				'-me-0.5 grid place-items-center rounded-sm opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current/50'
		},
		variants: {
			intent: {
				none: '',
				primary: '',
				success: '',
				warning: '',
				danger: ''
			},
			minimal: { true: '', false: '' },
			size: {
				default: {
					base: 'h-5 text-xs',
					left: 'px-1.5 [&_svg]:size-3',
					right: 'px-1.5 [&_svg]:size-3',
					remove: 'size-3.5 [&_svg]:size-3'
				},
				lg: {
					base: 'h-7 text-sm',
					left: 'px-2.5 [&_svg]:size-3.5',
					right: 'px-2.5 [&_svg]:size-3.5',
					remove: 'size-4.5 [&_svg]:size-3.5'
				}
			},
			round: { true: { base: 'rounded-full', left: 'ps-2.5', right: 'pe-2.5' } },
			fill: { true: { base: 'flex w-full', right: 'flex-1' } },
			interactive: {
				true: {
					base: 'cursor-pointer outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring/50 active:brightness-90 dark:hover:brightness-110'
				}
			},
			active: { true: { base: 'ring-2 ring-ring/60' } }
		},
		compoundVariants: [
			// Solid
			{
				intent: 'none',
				minimal: false,
				class: {
					left: 'bg-muted-foreground text-background',
					right: 'bg-muted-foreground/75 text-background'
				}
			},
			{
				intent: 'primary',
				minimal: false,
				class: {
					left: 'bg-primary text-primary-foreground',
					right: 'bg-primary/80 text-primary-foreground'
				}
			},
			{
				intent: 'success',
				minimal: false,
				class: { left: 'bg-emerald-700 text-white', right: 'bg-emerald-600 text-white' }
			},
			{
				intent: 'warning',
				minimal: false,
				class: { left: 'bg-amber-500 text-amber-950', right: 'bg-amber-400 text-amber-950' }
			},
			{
				intent: 'danger',
				minimal: false,
				class: { left: 'bg-destructive text-white', right: 'bg-destructive/80 text-white' }
			},
			// Minimal: tinted, no solid fill
			{
				intent: 'none',
				minimal: true,
				class: { left: 'bg-muted-foreground/20 text-foreground', right: 'bg-muted text-foreground' }
			},
			{
				intent: 'primary',
				minimal: true,
				class: { left: 'bg-primary/20 text-primary', right: 'bg-primary/10 text-primary' }
			},
			{
				intent: 'success',
				minimal: true,
				class: {
					left: 'bg-emerald-500/25 text-emerald-800 dark:text-emerald-300',
					right: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
				}
			},
			{
				intent: 'warning',
				minimal: true,
				class: {
					left: 'bg-amber-500/30 text-amber-900 dark:text-amber-300',
					right: 'bg-amber-500/12 text-amber-900 dark:text-amber-300'
				}
			},
			{
				intent: 'danger',
				minimal: true,
				class: {
					left: 'bg-destructive/20 text-destructive',
					right: 'bg-destructive/10 text-destructive'
				}
			}
		],
		defaultVariants: { intent: 'none', minimal: false, size: 'default' }
	});

	type Variants = VariantProps<typeof compoundTagVariants>;
	export type CompoundTagIntent = NonNullable<Variants['intent']>;
	export type CompoundTagSize = NonNullable<Variants['size']>;

	export type CompoundTagProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		/** The key, shown in the left segment. Text or a snippet. */
		left: string | Snippet;
		/** The value, shown in the right segment. */
		children: Snippet;
		intent?: CompoundTagIntent;
		minimal?: boolean;
		size?: CompoundTagSize;
		round?: boolean;
		/** Stretches to the container's width; the value segment takes the extra room. */
		fill?: boolean;
		/** Hover and focus styles, a pointer cursor, and Enter/Space trigger onclick. */
		interactive?: boolean;
		active?: boolean;
		/** Icon before the key. */
		icon?: Component;
		/** Icon after the value. */
		endIcon?: Component;
		/** Shows a remove button at the end when set. */
		onRemove?: (event: MouseEvent) => void;
		/** Accessible name of the remove button. */
		removeLabel?: string;
	};
</script>

<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		left,
		children,
		intent = 'none',
		minimal = false,
		size = 'default',
		round = false,
		fill = false,
		interactive = false,
		active = false,
		icon: Icon,
		endIcon: EndIcon,
		onRemove,
		removeLabel = 'Remove',
		onkeydown,
		...restProps
	}: CompoundTagProps = $props();

	const styles = $derived(
		compoundTagVariants({ intent, minimal, size, round, fill, interactive, active })
	);

	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
		onkeydown?.(event);
		if (!interactive || event.defaultPrevented || event.target !== event.currentTarget) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			event.currentTarget.click();
		}
	}
</script>

<!-- tabindex is only set together with role="button". A real <button> cannot hold the remove button. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
	bind:this={ref}
	data-slot="compound-tag"
	data-intent={intent}
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
	aria-pressed={interactive && active ? true : undefined}
	class={cn(styles.base(), className)}
	onkeydown={handleKeydown}
	{...restProps}
>
	<span data-slot="compound-tag-left" class={styles.left()}>
		{#if Icon}<Icon />{/if}
		{#if typeof left === 'string'}{left}{:else}{@render left()}{/if}
	</span>
	<span data-slot="compound-tag-right" class={styles.right()}>
		<span class="truncate">{@render children()}</span>
		{#if EndIcon}<EndIcon />{/if}
		{#if onRemove}
			<button
				type="button"
				data-slot="compound-tag-remove"
				class={styles.remove()}
				aria-label={removeLabel}
				onclick={(event) => {
					// Removing must not also fire the tag's own click.
					event.stopPropagation();
					onRemove(event);
				}}
			>
				<XIcon />
			</button>
		{/if}
	</span>
</span>
