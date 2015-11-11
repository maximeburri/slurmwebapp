/**
 * @file config.js
 * @brief File configuration for server
 * @author Maxime BURRI
 */
var config = {};

config.http_server = {}
config.http_server.active = true;
config.http_server.public_folder = "/../client/dist/";
config.http_server.port = 3000;

module.exports = config;
