function Client(ssh, socket, params) {
    this.ssh = ssh;
    this.socket = socket;
    this.params = params;
}

// class methods
Client.prototype.executeCustomCommand =
function(command, dataCallback, exitCallback, endCallback, stdErrCallbak) {
    if(stdErrCallbak == undefined)
        stdErrCallbak = function(err){};

    try{
        return this.ssh.exec(command, function(err, stream) {
            if (err) throw err;
            else
                stream
                .on('data', dataCallback)
                .on('exit', exitCallback)
                .on('end', function(){
                    stream.close();
                    endCallback();
                })
                .stderr.on('data', stdErrCallbak);
        });
    }catch(err){
        console.error(err.stack);
    }
};

Client.prototype.executeCommand =
function(command, parsingCallback, paramsCallback, errorCallback) {
    if(errorCallback == undefined)
        errorCallback = function(err){};

    var result = "";
    var exitcodeFinal = 0;
    return this.executeCustomCommand(
        command,
        // Data
        function(data){
            result += data;
            console.log(data.toString());
        },
        // Exit
        function(exitcode){
            exitcodeFinal = exitcode;
        },
        // End
        function(){
            parsingCallback(result, exitcodeFinal, paramsCallback);
        },
        // STDERR data
        function(data){
            errorCallback(result, data, paramsCallback);
        }
    )
};

// Kill a process / opened stream
// see http://stackoverflow.com/questions/22164570/sending-a-terminate-ctrlc-command-in-node-js-ssh2
Client.prototype.killProcess = function ( pid, callbackFinish) {
    console.log('pkill '+pid);
    this.executeCommand( 'pkill -g ' + pid,
        // parsing callback
        function(result, exitCode, callback){
            if(callback != undefined)
                callback.call(this);
        },
        callbackFinish,
        // Error callback
        function(result, data, callback){
            if(callback != undefined)
                callback.call(this);
        }
    );
}

// export the class
module.exports = Client;
