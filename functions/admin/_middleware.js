/**
 * /admin 目录的访问保护（Cloudflare Pages Functions 中间件）
 *
 * 只作用于 /admin/*，不会影响网站其他任何页面。
 *
 * 生效条件：在 Pages 项目里设置环境变量 ADMIN_PASSWORD。
 *   - 没设置 → 直接放行（避免把自己锁在外面）
 *   - 设置了 → 必须先输密码，验证通过后发一个 7 天有效的 cookie
 *
 * 会话 token 存在 KV 里（admin:sess:<token>），所以清 cookie 或删 KV 都能立即失效。
 */

function readCookie(cookieHeader, name) {
	if (!cookieHeader) return null;
	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim();
		const idx = trimmed.indexOf("=");
		if (idx > 0 && trimmed.slice(0, idx) === name) return trimmed.slice(idx + 1);
	}
	return null;
}

function getKV(env) {
	for (const name of ["views", "VIEWS", "Views"]) {
		const kv = env && env[name];
		if (kv && typeof kv.get === "function" && typeof kv.put === "function") return kv;
	}
	return null;
}

function randomToken() {
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function loginPage(message, status) {
	const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>需要密码</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#14161c;color:#e8eaf0;
    font:15px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
  .card{width:100%;max-width:340px;padding:28px 26px;background:#1b1e26;border:1px solid #2b2f3a;border-radius:16px}
  h1{margin:0 0 6px;font-size:18px}
  p{margin:0 0 18px;font-size:13px;color:#8b90a3}
  input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid #2b2f3a;background:#14161c;
    color:#e8eaf0;font-size:15px;font-family:inherit;outline:none}
  input:focus{border-color:#7d95ff}
  button{width:100%;margin-top:12px;padding:11px;border:0;border-radius:10px;background:#4f6ef7;
    color:#fff;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer}
  button:hover{filter:brightness(1.08)}
  .err{margin:0 0 12px;padding:9px 12px;border-radius:8px;background:#2e1a1a;color:#ff8a8a;font-size:13px}
</style>
</head>
<body>
  <form class="card" method="POST" action="/admin/">
    <h1>受保护的页面</h1>
    <p>请输入密码后继续</p>
    ${message ? `<div class="err">${message}</div>` : ""}
    <input type="password" name="password" placeholder="密码" autofocus autocomplete="current-password">
    <button type="submit">进入</button>
  </form>
</body>
</html>`;
	return new Response(html, {
		status: status || (message ? 401 : 200),
		headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store",
			"x-robots-tag": "noindex, nofollow",
		},
	});
}

export async function onRequest(context) {
	const { request, env, next } = context;
	const url = new URL(request.url);

	const kv = getKV(env);

	// 密码只从环境变量 ADMIN_PASSWORD 读取；没配置就直接放行，避免把自己锁在外面
	const password = (env && env.ADMIN_PASSWORD) || "";

	if (!password || !kv) {
		return next();
	}

	// 失败限流：同一 IP 连错 4 次，锁 10 分钟
	const ip = request.headers.get("cf-connecting-ip") || "unknown";
	const lockKey = `admin:lock:${ip}`;
	const failKey = `admin:fail:${ip}`;

	const locked = await kv.get(lockKey);
	if (locked) {
		return loginPage("尝试次数过多，请 10 分钟后再试", 429);
	}

	// 退出登录
	if (url.searchParams.get("logout") === "1") {
		const old = readCookie(request.headers.get("cookie"), "bz_admin");
		if (old) {
			try {
				await kv.delete(`admin:sess:${old}`);
			} catch {
				/* ignore */
			}
		}
		return new Response(null, {
			status: 302,
			headers: {
				location: "/admin/",
				"set-cookie": "bz_admin=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
			},
		});
	}

	// 已登录
	const token = readCookie(request.headers.get("cookie"), "bz_admin");
	if (token) {
		const session = await kv.get(`admin:sess:${token}`);
		if (session) {
			return next();
		}
	}

	// 提交密码
	if (request.method === "POST") {
		let submitted = "";
		try {
			const form = await request.formData();
			submitted = String(form.get("password") || "");
		} catch {
			/* ignore */
		}
		if (submitted && submitted === password) {
			await kv.delete(failKey);
			const fresh = randomToken();
			await kv.put(`admin:sess:${fresh}`, "1", { expirationTtl: 60 * 60 * 24 * 7 });
			return new Response(null, {
				status: 302,
				headers: {
					location: "/admin/",
					"set-cookie": `bz_admin=${fresh}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
				},
			});
		}
		const fails = Number.parseInt((await kv.get(failKey)) || "0", 10) + 1;
		if (fails >= 4) {
			await kv.put(lockKey, "1", { expirationTtl: 600 });
			await kv.delete(failKey);
			return loginPage("尝试次数过多，请 10 分钟后再试", 429);
		}
		await kv.put(failKey, String(fails), { expirationTtl: 600 });
		return loginPage(`密码不对，还可以试 ${4 - fails} 次`, 401);
	}

	return loginPage("");
}
