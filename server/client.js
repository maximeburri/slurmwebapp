function Client(ssh, socket, params) {
    this.ssh = ssh;
    this.socket = socket;
    this.params = params;
}

// class methods
Client.prototype.executeCustomCommand =
function(command, dataCallback, exitCallback, endCallback, stdErrCallbak) {
    return this.ssh.exec(command, function(err, stream) {
        if (err) throw err;
        stream
        .on('data', dataCallback)
        .on('exit', exitCallback)
        .on('end', endCallback)
        .stderr.on('data', stdErrCallbak);
    });
};

Client.prototype.executeCommand =
function(command, parsingCallback, paramsCallback, errorCallback) {
    var result = "";
    var exitcodeFinal = 0;
    return this.executeCustomCommand(
        command,
        // Data
        function(data){
            result += data;
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

// export the class
module.exports = Client;
