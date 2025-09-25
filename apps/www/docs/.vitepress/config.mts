import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "trigger-adapters",
	description: "Documentation for Trigger Adapters",
	base: "/",
	cleanUrls: true,
	lastUpdated: true,
	head: [
		[
			"meta",
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
		],
		["meta", { property: "og:title", content: "trigger-adapters" }],
		[
			"meta",
			{
				property: "og:description",
				content: "Framework-agnostic HTTP handlers for Trigger.dev",
			},
		],
	],
	themeConfig: {
		search: {
			provider: "local",
		},
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Adapters", link: "/adapters" },
		],

		sidebar: [
			{
				collapsed: false,
				text: "Guide",
				items: [
					{ text: "Introduction", link: "/guide/introduction" },
					{ text: "Usage", link: "/guide/usage" },
				],
			},
			{
				text: "Adapters",
				collapsed: false,
				items: [
					{ text: "Elysia", link: "/adapters/elysia" },
					{ text: "Express", link: "/adapters/express" },
					{ text: "Fastify", link: "/adapters/fastify" },
					{ text: "Hono", link: "/adapters/hono" },
					{ text: "Next.js", link: "/adapters/nextjs" },
					{ text: "SvelteKit", link: "/adapters/sveltekit" },
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/jackall3n/trigger-adapters" },
		],
	},
});
