var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function MoveFileOperation() {
    Operation.call(this);
}
inherits(MoveFileOperation, Operation);

// Overwrite
MoveFileOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    oldFilepath = operationInfo.params.oldFilepath;
    newFilepath = operationInfo.params.newFilepath;

    var cmd = shellescape(["mv", oldFilepath, newFilepath]);

    client.executeCommand(cmd, this.finish, clientCallback);
};

// Parse liste files (ls -aF)
MoveFileOperation.prototype.finish =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"MOVE_FILE_ERROR"});
        return;
    }else{
        clientCallback({move_success:true}, false);
        return
    }
}



// export the class
module.exports = MoveFileOperation;
