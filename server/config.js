/**
 * @file config.js
 * @brief File configuration for server
 * @author Maxime BURRI
 */
var config = {};

config.https_server = {}
config.https_server.client_files = {}
config.https_server.client_files.serve_files = true;
config.https_server.client_files.folder = "/../client/dist/";
config.https_server.port = 3000;
config.https_server.certs_key_file = "./certs/key.pem";
config.https_server.certs_cert_file = "./certs/cert.pem";

config.ssh = {}
config.ssh.timeout = 6000;

config.general = {}
config.general.max_filesize_transfer = 100000;

config.jobs = {}
config.jobs.interval_update = 5000

module.exports = config;
