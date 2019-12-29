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

Modules disponibles :
- Evénements
- Flash Infos
- Sélection du moment 
- Critiques

#### events

|  /events/:type  |
| ------------ |
|   type peut prendre comme valeur soit **incoming** soit **past** suivant si vous souhaitez afficher les évenements futurs ou passés |
| retourne un tableau des évenéments |
     {
      "id": integer,
      "at": date sous la forme dd/mm/yyyy,
      "name": string,
      "country": string,
      "city": string,
      "place": string,
      "link": null ou {
        "title": string ,
        "href": string
      }
    }




