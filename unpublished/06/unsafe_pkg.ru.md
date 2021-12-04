---
title: "Пакет unsafe в Golang"
publishdate: "2021-06-06"
lastmod: "2021-06-06"
summary: "golang"
categories:
- "golang"
tags:
- "book notes"
---

{{<the_go_pl_notes_ru >}}

https://golang.org/src/unsafe/unsafe.go

Пакет unsafe содержит операции, которые обходят безопасность типов программ Go.

# type ArbitraryType
ArbitraryType здесь только для целей документации и на самом деле не является частью пакета unsafe. 
Он представляет собой тип произвольного выражения Go.
```
type ArbitraryType int
```

# type Pointer
Тип Pointer представляет собой указатель на ArbitraryType.
```
type Pointer *ArbitraryType
```
