---
title: SICP - 用高阶函数做抽象
date: 2018-02-13 23:20:19
tags:
	- SICP
categories:
	- 编程范式
---

> 以过程作为参数或是返回值得过程, 被称为高阶过程. 本节将展示高阶过程如何能称为强有力的抽象机制, 极大的增强语言的表述能力.  

<!-- more -->
### 1.3.1 过程作为参数  
下面使用3个不同的求和过程, 将他们转为一个高阶过程  

1. 计算从a到b的各整数之和:  
```lisp
(define (sum-integers a b)
	(if (> a b)
		0
		(+ a (sum-integers (+ a 1) b))))
```  

2. 计算给定范围内的整数的立方之和:  
```lisp
(define (sum-cubes a b)
	(if (> a b)
		0
		(+ (cube a) (sum-cubes (+ a 1) b))))
```

3. 计算下面序列之和:  
1/(1*3) + 1/(5*7) + 1/(9*11) + ...  
```lisp
(define (pi-sum a b)
	(if (> a b)
		0
		(+ (/ 1.0 (* a (+ a 2))) (pi-sum (+ a 4) b))))
```  

总结出上述三种求和过程的基础模式, 产生下面的模板  
```lisp
(define (<name> a b)
	(if (> a b)
		0
		(+ (<term> a)
		   (<name> (<next> a) b))))
```  

根据上面的模板, 产生了下面这样一个高阶过程:  
[/SICP/code/demos/sum.scm](#)  
```lisp
(define (sum term a next b)
	(if (> a b)
		0
		(+ (term a)
		   (sum term (next a) next b))))
```  

#### 练习 1.29
代码: [/SICP/code/exercises/0017_1_29.scm](#) 

#### 练习1.30 
代码: [/SICP/code/exercises/0018_1_30.scm](#) 

#### 练习1.31
代码: [/SICP/code/exercises/0019_1_31.scm](#) 

#### 练习1.32
代码: [/SICP/code/exercises/0020_1_32.scm](#) 

#### 练习1.33
代码: [/SICP/code/exercises/0021_1_33.scm](#) 


### 1.3.2 用lambda构造过程  
**lambda**定义语法:  
`(lambda (<formal-parameters>) <body>)`  

**用let创建局部变量**  
```lisp
(let ((<var1> <exp1>)
	  (<var2> <exp2>)
	  .
	  .
	  .
	  (<varn> <expn>))
	<body>)
```

### 1.3.3 过程作为一般性的方法  
#### 通过区间折半寻找方程的根
求方程 *f(x)=0* 的一种方法就是**区间折半法**. 这个方法的基本思想:  

对于函数f(x), 如果给订单a和b有 f(a) < 0 < f(b), 那么f在a和b之间必然有一个零点. 通过求f((a + b)/2) 的值来缩小区间.  

令 c = (a + b)/2  

**如果 f(c) > 0**, 则问题转变为 f(a) < 0 < f(c)  
**如果 f(c) < 0**, 则问题转变为 f(c) < 0 < f(b)  
**如果 f(c) = 0**, 则c为f(x)的根  
同时, 当a与b之间的区间足够小时, 就结束这一过程, 实现过程如下  

```lisp
(define (search f neg-point pos-point)
	(let ((midpoint (average neg-point pos-point)))
		(if (close-enouth? neg-point pos-point)
			midpoint
			(let ((test-value (f midpoint)))
			     (cond ((positive? test-value)
			     		(search f neg-point midpoint))
			           ((negative? test-value)
			           	(search f midpoint pos-point))
			           (else midpoint))))))

(define (close-enough? x y)
	(< (abs (- x y)) 0.001))



;;加入f(a) f(b) 符号相同情况下的报错
(define (half-interval-method f a b)
	(let ((a-value (f a))
		  (b-value (f b)))
		(cond ((and (negative? a-value) (positive? b-value))
				(search f a b))
		      ((and (negative? b-value) (positive? a-value))
		      	(search f b a))
		      (else
		      	(error "Values are not of opposite sign" a b)))))
```

#### 找出函数的不动点
如果x满足方程f(x)=x, 则数x称为函数f的不动点, 求函数不动点的一个思路是 反复应用f来获得猜测值  

`f(x), f(f(x)), f(f(f(x)))...`  

当反复应用函数后, 两个连续的值只差小于某个实现给定的容许值时, 就认为这个值为不动点的近似值  

代码: [/SICP/code/demos/fixed-point.scm](#) 
```lisp
(define tolerance 0.00001)

(define (fixed-point f first-guess)
	(define (close-enough? v1 v2)
		(< (abs (- v1 v2)) tolerance))

	(define (try guess)
		(let ((next (f guess)))
			(if (close-enough? guess next)
				next
				(try next))))
	)
```  

*在求有些函数的不动点时, 会出现往复震荡的情况, 例如下面这个问题*  

求一个数n的平方根, 可以转换为求函数 `f(y) = n/y` 的不动点, 猜测过程如下  
```
;令猜测值为y, 初始猜测值为y1
;y2 = n/y1
;y3 = n/y2 = n/(n/y1) = y1
;y4 = n/y3 = n/y1
...

;猜测值反复震荡
```

为了解决上述反复震荡问题, 我们需要将函数进行转换  
```
当y是方程 f(y) = n/y 的不动点时
$ f(y) = n/y = y
$ y = (n/y + y)/2
; 所以函数f(y) = n/y 的不动点等于 函数F(y) = (n/y + y)/2 的不动点, 于是我们得到下面的平方根计算过程

(define (sqrt x)
	(fixed-point (lambda (y) (average y (/ x y))) 1.0))
```

#### 练习1.35 
代码: [/SICP/code/exercises/0022_1_35.scm](#) 

#### 练习1.36
代码: [/SICP/code/exercises/0023_1_36.scm](#) 

#### 练习1.37
代码: [/SICP/code/exercises/0024_1_37.scm](#) 

#### 练习1.38
代码: [/SICP/code/exercises/0025_1_38.scm](#) 


### 1.3.4 过程作为返回值
#### 平均阻尼
这里首先提出了一个**平均阻尼**的思想, 这一思想可以用下面的过程描述:  

```lisp
(define (average-damp f)
	(lambda (x) (/ (+ x (f x)) 2)))
```
利用average-damp, 重做前面的平方根过程  
```lisp
(define (sqrt x)
	(fixed-pooint (average-damp 
					(lambda (y) (/ x y))) 
				  1.0))
```
这个过程以一个过程作为入参, 范围值也是一个以一个数为入参的过程.  

当调用返回的过程时, 将会返回 f(x) 与 x的平均值.

#### 牛顿法  
虽然这里主要说明的是将过程作为返回值的例子, 但是重点放在了微积分的概念上, 这里只是简单的将它阐述的计算思想记录一下, 并不进行深纠.  

假设有一个函数 `f(x) = x - g(x)/Dg(x)`, 那么当g(x) = 0时, 此时的x为函数的不动点.  
这个其实挺好理解的, g(x) = 0， 则f(x) = x - 0 = x  

然后下面就开始解释导数的概念, 可以用这样的过程来表示  
```lisp
(define dx 0.00001)
;;deriv, 求出方程g的导数
(define (deriv g)
	(lambda (x)
		(/ (- (g (+ x dx)) (g x))
		   dx)))

;;newton-transform, 根据过程g 求出上面说的方程f
(define (newton-transform g)
	(lambda (x)
		(- x (/ (g x) ((deriv g) x)))))


(define (newtons-method g guess)
	(fixed-point (newton-transform g) guess))
```

### 抽象和第一级过程  


#### 练习1.40
代码: [/SICP/code/exercises/0026_1_40.scm](#) 

#### 练习1.41
代码: [/SICP/code/exercises/0027_1_41.scm](#) 

#### 练习1.42
代码: [/SICP/code/exercises/0028_1_42.scm](#) 

#### 练习1.43
代码: [/SICP/code/exercises/0029_1_43.scm](#) 

#### 练习1.44
代码: [/SICP/code/exercises/0030_1_44.scm](#) 

#### 练习1.45
代码: [/SICP/code/exercises/0031_1_45.scm](#) 

#### 练习1.46
代码: [/SICP/code/exercises/0032_1_46.scm](#) 






