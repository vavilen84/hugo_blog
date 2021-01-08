---
title: "Overview: RedBeanPHP ORM"
date: "2019-05-15"
categories:
  - "php"
tags:
  - "orm"
  - "overview"
  - "redbeanphp"
---

[ORM Website](https://redbeanphp.com/index.php?p=/quick_tour)

## Create temp DB

Will be destroyed after system reboot
```
 R::setup();
```

## Connecting to a permanent DB
```
R::setup( 'mysql:host=localhost;dbname=mydatabase', 'myusername', 'mypassword' );
```

## Create table, add column, save record
```
$post = R::dispense( 'post' );
$post->title = 'My holiday';
$id = R::store( $post );
```


ORM will define the size of the column from the example above depending on a text length. If we try to save more - type will be changed. It is called "fluid mode". Some types are immutable.For example, if we want to store the date 2005-01-01 ORM will not change it to a TEXT type.   
ORM is not configurable. All ORM methods are static (Ex.: ORM::method()).

## Get record by ID
```
$post = R::load( 'post', $id );
```

## Get property
```
echo $post->title;
```

Array access 
```
echo $post['title'];
```

## Delete record
```
R::trash( $post );
```

## Block record
```
R::loadForUpdate()
```

## SQL
```
R::getWriter()->setSQLSelectSnippet( ... );
```

## Find all records with 'holiday' word
```
$posts = R::find(
    'post', ' title LIKE ?', [ 'holiday' ] 
);
```

QueryBuilder is absent, need to use SQL

```
$books = R::getAll(
    'SELECT * FROM book WHERE price < ? ', [ 50 ] 
);
```

## Add photo to post
```
$post->ownPhotoList[] = $photo1;
$post->ownPhotoList[] = $photo2;
R::store( $post );
```

## Related entities list

The name of a list should be in accordance with related type. Example: $post->ownPhotoList: $post->own'Photo'List: The type is 'Photo'. Type Comments should have a list name $post->ownCommentList.  

Get first photo from list
```
$post = R::load( 'post', $id );
$firstPhoto = reset( $post->ownPhotoList );
```

Here we can avoid SQL
```
$threePhotos = $post->with( 'LIMIT 3' )->ownPhotoList;
```

## Block DB mutation
```
R::freeze( TRUE );
```








