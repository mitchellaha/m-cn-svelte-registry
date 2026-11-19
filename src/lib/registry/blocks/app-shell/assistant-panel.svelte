<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { AppShellLabels } from './types.js';

	export type AssistantPanelProps = {
		suggestions: string[];
		labels: AppShellLabels;
		/** Called with the prompt; the box clears afterwards. */
		onAsk?: (prompt: string) => void;
		/** Conversation from the consumer. Without it the greeting and suggestions show. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';

	let { suggestions, labels, onAsk, children }: AssistantPanelProps = $props();

	let prompt = $state('');
	let box = $state<HTMLTextAreaElement | null>(null);

	function send() {
		const text = prompt.trim();
		if (!text) return;
		onAsk?.(text);
		prompt = '';
	}
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<div class="flex min-h-0 flex-1 flex-col justify-end gap-4 overflow-y-auto p-4">
		{#if children}
			{@render children()}
		{:else}
			<p class="text-xl font-semibold tracking-tight">{labels.greeting}</p>
			<ul class="flex flex-col gap-1">
				{#each suggestions as suggestion (suggestion)}
					<li>
						<button
							type="button"
							class="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted focus-visible:bg-muted focus-visible:outline-hidden [&_svg]:mt-0.5 [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
							onclick={() => {
								prompt = suggestion;
								box?.focus();
							}}
						>
							<SparklesIcon />
							{suggestion}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<form
		class="p-3 pt-0"
		onsubmit={(event) => {
			event.preventDefault();
			send();
		}}
	>
		<div
			class="flex flex-col gap-2 rounded-lg border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/30"
		>
			<Textarea
				bind:ref={box}
				bind:value={prompt}
				placeholder={labels.askPlaceholder}
				aria-label={labels.askPlaceholder}
				rows={2}
				class="min-h-0 resize-none border-0 p-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
				onkeydown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
						event.preventDefault();
						send();
					}
				}}
			/>
			<div class="flex justify-end">
				<Button type="submit" size="icon-sm" aria-label={labels.send} disabled={!prompt.trim()}>
					<ArrowUpIcon />
				</Button>
			</div>
		</div>
	</form>
</div>
