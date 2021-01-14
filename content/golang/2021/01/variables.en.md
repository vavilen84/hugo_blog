---
title: "Variables declaration"
publishdate: "2021-01-14"
lastmod: "2021-01-14"
categories:
- "golang"
tags:
- "book notes"
---

{{<the_go_pl_notes_en >}}

## Declaration

Declaration syntax is

```
var a type = expression
```

Type or expression might be omitted but not both at one time

```
var a int = 123
fmt.Printf("%v\r\n", a) // 123

var b = 123
fmt.Printf("%v\r\n", b) // 123

var c int
fmt.Printf("%v\r\n", c) // 0
```

## Initial values

If expression is omitted - value is initial for given type.

Initial value for types: 
- int 
- float
- bool
- string 
 
is not nil

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

Initial value for:
- array 
- struct 
  
is a set of elements with initial values (depending on theirs types)

```
var a [3]int
fmt.Printf("%v\r\n", a) // [0 0 0]
fmt.Printf("%v\r\n", a == nil) // will throw error "(mismatched types [3]int and nil)"

var b struct{}
fmt.Printf("%v\r\n", b) // {}
fmt.Printf("%v\r\n", b == nil) // will thorw error (mismatched types struct {} and nil)
```

Initial value for:
- slice
- map
- interface
- channel
- pointer

is nil

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

## Declaration with omitted type

If type is omitted - then it depends on the result of expression.

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

## Short declaration

```
a := 123 
```
is equal to 
```
var a = 123 
```

Variables can not be declared twice in one block. Declaration

```
var a = 123
var a = 123
```
or 
```
a := 123 
a := 123 
```
will throw error with a message "a redeclared in this block"

## Multiple variables declaration

```
var a, b, c int
fmt.Printf("%v\r\n", a) // 0
fmt.Printf("%v\r\n", b) // 0
fmt.Printf("%v\r\n", c) // 0

e, f := 1, 2
fmt.Printf("%v\r\n", e) // 1
fmt.Printf("%v\r\n", f) // 2  

e, f = f, e // change vars values
fmt.Printf("%v\r\n", e) // 2
fmt.Printf("%v\r\n", f) // 1 
```
## Register

Variables in Golang are register dependent

```
a := 1
A := 2
fmt.Printf("%v\r\n", a) // 1
fmt.Printf("%v\r\n", A) // 2
```
