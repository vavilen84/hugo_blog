---
title: "Big O evaluation for beginners"
publishdate: "2021-04-21"
lastmod: "2021-04-21"
summary: "go"
categories:
- "algorithms"
tags:
- "algorithms"
- "Big O"
---

Sources:

- "Complete Algorithms Complexity and Big O Notation Course" https://www.udemy.com/course/algorithms-complexity/ (Author highly recommend this course)
- [wikipedia "Time complexity"](https://en.wikipedia.org/wiki/Time_complexity)

Big O - the dependence of the growth of algorithm execution time (time complexity) / memory consumption (space complexity)
 on the growth of input data.

## Complexity evaluation: simplification

We can simplify complexity evaluation by ignoring complexities which have lower growth. For example, 
O(N{{< exp >}}2{{< /exp >}} + N) can be simplified to O(N{{< exp >}}2{{< /exp >}}). 

But, if we have O(N{{< exp >}}2{{< /exp >}} + B) and we dont know B - we are not able to simplify B. So, complexity is O(N{{< exp >}}2{{< /exp >}} + B).

Complexity O(2{{< exp >}}n{{< /exp >}} + N{{< exp >}}100{{< /exp >}}) can be simplified to O(2{{< exp >}}n{{< /exp >}}).

## Complexities sum

```
func sum(a, b []int) (res int) {
	for k := range a { // N
		res += a[k] // 1
	}
	for k := range b { // K
		res += b[k] // 1
	}
	return
}
```
complexity is O((N * 1) + (K * 1)) = O(N+K)

## Complexities multiplication
```
func multi(a [][]int) (res int) {
	for v := range a { // N
		for h := range a[v] { // L
			res += a[v][h] // 1
		}
	}
	return
}
```
complexity is O(N * (L * 1)) = O(N * L)

## Complexities

{{<table "table table-bordered">}}
| Complexity | Designation | Effectiveness |
|-----------|-------------|--------------|
| Constant   | O(1)   | excellent   |
| Logarithmic   | O(log N)    | excellent   |
| Sublinear   | O({{< html >}}&radic;{{< /html >}}N)   | excellent   |
| Linear   | O(N)   | good  |
| Linearithmic   | O(N log N)   | normal   |
| Quadratic   | O(N{{< exp >}}2{{< /exp >}})   | bad  |
| Cubic   | O(N{{< exp >}}3{{< /exp >}})  | bad   |
| Polynomial   | O(N^{{< exp >}}3{{< /exp >}})  | bad   |
| Exponential   | O(2^{{< exp >}}n{{< /exp >}})   | bad   |
| Factorial  | O(N!)  | bad  |
{{</table>}}

Vertical - execution time; horizontal - input length
![](/posts/big_o_graph_en.png)

## Constant complexity - O(1)

```
func sum(a, b int) int {
    return a + b // 1
}
```
given function will always execute a single operation not depending on a or b value. So, the complexity is constant O(1).

## Linear complexity - O(N)

```
func findOffset(needle int, haystack []int) int {
	for k := range haystack // N {
		if haystack[k] == needle { // 1
			return k // 1
		}
	}
	return -1 // 1
}
```
complexity is O((N * 1) + 1) = O(N). The number of loop iterations inside the findOffset function linearly depends on
the number of items in the haystack:
- with haystack length equal to 2, the maximum possible number of iterations will be equal to 2
- with haystack length equal to 10, the maximum possible number of iterations will be equal to 10
etc...

Consider a recursive function
```
func sum(n int) int {
	if n == 1 { // 1
		return n  // 1
	}
	return n + sum(n-1) // 1 + N
}
```
time complexity is O(1 + (1 + N)) or just linear O(N). The number of recursive call operations will grow
proportional to the value of n.

## Quadratic O(N{{< exp >}}2{{< /exp >}}) and cubic O(N{{< exp >}}3{{< /exp >}}) complexities

```
for keyA := range a { // N
    for keyB := range a { // N
        ...
    }
}
```
nested loop has quadratic complexity O(N * N) = O(N{{< exp >}}2{{< /exp >}}). Two nested loop has cubic complexity O(N * N * N) = O(N{{< exp >}}3{{< /exp >}}):
```
for keyA := range a { // N
    for keyB := range a { // N
        for keyC := range a { // N
            ...
        }
    }
}
```

## Logarithmic сложность
```
func iterate(a []int) (res int) {
	for {
		...
		if len(a) == 1 {
			break
		}
		a = a[len(a)/2:]
	}
	return
}
```
for an algorithm where half of the elements are taken at each iteration, the complexity will include O(log N). For example,
binary search algorithm.

## Time complexity evaluation

Предположим, алгоритм имеет два цикла и одну константную по времени операцию
```
func algo(n []int) int {
    res := 0
    for k := range n { // N
        res += n[k] // 1
    }
    for k := range n { // N
        res += n[k] // 1
    }
    res += 1 // 1
    return res
}
```
В результате мы имеем O((N * 1) + (N * 1) + 1) = O(N + N) или просто O(N).

Пример ниже имеет сложность O(1 + (N * 1) + (N * 1) + 1 + (N * (N + 1))) = O(N + N + N{{< exp >}}2{{< /exp >}}) или просто  O(N{{< exp >}}2{{< /exp >}})
```
func algO(N []int) int {
    res := 0 // 1
    for k := range n { N
        res += n[k] // 1
    }
    for k := range n { // N
        res += n[k] // 1
    }
    res += 1 // 1
    for k := range n { // N
		for c := range n { // N
			res += n[k] + n[c] // 1
		}
	}
    return res // 1
}
```

## Вычисление пространственной сложности

Алгоритм поиска максимума будет иметь константную O(1) пространственную сложность, так как расход памяти всегда будет
детерминирован (память выделяется только один раз):
```
func max(n []int) int {
	res := math.MinInt64 // 1
	for k := range n {
		if res < n[k] {
			res = a
		}
	}
	return res
}
```

Алгоритм слияния срезов будет иметь сложность O(A + B), т.к. для результирующего среза будет
выделен объем памяти пропорциональный длинне входных срезов:
```
func merge(a, b []int) []int {
	res := make([]int, len(a)+len(b))
	for k := range a {
		res[k] = a[k]
	}
	for k := range b {
		res[len(a)+k] = b[k]
	}
	return res
}
```

## Другие примеры вычисления сложности

### Циклы

Дано: функция содержит цикл и вызов другой функции:
```
func sumSequence(n int) int {
	res := 0 // 1
	for i := 0; i < n; i++ {  // N
		res += sum(i, i+1) // 1
	}
	return res
}

func sum(a, b int) int {
	return a + b // 1
}
```
Временная сложность: O(1 + (N * 1)) = O(N); пространственная сложность - константная O(1).

Давайте сравним две функции
```
func minMax(n []int) (min, max int) {
	min = math.MaxInt64 
	max = math.MinInt64
	for k := range n { // N
		if n[k] < min { // 1
			min = n[k] // 1
		}
		if n[k] > max {
			max = n[k] // 1
		}
	}
	return
}
```
сложность O(N * (1 + 1)) или просто O(N)
```
func minMax(n []int) (min, max int) {
	min = math.MaxInt64
	max = math.MinInt64
	for k := range n { // N
		if n[k] < min { // 1
			min = n[k] // 1
		}
	}
	for k := range n { // N
		if n[k] > max { // 1
			max = n[k] // 1
		}
	}
	return
}
```
сложность O((N * (1 * 1)) + (N * (1 * 1))) или просто O(N). Пространственная сложность - константная.

Рассмотрим данные вложенные циклы
```
for i := 0; i < N; i++ { // N
    for j := 0; j < N; j++ { // N
        foo()
    }
}
```
```
for i := 0; i < N; i++ { // N
    for j := i; j < N; j++ { // N
        foo()
    }
}
```
из иллюстрации ниже мы видим, что во втором примере вложенный цикл уменьшается ровно на половину
![](/posts/big_o_nested_loops.png)
соответственно, для второго примера сложность будет O(N{{< exp >}}2{{< /exp >}}/2) или просто квадратичная O(N{{< exp >}}2{{< /exp >}})

Пример ниже не будет иметь кубическую сложность, т.к. сложность второго вложенного цикла - константа "100"
```
for i := 0; i < N; i++ { // N
    for j := 0; j < N; j++ { // N
        for c := 0; с < 100; j++ { // константа 100
            foo()
        }
    }
}
```

Пример ниже будет иметь сложность O(A*B), т.к. a и b различны
```
func foo(a, b []int) {
    for i := 0; i < a; i++ { // A  
        for j := 0; j < b; j++ { // B 
            ...
        }
    }
}
```

Пример ниже будет иметь сложность O(N/2) или просто O(N)
```
func foo(a []int){
    for i := 0; i < (len(a)/2); i++ {
        ...
    }
}
```

### Строки

Алгоритм сравнения строк посимвольно будет иметь линейную временную сложность:
```

func compareStrings(s1, s2 string) int {
	if len(s1) > len(s2) { // 1
		return 1
	}
	if len(s1) < len(s2) {  // 1
		return -1
	}
	for i := 0; i < len(s1); i++ { // N 
		if s1[i] > s2[i] { // 1
			return 1
		}
		if s1[i] < s2[i] { // 1
			return -1
		}
	}
	return 0 // 1
}
```

Алгоритм конкатенации строк будет иметь временную и пространственную сложности O(N + K)
```
func concatenateString(s1, s2 string) string {
	result := make([]byte, len(s1)+len(s2))
	for k := range []byte(s1) { // N
		result[k] += s1[k]
	}
	for k := range []byte(s2) {  // K 
		result[k+len(s1)] += s2[k]
	}
	return string(result)
}
```

Получение подстроки будет иметь временную и пространственную сложности O(end-start) или O(N-K)
```
func subString(input string, start, end int) string {
	result := make([]byte, end-start)
	for k := start; k < end; k++ {
		result[k-start] = input[k]
	}
	return string(result)
}
```

Давайте разберем следующий пример: дан массив строк, в нем надо отсортировать вначале сами строки, а, затем, и массив целиком
```
func sortStrings(a []string) {
    for k := range a { // N 
        a[k] = sortString(a[k]) // L * log L 
    }
    sortArr(a) // L * N * log N
}
```
цикл по диапазону 'a' имеет линейную зависимость O(N) от количества элементов в срезе 'a'. Предположим, что в качестве 
алгоритма сортировки мы используем сортировку слиянием, которая имеет сложность O(L log L). Следовательно, часть нашего 
алгоритма, которая сортируем строки в массиве будет иметь сложность O(N * L log L). Если мы используем сортировку 
слиянием и для сортировки всего среза целиком, то сложность будет O(L * N log N); L в данном случае - линейная 
зависимость от длинны строки для посимвольного сравнения. Итоговая сложность будет: 
O(N * L * log L + L * N * log N) = O(L * N * (log L + log N))

### Рекурсия

Для одного рекурсивного вызова сложность - O(N), т.к. foo будет вызвана N раз
```
func foo(n int) {
    if n == 1 {
        return
    }
    return foo(n-1) // раз
}
```

Для двух рекурсивных вызовов сложность экспоненциальная - O(2{{< exp >}}n{{< /exp >}}):
```
func foo(n int) {
    if n == 1 { // 1
        return
    }
    return foo(n-1) + foo(n-1)  
}
```

Конец статьи!
