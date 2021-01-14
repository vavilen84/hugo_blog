---
title: "Integration: Symfony + PropelBundle"
publishdate: "2019-05-15"
categories:
    - "php"
tags:
    - "orm"
    - "integration"
    - "propel"
    - "symfony"
---

https://github.com/propelorm/PropelBundle (bundle is not supported by community)

Current example is based on Symfony4

Add bundle to composer.json
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

Configure bundle
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

DB Schema should be described as XML. Alternative ways:
- generate empty migration, add SQL, run migration, generate XML based on existing DB.
- generate DB from Doctrine entities, then - generate XML
 
Generate XML from existing DB command
```
$ bin/console propel:database:reverse
```

Create own schema. Add to project root 'propel' folder, add file schema.xml with content:
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

Generate models
```
$ bin/console propel:model:build
```

should throw error with a requirement to create a namespace. Add a namespace:
```
<database name="default" defaultIdMethod="native" defaultPhpNamingMethod="underscore" namespace="propel\Models">
```

Move models from path/to/project/src/propel/Models to path/to/project/propel/Models in order to avoid problems with autoloading

Create migrations based on XML:
```
$ bin/console propel:migration:diff
```

Run migrations:
```
$ bin/console propel:migration:up
```

Now DB should be generated.

Each entity now has 4 model classes:
- Empty model without own methods inherited from base model
- Base 'active record' model
- Map class
- Query class (query builder)
- Middleware class if we have many-to-many relation

Save record within transaction
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

Find all
```
use propel\Models\CategoryQuery;
...
/** @var ObjectCollection $categories */
$categories = CategoryQuery::create()
    ->find();
$result = $categories->getData();
```

Create category
```
use propel\Models\CategoryQuery;
...
$model = new Category();
$model->setTitle('Cat 1);
$model->save();
```

Remove record
```
$model->delete();
```

Find by ID
```
$query = new CategoryQuery();
$model = $query->findOneById($id);

return $model;
```

Find by title
```
$tag = TagQuery::create()
    ->findOneByTitle($title);

return $tag;
```

Drop all post2tag relations
```
Post2TagQuery::create()->filterByPost($post)->delete();
```

Add related entities
```
/** @var $tag Tag */
/** @var $post Post */
$post->addTag($tag);
$post->save();
```

Find all tags by post
```
$tags = TagQuery::create()->filterByPost($post)->find();
$string = $this->getTagsString($tags->getData());

return $string;
```

or this way
```
$post->getTags()
```

That`s all!



