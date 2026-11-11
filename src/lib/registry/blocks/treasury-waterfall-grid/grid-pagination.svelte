<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { PAGE_SIZES, type TreasuryTable } from './table.js';

	let { table, recordCount }: { table: TreasuryTable; recordCount: number } = $props();

	const pagination = $derived(table.atoms.pagination.get());
	const pageCount = $derived(Math.max(1, table.getPageCount()));
	const from = $derived(recordCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1);
	const to = $derived(Math.min(recordCount, (pagination.pageIndex + 1) * pagination.pageSize));
</script>

<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
	<div class="flex items-center gap-2">
		<span>Rows per page</span>
		<Select.Root
			type="single"
			value={String(pagination.pageSize)}
			onValueChange={(value) => table.setPageSize(Number(value))}
		>
			<Select.Trigger size="sm" class="w-16" aria-label="Rows per page">
				{pagination.pageSize}
			</Select.Trigger>
			<Select.Content>
				{#each PAGE_SIZES as size (size)}
					<Select.Item value={String(size)} label={String(size)} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="flex items-center gap-2">
		<span class="tabular-nums">{from} - {to} of {recordCount}</span>
		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Previous page"
				disabled={!table.getCanPreviousPage()}
				onclick={() => table.previousPage()}
			>
				<ChevronLeftIcon />
			</Button>
			{#each Array.from({ length: pageCount }, (_, i) => i) as page (page)}
				<Button
					variant={page === pagination.pageIndex ? 'outline' : 'ghost'}
					size="icon-sm"
					aria-label={`Page ${page + 1}`}
					aria-current={page === pagination.pageIndex ? 'page' : undefined}
					onclick={() => table.setPageIndex(page)}
				>
					{page + 1}
				</Button>
			{/each}
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Next page"
				disabled={!table.getCanNextPage()}
				onclick={() => table.nextPage()}
			>
				<ChevronRightIcon />
			</Button>
		</div>
	</div>
</div>
