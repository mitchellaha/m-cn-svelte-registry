export type Density = 'comfortable' | 'compact';

export const DENSITY_ITEMS: { value: Density; label: string }[] = [
	{ value: 'comfortable', label: 'Comfortable' },
	{ value: 'compact', label: 'Compact' }
];

/** Padding for every body and footer cell at a density. */
export const densityCellClass = (density: Density) =>
	density === 'compact' ? 'px-3 py-1' : 'px-3 py-2';

/**
 * For a row that holds a RowToggle: the toggle's aria-expanded would otherwise trip the table
 * row's open-row shading.
 */
export const GRID_ROW_CLASS =
	'has-aria-expanded:bg-transparent has-aria-expanded:hover:bg-muted/50';

/**
 * Spread into `createTable` from @tanstack/svelte-table. The Svelte adapter hands table-core a
 * fresh proxy of `data` on every option sync, which table-core reads as new data and auto
 * resets expand, page and sort state. A grid owns its state, so turn the resets off and reset
 * what you mean to reset yourself.
 */
export const GRID_TABLE_DEFAULTS = { autoResetAll: false } as const;

/**
 * The expand state to hand the table. A search must reveal every match, so it pins every row
 * open. Ignore expand changes while `query` is set, and clearing the search restores the state
 * the user left.
 */
export const pinnedExpanded = <T>(query: string, expanded: T): T | true =>
	query ? true : expanded;
