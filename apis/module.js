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
    return res + "@aone.social";
}

module.exports.add = co.wrap(function*(req,res,cb) {
    console.log( req.body );
    let email   = req.body.email;
    let password   = req.body.password;
    // mandatory
    if( validate(email) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no email'}});
    }
    if( validate(password) == false ) {
        return cb(null,{success:false,errors:{msg:'there is no password'}});
    }
    let real_email = getmailaddr(email);
    console.lop( real_email );
    let query = "MATCH (mail:Mail{mail:'"+real_email+"'}) RETURN mail";
    let mail = yield dbs.query(query);
    if( mail.errors ) {
        return {success:false,error:{ msg:"NEO4J or CQLerror"}};
    }
    else {
        if( mail.results.records.length )
            return {success:false,error:{ msg:"Already added"}};
    }
    query = "CREATE (mail:Mail{mail:'"+real_email+"',password:'" + password + "'} ) RETURN mail"        
    mail = yield dbs.query(query);
    if( mail.errors ) {
        return {success:false,error:{ msg:"NEO4J or CQLerror"}};
    }
    return {success:true,data:{mail:real_email}};
    
})

// module.exports.add3 = co.wrap(function*(req,res,cb) {
//     console.log( req.body );

//     var options = {
//         args:
//         [
//             req.body.passwd
//         ]
//     }
//     python.run('./apis/encodepass.py',options,co.wrap(function*(err,data){
//         if( err )
//             return cb(null,{success:false,errors:err});
//         var pass = data[0];
//         console.log( pass );
//         let domain="aone.social";
//         let username=req.body.mail;
//         let password=pass;
    
//         let name="";
//         let maildir=getmaildir(username);
//         // let maildir=req.body.maildir;
//         let quota=0;
//         let storagebasedirectory="/var/vmail";
//         let storagenode="vmail1";
//         let created=getNowDate2();
//         let active='1';
//         let local_part="";
    
//         let address=req.body.mail;
//         let forwarding=req.body.mail;
//         let is_forwarding=1;
    
//         let sql_mailbox = "insert into mailbox(domain,username,password,name,maildir,quota,storagebasedirectory,storagenode,created,active,local_part) values(?,?,?,?,?,?,?,?,?,?,?)";
//         let sql_forwardings = "insert into forwardings(address,forwarding,domain,is_forwarding) values(?,?,?,?)";
        
//         try {
//             let connection = yield mysql.createConnection( dbs );
//             let rows = yield connection.query(sql_mailbox,[domain,username,password,name,maildir,quota,storagebasedirectory,storagenode,created,active,local_part]);
//             let rows2 = yield connection.query(sql_forwardings,[address,forwarding,domain,is_forwarding]);
//             return cb(null,{success:true,results:rows});
//         } catch( error ) {
//             return cb(null,{success:false,errors:error});
//         }
//     }))
    
// })
// module.exports.add2 = co.wrap(function*(req,res,cb) {
//     console.log( req.body );

//     let domain="aone.social";
//     let username=req.body.mail;
//     let password=getSSHA512Password(req.body.passwd);

//     let name="";
//     let maildir=getmaildir(username);
//     // let maildir=req.body.maildir;
//     let quota=0;
//     let storagebasedirectory="/var/vmail";
//     let storagenode="vmail1";
//     let created=getNowDate2();
//     let active='1';
//     let local_part="";

//     let address=req.body.mail;
//     let forwarding=req.body.mail;
//     let is_forwarding=1;

//     let sql_mailbox = "insert into mailbox(domain,username,password,name,maildir,quota,storagebasedirectory,storagenode,created,active,local_part) values(?,?,?,?,?,?,?,?,?,?,?)";
//     let sql_forwardings = "insert into forwardings(address,forwarding,domain,is_forwarding) values(?,?,?,?)";
    
//     try {
//         let connection = yield mysql.createConnection( dbs );
//         let rows = yield connection.query(sql_mailbox,[domain,username,password,name,maildir,quota,storagebasedirectory,storagenode,created,active,local_part]);
//         let rows2 = yield connection.query(sql_forwardings,[address,forwarding,domain,is_forwarding]);
//         return cb(null,{success:true,results:rows});
//     } catch( error ) {
//         return cb(null,{success:false,errors:error});
//     }
// });

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
    
    sendmail({
        from:from,
        to:to,
        subject:subject,
        text:text,
        // html:'This is a test(HTML)',
    },function(err,reply){
        console.log( err && err.stack);
        console.dir(reply);
    })
    
    return cb(null,{success:true,errors:'there is no error'});
});

