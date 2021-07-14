---
title: "database/sql package"
publishdate: "2021-07-14"
lastmod: "2021-07-14"
summary: "go"
categories:
- "golang"
tags:
- "go packages"
---

# database/sql package

## Initialize further DB connections

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
output
```
0
```
As we can see, sql.Open does not create a connection to the database. But Ping call will create it
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
output
```
1
```

## db.Query() method

It is not mandatory to call Ping for db connection creation. Documentation tells, that package creates and releases 
connections automatically https://github.com/golang/go/blob/go1.16/src/database/sql/sql.go#L394. But, it is not so
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
db.Query call will create new or take free connection. The call result is: *sql.Rows & error.
rows.Close() call releases db connection. Example: https://golang.org/pkg/database/sql/#example_DB_QueryContext
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
Documentation tells, that rows will be closed automatically if rows.Next() call returns false, i.e., we got all data.
But, documentation example tells that we must call defer rows.Close() in a case of errors
```
rows, err := db.Query(q, age)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
    ...
	if err := rows.Scan(&name); err != nil {
        // rows will be closed by defer rows.Close() call
        log.Fatal(err)
    }
}
```

## Context

context can be used for timeout queries cancellation and passing any data.
Be careful: if ctx is not valid - rows will be nil
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
output
```
true
2021/07/12 16:16:21 fatal error:context deadline exceeded
exit status 1
```
i.e., if we need further query processing (not stop program by log.Fatal() calling), we can get error
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
output
```
context deadline exceeded
panic: runtime error: invalid memory address or nil pointer dereference
        panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x4d3b16]

goroutine 1 [running]:
database/sql.(*Rows).close(0x0, 0x0, 0x0, 0x0, 0x0)
```

## Conenctions limits

We need to set connections limits in order to avoid memory leak
```
db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
if err != nil {
    panic("failed to connect sql server: " + err.Error())
}
db.SetMaxOpenConns(10)
db.SetMaxIdleConns(10)
```

## db.QueryContext or conn.QueryContext

As we mentioned before, db.Query call will create new or take free connection
```
db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
if err != nil {
    panic("failed to connect sql server: " + err.Error())
}
rows, err := db.QueryContext(context.Background(), "SELECT * FROM product")
```
So, we don`t have to call conn.QueryContext for query execution like this
```
db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/gocommerce")
if err != nil {
    panic("failed to connect sql server: " + err.Error())
}
conn, err := db.Conn(context.Background())
rows, err := conn.QueryContext("SELECT * FROM product")
```
But, we can use conn when we use transactions and pass it as func argument
```
tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
err = model.Create(ctx, conn)
assert.Nil(t, err)
tx.Rollback()
```

The end of the article.