---
title: "Channels in Golang"
publishdate: "2021-03-05"
lastmod: "2021-03-05"
summary: "golang"
categories:
- "golang"
tags:
- "go channels"
- "book notes"
---

{{<the_go_pl_notes_en >}}

# Channel

A channel is a way of communication between goroutines. Channels transmit values of the same type (channel type).

To create a channel, we use the built-in function make
```
ch := make(chan int) // ch has 'chan int' type
```

Channel is 'reference' type
```
	var nilChannel chan int
	leftmost := make(chan int)
	right := leftmost
	left := leftmost
	fmt.Printf("%+v\r\n", right)
	fmt.Printf("%+v\r\n", left)
	fmt.Printf("%+v\r\n", right == left)
	fmt.Printf("%+v\r\n", leftmost == nil)
	fmt.Printf("%+v\r\n", nilChannel == nil)
	go func() {
		right  <- 1
	}()
	fmt.Println(<-left)
```
output
```
0xc000094060
0xc000094060
true
false
true
1

```
Initial channel value is nil.

Channels support 2 types of operations - read and write:
```
ch <- x // write
x = <- ch // read
<-ch // read without using result
```

Channels support 'close' operation
```
close(ch)
```
after that, any attempt to write to the channel will cause panic. Receive operations applied to a closed channel return values that were previously sent until there are no values in channel; any further attempts to retrieve the values result in an immediate completion of the operation and the return of a null value of the channel element type.

You cannot close the read channel. Attempting to close a receive-only pipe results in a compile-time error.

A pipe created with a simple 'make' call is called an unbuffered pipe, but 'make' takes an optional second argument (an integer value) called the capacity of the pipe. If the channel capacity is nonzero - 'make' creates a buffered channel. Unbuffered channels (as opposed to buffered ones) maintain synchronization between goroutines.
```
ch = make(chan int) // Unbuffered
ch = make(chan int, 0) // Unbuffered
ch = make(chan int, 3) // Buffered with capacity 3
```

# Unbuffered channels

A send operation to an unbuffered channel will block the go subroutine until another go subroutine does the corresponding get from the same channel, after which the value becomes transferred, and both go-routines continue. Conversely, if the first attempt is made to perform a get operation, the receiving go-subroutine will block until the other go-the subroutine will not send the value to the same channel. Communication over an unbuffered channel results in synchronization of send and receive operations. For this reason, unbuffered channels are sometimes called synchronous. When a value is sent to an unbuffered channel, receiving value precedes the continuation of the sending subroutine.

There is no way to directly check if the channel is closed, but there is a variant of the get operation that returns two results: the element received from the channel and a boolean value, conventionally called 'ok', which is 'true' if the value is successfully received and 'false' if received from a closed and empty channel.
```
go func() {
    for {
        х, ok := <-naturals
        if !ok {
            break // channel is closed and empty
        }
        squares <- х * х
    }
    close(squares)
}()
```
an alternative way is a range loop
```
func main() {
	naturals := make(chan int)
	squares := make(chan int)

	go func() {
		for x := 0; x < 100; x++ {
			naturals <- x
		}
		close(naturals)
	}()

	go func () {
		for x := range naturals {
			squares <- x * x
		}
		close ( squares )
	} ()

	for x := range squares {
		fmt.Println(x)
	}
}
```
You do not need to close each channel after you finish working with it. It is necessary close channels when it is important to tell the receiving go-subroutine that all data has already been sent. Channel resources that the garbage collector defines as inaccessible, will be released in any case, regardless of whether it is closed or not. Do not confuse this with closing open files; call the 'close' method important for every file that you are finished with. An attempt to close an already closed channel causes panic, as well as closing nil channel.

# Unidirectional channels

Channel violations are detected at compile time. Bidirectional to unidirectional conversions are permitted in any assignment. However, the opposite is not true.

# Buffered channels

A buffered pipe has a queue of items. The maximum queue size is determined when the pipe is created using the 'capacity' argument of the 'make' function. Create a channel with a capacity of 3
```
ch = make(chan string, 3)
```
A send operation on a buffered channel inserts the item to be sent to the end of the queue, and the receive operation removes the first item from the queue. If the channel is full, the send operation blocks its go subroutine until another go subroutine frees space by receiving data from the channel. Conversely, if the channel is empty, the receive operation blocks the go subroutine until a value from another go subroutine is sent to the channel.

Find out the buffer size
```
cap(ch) //3
```

When applied to a channel, the built-in 'len' function returns the number of elements currently in the buffer. Since in a parallel program this information is likely to be outdated as soon as it is received, its use is limited, but it can be useful for performance optimization or debugging.

Developers are sometimes tempted by the simple syntax and use buffered pipes within the same go subroutine as a queue, but this is a mistake. Pipes are deeply tied to scheduling go-routines, and without another g-routine receiving data from the pipe, the entire program risks being permanently blocked. If all you want is a simple queue - then use a slice.

# Leaking goroutines

```
func mirroredQuery() string {
	responses := make(chan string, 3)
	go func() { responses <-request("asia.gopl.io") }()
	go func() { responses <-request("europe.gopl.io") }()
	go func() { responses <-request("americas.gopl.io") }()
	return <- responses // Возврат самого быстрого ответа
}
func request(host string)(res string) { ... }
```
If we were using an unbuffered pipe, the two slower go routines would be blocked trying to send their responses to a pipe from which no one would ever try to read data. This situation, which is called a go subroutine leak, would be a bug. Unlike variables, lost go routines are not automatically collected by the garbage collector, so it is important to ensure that go routines must terminate on their own when they are no longer needed.

# Patterns

## Parallel loops

There is no direct way to wait for the go subroutine to complete, but we can modify the inner go subroutine to signal its completion to the outer go subroutine by sending an event to the common channel.
```
// makeThumbnails3 makes thumbnails of the specified files in parallel.
func makeThumbnails3(filenames []string) {
	ch := make(chan struct{})
	for _, f := range filenames {
		go func(f string) {
			thumbnail.ImageFile(f) // NOTE: ignoring errors
			ch <- struct{}{}
		}(f)
	}

	// Wait for goroutines to complete.
	for range filenames {
		<-ch
	}
}
```

Be careful - 'f' must be passed as a function parameter, not as an external variable
```
for f := range filenames {
    go func() {
    thumbnail.ImageFile(f) // wrong!
    // ...
    } ()
}
```
since the loop will end before 'f' is passed to ImageFile. As a result, 'f' will not be what we expect.

```
func makeThumbnails4(filenames []string) error {
    errors := make(chan error)
    for f := range filenames {
        go func(f string) {
            err := thumbnail.ImageFile(f)
            errors <- err
        }(f)
    }
    for range filenames {
        if err := <-errors; err != nil {
            return err // leak!
        }
    }
    return nil
}
```
There is a subtle bug in this function. When it encounters the first non-null error, it returns it to the caller, preventing the go routine from emptying the errors channel. As a result, every remaining running go subroutine will be permanently blocked if it tries to send a value to that pipe, and will never exit. This situation, leak of go routines (chapter 8.4.4), may cause the entire program to stop or run out of memory. The simplest solution is to use a buffered pipe with sufficient capacity, which will not block working go-routines when sending messages. An alternative solution is to create another go subroutine to empty the pipe, while the main go subroutine immediately returns the first error.

# sync.WaitGroup

https://golang.org/pkg/sync/#WaitGroup

A simple goroutine sync tool. The Wait() call will block until the number of Done() calls equals the goroutines added to the group by Add(1).

```
func main(){
	filenames := make(chan int)
	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func(j int){
			defer wg.Done()
			fmt.Println("sending", j)
			filenames <- j
			fmt.Println("sent", j)
		}(i)
	}
	go func(){
		wg.Wait()
		close(filenames)
		fmt.Println("chanel closed")
	}()
	res := makeThumbnails6(filenames)
	fmt.Println("RES", res)
}

func makeThumbnails6(filenames <-chan int) int {
	var total int
	for v := range filenames {
		fmt.Println("got", v)
		total += v
	}
	fmt.Println("no more elements")
	return total
} 
```
output
```
sending 0
sending 2
sending 1
got 0
got 2
got 1
sent 0
sent 2
sent 1
chanel closed
no more elements
RES 3
```

The end of the article.