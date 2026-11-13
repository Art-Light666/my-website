/**
 * 访问统计接口（Cloudflare Pages Functions）
 * GET /api/views?path=/posts/xxx/
 */

function getKV(env) {
	// 绑定名大小写都可能，挨个试；避免误碰 Pages 自带的 ASSETS（RPC 绑定）
	if (!env) return null;
	for (const name of ["VIEWS", "views", "Views"]) {
		const kv = env[name];
		if (kv && typeof kv.get === "function" && typeof kv.put === "function") {
			return kv;
		}
	}
	return null;
}

function readCookie(cookieHeader, name) {
	if (!cookieHeader) return null;
	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim();
		const idx = trimmed.indexOf("=");
		if (idx > 0 && trimmed.slice(0, idx) === name) return trimmed.slice(idx + 1);
	}
	return null;
}

function respond(payload, status, extraHeaders) {
	const headers = Object.assign(
		{ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
		extraHeaders || {},
	);
	return new Response(JSON.stringify(payload), { status: status || 200, headers });
}

export async function onRequest(context) {
	try {
		const request = context.request;
		const env = context.env;
		const url = new URL(request.url);

		if (url.searchParams.get("debug") === "1") {
			return respond({ envKeys: Object.keys(env || {}), hasViews: !!(env && (env.VIEWS || env.views)) });
		}

		let path = url.searchParams.get("path") || "/";
		if (path.length > 300) path = path.slice(0, 300);
		if (!path.startsWith("/")) path = `/${path}`;

		const kv = getKV(env);
		if (!kv) {
			return respond({ error: "kv_binding_missing", envKeys: Object.keys(env || {}) }, 503);
		}

		const pageKey = `page:${path}`;
		const [pageRaw, pvRaw, uvRaw] = await Promise.all([
			kv.get(pageKey),
			kv.get("site:pv"),
			kv.get("site:uv"),
		]);

		let pageViews = (Number.parseInt(pageRaw || "0", 10) || 0) + 1;
		let siteViews = (Number.parseInt(pvRaw || "0", 10) || 0) + 1;
		let siteUv = Number.parseInt(uvRaw || "0", 10) || 0;

		const extraHeaders = {};
		const writes = [kv.put(pageKey, String(pageViews)), kv.put("site:pv", String(siteViews))];

		if (readCookie(request.headers.get("cookie"), "bz_uv") !== "1") {
			siteUv += 1;
			writes.push(kv.put("site:uv", String(siteUv)));
			extraHeaders["set-cookie"] = "bz_uv=1; Max-Age=31536000; Path=/; SameSite=Lax";
		}

		await Promise.all(writes);
		return respond({ path, pageViews, siteViews, siteUv }, 200, extraHeaders);
	} catch (error) {
		return respond({
			error: "exception",
			message: error && error.message ? error.message : String(error),
		}, 500);
	}
}