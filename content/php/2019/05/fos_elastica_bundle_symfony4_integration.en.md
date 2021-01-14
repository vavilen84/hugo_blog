---
title: "Symfony + FOSElasticaBundle + Docker"
publishdate: "2019-05-15"
categories:
- "php"
tags:
- "fos"
- "elasticsearch"
- "integration"
- "symfony"
---

Bundle: https://github.com/FriendsOfSymfony/FOSElasticaBundle

Repo with example: https://github.com/vavilen84/symfony_4_elastic_search

### 1. update composer.json
``` 
{
    "require": {
        "friendsofsymfony/elastica-bundle": "^5.0"
    }
}
```

### 2. download dependencies
```    
composer update
```

### 3. update bundles.php
```php
<?php

return [
    FOS\ElasticaBundle\FOSElasticaBundle::class => ['all' => true]
];
```

### 4. update docker-compose.yml
```yaml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.2.3
    container_name: elasticsearch
    environment:
      - network.host=0.0.0.0
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata1:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - local
    depends_on:
      - php
  php:
    networks:
        - local
    //other container definitions
    
volumes:
  esdata1:
    driver: local

networks:
  local:
```

### 5. add Post Entity
```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Post
 *
 * @ORM\Table(name="post")
 * @ORM\Entity(repositoryClass="App\Repository\PostRepository")
 */
class Post
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @ORM\Column(name="title", type="string")
     */
    private $title;

    /**
     * @ORM\Column(name="content", type="text")
     */
    private $content;
}
```

### 6. update config file fos_elastica.yaml
```yaml
# Read the documentation: https://github.com/FriendsOfSymfony/FOSElasticaBundle/blob/master/Resources/doc/setup.md
fos_elastica:
    clients:
        default: { host: elasticsearch, port: 9200 }
    indexes:
        app:
          types:
            post:
              properties:
                title: ~
                content : ~
              persistence:
                # the driver can be orm, mongodb or phpcr
                driver: orm
                model: App\Entity\Post
                provider: ~
                finder: ~
services:
  App\Service\FOSElasticSearchService:
    arguments:
      $transformedFinder: '@fos_elastica.finder.app.post'
  FOS\ElasticaBundle\Finder\TransformedFinder:
    alias: 'fos_elastica.finder.app.post'
```

### 7. Add App\Service\FOSElasticSearchService.php
```php
<?php

namespace App\Service;

use Knp\Component\Pager\PaginatorInterface;
use FOS\ElasticaBundle\Finder\TransformedFinder;

class FOSElasticSearchService
{
    /** @var PaginatorInterface */
    private $paginator;

    /** @var TransformedFinder */
    private $transformedFinder;

    public function __construct(PaginatorInterface $paginator, TransformedFinder $transformedFinder)
    {
        $this->paginator = $paginator;
        $this->transformedFinder = $transformedFinder;
    }

    public function getPaginatedList($query, $page)
    {
        $query = $this->getQuery($query);
        $results = $this->transformedFinder->find($query); // Get result entities array here
        $itemsPerPage = 10;

        return $this->paginator->paginate($results, $page, $itemsPerPage);
    }

    protected function getQuery($query)
    {
        // Query could be a simple query string or DSL syntax based array
        //$query = $this->getArrayQuery($query);

        return $query;
    }

    protected function getArrayQuery($query)
    {
        # https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
        # https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html
        $result = [
            'query' => [
                'bool' => [
                    'must' => [
                        'match' => [
                            'content' => $query
                        ],
                    ],
                    'filter' => [
                        'term' => [
                            'status' => 1
                        ]
                    ],
                ]
            ]
        ];

        return $result;
    }
}
```

### 8. Add controller action
```php
<?php

namespace App\Controller;

use App\Service\FOSElasticSearchService;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class SiteController extends Controller
{
        /**
         * @Route("/search/{search}", name="search")
         */
        public function search(
            Request $request,
            FOSElasticSearchService $fosElastica,
            $search = null
        )
        {
            $page = $request->query->getInt('page', 1);
            $pagination = $fosElastica->getPaginatedList($search, $page);
    
            return $this->render('site/index.html.twig', [
                'pagination' => $pagination
            ]);
        }
}
```

That`s all!
