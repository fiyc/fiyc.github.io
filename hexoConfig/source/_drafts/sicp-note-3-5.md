---
title: SICP - 流
date: 2018-02-15 12:36:00
tags:
	- SICP
categories:
	- 阅读笔记
---

这一节我们希望使用流处理来实现前面使用赋值作为工具做模拟的工作.  

<!-- more -->
### 3.5.1 流作为延时的表
这里首先通过例子提出了表操作赋值严重低效的代价  
求区间内素数之和  
```lisp
;;递归风格
(define (sum-primes a b)
	(define (iter count accum)
		(cond ((> count b) accum)
			  ((prime? count) (iter (+ count 1) (+ count accum)))
			  (else
				  (iter (+ count 1) accum))))
	(iter a 0))
	
;;使用序列操作
(define (sum-primes a b)
	(accumulate +
	            0
				(filter prime? (enumerate-interval a b))))
				
;;这个取出10000到1000000区间内第二个素数的例子能够更明显的说明
(car (cdr (filter prime?
	              (enumerate-interval 10000 1000000))))
```

流是一种非常巧妙的想法, 使我们可能利用各种序列操作, 但又不会带来将序列作为表去操作而引起的代价. 它有两个好处:  
* 可以像序列操作那么优雅
* 能得到递增计算的效率

基本想法就是做出一种安排, 只是部分地构造出流的结构, 并将这样的部分结构送给使用流的程序. 如果使用者需要访问这个流的尚未构造出的那个部分, 那么这个流就会自动地继续构造下去, 但是只做出足够满足当时需要的那一部分.  

从表面上看, 流也就是表, 但是对它们进行操作的过程的名字不同.  

* 构造函数 `cons-stream`
* 选择函数
  + `stream-car`
  + `stream-cdr`
  
```lisp
(stream-car (cons-stream x y)) = x
(stream-cdr (cons-stream x y)) = y
```
我们还有一个可识别的对象`the-empty-stream`, 它绝不会是任何`cons-stream`操作的结果. 这个对象可以用谓词`stream-null?`判断. 有了这些东西, 我们就可以构造流:  

```lisp
;;获取流中第n个对象
(define (stream-ref s n)
	(if (= n 0)
		(stream-car s)
		(stream-ref (stream-cdr s) (- n 1))))
		
;;流的map操作
(define (stream-map proc s)
	(if (stream-null? s)
		the-empty-stream
		(cons-stream (proc (stream-car s))
			         (stream-map proc (stream-cdr s)))))
					 
;;流的遍历操作
(define (stream-for-each proc s)
	(if (stream-null? s)
		'done
		(begin (proc (stream-car s))
			   (stream-for-each proc (stream-cdr s)))))
```

`stream-for-each`对于考察一个流非常有用:  
```lisp
(define (display-stream s)
	(stream-for-each display-line s))
	
(define (display-line x)
	(newline)
	(display x))
```

为了使流的实现能自动地, 透明地完成一个流的构造与使用的交错进行, 我们需要作出一种安排, 使得对于流的`cdr`的求职要等到真正通过过程`stream-cdr`去访问它的时候再做, 而不是在通过`cons-stream`构造流的时候做.  

作为一种数据抽象, 流与表完全一样. 它们的不同点就在于元素的求值时间. 对于常规的表, 其`car`和`cdr`都是在构造时求值; 而对于流, 其`cdr`则是在选取的时候才去求值.  

我们流的实现将基于一种称为`delay`的特殊形式, 对于`(delay <exp>)`的求职将不对表达式`<exp>`求值, 而是返回一个称为`延时对象`的对象, 它可以看做是对在未来的某个时间求值`<exp>`的允诺. 和`delay`一起的还有一个称为`force`的过程, 它以一个延时对象为参数, 执行相应的求值工作.  

`cons-stream`是一个特殊形式, 其定义将使  
`(cons-stream <a> <b>)`  
等价于  
`(cons <a> (delay <b>))`  

然后是选择函数的实现:  
```lisp
(define (stream-car stream) (car stream))

(define (stream-cdr stream) (force (cdr stream)))
```
#### 流实现的行为方式
现在用流的方式来重写上面提到的素数计算的问题:  
```lisp
(stream-car
	(stream-cdr
		(stream-filter price?
			           (stream-enumerate-interval 10000 1000000))))
```

在这里`stream-enumerate-interval`是类似`enumerate-interval`的流:  
```lisp
(define (stream-enumerate-interval low high)
	(if (> low high)
		the-empty-stream
		(cons-stream
		 low
		 (stream-enumerate-interval (+ low 1) high))))
```

这样, 由`stream-enumerate-interval`返回的结果就是通过`cons-stream`形成的:  
```lisp
(cons 10000
	(delay (stream-enumerate-interval 10001 1000000)))
```

`stream-filter`是类似`filter`的针对流的过程:
```lisp
(define (stream-filter pred stream)
	(cond ((stream-null? stream) the-empty-stream)
	      ((pred (stream-car stream))
		   (cons-stream (stream-car stream)
		                (stream-filter pred
						               (stream-cdr stream))))
		  (else
			  (stream-filter pred (stream-cdr stream)))))
```

一般而言, 可以将延时求值看做一种"由需要驱动"的程序设计, 其中流处理的每个阶段都仅仅活动到足够满足下一阶段需要的程度.

#### delay和force的实现
`delay`与`force`的实现比较简单, 一个作为执行表达式的lambda表达式返回, 一个执行对于的表达式:
```lisp
(define (delay exp)
	(lambda () (exp)))
	
(define (force delayed-obejct)
	(delayed-object))
```

这里提到了一个对于`delay`的优化, 使得表达式在第一次执行后能够记住它的结果, 之后调用的情况就不会再执行表达式, 而是读取存储的结果:

```lisp
(define (delay exp)
	(let ((already-run? false)
	      (result false))
		(lambda ()
			(if (not already-run?)
			    (begin
					(set! result (exp))
					(set! already-run? true)
					result)
				result))))
```
#### 练习3.50
```lisp
(define (stream-map proc . argstreams)
	(if (stream-null? (car argstreams))
		the-empty-stream
		(cons-stream
			(apply proc (map stream-car argstreams))
			(apply stream-map
			       (cons proc (map stream-cdr argstreams))))))
```
#### 练习3.51
```lisp
(define (stream-map proc s)
	(if (stream-null? s)
		the-empty-stream
		(cons-stream (proc (stream-car s))
			         (stream-map proc (stream-cdr s)))))

;;(1 (delay (stream-map show (stream-cdr (stream-enumerate-interval 0 10))))

;;5

;;7
```
#### 练习3.52
```lisp
(define sum 0);; sum = 0

(define (accum x)
	(set! sum (+ x sum))
	sum) ;; sum = 0
	
(define seq (stream-map accum (stream-enumerate-interval 1 20))) ;; sum = 1

(define y (stream-filter even? seq)) ;;sum = 1 + 2 = 3;

(define z (stream-filter (lambda (x) (= (remainder x 5) 0))
                         seq)) ;; sum = 15
						 
;;0
;;0
;;1
;;3
;;18
```
### 3.5.2 无穷流
前面我们已经看到如何做出一种假象, 使我们可以像对待完整的实体一样去对流进行各种操作, 即使在实际上只计算出了有关的流中必须访问的那一部分. 我们可以利用这种技术有效地将序列表示为流, 即使对应的序列非常长. 我们设置可以用流去表示无穷长的序列. 例如, 下面关于正整数的流的定义:

```lisp
(define (integers-starting-from n)
	(cons-stream n (integers-starting-from (+ n 1))))
	
(define integers (integers-starting-from 1))
```

我们可以利用`integers`定义出另一些无穷流, 例如所有不能被7整除的整数的流:

```lisp
(define (divisible? x y) (= (remainder x y) 0))

(define no-sevens
	(stream-filter (lambda (x) (not (divisible? x 7)))
	               integers))
```

我们也可以定义斐波那契数的无穷流:
```lisp
(define (fibgen a b)
	(cons-stream a (fibgen b (+ a b))))
	
(define fibs (fibgen 0 1))
```

现在我们来思考构造一个素数的无穷流. 大致的想法是, 从整数2开始,因为这是第一个素数. 为了得到其余的素数, 就需要从其余的整数中过滤掉2的所有倍数, 这样就留下了一个从3开始的流, 而3也就是下一个素数. 现在我们再从这个流的后面部分过滤掉所有3的倍数, 这样就留下一个以5开头的流, 而5又是下一个素数.  

该过程可描述如下: 对流S做筛选就是形成一个流, 其中的第一个元素就是S的第一个元素, 得到其随后的元素的方式是从S的其余元素中过滤掉S的第一个元素的所有倍数, 而后再对得到的结果进行筛选. 代码如下:

```lisp
(define (sieve stream)
	(cons-stream
		(stream-car stream)
		(sieve (stream-filter
			     (lambda (x)
					 (not (divisible? x (stream-car stream))))
				 (stream-cdr stream)))))
				 
(define primes (sieve (integers-starting-from 2)))

(stream-ref primes 50)
233
```
#### 隐式地定义流
上面的`integers`和`fibs`流是通过描述"生成"过程的方式定义的, 这种过程一个个地计算出流的元素. 描述流的另一种方式是利用延时求值隐式地定义流, 如下:

```lisp
(define ones (cons-tream 1 ones))
```

这里就好像在定义一个递归过程, 通过使用诸如`add-streams`的操作, 我们还可以做一些更有趣的事情. `add-streams`操作产生出两个给定流的逐对元素之和:

```lisp
(define (add-stream s1 s2)
	(stream-map + s1 s2))
```

基于此, 我们可以如此定义整数流`integers`:

```lisp
(define integers (cons-stream 1 (add-steams ones integers)))
```

这样定义出的`integers`是一个流, 其首元素是1, 其余部分是`ones`与`integers`之和. 这样第二个元素就是1加上`integers`的第一个元素, 也就是2; 第三个元素就是1加上`integers`的第二个元素, 也就是3. 依次类推.  

我们可以用同样的风格定义出斐波那契数:

```lisp
(define fibs
	(cons-stream 0
		(cons-stream 1
			(add-streams (steam-cdr fibs)
				         fibs))))
```
#### 练习3.53
```lisp
(define s (cons-stream 1 (add-streams s s)))
```

这个过程的第一位是1, 之后是由两个s的各项相加得到的流, 因此:
```
s[0] = 1
s[1] = s[0] + s[0] = 2
s[2] = s[1] + s[1] = 4
...
s[n] = 2^n
```
#### 练习3.54
```lisp
(define (mul-streams s1 s2)
	(stream-map * s1 s2))
	
(define factorials
	(cons-stream 1
	             (mul-stream factorials
					         (stream-cdr integers))))
```
#### 练习3.55
```lisp
;;这是自己想到的
(define (partial-sums s)
	(define (partial-itor items num)
		(let ((next (+ num (stream-car items))))
			(cons-stream next
			             (partial-itor (stream-cdr items) next))))
	(partial-itor s 0))
	
;;这是看了解题集的, 这个答案应该更符合书中的思路
(define (partial-sums s)
	(cons-stream (stream-car s)
	             (add-streams (partial-sums s)
				              (partial-sums (stream-cdr s)))))
```
#### 练习3.56

#### 练习3.57

#### 练习3.58

#### 练习3.59

#### 练习3.60

#### 练习3.61

#### 练习3.62

### 3.5.3 流计算模式的使用
流方法极富有启发性, 因为借助于它去构造系统时, 所用的模块划分方式可以与采用赋值、围绕着状态变量组织系统的方式不同. 例如, 我们可以将整个的时间序列(或者信号)作为关注的目标, 而不是去关注有关状态变量在各个时刻的值.

#### 系统地将迭代操作方式表示为流过程
回忆之前1.1.7节的平方根过程. 那里的思想就是生成出一个序列, 其元素是x的平方根的一个比一个更好的猜测值, 采用的方法是反复应用一个改进猜测的过程:
```lisp
(define (sqrt-improve guess x)
	(average guess (/ x guess)))
```

在原来的`sqrt`过程里, 我们用某个状态变量的一系列值表示这些猜测. 换一种方式, 我们也可以生成一个无穷的猜测序列, 从初始猜测1开始:

```lisp
(define (sqrt-stream x)
	(define guesses
		(cons-stream 1.0
			         (stream-map (lambda (guess)
						           (average guess (/ x guess)))
						         guesses)))
	guesses)
```

我们可以按照同样的方式处理生产π的近似值, 这一过程基于下面的交替级数:
```lisp
π/4 = 1 - 1/3 + 1/5 - 1/7 ...

(define (pi-summands n)
	(cons-stream (/ 1.0 n)
		         (stream-map - (pi-summands (+ n 2)))))

(define pi-stream
	(scale-stream (partial-sums (pi-summands 1)) 4))
```
#### 练习3.63

#### 练习3.64
```lisp
(define (stream-limit s num)
	(if (< (abs (stream-car s)
	            (stream-car (stream-cdr s))) 
	       num)
		(stream-car (stream-cdr s))
		(stream-limit (stream-cdr s) num)))
```
#### 练习3.65
```lisp
(define (ln-summands n)
	(cons-stream (/ 1.0 n)
	             (stream-map - (ln-summands (+ n 1)))))
				 
(define ln-stream (partial-sums (ln-summands 1)))
```
#### 序对的无穷流

#### 练习3.66

#### 练习3.67

#### 练习3.68

#### 练习3.69

#### 练习3.70

#### 练习3.71

#### 练习3.72

#### 将流作为信号

#### 练习3.73

#### 练习3.74

#### 练习3.75

#### 练习3.76

### 3.5.4 流和延时求值

#### 练习3.77

#### 练习3.78

#### 练习3.79

#### 练习3.80

#### 规范求值序

### 3.5.5 函数式程序的模块化和对象的模块化

#### 练习3.81

#### 练习3.82

#### 时间的函数式程序设计观点

