<script lang="ts">
	import FeatureMenu from './feature-menu.svelte';
	import { demoModules } from './demo-data.js';

	let current = $state('daily-logs');
	let pinned = $state<string[]>(['today', 'fleet']);
</script>

<FeatureMenu
	modules={demoModules}
	bind:pinned
	{current}
	onNavigate={(screen) => (current = screen.id)}
/>
