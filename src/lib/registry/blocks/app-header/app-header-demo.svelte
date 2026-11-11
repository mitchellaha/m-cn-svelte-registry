<script lang="ts">
	import ConstructionIcon from '@lucide/svelte/icons/construction';
	import { StatusBadge } from '$lib/registry/ui/status-badge/index.js';
	import AppHeader from './app-header.svelte';
	import {
		demoActions,
		demoGroups,
		demoMachines,
		demoModules,
		demoProjects,
		demoUser
	} from './demo-data.js';

	let scope = $state<string[]>([]);
	let pinned = $state<string[]>(['today']);
	let current = $state('fleet');
	let last = $state('');

	// The preview page also mounts the standalone command palette on Cmd+K, so this demo uses J.
	const shortcut = 'j';

	const screens = demoModules.flatMap((m) => m.screens.map((screen) => ({ screen, module: m })));
	const active = $derived(screens.find((e) => e.screen.id === current));
	const projectLabel = (id: string) => demoProjects.find((p) => p.id === id)?.label ?? id;
	const machines = $derived(
		scope.length ? demoMachines.filter((m) => scope.includes(m.projectId)) : demoMachines
	);
	const working = $derived(machines.filter((m) => m.tone === 'ok' || m.tone === 'idle'));
	const attention = $derived(machines.filter((m) => m.tone === 'warn' || m.tone === 'crit'));
	const scopeText = $derived(
		scope.length
			? `${scope.length} of ${demoProjects.length} projects`
			: `All ${demoProjects.length} projects`
	);
</script>

{#snippet machineCard(title: string, rows: typeof demoMachines)}
	<div class="flex flex-col rounded-lg border bg-card text-card-foreground">
		<div class="flex items-center justify-between border-b px-3 py-2">
			<h2 class="text-sm font-medium">{title}</h2>
			<span class="text-xs text-muted-foreground">{rows.length}</span>
		</div>
		{#if rows.length}
			<ul class="divide-y">
				{#each rows as machine (machine.id)}
					<li class="flex items-center gap-3 px-3 py-2 text-sm">
						<div class="flex min-w-0 flex-1 flex-col">
							<span class="truncate font-medium">{machine.name}</span>
							<span class="truncate text-xs text-muted-foreground">
								{projectLabel(machine.projectId)}
							</span>
						</div>
						<StatusBadge tone={machine.tone}>{machine.status}</StatusBadge>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="px-3 py-6 text-center text-xs text-muted-foreground">No machines in this scope.</p>
		{/if}
	</div>
{/snippet}

<!-- Mock app window: the header on top, then the page for the current screen. -->
<div class="flex min-h-[640px] flex-col overflow-hidden rounded-lg border bg-background">
	<AppHeader
		scopeItems={demoProjects}
		scopeGroups={demoGroups}
		bind:scope
		modules={demoModules}
		bind:pinned
		{current}
		actions={demoActions}
		user={demoUser}
		{shortcut}
		onNavigate={(screen) => {
			current = screen.id;
			last = `Opened ${screen.label}`;
		}}
		onAction={(action) => (last = action.label)}
		onCreateGroup={() => (last = 'Create new group')}
		onProfile={() => (last = 'Profile')}
		onSignOut={() => (last = 'Sign out')}
	>
		{#snippet brand()}
			<span class="flex items-center gap-2 px-1 text-sm font-semibold">
				<ConstructionIcon class="size-5" />
				<span class="hidden sm:inline">Ridgeline Site Works</span>
			</span>
		{/snippet}
	</AppHeader>
	<div class="flex flex-1 flex-col gap-4 bg-muted/30 p-4">
		<div class="flex flex-wrap items-end justify-between gap-2">
			<div class="flex flex-col gap-0.5">
				<p class="text-xs text-muted-foreground">{active?.module.label}</p>
				<h1 class="text-base font-medium">{active?.screen.label ?? current}</h1>
				<p class="text-sm text-muted-foreground">{active?.screen.description}</p>
			</div>
			<p class="text-xs text-muted-foreground">
				{scopeText}{#if last}<span> · {last}</span>{/if}
			</p>
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			{@render machineCard('Working', working)}
			{@render machineCard('Needs attention', attention)}
		</div>
	</div>
</div>
