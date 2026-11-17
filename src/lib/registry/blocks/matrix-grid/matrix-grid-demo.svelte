<script lang="ts">
	import MatrixGrid from './matrix-grid.svelte';
	import { storeSchema, stores } from './matrix-grid-data.js';

	let grouping = $state(['region', 'district']);
	let columns = $state([
		'm-sales',
		'm-margin',
		'm-margin-pct',
		'm-orders',
		'y-sales',
		'y-margin-pct',
		'plan',
		'attainment',
		'variance'
	]);
</script>

<!-- grouping and columns are bound, so a page could store them in the URL or a preference. -->
<MatrixGrid
	data={stores}
	schema={storeSchema}
	bind:grouping
	bind:columns
	searchPlaceholder="Search stores, managers..."
	exportFileName="stores.csv"
	height={560}
/>
