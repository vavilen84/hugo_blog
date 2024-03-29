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

{{<the_go_pl_notes_ru >}}

Ralph Caraveo III 'Танцы с мьютексами в Go' https://habr.com/ru/post/271789/

# Шаблон взаимного исключения

Гонка данных осуществляется, когда две go-подпрограммы одновременно обращаются к одной и той же переменной и по крайней мере одно из обращений
является записью.

Мы используем канал емкостью 1 для того, чтобы гарантировать, что одновременно к совместно используемой
переменной может обратиться только одна go-подпрограмма.

```
var (
    sema = make(chan struct{}, 1) // защита balance
    balance int
)

func Deposit(amount int) {
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

Такой шаблон взаимного исключения настолько полезен, что поддерживается непосредственно типом Mutex из пакета sync. Его метод Lock захватывает маркер (вызывает блокировку), а метод Unlock его освобождает:
```
var (
    mu sync.Mutex // Защищает balance
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

По соглашению охраняемые мьютексом переменные объявляются сразу же после объявления самого мьютекса. Если вы поступаете иначе, обязательно документируйте это отступление от правил.

Вариант с использованием defer
```
func Balance() int {
    mu.Lock()
    defer mu.Unlock()
    return balance
}
```

# sync.RWMutex

Механизм позволяет операциям чтения выполняться параллельно друг с другом, но операции записи получают полностью исключительный доступ. Такая блокировка называется несколько читателей, один писатель.

Используйте RWMutex, когда вы абсолютно уверены, что код в вашей критической секции не изменяет охраняемые данные.
```
// я могу смело использовать RLock() для счетчика, так как он не меняет данные
func count() {
	rw.RLock()         // <-- заметьте букву R в RLock (read-lock)
	defer rw.RUnlock() // <-- заметьте букву R в RUnlock()
	return len(sharedState)
}

// Но я должен использовать Lock() для set(), который меняет данные
func set(key string, value string) {
	rw.Lock()                // <-- заметьте, тут мы берем "обычный" Lock (write-lock)
	defer rw.Unlock()        // <-- а тут Unlock(), без R
	sharedState[key] = value // <-- изменяет состояние(данные)
}
```

RLock - называется 'неисключительной блокировкой'. Lock - называется 'исключительной блокировкой'.

RWMutex требует более сложной внутренней бухгалтерии, что делает его медленнее обычных мьютексов

Конец статьи.