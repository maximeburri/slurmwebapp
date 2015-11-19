/**
 * @file config.js
 * @brief File configuration for server
 * @author Maxime BURRI
 */
var config = {};

config.http_server = {}
config.http_server.client_files = {}
config.http_server.client_files.serve_files = true;
config.http_server.client_files.folder = "/../client/dist/";
config.http_server.port = 3000;

config.ssh = {}
config.ssh.timeout = 6000;

module.exports = config;
