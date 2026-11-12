<script lang="ts">
	import { DeltaPill } from '$lib/registry/ui/delta-pill/index.js';

	const windows: [string, string] = ['Oct 2026', 'Sep 2026'];
</script>

<div class="flex flex-col items-center gap-3 p-4 text-sm">
	<div class="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-2">
		<span class="flex items-baseline gap-2">
			<span class="font-semibold">214</span>
			<DeltaPill value={214} prior={209} {windows} />
		</span>
		<span class="flex items-baseline gap-2">
			<span class="font-semibold">$184.0K</span>
			<DeltaPill
				value={184_000}
				prior={161_000}
				format="currency"
				formatOptions={{ compact: true, decimals: 1 }}
				lowerIsBetter
				{windows}
			/>
		</span>
		<span class="flex items-baseline gap-2">
			<span class="font-semibold">7.4%</span>
			<DeltaPill value={0.074} prior={0.091} format="percent" lowerIsBetter {windows} />
		</span>
	</div>
	<div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
		<DeltaPill value={97} prior={99} />
		<DeltaPill value={5.6} prior={5.6} />
		<DeltaPill value={1.32} prior={1.1} class="text-sm" />
	</div>
</div>
