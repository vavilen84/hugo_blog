---
title: "make and new built-in functions"
publishdate: "2021-01-14"
lastmod: "2021-01-19"
categories:
- "golang"
tags:
- "book notes"
- "go builtin"
---

{{<the_go_pl_notes_en >}}

Differences between 'new' and 'make' functions:
- 'new' function returns pointer instead of value returned by 'make' function.
- 'make' function has 2nd variadic argument 'size'.
- 'make' function allocates and initializes an object of type slice, map, or chan (only).

# new

https://golang.org/pkg/builtin/#new

The new built-in function allocates memory (creates unnamed variable and returns pointer to its value). The first argument is a type, not a value, and the value returned is a pointer to a newly allocated zero value of that type.

Usage syntax is
```
var a = new(T)
```
example:
```
p := new(int) // p has *int type now
fmt.Println(*p) // "0"
```
each 'new' call returns new address
```
p := new(int)
q := new(int)
fmt.Println(p == q) // false
```
Exception: struct{} or [0]int might have the same address depending on realization.
```
c := struct{}{}
d := [0]int{}
fmt.Printf("%p\r\n", &c) //0x57bb60
fmt.Printf("%p\r\n", &d) //0x57bb60
```

# make

https://golang.org/pkg/builtin/#make

#### slice declaration:
```
s := make([]int, 2,3)
fmt.Printf("%+v\r\n", s) // [0 0]
fmt.Printf("%+v\r\n", len(s)) // 2
fmt.Printf("%+v\r\n", cap(s)) // 3
```
with capacity omitted
```
s := make([]int, 2)
fmt.Printf("%+v\r\n", s) // [0 0]
fmt.Printf("%+v\r\n", len(s)) // 2
fmt.Printf("%+v\r\n", cap(s)) // 2
```
with zero length
```
s := make([]int, 0)
fmt.Printf("%+v\r\n", s) // []
fmt.Printf("%+v\r\n", len(s)) // 0
fmt.Printf("%+v\r\n", cap(s)) // 0
```

#### map declaration:

Map doesn't have 'capacity'. The size may be omitted, in which case a small starting size is allocated.
```
m := make(map[int]int)
```

#### channel declaration:

Буфер канала инициализируется указанной емкостью буфера. Если size является нулем или пропущен - канал небуферизованный.
```
ch:= make(chan int) 
fmt.Printf("%+v\r\n", cap(ch)) // 0
```
```
ch:= make(chan int, 0) 
fmt.Printf("%+v\r\n", cap(ch)) // 0
```
```
ch:= make(chan int, 2) 
fmt.Printf("%+v\r\n", cap(ch)) // 2
```