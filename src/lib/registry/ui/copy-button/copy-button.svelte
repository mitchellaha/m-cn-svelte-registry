<script lang="ts" module>
	import type { ButtonProps } from '#lib/components/ui/button/index.js';

	export type CopyButtonProps = Omit<ButtonProps, 'href'> & {
		value: string;
		timeout?: number;
	};
</script>

<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { Button } from '#lib/components/ui/button/index.js';

	let {
		ref = $bindable(null),
		value,
		timeout = 1500,
		size = 'icon-sm',
		variant = 'ghost',
		...restProps
	}: CopyButtonProps = $props();

	let copied = $state(false);

	$effect(() => {
		if (!copied) return;
		const id = window.setTimeout(() => (copied = false), timeout);
		return () => window.clearTimeout(id);
	});
</script>

<Button
	bind:ref
	data-slot="copy-button"
	{size}
	{variant}
	aria-label={copied ? 'Copied' : 'Copy'}
	onclick={() =>
		navigator.clipboard
			?.writeText(value)
			.then(() => (copied = true))
			.catch(() => {})}
	{...restProps}
>
	{#if copied}
		<CheckIcon />
	{:else}
		<CopyIcon />
	{/if}
</Button>
