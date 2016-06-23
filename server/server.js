/**
 * @file server.h
 * @brief Server for WebSocket<->SSH and serve clients file
 * @author Maxime BURRI
 */

/* Requires */
var config = require('./config');
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');
var socketio = require('socket.io');
var util = require('util');
var shellescape = require('shell-escape');
var path = require('path');
var ipaddr = require('ipaddr.js');

var Client = require('./Client.js');
var ClientSSH = require('ssh2').Client;

// Construction of objectsOperations (operations rooter)
var ObjectController = require('./objects/ObjectController.js');
var JobObject = require('./objects/JobObject.js');
var JobsObject = require('./objects/JobsObject.js');
var FilesObject = require('./objects/FilesObject.js');
var FileObject = require('./objects/FileObject.js');
var PartitionsObject = require('./objects/PartitionsObject.js');
var LicensesObject = require('./objects/LicensesObject.js');
var ModulesObject = require('./objects/ModulesObject.js');
var ModuleObject = require('./objects/ModuleObject.js');
var ConfigurationObject = require('./objects/ConfigurationObject.js');
var SubmissionScriptObject = require('./objects/SubmissionScriptObject.js');
var UserObject = require('./objects/UserObject.js');
var ClusterObject = require('./objects/ClusterObject.js');

var objectsOperations = new ObjectController({
    "job" : new JobObject(),
    "jobs" : new JobsObject(),
    "files" : new FilesObject(),
    "file" : new FileObject(),
    "partitions" : new PartitionsObject(),
    "licenses" : new LicensesObject(),
    "modules" : new ModulesObject(),
    "module" : new ModuleObject(),
    "configuration" : new ConfigurationObject(),
    "submissionScript" : new SubmissionScriptObject(),
    "user" : new UserObject(),
    "cluster" : new ClusterObject()
});

var optionsServer = {
  key: fs.readFileSync(config.https_server.certs_key_file),
  cert: fs.readFileSync(config.https_server.certs_cert_file)
};
var server = https.createServer(optionsServer, app);

server.listen(config.https_server.port, function() {
	console.log("Server listening on port " + config.https_server.port)
});

/* HTTP server for client files */
if(config.https_server.client_files.serve_files){
    app.use(express.static(__dirname + config.https_server.client_files.folder));
    console.log( "Client files serving ("
                + config.https_server.client_files.folder
                + ")");
}

console.logCopy = console.log.bind(console);
console.log = function(data)
{
    var currentDate = '[' + new Date().toUTCString() + '] ';
    this.logCopy(currentDate, data);
};

var attemptsIpv6Clients = {};
/** Socket IO **/
var io = socketio(server);



io.on('connection', function (socket) {
    var ssh = new ClientSSH();
    var jobsSubscribed = false;
    var client = new Client(ssh, socket);
    var ip = ipaddr.parse(socket.request.connection.remoteAddress);
    var ipv6String = ip.toNormalizedString();
    if(!attemptsIpv6Clients[ipv6String]){
        attemptsIpv6Clients[ipv6String] = {
            attempts : 0,
            banned : false,
            timestampUnban : 0,
            timestampLastAttempt : 0,
        }
    }
    var attemptsClient = attemptsIpv6Clients[ipv6String];

    sendBanned = function(){
        socket.emit("banned",
            {timestampUnban : attemptsClient.timestampUnban});
    }

	console.log("Client::connection " + ipv6String);

	// When client want to login
    function login(data){

        currentTimestamp = Math.round(new Date().getTime()/1000);


        // If already attemps
        if(attemptsClient.banned){
            if(attemptsClient.timestampUnban > currentTimestamp){
                sendBanned();
                return;
            }else{
                attemptsClient.banned = false;
            }
        }

        attemptsClient.attempts++;

		// Remove login
		socket.removeListener('login', login);

		// Try to connect
        try{
            client.params = data;
            console.log("Client::login : " + client.toString());
            ssh.connect({
                host: data.cluster,
                username: data.username,
                password: data.password,
				readyTimeout: config.ssh.timeout, // Max timeout (milliseconds)
            });
            client.params = data;
        }
		// Connection error
		catch(e){
			sshError(e.message);
        }
    }

	// When client want to logout
	function logout(data){
		try{
			console.log("Client::logout : " + client.toString())
            quitClientCloseSSH();

			// Reconnect login function
			socket.on('login', login);
			socket.removeListener('operation', operation);

			// Send log outed
			socket.emit("logout", {type:"NORMAL_LOGOUT"});
		}catch(e){
			console.log(e.message)
		}
	}

	// When the SSH is connected
	function sshConnected(){
		try{
            ssh.ready = true;
            //attemptsClient.attempts--;
            attemptsIpv6Clients[ipv6String] = undefined;

            // Kill old processes tail
            objectsOperations.objects["file"].operations["get"].endAllFilesReadClient(client);

			console.log("SSH::connected : " + client.toString())

			// Add logout
			socket.on('logout', logout);
			socket.on('operation', operation);

			// Emit authenticated
			socket.emit("authenticated", {type:"SSH_CONNECTED"});
		}catch(e){}
	}

	// When the socket disconnects
	function disconnect(){
		try{
			console.log("Client::disconnected : " + client.toString())

            quitClientCloseSSH();

			// Reconnect login function
			socket.on('login', login);
			socket.removeListener('operation', operation)

		}catch(e){
			console.log(e.message)
		}
	}

	// When SSh2 error
	function sshError(err){
		// Reconnect login function
		socket.on('login', login);

        // Check if banned, so send

        if(attemptsClient.attempts >= 3){
            attemptsClient.banned = true;
            attemptsClient.timestampUnban = currentTimestamp + 60;
            attemptsClient.attempts = 0;
            sendBanned();
        }else{

        }

        // Send error
        socket.emit("error_ssh", {error:err, loginAttempts:attemptsClient.attempts});

		console.log("Client::ssh::error:"+ client.toString()+err)

        ssh.end();
	}

	// When receive a operation message
	function operation(operation, clientCallback){
        objectsOperations.makeOperation(client, operation, clientCallback);
    }

    // Quit client (close ssh after quit operations)
    function quitClientCloseSSH(){
        // If ssh ready
        if(ssh.ready){
            objectsOperations.onQuitClient(client,
                // End ssh connection when all operations finished
                function(){
                    console.log('SSH finished, close ssh for ' +
                        client.toString());
                    // End ssh connection
                    ssh.end();
                }
            );
        }
    }

    // Connect events
	ssh.on('ready', sshConnected);
	ssh.on('error', sshError);
    socket.on('login', login);
	socket.on('disconnect', disconnect);
});
