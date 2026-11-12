<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { cn } from '#lib/utils.js';

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		class: className
	}: { value?: string; placeholder?: string; class?: string } = $props();
</script>

<InputGroup.Root data-grid="search" class={cn('w-full max-w-sm', className)}>
	<InputGroup.Addon>
		<SearchIcon />
	</InputGroup.Addon>
	<InputGroup.Input {placeholder} bind:value />
</InputGroup.Root>
