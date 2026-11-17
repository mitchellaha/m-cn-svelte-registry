/** Column id of the pinned label column, for `sorting`, `widths` and filter rules. */
export const LABEL_ID = '__label';

/** How a figure reads: money in the currency, a fraction as a percent, a whole count, a plain number. */
export type FigureKind = 'money' | 'percent' | 'count' | 'number';

/** A row grouping choice: every row reads one string for it. */
export type MatrixDimension<T> = {
	id: string;
	label: string;
	value: (row: T) => string;
};

/**
 * A numeric column. A group's value is the sum of its rows' values, or for a `ratio` the sum of
 * numerators over the sum of denominators (never an average of rates). Blank values (null) are
 * left out of both sums.
 */
export type MatrixFigure<T> = {
	id: string;
	/** Column header. */
	header: string;
	/** Header band the column sits under. Consecutive figures with one band share a header. */
	band: string;
	kind: FigureKind;
	/** A row's value. Optional for a ratio, whose row value is then numerator / denominator. */
	value?: (row: T) => number | null;
	ratio?: { numerator: (row: T) => number | null; denominator: (row: T) => number | null };
	/** Caps a value, row or group, such as 1 for a percent complete. */
	max?: number;
	/** Overrides the kind's formatting. */
	format?: (value: number) => string;
};

export type MatrixSchema<T> = {
	rowId: (row: T) => string;
	/** The pinned first column. */
	label: { header: string; value: (row: T) => string; detail?: (row: T) => string };
	dimensions: MatrixDimension<T>[];
	figures: MatrixFigure<T>[];
};

export type RowMode = 'paged' | 'virtual';

/** A rule of the advanced filter. Percent figures compare as whole numbers: 42 for 42%. */
export type FilterRule =
	| { id: string; field: string; op: 'is' | 'is-not' | 'contains'; value: string }
	| { id: string; field: string; op: 'gt' | 'gte' | 'lt' | 'lte'; value: number | null }
	| { id: string; field: string; op: 'between'; value: [number | null, number | null] }
	| { id: string; field: string; op: 'blank' | 'not-blank' };

export type FilterGroup = { logic: 'and' | 'or'; rules: FilterRule[] };

/** A row of the grid: a group of rows, or one input row. Figure values are keyed by figure id. */
export type MatrixNode<T> =
	| {
			kind: 'group';
			id: string;
			label: string;
			count: number;
			values: Record<string, number | null>;
			children: MatrixNode<T>[];
	  }
	| { kind: 'leaf'; id: string; row: T; values: Record<string, number | null> };
