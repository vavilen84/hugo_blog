---
title: "Google I/O 2012 - Go Concurrency Patterns"
publishdate: "2021-01-20"
lastmod: "2021-01-20"
categories:
    - "golang"
tags:
    - "go channels"
    - "lecture notes"
---

This note is based on Rob Pike`s lecture  https://www.youtube.com/watch?v=f6kdp27TYZs. 

Lecture code https://github.com/adityamenon/Google-IO_2012_Go-Concurrency-Patterns.

# Concurrency

Concurrency is a composition of independently executing computations. Concurrency is a way to structure software. It is not parallelism.

If you have only one processor, your program can still be concurrent, but it cannot be parallel. On the other hand, a well-written concurrent program might run efficiently in parallel on a multiprocessor.

# Goroutines

It is an independently executing function (like & sign during running process in console, which runs process in background). It is very cheap. It has its own call stack. 

It is not a thread. There might be only one thread in a program with thousands of goroutines. Goroutines are multiplexed dynamically onto threads as needed. But if you think of it as a very cheap thread, you wont be far off.

# Channels

A channel provides a connection between two goroutines, allowing them to communicate.

Declaring an initializing
```
var c chan int
c = make(chan int)
// or
c := make(chan int)
```
Sending on a channel
```
c <- 1
```
Receiving from a channel. The "arrow" indicates the direction of data flow.
```
value = <-c
```

# Examples

This program is sequential
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
result output is 
```
boring! 0
boring! 1
boring! 2
boring! 3
boring! 4
```
If we just add 'go' before 'boring' function call - we will have no result. The reason is that main goroutine ('main' function call) finished earlier, then we had output from 'go boring' goroutine call. The end of main goroutine stops all sub-goroutines.
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
this is going to work in an expected way
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
when the main function executes <-c, it will wait for a value to be sent, so we can see expected result
```
You say: "boring! 0"
You say: "boring! 1"
You say: "boring! 2"
You say: "boring! 3"
You say: "boring! 4"
You're boring; I'm leaving.
```
similarity, when the boring function executes c <- value, it waits for a receiver to be ready. A sender and receiver must both be ready to play their part in the communication. Otherwise we wait until they are (sending and receiving are blocking operations). Thus channels both communicate and synchronize. 

But, when we use buffered channels - buffering removes synchronization. 

# The Go approach

Don't communicate by sharing memory, share memory by communicating. In other words - don't use data variables with mutexes, pass data structures via channels.

# Patterns

## Generator: function that returns a channel

Channels are first-class values, just like strings or integers. 

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

## Channels as a handle on a service

Our boring function returns a channel that let's us communicate with the boring service it provides. We can have more instances of the service.

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
output
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
because of synchronization nature of channels, the two guys are taking turns, not only in printing the values out, but also in executing them. Because if Ann is ready to send a value but Joe hasn`t done that yet, Ann will still be blocked, waiting to deliver the value to main.


## Multiplexing 

These programs make Joe and Ann count in lockstep. We can instead use a fan-in function to let whosoever is ready talk.

Here's Joe, and here's Ann, and they're both talking.
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
Ann and Joe are now completely independent
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

## Restoring sequencing

Send a channel on a channel, making goroutine wait its turn. Receive all messages, then enable them again by sending on a private channel. First we define a message type that contains a channel for the reply.

```
type Message struct {
    str string
    wait chan bool
}
```
Each speaker must wait for a go-ahead
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

A control structure unique to concurrency. The reason channels and goroutines are built into the language 

A control structure  like a switch, that let's you control the behavior of your program based on what communications are able to proceed at any moment.

THe select statement provides another way to handle multiple channels. It's like a switch, but each case is a communication:
- All channels are evaluated.
- Selection blocks until one communication can proceed, which then does.
- If multiple can proceed, select chooses pseudo-randomly.
- A default clause, if present, executes immediately if no channel is ready.

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

## Fan-in using select

Rewrite our original fanin function. Only one goroutine is needed. New:
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
output
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

## Timeout using select

The time.After function returns a channel that blocks for the specified duration. After the interval, the channel delivers the current time once.
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
we can use it to timeout the communication.

## Timeout for whole conversation using select

Create the timer once, outside the loop, to time out the entire conversation. (In the previous program, we had a timeout for each message).

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

## Quit channel

We can turn this around and tell Joe to stop when we're tired of listening to him.
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
or
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

## Daisy-chain

![Chinese whispers](/posts/chinese_whispers.png)

Creation of 100000 synchronized channels.

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
output (for configuration: Ryzen 3700x, RAM 16GB 3200, SSD M.2)
```
403553089
10001
427481659
23928570
```
as we can see, creation of 100000 synchronized goroutines took 23928570 nanoseconds (0,02392857 second). It is very cheap.


# Systems software

Go was designed for writing systems software. Let's see how the concurrency features come into play. Let's emulate search engine.
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
but what if we don't want to wait for each category. Let's use Fan-in pattern.
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
don't wait for slow servers (Fan-in + timeout for whole conversation)
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

## Avoid timeout

Q: How do we avoid discarding results from slow servers?

A: Replicate the servers. Sed requests to multiple replicas, and use the first response.

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
Reduce tail latency using replicated search servers (Fan-in + timeout + replicas)
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

# Summary

In just a few simple transformations we used Go's concurrency primitives to convert a 
- slow
- sequential
- failure-sensitive

program into one that is

- fast
- concurrent
- replicated
- robust

# More party tricks 

There are endless ways to use these tools, many presented elsewhere.

Chatroulette toy:

tinyurl.com/gochatroulette

Load balancer:

tinyurl.com/goloadbalancer

Concurrent prime sieve:

tinyurl.com/gosieve

Concurrent power series (by Mcllroy):

tinyurl.com/gopowerseries

# Don't overdo it

They are fun to play with, but don't overuse these ideas. Goroutines and channels are big ideas. They are tools for program construction. But sometimes all you need is a reference counter. Go has "sync" and "sync/atomic" packages that provide mutexes, condition variables, etc. They provide tools for smaller problems. Often, these things will work together to solve a bigger problem. Always use the right tool for the job.

# Conclusion 

Goroutines and channels make it easy to express complex operations dealing with
- multiple inputs
- multiple outputs
- timeouts
- failure

And they are fun to use.

# Links

Go Home Page:

golang.org

Go Tour (learn Go in your browser):

tour.golang.org

Package documentation:

golang.org/pkg

Articles galore:

golang.org/doc

Concurrency is not parallelism:

tinyurl.com/goconcnotpar

That's all!