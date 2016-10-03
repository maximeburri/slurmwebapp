var Operation = require('../Operation.js');
var ScriptSubmission = require('./functions.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;
var ContentFileOperation = require('../file/ContentFileOperation.js');
var path = require('path');
var UploadFileOperation = require('../file/UploadFileOperation.js');

var config = require('../../config');

function SaveSubmissionScriptOperation() {
    ContentFileOperation.call(this);
}
inherits(SaveSubmissionScriptOperation, ContentFileOperation);

// Overwrite
SaveSubmissionScriptOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    job = operationInfo.params.job;
    readScriptFilePath = operationInfo.params.readScriptFilePath;
    saveScriptFilePath = operationInfo.params.saveScriptFilePath;
    onlyVisualization = operationInfo.params.onlyVisualization;

    self = this;

    if(!readScriptFilePath && !saveScriptFilePath && !onlyVisualization){
        clientCallback(null, {type:"bad_parameters",
            description:
                "readScriptFilePath or saveScriptFilePath must be specified"});
    }

    if(!job)
        clientCallback(null, {type:"bad_parameters",
            description:
                "'job' must not be empty"});

    if(!saveScriptFilePath){
        saveScriptFilePath = readScriptFilePath;
    }


    var basedir = path.dirname(saveScriptFilePath);

    // Chmod +x
    if(job.execution.executable){
        var cmd =  shellescape(["chmod", "+x", basedir + "/" + job.execution.executable]);
        client.executeCommand(cmd,
        // Chmod finished, continue
        function(result, exitcodeFinal, paramsCallback){

            if(readScriptFilePath){
                self.readFile(client, clientCallback, readScriptFilePath,
                    function(fileContent){
                    script = ScriptSubmission.save(job, fileContent);

                    // If no visualization, save
                    if(!onlyVisualization)
                        self.writeFile(client, clientCallback, script,
                                saveScriptFilePath);
                    else
                        clientCallback({script:script});
                });
            }else{
                script = ScriptSubmission.save(job);

                // If no visualization, save
                if(!onlyVisualization)
                    self.writeFile(client, clientCallback, script,
                            saveScriptFilePath);
                else
                    clientCallback({script:script});
            }
        }, {},
        function(result, data, paramsCallback){

        });
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
                    if(result == null || ! result.data)
                        clientCallback(null, {type:"bad_file"});
                    else{
                        finishCallback(result.data);
                    }
                });
            }
        }
    );
}

SaveSubmissionScriptOperation.prototype.writeFile =
function(client, clientCallback, content, file){
    // make a backup
    this.makeBackupFile(client, function(exitCode){

        // Then echo file
        (new UploadFileOperation()).makeOperation(client,
            {
                params:{
                    data : new Buffer(content),
                    filepath : file
                }
            },
            function(data, error){
                if(data !== null && data.upload_success){
                    clientCallback({"written":true});
                }else{
                    clientCallback(null, {"error_written_file":true});
                }
            });
    },
    file);
}

SaveSubmissionScriptOperation.prototype.makeBackupFile =
function(client, finishCallback, file ){
    cmd = "mv " + file + " " + file + ".backup";

    client.executeCommand(cmd,
    function(result, exitcodeFinal){
        finishCallback(exitcodeFinal);
    }, {},
    function(result, data){
        // Stderr
    });
}

// On quit nothing to do, because no tail
SaveSubmissionScriptOperation.prototype.onQuitClient =
function(client, callbackFinish) {
};


// export the class
module.exports = SaveSubmissionScriptOperation;
