---
title: "Symfony + KnpMenuBundle"
publishdate: "2019-05-15"
categories:
    - "php"
tags:
    - "knplabs"
    - "integration"
    - "symfony"
---

https://symfony.com/doc/master/bundles/KnpMenuBundle/index.html

download vendor libs
```
$ composer require knplabs/knp-menu-bundle "^2.0"
```

add bundle to bundles.php
```php
Knp\Bundle\MenuBundle\KnpMenuBundle::class => ['all' => true],
```

create file app/config/packages/knp_menu.yaml and add content
```yaml
knp_menu:
    # use "twig: false" to disable the Twig extension and the TwigRenderer
    twig:
        #template: knp_menu_custom.html.twig
        template: knp_menu.html.twig
    #  if true, enables the helper for PHP templates
    templating: false
    # the renderer to use, list is also available by default
    default_renderer: twig
```

add to app/config/services.yaml
```yaml
services:
    # ... other services defenitions ...
    app.menu_builder:
        autowire: false
        class: App\Service\KnpMenuBuilderService
        arguments: ["@knp_menu.factory", "@security.authorization_checker"]
        tags:
            - { name: knp_menu.menu_builder, method: createMainMenu, alias: main }
```

create file App\Services\KnpMenuBuilderService.php
```php
<?php

namespace App\Service;

use Knp\Menu\FactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class KnpMenuBuilderService
{
    /** @var FactoryInterface */
    private $factory;

    /** @var  AuthorizationCheckerInterface */
    private $authChecker;

    public function __construct(FactoryInterface $factory, AuthorizationCheckerInterface $authorizationCheckerInterface)
    {
        $this->factory = $factory;
        $this->authChecker = $authorizationCheckerInterface;
    }

    public function createMainMenu(array $options)
    {
        $menu = $this->factory->createItem('root');
        $menu = $this->addItems($menu);
        $menu = $this->setAttributes($menu);

        return $menu;
    }

    private function addItems($menu)
    {
        $menu->addChild('Home', ['route' => 'index']);
        if ($this->authChecker->isGranted('ROLE_ADMIN') !== false) {
            $menu->addChild('Admin', ['route' => 'easyadmin']);
        }

        return $menu;
    }

    private function setAttributes($menu)
    {
        foreach ($menu as $item) {
            $item->setLinkAttribute('class', 'nav-link'); // a class
        }
        $menu->setChildrenAttribute('class', 'nav nav-pills'); // ul class

        return $menu;
    }
}
```

view should contain
```
{{ knp_menu_render('main') }}
```

That`s all!
