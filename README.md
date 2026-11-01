# 个人主页 / 作品集

纯静态站点，**不需要任何依赖、不需要编译**，双击 `index.html` 就能看。

---

## 文件结构

```
portfolio/
├── index.html              # 页面骨架（基本不用动）
├── README.md               # 本文件
├── .gitignore              # Git 忽略规则
├── .assetsignore           # Cloudflare 部署时忽略的文件
├── docs/
│   ├── preview-light.png   # 效果图（浅色）
│   └── preview-dark.png    # 效果图（深色）
└── assets/
    ├── css/style.css       # 样式（改配色看这里）
    ├── js/content.js       # ★ 内容配置（改内容看这里）
    ├── js/main.js          # 渲染逻辑（不用动）
    └── img/                # 放头像、项目截图
```

> `docs/`、`README.md` 这些不会部署到线上（由 `.assetsignore` 排除），只有 `index.html` 和 `assets/` 会公开。

---

## 怎么改内容（只需要改一个文件）

打开 **`assets/js/content.js`**，里面全是中文注释，改完保存、刷新浏览器即可。

| 想改什么 | 改哪里 |
| --- | --- |
| 名字、一句话介绍 | `hero.name` / `hero.tagline` |
| 头像 | `hero.avatar` 填图片路径，或留空自动用名字首字 |
| 首屏按钮 | `hero.buttons`（`href` 可以填 `#projects` 这种页内锚点） |
| 关于我 | `about.paragraphs`（几个元素就是几段） |
| 技能标签 | `skills.items` |
| 项目卡片 | `projects.items`（标题、描述、标签、链接） |
| 联系方式 | `contact.items` |
| 页脚版权 | `footer.text` |
| 浏览器标题 / SEO | `meta.title` / `meta.description` |

### 换头像

1. 把图片放到 `assets/img/` 下，比如 `assets/img/avatar.jpg`
2. 在 `content.js` 里写 `avatar: "assets/img/avatar.jpg"`

建议用正方形图片，尺寸 400×400 左右就够。

---

## 怎么改配色

打开 `assets/css/style.css`，最上面的 `:root`（浅色）和 `[data-theme="dark"]`（深色）里有两个变量：

```css
--accent: #4f46e5;   /* 主色，按钮、链接、标签都用它 */
--bg: #fbfbfd;       /* 页面背景 */
```

改 `--accent` 一行就能换整站主色调。

---

## 本地预览

直接双击 `index.html`。

想看两种配色：在地址栏后面加 `?theme=light` 或 `?theme=dark`。

想让手机也能看（同一个 WiFi 下）：

```bash
python -m http.server 8000
```

然后手机浏览器访问 `http://电脑IP:8000`。

---

## 部署到 Cloudflare Pages

### 方式一：连 GitHub（推荐，以后改完 push 就自动更新）

1. 把整个文件夹推到 GitHub 仓库，**`index.html` 放在仓库根目录**
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择仓库，然后填：

| 配置项 | 填什么 |
| --- | --- |
| Project name | 随便起，会变成 `xxx.pages.dev` |
| Framework preset | **None** |
| Build command | **留空** |
| Build output directory | **`/`** |

4. 点 **Save and Deploy**，一分钟左右就能通过 `https://xxx.pages.dev` 访问

### 方式二：不连 GitHub，直接传

```bash
# 先装 wrangler
npm install -g wrangler

# 在 portfolio 目录里执行
wrangler pages deploy . --project-name=你的项目名
```

或者直接在网页面板里**拖拽整个文件夹**。

> 如果 `index.html` 不在仓库根目录（比如在 `portfolio/` 子目录），把 Build output directory 改成 `portfolio`。

---

## 绑定自己的域名

### 前提：域名的 DNS 必须托管在 Cloudflare

Cloudflare Pages 的自动 HTTPS 证书只给**托管在 Cloudflare 上的域名**签发，所以先把域名接进来。

**第 1 步：把域名接入 Cloudflare**

1. 登录 Cloudflare → **Add a site** → 输入你的域名（如 `example.com`）
2. 选 **Free** 套餐
3. Cloudflare 会给你两个 **nameserver**（形如 `ada.ns.cloudflare.com`）
4. 去你**买域名的网站**（阿里云 / 腾讯云 / Namecheap / GoDaddy）→ 找到「DNS 服务器 / Nameservers」→ 改成 Cloudflare 给的那两个
5. 回到 Cloudflare 点 **Done, check nameservers**，等生效（几分钟到 24 小时）

> 域名在国内注册商买的也没问题，**指向 Cloudflare 不需要备案**（备案只针对服务器在中国大陆的情况）。

**第 2 步：在 Pages 项目里绑定域名**

1. 打开你的 Pages 项目 → **Custom domains** 标签
2. 点 **Set up a custom domain**
3. 输入域名：
   - 用主域名：`example.com`
   - 或用子域名：`www.example.com` / `blog.example.com`
4. 点 **Continue** → Cloudflare 会自动加好 DNS 记录 → 点 **Activate domain**

**第 3 步：等证书**

状态会经历 `Initializing` → `Pending` → `Active`，通常 **1–5 分钟**。变成 Active 就能用 `https://你的域名` 访问了。

### 建议的 DNS 结构

| 类型 | 名称 | 内容 | 代理状态 |
| --- | --- | --- | --- |
| CNAME | `@`（根域名） | `你的项目.pages.dev` | 🟠 已代理 |
| CNAME | `www` | `你的项目.pages.dev` | 🟠 已代理 |

根域名用 CNAME 是 Cloudflare 特有的（它会把 CNAME 扁平化），别的 DNS 服务商一般不允许。

### 让 www 和根域名都指向同一个站

在 Pages 项目的 **Custom domains** 里**把两个都加上**（`example.com` 和 `www.example.com`），然后在 Cloudflare 的 **Rules → Redirect Rules** 里加一条：

```
当 hostname 等于 www.example.com  →  重定向到 https://example.com/$1  （301）
```

### 常见问题

| 现象 | 原因 / 解决 |
| --- | --- |
| 证书一直 `Pending` | 域名的 NS 还没完全切到 Cloudflare；去 **DNS → Records** 看是否有冲突的 A/AAAA 记录，删掉 |
| 打开是 522 / 521 | DNS 记录没指向 `xxx.pages.dev`，或代理状态没开 |
| 国内访问慢 | Cloudflare 免费版走境外节点，国内速度一般；要快只能上国内 CDN（那需要备案） |
| 改了内容线上没变 | 确认 GitHub 已经 push；Pages 会重新构建，看 **Deployments** 里的状态 |

---

## 特性

- 响应式，手机 / 平板 / 桌面都适配
- 深浅色主题切换（跟随系统，记忆选择，也支持 `?theme=` 强制）
- 滚动淡入动画（禁用 JS 时自动降级为直接显示）
- 无外部依赖：不引用任何 CDN、字体、图标库，断网也能正常显示
- 语义化 HTML，自带 SEO 基础标签
