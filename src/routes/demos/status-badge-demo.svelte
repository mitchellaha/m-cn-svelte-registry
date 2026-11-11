<script lang="ts">
	import { StatusBadge } from '$lib/registry/ui/status-badge/index.js';
</script>

<div class="flex flex-wrap items-center justify-center gap-2 p-4">
	<StatusBadge tone="ok">On site</StatusBadge>
	<StatusBadge tone="warn">Service due</StatusBadge>
	<StatusBadge tone="crit">Out of order</StatusBadge>
	<StatusBadge tone="idle">In yard</StatusBadge>
</div>
