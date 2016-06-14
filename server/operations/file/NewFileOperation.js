var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function NewFileOperation() {
    Operation.call(this);
}
inherits(NewFileOperation, Operation);

// Overwrite
NewFileOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    newFilepath = operationInfo.params.newFilepath;
    type = operationInfo.params.type;

    if(!newFilepath || !type)
        clientCallback(null, {type:"REQUIRED_PARAMETERS", operationInfo:operationInfo});

    var cmd = "";

    // Type folder, mkdir
    if(type == "folder")
        cmd = shellescape(["mkdir", newFilepath]);
    // Type file, touch
    else if (type == "file")
        cmd = shellescape(["touch", newFilepath]);
    // Else, bad type
    else
        clientCallback(null, {type:"BAD_TYPE", operationInfo:operationInfo});

    client.executeCommand(cmd, this.finish, clientCallback);
};

// Parse liste files (ls -aF)
NewFileOperation.prototype.finish =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"NEW_FILE_ERROR"});
        return;
    }else{
        clientCallback({new_success:true}, false);
        return
    }
}



// export the class
module.exports = NewFileOperation;
