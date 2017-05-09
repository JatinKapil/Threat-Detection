// server.js
// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var multer = require('multer');
var fs = require('fs');
//var mongoose = require('mongoose'); // mongoose for mongodb

var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// Express and body-parser configuration =================
app.use(express.static(__dirname + '/client')); // set the static files location
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());

require('./server/app.js')(app, multer, fs);
// listen (start app with node server.js) ======================================
app.listen(3000);
console.log("App listening on port 3000");
//console.log(fs.existsSync('./server/uploads/logs.txt'));
