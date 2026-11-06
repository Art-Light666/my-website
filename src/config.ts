import type {
	CommentsConfig,
	ExpressiveCodeConfig,
	FriendsConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Snowfluff",
	subtitle: "努力把有趣的想法落地",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "assets/images/banner.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{
			src: "/favicon/favicon-light-32.png",
			theme: "light",
			sizes: "32x32",
		},
		{
			src: "/favicon/favicon-dark-32.png",
			theme: "dark",
			sizes: "32x32",
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/Art-Light666", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Snowfluff",
	bio: "东林海院26级某学生 · 喜欢二次元，偶尔折腾开发板和 Linux",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://github.com/Art-Light666",
		},
		{
			name: "友站",
			icon: "fa6-solid:link",
			url: "/friends/",
		},
	],
};

/* ---------- 友站（独立页面 /friends/） ---------- */
export const friendsConfig: FriendsConfig = {
	title: "友站",
	description: "一些朋友的站点，欢迎去看看。",
	links: [
		{
			name: "wuko's blog",
			url: "https://blog.wuko.top",
			desc: "从零开始，由心而发。欢迎共同交流学习！",
			avatar: "/uploads/friend-wuko.jpg",
		},
		// 加友站：复制一段 { } 用逗号隔开
		// avatar 留空就用名字第一个字当头像
	],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const commentsConfig: CommentsConfig = {
	enable: true,
	provider: "giscus",
	repo: "Art-Light666/my-website",

	// ↓↓↓ giscus 的两个 ID，去 https://giscus.app 填完仓库信息后能拿到
	// 都在页面下方生成的代码里：data-repo-id 和 data-category-id
	repoId: "",
	category: "General",
	categoryId: "",

	mapping: "pathname",
	lang: "zh-CN",
	reactionsEnabled: true,
	inputPosition: "top",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
