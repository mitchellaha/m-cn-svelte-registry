<script lang="ts" module>
	import type {
		CommandPaletteData,
		CommandPaletteLabels,
		CommandPaletteSelection
	} from './types.js';

	export type CommandPaletteProps = {
		data: CommandPaletteData;
		open?: boolean;
		onSelect: (selection: CommandPaletteSelection) => void;
		/** Key that opens the palette with Cmd on Apple platforms or Ctrl elsewhere. false turns the shortcut off. */
		shortcut?: string | false;
		labels?: Partial<CommandPaletteLabels>;
		class?: string;
	};

	/** Mac, iPhone and iPad. Call it in the browser only (onMount or an effect). */
	export function isApplePlatform() {
		const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
		const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent;
		return /Mac|iPhone|iPad|iPod/i.test(platform);
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import * as Command from '#lib/components/ui/command/index.js';
	import { cn } from '#lib/utils.js';
	import { defaultCommandPaletteLabels } from './types.js';

	let {
		data,
		open = $bindable(false),
		onSelect,
		shortcut = 'k',
		labels: labelOverrides,
		class: className
	}: CommandPaletteProps = $props();

	const labels = $derived({ ...defaultCommandPaletteLabels, ...labelOverrides });
	const actions = $derived(data.actions ?? []);

	// Cmd on Apple platforms, Ctrl elsewhere, so macOS Ctrl+K (delete to end of line) still works.
	let apple = false;
	onMount(() => {
		apple = isApplePlatform();
	});

	// Registered here so the palette works wherever it is mounted; removed on destroy.
	$effect(() => {
		if (!shortcut) return;
		const key = shortcut.toLowerCase();
		function onKeydown(event: KeyboardEvent) {
			const mod = apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
			if (event.key.toLowerCase() === key && mod && !event.altKey) {
				event.preventDefault();
				open = !open;
			}
		}
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	function select(selection: CommandPaletteSelection) {
		open = false;
		onSelect(selection);
	}
</script>

<Command.Dialog
	bind:open
	title={labels.title}
	description={labels.description}
	class={cn('max-sm:top-4 sm:max-w-xl [@media(max-height:40rem)]:top-4', className)}
>
	<Command.Input placeholder={labels.placeholder} class="pointer-coarse:text-base!" />
	<Command.List class="max-h-[min(420px,60dvh)]">
		<Command.Empty>{labels.empty}</Command.Empty>
		<Command.Group heading={labels.screens}>
			{#each data.modules as module (module.id)}
				{#each module.screens as screen (screen.id)}
					<Command.Item
						value="{screen.label} {module.label} {screen.id}"
						keywords={screen.keywords}
						class="pointer-coarse:min-h-10"
						onSelect={() => select({ type: 'screen', screen, module })}
					>
						{#if screen.icon}<screen.icon />{/if}
						<!-- flex-1, not ml-auto: the mira item already ends in an ml-auto check icon. -->
						<span class="flex-1 truncate">{screen.label}</span>
						<span class="shrink-0 text-muted-foreground">{module.label}</span>
					</Command.Item>
				{/each}
			{/each}
		</Command.Group>
		{#if actions.length}
			<Command.Separator />
			<Command.Group heading={labels.actions}>
				{#each actions as action (action.id)}
					<Command.Item
						value="{action.label} {action.id}"
						keywords={action.keywords}
						class="pointer-coarse:min-h-10"
						onSelect={() => select({ type: 'action', action })}
					>
						{#if action.icon}<action.icon />{/if}
						{action.label}
						{#if action.shortcut}<Command.Shortcut>{action.shortcut}</Command.Shortcut>{/if}
					</Command.Item>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
