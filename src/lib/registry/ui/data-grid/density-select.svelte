<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js';
	import { cn } from '#lib/utils.js';
	import { DENSITY_ITEMS, type Density } from './data-grid.js';

	let {
		value = $bindable('comfortable'),
		id,
		align = 'start',
		class: className
	}: {
		value?: Density;
		/** Set when a label points at the trigger; otherwise the trigger names itself. */
		id?: string;
		align?: 'start' | 'center' | 'end';
		class?: string;
	} = $props();
</script>

<Select.Root
	type="single"
	items={DENSITY_ITEMS}
	{value}
	onValueChange={(next) => (value = next as Density)}
>
	<Select.Trigger
		{id}
		size="sm"
		aria-label={id ? undefined : 'Density'}
		class={cn('w-36', className)}
	>
		<Select.Value />
	</Select.Trigger>
	<Select.Content {align}>
		{#each DENSITY_ITEMS as item (item.value)}
			<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
