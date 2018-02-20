---
title: 实现简单的神经网络
date: 2018-02-14 23:05:07
tags:
	- 机器学习
categories:
	- 机器学习
---

> 这是我的第一次机器学习, 学习内容是来自[慕课网][1]

<!-- more -->
### 1.分类算法的总体描述

#### 神经元的数学表示
权重 `W = [W1, W2 ... Wn]`  
神经信号(训练数据) `X = [X1, X2 ... Xn]`  
进入神经核的信息 `Z=W1*X1 + W2*X2 + ... + Wn*Xn`  

#### 激活函数(步调函数)
这个函数以前面进入神经核的信息为入参, 存在一个`阈值`, 如果入参大于阈值则为1, 否则为-1  
```
       |-  1 if z >= O
$(z) = |
       |-  -1 otherwise
```

#### 一些数学运算概念
* 点积  
  也就是上面提到的z的计算过程 `z = w0*x0 + ... + wn*xN`  
  例如:  
	  [1 2 3] * [4 5 6] = 1*4 + 2*5 + 3*6 = 32  
	  
* 矩阵的行转列  
```
|1 2|      |1 3 5|
|3 4| ->   |2 4 6|
|5 6|
```












[1]: https://www.imooc.com/video/14375 "机器学习-实现简单神经网络"


### 2. 感知器分类算法

#### 感知器数据分类算法步骤
权重向量W, 训练样本X
* 1.把权重向量初始化为0, 或把每个分量初始化为[0,1]间的任意小数
* 2.把训练样本输入感知器, 得到分类结果(-1 或 1)
* 3.根据分类结果更新权重向量

#### 步调函数与阈值
这里提到了一个简化步调函数的操作  

将阈值Ø 加入权重向量来简化操作, `w0 = -Ø and x0 = 1`  

`z= w0*x0 + w1*x1 + ... + wn*xn`  

这样就是需要判断`if z >= 0 1 else -1`

#### 权重更新算法
* W(j) = W(j) + △W(j)
* △W(j) = η * (y - y') * X(j)
* η表示学习率, 是一个[0,1]间的y一个小数
* y是输入样本的正确分类, y'是感知器计算出来的分类

#### 权重更新算法示例
假设: W = [0 0 0], X = [1 2 3], η = 0.3, y = 1, y' = -1  

得到: 
* △W(0) = 0.3 * 2 * 1 = 0.6,   W(0) = 0.6
* △W(1) = 0.3 * 2 * 2 = 1.2,   W(1) = 1.2
* △W(2) = 0.3 * 2 * 3 = 1.8,   W(2) = 1.8  

更新后的权重向量 W = [0.6 1.2 1.8]

#### 感知器算法适用范围
只适用于可以线性区分的问题, 如下图的左边  
![感知器算法适用范围][2]

#### 感知器算法总结
总的来说, 感知器算法就是适用训练样本经过权重向量计算后, 只用得到的结果与阈值进行比较, 如果通过则发送信号; 否则则修改权重向量. 通过大量的训练样来不断的改善我们的权重向量. 如下图  

![感知器算法总结][3]

### 3. 实现感知器对象
```python
import numpy as np
class Perceptron(object):
	"""
	eta: 学习率
	n_iter: 权重向量的训练次数
	w_: 神经分叉权重向量
	errors_: 用于记录神经元判断出错的次数
	"""
	def __init__(self, eta=0.01, n_iter=10):
		self.eta = eat
		self.n_iter = n_iter
		pass
	
	def fit(self, x, y):
		"""
		输入训练数据,培训神经元
		x输入训练向量
		y对应样本正确分类
		
		x:shape[n_samples, n_features]
		x:[[1, 2, 3], [4, 5, 6]]
		n_samples: 2
		n_features: 3
		
		y:[1, -1]
		"""
		
		"""
		初始化权重向量为0
		"""
		self.w_ = np.zero(1 + x.shape[1])
		self.errors_ = []
		
		for _ in range(self.n_iter):
			errors = 0
			
			"""
			x = [[1, 2, 3], [4, 5, 6]]
			y = [1, -1]
			zip(x, y) = [([1, 2, 3], 1), ([4, 5, 6], -1)]
			"""
			for xi, target in zip(x, y):
				update = self.eta * (target - self.predict(xi))
				self.w_[1:] += update * xi
				
				self.w_[0] += update
				
				errors += int(update != 0.0)
				pass
			
			self.errors_.append(errors)
			pass
		
	def net_input(self, x):
		return np.dot(x, self.w_[1:]) + self.w_[0]
		pass
			
	def predict(self, x):
		return np.where(self.net_input(x) >= 0.0 , 1, -1)
	pass
```
### 4. 数据解析和可视化

```python
file = "训练数据路径.csv"
import pandas as pd #csv文件读取
df = pd.read_csv(file, header=None)
df.head(10)


import matplotlib.pyplot as plt #数据可视化工具
import numpy as np #对数据进行加工运算

y = df.loc[0:100, 4].values #输出0到100行的第四列的数据

y = np.where(y == 'Iris-setosa', -1, 1)

x = df.iloc[0:100, [0, 2]].values

plt.scatter(x[:50,0], x[:50, 1], color='red', marker='o', label='setosa') 

plt.scatter(x[50:100,0], x[50:100, 1], color='blue, marker='x', label='versicolor) 
plt.xlabel('花瓣长度')
plt.ylabel('花径长度')
plt.legend(loc=‘upper left’)
plt.show()
```
### 5. 神经网络对数据实现分类
下面通过代码, 看看通过模型是如何将数据进行分类的. 并把数据分类后的结果进行可视化的方式呈现出来. 我们将通过python编写一个函数, 它的功能是把预测的数据输入到神经网络模型中, 得到模型的分类结果后, 把结果通过图像的方式绘制出来.

```python
from matplotlib.colors import ListedColormap
def plot_decision_region(x, y, classifier, resolution = 0.02):
	marker = ('s', 'x', 'o', 'v')
	colors = ('red', 'blue', 'lightgreen', 'gray', 'cyan')
	cmap = ListedColormap(colors[:len(np.unique(y))])
	
	x1_min, x1_max = x[:, 0].min() - 1, x[:, 0].max()
   	x2_min, x2_max = x[:, 1].min() - 1, x[:, 1].max()
	
	xx1, xx2 = np.meshgrid(np.arange(x1_min, x1_max, resolution),np.arange(x2_min, x2_max, resolution))
	
	z = classifier.predict(np.array([xx1.ravel(), xx2.ravel()]).T)
	
	z = z.reshape[xx1.shape]
	plt.contourf(xx1, xx2, alpha=0.4, cmap=cmap)
	plt.xlim(xx1.min(), xx1.max())
	plt.ylim(xx2.min(), xx2.max())
	
	for idx, cl in enumerate(np.unique(y)):
		plt.scatter(x=x[y==c1, 0], y=x[y==c,1], alpha=0.8, c=cmap(idx), marker=markers[idx], label=cl)
		

plot_desision_regions(x, y, ppn, resolution=0.02)
plt.xlabel('花径长度')
plt.ylabel('花瓣长度')
plt.legend(loc='upper left')
plt.show()
```
### 6. 适应性线性神经元基本原理
适应性线性神经元与前面的感知器的差别在于, 感知器在得到点积结果以后, 是通过一个一个步调函数来返回1或-1, 以此来修改权重向量.而适应性神经元是直接用得到结果与正确结果的距离来更新权重. 

距离的定义使用`和方差公式`, 如下所示  
![和方差公式][4]  

这里更新权重的方式叫做`渐进下降法`, 总结的说就是获取当前的距离(差值)获取在和方差公式中当前位置的导数, 根据导数的正负判断是应该增加还是减少权重.  

增加以及减少的公式可以参考下图  
![自适应权重更新][5]

### 7. 适应性神经元代码实现
```python
class AdalineGD(object):
	"""
	eta: float
	学习效率, 处于0和1
	
	n_iter: int
	对训练数据进行学习改进次数
	
	w_: 一维向量
	存储权重数值
	
	error_:int
	存储每次迭代改进时, 网络对数据进行错误判断d额次数
	"""
	
	def __init__(self, eta=0.01, n_iter=50):
		self.eta = eta
		self.n_iter = n_iter
	
	def fit(self, x, y):
		"""
		x:二维数组[n_samples, n_features]
		n_samples 表示x中含有训练数据条目数
		n_features 含有4个数据的一维向量, 用于表示一条训练条目
		
		y: 一维向量
		用于存储每一训练条目对应的正确分类
		"""
		
		self.w_ = np.zeros(1 + x.shape[1])
		self.const_ = []
		
		for i in range(self.n_iter):
			output = self.net_input(x)
			#out = 点积结果
			
			errors = (y - output)
			
			self.w_[1:] += self.eta * x.T.dot(errors)
			self.w_[0] += self.eta * errors.sum()
			
			cost = (errors ** 2).sum() / 2.0
			self.cost_.append(cost)
			
		return self
		
	def net_input(self, x):
		return np.dot(x, self.w_[1:]) + self.w_[0]
		
	def activation(self, x):
		return self.net_input(x)
		
	def predict(self, x):
		return np.where(self.activation(x) >= 0, 1, -1)
			
```
### 8. 运行适应性神经网络
```python
ada = AdalineGD(eta=0.0001, n_iter=50)
ada.fit(x, y)
plot_decision_regions(x, y, classifier=ada)
plt.title('Adaline-Gradient descent')
plt.xlabel('花径长度')
plt.ylabel('花瓣长度')
plt.legend(loc='upper left')
plt.show()

plt.plot(range(1, len(ada.cost_) + 1), ada.cost_, marker='o')
plt.xlabel('Epochs')
plt.ylabel('sum-squard-error')
plt.show()
```

### 9. 外链接
[1]: https://www.imooc.com/learn/813 "机器学习 - 实现简单神经网络" 
[2]: https://thumbnail10.baidupcs.com/thumbnail/cff844604d98fbcc10bd7c5ec66d52a0?fid=657587317-250528-153562805848916&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-zPYNPoEZRoVflmLt0KsedfLeq0E%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "感知器适用范围"
[3]: https://thumbnail10.baidupcs.com/thumbnail/04932df88031f7bac2f532bf4adc75c4?fid=657587317-250528-669287250906211&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-biR7qR%2BvamRr%2BuzYfCIYkRBEqXs%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "感知器算法总结"
[4]: https://thumbnail10.baidupcs.com/thumbnail/0e80310424f9afe16936b84161db7546?fid=657587317-250528-517662457592757&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-MD6TccVbjNl1hIcAkMMxNq9t9cg%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "和方差公式"
[5]: https://thumbnail10.baidupcs.com/thumbnail/6c400438d3d36cf79f174be5745c5356?fid=657587317-250528-554763398198249&time=1518616800&rt=sh&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-231rtUuuq8bCyi54RNCEViwMis4%3D&expires=8h&chkv=0&chkbd=0&chkpc=&dp-logid=1042268480091194460&dp-callid=0&size=c1280_u800&quality=90&vuk=-&ft=video "自适应权重更新"
