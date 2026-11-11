<script lang="ts" module>
	import type { Component } from 'svelte';
	import type { ScopeGroup, ScopeItem, ScopeSwitcherLabels } from './types.js';

	export type ScopeSwitcherProps = {
		items: ScopeItem[];
		groups?: ScopeGroup[];
		/** Selected item ids. Empty means everything is in scope. */
		selected?: string[];
		/** Count shown when nothing is selected. Defaults to items.length. */
		total?: number;
		open?: boolean;
		icon?: Component;
		labels?: Partial<ScopeSwitcherLabels>;
		/** Shows the "Create new group" button when set. */
		onCreateGroup?: () => void;
		/** Below the sm breakpoint the trigger shows only the icon and the count. The label stays in the accessible name. */
		compactOnMobile?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Command from '#lib/components/ui/command/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { cn } from '#lib/utils.js';
	import { defaultScopeSwitcherLabels } from './types.js';

	let {
		items,
		groups = [],
		selected = $bindable([]),
		total,
		open = $bindable(false),
		icon: Icon = FolderKanbanIcon,
		labels: labelOverrides,
		onCreateGroup,
		compactOnMobile = false,
		class: className
	}: ScopeSwitcherProps = $props();

	const labels = $derived({ ...defaultScopeSwitcherLabels, ...labelOverrides });

	// Which list the right pane shows: every item, or one group's members.
	let view = $state<string | null>(null);
	// Below sm the two panes become steps: the group list, then the items of the picked list.
	let step = $state<'groups' | 'items'>('groups');

	$effect(() => {
		if (!open) return;
		untrack(() => (step = 'groups'));
	});

	const activeGroup = $derived(groups.find((g) => g.id === view));
	const viewItems = $derived(
		activeGroup ? items.filter((i) => activeGroup.itemIds.includes(i.id)) : items
	);
	const isAll = $derived(selected.length === 0);
	const allCount = $derived(total ?? items.length);
	const count = $derived(isAll ? allCount : selected.length);

	const triggerLabel = $derived.by(() => {
		if (isAll) return labels.all;
		if (selected.length === 1) {
			const item = items.find((i) => i.id === selected[0]);
			if (item) return itemText(item);
		}
		const group = groups.find((g) => sameSet(g.itemIds, selected));
		return group ? group.label : labels.selected(selected.length);
	});

	function itemText(item: ScopeItem) {
		return item.code ? `${item.code} ${item.label}` : item.label;
	}

	function sameSet(a: string[], b: string[]) {
		return a.length === b.length && a.every((id) => b.includes(id));
	}

	function showList(id: string | null) {
		view = id;
		step = 'items';
	}

	// Phones skip the search autofocus so the keyboard does not cover the list.
	function onOpenAutoFocus(event: Event) {
		if (window.matchMedia('(pointer: coarse)').matches) event.preventDefault();
	}

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		data-slot="scope-switcher-trigger"
		class={cn(
			'flex h-10 max-w-88 min-w-0 shrink items-center gap-2 rounded-lg px-1.5 text-left outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50',
			className
		)}
	>
		<span
			class="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"
		>
			<Icon class="size-4" />
		</span>
		<span class={cn('truncate text-sm font-semibold', compactOnMobile && 'max-sm:sr-only')}>
			{triggerLabel}
		</span>
		<span
			class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums"
		>
			{count}
		</span>
		<ChevronsUpDownIcon class="size-4 shrink-0 text-muted-foreground" />
	</Popover.Trigger>

	<Popover.Content
		data-slot="scope-switcher"
		align="start"
		sideOffset={8}
		collisionPadding={8}
		{onOpenAutoFocus}
		class="max-h-(--bits-popover-content-available-height) w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0 sm:w-[min(92vw,760px)]"
	>
		<div
			class="grid max-h-[min(70dvh,520px)] min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] sm:h-[min(70dvh,520px)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:divide-x"
		>
			<!-- Left pane: which list to show -->
			<Command.Root
				class={cn('rounded-none bg-transparent p-0', step === 'items' && 'max-sm:hidden')}
			>
				<div class="border-b p-1.5">
					<Command.Input placeholder={labels.searchGroups} class="pointer-coarse:text-base!" />
				</div>
				<Command.List class="max-h-none flex-1 p-1.5">
					<Command.Group heading={labels.itemsHeading}>
						<Command.Item
							value={labels.all}
							class={cn('py-2 pointer-coarse:py-2.5', view === null && 'bg-muted')}
							onSelect={() => showList(null)}
						>
							<span class="flex-1 truncate font-medium">{labels.all}</span>
							<span class="text-muted-foreground tabular-nums">{allCount}</span>
							<ChevronRightIcon class="text-muted-foreground" />
						</Command.Item>
					</Command.Group>
					<Command.Group heading={labels.groupsHeading} forceMount={groups.length === 0}>
						{#each groups as group (group.id)}
							<Command.Item
								value="{group.label} {group.id}"
								class={cn('py-2 pointer-coarse:py-2.5', view === group.id && 'bg-muted')}
								onSelect={() => showList(group.id)}
							>
								<LayersIcon />
								<span class="flex-1 truncate">{group.label}</span>
								<span class="text-muted-foreground tabular-nums">{group.itemIds.length}</span>
								<ChevronRightIcon class="text-muted-foreground" />
							</Command.Item>
						{:else}
							<p class="px-2.5 py-1.5 text-xs text-muted-foreground">{labels.noGroups}</p>
						{/each}
					</Command.Group>
				</Command.List>
				{#if onCreateGroup}
					<div class="border-t p-1.5">
						<Button
							variant="ghost"
							size="sm"
							class="w-full justify-start"
							onclick={() => {
								open = false;
								onCreateGroup();
							}}
						>
							<PlusIcon />
							{labels.createGroup}
						</Button>
					</div>
				{/if}
			</Command.Root>

			<!-- Right pane: pick items -->
			<Command.Root
				class={cn('rounded-none bg-transparent p-0', step === 'groups' && 'max-sm:hidden')}
			>
				<div class="flex items-center gap-2 border-b px-3 py-2.5 max-sm:py-1.5 max-sm:pl-1.5">
					<Button
						variant="ghost"
						size="icon-lg"
						class="sm:hidden"
						aria-label={labels.back}
						onclick={() => (step = 'groups')}
					>
						<ChevronLeftIcon />
					</Button>
					<span class="flex-1 truncate text-sm font-semibold">
						{activeGroup?.label ?? labels.all}
					</span>
					<span class="text-xs text-muted-foreground tabular-nums">{viewItems.length}</span>
				</div>
				<div class="border-b p-1.5">
					<Command.Input placeholder={labels.searchItems} class="pointer-coarse:text-base!" />
				</div>
				<Command.List class="max-h-none flex-1 p-1.5">
					<Command.Empty>{labels.empty}</Command.Empty>
					{#if activeGroup}
						<Command.Item
							value={labels.selectGroup}
							class="py-2 pointer-coarse:py-2.5"
							data-checked={sameSet(activeGroup.itemIds, selected)}
							onSelect={() => (selected = [...activeGroup.itemIds])}
						>
							{labels.selectGroup}
						</Command.Item>
					{:else}
						<Command.Item
							value={labels.showAll}
							class="py-2 pointer-coarse:py-2.5"
							data-checked={isAll}
							onSelect={() => (selected = [])}
						>
							{labels.showAll}
						</Command.Item>
					{/if}
					<Command.Group heading={activeGroup ? activeGroup.label : labels.itemsHeading}>
						{#each viewItems as item (item.id)}
							<Command.Item
								value="{itemText(item)} {item.id}"
								class="py-2 pointer-coarse:py-2.5"
								data-checked={selected.includes(item.id)}
								onSelect={() => toggle(item.id)}
							>
								{#if item.code}
									<span class="font-mono text-muted-foreground">{item.code}</span>
								{/if}
								<span class="truncate">{item.label}</span>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</div>
	</Popover.Content>
</Popover.Root>
