import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export type CommentsConfig = {
	enable: boolean;
	/**
	 * giscus：界面更好看，需要在 giscus.app 拿到 repoId 和 categoryId
	 * utterances：只需要仓库名，配置更简单
	 * 选了 giscus 但没填 ID 时，会自动退回 utterances
	 */
	provider: "giscus" | "utterances";
	repo: string; // 形如 "用户名/仓库名"
	repoId: string; // giscus 用
	category: string; // giscus 用，Discussion 分类名
	categoryId: string; // giscus 用
	mapping: "pathname" | "url" | "title" | "og:title";
	lang: string;
	reactionsEnabled: boolean;
	inputPosition: "top" | "bottom";
};

export type FriendLink = {
	name: string;
	url: string;
	desc?: string;
	avatar?: string; // 放在 public/ 下就写 "/uploads/xxx.jpg"
};

export type FriendsConfig = {
	title: string;
	description?: string;
	links: FriendLink[];
};
