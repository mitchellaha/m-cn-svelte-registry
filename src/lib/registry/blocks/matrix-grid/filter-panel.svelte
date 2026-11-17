<script lang="ts">
	import FilterIcon from '@lucide/svelte/icons/list-filter';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { isActiveRule } from './matrix.js';
	import type { FigureKind, FilterGroup, FilterRule } from './types.js';

	/** A field the panel can filter: a text field (label or dimension) or a figure. */
	export type FilterField = { id: string; label: string; type: 'text' | FigureKind };

	let {
		fields,
		value,
		onChange
	}: { fields: FilterField[]; value: FilterGroup; onChange: (value: FilterGroup) => void } =
		$props();

	const TEXT_OPS = [
		['is', 'is'],
		['is-not', 'is not'],
		['contains', 'contains'],
		['blank', 'is blank'],
		['not-blank', 'is not blank']
	] as const;
	const NUMBER_OPS = [
		['gt', '>'],
		['gte', '≥'],
		['lt', '<'],
		['lte', '≤'],
		['between', 'between'],
		['blank', 'is blank'],
		['not-blank', 'is not blank']
	] as const;

	const active = $derived(value.rules.filter(isActiveRule).length);
	const fieldOf = (id: string) => fields.find((f) => f.id === id) ?? fields[0];
	const opsOf = (id: string) => (fieldOf(id)?.type === 'text' ? TEXT_OPS : NUMBER_OPS);
	const opLabel = (rule: FilterRule) => opsOf(rule.field).find(([op]) => op === rule.op)?.[1];

	let nextId = 0;

	/** A fresh rule for a field, with its type's first operator and no value. */
	function blankRule(field: string): FilterRule {
		const id = `rule-${Date.now()}-${nextId++}`;
		return fieldOf(field)?.type === 'text'
			? { id, field, op: 'contains', value: '' }
			: { id, field, op: 'gte', value: null };
	}

	function withOp(rule: FilterRule, op: string): FilterRule {
		const { id, field } = rule;
		if (op === 'blank' || op === 'not-blank') return { id, field, op };
		if (op === 'between') return { id, field, op, value: [null, null] };
		if (op === 'is' || op === 'is-not' || op === 'contains')
			return {
				id,
				field,
				op,
				value: 'value' in rule && typeof rule.value === 'string' ? rule.value : ''
			};
		return {
			id,
			field,
			op: op as 'gt' | 'gte' | 'lt' | 'lte',
			value: 'value' in rule && typeof rule.value === 'number' ? rule.value : null
		};
	}

	const num = (s: string) => (s.trim() === '' || isNaN(Number(s)) ? null : Number(s));

	const update = (i: number, rule: FilterRule) =>
		onChange({ ...value, rules: value.rules.map((r, j) => (j === i ? rule : r)) });
	const remove = (i: number) =>
		onChange({ ...value, rules: value.rules.filter((_, j) => j !== i) });
	const add = () => onChange({ ...value, rules: [...value.rules, blankRule(fields[0]?.id ?? '')] });
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm">
				<FilterIcon data-icon="inline-start" />
				Filter
				{#if active}
					<Badge variant="secondary" class="h-4 px-1.5">{active}</Badge>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="start" class="flex w-[min(36rem,calc(100vw-2rem))] flex-col gap-3 p-3">
		<div class="flex items-center justify-between gap-2">
			<span class="text-xs font-medium text-muted-foreground">Show rows that match</span>
			<ToggleGroup.Root
				type="single"
				variant="outline"
				size="sm"
				value={value.logic}
				onValueChange={(v) => v && onChange({ ...value, logic: v as 'and' | 'or' })}
				aria-label="Match"
			>
				<ToggleGroup.Item value="and">All rules</ToggleGroup.Item>
				<ToggleGroup.Item value="or">Any rule</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>

		{#if value.rules.length === 0}
			<p class="py-2 text-xs text-muted-foreground">No rules. Every row shows.</p>
		{/if}

		{#each value.rules as rule, i (rule.id)}
			{@const field = fieldOf(rule.field)}
			<div class="flex flex-wrap items-center gap-2">
				<Select.Root
					type="single"
					value={rule.field}
					onValueChange={(f) => update(i, blankRule(f))}
				>
					<Select.Trigger size="sm" class="w-40" aria-label="Field">
						<span class="truncate">{field?.label}</span>
					</Select.Trigger>
					<Select.Content class="max-h-72">
						{#each fields as f (f.id)}
							<Select.Item value={f.id} label={f.label} />
						{/each}
					</Select.Content>
				</Select.Root>

				<Select.Root
					type="single"
					value={rule.op}
					onValueChange={(op) => update(i, withOp(rule, op))}
				>
					<Select.Trigger size="sm" class="w-28" aria-label="Operator">
						{opLabel(rule)}
					</Select.Trigger>
					<Select.Content>
						{#each opsOf(rule.field) as [op, label] (op)}
							<Select.Item value={op} {label} />
						{/each}
					</Select.Content>
				</Select.Root>

				{#if rule.op === 'is' || rule.op === 'is-not' || rule.op === 'contains'}
					<Input
						class="h-7 min-w-0 flex-1"
						placeholder="Value"
						aria-label="Value"
						value={rule.value}
						oninput={(e) => update(i, { ...rule, value: e.currentTarget.value })}
					/>
				{:else if rule.op === 'between'}
					<Input
						class="h-7 w-24"
						inputmode="decimal"
						placeholder="Min"
						aria-label="Minimum"
						value={rule.value[0] ?? ''}
						oninput={(e) =>
							update(i, { ...rule, value: [num(e.currentTarget.value), rule.value[1]] })}
					/>
					<span class="text-xs text-muted-foreground">and</span>
					<Input
						class="h-7 w-24"
						inputmode="decimal"
						placeholder="Max"
						aria-label="Maximum"
						value={rule.value[1] ?? ''}
						oninput={(e) =>
							update(i, { ...rule, value: [rule.value[0], num(e.currentTarget.value)] })}
					/>
				{:else if rule.op === 'gt' || rule.op === 'gte' || rule.op === 'lt' || rule.op === 'lte'}
					<Input
						class="h-7 w-28"
						inputmode="decimal"
						placeholder={field?.type === 'percent' ? 'Percent' : 'Value'}
						aria-label="Value"
						value={rule.value ?? ''}
						oninput={(e) => update(i, { ...rule, value: num(e.currentTarget.value) })}
					/>
				{/if}

				<Button
					variant="ghost"
					size="icon-sm"
					class="ml-auto"
					aria-label="Remove rule"
					onclick={() => remove(i)}
				>
					<XIcon />
				</Button>
			</div>
		{/each}

		<div class="flex items-center justify-between gap-2 border-t pt-3">
			<Button variant="ghost" size="sm" onclick={add}>
				<PlusIcon data-icon="inline-start" />
				Add rule
			</Button>
			{#if value.rules.length}
				<Button variant="ghost" size="sm" onclick={() => onChange({ ...value, rules: [] })}>
					Clear
				</Button>
			{/if}
		</div>
	</Popover.Content>
</Popover.Root>
