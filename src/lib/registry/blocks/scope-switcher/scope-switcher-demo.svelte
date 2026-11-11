<script lang="ts">
	import ScopeSwitcher from './scope-switcher.svelte';
	import { demoGroups, demoProjects } from './demo-data.js';

	let selected = $state<string[]>([]);
</script>

<ScopeSwitcher items={demoProjects} groups={demoGroups} bind:selected onCreateGroup={() => {}} />
