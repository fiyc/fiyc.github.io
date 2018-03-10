---
title: emacs 改造之一场由代码折叠引发的血案
date: 2018-03-11 03:33:58
tags:
	- emacs
categories:
	- emacs
---

## 前言
这是一篇记录改造emacs实现代码折叠的过程记录. 虽然使用emacs也已经有大半年了, 但是之前都是借用别人的配置, 自己也就凑活着用了. 今天原本是在研究js设计模式的, 由于写了很多demo函数, 发现没有代码折叠真的很痛苦, 于是转头就开始解决这个问题(我就是这么一个容易跑偏了的人~)  

<!-- more -->

## 寻找代码折叠函数
这个过程其实还是比较容易的, 打开`hs-minor-mode`即可. 但是在这里我遇到了三个问题.
1. 在全局配置里默认打开`hs-minor-mode`时报错了, 这里使用的代码是`(hs-minor-mode 1)`. 猜想可能是某个原本打开的buffer不支持这个mode
2. 默认的快捷键实在是太太太蛋疼了
3. 打开和关闭所有代码块不是一个函数, 打开关闭当前代码块倒可以用一个函数完成

## 解决问题
### 问题1
这个问题我在网上也搜索了一些方案, 看到别人配置代码折叠时都是向指定的buffer添加hook.  

参照他们的方案, 我需要知道当前编辑js的buffer所对应的hook.  

在查找如何获取这个hook的过程中, 我发现了`C-h m`里可以看到当前mode的很详细的信息, 当然也包括了hook.  

>In addition to any hooks its parent mode ‘prog-mode’ might have run,this mode runs the hook ‘js-mode-hook’, as the final stepduring initialization.

以上是信息中的关键部分, 我现在知道了hook为`js-mode-hook`.  

于是在启动时执行 `(addhook 'js-mode-hook (lambda () (has-minor-mode 1)))`  

问题1解决

### 问题2 & 3
其实问题2与问题3都是快捷键设置的问题  

#### 打开关闭当前代码块
针对打开关闭当前代码块这个功能, 首先找到对应的函数
```
C-h k
C-c @ C-c
```

于是我知道对应的函数为`hs-toggle-hiding`.   

添加按键绑定`(global-set-key (kbd "C-,") 'hs-toggle-hiding)`  

搞定

#### 打开关闭所有折叠
同样根据默认快捷键找到对应的函数`hs-show-all`与`hs-hide-all`.  

这里我希望通过一个快捷键可以实现两个函数的默认切换.  

我首先试着查找有没有什么全局变量可以告诉我当前代码的折叠情况, 看了这两个函数的代码, 没啥头绪.于是干脆来个粗暴的方法, 自己写2个函数, 函数内部调用原本的折叠与打开函数, 同时做好快捷键的切换.代码如下:

```lisp
(defun open-up-folding()
	(interactive)
	(hs-show-all)
	(global-set-key (kbd "C-.") 'close-folding))

(defun close-folding()
	(interactive)
	(hs-hide-all)
	(global-set-key (kbd "C-.") 'open-up-folding))

(global-set-key (kbd "C-.") 'close-folding)
```

搞定



## 后记
虽然这次只是解决了一个小问题, 而且也许也早有人给出了更合理的方案. 但是这次hack emacs的过程让我感觉很享受. 这个过程中也让我发现了一些emacs里我之前所不熟悉的东西, 比如`hook`, `mode`.  

唯一美中不足的是, js设计模式研究过程被打断了一下. 

还有, 今天睡得又晚了..
