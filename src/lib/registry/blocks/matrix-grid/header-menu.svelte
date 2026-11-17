<script lang="ts">
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import FilterIcon from '@lucide/svelte/icons/list-filter';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { cn } from '#lib/utils.js';

	/**
	 * A column header that opens a menu: sort either way, a min / max range, hide. Without
	 * `range` (the label column) the menu only sorts.
	 */
	let {
		label,
		sorted,
		align = 'end',
		range,
		percent = false,
		onSort,
		onRange,
		onHide
	}: {
		label: string;
		sorted: false | 'asc' | 'desc';
		align?: 'start' | 'end';
		range?: [number | null, number | null];
		percent?: boolean;
		onSort: (dir: false | 'asc' | 'desc') => void;
		onRange?: (range: [number | null, number | null]) => void;
		onHide?: () => void;
	} = $props();

	const filtered = $derived(!!range && (range[0] !== null || range[1] !== null));
	const num = (s: string) => (s.trim() === '' || isNaN(Number(s)) ? null : Number(s));
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				type="button"
				class={cn(
					'-mx-1 inline-flex max-w-full items-center gap-1 rounded-sm px-1 py-0.5 text-start leading-tight font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 [&_svg]:size-3 [&_svg]:shrink-0',
					(sorted || filtered) && 'text-foreground',
					align === 'end' && 'flex-row-reverse text-end'
				)}
			>
				<span class="line-clamp-2">{label}</span>
				{#if sorted === 'asc'}
					<ArrowUpIcon />
				{:else if sorted === 'desc'}
					<ArrowDownIcon />
				{/if}
				{#if filtered}
					<FilterIcon />
				{/if}
			</button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align={align === 'end' ? 'end' : 'start'} class="flex w-56 flex-col gap-1 p-1">
		<Button
			variant={sorted === 'asc' ? 'secondary' : 'ghost'}
			size="sm"
			class="justify-start"
			onclick={() => onSort(sorted === 'asc' ? false : 'asc')}
		>
			<ArrowUpIcon data-icon="inline-start" />
			Sort ascending
		</Button>
		<Button
			variant={sorted === 'desc' ? 'secondary' : 'ghost'}
			size="sm"
			class="justify-start"
			onclick={() => onSort(sorted === 'desc' ? false : 'desc')}
		>
			<ArrowDownIcon data-icon="inline-start" />
			Sort descending
		</Button>
		{#if range && onRange}
			<div class="flex flex-col gap-1.5 border-t px-2 pt-2 pb-1">
				<span class="text-xs text-muted-foreground">
					Range{percent ? ' (%)' : ''}
				</span>
				<div class="flex items-center gap-1.5">
					<Input
						class="h-7"
						inputmode="decimal"
						placeholder="Min"
						aria-label="{label} minimum"
						value={range[0] ?? ''}
						oninput={(e) => onRange([num(e.currentTarget.value), range[1]])}
					/>
					<Input
						class="h-7"
						inputmode="decimal"
						placeholder="Max"
						aria-label="{label} maximum"
						value={range[1] ?? ''}
						oninput={(e) => onRange([range[0], num(e.currentTarget.value)])}
					/>
				</div>
				{#if filtered}
					<Button
						variant="ghost"
						size="xs"
						class="self-start"
						onclick={() => onRange([null, null])}
					>
						Clear range
					</Button>
				{/if}
			</div>
		{/if}
		{#if onHide}
			<Button variant="ghost" size="sm" class="justify-start border-t" onclick={onHide}>
				<EyeOffIcon data-icon="inline-start" />
				Hide column
			</Button>
		{/if}
	</Popover.Content>
</Popover.Root>
