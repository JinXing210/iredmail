'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const events  = require('events');
const mysql   = require('promise-mysql');

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


var dbs_vmail = {
    'host'      :   '127.0.0.1',
    'port'      :   '3306',
    'database'  :   'vmail',
    'user'      :   'root',
    'password'  :   'admin'
}
var dbs_amavisd = {
    'host'      :   '127.0.0.1',
    'port'      :   '3306',
    'database'  :   'amavisd',
    'user'      :   'root',
    'password'  :   'admin'
}

var eventEmitter = new events.EventEmitter();
let last_time = "00000000000000";

eventEmitter.on('start',function(){
    setImmediate(() => {
        monitorMailin();
    })
})

let monitorMailin = co.wrap(function*(){
    console.log("--- Start Check email ---");

    let sql_mailin = "select * from mailbox";
    console.log( last_time );
    try {
        let last_time = "20180502033005";
        let connection = yield mysql.createConnection( dbs_amavisd );
        let rows = yield connection.query("select * from msgs WHERE time_iso > ? ORDER BY time_iso",[last_time]);
        yield connection.end();
        for( let i = 0; i < rows.length; i++ ) {
            let rows2 = yield connection.query("select * from msgrcpt WHERE mail_id = ?",[rows[i].mail_id]);
            let rows_sender = yield connection.query("select * from maddr WHERE id = ?",[rows[i].sid]);
            let rows_receiver = yield connection.query("select * from maddr WHERE id = ?",[rows2[i].rid]);
            
            connection = yield mysql.createConnection( dbs_vmail );
            let rows_mailbox = yield connection.query("select * from mailbox WHERE username = ?",[rows_receiver[0].email]);
            yield connection.end();
            if( rows_mailbox.length == 0 )
                continue;
            console.log( "time:"+rows[i].time_iso+",from:"+rows_sender[0].email+",to:" + rows_receiver[0].email + ",subject:" + rows[i].subject )
            // rows_mailbox[0].storagebasedirectory
            // rows_mailbox[0].storagenode
            // rows_mailbox[0].maildir
            
            // rows_sender[0].email
            // rows_receiver[0].email
            // rows2[0].rid;
            // rows[i].mail_id;
            // rows[i].from_addr;
            // rows[i].sid;
            // rows[i].subject;

            // rows[i].time_iso;
            last_time = rows[i].time_iso;
        }
        ;
    } catch( error ) {
    }

    console.log("--- End Check email ---");
    setTimeout( function() {
        eventEmitter.emit('start');
    },1000*60);
})

eventEmitter.emit('start');
