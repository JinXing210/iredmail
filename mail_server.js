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
const crypto  = require('crypto');

var getRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length)/2)
                 .toString('hex')
                 .slice(0,length);
}

var base64 = require('js-base64').Base64
const sha512  = require('sha512');
var hash = crypto.createHmac('sha512','admin');
var salt = getRandomString(8);
hash.update(salt);

var hash2 = sha512("admin",salt);
var pass = hash.digest('hex');
var pass2 = hash2.toString('hex');
console.log( salt );
console.log( pass);
console.log( pass2);

console.log( base64.encode(pass));
console.log( base64.encode(pass+salt));
console.log( base64.encode(pass2));
console.log( base64.encode(pass2+salt));
// console.log( base64.encode(hash2.toString('hex')+salt));

/*
SSHA512}40JVd+TFOMCfR8c5SbOdBemrp7PHlqwZIFt5wjZmqxGZQcT6CtQJrASY5MTv2rc9eKqP+FPFKQ8RRIySZQ3rt6cq3Am9YJyX
        40JVd+TFOMCfR8c5SbOdBemrp7PHlqwZIFt5wjZmqxGZQcT6CtQJrASY5MTv2rc9eKqP+FPFKQ8RRIySZQ3rt6cq3Am9YJyX
        NzM2ODIwODhiNzQ0MTI4MjEzNGVjNTE5ZDllY2RkMWRiYjFjZGZkYzY0ZjhhNjc1ZWEwOTBkNWQ4ZmM3MDk0ZTU3YTQwZTlmMjM5OGMxMjc2NmM1ODkzZjFlYWE4MGUzMjIyNDgyZjExMTk0NGMwZmRmNjI1MTM3NWVhMDFjNGM=
*/
