import { error } from '@sveltejs/kit';
import { groups } from '../../../groups.js';
import type { EntryGenerator, PageLoad } from './$types';

// Emits build/components/<name>/index.html, so Pages serves it without a redirect.
export const trailingSlash = 'always';

// Components and composites only; page blocks live on /blocks.
const items = groups.flatMap((g) => g.items);

export const entries: EntryGenerator = () => items.map((item) => ({ name: item.name }));

export const load: PageLoad = ({ params }) => {
	const item = items.find((i) => i.name === params.name);
	if (!item) error(404, `No component named ${params.name}`);
	return { name: item.name, title: item.title, description: item.description };
};
