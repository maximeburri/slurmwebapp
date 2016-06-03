var Operation = require('../Operation.js');
var ScriptSubmission = require('./functions.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;
var ContentFileOperation = require('../file/ContentFileOperation.js');

var config = require('../../config');

function SaveSubmissionScriptOperation() {
    ContentFileOperation.call(this);
}
inherits(SaveSubmissionScriptOperation, ContentFileOperation);

// Overwrite
SaveSubmissionScriptOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    job = operationInfo.params.job;
    rewriteScriptFilePath = operationInfo.params.rewriteScriptFilePath;
    onlyVisualisation = operationInfo.params.onlyVisualisation;
    saveScriptFilePath = operationInfo.params.saveScriptFilePath;

    if(!job)
        clientCallback(null, {type:"bad_parameters"});

    if(rewriteScriptFilePath){
        this.readFile(client, clientCallback, rewriteScriptFilePath,
            function(fileContent){
            script = ScriptSubmission.save(job, fileContent);
            clientCallback({script:script});
        });
    }else{
        script = ScriptSubmission.save(job);
        clientCallback({script:script});
    }
};

SaveSubmissionScriptOperation.prototype.readFile =
function(client, clientCallback, file, finishCallback){

    var self = this;

    // Request file size
    this.executeFilesizeRequest(client, file,
        // Error filesize
        function(exitcode){
            if(exitcode != 0)
                clientCallback({}, {type:"not_exist"});
        },
        // Filesize received
        function(filesize, file){
            if(filesize > config.configuration_files.max_filesize_transfer)
                clientCallback(null, {type:"too_big"});
            else{
                self.executeReadFileCat(client, file, function(result){
                    if(result == null && ! result.data)
                        clientCallback(null, {type:"bad_file"});
                    else{
                        finishCallback(result.data);
                    }
                });
            }
        }
    );
}

// On quit nothing to do, because no tail
SaveSubmissionScriptOperation.prototype.onQuitClient =
function(client, callbackFinish) {
};


// export the class
module.exports = SaveSubmissionScriptOperation;
