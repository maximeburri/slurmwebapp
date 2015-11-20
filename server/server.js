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
	console.log("Client::connection ")

	// Login
    function login(data){
		// Remove login
		socket.removeListener('login', login);
		//
		console.log("Client::login : "+ util.inspect(data))

		// Try to connect
        try{
            ssh.connect({
                host: data.cluster,
                username: data.username,
                password: data.password,
				readyTimeout: config.ssh.timeout // Max timeout (milliseconds)
            });
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

			// Reconnect login function
			socket.on('login', login);
			socket.removeListener('operation', operation)

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
	}

	// On client operation
	function operation(operation, clientCallback){
		if(operation.object == "files"){
			console.log(operation.params.dir)
			dir = operation.params.dir;
			console.log(shellescape(["cd", dir]) +";"+ shellescape(["pwd"])+";"+shellescape(["ls", "-aFH"]));
			executeCommand(shellescape(["cd", dir]) +"&&"+ shellescape(["pwd"])+"&&"+shellescape(["ls", "-aFH"]), parseListFiles, clientCallback);
		}
	}

	// Parse liste files (ls -aF)
	function parseListFiles(result, exitcode, clientCallback){
		filesList = result.split("\n");
		filesList.pop(); // Remove last element
		currentPath = path.normalize(filesList.shift() + "/"); // Path
		console.log("Path:"+path);
		filesInfo = [];

		// Parse each file
		filesList.forEach( function(filename){
			fileType = "";
			lastChar = filename[filename.length-1];
			deleteLastChar = true;

			switch(lastChar){
				case '*':
				    fileType = "executable";
				    break
				case '/':
				    fileType = "folder";
				    break
				case '@':
				    fileType = "symboliclink";
				    break
				case '|':
					fileType = "FIFO";
				    break
				default:
				    fileType = "file";
					deleteLastChar = false;
				    break
			}
			if(deleteLastChar)
				filename = filename.substring(0, filename.length-1);
			filesInfo.push({filename:filename, type:fileType});
		});

		// Error has occured
		err = null;
		if(err){
			err = {code:exitcode, message:"Unknow"};
		}

		clientCallback({path:currentPath, files:filesInfo}, err)
	}

	// Execute a command, when it finished, call parsingCallback that parse
	// the result who that call clientCallback
	function executeCommand(command, parsingCallback, clientCallback){
		var result = "";
		ssh.exec(command, function(err, stream) {
		    if (err) throw err;
		    stream.on('data', function(data) {
				//console.log('STDOUT: ' + data);
				result += data;
		    }).on('exit', function(exitcode) {
				console.log('EXIT: ' + exitcode + " Final data : " + result);
				parsingCallback(result, exitcode, clientCallback);
		    }).stderr.on('data', function(data) {
		      	console.log('STDERR: ' + data);
		    });
		});
	}

	ssh.on('ready', sshConnected);
	ssh.on('error', sshError);
    socket.on('login', login);
	socket.on('disconnect', disconnect);
});
