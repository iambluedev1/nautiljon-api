var express = require('express')
var router = express.Router()
var apicache = require('apicache')
var scrapper = require('../scrapper')
var cache = apicache.middleware
var _ = require('lodash')

const translations = {
    "actualite": "news",
    "actualite_mini": "shortnews",
    "evenement": "event",
    "concerts": "concert",
    "cinema": "cinema",

    "lundi": "Monday",
    "mardi": "Tuesday",
    "mercredi": "Wednesday",
    "jeudi": "Thursday",
    "vendredi": "Friday",
    "samedi": "Saturday",
    "dimanche": "Sunday",
}

const TYPES = [
    "all", "news", "shortnews", "event", "concert", "cinema"
]

router.get('/calendar/today', cache('1 day'), function (req, res) {
    scrapper.get({
        url: 'https://www.nautiljon.com/',
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var div = $($("#content > .frame_right > .top_bloc")[1])
            var items = [];

            var els = $(div).find("li")
            els.each((i, elem) => {
                var type = $(elem).attr("class").replace("calendar_li_", "").trim()
                type = translations[type] || type

                var separator = (type == "shortnews" || type == "news") ? "-" : ","
                var parts = $(elem).find("a").attr("href").split(separator)

                items.push({
                    type: type,
                    title: $(elem).find("a").text().trim(),
                    id: parseInt(parts[parts.length - 1].replace(".html", "")),
                })
            })

            res.json(items)
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
})

router.get('/calendar', cache('1 day'), function (req, res) {
    var year = parseInt(req.query.year) || new Date().getFullYear()
    var month = parseInt(req.query.month) || (new Date().getMonth() + 1)
    var ptype = req.query.type || "all";

    if(TYPES.indexOf(ptype) == -1) {
        return res.status(404).json({
            error: 'bad type ' + ptype + ' allowed types are ' + TYPES.join(', '),
        });
    }

    if(month < 1 || month > 12) {
        return res.status(404).json({
            error: 'invalid month number'
        })
    }

    if(month < 10) month = "0" + month

    scrapper.get({
        url: 'https://www.nautiljon.com/calendrier/?y=' + year + '&m=' + month,
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var div = $("#calendar_list")
            var items = [];
            var els = $(div).find(".vtop")

            els.each((i, elem) => {
                var tmp = []

                $(elem).find(".calentar_event").each((i, elem2) => {
                    var type = $($(elem2).find("div")[0]).attr("class").replace("calendar_", "").trim()
                    type = translations[type] || type

                    var separator = (type == "shortnews" || type == "news") ? "-" : ","
                    var parts = $($($(elem2).find("div")[0])).find("a").attr("href").split(separator)
                    var title = $($($(elem2).find("div")[0])).find("a").text().replace(/(\d\d?)\/(\d\d??)\/(\d\d\d\d)/, "").trim()
                    
                    if(title.startsWith(":")) title = title.substring(1).trim()

                    if(ptype == "all" || ptype == type){
                        tmp.push({
                            type,
                            title,
                            id: parseInt(parts[parts.length - 1].replace(".html", "")),
                        })
                    }
                })

                items.push({
                    day: parseInt($(elem).find("span.calendar_jour").text().trim()),
                    dayName: translations[$(elem).find("span.infos_small").text().trim().toLowerCase()],
                    items: tmp
                })
            })

            res.json({list:items, params: {year, month}})
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
})

module.exports = router;