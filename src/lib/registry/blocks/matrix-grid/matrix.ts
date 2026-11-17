import {
	LABEL_ID,
	type FigureKind,
	type FilterGroup,
	type FilterRule,
	type MatrixFigure,
	type MatrixNode,
	type MatrixSchema
} from './types.js';

// ── Values ───────────────────────────────────────────────────────────────────

const isNum = (v: number | null | undefined): v is number => typeof v === 'number' && !isNaN(v);

const capped = (v: number | null, max?: number): number | null =>
	v === null || max === undefined ? v : Math.min(v, max);

/** A row's value for a figure: its own value, or its numerator over its denominator. */
export function rowValue<T>(f: MatrixFigure<T>, row: T): number | null {
	if (f.value) {
		const v = f.value(row);
		return isNum(v) ? capped(v, f.max) : null;
	}
	if (!f.ratio) return null;
	const n = f.ratio.numerator(row);
	const d = f.ratio.denominator(row);
	return isNum(n) && isNum(d) && d !== 0 ? capped(n / d, f.max) : null;
}

/** A group's value: the sum of its rows, or the sum of numerators over the sum of denominators. */
export function groupValue<T>(f: MatrixFigure<T>, rows: readonly T[]): number | null {
	if (f.ratio) {
		let n = 0;
		let d = 0;
		let any = false;
		for (const row of rows) {
			const a = f.ratio.numerator(row);
			const b = f.ratio.denominator(row);
			if (!isNum(a) || !isNum(b)) continue;
			n += a;
			d += b;
			any = true;
		}
		return any && d !== 0 ? capped(n / d, f.max) : null;
	}
	let sum = 0;
	let any = false;
	for (const row of rows) {
		const v = f.value?.(row);
		if (!isNum(v)) continue;
		sum += v;
		any = true;
	}
	return any ? capped(sum, f.max) : null;
}

const valuesOf = <T>(figures: readonly MatrixFigure<T>[], rows: readonly T[]) =>
	Object.fromEntries(figures.map((f) => [f.id, groupValue(f, rows)]));

// ── Filtering ────────────────────────────────────────────────────────────────

/** Percent figures are stored as fractions but compared as whole numbers, so 0.42 matches 42. */
export const toFilterUnits = (kind: FigureKind, v: number | null) =>
	v !== null && kind === 'percent' ? v * 100 : v;

export type RangeFilters = Record<string, [number | null, number | null]>;

function inRange(v: number | null, [min, max]: [number | null, number | null]) {
	if (min === null && max === null) return true;
	if (v === null) return false;
	return (min === null || v >= min) && (max === null || v <= max);
}

function matchRule<T>(rule: FilterRule, row: T, schema: MatrixSchema<T>): boolean {
	const dim = schema.dimensions.find((d) => d.id === rule.field);
	if (dim || rule.field === LABEL_ID) {
		const text = dim ? dim.value(row) : schema.label.value(row);
		if (rule.op === 'blank') return !text;
		if (rule.op === 'not-blank') return !!text;
		if (rule.op === 'is' || rule.op === 'is-not' || rule.op === 'contains') {
			const want = rule.value.trim().toLowerCase();
			const have = text.toLowerCase();
			if (rule.op === 'is') return have === want;
			if (rule.op === 'is-not') return have !== want;
			return have.includes(want);
		}
		return true;
	}
	const f = schema.figures.find((x) => x.id === rule.field);
	if (!f) return true;
	const v = toFilterUnits(f.kind, rowValue(f, row));
	switch (rule.op) {
		case 'blank':
			return v === null;
		case 'not-blank':
			return v !== null;
		case 'gt':
			return v !== null && v > rule.value!;
		case 'gte':
			return v !== null && v >= rule.value!;
		case 'lt':
			return v !== null && v < rule.value!;
		case 'lte':
			return v !== null && v <= rule.value!;
		case 'between':
			return inRange(v, rule.value);
		default:
			return true;
	}
}

/** Rules with no value yet are ignored, so a half-written rule never empties the grid. */
export function isActiveRule(rule: FilterRule): boolean {
	switch (rule.op) {
		case 'blank':
		case 'not-blank':
			return true;
		case 'between':
			return rule.value[0] !== null || rule.value[1] !== null;
		case 'is':
		case 'is-not':
		case 'contains':
			return rule.value.trim() !== '';
		default:
			return rule.value !== null;
	}
}

export type RowFilters = {
	/** Already trimmed and lowercased. */
	query: string;
	ranges: RangeFilters;
	advanced: FilterGroup;
};

export function filterRows<T>(rows: readonly T[], schema: MatrixSchema<T>, f: RowFilters): T[] {
	const ranges = Object.entries(f.ranges).filter(([, r]) => r[0] !== null || r[1] !== null);
	const rules = f.advanced.rules.filter(isActiveRule);
	if (!f.query && !ranges.length && !rules.length) return [...rows];
	const figures = new Map(schema.figures.map((x) => [x.id, x]));
	return rows.filter((row) => {
		if (f.query) {
			const text = [
				schema.label.value(row),
				schema.label.detail?.(row) ?? '',
				...schema.dimensions.map((d) => d.value(row))
			]
				.join(' ')
				.toLowerCase();
			if (!text.includes(f.query)) return false;
		}
		for (const [id, range] of ranges) {
			const fig = figures.get(id);
			if (fig && !inRange(toFilterUnits(fig.kind, rowValue(fig, row)), range)) return false;
		}
		if (rules.length) {
			const hits = rules.map((r) => matchRule(r, row, schema));
			if (f.advanced.logic === 'and' ? !hits.every(Boolean) : !hits.some(Boolean)) return false;
		}
		return true;
	});
}

// ── The group tree ───────────────────────────────────────────────────────────

/**
 * Groups rows by each dimension in `grouping`, in order. A group id carries its whole path
 * (`region:North/district:North 2`), so two districts with one name under different regions
 * stay apart and an expand state survives a re-sort.
 */
export function buildTree<T>(
	rows: readonly T[],
	schema: MatrixSchema<T>,
	grouping: readonly string[]
): MatrixNode<T>[] {
	const dims = grouping
		.map((id) => schema.dimensions.find((d) => d.id === id))
		.filter((d) => d !== undefined);

	const level = (part: readonly T[], depth: number, path: string): MatrixNode<T>[] => {
		const dim = dims[depth];
		if (!dim) {
			return part.map((row) => ({
				kind: 'leaf',
				id: schema.rowId(row),
				row,
				values: Object.fromEntries(schema.figures.map((f) => [f.id, rowValue(f, row)]))
			}));
		}
		const buckets = new Map<string, T[]>();
		for (const row of part) {
			const key = dim.value(row) || '(blank)';
			const bucket = buckets.get(key);
			if (bucket) bucket.push(row);
			else buckets.set(key, [row]);
		}
		return [...buckets].map(([key, members]) => {
			const id = `${path}${dim.id}:${key}`;
			return {
				kind: 'group',
				id,
				label: key,
				count: members.length,
				values: valuesOf(schema.figures, members),
				children: level(members, depth + 1, `${id}/`)
			};
		});
	};

	return level(rows, 0, '');
}

export const totalValues = <T>(rows: readonly T[], schema: MatrixSchema<T>) =>
	valuesOf(schema.figures, rows);

// ── Columns and bands ────────────────────────────────────────────────────────

/** Runs of consecutive figures with one band, in order: the top header row. */
export function bands<T>(figures: readonly MatrixFigure<T>[]) {
	const out: { band: string; figures: MatrixFigure<T>[] }[] = [];
	for (const f of figures) {
		const last = out.at(-1);
		if (last?.band === f.band) last.figures.push(f);
		else out.push({ band: f.band, figures: [f] });
	}
	return out;
}

/** Column width per figure kind, in px. Long headers break onto a second line instead. */
export const FIGURE_WIDTH: Record<FigureKind, number> = {
	money: 104,
	percent: 76,
	count: 76,
	number: 84
};

/** Body row height per density, in px. Rows never wrap, so virtual scrolling can do arithmetic. */
export const ROW_HEIGHT = { compact: 32, comfortable: 40 } as const;

/**
 * Tints for the second, fourth... header band and its cells, so adjacent bands stay apart.
 * Mixed into the background rather than layered with opacity, because sticky cells scroll over
 * them and must hide what is underneath.
 */
export const ALT_BAND_BODY =
	'bg-[color-mix(in_oklab,var(--color-foreground)_2.5%,var(--color-background))]';
export const ALT_BAND_HEADER =
	'bg-[color-mix(in_oklab,var(--color-foreground)_5%,var(--color-background))]';

// ── Formatting ───────────────────────────────────────────────────────────────

const moneyFmt = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});
const countFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const numberFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const pctFmt = new Intl.NumberFormat('en-US', {
	style: 'percent',
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

export function formatFigure<T>(f: MatrixFigure<T>, v: number | null): string {
	if (v === null) return '';
	if (f.format) return f.format(v);
	switch (f.kind) {
		case 'money':
			return moneyFmt.format(v);
		case 'percent':
			return pctFmt.format(v);
		case 'count':
			return countFmt.format(v);
		default:
			return numberFmt.format(v);
	}
}

// ── Export ───────────────────────────────────────────────────────────────────

const csvCell = (v: string | number | null) => {
	if (v === null) return '';
	const s = String(v);
	return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

/**
 * One line per input row, in grid order: every dimension, the label, then the shown figures as
 * raw numbers (percents as fractions), so a spreadsheet can total them again.
 */
export function toCsv<T>(
	rows: readonly T[],
	schema: MatrixSchema<T>,
	figures: readonly MatrixFigure<T>[]
): string {
	const header = [
		...schema.dimensions.map((d) => d.label),
		schema.label.header,
		...figures.map((f) => `${f.band}: ${f.header}`)
	];
	const lines = rows.map((row) => [
		...schema.dimensions.map((d) => d.value(row)),
		schema.label.value(row),
		...figures.map((f) => rowValue(f, row))
	]);
	return [header, ...lines].map((line) => line.map(csvCell).join(',')).join('\n');
}

export function download(fileName: string, text: string) {
	const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
	// Revoking at once can cancel the download in some browsers; give it a moment to start.
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Virtual window ───────────────────────────────────────────────────────────

/** The slice of rows to render for a scroll position, with `overscan` rows either side. */
export function virtualWindow(
	count: number,
	rowHeight: number,
	scrollTop: number,
	viewport: number,
	overscan = 8
) {
	const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
	const last = Math.min(count, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
	return {
		start: first,
		end: Math.max(first, last),
		before: first * rowHeight,
		after: Math.max(0, (count - Math.max(first, last)) * rowHeight)
	};
}
