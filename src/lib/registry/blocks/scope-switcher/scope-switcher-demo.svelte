<script lang="ts">
	import ConstructionIcon from '@lucide/svelte/icons/construction';
	import ScopeSwitcher from './scope-switcher.svelte';
	import { demoGroups, demoProjects } from './demo-data.js';

	let selected = $state<string[]>([]);
	let last = $state('');

	const inScope = $derived(
		selected.length ? demoProjects.filter((p) => selected.includes(p.id)) : demoProjects
	);
</script>

<!-- Mock app: the switcher sits in a header bar so its popover opens downward. -->
<div class="flex min-h-[520px] flex-col bg-background">
	<header class="flex h-12 shrink-0 items-center gap-2 border-b px-3">
		<span class="flex items-center gap-2 text-sm font-semibold">
			<ConstructionIcon class="size-5" />
			<span class="hidden sm:inline">Ridgeline Site Works</span>
		</span>
		<span class="h-5 w-px bg-border"></span>
		<ScopeSwitcher
			items={demoProjects}
			groups={demoGroups}
			bind:selected
			onCreateGroup={() => (last = 'Create new group')}
		/>
	</header>
	<div class="flex flex-1 flex-col gap-3 p-4">
		<div class="flex flex-col gap-0.5">
			<h1 class="text-sm font-medium">Projects in view</h1>
			<p class="text-xs text-muted-foreground">
				{selected.length ? `${inScope.length} of ${demoProjects.length} selected` : 'All projects'}
				{#if last}· Last event: {last}{/if}
			</p>
		</div>
		<ul class="divide-y rounded-lg border text-sm">
			{#each inScope as project (project.id)}
				<li class="flex items-center gap-3 px-3 py-2">
					<span class="w-10 font-mono text-xs text-muted-foreground">{project.code}</span>
					<span class="truncate">{project.label}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
