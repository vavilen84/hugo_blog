---
title: "Interfaces and reflection in Golang"
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

{{<the_go_pl_notes_en >}}

Rob Pike 'The Laws of Reflection' https://blog.golang.org/laws-of-reflection

# Interface

## Interface composition

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

Interface assertion
```
// *bytes.Buffer must implement io.Writer
var _ io.Writer = (*bytes.Buffer)(nil)
```

Possible errors
```
var w io.Writer
w = os.Stdout         // OK: *os.File has method Write
w = new(bytes.Buffer) // OK: *bytes.Buffer has method Write
w = time.Second       // ERROR: у time.Duration has no method Write

var rwc io.ReadWriteCloser
rwc = os.Stdout         // OK: *os.File has methods Read, Write, Close
rwc = new(bytes.Buffer) // ERROR: у *bytes.Buffer has no method Close
```

## Receiver

The method is available for the pointer but not for the struct
```
type IntSet struct { /* ... */ }
func (*IntSet) String() string
var _ = IntSet{}.String() // ERROR: String requires pointer *IntSet
```

But the method is available for a variable which contains value
```
var s IntSet
var _ = s.String() //OK: s is a var; &s has method String
```

But, only *IntSet has method String. So, only *IntSet implements fmt .Stringer:
```
var _ fmt.Stringer = &s // OK
var _ fmt.Stringer = s // ERROR: у IntSet has no method String
```

## Interface implementation

```
type iface struct {
    tab  *itab
    data unsafe.Pointer
}
```
The 'tab' — is a pointer to Interface Table or itable — struct which stores metadata about type and list of methods. The 'data' - is a pointer to a copy of the data (if a variable was assigned to the interface). Example:

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
	s.SayHello() // "Hello"
}
```

![](/posts/go_interfaces_1.png)

### itable

itable should be generated during runtime
```
var s Speaker = string("test") // compile-time error
var s Speaker = io.Reader // compile time error
var h string = Human{} // compile time error
var s interface{}; h = s.(Human) // runtime error
```

### cast

Check interface type
```
switch x := x.(type) {
    case int:
        ...
}
```

Go catches types inconsistencies during compiling, but casting to an interface — during runtime. Safe casting:
```
if s, ok := h.(Speaker); !ok { ... }
```

## Empty interface

Empty interface may contain any value
```
var any interface{}
any = true
any = 12.34
any = "hello"
any = map[string]int{"one": 1}
any = new(bytes.Buffer)
```

It also stores data and type.

```
var c interface{}
c = 123
fmt.Printf("%+v\r\n", c)
fmt.Printf("%T\r\n", c)
```
output
```
123
int
```

# Reflect

A variable of interface type stores a pair: the concrete value assigned to the variable, and that value's type descriptor.
```
var r io.Reader
tty, err := os.OpenFile("/dev/tty", os.O_RDWR, 0)
if err != nil {
    return nil, err
}
r = tty
```
r contains, schematically, the (value, type) pair, (tty, *os.File). Notice that the type *os.File implements methods other than Read. That's why we can do things like this:
```
var w io.Writer
w = r.(io.Writer) // the type implements io.Writer
```
Continuing, we can do this::
```
var empty interface{}
empty = w
```
We don't need a type assertion here because it's known statically that w satisfies the empty interface.

One important detail is that the pair inside an interface always has the form (value, concrete type) and cannot have the form (value, interface type). Interfaces do not hold interface values.

## reflect

At the basic level, reflection is just a mechanism to examine the type and value pair stored inside an interface variable. 
To get started, there are two types we need to know about in: reflect.Type and reflect.Value.
Those two types give access to the contents of an interface variable, and two simple functions, called reflect.TypeOf and reflect.ValueOf, retrieve reflect.Type and reflect.Value pieces out of an interface value. Also, from the reflect.Value it's easy to get to the reflect.Type.

## laws of reflection

1. Reflection goes from interface value to reflection object.

At the basic level, reflection is just a mechanism to examine the type and value pair stored inside an interface variable.
To get started, there are two types we need to know about in: reflect.Type and reflect.Value.
Those two types give access to the contents of an interface variable, and two simple functions, called reflect.TypeOf and reflect.ValueOf, retrieve reflect.Type and reflect.Value pieces out of an interface value. Also, from the reflect.Value it's easy to get to the reflect.Type.

the signature of reflect.TypeOf includes an empty interface:
```
// TypeOf returns the reflection Type of the value in the interface{}.
func TypeOf(i interface{}) Type
```
When we call reflect.TypeOf(x), x is first stored in an empty interface, which is then passed as the argument; reflect.TypeOf unpacks that empty interface to recover the type information. The reflect.ValueOf function, of course, recovers the value.

2. Reflection goes from reflection object to interface value.

Given a reflect.Value we can recover an interface value using the Interface method; in effect the method packs the type and value information back into an interface representation and returns the result:
```
// Interface returns v's value as an interface{}.
func (v Value) Interface() interface{}
```
```
y := v.Interface().(float64) // y has type float64.
fmt.Println(y)
```

3. To modify a reflection object, the value must be settable.

Further, in more detail about these laws.

## TypeOf()

get type
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
output
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
output
```
type: float64
kind is float64: true
value: 3.4
```

```
var x float64 = 3.4
fmt.Println("value:", reflect.ValueOf(x).String())
```
output
```
value: <float64 Value>
```

the "getter" and "setter" methods of Value operate on the largest type that can hold the value: int64 for all the signed integers, for instance. That is, the Int method of Value returns an int64 and the SetInt value takes an int64; it may be necessary to convert to the actual type involved:
```
var x uint8 = 'x'
v := reflect.ValueOf(x)
fmt.Println("type:", v.Type())
fmt.Println("kind is uint8: ", v.Kind() == reflect.Uint8)
x = uint8(v.Uint())  // v.Uint вернёт uint64.
```
output
```
type: uint8
kind is uint8: true
```

The second property is that the Kind of a reflection object describes the underlying type, not the static type:
```
type MyInt int
var x MyInt = 7
v := reflect.ValueOf(x) // v имеет тип Value.
fmt.Println(v.Type())
fmt.Println(v.Kind())
```
output
```
main.MyInt
int
```
v.Kind() == reflect.Int. Kind can only take values of built-in types.

## Interface()

Given a reflect.Value we can recover an interface value using the Interface method; in effect the method packs the type and value information back into an interface representation and returns the result:
```
// Interface returns v's value as an interface{}.
func (v Value) Interface() interface{}
```
```
y := v.Interface().(float64) // y will have typefloat64.
fmt.Println(y)
```
In short, the Interface method is the inverse of the ValueOf function, except that its result is always of static type interface{}.

## settability

To change the reflection object, the value must be settable. This code does not work, but it deserves attention.
```
var x float64 = 3.4
v := reflect.ValueOf(x)
v.SetFloat(7.1) // Error
```
If you run this code, it will panic with the cryptic message:
```
panic: reflect.Value.SetFloat using unaddressable value
```

```
var x float64 = 3.4
v := reflect.ValueOf(x)
fmt.Println("settability of v:", v.CanSet())
```
output
```
settability of v: false
```

When we say:
```
var x float64 = 3.4
v := reflect.ValueOf(x)
```
we pass a copy of x to reflect.ValueOf, so the interface value created as the argument to reflect.ValueOf is a copy of x, not x itself. Thus, if the statement:
```
v.SetFloat(7.1)
```
were allowed to succeed, it would not update x, even though v looks like it was created from x. Instead, it would update the copy of x stored inside the reflection value and x itself would be unaffected. That would be confusing and useless, so it is illegal, and settability is the property used to avoid this issue.

If we want f () to change x directly, we must pass a pointer to x to our function:
```
var x float64 = 3.4
p := reflect.ValueOf(&x) 
fmt.Println("type of p:", p.Type())
fmt.Println("settability of p:", p.CanSet())
```
output
```
type of p: *float64
settability of p: false
```
The reflection object p isn't settable, but it's not p we want to set, it's (in effect) *p. To get to what p points to, we call the Elem method of Value, which indirects through the pointer, and save the result in a reflection Value called v::
```
v := p.Elem()
fmt.Println("settability of v:", v.CanSet())
```
Now v is a settable reflection object, as the output demonstrates:
```
settability of v: true
```
and since it represents x, we are finally able to use v.SetFloat to modify the value of x:
```
v.SetFloat(7.1)
fmt.Println(v.Interface())
fmt.Println(x)
```
output, as expected
```
7.1
7.1
```
Just keep in mind that reflection.Value needs the address of a variable in order to change it.

## Structs

Here is a simple example that parses the value of a struct
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
output
```
0: A int = 23
1: B string = skidoo
```
only exported fields are settable
```
s.Field(0).SetInt(77)
s.Field(1).SetString("Sunset Strip")
fmt.Println("t is now", t)
```
output
```
t is now {77 Sunset Strip}
```
If we change the program so that s is created from t and not & t, calls to SetInt () and SetString () would panic,
since the t fields would not be settable.

The end of the article.