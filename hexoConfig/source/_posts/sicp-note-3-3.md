---
title: SICP - 用变动的数据做模拟
date: 2018-02-13 23:31:58
tags:
	- SICP
categories:
	- 阅读笔记
---

为了能够模拟具有不断变化的状态的复合对象, 我们将设计出与之对应的数据抽象, 使其中不但包含了选择函数和构造函数, 还有包含一些称为`改变函数`的操作, 这种操作能够修改有关的数据对象.  

<!-- more -->

例如, 对银行系统的模拟就需要修改账户的余额. 这样, 表示银行账户的数据结构可能就需要接受下面的操作:  
`(set-balance! <account> <new-value>)`  

它将根据给定的新值修改指定账户的余额. 定义了改变函数的数据对象称为`变动数据对象`.

### 3.3.1 变动的表结构
这里介绍了2个关于序对的过程: 

`set-car! <cons> value` 将序对的第一位修改为value  
`set-cdr! <cons> value` 将序对的第一位之后修改为value  

#### 练习3.12
```lisp
(define x (list 'a 'b))
(define y (list 'c 'd))
(define z (append x y))
z
(a b c d)

(cdr x)
(b)

(define w (append! x y))
w
(a b c d)

(cdr x)

(b c d)
```

#### 练习3.13
```lisp
(define (make-cycle x)
	(set-cdr! (last-pair x)
		x) x)
		
(define x (list 'a 'b 'c))

(define z (make-cycle x))
z
('a 'b 'c 'a 'b 'c 'a ...)

;;盒子模型
x ---->  [*][*] - [*][*] - [*][x]
          |        |        |
          a        b        c
		  
		  
	  |--------------------|
          |                    |
z ---->  [*][*] - [*][*] - [*][x]
          |        |        |
          a        b        c
```
#### 练习3.14
```lisp
(define (mystery x)
	(define (loop x y)
		(if (null? x)
			y
			(let ((temp (cdr x)))
				(set-cdr! x y)
				(loop temp x))))
	(loop x '()))
	
(define v (list 'a 'b 'c 'd))
x -> [*][*] - [*][*] - [*][*] - [*][x]
      a        b        c        d
	  
temp ->  [*][*] - [*][*] - [*][x]
          b        c        d
	
x -> [*][x]
      a
	  
temp ->  [*][*] - [*][x]
          c        d

x -> [*][*] - [*][x]
      b        a
	  
temp ->  [*][x]
          d
	  
x -> [*][*] - [*][*] - [*][x]
      c        b        a
	  
temp -> [x]

x -> [*][*] - [*][*] - [*][*] - [*][x]
      d        c        b        a
	  
mystery完成了对序列倒序的操作

1 ]=> (define w (mystery v))

;Value: w

1 ]=> v

;Value 2: (a)

1 ]=> w

;Value 3: (d c b a)

1 ]=> 
```
#### 共享和相等
之前我们提出了由于引入赋值而产生的`同一`和`变化`的理论问题. 当不同的数据对象共享某些序对时, 这些问题就表现到现实中来了, 例如下面的结构:  
```lisp
(define x (list 'a 'b))
(define z1 (cons x x))
```
![图3-16][1]  

这里z1是一个序对, 它的car和cdr指向同一个序列x, 这种z1的car和cdr共享x是cons的简单实现方式的自然结果.  

与之不同的是下面创建的结构:  
`(define z2 (cons (list 'a 'b) (list 'a 'b)))`  

![图3-17][2]  

在这一结构中, 两个表`(a b)`的各个序对互不相同, 虽然其中的符号是共享的.  

作为表考虑, 如果我们只用`cons`, `car`和`cdr`对各种表进行操作, 其中的共享就完全不会被察觉. 然而, 如果允许改变表结构的话, 共享的情况就会显现出来了.  

```lisp
(define x (list 'a 'b))
(define z1 (cons x x))

(define z2 (cons (list 'a 'b) (list 'a 'b)))

(define (set-to-wow! x)
	(set-car! (car x) 'wow)
	x)
	
1 ]=> z1

;Value 2: ((a b) a b)

1 ]=> z2

;Value 3: ((a b) a b)

1 ]=> (set-to-wow! z1)

;Value 2: ((wow b) wow b)

1 ]=> (set-to-wow! z2)

;Value 3: ((wow b) a b)

	
```  

检查表结构是否共享的一种方式是使用谓词`eq?`, 这个在之前已经提到过, 是作为检查两个符号是否相同的手段. 说的更明确一些, `eq? x y`实际上是检查x和y是否为同一个对象(也就是说, x和y的指针是否相等).


#### 练习3.15
都是改变了z1 和z2 的car, 变成`'wow`, 只不过由于z1的car与cdr指向同一个对象, 所以对z1的car的改变也会影响cdr. 盒子指针图画起来太麻烦了, 不画了.

#### 练习3.16
没看明白, 不知道它这里序对的个数指的是什么 

#### 练习3.17

#### 练习3.18

#### 练习3.19

#### 改变也就是赋值
前面我们提到过用过程的方式来表示序对  
```lisp
(define (cons x y)
	(define (dispatch m)
		(cond ((eq? m 'car) x)
			  ((eq? m 'cdr) y)
			  (else (error "Undefined operation --CONS" m))))
	dispatch)

(define (car z) (z 'car))
(define (cdr z) (z 'cdr))
```

这种认识对于变动数据也是有效的, 我们可以将变动数据对象实现为使用赋值和局部状态的过程.  
```lisp
(define (cons x y)
	(define (set-x! v) (set! x v))
	(define (set-y! v) (set! y v))
	(define (dispatch m)
		(cond ((eq? m 'car) x)
			  ((eq? m 'cdr) y)
			  ((eq? m 'set-car!) set-x!)
		      ((eq? m 'set-cdr!) set-y!)
			  (else (error "Undefined operation --CONS" m))))
	dispatch)

(define (car z) (z 'car))
(define (cdr z) (z 'cdr))
(define (set-car! z new-value)
	((z 'set-car!) new-value)
	z)
	
(define (set-cdr! z new-value)
	((z 'set-cdr!) new-value)
	z)
```

从理论上说, 为了表现变动数据的行为, 所需要的全部东西也就是赋值.

#### 练习3.20

### 3.3.2 队列的表示
一个`队列`是一个序列, 数据项只能从一端插入(这称为队列的末端), 只能从另一端删除(队列的前端).  

按照数据抽象的说法, 队列可以看作是由下面一组操作定义的结构:  
* 一个构造函数  
`(make-queue)` 它返回一个空队列  

* 两个选择函数:  
`(empty-queue? <queue>)` 检查队列是否为空  
`(front-queue <queue>)` 返回队列前端的对象  

* 两个改变函数  
`(insert-queue! <queue> <item>)` 将数据插入队列末端, 并返回修改过的队列  
`(delete-queue! <queue>)` 删除队列前端的数据项, 并返回修改后的队列  

由于队列就是数据项的序列, 我们当然可以将它表示为一个常规的表. 但是这种表示是相当低效的, 这是因为当我们插入一个数据项时, 必须要扫描整个表, 需要用O(n)步, 下面我们要修改一下表的表示方式, 使之能够用O(1)步实现.  

我们将队列表示为一个表, 同时存在一个序对, 它的两个值分别指向队列表的第一个序对与最后一个序对(即队列的首末). 如下图:  
![图3-19][3]  

为了定义出队列的各种操作, 我们将使用下面几个过程, 它们可以用于选择或者修改队列的前端和末端指针  

```lisp
(define front-ptr car)
(define rear-ptr cdr)
(define set-front-ptr! set-car!)
(define set-rear-ptr! set-cdr!)
```
现在我们就可以定义队列的各个实际操作了  

* 如果一个队列的前端指针等于空, 那么就认为这个队列为空  
`(define (empty-queue? queue) (null? (front-ptr queue)))`  

* 构造函数`make-queue`返回一个初始为空的表, 也就是一个序对, 其car和cdr都是空表  
`(define (make-queue) (cons '() '()))`  

* 在需要选取队列前端的数据项时, 我们就返回由前端指针指向的序对的car  
```lisp
(define (front-queue queue)
	(if (empty-queue? queue)
		(error "FRONT called with an empty queue" queue)
		(car (front-ptr queue))))
```

* 要向队列中插入一个数据项, 我们首先创建起一个新序对, 其car是需要插入的数据项, 其cdr是空表. 如果这一队列原本是空的, 那么就让队列的前后端指针指向这个新序对. 否则就修改队列中最后一个序对, 使之指向这个新序对, 而后让队列的后端指针也指向这个新序对.
```lisp
(define (insert-queue! queue item)
	(let ((new-pair (cons item '())))
		(cond ((empty-queue? queue)
			   (set-front-ptr! queue new-pair)
			   (set-rear-ptr! queue new-pair)
			   queue)
			  (else
				  (set-cdr! (rear-ptr queue) new-pair)
				  (set-rear-ptr! queue new-pair)
				  queue))))
```  

如下图  
![图3-20][4]  

* 要从队列的前端删除一个数据项, 我们只需要修改队列的前端指针, 使它指向队列中的第二个数据项.  

```lisp
(define (delete-queue! queue)
	(cond ((empty-queue? queue)
		   (error "DELETE! called with an empty queue" queue))
	      (else
			  (set-front-ptr! queue (cdr (front-ptr queue)))
			  queue)))
```  

如下图  
![图3-21][5]  

#### 练习3.21
```lisp
(define (print-queue queue)
	(cond ((empty-queue? queue)
		   '())
		  (else
			  (front-ptr queue))))
```
#### 练习3.22
```lisp
(define (make-queue)
	(let ((front-ptr '())
		  (rear-ptr '()))
		(define (dispatch m)
			(cond ((eq? m 'print-queue)
			       front-ptr)
			      ((eq? m 'insert)
				   (lambda (v)
					   (let ((new-pair (cons v '())))
						   (if (null? front-ptr)
							   ((set! front-ptr new-pair)
							    (set! rear-ptr new-pair))
							   ((set-cdr! front-ptr new-pair)
						        (set! rear-ptr v))))))
				  ((eq? m 'delete)
					  (lambda ()
						  (if (null? (car front-ptr))
							  (error "can not delete the empty queue")
							  (set! front-ptr (cdr front-ptr)))))
				  (else
					  (error "invalid action" m))))
		dispatch))
```


#### 练习3.23
删除队列尾端并且在O(1)步完成还没想好, 先空着

### 3.3.3 表格的表示
我们首先考虑一维表格的问题, 每个值保存在一个关键码之下. 我们要将这种表格实现为一个记录的表, 其中的每个记录将实现为由一个关键码和一个关联值组成的序对. 将这种记录链接起来构成一个序对的表, 让这些序对的car指针顺序指向各个记录. 这些作为连接结构的序对就成为了这一表格的`骨架`. 为了在向表格里加入记录时能有一个可以修改的位置, 我们将这种表格结构构造为一种`带表头单元的表`.  

![图3-22][6]  

为了从表格里提取信息, 我们用了一个`lookup`过程, 它以一个关键码为参数, 返回与之相关联的值(如果在这个关键码之下没有值就返回假).   

```lisp
(define (lookup key table)
	(let ((record (assoc key (cdr table))))
		(if record
			(cdr record)
			false)))
			
(define (assoc key records)
	(cond ((null? records) false)
	      ((equal? key (caar records)) (car records))
		  (else
			  (assoc key (cdr records)))))
```  

要在一个表格里某个特定的关键码之下插入一个值, 我们首先用`assoc`查看该表格里是否已经有以此为关键码的记录, 如果没有就cons起这个关键码和相应的值, 构造出一个新的记录, 并将它插入到新记录表的最前面, 位于哑记录之后. 如果表格里已经有了具有该关键码的记录, 那么就将该记录的cdr设置成这个新值.  

```lisp
(define (insert! key value table)
	(let ((record (assoc key (cdr table))))
		(if record
			(set-cdr! record value)
			(set-cdr! table
				(cons (cons key value) (cdr table)))))
	'ok)
	
(define (make-table)
	(list '*table*))
```  

#### 两维表格
两维表格里的每个值由两个关键码索引, 我们可以将这种表格构造为一个一维表格, 其中的每个关键码又标识了一个子表格, 如下图:  

![图3-23][7]  

在需要查找一个数据项时, 我们先用一个关键码确定对应的子表格, 而后用第二个关键码在这个子表格里确定记录.  

```lisp
(define (lookup key-1 key-2 table)
	(let ((subtable (assoc key-1 (cdr table))))
		(if subtable
			(let ((record (assoc key-2 (cdr subtable))))
				(if record
					(cdr record)
					false))
			false)))
```  

如果需要将一个新数据项插入到一对关键码之下, 我们首先用`assoc`去查看在第一个关键码下是否存在一个子表格. 如果没有, 就构造一个新的子表格, 其中只包含一个记录(key-2, value), 并将这一子表格插入到表格中的第一个关键码之下, 如果表格已经有了对应第一个关键码的子表格, 那么就将新值插入该子表格.  

```lisp
(define (insert! key-1 key-2 value table)
	(let ((subtable (assoc key-1 (cdr table))))
		(if subtable
			(let ((record (assoc key-2 (cdr  subtable))))
				(if record
					(set-cdr! record value)
					(set-cdr! subtable
						      (cons (cons key-2 value)
								    (cdr subtable)))))
			(set-cdr! table
				      (cons (list key-1
						          (cons key-2 value))
						    (cdr table)))))
	'ok)
```
#### 创建局部表格
上面定义的`lookup`和`insert!`都是以表格作为一个参数, 我们也可以用过程的方式表示表格.  

```lisp
(define (make-table)
	(let ((local-table (list '*table*)))
		(define (lookup key-1 key-2)
			(let ((subtable (assoc key-1 (cdr local-table))))
				(if subtable
					(let ((record (assoc key-2 (cdr subtable))))
						(if record
							(cdr record)
							false))
					false)))
	    (define (insert! key-1 key-2 value)
			(let ((subtable (assoc key-1 (cdr local-table))))
				(if subtable
					(let ((record (assoc key-2 (cdr record))))
						(if record
							(set-cdr! record value)
							(set-cdr! subtable
								(cons (cons key-2 value)
									  (cdr subtable)))))
					(set-cdr! local-table
						(cons
							(list key-1
								  (cons key-2 value))
							(cdr local-table)))))
	        'ok)
		(define (dispatch m)
			(cond ((eq? m 'lookup-proc) lookup)
			      ((eq? m 'insert-proc) insert)
				  (else 
					  (error "Unknown operation -- TABLE" m))))
	    dispatch))
```  

利用`make-table`, 我们就能做出在2.4.3节里为做数据导向的程序设计而用的`get`和`put`操作了.  
```lisp
(define operation-table (make-table))
(define get (operation-table 'lookup-proc))
(define put (operation-table 'insert-proc))
```
#### 练习3.24
```lisp
(define (make-table same-key?)
	(let ((local-table (list '*table*)))
		(define (assoc key records)
			(cond ((null? records) false)
				  ((same-key? key (caar records)) (car records))
				  (else (assoc key (cdr records)))))
		(define (lookup key-1 key-2)
			(let ((subtable (assoc key-1 (cdr local-table))))
				(if subtable
					(let ((record (assoc key-2 (cdr subtable))))
						(if record
							(cdr record)
							false))
					false)))
	    (define (insert! key-1 key-2 value)
			(let ((subtable (assoc key-1 (cdr local-table))))
				(if subtable
					(let ((record (assoc key-2 (cdr record))))
						(if record
							(set-cdr! record value)
							(set-cdr! subtable
								(cons (cons key-2 value)
									  (cdr subtable)))))
					(set-cdr! local-table
						(cons
							(list key-1
								  (cons key-2 value))
							(cdr local-table)))))
	        'ok)
		(define (dispatch m)
			(cond ((eq? m 'lookup-proc) lookup)
			      ((eq? m 'insert-proc) insert)
				  (else 
					  (error "Unknown operation -- TABLE" m))))
	    dispatch))
```
#### 练习3.25
```lisp
(define (make-table)
	(list '*table*))

(define (lookup keys table)
	(define (findIter keys table)
		(if (null? keys)
			table
			(let ((subtable (assoc (car keys) (cdr table))))
				(if subtable
					(findIter (cdr keys) subtable)
					false))))
	(if (null? keys)
		false
		(finditer keys table)))
		
(define (insert! keys value table)
	(define (make-subtable keys)
		(cond ((null? keys) (error "Invalid keys"))
			  ((null? (cdr keys))
				  (cons (car keys) value))
			  (else
				  (list (car keys)
					    (make-subtable (cdr keys)
							           value)))))
									   
	(define (iter-insert keys table)
		(cond ((null? keys) (set-cdr! table value))
			  (let ((sub-table (assoc (car keys) (cdr table))))
				  (if sub-table
					  (inter-insert (cdr keys) sub-table)
					  (set-cdr! table
						  (cons (make-subtable keys)
							    (cdr table)))))))
	(if (null? keys)
		(error "Invalid keys")
		(inter-insert keys table)))
```
#### 练习3.26

#### 练习3.27

### 3.3.4 数字电路的模拟器
这一节里, 我们要设计一个执行数字逻辑模拟的系统. 这一系统是通常称为`事件驱动的模拟`程序的一个典型代表, 在这类系统里, 一些活动引发另一些在随后时间发生的事件, 它们又会引发随后的事件, 并如此继续下去.  

我们有关的电路的计算模型将由一些对象组成, 它们对应于构造电路时所用的那些基本构件.  
* `连线` 传递数字信号, 信号只能具有0或1这两个值
* `反门` 一个输入, 对输入求反后输出.
* `与门` 两个输入, 以其输入的逻辑与作为输出信号的值
* `或门` 两个输入, 以其输入的逻辑或作为输出信号的值  

![图3-24][8]  

我们可以将一些基本功能部件连接起来, 构造出更复杂的功能, 例如下图展示的半加器  

![图3-25][9]  

我们现在要构造出一个程序, 它能够模拟我们希望研究的各种数字逻辑电路. 这一程序将构造出模拟连线的计算对象, 它们能够保持信号. 电路里的各种功能块用过程模拟, 它们产生出信号之间的正确关系.  

这一模拟中的一个最基本元素是过程`make-wire`, 它用于构造连线. 比如我们可以像下面这样构造出6条线:  
```lisp
(define a (make-wire))
(define b (make-wire))
(define c (make-wire))
(define d (make-wire))
(define e (make-wire))
(define s (make-wire))
```   

有了上面的连线, 我们可以如下构造出与门, 或门和反门.  
```lisp
(or-gate a b d)

(and-gate a b c)

(inverter c e)

(and-gate d e s)
```  

我们还应该为这种操作命名, 定义出一个过程`half-adder`  
```lisp
(define (half-adder a b s c)
	(let ((d (make-wire))
		  (e (make-wire)))
		(or-gate a b d)
		(and-gate a b c)
		(inverter c e)
		(and-gate d e s)
		'ok))
```  

作出这种定义的优点在于我们可以用`half-adder`作为基本构件去创造更复杂的电路. 比如下面的全加器.  
![图3-26][10]  

```lisp
(define (full-adder a b c-in sum c-out)
	(let ((s (make-wire))
		  (c1 (make-wire))
		  (c2 (make-wire)))
		(half-adder b c-in s c1)
		(half-adder a s sum c2)
		(or-gate c1 c2 c-out)
		'ok))
```  

从本质上看, 模拟器为我们提供了一种工具, 作为构造电路的一种语言. 如果我们采纳有关语言的一般性观点, 就像在1.1节里研究Lisp时所做的那样, 那么久可以说, 各种基本功能块形成了这个语言的基本元素, 将功能块连接起来就是这里的组合方式, 而将特定的连接模式定义为过程就是这里的抽象方法.

#### 基本功能块
基本功能块实现一种"效能", 使得在一根连线上的信号变化能够影响其他连线上的信号. 为了构造出这些功能块, 我们需要连线上的如下操作:  
* `(get-signal <wire>)` 返回连线上信号的当前值
* `(set-signal! <wire> <new value>)` 将连线上的信号修改为新的值
* `(add-action! <wire> <procedure of no arguments>)` 断言, 只要在连线上的信号值改变, 这里所指定的过程就需要运行.
* `(after-delay <delay-time> <procedure>)` 给定的时延之后执行指定过程  

利用这些过程, 我们就可以定义基本的数字逻辑功能了. 为了把输入通过一个反门连接到输出, 我们应该用`add-actin!`为输入线路关联一个过程, 当输入线路的值改变时, 这一过程就会执行. 下面这个过程计算出输入信号的`logical-not`, 在一个`inverter-delay`之后将输出线路设置为这个新值.  

```lisp
(define (inverter input output)
	(define (invert-input)
		(let ((new-value (logical-not (get-signal input))))
			(after-delay inverter-delay
				         (lambda () 
							 (set-signal! output new-value)))))
	(add-action! input invert-input)
	'ok)
	
(define (logical-not s)
	(cond ((= s 0) 1)
		  ((= s 1) 0)
		  (else (error "Invalid signal" s))))
```  

与门的情况稍微复杂一点, 需要在两个门的任一输入变化后运行相应的动作. 下面过程计算出输出线路上信号值的`logical-and`, 并在一个`and-gate-delay`之后设置新值.  

```lisp
(define (and-gate a1 a2 output)
	(define (and-action-procedure)
		(let ((new-value
			   (logical-and (get-signal a1) (get-signal a2))))
			(after-delay and-gate-delay
				         (lambda () 
							 (set-signal! output new-value)))))
	(add-action! a1 and-action-procedure)
	(add-action! a2 and-action-procedure)
	'ok)
```
#### 练习3.28
```lisp
(define (or-gate a1 a2 output)
	(define (or-action-procedure)
		(let ((new-value 
			   (logical-or (get-signal a1) (get-signal a2))))
			(after-delay or-gate-delay
				         (lambda ()
							 (set-signal! output new-value)))))
	(add-action! a1 or-action-procedure)
	(add-action! a1 or-action-procedure)
	'ok)
	
(define (logical-or s1 s2)
	(if (and (or (= s1 1) (= s1 0))
		     (or (= s2 1) (= s2 0)))
		 (if (or (= s1 1) (= s2 1))
			 1
			 0)
		 (error "Invalid signal" s1 s2)))
```
#### 练习3.29
这道题的门线路是网上搜来的  
![使用反门与门构造或门][11]

```lisp
(define (or-gate a1 a2 output)
	(let ((a (make-wire))
		  (b (make-wire)
		  (c (make-wire))))
		(interval a1 a)
		(interval a2 b)
		(and-gate a b c)
		(interval c output)))
```
`or-gate-delay = and-gate-delay + inverter-delay * 2`  

#### 练习3.30

```
//当前位值

A---- 反 ---|
	    |与 ----|
B---- 反 ---|       |
                    | 或 --------output
A---|               |
    |与 ------------|
B---| 


//C的值
A---|
    |与 ----- output
B---|

(define (ripple-carry-adder a b s c)
	(let ((interval-a (make-wire))
		  (interval-b (make-wire))
		  (interval-and-a-b (make-wire)))
		(and-gate a b c)
		(interval a interval-a)
		(interval b interval-b)
		(and-gate interval-a interval-b interval-and-a-b)
		(or-gate interval-and-a-b c s)))
		
delay = interval-delay + and-gate-delay + or-gate-delay
```
#### 线路的表示
在这种模拟中, 一条线路也就是一个具有两个局部状态变量的计算对象  
* 一个信号值`signal-value`
* 一组过程`action-procedures`, 在信号改变时, 这些过程都需要运行  

```lisp
(define (make-wire)
	(let ((signal-value 0)
		  (action-procedures '()))
	  (define (set-my-signal! new-value)
		  (if (not (= signal-value new-value))
			  (begin (set! signal-value new-value)
				     (call-each action-procedures))
	          'done))
			  
	  (define (accept-action-procedure! proc)
		  (set! action-procedures (cons proc action-procedures))
		  (proc))
	  
	  (define (call-each procedures)
		  (if (null? procedures)
			  'done
			  (begin
				  ((car procedures))
				  (call-each (cdr procedures)))))

	  (define (dispatch m)
		  (cond ((eq? m 'get-signal) signal-value)
			    ((eq? m 'set-signal!) set-my-signal)
			    ((eq? m 'add-action!) accept-action-procedure!)
			    (else (error "Unknow operation -- WIRE" m))))
	dispatch))
```  

接下来我们就可以提供以下访问线路中局部操作的过程了:  

```lisp
(define (get-signal wire)
	(wire 'get-signal))
	
(define (set-signal! wire new-value)
	((wire 'set-signal) new-value))
	
(define (add-action! wire action-procedure)
	((wire 'add-action!) action-procedure))
```
#### 待处理表
为了完成这一模拟器, 剩下的东西就是`after-delay`. 这里的想法是维护一个称为`待处理`的数据结构, 其中包含着一个需要完成的事项的清单. 这个待处理表应该有如下操作:  
* `(make-agenda)` 返回一个新的空的待处理表
* `(empty-agenda? <agenda>)` 在所给待处理表为空时为真
* `(first-agenda-item <agenda>)` 返回待处理表里的第一项
* `(remove-first-agenda-item! <agenda>)` 移除待处理表的第一项
* `(add-to-agenda! <time> <action> <agenda>)` 向待处理表中加入一项, 要求在特定的时间运行给定的动作过程
* `(curent-time <agenda>)` 返回当前的模拟时间  

我们要用的特定待处理表用`the-agenda`表示. 过程`after-delay`向`the-agenda`里加入一个新元素:  
```lisp
(define (after-delay delay action)
	(add-to-agenda! (+ delay (current-time the-agenda))
		            action
					the-agenda))
```  

有关的模拟用过程`propagate`驱动, 它对`the-agenda`操作, 顺序执行这一待定处理表中的每个过程. 一般而言, 在模拟运行中, 一些新的项目将被加入待处理表中. 只要在这一待处理表里还有项目, 过程`propagate`就会继续模拟下去:  

```lisp
(define (progate)
	(if (empty-agenda? the-agenda)
		'done
		(let ((first-item (first-agenda-item the-agenda)))
			(first-item)
			(remove-first-agenda-item! the-agenda)
			(propagate))))
```
#### 一个简单的实例模拟
下面过程中将一个监测器放到一个线路上, 用于显示模拟器的活动. 这一过程告诉相应的线路, 只要它的值改变了, 就应该打印出新的值, 同时打印当前时间和线路的名字:  

```lisp
(define (probe name wire)
	(add-action! wire
		        (lambda ()
					(newline)
					(display name)
					(display " ")
					(display (current-time the-agenda))
					(display "  New-value = ")
					(display (get-signal wire))))
```  

我们从初始化待处理表和描述各种功能块的延时开始:  

```lisp
(define the-agenda (make-agenda))
(define inverter-delay 2)
(define and-gate-delay 3)
(define or-gate-delay 5)
```  

然后定义4条线路, 在其中的两条线路上安装监测器:  

```lisp
(define input-1 (make-wire))
(define input-2 (make-wire))
(define sum (make-wire))
(define carry (make-wire))

(probe 'sum sum)

(probe 'carry carry)
```  

下面将这些线路连接到一个半加器电路上, 将`input-1`上的信号设置为1:  

```lisp
(half-adder input-1 input-2 sum carry)
ok

(set-signal! input-1 1)
done

(propagate)
sum 8 New-value = 1
done
```  

在时间8, sum上的信号变为1, 现在到了模拟开始之后的8个时间单位. 在这一点上, 我们可以将`input-2`上的信号设置为1, 并让有关的值向前传播:  

```lisp
(set-signal! input-2 1)
done

(propagate)
carry 11 New-value = 1
sum 16 New-value = 0
done
```


#### 待处理表的实现
这里介绍待处理表数据结构的细节, 这一数据结构里面保存着已经安排好, 将在未来时刻运行的那些过程.  

这种待处理表由一些`时间段`组成, 每个时间段是由一个数值(表示时间)和一个队列组成的序对. 在这个队列里, 保存着那些已经安排好的, 应该在这一时间段运行的过程.  

```lisp
(define (make-time-seqment time queue)
	(cons time queue))
	
(define (segment-time s) (car s))

(define (segment-queue s) (cdr s))
```  

待处理表本身就是时间段的一个一维表格. 与3.3.3节所示的表格的不同之处, 就在于这些时间段应该按照时间递增的顺序排列. 此外, 我们还需要在待处理表的头部保存一个`当前时间`. 一个新构造出的待处理表里没有时间段, 其当前时间是0:  

```lisp
(define (make-agenda) (list 0))

(define (current-time agenda) (car agenda))

(define (set-current-time! agenda time)
	(set-car! agenda time))
	
(define (segments agenda) (cdr agenda))

(define (set-segments! agenda segments)
	(set-cdr! agenda segments))
	
(define (first-segment agenda) (car (segments agenda)))

(define (rest-segments agenda) (cdr (segments agenda)))
```  

如果一个待处理表里没有时间段, 那它就是空的:  

```lisp
(define (empty-agenda? agenda)
	(null? (segments agenda)))
```  

为了将一个动作加入待处理表, 首先要检查这个待处理表是否为空. 如果为空, 那么久创建一个新的时间段, 并将这个时间段装入待处理表里. 否则我们就扫描整个待处理表, 寻找合适的时间. 如果找到对应的时间, 那么久把这个动作加入与之关联的队列里. 如果碰到了某个比需要预约的时间更晚的时间, 那么久将一个新的时间段插入待处理表.  

```lisp
(define (add-to-agenda! time action agenda)
	(define (belongs-before? segments)
		(or (null? segments)
			(< time (segment-time (car segments)))))
	
	(define (make-new-time-segment time action)
		(let ((q (make-queue)))
			(insert-queue! q action)
			(make-time-segment time q)))
	
	(define (add-to-segments! segments)
		(if (= (seqment-time (car segments)) time)
			(insert-queue! (segment-queue (car segments))
				           action)
			(let ((rest (cdr segments)))
				(if (belongs-before? rest)
					(set-cdr! segments
						      (cons (make-new-time-segment time action)
								    (cdr segments)))
					(add-to-segments! rest)))))
	(let ((segments (segments agenda)))
		(if (belongs-before? segments)
			(set-segments! agenda
				           (cons (make-new-time-segment time action)
							     segments))
			(add-to-segments! segments))))
```  

从待处理表中删除第一项的过程, 应该删去第一个是简单的队列前端的那一项. 如果删除使这个时间段变空了, 我们就将这个时间段也从时间段的表里删除:  

```lisp
(define (remove-first-agenda-item! agenda)
	(let ((q (segment-queue (first-segment agenda))))
		(delete-queue! q)
		(if (empty-queue? q)
			(set-segments! agenda (rest-segments agenda)))))
```  

找出待处理表里的第一项, 也就是找出其第一个时间段队列里的第一项. 无论何时提取这个项时, 都需要更新待处理表的当前时间:  

```lisp
(define (first-agenda-item agenda)
	(if (empty-agenda? agenda)
		(error "Agenda is empty -- FIRST_AGENDA_ITEM")
		(let ((first-seg (first-segment agenda)))
			(set-current-time! agenda (segment-time first-seg))
			(front-queue (segment-queue first-seg)))))
```
#### 练习3.32

### 3.3.5 约束的传播
这一节里, 我们要描绘一种语言的设计, 这种语言将使我们可以基于各种关系进行工作. 这一语言里的基本元素就是`基本约束`, 它描述了在不同量之间的某种特定关系.  

例如: `(adder a b c)`描述了a,b和c之间存在关系`a+b=c`, `(ultiplier x y z)`表示存在关系`x * y = z`, 而`(constant 3.14 x)`表示x的值永远都是3.14.  

我们还提供一些方法, 使它们可以用于组合各种基本约束, 以便去描述更复杂的关系. 在这里, 我们通过构造`约束网络`的方式组合起各种约束, 在这种约束网络里, 约束通过`连接器`链接起来. 连接器是一种对象, 它可以保存一个值, 使之能参与一个或者多个约束. 例如下面的华氏温度和摄氏温度的关系:  

![图3-28][12]

#### 约束系统的使用
为了使用上面给出了梗概的约束系统模型去执行温度计算, 我们需要首先调用构造函数`make-connector`, 创建起两个连接器C和F, 而后将它们连接到一个适当的网络里:  

```lisp
(define C (make-connector))
(define F (make-connector))
(celsius-fahrenheit-converter C F)

(define (celsius-fahrenheit-converter c f)
	(let ((u (make-connector))
		  (v  (make-connector))
		  (w  (make-connector))
		  (x  (make-connector))
		  (y  (make-connector)))
		(multiplier c w u)
		(multiplier v x u)
		(adder v y f)
		(constant 9 w)
		(constant 5 x)
		(constant 32 y)
		'ok))
```

为了观察这个网络的活动, 我们可以为连接器C和F安装上`probe`过程, 这里使用的过程和前面3.4.4节里监视线路的过程类似. 在连接器上安装监视器, 将导致每次给这个连接器一个值时, 就会打印出一个消息:  

```lisp
(probe "Celsius temp" C)
(probe "Fahrenheit temp" F)
```

下面我们将C设置为25. `set-value!`的第三个参数告诉C, 这个指示直接来自user  

```lisp
(set-value! c 25 'user)
```
#### 约束系统的实现
连接器的基本操作包括:  
* `(has-value? <connector>)` 报告说这一连接器是否有值
* `(get-value <connector>)` 返回连接器当前的值
* `(set-value! <connector> <new-value> <information>)` 通知说, 消息源要求连接器将其设置为一个新值
* `(forget-value! <connector> <retractor>)` 通知说, 撤销源要求连接器忘记其值
* `(conect <connector> <new-constraint>)` 通知连接器参与一个新约束  

连接器通过过程`inform-about-value`与各个相关约束通信, 这一过程告知给定的约束, 现在连接器有了一个新值. 过程`inform-about-no-value`告知有关的约束, 现在连接器丧失了原有的值.  

下面实现加法约束:  
```lisp
(define (adder a1 a2 sum)
	(define (process-new-value)
		(cond ((and (has-value? a1) (has-value? a2))
			   (set-value! sum
				           (+ (get-value a1) (get-value a2))
						   me))
			  ((and (has-value? a1) (has-value? sum))
			   (set-value! a2
				           (- (get-value sum) (get-value a1))
						   me))
			  ((and (has-value? a2) (has-value? sum))
			   (set-value! a1
				           (- (get-value sum) (get-value a2))
						   me))))
	
	(define (process-forget-value)
		(forget-value! sum me)
		(forget-value! a1 me)
		(forget-value! a2 me)
		(process-new-value))
		
	(define (me request)
		(cond ((eq? request 'I-have-a-value)
			   (process-new-value))
			  ((eq? request 'I-lost-my-value)
			   (process-forget-value))
			  (else
				  (error "Unknown request -- ADDER " request))))
	(connect a1 me)
	(connect a2 me)
	(connect sum me)
	me)
```

语法界面:  

```lisp
(define (inform-about-value constraint)
	(constraint 'I-have-a-value))
	
(define (inform-about-no-value constraint)
	(constraint 'I-lost-my-value))
```

实现乘法约束:  

```lisp
(define (multiplier m1 m2 product)
	(define (process-new-value)
		(cond ((or (and (has-value? m1) (= (get-value m1) 0))
		           (and (has-value? m2) (= (get-value m2) 0)))
			   (set-value! product 0 me))
			  ((and (has-value? m1) (has-value? m2))
			   (set-value! product
			               (* (get-value m1) (get-value m2))
						   me))
			  ((and (has-value? product) (has-value? m1))
			   (set-value! m2
			               (/ (get-value product) (get-value m1))
						   me))
			  ((and (has-value? product) (has-value? m2))
			   (set-value! m1
			               (/ (get-value product) (get-value m2))
						   me))))
						   
	(define (process-forget-value)
		(forget-value! product me)
		(forget-value! m1 me)
		(forget-value! m2 me)
		(process-new-value))
	
	(define (me request)
		(cond ((eq? request 'I-have-a-value)
			   (process-new-value))
			  ((eq? request 'I-lost-my-value)
			   (process-forget-value))
			  (else
				  (error "Unknow request -- MULTIPLIER" request))))
	(connect m1 me)
	(connect m2 me)
	(connect product me)
	me)
```

实现`constant`  
```lisp
(define (constant value connector)
	(define (me request)
		(error "Unknown request -- CONSTANT" request))
	(connect connector me)
	(set-value! connector value me)
	me)
```  

最后是`probe`的实现  

```lisp
(define (probe name connector)
	(define (print-probe value)
		(newline)
		(display "Probe: ")
		(display name)
		(display " = ")
		(display value))
	(define (process-new-value)
		(print-probe (get-value connector)))
	(define (process-forget-value)
		(print-probe "?"))
	(define (me request)
		(cond ((eq? request 'I-have-a-value)
			   (process-new-value))
			  ((eq? request 'I-lost-my-value)
			   (process-forget-value))
			  (else
				  (error "Unknown request -- PROBE" request))))
	(connect connector me)
	me)
```
#### 连接器的表示
连接器用带有局部状态变量`value`, `informant`和`constraints`的过程对象表示, `value`中保存这个连接器的当前值, `informant`是设置连接器值的对象, `constraints`是这一连接器所涉及的所有约束的表.  

```lisp
(define (make-connector)
	(let ((value false)
		  (informant false)
		  (constrints '()))
	(define (set-my-value newval setter)
		(cond ((not (has-value? me))
			   (set! value newval)
			   (set! informant setter)
			   (for-each-except setter
				                inform-about-value
								constraints))
			  ((not (= value newval))
			   (error "Constradiction" (list value newval)))
			  (else 'ignored)))
	(define (forget-my-value retracotr)
		(if (eq? retracotr informaant)
			(begin (set! informant false)
				   (for-each-except retractor
				                    inform-about-no-value
									constraints))
			'ignored))
	(define (connect new-constraint)
		(if (not (memq new-constraint constraints))
			(set! constraints
			      (cons new-constraint constraints)))
	    (if (has-value? me)
			(inform-about-value new-constraint))
		'done)
	(define (me request)
		(cond ((eq? request 'has-value?)
               (if informant true false))
			  ((eq? request 'value) value)
			  ((eq? request 'set-value) set-my-value)
			  ((eq? request 'forget) forget-my-value)
			  ((eq? request 'connect) connect)
			  (else
				  (error "Unknow operation --CONNECTOR" request))))
	me))
	
	
(define (for-each-except exception procedure list)
	(define (loop items)
		(cond ((null? items) 'done)
			  ((eq? (car items) exception)
			   (loop (cdr items)))
			  (else (procedure (car items))
				    (loop (cdr items)))))
	(loop list))
	
(define (has-value? connector)
	(connector 'has-value?))
	
(define (get-value connector)
	(connector 'value))
	
(define (set-value! connector new-value informant)
	((connector 'set-value!) new-value informant))

(define (forget-value! connector retractor)
	((connecotr 'forget) retracotr))
	
(define (connect connecotr new-constraint)
	((connector 'connect) new-constraint))
```
#### 练习3.33

#### 练习3.34

#### 练习3.35

#### 练习3.36

#### 练习3.37
	

[1]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_16.png?raw=true "图3-16"
[2]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_17.png?raw=true "图3-17"
[3]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_19.png?raw=true "图3-19"
[4]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_20.png?raw=true "图3-20"
[5]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_21.png?raw=true "图3-21"
[6]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_22.png?raw=true "图3-22"
[7]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_23.png?raw=true "图3-23"
[8]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_24.png?raw=true "图3-24"
[9]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_25.png?raw=true "图3-25"
[10]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_26.png?raw=true "图3-26"
[11]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_E_3_29.png?raw=true "使用反门和与门构造或门"
[12]: https://github.com/fiyc/StaticResource/blob/master/SICP_P_3_28.png?raw=true "图3-28"
	

