<script lang="ts">
	import { installCommand } from '#lib/site.js';
	import { CopyButton } from '$lib/registry/ui/copy-button/index.js';
	import type { Viewport } from '../../../demos/index.js';
	import PreviewFrame from '../../../preview-frame.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let viewport = $state<Viewport>('desktop');
	const command = $derived(installCommand(data.name));
</script>

<svelte:head>
	<title>{data.title} · m-cn-svelte registry</title>
</svelte:head>

<div class="flex flex-col gap-1">
	<h1 class="text-lg font-semibold tracking-tight">{data.title}</h1>
	<p class="max-w-prose text-sm text-muted-foreground">{data.description}</p>
</div>

<!-- Keyed so moving to another item remounts its demo; the chosen width carries over. -->
{#key data.name}
	<PreviewFrame name={data.name} title={data.title} bind:viewport />
{/key}

<section class="flex flex-col gap-2">
	<h2 class="text-sm font-medium">Installation</h2>
	<div class="flex items-center gap-2 rounded-lg border px-3 py-2">
		<code class="min-w-0 flex-1 truncate font-mono text-xs">{command}</code>
		<CopyButton value={command} />
	</div>
</section>
