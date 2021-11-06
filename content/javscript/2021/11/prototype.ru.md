---
title: "JS: Prototype"
publishdate: "2021-11-02"
summary: "js"
categories:
  - "js"
tags:
  - "prototype"
  - "javascript"
---
  
# Прототипное наследование

Ссылки:
- https://developer.mozilla.org/ru/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
- https://learn.javascript.ru/prototype-inheritance

Изменение прототипа
```
let A = {
    a: 1
};
let B = {};
Object.setPrototypeOf(B, A);
console.log(B.a);
```
вывод
```
1
```

```
let A = {
a: 1
};
let B = {};
Object.setPrototypeOf(B, A);
B.a = 2
console.log(B.a);
console.log(A);
console.log(B);
```
вывод
```
2
{ a: 1 }
{ a: 2 }
```

```
let A = {
    a: 1,
    b: function(){
        this.a = 2
    }
};
let B = {};
Object.setPrototypeOf(B, A);
B.b();
console.log(A);
console.log(B);
```
вывод
```
{ a: 1, b: [Function: b] }
{ a: 2 }
```