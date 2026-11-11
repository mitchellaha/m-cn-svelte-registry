import { error } from '@sveltejs/kit';
import registry from '../../../../registry.json';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;
// Emits build/preview/<name>/index.html, so Pages serves it without a redirect.
export const trailingSlash = 'always';

export const entries: EntryGenerator = () => registry.items.map((item) => ({ name: item.name }));

export const load: PageLoad = ({ params }) => {
	const item = registry.items.find((i) => i.name === params.name);
	if (!item) error(404, `No registry item named ${params.name}`);
	return { name: item.name, title: item.title };
};
