---
title: npm设置国内源
date: 2017-11-17 10:11:33
tags:npm
categories:环境部署
---

这里记录一下npm更改源的方法, 原文来自[这里](http://riny.net/2014/cnpm), 这里只是做了简单的笔记.  

## 如何使用

### 1. 临时使用
`npm --registry https://registry.npm.taobao.org install express`

### 2. 持久使用
```
npm config set registry https://registry.npm.taobao.org

// 配置后可通过下面方式来验证是否成功
npm config get registry
// 或
npm info express
```

### 3. 通过cnpm使用
```
npm install -g cnpm --registry=https://registry.npm.taobao.org

// 使用
cnpm install express
```

## 一些国内优秀的npm镜像

### 淘宝

* 搜索地址: [http://npm.taobao.org/](http://npm.taobao.org/)
* registry 地址: [http://registry.npm.taobao.org/](http://registry.npm.taobao.org/)

### cnpmjs

* 搜索地址: [http://cnpmjs.org/](http://cnpmjs.org/)
* registry地址: [http://r.cnpmjs.org/](http://r.cnpmjs.org/)
