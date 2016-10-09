var config = require('./config');
var ipaddr = require('ipaddr.js');

var globalCurrentIdCommand = 0;
var globalCurrentIdClient = 0;

function Client(ssh, socket, params) {
    globalCurrentIdClient++;

    this.ssh = ssh;
    this.socket = socket;
    this.params = params;
    this.id = globalCurrentIdClient;
    this.ip = ipaddr.parse(socket.request.connection.remoteAddress);
    this.ipv6String = this.ip.toNormalizedString();
}

// Cut string if length lesser than constant config.log.commands.max_length
Client.prototype.cutString = function(string){
    if(string.length > config.log.commands.max_length)
        string = string.substring(0, config.log.commands.max_length) + "...";
    return string
}

// Log execution of command
Client.prototype.logExecutionCommand = function(selfIdCommand, command){
    if(config.log.commands.execution)
        console.log(this.toString().cyan + " execute command " +
            selfIdCommand.toString().cyan +
            " : " + this.cutString(command).yellow);
}

// Log stdout command
Client.prototype.logStdout = function(selfIdCommand, data){
    if(config.log.commands.print_stdout)
        console.log("stdout command " + selfIdCommand.toString().cyan +
                " : " + this.cutString(data.toString()).yellow);
}

// Log exit code of command
Client.prototype.logExitcode = function(selfIdCommand, exitcode){
    if(exitcode === null || exitcode === undefined)
        exitcode = "<none>";

    if(config.log.commands.print_exitcode)
        console.log("exit command " + selfIdCommand.toString().cyan +
                " : code:"+exitcode.toString().yellow);
}

// Log stderr command
Client.prototype.logStderr = function(selfIdCommand, data){
    if(config.log.commands.print_stderr)
        console.log("stderr command " + selfIdCommand.toString().cyan +
                " : " + this.cutString(data.toString()).yellow);
}

// Execute custom command with paramters data, exit, end, etc...
// Note : logFlowStdout is to log the flow (data per data) when true,
// or log stdout when command end (default false)
Client.prototype.executeCustomCommand =
function(command, dataCallback, exitCallback, endCallback,
        stdErrCallbak, logFlowStdout){
    // Variables
    var self = this;
    globalCurrentIdCommand++;
    var selfIdCommand = "c#" + globalCurrentIdCommand;
    var finalStdout = "";
    if(stdErrCallbak == undefined)
        stdErrCallbak = function(err){};

    // Log execution
    this.logExecutionCommand(selfIdCommand, command);

    try{
        return this.ssh.exec(command, function(err, stream) {
            if (err) console.error(err.stack);
            else
                stream
                .on('data', function(data){
                    if(logFlowStdout)
                        self.logStdout(selfIdCommand, data);

                    finalStdout += data;
                    dataCallback.apply(this, arguments);
                })
                .on('exit', function(exitcode){
                    self.logExitcode(selfIdCommand, exitcode);
                    exitCallback.apply(this, arguments);
                })
                .on('end', function(){
                    if(!logFlowStdout)
                        self.logStdout(selfIdCommand, finalStdout);

                    stream.close();
                    endCallback.call(this, finalStdout);
                })
                .stderr.on('data',  function(data){
                    self.logStderr(selfIdCommand, data);

                    stdErrCallbak.call(this, data, finalStdout);
                });
        });
    }catch(err){
        console.error(err.stack);
    }
};

Client.prototype.executeCommand =
function(command, parsingCallback, paramsCallback, errorCallback) {
    var self = this;
    if(errorCallback == undefined)
        errorCallback = function(err){};

    var exitcodeFinal = 0;
    return this.executeCustomCommand(
        command,
        // Data
        function(data){
        },
        // Exit
        function(exitcode){
            exitcodeFinal = exitcode;
        },
        // End
        function(finalStdout){
            parsingCallback(finalStdout, exitcodeFinal, paramsCallback);
        },
        // STDERR data
        function(stdErr, finalStdout){
            errorCallback(finalStdout, stdErr, paramsCallback);
        }
    )
};

// Kill a process / opened stream
// see http://stackoverflow.com/questions/22164570/sending-a-terminate-ctrlc-command-in-node-js-ssh2
Client.prototype.killProcess = function ( pid, callbackFinish) {
    var self = this;
    this.executeCommand( 'pkill -g ' + pid,
        // parsing callback
        function(result, exitCode, callback){
            if(callback != undefined)
                callback.call(self);
        },
        callbackFinish,
        // Error callback
        function(result, data, callback){
            if(callback != undefined)
                callback.call(self);
        }
    );
}

Client.prototype.toString = function () {
    return this.getStringId();
}

Client.prototype.toStringDetail = function () {
    return this.getStringId() + " " +
           this.ipv6String.toString().cyan;
}

Client.prototype.getStringId = function(){
    return ("u#"+this.id).toString().cyan;
}

// export the class
module.exports = Client;
