---
title: Spring Map
tags:
  - java
  - spring
categories:
  - java
date: 2018-04-25 22:43:23
---

> Spring 学习中
  
<!-- more -->

## 装配Bean
### 1. 三种装配机制 *P34*
* 在XML中进行显式配置
* 在Java中进行显式配置
* 隐式的bean发现机制和自动配置

### 2. 自动化装配 *P35*
* @Component 表明该类会作为组件类, 并告知了Spring要为这个类创建bean.
* @ComponentScan 启用扫描, 默认扫描与配置类相同的包

### 3. 为bean命名 *P38*
* 默认类名首字母小写
* 传值给@Component - `@Component("name")`
* 使用@Name注解, 可替代@Component

### 4. 设置组件扫描的包 *P39*
* 指定包名 - `@ComponentScan("packageName")`
* 多个包名 - `@ComponentScan(basePackages={"sundsystem", "video"})`
* 使用类 - `@ComponentScan(basePackageClasses={CDPlayer.class, DVDPlayer.class})`

### 5. bean自动装配 *P40*
* 没有匹配的bean时出现异常
* 设置@Autowired的`required`属性避免异常

### 6. 在Java中进行显式配置 *P44*
* @Configuration 表明这个类式一个配置类, 该类应该包含在spring上下文中如何创建bean的细节.

## 高级装配
### 7. 使用profile控制bean的创建 *P69*
* @profile注解 `@profile('dev')`表明只有在dev profile激活时, 被标注的bean才会创建
* `spring.profiles.default` 与 `spring.profiles.active` 确定哪个profile激活

### 8. 条件化的bean *P75*
* `@Conditional(class)`
* 设置给@Conditional的类可以是任意实现了`org.springframework.context.annotation.Condition`接口的类

### 9. 处理自动装配的歧义性 *P78*
* @Primary 标明首选项
* @Qualifier 与@Autowired协同使用
```
@Autowired
@Qualifier("iceCream")
public void setDessert(Dessert dessert){
	this.dessert = dessert;
}

@Component
public class IceCream implements Dessert(){
	...
}
```
* 创建自定义的限定符, 两边同时使用@Qualifier
* 使用自定义的限定符注解, 注解中使用了@Qualifier
```
@Target({ElementType.CONSTRUCTOR, ElementType.FIELD, ElementType.METHOD, ElementType.TYPE})
@REtention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Cold{}
```

### 10. bean的作用域 *P84*
* @Scope注解设置作用域
* 单例 - singleton
* 原型 - prototype
* 会话 - session
* 请求 - request
* @Scope的proxyMode属性

### 11.运行时注入 *P88*

## 面向切面
### 12. AOP术语 *P103*
* 通知(Advice)
* 连接点(Join point)
* 切点(Poincut)
* 切面(Aspect)
* 引入(Introduction)
* 织入(Weaving)

### 13. 切点表达式 *P109*
`execution(* concert.Performance.perform(..)) && withing(concert.*)`


### 14. 定义切面 *P110*
* @Aspect 声明这是一个切面
* @After 目标方法返回或抛出异常时通知
* @AfterReturning 目标方法返回时通知
* @AfterThrowing 目标方法抛出异常时通知
* @Around 通知方法将目标方法封装
* @Before 目标方法调用之前执行

### 15. 启动自动代理 *P113*
* @EnableAspectJAutoProxy
```
@Configuration
@EnableAspectJAutoProxy
@ComponentScan
public class ConcertConfig{
	
	@Bean
	public Audience audience(){
		return new Audience();
	}
}
```

### 16. 环绕通知 *P114*
```
@Around("performance()")
public void watchPerformance(ProceedingJoinPoint jp){
	...
	jp.proceed();
	...
}
```
