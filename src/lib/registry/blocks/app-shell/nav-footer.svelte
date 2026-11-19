<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { cn } from '#lib/utils.js';
	import type { AppShellLabels, AppShellMenuItem } from './types.js';

	let {
		help,
		labels,
		onHelp,
		onSettings,
		onFeedback
	}: {
		help: AppShellMenuItem[];
		labels: AppShellLabels;
		onHelp?: (item: AppShellMenuItem) => void;
		onSettings?: () => void;
		onFeedback?: () => void;
	} = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Footer class="flex-row items-center gap-1 border-t border-sidebar-border">
	<div class="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
		{#if help.length}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" aria-label={labels.help}>
							<CircleHelpIcon />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="top" align="start" class="w-56">
					{#each help as item (item.id)}
						<DropdownMenu.Item onSelect={() => onHelp?.(item)}>
							{#if item.icon}<item.icon />{/if}
							{item.label}
							{#if item.badge}
								<Badge class="ms-auto bg-orange-500 text-white">{item.badge}</Badge>
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
		{#if onSettings}
			<Button variant="ghost" size="icon" aria-label={labels.settings} onclick={onSettings}>
				<SettingsIcon />
			</Button>
		{/if}
		{#if onFeedback}
			<Button variant="ghost" class="text-muted-foreground" onclick={onFeedback}>
				{labels.feedback}
			</Button>
		{/if}
	</div>
	<Button
		variant="ghost"
		size="icon"
		class="ms-auto group-data-[collapsible=icon]:mx-auto max-md:hidden"
		aria-label={labels.toggleSidebar}
		aria-expanded={sidebar.open}
		onclick={sidebar.toggle}
	>
		<ChevronLeftIcon class={cn('transition-transform', !sidebar.open && 'rotate-180')} />
	</Button>
</Sidebar.Footer>
