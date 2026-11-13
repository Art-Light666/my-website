/**
 * 访问统计接口（Cloudflare Pages Functions）
 * GET /api/views?path=/posts/xxx/
 *
 * 计数规则：
 *   page:<path>  每打开一次这个页面 +1     （文章阅读量，每次导航都算）
 *   site:pv      30 分钟内的连续浏览算一次   （访问人次，站内跳转不重复加）
 *   site:uv      每个浏览器只算一次          （访客数，靠一年期 cookie）
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

function respond(payload, status, cookies) {
	const headers = new Headers({
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
	});
	for (const cookie of cookies || []) {
		headers.append("set-cookie", cookie);
	}
	return new Response(JSON.stringify(payload), { status: status || 200, headers });
}

function toInt(value) {
	return Number.parseInt(value || "0", 10) || 0;
}

export async function onRequest(context) {
	try {
		const request = context.request;
		const env = context.env;
		const url = new URL(request.url);

		if (url.searchParams.get("debug") === "1") {
			return respond({ envKeys: Object.keys(env || {}), hasViews: !!getKV(env) });
		}

		let path = url.searchParams.get("path") || "/";
		if (path.length > 300) path = path.slice(0, 300);
		if (!path.startsWith("/")) path = `/${path}`;

		const kv = getKV(env);
		if (!kv) {
			return respond({ error: "kv_binding_missing", envKeys: Object.keys(env || {}) }, 503);
		}

		const cookieHeader = request.headers.get("cookie");
		const pageKey = `page:${path}`;

		const [pageRaw, pvRaw, uvRaw] = await Promise.all([
			kv.get(pageKey),
			kv.get("site:pv"),
			kv.get("site:uv"),
		]);

		// 每次打开页面都算一次阅读
		const pageViews = toInt(pageRaw) + 1;

		let siteViews = toInt(pvRaw);
		let siteUv = toInt(uvRaw);
		const cookies = [];
		const writes = [kv.put(pageKey, String(pageViews))];

		// 站内跳转不重复加访问人次：30 分钟内算同一次访问
		const hasSession = readCookie(cookieHeader, "bz_sess") === "1";
		const siteReset = pvRaw === null;
		if (!hasSession || siteReset) {
			siteViews += 1;
			writes.push(kv.put("site:pv", String(siteViews)));
		}
		cookies.push("bz_sess=1; Max-Age=1800; Path=/; SameSite=Lax");

		// 访客数：每个浏览器一辈子只算一次
		const hasUv = readCookie(cookieHeader, "bz_uv") === "1";
		const uvReset = uvRaw === null;
		if (!hasUv || uvReset) {
			siteUv += 1;
			writes.push(kv.put("site:uv", String(siteUv)));
			cookies.push("bz_uv=1; Max-Age=31536000; Path=/; SameSite=Lax");
		}

		await Promise.all(writes);

		return respond({ path, pageViews, siteViews, siteUv, newVisit: !hasSession }, 200, cookies);
	} catch (error) {
		return respond(
			{ error: "exception", message: error && error.message ? error.message : String(error) },
			500,
		);
	}
}
