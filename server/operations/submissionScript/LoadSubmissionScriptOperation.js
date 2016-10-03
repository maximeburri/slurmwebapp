var Operation = require('../Operation.js');
var ScriptSubmission = require('./functions.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;
var ContentFileOperation = require('../file/ContentFileOperation.js');

var config = require('../../config');

function LoadSubmissionScriptOperation() {
    ContentFileOperation.call(this);
}
inherits(LoadSubmissionScriptOperation, ContentFileOperation);

// Overwrite
LoadSubmissionScriptOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    scriptFile = operationInfo.params.scriptFile;
    if(!scriptFile)
        clientCallback(null, {type:"bad_parameters"});

    var self = this;

    // Request file size
    this.executeFilesizeRequest(client, scriptFile,
        // Error filesize
        function(exitcode){
            if(exitcode != 0)
                clientCallback({}, {type:"not_exist"});
        },
        // Filesize received
        function(filesize, scriptFile){
            if(filesize > config.files.max_filesize_download)
                clientCallback(null, {type:"too_big"});
            else{
                self.executeReadFileCat(client, scriptFile, function(result){
                    if(result == null)
                        clientCallback(null, {type:"bad_file"});
                    else{
                        var job = {};
                        try{
                            job = ScriptSubmission.load(result.data);
                        }catch(e){
                            console.log("Error loading submission sccript")
                            console.log(e);
                        }

                        clientCallback({job:job});
                    }
                });
            }
        }
    );
};

// On quit nothing to do, because no tail
LoadSubmissionScriptOperation.prototype.onQuitClient =
function(client, callbackFinish) {
};


// export the class
module.exports = LoadSubmissionScriptOperation;
