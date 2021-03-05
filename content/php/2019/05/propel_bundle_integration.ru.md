---
title: "Symfony + PropelBundle"
publishdate: "2019-05-15"
summary: "php"
categories:
  - "php"
tags:
  - "orm"
  - "integration"
  - "propel"
  - "symfony"
---

https://github.com/propelorm/PropelBundle (бандл не поддерживается сообществом)

Текущая интеграция использует Symfony4

Добавляем бандл в composer.json
```
{
    "require": {
        "propel/propel": "2.0.*@dev",
        "propel/propel-bundle": "~4.0@dev",
    },
    "autoload": {
        "psr-4": {
            "propel\\": "propel/"
        }
    }
}
```

Конфигурируем
```
# services.yaml
parameters:
    database_adapter:  pgsql
    database_host:     postgres
    database_name:     symfony
    database_user:     symfony
    database_password: pass123456
    
# propel.yaml
propel:
  paths:
    schemaDir: "%env(resolve:WORKING_DIR)%/propel/Schema"
    migrationDir: "%env(resolve:WORKING_DIR)%/propel/Migrations"
  database:
    connections:
      default:
        adapter:    "%database_adapter%"
        user:       "%database_user%"
        password:   "%database_password%"
        dsn:        "%database_driver%:host=%database_host%;dbname=%database_name%"
        
```

Схема должна быть описана как XML. Альтернативные пути:
- генерируем пустую миграцию, добавляем SQL, прогоняем миграцию, генерируем XML на основе существующей бд
- генерируем бд доктриной, потом генерируем XML

Генерируем XML из существующей бд
```
$ bin/console propel:database:reverse
```

Создаем схему. Добавлем папку 'propel' в корень проекта, добавлем файл schema.xml с содержимым:
```
<?xml version="1.0" encoding="utf-8"?>
<database name="default" defaultIdMethod="native" defaultPhpNamingMethod="underscore" namespace="propel\Models">
    <table name="category" idMethod="native" phpName="Category">
        <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
        <column name="title" phpName="Title" type="VARCHAR" size="255" defaultValue="NULL" required="true"/>
    </table>
    <table name="post" idMethod="native" phpName="Post">
        <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
        <column name="title" phpName="Title" type="VARCHAR" size="255" defaultValue="NULL" required="true"/>
        <column name="content" phpName="Content" type="LONGVARCHAR" required="true"/>
        <column name="category_id" phpName="CategoryName" type="INTEGER"/>
        <foreign-key foreignTable="category">
            <reference local="category_id" foreign="id"/>
        </foreign-key>
    </table>
    <table name="tag" idMethod="native" phpName="Tag">
        <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
        <column name="title" phpName="Title" type="VARCHAR" size="255" defaultValue="NULL" required="true"/>
    </table>
    <table name="post_2_tag" isCrossRef="true">
        <column name="post_id" type="integer" primaryKey="true"/>
        <column name="category_id" type="integer" primaryKey="true"/>
        <foreign-key foreignTable="post">
            <reference local="post_id" foreign="id"/>
        </foreign-key>
        <foreign-key foreignTable="category">
            <reference local="category_id" foreign="id"/>
        </foreign-key>
    </table>
</database>
```

Генерируем модели
```
$ bin/console propel:model:build
```

должна быть выброшена ошибка с требованием добавить неймспейс. Добавляем:
```
<database name="default" defaultIdMethod="native" defaultPhpNamingMethod="underscore" namespace="propel\Models">
```

Перемещаем модели из path/to/project/src/propel/Models в path/to/project/propel/Models чтобы избежать проблем с автозагрузкой 

Создаем миграции на основе XML:
```
$ bin/console propel:migration:diff
```

Запуск миграций:
```
$ bin/console propel:migration:up
```

Теперь бд должна быть сгенерирована.

Каждая сущность теперь имеет 4 класса моделей:
- Пустая модель унаследованная от базовой
- Базовая "active record" модель
- Map class
- Query class (конструктор запросов)
- Класс-связка (если есть связь many-to-many)

Созранияем запись внутри транзакции
```
public function savePost(Post $post)
{
    $throwException = false; //test method
    $connection = Propel::getWriteConnection(PropelConstant::DEFAULT_CONNECTION);
    $connection->beginTransaction();
    try {
        ...
        $post->save();

        $connection->commit();
    } catch (Exception $e) {
        $connection->rollback();
        throw $e;
    }
}
```

Находим все записи
```
use propel\Models\CategoryQuery;
...
/** @var ObjectCollection $categories */
$categories = CategoryQuery::create()
    ->find();
$result = $categories->getData();
```

Создаем категорию
```
use propel\Models\CategoryQuery;
...
$model = new Category();
$model->setTitle('Cat 1);
$model->save();
```

Удалить
```
$model->delete();
```

Найти по ID
```
$query = new CategoryQuery();
$model = $query->findOneById($id);

return $model;
```

Найти по title
```
$tag = TagQuery::create()
    ->findOneByTitle($title);

return $tag;
```

Удалить все связи post2tag
```
Post2TagQuery::create()->filterByPost($post)->delete();
```

Добавить связанные сущности
```
/** @var $tag Tag */
/** @var $post Post */
$post->addTag($tag);
$post->save();
```

Найти все теги по посту
```
$tags = TagQuery::create()->filterByPost($post)->find();
$string = $this->getTagsString($tags->getData());

return $string;
```

или так
```
$post->getTags()
```

Все!

