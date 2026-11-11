<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { demos } from '../../demos/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const demo = $derived(demos[data.name]);
</script>

<svelte:head>
	<title>{data.title} preview</title>
</svelte:head>

<main class={cn('min-h-svh bg-background', demo?.padded && 'p-4')}>
	{#if demo}
		<demo.component />
	{/if}
</main>
