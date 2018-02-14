---
title: SICP - 带有通用性操作的系统
date: 2018-02-13 23:27:31
tags:
	- SICP
categories:
	- 阅读笔记
---

>在前一节里, 我们看到了如何去设计一个系统, 使其中的数据对象可以以多于一种方式表示. 这里的关键思想就是通过通用型界面过程, 将描述数据操作的代码连接到几种不同表示上. 现在我们要使用数据导向技术构造起一个算术运算包, 将前面已经构造出的所有算术包都结合进去.  

<!-- more -->

n下图展示了我们将要构造的系统的结构.  

![图2-23][1]

### 2.5.1 通用型算术运算
设计通用型算术运算的工作类似于设计通用型复数运算. 我们希望有一个通用型的加法过程`add`, 对于常规的数, 它的行为就像常规的基本加法`+`; 对于有理数, 它就像`add-rat`, 对于复数就像`add-complex`.  

通用型算术过程的定义如下:  

```lisp
(define (add x y) (apply-generic 'add x y))

(define (sub x y) (apply-generic 'sub x y))

(define (mul x y) (apply-generic 'mul x y))

(define (div x y) (apply-generic 'div x y))
```  

下面我们将从安装处理`常规数`的包开始, 对这种数采用的标志是符号`scheme-number`  
代码 [SICP/code/demos/install-scheme-number-package.scm](#)  

Scheme数值包的用户可以通过下面的过程, 创建带标p志的常规数:  
```lisp
(define (make-scheme-number n)
	((get 'make 'scheme-number) n))
```

下面是一个执行有理数算术的程序包.  
代码 [SICP/code/demos/install-rational-package.scm](#)  

同样的, 我们可以安装上另一个处理复数的类似程序包, 采用的标志是`complex`  
代码 [SICP/code/demos/install-complex-package.scm](#)  

#### 练习2.77
已将对应的选择过程加入 [SICP/code/demos/install-complex-package.scm](#)  
通用型选择函数实现如下:  
```lisp
(define (real-part z) (apply-generic 'real-part z))
(define (imag-part z) (apply-generic 'imag-part z))
(define (magnitude z) (apply-generic 'magnitude z))
(define (angle z) (apply-generic 'angle z))
```

#### 练习2.78
代码 [SICP/code/exercises/0089_2_78.scm](#)  

#### 练习2.79
这个练习就直接在demo中的各个算术包中加入对应的过程了  

#### 练习2.80
与上面的练习一样， 直接写在demo里了  

### 2.5.2 不同类型数据的组合
我们至今还没有考虑过这样一个问题: 定义出能够跨类型的操作, 比如完成一个复数和一个常规数的加法.  

处理跨类型操作的一种方式是为每一种类型组合的合法运算设计一个特定过程. 例如, 我们可以扩充复数包, 使它能够提供一个过程用于加起一个复数和一个常规的数, 并用标志`(complex scheme-number)`将它安装到表格里.  

```lisp
(define (add-complex-to-schemenum z x)
	(make-from-real-imag (+ (real-part z) x)
	                     (imag-part z)))

(put 'add '(complex scheme-number)
	(lambda (z x) (tag (add-complex-to-schemenum z x))))
```  

上面提到的技术确实可以用, 但是非常麻烦. 对于这样的一个系统, 引进一个新类型的代价就是不仅仅需要构造出针对这一类型的所有过程的包, 还需要构造并安装好素有实现跨类操作的过程.  

#### 强制
我们常常可以利用潜藏唉类型系统之中的一些额外结构, 将事情做得更好. 不同的数据类型通常都不是完全相互无关的, 常常存在一些方式, 使我们可以把一种类型的对象看过另一种类型的对象. 这种过程就称为`强制`. 比如现在需要做常规数与复数的混合算术, 我们就可以将常规数值看成是虚部为0的复数, 这样就把问题转换为两个复数的运算问题.  

下面是一个典型的强制过程, 它将给定的常规数值转换为一个复数, 其中的实部为原来的数而虚部是0:  

```lisp
(define (scheme-number->complex n)
	(make-complex-from-real-imag (contents n) 0))
```  

我们将这些强制过程安装到一个特殊的强制表格中, 用两个类型的名字作为索引:  
`(put-coercion 'scheme-number 'complex scheme-number->complex)`  

这里假定了存在着用于操作这个表格的`put-coercion`和`get-coercion`过程. 一般而言, 这一表格里的某些格子是空的, 因为将任何数据对象转换到另一个类型并不是都能做的.  

一旦将上述转换表格装配好, 我们就可以修改2.4.3节的`apply-generic`过程, 得到一个处理强制的统一方法. 在要求应用一个操作时, 我们将首先检查是否存在针对实际参数类型的操作定义, 就像前面一样. 如果存在, 那么就将任务分配到由`操作 - 类型`表格中找出的相应过程去, 否则就去做强制.  

这里的强制只考虑两个参数的情况, 我们检查强制表格, 查看其中第一个参数类型的对象能否转换到第二个参数. 如果可以, 那就对第一个参数做强制后再执行操作; 如果第一个参数类型的对象不能强制到第二个类型, 那么就看看能否从第二个参数的类型转换到第一个参数的类型.下面是这个过程:  

```lisp
(define (apply-generic op . args)
	(let ((type-tags (map type-tag args)))
		 (let ((proc (get op type-tags))
			  (if proc
				  (apply proc (map contents args))
				  (if (= (length args) 2)
					  (let ((type1 (car type-tags))
						    (type2 (cadr type-tags))
							(a1 (car args))
							(a2 (cadr args)))
						   (let ((t1->t2 (get-coercion type1 type2))
							     (t2->t1 (get-coercion type2 type1)))
							    (cond (t1->t2
									    (apply-generic op (t1->t2 a1) a2))
									  (t2->t1
									    (apply-generic op a1 (t2->t1 a2)))
									  (else
										  (error "No method for these types"
											  (list op type-tags))))))
					  (error "No method for these types"
						  (list op type-tags)))))))
```  

与显示定义的跨类型操作相比, 这种强制模式有许多优越性. 我们只需要为每一对类型写一个过程, 而不是为每对类型和每个通用型操作写一个过程.  

在另一方面, 也可能存在一些应用, 对于他们而言我们的强制模式还不足够一般. 即时需要运算的两种类型的对象都不能转换到另一种类型, 也完全可能在将这两种类型的对象都转换到第三种类型后执行这一运算. 为了处理这种复杂性, 同时又能维持我们系统的模块性, 通常就需要在建立系统时利用类型之间的进一步结构, 有关情况见下面的讨论.  

#### 类型的层次结构
上面给出的强制模式, 依赖于一对对类型之间存在着某种自然的关系. 在实际中, 还常常存在着不同类型相互关系的更"全局性"的结构. 例如我们想要构造出一个通用型的算术系统, 处理整数, 有理数, 实数, 复数. 在这样的一个系统里, 一种很自然的做法是把整数看作是一类特殊的有理数, 而有理数又是一类特殊的实数, 实数转而又是一类特殊的复数, 这样我们实际就有了一个所谓的`类型的层次结构`. 其中, 整数是有理数的`子类型`, 有理数是整数的一个`超类型`.如下图:  


![图2-25][2]

塔类型有以下这么几个优点:  

* 在将一个新类型加入层次结构的问题就可以极大地简化. 我们只需要刻画清楚这一新类型将如何嵌入正好位于它之上的超类型, 以及它如何作为下面一个类型的超类型.

* 它使我们很容易实现一种概念: 每个类型能够"继承"其超类型中定义的所有操作.

* 它使我们有一种简单的方式去"下降"一个数据对象, 使之达到最简单的表示形式.

#### 层次结构的不足
如果在一个系统里, 有关的数据类型可以自然地安排为一个塔形, 那么正如在前面已经看到的, 处理不同类型上通用型操作的问题将能得到极大的简化. 遗憾的是, 类型之间关系可能存在一种更复杂的情况, 如下图.  

![图2-26](https://github.com/fiyc/StaticResource/blob/master/SICP_P_2_26.png?raw=true)  

当我们需要将一个操作应用于一个对象时, 为此而找出"正确"超类型的工作可能涉及到对整个类型网络的大范围搜索. 在设计大型系统时, 处理好一大批有关的类型而同时又能保持模块性, 这是一个非常困难的问题, 也是当前正在继续研究的一个领域.  

#### 练习2.81


#### 练习2.82

#### 练习2.83
代码 [SICP/code/exercises/0090_2_83.scm](#)   

#### 练习2.84
代码 [SICP/code/exercises/0091_2_84.scm](#)   

#### 练习2.85

#### 练习2.86

### 2.5.3 实例: 符号代数
一般来说, 一个代数表达式可以看成一种具有层次结构的东西, 它是将运算符作用于一些运算对象而形成的一棵树.  

我们可以从一集基本对象, 例如常量和变量出发, 通过各种代数运算符如加法和乘法的组合, 构造起各种各样的代数表达式.  

#### 多项式算术

#### 项表的表示

#### 练习2.87

#### 练习2.88

#### 练习2.89

#### 练习2.90

#### 练习2.91

#### 符号代数中类型的层次结构

#### 练习2.92

#### 扩展练习: 有理函数

#### 练习2.93

#### 练习2.94

#### 练习2.95

#### 练习2.96

#### 练习2.97



[1]: https://thumbnail10.baidupcs.com/thumbnail/666e4e1540a39522c8cb6a5fb5a646b9?fid=657587317-250528-59949746673506&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-gjCakaf2SbMsvpJ2tRTy%2B0wvmKc%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "图2-23"
[2]: https://thumbnail10.baidupcs.com/thumbnail/065adf86021e1bf95cc7cc30ede60502?fid=657587317-250528-126029435197510&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-gcpNQvzWmov5%2BErzM%2Fq%2BIJyEWEo%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "图2-25"
