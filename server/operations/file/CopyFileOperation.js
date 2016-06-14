var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function CopyFileOperation() {
    Operation.call(this);
}
inherits(CopyFileOperation, Operation);

// Overwrite
CopyFileOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    newFilepath = operationInfo.params.newFilepath;
    sourceFilepath = operationInfo.params.sourceFilepath;

    if(!newFilepath || !sourceFilepath)
        clientCallback(null, {type:"REQUIRED_PARAMETERS", operationInfo:operationInfo});

    var cmd = shellescape(["cp", "-r", sourceFilepath, newFilepath]);

    client.executeCommand(cmd, this.finish, clientCallback);
};

// Parse liste files (ls -aF)
CopyFileOperation.prototype.finish =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"COPY_FILE_ERROR"});
        return;
    }else{
        clientCallback({copy_success:true}, false);
        return
    }
}



// export the class
module.exports = CopyFileOperation;
