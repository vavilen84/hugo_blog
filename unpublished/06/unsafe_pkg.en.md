---
title: "Golang: unsafe package"
publishdate: "2021-06-06"
lastmod: "2021-06-06"
summary: "go"
categories:
- "golang"
tags:
- "book notes"
---

{{<the_go_pl_notes_en >}}

https://golang.org/src/unsafe/unsafe.go

# ArbitraryType
```
// ArbitraryType is here for the purposes of documentation only and is not actually
// part of the unsafe package. It represents the type of an arbitrary Go expression.
type ArbitraryType int
```

# type Pointer
Pointer represents a pointer to an arbitrary type.
```
type Pointer *ArbitraryType
```
