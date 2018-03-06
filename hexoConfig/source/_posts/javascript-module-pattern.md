---
title: JavaScript设计模式 - 模块化模式
tags:
  - JavaScript
  - 设计模式
categories:
  - 前端
date: 2018-03-06 17:44:00
---


> 模块是任何健壮的应用程序体系结构不可或缺的一部分, 特点是有助于保持应用项目的代码单元既能清晰地分离又有组织.

<!-- more -->
模块化这一节并没有让我学到什么新东西, 可能是原本就经常使用的缘故. 这里只是针对书中内容做一下简单的笔记.  

要理解模块化, 在这里需要对`对象`, `闭包`有一些了解.

## 对象
在`JavaScript`中, 对象被描述为一组包含在`{}`中的, 由`,`分隔的`键/值`对. 键与值之间使用`:`分隔. 下面的代码是一个对象的例子

```javascript
var myObjectLiteral = {
	variableKey: variableValue,
	functionKey: function(){
		// ...
	}
};
```

当我们要调用对象的函数或是为对象添加属性时

```javascript
myObjectLiteral.functionkey();

myObjectLiteral.newVariableKey = newValue;
```

## 模块实现私有公有成员
由于`JavaScript`本身并不支持私有公有成员的定义, 因此这里我们通过一个`IIFE(立即执行函数表达式)`来返回一个对象. 在返回的对象中只包含了我们希望模块外部可访问的公有属性. 而私有属性则存在于这个立即执行函数所在的域内, 不可访问或只能通过暴露出的公有方法可访问.  

下面是一个简单的例子

```javascript
var testModule = (function(){

	var counter = 0;
	
	return {
		incrementCounter: function(){
			return counter++;
		},
		
		resetCounter: function(){
			console.log("counter value prior to reset: " + counter);
			counter = 0;
		}
	}
})();
```

在上面的例子中, 我们拿到的`testModule`实际是后面这个立即执行函数的返回值, 也就是函数中`return`的那个对象.  

因此, 我们不可以直接获取`counater`这个属性, 我们只能通过`incrementCounter`以及`resetCounter`来操作这个私有属性.

## 一些模块化使用的变体
虽然书中在介绍这里的时候说是`Module Pattern Variations`, 但是我看过之后认为这只是前面提到内容的一种应用方式, 我觉得并不需要去死记硬背这些东西. 理解深入之后, 这些应用方式自然会在合适的时候被用到.  

### 导入混合
将全局对象引入模块, 并可以对它们自由命名
```javascript
var myModule = (function( JQ, _){
	function privateMethod1(){
		JQ(".container").html("test");
	}
	
	function privateMethod2(){
		console.log(_.min([10, 5, 100, 2, 1000]));
	}
	
	return {
		publicMethod: function(){
			privateMethod1();
		}
	}
})(JQuery, _);

myModule.publicMethod();
```

### 导出
这个例子坦白的说我没看出它有什么特殊的意义, 按照原书中的描述:  
> This next variation allows us to declare globals without consuming them.

```javascript
var myModule = (function(){
	
	var module = {},
	privateVariable = "Hello World!";
	
	function privateMethod(){
		// ...
	}
	
	module.publicProperty = "Foobar";
	
	module.publicMethod = function(){
		console.log( privateVariable );
	};
	
	return module;
})();
```



### 暴露式模块化
这个在书中其实是单独作为一个设计模式来写的, 但是我觉得它与模块化模式差别并不是很大, 所以作为一个变体来描述.  

暴露式模块化的不同点在于最后返回对象时, 返回的函数对象并非是一个匿名函数, 而是直接指向了函数体内定义的函数.可以看下面的例子:

```javascript
var myRevealingModule = (function(){
	var privateVar = "Ben Cherry",
		publicVar = "Hey there!";
		
	function privateFunction(){
		console.log("Name:" + privateVar);
	}
	
	function publicSetName(strName){
		privateVar = strName;
	}
	
	function publicGetName(){
		privateFunction();
	}
	
	return {
		setName: publicSetName,
		greeting: publicVar,
		getName: publicGetName
	}
})();
```
