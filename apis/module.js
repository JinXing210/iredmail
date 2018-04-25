'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const mysql   = require('promise-mysql');
var base64 = require('js-base64').Base64;

var dbs = {
    'host'      :   '127.0.0.1',
    'port'      :   '3306',
    'database'  :   'vmail',
    'user'      :   'root',
    'password'  :   'admin'
}


var getRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length)/2)
                 .toString('hex')
                 .slice(0,length);
}
var getSSHA512Password = function(  password ) {
    var salt = getRandomString(8);
    var hash = crypto.createHmac('sha512',password);
    hash.update(salt);
    var pass = hash.digest().toString('ascii');
    var sshapass =  base64.encode(pass+salt);
    return "{SSHA512}"+sshapass;
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

function getNowDate2(){
    var now = new Date();
    var lh = now.getHours();
    var uh = now.getUTCHours();
    var dh = (lh-uh);
    var d = new Date(now.getTime() + (dh*60*60 * 1000));

    let year = d.getFullYear();
    return addZero(d.getFullYear())+"-"+addZero(d.getMonth()+1)+"-"+addZero(d.getDate()) +" "+ addZero(d.getHours()) +":"+ addZero(d.getMinutes() +":"+ addZero(d.getSeconds()));
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

function getmaildir(mail) {
    let maildir = "";
    var res = mail.split("@");
    return res[0] + "-" + getNowDate();
}

module.exports.add = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    let domain="aone.social";
    let username=req.body.mail;
    let password=getSSHA512Password(req.body.passwd);

    let name="";
    let maildir=getmaildir(username);
    // let maildir=req.body.maildir;
    let quota=0;
    let storagebasedirectory="/var/vmail";
    let storagenode="vmail1";
    let created=getNowDate2();
    let active='1';
    let local_part="";

    let address=req.body.mail;
    let forwarding=req.body.mail;
    let is_forwarding=1;

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
