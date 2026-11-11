/** Icon keys. The component maps each one to a lucide icon. */
export type TreasuryIcon =
	| 'wallet'
	| 'burn'
	| 'income'
	| 'expenses'
	| 'funding'
	| 'opening'
	| 'movement'
	| 'collections'
	| 'outflow';

/**
 * Authored input. Only `authored` lines carry figures; `opening` and
 * `movement` are derived, and every group total, summary row, ring and delta
 * badge is computed from these three kinds.
 */
export type TreasuryLine =
	| {
			kind: 'authored';
			id: string;
			name: string;
			icon: TreasuryIcon;
			/**
			 * `operating` lines roll into the net burn / operating movement;
			 * `financing` lines (capital raises, draw-downs) do not, but both move
			 * closing cash.
			 */
			flow: 'operating' | 'financing';
			/** One figure per month, in `months` order. Outflows are negative. */
			plan: number[];
			actual: number[];
	  }
	| {
			kind: 'opening';
			id: string;
			name: string;
			icon: TreasuryIcon;
			/**
			 * The plan's opening balance is authored per month, not chained: each
			 * re-forecast re-bases it, so plan closing and the next plan opening
			 * legitimately differ.
			 */
			plan: number[];
			/** Actual opening chains from the prior month's closing; this seeds it. */
			actualSeed: number;
	  }
	| { kind: 'movement'; id: string; name: string; icon: TreasuryIcon };

export interface TreasuryGroup {
	id: string;
	name: string;
	icon: TreasuryIcon;
	/** Line ids. A line may appear in more than one group. */
	lines: string[];
}

export interface TreasuryData {
	/** Column labels, e.g. `"Apr 2026"`. Longer than the window is the point. */
	months: string[];
	lines: TreasuryLine[];
	groups: TreasuryGroup[];
}

export type TreasuryTab = 'actuals' | 'plan' | 'variance';

export interface Series {
	plan: number[];
	actual: number[];
}

export interface Cell {
	plan: number;
	actual: number;
}

export interface TreasuryRow {
	id: string;
	name: string;
	icon: TreasuryIcon;
	isGroup: boolean;
	cells: Cell[];
	/** Groups only: plan attainment over the window, 0..1. */
	attainment?: number;
	/** Leaves only: signed largest-magnitude monthly variance percent. */
	delta?: number;
	children?: TreasuryRow[];
}
