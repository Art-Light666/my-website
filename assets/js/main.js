/* =====================================================================
 *  渲染逻辑 —— 一般不需要改
 *  内容全部来自 assets/js/content.js
 * ===================================================================== */
(function () {
  "use strict";

  var S = window.SITE || {};
  var app = document.getElementById("app");
  if (!app) return;

  /* ---------------- 小工具 ---------------- */
  function h(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  function isExternal(href) {
    return /^https?:\/\//i.test(href || "");
  }
  function makeLink(href, className, text) {
    var a = h("a", className, text);
    a.href = href || "#";
    if (isExternal(href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }
  function section(id, title, subtitle) {
    var s = h("section", "section reveal");
    s.id = id;
    var head = h("div", "section-head");
    head.appendChild(h("h2", "section-title", title));
    if (subtitle) head.appendChild(h("p", "section-sub", subtitle));
    s.appendChild(head);
    return s;
  }

  /* ---------------- 页面元信息 ---------------- */
  var meta = S.meta || {};
  if (meta.title) document.title = meta.title;
  if (meta.lang) document.documentElement.lang = meta.lang;
  if (meta.description) {
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", meta.description);
  }

  /* ---------------- 主题 ---------------- */
  var root = document.documentElement;
  root.classList.add("js"); // 只有 JS 可用时才启用滚动淡入

  var saved = null;
  try { saved = localStorage.getItem("site-theme"); } catch (e) {}

  // 也支持用 ?theme=light / ?theme=dark 强制预览某种配色
  var forced = null;
  try { forced = new URLSearchParams(location.search).get("theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  root.setAttribute(
    "data-theme",
    forced === "light" || forced === "dark" ? forced : (saved || (prefersDark ? "dark" : "light"))
  );

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("site-theme", next); } catch (e) {}
    });
  }

  /* ---------------- 首屏 ---------------- */
  var hero = S.hero || {};
  var heroEl = h("header", "hero");

  var avatarWrap = h("div", "avatar");
  if (hero.avatar) {
    var img = h("img");
    img.src = hero.avatar;
    img.alt = hero.name || "";
    avatarWrap.appendChild(img);
  } else {
    avatarWrap.appendChild(h("span", "avatar-initial", (hero.name || "?").trim().charAt(0)));
  }
  heroEl.appendChild(avatarWrap);

  heroEl.appendChild(h("h1", "hero-name", hero.name || "你的名字"));
  if (hero.tagline) heroEl.appendChild(h("p", "hero-tagline", hero.tagline));

  if (Array.isArray(hero.buttons) && hero.buttons.length) {
    var actions = h("div", "hero-actions");
    hero.buttons.forEach(function (b) {
      var link = makeLink(b.href, "btn" + (b.primary ? " btn-primary" : ""), b.text);
      actions.appendChild(link);
    });
    heroEl.appendChild(actions);
  }
  app.appendChild(heroEl);

  /* ---------------- 关于 ---------------- */
  if (S.about && (S.about.paragraphs || []).length) {
    var about = section("about", S.about.title || "关于我");
    var body = h("div", "prose");
    S.about.paragraphs.forEach(function (p) { body.appendChild(h("p", null, p)); });
    about.appendChild(body);
    app.appendChild(about);
  }

  /* ---------------- 技能 ---------------- */
  if (S.skills && (S.skills.items || []).length) {
    var skills = section("skills", S.skills.title || "技能");
    var chips = h("ul", "chips");
    S.skills.items.forEach(function (k) {
      var li = h("li", "chip", k);
      chips.appendChild(li);
    });
    skills.appendChild(chips);
    app.appendChild(skills);
  }

  /* ---------------- 项目 ---------------- */
  if (S.projects && (S.projects.items || []).length) {
    var projects = section("projects", S.projects.title || "项目");
    var grid = h("div", "grid");
    S.projects.items.forEach(function (p) {
      var card = h("article", "card");
      card.appendChild(h("h3", "card-title", p.title || "未命名"));
      if (p.desc) card.appendChild(h("p", "card-desc", p.desc));
      if (Array.isArray(p.tags) && p.tags.length) {
        var tags = h("ul", "tags");
        p.tags.forEach(function (t) { tags.appendChild(h("li", "tag", t)); });
        card.appendChild(tags);
      }
      if (p.link) {
        card.appendChild(makeLink(p.link, "card-link", (p.linkText || "查看") + " →"));
      }
      grid.appendChild(card);
    });
    projects.appendChild(grid);
    app.appendChild(projects);
  }

  /* ---------------- 联系 ---------------- */
  if (S.contact) {
    var contact = section("contact", S.contact.title || "联系我");
    if (S.contact.text) contact.appendChild(h("p", "prose-lead", S.contact.text));

    var list = h("ul", "contact-list");
    (S.contact.items || []).forEach(function (item) {
      var li = h("li", "contact-item");
      li.appendChild(h("span", "contact-label", item.label + "："));
      if (item.href) {
        li.appendChild(makeLink(item.href, "contact-value", item.value));
      } else {
        li.appendChild(h("span", "contact-value", item.value));
      }
      list.appendChild(li);
    });
    contact.appendChild(list);
    app.appendChild(contact);
  }

    /* ---------------- 友链 ---------------- */
  if (S.friends && (S.friends.items || []).length) {
    var friends = section("friends", S.friends.title || "友链");
    var flist = h("ul", "friend-list");
    S.friends.items.forEach(function (f) {
      var li = h("li", "friend");
      var a = makeLink(f.url, "friend-link");
      var av = h("span", "friend-avatar");
      if (f.avatar) {
        var fimg = h("img");
        fimg.src = f.avatar;
        fimg.alt = f.name || "";
        fimg.loading = "lazy";
        fimg.onerror = function () {
          av.removeChild(fimg);
          av.textContent = (f.name || "?").trim().charAt(0);
        };
        av.appendChild(fimg);
      } else {
        av.textContent = (f.name || "?").trim().charAt(0);
      }
      a.appendChild(av);
      var info = h("span", "friend-info");
      info.appendChild(h("span", "friend-name", f.name || ""));
      if (f.desc) info.appendChild(h("span", "friend-desc", f.desc));
      a.appendChild(info);
      li.appendChild(a);
      flist.appendChild(li);
    });
    friends.appendChild(flist);
    app.appendChild(friends);
  }
/* ---------------- 页脚 ---------------- */
  if (S.footer) {
    var footer = h("footer", "footer");
    footer.appendChild(h("p", null, S.footer.text || ""));
    app.appendChild(footer);
  }

  /* ---------------- 滚动淡入 ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    app.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    app.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
