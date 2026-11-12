<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '#lib/utils.js';
	import type { DeltaFormat, DeltaFormatOptions } from './delta.js';

	export type DeltaPillProps = WithElementRef<
		Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
		HTMLSpanElement
	> & {
		value: number | null;
		/** The comparison figure. Missing, not finite or zero draws nothing: no honest ratio. */
		prior: number | null;
		/** [current, prior] window labels. Set = a hover with both figures and the change. */
		windows?: [string, string];
		/** A percent's change reads in points (-1.7 pts), anything else as a relative %. */
		format?: DeltaFormat;
		formatOptions?: DeltaFormatOptions;
		/** Flips the colour: a fall is good. */
		lowerIsBetter?: boolean;
	};
</script>

<script lang="ts">
	import MinusIcon from '@lucide/svelte/icons/minus';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import { cn } from '#lib/utils.js';
	import { formatValue, pillOf } from './delta.js';

	let {
		ref = $bindable(null),
		class: className,
		value,
		prior,
		windows,
		format = 'number',
		formatOptions,
		lowerIsBetter = false,
		...restProps
	}: DeltaPillProps = $props();

	const pill = $derived(pillOf(value, prior, format, lowerIsBetter));
	const gap = $derived(value != null && prior != null ? value - prior : null);
	const pillClass = $derived(
		cn(
			'inline-flex items-center gap-1 text-xs font-normal tabular-nums',
			windows && 'cursor-help',
			pill?.tone === 'flat'
				? 'text-muted-foreground'
				: pill?.tone === 'good'
					? 'text-emerald-600 dark:text-emerald-400'
					: 'text-destructive',
			className
		)
	);
</script>

{#snippet body()}
	{#if pill?.dir === 'flat'}
		<MinusIcon class="size-3" />
	{:else if pill?.dir === 'up'}
		<TrendingUpIcon class="size-3" />
	{:else}
		<TrendingDownIcon class="size-3" />
	{/if}
	{pill?.text}
{/snippet}

{#if pill}
	{#if !windows}
		<span
			bind:this={ref}
			data-slot="delta-pill"
			data-tone={pill.tone}
			class={pillClass}
			{...restProps}
		>
			{@render body()}
		</span>
	{:else}
		<!-- Its own provider, so the pill works with or without one above it. -->
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<!-- A span, not a button: the pill is read as text. Focusable so a keyboard
						     reader can open the windows too. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<span
							bind:this={ref}
							{...restProps}
							{...props}
							data-slot="delta-pill"
							data-tone={pill.tone}
							tabindex="0"
							class={pillClass}
						>
							{@render body()}
						</span>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content class="text-xs tabular-nums">
					<span class="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
						<span class="opacity-70">{windows[0]}</span>
						<span class="text-right">{formatValue(format, value, formatOptions)}</span>
						<span class="opacity-70">{windows[1]}</span>
						<span class="text-right">{formatValue(format, prior, formatOptions)}</span>
						<span class="opacity-70">Change</span>
						<span class="text-right">
							{format === 'percent'
								? pill.text
								: `${formatValue(format, gap, { ...formatOptions, sign: true })} (${pill.text})`}
						</span>
					</span>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/if}
{/if}
