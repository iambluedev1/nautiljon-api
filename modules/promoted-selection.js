var express = require('express');
var router = express.Router();
var apicache = require('apicache')
var scrapper = require('../scrapper')
var cache = apicache.middleware

const TYPES = [
    "all", "anime", "clip", "cd", "ost", "drama", "litterature_asiatique", "manga", "jv"
]

router.get('/promoted-selection', function (req, res) {
    var type = req.query.type || "all";

    if(TYPES.indexOf(type) == -1) {
        return res.status(404).json({
            error: 'bad type ' + type + ' allowed types are ' + TYPES.join(', '),
        });
    }

    scrapper.get({
        url: (type == "all") ? 'https://www.nautiljon.com/site/selection_moment.php' : "https://www.nautiljon.com/site/selection_moment.php?section=" + type,
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var els = $(".top_bloc.selection_moment")
            var promoted = []

            els.each(function (i, elem) {
                promoted.push({
                    type: $(elem).find("h2").text().trim(),
                    title: $(elem).find("h3").text().trim(),
                    link: $(elem).find("a").attr("href"),
                    picture: $(elem).find(".image").css("background-image").replace('url(', "").replace(')', '').trim(),
                    added_at: $(elem).find(".infos_small").text().replace("Ajouté le", "").trim()
                })
            });

            res.json({list: promoted, types: TYPES})
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
});

module.exports = router;