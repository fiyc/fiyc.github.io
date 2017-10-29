---
title: Github + Hexo 搭建博客
date: 2017-10-28 19:06:35
tags:
	- Github
	- Hexo
categories:
	- 不务正业
---

> 今天尝试着用在github上搭建个人博客, 折腾了挺久, 最后弄完效果感觉还不错, 正好把建站过程写下作为这个博客的第一篇文章. 这篇文章主要教你如何使用Hexo与NexT主题创建基础的博客网站静态文件, 并利用GitHub Pages将他们发布.  

<!-- more -->

## 环境准备
* 安装Git
* 安装Nodejs
* 一个Github账号

具体的安装细节就不多说了, 很容易搜索到..


## GitHub Pages
Github Pages就是将我们仓库中的静态页作为一个可以直接访问的站点. 创建的过程还是比较简单的, 这里简单描述一下:  

1. 创建一个新的仓库, 名称为**username.github.io**, username就是你的账户名.  
2. 将这个仓库克隆到本地
```
$ git clone git@github.com:fiyc/fiyc.github.io.git blog
```
3. 试着在blog文件中添加一个index.html并推送到远程库
```
$ cd blog
$ vim index.html


$ git add index.html
$ git commit -m "init"
$ git push origin master
```
4. 进入刚刚创建的repository, 选择**Settings**标签, 然后设置下方的**GitHub Pages**  

现在通过地址username.github.io 应该就可以访问到我们刚刚创建的页面了

## 绑定自己的域名  
如果你想要将通过自己的域名来访问GitHub Pages, 那么就需要按照下面步骤操作:  
1. 进入万网域名解析页面, 选择添加解析.
记录类型选择**CNAME**   
主机记录**www**  
解析线路**默认**   

2. 在blog根目录下添加CNAME文件, 并在其中写入你的域名, 最后推送至远程库
```
$ cd blog
$ vim CNAME
www.fiyc.space

$ git add CNAME
$ git commit -m "add cname"
$ git push origin master
```
现在通过配置的域名就可以访问我们的站点了

## 安装并配置Hexo
其实完成上述的工作, 我们的站点就以及部署完毕了, 剩下的就是完善页面工作了. 但是为了专注于文章本身, 所以这里选择Hexo来帮助我们生成网站的静态页面.  

Hexo的[文档](https://hexo.io/zh-cn/docs/)里有很详细的使用说明, 如果有耐心的话可以去看一看, 大概10分钟左右就能看完了.  

### 安装
**安装Hexo**
```
$ npm install -g hexo-cli
```
**安装hexo-deployer-git**
```
$ npm install hexo-deployer-git --save
```
### 初始化Blog
因为我希望将Hexo的配置也存放在Github上面, 但是Hexo在初始化的时候要求目录下为空, 所以我没有在git仓库的根目录下初始化
```
$ cd blog
$ git branch hexo
$ git checkout hexo
$ hexo init hexoConfig
$ git add *
$ git commit -m "init hexo"
$ git push origin hexo
```
初始化过后的hexoConfig目录大概就是下面这样  
```

├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```

### 配置站点配置文件  
接下来我们进行一些最基本的配合, 如果想了解更多的话还是建议仔细阅读官方文档.  

打开**blog/hexoConfig/_config.yml**文件, 修改下面几项:   
```
title: 你的站点名
author: 你的名字
language: zh-Hans #中文
url: http://www.fiyc.space

deploy:
	type: git
	repo: 之前申请的仓库地址
	branch: master
```

在blog/hexoConfig/source目录下新建一个CNAME文件, 没错, 就是和前面说到的CNAME文件一模一样。

## 几个基本指令
做到这里, 我们已经对Hexo进行了安装并且进行了最基础的配置, 现在我们可以使用Hexo生成静态页面并且部署至GitHub, 下面是一些常用的指令

### generate
```
$ hexo generate 
$ hexo g # 简写
```
生成静态文件  

选项 | 描述
---|---
-d | 生成文件后立刻部署
-w | 监视文件改动  

### server
```
$ hexo server 
$ hexo s #简写 
```
启动服务器, 默认端口为4000

选项 | 描述
---|---
-p | 重设端口
-s | 只使用静态文件
-l | 记录日志

### deploy
```
$ hexo deploy 
```
部署生成的静态文件, 在我们现在的配置下就是讲静态文件推送到Github

选项 | 描述
---|---
-g | 部署之前预先生成静态文件


### new
```
$ hexo new [layout] <title>
```
新建一篇文章。如果没有设置 layout 的话，默认使用 _config.yml 中的 default_layout 参数代替。如果标题包含空格的话，请使用引号括起来. 

## 使用NexT主题
Next的[文档](http://theme-next.iissnan.com/getting-started.html)说的也很详细, 可以直接查阅  

### 安装
1. 直接将主题项目克隆到themes目录下  
```
$ cd blog/hexoConfig
$ git clone https://github.com/iissnan/hexo-theme-next themes/next
```

2. 修改项目配置文件blog/hexoConfig/_config.yml 下的theme, 将值改为next

### 主题配置文件_config.yml的一些配置关键字
主题的配置文件为 **blog/hexoConfig/themes/next/_config.yml**
**设置菜单:**  menu 
**设置风格:**  scheme 
**设置侧边栏社交信息:**  social 
**设置头像:**  avatar 

### 其他的一些个性化配置
这个主要是在[简书](http://www.jianshu.com/p/f054333ac9e6)上看到的, 写了很多有用的配置, 有兴趣的可以自己试一试, 这里就不一一描述了.











