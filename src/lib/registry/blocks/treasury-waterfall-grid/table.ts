import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createExpandedRowModel,
	createFilteredRowModel,
	createPaginatedRowModel,
	globalFilteringFeature,
	rowExpandingFeature,
	rowPaginationFeature,
	tableFeatures,
	type SvelteTable
} from '@tanstack/svelte-table';
import type { TreasuryRow } from './types.js';

/** Search, expand/collapse groups, and client-side pagination over groups. */
export const treasuryFeatures = tableFeatures({
	// Required by global filtering and the filtered row model.
	columnFilteringFeature,
	columnVisibilityFeature,
	globalFilteringFeature,
	rowExpandingFeature,
	rowPaginationFeature,
	filteredRowModel: createFilteredRowModel(),
	expandedRowModel: createExpandedRowModel(),
	paginatedRowModel: createPaginatedRowModel()
});

export type TreasuryFeatures = typeof treasuryFeatures;

export type TreasuryTable = SvelteTable<TreasuryFeatures, TreasuryRow>;

export const PAGE_SIZES = [5, 10, 25];
