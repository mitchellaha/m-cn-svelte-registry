/**
 * SVG paths for a sparkline in a `width` by `height` box: the line, and the same line closed
 * down to the baseline for the fill. Nulls are skipped. Null with fewer than two points.
 */
export function sparkPaths(values: readonly (number | null)[], width: number, height: number) {
	const points = values
		.map((v, i) => ({ v, i }))
		.filter((p): p is { v: number; i: number } => p.v != null && Number.isFinite(p.v));
	if (points.length < 2) return null;
	const min = Math.min(...points.map((p) => p.v));
	const max = Math.max(...points.map((p) => p.v));
	const pad = 2;
	const last = Math.max(values.length - 1, 1);
	const xy = points.map((p) => ({
		x: (p.i / last) * width,
		// A flat series sits on the midline.
		y: max === min ? height / 2 : pad + (1 - (p.v - min) / (max - min)) * (height - pad * 2)
	}));
	const r = (n: number) => Math.round(n * 100) / 100;
	// Monotone cubic: a point's tangent is the mean of the slopes either side, flat at a peak or
	// trough and capped at three times the gentler slope, so the curve never overshoots the data.
	const n = xy.length;
	const slope = (i: number) => (xy[i + 1].y - xy[i].y) / (xy[i + 1].x - xy[i].x);
	const tangent = xy.map((_, i) => {
		if (i === 0) return slope(0);
		if (i === n - 1) return slope(n - 2);
		const a = slope(i - 1);
		const b = slope(i);
		if (a * b <= 0) return 0;
		const cap = 3 * Math.min(Math.abs(a), Math.abs(b));
		return Math.sign(a) * Math.min(Math.abs(a + b) / 2, cap);
	});
	let line = `M${r(xy[0].x)},${r(xy[0].y)}`;
	for (let i = 1; i < n; i++) {
		const dx = (xy[i].x - xy[i - 1].x) / 3;
		line +=
			` C${r(xy[i - 1].x + dx)},${r(xy[i - 1].y + tangent[i - 1] * dx)}` +
			` ${r(xy[i].x - dx)},${r(xy[i].y - tangent[i] * dx)} ${r(xy[i].x)},${r(xy[i].y)}`;
	}
	const area = `${line} L${r(xy[xy.length - 1].x)},${height} L${r(xy[0].x)},${height} Z`;
	return { line, area };
}
