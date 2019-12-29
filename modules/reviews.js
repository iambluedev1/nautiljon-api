var express = require('express');
var router = express.Router();
var apicache = require('apicache')
var scrapper = require('../scrapper')
var cache = apicache.middleware

const TYPES = [
    "all", "anime", "clip", "cd", "ost", "am", "drama", "litterature_asiatique", "manga", "manga_volume", "jv", "beau_livre", "ln", "ln_volume", "dvd", "goodies"
]
const ITEM_PER_PAGE = 25

router.get("/reviews/latest", function (req, res) {
    scrapper.get({
        url: 'https://www.nautiljon.com/',
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var div = $("#content > .frame_right > .top_bloc")
            div = $(div[div.length - 2]);
            var reviews = [];

            var els = $(div).find(".bloc_images")
            els.each(function (i, elem) {
                reviews.push({
                    id: parseInt($(elem).find("a").attr("href").replace("/site/show_review.php?id=", "").trim()),
                    item: $(elem).find("span").text().trim(),
                    type: $(elem).find("a").attr("title").split(":")[0].trim(),
                    picture: $(elem).find("img").attr("src")
                });
            });

            res.json(reviews)
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
})

router.get("/review/:id(\\d+)", cache('1 day'), function (req, res) {
    var populate = req.query.populate ? (req.query.populate == "true") : false; //TODO

    scrapper.get({
        url: 'https://www.nautiljon.com/site/show_review.php?id=' + req.params.id,
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            try {
                var div = $("#r_" + req.params.id)
                var username = $($(div).find(".fleft a")[1]).text().trim()
                var slug = $($(div).find(".fleft a")[1]).attr("href").replace("/membre/profil,", "").replace(".html", "").trim()
                $(div).find(".fleft a").remove()
                var parts = $(div).find("em").text().replace("Par  (", "").split(")")

                res.json({
                    id: parseInt(req.params.id),
                    title: $(div).find("h4").text().trim(),
                    note: $(div).find("h3").text().trim(),
                    at: parts[1].replace("le", "").trim(),
                    author: {
                        username,
                        slug,
                        countReviews: parseInt(parts[0].split(" ")[0])
                    },
                    content: {
                        text: $(div).find(".critique_texte").text().trim(),
                        html: $(div).find(".critique_texte").html().trim(),
                    },
                    item: {
                        title: $(".h1titre span").text().trim(),
                        type: $("meta[name=description]").attr("content").split(":")[0].trim(),
                        path: response.request.uri.pathname
                    }
                })
            }catch(e){
                console.log(e)
                res.status(404).json({
                    error: "Not a flash message"
                });
            }
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
});

router.get("/reviews", function (req, res) {
    var page = req.query.page ? parseInt(req.query.page) || 1 : 1;
    var full = req.query.full ? (req.query.full == "true") : false;
    var type = req.query.type || "all";
    if(page < 1) page = 1;

    if(TYPES.indexOf(type) == -1) {
        return res.status(404).json({
            error: 'bad type ' + type + ' allowed types are ' + TYPES.join(', '),
        });
    }

    var url = 'https://www.nautiljon.com/site/last_review.php?';

    if(page > 1) url += "dbt=" + (page-1) * ITEM_PER_PAGE
    if(type != "all") url += "section=" + type

    scrapper.get({
        url: url,
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var list = []
            var comments = $("#list_reviews .ancre");

            comments.each(function (i, div) {
                var id = parseInt($(div).attr("id").replace("c_", "")) || null

                if(id == null) return;
                id = parseInt($($(div).find(".fleft a")[0]).attr("href").replace("/site/show_review.php?id=", "").trim())
                var name = $(div).find(".c_avatar img").attr("alt").trim();
                var type = $($(div).find(".fleft a")[0]).text().split(":")[0].trim()
                var username = $($(div).find(".fleft a")[1]).text().trim()
                var slug = $($(div).find(".fleft a")[1]).attr("href").replace("/membre/profil,", "").replace(".html", "").trim()
                $(div).find(".fleft a").remove()
                var parts = $(div).find("em").text().replace("Par  (", "").split(")")

                if(full){
                    list.push({
                        id: id,
                        title: $(div).find("h4").text().trim(),
                        note: $(div).find("h3").text().trim(),
                        at: parts[1].replace("le", "").trim(),
                        author: {
                            username,
                            slug,
                            countReviews: parseInt(parts[0].split(" ")[0])
                        },
                        content: {
                            text: $(div).find(".critique_texte").text().trim(),
                            html: $(div).find(".critique_texte").html().trim(),
                        },
                        item: {
                            title: name,
                            type: type,
                            path: $(div).find(".c_avatar a").attr("href").replace(".html", "/critiques.html")
                        }
                    })
                }else{
                    list.push({
                        id: id,
                        item: name,
                        type: type,
                        picture: $(div).find(".c_avatar img").attr("src")
                    })
                }
            })

            res.json({list, params: {
                page, 
                type: full ? "full" : "small", 
                offset: (page-1) * ITEM_PER_PAGE,
                limit: ITEM_PER_PAGE,
                countPages: parseInt($(".menupage a:last").text().trim()), 
                countTotalItems: (parseInt($(".menupage a:last").text().trim()) - 1) * ITEM_PER_PAGE,
                countItemsOnThisPage: list.length,
                types: TYPES
            }})
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