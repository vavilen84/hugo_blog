---
title: "Обзор: RedBeanPHP ORM"
date: "2019-05-15"
categories:
  - "php"
tags:
  - "orm"
  - "overview"
  - "redbeanphp"
---

Быстрый старт https://redbeanphp.com/index.php?p=/quick_tour

## Создать временную базу

Исчезнет после перезагрузки системы
```
 R::setup();
```

## Подключение к "постоянной" базе
```
R::setup( 'mysql:host=localhost;dbname=mydatabase', 'myusername', 'mypassword' );
```

## Создать таблицу, добавить колонку, сохранить запись
```
$post = R::dispense( 'post' );
$post->title = 'My holiday';
$id = R::store( $post );
```

В примере выше ORM само определит размер ячейки исходя из длинны текста. 
А если захотим сохранить больше, тип будет переопределен. Это называется "fluid mode". Некоторые типы неизменны. 
Например, если мы храним дату 2005-01-01, ORM не переопределит тип на TEXT.

ORM не конфигурируется. Не надо создавать объекты - все методы ORM являются статическими.

## Достать запись по ID
```
$post = R::load( 'post', $id );
```

## Получить свойство записи
```
echo $post->title;
```

Также, можно обращаться как к массиву
```
echo $post['title'];
```

## Удалить запись 
```
R::trash( $post );
```

## Заблокировать запись
```
R::loadForUpdate()
```

## SQL
```
R::getWriter()->setSQLSelectSnippet( ... );
```

## Найти запись - все записи, которые содержат слово holiday
```
$posts = R::find(
    'post', ' title LIKE ?', [ 'holiday' ] 
);
```

QueryBuilder отсутствует, нужно использовать SQL

```
$books = R::getAll(
    'SELECT * FROM book WHERE price < ? ', [ 50 ] 
);
```

## Добавляем фото к посту 
```
$post->ownPhotoList[] = $photo1;
$post->ownPhotoList[] = $photo2;
R::store( $post );
```

## Список связанных типов

Имя списка должно соответствовать имени связанного типа. $post->ownPhotoList: $post->own'Photo'List: Тип - Photo.<br>
Тип Comments будет иметь имя списка $post->ownCommentList. Тип Notes - $post->ownNoteList.

Получить первое фото из списка 
```
$post = R::load( 'post', $id );
$firstPhoto = reset( $post->ownPhotoList );
```

Тут можно обойтись без SQL запроса 
```
$threePhotos = $post->with( 'LIMIT 3' )->ownPhotoList;
```

## Блокирование динамического изменения базы данных
```
R::freeze( TRUE );
```








