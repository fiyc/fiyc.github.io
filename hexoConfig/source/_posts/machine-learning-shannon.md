---
title: 机器学习实战 使用香农熵划分数据集
tags:
  - 机器学习
categories:
  - 机器学习
date: 2018-03-04 01:24:28
---


香农熵(简称熵)是一种集合信息的度量方式. 本文作为《机器学习实战》这本书中香农熵部分的阅读笔记, 简单介绍一下如何使用香农熵来对数据进行划分.

<!-- more -->

> 划分数据集的大原则是: 将无序的数据变得更加有序. 在划分数据集前后信息发生的变化称为信息增益, 知道如何计算信息增益, 我们就可以计算每个特征值划分数据集后获得的信息增益, 获得信息增益最高的特征就是最好的选择.


## 信息增益与香农熵
前面我们说, 可以通过信息增益来度量每一次数据集划分. 那么具体是如何获得这个信息增益的呢?  

这里我们就需要使用香农熵. 我自己的理解是, 香农熵描述了一组数据的混乱程度. 香农熵越高, 则说明这一组数据越混乱. 而我们划分数据的原则, 就是尽可能的减少划分后的数据的香农熵.  

假设有这样一组数据 `[A, B, A, C, B, C, D]`, 通过计算我们得到它的香农熵为`x`.  

之后我们将这一组数据分为两组`[A, A, D]`和`[B, B, C, C]`, 这两组数据计算得到的香农熵为`y`.  

那么`x - y`得到的值我们就可以称为信息增益. 而我们在分割数据时要做的, 就是尝试按照不同的分割方法划分数据, 依次求出每次划分之后的信息增益, 最后选择一个信息增益最大的.

## 香农熵计算方式
香农熵的计算公式如下:  
![香农熵公式][1]  

直接看公式可能并不是非常的直观, 我们还是拿上面的例子来说
```
一组数据 [A, B, A, C, B, C, D]
设 p 为每种标签出现的概率, 在上面的数据中一共有4中标签, A, B, C, D
所以
P(A) = 2/7
P(B) = 2/7
P(C) = 2/7
P(D) = 1/7

那么这一组数据的香农熵为:
H =- p(A) * log2P(A) - p(B) * log2P(B) - p(B) * log2P(B) - p(B) * log2P(B)


而当我们将数据划分为两组[A, A, D] [B, B, C, C]时, 香农熵需要分三步计算
首先计算[A, A, D]
p(A) = 2/3
p(D) = 1/3

H1 = -p(A) * log2p(A) - p(D) * log2p(D)

然后计算[B, B, C, C]
p(B) = 1/2
p(C) = 1/2
H2 = -p(B) * log2p(B) - p(C) * log2p(C)

最后
H = H1 * 3/7 + H2 * 4/7
为什么上面H1要乘以3/7呢, 因为H1对于的数据集[A, A, D]是原有数据集的3/7
```

知道如何计算一组数据集的香农熵之后, 我们来看下面这一组数据(数据集A), 并且我们会用`python`来写一个计算香农熵的函数  

| 特征0 | 特征1 | 特征2 | 标签   |
|-------|-------|-------|--------|
| true  | false | true  | labelA |
| false | false | false | labelB |
| false | true  | true  | labelC |
| false | false | true  | labelA |


在上面的数据中, 为了方便起见, 我们只有三个特征, 且每个特征只有`true`和`false`两种值. 最后每一组数据会有一个对应的标签, 而我们计算香农熵就是通过这个标签来计算的.  

下面是我们计算香农熵的代码:
```python
from math import log
def calcShannonEnt(dataSet):
	numEntries = len(dataSet)
	labelCounts = {}
	for featVec in dataSet:
		currentLabel = featVec[-1]

		if currentLabel not in labelCounts.keys():
			labelCounts[currentLabel] = 0

		labelCounts[currentLabel] += 1

	shannonEnt = 0.0
	for key in labelCounts:
		prob = float(labelCounts[key]) / numEntries
		shannonEnt -= prob * log(prob, 2)

	return shannonEnt
```






[1]: /images/香农熵公式.png "香农熵公式"

## 划分数据与计算信息增益
由于我们在构建决策树时, 是根据特征来划分的. 那么在这里我们划分数据集, 也将通过特征来划分. 我们还是来看上面的数据集A.  

当我们想要划分这样一个数据集时, 假设我们希望按照`特征1`来划分. 由于这个特征一共有两种值. 于是我们在划分时就是这么一种情况: 数据集中只要`特征1`是`true`的分为一组, 其余的分为另一组. 于是我们得到了这样两组数据.  


| 特征0 | 特征1 | 特征2 | 标签   |
|-------|-------|-------|--------|
| true  | false | true  | labelA |


| 特征0 | 特征1 | 特征2 | 标签   |
|-------|-------|-------|--------|
| false | false | false | labelB |
| false | true  | true  | labelC |
| false | false | true  | labelA |

现在我们要实现一个函数来完成上面的功能. 即这个函数入参为: 一个数据集`dataSet`, 一个指定的特征列`axis`以及一个指定的特征值`value`, 然后返回这个数据集中, 所有特征列`axis`值为`value`的行.

```python
def splitDataSet(dataSet, axis, value):
	retDataSet = []
	for featVec in dataSet:
		if featVec[axis] == value:
			reduceFeatVec = featVec[:axis]
			reduceFeatVec.extend(featVec[axis+1:])
			retDataSet.append(reduceFeatVec)

	return retDataSet
```

现在我们一共完成了两个函数, 一个函数负责计算数据集的香农熵, 一个函数负责划分数据. 基于这两个函数, 我们就可以找出一组数据集中最合适的拆分特征. 我们简单的描述一下这个逻辑.

```
接收到一个数据集, 这个数据集有n个特征, 每一行最后一列为数据的标签.
首先计算这个数据集的香农熵H, 即初始的混乱程度.

遍历这个数据集特征:
	当前特征为f
	得到特征f的所有值的种类, currentFeatValues
	初始化按照特征f划分数据后的香农熵h
	遍历currentFeatValues:
		当前特征值为v
		使用参数 数据集 f v 来获取一个拆分数据集
		拆分数据集占原来数据集的百分比 p
		计算拆分数据集的香农熵 hv
		
		则: h = h + hv * p
		
	
	计算按照特征f划分数据的信息增益, H - h
	判断这个信息增益是否是目前最大的, 如果是则使用这个特征作为划分特征
		
```

按照上面的逻辑, 我们可以完成下面的代码

```python
def chooseBestFeatureToSplit(dataSet):
	numFeatures = len(dataSet[0])  - 1 # 获取数据集的特征数量
	baseEntropy = calcShannonEnt(dataSet) # 计算当前数据集的香农熵
	bestInfoGain = 0.0
	bestFeature = -1

	# 遍历所有的特征列
	for i in range(numFeatures):
		featList = [example[i] for example in dataSet]  # 拿到第i列特征的所有值
		uniqueVals = set(featList) #去重
		newEntropy = 0.0

		for value in uniqueVals:
			subDataSet = splitDataSet(dataSet, i, value)
			prob = len(subDataSet) / float(len(dataSet))
			newEntropy += prob * calcShannonEnt(subDataSet)

		infoGain = baseEntropy - newEntropy
		if(infoGain > bestInfoGain):
			bestInfoGain = infoGain
			bestFeature = i

	return bestFeature

```

到目前为止, 我们已经可以找出一个数据集中的最佳的划分点. 接下来我们只需要使用递归的技巧, 就可以构建出一个决策树. 但这超出了本文的讨论范围, 有兴趣的可以自己实践. 这里只是记录了香农熵的一些概念及应用, 方便日后的查阅.
