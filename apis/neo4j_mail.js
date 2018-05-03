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
    dbs.run("CREATE CONSTRAINT ON (mail:maillist) ASSERT mail.mail IS UNIQUE");
}

