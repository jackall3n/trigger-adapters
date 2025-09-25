import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "trigger-adapters",
	description: "Documentation for Trigger Adapters",
	cleanUrls: true,
	lastUpdated: true,
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
					{ text: "Next.js", link: "/adapters/nextjs" },
					{ text: "Express", link: "/adapters/express" },
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/jackall3n/trigger-adapters" },
		],
	},
});
