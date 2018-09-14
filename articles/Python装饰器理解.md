---
title: Python装饰器理解 
name: python-derator
date: 2018-09-14 11:22
---

# Python 装饰器理解

python装饰器, 本质上就是一个高阶函数的应用. 即把需要装饰的函数作为参数传入, 之后高阶函数返回一个新的函数, 在这个新的函数中调用入参函数, 同时做一定的处理.  

### 一个基本的装饰器
下面是一个基本的装饰器例子
```
def derator(func):
	def newFunc():
		print("before func action.")
		func()
		print("after func action")
		
	return newFunc

@derator
def func():
	print("func action..")
	
func()
```

调试上面代码可以知道, 实际上最后执行的`func`就是`newFunc`

### 装饰函数带参数
下面是一个装饰器带参数的例子
```
def deratorWithArgs(f1, f2):
    def inner(func):
        def wrapper():
            result = func(f1, f2)
            return result

        return wrapper
    return inner

@deratorWithArgs(1, 2)
def func2(f1, f2):
    print(f1 + f2)

func2()
```

如果在上面的代码之后调用 `func2(1, 3)` 会出现报错信息  
> TypeError: wrapper() takes 0 positional arguments but 2 were given

从这里可以看出, 我们执行`func2`的时候实际是去执行了`wrapper`, 由于`wrapper`没有参数, 所以这里报错了.  

现在来分析一下带参数的装饰器，当装饰器带参数时, 这里是使用了函数`deratorWithArgs(f1, f2)`的返回函数来作为装饰器， 也就是第一个例子中的`derator`. 现在换一种写法来实现带参数的装饰器.

```
deratorWithArgs2 = deratorWithArgs(1, 2)

@deratorWithArgs2
def func3(f1, f2):
    print(f1 + f2)


func3()
```
上面的代码最后会打印出`3`