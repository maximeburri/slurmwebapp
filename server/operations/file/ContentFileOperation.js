var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

var config = require('../../config');

function ContentFileOperation() {
    Operation.call(this);
    this.token = "c9ehgK8n636zK36w";
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
            else{
                if(operationInfo.params.follow){
                    self.executeReadFileTail(client, path, operationInfo.notifyEventName,
                        clientCallback);
                }else{
                    self.executeReadFileCat(client, path, clientCallback);
                }
            }
        }
    );
};

ContentFileOperation.prototype.endAllFilesReadClient
= function(client, callbackFinish){
    var command = "ps ax -u "+client.params.username+" | grep tail | grep -v grep | awk '{print $1}' | xargs kill";
    client.executeCommand(command,
        function(result, exitcode, callbackFinish){
            result = result.toString();
            //console.log("Result kill : " + result);
            if(callbackFinish != undefined)
                callbackFinish.call(this);
        }, callbackFinish,
        // STDERR data
        function(result, error, callbackFinish){
            // Nothing
        }
    );

}

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

ContentFileOperation.prototype.onQuitClient =
function(client, callbackFinish) {
    this.endAllFilesReadClient(client, callbackFinish);
};

ContentFileOperation.prototype.endReadFile =
function(client, pid, callbackFinish) {
    if(pid != null){
        //console.log("Kill file tail pid : " + pid);
        client.killProcess(pid, callbackFinish);
    }
};

// Execute tail read file
ContentFileOperation.prototype.executeReadFileTail =
function(client, filename, notifyEventName, clientCallback){
    var pid = null;
    var self = this;

    function endExecuteReadFile(){
        //console.log("disconnect:'"+notifyEventName+"'");
        self.endReadFile(client, pid);
    }

    var command = shellescape(['test','-f',filename]) +
        '&& echo "PID: $$"&&'+
        "tail TOKEN_KILL="+this.token+" "+shellescape(['-n','+0','-f','-q','--follow=name','--retry',filename]);

    // Execute tail after get PID
    client.executeCustomCommand(command,
        // data
        function(data) {
            data = data.toString();
            //console.log("DATA:"+data);
            // Get the pid and regiter killprocess event
            if(pid == null && data.substr( 0, 5 ) === 'PID: ' ){
                pid = data.substr(5).slice(0, -1);
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
        }
    );
}

ContentFileOperation.prototype.executeReadFileCat =
function(client, filename, clientCallback){
    var pid = null;
    var self = this;


    var command = shellescape(['test','-f',filename]) + ' && ' +
        shellescape(['cat',filename]);

    // Execute cat
    client.executeCommand(command,
        function(result, exitcode, clientCallback){
            result = result.toString();
            if(exitcode != 0){
                clientCallback(null, {exitcode:exitcode});
            }else{
                clientCallback({data:result});
            }
        }, clientCallback,
        // STDERR data
        function(result, error, paramsCallback){
            result = result.toString();
            clientCallback(null, {error:error.toString()});
        }
    );
}

// export the class
module.exports = ContentFileOperation;
