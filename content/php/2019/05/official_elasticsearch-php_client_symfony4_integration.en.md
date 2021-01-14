---
title: "Integration: Symfony + Elasticsearch (official php-client)"
publishdate: "2019-05-15"
categories:
    - "php"
tags:
    - "elasticsearch"
    - "integration"
    - "symfony"
---

Client https://github.com/elastic/elasticsearch-php

This manual doesn`t describe index creation. Index creation is described [here]({{< relref path="fos_elastica_bundle_symfony4_integration.en.md" lang="en" >}}).

## update composer.json
```
{
    "require" : {
        "elasticsearch/elasticsearch": "~6.0"
    }
}
```

## download dependencies
```    
composer update
```

## Add service to config file
```yaml
services:
  App\Service\ElasticSearchService:
```

## Add App\Service\ElasticSearchService.php
```php
<?php

namespace App\Service;

use Knp\Component\Pager\PaginatorInterface;
use Elasticsearch\ClientBuilder;

class ElasticSearchService
{
    /** @var PaginatorInterface */
    private $paginator;

    private $client;

    public function __construct(PaginatorInterface $paginator)
    {
        $this->paginator = $paginator;
        $this->setClient();
    }

    protected function setClient()
    {
        $hosts = [
            'elasticsearch:9200',
        ];
        $this->client = ClientBuilder::create()
            ->setHosts($hosts)
            ->build();
    }

    public function getPaginatedList($query, $page)
    {
        $params = [
            'index'  => 'app',
            'type'   => 'post',
            'body' => [
                'query' => [
                    'match' => [
                        'content' => $query
                    ]
                ],
            ]
        ];
        $results = $this->client->search($params); // Search response is here
        $postIds = $this->getPostIdsFromSearchResult($results);
        $queryBuilder = [];
        $itemsPerPage = 10;
        if(!empty($postIds)){
            $queryBuilder = $this->someMethodToGetQueryBuilderFromEntitiesIds($postIds); // example method
        }

        return $this->paginator->paginate($queryBuilder, $page, $itemsPerPage);
    }

    protected function getPostIdsFromSearchResult($searchResult)
    {
        $ids = [];
        $searchResult = $searchResult['hits']['hits'] ?? [];
        if (!empty($searchResult) && is_array($searchResult)) {
            foreach ($searchResult as $item) {
                $ids[] = $item['_id'];
            }
        }

        return $ids;
    }

    protected function getQuery($query)
    {
        // Query could be a simple query string or DSL syntax based array
        //$query = $this->getArrayQuery($query);

        return $query;
    }
    protected function getArrayQuery($query)
    {
        $result = [
            'query' => [
                'query_string' => [
                    'query' => $query
                ]
            ]
        ];
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

## add Post Entity
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

## Add controller action
```php
<?php

namespace App\Controller;

use App\Service\ElasticSearchService;
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
            ElasticSearchService $elasticSearch,
            $search = null
        )
        {
            $page = $request->query->getInt('page', 1);
            $pagination = $elasticSearch->getPaginatedList($search, $page);
    
            return $this->render('site/index.html.twig', [
                'pagination' => $pagination
            ]);
        }
}
```

That`s all
