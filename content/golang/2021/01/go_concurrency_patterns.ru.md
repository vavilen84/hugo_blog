---
title: "Google I/O 2012 - Go Concurrency Patterns"
publishdate: "2021-01-28"
lastmod: "2021-01-28"
summary: "go"
categories:
    - "golang"
tags:
    - "goroutines"
    - "concurrency"
    - "go channels"
    - "lecture notes"
---

Статья написана на основе доклада Роба Пайка  https://www.youtube.com/watch?v=f6kdp27TYZs. 

Код доклада тут https://github.com/adityamenon/Google-IO_2012_Go-Concurrency-Patterns.

# Конкурентность

Параллелизм - это комбинация независимо выполняющихся вычислений. Параллелизм - это способ структурировать программное обеспечение. Это не параллелизм.

Если у вас только один процессор, ваша программа все еще может быть конкурентной, но не может быть параллельной. С другой стороны, хорошо написанная конкурентная программа может эффективно работать параллельно на мультипроцессоре.

# Горутины

Это независимо выполняющаяся функция (например, знак & во время выполнения процесса в консоли, который запускает процесс в фоновом режиме). Это очень дешево. У него есть собственный стек вызовов. 

Это не поток. В программе с тысячами горутин может быть только один поток. Горутины динамически мультиплексируются в потоки по мере необходимости. Но если вы думаете об этом как об очень дешевом потоке, вы не сильно ошибетесь.

# Каналы

Канал обеспечивает связь между двумя горутинами, позволяя им коммуницировать.

Объявление и инициализация
```
var c chan int
c = make(chan int)
// or
c := make(chan int)
```
Запись в канал
```
c <- 1
```
Чтение из канала. Стрелка показывает направление операции.
```
value = <-c
```

# Примеры

Это пример последовательной программы
```
func main() {
	boring("boring!")
}

func boring(msg string) {
	for i := 0; ; i++ {
		fmt.Println(msg, i)
		time.Sleep(time.Second)
	}
}
```
вывод
```
boring! 0
boring! 1
boring! 2
boring! 3
boring! 4
```
Если просто добавить go перед вызовом 'boring' функции - результата не будет. Причина в том, что основная горутина (вызов функции «main») завершилась раньше, после чего у нас должен был быть результат вызова 'go boring' горутины. Конец основной горутины останавливает все суб-горутины.
```
func main() {
	go boring("boring!")
}

func boring(msg string) {
	for i := 0; ; i++ {
		fmt.Println(msg, i)
		time.Sleep(time.Second)
	}
}
```
это будет работать ожидаемым образом
```
func main() {
	c := make(chan string)
	go boring("boring!", c)
	for i := 0; i < 5; i++ {
		fmt.Printf("You say: %q\n", <-c) // Receive expression is just a value.
	}

	fmt.Println("You're boring; I'm leaving.")
}

func boring(msg string, c chan string) {
	for i := 0; ; i++ {
		c <- fmt.Sprintf("%s %d", msg, i) // Expression to be sent can be any suitable value.
		time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
	}
}
```
когда основная функция выполняет <-c, она будет ждать отправки значения, поэтому мы можем увидеть ожидаемый результат
```
You say: "boring! 0"
You say: "boring! 1"
You say: "boring! 2"
You say: "boring! 3"
You say: "boring! 4"
You're boring; I'm leaving.
```
то же самое, когда boring функция выполняет c <- value, она ожидает готовности получателя. Отправитель и получатель должны быть готовы учавствовать в коммуникации. В противном случае ждем их готовности (отправка и получение - блокирующие операции). Таким образом, каналы и взаимодействуют, и синхронизируются.

Но когда мы используем буферизованные каналы - буферизация убирает синхронизацию.

примечание! если мы запустим горутины внутри суб-горутины - она не остановит вложенные
```
func main(){
	fmt.Println("start")
	go func(){
		fmt.Println("gmain start")
		go func(){
			time.Sleep(1*time.Second)
			fmt.Println("g1")
		}()
		go func(){
			time.Sleep(1*time.Second)
			fmt.Println("g2")
		}()
		fmt.Println("gmain end")
	}()
	fmt.Println("sleep")
	time.Sleep(5*time.Second)
	fmt.Println("the end")
}
```
вывод
```
start
sleep
gmain start
gmain end
g2
g1
the end
```

# Подход Go

Не коммуникацируйте посредством разделения памяти - разделяйте память через коммуникации. Другими словами - не используйте переменные с мьютексами, передавайте структуры данных по каналам.

# Паттерны

## Генератор: функция возвращающая канал

Каналы - это объекты первого класса (могут быть присвоены, переданы в качестве параметра функции, возвращены функцией) как строки или числа. 

```
func main() {
	c := boring("boring!") // Function returning a channel.
	for i := 0; i < 5; i++ {
		fmt.Printf("You say: %q\n", <-c)
	}
	fmt.Println("You're boring; I'm leaving.")
}

func boring(msg string) <-chan string { // Returns receive-only channel of strings. 
	c := make(chan string)
	go func() { // We launch the goroutine from inside the function.
		for i := 0; ; i++ {
			c <- fmt.Sprintf("%s %d", msg, i)
			time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
		}
	}()
	return c // Return the channel to the caller.
}
```

## Канал как дескриптор сервиса

Our boring function returns a channel that let's us communicate with the boring service it provides. We can have more instances of the service.
Наша 'boring' функция возвращает канал, который позволяет нам общаться с сервисом, который она предоставляет. У нас может быть больше экземпляров сервиса.

```
func main() {
	joe := boring("Joe")
	ann := boring("Ann")
	for i := 0; i < 5; i++ {
		fmt.Println(<-joe)
		fmt.Println(<-ann)
	}
	fmt.Println("You're both boring; I'm leaving.")
}
```
вывод
```
Joe: 0
Ann: 0
Joe: 1
Ann: 1
Joe: 2
Ann: 2
Joe: 3
Ann: 3
Joe: 4
Ann: 4
You're both boring; I'm leaving.
```
Если Энн готова отправить значение, но Джо еще не сделал этого, Энн все равно будет заблокирована, ожидая передачи значения в main.


## Мультиплексирование 

Эти программы заставляют Джо и Энн считать синхронно. Вместо этого мы можем использовать функцию мультиплексирования, чтобы позволить коммуницировать всем, кто готов.

Джо и Енн коммуницируют оба.

![Fan-in](/posts/go_concurrency_patterns_1.png)
```
func main() {
	c := fanIn(boring("Joe"), boring("Ann"))
	for i := 0; i < 10; i++ {
		fmt.Println(<-c) // HL
	}
	fmt.Println("You're both boring; I'm leaving.")
}


func fanIn(input1, input2 <-chan string) <-chan string {
	c := make(chan string)
	go func() { for { c <- <-input1 } }()
	go func() { for { c <- <-input2 } }()
	return c
}
```
Энн и Джо теперь полностью независимы
```
Ann: 0
Joe: 0
Ann: 1
Joe: 1
Ann: 2
Joe: 2
Ann: 3
Ann: 4
Ann: 5
Joe: 3
You're both boring; I'm leaving.
```

## Восстановление последовательности

Пишем канал в канал, заставляя горутину ждать своей очереди. Получите все сообщения, а затем снова отправьте их по частному каналу. Сначала мы определяем тип сообщения, который содержит канал для ответа.

```
type Message struct {
    str string
    wait chan bool
}
```
Каждый канал должен дождаться разрешения
```
func main() {
	c := fanIn(boring("Joe"), boring("Ann"))

	for i := 0; i < 5; i++ {
		msg1 := <-c; fmt.Println(msg1.str)
		msg2 := <-c; fmt.Println(msg2.str)
		msg1.wait <- true
		msg2.wait <- true
	}

	fmt.Println("You're all boring; I'm leaving.")
}

func boring(msg string) <-chan Message { // Returns receive-only channel of strings.
	c := make(chan Message)

	waitForIt := make(chan bool) // Shared between all messages.

	go func() { // We launch the goroutine from inside the function.
		for i := 0; ; i++ {

			c <- Message{ fmt.Sprintf("%s: %d", msg, i), waitForIt }
			time.Sleep(time.Duration(rand.Intn(2e3)) * time.Millisecond)
			<-waitForIt
		}
	}()
	return c // Return the channel to the caller.
}

func fanIn(inputs ... <-chan Message) <-chan Message {
	c := make(chan Message)
	for i := range inputs {
		input := inputs[i] // New instance of 'input' for each loop.
		go func() { for { c <- <-input } }()
	}
	return c
}
```

# Select

Уникальная структура управления для конкурентности.

Управляющая структура наподобие switch, которая позволяет вам контролировать поведение вашей программы в зависимости от того, какие коммуникации могут выполняться в любой момент.
- Все каналы опрашиваются
- Выбор блокируется, пока какой-то из каналов не будет свободен
- Если свободны для передачи данных несколько каналов - канал будет выбран псевдо-случайно
- Случай по умолчанию (если такой есть) будет выполнен немедленно, если никто их каналов не готов

```
func main() {
	var c1, c2, c3 chan int

	select {
	case v1 := <-c1:
		fmt.Printf("received %v from c1\n", v1)
	case v2 := <-c2:
		fmt.Printf("received %v from c2\n", v2)
	case c3 <- 23:
		fmt.Printf("sent %v to c3\n", 23)
	default:
		fmt.Printf("no one was ready to communicate\n")
	}
}
```

## Fan-in использующий select

Переписываем наш оригинальный fanin. Нужна только одна горутина:
```
func fanIn(input1, input2 <-chan string) <-chan string {
	c := make(chan string)
	go func() {
		for {
			select {
			case s := <-input1:  c <- s
			case s := <-input2:  c <- s
			}
		}
	}()
	return c
}
```
вывод
```
Joe: 0
Ann: 0
Joe: 1
Ann: 1
Joe: 2
Ann: 2
Joe: 3
Ann: 3
Joe: 4
Ann: 4
You're both boring; I'm leaving.
```

## Timeout использующий select

time.After функция возвращает канал, который блокируется на указанное время. По истечении интервала канал передает текущее время один раз.
```
func main() {
	c := boring("Joe")
	for {
		select {
		case s := <-c:
			fmt.Println(s)
		case <-time.After(1 * time.Second):
			fmt.Println("You're too slow.")
			return
		}
	}
}
```

мы можем использовать его для ограничения коммуникации по тайм-ауту

## Timeout для всего диалога используя select

Создайте таймер один раз вне цикла, чтобы ограничить по тайм-ауту весь диалог. (В предыдущей программе у нас был тайм-аут для каждого сообщения).

```
func main() {
	c := boring("Joe")
	timeout := time.After(5 * time.Second)
	for {
		select {
		case s := <-c:
			fmt.Println(s)
		case <-timeout:
			fmt.Println("You talk too much.")
			return
		}
	}
}
```

## Канал для завершения цикла

Мы можем изменить ситуацию и сказать Джо, чтобы он остановился, когда мы устанем его слушать.
```
quit := make(chan bool)
c := boring("Joe", quit)
for i := rand.Intn(10); i >= 0; i-- { fmt.Println(<-c) }
quit <- true
```
```
go func() {
    for i := 0; ; i++ {
        time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
        select {
        case c <- fmt.Sprintf("%s: %d", msg, i):
            // do nothing
        case <-quit:
               // do something
            return
        }
    }
}()
```
или
```
quit := make(chan string)
c := boring("Joe", quit)
for i := rand.Intn(10); i >= 0; i-- { fmt.Println(<-c) }
quit <- "Bye!"
fmt.Printf("Joe says: %q\n", <-quit)
```
```
go func() {
    for i := 0; ; i++ {
        time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
        select {
        case c <- fmt.Sprintf("%s: %d", msg, i):
            // do nothing
        case <-quit:
            cleanup()
            quit <- "See you!"
            return
        }
    }
}()
```

## Гирлянда

![Chinese whispers](/posts/chinese_whispers.png)

Создание 100000 синхронизированных каналов.

```
func f(left, right chan int) {
	left <- 1 + <-right
}

func main() {
	start := time.Now().Nanosecond()
	fmt.Println(start)
	const n = 10000
	leftmost := make(chan int)
	right := leftmost
	left := leftmost
	for i := 0; i < n; i++ {
		right = make(chan int)
		go f(left, right)
		left = right
	}
	go func(c chan int) { c <- 1 }(right)
	fmt.Println(<-leftmost)
	end := time.Now().Nanosecond()
	fmt.Println(end)
	resultTime := end - start
	fmt.Println(resultTime)
}
```
вывод (для: Ryzen 3700x, RAM 16GB 3200, SSD M.2)
```
403553089
10001
427481659
23928570
```
Как видим, создание 100000 синхронизированных горутин заняло 23928570 наносекунд (0,02392857 секунды). Это очень дешево.


# Системное программное обеспечение

Go был разработан для написания системного программного обеспечения. Давайте посмотрим, как в игру вступят функции конкурентности. Давайте сэмулируем поисковою систему.
```
type Result string

func Google(query string) (results []Result) {
	results = append(results, Web(query))
	results = append(results, Image(query))
	results = append(results, Video(query))
	return
}

var (
	Web = fakeSearch("web")
	Image = fakeSearch("image")
	Video = fakeSearch("video")
)

type Search func(query string) Result

func fakeSearch(kind string) Search {
        return func(query string) Result {
	          time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
	          return Result(fmt.Sprintf("%s result for %q\n", kind, query))
        }
}

func main() {
	rand.Seed(time.Now().UnixNano())
	start := time.Now()
	results := Google("golang")
	elapsed := time.Since(start)
	fmt.Println(results)
	fmt.Println(elapsed)
}
```
но что, если мы не хотим ждать каждую категорию. Воспользуемся паттерном Fan-in.
```
func Google(query string) (results []Result) {
	c := make(chan Result)
	go func() { c <- Web(query) } ()
	go func() { c <- Image(query) } ()
	go func() { c <- Video(query) } ()

	for i := 0; i < 3; i++ {
		result := <-c
		results = append(results, result)
	}
	return
}
```
не ждите медленных серверов (Fan-in + timeout для всего диалога)
```
func Google(query string) (results []Result) {
	c := make(chan Result)
	go func() { c <- Web(query) } ()
	go func() { c <- Image(query) } ()
	go func() { c <- Video(query) } ()

	timeout := time.After(80 * time.Millisecond)
	for i := 0; i < 3; i++ {
		select {
		case result := <-c:
			results = append(results, result)
		case <-timeout:
			fmt.Println("timed out")
			return
		}
	}
	return
}
```

## Без тайм-аута

Q: Как избежать потери результатов с медленных серверов?

A: Реплицируйте сервера. Отправьте запросы на несколько реплик и используйте первый ответ.

```

type Result string
type Search func(query string) Result

func First(query string, replicas ...Search) Result {
	c := make(chan Result)
	searchReplica := func(i int) { c <- replicas[i](query) }
	for i := range replicas {
		go searchReplica(i)
	}
	return <-c
}

func main() {
	rand.Seed(time.Now().UnixNano())
	start := time.Now()
	result := First("golang",
		fakeSearch("replica 1"),
		fakeSearch("replica 2"))
	elapsed := time.Since(start)
	fmt.Println(result)
	fmt.Println(elapsed)
}

func fakeSearch(kind string) Search {
        return func(query string) Result {
	          time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
	          return Result(fmt.Sprintf("%s result for %q\n", kind, query))
        }
}
```
Уменьшите задержку с помощью реплицированных поисковых серверов (Fan-in + тайм-аут + реплики)
```
func Google(query string) (results []Result) {
	c := make(chan Result)
	go func() { c <- First(query, Web1, Web2) } ()
	go func() { c <- First(query, Image1, Image2) } ()
	go func() { c <- First(query, Video1, Video2) } ()
	timeout := time.After(80 * time.Millisecond)
	for i := 0; i < 3; i++ {
		select {
		case result := <-c:
			results = append(results, result)
		case <-timeout:
			fmt.Println("timed out")
			return
		}
	}
	return
}
```

# Резюме

Всего за несколько простых преобразований мы использовали примитивы конкурентности Go для преобразования
- медленной
- последовательной
- чувствительной к поломкам

программы в

- быструю
- конкурентную
- реплицированную
- надежную

# Больше возможностей 

Есть бесконечные способы использования этих инструментов, многие из которых представлены тут

Chatroulette toy:

tinyurl.com/gochatroulette

Load balancer:

tinyurl.com/goloadbalancer

Concurrent prime sieve:

tinyurl.com/gosieve

Concurrent power series (by Mcllroy):

tinyurl.com/gopowerseries

# Не переусердствуйте

Не злоупотребляйте этими идеями. Горутины и каналы - большие идеи. Это инструменты для построения программ. В Go есть пакеты «sync» и «sync/atomic», которые предоставляют мьютексы. Они предоставляют инструменты для решения небольших проблем. Всегда используйте подходящий инструмент для работы.

# Заключение 

Горутины и каналы позволяют легко выполнять сложные операции, связанные с
- мульти-вводом
- мульти-выводом
- таймаутами
- сбоями

# Ссылки

Go Home Page:

golang.org

Go тур:

tour.golang.org

Документация пакетов:

golang.org/pkg

Статьи:

golang.org/doc

Конкурентность - не паралеллизм:

tinyurl.com/goconcnotpar

Все!