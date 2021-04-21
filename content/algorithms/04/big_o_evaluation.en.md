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

## Logarithmic complexity
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

Suppose the algorithm has two cycles and one time-constant operation
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
so, we have O((N * 1) + (N * 1) + 1) = O(N + N) or just O(N).

Next example has complexity O(1 + (N * 1) + (N * 1) + 1 + (N * (N + 1))) = O(N + N + N{{< exp >}}2{{< /exp >}}) or just  O(N{{< exp >}}2{{< /exp >}})
```
func algo(n []int) int {
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

## Space complexity evaluation

Next algorithm has constant O(1) space complexity, since the memory consumption will always be
deterministic (memory is allocated only once):
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

Next algorithm has O(A + B) complexity, because for the resulting slice will be
allocated memory space proportional to the length of the input slices:
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

## Other examples 

### Loops

Suppose, the function contains a loop and to another function call:
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
so, time complexity is O(1 + (N * 1)) = O(N); space complexity is O(1).

Let`s compare two functions
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
complexity is O(N * (1 + 1)) or just O(N)
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
complexity is O((N * (1 * 1)) + (N * (1 * 1))) or just O(N). Space complexity is constant.

Consider next nested loops
```
for i := 0; i < n; i++ { // N
    for j := 0; j < n; j++ { // N
        foo()
    }
}
```
```
for i := 0; i < n; i++ { // N
    for j := i; j < n; j++ { // N
        foo()
    }
}
```
if n = 4, then first loop has O(N{{< exp >}}2{{< /exp >}}) and the second O(N{{< exp >}}2{{< /exp >}}/2) or just O(N{{< exp >}}2{{< /exp >}}).

Next example doesnt have cubic complexity, because the complexity of the second nested loop is constant 100:
```
for i := 0; i < N; i++ { // N
    for j := 0; j < N; j++ { // N
        for c := 0; с < 100; j++ { // constant 100
            foo()
        }
    }
}
```

Next example complexity is O(A*B), because a and b are different
```
func foo(a, b []int) {
    for i := 0; i < a; i++ { // A  
        for j := 0; j < b; j++ { // B 
            ...
        }
    }
}
```

Next example complexity is O(N/2) or just O(N)
```
func foo(a []int){
    for i := 0; i < (len(a)/2); i++ {
        ...
    }
}
```

### Strings

Next strings compare algorithm complexity is linear:
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

Strings concatenation algorithm has O(N + K) time and space complexities:
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

Getting substring  algorithm has  O(end-start) or O(N-K)  time and space complexities:
```
func subString(input string, start, end int) string {
	result := make([]byte, end-start)
	for k := start; k < end; k++ {
		result[k-start] = input[k]
	}
	return string(result)
}
```

Suppose we have array of strings and we need to sort strings firstly and then the whole array:
```
func sortStrings(a []string) {
    for k := range a { // N 
        a[k] = sortString(a[k]) // L * log L 
    }
    sortArr(a) // L * N * log N
}
```
range loop 'a' has linear complexity O(N) depending on 'a' length. Suppose we use merge sort which complexity is O(L log L). 
So, the part of algorithm which sorts strings complexity should be O(N * L log L). If we use merge sort for the whole 
array sorting the complexity should be O(L * N log N); L describes string length used in symbol by symbol comparison.
So, result complexity is O(N * L * log L + L * N * log N) = O(L * N * (log L + log N))

### Recursion

One recursion call complexity is linear - O(N)
```
func foo(n int) {
    if n == 1 {
        return
    }
    return foo(n-1)
}
```

Two recursion calls complexity is exponential - O(2{{< exp >}}n{{< /exp >}}):
```
func foo(n int) {
    if n == 1 { // 1
        return
    }
    return foo(n-1) + foo(n-1)  
}
```

The end of the article!
