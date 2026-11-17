<script lang="ts">
	import BomTreeGrid from './bom-tree-grid.svelte';
	import { demoBom } from './demo-data.js';
</script>

<!-- Opens Drive System and its Drivetrain; everything else starts collapsed. -->
<BomTreeGrid data={demoBom} defaultExpanded={{ 'sys-100': true, 'asm-120': true }} />
