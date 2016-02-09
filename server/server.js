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

var objectsOperations = new ObjectController({
    "job" : new JobObject()
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

var subscribersJobs = [];
var jobsInfo = {
    lastRequest : 0,
    jobs : {
        text : "",
        objects : []
    }
}

function showSubscribers(){
    console.log("================ Subscribers Jobs ================== ");
    console.log("Nb: " + subscribersJobs.length);
    for (var i = 0; i < subscribersJobs.length; i++) {
        console.log(" - " + subscribersJobs[i].username + " (" + subscribersJobs[i].socket.id + ")");
    }
    console.log("================ Subscribers Jobs ================== ");
}

function updateJobs(){
    if(subscribersJobs.length == 0)
        return;

    var client = subscribersJobs[Math.floor(Math.random() * subscribersJobs.length)];

    if(client == undefined)
        return;

    var result = "";
    var exitcode = 0;
    console.log("Try exec squeue");
    showSubscribers();
    console.log("Choosen : " + client.socket.id);
    try {
        client.ssh.exec("squeue -a --states=all --format=\"%i %P %j %u %T %M %C %R\"", function(err, stream) {
            if (err) throw err;
            stream.on('data', function(data) {
                result += data;
            }).on('exit', function(e) {
                console.log('EXIT: ' + e);
                exitcode = e;
            }).on('end', function(){
                console.log('CLOSE');
                if(exitcode == 0){
                    if(jobsInfo.jobs.text != result){
                        jobsInfo.jobs.text = result;
                        jobsInfo.lastRequest = Date.now();
                        jobsInfo.jobs.objects = parseJobs(result);
                        subscribersJobs.forEach(function(subscriber){
                            subscriber.socket.emit("publish jobs", {date:jobsInfo.lastRequest, jobs:jobsInfo.jobs.objects});
                        });
                    }
                }
                if(subscribersJobs.length >= 0)
                    setTimeout(updateJobs, config.jobs.interval_update);
            })
            .stderr.on('data', function(data) {
                console.log('STDERR: ' + data);
            });
        });
    }catch(err) {
        console.error("UpdateJobs : client ssh error");
        // Une erreur s'est produite, directement remettre à jour les jobs
        if(subscribersJobs.length >= 0)
            setTimeout(updateJobs, config.jobs.interval_update);
    }
}

// Parse jobs formated %i %P %j %u %T %M %C %R
function parseJobs(text){
    var result = [];

    var lines = text.split('\n');

    for(i = 1; i < lines.length-1;i++){
        var job = lines[i].split(' ');
        var nodesList = job.length > 7 ? job[7] : "";
        var reasonWaiting = null;
        if(nodesList.length >= 3 && nodesList[0] == '(' && nodesList[nodesList.length - 1] == ')'){
            reasonWaiting = nodesList.slice(1,-1);
            nodesList = null;
        }
        if(nodesList == ''){
            nodesList = null;
        }
        result.push({
            'id' : job[0],
            'partition' : job[1],
            'name' : job[2],
            'username' : job[3],
            'state' : job[4],
            'time' : job[5],
            'nbCPU' : job[6],
            'nodes' : nodesList,
            'reasonWaiting' : reasonWaiting
        });
    }

    return result;
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

			// Reconnect login function
			socket.on('login', login);
			socket.removeListener('operation', operation);
            unsubscribeJobs();

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
            unsubscribeJobs();

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
        unsubscribeJobs();
	}

	// On client operation
	function operation(operation, clientCallback){
		if(operation.object == "files"){
			console.log(operation.params.dir)
			dir = operation.params.dir;
            var cmd = shellescape(["cd", dir]) +" && "+ shellescape(["pwd"])+" && "+shellescape(["ls", "-aFH"]);
			console.log(cmd);
			executeCommand(cmd, parseListFiles, clientCallback);
		}else if(operation.object == "file"){
            console.log(operation);
            path = operation.params.path;

            // Request file size
            executeFilesizeRequest(path,
                // Error filesize
                function(exitcode){
                    if(exitcode == 1)
                        clientCallback(null, {type:"not_exist"});
                },
                // Filesize received
                function(filesize, path){
                    if(filesize > config.general.max_filesize_transfer)
                        clientCallback(null, {type:"too_big"});
                    else
                        executeReadFile(path, operation.notifyEventName,
                        clientCallback, socket);
                }
            );
        }
        // Subscribe to jobs
        else if (operation.object == "jobs"){
            if(!jobsSubscribed){

                socket.on("unsubscribe jobs", unsubscribeJobs);
                subscribersJobs.push({username:username,ssh:ssh, socket:socket});
                console.log(subscribersJobs.length);
                // First personn : start periodic request
                if(subscribersJobs.length == 1){
                    updateJobs();
                }else{
                    socket.emit("publish jobs", {date:jobsInfo.lastRequest, jobs:jobsInfo.jobs.objects});
                }
                jobsSubscribed = true;
            }
        }
        else if (operation.object == "job"){
            objectsOperations.makeOperation(client, operation, clientCallback);
        }
    }

    function unsubscribeJobs(){
        if(jobsSubscribed){
            // Delete the subscriber
            for (var i = 0; i < subscribersJobs.length; i++) {
                if (subscribersJobs[i].socket.id == socket.id) {
                    subscribersJobs.splice(i--, 1);
                    break;
                }
            }
            showSubscribers();

            socket.removeAllListeners("unsubscribe jobs");

            // Last client, stop periodic request
            if(subscribersJobs.length == 0){
                clearTimeout(updateJobs);
            }
            jobsSubscribed = false;
        }
    }

	// Parse liste files (ls -aF)
	function parseListFiles(result, exitcode, clientCallback){
        // An error has occured
        if (exitcode != 0){
            clientCallback(null, {code:exitcode, type:"ACCESS_DENIED"});
            return;
        }

		filesList = result.split("\n");
		filesList.pop(); // Remove last element
		currentPath = filesList.shift() + "/"; // Path
		console.log("Path:"+currentPath);
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

		clientCallback({path:currentPath, files:filesInfo}, false)
	}

	// Execute a command, when it finished, call parsingCallback that parse
	// the result who that call clientCallback
	function executeCommand(command, parsingCallback, clientCallback){
		client.executeCommand(command, parsingCallback, clientCallback, function(){});
	}

    // Kill a process / opened stream
    // see http://stackoverflow.com/questions/22164570/sending-a-terminate-ctrlc-command-in-node-js-ssh2
    function killProcess( conn, pid ) {
        conn.exec( 'pkill -g ' + pid, function(){});
    }

    function executeFilesizeRequest(filename, callbackError, callbackResult){
        var filesize = null;
        ssh.exec(shellescape(['stat', '-c%s',filename]),
            function(err, stream) {
                if (err) throw err;
                stream.on('data', function(data) {
                    if(filesize == null){
                        filesize = parseInt(data.slice(0, -1));
                    }
                }).on('exit', function(exitcode) {
                    //clientCallback(null, {code:exitcode});
                    callbackError(exitcode);
                }).on('end', function(){
                    callbackResult(filesize, filename);
                })
            }
        );
    }

    // Execute tail read file
    function executeReadFile(filename, notifyEventName, clientCallback, socket){
        var pid = null;
        var fileSize = null;

        function endExecuteReadFile(){
            //stream.end("exit\n");
            console.log("disconnect:'"+notifyEventName+"'");
            killProcess(ssh, pid);
        }
        // Execute tail after get PID
        ssh.exec(shellescape(['test','-f',filename]) +
            '&& echo "PID: $$"&&'+
            shellescape(['tail','-n','+0','-f','--follow=name','--retry',filename]),
            function(err, stream) {
                console.log("registerNotify:"+notifyEventName);

                if (err) throw err;
                stream.on('data', function(data) {
                    data = data.toString();
                    console.log("DATA:"+data);
                    // Get the pid and regiter killprocess event
                    if(pid == null && data.substr( 0, 5 ) === 'PID: ' ){
                        pid = data.substr(5);
                        socket.on('end '+notifyEventName, endExecuteReadFile);
                    }
                    // Get the data
                    else{
                        data = data.toString();
                        socket.emit(notifyEventName, {err:false, data:data});
                    }
                }).on('exit', function(exitcode) {
                    //clientCallback(null, {code:exitcode});
                    console.log("EXIT:"+exitcode);
                }).on('end', function(){
                    socket.removeAllListeners('end '+notifyEventName);
                })
                .stderr.on('data', function(data) {
                    console.log("STDERR:"+data);
                    clientCallback(null, {type:data});
                });
            }
        );
    }

	ssh.on('ready', sshConnected);
	ssh.on('error', sshError);
    socket.on('login', login);
	socket.on('disconnect', disconnect);
});
