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
//        let last_time = "20180502033005";
        let connection = yield mysql.createConnection( dbs_amavisd );
        let connection2 = yield mysql.createConnection( dbs_vmail );
        let rows = yield connection.query("select * from msgs WHERE time_iso > ? ORDER BY time_iso",[last_time]);
        for( let i = 0; i < rows.length; i++ ) {
            let rows2 = yield connection.query("select * from msgrcpt WHERE mail_id = ?",[rows[i].mail_id]);
            let rows_sender = yield connection.query("select * from maddr WHERE id = ?",[rows[i].sid]);
            let rows_receiver = yield connection.query("select * from maddr WHERE id = ?",[rows2[0].rid]);
            
            let rows_mailbox = yield connection2.query("select * from mailbox WHERE username = ?",[rows_receiver[0].email]);
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
            let filename = String(rows[i].time_num + 1);
            last_time = rows[i].time_iso;

            let mailinFolder = rows_mailbox[0].storagebasedirectory + "/" + rows_mailbox[0].storagenode + "/" + rows_mailbox[0].maildir + "/Maildir/new/";
            console.log( mailinFolder );
            console.log( last_time );
            console.log( filename );
            fs.readdirSync(mailinFolder).forEach(file => {
                let pre = file.substr(0,filename.length);
                if( pre == filename) {
                    console.log(file);
                    let filePath = mailinFolder + file;
                    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
                        if (!err) {
                            // let _data = JSON.parse("{"+data+"}");
                            // console.log(_data);

                            console.log(data.from);
                            console.log(data.to);
                            console.log(data.Date);
                            console.log(data.Subject);
                            console.log(data['Content-Transfer-Encoding']);
                        } else {
                            console.log(err);
                        }
                    });                    
                }
            })
        }
        yield connection.end();
        yield connection2.end();
    } catch( error ) {
        console.log( error );
    }

    console.log("--- End Check email ---");
    setTimeout( function() {
        eventEmitter.emit('start');
    },1000*60);
})

eventEmitter.emit('start');
