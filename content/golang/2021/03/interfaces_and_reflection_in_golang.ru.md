---
title: "Интерфейсы и рефлексия в Golang"
publishdate: "2021-03-26"
lastmod: "2021-03-26"
summary: "golang"
categories:
- "golang"
tags:
- "go interface"
- "go reflection"
- "book notes"
---

{{<the_go_pl_notes_ru >}}

Об устройстве интерфейсов 'Краш-курс по интерфейсам в Go' https://habr.com/ru/post/276981/

Статья Роба Пайка 'Законы рефлексии в Gо' https://habr.com/ru/post/415171/

# Интерфейс

## Встраивание интерфейса

```
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

## Соответствие интерфейсу

Проверка соответствия интерфейсу
```
// *bytes.Buffer должен соответствовать io.Writer
var _ io.Writer = (*bytes.Buffer)(nil)
```

Возможные ошибки
```
var w io.Writer
w = os.Stdout         // OK: *os.File имеет метод Write
w = new(bytes.Buffer) // OK: *bytes.Buffer имеет метод Write
w = time.Second       // Ошибка: у time.Duration нет метода Write

var rwc io.ReadWriteCloser
rwc = os.Stdout         // OK: *os.File имеет методы Read, Write, Close
rwc = new(bytes.Buffer) // Ошибка: у *bytes.Buffer нет метода Close
```

Есть одно тонкое место, связанное со смыслом утверждения, что некоторый тип имеет некий метод. Вполне законным является вызов метода *Т с аргументом типа Т при условии, что аргумент является переменной; компилятор неявно берет ее адрес. Но это лишь синтаксическое упрощение: значение типа Т не обладает всеми методами, которыми обладает указатель *Т, и в результате оно может удовлетворить меньшему количеству интерфейсов.
```
type IntSet struct { /* ... */ }
func (*IntSet) String() string
var _ = IntSet{}.String() // Ошибка: String требует получатель *IntSet
```

Но можно вызвать его для переменной IntSet:

```
var s IntSet
var _ = s.String() //OK: s является переменной; &s имеет метод String
```

Однако, поскольку только *IntSet имеет метод String, только *IntSet соответствует интерфейсу fmt .Stringer:
```
var _ fmt.Stringer = &s // OK
var _ fmt.Stringer = s // Ошибка: у IntSet нет метода String
```

## Устройство интерфейсов

```
type iface struct {
    tab  *itab
    data unsafe.Pointer
}
```
Где tab — это указатель на Interface Table или itable — структуру, которая хранит некоторые метаданные о типе и список методов, a data - ссылка на копию данных(если интерфейсу присваивалась переменная). Пример:

```
type Human struct {
	Greeting string
}

type Speaker interface {
	SayHello()
}

func (h Human) SayHello() {
	fmt.Println(h.Greeting)
}

func main(){
	h := Human{Greeting: "Hello"}
	s := Speaker(h)
	h.Greeting = "Meow"
	s.SayHello() // выведет "Hello"
}
```

![](/posts/go_interfaces_1.png)

### itable

itable просчитывется на этапе выполнения
```
var s Speaker = string("test") // compile-time error
var s Speaker = io.Reader // compile time error
var h string = Human{} // compile time error
var s interface{}; h = s.(Human) // runtime error
```

### кастинг

Проверить тип интерфейса
```
switch x := x.(type) {
    case int:
        ...
}
```

Go ловит несоответствия типов на этапе компиляции, но кастинг к интерфейсу — во время исполнения. Безопасный кастинг:
```
if s, ok := h.(Speaker); !ok { ... }
```

## Пустой интерфейс

Пустому интерфейсу можно присвоить любое значение
```
var any interface{}
any = true
any = 12.34
any = "hello"
any = map[string]int{"one": 1}
any = new(bytes.Buffer)
```

Он точно также хранит данные и тип данных.

```
var c interface{}
c = 123
fmt.Printf("%+v\r\n", c)
fmt.Printf("%T\r\n", c)
```
вывод
```
123
int
```

# Рефлексия

Переменная типа интерфейса хранит пару: конкретное значение, присвоенное переменной, и дескриптор типа этого значения
```
var r io.Reader
tty, err := os.OpenFile("/dev/tty", os.O_RDWR, 0)
if err != nil {
    return nil, err
}
r = tty
```
r содержит, схематически, пару (значение, тип) --> (tty, *os.File). Обратите внимание, что тип *os.File реализует методы, отличные от Read(); Вот почему мы можем делать такие вещи:
```
var w io.Writer
w = r.(io.Writer) // тип внутреннего значения интерфейсы удовлетворяет io.Writer
```
Продолжая, мы можем сделать следующее:
```
var empty interface{}
empty = w
```
Нам здесь не нужно утверждение типа, потому что известно, что w удовлетворяет пустому интерфейсу.

Одна важная деталь заключается в том, что пара внутри интерфейса всегда имеет форму (значение, конкретный тип) и не может иметь форму (значение, интерфейс). Интерфейсы не поддерживают интерфейсы как значения.

## reflect

## законы рефлексии

1. Reflection распространяется от интерфейса до reflection объекта.

На базовом уровне reflect является всего лишь механизмом для изучения пары тип и значение, хранящейся внутри переменной интерфейса. Чтобы начать работу, есть два типа, о которых нам нужно знать: reflect.Type и reflect.Value. Эти два типа предоставляют доступ к содержимому интерфейсной переменной и возвращаются простыми функциями, reflect.TypeOf() и reflect.ValueOf() соответственно. Они выделяют части из значения интерфейса.

reflect.TypeOf() принимает пустой интерфейс, согласно объявлению функции:
```
// TypeOf() возвращает reflect.Type переменной в пустой интерфейс.
func TypeOf(i interface{}) Type
```
Когда мы вызываем reflect.TypeOf(x), x сначала сохраняется в пустом интерфейсе, который затем передается в качестве аргумента; reflect.TypeOf() распаковывает этот пустой интерфейс для восстановления информации о типе. Функция reflect.ValueOf(), конечно же, восстанавливает значение.

2. Reflection распространяется от reflect объекта до интерфейса.

Имея reflect.Value, мы можем восстановить значение интерфейса с помощью метода Interface(); метод упаковывает информацию о типе и значении обратно в интерфейс и возвращает результат:
```
// Interface вернёт значение v как interface{}.
func (v Value) Interface() interface{}
```
```
y := v.Interface().(float64) // y имеет тип float64.
fmt.Println(y)
```

3. Чтобы изменить объект отражения, значение должно быть устанавливаемым.

Далее, несколько подробнее об этих законах.

## TypeOf()

получение типа
```
package main
import (
    "fmt"
    "reflect"
)

func main() {
    var x float64 = 3.4
    fmt.Println("type:", reflect.TypeOf(x))
}
```
вывод
```
type: float64
```

## ValueOf()

```
var x float64 = 3.4
v := reflect.ValueOf(x)
fmt.Println("type:", v.Type())
fmt.Println("kind is float64:", v.Kind() == reflect.Float64)
fmt.Println("value:", v.Float())
```
вывод
```
type: float64
kind is float64: true
value: 3.4
```

```
var x float64 = 3.4
fmt.Println("value:", reflect.ValueOf(x).String())
```
вывод
```
value: <float64 Value>
```

«getter» и «setter» методы Value действуют на самый большой тип, который может содержать значение: int64 для всех целых чисел со знаком. То есть метод Int() значения Value возвращает int64, а значение SetInt() принимает int64; может потребоваться преобразование в фактический тип:
```
var x uint8 = 'x'
v := reflect.ValueOf(x)
fmt.Println("type:", v.Type())
fmt.Println("kind is uint8: ", v.Kind() == reflect.Uint8)
x = uint8(v.Uint())  // v.Uint вернёт uint64.
```
вывод
```
type: uint8
kind is uint8: true
```

Второе свойство состоит в том, что Kind() reflect объекта описывает базовый тип, а не статический тип.
```
type MyInt int
var x MyInt = 7
v := reflect.ValueOf(x) // v имеет тип Value.
fmt.Println(v.Type())
fmt.Println(v.Kind())
```
вывод
```
main.MyInt
int
```
v.Kind() == reflect.Int. Kind может принимать только значения встроенных типов.

## Interface()

Имея reflect.Value, мы можем восстановить значение интерфейса с помощью метода Interface(); метод упаковывает информацию о типе и значении обратно в интерфейс и возвращает результат:
```
// Interface вернёт значение v как interface{}.
func (v Value) Interface() interface{}
```
```
y := v.Interface().(float64) // y имеет тип float64.
fmt.Println(y)
```
Короче говоря, метод Interface() является инверсией функции ValueOf(), за исключением того, что его результат всегда имеет статический тип interface{}.

## settability

Чтобы изменить объект отражения, значение должно быть устанавливаемым. Вот такой код не работает, но заслуживает внимания.
```
var x float64 = 3.4
v := reflect.ValueOf(x)
v.SetFloat(7.1) // Ошибка
```
Если вы запустите этот код, он упадёт с panic с критическим сообщением: panic: reflect.Value.SetFloat использует неадресуемое значение.
```
var x float64 = 3.4
v := reflect.ValueOf(x)
fmt.Println("settability of v:", v.CanSet())
```
вывод
```
settability of v: false
```

Когда мы пишем:
```
var x float64 = 3.4
v := reflect.ValueOf(x)
```
мы передаем копию x в reflect.ValueOf(), поэтому интерфейс создается как аргумент для reflect.ValueOf() — это копия x, а не сам x. Таким образом, если бы утверждение:
```
v.SetFloat(7.1)
```
было бы выполнено, оно бы не обновило x, хотя v выглядит так, как будто оно было создано из x. Вместо этого он обновил бы копию x, хранящуюся внутри значения v, a сам x не был бы затронут. Это запрещено, что бы не порождать проблем, а устанавливаемость — свойство, используемое для предотвращения проблемы.

Если мы хотим, чтобы f() непосредственно меняла x, мы должны передать нашей функции указатель на x:
```
var x float64 = 3.4
p := reflect.ValueOf(&x) // Берём адрес x.
fmt.Println("type of p:", p.Type())
fmt.Println("settability of p:", p.CanSet())
```
выведет
```
type of p: *float64
settability of p: false
```
Reflection объект p не может быть установлен, но это не p, который мы хотим установить, это указатель *p. Чтобы получить то, на что указывает p, мы вызываем метод Value.Elem(), который берёт значение косвенным образом через указатель, и сохраняем результат в reflect.Value v:
```
v := p.Elem()
fmt.Println("settability of v:", v.CanSet())
```
Теперь v является устанавливаемым объектом, результат:
```
settability of v: true
```
и поскольку он представляет x, мы, наконец, можем использовать v.SetFloat() для изменения значения x:
```
v.SetFloat(7.1)
fmt.Println(v.Interface())
fmt.Println(x)
```
вывод, как ожидалось
```
7.1
7.1
```
Просто имейте в виду, что reflection.Value нужен адрес переменной, чтобы изменить её.

## Структуры

Вот простой пример, который анализирует значение структуры
```
type T struct {
    A int
    B string
}
t := T{23, "skidoo"}
s := reflect.ValueOf(&t).Elem()
typeOfT := s.Type()
for i := 0; i < s.NumField(); i++ {
    f := s.Field(i)
    fmt.Printf("%d: %s %s = %v\n", i, typeOfT.Field(i).Name, f.Type(), f.Interface())
}
```
вывод
```
0: A int = 23
1: B string = skidoo
```
только экспортируемые поля устанавливаемы
```
s.Field(0).SetInt(77)
s.Field(1).SetString("Sunset Strip")
fmt.Println("t is now", t)
```
вывод
```
t is now {77 Sunset Strip}
```
Если мы изменим программу так, чтобы s был создан из t, а не &t, вызовы SetInt() и SetString() завершились бы паникой, поскольку поля t не были бы устанавливаемыми.

Конец статьи.