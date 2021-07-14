---
title: "Пакет database/sql"
publishdate: "2021-07-14"
lastmod: "2021-07-14"
summary: "go"
categories:
- "golang"
tags:
- "go packages"
---

# Пакет database/sql

## Подключение к базе данных

Иницилизация дальнейших подключений к базе
```
import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

func main(){
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
	if err != nil {
		panic("failed to connect sql server: " + err.Error())
	}
	fmt.Println(db.Stats().OpenConnections)
}
```
вывод
```
0
```
как мы можем видеть, sql.Open не создает подключений к базе. Но вызов Ping создаст его
```
import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

func main(){
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
	if err != nil {
		panic("failed to connect sql server: " + err.Error())
	}
	err = db.Ping()
	if err != nil {
		panic("ping error: " + err.Error())
	}
	fmt.Println(db.Stats().OpenConnections)
}
```
вывод
```
1
```

## метод db.Query()

Вызывать Ping для создания соединений не обязательно. В документации указано, что пакет создает и освобождает соединения 
автоматически https://github.com/golang/go/blob/go1.16/src/database/sql/sql.go#L394. Но это не совсем так. 
```
func main(){
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
	if err != nil {
		panic("failed to connect sql server: " + err.Error())
	}
	rows, err := db.Query("SELECT * FROM product")
	defer rows.Close()
	if err != nil {
		panic("query error: " + err.Error())
	}
	fmt.Println(db.Stats().OpenConnections)
}
```
Вызов db.Query создаст новое, или возьмет свободное подключение к базе данных. Результатом вызова будут *sql.Rows и error. 
Вызов rows.Close() освобождает соединение с базой данных. Пример https://golang.org/pkg/database/sql/#example_DB_QueryContext
```
rows, err := db.Query(q, age)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
    ...
}
```
В документации написано, что rows будут закрыты автоматически, если вызов rows.Next() вернет false, т.е., 
если мы получили все результаты в цикле. Но, примеры в документации предписывает все таки вызывать rows.Close() при помощи 
отложенного вызова defer, на случай ошибок
```
rows, err := db.Query(q, age)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
    ...
	if err := rows.Scan(&name); err != nil {
        // rows будут закрыты вызовом defer rows.Close()
        log.Fatal(err)
    }
}
```

## Context

context в запросах используется для остановки текущих запросов по таймауту и передачи произвольных значений. 
Будьте осторожны: если ctx уже невалиден - rows будет nil
```
func main(){
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
	if err != nil {
		panic("failed to connect sql server: " + err.Error())
	}
	ctx, _ := context.WithTimeout(context.Background(),  1 * time.Millisecond)
	time.Sleep(1 * time.Second)
	rows, err := db.QueryContext(ctx, "SELECT * FROM product")
	if err != nil {
		fmt.Println(rows == nil)
		log.Fatal("fatal error:", err)
	}
	defer rows.Close()
	for rows.Next() {

	}
}
```
вывод
```
true
2021/07/12 16:16:21 fatal error:context deadline exceeded
exit status 1
```
т.е., если нам потребуется продолжить обработку запроса (не выходить при помощи log.Fatal()), мы можем получить ошибку
```
func main(){
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
	if err != nil {
		panic("failed to connect sql server: " + err.Error())
	}
	ctx, _ := context.WithTimeout(context.Background(),  1 * time.Millisecond)
	time.Sleep(1 * time.Second)
	rows, err := db.QueryContext(ctx, "SELECT * FROM product")
	if err != nil {
		fmt.Println(err)
	}
	defer rows.Close()
	for rows.Next() {

	}
}
```
вывод
```
true
2021/07/12 16:16:21 fatal error:context deadline exceeded
exit status 1
vavilen@vavilen-B550M-AORUS-ELITE:~/www/hugo_blog/tmp$ go run db.go 
context deadline exceeded
panic: runtime error: invalid memory address or nil pointer dereference
        panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x4d3b16]

goroutine 1 [running]:
database/sql.(*Rows).close(0x0, 0x0, 0x0, 0x0, 0x0)
```

## Лимит соединений

Необходимо устанавливать лимиты подключений во избежание утечек памяти
```
db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
if err != nil {
    panic("failed to connect sql server: " + err.Error())
}
db.SetMaxOpenConns(10)
db.SetMaxIdleConns(10)
```

## db.QueryContext или conn.QueryContext

Как было упомянуто ранее, вызов db.Query создаст новое, или возьмет существующее новое подключение. 
```
db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
if err != nil {
    panic("failed to connect sql server: " + err.Error())
}
rows, err := db.QueryContext(context.Background(), "SELECT * FROM product")
```
Соответственно, нам нет нужнды вызывать conn.QueryContext следующим образом для выполнения запроса
```
db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
if err != nil {
    panic("failed to connect sql server: " + err.Error())
}
conn, err := db.Conn(context.Background())
rows, err := conn.QueryContext("SELECT * FROM product")
```
Ho, использование и передача conn как аргумента функции может быть полезна при использовании транзакци. Пример
```
tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
err = model.Create(ctx, conn)
assert.Nil(t, err)
tx.Rollback()
```

Конец статьи.