import { readFile } from 'node:fs/promises';
import { codeToHtml } from 'shiki';
import registry from '../../../registry.json';
import type { PageServerLoad } from './$types';

// Runs at prerender only, so Shiki never ships to the browser.
export const load: PageServerLoad = async () => {
	const items = registry.items.filter((item) =>
		(item as { categories?: string[] }).categories?.includes('page')
	);

	const blocks = await Promise.all(
		items.map(async (item) => ({
			name: item.name,
			title: item.title,
			description: item.description,
			files: await Promise.all(
				item.files.map(async (file) => {
					const source = await readFile(file.path, 'utf8');
					const path = (file as { target?: string }).target ?? file.path.split('/').pop()!;
					const lang = path.endsWith('.svelte') ? 'svelte' : 'typescript';
					return {
						path,
						source,
						html: await codeToHtml(source, {
							lang,
							themes: { light: 'github-light', dark: 'github-dark' }
						})
					};
				})
			)
		}))
	);

	return { blocks };
};
