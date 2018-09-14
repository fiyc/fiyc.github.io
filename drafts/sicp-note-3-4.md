---
title: SICP - 并发时间是一个本质问题
date: 2018-02-13 23:33:16
tags:
	- SICP
categories:
	- 编程范式
---

我们已经看到了具有内部状态的计算对象作为模拟工具的威力, 但是这种威力也付出了代价: 丢掉了引用透明性, 造成了有关同一与变化问题中的模糊不清, 还必须抛弃求值的代换模型, 转而采用更复杂也难把握的环境模型.  

<!-- more -->
引入了赋值之后, 我们就必须承认时间在所用的计算模型中的位置.
### 3.4.1 并发系统中时间的性质
这里主要就是通过举例说明了并发情况下, 操作共享资源时可能出现的状况

#### 并发程序的正确行为
解决并发的限制方式  
* 修改任意共享状态变量的两个操作都不允许同时发生
* 一种不那么严厉的限制方式, 保证并发系统产生出的结果与各个进程按照某种方式顺序运行产生出的结果完全一致
* 还有一些更弱的要求

#### 练习3.38
这个任务只是为了说明不同的操作顺序可能产生很多的可能结果

### 3.4.2 控制并发的机制
控制并发的机制有两种:  
* 列举进程中各个事件的排列顺序, 并考虑每一种排列的效果, 检查是否每种行为都可以接受
* 设法作出一些一般性的机制, 使我们可能限制并行进程之间的交错情况, 以保证程序具有正确的行为方式

这一节将讨论一种解决方案: `串行化组(serializer)`
#### 对共享变量的串行访问
串行化就是实现下面的想法: 使进程可以并发地执行, 但是其中也有一些过程不能并发执行. 更准确地说, 串行化就是创建一些不同的过程集合, 并且保证在每个时刻, 在任何一个串行化集合里至多只有一个过程的一个执行. 如果某个集合里有过程正在执行, 而另一进程企图执行这个集合里的任何过程时, 它就必须等待到前一过程的执行结束.

#### Scheme里的串行化
假设我们有一个过程`parallel-execute`:  
```lisp
(parallel-execute <p1> <p2> .. <pi>) 
```

这里的每个`<p>`必须是一个无参过程, `parallel-execute`为每个`<p>`创建一个独立的进程, 这些进程都并发地运行.  

```lisp
(define x 10)

(parallel-execute (lambda () (set! x (* x x)))
	              (lambda () (set! x (+ x 1))))
```

我们可以用串行化的过程给这里的并发性强加一些限制, 通过`串行化`实现这种限制. 构造串行化组的方式是调用`make-serializer`, 这一过程的实现将在后面给出. 一个串行化组以一个过程为参数, 它返回的串行化过程具有与原过程一样的行为方式. 对一个给定串行化组的所有调用返回的串行化过程都属于同一个集合.  

```lisp
(define x 10)
(define s (make-serializer))

(parallel-execute (s (lambda () (set! x (* x x))))
                  (s (lambda () (set! x (+ x 1)))))
```

下面是3.1.1节里的`make-account`过程的另一个版本, 其中存款和取款操作已经做了串行化:  
```lisp
(define (make-account balance)
	(define (withdraw amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount))
				   balance)
	         "Insufficient funds"))
	(define (deposit amount)
		(set! balance (+ balance amount))
		balance)
	(let ((protected (make-serializer)))
		(define (dispatch m)
			(cond ((eq? m 'withdraw) (protected withdraw))
				  ((eq? m 'deposit) (protected deposit))
				  ((eq? m 'balance) balance)
				  (else
					  (error "Unknown request -- MAKE-ACCOUNT" m))))
		dispatch))
```

#### 练习3.39
```lisp
(define x 10)
(define s (make-serializer))
(parallel-execute (lambda () (set! x ((s (lambda () (* x x))))))
	              (s (lambda () (set! x (+ x 1)))))

;;101
;;121
;;11
;;100
```
#### 练习3.40
```lisp
(define x 10)
(parallel-execute (lambda () (set! x (* x x)))
	              (lambda () (set! x (* x x x))))
				  
;;100
;;1000
;;1000000
;;100000
;;10000

(define s (make-serializer))
(parallel-execute (s (lambda () (set! x (* x x))))
	              (s (lambda () (set! x (* x x x)))))
				  
;;1000000
```

#### 练习3.41
没影响, 想多了
#### 练习3.42
	
#### 使用多重共享资源的复杂性
这里举了一个交换账户余额的例子  
当出现A操作账号a, b, B操作账号b, c时可能出现问题
```lisp
(define (exchange account1 account2)
	(let ((difference (- (account1 'balance)
		                 (account2 'balance))))
		((account1 'withdraw) difference)
		((account2 'deposit) difference)))
```

解决这个问题的一种方式是用两个账户的串行化组将整个exchange过程串行化  
```lisp
(define (make-account-and-serializer balance)
	(define (withdraw amount)
		(if (>= balance amount)
			(begin (set! balance (- balance amount))
				   balance)
	        "Insufficient funds"))
	(define (deposit amount)
		(set! balance (+ balance amount))
		balance)
	(let ((balance-serializer (make-serializer)))
		(define (dispatch m)
			(cond ((eq? m 'withdraw) withdraw)
				  ((eq? m 'deposit) deposit)
				  ((eq? m 'balance) balance)
				  ((eq? m 'serializer) balance-serializer)
				  (else
					  (error "Unknown request -- MAKE-ACCOUNT" m))))
	dispatch))
	

(define (deposit account amount)
	(let ((s (account 'serializer))
		  (d (account 'deposit)))
		((s d) amount)))

(define (serialized-exchange account1 account2)
	(let ((serialize1 (account1 'serializer))
		  (serialize2 (account2 'serializer)))
		((serialize1 (serialize2 exchange)) account1 account2)))
```
#### 练习3.43

#### 练习3.44

#### 练习3.45

#### 串行化的实现
我们使用一种更基本的称为`互斥元(mutex)`的同步机制来实现串行化. 互斥元是一种对象, 假定它提供两个操作.  
* 一个互斥元可以被`获取`或者被`释放`
* 一旦某个互斥元被获取, 对于这一互斥元的任何其他获取操作都必须等到该互斥元被释放之后

每个串行化组关联着一个互斥元, 给了一个过程P, 串行化组将返回一个过程, 该过程将获取相应互斥元, 而后运行P. 最后释放该互斥元.  

```lisp
(define (make-serializer)
	(let ((mutex (make-mutex)))
		(lambda (p)
			(define (serialized-p . args)
				(mutex 'acquire)
				(let ((val (apply p args)))
					(mutex 'release)
					val))
	        serialized-p)))
```

互斥元实现  
```lisp
(define (make-mutex)
	(let ((cell (list false)))
		(define (the-mutex m)
			(cond ((eq? m 'acquire)
				   (if (test-and-set! cell)
				       (the-mutex 'acquire)))
				  ((eq? m 'release)
				   (clear! cell))))
		the-mutex))
	
(define (clear! cell)
	(set-car! cell false))
	
(define (test-and-set! cell)
	(if (car cell)
		true
		(begin (set-car! cell true)
			   false)))
```
#### 练习3.46
还是描述并发下同时读取共享资源的问题
#### 练习3.47
```lisp
(define (make-signal n)
	(define (test-and-set!)
		(if (= n 0)
			true
			(begin (set! n (- n 1))
			       false)))
	(define (clear!)
		(set! n (+ n 1)))
		
	(define (the-signal m)
		(cond ((eq? m 'acquire)
			   (if (test-and-set!)
			       (the-mutex 'acquire)))
		      ((eq? m release)
			   (clear!))))
	the-signal)	
```
#### 死锁
这里只是提出了死锁的问题, 并且给出了解决`serialized-exhcange`的死锁的一个方案(并不能完全解决): 给每个账户确定一个唯一的标识编号, 并且重写`serialized-exchange`, 使每个进程总是首先设法进入保护具有较低表示编号的账户的过程.
#### 练习3.48

#### 练习3.49

#### 并发性， 时间和通信
都是描述问题的, 看了一遍


