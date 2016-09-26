/**
 * @file config.js
 * @brief File configuration for server
 * @author Maxime BURRI
 */
var config = {};

config.log = {};
config.log.commands = {};
config.log.commands.print_stdout = false; // Show output of command in server
config.log.commands.print_stderr = true;
config.log.commands.print_exitcode = true;
config.log.commands.execution = true;
config.log.commands.max_length = 100;

config.https_server = {}
config.https_server.client_files = {}
config.https_server.client_files.serve_files = true;
config.https_server.client_files.folder = "/../client/dist/";
config.https_server.port = 3000;
config.https_server.certs_key_file = "./certs/key.pem";
config.https_server.certs_cert_file = "./certs/cert.pem";

// Config about connection
config.connection = {}
config.connection.max_attempts_by_ip = 3; // In attempts
config.connection.time_banned_by_ip =
    1 /*minutes*/ * 60 /*seconds*/ // In seconds
// Whitelist of accepted clusuters (undefined to all cluster)
config.connection.accepted_clusters = ["baobab.unige.ch"];

config.ssh = {}
config.ssh.timeout = 6000;

config.general = {}
config.general.max_filesize_transfer = 100000;

config.jobs = {}
config.jobs.interval_update = 5000

// Configuration files on cluster
config.configuration_files = {};
config.configuration_files.max_filesize_transfer =
    config.general.max_filesize_transfer;
config.configuration_files.paths = {};
// path relative to HOME
// $HOME and ~ doesn't work because it's escaped
config.configuration_files.paths.partitions_rules =
    ".slurmwebapp/partitionsRules.js";
config.configuration_files.paths.predefined_submissions =
    ".slurmwebapp/predefinedSubmissions.js";
module.exports = config;
