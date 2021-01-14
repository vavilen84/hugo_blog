---
title: "Integration: Sphinxsearch / Symfony / Docker / Postgres / KnpPaginatorBundle"
publishdate: "2019-05-15"
categories:
  - "php"
tags:
  - "symfony"
  - "sphinxsearch"
  - "docker"
  - "postgres"
  - "paginator"
  - "integration"
---

Project repository https://github.com/vavilen84/symfony_4_sphinx_search
 
## .env file
```shell script
WORKING_DIR=/var/www/symfony_project

POSTGRES_HOST=postgres
POSTGRES_USER=symfony
POSTGRES_PASSWORD=pass123456
POSTGRES_DB=symfony

DATABASE_URL=postgresql://symfony:pass123456@postgres:5432/symfony
TEMP_DIR=/tmp

SPHINX_DATA_FOLDER=/var/lib/sphinx
SPHINX_CONFIG_FOLDER=/etc/sphinxsearch
SPHINX_TYPE=pgsql
```

## docker-compose.yml
```yaml
version: '3'
services:
  php:
      working_dir: ${WORKING_DIR}
      build:
          context: docker/php
          dockerfile: Dockerfile
      env_file:
        - .env
      volumes:
          - "./:${WORKING_DIR}"
      networks:
          - local
  postgres:
      image: postgres:9.6
      env_file:
        - .env
      volumes:
          - ./docker/postgres/data:/var/lib/postgresql/data
      networks:
          - local
      depends_on:
          - php
  sphinxsearch:
    working_dir: ${WORKING_DIR}
    build:
        context: docker/sphinxsearch
        dockerfile: Dockerfile
        args:
          sphinx_config_folder: ${SPHINX_CONFIG_FOLDER}
          sphinx_data_folder: ${SPHINX_DATA_FOLDER}
          postgres_host: ${POSTGRES_HOST}
          postgres_user: ${POSTGRES_USER}
          postgres_password: ${POSTGRES_PASSWORD}
          postgres_db: ${POSTGRES_DB}
    depends_on:
        - php
        - postgres
    networks:
        - local
    ports:
      - 9312:9312
networks:
  local:
```

## Sphinxsearch client
Namespace App\Service was added to [official client](https://github.com/vavilen84/symfony_4_sphinx_search/blob/master/src/Service/SphinxClient.php).
 
## Sphinxsearch service
```
<?php

namespace App\Service;

use App\Interfaces\PaginatedListInterface;
use App\Service\SphinxClient as SphinxClient;
use Knp\Component\Pager\PaginatorInterface;

class SphinxSearchService
{
    /** @var PaginatorInterface */
    private $paginator;

    /**
     * @var SphinxClient $sphinx
     */
    private $sphinx;
    private $host = 'sphinxsearch';
    private $port = 9312;

    public function __construct(PaginatorInterface $paginator, PostRepository $postRepository)
    {
        $this->paginator = $paginator;
        $this->postRepository = $postRepository;
        $this->sphinx = new SphinxClient();
        $this->sphinx->setServer($this->host, $this->port);
    }

    public function getPaginatedList($search, $page)
    {
        $indexes = ['post'];
        $result = $this->search($search, $indexes);
        dump($result);
        if (!empty($result['total']) && !empty($result['matches'])) {
             $queryBuilder = $this->someMethodToGetQueryBuilderFromEntitiesIds(array_keys($result['matches'])); // example method

            return $this->paginator->paginate($queryBuilder, $page, Blog::ITEMS_PER_PAGE);
        }

        return $this->paginator->paginate([], $page, Blog::ITEMS_PER_PAGE);
    }

    public function search($query, array $indexes)
    {
        $results = $this->sphinx->query($query, implode(' ', $indexes));
        if ($results['status'] !== SEARCHD_OK) {
            $error = $this->sphinx->getLastError();

            throw new \Exception($error);
        }

        return $results;
    }
}
```

## Controller action 
```
<?php

namespace App\Controller;

use App\Service\SphinxSearchService;
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
            SphinxSearchService $sphinxSearch,
            $search = null
        )
        {
            $page = $request->query->getInt('page', 1);
            $pagination = $sphinxSearch->getPaginatedList($search, $page);
    
            return $this->render('site/index.html.twig', [
                'pagination' => $pagination
            ]);
        }
}
```

That`s all!
