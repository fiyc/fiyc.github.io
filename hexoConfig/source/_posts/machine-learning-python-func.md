---
title: 机器学习中Python常用函数(不断更新)
date: 2018-02-22 23:18:20
tags:
	- 机器学习
	- Python
categories:
	- 机器学习
---

最近在看《机器学习实战》这本书, 里面用到的一些Python函数可以使我们很方便的做运算. 这里针对我看到的以及最开始不是很清楚的函数做出记录.

<!-- more -->
### shape
获取矩阵的行与列信息 来自库`numpy`
#### 例子
```
>>> e=array([[1,2],[3,4],[5,6]])
e=array([[1,2],[3,4],[5,6]])
>>> e.shape
e.shape
(3, 2)
>>> e.shape[0]
e.shape[0]
3
>>> e.shape[1]
e.shape[1]
2
```



### tile()
这是一个对数据做重复操作的函数, 来自库`numpy`
#### 语法
`tile(A, reps)`

##### 参数说明
* A -- 几乎所有类型都可以：array, list, tuple, dict, matrix以及基本数据类型int, string, float以及bool类型。
* reps -- 可以是tuple，list, dict, array, int, bool.但不可以是float, string, matrix类型。这个值确定了A的重复规则

#### 例子
```
>>> e=array([1,2])
e=array([1,2])
>>> tile(e, 1)
tile(e, 1)
array([1, 2])
>>> tile(e, 2)
tile(e, 2)
array([1, 2, 1, 2])
>>> tile(e, (2, 3))
tile(e, (2, 3))
array([[1, 2, 1, 2, 1, 2],
       [1, 2, 1, 2, 1, 2]])
>>> e = tile(e, (2, 1))
e = tile(e, (2, 1))
>>> e
e
array([[1, 2],
       [1, 2]])
>>> tile(e, (2, 2))
tile(e, (2, 2))
array([[1, 2, 1, 2],
       [1, 2, 1, 2],
       [1, 2, 1, 2],
       [1, 2, 1, 2]])
```


### argsort()
将集合从小到大排序后, 给出对应的索引(index). 来自库`numpy`

#### 例子
```
>>> list = array([5,4,3,2,1])
list = array([5,4,3,2,1])
>>> list.argsort()
list.argsort()
array([4, 3, 2, 1, 0])
>>> list = array([[5,4,3,2,1], [1,2,3,4,5]])
list = array([[5,4,3,2,1], [1,2,3,4,5]])
>>> list.argsort()
list.argsort()
array([[4, 3, 2, 1, 0],
       [0, 1, 2, 3, 4]])
```

### sorted()
对所有可迭代对象进行排序操作, 来自`Python内置函数`

#### 语法
`sorted(iterable[, cmp[, key[, reverse]]])`

##### 参数说明
* iterable -- 可迭代对象
* cmp -- 比较的函数，这个具有两个参数，参数的值都是从可迭代对象中取出，此函数必须遵守的规则为，大于则返回1，小于则返回-1，等于则返回0
* key -- 主要是用来进行比较的元素，只有一个参数，具体的函数的参数就是取自于可迭代对象中，指定可迭代对象中的一个元素来进行排序
* reverse -- 排序规则，reverse = True 降序 ， reverse = False 升序（默认）
#### 例子
```
>>>a = [5,7,6,3,4,1,2]
>>> b = sorted(a)       # 保留原列表
>>> a 
[5, 7, 6, 3, 4, 1, 2]
>>> b
[1, 2, 3, 4, 5, 6, 7]
 
>>> L=[('b',2),('a',1),('c',3),('d',4)]
>>> sorted(L, cmp=lambda x,y:cmp(x[1],y[1]))   # 利用cmp函数
[('a', 1), ('b', 2), ('c', 3), ('d', 4)]
>>> sorted(L, key=lambda x:x[1])               # 利用key
[('a', 1), ('b', 2), ('c', 3), ('d', 4)]
 
 
>>> students = [('john', 'A', 15), ('jane', 'B', 12), ('dave', 'B', 10)]
>>> sorted(students, key=lambda s: s[2])            # 按年龄排序
[('dave', 'B', 10), ('jane', 'B', 12), ('john', 'A', 15)]
 
>>> sorted(students, key=lambda s: s[2], reverse=True)       # 按降序
[('john', 'A', 15), ('jane', 'B', 12), ('dave', 'B', 10)]
>>>
```
