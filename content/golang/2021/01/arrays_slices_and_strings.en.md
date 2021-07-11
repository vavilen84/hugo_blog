---
title: "Arrays, slices and strings. The mechanics of append"
publishdate: "2021-01-01"
lastmod: "2021-07-11"
summary: "go"
categories:
  - "golang"
tags:
  - "slices"
  - "translations"
---

This article is RU translation of the https://blog.golang.org/slices article.

# Author notes

Be careful with ‘copy’

Next code
```
a := make([][]string, 1)
a = [][]string{{"a"}}
b := make([][]string, 1)
copy(b, a)
a[0][0] ="b"
fmt.Println(a)
fmt.Println(b)

c := make([]string, 1)
c = []string{"a"}
d := make([]string, 1)
copy(d, c)
c[0] ="b"
fmt.Println(c)
fmt.Println(d)
```
will output
```
[[b]]
[[b]]
[b]
[a]
```

It is logical to assume that in the first case, the slice header was copied, which contained a link to the underlying
array. And in the second case, the strings were copied.

The end of the article!