var express = require('express')
var fs = require('fs')
var path = require('path')
var request = require('request')
var cheerio = require('cheerio')
var cheerioAdv = require('cheerio-advanced-selectors')
var apicache = require('apicache')
var morgan = require('morgan')
var compression = require('compression')
var rfs = require('rotating-file-stream')
var randomUA = require('random-fake-useragent')
var _ = require('lodash')
var pjson = require('./package.json')

cheerio = cheerioAdv.wrap(cheerio)

var app = express()
var cache = apicache.middleware

var logDirectory = path.join(__dirname, 'logs')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
var accessLogStream = rfs.createStream('access.log', {
	interval: '1d',
	path: logDirectory
})
var formats = ":remote-addr [:date[iso]] [method=':method', url=':url', status=':status', user-agent=':user-agent', response-time=':response-time']"

morgan.token('remote-addr', function (req) {
	if (req.headers['cf-connecting-ip']) {
		return req.headers['cf-connecting-ip']
	} else {
		return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined
	}
})

app.use(morgan(formats, {
	stream: accessLogStream
}))
app.use(morgan(formats))
app.use(compression())
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})

app.use(function (req, res, next) {
    res.oldJson = res.json;
    res.json = function (object) {
        res.oldJson({
            return: object,
            api: {
                request: {
                    path: req.url,
                    queries: req.query
                },
                response: {
                    code: res.statusCode,
                },
                name: pjson.name,
                version: pjson.version,
                maintainers: pjson.maintainers,
                licenses: pjson.licenses,
                homepage: pjson.homepage,
                github: 'https://github.com/iambluedev1/'
            }
        });
    };
    next();
});

app.get('/', function (req, res) {
	res.json({msg: 'ok'})
})

app.use(require('./modules/flash')); 
app.use(require('./modules/promoted-selection')); 
app.use(require('./modules/reviews')); 
app.use(require('./modules/events')); 
app.use(require('./modules/concerts')); 

app.get('*', function(req, res){
    res.status(404).json({
        error: '404 Not Found'
    })
});

app.listen('8080')
console.log('Listening on localhost:8080')
exports = module.exports = app