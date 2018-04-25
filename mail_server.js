'use strict';
//-------------------------------------------------------//
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");
//-------------------------------------------------------//
// Setting environment
app.set('views', __dirname + '/client');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(__dirname + '/client'));

//-------------------------------------------------------//
//-------------------------------------------------------//
//-------------------------------------------------------//
var port = process.env.PORT || 4500;
var server = app.listen(port, function(){
    console.log("SocialxApp Mail Server has started on port " + port);
});

require('./apis/router')(app);
var base64 = require('js-base64').Base64
const sha512  = require('sha512');
var hash = sha512("admin");

console.log( hash.toString());
console.log( base64.encode(hash.toString()));
console.log( base64.encode("admin"));
/*
SSHA512}40JVd+TFOMCfR8c5SbOdBemrp7PHlqwZIFt5wjZmqxGZQcT6CtQJrASY5MTv2rc9eKqP+FPFKQ8RRIySZQ3rt6cq3Am9YJyX
SSHA512}x61Ey612Kl3vv73vv71S77+977+9VO+/ve+/ve+/ve+/ve+/vSo4AV8j77+977+977+977+9C++/vR3vv71yY03vv73vv70c77+9Tu+/vTXvv71q77+977+977+977+977+9H++/vVET77+977+9U++/vcad77+93pB377+9

*/
