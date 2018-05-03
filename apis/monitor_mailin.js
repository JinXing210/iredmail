'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const events  = require('events');
const mysql   = require('promise-mysql');
const fs      = require('fs');

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://app_dev:rklaxcdkv@34.238.244.231:7474')

const neo4jv1 = require('neo4j-driver').v1;
const uri = "bolt://34.238.244.231:7687"
const driver = neo4jv1.driver(uri, neo4jv1.auth.basic("app_dev", "rklaxcdkv"));
const session = driver.session();
class dbs {
	static run(query, params) {
        return new Promise(function (resolve, reject) {
            session.run(query,params).then(function (result) {
                resolve({errors:null,results:result});
            })
            .catch(function (error) {
                resolve({errors:error});
            });
        });	
    }
	static runHTTP(query, params) {
        return new Promise(function (resolve, reject) {
            db.cypher({
                query: query,
                params:params
            },
            function( err,res ) {
                if(err)
                    reject({errors:err});
                else
                    resolve({errors:err,results:res});
            });
        });	
    }
}

module.exports.run = function(query) {
    return dbs.run(query,{})
}

module.exports.initDB = function() {
}


var mailin = require('mailin');

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
   
/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
    console.log('------------message');
    console.log(data);
    console.log(content);
    /* Do something useful with the parsed message here.
     * Use parsed message `data` directly or use raw message `content`. */
});

