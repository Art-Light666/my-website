/**
 * 访问统计接口（Cloudflare Pages Functions）
 *
 * GET /api/views?path=/posts/xxx/
 *   -> { path, pageViews, siteViews, siteUv }
 *
 * 需要在这个 Pages 项目里绑定一个 KV 命名空间，变量名建议用 VIEWS。
 * 绑定的名字不叫 VIEWS 也能用：下面会自动找到第一个可用的 KV。
 */

function getKV(env) {
	if (env.VIEWS && typeof env.VIEWS.get === "function") {
		return env.VIEWS;
	}
	for (const key of Object.keys(env)) {
		const candidate = env[key];
		if (candidate && typeof candidate.get === "function" && typeof candidate.put === "function") {
			return candidate;
		}
	}
	return null;
}

function json(data, status, extraHeaders) {
	return new Response(JSON.stringify(data), {
		status: status || 200,
		headers: Object.assign(
			{
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store",
			},
			extraHeaders || {},
		),
	});
}

function readCookie(cookieHeader, name) {
	if (!cookieHeader) {
		return null;
	}
	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim();
		const index = trimmed.indexOf("=");
		if (index > 0 && trimmed.slice(0, index) === name) {
			return trimmed.slice(index + 1);
		}
	}
	return null;
}

export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);

	let path = url.searchParams.get("path") || "/";
	if (path.length > 300) {
		path = path.slice(0, 300);
	}
	if (!path.startsWith("/")) {
		path = `/${path}`;
	}

	const kv = getKV(env);
	if (!kv) {
		return json({ error: "kv_binding_missing" }, 503);
	}

	const pageKey = `page:${path}`;
	const sitePvKey = "site:pv";
	const siteUvKey = "site:uv";

	const [pageRaw, pvRaw, uvRaw] = await Promise.all([
		kv.get(pageKey),
		kv.get(sitePvKey),
		kv.get(siteUvKey),
	]);

	let pageViews = Number.parseInt(pageRaw || "0", 10) || 0;
	let siteViews = Number.parseInt(pvRaw || "0", 10) || 0;
	let siteUv = Number.parseInt(uvRaw || "0", 10) || 0;

	pageViews += 1;
	siteViews += 1;

	const headers = {};
	const hasUvCookie = readCookie(request.headers.get("cookie"), "bz_uv") === "1";
	const writes = [kv.put(pageKey, String(pageViews)), kv.put(sitePvKey, String(siteViews))];

	if (!hasUvCookie) {
		siteUv += 1;
		writes.push(kv.put(siteUvKey, String(siteUv)));
		headers["set-cookie"] = "bz_uv=1; Max-Age=31536000; Path=/; SameSite=Lax";
	}

	await Promise.all(writes);

	return json({ path, pageViews, siteViews, siteUv }, 200, headers);
}
