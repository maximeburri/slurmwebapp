var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function RemoveFileOperation() {
    Operation.call(this);
}
inherits(RemoveFileOperation, Operation);

// Overwrite
RemoveFileOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    filepath = operationInfo.params.filepath;

    var cmd = shellescape(["rm", "-r", filepath]);

    client.executeCommand(cmd, this.finish, clientCallback);
};

// Parse liste files (ls -aF)
RemoveFileOperation.prototype.finish =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"REMOVE_FILE_ERROR"});
        return;
    }else{
        clientCallback({remove_success:true}, false);
        return
    }
}



// export the class
module.exports = RemoveFileOperation;
