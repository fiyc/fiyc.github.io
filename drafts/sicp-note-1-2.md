---
title: SICP - 过程与他们所产生的计算
date: 2018-02-13 23:17:11
tags:
	- SICP
categories:
	- 编程范式
---

> 在程序设计里, 我们需要对计算过程中各种动作的进行情况作出规划, 用一个程序去控制这一过程的进展. 要想成为专家, 我们就需要学会去看清各种不同种类的过程会产生什么样的计算过程.  

<!-- more -->
### 1.2.1 线性的递归和迭代  
**递归计算过程** 一个*推迟进行的操作*所形成的链条, 收缩阶段表现为这些运算的实际执行的计算过程.  

**线性递归过程** 推迟执行的链条的长度随着n值而线性增长(正比于n)的*递归计算过程*.  

**迭代计算过程** 状态可以用固定数目的状态变量描述的计算过程, 而与此同时, 又存在着一套固定的规则, 描述了计算过程在从一个状态到下一个状态转换时, 这些变量的更新方式, 还有一个结束检测, 它描述这一计算过程应该终止的条件.  

**线性迭代过程** 所需的计算步骤随着n线性增长的迭代计算过程  

```lisp
;阶乘的两种计算过程的实现
;递归计算过程
(define (factorial n)
	(if (= n 1)
		1
		(* n (factorial (- n 1)))))

;迭代计算过程
(define (factorial n)
	(fact-iter 1 1 n))

(define (fact-iter product counter max-count)
	(if (> counter max-count)
		product
		(fact-iter (* counter product)
				   (+ counter 1)
				   max-count)))
```

#### 练习1.10  
将过程A代换入给定过程中转换即可  
[/SICP/code/exercises/0009_1_10.scm](#)

### 1.2.2 树形递归  
以菲波那切数列作为例子描述树形递归

```lisp
;递归计算过程
(define (fib n)
	(if (< n 2)
		n
		(+ (fib (- n 1))
		   (fib (- n 2)))))

;迭代计算过程
(define (fib n)
	(fib-iter 1 0 n))

(define (fib-iter a b count)
	(if (= count 0)
		b
		(fib-iter (+ a b) a (- count 1))))
```

### 实例: 换零钱方式的统计  
该实例是为了说明树形递归计算过程在解决某些特定问题的时候的作用  
**问题描述:** 给定半美元, 四分之一美元, 10美分, 5美分和1美分的硬币, 将1美元换成零钱, 一共有多少种不同方式  

解决这个问题的核心思路, 将问题分解如下:  

将总数为a的现金换成n种硬币的不同方式的数目等于  
* 将现金数a换成除第一种硬币之外的所有其他硬币的不同方式数目, 加上
* 将现金数a-d换成所有种类的硬币的不同方式数目, 其中d是第一种硬币的币值  

**代码示例** [/SICP/code/demos/count-change.scm](#)  

### 1.2.3 增长的阶  
描述不同的计算过程在消耗计算资源的速率上的差异  

**具体描述**  
R(n)是一个计算过程在处理规模为n的问题时所需的资源量, 如果存在与n无关的整数k1和k2, 使得  
	k1f(n) <= R(n) <= k2f(n)  

则称R(n)具有O(f(n))的增长阶, 记为R(n)=O(f(n))

### 1.2.4 求幂
通过求幂的不同计算过程, 了解他们的增长的阶  
```lisp
;递归计算过程 O(n)的步和O(n)的空间
(define (expt b n)
	(if (= n 0)
		1
		(* b (expt b (- n 1)))))

;迭代计算过程 O(n)的步和O(1)的空间
(define (expt b n)
	(expt-iter b n 1))

(define (expt-iter b counter product)
	(if (= counter 0)
		product
		(expt-iter b 
				   (- counter 1) 
				   (* b product))))


;以连续求平方的方式求幂
(define  (fast-expt b n)
	(cond ((= n 0) 1)
	      ((even? n) (square (fast-expt b (/ n 2))))
	      (else (* b (fast-expt b (- n 1))))))

(define (even? n)
	(= (remainder n 2) 0))
```

#### 练习1.16  
将上面的连续求平方的递归计算过程转换为迭代计算过程, 找好状态变量就可以  
[/SICP/code/exercises/0012_1_16.scm](#)


#### 练习1.17  
有了前面例子的思路, 这道题做起来就很简单了, 而且题目中还把重点描述了一遍  
[/SICP/code/exercises/0013_1_17.scm](#)

#### 练习1.19  
没有代码, 单纯的思路  
[/SICP/code/exercises/0014_1_19.scm](#)

### 1.2.5 最大公约数  
**欧几里得算法:** 如果r是a除以b的余数, 那么a和b的公约数正好也是b和r的公约数, 这样就有了下面的等式  

GCG(a,b) = GCG(b,r)
```lisp
(define (gcd a b)
	(if (= b 0)
		a
		(gcd b (remainder a b))))
```
示例代码 [/SICP/code/demos/gcd.scm](#)

#### 练习1.20
用应用序和正则序来分析过程gcd  
[/SICP/code/exercises/0015_1_20.scm](#)

### 实例: 素数检测  
检测一个数是否素数的一种方法就是找出他的因子, 下面的示例用从2开始的里阿奴整数去检查他们能否整除n
```lisp
(define (smallest-divisor n)
	(find-divisor n 2))

(define (find-divisor n test-divisor)
	(cond ((> (square test-divisor) n) n)
		  ((divides? test-divisor n) test-divisor)
		  (else (find-divisor n (+ test-divisor 1)))))

(define (divides? a b)
	(= (remainder b a) 0))

(define (prime? n)
	(= n (smallest-divisor n)))
```
[/SICP/code/demos/prime-check.scm](#)  

**费马小定理:** 如果n是一个素数, a是小于n的任意正整数, 那么a的n次方与a模n同余.  
**模n同余:** 如果两个数除以n的余数相同, 那么他们模n同余.  
```lisp
;假定Scheme存在过程random, 入参为n, 返回0 到 n之间的任意整数
(define (fermat-test n)
	(define (try-it a)
		(= (expmod a n n) a))
	(try-it (+ 1 (random (- n 1)))))	

(define (fast-prime? n times)
	(cond ((= time 0) true)
	      ((fermat-test n) (fast-prime? n (- times 1)))
	      (else false)))
```

#### 练习1.21
直接使用之间demo的过程运行即可

#### 练习1.22
通过观察时间练检测过程耗时  
[/SICP/code/exercises/0016_1_22.scm](#)


