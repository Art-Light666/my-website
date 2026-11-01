/* =====================================================================
 *  网站内容配置 —— 你只需要改这个文件
 *  改完保存，刷新浏览器即可看到效果，不需要编译、不需要重启。
 * ===================================================================== */

window.SITE = {

  /* ---------- 基本信息（浏览器标签页、搜索引擎用） ---------- */
  meta: {
    title: "李明的个人主页",
    description: "前端工程师 / 独立开发者，做一些有用的小东西。",
    lang: "zh-CN",
  },

  /* ---------- 首屏 ---------- */
  hero: {
    name: "李明",
    tagline: "前端工程师 · 独立开发者 · 喜欢把想法做成能用的东西",
    // 头像：填图片路径（放在 assets/img/ 下，比如 "assets/img/avatar.jpg"）
    // 留空则自动用名字的第一个字生成圆形头像
    avatar: "",
    buttons: [
      { text: "看看我的项目", href: "#projects", primary: true },
      { text: "联系我", href: "#contact", primary: false },
    ],
  },

  /* ---------- 关于我 ---------- */
  about: {
    title: "关于我",
    // 每一段是一个 <p>
    paragraphs: [
      "我是一名前端工程师，日常和 JavaScript、CSS、各种框架打交道。喜欢把复杂的东西做得简单，把简单的东西做得好看。",
      "业余时间会写一些开源小工具，也折腾硬件（树莓派、香橙派之类的开发板）。相信「能用」比「完美」更重要。",
    ],
  },

  /* ---------- 技能标签 ---------- */
  skills: {
    title: "技能",
    items: ["JavaScript", "TypeScript", "Vue", "React", "Node.js", "Python", "Linux", "Docker"],
  },

  /* ---------- 项目作品 ---------- */
  projects: {
    title: "项目",
    items: [
      {
        title: "项目一：图片压缩工具",
        desc: "浏览器端批量压缩图片，不上传服务器，隐私友好。支持 PNG/JPG/WebP。",
        tags: ["Vue", "Canvas"],
        link: "https://example.com",
        linkText: "在线体验",
      },
      {
        title: "项目二：开发板监控面板",
        desc: "在 Orange Pi 上跑的轻量监控，实时显示温度、内存、网络状态。",
        tags: ["Python", "Linux"],
        link: "https://example.com",
        linkText: "查看源码",
      },
      {
        title: "项目三：Markdown 简历生成器",
        desc: "用 Markdown 写简历，一键导出 PDF，模板可自定义。",
        tags: ["Node.js", "CLI"],
        link: "",
        linkText: "",
      },
    ],
  },

  /* ---------- 联系方式 ---------- */
  contact: {
    title: "联系我",
    text: "想聊技术、合作，或者只是打个招呼，都欢迎。",
    items: [
      { label: "邮箱", value: "you@example.com", href: "mailto:you@example.com" },
      { label: "GitHub", value: "github.com/yourname", href: "https://github.com/yourname" },
      { label: "微信", value: "your_wechat", href: "" },
    ],
  },

  /* ---------- 页脚 ---------- */
  footer: {
    text: "© 2026 李明 · 用 HTML / CSS / JavaScript 手写",
  },

};
