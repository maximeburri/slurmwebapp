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

var Client = require('./Client.js');

var ObjectController = require('./objects/ObjectController.js');
var JobObject = require('./objects/JobObject.js');
var JobsObject = require('./objects/JobsObject.js');
var FilesObject = require('./objects/FilesObject.js');
var FileObject = require('./objects/FileObject.js');

var objectsOperations = new ObjectController({
    "job" : new JobObject(),
    "jobs" : new JobsObject(),
    "files" : new FilesObject(),
    "file" : new FileObject()
});
/* Class */
var ClientSSH = require('ssh2').Client;

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



/** Socket IO **/
var io = socketio(server);
io.on('connection', function (socket) {
    var ssh = new ClientSSH();
    var jobsSubscribed = false;
    var username = false;
    var client = new Client(ssh, socket);

	console.log("Client::connection ")

	// Login
    function login(data){
		// Remove login
		socket.removeListener('login', login);
		//
		console.log("Client::login : "+ util.inspect(data))

		// Try to connect
        try{
            username = data.username;
            ssh.connect({
                host: data.cluster,
                username: data.username,
                password: data.password,
				readyTimeout: config.ssh.timeout // Max timeout (milliseconds)
            });
            client.params = data;
        }
		// Connection error
		catch(e){
			sshError(e.message);
        }
    }

	// Logout
	function logout(data){
		try{
			console.log("Client::logout" + data)

			// End ssh connection
			ssh.end();

            objectsOperations.quitClient(client);

			// Reconnect login function
			socket.on('login', login);
			socket.removeListener('operation', operation);

			// Send log outed
			socket.emit("logout", {type:"NORMAL_LOGOUT"});
		}catch(e){
			console.log(e.message)
		}
	}

	// Connected on ssh
	function sshConnected(){
		try{

			console.log("SSH::connected")

			// Add logout
			socket.on('logout', logout);
			socket.on('operation', operation);

			// Emit authenticated
			socket.emit("authenticated", {type:"SSH_CONNECTED"});
		}catch(e){}
	}

	// Socket disconnect
	function disconnect(){
		try{
			console.log("Client::disconnected")

			// Reconnect login function
			socket.on('login', login);
			socket.removeListener('operation', operation)

            objectsOperations.quitClient(client);

			// End ssh connection
			ssh.end();
		}catch(e){
			console.log(e.message)
		}
	}

	// On ssh error
	function sshError(err){
		// Reconnect login function
		socket.on('login', login);
		// Send error
		socket.emit("error_ssh", err);
		//
		console.log("Client::login::error "+err)

        objectsOperations.quitClient(client);
	}

	// On client operation
	function operation(operation, clientCallback){
        objectsOperations.makeOperation(client, operation, clientCallback);
    }



	ssh.on('ready', sshConnected);
	ssh.on('error', sshError);
    socket.on('login', login);
	socket.on('disconnect', disconnect);
});
