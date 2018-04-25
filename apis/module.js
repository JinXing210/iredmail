'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const mysql   = require('promise-mysql');

const sha512  = request('sha512');

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

    let domain=req.body.domain;
    let username=req.body.mail;
    let password=req.body.passwd;
    let name=req.body.cn;
    let maildir=req.body.maildir;
    let quota=req.body.mailQuota;
    let storagebasedirectory=req.body.storageBaseDirectory;
    let storagenode=req.bodystorageNode;
    let created=getNowDate();
    let active='1';
    let local_part=req.body.mail_local_part;

    let address=req.body.mail;
    let forwarding=req.body.mail;
    let is_forwarding=r1;

    let sql_mailbox = "insert into mailbox(domain,username,password,name,maildir,quota,storagebasedirectory,storagenode,created,active,local_part) values(?,?,?,?,?,?,?,?,?,?,?)";
    let sql_forwardings = "insert into forwardings(address,forwarding,domain,is_forwarding) values(?,?,?,?)";
    
    try {
        let connection = yield mysql.createConnection( dbs );
        let rows = yield connection.query(sql_mailbox,[domain,username,password,name,maildir,quota,storagebasedirectory,storagenode,created,active,local_part]);
        let rows2 = yield connection.query(sql_forwardings,[address,forwarding,domain,is_forwarding]);
        return cb(null,{success:true,results:rows});
    } catch( error ) {
        return cb(null,{success:false,errors:error});
    }
});

module.exports.update = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});

module.exports.remove = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});
