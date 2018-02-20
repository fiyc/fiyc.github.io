---
title: SICP - 程序设计的基本元素
date: 2018-02-13 23:07:50
tags:
	- SICP
categories:
	- 编程范式
---

> 一个强有力的程序设计语言, 不仅是一种指挥计算机执行任务的方式, 它开应该成为一种框架, 使我们能够在其中组织自己的有关计算过程的思想. 这样, 当我们描述一个语言时, 就需要将注意力特放在这一语言所提供的, 能够将简单的认识组合起来形成更复杂任务的方法方面。  

<!-- more -->
* **基本表达形式**， 用于表示语言所关系的最简单的个体.
* **组合的方法**, 通过它们可以从较简单的东西出发构造出复合的元素.
* **抽象的方法**, 通过他们可以为复合对象命名, 并将它们当做单元去操作.


### 1.1.1 表达式  
**组合式:** 用一对括号括起一些表达式, 形成一个表, 用以表示一个过程应用. 在表里最左的元素称为*运算符*, 其他元素都称为*运算对象*. 
```lisp
(+ 137 349)
486
```

### 1.1.2 命名和环境
通过给事物命名, 将值与符号关联, 而后又能提取出这些值, 意味着解释器必须维护某种存储能力, 以便保持有关的名字-值对偶的轨迹. 这种存储被称为*环境*
```lisp
(define size 2)
size
2

(define pi 3.14159)
(define radius 10)
(define circumference (* pi radius))
circumference
62.8318
```

### 1.1.4 复合过程  
过程定义的一般形式:
```lisp
(define (<name> <formal parameters>) <body>)

;定义求平方的square过程
(define (square x) (* x x))
```

**案例过程**   [/SCIP/code/demos/sum-of-squares.scm](#)
* square 
* sum-of-squares
* f

### 1.1.5 过程应用的代换模型
分析上一节中的过程f的计算过程:  
```lisp
(f 5)  

;首先提取出f的体:  
(sum-of-squares (+ a 1) (* a 2))

;使用实际参数5代换其中的形式参数:
(sum-of-squares (+ 5 1) (* 5 2))

;这里需要对运算符以及2个运算对象求值
(+ (square 6) (square 10))

;使用square的定义可以将他归纳为:
(+ (* 6 6) (* 10 10))

;通过乘法进一步归纳:
(+ 36 100)

;最后得到
136

```
上面的计算过程称为过程应用的**代换模型**  

**应用序和正则序**  
前面例子中对运算符和各个运算对象求值, 而后将得到的过程应用于得到的实际参数的方式叫做 **应用序**  
反之, 优先求出所有运算符后再求值的方式叫做 **正则序**

### 1.1.6 条件表达式和谓词
**cond**
```lisp
(define (abs x)
	(cond ((> x 0) x)
	      ((= x 0) 0)
	      ((< x 0) (- x))))
```
**if**
```lisp
(define (abs x)
	(if (< x 0)
		(- x)
		x))
```

#### 练习1.1  
题目很简单, 求值表达式.   
[/SICP/code/exercises/0001_1_1.scm](#)

#### 练习1.2  
将数学表达式转换为前缀形式.   
[/SICP/code/exercises/0002_1_2.scm](#)

#### 练习1.3  
定义一个过程, 三个参数, 返回其中较大的两个数之和.  
[/SICP/code/exercises/0003_1_3.scm](#)

#### 练习1.4  
描述过程的行为, 没有源码
```lisp
;看方法名都知道了, 入参为两个数a, b
;得到a与b的绝对值的和
(define (a-plus-abs-b a b) 
	((if (> b 0) + -) a b))
```

#### 练习1.5  
求下面的表达式在应用序与正则序下求值的情况
```lisp
(define (p) (p))
(define (test x y)
	(if (= x 0)
		0
		y))

(test 0 (p))
```
应用序会求出运算符和运算对象的值, 所以这里不会考虑谓词的情况, 始终会对形式参数y求值, 进入死循环  
正则序只有需要的时候才会对运算对象求值, 所以这里由于x=0， 过程直接返回0 而不需要计算y的值， 因此运算正常 

### 1.1.7 实例: 采用牛顿法求平方根
实例说明在数学的函数和计算机的过程之间有一个重要差异, 那就是这一过程还必须是有可行的.  
在数学里, 人们通常关系的是说明性的描述(是什么), 而在计算机科学里, 人们则通常关心行动性的描述(怎么做).  
**牛顿的逐步逼近方法:** 如果对x的平方根的值有了一个猜测y, 那么就可以通过执行一个简单操作去得到一个更好的猜测
[/SICP/code/demos/sqrt.scm](#)
```lisp
(define (sqrt-iter guess x)
	(if (good-enough? guess x)
		guess
		(sqrt-iter (improve guess x) 
				   x)))

(define (improve guess y)
	(average guess (/ x guess)))

(define (average x y)
	(/ (+ x y) 2))

(dfine (good-enough? guess x)
	(< (abs (- (square guess) x)) 0.001))

```

#### 练习1.6
由于使用cond定义的if使用的是应用序, 所以在上面的sqrt-iter中使用自己定义的if会造成始终会去求值所有的运算对象, 则会无限的递归下去

#### 练习1.7 
优化good-enough?过程  
[/SICP/code/exercises/0005_1_7.scm](#)

#### 练习1.8
求立方根过程的实现  
[/SICP/code/exercises/0006_1.8.scm](#)


### 1.1.8 过程作为黑箱抽象
**内部定义和块结构**
```lisp
;块结构示例
define (sqrt x)
	(define (good-enough? guess x)
	  (< (abs (- (* guess guess) x)) 0.001))

	(define (improve guess x)
	  (/ (+ guess (/ x guess)) 2))

	(define (sqrt-iter guess x)
	  (if (good-enough? guess x)
	  	guess
	  	(sqrt-iter (improve guess x) x)))
  (sqrt-iter 1.0 x))

 ;词法作用域示例
 (define (sqrt2 x)
	(define (good-enough? guess)
	  (< (abs (- (* guess guess) x)) 0.001))

	(define (improve guess)
	  (/ (+ guess (/ x guess)) 2))

	(define (sqrt-iter guess)
	  (if (good-enough? guess)
	  	guess
	  	(sqrt-iter (improve guess))))
  (sqrt-iter 1.0))
```




