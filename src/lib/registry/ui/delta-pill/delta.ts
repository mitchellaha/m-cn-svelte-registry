export type DeltaFormat = 'number' | 'currency' | 'percent';

export type DeltaFormatOptions = {
	/** Fraction digits. Defaults: number 0, currency 0, percent 1. */
	decimals?: number;
	/** ISO 4217 code for `currency`. Default USD. */
	currency?: string;
	/** Compact notation: 27.7M instead of 27,700,000. */
	compact?: boolean;
};

const DASH = '—';

/** A figure as text. Null or not finite reads as a dash. `sign` prefixes a plus on a rise. */
export function formatValue(
	format: DeltaFormat,
	value: number | null | undefined,
	options: DeltaFormatOptions & { sign?: boolean } = {}
): string {
	if (value == null || !Number.isFinite(value)) return DASH;
	const decimals = options.decimals ?? (format === 'percent' ? 1 : 0);
	return new Intl.NumberFormat('en-US', {
		style: format === 'number' ? 'decimal' : format,
		currency: format === 'currency' ? (options.currency ?? 'USD') : undefined,
		notation: options.compact ? 'compact' : 'standard',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		signDisplay: options.sign ? 'exceptZero' : 'auto'
	}).format(value);
}

/**
 * The change between a value and its prior. Null when either side is missing or not finite, or
 * the prior is zero (no honest ratio).
 */
export function deltaOf(value: number | null | undefined, prior: number | null | undefined) {
	if (
		value == null ||
		prior == null ||
		!Number.isFinite(value) ||
		!Number.isFinite(prior) ||
		prior === 0
	)
		return null;
	const pct = (value - prior) / Math.abs(prior);
	return { pct, gap: value - prior, up: value > prior, flat: Math.abs(pct) < 0.001 };
}

export type Pill = {
	text: string;
	tone: 'good' | 'bad' | 'flat';
	dir: 'up' | 'down' | 'flat';
};

/**
 * What the change pill shows. A rate's change is its move in points (15.6% to 10.3% is
 * "-5.3 pts"), never the relative change of the rate, which reads as a wild swing. Currency and
 * counts keep the relative %.
 */
export function pillOf(
	value: number | null | undefined,
	prior: number | null | undefined,
	format: DeltaFormat = 'number',
	lowerIsBetter = false
): Pill | null {
	const d = deltaOf(value, prior);
	if (!d) return null;
	const text =
		format === 'percent'
			? `${d.gap > 0 ? '+' : ''}${(d.gap * 100).toFixed(1)} pts`
			: formatValue('percent', d.pct, { sign: true });
	return {
		text,
		tone: d.flat ? 'flat' : d.up === !lowerIsBetter ? 'good' : 'bad',
		dir: d.flat ? 'flat' : d.up ? 'up' : 'down'
	};
}
