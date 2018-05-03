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
var port = process.env.PORT || 80;
var server = app.listen(port, function(){
    console.log("SocialxApp Mail Server has started on port " + port);
});

require('./apis/router')(app);
require('./apis/monitor_mailin');


const sendmail = require('sendmail')();
sendmail({
    from:'postmaster@aone.social',
    to:'lumeihui210@outlook.com,jinxixing210@gmail.com',
    subject:'Hello, noreply',
    text:'This is a test(text)',
    // html:'This is a test(HTML)',
},function(err,reply){
    console.log( err && err.stack);
    console.dir(reply);
})
