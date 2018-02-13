---
title: SICP - 符号数据
date: 2018-02-13 23:24:44
tags:
	- SICP
categories:
	- 阅读笔记
---

> 到目前为止, 我们已经使用过所有复合数据, 最终都是从数据出发构造起来的. 在这一节里, 我们要扩充所用语言的表述能力, 引进将任意符号作为数据的功能.

<!-- more -->

### 2.3.1 引号
如果我们能够构造出采用符号的复合数据, 我们就可以有下面这类的表  
`(a b c d)`
`(23 45 17)`
`((Norah 12) (Molly 9) (Anna 7) (Lauren 6) (Charlotte 4))`  

为了能够操作这些符号, 我们的语言里就需要有一种新元素: 为数据对象加 *引号* 的能力.如下面的例子:  
```lisp
(define a 1)

(define b 2)

(list a b)
(1 2)

(list 'a 'b)
(a b)

(list 'a b)
(a 2)

```
引号也可以用于复合对象, 其中采用的是表的方便的输出表示是方式:  

```lisp
(car '(a b c))
a

(cdr '(a b c))
(b c)
```

为了能对符号做各种操作, 我们还需要用另一个基本过程**eq?**，这个过程以两个符号作为参数, 检查他们是否为同样的符号.  
下面的例子利用eq?实现一个过程, 以一个符号和一个表作为参数, 返回这个符号是否在表中  

```lisp
(define (memq item x)
	(cond ((null? x) false)
	      ((eq? item (car x)) x)
		  (else (memq item (cdr x)))))
		  
(memq 'apple '(pear banana prune))
false

(memq 'apple '(x (apple sauce) y apple pear))
(apple pear)
```
代码 [SICP/code/demos/memq.scm](#)

#### 练习2.53
代码 [SICP/code/exercises/0074_2_53.scm](#)

#### 练习2.54
代码 [SICP/code/exercises/0075_2_54.scm](#)

#### 练习2.55
根据注释100上面说的, `(quote a)可以替代’a, 引号只不过是一种将下一完整表达式用(quote <expression>)形式包裹起来的单字符缩写形式`, 因此`（car ''abracadabra）`等同于`（car ‘（quote abracadabra））`

### 2.3.2 实例: 符号求导
为了阐释符号操作的情况, 并进一步阐释数据抽象的思想, 现在考虑设计一个执行代数表达式的符号求导的过程.

#### 对抽象数据的求导程序
首先让我们假定现在已经有了一些过程, 他们实现了下述的构造函数、选择函数和谓词  
```lisp
(variable? e) ;e是变量吗
(same-variable? v1 v2) ;v1和v2是同一个变量吗
(sum? e) ;e是和式吗
(added e) ;e的被加数
(augend e) ;e的加数
(make-sum a1 a2) ;构造器a1 和a2 的和式
(product? e) ;e是乘式吗
(multiplier e) ;e的被乘数
(multiplicand e) ;e的乘数
(make-product m1 m2） ;构造器m1 与m2的乘式
(number? e) ;是否数值
```

以下是各种求导规则的过程
```lisp
(define (deriv exp var)
	(cond ((number? exp) 0)
		  ((variable? exp)
			  (if (same-variable? exp var) 1 0))
		  ((sum? exp)
			  (make-sum (deriv (addend exp) var)
			            (deriv (augend exp) var)))
		  ((product? exp)
			  (make-sum (make-product (multiplier exp)
			                          (deriv (multiplicand exp) var))
			            (make-product (deriv (multiplier exp) var)
						              (multiplicand exp))))
		  (else (error "unknown expression type -- DERIV" exp))))
```
#### 代数表达式的表示
实现上面提到的构造函数、选择函数和谓词  

* 变量就是符号, 可以用基本谓词*symbol?*  
`(define (variable? x) (symbol? x))`  

* 两个变量相同就是他们的符号相互*eq?*  
```lisp
(define (same-variable? v1 v2)
	(and (variable? v1) (variable? v2) (eq? v1 v2)))
```  

* 和式与乘式都构造为表  
`(define (make-sum a1 a2) (list '+ a1 a2))`  
`(define (make-product m1 m2) (list '* m1 m2))`  

* 和式就是第一个元素为符号+的表  
```lisp
(define (sum? x)
	(and (pair? x) (eq? (car x) '+)))
```  

* 被加数是表示和式的表里的第二个元素  
`(define (addend s) (cadr s))`  

* 加数是表示和式的表里的第三个元素  
`(define (augend s) (caddr s))`  

* 乘式就是第一个元素为符号*的表  
```lisp
(define (product? x)
	(and (pair? x) (eq? (car x) '*)))
```  

* 被乘数是表示乘式的表里的第二个元素  
`(define (multiplier p) (cadr p))`  

* 乘数是表示乘式的表里的第三个元素  
`(define (multiplicand p) (caddr p))`  

以上代码 [SICP/code/demos/deriv.scm](#)  

修改生成和式与生成乘式的过程, 将结果化简到最简单的形式  

```lisp 
(define (=number? exp num)
	(and (number? exp) (= exp num)))

(define (make-sum a1 a2)
	(cond ((=number? a1 0) a2)
	      ((=number? a2 0) a1)
		  ((and (number? a1) (number? a2)) (+ a1 a2))
		  (else (list '+ a1 a2))))
		  
(define (make-product m1 m2)
	(cond ((or (=number? m1 0) (=number? m2 0)) 0)
	      ((=number? m1 1) m2)
		  ((=number? m2 1) m1)
		  ((and (number? m1) (number? m2)) (* m1 m2))
		  (else (list '* m1 m2))))
```








#### 练习2.56
代码 [SICP/code/exercises/0076_2_56.scm](#)

#### 练习2.57
代码 [SICP/code/exercises/0077_2_57.scm](#)

#### 练习2.58

### 2.3.3 实例: 集合的表示
一个集合就是一些不同对象的汇集. 要给出一个更精确的定义, 我们可以利用数据抽象的方法, 也就是说, 用一组可以作用于"集合"的操作来定义他们.如下:  

* union-set 计算出两个集合的并集
* intersection-set 计算出两个集合的交集
* element-of-set? 确定某个给定元素是不是某个给定集合的成员  
* adjoin-set 将一个对象加入到集合中, 返回新的集合

#### 集合作为未排序的表
集合的一种表示方式是用一个任何元素都出现不超过一次的表来表示.  
对于这种表示方式, `element-of-set?`类似于2.3.1节的过程 `memq`, 但它应该用`equal?` 而不是`eq?`, 以保证集合元素可以不是符号  
```lisp
(define (element-of-set? x set)
	(cond ((null? set) false)
		  ((equal? x (car set)) true)
		  (else (element-of-set x (cdr set)))))
```

利用上面的过程, 我们可以很简单的实现`adjoin-set`过程, 如果要加入的对象已经在相应集合里, 返回当前集合, 否则将用`cons`过程操作对象与集合  
```lisp
(define (adjoin-set x set)
	(if (element-of-set? x set)
		set
		(cons x set))
```

实现`intersection-set`可以采用递归策略: 将`set1` 与 `set2` 的交集问题, 分解为 `(cdr set1)`与`set2`的交集, 再判断`(car set1)`是否存在于`set2`, 以此来判断是否将其加入最后的交集中.  
```lisp
(define (intersection-set set1 set2)
	(cond ((or (null? set1) (null? set2)) ())
		  ((element-of-set? (car set1) set2)
			  (cons (car set1) 
			        (intersection-set (cdr set1) set2)))
		  (else (intersection-set (cdr set1) set2))))
```

#### 练习2.59
代码 [SICP/code/exercises/0078_2_59.scm](#)

#### 练习2.60
代码 [SICP/code/exercises/0079_2_60.scm](#)

#### 集合作为排序的表
加速集合操作的一种方式是改变表示方式, 使集合元素在表中按照上升序排列, 这里我们只考虑集合元素是树脂的情况.  
在这种情况下, 我们重写`element-of-set?`以及`intersection-set`来观察一下他们的效率提升  
```lisp
(define (element-of-set? x set)
	(cond ((null? set) false)
		  ((< x (car set)) false)
		  ((= x (car set)) true)
		  (else (element-of-set? x (cdr set)))))
		  
(define (intersection-set set1 set2)
	(if (or (null? set1) (null? set2))
		()
		(let ((x1 (car set1)) (x2 (car set2)))
		     (cond ((= x1 x2)
			          (cons x1
					        (intersection-set (cdr set1)
							                  (cdr set2))))
				   ((< x1 x2)
					   (intersection-set (cdr set1) set2))
				   ((> x1 x2)
					   (intersection-set set1 (cdr set2)))))))
```
#### 练习2.61
代码 [SICP/code/exercises/0080_2_61.scm](#)

#### 练习2.62
代码 [SICP/code/exercises/0081_2_62.scm](#)

#### 集合作为二叉树
如果将集合元素安排成一棵树的形式, 我们还可以得到比排序表表示更好的结果.   
* 树中每个节点保存集合中的一个元素, 称为该节点的`数据项`, 它还链接到另外的两个结点.  
* 左边的链接指向的所有元素小于本节点元素
* 右边的链接指向的所有元素大于本节点元素

数表示方法的优点在于, 假的我们希望检查某个数x是否在一个集合里, 那么就可以用x与树顶结点的数据项相比较。  
* 如果x小于它, 我们就知道现在只需要搜索左子树
* 如果x大于它, 那么就只需搜索右子树

如果该树是平衡的, 那么我们可以期望搜索规模为n的树的计算步数以`O(log n)`速度增长.  

我们可以用表来表示树, 将结点表示为三个元素的表: 本结点的数据项, 左子树和右子树.  

```lisp
(define (entry tree) (car tree))

(define (left-branch tree) (cadr tree))

(define (right-branch tree) (caddr tree))

(define (make-tree entry left right)
	(list entry left right))
```

现在, 我们就可以采用上面描述的方式实现过程`element-of-set?`了:  
```lisp
(define (element-of-set? x set)
	(cond ((null? set) false)
		  ((= x (entry set)) true)
		  ((< x (entry set))
			  (element-of-set? x (left-branch set)))
		  (else
			  (element-of-set? x (right-branch set)))))
```

实现`adjoin-set`  
```lisp
(define (adjoin-set x set)
	(cond ((null? set) (make-tree x () ()))
		  ((= x (entry set)) set)
		  ((< x (entry set))
			  (make-tree (entry set)
		                 (adjoin-set x (left-branch set))
						 (right-branch set)))
		  (else 
			  (make-tree (entry set)
				         (left-branch set)
						 (adjoin-set x (right-branch set))))))
```

#### 练习2.63
代码 [SICP/code/exercises/0082_2_63.scm](#)

#### 练习2.64
代码 [SICP/code/exercises/0083_2_64.scm](#)

#### 练习2.65

#### 集合与信息检索
在处理大量独立记录的数据时, 我们可以考虑将每个记录中的一部分当做标识`key(键值)`, 所用键值可以是任何能唯一标识记录的东西. 我们用一个过程`lookup`, 它以一个键值和一个数据库为参数, 返回具有这个键值的记录, 或者在找不到相应记录时报告失败. 如果记录的集合被表示为未排序的表, 我们就可以用:  
```lisp
(define (lookup given-key set-of-records)
	(cond ((null? set-of-records) false)
		  ((equal? given-key (key (car set-of-records)))
			  (car set-of-records))
		  (else (lookup given-key (cdr set-of-records)))))
```
#### 练习2.66
代码 [SICP/code/exercises/0084_2_66.scm](#)

### 2.3.4 实例: Huffman编码树

#### 生成Huffman树
本节将给出一个实际使用表结构和数据抽象去操作集合与树的例子. 这一应用是想确定一些用0和1的序列表示数据的方法. 举例来说, 用于在计算机里表示文本的`ASCII`标准编码将每个字符表示为一个包含7个二进制位的序列, 采用7个二进制位能够区分`2^7`中不同的情况, 即128个可能不同的字符. 一般而言, 如果我们需要区分n个不同字符, 那么就需要为每个字符使用`log2 n`个二进制位.  
假设我们所有信息都是用`A, B, C, D, E, F, G, H`这样8个字符构成, 那么久可以选择每个字符用3个二进制位  

| 字符| A| B| C| D| E| F| G|H |
---|---|---|---|---|---|---|---|---
| 二进制位 | 000 | 001 | 010 | 011 | 100 | 101 | 110 | 111  |


采用这种编码方式, 消息:  
`BACADAEAFABBAAAGAH`  
将编码为54个二进制位  
`001000010000011000100000101000001001000000000110000111`  

像ASCII码和上面A到H编码这样的编码方式称为`定长编码`, 因为它们采用同样数目的二进制位表示消息中的每一个字符.  
`变长编码`方式就是用不同数目的二进制位表示不同的字符.例如莫尔斯电报码.一般而言, 如果在我们的消息里, 某些符号出现得很频繁, 而另一些却很少见, 那么如果为这些频繁出现的字符指定较短的码字, 我们就可能更有效地完成数据的编码.  

采用变长编码有一个困难, 那就是在读0/1序列的过程中确定何时到达了一个字符的结束. 莫尔斯码解决这一问题的方式是在每个字母的点划序列之后用搞一个特殊的分隔符. 另一种解决方式是以某种方式设计编码, 使得其中每个字符的完整编码都是另一个字符编码的开始一段. 这样的编码称为`前缀码`.  

一般而言, 如果能够通过变长前缀去利用被编码消息中符号出现的相对频度, 那么就能明显地节约空间. 完成这件事情的一种特定方式称为`Huffman编码`.  

一个Huffman编码可以标识为一棵二叉树, 其中的树叶是被编码的符号, 树中每个非叶节点代表一个集合, 其中包含了这一节点之下所有树叶的符号. 除此之外, 位于树叶的每个符号还被赋予一个权重, 非叶及诶单所包含的权重是位于它之下的所有叶节点的权重之和.  

给定了一棵Huffman树, 要找到任一符号的编码, 我们只需要从树根开始向下运动, 直到到达了保存着这一符号的树叶为止, 在每次向左行时就给代码加上一个0, 右行时加上一个1.  

在用Huffman树做一个序列的解码时, 我们也从树根开始, 通过为序列中的0或1确定移动方向, 每当我们到达一个叶节点时, 就生成了消息中的一个符号.  

#### 生成Huffman树
生成Huffman树的算法实际上十分简单, 其想法就是设法安排这棵树, 使得那些带有最低频度的符号出现在离树根最远的地方.  

这一构造过程总叶节点的集合开始, 找出两个具有最低权重的叶, 并归并他们, 产生出一个以这两个结点为左右分支的节点, 新节点的权重就是那两个结点的权重之和. 然后删除集合中之前的两个叶节点, 用新构造的结点代替他们. 循环次操作, 直到树根.

#### Huffman树的表示
接下来我们将要做出一个使用Huffman树完成消息编码和解码, 并能根据上面给出的梗概生成Huffman树的系统.  

首先是这种树的表示, 将一棵树的树叶表示为`包含符号leaf`, `叶中符号`, `权重`构成的表  
```lisp
(define (make-leaf symbol weight)
	(list 'leaf symbol weight))
	
(define (leaf? object)
	(eq? (car object) 'leaf))

(define (symbol-leaf x) (cadr x))

(define (weight-leaf x) (caddr x))
```

一棵一般的树也是一个表, 包含`左分支`, `右分支`, `符号集合`, `权重`  
```lisp
(define (make-code-tree left right)
	(list left
		  right
		  (append (symbols left) (symbols right))
		  (+ (weight left) (weight right))))
		  
(define (left-branch tree) (car tree))

(define (right-branch tree) (cadr tree))

(define (symbols tree)
	(if (leaf? tree)
		(list (symbol-leaf tree))
		(caddr tree)))
		
(define (weight tree)
	(if (leaf? tree)
		(weight-leaf tree)
		(cadddr tree)))
```
#### 解码过程
下面的过程实现解码算法, 它以一个0/1的表和一棵Huffman树为参数:  

```lisp
(define (decode bits tree)
	(define (decode-1 bits current-branch)
		(if (null? bits)
			'()
			(let ((next-branch
				  (choose-branch (car bits) current-branch)))
				 (if (leaf? next-branch)
					 (cons (symbol-leaf next-branch)
						   (decode-1 (cdr bits) tree))
					 (decode-1 (cdr bits) next-branch)))))
	(decode-1 bits tree))
	
(define (choose-branch bit branch)
	(cond ((= bit 0) (left-branch branch))
		  ((= bit 1) (right-branch branch))
		  (else (error "bat bit -- CHOOSE-BRANCE" bit))))
```

#### 带权重元素的集合
在树表示里, 每个非叶结点包含着一个符号集合, 在这里表示为一个简单的表. 然后, 上面讨论的树生成算法要求我们也能对树叶和树的集合工作, 以便不断地归并一对一对的最小项.  

我们准备将树叶和树的集合表示为一批元素的表, 按照权重的上升顺序排列表中的元素. 下面是用于构造集合的过程adjoin-set.  

```lisp
(define (adjoin-set x set)
	(cond ((null? set) (list x))
		  ((< (weight x) (weight (car set))) (cons x set))
		  (else (cons (car set)
			          (adjoin-set x (cdr set))))))
```  

下面过程以一个符号-权重对偶的表为参数, 例如`((A 4) (B 2) (C 1) (D 1) )`, 它构造出树叶的初始排序集合, 以便Huffman算法能够去做归并:  

```lisp
(define (make-leaf-set pairs)
	(if (null? pairs)
		'()
		(let ((pair (car pairs)))
			 (adjoin-set (make-leaf (car pair)
				                    (cadr pair))
				         (make-leaf-set (car pairs))))))
```


以上关于Huffman树的过程代码: [SICP/code/demos/huffman.scm](#)

#### 练习2.67
代码 [SICP/code/exercises/0085_2_67.scm](#)

#### 练习2.68
代码 [SICP/code/exercises/0086_2_68.scm](#)

#### 练习2.69
代码 [SICP/code/exercises/0087_2_69.scm](#)

#### 练习2.70

#### 练习2.71

#### 练习2.72

