<script lang="ts">
	import BoxIcon from '@lucide/svelte/icons/box';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { IconTile } from '$lib/registry/ui/icon-tile/index.js';
</script>

<div class="flex min-h-40 items-center justify-center gap-2 p-6">
	<IconTile size="sm"><BoxIcon /></IconTile>
	<IconTile><BoxIcon /></IconTile>
	<IconTile size="lg"><CopyIcon /></IconTile>
</div>
