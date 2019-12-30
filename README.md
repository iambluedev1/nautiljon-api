# [WIP] Nautiljon Unofficial API

WebScrapper pour le site [nautiljon.com](https://www.nautiljon.com/)

### Installation
> git clone https://github.com/iambluedev1/nautiljon-api.git

> npm install

### Utilisation
> npm start

ou

> npm run dev

### Routes

L'api se compose d'un ensemble de 'modules' reprenant les différentes parties du site web. 

### Modules
- [Evènements](#evènements)
- [Flash Infos](#flash-infos)
- [Sélection du moment](#sélection-du-moment)
- [Critiques](#critiques)
- [Concerts](#concerts)

#### Evènements

##### Lister les évènements passés et futurs
GET /events/:type

Paramètres :

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| type  |  string | prend soit la valeur **incoming** soit **past** suivant si vous souhaitez afficher les évènements passés ou futurs |

RÉPONSE : json
```json
[
	...
	{
		  "id": "integer",
		  "at": "date sous la forme dd/mm/yyyy",
		  "name": "string",
		  "country": "string",
		  "city": "string",
		  "place": "string",
		  "link": "null" ou {
			"title": "string" ,
			"href": "string"
		  }
	}
	...
]
```


##### Afficher détail d'un évènement
GET /event/:id

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| id  |  integer | id de l'évènement |
| populate (optionnel)*  |  string | élements à ajouter à la réponse, par défaut sa valeur est à all |

***** paramètre à envoyé en GET,  plusieurs élements peuvent être ajoutés (vous pouvez utilisez plusieurs modes en les séparant par une virgule ex: **stubs,comments** ) : 
- subs (affichage des inscrits à l'évènement)
- shortnews (affichage des brèves de l'évènement) 
- news (affichage de l'actualité de l'évènement)
- comments (affichage des commentaires de l'évènement)
- stats (affichage des statistiques de l'évènement)
- all (valeur par défaut, active tous les élèments)

|  Valeurs retournées  | nom de la clé  |  |
| ------------ | ------------ | ------------ |
| titre  |  title  | |
| date de début | from  | |
| date de fin  | to  | |
| ville  | city  | |
| lieu  |  place | |
| pays  | country  | |
| prix  |  price | |
| site web de l'évènement   |  website | |
| adresse | address | |
| heure |  scheduled_at | |
| personnalités | personalities | retourne un tableau des personnalités présentes à l'évènement *|
| personnalite  |  personalities | retourne un tableau des personnalités présentes à l'évènement * |
| description  |  description | retourne la description de l'évènement au format text et html * |

*** la clé personalities retourne un tableau sous la forme de 
```json
[
	...
	{
        "slug":  "string",
        "name": "string",
        "picture": "string"
      }
	  ...
]
```

*** la clé description retourne un objet sous la forme de 
```json
{
  "text": "string",
  "html": "string"
}
```

REPONSE : json

```json
{
	"id": "integer",
    "title": "string",
    "from": "date sous la forme dd/mm/yyyy",
    "to": "date sous la forme dd/mm/yyyy",
    "city": "string",
    "place": "string",
    "country": "string",
    "description": {
      "text": "string",
      "html": "string"
    },
    "website": "string",
    "personalities": [
      {
        "slug": "string",
        "name": "string",
        "picture": "string"
      },
      ...
    ],
    "populate": {
      "subs": "boolean", //true si activé,
      "shortnews": "boolean", //true si activé,
      "news": "boolean", //true si activé,
      "stats": "boolean", //true si activé,
      "comments": "boolean", //true si activé
    },
    "subs": [ //optionnel
      {
        "slug": "string",
        "username": "string"
      },
      ...
    ],
    "shortnews": [ //optionnel
      {
        "at": "date sous la forme dd/mm/yyyy",
        "picture": "string",
        "id": "integer",
        "title": "string"
      },
      ...
    ],
    "news": [  //optionnel
      {
        "at": "date sous la forme dd/mm/yyyy",
        "picture": "string",
        "id": "integer",
        "title": "string"
      },
      ...
    ],
    "stats": {  //optionnel
      "note": "string sous la forme note/10",
      "count": "integer",
      "percentage": {
        "male": "integer",
        "female": "integer"
      }
    },
    "comments": [  //optionnel
      {
        "id": "integer",
        "at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
        "author": {
          "username": "string",
          "avatar": "string",
          "status": "string (peut être null)",
          "slug": "string"
        },
        "content": {
          "text": "string",
          "html": "string"
        }
      },
      ...
    ]
}
```

#### Flash Infos

##### Derniers flash
GET /flashes/latest

REPONSE : json
```json
[
	...
	{
      "at": "date sous la forme jj/mm",
      "title": "string",
      "item": "string",
      "id": "integer"
    }
	...
]
```

##### Lister toutes les alertes
GET /flashes

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| page  |  integer | numéro de page (par défaut est à 1) |
| full  |  boolean | affichage complet des alertes (par défaut à false) |

REPONSE : json
Si le paramètre full est à false :
```json
[
	...
	{
        "id": "integer",
        "title": "string",
        "at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
        "item": "string"
      }
	  ...
]
```
Sinon :

```json
[
	...
	{
        "id": "integer",
        "title": "string",
        "at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
        "author": {
          "username": "string",
          "avatar": "string",
          "status": "string ou null",
          "slug": "string"
        },
        "content": {
          "text": "string",
          "html": "string"
        }
      }
	  ...
]
```

Des informations supplémentaires sont disponible : 
```json
	"list": [...],
	"params": {
      "page": "integer",
      "type": "string (full ou small suivant si le paramètre full est à true ou pas)",
      "offset": "integer",
      "limit": "integer",
      "countPages": "integer",
      "countTotalItems": "integer",
      "countItemsOnThisPage": "integer"
    }
```
##### Afficher les détails d'un flash info
GET /flash/:id

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| id  |  integer | id du flash |

REPONSE : json
```json
{
	"id": "integer",
	"title": "string",
	"at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
	"author": {
		"username": "string",
		"avatar": "string",
		"status": "string ou null",
		"slug": "string"
	},
	"content": {
		"text": "string",
		"html": "string"
	}
}
```

#### Sélection du moment

GET /promoted-selection

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| type (optionnel)*  |  string | catégorie a afficher, par défaut la catégorie 'Tout' est selectionnée |

|  Valeur possible de type  | description | 
| ------------ | ------------ | 
|  all  |  toutes les catégories  | 
|  anime  |  catégorie Animés  | 
|  clip  |  catégorie Clips  | 
|  cd  |   catégorie CD | 
| ost  |  catégorie OST  | 
| drama  |   catégorie Drama | 
| litterature_asiatique  |    catégorie Romans| 
|  manga |  catégorie Mangas  | 
|  jv |  catégorie Jeux-Videos | 

REPONSE : json

```json
[
	...
	{
        "type":  "string",
        "title": "string",
        "link": "string",
        "picture": "string",
        "added_at": "date et heure sous la forme dd/mm/yyyy à hh:mm"
      }
	  ...
]
```

#### Critiques

##### Afficher les dernières critiques
GET /reviews/latest

REPONSE : json

```json
[
	...
	{
      "id": "integer",
      "item": "string",
      "type": "string",
      "picture": "string"
    }
	...
]
```

##### Afficher toutes les critiques

GET /reviews

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| type (optionnel)*  |  string | catégorie a afficher, par défaut la catégorie 'Tout' est selectionnée |
| page  |  integer | numéro de page (par défaut est à 1) |
| full  |  boolean | affichage complet des alertes (par défaut à false) |

|  Valeur possible de type  | description | 
| ------------ | ------------ | 
|  all  |  toutes les catégories  | 
|  anime  |  catégorie Animés  | 
|  clip  |  catégorie Clips  | 
|  cd  |   catégorie CD | 
| ost  |  catégorie OST  | 
| drama  |   catégorie Drama | 
| litterature_asiatique  |    catégorie Romans| 
|  manga |  catégorie Mangas  | 
|  jv |  catégorie Jeux-Videos | 
|  manga_volume | catégorie Volumes de Mangas  | 
|  beau_livre |   catégorie Beaux Livres| 
|  ln |  catégorie Light Novels | 
| ln_volume  |   catégorie Volumes de Light Novels| 
| dvd  |  catégorie DVD / Blu-ray | 
| goodies  |   catégorie Goodies | 

REPONSE : json
Si le paramètre full est à true :
```json
[
	...
	{
        "id": "integer",
        "title": "string",
        "note": "string sous la forme note/10",
        "at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
        "author": {
          "username": "string",
          "slug": "string",
          "countReviews": "integer"
        },
        "content": {
          "text": "string",
          "html": "string"
        },
        "item": {
          "title": "string",
          "type": "string",
          "path": "string"
        }
      }
	  ...
]
```
Sinon :

```json
[
	...
	{
        "id": "integer",
        "item": "string",
        "type": "string",
        "picture": "string"
      }
	  ...
]
```
Des informations supplémentaires sont disponible : 
```json
	"list": [...],
	"params": {
      "page": "integer",
      "type": "string (full ou small suivant si le paramètre full est à true ou pas)",
      "offset": "integer",
      "limit": "integer",
      "countPages": "integer",
      "countTotalItems": "integer",
      "countItemsOnThisPage": "integer",
	  "types": [ ] //liste des types supportés
    }
```

##### Afficher détails d'une critique
GET /review/:id

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| id  |  integer | id de l'évènement |

REPONSE : json
```json
{
        "id": "integer",
        "title": "string",
        "note": "string sous la forme note/10",
        "at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
        "author": {
          "username": "string",
          "slug": "string",
          "countReviews": "integer"
        },
        "content": {
          "text": "string",
          "html": "string"
        },
        "item": {
          "title": "string",
          "type": "string",
          "path": "string"
        }
}
```

#### Concerts

##### Lister les concerts passés et futurs
GET /concerts/:type

Paramètres :

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| type  |  string | prend soit la valeur **incoming** soit **past** suivant si vous souhaitez afficher les évènements passés ou futurs |
| country (optionnel)  |  string | restreindre l'affichage a un pays seulement, par défaut sa valeur est **all** |

|  Valeurs possible de country  |
| ------------ |
|  all |
|  japon |
| coree_du_sud  |
| taiwan  |
|  france |
|  belgique |
|  royaume_uni |   
|  allemagne |   
|  suisse |   
|  espagne |    
| italie  |   
| pays_bas  | 
|  luxembourg |
|  canada |
|  portugal |
|  finlande |
|  russie |
|  autre |

RÉPONSE : json
```json
[
  ...
  {
    "id": "integer",
    "at": "date sous la forme dd/mm/yyyy",
    "artist": "string",
    "name": "string"
  },
  ...
]
```

##### Afficher détail d'un concert
GET /concert/:id

|  nom du paramètre  |  type | description |
| ------------ | ------------ | ------------ |
| id  |  integer | id du concert |
| populate (optionnel)*  |  string | élements à ajouter à la réponse, par défaut sa valeur est à all |

***** paramètre à envoyé en GET,  plusieurs élements peuvent être ajoutés (vous pouvez utilisez plusieurs modes en les séparant par une virgule ex: **stubs,comments** ) : 
- subs (affichage des inscrits au concert)
- shortnews (affichage des brèves du concert) 
- news (affichage de l'actualité du concert)
- comments (affichage des commentaires du concert)
- stats (affichage des statistiques du concert)
- all (valeur par défaut, active tous les élèments)

|  Valeurs retournées  | nom de la clé  |  |
| ------------ | ------------ | ------------ |
| titre  |  title  | |
| date | at  | |
| ville  | city  | |
| lieu  |  place | |
| pays  | country  | |
| prix  |  price | |
| adresse | address | |
| heure |  scheduled_at | |
| information | information | * retourne les informations du concert au format text et html |
| artiste | artist | * retourne un object de l'artiste présent |

*** la clé information retourne un objet sous la forme de 
```json
{
  "text": "string",
  "html": "string"
}
```

*** la clé artist retourne un tableau sous la forme de 
```json
{
  "name": "string",
  "slug": "string"
}
```

REPONSE : json

```json
{
  "id": "integer",
  "title": "string",
  "at": "date sous la forme dd/mm/yyyy",
  "city": "string",
  "place": "string",
  "country": "string",
  "address": "string",
  "information": {
    "text": "string",
    "html": "string"
  },
  "artist": {
    "name": "string",
    "slug": "string"
  },
  "populate": {
    "subs": "boolean", //true si activé,
    "shortnews": "boolean", //true si activé,
    "news": "boolean", //true si activé,
    "stats": "boolean", //true si activé,
    "comments": "boolean", //true si activé
  },
  "subs": [ //optionnel
    {
      "slug": "string",
      "username": "string"
    },
    ...
  ],
  "shortnews": [ //optionnel
    {
      "at": "date sous la forme dd/mm/yyyy",
      "picture": "string",
      "id": "integer",
      "title": "string"
    },
    ...
  ],
  "news": [  //optionnel
    {
      "at": "date sous la forme dd/mm/yyyy",
      "picture": "string",
      "id": "integer",
      "title": "string"
    },
    ...
  ],
  "stats": {  //optionnel
    "note": "string sous la forme note/10",
    "count": "integer",
    "percentage": {
      "male": "integer",
      "female": "integer"
    }
  },
  "comments": [  //optionnel
    {
      "id": "integer",
      "at": "date et heure sous la forme dd/mm/yyyy à hh:mm",
      "author": {
        "username": "string",
        "avatar": "string",
        "status": "string (peut être null)",
        "slug": "string"
      },
      "content": {
        "text": "string",
        "html": "string"
      }
    },
    ...
  ]
}
```