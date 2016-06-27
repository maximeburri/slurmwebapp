var config = require('./config');

function Client(ssh, socket, params) {
    this.ssh = ssh;
    this.socket = socket;
    this.params = params;
}

// class methods
Client.prototype.executeCustomCommand =
function(command, dataCallback, exitCallback, endCallback, stdErrCallbak) {
    console.log(this.toString() + " execute command : \n\t" + command);
    if(stdErrCallbak == undefined)
        stdErrCallbak = function(err){};

    try{
        return this.ssh.exec(command, function(err, stream) {
            if (err) console.error(err.stack);
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
    var self = this;
    if(errorCallback == undefined)
        errorCallback = function(err){};

    var result = "";
    var exitcodeFinal = 0;
    return this.executeCustomCommand(
        command,
        // Data
        function(data){
            result += data;
            if(config.debug_show_output)
                console.log(data.toString());
        },
        // Exit
        function(exitcode){
            console.log(self.toString() + " exit command : \n\t" + command+ "\n\tcode:"+exitcode.toString());
            exitcodeFinal = exitcode;
        },
        // End
        function(){
            console.log(self.toString() + " end command : \n\t" + command);
            parsingCallback(result, exitcodeFinal, paramsCallback);
        },
        // STDERR data
        function(data){
            console.log(self.toString() + " stderr command : \n\t" + command+ "\n\t"+data.toString());
            errorCallback(result, data, paramsCallback);
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
