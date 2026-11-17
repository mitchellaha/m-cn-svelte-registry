<script lang="ts">
	import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
	import SiteHeader from '../site-header.svelte';
	import BlockViewer from './block-viewer.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Blocks · m-cn-svelte registry</title>
</svelte:head>

<div class="min-h-svh">
	<SiteHeader />
	<main class="mx-auto flex max-w-screen-2xl flex-col gap-12 px-4 py-6 sm:px-6">
		<div class="flex flex-col gap-1">
			<h1 class="text-lg font-semibold">Blocks</h1>
			<p class="text-sm text-muted-foreground">Full pages and layouts built from the registry.</p>
		</div>
		{#each data.blocks as block (block.name)}
			<BlockViewer {...block} />
		{:else}
			<div
				class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center"
			>
				<LayoutTemplateIcon class="size-6 text-muted-foreground" />
				<p class="text-sm font-medium">No blocks yet</p>
			</div>
		{/each}
	</main>
</div>
