<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import MetricLedger from './metric-ledger.svelte';
	import { ledgerData } from './metric-ledger-data.js';
</script>

<MetricLedger title="Staffing and movement" data={ledgerData}>
	{#snippet actions(metric)}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon-sm" aria-label="{metric.label} actions">
						<MenuIcon />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item>View query</DropdownMenu.Item>
				<DropdownMenu.Item>Export CSV</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/snippet}
</MetricLedger>
