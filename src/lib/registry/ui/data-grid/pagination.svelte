<script lang="ts" module>
	/** Page numbers to show: the ends, the current page and its neighbours, gaps as null. */
	export function pageWindow(pageIndex: number, pageCount: number): (number | null)[] {
		if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
		const keep = [0, pageCount - 1, pageIndex - 1, pageIndex, pageIndex + 1];
		if (pageIndex <= 2) keep.push(1, 2, 3);
		if (pageIndex >= pageCount - 3) keep.push(pageCount - 4, pageCount - 3, pageCount - 2);
		const pages = keep
			.filter((i, n) => i >= 0 && i < pageCount && keep.indexOf(i) === n)
			.sort((a, b) => a - b);
		const out: (number | null)[] = [];
		for (const [i, page] of pages.entries()) {
			if (i > 0 && page - pages[i - 1] > 1) out.push(null);
			out.push(page);
		}
		return out;
	}
</script>

<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { cn } from '#lib/utils.js';

	/** A pager for any table: it holds no state, so feed it the page and handle the changes. */
	let {
		pageIndex,
		pageSize,
		rowCount,
		pageSizes = [25, 50, 100],
		onPageChange,
		onPageSizeChange,
		class: className
	}: {
		pageIndex: number;
		pageSize: number;
		/** Rows across all pages. */
		rowCount: number;
		pageSizes?: number[];
		onPageChange: (pageIndex: number) => void;
		onPageSizeChange?: (pageSize: number) => void;
		class?: string;
	} = $props();

	const pageCount = $derived(Math.max(1, Math.ceil(rowCount / pageSize)));
	const from = $derived(rowCount === 0 ? 0 : pageIndex * pageSize + 1);
	const to = $derived(Math.min(rowCount, (pageIndex + 1) * pageSize));
	const pages = $derived(pageWindow(pageIndex, pageCount));
</script>

<div
	data-slot="data-grid-pagination"
	class={cn(
		'flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground',
		className
	)}
>
	{#if onPageSizeChange}
		<div class="flex items-center gap-2">
			<span>Rows per page</span>
			<Select.Root
				type="single"
				value={String(pageSize)}
				onValueChange={(value) => onPageSizeChange(Number(value))}
			>
				<Select.Trigger size="sm" class="w-18" aria-label="Rows per page">
					{pageSize}
				</Select.Trigger>
				<Select.Content>
					{#each pageSizes as size (size)}
						<Select.Item value={String(size)} label={String(size)} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/if}

	<div class="ml-auto flex items-center gap-2">
		<span class="tabular-nums">{from} - {to} of {rowCount}</span>
		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Previous page"
				disabled={pageIndex <= 0}
				onclick={() => onPageChange(pageIndex - 1)}
			>
				<ChevronLeftIcon />
			</Button>
			{#each pages as page, i (page ?? `gap-${i}`)}
				{#if page === null}
					<span class="hidden w-6 text-center sm:inline" aria-hidden="true">…</span>
				{:else}
					<Button
						variant={page === pageIndex ? 'outline' : 'ghost'}
						size="icon-sm"
						class="hidden tabular-nums sm:inline-flex"
						aria-label={`Page ${page + 1}`}
						aria-current={page === pageIndex ? 'page' : undefined}
						onclick={() => onPageChange(page)}
					>
						{page + 1}
					</Button>
				{/if}
			{/each}
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Next page"
				disabled={pageIndex >= pageCount - 1}
				onclick={() => onPageChange(pageIndex + 1)}
			>
				<ChevronRightIcon />
			</Button>
		</div>
	</div>
</div>
