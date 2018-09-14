---
title: SICP - 层次性数据和闭包性质
date: 2018-02-13 23:23:22
tags:
	- SICP
categories:
	- 编程范式
---

> 我们可以建立元素本身也是序对的序对, 这就是表结构得以作为一种表示工具的根本基础. 我们将这种能力成为cons的闭包性质. 一般说, 某种组合数据对象的操作满足闭包性质, 那就是说, 通过它组合起数据对象得到的结果本身还可以通过同样的操作再进行组合.  

<!-- more -->
### 2.2.1 序列的表示  
序列是利用序对构造出的一种结构, 可以理解为一个序对, 他的第一位是一个数据对象, 第二位是一个序对, 这个序对同样第一位是一个数据对象, 第二位是一个序对, 依次可以实现一批数据对象的一种有序汇集.  

直接使用cons来表示一个序列  
```lisp
(cons 1
	(cons 2
		(cons 3
			(cons 4 nil))))
```  
为了方便构造, Scheme提供了一个基本操作**list**.  

```lisp
(list <a1> <a2> <a3> ... <an>)
```
	
#### 表操作
利用序对将元素的序列表示为表之后, 我们就可以使用常规的程序设计技术, 通过顺序"向下cdr"表的方式完成对表的各种操作了.  

* 获取表的第n个项
```lisp
(define (list-ref items n)
	(if (= n 0)
		(car items)
		(list-ref (cdr items) (- n1))))
		
(define squares (list 1 4 9 25))

(list-ref squares 3)
16
```

* 使用null?判断参数是不是空表
```lisp
(define (length items)
		(if (null? items)
			0
			(+ 1 (length (cdr items)))))
			
(define odds (list 1 3 5 7))

(length odds)
4
```

* 两个表组合成新表
```lisp
(define (append list1 list2)
	(if (null? list1)
		list2
		(cons (car list1) (append (cdr list1) list2))))
```

以上三个过程代码 [/SICP/code/demos/list-actions.scm](#)
#### 练习2.17
代码[/SICP/code/exercises/0045_2_17.scm](#)

#### 练习2.18
代码[/SICP/code/exercises/0046_2_18.scm](#)

#### 练习2.19
代码[/SICP/code/exercises/0047_2_19.scm](#)

#### 练习2.20
代码[/SICP/code/exercises/0048_2_20.scm](#)

#### 对表的映射
一种特别有用的操作是将某种变换应用于一个表的所有元素, 得到所有结果构成的表.  
下面的例子是将一个表里所有元素按给定因子做一次缩放:
```lisp
(define (scale-list items factor)
	(if (null? items)
		nil
		(cons (* (car items) factor)
			  (scale-list (cdr items) factor))))
			  
(scale-list (list 1 2 3 4 5) 10)
(10 20 30 40 50)
```

抽象出这一具有一般性的想法, 得到一个高阶过程*map*
```lisp
(define (map proc items)
	(if (null? items)
		nil
		(cons (proc (car items))
	          (map proc (cdr items)))))
			  
(map abs (list -10 2.5 -11.6 17))
(10 2.5 11.6 17)

(map (lambda (x) (* x x))
	 (list 1 2 3 4))
(1 4 9 16)
```

#### 练习2.21
代码[/SICP/code/exercises/0049_2_21.scm](#)

#### 练习2.22
代码[/SICP/code/exercises/0050_2_22.scm](#)

#### 练习2.23
代码[/SICP/code/exercises/0051_2_23.scm](#)	

### 2.2.2 层次性结构
将表作为序列的标识方式, 可以很自然的推广到标识那些元素本身也是序列的序列.  
例如`（（1 2） 3 4）`下面的方式构造出来:  
`(cons (list 1 2) list 3 4())`  
我们可以把这种结构看作树, 序列里的元素就是树的分支, 而那些本身也是序列的元素就形成了树中的子树.下面的过程可以获取树中树叶的数目:  
```lisp
(define (count-leaves x)
	(cond ((null? x) 0)
		  ((not (pair? x)) 1)
		  (else (+ (count-leaves (car x))
		           (count-leaves (cdr x))))))
```
代码[/SICP/code/demos/count-leaves.scm](#)  

#### 练习2.24
代码[/SICP/code/exercises/0052_2_24.scm](#)

#### 练习2.25
代码[/SICP/code/exercises/0053_2_25.scm](#)

#### 练习2.26
代码[/SICP/code/exercises/0054_2_26.scm](#)

#### 练习2.27
代码[/SICP/code/exercises/0055_2_27.scm](#)

#### 练习2.28
代码[/SICP/code/exercises/0056_2_28.scm](#)

#### 练习2.29
代码[/SICP/code/exercises/0057_2_29.scm](#)

#### 对树的映射
要了解树的映射, 我们先做一个与之前**scale-list**类似的**scale-tree**过程, 保持树的形状, 给树中的每个数值乘以因子
```lisp
(define (scale-tree tree factor)
	(cond ((null? tree) nil)
		  ((not (pair? tree)) (* tree factor))
		  (else (cons (scale-tree (car tree) factor)
		              (scale-tree (cdr tree) factor)))))
					  
(scale-tree (list 1 (list 2 (list 3 4) 5) (list 6 7)) 10)
(10 (20 (30 40) 50) (60 70))
```
使用map来实现上面的*scale-tree*
```lisp
(define (scale-tree tree factor)
	(map (lambda (sub-tree) 
		   (if (pair? sub-tree)
			   (scale-tree sub-tree factor)
			   (* sub-tree factor)))
		tree))
```
#### 练习2.30
代码[/SICP/code/exercises/0058_2_30.scm](#)

#### 练习2.31
代码[/SICP/code/exercises/0059_2_31.scm](#)

#### 练习2.32
代码[/SICP/code/exercises/0060_2_32.scm](#)

### 2.2.3 序列作为一种约定的界面
我们一直强调数据抽象在对复合数据的工作中的作用, 借助这种思想, 我们就能设计出不会被数据表示的细节纠缠的程序, 使程序能够保持很好的弹性, 得以应用到不同的具体表示上. 这一节中, 我们将要介绍与数据结构有关的另一种强有力的设计原理 - *约定的界面*.  

这里列举了2个不同的过程, 尝试归纳他们的共同点  

1. 以一棵树为参数, 计算出那些值为奇数的叶子的平方和
```lisp
(define (sum-odd-squares tree)
	(cond ((null? tree) 0)
		  ((not (pair? tree))
			  (if (odd? tree) (square tree) 0))
		  (else (+ (sum-odd-squares (car tree))
		           (sum-odd-squares (cdr tree))))))
```

2. 所有偶数的菲波那切数**Fib(k)**的一个表, 其中的*k*小于等于某个给定数*n*
```lisp
(define (even-fibs n)
	(define (next k)
		(if (> k n)
			nil
			(let ((f (fib k)))
				(if (even? f)
					(cons f (next (+ k 1)))
					(next (+ k 1))))))
	(next 0))
```

下面揭示出上面两个过程之间的相似性:   
**第一个程序**:  
* 枚举出一颗树的树叶
* 过滤他们, 选出其中的奇数
* 对选出的每一个数求平方
* 用 + 累积起得到的结果, 从0开始

**第二个程序**:  
* 枚举从0到n的整数
* 对每个整数计算相应的斐波那契数
* 过滤他们, 选出其中的偶数
* 用cons累积得到的结果, 从空表开始

这两种过程可以很自然地用流过一些级联的处理步骤的信号的方式描述, 如下:  

`枚举器` -> `过滤器` -> `映射` -> `累积器`

#### 序列操作
要组织好这些程序, 使之能够更清晰地反应上面信号流的结构, 最关键的一点就是讲注意力集中在处理过程中从一个步骤流向下一个步骤的"信号".  

我们可以用2.2.1节的*map*过程实现信号流图中的映射步骤:  
```lisp
(map square (list 1 2 3 4 5))
(1 4 9 16 25)
```

过滤一个序列, 也就是选出其中满足给定谓词的元素, 如下:  
```lisp
(define (filter predicate sequence)
	(cond ((null? sequence) nil)
	      ((predicate (car sequence))
			  (cons (car sequence)
				    (filter predicate (cdr sequence)))
		  (else (filter predicate (cdr sequence)))))
		  
(filter odd? (list 1 2 3 4 5))
()
```

累积工作实现:  
```lisp
(define (accumulate op initial sequence)
	(if (null? sequence)
		initital
		(op (car sequence)
			(accumulate op initial (cdr sequence))))
			
(accumulate + 0 (list 1 2 3 4 5))
15

(accumulate * 1 (list 1 2 3 4 5))
120

(accumulate cons nil (list 1 2 3 4 5))
(1 2 3 4 5)
```

实现有关的信号流图, 枚举出需要处理的数据序列  
```lisp
(define (enumerate-interval low high)
	(if (> low high)
		nil
		(cons low (enumerate-interval (+ low 1) high))))
		
(enumerate-interval 2 7)
(2 3 4 5 6 7)
		
;;枚举出一棵树的所有树叶
(define (enumerate-tree tree)
	(cond ((null? tree) nil)
	      ((not (pair? tree)) (list tree))
		  (else (append (enumerate-tree (car tree))
		                (enumerate-tree (cdr tree))))))
						
(enumerate-tree (list 1 (list 2 (list 3 4)) 5))
(1 2 3 4 5)

```
使用信号流图重新构造sum-odd-squares  
```lisp
(define (sum-odd-squares tree)
	(accumulate +
		        0
				(map square
					 (filter odd?
	                         (enumerate-tree tree)))))
```

重新构造even-fibs  
```lisp
(define (even-fibs n)
	(accumulate cons
		        nil
				(filter even?
					    (map fib
						     (enumerate-interval 0 n)))))
```

距离说明模块化结构的威力, 下面过程构造前n+1个菲波那切数的平方组成的序列
```lisp
(define (list-fib-squares n)
	(accumulate cons
		        nil
				(map square
				     (map lib
					      (enumerate-interval 0 n)))))
```

****

#### 练习2.33
代码[/SICP/code/exercises/0061_2_33.scm](#)

#### 练习2.34
代码[/SICP/code/exercises/0062_2_34.scm](#)


#### 练习2.36
代码[/SICP/code/exercises/0063_2_36.scm](#)


#### 练习2.38
代码[/SICP/code/exercises/0064_2_38.scm](#)

#### 练习2.39
代码[/SICP/code/exercises/0065_2_39.scm](#)

#### 嵌套映射
我们可以扩充序列范型, 将许多通常用嵌套循环表述的计算也包含进来.看下面的问题:  

给定了自然数n, 找出所有不同的有序对i和j, 其中1 <= j < i <= n， 且i + j是素数

```lisp
(accumulate append
            nil
			(map (lambda (i)
			       (map (lambda (j) (list i j))
				        (enumerate-interval 1 (- i 1))))
			     (enumerate-interval 1 n)))
```

由于这类程序常要用到映射, 并用append做累积, 我们将它独立出来定义一个过程

```lisp
(define (flatmap proc seq)
	(accumulate append nil (map proc seq)))
```

判断序对和是否是素数的谓词过程  

```lisp
(define (prime-sum? pair)
	(prime? (+ (car pair) (cadr pair))))
```

#### 练习2.40
代码[/SICP/code/exercises/0066_2_40.scm](#)

#### 练习2.41
代码[/SICP/code/exercises/0067_2_41.scm](#)


### 2.2.4 实例: 一个图形语言
本实例介绍一种用于画图形的简单语言, 以展示数据抽象和闭包的威力, 其中也以一种非常本质的方式使用了高阶过程.

#### 图形语言
在描述一种预言时, 应该讲注意力集中到语言的基本原语、它的组合手段以及它的抽象手段, 这是最重要的.  

这次的图形语言, 它只有一种元素, 成为*画家(painter)*.

**操作**  
* **beside**: 将2个画家组合成一个复合画家, 将第一个画家的图像画在框架的左边, 第二个画家画在右边
* **below**: 将2个画家组合成一个复合画家, 将第一个画家的图像画在框架的下边, 第二个画家画在上边
* **flip-vert**: 从一个画家出发, 将画家所画图形上下颠倒
* **flip-horiz**: 从一个画家出发, 将画家所画图形左右反转

在进行下面的操作前, 我们先通过画家wave来构建2个复杂的画家  
`(define wave2 (beside wave (flip-vert wave)))`  
`(define wave4 (below wave2 wave2))`

在按这种方法构造复杂的图像时, 我们利用了一个事实: 画家在有关语言的组合方式下是封闭的: 两个画家的beside或者below还是画家, 因此还可以用他们作为元素去构造更复杂的画家.  

下面我们将尝试将wave4中的模式抽象出来  
```lisp
(define (flipped-pairs painter)
	(let ((painter2 (beside painter (flip-vert painter))))
	     (below painter2 painter2)))
		 
(define wave4 (flipped-pairs wave))
```

我们也可以定义递归操作, 下面就是这样的操作, 它在图形的右边做分割和分支.  
```lisp
(define (right-split painter n)
	(if (= n 0)
		painter
		(let ((smallter (right-split painter (- n 1))))
		     (beside painter (below smaller smaller)))))
```


#### 练习2.44
代码[/SICP/code/exercises/0068_2_44.scm](#)

#### 高阶操作
除了可以获得组合画家的抽象模式之外, 我们同样可以在高阶上工作, 抽象出画家的各种组合操作的模式. 也就是说, 可以把画家操作看成是操作和描写这些元素的组合方法的元素—— 写出一些过程, 它们以画家操作作为参数, 创建出各种新的画家操作.

#### 练习2.45
代码[/SICP/code/exercises/0069_2_45.scm](#)

#### 框架
一个框架可以用三个向量描述: 一个基准向量和两个角向量.  
基准向量描述的是框架基准点相对于平面上某个绝对基准点的偏移量.  
角向量描述了框架的角相对于框架基准点的偏移量.

#### 练习2.46
代码[/SICP/code/exercises/0071_2_46.scm](#)

#### 练习2.47
代码[/SICP/code/exercises/0072_2_47.scm](#)

#### 画家
一个画家被标识为一个过程, 给了它一个框架作为实际参数, 它就能通过适当的位移和伸缩, 画出一幅与这个框架匹配的图像. 也就是说, 如果p是一个画家而f是一个框架, 通过以f作为实际参数调用p, 就能产生出f中p的图像.

#### 练习2.48
代码[/SICP/code/exercises/0073_2_48.scm](#)

#### 练习2.49
代码[/SICP/code/exercises/0074_2_49.scm](#)

#### 画家的变换和组合

#### 练习2.50

#### 练习2.51

#### 强健设计的语言层次
在上述的图形语言中, 我们演习了前面介绍的有关过程和数据抽象的关键思想. 其中的基本数据抽象和画家都用过程表示实现, 这就使该语言能以一种统一方式去处理各种本质上完全不同的画图能力.  
我们也对程序审计的另一个关键概念有了一点认识, 这就是**分层设计**的问题. 这一概念说的是, 一个复杂的系统应该通过一系列的层次构造出来, 为了描述这些层次, 需要使用一系列的语言. 构造各个层次的方式, 就是设法组合起作为这一层次中部件的各种基本元素, 而这样构造出的部件又可以作为另一层次里的基本元素.

