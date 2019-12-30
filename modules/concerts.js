var express = require('express')
var router = express.Router()
var apicache = require('apicache')
var scrapper = require('../scrapper')
var cache = apicache.middleware
var _ = require('lodash')

var { string_to_slug } = require('../utils')

const COUNTRIES = [
    {
        code: "all",
        slug: ""
    },
    {
        code: "japon",
        slug: "japon-1"
    },
    {
        code: "coree_du_sud",
        slug: "cor%C3%A9e+du+sud-2"
    },
    {
        code: "taiwan",
        slug: "taiwan-4"
    },
    {
        code: "france",
        slug: "france-13"
    },
    {
        code: "belgique",
        slug: "belgique-24"
    },
    {
        code: "royaume_uni",
        slug: "royaume-uni-14"
    },
    {
        code: "allemagne",
        slug: "allemagne-17"
    },
    {
        code: "suisse",
        slug: "suisse-18"
    },
    {
        code: "espagne",
        slug: "espagne-20"
    },
    {
        code: "italie",
        slug: "italie-32"
    },
    {
        code: "pays_bas",
        slug: "pays-bas-27"
    },
    {
        code: "luxenbourg",
        slug: "luxembourg-23"
    },
    {
        code: "canada",
        slug: "canada-19"
    },
    {
        code: "portugal",
        slug: "portugal-47"
    },
    {
        code: "finlande",
        slug: "finlande-45"
    },
    {
        code: "russie",
        slug: "russie-29"
    },
    {
        code: "autre",
        slug: "autre-40"
    },
]


const translations = {
    "date": "at",
    "artiste": "artist",
    "ville": "city",
    "lieu": "place",
    "pays": "country",
    "prix": "price",
    "adresse": "address",
    "heure": "scheduled_at",
    "informations": "information",
}

var isValidCountry = function (country) {
	const codes = Object.keys(COUNTRIES).map(key => COUNTRIES[key].code)
	return _.includes(codes, country)
}

var getPath = function(country){
    return (country.code == "all") ? "https://www.nautiljon.com/concerts/" : "https://www.nautiljon.com/concerts/" + country.slug + ".html"
}

router.get('/concerts/:type', function (req, res) {
    var type = req.params.type;
    var country = req.query.country || "all";

    if (type != "incoming" && type != "past") {
        return res.status(404).json({
            error: '404 Not Found'
        })
    }

    if(!isValidCountry(country)){
        return res.status(404).json({
            error: 'unknown country code'
        })
    }

    country = _.find(COUNTRIES, function (obj) {
		return obj.code === country
	})

    scrapper.get({
        url: getPath(country),
        onSuccess: ($, response) => {
            if (response.statusCode != 200) {
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }

            var tableIndex = (type == "incoming") ? 0 : 1
            var els = $($("table")[tableIndex]).find("tr")
            var concerts = []

            els.each(function (i, elem) {
                if (i == 0) return

                var columns = $(elem).find("td")

                var tmp = {
                    id: parseInt($(columns[1]).find("a").attr("href").split(",")[1].replace(".html", "")),
                    at: $(columns[0]).text().trim(),
                    artist: $(columns[1]).text().trim(),
                    name: $(columns[2]).text().trim(),
                };

                if (type == "incoming") {
                    _.extend(tmp, {
                        country: $(columns[3]).text().trim(),
                        city: $(columns[4]).text().trim(),
                        place: $(columns[5]).text().trim(),
                        link: ($(columns[6]).text().trim() != "") ? {
                            title: $(columns[6]).text().trim(),
                            href: $(columns[6]).find("a").attr("href")
                        } : null
                    })
                }

                concerts.push(tmp)
            });

            res.json(concerts)
        },
        onError: (error) => {
            console.log("error::" + error);
            res.status(500).json({
                error: 'Internal Server Error, We\'re currently unable to serve your request'
            })
        }
    })
})

router.get("/concert/:id(\\d+)", cache('1 day'), function (req, res) {
    var populate = req.query.populate ? req.query.populate.split(",") : ["subs", "shortnews", "news", "stats", "comments"];

    scrapper.get({
        url: 'https://www.nautiljon.com/concerts/a/a,' + req.params.id + '.html',
        onSuccess: ($, response) => {
            if (response.statusCode != 200) {
                return res.status(response.statusCode).json({
                    error: 'Error returned by nautiljon',
                    code: response.statusCode
                })
            }
            try {
                var div = $($($("#concerts > table")[0]).find("table")[0])
                var i = 1;

                var els = $(div).find("td");
                var tmp = {
                    id: parseInt(req.params.id)
                }

                els.each((i, elem) => {
                    var name = string_to_slug($($(div).find("th")[i]).text().trim(), '_');
                    if (name == "information") {
                        tmp[translations[name] || name] = {
                            text: $(elem).text().trim(),
                            html: $(elem).html().trim()
                        };
                    } else if(name == "artiste"){
                        tmp[translations[name] || name] = {
                            name: $(elem).text().trim(),
                            slug: $(elem).find("a").attr("href").replace("/people/", "").replace(".html", "")
                        }
                    } else if (name == "petites_annonces") 
                        return;
                    else
                        tmp[translations[name] || name] = $(elem).text().trim();
                });

                tmp.populate = {
                    subs: false,
                    shortnews: false,
                    news: false,
                    stats: false,
                    comments: false
                }

                if (populate.indexOf("subs") != -1) {
                    tmp.populate.subs = true;
                    tmp.subs = []
                    $(".vtop .divStyleBlue ul li").each((i, elem) => {
                        tmp.subs.push({
                            slug: $(elem).find("a").attr("href").replace("/membre/profil,", "").replace(".html", ""),
                            username: $(elem).find("a").text().trim()
                        })
                    });
                }

                if (populate.indexOf("shortnews") != -1) {
                    tmp.populate.shortnews = true;
                    tmp.shortnews = []
                    $("#list_actualite_mini a").each((i, elem) => {
                        var parts = $(elem).text().split(":");
                        tmp.shortnews.push({
                            at: parts[0].trim(),
                            picture: $(elem).attr("im"),
                            id: parseInt($(elem).attr("href").split(',')[1].replace(".html", "")),
                            title: $(elem).text().replace(parts[0], "").substring(1).trim()
                        })
                    })
                }

                if (populate.indexOf("news") != -1) {
                    tmp.populate.news = true;
                    tmp.news = []
                    $("#list_actualite a").each((i, elem) => {
                        var parts = $(elem).text().split(":");
                        var id = $(elem).attr("href").split('-')
                        id = parseInt(id[id.length - 1].replace(".html", ""))

                        tmp.news.push({
                            at: parts[0].trim(),
                            picture: $(elem).attr("im"),
                            id,
                            title: $(elem).text().replace(parts[0], "").substring(1).trim()
                        })
                    })
                }

                if (populate.indexOf("stats") != -1) {
                    tmp.populate.stats = true;
                    var div = $("#moy_notes")

                    tmp.stats = {
                        note: $(div).find(".moy_note").text().trim(),
                        count: parseInt($(div).find(".note_legende > span").text().trim()) || 0,
                        percentage: {
                            male: parseInt($("#notes_h").text().replace("%", "").trim()) || 0,
                            female: parseInt($("#notes_f").text().replace("%", "").trim()) || 0,
                        }
                    }
                }

                if (populate.indexOf("comments") != -1) {
                    tmp.populate.comments = true;
                    tmp.comments = []
                    var els = $("#list_comments .ancre")
                    els.each((i, div) => {
                        
                        try {
                            $(div).find(".c_content").find(".likesThumbs").remove()
                            $(div).find(".c_content").find(".cboth").remove()
                            $(div).find(".c_head").find(".fright").remove()
                            $(div).find(".c_head").find("a").remove()
                            $(div).find(".c_head").find(".separ").remove()
                            var msg_perso = $(div).find(".c_head").find(".msg_perso").remove().text().trim()
                            tmp.comments.push({
                                id: parseInt($(div).attr("id").replace("c_", "")),
                                at: $(div).find(".c_head").text().replace("Par", "").replace("le", "").trim(),
                                author: {
                                    username: $(div).find(".c_avatar img").attr("title").trim(),
                                    avatar: $(div).find(".c_avatar img").attr("src"),
                                    status: msg_perso,
                                    slug: $(div).find(".c_avatar a").attr("href").replace("/membre/profil,", "").replace(".html", "").trim()
                                },
                                content: {
                                    text: $(div).find(".c_content").text().trim(),
                                    html: $(div).find(".c_content").html().trim()
                                }
                            })
                        }catch(e){
                            res.status(404).json({
                                error: "Not a flash message"
                            });
                        }
                    })

                }


                res.json(tmp)
            } catch (e) {
                console.log(e)
                res.status(500).json({
                    error: "Error during scrapping"
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

module.exports = router;