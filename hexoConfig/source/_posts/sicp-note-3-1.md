---
title: SICP - 赋值和局部状态
date: 2018-02-13 23:29:05
tags:
	- SICP
categories:
	- 阅读笔记
---


我们关于世界的常规观点之一, 就是将它看做聚集在一起的许多独立对象, 每个对象都有自己随着时间变化的状态, 所以一个对象`有状态`, 也就是说它的行为受到它的历史的影响.  

我们可以用一个或几个`状态变量`刻画一个对象的状态, 在它们之中维持着有关这一对象的历史, 即能够确定该对象当前行为的充分的信息. 

<!-- more -->

### 3.1.1 局部状态变量
为了说清楚这里所说的让一个计算对象具有随着时间变化的状态的意思, 现在我们来对一个银行账户支取现金的情况做一个模拟.  

* 一个过程`withdraw`
* 入参`amount`表示支取的现金
* 如果对于支取额, 账户中有足够的余额, 返回支取后的余额
* 否则返回消息`金额不足`

```lisp
(define balance 100)
(define (withdraw amount)
	(if (>= balance amount)
		(begin (set! balance (- balance amount)) balance)
		"Insufficient funds"))
```

这里我们使用了特殊形式`set!`, 其语法是:  
`(set! <nae> <new-value>)`  

以及`begin`, 语法如下:   
`(begin <exp1> <exp2> ... <expn>)`  

他将使表达式`<exp1>` 到`expn`按顺序求值, 最后一个表达式的值又将作为整个begin的值返回.  

下面将`balance`改成`withdraw`的局部状态变量  
```lisp
(define new-withdraw 
	(let ((balance 100))
		(lambda (amount)
			(if (>= balance amount)
				(begin (set! balance (- balance amount)) balance)
				"Insufficient funds"))))
```

将`set!`与局部变量相结合, 形成了一种具有一般性的程序设计技术, 这一技术引起了一个问题: 我们前面讲过的代换模型不再适合作为过程应用的模型了.  

下面我们做一个"提款处理器"  

```lisp
(define (make-withdraw balance)
	(lambda (amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount))
				balance)
			"Insufficient funde")))
			
```
用`make-withdraw`创建两个对象:  

```lisp

1 ]=> (define W1 (make-withdraw 100))

;Value: w1

1 ]=> (define W2 (make-withdraw 100))

;Value: w2

1 ]=> (W1 50)

;Value: 50

1 ]=> (W1 10)

;Value: 40

1 ]=> (W2 40)

;Value: 60
```

可以看出W1与W2两个对象之间是相互独立的对象.  

下面我们再来建立一个银行账户对象  
```lisp
(define (make-account balance)
	(define (withdraw amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount)) balance)
			"Insufficient funds"))
	(define (deposit amount)
		(begin (set! balance (+ balance amount)) balance))
	
	(define (dispatch m)
		(if (eq? m 'w)
			withdraw
			deposit))
	dispatch)
	
2 error> (define acc (make-account 100))

;Value: acc

2 error> ((acc 'w) 50)

;Value: 50

2 error> ((acc 'w) 60)

;Value 2: "Insufficient funds"

2 error> ((acc 'p) 10)

;Value: 60

2 error> ((acc 'w) 60)

;Value: 0
```
#### 练习3.1
```lisp
(define (make-accumulator init)
	(lambda (add-num)
		(begin (set! init (+ init add-num)) init)))
		

1 ]=> (define A (make-accumulator 5))

;Value: a

1 ]=> (A 10)

;Value: 15

1 ]=> (A 10)

;Value: 25
```
#### 练习3.2
```lisp
(define (make-monitored f)
	(let ((index 0))
		(lambda (input)
			(cond ((eq? input 'how-many-calls) index)
				  ((eq? input 'reset-count) (set! index 0))
				  (else
					  (begin (set! index (+ index 1))
						  (f input)))))))
						  

1 ]=> (define s (make-monitored sqrt))

;Value: s

1 ]=> (s 100)

;Value: 10

1 ]=> (s 'how-many-calls)

;Value: 1

1 ]=> (s 4)

;Value: 2

1 ]=> (s 'how-many-calls)

;Value: 2

1 ]=> (s 'reset-count)

;Value: 2

1 ]=> (s 'how-many-calls)

;Value: 0
```
#### 练习3.3
```lisp
(define (make-account balance password)
	(define (withdraw amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount))
				balance)
			"Insufficient funds"))
	(define (deposit amount)
		(begin (set! balance (+ balance amount))
			balance))
	(define (dispatch pd action)
		(if (eq? pd password)
			(if (eq? action 'w)
				withdraw
				deposit)
			(lambda (x)
				"Incorrect password")))
	dispatch)
	

1 ]=> (define acc (make-account 100 '123456))

;Value: acc

1 ]=> ((acc 'ssldjlsjf 'w) 50)

;Value 2: "Incorrect password"

1 ]=> ((acc '123456 'w) 50)

;Value: 50

1 ]=> ((acc '123456 'p) 100)

;Value: 150

1 ]=> 
```
#### 练习3.4
```lisp
(define (make-account balance password)
	(define remindtimes 7)
	(define (withdraw amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount))
				balance)
			"Insufficient funds"))
	(define (deposit amount)
		(begin (set! balance (+ balance amount))
			balance))
	(define (call-the-cops)
		"begin to call the cops!")
	(define (dispatch pd action)
		(if (eq? pd password)
			(begin (set! remindtimes 7)(if (eq? action 'w)
				withdraw
				deposit))
			(lambda (x)
				(begin (set! remindtimes (- remindtimes 1))
	                   (if (< remindtimes 0)
						   (call-the-cops)
						   (string-append "Incorrect passwor, remind times " (number->string remindtimes)))
			           ))))
	dispatch)
	

1 ]=> (define acc (make-account 100 '12345))

;Value: acc

1 ]=> ((acc 'sssss 'w) 50)

;Value 2: "Incorrect passwor, remind times 6"

1 ]=> ((acc '1234 'w) 50)

;Value 3: "Incorrect passwor, remind times 5"

1 ]=> ((acc '123456 'w) 50)

;Value 4: "Incorrect passwor, remind times 4"

1 ]=> ((acc '12345 'w) 50)

;Value: 50

1 ]=> ((acc '123 'w) 50)

;Value 5: "Incorrect passwor, remind times 6"

1 ]=> ((acc '123 'w) 50)

;Value 6: "Incorrect passwor, remind times 5"

1 ]=> ((acc '123 'w) 50)

;Value 7: "Incorrect passwor, remind times 4"

1 ]=> ((acc '123 'w) 50)

;Value 8: "Incorrect passwor, remind times 3"

1 ]=> ((acc '123 'w) 50)

;Value 9: "Incorrect passwor, remind times 2"

1 ]=> ((acc '123 'w) 50)

;Value 10: "Incorrect passwor, remind times 1"

1 ]=> ((acc '123 'w) 50)

;Value 11: "Incorrect passwor, remind times 0"

1 ]=> ((acc '123 'w) 50)

;Value 12: "begin to call the cops!"

1 ]=> 
```
### 3.1.2 引进赋值带来的利益
前面说到, 将赋值引进所用的程序设计语言, 将会使我们陷入许多困难的概念问题中. 但是将系统内看做是一集带有局部状态的对象, 也是一种维护模块化设计的强有力的技术.  

下面就用一个过程`rand`的实例来说明上面的问题.  

我们希望对`rand`反复调用将产生一系列的数, 这一序列具有均匀分布的统计性质. 假设我们已经有了一个过程`rand-update`, 它的从一个给定的数x开始, 执行下面操作.  

```lisp
x2 = (rand-update x)
x3 = (rand-update x2)
```  

我们可以将`rand`实现为一个带有局部状态变量x的过程, 其中将这个变量初始化为某个固定值`random-init`. 实现如下:  

```lisp
(define rand
	(let ((x random-init))
		(lambda ()
			(set! x (rand-update x))
			x)))
```  

上面的做法, 其实我们也可以通过简单地直接调用`rand-update`来完成, 但是这也意味着程序中任何使用随机数的部分都必须显示地记住, 需要将x的当前值送给`rand-update`作为参数. 这样做会造成很多的困难, 下面的例子实现`蒙特卡罗模拟`的技术就是为了说明这些困难.  

这里首先告诉我们, `6/π^2`是随机选取的两个整数之间没有公共因子(也就是说, 它们的最大公因子是1)的概率. 根据这一点, 我们可以求出π的近似值.  

下面是使用`rand`完成这一过程的代码
```lisp
(define (estimate-pi trials)
	(sqrt (/6 (monte-clrlo trials cesaro-test))))
	
(define (casaro-test)
	(= (gcd (rand) (rand)) 1))
	
(define (monte-carlo trials experiment)
	(define (iter trials-remaining trials-passed)
		(cond ((= trials-remaining 0)
			   (/ trials-passed trials))
			  ((experiment)
				  (iter (- trials-remaining 1) (+ trials-passed 1)))
			  (else
				  (iter (- trials-remaining 1) trials-passed))))
	(iter trials 0))
```

接着我们不使用`rand`, 直接使用`rand-update`来完成  

```lisp
(define (estimate-pi trials)
	(sqrt (/ 6 (random-gcd-test trials random-init))))
	
(define (random-gcd-test trials initial-x)
	(define (iter trials-remaining trials-passed x)
		(let ((x1 (rand-update x)))
			(let ((x2 (rand-update x1)))
				(cond ((= trials-remaining 0)
					   (/ trials-passed trials))
					  ((= (gcd x2 x1) 1)
						  (iter (- trials-remaining 1)
							    (+ trials-passed 1)
								x2))
					  (else
						  (iter (- trials-remaining 1)
						        trials-passed
								x2))))))
	(iter trials 0 initial-x))
```

可以看到, 在上面的过程中我们需要时刻维护着随机数的变化, 非常的麻烦. 我们很难将蒙特卡洛方法的思想孤立出来, 而需要把随机数生成器的内部逻辑与之混合在一起.  

#### 练习3.5

#### 练习3.6

### 3.1.3 引进赋值的代价
这里提到了使用`set!`赋值引起的问题, 也就是我们无法再使用之前讲到的代换模型. 从本质上说, 代换的最终基础就是, 这一语言里的符号不过是作为值得名字. 而一旦引进了`set!`和变量的值可以变化的想法, 一个变量就不再是一个简单的名字了. 现在的一个变量索引着一个可以保存值得位置, 而存储在那里的值也是可以改变的.  

这里我们写两个例子过程`make-decrementer`与`make-simplified-withdraw`, 在下面也会用到它们  

```lisp
(define (make-decrementer balance)
	(lambda (amount)
		(- balance amount)))
		
(define (make-simplified-withdraw balance)
	(lambda (amount)
		(set! balance (- balance amount))
		balance))
```
#### 同一和变化
接下来我们要考虑两个物体实际上`同一`的概念.  

加入我们用同样的参数调用`make-decrementer`两次, 就会创造出两个过程.  
```lisp
(define D1 (make-decrementer 25))
(define D2 (make-decrementer 25))
```

上面创造的`D1`与`D2`是同一的, 我们可以在任何计算中用D1代替D2而不会改变结果, 它们代表的意义都是传入一个数, 返回25减去这个数的结果.  

于此相对的是下面这2个对象:  

```lisp
(define W1 (make-simplified-withdraw 25))
(define W2 (make-simplified-withdraw 25))
```

`W1`与`W2`显然是不同一的, 虽然W1和W2都是通过对同样表达式`(make-simplified-withdraw 25)`求值创建起来的东西, 但是在任何表达式里都可以用W1代替W2是不对的.  

如果一个语言支持在表达式里"同一的东西可以相互替换"的概念, 这样替换不会改变有关表达式的值, 这个语言就成为具有`引用透明性`. 在我们的计算机语言里包含了`set!`之后, 也就打破了引用透明性, 这使确定是否通过等价的表达式代换去简化表达式变成了一个异常错综复杂的问题.


#### 命令式程序设计的缺陷

#### 练习3.7
```lisp
(define (make-account balance password)
	(define (withdraw amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount))
				balance)
			"Insufficient funds"))
	(define (deposit amount)
		(begin (set! balance (+ balance amount))
			balance))
	(define (join new-password)
		(lambda (pd action)
			(if (eq? pd new-password)
				(cond ((eq? action 'w) withdraw)
					  ((eq? action 'd) deposit)
					  ((eq? action 'j) join))
				(lambda (x)
					"Incorrect password"))))
	(define (dispatch pd action)
		(if (eq? pd password)
			(cond ((eq? action 'w) withdraw)
				  ((eq? action 'd) deposit)
				  ((eq? action 'j) join))
			(lambda (x)
				"Incorrect password")))
	dispatch)
	
(define (make-join account old-password new-password)
	((account old-password 'j) new-password))
	
;Value: make-account

1 ]=> 
;Value: make-join

1 ]=> (define peter (make-account 100 '1234))

;Value: peter

1 ]=> ((peter '1234 'w) 10)

;Value: 90

1 ]=> (define paul (make-join peter '1234 '5678))

;Value: paul

1 ]=> ((paul '5678 'd) 20)

;Value: 110

1 ]=> ((peter '1234 'w) 10)

;Value: 100

1 ]=> 
```
#### 练习3.8
```lisp
(define (f)
	(define init -1)
	(lambda (x)
		(if (= init -1)
			(begin (set! init x) (* x init))
			(* x init))))
			
;Value: f

1 ]=> (define f1 (f))

;Value: f1

1 ]=> (f1 0)

;Value: 0

1 ]=> (f1 1)

;Value: 0

1 ]=> (define f2 (f))

;Value: f2

1 ]=> (f2 1)

;Value: 1

1 ]=> (f2 0)

;Value: 0

1 ]=> (define f3 (f))

;Value: f3

1 ]=> (+ (f3 0) (f3 1))

;Value: 1

1 ]=> 
```
从上面的结果可以看出, 我们是采用从右到左的方式求值的
