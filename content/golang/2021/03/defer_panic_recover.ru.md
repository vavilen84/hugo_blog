---
title: "Defer, Panic и Recover"
publishdate: "2021-03-26"
lastmod: "2021-07-11"
summary: "golang"
categories:
- "golang"
tags:
- "go recover"
- "go defer"
- "go panic"
---

Andrew Gerrand 'Обработка ошибок в Go: Defer, Panic и Recover' https://habr.com/ru/post/118898/

# Defer

1. Аргументы отложенного вызова функции вычисляются тогда, когда вычисляется команда defer
```
func main() {
	i := 0
	defer fmt.Println(i)
	i++
	return
}
```
вывод
```
0
```

```
func deferFunc(i *int) {
	fmt.Println(*i)
}

func main() {
	i := 0
	defer deferFunc(&i)
	i++
	return
}
```
вывод
```
1
```

но
```
func main() {
	i := 0
	defer fmt.Println(*(&i))
	i++
	return
}
```
вывод
```
0
```

2. Отложенные вызовы функций выполняются в порядке LIFO: последний отложенный вызов будет вызван первым — после того, как объемлющая функция завершит выполнение
```
func main() {
	for i := 0; i < 4; i++ {
		defer fmt.Print(i, "\r\n")
	}
}
```
вывод
```
3
2
1
0
```

3. Отложенные функции могут читать и устанавливать именованные возвращаемые значения объемлющей функции.
```
func c() (i int) {
	defer func() { i++ }()
	return 1
}

func main() {
	fmt.Print(c())
}
```
вывод
```
2
```

# Panic

Panic — это встроенная функция, которая останавливает обычный поток управления и начинает паниковать. Когда функция F вызывает panic, выполнение F останавливается, все отложенные вызовы в F выполняются нормально, затем F возвращает управление вызывающей функции. Для вызывающей функции вызов F ведёт себя как вызов panic. Процесс продолжается вверх по стеку, пока все функции в текущей го-процедуре не завершат выполнение, после чего аварийно останавливается программа. Паника может быть вызвана прямым вызовом panic, а также вследствие ошибок времени выполнения, таких как доступ вне границ массива.

```
func b() {
	defer fmt.Println("defer b")
	fmt.Println("b func start")
	panic("panic!")
	fmt.Println("b func end")
}

func a() {
	defer fmt.Println("defer a")
	b()
}

func main() {
	defer fmt.Println("defer main")
	a()
}
```
вывод
```
b func start
defer b
defer a
defer main
panic: panic!

goroutine 1 [running]:
main.b()
        /var/www/app/tmp/main.go:12 +0x124
main.a()
        /var/www/app/tmp/main.go:18 +0xa2
main.main()
        /var/www/app/tmp/main.go:23 +0xa2
exit status 2
```

# Recover

Recover — это встроенная функция, которая восстанавливает контроль над паникующей го-процедурой. Recover полезна только внутри отложенного вызова функции. Во время нормального выполнения, recover возвращает nil и не имеет других эффектов. Если же текущая го-процедура паникует, то вызов recover возвращает значение, которое было передано panic и восстанавливает нормальное выполнение.

```
func main() {
	f()
	fmt.Println("Returned normally from f.")
}

func f() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in f", r)
		}
	}()
	fmt.Println("Calling g.")
	g(0)
	fmt.Println("Returned normally from g.")
}

func g(i int) {
	if i > 3 {
		fmt.Println("Panicking!")
		panic(fmt.Sprintf("%v", i))
	}
	defer fmt.Println("Defer in g", i)
	fmt.Println("Printing in g", i)
	g(i+1)
}
```
вывод
```
Calling g.
Printing in g 0
Printing in g 1
Printing in g 2
Printing in g 3
Panicking!
Defer in g 3
Defer in g 2
Defer in g 1
Defer in g 0
Recovered in f 4
Returned normally from f.
```
Если мы уберем отложенный вызов функции из f, то паника не останавливается и достигает верха стека вызовов го-процедуры, останавливая программу. Так модифицированная программа выведет:
```
Calling g.
Printing in g 0
Printing in g 1
Printing in g 2
Printing in g 3
Panicking!
Defer in g 3
Defer in g 2
Defer in g 1
Defer in g 0
panic: 4

goroutine 1 [running]:
main.g(0x4)
        /var/www/app/tmp/main.go:24 +0x2c5
main.g(0x3)
        /var/www/app/tmp/main.go:28 +0x193
main.g(0x2)
        /var/www/app/tmp/main.go:28 +0x193
main.g(0x1)
        /var/www/app/tmp/main.go:28 +0x193
main.g(0x0)
        /var/www/app/tmp/main.go:28 +0x193
main.f()
        /var/www/app/tmp/main.go:17 +0x86
main.main()
        /var/www/app/tmp/main.go:6 +0x22
exit status 2
```
# Другие примеры recover

```
func b(){
	panic(100)
}

func a(){
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in a", r)
		}
	}()
	b()
}

func main(){
	a()
	fmt.Println("main")
}
```
вывод
```
Recovered in a 100
main
```

помещаем recover в паникующую функцию
```
func a(){
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in a", r)
		}
	}()
	panic(100)
}

func main(){
	a()
	fmt.Println("main")
}
```
вывод
```
Recovered in a 100
main
```

помещаем recover в main
```
func c(){
	panic(100)
}

func main(){
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in main", r)
		}
	}()
	c()
	fmt.Println("main")
}
```
вывод
```
Recovered in main 100
```

будьте осторожны с горутинами
```
func b(){
	panic(100)
}

func a(){
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in a", r)
		}
	}()
	go b()
}

func main(){
	a()
	for i := 3; i > 0; i-- {
		fmt.Println("main:", strconv.Itoa(i))
		time.Sleep(1 * time.Second)
	}
}
```
вывод
```
main: 3
panic: 100

goroutine 18 [running]:
main.b()
...
```

надо помещать recover в горутину
```
func b(){
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in b", r)
		}
	}()
	panic(100)
}

func a(){
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in a", r)
		}
	}()
	go b()
}

func main(){
	a()
	for i := 3; i > 0; i-- {
		fmt.Println("main:", strconv.Itoa(i))
		time.Sleep(1 * time.Second)
	}
}
```
вывод
```
main: 3
Recovered in b 100
main: 2
main: 1
```

Конец статьи.