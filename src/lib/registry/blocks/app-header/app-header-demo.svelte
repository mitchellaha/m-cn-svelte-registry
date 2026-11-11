<script lang="ts">
	import ConstructionIcon from '@lucide/svelte/icons/construction';
	import AppHeader from './app-header.svelte';
	import { demoActions, demoGroups, demoModules, demoProjects, demoUser } from './demo-data.js';

	let scope = $state<string[]>([]);
	let pinned = $state<string[]>(['today']);
	let current = $state('fleet');
</script>

<!-- The preview page also mounts the command palette demo on Cmd+K, so this one uses J. -->
<AppHeader
	class="rounded-lg border"
	scopeItems={demoProjects}
	scopeGroups={demoGroups}
	bind:scope
	modules={demoModules}
	bind:pinned
	{current}
	actions={demoActions}
	user={demoUser}
	shortcut="j"
	onNavigate={(screen) => (current = screen.id)}
	onSignOut={() => {}}
>
	{#snippet brand()}
		<span class="flex items-center gap-2 px-1 text-sm font-semibold">
			<ConstructionIcon class="size-5" />
			Ridgeline Site Works
		</span>
	{/snippet}
</AppHeader>
