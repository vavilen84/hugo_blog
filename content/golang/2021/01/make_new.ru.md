---
title: "make & new builtin functions"
publishdate: "2021-01-14"
lastmod: "2021-01-19"
categories:
- "golang"
tags:
- "book notes"
- "go builtin"
---

{{<the_go_pl_notes_ru >}}

Функции 'new' и 'make' различаются тем, что:
- 'new' возвращает указатель вместо значения возвращаемое функцией 'make'.
- 'make' имеет вариадический аргумент 'size'.
- 'make' выделяет память и инциализирует только объекты типов: slice, map, or chan.

# new

https://golang.org/pkg/builtin/#new

Встроенная функция new выделяет память (создает неименованную переменную и возваращет указатель на ее значение). Первый аргумент - тип (не значение), и возвращаемое значение - указатель на нулевое значение указанного типа.

Синтакс использования
```
var a = new(T)
```
пример:
```
p := new(int) // p has *int type now
fmt.Println(*p) // "0"
```
каждый вызов 'new' возвращает новый адрес
```
p := new(int)
q := new(int)
fmt.Println(p == q) // false
```
Исключение: struct{} или [0]int могу вернуть одинаковый адрес в зависимости от реализации
```
c := struct{}{}
d := [0]int{}
fmt.Printf("%p\r\n", &c) //0x57bb60
fmt.Printf("%p\r\n", &d) //0x57bb60
```

# make

https://golang.org/pkg/builtin/#make

#### объявление slice:
```
s := make([]int, 2,3)
fmt.Printf("%+v\r\n", s) // [0 0]
fmt.Printf("%+v\r\n", len(s)) // 2
fmt.Printf("%+v\r\n", cap(s)) // 3
```
без capacity
```
s := make([]int, 2)
fmt.Printf("%+v\r\n", s) // [0 0]
fmt.Printf("%+v\r\n", len(s)) // 2
fmt.Printf("%+v\r\n", cap(s)) // 2
```
с нулевой length
```
s := make([]int, 0)
fmt.Printf("%+v\r\n", s) // []
fmt.Printf("%+v\r\n", len(s)) // 0
fmt.Printf("%+v\r\n", cap(s)) // 0
```

#### объявление map:

Map не имеет 'capacity'. Size может быть пропущен, в таком случае будет выделен небольшой размер памяти
```
m := make(map[int]int)
```

#### объявление channel:

Буфер канала инициализируется из указанного capacity. Если ноль или If zero, or the size is omitted, the channel is unbuffered.
```
ch:= make(chan int) 
fmt.Printf("%+v\r\n", cap(ch)) // 0
```
```
ch:= make(chan int, 2) 
fmt.Printf("%+v\r\n", cap(ch)) // 2
```