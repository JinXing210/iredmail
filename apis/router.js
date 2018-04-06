'use strict';
const crypto  = require('crypto');
const co      = require('co');
const api_handler  = require('./module');

module.exports = function(app) {

    var httpHandler = function(handler) {
        return function(req, res) {
            // check auth code
            handler(req, res, function(err,message) {
                res.json(message);
            });
        };
    };
    //----------------------------------------------------------------------//
    app.get('/',httpHandler(api_handler.getMain));
    app.post('/mail/getall/',httpHandler(api_handler.getAll));
    app.post('/mail/add/',httpHandler(api_handler.add));
    app.post('/mail/update/',httpHandler(api_handler.update));
    app.post('/mail/remove/',httpHandler(api_handler.remove));
    //----------------------------------------------------------------------//

}

