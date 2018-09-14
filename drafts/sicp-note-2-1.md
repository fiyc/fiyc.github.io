---
title: SICP - 数据抽象引导
date: 2018-02-13 23:21:49
tags:
	- SICP
categories:
	- 编程范式
---

> 数据抽象的基本思想, 就是设法构造出一些使用复合数据对象的程序, 使他们就像是在"抽象数据"上操作一样. 也就是说, 我们的程序中使用数据的方式应该是这样, 除了完成当前工作所必要的东西之外, 他们不对所用数据做任何多余的假设.于此同时, 一种"具体"数据的定义, 也应该与程序中使用数据的方式无关, 这样两个部分的界面将是一组过程, 称为选择函数和构造函数.  

<!-- more -->

### 2.1.1 实例: 有理数的算术运算  
这里假设我们已经存在了有理数运算 所需要的选择函数与构造函数, 而暂时不考虑他的实现.  
* `(make-rate <n> <d>)` 返回一个有理数, 其分子是整数<n>, 分母是整数<d>.
* `(numer <x>)` 返回有理数<x>的分子.
* `(denom <x>)` 返回有理数<x>的分母.  

于是现在我们可以使用构造函数与选择函数, 来实现有理数的*加,减,乘,除*.  

```lisp
;有理数加, x y为两个由make-rate构造出的有理数
(define (add-rat x y)
	(make-rate (+ (* (numer x) (denom y))
				  (* (numer y) (denom x)))
			   (* (denom x) (denom y))))


;有理数减, x y为两个由make-rate构造出的有理数
(define (sub-rat x y)
	(make-rate (- (* (numer x) (denom y))
				  (* (numer y) (denom x)))
			   (* (denom x) (denom y))))


;有理数乘, x y为两个由make-rate构造出的有理数
(define (mul-rat x y)
	(make-rat (* (numer x) (numer y))
	   	  	  (* (denom x) (denom y))))

;有理数除, x y为两个由make-rate构造出的有理数
(define (div-rat x y)
	(make-rat (* (numer x) (denom y))
	          (* (numer y) (denom x))))

(define (equal-rat? x y)
	(= (* (numer x) (denom y))
	   (* (numer y) (denom x))))
```
#### 序对

为了实现上面的数据抽象, 这里使用语言提供的一种复合结构**序对**, 序对可以由基本过程*cons*构造出来, 具体使用如下  

```lisp
;定义一个序对x
(define x (cons 1 2))

;获取序对x的第一位
(car x)
1

;获取序对除第一位的剩余部分
(cdr x)
2
```

#### 有理数的表示
通过序对来实现之前所使用的构造函数与选择函数  
```lisp
(define (make-rat n d) (cons n d))
(define make-rat cons)

(define (numer x) (car x))
(define numer car)

(define (denom x) (cdr x))
(define denom cdr)
```

顺手再来为有理数做一个打印过程  
```lisp
(define (print-rat x)
	(newline)
	(display (numer x))
	(display "/")
	(display (denom x)))
```

#### 练习2.1
代码: [/SICP/code/exercises/0033_2_1.scm](#)  

### 2.1.2 抽象屏障
这里我的理解就是与面向接口开发类似, 高层模块只需要依据低层模块暴露出的接口契约进行使用, 而不必关心其具体的实现.  

#### 练习2.2
代码: [/SICP/code/exercises/0034_2_2.scm](#)  

#### 练习2.3
代码: [/SICP/code/exercises/0035_2_3.scm](#)  

### 2.1.3 数据意味着什么
一般而言, 我们总可以将数据定义为一组适当的选择函数和构造函数, 以及为使这些过程成为一套合法表示, 他们就必须满足 的一组特点条件. 

为了说明上面的描述, 我们接下来自己定义一个序对实现.  

```lisp
(define (cons x y)
	(lambda (m)
		(cond ((= m 0) x)
			  ((= m 1) y)
			  (else (error "Argument not 0 or 1 -- CONS")))))

(define (car z) (z 0))
(define (cdr z) (z 1))
```

#### 练习2.4
代码: [/SICP/code/exercises/0036_2_4.scm](#)  

#### 练习2.5
代码: [/SICP/code/exercises/0037_2_5.scm](#)  

#### 练习2.6
代码: [/SICP/code/exercises/0038_2_6.scm](#)  

### 2.1.4 扩展练习: 区间算术
给出2个区间, 求出加减乘除的新的区间, 这里本身是一个很简单的数学问题, 个人觉得不需要深究, 只是用来作为例子阐述数据的表示而已.  

例如求区间A, 与区间B的加减区间  
`A + B = [min(A) + min(B), max(A) + max(B)]`  
`A - B = [min(A) - Max(B), Max(A) - min(B)]`

#### 练习2.7
代码: [/SICP/code/exercises/0039_2_7.scm](#)  

#### 练习2.8
代码: [/SICP/code/exercises/0040_2_8.scm](#)  

#### 练习2.9
代码: [/SICP/code/exercises/0041_2_9.scm](#)  

#### 练习2.10
代码: [/SICP/code/exercises/0042_2_10.scm](#)  

#### 练习2.11
代码: [/SICP/code/exercises/0043_2_11.scm](#)  

#### 练习2.12
代码: [/SICP/code/exercises/0044_2_12.scm](#)  


