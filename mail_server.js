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


const SMTPServer = require('smtp-server').SMTPServer;

const mserver = new SMTPServer({
    onMailFrom(address,session,callback) {
        console.log( "from  " +  address.address )
        return callback();
    },
    onRcptTo(address,session,callback) {
        console.log( "rcpt  " + address.address )
        return callback();
    }
})
mserver.listen(587,function(){
    console.log("SocialxApp Mail Hook Server has started on port " + 587);
    
});


