---
title: spring-wiring-bean
tags:
  - spring
categories:
  - java
date: 2018-04-23 23:06:29
---


## 前言
> 创建应用对象之间协作关系的行为通常称为`装配(wiring)`, 这也是依赖注入的本质.  

本文记录了`spring`在装配bean时的一些基本基础知识.

## Spring配置的可选方案
Spring提供了三种主要的装配机制:  
* 在XML中进行显示配置
* 在Java中进行显示配置
* 隐式的bean发现机制和自动配置

按照笔者的建议, 尽可能地使用自动配置的机制, 当必须要显示配置的时候, 优先使用类型安全的javaConfig. 因此这里我只记录了自动配置与Java配置.  

## 自动化装配bean
spring从两个角度来实现自动化装配:  
* 组件扫描(component scanning) Spring会自动发现应用上下文中所创建的bean.
* 自动装配(autowiring) Spring自动满足bean之间的依赖

### 创建bean

**程序2.1** CompactDisc接口在java中定义了CD的概念
```
package soundsystem;

public interface CompactDisc{
	void play();
}
```

**程序2.2** 带有@Component注解的CompactDisc实现类CompactDisc
```
package soundsystem
import org.springframework.stereotype.Component;

@Component
public class SgtPeppers implements CompactDisc{
	private String title = "Sgt. Pepper's Lonely Hearts Club Band";
	private String artist = "The Beatles";
	
	public void play(){
		System.out.println("Playing " + title + " by " + artist);
	}
}
```

上面的代码中使用了注解`@Component`, 它表明该类会作为组件类, 并告知了Spring要为这个类创建bean.  

不过组件扫描默认是不启用的, 这里还需要配置一下Spring.  

**程序2.3** @CompoentScan 注解启用组件扫描

```
package soundsystem;
import org.springframework.context.annotation.componentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
public class CDPlayerConfig{
}
```

上面的代码中, 使用`@ComponentScan`注解启用扫描, 如果没有其他的配置, @ComponentScan默认扫描与配置类相同的包


### 为bean命名
Spring应用上下文中所有的bean都会给定一个ID, 在前面的例子中, 默认将类名的第一个字母变成小写.  

如果要自定义bean的ID, 可以使用如下两种方式:  

* 值传给@Component注解
* 使用@Named注解, Spring支持将@Named作为@Component的替代方案

```
@Component("xxxxx")
public class SgtPeppers implents CompactDisc{
    ...
}
```


### 设置组件扫描的基础包
在@ComponentScan的value属性中指明包的名称:

```
@Configuration
@ComponentScan("soundsystem")
public class CDPlayerConfig{}
```

指明多个基础包


```
@Configuration
@ComponentScan(basePackages={"sundsystem", "video"})
public class CDPlayerConfig{}
```

指定类或接口, 会扫描这些类所在的包. 可以考虑在包中创建一个用来进行扫描的空标记接口, 以此应对之后可能的重构.

### bean的自动装配
自动装配就是让spring自动满足bean依赖的一种方式. 在满足依赖的过程中, 会在spring应用上下文中寻找匹配某个bean需求的其他bean. 可以使用`@Autowired`注解来声明自动装配.  

```
package soudsystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotyep.Component;

@Component
public class CDPlayer implements MediaPlayer{
	private CompactDisc cd;
	
	@Autowired
	public CDPlayer(CompactDisc cd){
		this.cd = cd;
	}
	
	public void play(){
		cd.play();
	}
}
```

不管是构造器, Setter方法还是其他的方法, spring都会尝试满足方法参数上所声明的依赖. 当有且只有一个bean匹配依赖需求时, 这个bean会被装配进来.  

当没有匹配的bean时, 会抛出一个异常, 可以将`@Autowired`的`required`属性设置为false来避免异常的出现.


## Java配置实现注入

```
package soundsytem;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CDPlayerConfig{
	@Bean
	public CompactDisc sgtPeppers(){
		return new SgtPeppers();
	}
	
	@Bean
	public CDPlayer cdPlayer(){
		return new CDPlayer(sgtPeppers());
	}
	
	@Bean
	public CDPlayer cdPlayer(CompactDisc compactDisc){
		return new CDPlayer(compactDisc);
	}
}
```
`@Configuration`注解表明这个类式一个配置类, 该类应该包含在spring上下文中如何创建bean的细节.



