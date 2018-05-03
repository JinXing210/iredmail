'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const events  = require('events');
const mysql   = require('promise-mysql');
const fs      = require('fs');


var mailin = require('mailin');
const dbs   = require('../apis/neo4j_mail');

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
    console.log( "================" );
    console.log( data );
    console.log( "================" );
    console.log( data.from[0].address );
    console.log( "================" );
    console.log( data.to[0].address );
    console.log( "================" );
    console.log( data.subject );
    console.log( "================" );
    console.log( data.text );
    console.log( "================" );
    let from = data.from[0].address;
    let to = data.to[0].address;
    let subject = data.subject;
    let text = data.text;
    if( isourmail(to) == false)
        return;
    let uuid = String(Date.now());
    let query = "MATCH (mail:Mail{mail:'"+to+"'}) "
    query += "CREATE (mail)-[r:RECEIVE]->(msg:ReceivedMsg{id:'"+uuid+"',from:'"+from+"',to:'"+to+"',subject:'"+subject+"',text:'"+text+"',bread=0}) RETURN msg";
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

