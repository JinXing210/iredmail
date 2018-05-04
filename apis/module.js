'use strict';
const request = require('request');
const crypto  = require('crypto');
const co      = require('co');
const mysql   = require('promise-mysql');
var base64 = require('js-base64').Base64;
const b64encode  = require('base64-encode-string');
// var urandom = new require('randbytes');
// var random = urandom.urandom.getInstance();

const dbs   = require('../apis/neo4j_mail');


// var python = require('python-shell');

// var dbs = {
//     'host'      :   '127.0.0.1',
//     'port'      :   '3306',
//     'database'  :   'vmail',
//     'user'      :   'root',
//     'password'  :   'admin'
// }


// var getRandomString = function(length) {
//     return crypto.randomBytes(Math.ceil(length)/2)
//                  .toString('hex')
//                  .slice(0,length);
// }
// var getSSHA512Password = function(  password ) {
//     var salt = getRandomString(8);
//     var hash = crypto.createHmac('sha512',password);
//     hash.update(salt);
//     var pass = hash.digest().toString('ascii');
//     // var sshapass =  base64.encode(pass+salt);
//     var sshapass =  b64encode(pass+salt);
//     return "{SSHA512}"+sshapass;
// }

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
    return res[0] + "-" + getNowDate() + "/";
}

function getmailaddr(mail) {
    let maildir = "";
    var res = mail.split("@");
    return res[0] + "@aone.social";
}

module.exports.add = co.wrap(function*(req,res,cb) {
    console.log( req.body );
    let guid   = req.body.guid;
    let email   = req.body.email;
    let password   = req.body.password;
    // mandatory
    if( validate(guid) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no guid'}});
    }
    if( validate(email) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no email'}});
    }
    if( validate(password) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no password'}});
    }
    let real_email = getmailaddr(email);
    console.log( real_email );
    let query = "MATCH (mail:Mail{mail:'"+real_email+"'}) RETURN mail";
    let mail = yield dbs.run(query);
    if( mail.errors ) {
        return {success:false,error:{ msg:"NEO4J or CQLerror"}};
    }
    else {
        if( mail.results.records.length )
            return cb(null,{success:false,error:{ msg:"Already added"}});
    }
    query = "CREATE (mail:Mail{guid:'"+guid+"',mail:'"+real_email+"',password:'" + password + "'} ) RETURN mail"        
    mail = yield dbs.run(query);
    if( mail.errors ) {
        return cb(null,{success:false,error:{ msg:"NEO4J or CQLerror"}});
    }
    return cb(null,{success:true,data:{mail:real_email}});
    
})

module.exports.update = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});

module.exports.remove = co.wrap(function*(req,res,cb) {
    console.log( req.body );

    return cb(null,{success:true,errors:'there is no error'});
});

const sendmail = require('sendmail')();

module.exports.sendMail = co.wrap(function*(req,res,cb) {
    console.log( req.body );
    let from   = req.body.from;
    let to   = req.body.to;
    let subject   = req.body.subject;
    let text   = req.body.text;
    let save   = req.body.save;
    // mandatory
    if( validate(from) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no from'}});
    }
    if( validate(to) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no to'}});
    }
    if( validate(subject) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no subject'}});
    }
    if( validate(text) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no text'}});
    }
    if( validate(save) == false ) {
        save = "unsave"
    }
    
    sendmail({
        from:from,
        to:to,
        subject:subject,
        text:text,
        // html:'This is a test(HTML)',
    },function(err,reply){
        if( err )
            console.log( err && err.stack);
        else
            console.dir('sent');
    })
    if( save == "save" ) {
        let date = getNowDate()
        let uuid = String(Date.now());
        let query = "MATCH (mail:Mail{mail:'"+from+"'}) "
        query += "CREATE (mail)-[r:MAIL{direct:'sent'}]->(msg:Msg{direct:'sent',id:'"+uuid+"',from:'"+from+"',to:'"+to+"',subject:'"+subject+"',text:'"+text+"',bread:1,date:'"+date+"'}) RETURN msg";
        console.log( query );
        let msg = yield dbs.run( query );
        if( msg.errors ) {
            return cb(null,{success:false,error:{ msg:"NEO4J or CQLerror"}});
        }
    }
    return cb(null,{success:true,errors:'there is no error'});
});

