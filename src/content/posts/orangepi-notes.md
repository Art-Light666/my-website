---
title: 香橙派踩坑记录
published: 2026-11-04
description: "Orange Pi Zero 3W 跑 Ubuntu 的几个月里遇到的问题，攒成一页。"
tags: ["Linux", "开发板"]
category: 折腾
draft: false
---

手上的 Orange Pi Zero 3W 跑了有一阵子了，把遇到的问题记一下，省得下次再翻聊天记录。

## 没有显示器怎么装系统

板子没有接 HDMI，第一次开机基本是盲开——只能靠改 SD 卡里的配置让它自己连上 WiFi，然后从电脑 SSH 进去。

所以顺序是：先烧镜像 → 改网络配置 → 插卡上电 → 等它自己上网 → 电脑上连。

## 几个坑

**1. 时区**

系统起来之后是 UTC，日志里的时间跟本地差 8 小时，排查问题时特别容易看错。改一下就好：

```bash
timedatectl set-timezone Asia/Shanghai
```

**2. 内核里没有 tun**

想跑 Tailscale 做内网穿透，结果 tailscaled 一直报错，查了半天发现是内核编译时把 TUN 关掉了，`/dev/net/tun` 根本不存在。

这种只能自己编一个模块，然后加载：

```bash
insmod /lib/modules/$(uname -r)/kernel/drivers/net/tun.ko
```

**3. 断电就失联**

板子只认它记住的那个 WiFi 名字。路由器一旦被改回默认名字，它就再也连不上，只能等人回家重新配。

后来的做法是：路由器里给它绑定个固定 IP，至少 IP 不会再变来变去。

## 目前的状态

现在板子上跑着一个 QQ 机器人，偶尔给它加个小功能。不算稳定，但够用。
