var express = require('express'),
  bodyParser = require("body-parser"),
  app = express(),
  fs = require('fs'),
  handlebars = require('handlebars'),
  async = require('async'),
  needle = require('needle'),
  config = require('./config.json'),
  metadata = require('./metadata.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("./"));

var index = fs.readFileSync('index.hbs').toString();
var template = handlebars.compile(index);

/*
Campaign Page
*/
app.get('/campagnes/:slug', function(req, res, next) {
  needle.get(config.apiEndpoint + '/campaigns/' + req.params.slug, {rejectUnauthorized: false}, function(error, response, data) {
    if(!data) return next();
    var data = {
      'title': data.projectNaam,
      'description': data.introductieTekst,
      'imageUrl': data.coverURL,
      'pageUrl': req.protocol + '://' + req.headers.host + '/campagnes/' + data.id
    }
    var html = template(Object.assign({}, data, config));
    res.send(html);
  })
})

/*
Forgot password Page
*/
app.get('/forgotpassword/validate/:token/:email', function(req, res, next) {
    var data = {
      'pageUrl': req.protocol + '://' + req.headers.host + '/forgotpassword/validate/' + req.params.token + '/' + req.params.email,
    }
    var html = template(Object.assign({}, data, config));
    res.send(html);
})


/*
Static Pages
*/
app.get('*', renderIndex);

app.post('/campagnes/:slug/investeren/:status', function(req, res, next) {
    if(!req.body) return next();
    var data = {
      'pageUrl': req.protocol + '://' + req.headers.host + '/campagnes/' + req.params.slug + '/investeren/' + req.params.status,
      'invoiceNumber': req.body.BRQ_INVOICENUMBER || null
    }
    var html = template(Object.assign({}, data, config));
    res.send(html);
});

app.post('*', renderIndex);

function renderIndex(req, res) {
  var urlPath = req.url.replace(/\?.*?$/, '');
  var data = metadata.routes[urlPath];
  if(!data) return res.sendStatus(404);
  data.pageUrl = req.protocol + '://' + req.headers.host + urlPath;
  var html = template(Object.assign({}, data, config));
  res.send(html);
}

app.listen(config.port, function() {
  console.info('placetobe started on port ' + config.port);
});
