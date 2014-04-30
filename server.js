//world's simplest express server, requires node+npm
//setup:
//npm install express
//node server.js

var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/static'));
app.listen(3000, function() { console.log('listening')});
