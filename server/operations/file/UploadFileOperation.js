var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

var config = require('../../config');

function UploadFileOperation() {
    Operation.call(this);
}
inherits(UploadFileOperation, Operation);

// Overwrite
UploadFileOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    filepath = operationInfo.params.filepath;
    data = operationInfo.params.data;

    // Check data length max upload
    if( config.files.max_filesize_upload !== undefined &&
        data.length > config.files.max_filesize_upload){
        clientCallback(null,
            {"too_big":true,
            "limitation" : config.files.max_filesize_upload});
        return;
    }

    //var cmd = shellescape(["printf" , "%s", data]) + " > " + filename;
    var cmd = shellescape(["echo", data.toString('base64')]) +
             ' | base64 --decode > ' + shellescape([filepath]);
    client.executeCommand(cmd, this.finish, clientCallback);
};

// Parse liste files (ls -aF)
UploadFileOperation.prototype.finish =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"UPLOAD_ERROR"});
        return;
    }else{
        clientCallback({upload_success:true}, false);
        return
    }
}



// export the class
module.exports = UploadFileOperation;
