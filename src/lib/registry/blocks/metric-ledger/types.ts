import type { DeltaFormat, DeltaFormatOptions } from '$lib/registry/ui/delta-pill/index.js';

export type LedgerFormat = DeltaFormat;
export type LedgerFormatOptions = DeltaFormatOptions;

export type LedgerColumn = { id: string; label: string };

export type LedgerCell = {
	/** A percent is a ratio: 0.379 reads as 37.9%. */
	value: number | null;
	/** The comparison figure. Present (and not zero) = a change pill. */
	prior?: number | null;
	/** Small line under the value. */
	note?: string;
	/** Sparkline points, oldest first. Fewer than two numbers draws nothing. */
	trend?: (number | null)[];
};

export type LedgerMetric = {
	id: string;
	label: string;
	/** Hover note on the label. */
	info?: string;
	format?: LedgerFormat;
	formatOptions?: LedgerFormatOptions;
	/** Flips the pill colour: a fall is good. */
	lowerIsBetter?: boolean;
	/** Keyed by column id. A column with no cell reads as a dash, never zero. */
	cells: Record<string, LedgerCell | undefined>;
};

export type LedgerSection = {
	/** Shown as a band row above the section's metrics. */
	title?: string;
	metrics: LedgerMetric[];
};

export type MetricLedgerData = {
	columns: LedgerColumn[];
	sections: LedgerSection[];
	/** [current, prior] window labels for the pill's hover. Omit for a bare pill. */
	windows?: [string, string];
};
