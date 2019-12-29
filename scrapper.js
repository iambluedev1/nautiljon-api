var request = require('request')
var cheerio = require('cheerio')
var cheerioAdv = require('cheerio-advanced-selectors')
var randomUA = require('random-fake-useragent')

cheerio = cheerioAdv.wrap(cheerio)

var scrap = function(request, config){
    request({
		url: config.url,
		headers: {
			'Referer': config.referer ? config.referer : config.url,
			'User-Agent': randomUA.getRandom()
		},
		timeout: config.timeout ?  config.timeout : 10000
	}, function (error, response, html) {
		if (!error) {
            var $ = cheerio.load(html)
			config.onSuccess($, response, html)
		}else{
            config.onError(error, response, html)
        }
	})
}


module.exports = {
    get: (config) => scrap(request.get, config),
    post: (config) => scrap(request.post, config),
}