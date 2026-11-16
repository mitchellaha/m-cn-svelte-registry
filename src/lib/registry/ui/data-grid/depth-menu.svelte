<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronsDownUpIcon from '@lucide/svelte/icons/chevrons-down-up';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as ButtonGroup from '#lib/components/ui/button-group/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';

	let {
		levelCount,
		level,
		onLevelChange,
		disabled = false,
		class: className
	}: {
		/** Levels in the tree. Level 1 is the top rows only; the last shows every row. */
		levelCount: number;
		/** The level the expand state matches, or 0 when rows were opened by hand. */
		level: number;
		onLevelChange: (level: number) => void;
		disabled?: boolean;
		class?: string;
	} = $props();

	const allExpanded = $derived(level === levelCount);

	function label(n: number) {
		if (n === 1) return 'Level 1 (Top only)';
		if (n === levelCount) return `Level ${n} (All)`;
		return `Expand to Level ${n}`;
	}
</script>

<ButtonGroup.Root aria-label="Tree depth" class={className}>
	<Button
		variant="outline"
		size="sm"
		{disabled}
		onclick={() => onLevelChange(allExpanded ? 1 : levelCount)}
	>
		{#if allExpanded}
			<ChevronsDownUpIcon data-icon="inline-start" />
			Collapse All
		{:else}
			<ChevronsUpDownIcon data-icon="inline-start" />
			Expand All
		{/if}
	</Button>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger {disabled}>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="icon-sm" aria-label="Jump to depth">
					<ChevronDownIcon />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56">
			<DropdownMenu.Group>
				<DropdownMenu.Label>Jump to depth</DropdownMenu.Label>
				{#each { length: levelCount }, i (i)}
					<DropdownMenu.Item onSelect={() => onLevelChange(i + 1)}>
						{label(i + 1)}
						{#if level === i + 1}
							<CheckIcon class="ms-auto" />
						{/if}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</ButtonGroup.Root>
