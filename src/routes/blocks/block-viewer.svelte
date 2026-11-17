<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import FileIcon from '@lucide/svelte/icons/file';
	import FullscreenIcon from '@lucide/svelte/icons/fullscreen';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import RotateCwIcon from '@lucide/svelte/icons/rotate-cw';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { installCommand } from '#lib/site.js';
	import { cn } from '#lib/utils.js';
	import { CopyButton } from '$lib/registry/ui/copy-button/index.js';
	import { demos, viewports, type Viewport } from '../demos/index.js';

	type File = { path: string; source: string; html: string };

	let {
		name,
		title,
		description,
		files
	}: { name: string; title: string; description: string; files: File[] } = $props();

	let view = $state('preview');
	let viewport = $state<Viewport>('desktop');
	let reloads = $state(0);
	let activePath = $derived(files[0]?.path ?? '');
	let copied = $state(false);

	const activeFile = $derived(files.find((f) => f.path === activePath));
	const height = $derived(demos[name]?.height ?? 800);
	const width = $derived(viewports.find((v) => v.value === viewport)?.width);
	// The route sets trailingSlash: 'always', so link straight to the folder index.
	const src = $derived(`${resolve('/preview/[name]', { name })}/`);
	const command = $derived(installCommand(name));
	// Desktop first, matching shadcn-svelte's block toolbar.
	const sizes = [...viewports].reverse();
	const icons = { phone: SmartphoneIcon, tablet: TabletIcon, desktop: MonitorIcon };

	$effect(() => {
		if (!copied) return;
		const id = window.setTimeout(() => (copied = false), 1500);
		return () => window.clearTimeout(id);
	});

	function copyCommand() {
		navigator.clipboard
			?.writeText(command)
			.then(() => (copied = true))
			.catch(() => {});
	}
</script>

<section id={name} class="flex scroll-mt-16 flex-col gap-4">
	<Tabs.Root bind:value={view} class="gap-4">
		<div class="flex flex-wrap items-center gap-2 lg:flex-nowrap">
			<Tabs.List class="hidden lg:flex">
				<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
				<Tabs.Trigger value="code">Code</Tabs.Trigger>
			</Tabs.List>
			<Separator orientation="vertical" class="mx-2 hidden h-4! lg:block" />
			<a href="#{name}" class="min-w-0 flex-1 truncate text-sm font-medium hover:underline">
				{description || title}
			</a>
			<div class="ml-auto hidden items-center gap-2 lg:flex">
				<div class="flex h-8 items-center gap-1 rounded-md border p-0.5">
					<ToggleGroup.Root
						type="single"
						size="sm"
						aria-label="Preview width"
						bind:value={
							() => viewport,
							(v) => {
								// A single toggle group clears on a second click; keep a width selected.
								if (v) viewport = v as Viewport;
							}
						}
					>
						{#each sizes as option (option.value)}
							{@const Icon = icons[option.value]}
							<ToggleGroup.Item
								value={option.value}
								aria-label={option.label}
								title={option.label}
								class="size-7"
							>
								<Icon />
							</ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
					<Separator orientation="vertical" class="h-4!" />
					<Button
						variant="ghost"
						size="icon-sm"
						class="size-7"
						href={src}
						target="_blank"
						rel="noopener"
						aria-label="Open in new tab"
						title="Open in new tab"
					>
						<FullscreenIcon />
					</Button>
					<Separator orientation="vertical" class="h-4!" />
					<Button
						variant="ghost"
						size="icon-sm"
						class="size-7"
						onclick={() => reloads++}
						aria-label="Refresh preview"
						title="Refresh preview"
					>
						<RotateCwIcon />
					</Button>
				</div>
				<Separator orientation="vertical" class="mx-1 h-4!" />
			</div>
			<Button
				variant="outline"
				size="sm"
				class="max-w-full min-w-0 font-mono text-xs"
				onclick={copyCommand}
				aria-label={copied ? 'Copied' : `Copy: ${command}`}
				title={command}
			>
				{#if copied}<CheckIcon />{:else}<TerminalIcon />{/if}
				<span class="truncate">pnpm dlx shadcn-svelte@latest add {name}</span>
			</Button>
		</div>

		<Tabs.Content value="preview">
			<div
				class="flex overflow-x-auto rounded-xl border bg-muted/40"
				class:p-4={!!width}
				style:height="{height}px"
			>
				{#key reloads}
					<iframe
						{src}
						{title}
						loading="lazy"
						class={cn(
							'mx-auto block h-full shrink-0 bg-background',
							width ? 'rounded-lg border shadow-sm' : 'w-full rounded-xl'
						)}
						style:width={width ? `${width}px` : undefined}
					></iframe>
				{/key}
			</div>
		</Tabs.Content>

		<Tabs.Content value="code">
			<div class="flex overflow-hidden rounded-xl border bg-background" style:height="{height}px">
				<nav
					aria-label="{title} files"
					class="flex w-56 shrink-0 flex-col gap-0.5 overflow-y-auto border-r bg-muted/40 p-2 text-xs"
				>
					{#each files as file (file.path)}
						<button
							type="button"
							onclick={() => (activePath = file.path)}
							aria-current={activePath === file.path ? 'true' : undefined}
							class={cn(
								'flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-foreground/70 hover:bg-muted hover:text-foreground',
								activePath === file.path && 'bg-muted font-medium text-foreground'
							)}
						>
							<FileIcon class="size-3.5 shrink-0" />
							<span class="truncate">{file.path}</span>
						</button>
					{/each}
				</nav>
				{#if activeFile}
					<div class="flex min-w-0 flex-1 flex-col">
						<div class="flex h-10 items-center gap-2 border-b px-4 text-xs">
							<FileIcon class="size-3.5 text-muted-foreground" />
							<span class="min-w-0 flex-1 truncate font-mono">{activeFile.path}</span>
							<CopyButton value={activeFile.source} />
						</div>
						<div class="code min-h-0 flex-1 overflow-auto text-xs">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output of our own source files, built at prerender. -->
							{@html activeFile.html}
						</div>
					</div>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</section>

<style>
	.code :global(.shiki) {
		padding: 1rem;
		background-color: transparent !important;
	}
	:global(.dark) .code :global(.shiki span) {
		color: var(--shiki-dark) !important;
	}
</style>
