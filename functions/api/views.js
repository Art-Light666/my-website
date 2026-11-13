/**
 * 访问统计接口（Cloudflare Pages Functions）
 *
 * GET /api/views?path=/posts/xxx/
 *   -> { path, pageViews, siteViews, siteUv }
 *
 * 需要在这个 Pages 项目里绑定一个 KV 命名空间（变量名 VIEWS 或任意名字均可）。
 */

function findKV(env) {
	if (!env) {
		return null;
	}
	try {
		for (const key of Object.keys(env)) {
			const candidate = env[key];
			if (candidate && typeof candidate.get === "function" && typeof candidate.put === "function") {
				return candidate;
			}
		}
	} catch {
		/* ignore */
	}
	return null;
}

function readCookie(cookieHeader, name) {
	if (!cookieHeader) {
		return null;
	}
	const parts = cookieHeader.split(";");
	for (const part of parts) {
		const trimmed = part.trim();
		const index = trimmed.indexOf("=");
		if (index > 0 && trimmed.slice(0, index) === name) {
			return trimmed.slice(index + 1);
		}
	}
	return null;
}

function respond(payload, status, extraHeaders) {
	const headers = Object.assign(
		{
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
		},
		extraHeaders || {},
	);
	return new Response(JSON.stringify(payload), { status: status || 200, headers });
}

export async function onRequest(context) {
	try {
		const request = context.request;
		const env = context.env;
		const url = new URL(request.url);

		let path = url.searchParams.get("path") || "/";
		if (path.length > 300) {
			path = path.slice(0, 300);
		}
		if (!path.startsWith("/")) {
			path = `/${path}`;
		}

		const kv = findKV(env);
		if (!kv) {
			let keys = [];
			try {
				keys = Object.keys(env || {});
			} catch {
				/* ignore */
			}
			return respond({ error: "kv_binding_missing", envKeys: keys }, 503);
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

		const extraHeaders = {};
		const hasUvCookie = readCookie(request.headers.get("cookie"), "bz_uv") === "1";
		const writes = [kv.put(pageKey, String(pageViews)), kv.put(sitePvKey, String(siteViews))];

		if (!hasUvCookie) {
			siteUv += 1;
			writes.push(kv.put(siteUvKey, String(siteUv)));
			extraHeaders["set-cookie"] = "bz_uv=1; Max-Age=31536000; Path=/; SameSite=Lax";
		}

		await Promise.all(writes);

		return respond({ path, pageViews, siteViews, siteUv }, 200, extraHeaders);
	} catch (error) {
		const message = error && error.message ? error.message : String(error);
		const stack = error && error.stack ? String(error.stack).slice(0, 600) : "";
		return respond({ error: "exception", message, stack }, 500);
	}
}
