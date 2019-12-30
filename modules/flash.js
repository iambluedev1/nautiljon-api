var express = require('express');
var router = express.Router();
var apicache = require('apicache')
var scrapper = require('../scrapper')
var cache = apicache.middleware

const ITEM_PER_PAGE = 25;

router.get('/flashes/latest', cache('1 day'), function (req, res) {
    scrapper.get({
        url: 'https://www.nautiljon.com/',
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var div = $($("#content > .frame_right > .top_bloc")[0])
            var flashes = [];
            var dates = $($("#content > .frame_right > .top_bloc")[0]).find(".bas_bloc > span");
            var links = $($("#content > .frame_right > .top_bloc")[0]).find(".bas_bloc > a");

            dates.each(function (i, elem) {
                flashes.push({
                    at: $(elem).text().replace(":", "").trim(),
                    title: $(links[i]).text(),
                    item: $(links[i]).attr("title").trim(),
                    id: parseInt($(links[i]).attr("href").replace("/site/show_comment.php?id=", "").trim()),
                })
            });

            res.json(flashes)
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
})

router.get("/flash/:id(\\d+)", cache('1 day'), function (req, res) {
    scrapper.get({
        url: 'https://www.nautiljon.com/site/show_comment.php?id=' + req.params.id,
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }
            try {
                var div = $("#c_" + req.params.id);
                $(div).find(".flashinfos").find(".likesThumbs").remove()
                $(div).find(".flashinfos").find(".cboth").remove()
                $(div).find(".c_head").find(".fright").remove()
                $(div).find(".c_head").find("a").remove()
                $(div).find(".c_head").find(".separ").remove()
                var msg_perso = $(div).find(".c_head").find(".msg_perso").remove().text().trim()
                res.json({
                    id: parseInt(req.params.id),
                    title: $(div).find("h3").text().trim(),
                    at: $(div).find(".c_head").text().replace("Par", "").replace("le", "").trim(),
                    author: {
                        username: $(div).find(".c_avatar img").attr("title").trim(),
                        avatar: $(div).find(".c_avatar img").attr("src"),
                        status: msg_perso,
                        slug: $(div).find(".c_avatar a").attr("href").replace("/membre/profil,", "").replace(".html", "").trim()
                    },
                    content: {
                        text: $(div).find(".flashinfos").text().trim(),
                        html: $(div).find(".flashinfos").html().trim()
                    }
                })
            }catch(e){
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

router.get("/flashes", function (req, res) {
    var page = req.query.page ? parseInt(req.query.page) || 1 : 1;
    var full = req.query.full ? (req.query.full == "true") : false;
    if(page < 1) page = 1;

    scrapper.get({
        url: (page == 1) ? 'https://www.nautiljon.com/site/last_comments.php?flashinfos' : 'https://www.nautiljon.com/site/last_comments.php?dbt=' + (page-1) * ITEM_PER_PAGE + '&flashinfos',
        onSuccess: ($, response) => {
            if(response.statusCode != 200){
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var list = []
            var comments = $("#list_comments .ancre");

            comments.each(function (i, div) {
                var id = parseInt($(div).attr("id").replace("c_", ""))
                $(div).find(".flashinfos").find(".likesThumbs").remove()
                $(div).find(".flashinfos").find(".cboth").remove()
                $(div).find(".c_head").find(".fright").remove()
                var firstA = $($(div).find(".c_head").find("a")[0]);
                $(div).find(".c_head").find("a").remove()
                $(div).find(".c_head").find(".separ").remove()
                var msg_perso = $(div).find(".c_head").find(".msg_perso").remove().text().trim()

                if(full){
                    list.push({
                        id: id,
                        title: $(div).find("h3").text().trim(),
                        at: $(div).find(".c_head").text().replace("Par", "").replace("le", "").trim(),
                        author: {
                            username: $(div).find(".c_avatar img").attr("title").trim(),
                            avatar: $(div).find(".c_avatar img").attr("src"),
                            status: msg_perso,
                            slug: $(div).find(".c_avatar a").attr("href").replace("/membre/profil,", "").replace(".html", "").trim()
                        },
                        content: {
                            text: $(div).find(".flashinfos").text().trim(),
                            html: $(div).find(".flashinfos").html().trim()
                        }
                    })
                }else{
                    list.push({
                        id: id,
                        title: $(div).find("h3").text().trim(),
                        at: $(div).find(".c_head").text().replace("Par", "").replace("le", "").trim(),
                        item: $(firstA).attr("title").trim()
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
                countItemsOnThisPage: list.length
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