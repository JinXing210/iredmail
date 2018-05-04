'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const events  = require('events');
const mysql   = require('promise-mysql');
const fs      = require('fs');


var mailin = require('mailin');
const dbs   = require('../apis/neo4j_mail');
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return String(i);
}

function getNowDate(){
    var now = new Date();
    var lh = now.getHours();
    var uh = now.getUTCHours();
    var dh = (lh-uh);
    var d = new Date(now.getTime() + (dh*60*60 * 1000));

    let year = d.getFullYear();
    return addZero(d.getFullYear())+addZero(d.getMonth()+1)+addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes() + addZero(d.getSeconds()));
}

mailin.start({
    port: 25,
    disableWebhook: true
});

/* Access simplesmtp server instance. */
mailin.on('authorizeUser', function(connection, username, password, done) {
    console.log('------------authorizeUser:' + username )
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
    console.log('------------startMessage');
    console.log(connection);
});

function isourmail(mail) {
    let maildir = "";
    var res = mail.split("@");
    return res[1] == "aone.social"? true:false;
}
var httpHandler = function(handler) {
    return function(req, res) {
        // check auth code
        handler(req, res, function(err,message) {
            res.json(message);
        });
    };
};
let saveMail = co.wrap(function*(connection, data, content) {
    let from = data.from[0].address;
    let to = data.to[0].address;
    let subject = data.subject;
    let text = String(data.text);
    if( isourmail(to) == false)
        return;
    let date = getNowDate();
    let uuid = String(Date.now());
    let query = "MATCH (mail:Mail{mail:'"+to+"'}) "
    query += "CREATE (mail)-[r:MAIL{direct:'received'}]->(msg:Msg{direct:'received',id:'"+uuid+"',from:'"+from+"',to:'"+to+"',subject:'"+subject+"',text:'"+text+"',bread:0,date:'"+date+"'}) RETURN msg";
    console.log( query );
    let msg = yield dbs.run( query );
    if( msg.errors ) {
        console.log( "NEO4J or CQLerror" );
    }
});

   
/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
    saveMail(connection, data, content);
});

