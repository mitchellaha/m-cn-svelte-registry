<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { StatusBadge, type StatusBadgeTone } from '$lib/registry/ui/status-badge/index.js';

	type Machine = { name: string; location: string; tone: StatusBadgeTone; status: string };

	const machines: Machine[] = [
		{
			name: 'EX-14 Excavator',
			location: 'Harbor Street storm drain',
			tone: 'ok',
			status: 'On site'
		},
		{
			name: 'WL-03 Wheel loader',
			location: 'County Road 9 widening',
			tone: 'warn',
			status: 'Service due'
		},
		{ name: 'RL-07 Roller', location: 'Workshop bay 2', tone: 'crit', status: 'Out of order' },
		{ name: 'SK-22 Skid steer', location: 'Main yard', tone: 'idle', status: 'In yard' },
		{ name: 'DT-11 Dump truck', location: 'Market Square paving', tone: 'ok', status: 'On site' }
	];
</script>

<div class="p-4">
	<div class="overflow-hidden rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Machine</Table.Head>
					<Table.Head>Location</Table.Head>
					<Table.Head class="text-right">Status</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each machines as machine (machine.name)}
					<Table.Row>
						<Table.Cell class="font-medium">{machine.name}</Table.Cell>
						<Table.Cell class="text-muted-foreground">{machine.location}</Table.Cell>
						<Table.Cell class="text-right">
							<StatusBadge tone={machine.tone}>{machine.status}</StatusBadge>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
