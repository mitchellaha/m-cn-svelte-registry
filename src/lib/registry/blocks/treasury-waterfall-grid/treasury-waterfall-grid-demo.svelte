<script lang="ts">
	import TreasuryWaterfallGrid from './treasury-waterfall-grid.svelte';
	import { treasuryData } from './treasury-waterfall-grid-data.js';
</script>

<TreasuryWaterfallGrid data={treasuryData} defaultMonthIndex={2} />
