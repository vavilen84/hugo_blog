---
title: "Go runtime"
publishdate: "2021-08-06"
lastmod: "2021-08-06"
summary: "go"
categories:
- "golang"
tags:
- "go runtime"
---

Источники:
- Source code https://github.com/golang/go/blob/master/src/runtime/proc.go
- Планирование в Go: Часть I — Планировщик ОС https://habr.com/ru/post/478168/
- Scheduling In Go : Part I - OS Scheduler https://www.ardanlabs.com/blog/2018/08/scheduling-in-go-part1.html
- Антон Сергеев, «Go под капотом» https://www.youtube.com/watch?v=rloqQY9CT8I&t=818s
- Scalable Go Scheduler Design Doc https://docs.google.com/document/d/1TTj4T2JO42uD5ID9e89oa0sLKhJYD0Y_kqxDv3I3XMw/edit#

# Runtime

Runtime в Go - это окружение, в котором выполняется наша программа. Включает в себя:
- Планировщик
- Сборщик мусора
- Аллокатор памяти

# Планировщик (scheduler)

Задача планировщика - распределять готовые к запуску горутины по рабочим потокам.

## Сущности планировщика

### P

Структура P - это репрезентация процесса. Равно количеству ядер или GOMAXPROCS.
```
struct P
{
Lock;
G *gfree; // freelist, moved from sched
G *ghead; // runnable, moved from sched
G *gtail;
MCache *mcache; // moved from M
FixAlloc *stackalloc; // moved from M
uint64 ncgocall;
GCStats gcstats;
// etc
...
};
```