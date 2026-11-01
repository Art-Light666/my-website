/* =====================================================================
 *  网站内容配置 —— 你只需要改这个文件
 *  改完保存，刷新浏览器即可看到效果，不需要编译、不需要重启。
 * ===================================================================== */

window.SITE = {

  /* ---------- 基本信息（浏览器标签页、搜索引擎用） ---------- */
  meta: {
    title: "东林海院26级某学生的个人主页",
    description: "努力学习计算机知识的萌新，偶尔做一些有趣的小玩意儿。\n喜欢玩鸣潮，六链爱弥斯享受者。",
    lang: "zh-CN",
  },

  /* ---------- 首屏 ---------- */
  hero: {
    name: "",
    tagline: "努力把有趣的想法落地",
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
      " 我是一枚计算机萌新，喜欢二次元，对计算机程序设计具有浓厚兴趣。",
      "业余时间会写一些开源小工具，也尝试折腾硬件（香橙派开发板）。目前还在不断努力学习中！",
    ],
  },

  /* ---------- 技能标签 ---------- */
  skills: {
    title: "技能",
    items: ["Python", "Linux", "Docker"],
  },

  /* ---------- 项目作品 ---------- */
  projects: {
    title: "项目",
    items: [
      {
        title: "项目一：开发板部署Astrbot",
        desc: "在orange pi zero3w开发板上运行Ubuntu系统，尝试linux系统的操作方法，并实现Astrbot长期本地运行。",
        tags: ["Linux", "Docker"],
        link: "None",
        linkText: "None",
      },
      {
        title: "项目二：暂无",
        desc: "",
        tags: [],
        link: "None",
        linkText: "None",
      },
      {
        title: "暂无",
        desc: "",
        tags: [],
        link: "",
        linkText: "",
      },
    ],
  },

  /* ---------- 联系方式 ---------- */
  contact: {
    title: "联系我",
    text: "想聊技术、合作，或者只是打个招呼，都欢迎哦。",
    items: [
      { label: "邮箱", value: "you@example.com", href: "mailto:you@example.com" },
      { label: "GitHub", value: "github.com/yourname", href: "https://github.com/yourname" },
      { label: "微信", value: "your_wechat", href: "" },
    ],
  },

  /* ---------- 页脚 ---------- */
  footer: {
    text: "一位默默无闻的developer",
  },

};
