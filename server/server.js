/**
 * @file server.h
 * @brief Server for WebSocket<->SSH and serve clients file
 * @author Maxime BURRI
 */

/* Requires */
var config = require('./config');
var express = require('express');

/* HTTP server for client files */
if(config.http_server.active){
    var app = express();
    app.use(express.static(__dirname + config.http_server.public_folder));
    app.listen(config.http_server.port);
    console.log('HTTP server on ' + config.http_server.port + " ("+__dirname + config.http_server.public_folder+")");
}
