<!--
  A row per metric, a column per entity (org, region, product). Each cell holds its value, an
  optional sparkline, an optional change pill and an optional note. Reading across a row compares
  the entities without blending them: there is no total column, so a ratio is never summed.
-->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	// Data types live in ./types.js; import them from there.
	import type { LedgerMetric, MetricLedgerData } from './types.js';

	export interface MetricLedgerProps {
		/** Header of the label column. */
		title: string;
		data: MetricLedgerData;
		/** Figures read as an ellipsis while true. */
		loading?: boolean;
		/** Trailing cell per row: a menu, a link. The column is drawn only when this is set. */
		actions?: Snippet<[LedgerMetric]>;
		/** Sparkline colour, as a text colour class. Default `text-primary`. */
		sparklineClass?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import { cn } from '#lib/utils.js';
	import Sparkline from './sparkline.svelte';
	import { DeltaPill, formatValue } from '$lib/registry/ui/delta-pill/index.js';
	import type { LedgerCell } from './types.js';

	let {
		title,
		data,
		loading = false,
		actions,
		sparklineClass,
		class: className
	}: MetricLedgerProps = $props();

	const cells = $derived(
		data.sections.flatMap((section) =>
			section.metrics.flatMap((metric) => Object.values(metric.cells))
		)
	);
	// A sparkline or a pill anywhere reserves its own table column under every entity, so the
	// sparklines, the values and the pills each line up down the ledger.
	const hasTrend = $derived(cells.some((cell) => cell?.trend?.length));
	const hasPill = $derived(cells.some((cell) => cell?.prior != null));
	const parts = $derived(1 + (hasTrend ? 1 : 0) + (hasPill ? 1 : 0));
	const span = $derived(data.columns.length * parts + (actions ? 2 : 1));
	const sections = $derived(
		data.sections.map((section, i) => ({ ...section, key: section.title ?? `section:${i}` }))
	);
</script>

{#snippet pill(metric: LedgerMetric, cell: LedgerCell)}
	<DeltaPill
		value={cell.value}
		prior={cell.prior ?? null}
		windows={data.windows}
		format={metric.format ?? 'number'}
		formatOptions={metric.formatOptions}
		lowerIsBetter={metric.lowerIsBetter}
	/>
{/snippet}

<Tooltip.Provider>
	<div data-slot="metric-ledger" class={cn('rounded-xl border bg-card px-3 py-1', className)}>
		<Table.Root>
			<Table.Header>
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="h-8 w-full whitespace-normal text-muted-foreground">{title}</Table.Head
					>
					{#each data.columns as column (column.id)}
						<!-- One head per part, not a colspan: the hidden parts drop out on a phone. The label
						     sits over the values. -->
						{#if hasTrend}<Table.Head class="hidden h-8 sm:table-cell" />{/if}
						<Table.Head class="h-8 text-right text-muted-foreground">{column.label}</Table.Head>
						{#if hasPill}<Table.Head class="hidden h-8 sm:table-cell" />{/if}
					{/each}
					{#if actions}<Table.Head class="h-8 w-8" />{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each sections as section (section.key)}
					{#if section.title}
						<Table.Row class="bg-muted/30 hover:bg-muted/30">
							<Table.Cell
								colspan={span}
								class="py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
							>
								{section.title}
							</Table.Cell>
						</Table.Row>
					{/if}
					{#each section.metrics as metric (metric.id)}
						{@const format = metric.format ?? 'number'}
						<Table.Row>
							<Table.Cell class="text-sm whitespace-normal">
								{#if metric.info}
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
												<span {...props} tabindex="0" class="cursor-help">{metric.label}</span>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content class="max-w-xs text-xs">{metric.info}</Tooltip.Content>
									</Tooltip.Root>
								{:else}
									{metric.label}
								{/if}
							</Table.Cell>
							{#each data.columns as column (column.id)}
								{@const cell = metric.cells[column.id]}
								{#if hasTrend}
									<!-- Phones have no room for it beside the figure. -->
									<Table.Cell class="hidden pl-6 sm:table-cell">
										<span class="block w-24">
											{#if cell?.trend && !loading}
												<Sparkline values={cell.trend} class={sparklineClass} />
											{/if}
										</span>
									</Table.Cell>
								{/if}
								<Table.Cell class="text-right tabular-nums">
									{#if loading}
										<span class="text-muted-foreground">…</span>
									{:else}
										<span class="flex flex-col items-end">
											<span class="text-sm font-semibold">
												{formatValue(format, cell?.value, metric.formatOptions)}
											</span>
											{#if cell?.prior != null}
												<!-- On a phone the pill sits under the value so two columns fit. -->
												<span class="sm:hidden">{@render pill(metric, cell)}</span>
											{/if}
											{#if cell?.note}
												<span class="text-[10px] text-muted-foreground">{cell.note}</span>
											{/if}
										</span>
									{/if}
								</Table.Cell>
								{#if hasPill}
									<Table.Cell class="hidden pl-0 tabular-nums sm:table-cell">
										{#if cell?.prior != null && !loading}{@render pill(metric, cell)}{/if}
									</Table.Cell>
								{/if}
							{/each}
							{#if actions}
								<Table.Cell class="w-8 pr-1 print:hidden">{@render actions(metric)}</Table.Cell>
							{/if}
						</Table.Row>
					{:else}
						<Table.Row class="hover:bg-transparent">
							<Table.Cell colspan={span} class="py-6 text-center text-muted-foreground">
								No metrics
							</Table.Cell>
						</Table.Row>
					{/each}
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</Tooltip.Provider>
