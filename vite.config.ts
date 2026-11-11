import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		// Registry sources import each other through $lib/registry/... because the
		// shadcn-svelte CLI rewrites that prefix to the consumer's aliases at install.
		// SvelteKit 3 no longer defines $lib, so we define this one path ourselves.
		// Keep in sync with "paths" in tsconfig.json.
		alias: {
			'$lib/registry': fileURLToPath(new URL('./src/lib/registry', import.meta.url))
		}
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: '404.html' }),
			// GitHub Pages serves the site under /<repo>; the deploy workflow sets BASE_PATH.
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` }
		})
	]
});
