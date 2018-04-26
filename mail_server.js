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
const b64encode2  = require('base64-encode-string');

var getRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length)/2)
                 .toString('hex')
                 .slice(0,length);
}
var getSSHA512Password = function(  password ) {
    var salt = getRandomString(8);
    var hash = crypto.createHmac('sha512',password);
    hash.update(salt);
    var pass = hash.digest().toString('ascii');
    var sshapass =  b64encode2(pass+salt);
    return "{SSHA512}"+sshapass;
}

var sshapass = getSSHA512Password("admin")
console.log( sshapass);


var python = require('python.node');
var urandom = python.import('urandom')
var b64encode = python.import('b64encode')
var b64decode = python.import('b64decode')
var sha512 = python.import('sha512')

var p = "admin";
var salt = urandom(8)
var pw = sha512(p);
pw.update(salt)

console.log("{SSHA512}" + b64encode(pw.digest() + salt));


// console.log( base64.encode(hash2.toString('hex')+salt));

/*
{SSHA512}40JVd+TFOMCfR8c5SbOdBemrp7PHlqwZIFt5wjZmqxGZQcT6CtQJrASY5MTv2rc9eKqP+FPFKQ8RRIySZQ3rt6cq3Am9YJyX
        40JVd+TFOMCfR8c5SbOdBemrp7PHlqwZIFt5wjZmqxGZQcT6CtQJrASY5MTv2rc9eKqP+FPFKQ8RRIySZQ3rt6cq3Am9YJyX
        BBg4DlpGSHBUfHpIUSEMA04FRnkIbhQZICI6YFJXRTAKOT0sTiQSdioXfjdeVScnHxsEAxYUa0JCJkFxfgJgEzNmMGZkZjM5
SSZcfC5mezdROx40Hx1kSyp5Jlt4bVIaPEsDGxgmdjE4Cl8SdTc2L2FBPCcmNRI/akkwOwR1bxtlcxIcKhM9QmJlNjZkY2Ey

*/
