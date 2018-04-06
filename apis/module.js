'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const mysql   = require('promise-mysql');

var dbs = {
    'host'      :   '127.0.0.1',
    'port'      :   '3306',
    'database'  :   'vmail',
    'user'      :   'root',
    'password'  :   'admin'
}

function validate(param) {
    if (  !param || param === '' ) {
        return false;
    }
    return true;
}

function isEmpty(obj) { 
    for (var x in obj) { return false; }
    return true;
}
//-------------------------------------------------------//
// RESTful API for client
//-------------------------------------------------------//
module.exports.getMain = co.wrap(function*(req,res,cb) {
    console.log( "index.html/"+req.params );
    res.render('index.html');
});
  
module.exports.getAll = co.wrap(function*(req,res,cb) {
    try {
        let connection = yield mysql.createConnection( dbs );
        let rows = yield connection.query('select * from mailbox');
        return cb(null,{success:true,results:rows});
    } catch( error ) {
        return cb(null,{success:false,errors:error});
    }
});

module.exports.add = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});

module.exports.update = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});

module.exports.remove = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});
