---
title: "Defer, Panic and Recover"
publishdate: "2021-03-26"
lastmod: "2021-03-26"
summary: "golang"
categories:
- "golang"
tags:
- "go recover"
- "go defer"
- "go panic"
---

Andrew Gerrand 'Defer, Panic и Recover' https://blog.golang.org/defer-panic-and-recover

# Defer

1. A deferred function's arguments are evaluated when the defer statement is evaluated.
```
func main() {
	i := 0
	defer fmt.Println(i)
	i++
	return
}
```
output
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
output
```
1
```

but
```
func main() {
	i := 0
	defer fmt.Println(*(&i))
	i++
	return
}
```
output
```
0
```

2. Deferred function calls are executed in Last In First Out order after the surrounding function returns.
```
func main() {
	for i := 0; i < 4; i++ {
		defer fmt.Print(i, "\r\n")
	}
}
```
output
```
3
2
1
0
```

3. Deferred functions may read and assign to the returning function's named return values.
```
func c() (i int) {
	defer func() { i++ }()
	return 1
}

func main() {
	fmt.Print(c())
}
```
output
```
2
```

# Panic

Panic is a built-in function that stops the ordinary flow of control and begins panicking. When the function F calls panic, execution of F stops, any deferred functions in F are executed normally, and then F returns to its caller. To the caller, F then behaves like a call to panic. The process continues up the stack until all functions in the current goroutine have returned, at which point the program crashes. Panics can be initiated by invoking panic directly. They can also be caused by runtime errors, such as out-of-bounds array accesses.

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
output
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

Recover is a built-in function that regains control of a panicking goroutine. Recover is only useful inside deferred functions. During normal execution, a call to recover will return nil and have no other effect. If the current goroutine is panicking, a call to recover will capture the value given to panic and resume normal execution.

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
output
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
If we remove the deferred function from f the panic is not recovered and reaches the top of the goroutine's call stack, terminating the program. This modified program will output:
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

# Other recover examples

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
output
```
Recovered in a 100
main
```

put recover in the panic function
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
output
```
Recovered in a 100
main
```

put recover in the main function
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
output
```
Recovered in main 100
```

be careful wth goroutines
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
output
```
main: 3
panic: 100

goroutine 18 [running]:
main.b()
...
```

we should put recover in the panic goroutine
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
output
```
main: 3
Recovered in b 100
main: 2
main: 1
```

The end of the article!