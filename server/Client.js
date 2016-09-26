var config = require('./config');

var globalCurrentIdCommand = 0;

function Client(ssh, socket, params) {
    this.ssh = ssh;
    this.socket = socket;
    this.params = params;
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
        console.log(this.toString() + " execute command " + selfIdCommand +
            " : " + this.cutString(command));
}

// Log stdout command
Client.prototype.logStdout = function(selfIdCommand, data){
    if(config.log.commands.print_stdout)
        console.log("stdout command " + selfIdCommand +
                " : " + this.cutString(data.toString()));
}

// Log exit code of command
Client.prototype.logExitcode = function(selfIdCommand, exitcode){
    if(config.log.commands.print_exitcode)
        console.log("exit command " + selfIdCommand +
                " : code:"+exitcode.toString());
}

// Log stderr command
Client.prototype.logStderr = function(selfIdCommand, data){
    if(config.log.commands.print_stderr)
        console.log("stderr command " + selfIdCommand +
                " : " + this.cutString(data.toString()));
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
    var selfIdCommand = "#" + globalCurrentIdCommand;
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
    if(this.params)
        return  this.params.username + " " + "("+this.params.cluster+")";
    return undefined;
}

// export the class
module.exports = Client;
