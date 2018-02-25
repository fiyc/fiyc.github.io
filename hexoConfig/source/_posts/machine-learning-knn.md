---
title: 机器学习实战 k-近邻算法
tags:
  - 机器学习
categories:
  - 机器学习
date: 2018-02-25 19:15:50
---


## 前言
本文是在读《机器学习实战》时, 针对`k-近邻算法`这一节做的笔记. 对于从未接触机器学习的人来说, 这一篇文章可以作为一个简单的入门指导. 让我们对所谓的机器学习是如何工作的有一些简单的了解.

<!-- more -->

## *k*-近邻算法概述
简单的说, *k*-近邻算法采用测量不同特征值之间的距离方法进行分类.

* 优点: 精度高, 对异常值不敏感, 无数据输入假定
* 缺点: 计算复杂度高, 空间复杂度高
* 适用数据范围: 数值型和标称型

### 一般流程
1. 收集数据: 可以使用任何方法
2. 准备数据: 距离计算所需要的数值, 最好是结构化的数据格式
3. 分析数据: 可以使用任何方法
4. 训练算法: 此步骤不适用于k-近邻算法
5. 测试算法: 计算错误率
6. 使用算法: 首先需要输入样本数据和结构化的输出结果, 然后运行k-近邻算法判定输入数据分别属于哪个分类, 最后应对计算出的分类执行后续的处理.


### 工作原理
> 存在一个样本数据集合, 也称为训练样本集, 并且样本集中每个数据都存在标签, 即我们知道样本集中每一数据与所属分类的对应关系. 当我们输入没有标签的新数据后, 将新数据的每个特征与样本集中数据对应的特征进行比较, 然后算法提取样本集中特征最相似数据(最近邻)的分类标签. 一般来说, 我们只选择样本数据集中前k个最相似的数据, 这也是`k-近邻算法`中k的出处, 通常k是不大于20的整数. 最后, 选择k个最相似数据中出现次数最多的分类, 作为新数据的分类.  

以上是书中的原文, 描述了这一算法的工作原理. 在这里我用自己的理解来做一下描述.  

假设存在一批关于程序员技术能力的训练数据集, 这一批数据存在2个特征, `每周代码量`与`每周博客量`. 如下图:

| 每周代码量 | 每周博客量 | 技术评价 |
|------------|------------|----------|
| 100        | 0          | 初级     |
| 200        | 0          | 初级     |
| 300        | 1          | 中级     |
| 500        | 0          | 中级     |
| 200        | 3          | 高级     |
| 1000       | 1          | 高级     |

*注: 以上数据只是为了说明原理, 不具有代表意义*  

在上述表格中, 最后一列为训练样本的标签, 也可以说是分类. 而我们的算法最终的目的也就是将我们的输入参数指向某一个标签.  

现在假设我们有了一条输入参数:

| 每周代码量 | 每周博客量 | 技术评价 |
|------------|------------|----------|
| 400        | 0          | ?        |

我们希望知道这个程序员的技术评价. 我们的做法是, 将这一条输入参数, 与训练样本中的每一条记录做`距离计算`(后面会提到如何计算), 然后按照距离升序排序, 取出前`k`条. 最后使用取出的数据中, 数量最多的一种标签.

#### 距离计算
*k*-近邻算法的距离计算, 其实是可很容易理解的问题. 回忆一下我们上学时学过的平面坐标系:  

假设在坐标系中存在两个点 `A(x1, y1)` 与 `B(x2, y2)`, 求这两个点的距离.  

`Math.sqrt((x1-x2)^2 + (y1-y2)^2)`  

如果是一个三维坐标系的两个坐标 `A(x1, y1, z1)` 与 `B(x2, y2, z2)`呢.  

`Math.sqrt((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2)`  

同理, 在我们计算输入数据与样本数据的距离时, 也是针对每一个特征计算.  

但是有一点需要注意的时, 由于每一列特征值意义不同, 如果按照原值计算, 可能对计算结果造成误差. 因此我们通常会做一个训练样本的归一操作. 将特征的数值转换为0-1的范围内.

#### 归一化数值
下面的公式可以将任意取值范围的特征值转化为0到1区间内的值  
`newValue = (oldValue - min) / (max - min)`  

其中`min`和`max`分别是数据集中的最小特征值和最大特征值.  

比如上面提到的程序员样本数据, 进行归一化数值后, 得到如下表格:

| 每周代码量 | 每周博客量 | 技术评价 |
|------------|------------|----------|
| 0          | 0          | 初级     |
| 0.1111     | 0          | 初级     |
| 0.2222     | 0.3333     | 中级     |
| 0.4444     | 0          | 中级     |
| 0.1111     | 0.3333     | 高级     |
| 1          | 1          | 高级     |



## 案例分析 - 识别手写数字
这里我们将使用*k*-近邻算法来完成一个识别手写数字的例子. 这里使用到的图片资源可以在原书代码中找到. 也可以去[这里](https://pan.baidu.com/s/1qZYBdMW)下载  

在这里我们使用文本文件来表示图片, 首先是一个将图片转换为向量的函数

```python
# -*- coding: utf-8 -*-
from numpy import *
from os import listdir
import operator
'''
- 机器学习实战
- k-近邻算法
- 手写识别系统
'''

# 将图像转换为测试向量
def img2vector(filename):
    returnVect = zeros((1, 1024))
    fr = open(filename)

    # 这里由于图片资源为32*32, 因此通过两个循环, 将图片的每一点作为特征, 生成一个长度为(1, 1024)的矩阵
    for i in range(32):
        lineStr = fr.readline()
        for j in range(32):
            returnVect[0, 32 * i + j] = int(lineStr[j])

    return returnVect
```

我们的*k*-近邻算法如下所示, 实现了前文描述的逻辑

```python
'''
获取输入数据的类型

inX: 输入数据特征
dataSet: 样本数据特征
labels: 样本数据标签
k: 选取前k个最近数据
'''
def classify0(inX, dataSet, labels, k):
    dataSetSize = dataSet.shape[0]
    diffMat = tile(inX, (dataSetSize, 1)) - dataSet
    sqDiffMat = diffMat**2
    sqDistances = sqDiffMat.sum(axis=1)
    distances = sqDistances**0.5
    sortedDisIndicies = distances.argsort()
    classCount = {}
    for i in range(k):
        voteIlabel = labels[sortedDisIndicies[i]]
        classCount[voteIlabel] = classCount.get(voteIlabel, 0) + 1

    sortedClassCount = sorted(classCount.iteritems(),
                              key=operator.itemgetter(1), reverse=True)
    return sortedClassCount[0][0]
```

最后我们使用一个测试函数, 验证我们的算法准确率

```python
def handwritingClassTest():
    hwLabels = []
    tranDataPath = '/Users/yif/Desktop/machinelearninginaction/Ch02/digits/trainingDigits'  # 这里是我们存放样本数据的目录
    testDataPath = '/Users/yif/Desktop/machinelearninginaction/Ch02/digits/testDigits'  # 这里是我们存放测试数据的目录
    trainingFifleList = listdir(tranDataPath)
    m = len(trainingFifleList)
    trainingMat = zeros((m, 1024))

    for i in range(m):
        fileNameStr = trainingFifleList[i]
        fileStr = fileNameStr.split('.')[0]
        classNumStr = int(fileStr.split('_')[0])
        hwLabels.append(classNumStr)
        trainingMat[i, :] = img2vector('%s/%s' % (tranDataPath, fileNameStr))

    testFileList = listdir(testDataPath)
    testLength = len(testFileList)
    errorCount = 0.0

    for i in range(testLength):
        firlNameStr = testFileList[i]
        fileStr = firlNameStr.split('.')[0]
        classNumStr = int(fileStr.split('_')[0])

        vectorUnderTest = img2vector('%s/%s' % (testDataPath, firlNameStr))
        classifierResult = classify0(vectorUnderTest, trainingMat, hwLabels, 3)

        print "classifier result is: %d, real result is: %d" % (classifierResult, classNumStr)

        if(classifierResult != classNumStr):
            errorCount += 1.0

    print "\nthe total number of error is: %d" % errorCount
    print "\nthe total error rate is: %f" % (errorCount / float(testLength))


if (__name__ == '__main__'):
    handwritingClassTest()
```

## 总结
*k*-近邻算法是分类数据最简单有效的算法. 它是基于实例的学习, 使用算法时我们必须有接近实际数据的训练样本数据. 同时, 这个算法必须保存全部数据集, 如果训练数据集很大, 则会占用大量存储空间. 此外, 由于必须对数据集中的每个数据计算距离值, 实际使用时可能非常耗时.  

*k*-近邻算法的另一个缺陷是它无法给出任何数据的基础结构信息, 因此我们也无法知晓平均实例样本和典型实例样本具有什么特征.
