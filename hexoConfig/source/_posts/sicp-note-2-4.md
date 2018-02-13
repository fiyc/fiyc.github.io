---
title: SICP - 抽象数据的多重表示
date: 2018-02-13 23:26:07
tags:
	- SICP
categories:
	- 阅读笔记
---

> 在这一节里, 我们将学习如何去处理数据, 使他们可能在一个程序的不同部分中采用不同的表示方式. 这就需要我们去构造`通用型过程`, 也就是那种可以在不止一种数据表示上操作的过程. 这里构造通用型过程所采用的主要技术, 是让他们在带有`类型标志`的数据对象上工作, 也就是说, 让这些数据对象包含着他们应该如何处理的明确信息.   

<!-- more -->

### 2.4.1 复数的表示
这里要开发一个完成复数算术运算的系统, 我们首先将复数表示为有序对的两种可能表示方式:  
* 直角坐标形式(实部和虚部)
* 极坐标形式(模和幅角)  

直角坐标形式用来表示复数的加法:  
`实部(z1 + z2) = 实部(z1) + 实部(z2)`  
`虚部(z1 + z2) = 虚部(z1) + 虚部(z2)`  

极坐标形式从来表示复数的乘法:  
`模(z1 * z2) = 模(z1) * 模(z2)`  
`幅角(z1 * z2) = 幅度`
### 2.4.2 带标志数据
如果现在要找出对偶(3, 4)的magnitude, 我们无法确定答案是以下的哪一个  
* 3(将数据解释为直角坐标表示形式)
* 5(将数据解释为极坐标表示)

完成这种区分的一种方式, 就是在每个复数里包含一个`类型标志`部分.  

为了能对带标志数据进行各种操作, 我们将假定有过程`type-tag`和`contents`, 它们分别从数据对象中提取`类型标志`和`实际内容`, 还要假定有一个过程`attach-tag`， 它以一个标志和实际内容为参数, 生成一个带标志的数据对象.  

```lisp
(define (attach-tag type-tag contents)
	(cons type-tag contents))
	
(define (type-tag datum)
	(if (pair? datum)
		(car datum)
		(error "Bad tagged datum -- TYPE-TAG" datum)))
		
(define (contents datum)
	(if (pair? datum)
		(cdr datum)
		(error "Bad tagged datum -- CONTENTS" datum)))
```  

利用这些过程, 我们就可以定义出谓词`rectangular?`和`polar?`, 它们分别辨识直角坐标和极坐标的复数.  

```lisp
(define (rectangular? z)
	(eq? (type-tag z) 'rectangular))
	
(define (polar? z)
	(eq? (type-tag z) 'polar))
```


### 2.4.3 数据导向的程序设计和可加性
检查一个数据项的类型, 并据此去调用某个适当过程成为`基于类型的分类`. 在系统设计中, 这是一种获得模块性的强有力策略.  
而在另一方面, 像2.4.2节那样实现的分派有两个显著的弱点:  
* 其中的这些通用型界面过程(real-part, imag-part, magnitude和angle)必须知道所有的不同元素
* 及时这些独立的表示形式可以分别设计, 我们也必须保证在整个系统里不存在两个名字相同的过程

位于这两个弱点之下的基础问题是, 上面这种实现通用型界面的技术不具有`可加性`. 在每次增加一种新表示形式时, 实现通用选择函数的人都必须修改它们的过程, 而那些做独立表示的界面的人也必须修改其代码, 以避免名字冲突问题.  

现在我们需要的是一种能够将系统设计进一步模块化的方法. 一种称为`数据导向的程序设计`的编程技术提供了这种能力.  

理解数据导向的程序设计如何工作, 我们首先应该看到, 在需要处理的是针对不同类型的公共通用型操作时, 我们正在处理一个二维表格, 其中一个维度包含着所有可能操作, 另一个维度就是所有的可能类型, 表格中的项目就是一些过程, 如下面的例子:  

| 操作/类型 | Polar           | Rectangular           |
------------|-----------------|-----------------------
| real-part | real-part-polar | real-part-rectangular |
| imag-part | imag-part-polar | imag-part-rectangular |
| magnitude | magnitude-polar | magnitude-rectangular |
| angle     | angle-polar     | angle-rectangular     |
|           |                 |                       |  

数据导向的程序设计就是一种使程序能直接利用这种表格工作的程序设计技术. 我们将用操作名和参数类型的组合到表格中查找, 以便找出应该调用的适当过程, 并将这一过程应用于参数的内容.  

为了实现这一计划, 现在假定有两个过程`put`和`get`  
* `(put <op> <type> <item>)` 将项item加入表格中, 以op和type作为这个表项的索引
* `(get <op> <type>)` 从表中查找与op和type对应的项, 如果找到就返回项, 否则返回false

下面是向表格中加入直角坐标表示复数的过程:  

```lisp
(define (install-rectangular-package)
	;;internal procedures
	(define real-part car)
	(define imag-part cdr)
	(define make-from-real-imag cons)
	(define (magnitude z)
		(sqrt (+ (square (real-part z))
		         (square (imag-part z)))))
	
	(define (angle z)
		(atan (imag-part z) (real-part z)))
		
	(define (make-from-mag-ang r a)
		(cons (* r (cos a)) (* r (sin a))))
		
	;;interface to the rest of the system
	(define (tag x) (attach-tag 'rectangular x))
	(put 'real-part '(rectangular) real-part)
	(put 'imag-part '(rectangular) imag-part)
	(put 'magnitude '(rectangular) magnitude)
	(put 'angle '(rectangular) angle)
	(put 'make-from-real-imag 'rectangular
		(lambda (x y) (tag (make-from-real-imag x y))))
		
	(put 'make-from-mag-ang 'rectangular
		(lambda (r a) (tag (make-from-mag-ang r a))))
	'done)
```  

加入极坐标的过程与上面类似, 这里就不写了.复数算术的选择函数通过一个通用的名为`apply-generic`的操作过程访问有关表格, 这个过程将通用型操作应用于一些参数.  

```lisp
(define (apply-generic op . args)
	(let ((type-tags (map type-tag args)))
		 (let ((proc (get op type-tags)))
			  (if proc
				  (apply proc (map contents args))
				  (error
					  "No method for these types -- APPLY-GENERIC"
					  (list op type-tags))))))
```

利用`apply-generic`, 各种通用型函数可以定义如下:  

```lisp
(define (real-part z) (apply-generic 'real-part z))
(define (imag-part z) (apply-generic 'imag-part z))
(define (magnitude z) (apply-generic 'magnitude z))
(define (angle z) (apply-generic 'angle z))
```

同样的, 也可以从表中提取构造函数  

```lisp
(define (make-from-real-imag x y)
	((get 'make-from-real-imag 'rectangular) x y))

(define (make-from-mag-ang r a)
	((get 'make-from-mag-ang 'polar) r a))
```
#### 练习2.73

#### 练习2.74

#### 消息传递
在数据导向的程序设计里, 最关键的想法就是通过显示处理`操作 - 类型`表格的方式, 管理程序中的各种通用型操作.  

另一种实现策略时将这一表格按列进行分解, 不是采用一批"智能操作"去基于数据类型进行分派, 而是采用"智能数据对象", 让他们基于操作名完成所需的分派工作. 将每一个数据对象(例如一个采用直角坐标表示的复数)表示为一个过程, 它以操作的名字作为输入, 能够去执行指定的操作.按照这种方式, `make-from-real-imag`构造方法如下:  

```lisp
(define (make-from-real-imag x y)
	(define (dispatch op)
		(cond ((eq? op 'real-part) x)
			  ((eq? op 'imag-part) y)
			  ((eq? op 'magnitude)
				  (sqrt (+ (square x) (square y))))
			  ((eq? op 'angle) (atan y x))
			  (else
				  (error "Unknown op -- MAKE-FROM-REAL-IMAG" op))))
	dispatch)
```

与之对应的`apply-generic`过程应该对其参数应用一个通用型操作, 此时它只需要简单地将操作名馈入该数据对象, 并让那个对象去完成工作:   
`(define (apply-generic op arg) (arg op))`  

这种风格的程序设计称为`消息传递`, 这一名字源自将数据对象设想为一个实体, 它以消息的方式接收到所需操作的名字.

#### 练习2.75
代码 [SICP/code/exercises/0088_2_75.scm](#)  

#### 练习2.76
* 经常需要加入新类型, 使用消息传递
* 经常需要加入新操作, 使用数据导向

