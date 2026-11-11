// Where the built registry JSON is served (GitHub Pages). Same-registry
// registryDependencies in registry.json must use this prefix too.
export const REGISTRY_URL = 'https://mitchellaha.github.io/m-cn-svelte-registry/r';

export const installCommand = (name: string) =>
	`pnpm dlx shadcn-svelte@latest add ${REGISTRY_URL}/${name}.json`;
