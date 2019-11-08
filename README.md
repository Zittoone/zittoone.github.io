# Projet : Web2.0 Master IFI

## Author

* Alexis Couvreur

## Code 

This source code is visisble [here](https://acouvreur.github.io/zittoone.github.io/), and the playable version at my [github page](https://zittoone.github.io/).

## Gameplay

Vous contrôlez un fusée dôtée d'un bouclier activable via **ESPACE**, le but est de survivre pendant un temps *t* affiché en haut à gauche.
Le bouclier vous permet de passer outre les obstacles.

## Effets sonores

Une musique de fond est activée via l'API `Audio`.

## Design

* Simulation d'un effet parallax en fonction du layer choisi (cf. fonction `createStars` dans **game.js**) ;
* utilisation de sprites :
    1. pour le joueur, la fusée est animée à l'arrière grâce à un sprite, de même que pour son bouclier (sprite non animé) et l'explosion (sprite animé) ;
    2. pour les astéroïdes, j'utilise un sprite représentant différents astéroïdes et donc ne sont pas une suite de mouvement, chaque astéroïde généré en a un choisi au hasard ;
* les images ainsi que le fichier audio ont été trouvés sur internet.

## Points positifs

* Utilisation des techniques apprises en cours :
    1. syntaxe ES6 (classes, héritage, lambdas, etc.) ;
    2. frameworks à la main (GameFramework skelleton) ;
    3. loader d'assets (dans le fichier **sprite.js**) asynchrone avec fonction de callback ;
    4. utilisation de sprites sheets ;
    5. utilisation audio (malheureusement pas **AudioContext**) ;
    6. black-boxing comme le game framework (voire framework Shield dans **joueur.js**) ;
    7. séparation des tâches en fichier
* niveaux infinis car générés aléatoirement ;
* déplacement du vaisseau fluide via un facteur accélération et vélocité ;
* facilement maintenable et évolutif.

## Points négatifs

* Gameplay pas forcément très intéressant et diversifié ;
* l'utilisation de l'audio est très limitée, j'aurais aimé synchroniser le rythme de la musique avec le spawning d'astéroïde ;
* impossiblité d'utiliser l'API soundcloud car ils ne permettent plus d'enregistrer une application ! (c'est dommage !).
