<script lang="ts">
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import { CompoundTag } from '$lib/registry/ui/compound-tag/index.js';

	let cities = $state(['London', 'New York', 'Seattle']);
</script>

<div class="flex flex-col items-center gap-3 p-4">
	<div class="flex flex-wrap justify-center gap-2">
		<CompoundTag left="Status">Default</CompoundTag>
		<CompoundTag left="Status" intent="primary">Active</CompoundTag>
		<CompoundTag left="Status" intent="success">Healthy</CompoundTag>
		<CompoundTag left="Status" intent="warning">Degraded</CompoundTag>
		<CompoundTag left="Status" intent="danger">Down</CompoundTag>
	</div>
	<div class="flex flex-wrap justify-center gap-2">
		<CompoundTag left="Env" minimal>Production</CompoundTag>
		<CompoundTag left="Env" minimal intent="primary">Staging</CompoundTag>
		<CompoundTag left="City" round icon={GlobeIcon}>London</CompoundTag>
		<CompoundTag left="Size" size="lg">Large</CompoundTag>
	</div>
	<div class="flex flex-wrap justify-center gap-2">
		{#each cities as city (city)}
			<CompoundTag
				left="City"
				minimal
				removeLabel="Remove {city}"
				onRemove={() => (cities = cities.filter((c) => c !== city))}
			>
				{city}
			</CompoundTag>
		{/each}
	</div>
</div>
