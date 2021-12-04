---
title: "Mutex"
publishdate: "2021-03-27"
lastmod: "2021-03-27"
summary: "golang"
categories:
- "golang"
tags:
- "go mutex"
- "book notes"
---

{{<the_go_pl_notes_en >}}

Ralph Caraveo III 'Dancing with Go’s Mutexes' https://medium.com/hackernoon/dancing-with-go-s-mutexes-92407ae927bf#.rpphnu21l

# Mutual exclusion pattern

A data race occurs when two go goroutines simultaneously access the same variable and at least one of the calls
is a record.

We use a channel with a capacity of 1 in order to ensure that at the same time to the shared
only one go subroutine can access a variable.

```
var (
    sema = make(chan s truct{},1) // guarding balance
    balance int
)

func Deposit(amount in t) {
    sema <- struct{}{}
    balance = balance + amount
    <- sema
}

func Balance() int {
    sema <- struct{}{}
    b := balance
    <- sema
    return b
}
```

This pattern of mu tual exclu sion is so useful that it is sup por ted direc tly by the Mutex type
from the sync package. Its Lock method acquires the token (called a lock) and its Unlock
method releases it:
```
var (
    mu sync.Mutex // guarding balance
    balance int
)

func Deposit(amount int) {
    mu.Lock()
    balance = balance + amount
    mu.Unlock()
}

func Balance() int {
    mu.Lock()
    b := balance
    mu.Unlock()
    return b
}
```

By convention, the variables guarded
by a mutex are declared immediately after the declaration of the mutex itself. If you deviate
from this, be sure to document it.

With defer
```
func Balance() int {
    mu.Lock()
    defer mu.Unlock()
    return balance
}
```

# sync.RWMutex

The mechanism allows read operations to be performed concurrently,
but write operations are blocking. This
lock is called a multiple readers, single writer.

Use RWMutex when you are absolutely sure that the code in your critical section does not alter the protected data.
```
// I can safely use RLock () for the counter, since it does not change the data
func count() {
	rw.RLock()        
	defer rw.RUnlock() 
	return len(sharedState)
}

// But I have to use Lock () for set (), which changes data
func set(key string, value string) {
	rw.Lock()             
	defer rw.Unlock()  
	sharedState[key] = value
}
```

RLock - is called 'shared lock'. Lock - is called 'exclusive lock'.

An RWMutex re quires more complex internal bookkeeping , making it slower than a regular
mutex for uncontended locks.

The end of the article.