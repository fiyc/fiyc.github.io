---
title: JavaScript设计模式 - 构造器模式
name: javascript-constructor-pattern
date: 2018-02-17 11:27:57
---


# JavaScript设计模式 - 构造器模式

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

在构造函数中, 关键字`this`指向了被创建的对象本身. 一个基本的构造函数如下所示:

```javascript
function Car( model, year, miles ){

	this.model = model;
	this.year = year;
	this.miles = miles;

	this.toString = function () {
		return this.model + " has done " + this.miles + " miles";
	}
}

// We can create new instances of the car
var civic = new Car( "Honda Civic", 2009, 20000 );
var mondeo = new Car( "Ford Mondeo", 2010, 5000 );

// and then open our browser console to view the
// output of the toString() method being called on
// these objects
console.log( civic.toString() );
console.log( mondeo.toString() );
```
以上是构造函数模式的简单版本, 但是它还存在着一些问题. 一个问题是它使继承变得困难; 另一个就是`toString()`在Car构造函数创建每个新对象的时候都被重新定义了, 理想情况下应该在所有Car类型的实例之间共享盖函数.

### 原型的构造函数
像JavaScript中的几乎所有对象一样, 函数都包含一个"原型"对象. 当我们调用一个JavaScript构造函数来创建一个对象时, 构造函数原型的所有属性都会被提供给新对象. 以这种方式, 可以创建多个Car对象来访问相同的原型. 因此我们可以扩展原来的例子如下:

```javascript
function Car( model, year, miles ){
	this.model = model;
	this.year = year;
	this.miles = miles;
}

Car.prototype.toString = function () {
	return this.model + " has done " + this.miles + " miles";
};
```

以上的例子中, 所有的Car对象之间共享一个toString()实例.

### 末
本篇内容翻译自 [学习JavaScript设计模式](https://addyosmani.com/resources/essentialjsdesignpatterns/book/index.html#constructorpatternjavascript)
