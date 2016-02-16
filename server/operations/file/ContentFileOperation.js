var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

var config = require('../../config');

function ContentFileOperation() {
    Operation.call(this);
}
inherits(ContentFileOperation, Operation);

// Overwrite
ContentFileOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    path = operationInfo.params.path;
    var self = this;

    // Request file size
    this.executeFilesizeRequest(client, path,
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
                self.executeReadFile(client, path, operationInfo.notifyEventName,
                clientCallback);
        }
    );
};

ContentFileOperation.prototype.executeFilesizeRequest =
function(client, filename, callbackError, callbackResult){
    //(command, dataCallback, exitCallback, endCallback, stdErrCallbak)
    var filesize = null;
    client.executeCustomCommand(shellescape(['stat', '-c%s',filename]),
        // data
        function(data) {
            if(filesize == null){
                filesize = parseInt(data.slice(0, -1));
            }
        },
        // exit
        function(exitcode) {
            callbackError(exitcode);
        },
        // end
        function(){
            callbackResult(filesize, filename);
        }
    );
}

// Execute tail read file
ContentFileOperation.prototype.executeReadFile =
function(client, filename, notifyEventName, clientCallback){
    var pid = null;
    var fileSize = null;

    function endExecuteReadFile(){
        console.log("disconnect:'"+notifyEventName+"'");
        client.killProcess(pid);
    }

    var command = shellescape(['test','-f',filename]) +
        '&& echo "PID: $$"&&'+
        shellescape(['tail','-n','+0','-f','--follow=name','--retry',filename]);

    // Execute tail after get PID
    client.executeCustomCommand(command,
        // data
        function(data) {
            data = data.toString();
            console.log("DATA:"+data);
            // Get the pid and regiter killprocess event
            if(pid == null && data.substr( 0, 5 ) === 'PID: ' ){
                pid = data.substr(5);
                client.socket.on('end '+notifyEventName, endExecuteReadFile);
            }
            // Get the data
            else{
                data = data.toString();
                client.socket.emit(notifyEventName, {err:false, data:data});
            }
        },
        // exit
        function(exitcode) {
            //console.log("EXIT:"+exitcode);
        },
        // end
        function(){
            client.socket.removeAllListeners('end '+notifyEventName);
        },
        // std err
        function(data) {
            console.log("STDERR:"+data);
            clientCallback(null, {type:data});
        }
    );

}

// export the class
module.exports = ContentFileOperation;
