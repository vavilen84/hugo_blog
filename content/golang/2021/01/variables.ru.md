---
title: "Объявление переменных"
publishdate: "2021-01-14"
lastmod: "2021-01-14"
summary: "golang"
categories:
- "golang"
tags:
- "book notes"
---

{{<the_go_pl_notes_ru >}}

## Объявление

Синтаксис объявления такой

```
var a type = expression
```

type или expression могут быть опущены, но не оба сразу

```
var a int = 123
fmt.Printf("%v\r\n", a) // 123

var b = 123
fmt.Printf("%v\r\n", b) // 123

var c int
fmt.Printf("%v\r\n", c) // 0
```

## Начальные значения

Если expression опущено - значение будет определяться типом.

Начальное значения для типов: 
- int 
- float
- bool
- string 
 
не nil

```
var a int
fmt.Printf("%v\r\n", a) // 0

var b float32
fmt.Printf("%v\r\n", b) // 0

var c string
fmt.Printf("%v\r\n", c) // ""

var d bool
fmt.Printf("%v\r\n", d) // false
```

Начальное значения для типов:
- array 
- struct 
  
это набор элементов с начальными значениями для их типов (сравнение с nil выбросит ошибку)

```
var a [3]int
fmt.Printf("%v\r\n", a) // [0 0 0]
fmt.Printf("%v\r\n", a == nil) // will throw error "(mismatched types [3]int and nil)"

var b struct{}
fmt.Printf("%v\r\n", b) // {}
fmt.Printf("%v\r\n", b == nil) // will thorw error (mismatched types struct {} and nil)
```

Начальные значения для типов:
- slice
- map
- interface
- channel
- pointer

это nil

```
var a []int
fmt.Printf("%v\r\n", a) // []
fmt.Printf("%v\r\n", a == nil) // true

var b map[int]int
fmt.Printf("%v\r\n", b) //  map[]
fmt.Printf("%v\r\n", b == nil) // true

var c interface{}
fmt.Printf("%v\r\n", c) // nil

var d chan int
fmt.Printf("%v\r\n", d) // nil

var e *int
fmt.Printf("%v\r\n", e) // nil
```

## Объявление с опущенным типом

Если тип опущен - он будет определен результатом выражения

```
var a = 0
fmt.Printf("%T\r\n", a) // int

var b = .5
fmt.Printf("%T\r\n", b) // float64

var c = "" //
fmt.Printf("%T\r\n", c) // string

var d = ``
fmt.Printf("%T\r\n", d) // string
```

## Короткое объявление

```
a := 123 
```
эквивалентно
```
var a = 123 
```

Переменные не могут быть два раза объявлены в одном блоке. Объявление

```
var a = 123
var a = 123
```
выбросит
```
./prog.go:9:5: a redeclared in this block
	previous declaration at ./prog.go:8:5
```

Объявление
```
a := 123 
a := 123 
```
выбросит
```
./prog.go:9:3: no new variables on left side of :=
```

## Объявление нескольких переменных

```
var a, b, c int
fmt.Printf("%v\r\n", a) // 0
fmt.Printf("%v\r\n", b) // 0
fmt.Printf("%v\r\n", c) // 0

e, f := 1, 2
fmt.Printf("%v\r\n", e) // 1
fmt.Printf("%v\r\n", f) // 2  

e, f = f, e // обмен значениями
fmt.Printf("%v\r\n", e) // 2
fmt.Printf("%v\r\n", f) // 1 
```

## Регистр

Переменные в Golang регистрозависимые

```
a := 1
A := 2
fmt.Printf("%v\r\n", a) // 1
fmt.Printf("%v\r\n", A) // 2
```





