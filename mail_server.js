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
var port = process.env.PORT || 10025;
// var server = app.listen(port, function(){
//     console.log("SocialxApp Mail Server has started on port " + port);
// });

// require('./apis/router')(app);


var mailin = require('mailin');

mailin.start({
    port: 10025,
    disableWebhook: true
});

/* Access simplesmtp server instance. */
mailin.on('authorizeUser', function(connection, username, password, done) {
    if (username == "johnsmith" && password == "mysecret") {
      done(null, true);
    } else {
      done(new Error("Unauthorized!"), false);
    }
});
   
/* Event emitted when a connection with the Mailin smtp server is initiated. */
mailin.on('startMessage', function (connection) {
    /* connection = {
        from: 'sender@somedomain.com',
        to: 'someaddress@yourdomain.com',
        id: 't84h5ugf',
        authentication: { username: null, authenticated: false, status: 'NORMAL' }
      }
    }; */
    console.log(connection);
});
   
/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
    console.log(data);
    /* Do something useful with the parsed message here.
     * Use parsed message `data` directly or use raw message `content`. */
});
/*
relay_domains = 127.0.0.1:4500
virtual_transport = smtp:[127.0.0.1]:4500
local_transport = smtp:[127.0.0.1]:4500
*/
