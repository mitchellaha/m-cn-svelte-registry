<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import * as DataGrid from '$lib/registry/ui/data-grid/index.js';

	const teams = [
		{ id: 'design', name: 'Design', seats: 8, people: ['Ada Park', 'Noor Idris'] },
		{
			id: 'platform',
			name: 'Platform',
			seats: 14,
			people: ['Sam Okafor', 'Lena Voss', 'Kit Moreau']
		},
		{ id: 'support', name: 'Support', seats: 6, people: ['Jo Tanaka'] }
	];

	let search = $state('');
	let density = $state<DataGrid.Density>('comfortable');
	let open = $state<Record<string, boolean>>({ design: true });

	const query = $derived(search.trim().toLowerCase());
	const cellPad = $derived(DataGrid.densityCellClass(density));
	const shown = $derived(
		teams
			.map((team) => ({
				...team,
				people: team.people.filter((p) => p.toLowerCase().includes(query))
			}))
			.filter((team) => !query || team.people.length || team.name.toLowerCase().includes(query))
	);
</script>

<DataGrid.Panel class="flex flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<DataGrid.Search class="max-w-64" placeholder="Search people..." bind:value={search} />
		<DataGrid.DensitySelect align="end" bind:value={density} />
	</div>
	<DataGrid.Viewport>
		<Table.Root>
			<Table.Header class="bg-muted/40">
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="h-9 px-3 text-muted-foreground">Team</Table.Head>
					<Table.Head class="h-9 px-3 text-end text-muted-foreground">Seats</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each shown as team (team.id)}
					<!-- A search pins every row open; toggles are ignored until it clears. -->
					{@const expanded = DataGrid.pinnedExpanded(query, open[team.id] ?? false)}
					<Table.Row class={DataGrid.GRID_ROW_CLASS}>
						<Table.Cell class={cellPad}>
							<div class="flex items-center gap-2">
								<DataGrid.RowToggle
									{expanded}
									label={expanded ? `Collapse ${team.name}` : `Expand ${team.name}`}
									onclick={() => {
										if (!query) open[team.id] = !open[team.id];
									}}
								/>
								<span class="font-medium text-foreground">{team.name}</span>
							</div>
						</Table.Cell>
						<Table.Cell class={[cellPad, 'text-end tabular-nums']}>{team.seats}</Table.Cell>
					</Table.Row>
					{#if expanded}
						{#each team.people as person (person)}
							<Table.Row>
								<Table.Cell class={[cellPad, 'ps-10 text-muted-foreground']} colspan={2}>
									{person}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				{:else}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell colspan={2} class="h-16 text-center text-muted-foreground">
							No one matches.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</DataGrid.Viewport>
</DataGrid.Panel>
