---
title: JavaScript设计模式 - 构造器模式
date: 2018-02-17 11:27:57
tags:
	- JavaScript
	- 设计模式
categories:
	- 阅读笔记
---

在传统的面向对象的编程语言中, 构造函数是一种特殊的方法, 用于在分配了内存后初始化新创建的对象. 在JavaScript中, 几乎所有东西都是对象, 我们通常会对对象的构造感兴趣.

<!-- more -->
### 对象创建
在JavaScript中, 有三种常见的方式来创建对象, 如下所示:

```javascript
var newObject = {};

var newObject = Object.create( Object.prototype );

var newObject = new Object();
```

下面是四种为对象赋值的方式:

```javascript
//1. Dot syntax

// Set properties
newObject.someKey = "Hello World";

// Get properties
var value = newObject.someKey;

// 2. Square bracket syntax

// Set properties
newObject["someKey"] = "Hello World";

// Get properties
var value = newObject["somekey"];

// 3. Object.defineProperty

// Set properties
Object.defineProperty( newObject, "someKey", {
		value: "Hello World",
		writable: true,
		enumerable: true,
		configurable: true
});

// If the above feels a little difficult to read, a short-hand could be written as follows

var defineProp = function ( obj, key, value){
		var config = {
				value: value,
				writable: true,
				enumerable: true,
				configurable: true
		};

		Object.defineProperty( obj, key, config );
};

// To use, we then create a new empty "person" object
var person = Object.create( Object.prototype );

// Populate the object with properties
defineProp( person, "car", "Delorean" );
defineProp( person, "dateOfBirth", "1981" );
defineProp( person, "hasBeard", false );

console.log( person );

// 4. Object.defineProperties
Object.defineProperties( newObject, {
		"someKey": {
				value: "Hello World",
				writable: true
		},

		"anotherKey": {
				value: "Foo bar",
				writable: false
		}
});

```

我们之后会提到, 这些方法也可以用来实现继承, 比如如下代码:

```javascript
// Create a race car driver that inherits from the person object
var driver = Object.create( person );

// Set some properties for the driver
defineProp(driver, "topSpeed", "100mph");

// Get an inherited property
console.log( driver.dataOfBirth );

// Get the property we set
console.log( driver.topSpeed );
```


### 基本构造方法
正如我们前面看到的, JavaScript不支持类的概念. 但是他支持对对象使用特殊的构造函数. 通过在调用构造函数时, 用一个简单的前缀`new`, 我们告诉JavaScript我们希望这个函数作为一个构造函数来创建一个新的对象, 这个对象包含了函数中声明的成员.
