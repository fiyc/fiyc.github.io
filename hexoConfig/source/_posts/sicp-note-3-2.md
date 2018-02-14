---
title: SICP - 求值的环境模型
date: 2018-02-13 23:30:19
tags:
	- SICP
categories:
	- 阅读笔记
---

在前面我们采用代换模型(1.1.5节)定义了将过程应用于实际参数的意义.  
> 将一个复合过程应用于一些实际参数, 就是在用各个实际参数代换过程体里对应的形式参数之后, 求值这个过程体.  

一旦我们把赋值引进程序设计语言之后, 这一定义就不在合适了. 此时的一个变量必须以某种方式指定一个`位置`, 相应的值可以存储在那里, 在我们的新求值模型里, 这种位置将维持在成为`环境`的结构中.  

<!-- more -->

一个环境就是`框架`的一个序列, 每个框架是包含着一些`约束`的一个表格(可能为空), 这些约束将一些变量名字关联与对应的值(变量名唯一). 每个框架还包含一个指针, 指向这一框架的`外部环境`.  

下图描述了一个简单的环境结构
![一个简单的环境结构][1]

* 在环境B中求值x将等到3(在它的外部环境的框架一种)
* 在环境A中求值x将等到7(当前环境)

环境对于求值过程是至关重要的, 因为它确定了表达式求值的上下文. 实际上, 我们完全可以说, 在一个程序语言里的一个表达式本身根本没有任何意义. 即使像`(+ 1 1)`这样简单的表达式, 其解释也要依赖于上下文, 在那里`+`是表示加法的符号.

### 3.2.1 求值规则
在求值的环境模型里, 一个过程总是一个对偶, 有一些代码和一个指向环境的指针组成. 过程只能通过一种方式创建, 那就是通过求值一个`lambda表达式`. 这样产生出的过程的代码来自这一lambda表达式的正文, 其环境就是求值这个表达式, 产生出这个过程时的环境.  

例如在全局环境里求值下面的过程定义:  
```lisp
(define (square x)
	(* x x))
```  

过程定义的语法形式, 不过是作为其基础的隐含lambda表达式的语法糖, 上面的定义就像是写出下面等价的表示:  
```lisp
(define square
	(lambda (x) (* x x)))
```  

其中求值`(lambda (x) (* x x))`, 并将符号`square`约束于这一求值得到的结果, 这些都是在全局环境中完成的.产生的环境结构如下图:  

![图3-2][2]  

我们已经看到了创建过程的有关过程, 现在就可以描述过程的应用了. 环境模型说明:在将一个过程应用于一组实际参数时, 将会建立起一个`新环境`, 其中包含了将所有形式参数约束与对应的实际参数的框架, 该框架的外围环境就是所用的那个过程的环境. 随后在这个新环境之下求值过程的体.  

下图是演示通过在全局环境里对表达式`(square 5)`求值而创建起来的环境结构.  

![图3-3][3]  

我们可以把过程应用的环境模型总结为下面两条规则:  
* 将一个过程对象应用于一集实际参数, 将构造出一个新框架, 其中将过程的形式参数约束到调用时的实际参数, 而后在构造起的这一新环境的上下文中求值过程体. 这个新框架的外围环境就是作为被应用的那个过程对象的一部分的环境.
* 相对于一个给定环境求值一个lambda表达式, 将创建起一个过程对象, 这个过程对象是一个序对, 有该lambda表达式的正文和一个指向环境的指针组成, 这一指针指向的就是创建这个过程对象时的环境.  


### 3.2.2 简单过程的应用
这一节主要就是详细描述了求值下面代码中`(f a)`时的环境结构, 没有新东西.  
```lisp
(define (square x)
	(* x x))
	
(define (sum-of-squares x y)
	(+ (square x) (square y)))
	
(define (f a)
	(sum-of-squares (+ a 1) (* a 2)))
```
#### 练习3.9
```
递归版本
[
{
"环境": "E1",
"外部环境": "全局环境",
"约束":["n":6],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
},
{
"环境": "E2",
"外部环境": "E1",
"约束":["n":5],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
},
{
"环境": "E3",
"外部环境": "E2",
"约束":["n":4],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
},
{
"环境": "E4",
"外部环境": "E3",
"约束":["n":3],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
},
{
"环境": "E5",
"外部环境": "E4",
"约束":["n":2],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
},
{
"环境": "E6",
"外部环境": "E5",
"约束":["n":1],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
}
]

//迭代版本
[
{
"环境": "E1",
"外部环境": "全局环境",
"约束":["n":6],
"代码":"(if (= n 1) 1 (* n (factorial (- n 1))))"
},
{
"环境": "E2",
"外部环境": "E1",
"约束":["product": 1, "counter": 1, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
},
{
"环境": "E3",
"外部环境": "E2",
"约束":["product": 1, "counter": 2, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
},
{
"环境": "E3",
"外部环境": "E2",
"约束":["product": 2, "counter": 3, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
},
{
"环境": "E3",
"外部环境": "E2",
"约束":["product": 6, "counter": 4, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
},
{
"环境": "E4",
"外部环境": "E3",
"约束":["product": 24, "counter": 5, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
},
{
"环境": "E5",
"外部环境": "E4",
"约束":["product": 120, "counter": 6, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
},
{
"环境": "E6",
"外部环境": "E5",
"约束":["product": 720, "counter": 7, "max-count":6],
"代码":"(if (> counter max-count) product (fact-iter (* counter product) (+ counter 1) max-count))"
}
]

```
### 3.2.3 将框架看做局部状态的展台
这里还是回到前面定义的提款处理器过程:  
```lisp
(define (make-withdraw balance)
	(lambda (amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount)) balance)
			"Insufficient funds")))
		
(define W1 (make-withdraw 100))
(W1 50)
50
```  
这里的关键是要弄明白下面几点  
* 调用过程`(make-withdraw 100)`产生一个新环境`E1`, 并且balance在这个环境下约束为100
* 在新环境中求值了lambda表达式, 得到一个过程对象, 这个过程指向的环境是`E1`
* 将W1约束到了前面返回的过程对象上
* 调用`(W1 50)`时, 产生一个新环境`E2`, 这个环境的外部环境是这个过程本身的环境, 也就是`E1`， 而非全局环境.  

#### 练习3.10
```lisp
(define (make-withdraw initial-amount)
	((lambda (balance)
		(lambda (amount)
			(if (>= balance amount)
				(begin (set! balance (- balance amount))
					balance)
				"Insufficient funds")))
		initial-amount))
		
(make-withdraw 100)
		
;; 执行过程提
```  
* 上面的过程在调用时, 产生新环境E1, 且initial-amount约束为100
* 执行过程体时, 首先产生过程A, 来自下面的lambda表达式, 这个过程指向环境E1

```lisp
(lambda (balance)
		(lambda (amount)
			(if (>= balance amount)
				(begin (set! balance (- balance amount))
					balance)
				"Insufficient funds")))
```  

* 接着执行过程A, 产生一个新环境E2, 且amount约束为100
* 执行过程提, 产生过程B, 来自下面的lambda表达式, 这个过程指向环境E2  

```lisp
(lambda (amount)
			(if (>= balance amount)
				(begin (set! balance (- balance amount))
					balance)
				"Insufficient funds"))
```

过程B的环境结构与之前相同, 因此两个版本创建的对象具有相同的行为
### 3.2.4 内部定义
这里通过环境结构解释了前面所说的内部定义的实现原理, 不细说, 相同的理论.
#### 练习3.11




[1]: https://thumbnail10.baidupcs.com/thumbnail/3b723424b76815923ffb8d18037c07d2?fid=657587317-250528-895640736408586&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-qng7ofLfbzmRY%2Bx8SJ1%2B%2BiPKJwE%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "图3-1 一个简单的环境结构"
[2]: https://thumbnail10.baidupcs.com/thumbnail/ced3e99970d62b545df7b8e9d8d79b57?fid=657587317-250528-756275662879536&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-T27ZIfYrHNavkaE53v2GSbthsXs%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "图3-2"
[3]: https://thumbnail10.baidupcs.com/thumbnail/8a97b66da83e81b8ea2b61046dc5bf86?fid=657587317-250528-93557199735014&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-FrXG%2BeuffWWUGBGlzSqu%2BSnWofU%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "图3-3"

