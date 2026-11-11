<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { FeatureMenuLabels, FeatureModule, FeatureScreen } from './types.js';

	export type FeatureMenuProps = {
		modules: FeatureModule[];
		/** Pinned screen ids, in pin order. */
		pinned?: string[];
		/** Id of the screen the user is on. */
		current?: string;
		open?: boolean;
		/** Builds a link for a screen. Falls back to screen.href. */
		href?: (screen: FeatureScreen, module: FeatureModule) => string | undefined;
		/** Called when a screen is picked, after the menu closes. With a link, a plain click calls this instead of following it; modified clicks open the link and skip this. */
		onNavigate?: (screen: FeatureScreen, module: FeatureModule) => void;
		labels?: Partial<FeatureMenuLabels>;
		class?: string;
	};

	/** True for clicks the browser should handle itself: new tab, new window, download, middle button. */
	export function isModifiedClick(event: MouseEvent) {
		return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import PinIcon from '@lucide/svelte/icons/pin';
	import PinOffIcon from '@lucide/svelte/icons/pin-off';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { ScrollArea } from '#lib/components/ui/scroll-area/index.js';
	import { cn } from '#lib/utils.js';
	import { defaultFeatureMenuLabels } from './types.js';

	type Entry = { screen: FeatureScreen; module: FeatureModule };

	let {
		modules,
		pinned = $bindable([]),
		current,
		open = $bindable(false),
		href,
		onNavigate,
		labels: labelOverrides,
		class: className
	}: FeatureMenuProps = $props();

	const labels = $derived({ ...defaultFeatureMenuLabels, ...labelOverrides });

	let query = $state('');
	let activeModuleId = $state<string | undefined>();

	const entries = $derived<Entry[]>(
		modules.flatMap((module) => module.screens.map((screen) => ({ screen, module })))
	);
	const currentEntry = $derived(entries.find((e) => e.screen.id === current));
	const activeModule = $derived(modules.find((m) => m.id === activeModuleId) ?? modules[0]);

	const visible = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return entries.filter((e) => e.module.id === activeModule?.id);
		return entries.filter((e) =>
			`${e.screen.label} ${e.screen.description ?? ''} ${e.module.label}`.toLowerCase().includes(q)
		);
	});
	const pinnedEntries = $derived(
		pinned.flatMap((id) => entries.find((e) => e.screen.id === id) ?? [])
	);

	// Opening the menu jumps to the module of the current screen and clears the search.
	// Only `open` is tracked, so prop changes while the menu is open keep the user's search.
	$effect(() => {
		if (!open) {
			cancelHover();
			return;
		}
		untrack(() => {
			activeModuleId = currentEntry?.module.id ?? modules[0]?.id;
			query = '';
		});
	});

	// Hovering a module switches to it after a short pause, so a diagonal move to the cards
	// does not swap the list on the way. Clicks and keyboard focus switch at once.
	const HOVER_DELAY = 120;
	let hoverTimer: ReturnType<typeof setTimeout> | undefined;

	function hoverModule(event: PointerEvent, id: string) {
		if (event.pointerType !== 'mouse') return;
		cancelHover();
		hoverTimer = setTimeout(() => (activeModuleId = id), HOVER_DELAY);
	}

	function cancelHover() {
		clearTimeout(hoverTimer);
		hoverTimer = undefined;
	}

	function selectModule(id: string) {
		cancelHover();
		activeModuleId = id;
	}

	$effect(() => cancelHover);

	// The module list is one tab stop: arrows move between modules (focus switches the list),
	// and Tab goes on to that module's cards.
	function moveModuleFocus(event: KeyboardEvent, index: number) {
		const keys: Record<string, number> = {
			ArrowDown: index + 1,
			ArrowRight: index + 1,
			ArrowUp: index - 1,
			ArrowLeft: index - 1,
			Home: 0,
			End: modules.length - 1
		};
		const target = keys[event.key];
		if (target === undefined) return;
		event.preventDefault();
		const buttons = (event.currentTarget as HTMLElement)
			.closest('nav')
			?.querySelectorAll<HTMLElement>('[data-slot="feature-menu-module"]');
		const count = buttons?.length ?? 0;
		if (!count) return;
		buttons?.[(target + count) % count]?.focus({ preventScroll: false });
	}

	// Phones skip the search autofocus so the keyboard does not cover the list.
	function onOpenAutoFocus(event: Event) {
		if (window.matchMedia('(pointer: coarse)').matches) event.preventDefault();
	}

	function urlFor({ screen, module }: Entry) {
		return href ? href(screen, module) : screen.href;
	}

	function pick({ screen, module }: Entry) {
		open = false;
		onNavigate?.(screen, module);
	}

	function onLinkClick(event: MouseEvent, entry: Entry) {
		if (event.defaultPrevented || isModifiedClick(event)) return;
		if (onNavigate) {
			event.preventDefault();
			pick(entry);
		} else {
			// The anchor navigates; only close the menu.
			open = false;
		}
	}

	function togglePin(id: string) {
		pinned = pinned.includes(id) ? pinned.filter((p) => p !== id) : [...pinned, id];
	}
</script>

{#snippet screenLink(entry: Entry, linkClass: string, body: Snippet)}
	{@const url = urlFor(entry)}
	{#if url}
		<!-- The caller builds the URL, so this works outside SvelteKit. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={url} class={linkClass} onclick={(event) => onLinkClick(event, entry)}
			>{@render body()}</a
		>
	{:else}
		<button type="button" class={cn('text-left', linkClass)} onclick={() => pick(entry)}>
			{@render body()}
		</button>
	{/if}
{/snippet}

{#snippet pinnedList()}
	<p class="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">{labels.pinned}</p>
	{#each pinnedEntries as entry (entry.screen.id)}
		<div class="group flex items-center gap-1">
			{#snippet pinnedBody()}
				{#if entry.screen.icon}<entry.screen.icon class="size-4 shrink-0" />{/if}
				<span class="truncate">{entry.screen.label}</span>
			{/snippet}
			{@render screenLink(
				entry,
				'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent pointer-coarse:py-2.5',
				pinnedBody
			)}
			<button
				type="button"
				class="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:opacity-100 pointer-coarse:size-8 [@media(hover:hover)]:opacity-0"
				aria-label={labels.unpin(entry.screen.label)}
				onclick={() => togglePin(entry.screen.id)}
			>
				<PinOffIcon class="size-3.5" />
			</button>
		</div>
	{:else}
		<p class="px-2 text-xs leading-relaxed text-muted-foreground">{labels.pinnedEmpty}</p>
	{/each}
{/snippet}

<Popover.Root bind:open>
	<Popover.Trigger
		data-slot="feature-menu-trigger"
		class={cn(
			'flex h-8 min-w-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50',
			className
		)}
	>
		<span class="truncate">{currentEntry?.screen.label ?? labels.trigger}</span>
		<ChevronDownIcon
			class={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
		/>
	</Popover.Trigger>

	<Popover.Content
		data-slot="feature-menu"
		align="start"
		sideOffset={10}
		collisionPadding={8}
		{onOpenAutoFocus}
		class="max-h-(--bits-popover-content-available-height) w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0 md:w-[min(94vw,1080px)]"
	>
		<div class="shrink-0 border-b p-2">
			<InputGroup.Root class="h-9">
				<InputGroup.Addon><SearchIcon /></InputGroup.Addon>
				<InputGroup.Input
					bind:value={query}
					placeholder={labels.search}
					aria-label={labels.search}
					class="pointer-coarse:text-base!"
				/>
			</InputGroup.Root>
		</div>

		<!-- Below md: one column, modules as a chip row. md: modules + cards. lg: plus the Pinned aside. -->
		<div
			class="flex max-h-[min(70dvh,440px)] min-h-0 flex-col md:grid md:h-[min(62vh,440px)] md:grid-cols-[minmax(160px,220px)_1fr] lg:grid-cols-[minmax(160px,220px)_1fr_minmax(200px,260px)]"
		>
			<nav
				class="flex shrink-0 gap-1 overflow-x-auto border-b p-2 md:flex-col md:gap-0.5 md:overflow-x-visible md:overflow-y-auto md:border-r md:border-b-0"
				aria-label={labels.modules}
			>
				<p class="hidden px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground md:block">
					{labels.modules}
				</p>
				{#each modules as mod, index (mod.id)}
					{@const active = !query && mod.id === activeModule?.id}
					<button
						type="button"
						data-slot="feature-menu-module"
						data-active={active}
						class={cn(
							'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-left text-sm font-medium whitespace-nowrap md:w-full md:gap-2.5 md:rounded-md md:border-0 md:px-2',
							active ? 'bg-accent' : 'hover:bg-accent/60'
						)}
						onpointerenter={(event) => hoverModule(event, mod.id)}
						onpointerleave={cancelHover}
						tabindex={mod.id === activeModule?.id ? 0 : -1}
						onfocus={() => selectModule(mod.id)}
						onkeydown={(event) => moveModuleFocus(event, index)}
						onclick={() => {
							selectModule(mod.id);
							query = '';
						}}
					>
						{#if mod.icon}<mod.icon class="size-4 shrink-0" />{/if}
						<span class="truncate md:flex-1">{mod.label}</span>
						{#if active}<ChevronRightIcon
								class="hidden size-4 shrink-0 text-muted-foreground md:block"
							/>{/if}
					</button>
				{/each}
			</nav>

			<ScrollArea class="min-h-0 flex-1">
				<div class="grid grid-cols-1 gap-1 p-2 xl:grid-cols-2">
					{#each visible as entry (entry.screen.id)}
						{@const isPinned = pinned.includes(entry.screen.id)}
						<div class="group relative">
							{#snippet card()}
								<span
									class="grid size-8 shrink-0 place-items-center rounded-md border bg-background"
								>
									{#if entry.screen.icon}<entry.screen.icon class="size-4" />{/if}
								</span>
								<span class="min-w-0">
									<span class="block text-sm font-semibold">{entry.screen.label}</span>
									{#if query || entry.screen.description}
										<span class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
											{query ? entry.module.label : ''}{query && entry.screen.description
												? ' · '
												: ''}{entry.screen.description ?? ''}
										</span>
									{/if}
								</span>
							{/snippet}
							{@render screenLink(
								entry,
								cn(
									'flex h-full w-full gap-3 rounded-lg p-2.5 pr-9 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:pr-11',
									entry.screen.id === current ? 'bg-muted' : 'hover:bg-muted/70'
								),
								card
							)}
							<button
								type="button"
								data-slot="feature-menu-pin"
								class={cn(
									'absolute top-2 right-2 grid size-6 place-items-center rounded-md text-muted-foreground group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:opacity-100 pointer-coarse:top-1.5 pointer-coarse:right-1.5 pointer-coarse:size-8',
									// Hidden until hover only where hover exists; touch screens always show it.
									!isPinned && '[@media(hover:hover)]:opacity-0'
								)}
								aria-label={isPinned
									? labels.unpin(entry.screen.label)
									: labels.pin(entry.screen.label)}
								aria-pressed={isPinned}
								onclick={() => togglePin(entry.screen.id)}
							>
								{#if isPinned}<PinOffIcon class="size-4" />{:else}<PinIcon class="size-4" />{/if}
							</button>
						</div>
					{:else}
						<p class="p-4 text-sm text-muted-foreground">{labels.empty}</p>
					{/each}
				</div>
				{#if !query}
					<section class="border-t p-2 lg:hidden" aria-label={labels.pinned}>
						{@render pinnedList()}
					</section>
				{/if}
			</ScrollArea>

			<aside class="hidden overflow-y-auto border-l bg-muted/40 p-3 lg:block">
				{@render pinnedList()}
			</aside>
		</div>
	</Popover.Content>
</Popover.Root>
