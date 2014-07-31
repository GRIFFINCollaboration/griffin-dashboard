MIDAS 		= 'grsmid00.triumf.ca:8082'			//wherever mhttpd is serving
SOH			= 'grifsoh00.triumf.ca:8081'		//state of health mhttpd
express 	= require("express");		
app 		= express();				
//minify 		= require('express-minify');				//minification tool
spawn 		= require('child_process').spawn;			//for spawning system calls
execFile	= require('child_process').execFile;
exec 		= require('child_process').exec;
fs 			= require('fs');							//file system manipulator

// set up the app
app.set('views', __dirname + '/views');

app.use(express.compress());
/*
app.use(minify({
    js_match: /javascript/,
    css_match: /css/
}));
*/
app.use('/static', express.static(__dirname + '/static'));
app.use(express.cookieParser());
app.use(express.bodyParser());										//need this to parse submitted forms

MSCbuilders = require('./static/utilities/canonicalMSC')

// Load our routes
require('./routes.js');

var port = process.env.PORT || 2154;
app.listen(port, function() {
  console.log("Listening on " + port);
});